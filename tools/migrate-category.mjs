// migrate-category.mjs v1.20.17 — 将 74 个使用旧「开发框架与平台」分类的技能迁移到 13 类子类
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { CATEGORY_EN, CONTRACT_ORDER } from "./lib/taxonomy.mjs";

const ROOT = process.cwd();
const SKILLS = join(ROOT, "skills");

// 中文分类稳定键 -> 英文名（统一引用 tools/lib/taxonomy.mjs 的 CATEGORY_EN）
const EN = CATEGORY_EN;

// 手工校正映射（基于技能名语义，覆盖率 100%）
const MAP = {
  // 工程实践与质量
  "ads-creative": "文档与内容",
  "analyze-project": "工程实践与质量",
  "architecture-blueprint-generator": "工程实践与质量",
  "code-review": "工程实践与质量",
  "code-review-and-quality": "工程实践与质量",
  "codebase-design": "工程实践与质量",
  "debugging-and-error-recovery": "工程实践与质量",
  "diagnosing-bugs": "工程实践与质量",
  "executing-plans": "工程实践与质量",
  "implement-spec": "工程实践与质量",
  "openspec-implementation": "工程实践与质量",
  "paper-context-resolver": "工程实践与质量",
  "receiving-code-review": "工程实践与质量",
  "repo-intake-and-plan": "工程实践与质量",
  "requesting-code-review": "工程实践与质量",
  "setup-matt-pocock-skills": "工程实践与质量",
  "simplify": "工程实践与质量",
  "systematic-debugging": "工程实践与质量",
  "tdd": "工程实践与质量",
  "to-spec": "工程实践与质量",
  "write-tech-spec": "工程实践与质量",
  "writing-plans": "工程实践与质量",
  "improve-codebase-architecture": "工程实践与质量",
  // WordPress 与 CMS
  "blueprint": "WordPress 与 CMS",
  "wordpress-router": "WordPress 与 CMS",
  "wp-abilities-audit": "WordPress 与 CMS",
  "wp-abilities-verify": "WordPress 与 CMS",
  "wp-block-themes": "WordPress 与 CMS",
  "wp-patterns": "WordPress 与 CMS",
  "wp-performance": "WordPress 与 CMS",
  "wp-playground": "WordPress 与 CMS",
  "wp-plugin-development": "WordPress 与 CMS",
  "wp-plugin-directory-guidelines": "WordPress 与 CMS",
  // 移动端开发
  "dart-build-cli-app": "移动端开发",
  "dart-flutter-patterns": "移动端开发",
  "flutter-apply-architecture-best-practices": "移动端开发",
  "flutter-build-responsive-layout": "移动端开发",
  "flutter-dart-code-review": "移动端开发",
  "flutter-setup-localization": "移动端开发",
  "limrun-android-emulator": "移动端开发",
  "limrun-detox-testing": "移动端开发",
  "limrun-ios-simulator": "移动端开发",
  "limrun-xcode": "移动端开发",
  "limrun-xcode-bazel": "移动端开发",
  "uni-app": "移动端开发",
  // 后端与平台
  "bun": "后端与平台",
  "nestjs-best-practices": "后端与平台",
  "supabase-postgres-best-practices": "后端与平台",
  "fastify-best-practices": "后端与平台",
  "cloudbase": "后端与平台",
  "supabase": "后端与平台",
  "stripe-best-practices": "后端与平台",
  "php-pro": "后端与平台",
  // 前端开发
  "chrome-webstore-release-blueprint": "前端开发",
  "insforge-cli": "前端开发",
  "insforge-debug": "前端开发",
  "next-best-practices": "前端开发",
  "nextjs-code-review": "前端开发",
  "nextjs-react-typescript": "前端开发",
  "playwright-cli": "前端开发",
  "playwright-explore-website": "前端开发",
  "playwright-best-practices": "前端开发",
  "prototype": "前端开发",
  "react-doctor": "前端开发",
  "shadcn-ui": "前端开发",
  "vercel-composition-patterns": "前端开发",
  "vercel-react-best-practices": "前端开发",
  "vue-best-practices": "前端开发",
  "vue-debug-guides": "前端开发",
  "vue-pinia-best-practices": "前端开发",
  "vue-router-best-practices": "前端开发",
  "web-artifacts-builder": "前端开发",
  "winui-dev-workflow": "前端开发",
  // 自动化与集成
  "browser-automation": "自动化与集成",
};

function parseFm(fm) {
  const lines = fm.split("\n");
  const entries = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const idx = line.indexOf(":");
    if (idx === -1 || line.startsWith(" ")) { i++; continue; }
    const key = line.slice(0, idx).trim();
    const inlineVal = line.slice(idx + 1).trim();
    if (["|-", ">-", "|", ">"].includes(inlineVal)) {
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith(" ")) j++;
      entries.push({ key, value: lines.slice(i + 1, j).join("\n"), block: true });
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
for (const [dir, cat] of Object.entries(MAP)) {
  const fp = join(SKILLS, dir, "SKILL.md");
  if (!existsSync(fp)) { console.log("SKIP (missing):", dir); continue; }
  const t = readFileSync(fp, "utf8");
  const mFM = t.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!mFM) { console.log("SKIP (no fm):", dir); continue; }
  const entries = parseFm(mFM[1]);
  const mapByKey = new Map(entries.map((e) => [e.key, e]));
  const setOrAdd = (key, value) => {
    if (mapByKey.has(key)) mapByKey.get(key).value = value;
    else mapByKey.set(key, { key, value, block: false });
  };
  setOrAdd("category", cat);
  setOrAdd("en_category", EN[cat]);
  const contractEntries = CONTRACT_ORDER.map((k) => mapByKey.get(k)).filter(Boolean);
  const restEntries = entries.filter((e) => !CONTRACT_ORDER.includes(e.key));
  const ordered = [...contractEntries, ...restEntries];
  const newContent = t.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, `---\n${serialize(ordered)}\n---\n`);
  writeFileSync(fp, newContent, "utf8");
  updated++;
}
console.log("Updated:", updated);
