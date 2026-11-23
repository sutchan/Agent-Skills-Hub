// server/api.js — 投票 / 收藏 REST 接口（本地 Express）
// 存储统一走 server/blob-store.js（生产 Vercel Blob / 本地文件回退），
// 校验与计票语义与 Vercel Functions（api/*.js）、EdgeOne 边缘函数（edge-worker.js）共用同一契约：
//   - 白名单不可用 → 503（fail-closed，绝不静默放行任意技能名）
//   - 名称非法 / 不在白名单 → 400
//   - 存储不可用（生产缺 token）→ 503
import { loadKv, saveKv, writableStoreIssue } from './blob-store.js';
import { validateName, applyVote, applyFavorite } from './kv-ops.js';
import { validSkillNames } from './store.js';
import { checkWriteState, parseWriteBody } from './api-contract.js';

/**
 * 写接口前置闸门：存储可用性 + 白名单可用性（判定逻辑来自 server/api-contract.js，与 Serverless / 边缘函数一致）。
 * @param {import('express').Response} res
 * @returns {boolean} true 表示允许继续处理；false 表示已返回错误响应
 */
function guardWrite(res) {
  const state = checkWriteState({
    storageIssue: writableStoreIssue(),
    whitelistSize: validSkillNames ? validSkillNames.size : 0,
  });
  if (!state.ok) {
    res.status(state.status).json(state.body);
    return false;
  }
  return true;
}

export async function getVotes(req, res) {
  const kv = await loadKv();
  res.json(kv.votes || {});
}

export async function postVote(req, res) {
  if (!guardWrite(res)) return;
  const parsed = parseWriteBody(req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  const { name, action } = parsed.data;
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
  if (!guardWrite(res)) return;
  const parsed = parseWriteBody(req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  const { name, action } = parsed.data;
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
