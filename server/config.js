// server/config.js
// 路径与环境常量集中定义，供 server/ 各模块共享，避免各处重复拼路径。
import fs from 'node:fs';
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

/** 应用版本：取自 package.json（单一版本源），供本地服务注入页脚与 meta */
export const APP_VERSION = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8')).version;

/** 构建号：本地服务启动时生成 yymmddhhmm（10 位 · 2 位数年份，等同构建期注入） */
const _bd = new Date();
const _pad = (n) => String(n).padStart(2, '0');
export const BUILD_ID = `${String(_bd.getFullYear()).slice(2)}${_pad(_bd.getMonth() + 1)}${_pad(_bd.getDate())}${_pad(_bd.getHours())}${_pad(_bd.getMinutes())}`;

/** 页脚占位符：__APP_VERSION__ / __BUILD_ID__ 由构建期 inject-ga.mjs 与本地服务 server/pages.js 注入 */
export const APP_VERSION_TOKEN = '__APP_VERSION__';
export const BUILD_ID_TOKEN = '__BUILD_ID__';

export const INDEX_FILE = path.join(ROOT_DIR, 'src', 'index.html');
export const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
export const SKILLS_DIR = path.join(ROOT_DIR, 'skills');

export const SKILLS_FILE = path.join(ROOT_DIR, 'data', 'skills-data.json');
export const METRICS_FILE = path.join(ROOT_DIR, 'data', 'skills-metrics.json');
export const STORE_FILE = path.join(ROOT_DIR, 'data', 'kv-store.json');
export const RATELIMIT_FILE = path.join(ROOT_DIR, 'data', 'ratelimit.json');
