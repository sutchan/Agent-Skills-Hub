// tools/_analyze_skills.mjs — 临时诊断脚本（用完即删）
// 统计 skills/*/SKILL.md 缺失的契约字段，并核对 git HEAD 旧 data 的中文映射回填覆盖率。
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { parseFrontmatter } from "./lib/frontmatter.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const SKILLS = join(ROOT, "skills");

// 旧 data（git HEAD）含准确中文映射，作为回填权威源
let oldData;
try {
  oldData = JSON.parse(execSync("git show HEAD:data/skills-data.json", { cwd: ROOT }).toString());
} catch (e) {
  console.error("无法读取 git HEAD 旧 data:", e.message);
  process.exit(1);
}
const oldMap = new Map(oldData.skills.map((s) => [s.name, s]));

const REQUIRED = ["name", "description", "en_description", "zh_displayName", "category", "en_category"];
const missingCount = Object.fromEntries(REQUIRED.map((r) => [r, 0]));

const dirs = readdirSync(SKILLS).filter(
  (d) => /^[a-z0-9-]+$/.test(d) && existsSync(join(SKILLS, d, "SKILL.md"))
);

const unmatched = [];
let backfillable = 0;
for (const d of dirs) {
  const txt = readFileSync(join(SKILLS, d, "SKILL.md"), "utf8");
  const fm = parseFrontmatter(txt);
  const key = fm.name || d;
  for (const r of REQUIRED) {
    if (fm[r] === undefined || fm[r] === "") missingCount[r]++;
  }
  const oldEntry = oldMap.get(key) || oldMap.get(d);
  if (oldEntry) backfillable++;
  else unmatched.push(key);
}

console.log("技能目录(含SKILL.md)数:", dirs.length);
console.log("旧 data skill 数:", oldData.skills.length);
console.log("缺字段统计:", JSON.stringify(missingCount));
console.log("可由旧 data 回填的技能数:", backfillable);
console.log("旧 data 无匹配(需AI推断)数:", unmatched.length);
console.log("无匹配清单:", unmatched.join(", "));
