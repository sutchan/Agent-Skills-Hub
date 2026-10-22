import { test, expect } from "@playwright/test";

// 冒烟测试：验证本地 express 服务（bun run start → server.js @3000）能正常渲染技能网格与基础交互。
// 对应 tasks.md #1 / spec §8.4：此前 playwright 指向 ./e2e 但目录缺失，流水线 e2e job 空跑失败。

test("首页加载并渲染技能卡片", async ({ page }) => {
  await page.goto("/");
  // 等待技能网格渲染出至少一个子节点（不依赖具体卡片类名，避免与渲染实现耦合）
  await page.waitForFunction(() => {
    const g = document.querySelector("#grid");
    return !!g && g.children.length > 0;
  }, { timeout: 30000 });
  const count = await page.locator("#grid *").count();
  expect(count).toBeGreaterThan(0);
});

test("搜索框可过滤技能", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("#grid");
  const box = page.locator("#search");
  await box.fill("ppt");
  await page.waitForTimeout(600);
  // 过滤后网格不为报错态；允许结果为 0（无匹配）但不应崩溃
  const hasEmpty = await page.locator("#emptyState").count();
  const hasCards = await page.locator("#grid *").count();
  expect(hasEmpty > 0 || hasCards > 0).toBeTruthy();
});
