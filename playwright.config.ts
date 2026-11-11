import { defineConfig } from "@playwright/test";

// Playwright 配置：e2e 冒烟测试针对本地 express 服务（npm script `start` → `node server.js`）。
// 说明：next.config.mjs 为 output:"export"（纯静态导出），`next start` 不适用于该产物；
// 应用本体由 server.js 提供 src/index.html 静态站与 /api/votes、/api/favorites 接口，端口 3000。
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    // CI 默认使用 Playwright 自带 chromium；本机未下载浏览器二进制时可用
    // PLAYWRIGHT_CHANNEL=msedge npm run e2e 复用已安装的 Edge，避免环境阻断。
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: "on-first-retry",
  },
  webServer: {
    command: "bun run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
