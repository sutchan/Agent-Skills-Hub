// server/file-api.js — 本地 Express 的文件服务 API（与 api/upload.js / api/files.js 共用 server/file-store.js）
// 之所以不直接复用 Vercel handler：Express 的 req.body 已被 express.json() 预解析，
// 而上传走原始二进制流，须在挂载点之前以 express.raw() 精确处理 /api/upload。
import { uploadFile, listFiles, readFile, deleteFile, errorResponse, FILE_STORE_CONFIG } from './file-store.js';

function fail(res, err) {
  const mapped = errorResponse(err);
  res.status(mapped.status).json(mapped.body);
}

function readRaw(req, limit) {
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

/** 原始二进制上传路由：须在 express.json() 之前挂载 */
export async function uploadRoute(req, res) {
  try {
    const body = await readRaw(req, FILE_STORE_CONFIG.maxFileBytes * 2);
    const result = await uploadFile({
      pathname: req.query.name,
      body,
      contentType: req.headers['x-file-content-type'] || req.headers['content-type'] || '',
      access: req.headers['x-file-access'],
    });
    res.json(result);
  } catch (err) {
    if (err.tooLarge) return res.status(413).json({ error: 'FILE_TOO_LARGE', message: '请求体超过硬性上限' });
    fail(res, err);
  }
}

/** 挂载文件 API（须在 express.json() 与限流之后；上传路由除外，见 uploadRoute） */
export function mountFileApi(app) {
  app.get('/api/files', async (req, res) => {
    try {
      if (req.query.name) {
        const result = await readFile(req.query.name, { asAttachment: req.query.download === '1' });
        if (result.redirect) return res.redirect(302, result.redirect);
        res.status(200);
        res.set('Content-Type', result.contentType);
        res.set('Cache-Control', result.cacheControl);
        res.set('X-Content-Type-Options', 'nosniff');
        if (result.size) res.set('Content-Length', String(result.size));
        return Buffer.isBuffer(result.body) ? res.end(result.body) : result.body.pipe(res);
      }
      const files = await listFiles({ prefix: req.query.prefix, limit: req.query.limit });
      res.json({ files, count: files.length });
    } catch (err) { fail(res, err); }
  });

  app.delete('/api/files', async (req, res) => {
    try {
      if (!req.query.name) return res.status(400).json({ error: 'INVALID_PATH', message: '缺少 name 参数' });
      res.json(await deleteFile(req.query.name, { ifMatch: req.headers['if-match'] }));
    } catch (err) { fail(res, err); }
  });
}
