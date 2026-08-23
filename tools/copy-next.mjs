// tools/copy-next.mjs v1.20.48 — 跨平台将 app/.next 复制到仓库根 .next
// 供腾讯云 EdgeOne Pages 以根目录(./)部署 Next.js 时拾取输出目录 .next
import { cpSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "app", ".next");
const dest = resolve(root, ".next");

if (existsSync(src)) {
  cpSync(src, dest, { recursive: true });
  console.log(`Copied app/.next -> .next (${dest})`);
} else {
  console.warn("app/.next not found, skip copy");
}
