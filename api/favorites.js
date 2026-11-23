// Vercel Serverless Function — 收藏 API（GET /api/favorites、POST /api/favorites）
// 存储走 server/blob-store.js：生产自动使用 Vercel Blob；无 token 时回退本地文件。
// 与本地 Express（server/api.js）共用 server/kv-ops.js 的校验与收藏语义。
import { loadKv, saveKv, writableStoreIssue } from '../server/blob-store.js';
import { validateName, applyFavorite } from '../server/kv-ops.js';
import { validSkillNames } from '../server/store.js';
import { allowRequest, clientIp } from '../server/api-ratelimit.js';

// 同源接口：不开放跨站 CORS（写端点跨站可写会污染公开收藏状态）。
const HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

function json(res, status, body) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(HEADERS)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  try {
    if (req.method === 'GET') {
      const kv = await loadKv();
      return json(res, 200, kv.favorites || {});
    }
    if (req.method === 'POST') {
      if (!allowRequest(clientIp(req))) {
        return json(res, 429, { error: 'RATE_LIMITED', message: '请求过于频繁，请稍后再试' });
      }
      const issue = writableStoreIssue();
      if (issue) return json(res, 503, { error: 'STORE_UNAVAILABLE', message: issue });
      // 白名单不可用时必须拒绝写入（fail-closed）
      if (!validSkillNames || validSkillNames.size === 0) {
        return json(res, 503, { error: 'STORE_UNAVAILABLE', message: '技能名单不可用，写接口已暂停' });
      }
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
