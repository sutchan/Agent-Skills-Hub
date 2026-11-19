// server/file-store.js — 通用文件服务核心（Vercel Blob / 本地文件回退）
//
// 与投票/收藏（server/blob-store.js 的单对象 kv-store.json）隔离：所有用户文件
// 前缀为 FILES_PREFIX（默认 files/），避免列表/删除操作误伤状态对象。
//
// 环境行为：
//   - 生产（VERCEL=1）/ 预览（VERCEL_ENV=preview）且 token 有效 → 真实 Vercel Blob
//   - 本地无 token → 回退本地 data/uploads/ 目录（保留全部 API 语义，便于开发验证）
//
// 策略：
//   - 容量：单文件 ≤ MAX_FILE_BYTES（默认 10MB，可通过 BLOB_MAX_FILE_BYTES 调整）
//   - 类型：白名单 MIME（BLOB_ALLOWED_MIME，逗号分隔；默认覆盖图片/文本/PDF/JSON/压缩包）
//   - 访问：put 时 access = public | private（由请求或 BLOB_ACCESS 决定，默认 private）
//   - 缓存：public 对象走 Vercel CDN + 浏览器缓存（cacheControlMaxAge 默认 30 天）；
//           private 对象不缓存（Cache-Control: private, no-store），读取一律经服务端签名 URL
import fs from 'node:fs';
import path from 'node:path';
import { isBlobEnabled } from './blob-store.js';
import { ROOT_DIR } from './config.js';

const FILES_PREFIX = 'files/';
const LOCAL_DIR = path.join(ROOT_DIR, 'data', 'uploads');
const MAX_FILE_BYTES = numEnv('BLOB_MAX_FILE_BYTES', 10 * 1024 * 1024);
const CACHE_MAX_AGE = numEnv('BLOB_CACHE_MAX_AGE', 30 * 24 * 60 * 60);
const DEFAULT_ACCESS = (process.env.BLOB_ACCESS === 'public' ? 'public' : 'private');
const ALLOWED_MIME = (process.env.BLOB_ALLOWED_MIME ||
  'image/png,image/jpeg,image/gif,image/webp,image/svg+xml,text/plain,text/csv,application/pdf,application/json,application/zip')
  .split(',').map((s) => s.trim()).filter(Boolean);

function numEnv(key, fallback) {
  const n = Number(process.env[key]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** 自定义错误：带 HTTP 状态码，供 API 层统一映射 */
export class FileStoreError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** 校验并规范化 pathname（防目录穿越、限制长度与字符） */
export function safePathname(input) {
  const raw = String(input || '').trim();
  if (!raw || raw.length > 200 || /[\0\r\n]/.test(raw)) {
    throw new FileStoreError(400, 'INVALID_PATH', 'pathname 无效（1-200 字符，禁止控制字符）');
  }
  const clean = path.posix.normalize(raw).replace(/^\/+/, '');
  if (clean.startsWith('..') || clean.includes('/../') || clean.endsWith('/')) {
    throw new FileStoreError(400, 'INVALID_PATH', 'pathname 禁止目录穿越');
  }
  if (!/^[a-zA-Z0-9._/\-一-龥]+$/.test(clean)) {
    throw new FileStoreError(400, 'INVALID_PATH', 'pathname 仅允许字母数字、点、下划线、连字符、斜杠与中文');
  }
  // 幂等：上传传相对名（自动加前缀），读取/删除可传完整 files/... 路径
  return clean.startsWith(FILES_PREFIX) ? clean : FILES_PREFIX + clean;
}

/** 校验体积与 MIME */
function assertUpload(bytes, contentType) {
  if (!Number.isFinite(bytes) || bytes <= 0) throw new FileStoreError(400, 'EMPTY_FILE', '文件内容为空');
  if (bytes > MAX_FILE_BYTES) {
    throw new FileStoreError(413, 'FILE_TOO_LARGE', `文件超过 ${MAX_FILE_BYTES} 字节上限（${Math.floor(MAX_FILE_BYTES / 1024 / 1024)}MB）`);
  }
  const mime = String(contentType || '').split(';')[0].trim().toLowerCase();
  if (!mime || !ALLOWED_MIME.includes(mime)) {
    throw new FileStoreError(415, 'TYPE_NOT_ALLOWED', `文件类型不允许：${mime || '(空)'}；允许：${ALLOWED_MIME.join(', ')}`);
  }
  return mime;
}

function localPath(fullPathname) {
  const rel = fullPathname.startsWith(FILES_PREFIX) ? fullPathname.slice(FILES_PREFIX.length) : fullPathname;
  return path.join(LOCAL_DIR, rel);
}

/** 上传文件：body 为 Buffer/Uint8Array；返回统一元数据 */
export async function uploadFile({ pathname, body, contentType, access }) {
  const full = safePathname(pathname);
  const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body || []);
  const mime = assertUpload(bytes.length, contentType);
  const mode = access === 'public' ? 'public' : access === 'private' ? 'private' : DEFAULT_ACCESS;

  if (!isBlobEnabled()) {
    const target = localPath(full);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
    return {
      pathname: full,
      url: `/api/files?name=${encodeURIComponent(full)}`,
      contentType: mime,
      size: bytes.length,
      access: mode,
      storage: 'local',
    };
  }

  const { put } = await import('@vercel/blob');
  const result = await put(full, bytes, {
    access: mode,
    contentType: mime,
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: mode === 'public' ? CACHE_MAX_AGE : 1,
  });
  return {
    pathname: result.pathname,
    url: result.url,
    downloadUrl: result.downloadUrl,
    contentType: result.contentType,
    size: bytes.length,
    access: mode,
    etag: result.etag,
    storage: 'vercel-blob',
  };
}

/** 列出文件（仅 files/ 前缀，排除投票状态对象） */
export async function listFiles({ prefix, limit } = {}) {
  const take = Math.min(Math.max(Number(limit) || 100, 1), 1000);
  if (!isBlobEnabled()) {
    const out = [];
    const walk = (dir, rel = '') => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const r = rel ? `${rel}/${entry.name}` : entry.name;
        if (entry.isDirectory()) walk(path.join(dir, entry.name), r);
        else {
          const st = fs.statSync(path.join(dir, entry.name));
          out.push({ pathname: FILES_PREFIX + r, size: st.size, uploadedAt: st.mtime.toISOString(), storage: 'local' });
        }
      }
    };
    walk(LOCAL_DIR);
    return out.slice(0, take);
  }
  const { list } = await import('@vercel/blob');
  const filterPrefix = FILES_PREFIX + String(prefix || '').replace(/^\/+/, '');
  const result = await list({ prefix: filterPrefix, limit: take });
  return result.blobs.map((b) => ({
    pathname: b.pathname,
    url: b.url,
    size: b.size,
    uploadedAt: b.uploadedAt,
    etag: b.etag,
    storage: 'vercel-blob',
  }));
}

/** 读取/下载：public 返回 302 目标；private 返回流 + no-store 头，由服务端代理 */
export async function readFile(name, { asAttachment = false } = {}) {
  const full = safePathname(name);
  if (!isBlobEnabled()) {
    const target = localPath(full);
    if (!fs.existsSync(target)) throw new FileStoreError(404, 'NOT_FOUND', '文件不存在');
    return {
      pathname: full,
      body: fs.readFileSync(target),
      contentType: 'application/octet-stream',
      cacheControl: 'private, no-store',
      storage: 'local',
    };
  }
  const { get, getDownloadUrl, head } = await import('@vercel/blob');
  let meta;
  try {
    meta = await head(full);
  } catch {
    throw new FileStoreError(404, 'NOT_FOUND', '文件不存在');
  }
  // public 对象可直接重定向到 Vercel CDN URL（带长期缓存）；private 必须服务端代读（no-store）。
  // 元数据里的 cacheControl 由 put 时的 cacheControlMaxAge 决定，读取时透传。
  const isPublic = String(meta.cacheControl || '').startsWith('public');
  if (isPublic && !asAttachment) {
    return {
      pathname: full,
      url: meta.url,
      contentType: meta.contentType || 'application/octet-stream',
      size: meta.size,
      etag: meta.etag,
      cacheControl: meta.cacheControl,
      storage: 'vercel-blob',
      redirect: meta.url,
    };
  }
  const streamRes = await get(meta.url, { access: 'private' });
  if (!streamRes || streamRes.statusCode !== 200) throw new FileStoreError(404, 'NOT_FOUND', '文件不存在或无访问权限');
  return {
    pathname: full,
    url: asAttachment ? getDownloadUrl(full) : meta.url,
    body: streamRes.stream,
    contentType: meta.contentType || 'application/octet-stream',
    size: meta.size,
    etag: meta.etag,
    cacheControl: 'private, no-store',
    storage: 'vercel-blob',
  };
}

/** 删除文件（private/public 均可），支持 ifMatch 乐观锁避免误删已变更对象 */
export async function deleteFile(name, { ifMatch } = {}) {
  const full = safePathname(name);
  if (!isBlobEnabled()) {
    const target = localPath(full);
    if (!fs.existsSync(target)) throw new FileStoreError(404, 'NOT_FOUND', '文件不存在');
    fs.unlinkSync(target);
    return { pathname: full, deleted: true, storage: 'local' };
  }
  const { list, del } = await import('@vercel/blob');
  const { blobs } = await list({ prefix: full });
  const hit = blobs.find((b) => b.pathname === full);
  if (!hit) throw new FileStoreError(404, 'NOT_FOUND', '文件不存在');
  await del(hit.url, ifMatch ? { ifMatch } : undefined);
  return { pathname: full, deleted: true, storage: 'vercel-blob' };
}

/** 将 FileStoreError 与 SDK 异常统一映射为 API 响应 */
export function errorResponse(err) {
  if (err instanceof FileStoreError) return { status: err.status, body: { error: err.code, message: err.message } };
  const name = err?.constructor?.name || '';
  if (name.includes('RateLimited')) return { status: 429, body: { error: 'RATE_LIMITED', message: '存储服务限流，请稍后重试' } };
  if (name.includes('FileTooLarge')) return { status: 413, body: { error: 'FILE_TOO_LARGE', message: '文件超过存储平台上限' } };
  if (name.includes('Access') || name.includes('Token')) return { status: 503, body: { error: 'STORE_UNAVAILABLE', message: '存储凭据无效或未配置' } };
  if (name.includes('NotFound')) return { status: 404, body: { error: 'NOT_FOUND', message: '文件不存在' } };
  return { status: 500, body: { error: 'STORAGE_ERROR', message: '存储服务内部错误' } };
}

export const FILE_STORE_CONFIG = {
  filesPrefix: FILES_PREFIX,
  maxFileBytes: MAX_FILE_BYTES,
  allowedMime: ALLOWED_MIME,
  defaultAccess: DEFAULT_ACCESS,
  cacheMaxAge: CACHE_MAX_AGE,
  localDir: LOCAL_DIR,
};
