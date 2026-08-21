// app/lib/catHue.ts v1.14.72 — 由类别名稳定派生色相（对齐 prototype 01-state.js catHue）
// 保证 app 与原型同分类同色；输出 0-359，供 .cat-bar / .chip 的 --hue 使用。
export function catHue(c: string): number {
  let h = 0;
  for (let i = 0; i < c.length; i++) h = (h * 31 + c.charCodeAt(i)) % 360;
  return h;
}
