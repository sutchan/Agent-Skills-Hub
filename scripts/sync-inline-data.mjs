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
// 兼容「单行自带 <script> 包裹」格式：剔除尾部 </script> 再解析
let body = lines[idx].slice(eq + 1).replace(/<\/script>\s*$/i, '').trim();
if (body.endsWith(';')) body = body.slice(0, -1);
try {
  existing = JSON.parse(body);
} catch {
  existing = {};
}

// total 改为基于「当前可见技能数」实算，而非直接采用 data.total 字段，
// 避免新增/隐藏技能后 data.total 忘记同步导致内联展示数量漂移（单一来源原则）。
const visible = data.skills.filter((s) => !s.hidden).length;
const next = {
  ...existing,
  total: visible,
  categories: catOrder,
  categoryEn: catEn,
  skills: data.skills,
};

// 关键：必须用 <script> 包裹并转义 <>&，否则数据块被当作文本渲染、且 </script> 会提前闭合脚本
const json = JSON.stringify(next)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026');
lines[idx] = `<script>window.SKILLS_DATA = ${json};</script>`;
fs.writeFileSync(htmlPath, lines.join('\n'), 'utf8');

console.log(
  `✓ 已同步内联 SKILLS_DATA：total=${next.total}（可见 ${visible}），skills=${next.skills.length}，categories=${next.categories.length}，categoryEn=${Object.keys(next.categoryEn).length}`
);

// 同步生成「可打包的技能名清单」server/skill-names.json：
// Serverless Function 打包时不会带上仓库的 data/skills-data.json，
// 若白名单读不到就会退化为空集（写接口 fail-closed 后将完全不可写）。
// 这里输出精简名单（约数 KB），随函数一起打包，生产环境白名单始终可用。
const namesPath = path.join(root, 'server', 'skill-names.json');
const names = data.skills.map((s) => s.name).filter(Boolean);
fs.writeFileSync(namesPath, JSON.stringify({ names }, null, 0) + '\n', 'utf8');
console.log(`✓ 已生成 server/skill-names.json：${names.length} 个技能名（随 Serverless Function 打包）`);

// 同步生成「静态发布副本」public/data/skills-data.json：
// 该副本让 /data/skills-data.json 在纯静态产物（out/）中可达，供机器读取；
// 权威源唯一为 data/skills-data.json，此处单向复制，避免人工复制导致副本漂移。
const pubDataDir = path.join(root, 'public', 'data');
fs.mkdirSync(pubDataDir, { recursive: true });
const pubDataPath = path.join(pubDataDir, 'skills-data.json');
fs.writeFileSync(pubDataPath, fs.readFileSync(dataPath, 'utf8'), 'utf8');
console.log(`✓ 已同步 public/data/skills-data.json：发布副本（${data.skills.length} 个技能）`);

// 同步注入「边缘函数精确白名单」edge-worker.js：
// 边缘运行时读不到仓库数据文件，此前仅做名称格式校验（任意 kebab-case 名称都能写入计数）。
// 这里把权威名单内联进 edge-worker.js，配合 fail-closed 判定，与 server/ 端语义对齐。
const edgePath = path.join(root, 'edge-worker.js');
const edgeSrc = fs.readFileSync(edgePath, 'utf8');
const EDGE_BLOCK_RE = /const SKILL_NAMES_INLINE = \[[\s\S]*?\n\];/;
if (!EDGE_BLOCK_RE.test(edgeSrc)) {
  throw new Error('edge-worker.js 未找到 SKILL_NAMES_INLINE 白名单块，无法注入技能名单');
}
const nameLines = [];
for (let i = 0; i < names.length; i += 10) {
  nameLines.push('  ' + names.slice(i, i + 10).map((n) => JSON.stringify(n)).join(', '));
}
const edgeBlock = 'const SKILL_NAMES_INLINE = [\n' + nameLines.join(',\n') + ',\n];';
const nextEdge = edgeSrc.replace(EDGE_BLOCK_RE, edgeBlock);
if (nextEdge !== edgeSrc) {
  fs.writeFileSync(edgePath, nextEdge, 'utf8');
  console.log(`✓ 已注入 edge-worker.js 白名单：${names.length} 个技能名`);
} else {
  console.log('· edge-worker.js 白名单已是最新，无需变更');
}
