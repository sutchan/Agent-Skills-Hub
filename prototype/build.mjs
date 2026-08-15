// prototype/build.mjs v1.14.6 — 将 src 模板 + 真实数据内联为自包含 out/index.html
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "src");
const OUT_DIR = join(__dirname, "out");

const htmlTpl = readFileSync(join(SRC, "index.html"), "utf8");
// 设计令牌与组件样式分文件维护，按序拼接为单一内联样式（tokens 在前，变量先定义）
const STYLES_DIR = join(SRC, "styles");
const css = readFileSync(join(STYLES_DIR, "tokens.css"), "utf8") + "\n" + readFileSync(join(SRC, "app.css"), "utf8");
// 交互逻辑按职责拆分为 src/parts/* 多模块，按文件名顺序拼接为单一脚本（同作用域，函数声明 hoist）
const PARTS_DIR = join(SRC, "parts");
const js = readdirSync(PARTS_DIR)
  .filter((f) => f.endsWith(".js"))
  .sort()
  .map((f) => readFileSync(join(PARTS_DIR, f), "utf8"))
  .join("\n");
const i18n = readFileSync(join(SRC, "i18n.js"), "utf8");
const data = readFileSync(join(__dirname, "skills-data.json"), "utf8");

const out = htmlTpl
  .replace("{{CSS}}", css)
  .replace("{{DATA}}", data)
  .replace("{{I18N}}", i18n)
  .replace("{{JS}}", js);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "index.html"), out, "utf8");
console.log(`Built self-contained prototype -> ${join(OUT_DIR, "index.html")} (${(out.length / 1024).toFixed(1)} KB)`);
