#!/usr/bin/env node
// render-og-image.mjs — 由 public/banner-og.svg 生成社交分享位图 public/banner-og.png
//
// 背景：og:image / twitter:image 原先指向 SVG，而 Facebook / Twitter / 微信等
// 主流平台均不渲染 SVG 社交卡片（表现为「无预览图」）。社交分享必须提供位图。
//
// 用法：npm run render:og（依赖本机已安装 Playwright chromium；CI 不执行，产物入库）
// 产物：public/banner-og.png（1200x630，PNG-24）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public', 'banner-og.svg');
const OUT = path.join(ROOT, 'public', 'banner-og.png');
const WIDTH = 1200;
const HEIGHT = 630;

if (!fs.existsSync(SRC)) {
  console.error(`render-og: 缺少源文件 ${SRC}`);
  process.exit(1);
}

// 剥离 XML 声明与 DOCTYPE（内联进 HTML 时会被当作文本节点渲染）
const raw = fs.readFileSync(SRC, 'utf8')
  .replace(/<\?xml[\s\S]*?\?>/g, '')
  .replace(/<!DOCTYPE[\s\S]*?>/gi, '');

// 固定画布尺寸并按 slice 裁切填充（避免默认 meet 产生留白）
const patched = raw
  .replace(/width="[^"]*"/, `width="${WIDTH}"`)
  .replace(/height="[^"]*"/, `height="${HEIGHT}"`)
  .replace(/preserveAspectRatio="[^"]*"/, 'preserveAspectRatio="xMidYMid slice"');

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.setContent(
    `<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:#0b1220">${patched}</body></html>`,
    { waitUntil: 'load' }
  );
  await page.screenshot({ path: OUT, type: 'png' });
} finally {
  await browser.close();
}

const size = fs.statSync(OUT).size;
console.log(`✓ 已生成 ${path.relative(ROOT, OUT)}（${WIDTH}x${HEIGHT}，${(size / 1024).toFixed(1)} KB）`);
