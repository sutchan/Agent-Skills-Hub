import { defineConfig } from "@playwright/test";

// Playwright 配置：e2e 冒烟测试针对本地 express 服务（npm script `start` → `node server.js`）。
// 说明：站点为纯静态产物（src/index.html + public/），不存在框架运行时的生产服务器；
// 应用本体由 server.js 提供 src/index.html 静态站与 /api/votes、/api/favorites 接口。
//
// 端口：默认 3173。历史用 3100 曾与本机其它项目的 dev server 冲突（本机 MazeWander 的
// Next dev 正占 3100，导致 e2e 直接启动失败；历史上还曾因此误测到别的站点）。
// 可用环境变量 E2E_PORT 覆盖。
const E2E_PORT = Number(process.env.E2E_PORT) || 3173;

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
    // 独立端口，避免本机其它项目占用相同端口时被误复用
    baseURL: `http://localhost:${E2E_PORT}`,
    headless: true,
    // CI 默认使用 Playwright 自带 chromium；本机未下载浏览器二进制时可用
    // PLAYWRIGHT_CHANNEL=msedge npm run e2e 复用已安装的 Edge，避免环境阻断。
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: "on-first-retry",
  },
  webServer: {
    // 直接用 node 启动，避免本机/CI 未安装 Bun 时 e2e 无法启动
    command: "node server.js",
    url: `http://localhost:${E2E_PORT}`,
    // 固定端口：即使外部设置了 PORT，webServer 与 baseURL 仍保持一致
    env: { ...TEST_ENV, PORT: String(E2E_PORT) },
    // 必须自启本项目服务：复用本机已有服务会让它项目占用端口时测试失真
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
