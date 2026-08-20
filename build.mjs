// build.mjs v1.14.56 — 将 src 模板 + 真实数据内联为自包含 prototype/index.html（产物直出 prototype/ 根）
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 脚本已移出 prototype/ 到仓库根目录；原型源位于 prototype/
const PROTO = join(__dirname, "prototype");
const SRC = join(PROTO, "src");
// 产物直接输出到 prototype/ 根目录（index.html + favicon.svg），不再嵌套 out/ 子目录，
// 使 prototype/index.html 即部署入口，edgeone.json 的 outputDirectory 指向 ./prototype。
const OUT_DIR = PROTO;

const htmlTpl = readFileSync(join(SRC, "index.html"), "utf8");
// 设计令牌与组件样式分文件维护，按序拼接为单一内联样式（tokens 在前，变量先定义）
const STYLES_DIR = join(SRC, "styles");
// 样式按职责拆分为多个模块（src/styles/*），按显式顺序拼接（tokens 必须先定义变量）：
// tokens(设计令牌) → base(全局UX/焦点/动效/toast) → layout(顶栏/Hero/控制/分类/网格/页脚)
// → components(卡片/分类chip/按钮/弹窗) → responsive(媒体查询，必须最后以保证覆盖)
const CSS_ORDER = ["tokens.css", "base.css", "layout.css", "components.css", "responsive.css"];
const css = CSS_ORDER
  .map((f) => readFileSync(join(STYLES_DIR, f), "utf8"))
  .join("\n");
// 交互逻辑按职责拆分为 src/parts/* 多模块，按文件名顺序拼接为单一脚本（同作用域，函数声明 hoist）
const PARTS_DIR = join(SRC, "parts");
const js = readdirSync(PARTS_DIR)
  .filter((f) => f.endsWith(".js"))
  .sort()
  .map((f) => readFileSync(join(PARTS_DIR, f), "utf8"))
  .join("\n");
const i18n = readFileSync(join(SRC, "i18n.js"), "utf8");
const data = readFileSync(join(__dirname, "data", "skills-data.json"), "utf8");
// 真实技能总数（数据单一来源），用于注入 meta description / og:description / twitter:description，
// 避免 SEO/分享文案与磁盘技能实况漂移
const SKILLS_TOTAL = (() => {
  try { return JSON.parse(data).total; } catch (e) { return 0; }
})();
// 项目版本取自根 package.json（单一权威源），注入页脚展示（避免硬编码漂移）
const PROJECT_VERSION = (() => {
  try { return JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8")).version; }
  catch (e) { return ""; }
})();

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
  .replace("{{ANALYTICS}}", () => analytics)
  .replace("{{VERSION}}", () => PROJECT_VERSION)
  .replace(/\{SKILLS_TOTAL\}/g, () => String(SKILLS_TOTAL));

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "index.html"), out, "utf8");

// 复制品牌 favicon 到 prototype/ 根目录，使原型部署后 <link rel="icon" href="favicon.svg"> 可达（data URI 仍保证离线自包含）
// 品牌资产统一存放于 app/public/（单一来源），app/icon.svg 为应用图标同源生成
const favSrc = join(__dirname, "app", "public", "favicon.svg");
if (existsSync(favSrc)) {
  copyFileSync(favSrc, join(OUT_DIR, "favicon.svg"));
  console.log("Copied favicon.svg -> prototype/favicon.svg");
}
// 复制社交分享横幅（Open Graph / Twitter Card），供 index.html 的 og:image 引用
const ogSrc = join(__dirname, "app", "public", "banner-og.svg");
if (existsSync(ogSrc)) {
  copyFileSync(ogSrc, join(OUT_DIR, "banner-og.svg"));
  console.log("Copied banner-og.svg -> prototype/banner-og.svg");
}

console.log(`Built self-contained prototype -> ${join(OUT_DIR, "index.html")} (${(out.length / 1024).toFixed(1)} KB)`);
