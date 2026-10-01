import { defineConfig } from "@playwright/test";

// Playwright 配置：e2e 冒烟测试针对 `next build` 产出的本地服务。
// webServer 自动执行 `next start`（先由 CI 步骤 `pnpm build` 生成 .next）。
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
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm exec next start -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
