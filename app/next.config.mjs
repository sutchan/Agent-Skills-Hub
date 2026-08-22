// app/next.config.mjs v1.19.38 — Next.js 配置
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生成精简 standalone server bundle，部署体积更小、冷启更快（Vercel 最佳实践）
  output: "standalone",
  // Web 应用为轻量展示，跳过构建期 ESLint 校验以免阻塞（lint 另跑）
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
