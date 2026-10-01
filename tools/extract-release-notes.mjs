// tools/extract-release-notes.mjs <version> [changelogPath] [outPath]
// 提取 CHANGELOG 中对应版本的完整小节（剔除链接引用行），写入 outPath 或 stdout。
// 供 Release 阶段生成 GitHub Release 发行说明。
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);

const version = process.argv[2];
if (!version) {
  console.error("usage: extract-release-notes.mjs <version> [changelogPath] [outPath]");
  process.exit(1);
}
const changelogPath = process.argv[3] || join(ROOT, "CHANGELOG.md");
const outPath = process.argv[4];

const text = readFileSync(changelogPath, "utf8");
// 截取从本节标题到下一个版本标题（## [x.y.z]）或文件末尾之间的内容
const re = new RegExp(
  `^##\\s*\\[${version.replace(/[.+*]/g, "\\$&")}\\][\\s\\S]*?(?=\\n##\\s*\\[|$)`,
  "m"
);
const m = text.match(re);
if (!m) {
  console.error(`❌ 未在 CHANGELOG 中找到小节 [${version}]`);
  process.exit(1);
}
let section = m[0].replace(/^\s+|\s+$/g, "");
// 剔除链接引用行（形如 `[1.14.56]: https://...`）
section = section
  .split("\n")
  .filter((l) => !/^\[[^\]]+\]:\s*https?:\/\//.test(l.trim()))
  .join("\n")
  .trim();

if (outPath) {
  writeFileSync(outPath, section + "\n", "utf8");
  console.log(`✅ 已写出发行说明 -> ${outPath}（${section.length} 字符）`);
} else {
  process.stdout.write(section + "\n");
}
