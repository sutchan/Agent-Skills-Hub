// app/lib/i18n.ts v1.18.0 — 双语字典（单一事实来源，对齐 prototype/src/i18n.js）
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
  // 无障碍标签：被 LangToggle / ThemeToggle 的 aria-label 引用（修复缺失键导致显示 key 原文）
  "a11y.lang": { zh: "切换语言", en: "Switch language" },
  "a11y.theme": { zh: "切换主题", en: "Switch theme" },
  "a11y.settings": { zh: "设置", en: "Settings" },
  "a11y.backTop": { zh: "回到顶部", en: "Back to top" },
  // 设置弹窗（对齐 prototype 03-detail.js openSettings 四组）
  "settings.title": { zh: "设置", en: "Settings" },
  "settings.langGroup": { zh: "语言 / Language", en: "Language" },
  "settings.language": { zh: "界面语言", en: "Interface language" },
  "settings.langZh": { zh: "中文", en: "中文" },
  "settings.langEn": { zh: "English", en: "English" },
  "settings.themeGroup": { zh: "主题 / Theme", en: "Theme" },
  "settings.theme": { zh: "外观主题", en: "Appearance theme" },
  "settings.themeLight": { zh: "浅色 / Light", en: "Light" },
  "settings.themeDark": { zh: "深色 / Dark", en: "Dark" },
  "settings.viewGroup": { zh: "布局 / Layout", en: "Layout" },
  "settings.view": { zh: "视图模式", en: "View mode" },
  "settings.viewGrid": { zh: "网格 / Grid", en: "Grid" },
  "settings.viewList": { zh: "列表 / List", en: "List" },
  "settings.densityGroup": { zh: "密度 / Density", en: "Density" },
  "settings.density": { zh: "卡片间距", en: "Card spacing" },
  "settings.densityComfortable": { zh: "舒适 / Comfortable", en: "Comfortable" },
  "settings.densityCompact": { zh: "紧凑 / Compact", en: "Compact" },
  "settings.done": { zh: "完成", en: "Done" },
  // 结果计数（对齐 prototype 04-interactions resultCount，aria-live）
  "result.count": { zh: "共 {n} 个结果", en: "{n} results" },
  "result.empty": { zh: "无匹配结果", en: "No results" },
};

/** 取词：缺失键回退 zh，再缺失回退 key 原文，绝不抛错（对齐 prototype I18N.t） */
export function t(lang: Lang, key: string): string {
  const e = D[key];
  if (!e) return key;
  return lang === "en" ? e.en : e.zh;
}
