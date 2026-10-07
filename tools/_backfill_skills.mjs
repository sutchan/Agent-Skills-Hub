// tools/_backfill_skills.mjs — 临时回填脚本（用完即删）
// 以 git HEAD 旧 data/skills-data.json 的中文映射为权威源，结合 SKILL.md 现有英文 description，
// 补全缺失契约字段(en_description/zh_displayName/category/en_category)、修正 name 与目录名一致、
// 并把英文 description 迁移到 en_description、中文短描述用旧 data，最后按 CONTRACT_ORDER 重排。
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { CONTRACT_ORDER } from "./lib/taxonomy.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const SKILLS = join(ROOT, "skills");

const oldData = JSON.parse(execSync("git show HEAD:data/skills-data.json", { cwd: ROOT }).toString());
const oldMap = new Map(oldData.skills.map((s) => [s.name, s]));

const hasCJK = (s) => /[㐀-鿿]/.test(s || "");

// 解析 frontmatter 顶层键值（保留顺序，支持 |- / >- 块标量）
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
const dirs = require("node:fs").readdirSync(SKILLS).filter(
  (d) => /^[a-z0-9-]+$/.test(d) && existsSync(join(SKILLS, d, "SKILL.md"))
);

for (const dir of dirs) {
  const fp = join(SKILLS, dir, "SKILL.md");
  const txt = readFileSync(fp, "utf8");
  const m = txt.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) continue;
  const entries = parseFm(m[1]);
  const mapByKey = new Map(entries.map((e) => [e.key, e]));
  const curName = mapByKey.get("name")?.value || dir;
  const oldEntry = oldMap.get(curName) || oldMap.get(dir);
  if (!oldEntry) { console.log("SKIP (no old map):", dir); continue; }

  const curDesc = mapByKey.get("description")?.value || "";
  // 中文短描述：已有中文则保留，否则用旧 data 中文
  const zhDesc = hasCJK(curDesc) ? curDesc : oldEntry.description || curDesc;
  // 英文场景描述：已有 en_description 则保留，否则复用现有英文 description
  const enDesc = (mapByKey.get("en_description")?.value || "").trim() || curDesc;

  const setOrAdd = (key, value, block) => {
    if (mapByKey.has(key)) { mapByKey.get(key).value = value; mapByKey.get(key).block = block; }
    else mapByKey.set(key, { key, value, block });
  };
  setOrAdd("name", dir, false);
  setOrAdd("description", zhDesc, false);
  setOrAdd("en_description", enDesc, true);
  setOrAdd("zh_displayName", oldEntry.zh || dir, false);
  setOrAdd("category", oldEntry.category || "其他", false);
  setOrAdd("en_category", oldEntry.enCategory || oldEntry.category, false);

  const ordered = [
    ...CONTRACT_ORDER.map((k) => mapByKey.get(k)).filter(Boolean),
    ...entries.filter((e) => !CONTRACT_ORDER.includes(e.key)),
  ];
  const newContent = txt.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, `---\n${serialize(ordered)}\n---\n`);
  writeFileSync(fp, newContent, "utf8");
  updated++;
}
console.log("回填并更新:", updated, "个 SKILL.md");
