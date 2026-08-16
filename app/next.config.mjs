// app/next.config.mjs v1.1.7 — Next.js 配置
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Web 应用为轻量展示，跳过构建期 ESLint 校验以免阻塞（lint 另跑）
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
