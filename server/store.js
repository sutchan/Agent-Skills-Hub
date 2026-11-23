// server/store.js — 技能名白名单（投票/收藏写接口的防伪造校验）
// 投票/收藏状态已迁移至 server/blob-store.js（Vercel Blob / 本地文件回退），
// 本模块仅保留白名单加载；原 kvStore 内存态与防抖落盘随迁移移除。
//
// 白名单来源优先级：
//   1) server/skill-names.json —— 构建期由 scripts/sync-inline-data.mjs 生成的精简名单，
//      随 Serverless Function 一起打包，生产环境无需依赖仓库数据文件；
//   2) data/skills-data.json —— 本地开发回退（仓库内直接可读）。
// 两者都读不到时返回空集合，写接口据此 fail-closed 拒绝（见 server/kv-ops.js）。
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SKILLS_FILE } from './config.js';
import { readJsonFile } from './fs-util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 构建期生成的精简技能名清单（与 data/skills-data.json 的 name 字段一致） */
export const SKILL_NAMES_FILE = path.join(__dirname, 'skill-names.json');

/** 白名单实际来源：'skill-names.json' | 'skills-data.json' | 'missing'（供诊断与告警） */
export const whitelistSource = (() => {
  const names = readJsonFile(SKILL_NAMES_FILE, null);
  if (names && Array.isArray(names.names) && names.names.length > 0) return 'skill-names.json';
  const data = readJsonFile(SKILLS_FILE, null);
  if (data && Array.isArray(data.skills) && data.skills.length > 0) return 'skills-data.json';
  return 'missing';
})();

/** 技能名白名单：写请求的 name 不在其中时一律拒绝，防止伪造技能刷计数 */
export const validSkillNames = loadWhitelist();

function loadWhitelist() {
  const set = new Set();
  const names = readJsonFile(SKILL_NAMES_FILE, null);
  if (names && Array.isArray(names.names)) {
    names.names.forEach((n) => n && set.add(n));
  }
  if (set.size === 0) {
    const data = readJsonFile(SKILLS_FILE, null);
    if (data && Array.isArray(data.skills)) {
      data.skills.forEach((s) => {
        if (s.name) set.add(s.name);
      });
    }
  }
  return set;
}
