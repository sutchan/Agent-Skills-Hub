// tools/lib/frontmatter.test.mjs — 手写 YAML frontmatter 解析回归测试
// 覆盖：纯量/引号、行内 # 注释剥离、折叠标量(>)、字面量标量(|)、嵌套块跳过、缺失块返回 {}
import { test } from "node:test";
import assert from "node:assert";
import { parseFrontmatter, stripInlineComment, BLOCK_SCALAR } from "./frontmatter.mjs";

test("① 普通标量 / 引号解析", () => {
  const fm = parseFrontmatter("---\nname: foo\ndescription: \"hello world\"\n---\n");
  assert.strictEqual(fm.name, "foo");
  assert.strictEqual(fm.description, "hello world");
});

test("② 行内 # 注释剥离（引号内 # 不误删）", () => {
  const fm = parseFrontmatter("---\nname: foo # trailing comment\ntag: \"a # b\"\n---\n");
  // 注释前为空格 → 剥离
  assert.strictEqual(fm.name, "foo");
  // 引号内的 # 不视为注释
  assert.strictEqual(fm.tag, "a # b");
});

test("③ 折叠标量（>）按空行分段、段内空格连接", () => {
  const fm = parseFrontmatter("---\ndescription: >\n  line one\n  line two\n\n  line three\n---\n");
  assert.strictEqual(fm.description, "line one line two\nline three");
});

test("④ 字面量标量（|）保留换行", () => {
  const fm = parseFrontmatter("---\ndescription: |\n  alpha\n  beta\n\n  gamma\n---\n");
  assert.strictEqual(fm.description, "alpha\nbeta\n\ngamma");
});

test("⑤ 顶层嵌套块（有缩进）整体跳过", () => {
  const fm = parseFrontmatter("---\nname: foo\nmetadata:\n  author: bar\ncategory: 安全\n---\n");
  assert.strictEqual(fm.name, "foo");
  // 嵌套 author 被跳过，metadata 为顶层空值
  assert.strictEqual(fm.metadata, "");
  assert.strictEqual(fm.category, "安全");
  assert.strictEqual("author" in fm, false);
});

test("⑥ 缺失 --- 块返回 {} ", () => {
  assert.deepStrictEqual(parseFrontmatter("plain text without delimiters"), {});
});

test("辅助导出：BLOCK_SCALAR / stripInlineComment", () => {
  assert.ok(BLOCK_SCALAR.test(">"));
  assert.ok(BLOCK_SCALAR.test("|-"));
  assert.ok(BLOCK_SCALAR.test("|"));
  assert.ok(!BLOCK_SCALAR.test(""));
  assert.strictEqual(stripInlineComment("foo # c"), "foo");
  assert.strictEqual(stripInlineComment('"a # b"'), '"a # b"');
});
