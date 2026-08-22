// prototype/build-skills-data.mjs v1.19.41
// 兼容层：CI 历史配置硬编码调用 `node prototype/build-skills-data.mjs`，
// 但权威脚本位于 tools/（tools/build-skills-data.mjs）。
// 此处仅转发到 tools/ 下脚本，确保单一数据源、无逻辑重复。
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_SCRIPT = join(__dirname, "..", "tools", "build-skills-data.mjs");

execFileSync(process.execPath, [ROOT_SCRIPT], { stdio: "inherit" });
