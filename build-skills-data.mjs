// build-skills-data.mjs v1.19.16
// 以磁盘 skills/<name>/SKILL.md 为唯一权威源，生成自包含 JSON 供静态 HTML 原型使用。
// 分类(category)、简短中文名称(zh)与 description 中文译文(zh-desc)均来自各 SKILL.md 的 frontmatter，不再依赖 README。
// 注意语义约定：zh 为「简短中文名称」（卡片标题），zh-desc 为「中文描述」（卡片描述区）；勿将描述句填入 zh。
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from "node:fs";
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
  "自动化与集成",
  "AI 与智能体",
  "音视频与多媒体",
  "安全",
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
// 块标量内容取后续缩进行；折叠标量段内换行折叠为空格、空行分隔的段落保留换行，
// 字面量标量保留所有换行——便于多段中文描述（zh-desc）在产物/展示中正确换行。
function parseFrontmatter(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  const fm = {};
  if (!m) return fm;
  const lines = m[1].split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const idx = line.indexOf(":");
    // 仅处理顶层键（行首无缩进）；嵌套块（有缩进）整体跳过
    if (idx === -1 || line.startsWith(" ")) {
      i++;
      continue;
    }
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // 若是块标量标志，读取后续缩进行
    if (BLOCK_SCALAR.test(val)) {
      const literal = val.startsWith("|"); // | 字面量保留换行；> 折叠按空行分段
      i++;
      const block = [];
      while (i < lines.length && (lines[i].trim() === "" || lines[i].startsWith(" "))) {
        block.push(lines[i]);
        i++;
      }
      // 行内首尾空格归一，过滤头部连续空行
      const norm = block
        .map((l) => l.replace(/^\s+/, "").replace(/\s+$/, ""))
        .filter((l, j, arr) => !(l === "" && (j === 0 || arr[j - 1] === "")));
      if (literal) {
        // 字面量：保留换行，折叠连续空行
        fm[key] = norm.filter((l, j, arr) => !(l === "" && arr[j + 1] === "")).join("\n").trim();
      } else {
        // 折叠标量：段内（连续非空行）以空格连接；空行视为段落分隔 → 换行
        const paras = [];
        let cur = [];
        for (const l of norm) {
          if (l === "") { if (cur.length) { paras.push(cur.join(" ")); cur = []; } }
          else cur.push(l);
        }
        if (cur.length) paras.push(cur.join(" "));
        fm[key] = paras.join("\n").trim();
      }
      continue;
    }
    // 普通纯量 / 引号（顶层键，无后续缩进子块）
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
    // 元信息：作者 / 协议 / 版本（来自 metadata.author / metadata.license / metadata.version，回退顶层）
    const meta = fm.metadata && typeof fm.metadata === "object" ? fm.metadata : {};
    const author = meta.author || fm.author || "";
    const license = meta.license || fm.license || "";
    const skillVersion = meta.version || fm.version || "";
    // GitHub 目录恒定派生（仓库 skills/<name>），详情弹窗可跳转源码
    const githubDir = `skills/${name}`;
    // 派生指标：目录大小（字节）/ 文件数（递归统计普通文件）
    let size = 0;
    let files = 0;
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (entry.isFile()) {
          try { size += statSync(p).size; files++; } catch { /* 忽略不可读 */ }
        }
      }
    };
    try { walk(d); } catch { /* 忽略 */ }
    skills.push({
      name: fm.name || name,
      category,
      // 英文分类名：英文态展示（frontmatter en_category）
      enCategory: fm.en_category || category,
      zh: fm.zh || "",
      // 默认展示语言为中文：description 存中文（由原 zh-desc 提升），enDescription 存英文（由原 description 迁移）
      description: fm.description || "",
      enDescription: fm.en_description || "",
      allowedTools: normalizeTools(fm["allowed-tools"]),
      hidden: fm.hidden === true || fm.hidden === "true",
      // 详情元信息（可选，缺失则不展示）
      author: author || undefined,
      license: license || undefined,
      skillVersion: skillVersion || undefined,
      githubDir,
      // 派生展示指标
      size,
      files,
    });
  }
  // 热度（popularity）：被其他技能在 description 中提及本技能名的次数（相关性代理）
  const allNames = skills.map((s) => s.name);
  for (const s of skills) {
    const hay = (s.description + " " + s.enDescription).toLowerCase();
    let pop = 0;
    for (const n of allNames) {
      if (n === s.name) continue;
      if (hay.includes(n)) pop++;
    }
    s.popularity = pop;
  }
  // 分类顺序：固定顺序在前，其余按出现顺序补在末尾
  const order = CATEGORY_ORDER.filter((c) => skills.some((s) => s.category === c));
  for (const s of skills) if (!order.includes(s.category)) order.push(s.category);
  skills.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  const total = skills.filter((s) => !s.hidden).length;
  // 分类中文名 -> 英文名映射（英文态 chip/展示用；中文 category 为稳定键）
  const categoryEn = {};
  for (const s of skills) categoryEn[s.category] = s.enCategory;
  writeFileSync(OUT, JSON.stringify({ total, categories: order, categoryEn, skills }, null, 2), "utf8");
  console.log(`Wrote ${skills.length} skills across ${order.length} categories -> ${OUT}`);
}

main();
