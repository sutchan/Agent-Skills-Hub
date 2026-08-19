// Diagnostic: compare README.md skill list vs disk skills/, and dump SKILL.md descriptions
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const SKILLS_DIR = join(ROOT, "skills");
const README = join(ROOT, "README.md");

function parseReadmeSkills() {
  const map = {};
  let category = null;
  const text = readFileSync(README, "utf8");
  for (const line of text.split("\n")) {
    const h = line.match(/^###\s+(.+?)[（(]\d+[)）]\s*$/);
    if (h) { category = h[1].trim(); continue; }
    const li = line.match(/^- \*\*\[([^\]]+)\]\(skills\/[^)]+\)\*\*/);
    if (li && category) map[li[1].trim()] = category;
  }
  return map;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  const fm = {};
  if (!m) return fm;
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    // unfold folded desc
    fm[key] = val;
  }
  return fm;
}

const readmeMap = parseReadmeSkills();
const diskDirs = readdirSync(SKILLS_DIR)
  .filter((d) => {
    try { return existsSync(join(SKILLS_DIR, d, "SKILL.md")); } catch { return false; }
  })
  .sort();

const diskSet = new Set(diskDirs);
const readmeSet = new Set(Object.keys(readmeMap));

console.log("=== 总数 ===");
console.log("README 声明:", readmeMapTotal());
console.log("README 实际列出:", readmeSet.size);
console.log("磁盘技能数:", diskDirs.length);

console.log("\n=== README 缺失(磁盘有但 README 未列出) ===");
const missing = [...diskSet].filter((s) => !readmeSet.has(s)).sort();
for (const s of missing) console.log("  - " + s);

console.log("\n=== README 多余(README 列出但磁盘无) ===");
const extra = [...readmeSet].filter((s) => !diskSet.has(s)).sort();
for (const s of extra) console.log("  - " + s);

console.log("\n=== 各技能 SKILL.md 的 description(frontmatter) ===");
for (const name of diskDirs) {
  const text = readFileSync(join(SKILLS_DIR, name, "SKILL.md"), "utf8");
  const fm = parseFrontmatter(text);
  console.log(`\n[${name}] name=${fm.name || ""}`);
  console.log(`  desc: ${fm.description || "(无)"}`);
}

function readmeMapTotal() {
  const m = readFileSync(README, "utf8").match(/包含\s*(\d+)\s*个/);
  return m ? m[1] : "?";
}
