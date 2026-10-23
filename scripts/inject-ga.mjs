#!/usr/bin/env node
// inject-ga.mjs — 构建期将 GA 衡量 ID 占位符替换为部署平台环境变量。
//
// 部署平台（GitHub Actions build job / EdgeOne 构建环境）通过 env 传入 GA_MEASUREMENT_ID；
// 缺失时回退到原值 G-WQDDVB14PF，保证本地无环境变量时 GA 仍可用。
// 静态导出产物 out/index.html 在 next build && cp 之后被替换，避免将 ID 硬编码进源码。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TOKEN = '__GA_MEASUREMENT_ID__';
const GA_ID = process.env.GA_MEASUREMENT_ID || 'G-WQDDVB14PF';
const TARGET = path.join(ROOT, 'out', 'index.html');

if (!fs.existsSync(TARGET)) {
  console.warn(`inject-ga: 未找到 ${TARGET}，跳过（可能未执行 cp src/index.html out/index.html）`);
  process.exit(0);
}

const html = fs.readFileSync(TARGET, 'utf-8');
if (!html.includes(TOKEN)) {
  console.warn('inject-ga: out/index.html 中无占位符，已跳过');
  process.exit(0);
}

fs.writeFileSync(TARGET, html.split(TOKEN).join(GA_ID), 'utf-8');
console.log(`inject-ga: 已将 GA 衡量 ID 注入 out/index.html（source=GA_MEASUREMENT_ID=${process.env.GA_MEASUREMENT_ID ? 'env' : 'default'}）`);
