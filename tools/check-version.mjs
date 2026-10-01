// tools/check-version.mjs — 校验「package.json 版本 == 最新 CHANGELOG 小节 == git tag」一致性
// CI 校验门禁：任一不一致即退出码 1 阻断合并 / 发布。
// 可本地运行：node tools/check-version.mjs
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname); // tools -> repo root

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const version = pkg.version;
if (!version) {
  console.error("❌ package.json 缺少 version 字段");
  process.exit(1);
}

const changelog = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");
const m = changelog.match(/^##\s*\[(\d+\.\d+\.\d+)\]/m);
if (!m) {
  console.error("❌ CHANGELOG.md 缺少版本小节（## [x.y.z]）");
  process.exit(1);
}
const topChangelog = m[1];

const errors = [];
if (topChangelog !== version) {
  errors.push(`CHANGELOG 最新小节 [${topChangelog}] 与 package.json 版本 ${version} 不一致`);
}

const ref = process.env.GITHUB_REF || "";
if (ref.startsWith("refs/tags/")) {
  const tag = ref.slice("refs/tags/".length);
  if (tag !== `v${version}`) {
    errors.push(`git tag ${tag} 与 package.json 版本 v${version} 不一致`);
  }
}

if (errors.length) {
  console.error("❌ 版本一致性校验失败：");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
const tagInfo = ref.startsWith("refs/tags/") ? `, tag=v${ref.slice("refs/tags/v".length)}` : "";
console.log(`✅ 版本一致性通过：package.json=${version}, CHANGELOG=[${topChangelog}]${tagInfo}`);
