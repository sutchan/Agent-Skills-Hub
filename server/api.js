// server/api.js — 投票 / 收藏 REST 接口（本地 Express）
// 存储统一走 server/blob-store.js（生产 Vercel Blob / 本地文件回退），
// 校验与计票语义与 Vercel Functions（api/*.js）共用 server/kv-ops.js。
import { loadKv, saveKv } from './blob-store.js';
import { validateName, applyVote, applyFavorite } from './kv-ops.js';
import { validSkillNames } from './store.js';

export async function getVotes(req, res) {
  const kv = await loadKv();
  res.json(kv.votes || {});
}

export async function postVote(req, res) {
  const { name, action } = req.body;
  const error = validateName(name, validSkillNames);
  if (error) return res.status(400).json({ error });
  const kv = await loadKv();
  const next = applyVote(kv, name, action);
  await saveKv(kv);
  return res.json({ name, ...next });
}

export async function getFavorites(req, res) {
  const kv = await loadKv();
  res.json(kv.favorites || {});
}

export async function postFavorite(req, res) {
  const { name, action } = req.body;
  const error = validateName(name, validSkillNames);
  if (error) return res.status(400).json({ error });
  const kv = await loadKv();
  const next = applyFavorite(kv, name, action);
  await saveKv(kv);
  return res.json({ name, ...next });
}

/** 挂载 /api 路由（须挂在限流之后）；async handler 的错误由 Express 5 自动传递，4 需显式捕获 */
function wrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
}

export function mountApi(app) {
  app.get('/api/votes', wrap(getVotes));
  app.post('/api/votes', wrap(postVote));
  app.get('/api/favorites', wrap(getFavorites));
  app.post('/api/favorites', wrap(postFavorite));
}
