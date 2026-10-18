// scripts/tag-release.mjs — 为当前版本创建 v* 发布 tag（幂等，不自动推送）
// 对应任务：后续迭代 #15。用法：npm run tag  （推送：git push --tags）
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const tag = `v${pkg.version}`;

const existing = execSync("git tag --list", { encoding: "utf8" })
  .split("\n")
  .map((t) => t.trim())
  .filter(Boolean);

if (existing.includes(tag)) {
  console.log(`[tag-release] ${tag} 已存在，跳过创建。`);
  process.exit(0);
}

execSync(`git tag -a ${tag} -m "Release ${tag}"`, { stdio: "inherit" });
console.log(`[tag-release] 已创建注解 tag ${tag}。推送请执行：git push --tags`);
