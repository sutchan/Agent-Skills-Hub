// next.config.mjs — Next.js 配置（配置已提升至仓库根；采用 src 目录约定，App Router 位于根目录 src/app/ 下）
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 强制生成纯静态 HTML/JS/CSS，彻底移除对服务器端环境的依赖
  output: "export",
};

export default nextConfig;
