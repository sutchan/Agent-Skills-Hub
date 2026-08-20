// build-skills-data.mjs v1.14.56
// 以磁盘 skills/<name>/SKILL.md 为唯一权威源，生成自包含 JSON 供静态 HTML 原型使用。
// 分类(category)与中文描述(zh)均来自各 SKILL.md 的 frontmatter，不再依赖 README。
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 脚本已移出 prototype/ 到仓库根目录；技能数据输出到仓库根 /data
const ROOT = __dirname;
const SKILLS_DIR = join(ROOT, "skills");
const OUT = join(ROOT, "data", "skills-data.json");

// 非技能目录（仓库内其他子项目/资产），构建时跳过
const EXCLUDE = new Set([".skills-manager", ".trae", "app", "brand", "data", "tools"]);

// 分类展示固定顺序（与 README 领域表一致）
const CATEGORY_ORDER = [
  "品牌与设计",
  "文档与内容",
  "数据分析与可视化",
  "开发框架与平台",
  "文件与格式处理",
];

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

function main() {
  const skills = [];
  for (const name of readdirSync(SKILLS_DIR).sort()) {
    if (EXCLUDE.has(name)) continue;
    const d = join(SKILLS_DIR, name);
    const sk = join(d, "SKILL.md");
    if (!existsSync(sk)) continue;
    const text = readFileSync(sk, "utf8");
    const fm = parseFrontmatter(text);
    const category = fm.category || "其他";
    skills.push({
      name: fm.name || name,
      category,
      zh: fm.zh || "",
      description: fm.description || "",
      allowedTools: normalizeTools(fm["allowed-tools"]),
    });
  }
  // 分类顺序：固定顺序在前，其余按出现顺序补在末尾
  const order = CATEGORY_ORDER.filter((c) => skills.some((s) => s.category === c));
  for (const s of skills) if (!order.includes(s.category)) order.push(s.category);
  skills.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  writeFileSync(OUT, JSON.stringify({ total: skills.length, categories: order, skills }, null, 2), "utf8");
  console.log(`Wrote ${skills.length} skills across ${order.length} categories -> ${OUT}`);
}

main();
