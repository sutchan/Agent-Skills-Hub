// build-skills-data.mjs v1.14.53
// 从磁盘真实技能数据生成自包含 JSON，供静态 HTML 原型使用。
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 脚本已移出 prototype/ 到仓库根目录；技能数据输出到仓库根 /data
const ROOT = __dirname;
const SKILLS_DIR = join(ROOT, "skills");
const README = join(ROOT, "README.md");
const OUT = join(ROOT, "data", "skills-data.json");

// YAML 折叠/字面量块标量标志（行内为空值或仅折叠符）
const BLOCK_SCALAR = /^(?:[>|])-?$/;
// 行内值在保留时去除的 YAML 注释（仅当注释前为空格/行首）
function stripInlineComment(v) {
  // 去掉行内 YAML 注释：` # ...`，但忽略引号内的井号
  const out = [];
  let inS = false;
  let inD = false;
  for (let i = 0; i < v.length; i++) {
    const c = v[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (c === "#" && !inS && !inD && (i === 0 || v[i - 1] === " ")) break;
    out.push(c);
  }
  return out.join("").trim();
}

// 解析 frontmatter：支持纯量、引号、以及折叠（> / >-）与字面量（| / |-）块标量。
// 块标量内容取后续缩进行，统一折叠为单个空格连接的字符串。
function parseFrontmatter(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  const fm = {};
  if (!m) return fm;
  const lines = m[1].split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const idx = line.indexOf(":");
    if (idx === -1) {
      i++;
      continue;
    }
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // 若是块标量标志，读取后续缩进行
    if (BLOCK_SCALAR.test(val)) {
      i++;
      const block = [];
      while (i < lines.length && (lines[i].trim() === "" || lines[i].startsWith(" "))) {
        block.push(lines[i]);
        i++;
      }
      // 折叠连续空行，行内首尾空格归一；折叠标量 / 字面量统一以空格连接
      fm[key] = block
        .map((l) => l.replace(/^\s+/, "").replace(/\s+$/, ""))
        .filter((l, j, arr) => !(l === "" && (j === 0 || arr[j - 1] === "")))
        .join(" ")
        .trim();
      continue;
    }
    // 普通纯量 / 引号
    val = stripInlineComment(val).replace(/^["']|["']$/g, "");
    fm[key] = val;
    i++;
  }
  return fm;
}

// 将 allowed-tools 规范为字符串数组：YAML 列表已为数组则清洗，逗号分隔字符串则 split
function normalizeTools(raw) {
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
  return String(raw || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
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
      allowedTools: normalizeTools(fm["allowed-tools"]),
    });
  }
  const order = [];
  for (const s of skills) if (!order.includes(s.category)) order.push(s.category);
  writeFileSync(OUT, JSON.stringify({ total: skills.length, categories: order, skills }, null, 2), "utf8");
  console.log(`Wrote ${skills.length} skills across ${order.length} categories -> ${OUT}`);
}

main();
