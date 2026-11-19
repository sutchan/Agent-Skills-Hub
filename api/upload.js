// Vercel Serverless Function — 通用文件上传（POST /api/upload）
// 契约：请求体为原始二进制（Content-Type = 文件 MIME）；元数据经 query/header 传递：
//   ?name=<pathname>           必填，目标路径（自动加 files/ 前缀）
//   x-file-content-type      可选，覆盖 Content-Type（默认取请求头）
//   x-file-access            public | private（默认 BLOB_ACCESS 或 private）
// 响应：{ pathname, url, downloadUrl?, contentType, size, access, etag?, storage }
// 限制与错误见 server/file-store.js（413 过大 / 415 类型不允许 / 400 路径非法）。
import { uploadFile, errorResponse } from '../server/file-store.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-file-content-type, x-file-access',
  'X-Content-Type-Options': 'nosniff',
};

function send(res, status, body) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) { reject(Object.assign(new Error('body too large'), { tooLarge: true })); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'METHOD_NOT_ALLOWED', message: '仅支持 POST' });
  try {
    const name = req.query?.name;
    const contentType = req.headers['x-file-content-type'] || req.headers['content-type'] || '';
    const access = req.headers['x-file-access'];
    // 先按最大上限 + 1 宽松读取，再由 file-store 做精确校验（返回 413 标准错误）
    const hardLimit = Number(process.env.BLOB_MAX_FILE_BYTES) * 2 || 20 * 1024 * 1024;
    const body = await readBody(req, hardLimit);
    const result = await uploadFile({ pathname: name, body, contentType, access });
    return send(res, 200, result);
  } catch (err) {
    if (err.tooLarge) return send(res, 413, { error: 'FILE_TOO_LARGE', message: '请求体超过硬性上限' });
    const mapped = errorResponse(err);
    return send(res, mapped.status, mapped.body);
  }
}

export const config = { api: { bodyParser: false } };
