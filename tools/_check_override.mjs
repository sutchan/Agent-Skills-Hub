// tools/_check_override.mjs — 临时校验：找出 app 中被判定为「原型同源」但值与 prototype 不同的规则（潜在回归）
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const PROTO = join(ROOT, "prototype", "src", "styles");
const APP = join(ROOT, "app");
const MODULES = ["base", "layout", "components", "responsive"];

// 简易：按顶层规则块切分，提取 {selector: body}
function rulesOf(css) {
  const out = {};
  let i = 0, depth = 0, buf = "", inC = false, curSel = "";
  // 用正则按 选择器{...} 提取
  const re = /([^{}]+)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const sel = m[1].trim();
    if (sel.startsWith("@") || sel.startsWith("/*")) continue;
    out[sel] = m[2].trim();
  }
  return out;
}

// prototype 全集规则
const protoRules = {};
for (const mod of MODULES) {
  const css = readFileSync(join(PROTO, `${mod}.css`), "utf8");
  Object.assign(protoRules, rulesOf(css));
}
const appCss = readFileSync(join(APP, "globals.css"), "utf8");
const appRules = rulesOf(appCss);

// 找 app 有、prototype 有、但值不同的规则
const diffs = [];
for (const [sel, body] of Object.entries(appRules)) {
  if (protoRules[sel] && protoRules[sel] !== body) {
    diffs.push({ sel, app: body, proto: protoRules[sel] });
  }
}
console.log("app 与 prototype 同名但值不同的规则数:", diffs.length);
for (const d of diffs.slice(0, 200)) {
  console.log(`\n[${d.sel}]`);
  console.log("  app :", d.app.slice(0, 160));
  console.log("  proto:", d.proto.slice(0, 160));
}
if (diffs.length > 200) console.log(`... 其余 ${diffs.length - 200} 条省略`);
