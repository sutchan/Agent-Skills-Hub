// tools/validate-skills.mjs v1.20.17
// 校验 skills/<name>/SKILL.md 的 frontmatter 规范性（CI 门禁）
// 检查项：
//   0. name 与目录名一致（README 约定：目录名须与 frontmatter name 字段保持一致）
//   1. 必填展示字段齐全：name / description / en_description / zh_displayName / category / en_category
//   2. category / en_category 属于 14 类稳定键集合（v1.20.67 起由 13 类演进：新增「桌面与客户端」类）
//   3. 无冲突键 description_zh / description_en
//   4. 契约字段顺序规范：name → description → en_description → zh_displayName → category → en_category
//   5. 无重复顶层键
//
// 退出码：0 通过，1 存在错误
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// 共享分类法与契约定义（单一权威源，与 build-skills-data.mjs 等对齐，消除漂移）
import {
  REQUIRED,
  CONTRACT_ORDER,
  VALID_CATEGORIES,
  VALID_EN_CATEGORIES,
  CONFLICT_KEYS,
} from "./lib/taxonomy.mjs";
import { parseFrontmatter } from "./lib/frontmatter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");

// 解析顶层键序列（含行号区间），用于顺序/重复校验。
// 注意：此解析依赖行号区间（用于按原始行号取分类值），与 build 的 parseFrontmatter 行为不同，故保留在 validate 内。
function parseTopLevelKeys(fmText) {
  const lines = fmText.split("\n");
  const entries = []; // { key, start, end }
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const idx = line.indexOf(":");
    if (idx === -1 || line.startsWith(" ")) { i++; continue; }
    const key = line.slice(0, idx).trim();
    let j = i + 1;
    while (j < lines.length && (lines[j].trim() === "" || lines[j].startsWith(" "))) j++;
    entries.push({ key, start: i, end: j });
    i = j;
  }
  return entries;
}

function validateOne(dir) {
  const fp = path.join(SKILLS_DIR, dir, "SKILL.md");
  if (!fs.existsSync(fp)) return [];
  const txt = fs.readFileSync(fp, "utf8");
  const m = txt.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return [`${dir}: 缺少合法 frontmatter 块`];
  const fm = m[1];
  const lines = fm.split("\n");
  const entries = parseTopLevelKeys(fm);
  const keys = entries.map((e) => e.key);
  const errors = [];
  const rel = `skills/${dir}/SKILL.md`;
  // 0. name 与目录名一致（README 约定：目录名须与 frontmatter name 字段保持一致）
  const parsed = parseFrontmatter(txt);
  if (parsed.name !== undefined && parsed.name !== dir) {
    errors.push(`${rel}: name "${parsed.name}" 与目录名 "${dir}" 不一致（须保持一致）`);
  }

  // 1. 必填字段
  for (const r of REQUIRED) {
    if (!keys.includes(r)) errors.push(`${rel}: 缺少必填字段 "${r}"`);
  }
  // 2. 分类合法性（按行号取原始行，避免字符偏移误用）
  const ci = keys.indexOf("category");
  if (ci !== -1) {
    const val = lines[entries[ci].start].split(":").slice(1).join(":").trim();
    if (!VALID_CATEGORIES.has(val)) errors.push(`${rel}: category "${val}" 不在 13 类合法集合中`);
  }
  const eni = keys.indexOf("en_category");
  if (eni !== -1) {
    const val = lines[entries[eni].start].split(":").slice(1).join(":").trim();
    if (!VALID_EN_CATEGORIES.has(val)) errors.push(`${rel}: en_category "${val}" 不在 13 类合法集合中`);
  }
  // 3. 冲突键
  for (const ck of CONFLICT_KEYS) {
    if (keys.includes(ck)) errors.push(`${rel}: 存在冲突键 "${ck}"（应并入 description/en_description）`);
  }
  // 4. 契约字段顺序
  const positions = CONTRACT_ORDER.map((k) => keys.indexOf(k)).filter((p) => p !== -1);
  for (let k = 1; k < positions.length; k++) {
    if (positions[k] < positions[k - 1]) {
      errors.push(`${rel}: 契约字段顺序应为 ${CONTRACT_ORDER.join(" → ")}`);
      break;
    }
  }
  // 5. 重复顶层键
  const seen = new Set();
  for (const k of keys) {
    if (seen.has(k)) errors.push(`${rel}: 重复顶层键 "${k}"`);
    seen.add(k);
  }
  return errors;
}

function main() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error("skills/ 目录不存在");
    process.exit(1);
  }
  const dirs = fs.readdirSync(SKILLS_DIR).filter((d) =>
    !/\.ffs_lock$|^RecycleBin~|\.ffs_tmp$/.test(d) &&
    fs.statSync(path.join(SKILLS_DIR, d)).isDirectory() &&
    fs.existsSync(path.join(SKILLS_DIR, d, "SKILL.md"))
  );
  let allErrors = [];
  for (const d of dirs) allErrors = allErrors.concat(validateOne(d));
  if (allErrors.length) {
    console.error(`\n❌ 校验失败：${allErrors.length} 个问题\n`);
    for (const e of allErrors) console.error("  - " + e);
    process.exit(1);
  }
  console.log(`✅ skills 校验通过：${dirs.length} 个技能 frontmatter 规范`);
  process.exit(0);
}

main();
