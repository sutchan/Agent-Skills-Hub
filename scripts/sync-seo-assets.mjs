#!/usr/bin/env node
// scripts/sync-seo-assets.mjs — 从权威数据同步全站 SEO/GEO 资产（幂等）
//
// 生成：public/robots.txt、sitemap.xml、llms.txt、llms-full.txt、about.html
// 注入：src/index.html 的 JSON-LD 区块（标记之间，勿手工编辑）；关于内容全部在独立 /about.html
// 关于页：完整关于引导 + FAQ 位于独立 /about.html；首页无静态目录区块，完整清单见 /llms-full.txt
// 由 `npm run sync:seo`、`npm run sync:data` 与 `npm run build` 调用；内容不变时不写盘，
// 因此 CI 构建不会把工作区改脏，也不会产生与数据无关的 diff。
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, total, groups, recordCount } from './seo/facts.mjs';
import { renderRobots, renderSitemap, renderLlms, renderLlmsFull } from './seo/render-assets.mjs';
import { renderJsonLd } from './seo/render-page.mjs';
import { renderAboutPage } from './seo/render-about.mjs';

const PUBLIC = path.join(ROOT, 'public');
const HTML_PATH = path.join(ROOT, 'src', 'index.html');
const DATA_FILE = path.join(ROOT, 'data', 'skills-data.json');
const DATA_PUBLIC = path.join(PUBLIC, 'data', 'skills-data.json');

function writeIfChanged(file, content) {
  let current = null;
  try {
    current = fs.readFileSync(file, 'utf8');
  } catch {
    current = null;
  }
  if (current === content) return false;
  fs.writeFileSync(file, content, 'utf8');
  return true;
}

/** 只替换标记之间的内容，标记注释本身保持原样，便于人类识别生成区 */
function injectBlock(html, key, content) {
  const beginToken = `<!-- SEO-${key}:BEGIN`;
  const endToken = `<!-- SEO-${key}:END -->`;
  const begin = html.indexOf(beginToken);
  const end = html.indexOf(endToken, begin + 1);
  if (begin < 0 || end < 0) {
    throw new Error(`src/index.html 缺少 ${beginToken} / ${endToken} 标记，无法注入 ${key}`);
  }
  const beginEnd = html.indexOf('-->', begin) + 3;
  if (beginEnd < 3 || beginEnd > end) throw new Error(`SEO-${key} 标记格式异常`);
  const replacement = html.slice(begin, beginEnd) + '\n' + content + '\n' + endToken;
  return html.slice(0, begin) + replacement + html.slice(end + endToken.length);
}

fs.mkdirSync(PUBLIC, { recursive: true });
const assets = [
  ['robots.txt', renderRobots()],
  ['sitemap.xml', renderSitemap()],
  ['llms.txt', renderLlms()],
  ['llms-full.txt', renderLlmsFull()],
];
for (const [name, content] of assets) {
  const file = path.join(PUBLIC, name);
  const changed = writeIfChanged(file, content);
  console.log(`${changed ? '已更新' : '无变化'} public/${name}`);
}

// 静态部署只发布 out/（= public/ + 导出页），仓库 data/ 不会进入产物。
// 同步一份只读副本到 public/data/，保证 llms.txt / FAQ 里承诺的 /data/skills-data.json 真实可达。
fs.mkdirSync(path.dirname(DATA_PUBLIC), { recursive: true });
const dataChanged = writeIfChanged(DATA_PUBLIC, fs.readFileSync(DATA_FILE, 'utf8'));
console.log(`${dataChanged ? '已更新' : '无变化'} public/data/skills-data.json（静态部署副本）`);

// 独立关于页：完整 FAQ 从首页迁移而来，Next export / 本地静态服务均从 public/ 发布
const aboutChanged = writeIfChanged(path.join(PUBLIC, 'about.html'), renderAboutPage());
console.log(`${aboutChanged ? '已更新' : '无变化'} public/about.html（独立关于页）`);

const source = fs.readFileSync(HTML_PATH, 'utf8');
const output = injectBlock(source, 'JSONLD', renderJsonLd());
const changed = writeIfChanged(HTML_PATH, output);
console.log(`${changed ? '已更新' : '无变化'} src/index.html（仅 JSON-LD；关于内容由 /about.html 承载）`);
console.log(`同步完成：${total} 个可见技能 / ${groups.length} 个分类 / ${recordCount} 条数据源记录`);
