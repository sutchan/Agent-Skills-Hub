// prototype/build-skills-data.mjs v1.0.0
// 从磁盘真实技能数据生成自包含 JSON，供静态 HTML 原型使用。
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SKILLS_DIR = join(ROOT, "skills");
const README = join(ROOT, "README.md");
const OUT = join(__dirname, "skills-data.json");

function parseFrontmatter(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  const fm = {};
  if (!m) return fm;
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    fm[key] = val;
  }
  return fm;
}

function parseReadme() {
  const map = {};
  let category = null;
  const text = readFileSync(README, "utf8");
  for (const line of text.split("\n")) {
    const h = line.match(/^###\s+(.*)$/);
    if (h) {
      category = h[1].replace(/\s*[（(]\d+[)）]\s*$/, "").trim();
      continue;
    }
    const li = line.match(/^- \*\*\[([^\]]+)\]\(skills\/[^)]+\)\*\*\s*—\s*(.+)$/);
    if (li && category) {
      map[li[1].trim()] = { category, zh: li[2].trim().replace(/。$/, "") };
    }
  }
  return map;
}

function main() {
  const readmeMap = parseReadme();
  const skills = [];
  for (const name of readdirSync(SKILLS_DIR).sort()) {
    const d = join(SKILLS_DIR, name);
    const sk = join(d, "SKILL.md");
    if (!existsSync(sk)) continue;
    const text = readFileSync(sk, "utf8");
    const fm = parseFrontmatter(text);
    const meta = readmeMap[name] || {};
    skills.push({
      name: fm.name || name,
      category: meta.category || "其他",
      zh: meta.zh || "",
      description: fm.description || "",
      allowedTools: fm["allowed-tools"] || "",
    });
  }
  const order = [];
  for (const s of skills) if (!order.includes(s.category)) order.push(s.category);
  writeFileSync(OUT, JSON.stringify({ total: skills.length, categories: order, skills }, null, 2), "utf8");
  console.log(`Wrote ${skills.length} skills across ${order.length} categories -> ${OUT}`);
}

main();
