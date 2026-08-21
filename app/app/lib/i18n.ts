// app/lib/i18n.ts v1.14.72 — 双语字典（单一事实来源，对齐 prototype/src/i18n.js）
// 键名与 prototype 保持一致，便于双向对齐；t() 永不抛错，缺失键回退 zh / 原文。
import type { Lang } from "./share";

const D: Record<string, { zh: string; en: string }> = {
  "brand.subtitle": { zh: "高质量 Agent 技能库", en: "Curated agent skill library" },
  "hero.eyebrow": { zh: "Agent 技能枢纽", en: "Agent Skills Hub" },
  "hero.title": { zh: "零散的 agent 技能，汇聚成一处可检索的枢纽", en: "Scattered agent skills, unified into one searchable hub" },
  "hero.subtitle": { zh: "按分类浏览、搜索，或查看技能详情——为你的编码 agent 即取即用。", en: "Browse by category, search, or inspect skill details — ready to drop into your coding agent." },
  "stat.total": { zh: "技能总数", en: "Total skills" },
  "stat.cats": { zh: "分类", en: "Categories" },
  "search.placeholder": { zh: "搜索技能名称或描述…", en: "Search skills by name or description…" },
  "detail.zhTitle": { zh: "中文描述", en: "Description (zh)" },
  "detail.enTitle": { zh: "英文说明", en: "Description (en)" },
  "detail.toolsTitle": { zh: "授权工具 / Allowed tools", en: "Allowed tools / 授权工具" },
  "detail.close": { zh: "关闭 / Close", en: "Close / 关闭" },
  "detail.open": { zh: "查看技能", en: "Open skill" },
  "detail.openEn": { zh: "Open skill", en: "Open skill" },
  "empty.title": { zh: "未找到匹配的技能", en: "No matching skills" },
  "empty.desc": { zh: "换个关键词或分类试试，或清除当前筛选。", en: "Try a different keyword or category, or clear the current filter." },
  "empty.clear": { zh: "清除筛选", en: "Clear filters" },
  "share.btn": { zh: "分享", en: "Share" },
  "share.copied": { zh: "已复制到剪贴板", en: "Copied to clipboard" },
  "share.failed": { zh: "复制失败，请手动复制", en: "Copy failed, please copy manually" },
  "filter.all": { zh: "全部", en: "All" },
  "footer.copyright": { zh: "开源免费 · MIT 协议", en: "Open source · MIT License" },
};

/** 取词：缺失键回退 zh，再缺失回退 key 原文，绝不抛错（对齐 prototype I18N.t） */
export function t(lang: Lang, key: string): string {
  const e = D[key];
  if (!e) return key;
  return lang === "en" ? e.en : e.zh;
}
