#!/usr/bin/env node
// inject-ga.mjs — 构建期将 GA 衡量 ID、应用版本、构建号注入 out/index.html。
//
// 静态导出产物 out/index.html 在 next build && cp 之后被替换，避免将值硬编码进源码。
// - GA 衡量 ID：部署平台（GitHub Actions build job / EdgeOne 构建环境）通过 env 传入
//   GA_MEASUREMENT_ID；缺失时回退到内置 ID，保证本地无环境变量时 GA 仍可用。
// - 应用版本：取自 package.json（单一版本源），替换 __APP_VERSION__。
// - 构建号：本地构建时间到分钟 yyyymmddhhmm，替换 __BUILD_ID__（遵循全局编码规范 · 页脚构建号）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const GA_TOKEN = '__GA_MEASUREMENT_ID__';
const GA_ID = process.env.GA_MEASUREMENT_ID || 'G-WQDDVB14PF';

const APP_VERSION_TOKEN = '__APP_VERSION__';
const APP_VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8')).version;

const BUILD_ID_TOKEN = '__BUILD_ID__';
const d = new Date();
const p = (n) => String(n).padStart(2, '0');
const BUILD_ID = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}`;

const TARGET = path.join(ROOT, 'out', 'index.html');
if (!fs.existsSync(TARGET)) {
  console.warn(`inject: 未找到 ${TARGET}，跳过（可能未执行 cp src/index.html out/index.html）`);
  process.exit(0);
}

let html = fs.readFileSync(TARGET, 'utf-8');
const replaces = [
  [GA_TOKEN, GA_ID],
  [APP_VERSION_TOKEN, APP_VERSION],
  [BUILD_ID_TOKEN, BUILD_ID],
];
for (const [tok, val] of replaces) {
  if (html.includes(tok)) html = html.split(tok).join(val);
}
fs.writeFileSync(TARGET, html, 'utf-8');
console.log(`inject: 已注入 out/index.html（GA=${process.env.GA_MEASUREMENT_ID ? 'env' : 'default'} version=${APP_VERSION} build=${BUILD_ID}）`);
