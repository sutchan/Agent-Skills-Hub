// 赞/踩功能结构与运行校验（原型产物）
import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const out = readFileSync("prototype/prototype.html", "utf8");

console.log("== 结构检查 ==");
const struct = [
  ['<div class="card"', "卡片为 div 容器"],
  ['class="card-open"', "打开触发区 button"],
  ['class="card-vote"', "投票行容器"],
  ['class="vote-btn vote-up"', "赞按钮"],
  ['class="vote-btn vote-down"', "踩按钮"],
  ["data-vote-row", "投票行豁免标记"],
  ["aria-pressed", "投票状态可访问性属性"],
];
struct.forEach(([k, n]) => console.log(`  ${out.includes(k) ? "OK  " : "MISS"} ${n}`));
console.log(`  ${!out.includes('<button type="button" class="card"') ? "OK  " : "BAD "}卡片已不再是 button`);
console.log(`  ${!out.includes(".card:focus-visible") ? "OK  " : "BAD "}旧 .card:focus-visible 已移除`);

const url = "file:///" + process.cwd().replace(/\\/g, "/") + "/prototype/prototype.html";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
page.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(500);

const cardCount = await page.locator(".card").count();
const btnCount = await page.locator(".card .vote-btn").count();
const openCount = await page.locator("button.card-open").count();
const nested = await page.evaluate(() =>
  document.querySelectorAll("button button, button .vote-btn, .card-open button").length
);
console.log("== 运行期 ==");
console.log(`  卡片 ${cardCount} 张 / 投票按钮 ${btnCount} 个 / 触发按钮 ${openCount} 个`);
console.log(`  ${cardCount * 2 === btnCount ? "OK  " : "BAD "}每卡 2 个投票按钮`);
console.log(`  ${nested === 0 ? "OK  " : "BAD "}无嵌套可交互元素（实测 ${nested}）`);

const c0 = page.locator(".card").first();
await c0.locator('.vote-btn[data-vote="up"]').click();
await c0.locator('.vote-btn[data-vote="down"]').click();
const st = await c0.evaluate((el) => ({
  up: el.querySelector('.vote-btn[data-vote="up"]').getAttribute("aria-pressed"),
  down: el.querySelector('.vote-btn[data-vote="down"]').getAttribute("aria-pressed"),
  upN: el.querySelector('.vote-btn[data-vote="up"] .vote-count').textContent,
  downN: el.querySelector('.vote-btn[data-vote="down"] .vote-count').textContent,
  detail: document.querySelectorAll(".detail").length,
}));
console.log(`  赞+踩 后: up=${st.up}(${st.upN}) down=${st.down}(${st.downN}) 详情弹窗=${st.detail} ${st.detail === 0 ? "OK" : "BAD"}`);
console.log(`  ${st.up === "true" && st.down === "true" ? "OK  " : "BAD "}双计数独立、互不抵消`);

console.log("  控制台错误:", errs.length ? errs : "无");
await browser.close();
