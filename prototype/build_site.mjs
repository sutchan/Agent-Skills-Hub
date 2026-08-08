#!/usr/bin/env node
// build_site.mjs — 读取 skills/*/SKILL.md 的 frontmatter 生成展示页数据 data/skills.json
// 路径: prototype/build_site.mjs 版本: 1.7.0
// 说明：与 build_site.py 逻辑 1:1 对齐，供无 Python 环境（如本机构建）使用。
//       npm run build 默认调用本文件；Python 环境下也可运行 build_site.py。
//
// 用法：
//   node build_site.mjs            # 生成 data/skills.json
//   node build_site.mjs --check    # CI 校验：已提交的 JSON 是否与最新生成一致

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const README = path.join(ROOT, "README.md");
const SKILLS_DIR = path.join(ROOT, "skills");
const OUT = path.join(ROOT, "prototype", "data", "skills.json");

const DEFAULT_REPO = "https://github.com/sutchan/Agent-Skills-Hub";

// 分类中文名 -> 英文显示名（与展示页原型保持一致；新增分类时在此补充）
const CAT_EN = {
  前端与UI设计: "Frontend & UI Design",
  "后端、语言与框架": "Backend, Languages & Frameworks",
  架构与设计: "Architecture & Design",
  测试与质量: "Testing & Quality",
  "Agent 与 AI 工程": "Agent & AI Engineering",
  "DevOps 与基础设施": "DevOps & Infrastructure",
  数据与机器学习: "Data & Machine Learning",
  "内容、文档与写作": "Content, Docs & Writing",
  视频与媒体: "Video & Media",
  行业领域: "Industry Domains",
  生产力与工具: "Productivity & Tools",
  上下文与提示工程: "Context & Prompt Engineering",
  其他: "Other",
};

function stripQuotes(val) {
  const s = val.trim();
  if (s.length >= 2 && s[0] === s[s.length - 1] && (s[0] === '"' || s[0] === "'")) {
    return s.slice(1, -1).trim();
  }
  return s;
}

function parseReadme() {
  const text = fs.readFileSync(README, "utf-8");
  const lines = text.split(/\r?\n/);
  const catMap = {};
  const zhDescMap = {};
  const order = [];
  let currentCat = null;
  const catRe = /^###\s+(.+?)(?:（(\d+)）)?$/;
  const itemRe = /^\s*-\s+\*\*\[([^\]]+)\]\(([^)]+)\)\*\*\s*[—-]\s*(.+)$/;
  for (const line of lines) {
    if (line.startsWith("### ") && !line.startsWith("## ")) {
      const m = catRe.exec(line);
      if (!m) continue;
      const name = m[1].trim();
      if (name === "目录" || name === "仓库结构") {
        currentCat = null;
        continue;
      }
      currentCat = name;
      if (!order.includes(currentCat)) order.push(currentCat);
      continue;
    }
    if (currentCat === null) continue;
    const im = itemRe.exec(line);
    if (im) {
      const skill = im[1].trim();
      const desc = im[3].trim().replace(/[。\s]+$/, "");
      catMap[skill] = currentCat;
      zhDescMap[skill] = desc;
    }
  }
  return { order, catMap, zhDescMap };
}

function readSkillMeta(skillDir) {
  const skillPath = path.join(SKILLS_DIR, skillDir);
  if (!fs.statSync(skillPath, { throwIfNoEntry: false })?.isDirectory())
    return null;
  const skillMd = path.join(skillPath, "SKILL.md");
  if (!fs.existsSync(skillMd)) return null;
  const content = fs.readFileSync(skillMd, "utf-8");
  const meta = {
    en_name: skillDir,
    en_desc: "",
    name: skillDir,
    category: "",
  };
  const m = /^---\s*\n([\s\S]*?)\n---/.exec(content);
  if (m) {
    const fm = m[1];
    for (const key of ["name", "description", "category"]) {
      const km = new RegExp(`^${key}:\\s*(.+)$`, "m").exec(fm);
      if (km) {
        const val = stripQuotes(km[1]);
        meta[key === "description" ? "en_desc" : key] = val;
      }
    }
  }
  meta.has_scripts = fs.existsSync(path.join(skillPath, "scripts"));
  meta.has_references = fs.existsSync(path.join(skillPath, "references"));
  meta.has_assets = fs.existsSync(path.join(skillPath, "assets"));
  meta.dir = skillDir;
  return meta;
}

function parseReadmeMeta() {
  const lines = fs.readFileSync(README, "utf-8").split(/\r?\n/).slice(0, 15);
  const meta = { author: "", repo: "" };
  for (const line of lines) {
    const am = /作者[：:]\s*(.+)/.exec(line);
    if (am) meta.author = am[1].trim();
    const rm = /项目地址[：:]\s*(\S+)/.exec(line);
    if (rm) meta.repo = rm[1].trim();
  }
  return meta;
}

function buildData() {
  const readmeMeta = parseReadmeMeta();
  const { order, catMap, zhDescMap } = parseReadme();

  const skills = [];
  const seen = new Set();
  for (const entry of fs.readdirSync(SKILLS_DIR).sort()) {
    const skillPath = path.join(SKILLS_DIR, entry);
    if (!fs.statSync(skillPath, { throwIfNoEntry: false })?.isDirectory())
      continue;
    if (!fs.existsSync(path.join(skillPath, "SKILL.md"))) continue;
    if (seen.has(entry)) continue;
    seen.add(entry);
    const sm = readSkillMeta(entry);
    if (!sm) continue;
    if (!sm.category) sm.category = catMap[entry] || "其他";
    sm.zh_desc = zhDescMap[entry] || "";
    skills.push(sm);
  }

  const catCounts = {};
  for (const s of skills)
    catCounts[s.category] = (catCounts[s.category] || 0) + 1;
  const orderedCats = order.filter((c) => c in catCounts);
  for (const c of Object.keys(catCounts)) if (!orderedCats.includes(c)) orderedCats.push(c);

  const categories = orderedCats.map((c) => ({
    name: c,
    en: CAT_EN[c] || c,
    count: catCounts[c],
  }));

  return {
    meta: {
      title: "Agent Skills Hub",
      title_zh: "Agent Skills Hub · 技能中心",
      subtitle: "面向开发、设计、测试、DevOps、Agent 工程及各行业领域的 AI 技能集合",
      author: readmeMeta.author,
      repo: readmeMeta.repo || DEFAULT_REPO,
      count: skills.length,
      generated_at: new Date().toISOString().replace(/\.\d+Z$/, ""),
    },
    categories,
    skills,
  };
}

function normalize(d) {
  return {
    meta: Object.fromEntries(
      Object.entries(d.meta).filter(([k]) => k !== "generated_at")
    ),
    categories: d.categories,
    skills: d.skills,
  };
}

function main() {
  const checkMode = process.argv.includes("--check");
  const data = buildData();

  if (checkMode) {
    if (!fs.existsSync(OUT)) {
      console.error("ERROR: 未找到已提交的 data/skills.json，请先运行 build_site.mjs 生成。");
      process.exit(1);
    }
    const existing = JSON.parse(fs.readFileSync(OUT, "utf-8"));
    if (JSON.stringify(normalize(existing)) !== JSON.stringify(normalize(data))) {
      console.error("ERROR: data/skills.json 与最新 skills/ 不一致，请运行 build_site.mjs 重新生成。");
      process.exit(1);
    }
    console.log(
      `OK: data/skills.json 已是最新（${data.skills.length} 个技能，${data.categories.length} 个分类）。`
    );
    return;
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2), "utf-8");
  console.log(`已生成 ${OUT}`);
  console.log(`技能总数: ${data.skills.length}  分类数: ${data.categories.length}`);
}

main();
