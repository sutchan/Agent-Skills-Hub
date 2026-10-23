// scripts/sync-inline-data.mjs — 将 data/skills-data.json 同步进 src/index.html 的内联 window.SKILLS_DATA
//
// 背景：spec.md §3.4 规定前端唯一读取源为内联 window.SKILLS_DATA（不 fetch data json），
// 且 data/*.json 与内联数据靠「手工三处同步」保持一致，易漂移（spec §8.8：曾出现 161 vs 167）。
// 本脚本把「手工复制」自动化：从权威 data/skills-data.json 重建 categories / categoryEn / skills / total，
// 保留其它顶层键，消除漂移。运行：npm run sync:data
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data', 'skills-data.json');
const htmlPath = path.join(root, 'src', 'index.html');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 重建顶层 categories（去重、保序）与 categoryEn 映射（zh -> en）
const catOrder = [];
const catEn = {};
for (const s of data.skills) {
  if (!catOrder.includes(s.category)) catOrder.push(s.category);
  if (s.enCategory && !catEn[s.category]) catEn[s.category] = s.enCategory;
}

const html = fs.readFileSync(htmlPath, 'utf8');
const lines = html.split('\n');
const idx = lines.findIndex((l) => l.includes('window.SKILLS_DATA ='));
if (idx === -1) throw new Error('未找到 window.SKILLS_DATA 赋值行');

// 解析现有内联对象以保留其它顶层键（若有）
let existing = {};
const eq = lines[idx].indexOf('=');
let body = lines[idx].slice(eq + 1).trim();
if (body.endsWith(';')) body = body.slice(0, -1);
try {
  existing = JSON.parse(body);
} catch {
  existing = {};
}

const next = {
  ...existing,
  total: data.total,
  categories: catOrder,
  categoryEn: catEn,
  skills: data.skills,
};

lines[idx] = `window.SKILLS_DATA = ${JSON.stringify(next)};`;
fs.writeFileSync(htmlPath, lines.join('\n'), 'utf8');

const visible = data.skills.filter((s) => !s.hidden).length;
console.log(
  `✓ 已同步内联 SKILLS_DATA：total=${next.total}（可见 ${visible}），skills=${next.skills.length}，categories=${next.categories.length}，categoryEn=${Object.keys(next.categoryEn).length}`
);
