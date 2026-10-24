// server/pages.js
// 静态资源与页面路由：public/、公开数据 JSON、skills/、首页（注入 GA）与 SPA 深链回退。
import fs from 'node:fs';
import express from 'express';
import { GA_ID, GA_TOKEN, INDEX_FILE, METRICS_FILE, PUBLIC_DIR, SKILLS_DIR, SKILLS_FILE } from './config.js';

/** 读取 index.html 并把 GA 占位符替换为当前环境的衡量 ID */
function sendIndex(res) {
  fs.readFile(INDEX_FILE, 'utf-8', (err, html) => {
    if (err) return res.status(500).send('Internal Server Error');
    res.type('html').send(html.split(GA_TOKEN).join(GA_ID));
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

/** 首页（须挂在限流与 API 之后） */
export function mountHome(app) {
  app.get('/', (req, res) => sendIndex(res));
}

/**
 * SPA 深链回退：未知的非 /api 路由返回首页（支持 skills/<name>/ 详情深链）。
 * 必须挂在 /api JSON 404 与错误兜底之后，否则会把未知 API 也回退成 HTML。
 */
export function mountSpaFallback(app) {
  app.use((req, res) => sendIndex(res));
}
