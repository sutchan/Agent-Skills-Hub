// Vercel Serverless Function — 通用文件上传（POST /api/upload）
// 契约：请求体为原始二进制（Content-Type = 文件 MIME）；元数据经 query/header 传递：
//   ?name=<pathname>           必填，目标路径（自动加 files/ 前缀）
//   x-file-content-type      可选，覆盖 Content-Type（默认取请求头）
//   x-file-access            public | private（默认 BLOB_ACCESS 或 private）
// 响应：{ pathname, url, downloadUrl?, contentType, size, access, etag?, storage }
// 限制与错误见 server/file-store.js（413 过大 / 415 类型不允许 / 400 路径非法）。
import { uploadFile, errorResponse } from '../server/file-store.js';
import { requireFileApiAccess } from '../server/file-auth.js';
import { MAX_FILE_BYTES } from '../server/file-validation.js';
import { allowRequest, clientIp } from '../server/api-ratelimit.js';

// 仅保留安全响应头：文件服务为同源接口，不再以 '*' 开放跨站读写
const HEADERS = { 'X-Content-Type-Options': 'nosniff' };

function send(res, status, body) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(HEADERS)) res.setHeader(k, v);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) { tooLarge = true; return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (tooLarge) return reject(Object.assign(new Error('body too large'), { tooLarge: true }));
      resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    for (const [k, v] of Object.entries(HEADERS)) res.setHeader(k, v);
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'METHOD_NOT_ALLOWED', message: '仅支持 POST' });
  const denied = requireFileApiAccess(req);
  if (denied) return send(res, denied.status, denied.body);
  if (!allowRequest(clientIp(req))) {
    return send(res, 429, { error: 'RATE_LIMITED', message: '上传过于频繁，请稍后再试' });
  }
  try {
    const name = req.query?.name;
    const contentType = req.headers['x-file-content-type'] || req.headers['content-type'] || '';
    const access = req.headers['x-file-access'];
    // 硬上限与业务上限一致（默认 4MB，平台请求体上限 4.5MB）：
    // 读超限立即中断并回 413，避免平台层静默截断后误报 MIME 不匹配。
    const body = await readBody(req, MAX_FILE_BYTES);
    const result = await uploadFile({ pathname: name, body, contentType, access });
    return send(res, 200, result);
  } catch (err) {
    if (err.tooLarge) return send(res, 413, { error: 'FILE_TOO_LARGE', message: '请求体超过硬性上限' });
    const mapped = errorResponse(err);
    return send(res, mapped.status, mapped.body);
  }
}

export const config = { api: { bodyParser: false } };
