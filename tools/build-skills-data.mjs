// build-skills-data.mjs v1.20.28 — 解析 skills/<name>/SKILL.md 顶层 frontmatter → data/skills-data.json
// 以磁盘 skills/<name>/SKILL.md 为唯一权威源，生成自包含 JSON 供静态 HTML 原型使用。
// 分类(category)、简短中文名称(zh_displayName)与 description 中文译文均来自各 SKILL.md 的 frontmatter，不再依赖 README。
// 注意语义约定：zh 为「简短中文名称」（卡片标题），zh-desc 为「中文描述」（卡片描述区）；勿将描述句填入 zh。
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
// 共享分类法与契约定义（单一权威源，消除契约漂移）
import { CATEGORY_ORDER, CATEGORY_EN } from "./lib/taxonomy.mjs";
// 共享手写 frontmatter 解析（与 validate-skills.mjs 等统一，消除解析漂移）
import { parseFrontmatter, stripInlineComment, BLOCK_SCALAR } from "./lib/frontmatter.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 脚本位于 tools/ 子目录；ROOT 上提一级为仓库根
const ROOT = dirname(__dirname);
const SKILLS_DIR = join(ROOT, "skills");
const OUT = join(ROOT, "data", "skills-data.json");
// 频繁更新的派生指标（popularity/size/files/stars/firstSeen/skillVersion）独立存储，
// 避免每次重算指标时重写整个主数据文件（含长 description）。以 name 为 key 的 map。
const METRICS_OUT = join(ROOT, "data", "skills-metrics.json");

// 非技能目录（仓库内其他子项目/资产），构建时跳过
const EXCLUDE = new Set([".skills-manager", ".trae", "app", "brand", "data", "tools"]);

// 功能标签（tags）词表：基于技能 description/enDescription/category 关键词自动派生（v1.20.12）
// 每个标签含 slug（data 存储键）、中英显示名、命中正则。deriveTags 输出 slug 数组（每个技能 1-3 个）。
// 作为分类（9 大领域）之下的细化主题，供原型/app 渲染第二组筛选 chip，扩充可筛选 tag 数量。
const TAG_DEFS = [
  { slug: "ai-agent", zh: "AI 与智能体", en: "AI & Agents", re: /ai|llm|agent|gpt|claude|gemini|prompt|rag|embedding|大模型|智能体|提示词|chatbot/i },
  { slug: "cli", zh: "命令行", en: "CLI", re: /cli|command[\s-]?line|terminal|shell|命令行|终端|bash/i },
  { slug: "web-frontend", zh: "Web 前端", en: "Web & Frontend", re: /web|html|css|react|next\.?js|vue|frontend|前端|网页|browser/i },
  { slug: "doc-writing", zh: "文档写作", en: "Docs & Writing", re: /doc|document|markdown|writing|文档|写作|文章|report|README|文案/i },
  { slug: "data", zh: "数据", en: "Data", re: /spreadsheet|excel|xlsx|csv|tsv|表格|数据|data analysis|数据可视化|database|sql|postgres|mysql|sqlite|mongo|supabase/i },
  { slug: "pdf", zh: "PDF", en: "PDF", re: /\bpdf\b/i },
  { slug: "design-media", zh: "设计 & 媒体", en: "Design & Media", re: /image|svg|logo|icon|海报|figma|设计|图片|audio|video|music|voice|语音|音频|视频|media|字幕|tts|语音合成|animation|动画/i },
  { slug: "test-qa", zh: "测试质量", en: "Testing & QA", re: /test|testing|qa\b|quality|测试|质量|lint|审查|review/i },
  { slug: "devops", zh: "部署运维", en: "DevOps", re: /deploy|ci\/cd|devops|docker|kubernetes|vercel|部署|运维|服务器|nginx/i },
  { slug: "security", zh: "安全", en: "Security", re: /security|secur|安全|vulnerab|漏洞|加密|加密|密钥|token/i },
  { slug: "automation", zh: "自动化", en: "Automation", re: /automation|workflow|automate|自动化|流程|定时|schedule/i },
  { slug: "wordpress", zh: "WordPress", en: "WordPress", re: /wordpress|\bwp\b|cms|插件|plugin/i },
  { slug: "i18n", zh: "翻译多语", en: "i18n & Translate", re: /translate|translation|i18n|l10n|翻译|多语言|本地化|国际化/i },
  { slug: "scraping", zh: "爬虫抓取", en: "Scraping", re: /scrap|scrape|crawl|爬虫|抓取|采集|spider/i },
];

// 由技能文本派生功能标签 slug 数组（1-3 个）：命中即收集，最多 3 个避免标签爆炸
function deriveTags(fm, category) {
  const text = `${fm.description || ""} ${fm.en_description || ""} ${category || ""}`;
  const hits = [];
  for (const t of TAG_DEFS) {
    if (t.re.test(text)) hits.push(t.slug);
    if (hits.length >= 3) break;
  }
  return hits;
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
  // 频繁更新指标独立存储：以 name 为 key 的 map（popularity/size/files/stars/firstSeen/skillVersion）
  const metrics = {};
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
    // 社区指标（用户决策：本地 frontmatter 维护，skills.sh 无 STAR/firstSeen 字段且 API 需认证）
    // stars：GitHub 星标数（仓库级，发布者自行维护）；firstSeen：首次发布/收录日期（YYYY-MM-DD）
    const stars = meta.stars != null ? Number(meta.stars) || 0 : undefined;
    const firstSeen = meta.firstSeen || fm.firstSeen || "";
    // 安装命令：统一指向本 GitHub 仓库目录（npx skills add <owner>/<repo>/skills/<name>）
    const installCommand = `npx skills add sutchan/Agent-Skills-Hub/skills/${name}`;
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
    // 频繁更新指标：构建时计算，存入独立 metrics 文件（以 name 为 key）
    const skillName = fm.name || name;
    const skillMetrics = {
      popularity: 0,
      size,
      files,
      stars: stars != null ? stars : undefined,
      firstSeen: firstSeen || undefined,
      skillVersion: skillVersion || undefined,
    };
    metrics[skillName] = skillMetrics;
    skills.push({
      name: fm.name || name,
      category,
      // 英文分类名：英文态展示（frontmatter en_category）
      enCategory: fm.en_category || CATEGORY_EN[category] || category,
      // 中文显示名：优先 zh_displayName（磁盘实际字段），回退旧 zh / name
      zh: fm.zh_displayName || fm.zh || "",
      // 默认展示语言为中文：description 存中文（由原 zh-desc 提升），enDescription 存英文（由原 description 迁移）
      description: fm.description || "",
      enDescription: fm.en_description || "",
      // 来源网址：兼容 homepage / source / url / website 多键（详情弹窗外链展示）
      homepage: fm.homepage || fm.source || fm.url || fm.website || "",
      allowedTools: normalizeTools(fm["allowed-tools"]),
      // 功能标签：基于描述/分类关键词自动派生（v1.20.12），供第二组筛选 chip 使用
      tags: deriveTags(fm, category),
      hidden: fm.hidden === true || fm.hidden === "true",
      // 详情元信息（可选，缺失则不展示）
      author: author || undefined,
      license: license || undefined,
      installCommand,
      githubDir,
    });
  }
  // 热度（popularity）：被其他技能在 description 中提及本技能名的次数（相关性代理）
  const allNames = skills.map((s) => s.name);
  // 频繁更新指标独立存储：以 name 为 key 的 map（已在 main 开头声明）
  for (const s of skills) {
    const hay = (s.description + " " + s.enDescription).toLowerCase();
    let pop = 0;
    for (const n of allNames) {
      if (n === s.name) continue;
      if (hay.includes(n)) pop++;
    }
    // 指标只写入 metrics 文件，主数据不含频繁更新字段（减少大文件重写）
    metrics[s.name] = { ...(metrics[s.name] || {}), popularity: pop };
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
  writeFileSync(METRICS_OUT, JSON.stringify(metrics, null, 2), "utf8");
  console.log(`Wrote ${skills.length} skills across ${order.length} categories -> ${OUT}`);
  console.log(`Wrote metrics (popularity/size/files/stars/firstSeen/skillVersion) -> ${METRICS_OUT}`);
}

main();
