// app/scripts/sync-data.cjs v1.1.14
// 将仓库根的 data/skills-data.json 同步到 app/app/data/，供 Next.js 服务端组件读取。
// 解决 Vercel/EdgeOne 部署时 app/ 无法访问仓库根 data/ 的问题。
// 采用「向上查找仓库根」策略，不依赖固定目录层级，兼容本地与 CI 各种 cwd。
// 注意：仓库根以包含 build-skills-data.mjs 判定，避免 app/ 内的旧 data/ 副本造成误判。

const fs = require("fs");
const path = require("path");

// 从本脚本位置向上查找包含 build-skills-data.mjs（构建数据脚本）的目录作为仓库根
function findRepoRoot(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "build-skills-data.mjs"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const scriptDir = __dirname;
const repoRoot = findRepoRoot(scriptDir);
if (!repoRoot) {
  console.error("[sync-data] 未找到仓库根 data/skills-data.json（向上查找失败）");
  console.error("[sync-data] 请确认仓库根存在 data/skills-data.json");
  process.exit(1);
}

const src = path.join(repoRoot, "data", "skills-data.json");
// 目标：app/app/data/skills-data.json（与 app/app/lib/skills.ts 的 ../data 对应）
const destDir = path.join(repoRoot, "app", "app", "data");
const dest = path.join(destDir, "skills-data.json");

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
const kb = (fs.statSync(dest).size / 1024).toFixed(1);
console.log(`[sync-data] 已同步 skills-data.json -> ${path.relative(repoRoot, dest).replace(/\\/g, "/")} (${kb} KB)`);
