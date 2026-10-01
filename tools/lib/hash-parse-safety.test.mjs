// tools/lib/hash-parse-safety.test.mjs — SkillsExplorer parseHash 二次解码崩溃回归测试
//
// 缺陷背景（app/components/SkillsExplorer.tsx parseHash）：
//   writeHash 写入 hash 时经 encodeURIComponent 编码（如搜索 "50%" 写入 #q=50%25）；
//   URLSearchParams 解析时已解码一次（%25 -> %），parseHash 又对结果二次 decodeURIComponent。
//   当 hash 含孤立 %（"50%"、"50%off"）时，decodeURIComponent 抛出 URIError 且未被捕获，
//   挂载 useEffect / hashchange 中抛出会导致 React 应用崩溃（刷新或前进/后退即触发）。
// 修复：解码失败时安全降级保留原始值。本测试以相同逻辑模式模拟浏览器端行为契约。
import { test } from "node:test";
import assert from "node:assert/strict";

// 与 SkillsExplorer.tsx parseHash 相同的安全解码策略
function safeDecode(v) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

// 模拟 parseHash 的 cat / q 解码路径（保持与组件一致）
function parseHash(raw) {
  const p = new URLSearchParams(raw.replace(/^#/, ""));
  const out = {};
  if (p.has("cat")) {
    const cats = p.get("cat").split(",").map((c) => safeDecode(c)).filter(Boolean);
    if (cats.length) out.cats = cats;
  }
  if (p.has("q")) out.q = safeDecode(p.get("q"));
  return out;
}

test("正常搜索词往返（含 % 与中文）不抛异常且正确还原", () => {
  const q = "50% 完成";
  const written = encodeURIComponent(q); // writeHash 编码
  const out = parseHash(`#q=${written}`);
  assert.equal(out.q, q);
});

test("孤立 % 的 hash 不再抛出 URIError（原崩溃回归）", () => {
  // 用户搜索 "50%" 后刷新：writeHash 写入 #q=50%25，URLSearchParams 解码为 "50%"
  assert.doesNotThrow(() => parseHash("#q=50%25"));
  assert.equal(parseHash("#q=50%25").q, "50%");
  // 直接访问畸形 hash 链接
  assert.doesNotThrow(() => parseHash("#q=50%off"));
  assert.doesNotThrow(() => parseHash("#cat=bad%zz"));
});

test("分类参数含孤立 % 时安全降级且其余分类保留", () => {
  const out = parseHash("#cat=dev%tools,ai");
  assert.deepEqual(out.cats, ["dev%tools", "ai"]);
});

test("空 hash 与无参数 hash 安全返回空对象", () => {
  assert.deepEqual(parseHash(""), {});
  assert.deepEqual(parseHash("#"), {});
});
