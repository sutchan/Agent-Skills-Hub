// app/lib/skillSlug.ts v1.20.6 — 由技能名派生稳定 slug（对齐 prototype 01-state.js skillSlug）
// 原型卡片 id 使用 skill-${skillSlug(name)}，app 侧保持一致以保证 E2E 选择器与两层 id 统一。
export function skillSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
