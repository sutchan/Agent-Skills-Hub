// tools/ensure-lf.mjs
// pre-commit hook: normalize source files to LF.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const EXT = new Set([".md",".mjs",".js",".ts",".tsx",".jsx",".json",".css",".html",".yml",".yaml",".py",".vue",".dart",".go",".java"]);
const SKIP = new Set(["node_modules",".git",".next","out","prototype/out/_next","skills/RecycleBin~",".codebuddy","skills/cache","skills/logs"]);

let n = 0;
function walk(dir){
  let e;
  try { e = readdirSync(dir); } catch { return; }
  for (const name of e){
    const full = join(dir, name);
    let st; try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()){
      const rel = full.slice(ROOT.length + 1).split("\\").join("/");
      if ([...SKIP].some(s => rel.startsWith(s))) continue;
      walk(full); continue;
    }
    if (!EXT.has(name.slice(name.lastIndexOf(".")))) continue;
    try {
      const b = readFileSync(full);
      if (b.includes(13)){ writeFileSync(full, b.toString("utf8").split("\r\n").join("\n"), "utf8"); n++; }
    } catch {}
  }
}
walk(ROOT);
if (n>0) console.error("ensure-lf: "+n+" file(s) -> LF");
process.exit(0);
