#!/usr/bin/env node
// 提交前把已暂存的文本源文件统一为 LF 换行符，防 Windows CRLF 回潮（配合 .gitattributes 的 skills/** LF）
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, statSync } from "node:fs";
const cwd = process.cwd();
let files = [];
try { files = execSync("git diff --cached --name-only --diff-filter=ACM", { cwd, encoding: "utf8" }).split("\n").filter(Boolean); } catch (e) { console.log("ensure-lf: no staged files"); process.exit(0); }
const TEXT = /\.(md|markdown|mdx|mjs|cjs|js|jsx|ts|tsx|json|css|html|htm|txt|py|sh|xsd|csv|svg|yml|yaml|toml|xml)$/i;
let n = 0;
for (const f of files) {
  if (!TEXT.test(f)) continue;
  let st; try { st = statSync(cwd + "/" + f); } catch (e) { continue; }
  if (!st.isFile()) continue;
  let txt; try { txt = readFileSync(cwd + "/" + f, "utf8"); } catch (e) { continue; }
  if (txt.includes("\r\n")) { writeFileSync(cwd + "/" + f, txt.replace(/\r\n/g, "\n"), "utf8"); try { execSync('git add -- "' + f + '"', { cwd }); n++; } catch (e) {} }
}
console.log("ensure-lf: normalized " + n + " text file(s) to LF");
process.exit(0);
