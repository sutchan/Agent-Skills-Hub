// Vercel Serverless Function — 投票 API（GET /api/votes、POST /api/votes）
// 存储走 server/blob-store.js：生产自动使用 Vercel Blob；无 token 时回退本地文件。
// 与本地 Express（server/api.js）共用 server/kv-ops.js 的校验与计票语义。
import { loadKv, saveKv, writableStoreIssue } from '../server/blob-store.js';
import { validateName, applyVote } from '../server/kv-ops.js';
import { validSkillNames } from '../server/store.js';
import { allowRequest, clientIp } from '../server/api-ratelimit.js';

// 同源接口：不开放跨站 CORS（写端点跨站可写会污染公开计数）。
// 浏览器同源调用无需任何 CORS 头；跨站预检因缺少 Allow-Origin 而被拒绝。
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
    // 仅回应预检，不授予跨站权限
    res.statusCode = 204;
    return res.end();
  }
  try {
    if (req.method === 'GET') {
      const kv = await loadKv();
      return json(res, 200, kv.votes || {});
    }
    if (req.method === 'POST') {
      // 写端点限流：单 IP 每分钟 30 次写请求（可用 API_RATE_LIMIT 调整）
      if (!allowRequest(clientIp(req))) {
        return json(res, 429, { error: 'RATE_LIMITED', message: '请求过于频繁，请稍后再试' });
      }
      const issue = writableStoreIssue();
      if (issue) return json(res, 503, { error: 'STORE_UNAVAILABLE', message: issue });
      // 白名单不可用时必须拒绝写入（fail-closed），否则任意名称都能伪造计数
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
      const next = applyVote(kv, name, action);
      await saveKv(kv);
      return json(res, 200, { name, ...next });
    }
    return json(res, 405, { error: 'Method not allowed' });
  } catch {
    return json(res, 500, { error: 'Internal server error' });
  }
}
