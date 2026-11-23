// Vercel Serverless Function — 收藏 API（GET /api/favorites、POST /api/favorites）
// 存储走 server/blob-store.js：生产自动使用 Vercel Blob；无 token 时回退本地文件。
// 与本地 Express（server/api.js）、EdgeOne 边缘函数（edge-worker.js）共用 server/api-contract.js 的判定语义。
import { loadKv, saveKv, writableStoreIssue } from '../server/blob-store.js';
import { validateName, applyFavorite } from '../server/kv-ops.js';
import { validSkillNames } from '../server/store.js';
import { allowRequest, clientIp } from '../server/api-ratelimit.js';
import { checkWriteState, parseWriteBody } from '../server/api-contract.js';

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
      const state = checkWriteState({
        limited: !allowRequest(clientIp(req)),
        storageIssue: writableStoreIssue(),
        whitelistSize: validSkillNames ? validSkillNames.size : 0,
      });
      if (!state.ok) return json(res, state.status, state.body);
      const parsed = parseWriteBody(req.body);
      if (!parsed.ok) return json(res, 400, { error: parsed.error });
      const { name, action } = parsed.data;
      const error = validateName(name, validSkillNames);
      if (error) return json(res, 400, { error });
      const kv = await loadKv();
      const next = applyFavorite(kv, name, action);
      await saveKv(kv);
      return json(res, 200, { name, ...next });
    }
    return json(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/favorites] unexpected error:', err);
    return json(res, 500, { error: 'Internal server error' });
  }
}
