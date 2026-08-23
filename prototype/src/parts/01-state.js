// prototype/src/parts/01-state.js v1.20.17 — 常量、偏好状态与纯工具函数
// 轻量 DOM 选择器：所有 parts 共享同一作用域，统一在此定义一次
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

// 统计事件上报：仅当页面已注入 GA（window.gtag 存在）时上报，否则静默（不报错、不依赖第三方）
function track(event, params) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", event, params || {});
    }
  } catch (e) { /* 统计失败不影响主流程 */ }
}

const LS_THEME = "ash-theme", LS_LANG = "ash-lang", LS_VIEW = "ash-view", LS_DENSITY = "ash-density";
const LS_SHOW_DESC = "ash-show-desc", LS_SHOW_CAT = "ash-show-cat", LS_SHOW_BAR = "ash-show-bar";
const LS_NAME_MODE = "ash-name-mode";
const NAME_MODE_BOTH = "both", NAME_MODE_ZH = "zh", NAME_MODE_EN = "en";
const VIEW_GRID = "grid", VIEW_LIST = "list";
const DENSITY_COMFORT = "comfortable", DENSITY_COMPACT = "compact";
const DEBOUNCE_MS = 120;
// 分页：每页 48 条（用户需求）
const PAGE_SIZE = 48;

const state = {
  theme: "light",
  lang: "zh",
  view: VIEW_GRID,
  density: DENSITY_COMFORT,
  // UI 元素显隐设置：默认全部开启（恢复用户熟悉的高信息密度卡片）
  showDesc: true,
  showCat: true,
  showBar: true,
  // 名称显示策略：默认双显（中文名主 + 英文原名副），可切仅中文 / 仅英文
  nameMode: NAME_MODE_BOTH,
  query: "",
  // 分类筛选（多选 OR，空数组 = 全部）；v1.19.8 起由单选 cat 升级为多选 cats
  cats: [],
  // 功能标签筛选（多选 OR，空数组 = 全部）；与 cats 以 AND 组合（v1.20.12）
  tags: [],
  // 排序：name↑（默认，按 name）/ name↓ / cat（按分类）/ zh（按中文名）
  sort: "name",
  // 当前页码（0 基），切换筛选/搜索/排序时重置为 0
  page: 0,
};

// 偏好读取辅助：校验合法枚举值，非法则回退默认（避免脏 localStorage 破坏状态）
function loadEnum(key, allowed, fallback) {
  const v = loadPref(key, null);
  return allowed.indexOf(v) !== -1 ? v : fallback;
}

function loadPref(key, fallback) {
  try { const v = localStorage.getItem(key); return v == null ? fallback : v; } catch (e) { return fallback; }
}
function savePref(key, val) {
  try { localStorage.setItem(key, val); } catch (e) { /* 隐私模式忽略 */ }
}

// 取名字首字母（无空格则取前两位），用于头像
function initials(name) {
  const clean = (name || "").replace(/[^A-Za-z0-9]/g, " ");
  const parts = clean.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// 防 XSS：转义 HTML 特殊字符（属性用双引号包裹）+ 模板注入符（反引号、${）
// 因卡片/弹窗内容经模板字符串内插，反引号与 ${ 会破坏模板或引入注入，故一并转义
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/`/g, "&#96;")
    .replace(/\$\{/g, "&#36;&#123;");
}

// 由类别名稳定派生色相（0-359），与 app SkillsExplorer 的 catHue 算法一致，保证两层同分类同色
function catHue(c) {
  let h = 0;
  for (let i = 0; i < c.length; i++) h = (h * 31 + c.charCodeAt(i)) % 360;
  return h;
}

// 预聚合分类计数（Map: cat -> count），renderCats 直接查表
function catCounts() {
  const m = new Map();
  SKILLS_DATA.skills.forEach((s) => { if (!s.hidden) m.set(s.category, (m.get(s.category) || 0) + 1); });
  return m;
}

// 预聚合功能标签计数（Map: tag slug -> count），renderTags 直接查表（v1.20.12）
function tagCounts() {
  const m = new Map();
  SKILLS_DATA.skills.forEach((s) => {
    if (s.hidden || !Array.isArray(s.tags)) return;
    s.tags.forEach((t) => m.set(t, (m.get(t) || 0) + 1));
  });
  return m;
}

// 名称 -> 技能对象索引（01-state 共享作用域），避免每次卡片点击线性扫描全部技能
let SKILL_MAP = new Map();

// 搜索匹配：名称 / 描述 / 分类（不区分大小写）
// 支持多词 AND：terms 为预切分的小写词表（由 02-render.queryTerms 缓存传入，避免每张卡重复 split）
// 预聚合小写检索串缓存在 s._hay（见 05-main init），避免每次输入重复拼接+小写化
function matches(s, terms) {
  if (!terms || !terms.length) return true;
  const hay = s._hay != null ? s._hay : (s.name + " " + s.zh + " " + s.description + " " + (s.enDescription || "") + " " + s.category + " " + (s.enCategory || "")).toLowerCase();
  return terms.every((term) => hay.includes(term));
}
