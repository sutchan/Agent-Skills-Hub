// Vercel Serverless Function — 文件列表 / 读取 / 删除
//   GET  /api/files             → 列出 files/ 前缀对象（?prefix=&limit=）
//   GET  /api/files?name=<path> → 读取（public → 302 到 CDN；private → 服务端流式代理，no-store）
//   GET  /api/files?name=...&download=1 → 下载附件（downloadUrl）
//   DELETE /api/files?name=<path> → 删除（支持 If-Match 乐观锁）
//   OPTIONS → CORS 预检
import { listFiles, readFile, deleteFile, errorResponse } from '../server/file-store.js';
import { requireFileApiAccess } from '../server/file-auth.js';

// 同源接口，不再开放跨站 CORS；保留 nosniff 防止内容嗅探
const HEADERS = { 'X-Content-Type-Options': 'nosniff' };

function json(res, status, body) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(HEADERS)) res.setHeader(k, v);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function pipeStream(res, result) {
  res.statusCode = 200;
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Cache-Control', result.cacheControl);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (result.size) res.setHeader('Content-Length', String(result.size));
  if (Buffer.isBuffer(result.body)) return res.end(result.body);
  result.body.pipe(res);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    for (const [k, v] of Object.entries(HEADERS)) res.setHeader(k, v);
    res.statusCode = 204;
    return res.end();
  }
  try {
    const q = req.query || {};
    if (req.method === 'GET') {
      if (q.name) {
        const result = await readFile(q.name, { asAttachment: q.download === '1' });
        if (result.redirect) {
          res.statusCode = 302;
          res.setHeader('Location', result.redirect);
          res.setHeader('Cache-Control', result.cacheControl);
          res.setHeader('X-Content-Type-Options', 'nosniff');
          return res.end();
        }
        return pipeStream(res, result);
      }
      const denied = requireFileApiAccess(req); // 列举私有文件名属敏感操作
      if (denied) return json(res, denied.status, denied.body);
      const files = await listFiles({ prefix: q.prefix, limit: q.limit });
      return json(res, 200, { files, count: files.length });
    }
    if (req.method === 'DELETE') {
      const denied = requireFileApiAccess(req);
      if (denied) return json(res, denied.status, denied.body);
      if (!q.name) return json(res, 400, { error: 'INVALID_PATH', message: '缺少 name 参数' });
      const result = await deleteFile(q.name, { ifMatch: req.headers['if-match'] });
      return json(res, 200, result);
    }
    return json(res, 405, { error: 'METHOD_NOT_ALLOWED', message: '仅支持 GET / DELETE' });
  } catch (err) {
    const mapped = errorResponse(err);
    return json(res, mapped.status, mapped.body);
  }
}

export const config = { api: { bodyParser: false } };
