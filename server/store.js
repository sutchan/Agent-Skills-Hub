// server/store.js
// Edge KV 模拟层：投票/收藏的内存态 + 磁盘持久化（防抖 + 原子写），并加载技能白名单。
import { SKILLS_FILE, STORE_FILE } from './config.js';
import { readJsonFile, writeJsonAtomic } from './fs-util.js';

/**
 * 技能名白名单：写请求的 name 不在其中时一律拒绝，防止伪造技能刷计数。
 * 白名单为空（如 skills-data.json 缺失）时不拦截，避免「无数据文件」把写接口整体打挂。
 */
export const validSkillNames = loadWhitelist();

function loadWhitelist() {
  const set = new Set();
  const data = readJsonFile(SKILLS_FILE, null);
  if (data && Array.isArray(data.skills)) {
    data.skills.forEach((s) => {
      if (s.name) set.add(s.name);
    });
  }
  return set;
}

/** 内存态 KV：votes（技能 → { up }）与 favorites（技能 → true） */
export const kvStore = readJsonFile(STORE_FILE, { votes: {}, favorites: {} });

let saveTimer = null;

/** 100ms 防抖后落盘，把高频写入合并成一次磁盘 IO */
export function saveKvStoreAtomic() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      writeJsonAtomic(STORE_FILE, kvStore);
    } catch (e) {
      console.error('Failed to atomic save kv-store:', e);
    }
  }, 100);
}
