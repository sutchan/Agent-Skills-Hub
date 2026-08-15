// app/next.config.mjs v1.1.0 — Next.js 配置
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 原型 app 为轻量展示，跳过构建期 ESLint 校验以免阻塞（lint 另跑）
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
