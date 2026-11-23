// server/file-validation.js v1.16.28 — 文件服务前置校验（路径 / 体积 / MIME / 魔数）
// 从 file-store.js 拆出，保持单一职责：任何 API 入口上传前都必须经过 assertUpload。
import path from 'node:path';

export const FILES_PREFIX = 'files/';

function numEnv(key, fallback) {
  const n = Number(process.env[key]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// 单文件上限：默认 4MB。
// 平台约束：Vercel Serverless 请求体上限 4.5MB、Vercel Blob 单对象 4.5MB，
// 取 4MB 留出协议开销余量，避免「平台静默截断 → 魔数校验失败 → 误报 MIME 不匹配」。
export const MAX_FILE_BYTES = numEnv('BLOB_MAX_FILE_BYTES', 4 * 1024 * 1024);
export const CACHE_MAX_AGE = numEnv('BLOB_CACHE_MAX_AGE', 30 * 24 * 60 * 60);
export const DEFAULT_ACCESS = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';

// SVG / HTML / JS 即使被环境变量加入白名单也一律拒绝：public 对象直跳 CDN，
// 可疑内容会在可信源下执行，形成存储型 XSS。
const FORBIDDEN_MIME = new Set([
  'image/svg+xml',
  'text/html',
  'application/xhtml+xml',
  'application/javascript',
  'text/javascript',
]);

export const ALLOWED_MIME = (process.env.BLOB_ALLOWED_MIME ||
  'image/png,image/jpeg,image/gif,image/webp,text/plain,text/csv,application/pdf,application/json,application/zip')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter((mime) => mime && !FORBIDDEN_MIME.has(mime));

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
  return clean.startsWith(FILES_PREFIX) ? clean : FILES_PREFIX + clean;
}

const MAGIC = {
  'image/png': (b) => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/jpeg': (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/gif': (b) => b.length >= 6 && (b.subarray(0, 6).toString('ascii') === 'GIF87a' || b.subarray(0, 6).toString('ascii') === 'GIF89a'),
  'image/webp': (b) => b.length >= 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  'application/pdf': (b) => b.length >= 5 && b.subarray(0, 5).toString('ascii') === '%PDF-',
  'application/zip': (b) => b.length >= 4 && [0x03, 0x05, 0x07].includes(b[2]) && b[3] === 0x04 && b.subarray(0, 2).toString('ascii') === 'PK',
};

/** 校验体积、MIME 白名单及魔数，返回规范化 MIME；入参为文件 Buffer */
export function assertUpload(buffer, contentType) {
  const bytes = buffer && buffer.length;
  if (!Number.isFinite(bytes) || bytes <= 0) {
    throw new FileStoreError(400, 'EMPTY_FILE', '文件内容为空');
  }
  if (bytes > MAX_FILE_BYTES) {
    throw new FileStoreError(413, 'FILE_TOO_LARGE', `文件超过 ${MAX_FILE_BYTES} 字节上限（${Math.floor(MAX_FILE_BYTES / 1024 / 1024)}MB）`);
  }
  const mime = String(contentType || '').split(';')[0].trim().toLowerCase();
  if (!mime || !ALLOWED_MIME.includes(mime) || FORBIDDEN_MIME.has(mime)) {
    throw new FileStoreError(415, 'TYPE_NOT_ALLOWED', `文件类型不允许：${mime || '(空)'}；允许：${ALLOWED_MIME.join(', ')}`);
  }
  if (MAGIC[mime] && !MAGIC[mime](buffer)) {
    throw new FileStoreError(415, 'MIME_MISMATCH', '文件内容与声明的 MIME 类型不一致');
  }
  if (['text/plain', 'text/csv', 'application/json'].includes(mime) && buffer.includes(0)) {
    throw new FileStoreError(415, 'MIME_MISMATCH', '文本文件不得包含二进制内容');
  }
  return mime;
}
