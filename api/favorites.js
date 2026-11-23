// Vercel Serverless Function — 收藏 API（GET /api/favorites、POST /api/favorites）
// 存储走 server/blob-store.js：生产自动使用 Vercel Blob；无 token 时回退本地文件。
// 与本地 Express（server/api.js）共用 server/kv-ops.js 的校验与收藏语义。
import { loadKv, saveKv, writableStoreIssue } from '../server/blob-store.js';
import { validateName, applyFavorite } from '../server/kv-ops.js';
import { validSkillNames } from '../server/store.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
};

function json(res, status, body) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
    res.statusCode = 204;
    return res.end();
  }
  try {
    if (req.method === 'GET') {
      const kv = await loadKv();
      return json(res, 200, kv.favorites || {});
    }
    if (req.method === 'POST') {
      const issue = writableStoreIssue();
      if (issue) return json(res, 503, { error: 'STORE_UNAVAILABLE', message: issue });
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { return json(res, 400, { error: 'Invalid JSON body' }); }
      }
      const { name, action } = body || {};
      const error = validateName(name, validSkillNames);
      if (error) return json(res, 400, { error });
      const kv = await loadKv();
      const next = applyFavorite(kv, name, action);
      await saveKv(kv);
      return json(res, 200, { name, ...next });
    }
    return json(res, 405, { error: 'Method not allowed' });
  } catch {
    return json(res, 500, { error: 'Internal server error' });
  }
}
