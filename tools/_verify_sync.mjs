// tools/_verify_sync.mjs — 严格校验：旧版 ascii 选择器是否都在新版(shared+globals)中
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const APP = join(ROOT, "app");

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
const oldRaw = readFileSync(join(APP, "globals.css.bak"), "utf8");
const newRaw =
  readFileSync(join(APP, "base-shared.css"), "utf8") + "\n" +
  readFileSync(join(APP, "layout-shared.css"), "utf8") + "\n" +
  readFileSync(join(APP, "components-shared.css"), "utf8") + "\n" +
  readFileSync(join(APP, "responsive-shared.css"), "utf8") + "\n" +
  readFileSync(join(APP, "globals.css"), "utf8");
const oldR = rulesOf(oldRaw);
const newR = rulesOf(newRaw);
// 仅检查「旧版顶级选择器」是否出现在新版（新版可能合并到 @media 内，故宽松：检查选择器字符串是否包含于新版原文）
const lost = Object.keys(oldR).filter((k) => !newRaw.includes(k));
console.log("旧版规则数:", Object.keys(oldR).length, " 新版规则数:", Object.keys(newR).length);
console.log("旧版选择器新版未出现(潜在丢失):", lost.length ? lost.join(" | ") : "(无)");
