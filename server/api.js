// server/api.js
// 投票 / 收藏 REST 接口：入参校验 + 技能白名单校验 + 防抖落盘。
import { kvStore, saveKvStoreAtomic, validSkillNames } from './store.js';

/** 校验技能名；通过返回 null，否则返回错误文案 */
function validateSkillName(name) {
  if (!name || typeof name !== 'string') return 'Missing or invalid skill name';
  if (validSkillNames.size > 0 && !validSkillNames.has(name)) return 'Skill name not found in whitelist';
  return null;
}

export function getVotes(req, res) {
  res.json(kvStore.votes || {});
}

export function postVote(req, res) {
  const { name, action } = req.body;
  const error = validateSkillName(name);
  if (error) return res.status(400).json({ error });

  if (!kvStore.votes) kvStore.votes = {};
  if (!kvStore.votes[name]) kvStore.votes[name] = { up: 0 };

  if (action === 'undo') {
    delete kvStore.votes[name];
    saveKvStoreAtomic();
    return res.json({ name, up: 0 });
  }
  kvStore.votes[name].up += 1;
  saveKvStoreAtomic();
  return res.json({ name, ...kvStore.votes[name] });
}

export function getFavorites(req, res) {
  res.json(kvStore.favorites || {});
}

export function postFavorite(req, res) {
  const { name, action } = req.body;
  const error = validateSkillName(name);
  if (error) return res.status(400).json({ error });

  if (!kvStore.favorites) kvStore.favorites = {};
  let isFav;
  if (action === 'add') {
    isFav = true;
  } else if (action === 'remove') {
    isFav = false;
  } else {
    isFav = !kvStore.favorites[name]; // 未显式指定动作时切换收藏状态
  }

  if (isFav) {
    kvStore.favorites[name] = true;
  } else {
    delete kvStore.favorites[name];
  }
  saveKvStoreAtomic();
  return res.json({ name, bookmarked: isFav, favorites: Object.keys(kvStore.favorites) });
}

/** 挂载 /api 路由（须挂在限流之后） */
export function mountApi(app) {
  app.get('/api/votes', getVotes);
  app.post('/api/votes', postVote);
  app.get('/api/favorites', getFavorites);
  app.post('/api/favorites', postFavorite);
}
