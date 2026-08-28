// tools/_css_overlap.mjs — 临时诊断：比对 prototype 四模块选择器 与 app globals.css 选择器交集
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);

function selectorsOf(css) {
  const rules = css.match(/}[^{]*\{/g) || [];
  const set = new Set();
  for (const r of rules) {
    const sel = r.replace(/}\}$/, "").replace(/^\}/, "").trim();
    sel.split(",").forEach((s) => {
      const t = s.trim();
      if (t && !t.startsWith("@") && !t.startsWith("/*") && !t.startsWith("*")) set.add(t);
    });
  }
  return set;
}

const app = readFileSync(join(ROOT, "app", "globals.css"), "utf8");
const aSet = selectorsOf(app);
const mods = ["base.css", "layout.css", "components.css", "responsive.css"];
const pAll = new Set();
for (const f of mods) {
  const proto = readFileSync(join(ROOT, "prototype", "src", "styles", f), "utf8");
  selectorsOf(proto).forEach((s) => pAll.add(s));
}
const inter = [...pAll].filter((s) => aSet.has(s)).sort();
console.log("prototype四模块选择器总数:", pAll.size);
console.log("app globals.css选择器总数:", aSet.size);
console.log("交集(可能冲突/重复)数量:", inter.length);
console.log(inter.join(" | "));
