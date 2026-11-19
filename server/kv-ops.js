// server/kv-ops.js — 投票/收藏的纯业务逻辑（本地 Express 与 Vercel Functions 共用）
// 与 edge-worker.js 的 NAME_RE / action 语义保持一致：name 为 kebab-case ≤100，undo 删除 vote，add/remove/缺省 toggle fav。
export const NAME_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;

/** 校验技能名：白名单为空时不拦截（与 server/store.js 语义一致） */
export function validateName(name, whitelist) {
  if (!NAME_RE.test(name || '')) return 'Invalid or missing skill name';
  if (whitelist && whitelist.size > 0 && !whitelist.has(name)) return 'Skill name not found in whitelist';
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
