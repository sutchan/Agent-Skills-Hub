// fix-skill-meta.mjs v1.20.17 — 补全缺契约字段的技能 + prototype 重复导入去重（唯一 name）+ 字段顺序重排
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { CONTRACT_ORDER } from "./lib/taxonomy.mjs";

const ROOT = process.cwd();
const SKILLS = join(ROOT, "skills");

// 预置映射：dir -> { name(唯一), zh_displayName, category(中文13类), en_category, en_description }
const MAP = {
  "agent-browser": {
    name: "agent-browser",
    zh_displayName: "浏览器自动化",
    category: "自动化与集成",
    en_category: "Automation & Integration",
    en_description:
      "Browser automation CLI for AI agents. Use when the user needs to interact with websites, including navigating pages, filling forms, clicking buttons, taking screenshots, extracting data, testing web apps, or automating any browser task.",
  },
  eve: {
    name: "eve",
    zh_displayName: "Eve 后端智能体框架",
    category: "后端与平台",
    en_category: "Backend & Platform",
    en_description:
      "Build durable backend AI agents with the eve framework. Use when creating, editing, or debugging an eve project — agent instructions, skills, tools, connections, channels, sandboxes, subagents, schedules, or evals.",
  },
  "google-mobile-ads-banner": {
    name: "google-mobile-ads-banner",
    zh_displayName: "Google 移动广告横幅",
    category: "移动端开发",
    en_category: "Mobile Dev",
    en_description:
      "Provides instructions to implement, integrate, or configure Google Mobile Ads (GMA) banner ads in Android, iOS, or Unity mobile applications.",
  },
  "html-design-prototypes": {
    name: "html-design-prototypes",
    zh_displayName: "HTML 设计原型",
    category: "前端开发",
    en_category: "Frontend Dev",
    en_description:
      "Create real HTML prototypes for visual design, component playgrounds, animation tuning, and design system exploration when comparing UI variants, before production code.",
  },
  "nextjs-app-router-patterns": {
    name: "nextjs-app-router-patterns",
    zh_displayName: "Next.js App Router 模式",
    category: "前端开发",
    en_category: "Frontend Dev",
    en_description:
      "Master Next.js 14+ App Router with Server Components, streaming, parallel routes, and advanced data fetching. Use when building Next.js applications or optimizing React Server Components.",
  },
  "persona-project-manager": {
    name: "persona-project-manager",
    zh_displayName: "人格化项目管理",
    category: "自动化与集成",
    en_category: "Automation & Integration",
    en_description:
      "Coordinate projects — track tasks, schedule meetings, and share docs across Google Workspace integrations.",
  },
  "project-workflow-analysis-blueprint-generator": {
    name: "project-workflow-analysis-blueprint-generator",
    zh_displayName: "项目工作流蓝图生成",
    category: "工程实践与质量",
    en_category: "Engineering Practice & Quality",
    en_description:
      "Technology-agnostic prompt generator for documenting end-to-end application workflows, auto-detecting architecture, stacks, and data flow to produce implementation blueprints.",
  },
  "prototype-2": {
    name: "prototype-ui-variants",
    zh_displayName: "UI 多版本原型选择器",
    category: "前端开发",
    en_category: "Frontend Dev",
    en_description:
      "Build multiple genuinely different versions of a UI piece you describe, rendered behind a visual picker so you can flip through them live and promote the one that feels right.",
  },
  "prototype-3": {
    name: "prototype-design-explore",
    zh_displayName: "设计探索原型",
    category: "前端开发",
    en_category: "Frontend Dev",
    en_description:
      "Build a one-off prototype to answer a design question — verify whether a state model or logic feels right, or explore what the UI should look like.",
  },
  "prototype-4": {
    name: "prototype-stardust",
    zh_displayName: "Stardust 页面重构原型",
    category: "前端开发",
    en_category: "Frontend Dev",
    en_description:
      "Render a proposed redesign of a page as a self-contained static HTML file, then iterate via the craft loop. Use for redesign previews, before/after comparisons, or /stardust:prototype.",
  },
  "redesign-existing-projects": {
    name: "redesign-existing-projects",
    zh_displayName: "网站应用重构升级",
    category: "品牌与设计",
    en_category: "Brand & Design",
    en_description:
      "Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality.",
  },
  "short-drama-storyboard": {
    name: "short-drama-storyboard",
    zh_displayName: "短剧分镜设计",
    category: "音视频与多媒体",
    en_category: "Media & Multimedia",
    en_description:
      "Write storyboard Markdown for Chinese short dramas with dramatic roles, continuity boundaries, and frozen keyframe prompts. Use for shot breakdowns, camera blocking, or keyframe prompts.",
  },
  "short-drama-video-prompts": {
    name: "short-drama-video-prompts",
    zh_displayName: "短剧视频提示词",
    category: "音视频与多媒体",
    en_category: "Media & Multimedia",
    en_description:
      "Convert short-drama storyboards and frozen keyframes into copy-ready video generation prompts, plus optional scoring/theme intent. Use for text-to-video or image-to-video prompts.",
  },
  "short-drama-write": {
    name: "short-drama-write",
    zh_displayName: "短剧剧本编写",
    category: "音视频与多媒体",
    en_category: "Media & Multimedia",
    en_description:
      "Write or revise shootable Chinese short-drama / comic episode scripts, and normalize provided scripts while preserving the author's original wording.",
  },
  traceknot: {
    name: "traceknot",
    zh_displayName: "Traceknot QA 流程",
    category: "工程实践与质量",
    en_category: "Engineering Practice & Quality",
    en_description:
      "Apply Traceknot's ISTQB-aligned, evidence-bound QA process to repository changes, including session-scoped QA Board publication for implementation verification and release checks.",
  },
  "woocommerce-backend-dev": {
    name: "woocommerce-backend-dev",
    zh_displayName: "WooCommerce 后端开发",
    category: "WordPress 与 CMS",
    en_category: "WordPress & CMS",
    en_description:
      "Add or modify WooCommerce backend PHP code following project conventions. Use when creating classes, methods, hooks, or modifying existing backend code.",
  },
};

// 解析 frontmatter 顶层键值（支持 |- / >- 块标量）
function parseFm(fm) {
  const lines = fm.split("\n");
  const entries = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const idx = line.indexOf(":");
    if (idx === -1 || line.startsWith(" ")) {
      i++;
      continue;
    }
    const key = line.slice(0, idx).trim();
    const inlineVal = line.slice(idx + 1).trim();
    // 块标量指示符
    if (inlineVal === "|-" || inlineVal === ">-" || inlineVal === "|" || inlineVal === ">") {
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith(" ")) j++;
      const blockLines = lines.slice(i + 1, j);
      entries.push({ key, value: blockLines.join("\n"), block: true });
      i = j;
    } else {
      entries.push({ key, value: inlineVal, block: false });
      i++;
    }
  }
  return entries;
}

function serialize(entries) {
  return entries
    .map((e) => {
      if (e.block) {
        const bl = e.value.split("\n").map((l) => (l === "" ? "" : "  " + l)).join("\n");
        return `${e.key}: |-\n${bl}`;
      }
      return `${e.key}: ${e.value}`;
    })
    .join("\n");
}

let updated = 0;
for (const [dir, m] of Object.entries(MAP)) {
  const fp = join(SKILLS, dir, "SKILL.md");
  if (!existsSync(fp)) {
    console.log("SKIP (missing):", dir);
    continue;
  }
  let t = readFileSync(fp, "utf8");
  const mFM = t.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!mFM) {
    console.log("SKIP (no fm):", dir);
    continue;
  }
  const entries = parseFm(mFM[1]);
  const mapByKey = new Map(entries.map((e) => [e.key, e]));

  // 更新/新增契约字段
  const setOrAdd = (key, value, block) => {
    if (mapByKey.has(key)) {
      mapByKey.get(key).value = value;
      mapByKey.get(key).block = block;
    } else {
      mapByKey.set(key, { key, value, block });
    }
  };
  setOrAdd("name", m.name, false);
  setOrAdd("zh_displayName", m.zh_displayName, false);
  setOrAdd("category", m.category, false);
  setOrAdd("en_category", m.en_category, false);
  const enBlock = m.en_description.split("\n").map((l) => (l === "" ? "" : l)).join("\n");
  setOrAdd("en_description", enBlock, true);

  // 重排：契约字段在前（按 CONTRACT_ORDER），其余原字段随后
  const contractEntries = CONTRACT_ORDER.map((k) => mapByKey.get(k)).filter(Boolean);
  const restEntries = entries.filter((e) => !CONTRACT_ORDER.includes(e.key));
  const ordered = [...contractEntries, ...restEntries];

  const newFm = serialize(ordered);
  const newContent = t.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, `---\n${newFm}\n---\n`);
  writeFileSync(fp, newContent, "utf8");
  updated++;
  console.log("OK:", dir, "-> name=" + m.name, "| cat=" + m.category);
}
console.log("\nUpdated:", updated);
