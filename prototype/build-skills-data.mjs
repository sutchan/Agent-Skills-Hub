// prototype/build-skills-data.mjs v1.14.72
// 兼容层：CI 历史配置硬编码调用 `node prototype/build-skills-data.mjs`，
// 但权威脚本已迁移到仓库根目录（build-skills-data.mjs）。
// 此处仅转发到根目录脚本，确保单一数据源、无逻辑重复。
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_SCRIPT = join(__dirname, "..", "build-skills-data.mjs");

execFileSync(process.execPath, [ROOT_SCRIPT], { stdio: "inherit" });
