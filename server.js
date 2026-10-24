// server.js
// 本地静态站与投票/收藏 API 的入口。
// 本文件只负责装配（中间件顺序 + 路由挂载），具体实现按职责拆分至 server/ 下各模块，
// 以符合「单文件 ≤200 行」规范。挂载顺序即中间件优先级，调整前请先确认影响面。
import express from 'express';
import { HOST, PORT } from './server/config.js';
import { mountApi } from './server/api.js';
import { mountHome, mountSpaFallback, mountStatic } from './server/pages.js';
import { rateLimitMiddleware } from './server/ratelimit.js';

const app = express();

// 经反代（EdgeOne / CDN）部署时，从 X-Forwarded-For 取真实客户端 IP；
// 否则 req.ip 为边缘节点 IP，限流会按全站共用一个桶计数，极易误伤全员 429（代码审查 #2）。
app.set('trust proxy', 1);

// 基础安全响应头（无外部依赖）
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json());

// 静态与公开数据：挂在限流之前，不占用 API 配额
mountStatic(app);

// 限流：仅作用于其后挂载的 API 与页面路由
app.use(rateLimitMiddleware);

mountApi(app);
mountHome(app);

// JSON 404：未知的 /api/* 返回结构化错误，而非 express 默认 HTML（代码审查 #8）
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// 全局错误兜底（避免未捕获异常泄露堆栈）
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// SPA 回退必须最后挂载：否则未知 /api 路径会被回退成 HTML，丢失上面的 JSON 404
mountSpaFallback(app);

app.listen(PORT, HOST, () => {
  console.log(`Agent Skills Hub server running at http://${HOST}:${PORT}`);
});
