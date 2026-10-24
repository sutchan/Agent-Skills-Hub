// server/config.js
// 路径与环境常量集中定义，供 server/ 各模块共享，避免各处重复拼路径。
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 仓库根目录（config.js 位于 server/，故上溯一级） */
export const ROOT_DIR = path.resolve(__dirname, '..');

export const PORT = process.env.PORT || 3000;
export const HOST = '0.0.0.0';

/** index.html 中待替换的 GA 占位符；环境变量缺省时回退内置 ID，保证本地 GA 可用 */
export const GA_TOKEN = '__GA_MEASUREMENT_ID__';
export const GA_ID = process.env.GA_MEASUREMENT_ID || 'G-WQDDVB14PF';

export const INDEX_FILE = path.join(ROOT_DIR, 'src', 'index.html');
export const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
export const SKILLS_DIR = path.join(ROOT_DIR, 'skills');

export const SKILLS_FILE = path.join(ROOT_DIR, 'data', 'skills-data.json');
export const METRICS_FILE = path.join(ROOT_DIR, 'data', 'skills-metrics.json');
export const STORE_FILE = path.join(ROOT_DIR, 'data', 'kv-store.json');
export const RATELIMIT_FILE = path.join(ROOT_DIR, 'data', 'ratelimit.json');
