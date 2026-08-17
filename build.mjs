// build.mjs v1.14.34 — 将 src 模板 + 真实数据内联为自包含 out/index.html
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 脚本已移出 prototype/ 到仓库根目录；原型源位于 prototype/
const PROTO = join(__dirname, "prototype");
const SRC = join(PROTO, "src");
const OUT_DIR = join(PROTO, "out");

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
const data = readFileSync(join(__dirname, "data", "skills-data.json"), "utf8");

// 统计代码注入：GA4 Measurement ID 优先取环境变量，缺省回退到仓库配置值。
// 本地构建无需设环境变量即可生成空占位，避免把 ID 硬编码进仓库（部署时由 CI 注入更合规）。
const GA_ID = process.env.GA_MEASUREMENT_ID || "G-WQDDVB14PF";
const analytics = GA_ID
  ? `<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>`
  : "";

// 注意：replacement 字符串中 `$$` 会被解释为字面 `$`，导致 parts 里的 `const $$`
// 在产物中变成 `const $` 造成重复声明语法错误。统一使用函数式替换规避。
const out = htmlTpl
  .replace("{{CSS}}", () => css)
  .replace("{{DATA}}", () => data)
  .replace("{{I18N}}", () => i18n)
  .replace("{{JS}}", () => js)
  .replace("{{ANALYTICS}}", () => analytics);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "index.html"), out, "utf8");

// 复制品牌 favicon 到 out/，使原型部署后 <link rel="icon" href="favicon.svg"> 可达（data URI 仍保证离线自包含）
// 品牌资产统一存放于 app/public/（单一来源），app/icon.svg 为应用图标同源生成
const favSrc = join(__dirname, "app", "public", "favicon.svg");
if (existsSync(favSrc)) {
  copyFileSync(favSrc, join(OUT_DIR, "favicon.svg"));
  console.log("Copied favicon.svg -> prototype/out/favicon.svg");
}

console.log(`Built self-contained prototype -> ${join(OUT_DIR, "index.html")} (${(out.length / 1024).toFixed(1)} KB)`);
