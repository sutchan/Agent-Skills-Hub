// server/env.js v1.16.27 — 轻量加载 .env.local（无第三方依赖），系统/CI 环境变量优先
// 约定：只填充未设置的键；空值不覆盖（如 GA_MEASUREMENT_ID= 保留代码内回退）；
// 兼容本地配置中 BLOB_SKILLS_* 前缀与代码侧 BLOB_* 命名的差异，避免误改用户凭据文件。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENV_FILE = path.join(ROOT, '.env.local');

const ALIASES = {
  BLOB_SKILLS_READ_WRITE_TOKEN: 'BLOB_READ_WRITE_TOKEN',
};

/** 读取 .env.local 并注入 process.env（仅缺失键）；文件不存在时静默跳过 */
export function loadLocalEnv() {
  if (!fs.existsSync(ENV_FILE)) return;
  const text = fs.readFileSync(ENV_FILE, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const [, key, raw] = m;
    let value = raw;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!value) continue;
    for (const target of [key, ALIASES[key]].filter(Boolean)) {
      if (!process.env[target]) process.env[target] = value;
    }
  }
}
