// tools/lib/data-sync.test.mjs — 数据链路单一源校验（权威源 → 内联 / 发布副本 / 白名单）
// 运行：npm test（node --test tools/lib/*.test.mjs）
//
// 权威源唯一为 data/skills-data.json；下列派生产物必须与其严格一致，
// 否则会出现「内联数据 168 个、data 169 个」这类历史漂移。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const readText = (rel) => readFileSync(join(root, rel), "utf8");

const data = JSON.parse(readText("data/skills-data.json"));
const html = readText("src/index.html");

/** 解析 src/index.html 内联的 window.SKILLS_DATA */
function inlineData() {
  const m = html.match(/window\.SKILLS_DATA = (\{[\s\S]*?\});<\/script>/);
  assert.ok(m, "未找到内联 window.SKILLS_DATA");
  return JSON.parse(m[1]);
}

test("静态发布副本与权威数据逐字节一致", () => {
  assert.equal(
    readText("public/data/skills-data.json"),
    readText("data/skills-data.json"),
    "public/data/skills-data.json 应由 npm run sync:data 生成，不得手工维护"
  );
});

test("内联数据与权威数据的技能集合一致", () => {
  const inline = inlineData();
  const expected = data.skills.map((s) => s.name).sort();
  assert.deepEqual(inline.skills.map((s) => s.name).sort(), expected, "内联技能集合与权威数据不一致");
});

test("内联 total 等于可见技能数（实算，非手填）", () => {
  const inline = inlineData();
  const visible = data.skills.filter((s) => !s.hidden).length;
  assert.equal(inline.total, visible, "内联 total 与可见技能数不一致");
  assert.equal(data.total, visible, "data.total 与可见技能数不一致");
});

test("内联 categories / categoryEn 均由权威数据派生", () => {
  const inline = inlineData();
  const order = [];
  const catEn = {};
  for (const s of data.skills) {
    if (!order.includes(s.category)) order.push(s.category);
    if (s.enCategory && !catEn[s.category]) catEn[s.category] = s.enCategory;
  }
  assert.deepEqual(inline.categories, order, "内联 categories 与数据派生结果不一致");
  assert.deepEqual(inline.categoryEn, catEn, "内联 categoryEn 与数据派生结果不一致");
});

test("Serverless 白名单清单与权威数据一致", () => {
  const names = JSON.parse(readText("server/skill-names.json"));
  assert.deepEqual(
    names.names.slice().sort(),
    data.skills.map((s) => s.name).sort(),
    "server/skill-names.json 与权威数据不一致"
  );
});

test("内联数据中不含未转义的 </script>", () => {
  const raw = html.match(/<script>window\.SKILLS_DATA = ([\s\S]*?);<\/script>/)[1];
  assert.doesNotMatch(raw, /<\/script/i, "内联 JSON 必须转义 < 以免提前闭合脚本标签");
});