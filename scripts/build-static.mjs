#!/usr/bin/env node
// build-static.mjs — 生成纯静态站点产物到 out/
//
// 站点本体是自包含单页 src/index.html（无框架运行时、无 SSR/ISR），
// 因此构建产物 = public/ 静态资源 + index.html。
//
// 背景：原构建链用 `next build`（output:"export"）产出 out/，随后 inject-ga.mjs
// 整体覆盖 out/index.html —— Next 层实际只提供了目录骨架与 public/ 复制，
// 自身产物被完全丢弃。移除 Next 后由本脚本直接生成 out/：构建链更短、依赖更少，
// 且产物来源唯一（public/ + src/index.html）。
//
// 产物约定（EdgeOne Pages / Vercel 均以 out/ 为发布目录）：
//   out/index.html    —— 站点本体（GA / 版本 / 构建号由 scripts/inject-ga.mjs 注入）
//   out/<public/**>  —— 静态资源（about.html、robots.txt、sitemap.xml、llms*.txt、banner*.svg 等）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_DIR = path.join(ROOT, 'out');

if (!fs.existsSync(PUBLIC_DIR)) {
  console.error(`build-static: 缺少 public/ 目录（${PUBLIC_DIR}），构建中止`);
  process.exit(1);
}

// 清空产物目录：避免上一次构建的残留文件被一并发布
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

/** 递归复制目录内容 */
function copyDir(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

/** 统计目录内文件数 */
function countFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .reduce((n, e) => n + (e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1), 0);
}

copyDir(PUBLIC_DIR, OUT_DIR);

console.log(
  `✓ 已生成静态产物 out/：${countFiles(OUT_DIR)} 个文件（public/ 全量复制；index.html 由 inject-ga.mjs 写入）`
);
