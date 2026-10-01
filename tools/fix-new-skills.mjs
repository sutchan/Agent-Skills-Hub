// fix-new-skills.mjs v1.20.28 — 补全会话间新增的 4 个缺契约字段技能（category/en_category/zh_displayName/en_description）
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { CATEGORY_EN, CONTRACT_ORDER } from "./lib/taxonomy.mjs";

const ROOT = process.cwd();
const SKILLS = join(ROOT, "skills");
// 中文分类稳定键 -> 英文名（统一引用 tools/lib/taxonomy.mjs 的 CATEGORY_EN）
const EN = CATEGORY_EN;

const MAP = {
  "disk-cleaner": {
    cat: "自动化与集成",
    zh: "Mac 磁盘清理助手",
    en: "Mac intelligent disk cleanup assistant — a user-friendly wrapper around Mole (https://github.com/tw93/Mole) for safe, guided removal of large and stale files.",
  },
  "lark-meeting": {
    cat: "自动化与集成",
    zh: "飞书视频会议",
    en: "Feishu (Lark) video meetings: query meeting records and artifacts (minutes / transcripts / smart notes), search / upload / download / edit smart notes, invite bots to meetings; query in-progress meetings and answer questions about live meeting content (speech / chat / shared docs) via meeting_id, meeting_no, event_id, note_id, minute_token, vc-node-id or smart-note URL. Scheduling, free-busy and room management go to lark-calendar.",
  },
  "nodejs-backend-patterns": {
    cat: "后端与平台",
    zh: "Node.js 后端模式",
    en: "Build production-ready Node.js backend services with Express/Fastify, implementing middleware patterns, error handling, authentication, database integration, and API design best practices. Use when creating Node.js servers, REST APIs, GraphQL backends, or microservices architectures.",
  },
  "opc-mvp-designer": {
    cat: "工程实践与质量",
    zh: "一人公司 MVP 设计",
    en: "Define the smallest viable experiment and MVP for a selected one-person company opportunity. Use when Codex needs to explain what MVP means when needed, verify prerequisites, ask one question at a time, present multiple MVP options, and write user-confirmed outputs into opc-doc/.",
  },
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
for (const [dir, m] of Object.entries(MAP)) {
  const fp = join(SKILLS, dir, "SKILL.md");
  if (!existsSync(fp)) { console.log("SKIP (missing):", dir); continue; }
  const t = readFileSync(fp, "utf8");
  const mFM = t.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!mFM) { console.log("SKIP (no fm):", dir); continue; }
  const entries = parseFm(mFM[1]);
  const mapByKey = new Map(entries.map((e) => [e.key, e]));
  const setOrAdd = (key, value, block) => {
    if (mapByKey.has(key)) { mapByKey.get(key).value = value; mapByKey.get(key).block = block; }
    else mapByKey.set(key, { key, value, block });
  };
  setOrAdd("zh_displayName", m.zh, false);
  setOrAdd("category", m.cat, false);
  setOrAdd("en_category", EN[m.cat], false);
  setOrAdd("en_description", m.en, true);

  const contractEntries = CONTRACT_ORDER.map((k) => mapByKey.get(k)).filter(Boolean);
  const restEntries = entries.filter((e) => !CONTRACT_ORDER.includes(e.key));
  const ordered = [...contractEntries, ...restEntries];
  const newContent = t.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, `---\n${serialize(ordered)}\n---\n`);
  writeFileSync(fp, newContent, "utf8");
  updated++;
  console.log("OK:", dir, "-> cat=" + m.cat);
}
console.log("Updated:", updated);
