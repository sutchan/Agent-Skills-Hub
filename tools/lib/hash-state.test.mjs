// tools/lib/hash-state.test.mjs v1.0.2 — src/lib/hash-state.ts 回归测试
// 覆盖：writeHash/parseHash 往返一致；分类单选；旧版多选链接（#cat=a,b）取首值；
// 含字面 % 的查询不再因双重解码抛 URIError。
import test from "node:test";
import assert from "node:assert/strict";
import { parseHash, writeHash } from "../../src/lib/hash-state.ts";

test("round-trip：writeHash 编码 -> parseHash 解码，中文/空格/分类单选一致", () => {
  const h = writeHash({ cat: "文档", q: "vue 组件", sort: "zh", page: 2 });
  assert.equal(h, "#cat=%E6%96%87%E6%A1%A3&q=vue%20%E7%BB%84%E4%BB%B6&sort=zh&page=2");
  const parsed = parseHash(h);
  assert.equal(parsed.cat, "文档");
  assert.equal(parsed.q, "vue 组件");
  assert.equal(parsed.sort, "zh");
  assert.equal(parsed.page, 2);
});

test("分类单选：hash 同一时刻只承载一个分类", () => {
  assert.equal(writeHash({ cat: "前端开发", q: "", sort: "name", page: 0 }), "#cat=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91");
  assert.equal(parseHash("#cat=docs").cat, "docs");
});

test("兼容旧版多选链接：#cat=a,b 取第一个有效值（其余丢弃）", () => {
  // v1.14.82 之前分类为多选，链接形如 #cat=a,b ；单选模式须优雅降级而非整段失效
  assert.equal(parseHash("#cat=docs,ai-agent").cat, "docs");
  assert.equal(parseHash("#cat=,docs").cat, "docs");
  assert.equal(parseHash("#cat=docs,").cat, "docs");
  // 无任何有效值时视为无分类筛选
  assert.equal(parseHash("#cat=").cat, undefined);
  assert.equal(parseHash("#cat=,").cat, undefined);
});

test("回归：查询含字面 % 时 parseHash 不抛 URIError（此前二次解码崩溃）", () => {
  // 用户输入 "100%" -> writeHash -> "#q=100%25"；刷新后 parseHash 必须还原为 "100%" 而非抛异常
  const h = writeHash({ cat: "", q: "100%", sort: "name", page: 0 });
  assert.equal(h, "#q=100%25");
  assert.doesNotThrow(() => parseHash(h));
  assert.equal(parseHash(h).q, "100%");
  // 外部粘贴的裸 % hash 同样不应崩溃
  assert.doesNotThrow(() => parseHash("#q=100%"));
  assert.equal(parseHash("#q=100%").q, "100%");
  // URLSearchParams 已解码的内容不再二次解码
  assert.equal(parseHash("#q=50%25%20off").q, "50% off");
});

test("parseHash：无 hash / 无效参数安全返回", () => {
  assert.deepEqual(parseHash(""), {});
  assert.deepEqual(parseHash("#sort=invalid"), {});
  assert.deepEqual(parseHash("#page=0"), {});
  assert.equal(parseHash("#page=3").page, 3);
});

test("writeHash：空状态返回空串（组件据此清理 hash）", () => {
  assert.equal(writeHash({ cat: "", q: "", sort: "name", page: 0 }), "");
});
