import fs from "node:fs";
import path from "node:path";
function walk(d) {
  let r = [];
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) {
      if (["node_modules", ".next", ".git", ".codebuddy"].includes(f)) continue;
      r = r.concat(walk(p));
    } else if (/\.(ts|tsx|js|jsx|mjs|py|dart|go|java)$/.test(f)) {
      const txt = fs.readFileSync(p, "utf8");
      const c = txt.split(/\r?\n/).length;
      if (c > 200) r.push(p.replace(process.cwd() + path.sep, "") + " : " + c + " lines");
    }
  }
  return r;
}
const res = walk("src").concat(walk("tools"));
console.log("=== files >200 lines ===");
console.log(res.sort().join("\n"));
console.log("=== total: " + res.length + " ===");
