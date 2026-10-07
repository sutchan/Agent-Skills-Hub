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

test("赞为累加制：可叠加、可撤销、可持久化", async ({ page }) => {
  await page.goto("/");
  const card = page.locator(".card").first();
  const up = card.locator('.vote-btn[data-vote="up"]');

  // 初始未赞：计数 0，且不渲染撤销按钮
  await expect(up.locator(".vote-count")).toHaveText("0");
  await expect(card.locator(".vote-btn.vote-undo")).toHaveCount(0);

  // 累加：连点三次 → 计数 3（v1.14.85 起为累加制，非布尔开关）
  await up.click();
  await up.click();
  await up.click();
  await expect(up.locator(".vote-count")).toHaveText("3");
  await expect(card.locator(".vote-btn.vote-undo")).toHaveCount(1);

  // 投票不得触发详情弹窗
  await expect(page.locator(".detail")).toHaveCount(0);

  // 刷新后仍在（localStorage 持久化）
  await page.reload();
  await expect(
    page.locator('.vote-btn[data-vote="up"]').first().locator(".vote-count")
  ).toHaveText("3");

  // 撤销 → 归零且撤销按钮消失
  await page.locator(".vote-btn.vote-undo").first().click();
  await expect(
    page.locator('.vote-btn[data-vote="up"]').first().locator(".vote-count")
  ).toHaveText("0");
  await expect(page.locator(".vote-btn.vote-undo")).toHaveCount(0);
});

test("详情弹窗含投票区、口径说明与上报入口", async ({ page }) => {
  await page.goto("/");
  await page.locator("button.card-open").first().click();
  await expect(page.locator(".detail").first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator("#detailVote")).toBeVisible();
  // 口径说明必须存在：区分「热度」（构建期派生）与「赞」（用户反馈）
  await expect(page.locator("#detailVote .d-vote-note")).toBeVisible();
  await expect(page.locator("#exportVotesBtn")).toBeVisible();
  await expect(page.locator("#reportIssueLink")).toBeVisible();
  // 踩已移除：全站不应再出现向下投票按钮
  await expect(page.locator('.vote-btn[data-vote="down"]')).toHaveCount(0);
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
