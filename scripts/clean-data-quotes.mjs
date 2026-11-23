// scripts/clean-data-quotes.mjs — 清理 data/skills-data.json 描述字段的首尾成对引号
//
// 背景：历史手工维护时把 SKILL.md frontmatter 的引号一并写入描述，
// 导致技能卡片/详情里出现多余的 "Pattern: …" 之类的字面引号。
//
// 规则：仅移除首尾成对的直引号（" 或 '），内部引号保持原样；
//      幂等：重复执行结果一致。用法：node scripts/clean-data-quotes.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "data", "skills-data.json");

const QUOTES = ['"', "'"];

/** 去掉首尾成对引号（不成对时不动） */
function stripEdgeQuotes(text) {
  if (typeof text !== "string") return text;
  if (text.length < 2) return text;
  const first = text[0];
  const last = text[text.length - 1];
  if (QUOTES.includes(first) && last === first) return text.slice(1, -1);
  return text;
}

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const changed = [];
for (const s of data.skills) {
  for (const field of ["description", "enDescription"]) {
    const before = s[field];
    if (typeof before !== "string") continue;
    const after = stripEdgeQuotes(before);
    if (after !== before) {
      s[field] = after;
      changed.push(s.name + "." + field);
    }
  }
}

if (!changed.length) {
  console.log("✓ 描述字段无残留引号，无需修改");
} else {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("✓ 已清理 " + changed.length + " 处首尾引号：");
  changed.forEach((c) => console.log("  · " + c));
}