import { test, expect } from "@playwright/test";

// 轻量 e2e 冒烟：覆盖「应用可加载、关键模块渲染、核心交互不崩溃」。
// 针对 `next build` 产物（webServer 自动 `next start`）。

test("首页加载并渲染技能卡片", async ({ page }) => {
  const resp = await page.goto("/");
  expect(resp?.status()).toBe(200);
  await expect(page).toHaveTitle(/Agent Skills Hub/);
  await expect(page.locator("#appHeader")).toBeVisible();
  await expect(page.locator("#hero")).toBeVisible();
  const count = await page.locator(".card").count();
  expect(count).toBeGreaterThan(0);
  // 卡片容器为 div，可点击/可聚焦的触发区是 .card-open（赞/踩为其同级独立按钮）
  expect(await page.locator("button.card-open").count()).toBe(count);
});

test("点开技能详情弹窗正常渲染", async ({ page }) => {
  await page.goto("/");
  await page.locator("button.card-open").first().click();
  await expect(page.locator(".detail").first()).toBeVisible({ timeout: 5000 });
});

test("赞/踩计数独立且可持久化", async ({ page }) => {
  await page.goto("/");
  const card = page.locator(".card").first();
  const up = card.locator('.vote-btn[data-vote="up"]');
  const down = card.locator('.vote-btn[data-vote="down"]');

  await up.click();
  await expect(up).toHaveAttribute("aria-pressed", "true");
  await expect(down).toHaveAttribute("aria-pressed", "false");
  // 赞 1 次后踩 1 次：两者同时为 1，互不抵消
  await down.click();
  await expect(up).toHaveAttribute("aria-pressed", "true");
  await expect(down).toHaveAttribute("aria-pressed", "true");
  await expect(up.locator(".vote-count")).toHaveText("1");
  await expect(down.locator(".vote-count")).toHaveText("1");

  // 投票不得触发详情弹窗
  await expect(page.locator(".detail")).toHaveCount(0);

  // 刷新后仍在（localStorage 持久化）
  await page.reload();
  await expect(page.locator('.vote-btn[data-vote="up"]').first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('.vote-btn[data-vote="down"]').first()).toHaveAttribute("aria-pressed", "true");

  // 再点赞该项即取消该项，另一方向不受影响
  await page.locator('.vote-btn[data-vote="up"]').first().click();
  await expect(page.locator('.vote-btn[data-vote="up"]').first()).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator('.vote-btn[data-vote="down"]').first()).toHaveAttribute("aria-pressed", "true");
});

test("语言切换可交互（data-lang 在 zh/en 间切换）", async ({ page }) => {
  await page.goto("/");
  const before = await page.evaluate(() =>
    document.documentElement.getAttribute("data-lang")
  );
  expect(before).toBe("zh");
  await page.locator("#langBtn").click();
  const after = await page.evaluate(() =>
    document.documentElement.getAttribute("data-lang")
  );
  expect(after).toBe("en");
});
