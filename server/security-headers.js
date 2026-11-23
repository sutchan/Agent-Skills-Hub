// server/security-headers.js — 全站安全响应头
// 与 src/index.html 内联的 CSP meta 保持同一策略；响应头形式更强：
// frame-ancestors / upgrade-insecure-requests 仅在响应头中生效（meta 形式会被忽略）。
// 页面为自包含单页（内联 CSS/JS，无第三方 CDN），唯一外域为 GA4，
// 故 script-src / style-src 保留 unsafe-inline，其余指令按最小权限收紧。
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.googletagmanager.com",
  "font-src 'self' data:",
  "connect-src 'self' blob: data: https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

/** 挂载安全响应头中间件（须早于静态与路由挂载，才能覆盖全部响应） */
export function mountSecurityHeaders(app) {
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
    next();
  });
}
