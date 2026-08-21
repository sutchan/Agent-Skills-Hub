// app/next.config.mjs v1.18.2 — Next.js 配置
/** @type {import('next').NextConfig} */
const nextConfig = {
  // React 19 已将严格模式作为默认行为，reactStrictMode 字段已弃用；此处移除以避免误导。
  // Web 应用为轻量展示，跳过构建期 ESLint 校验以免阻塞（lint 另跑）
  eslint: { ignoreDuringBuilds: true },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
