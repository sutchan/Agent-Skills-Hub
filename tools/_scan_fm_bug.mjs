// tools/_scan_fm_bug.mjs — 由 scripts/ 移入 tools/ 的长期 frontmatter 质检脚本
// 扫描所有 SKILL.md，检查头部注释是否泄漏到正文（导致重复显示 bug）
// 修复：统一用 CRLF 安全解析，frontmatter 块严格取首个 --- 起到首个独立 --- 行结束
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const SK = join(process.cwd(), "skills");
const EX = new Set([".skills-manager", ".trae", "app", "brand", "data", "tools", "node_modules"]);
const CONTRACT = new Set([
  "name", "description", "en_description", "zh_displayName", "category", "en_category",
  "displayName", "license", "version", "author", "homepage", "allowed-tools", "hidden",
  "slug", "emoji", "keywords", "effort", "user-invocable", "disable-model-invocation",
  "hooks", "model", "risk_level", "acceptLicenseTerms", "compatibility", "origin",
  "first_seen", "argument-hint", "last_modified",
]);

// 解析 frontmatter：返回 { fm, body, fmBlock, ok, reason }
function parseFm(text) {
  const norm = text.replace(/\r\n/g, "\n");
  const lines = norm.split("\n");
  if (lines[0].trim() !== "---") return { ok: false, reason: "NO_OPEN", body: norm };
  // 找第一个独立 --- 行作为结束（行内容为恰好 ---）
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") { end = i; break; }
  }
  if (end === -1) return { ok: false, reason: "NO_CLOSE", body: norm };
  const fmBlock = lines.slice(1, end).join("\n");
  const body = lines.slice(end + 1).join("\n");
  return { ok: true, fmBlock, body };
}

const problems = [];
let scanned = 0;
for (const name of readdirSync(SK).sort()) {
  if (EX.has(name)) continue;
  const sk = join(SK, name, "SKILL.md");
  if (!existsSync(sk)) continue;
  scanned++;
  const text = readFileSync(sk, "utf8");
  const { fmBlock, body, ok, reason } = parseFm(text);
  if (!ok) {
    problems.push({ name, type: "NO_FM", detail: reason });
    continue;
  }
  // 1. frontmatter 块内嵌套 ---（除首尾）
  if (/^\s*---\s*$/m.test(fmBlock)) {
    problems.push({ name, type: "NESTED_DASH", detail: "frontmatter 内出现多余 --- 行" });
  }
  // 2. frontmatter 结束后紧跟多余 --- 行（会被渲染为水平线）
  const bodyLines = body.split("\n");
  let firstNonEmpty = -1;
  for (let i = 0; i < bodyLines.length; i++) {
    if (bodyLines[i].trim() !== "") { firstNonEmpty = i; break; }
  }
  if (firstNonEmpty !== -1 && bodyLines[firstNonEmpty].trim() === "---") {
    problems.push({ name, type: "EXTRA_DASH", detail: "frontmatter 结束后紧跟多余 ---" });
  }
  // 3. 正文首非空行是契约字段键（frontmatter 泄漏）
  if (firstNonEmpty !== -1) {
    const km = bodyLines[firstNonEmpty].match(/^([\w-]+):/);
    if (km && CONTRACT.has(km[1])) {
      problems.push({ name, type: "LEAK_KEY", detail: `正文首行是字段键: ${km[1]}` });
    }
  }
  // 4. 正文前 5 行内出现 --- 后接字段（双 frontmatter 迹象）
  const head5 = bodyLines.slice(0, 5).join("\n");
  if (/---\s*\n[\w-]+:/.test(head5)) {
    problems.push({ name, type: "DOUBLE_FM", detail: "正文前 5 行含 --- 后接字段" });
  }
  // 5. frontmatter 块内重复顶层键
  const topKeys = fmBlock.split("\n")
    .filter((l) => !l.startsWith(" ") && !l.startsWith("\t") && l.includes(":"))
    .map((l) => l.slice(0, l.indexOf(":")).trim());
  const seen = new Set();
  const dup = new Set();
  for (const k of topKeys) { if (seen.has(k)) dup.add(k); seen.add(k); }
  if (dup.size) problems.push({ name, type: "DUP_KEY", detail: `重复顶层键: ${[...dup].join(",")}` });
}

console.log("扫描技能目录数(含排除):", readdirSync(SK).length, " 实际扫描:", scanned);
console.log("发现问题数:", problems.length);
for (const p of problems) console.log(`[${p.type}] ${p.name} — ${p.detail}`);
if (!problems.length) console.log("✅ 无头部注释泄漏 bug");
