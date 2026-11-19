// server/store.js — 技能名白名单（投票/收藏写接口的防伪造校验）
// 投票/收藏状态已迁移至 server/blob-store.js（Vercel Blob / 本地文件回退），
// 本模块仅保留白名单加载；原 kvStore 内存态与防抖落盘随迁移移除。
import { SKILLS_FILE } from './config.js';
import { readJsonFile } from './fs-util.js';

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
