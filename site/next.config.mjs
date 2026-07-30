// 路径: site/next.config.mjs 版本: 1.0.0
// 使用静态导出，输出到 out/ 目录，便于部署到腾讯云 EdgeOne / 对象存储等静态托管。

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // 若部署到 EdgeOne 子路径，可在此设置 basePath / assetPrefix
  // basePath: "",
  images: { unoptimized: true },
};

export default nextConfig;
