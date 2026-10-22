// 校验 skills/*/SKILL.md 是否满足 docs/spec.md §2 frontmatter 契约。
// 解决技术债 8.3：此前删除 validate-skills.mjs 后，SKILL.md 源头与 data 之间无自动一致性校验。
//
// 软门禁策略（避免一次性强约束打挂 CI）：
//  - 硬失败（exit 1）：缺 name / description、name 与目录名不一致、category 非法。
//  - 软警告（exit 0）：缺 en_description / zh_displayName / category / en_category。
//    原因：§2 六字段契约较新，存量技能多数尚未迁移，先以警告暴露迁移缺口，不阻断流水线。
// 仅校验「源」（SKILL.md）；data 的字段完整性由 tools/lib/skills-data.test.mjs 负责。
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const SKILLS_DIR = 'skills';
const CATEGORIES = new Set([
  '品牌与设计', '文档与内容', '数据分析与可视化', '前端开发', '后端与平台', '移动端开发',
  'WordPress 与 CMS', '工程实践与质量', '文件与格式处理', '自动化与集成', 'AI 与智能体',
  '音视频与多媒体', '桌面与客户端', '安全',
]);

function parseFrontmatter(txt) {
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const lines = m[1].split(/\r?\n/);
  const fm = {};
  let block = null;
  for (const raw of lines) {
    if (block) {
      if (/^\s+\S/.test(raw)) { fm[block] += (fm[block] ? '\n' : '') + raw.trim(); continue; }
      block = null;
    }
    const mm = raw.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (mm) {
      const key = mm[1];
      let v = mm[2];
      if (v === '|-' || v === '>' || v === '|') { block = key; fm[key] = ''; continue; }
      if (v.startsWith('[') && v.endsWith(']')) {
        fm[key] = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        continue;
      }
      fm[key] = v.replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

const HARD = ['name', 'description'];
const SOFT = ['en_description', 'zh_displayName', 'category', 'en_category'];
const errors = [];
const warnings = [];
const dirs = readdirSync(SKILLS_DIR).filter((d) => {
  try { return readdirSync(path.join(SKILLS_DIR, d)).includes('SKILL.md'); } catch { return false; }
});
for (const d of dirs) {
  const fm = parseFrontmatter(readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8'));
  if (!fm) { errors.push(`[${d}] 缺少 frontmatter`); continue; }
  for (const k of HARD) if (!fm[k]) errors.push(`[${d}] 缺失必填 ${k}`);
  if (fm.name && fm.name !== d) errors.push(`[${d}] name(${fm.name}) 与目录名不一致`);
  for (const k of SOFT) if (!fm[k]) warnings.push(`[${d}] 缺 §2 字段 ${k}（迁移中，暂不阻断）`);
  if (fm.category && !CATEGORIES.has(fm.category)) errors.push(`[${d}] category(${fm.category}) 不在 14 大领域`);
}

if (errors.length) {
  console.error(`✗ SKILL.md 硬约束校验失败（${errors.length} 项）：`);
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`✓ SKILL.md 硬约束校验通过：${dirs.length} 个技能均满足 name/description/name==dir`);
if (warnings.length) {
  console.warn(`⚠ §2 六字段迁移缺口（${warnings.length} 项，仅警告不阻断）：`);
  warnings.slice(0, 20).forEach((w) => console.warn('  - ' + w));
  if (warnings.length > 20) console.warn(`  … 其余 ${warnings.length - 20} 项略`);
}
