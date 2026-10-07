import { readFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = "e:/Github/Agent-Skills-Hub";
const d = JSON.parse(readFileSync(ROOT + "/data/skills-data.json", "utf8"));
const others = d.skills.filter((s) => s.category === "其他");
console.log("OTHER_COUNT:", others.length);
for (const s of others) {
  const fp = join(ROOT, s.githubDir, "SKILL.md");
  const txt = readFileSync(fp, "utf8");
  const m = txt.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  const fm = m ? m[1] : "";
  const get = (k) => {
    const r = fm.match(new RegExp("^" + k + ":\\s*(.*)$", "m"));
    return r ? r[1].trim() : "<MISSING>";
  };
  console.log(
    s.name,
    "| fm.category=", get("category"),
    "| fm.en_category=", get("en_category"),
    "| fm.zh_displayName=", get("zh_displayName"),
    "| fm.description=", get("description").slice(0, 30)
  );
}
