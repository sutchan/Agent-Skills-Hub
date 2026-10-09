// src/components/SkillsExplorer.filters.ts v1.14.89 — 筛选 / 排序 / 分页纯函数（无副作用）
import type { Skill } from "../lib/skills";
import type { SortKey } from "./SkillsExplorer.hash";

// 每页 36 条 —— 对齐原型 prototype/src/parts/01-state.js PAGE_SIZE=36（原型为设计权威源）
export const PAGE_SIZE = 36;

// 各分类技能计数（对齐 prototype 02-render aggregateFilters 的 agg.cats），驱动 .chip-count 展示
export function computeCatCounts(skills: Skill[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const s of skills) m[s.category] = (m[s.category] || 0) + 1;
  return m;
}

export function filterAndSort(opts: {
  skills: Skill[];
  q: string;
  cat: string;
  sort: SortKey;
}): Skill[] {
  const { skills, q, cat, sort } = opts;
  const kw = q.trim().toLowerCase();
  const list = skills.filter((s) => {
    if (s.hidden) return false;
    if (cat && s.category !== cat) return false;
    if (kw && !(`${s.name} ${s.zh || ""} ${s.description} ${s.enDescription || ""} ${s.category} ${s.enCategory || ""}`.toLowerCase().includes(kw))) return false;
    return true;
  });
  const cmp: Record<SortKey, (a: Skill, b: Skill) => number> = {
    name: (a, b) => String(a.name).localeCompare(String(b.name)),
    "name-desc": (a, b) => String(b.name).localeCompare(String(a.name)),
    cat: (a, b) => String(a.category).localeCompare(String(b.category), "zh") || String(a.name).localeCompare(String(b.name)),
    zh: (a, b) => String(a.zh || a.name).localeCompare(String(b.zh || b.name), "zh"),
  };
  return [...list].sort(cmp[sort]);
}
