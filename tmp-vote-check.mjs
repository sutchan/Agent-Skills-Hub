// 原型侧赞/踩行为验证 + 截图
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

mkdirSync("tmp-shots", { recursive: true });
const url = "file:///" + process.cwd().replace(/\\/g, "/") + "/prototype/prototype.html";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(600);

const card = page.locator(".card").first();
const up = card.locator('.vote-btn[data-vote="up"]');
const down = card.locator('.vote-btn[data-vote="down"]');

const state = async () => ({
  up: await up.getAttribute("aria-pressed"),
  down: await down.getAttribute("aria-pressed"),
  upN: await up.locator(".vote-count").textContent(),
  downN: await down.locator(".vote-count").textContent(),
  detailOpen: await page.locator(".detail").count(),
});

console.log("初始:", JSON.stringify(await state()));
await up.click();
await page.waitForTimeout(150);
console.log("赞+1:", JSON.stringify(await state()));
await down.click();
await page.waitForTimeout(150);
console.log("踩+1（赞应保持）:", JSON.stringify(await state()));
await up.click();
await page.waitForTimeout(150);
console.log("再赞（取消赞，踩应保持）:", JSON.stringify(await state()));
await down.click();
await page.waitForTimeout(150);
console.log("再踩（应全清）:", JSON.stringify(await state()));

// 持久化：赞一次后刷新
await up.click();
await page.waitForTimeout(150);
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(600);
const after = await page.locator('.vote-btn[data-vote="up"]').first().getAttribute("aria-pressed");
const afterN = await page.locator('.vote-btn[data-vote="up"]').first().locator(".vote-count").textContent();
console.log("刷新后 赞 aria-pressed=" + after + " 计数=" + afterN);

// 卡片点击仍能打开详情
await page.locator("button.card-open").first().click();
await page.waitForTimeout(400);
console.log("点 .card-open 后 detail 数:", await page.locator(".detail").count());
// 关闭详情，避免遮罩挡住后续截图前的点击
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
console.log("Esc 关闭后 detail 数:", await page.locator(".detail").count());

// 截图：默认态 + 已赞/已踩混合态
const up2 = page.locator(".card").nth(1).locator('.vote-btn[data-vote="up"]');
const down2 = page.locator(".card").nth(2).locator('.vote-btn[data-vote="down"]');
await up2.click();
await down2.click();
await page.waitForTimeout(200);
await page.evaluate(() => { const t = document.querySelector("#toTop"); if (t) t.style.display = "none"; });
const grid = await page.locator("#grid").boundingBox();
await page.screenshot({ path: "tmp-shots/vote-grid.png", clip: { x: 0, y: grid.y, width: 1280, height: Math.min(430, grid.height) } });

// 列表态
await page.locator('.view-btn[data-view="list"]').click();
await page.waitForTimeout(400);
const grid2 = await page.locator("#grid").boundingBox();
await page.screenshot({ path: "tmp-shots/vote-list.png", clip: { x: 0, y: Math.max(0, grid2.y), width: 1280, height: Math.min(300, grid2.height) } });

console.log("控制台错误:", errors.length ? errors : "无");
await browser.close();
