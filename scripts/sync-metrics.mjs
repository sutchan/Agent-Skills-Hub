// scripts/sync-metrics.mjs — 技能指标实算（size / files / popularity）+ 数据层一致性校验
//
// 指标口径（唯一事实，文档与测试同步此口径）：
//   size       = skills/<name>/ 下所有文件字节总和
//   files      = skills/<name>/ 下文件总数（递归，含隐藏文件）
//   popularity = 其它技能的 description / enDescription 中提及该技能名的次数（不含自身）
//
// 用法：
//   node scripts/sync-metrics.mjs          # 实算并写入 data/skills-metrics.json
//   node scripts/sync-metrics.mjs --check  # 只报告差异，不写文件（CI 用，差异非空即退出码 1）
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const skillsRoot = path.join(root, "skills");
const dataPath = path.join(root, "data", "skills-data.json");
const metricsPath = path.join(root, "data", "skills-metrics.json");

const checkOnly = process.argv.includes("--check");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

/** 递归统计目录下的文件数与字节总和 */
function measure(dir) {
  let files = 0;
  let size = 0;
  if (!fs.existsSync(dir)) return { files, size };
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = measure(target);
      files += sub.files;
      size += sub.size;
    } else if (entry.isFile()) {
      files += 1;
      size += fs.statSync(target).size;
    }
  }
  return { files, size };
}

/** 读取 SKILL.md 的 frontmatter 字段（无 YAML 依赖的轻量解析） */
function frontmatter(skillName) {
  const file = path.join(skillsRoot, skillName, "SKILL.md");
  if (!fs.existsSync(file)) return null;
  const text = fs.readFileSync(file, "utf8");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!kv) continue;
    out[kv[1]] = kv[2].trim().replace(/^"(.*)"$/s, "$1").replace(/^'(.*)'$/s, "$1");
  }
  return out;
}

/** 描述文本中是否提及该技能名（边界排除 pdf / pdf-tools 这类包含关系误命中） */
function mentions(text, name) {
  if (!text || !name) return false;
  const re = new RegExp("(^|[^a-z0-9-])" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z0-9-]|$)", "i");
  return re.test(text);
}

const skills = data.skills.filter((s) => s.name);
const mentionsBy = new Map(skills.map((s) => [s.name, 0]));
for (const other of skills) {
  const text = [other.description, other.enDescription].filter(Boolean).join("\n");
  for (const target of skills) {
    if (target.name === other.name) continue;
    if (mentions(text, target.name)) mentionsBy.set(target.name, mentionsBy.get(target.name) + 1);
  }
}

const next = { skills: {} };
const diffs = [];
for (const s of skills) {
  const { files, size } = measure(path.join(skillsRoot, s.name));
  next.skills[s.name] = {
    name: s.name,
    popularity: mentionsBy.get(s.name) || 0,
    size,
    files,
  };
  const prev = JSON.parse(fs.existsSync(metricsPath) ? fs.readFileSync(metricsPath, "utf8") : "{}").skills?.[s.name];
  if (prev && (prev.size !== size || prev.files !== files || prev.popularity !== next.skills[s.name].popularity)) {
    diffs.push(
      s.name + ": size " + prev.size + "→" + size + "，files " + prev.files + "→" + files +
        "，popularity " + prev.popularity + "→" + next.skills[s.name].popularity
    );
  }
}

// 数据层与磁盘 SKILL.md 的一致性核对（仅报告，不自动改写手工维护的 data 层）
const mismatches = [];
for (const s of skills) {
  const fm = frontmatter(s.name);
  if (!fm) { mismatches.push(s.name + ": 缺少 SKILL.md frontmatter"); continue; }
  if (fm.name && fm.name !== s.name) mismatches.push(s.name + ": frontmatter name=" + fm.name);
  if (fm.category && fm.category !== s.category) {
    mismatches.push(s.name + ": 分类不一致（SKILL.md=" + fm.category + " / data=" + s.category + "）");
  }
  if (fm.en_category && fm.enCategory && fm.en_category !== s.enCategory) {
    mismatches.push(s.name + ": 英文分类不一致（SKILL.md=" + fm.en_category + " / data=" + s.enCategory + "）");
  }
}

console.log("实算技能数：" + skills.length);
console.log("指标变化条数：" + diffs.length);
diffs.slice(0, 12).forEach((d) => console.log("  · " + d));
if (diffs.length > 12) console.log("  · …（其余 " + (diffs.length - 12) + " 条略）");
console.log("SKILL.md ↔ data 一致性差异：" + mismatches.length);
mismatches.slice(0, 12).forEach((d) => console.log("  ! " + d));
if (mismatches.length > 12) console.log("  ! …（其余 " + (mismatches.length - 12) + " 条略）");

if (checkOnly) {
  if (diffs.length) {
    console.error("✗ 技能指标与磁盘实算不一致，请执行 npm run sync:metrics");
    process.exit(1);
  }
  console.log("✓ 技能指标与磁盘实算一致");
} else {
  fs.writeFileSync(metricsPath, JSON.stringify(next, null, 2) + "\n", "utf8");
  console.log("✓ 已写入 data/skills-metrics.json");
}