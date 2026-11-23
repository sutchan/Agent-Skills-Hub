// server/kv-ops.js — 投票/收藏的纯业务逻辑（本地 Express 与 Vercel Functions 共用）
// 与 edge-worker.js 的 NAME_RE / action 语义保持一致：name 为 kebab-case ≤100，undo 删除 vote，add/remove/缺省 toggle fav。
// 错误文案统一取自 server/api-contract.js，避免三端（本地 / Serverless / 边缘函数）文案漂移。
import { INVALID_NAME, UNKNOWN_NAME, WHITELIST_UNAVAILABLE } from './api-contract.js';

export const NAME_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;

/**
 * 校验技能名：白名单不可用（缺失/未加载）时一律拒绝（fail-closed）。
 * 早期版本在白名单为空时放行，导致生产环境读不到数据文件时可写入任意名称——
 * 计数被伪造是数据完整性问题，宁可拒绝写入也不能静默失守。
 */
export function validateName(name, whitelist) {
  if (!NAME_RE.test(name || '')) return INVALID_NAME;
  if (!whitelist || whitelist.size === 0) return WHITELIST_UNAVAILABLE;
  if (!whitelist.has(name)) return UNKNOWN_NAME;
  return null;
}

/** 投票：undo 删除键并返回 { up: 0 }，否则 +1 */
export function applyVote(kv, name, action) {
  if (!kv.votes) kv.votes = {};
  if (action === 'undo') {
    delete kv.votes[name];
    return { up: 0 };
  }
  const current = kv.votes[name] || { up: 0 };
  const next = { up: (current.up || 0) + 1 };
  kv.votes[name] = next;
  return next;
}

/** 收藏：显式 add/remove，否则 toggle；返回 bookmarked 与完整收藏名列表 */
export function applyFavorite(kv, name, action) {
  if (!kv.favorites) kv.favorites = {};
  let isFav;
  if (action === 'add') isFav = true;
  else if (action === 'remove') isFav = false;
  else isFav = !kv.favorites[name];
  if (isFav) kv.favorites[name] = true;
  else delete kv.favorites[name];
  return { bookmarked: isFav, favorites: Object.keys(kv.favorites) };
}
