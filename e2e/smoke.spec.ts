import { test, expect } from "@playwright/test";

// 冒烟测试：验证本地 express 服务（bun run start → server.js @3000）能正常渲染技能网格与基础交互。
// 关键修复（1.16.7）：
//  - 断言真实 .card 渲染，而非仅 #grid 有子节点（初始骨架也算子节点，旧断言恒真，无法拦截数据不渲染）；
//  - 收集 pageerror，确保页面 JS 无运行时抛错（防止语法/数据错误漏过 CI）；
//  - 搜索框选择器修正为实际 id #searchInput（旧 #search 不存在，该测试长期无效）。

test("首页加载并渲染真实技能卡片", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.waitForSelector("#grid .card", { timeout: 30000 });
  const cards = await page.locator("#grid .card").count();
  expect(cards).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("搜索框可过滤技能", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.waitForSelector("#grid .card", { timeout: 30000 });
  await page.locator("#searchInput").fill("ppt");
  await page.waitForTimeout(600);
  // 过滤后允许结果为 0（无匹配）但不应崩溃，且必须无运行时报错
  const empty = await page.locator("#emptyState").count();
  const cards = await page.locator("#grid .card").count();
  expect(empty > 0 || cards > 0).toBeTruthy();
  expect(errors).toEqual([]);
});
