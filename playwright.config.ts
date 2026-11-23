import { defineConfig } from "@playwright/test";

// Playwright 配置：e2e 冒烟测试针对本地 express 服务（npm script `start` → `node server.js`）。
// 说明：next.config.mjs 为 output:"export"（纯静态导出），`next start` 不适用于该产物；
// 应用本体由 server.js 提供 src/index.html 静态站与 /api/votes、/api/favorites 接口，测试端口 3100。
const TEST_ENV = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
);

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    // 独立端口，避免本机其它项目占用 3000 时被误复用（曾导致测试打到 Maze Wander 页面）
    baseURL: "http://localhost:3100",
    headless: true,
    // CI 默认使用 Playwright 自带 chromium；本机未下载浏览器二进制时可用
    // PLAYWRIGHT_CHANNEL=msedge npm run e2e 复用已安装的 Edge，避免环境阻断。
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: "on-first-retry",
  },
  webServer: {
    // 直接用 node 启动，避免本机/CI 未安装 Bun 时 e2e 无法启动
    command: "node server.js",
    url: "http://localhost:3100",
    // 固定端口：即使外部设置了 PORT，webServer 与 baseURL 仍保持一致
    env: { ...TEST_ENV, PORT: "3100" },
    // 必须自启本项目服务：复用本机已有服务会让它项目占用端口时测试失真
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
