// server/pages.js
// 静态资源与页面路由：public/、公开数据 JSON、skills/、首页（注入 GA）与 SPA 深链回退。
import fs from 'node:fs';
import express from 'express';
import { APP_VERSION, APP_VERSION_TOKEN, BUILD_ID, BUILD_ID_TOKEN, GA_ID, GA_TOKEN, INDEX_FILE, METRICS_FILE, PUBLIC_DIR, SKILLS_DIR, SKILLS_FILE } from './config.js';

/**
 * 读取 index.html 并把 GA 衡量 ID / 应用版本 / 构建号占位符替换为当前环境的值。
 * 首页与 SPA 深链共用缓存：仅在文件 mtime/size 变化时重读并重做字符串替换，
 * 避免每个请求都读 140KB+ HTML 且重复 split/join（开发时改文件仍会即时生效）。
 */
let indexCache = { stamp: '', html: '' };
function sendIndex(res) {
  fs.stat(INDEX_FILE, (statErr, stat) => {
    if (statErr) return res.status(500).send('Internal Server Error');
    const stamp = `${stat.mtimeMs}:${stat.size}`;
    if (indexCache.html && indexCache.stamp === stamp) {
      return res.type('html').send(indexCache.html);
    }
    fs.readFile(INDEX_FILE, 'utf-8', (err, raw) => {
      if (err) return res.status(500).send('Internal Server Error');
      const out = raw
        .split(GA_TOKEN).join(GA_ID)
        .split(APP_VERSION_TOKEN).join(APP_VERSION)
        .split(BUILD_ID_TOKEN).join(BUILD_ID);
      indexCache = { stamp, html: out };
      res.type('html').send(out);
    });
  });
}

/**
 * 静态资源与公开数据：须挂在限流之前，不占用 API 配额。
 * 注意：不挂载整个 src/ —— index.html 由 sendIndex 显式返回，
 * 避免对外泄露源码目录（代码审查 #3）；敏感 KV（kv-store.json）同样不直出（#11）。
 */
export function mountStatic(app) {
  app.use(express.static(PUBLIC_DIR));
  app.get('/data/skills-data.json', (req, res) => res.sendFile(SKILLS_FILE));
  app.get('/data/skills-metrics.json', (req, res) => res.sendFile(METRICS_FILE));
  app.use('/skills', express.static(SKILLS_DIR));
}

/** 首页与独立关于页（须挂在限流与 API 之后）
 *  /about.html 由 express.static(public) 直接服务；/about 是无扩展名的友好别名，
 *  显式 301 过去，避免被末尾的 SPA 回退当成首页返回。 */
export function mountHome(app) {
  app.get('/', (req, res) => sendIndex(res));
  app.get('/about', (req, res) => res.redirect(301, '/about.html'));
}

/**
 * SPA 深链回退：未知的非 /api 路由返回首页（支持 skills/<name>/ 详情深链）。
 * 必须挂在 /api JSON 404 与错误兜底之后，否则会把未知 API 也回退成 HTML。
 */
export function mountSpaFallback(app) {
  app.use((req, res) => sendIndex(res));
}
