// import-from-github.mjs v1.20.12 — 从 GitHub 仓库导入 Agent Skills 到本仓库 skills/
// 数据源：上游 SKILL.md 在 GitHub（skills.sh 仅为橱窗，其 API 需 Vercel OIDC token 且不含 SKILL.md 内容）。
// 流程：trees API 发现 SKILL.md -> raw 拉取 -> 解析 frontmatter -> 去重 -> 分类映射(13类) -> 字段补全 -> 写盘。
// 默认 --dry-run 仅打印计划，不写盘；加 --write 才真正落盘到 skills/<name>/。
// 分类对齐 tools/build-skills-data.mjs 的 CATEGORY_ORDER（当前 13 类）。
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from "./lib/frontmatter.mjs";

// 分类展示固定顺序（13 类）见 tools/lib/taxonomy.mjs（与 build-skills-data.mjs 对齐）。
// 本脚本仅做导入规划（dry-run），分类由下方 RULES 关键词推演，不直接引用本地常量。

// 分类粗映射（基于 name+description 关键词）。粗匹配仅作初值，人工复核后可纠正。
const RULES = [
  [/wordpress|\bwp\b|cms|plugin/i, 'WordPress 与 CMS'],
  [/react|next|vue|svelte|angular|frontend|web|ui|css|tailwind|component|design|optimize|transition|view|html/i, '前端开发'],
  [/react[\s-]?native|expo|flutter|ios|android|mobile|swift|kotlin/i, '移动端开发'],
  [/node|python|go|rust|java|backend|api|server|database|sql|docker|kubernetes|infra|git|test|qa|lint|debug|review|ci|deploy|vercel|cli|devops/i, '后端与平台'],
  [/test|qa|quality|lint|review|debug/i, '工程实践与质量'],
  [/video|audio|image|media|music|avatar|voice|tts/i, '音视频与多媒体'],
  [/doc|write|content|copy|story|translate|prose|writing/i, '文档与内容'],
  [/security|auth|encrypt|secret|vulnerab/i, '安全'],
  [/data|analytics|chart|spreadsheet|excel|pdf|csv/i, '文件与格式处理'],
  [/agent|workflow|prompt|rag|llm|ai|automation/i, 'AI 与智能体'],
  [/automation|workflow|schedule|cron/i, '自动化与集成'],
];

function classify(name, desc) {
  const t = (name + ' ' + desc).toLowerCase();
  for (const [re, cat] of RULES) if (re.test(t)) return cat;
  return '后端与平台';
}

function getJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'agent-skills-hub-import', Accept: 'application/vnd.github+json' } }, (res) => {
      let b = ''; res.on('data', (c) => (b += c));
      res.on('end', () => { if (res.statusCode >= 400) return reject(new Error(url + ' -> ' + res.statusCode)); resolve(JSON.parse(b)); });
    }).on('error', reject);
  });
}
function getText(url) {
  return new Promise((resolve, reject) => {
    const doGet = (u) => https.get(u, { headers: { 'User-Agent': 'agent-skills-hub-import' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return doGet(res.headers.location).then(resolve, reject);
      let b = ''; res.on('data', (c) => (b += c));
      res.on('end', () => { if (res.statusCode >= 400) return reject(new Error(u + ' -> ' + res.statusCode)); resolve(b); });
    }).on('error', reject);
    doGet(url);
  });
}
const ARGV = process.argv.slice(2);
const WRITE = ARGV.includes('--write');
const OWNER_REPO = (ARGV.find((a) => a.includes('/')) || 'vercel-labs/agent-skills');
const [OWNER, REPO] = OWNER_REPO.split('/');
const BRANCH = ARGV.find((a) => a.startsWith('--branch='))?.split('=')[1] || 'main';
const SKILLS_SUBDIR = ARGV.find((a) => a.startsWith('--dir='))?.split('=')[1] || 'skills';

async function main() {
  const tree = await getJSON(`https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`);
  const files = tree.tree.filter((t) => t.type === 'blob' && t.path.endsWith('SKILL.md') && t.path.includes(SKILLS_SUBDIR + '/'));
  const existing = new Set(fs.readdirSync('skills').filter((n) => fs.existsSync(path.join('skills', n, 'SKILL.md'))));
  let plan = [];
  for (const f of files) {
    const raw = await getText(`https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${f.path}`);
    const fm = parseFrontmatter(raw);
    const dir = f.path.split('/')[1];
    const cat = classify(fm.name || dir, fm.description || '');
    const skip = existing.has(dir);
    plan.push({ dir, name: fm.name || dir, cat, skip, desc: (fm.description || '').slice(0, 60), missing: ['en_description', 'zh_displayName', 'category', 'en_category'].filter((k) => !fm[k]) });
  }
  console.log(`\n=== 导入计划: ${OWNER}/${REPO}@${BRANCH} (${SKILLS_SUBDIR}/) ===`);
  console.log(`发现 ${plan.length} 个 SKILL.md，本地已存在 ${plan.filter((p) => p.skip).length} 个（跳过）\n`);
  for (const p of plan) {
    console.log(`- ${p.dir}  -> ${p.cat}${p.skip ? '  [SKIP 已存在]' : ''}`);
    console.log(`    name=${p.name} | 缺字段: ${p.missing.join(',')}`);
    console.log(`    desc: ${p.desc}`);
  }
  if (!WRITE) { console.log('\n[dry-run] 未写盘。加 --write 真正导入（需先人工复核分类与翻译）。'); return; }
  // 写盘：仅在未冲突时创建目录，frontmatter 补全 4 字段 + source 溯源（中文翻译需后续人工/脚本补）
  let wrote = 0;
  for (const p of plan) {
    if (p.skip) continue;
    const d = path.join('skills', p.dir);
    fs.mkdirSync(d, { recursive: true });
    const src = `skills/${OWNER}/${REPO}`;
    const newMd = `---\nname: ${p.name}\ndescription: |\n  ${p.desc}\nen_description: |\n  ${p.desc}\nzh_displayName: ${p.name}\ncategory: ${p.cat}\nen_category: ${p.cat}\nsource: ${OWNER}/${REPO}\n---\n\n> 导入自 ${OWNER}/${REPO}，需补全中文 description 与分类复核。\n`;
    fs.writeFileSync(path.join(d, 'SKILL.md'), newMd, 'utf8');
    wrote++;
  }
  console.log(`\n[write] 已写入 ${wrote} 个技能目录（含 source 溯源骨架，中文翻译待补）。`);
}

main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
