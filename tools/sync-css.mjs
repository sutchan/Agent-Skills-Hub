// tools/sync-css.mjs — 将 prototype/src/styles 四模块同步为 app 的 *-shared.css，
// 并把 app/globals.css 拆分为「prototype 同源(@import shared) + app 扩展区」两层。
//
// 同步策略（零回归）：
//   shared 文件 = prototype 四模块原文（提供 prototype 全部规则，含其新增/演进）。
//   globals.css 扩展区 = app 独有规则 + app 改写过原型的规则（选择器相同但声明不同）。
//   加载顺序：shared 在前，app 扩展在后 -> app 改写优先，prototype 仅补充 app 缺失的新规则。
//   因此 prototype 演进后只需重跑本脚本即可消除版本漂移，且不破坏 app 既有适配。
//
// 用法：node tools/sync-css.mjs            （生成 shared + 重写 globals.css）
//       DRY=1 node tools/sync-css.mjs      （仅生成 shared，不重写 globals.css，供 review）
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const APP_VER = (() => { try { return JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version; } catch { return "0.0.0"; } })();
const PROTO = join(ROOT, "prototype", "src", "styles");
const APP = join(ROOT, "app");
const MODULES = ["base", "layout", "components", "responsive"];
const DRY = process.env.DRY === "1";

function versionOf(css) { const m = css.match(/v(\d+\.\d+\.\d+)/); return m ? m[1] : "0.0.0"; }
function rulesOf(css) {
  const out = {};
  const re = /([^{}]+)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const sel = m[1].trim();
    if (sel.startsWith("@") || sel.startsWith("/*")) continue;
    out[sel] = m[2].trim();
  }
  return out;
}
function selectorsOf(css) {
  const set = new Set();
  const re = /([^{}]+)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const sel = m[1].trim();
    if (sel.startsWith("@")) { set.add("@atrule"); continue; }
    sel.split(",").forEach((s) => { const t = s.trim(); if (t) set.add(t); });
  }
  return set;
}

const protoRules = {};
const protoSel = new Set();
const protoVers = {};
for (const mod of MODULES) {
  const css = readFileSync(join(PROTO, `${mod}.css`), "utf8");
  protoVers[mod] = versionOf(css);
  Object.assign(protoRules, rulesOf(css));
  selectorsOf(css).forEach((s) => protoSel.add(s));
}

// 稳健分块：注释 / @import / @media 块 / 普通规则块
const appCss = readFileSync(join(APP, "globals.css"), "utf8");
const TOKEN = /\/\*[\s\S]*?\*\/|@import[^;]*;|@media[^{]*\{[\s\S]*?\}\s*\}|([^{}]+)\{([^{}]*)\}/g;
const appExt = [];
let m;
while ((m = TOKEN.exec(appCss))) {
  const whole = m[0];
  if (whole.startsWith("/*")) {
    // 注释：丢弃旧文件头 / 旧 marker
    if (/globals\.css v/.test(whole)) continue;
    if (/prototype\/src\/styles\//.test(whole)) continue;
    appExt.push(whole);
    continue;
  }
  if (whole.startsWith("@import")) continue; // @import 已固定写入头部
  if (whole.startsWith("@media")) { appExt.push(whole); continue; } // @media 整块保留到扩展区
  // 普通规则块
  const key = m[1].trim();
  const body = m[2].trim();
  const subs = key.split(",").map((s) => s.trim());
  const allProto = subs.length > 0 && subs.every((s) => protoSel.has(s));
  if (!allProto) { appExt.push(whole); continue; }
  // 全为原型选择器：值相同则同源丢弃，否则（app 改写）保留
  if (protoRules[key] && protoRules[key] === body) continue;
  appExt.push(whole);
}

// 生成 shared 文件
for (const mod of MODULES) {
  const css = readFileSync(join(PROTO, `${mod}.css`), "utf8");
  const body = css.replace(/^\/\*[\s\S]*?\*\//, "").trimStart();
  const head = `/* ${mod}-shared.css — 由 prototype/src/styles/${mod}.css v${protoVers[mod]} 自动生成，勿手改；改动请在 prototype 修改后重跑 tools/sync-css.mjs */\n`;
  writeFileSync(join(APP, `${mod}-shared.css`), head + body + "\n", "utf8");
}

if (!DRY) {
  const importLines = MODULES.map((mm) => `@import "./${mm}-shared.css";`).join("\n");
  const newCss =
    `/* app/globals.css v${APP_VER} — 应用全局样式\n` +
    ` * 结构：① tokens-shared.css（设计令牌，由 prototype 同步）\n` +
    ` *       ② base/layout/components/responsive-shared.css（prototype 同源规则，由 tools/sync-css.mjs 自动生成）\n` +
    ` *       ③ 下方「APP 扩展区」：app 独有/改写原型的规则，优先于 shared 生效\n` +
    ` * prototype 样式变更后运行：node tools/sync-css.mjs\n` +
    ` */\n` +
    `@import "./tokens-shared.css";\n` +
    importLines + `\n\n` +
    `/* ===================== APP 扩展区（原型同源规则之上的 app 适配，请勿移入 shared） ===================== */\n` +
    appExt
      .filter((b) => !b.trim().startsWith("@import") && !b.includes("prototype/src/styles"))
      .join("\n\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  writeFileSync(join(APP, "globals.css"), newCss, "utf8");
}

console.log("prototype 版本:", protoVers);
console.log("app 扩展区块数:", appExt.length);
console.log("已生成:", MODULES.map((mm) => `${mm}-shared.css`).join(", "));
console.log(DRY ? "DRY 模式：未重写 globals.css" : "已重写: app/globals.css");
