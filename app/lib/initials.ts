// app/lib/initials.ts v1.19.29 — 由技能名稳定派生首字母缩写（对齐 prototype 01-state.js）
// 供卡片头像与详情头像复用，避免重复实现漂移。
export function initials(name: string): string {
  const parts = name.split(/[-_\s]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
