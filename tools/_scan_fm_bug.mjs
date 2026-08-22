// 扫描所有 SKILL.md，检查头部注释是否泄漏到正文（导致重复显示 bug）
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

function parseFm(text) {
  const norm = text.replace(/\r\n/g, "\n");
  const lines = norm.split("\n");
  if (lines[0].trim() !== "---") return { ok: false, body: norm };
  let end = -1;
  for (let i = 1; i < lines.length; i++) if (lines[i].trim() === "---") { end = i; break; }
  if (end === -1) return { ok: false, body: norm };
  return { ok: true, fmBlock: lines.slice(1, end).join("\n"), body: lines.slice(end + 1).join("\n") };
}

const problems = [];
let scanned = 0;
for (const name of readdirSync(SK).sort()) {
  if (EX.has(name)) continue;
  const p = join(SK, name, "SKILL.md");
  if (!existsSync(p)) continue;
  scanned++;
  const { fmBlock, body, ok } = parseFm(readFileSync(p, "utf8"));
  if (!ok) { problems.push({ name, type: "NO_FM" }); continue; }
  if (/^\s*---\s*$/m.test(fmBlock)) problems.push({ name, type: "NESTED_DASH" });
  const bodyLines = body.split("\n");
  let f = -1;
  for (let i = 0; i < bodyLines.length; i++) if (bodyLines[i].trim() !== "") { f = i; break; }
  if (f !== -1 && bodyLines[f].trim() === "---") problems.push({ name, type: "EXTRA_DASH" });
  if (f !== -1) {
    const km = bodyLines[f].match(/^([\w-]+):/);
    if (km && CONTRACT.has(km[1])) problems.push({ name, type: "LEAK_KEY", detail: km[1] });
  }
  if (/---\s*\n[\w-]+:/.test(bodyLines.slice(0, 5).join("\n"))) problems.push({ name, type: "DOUBLE_FM" });
  const top = fmBlock.split("\n").filter((l) => !l.startsWith(" ") && !l.startsWith("\t") && l.includes(":"))
    .map((l) => l.slice(0, l.indexOf(":")).trim());
  const seen = new Set(), dup = new Set();
  for (const k of top) { if (seen.has(k)) dup.add(k); seen.add(k); }
  if (dup.size) problems.push({ name, type: "DUP_KEY", detail: [...dup].join(",") });
}
console.log("扫描:", scanned, " 发现问题:", problems.length);
for (const p of problems) console.log(`[${p.type}] ${p.name}${p.detail ? " — " + p.detail : ""}`);
if (!problems.length) console.log("✅ 无头部注释泄漏 bug");
