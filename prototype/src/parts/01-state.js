// prototype/src/parts/01-state.js v1.14.52 — 常量、偏好状态与纯工具函数
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

const LS_THEME = "ash-theme", LS_LANG = "ash-lang";
const VIEW_GRID = "grid", VIEW_LIST = "list";
const DEBOUNCE_MS = 120;

const state = {
  theme: "light",
  lang: "zh",
  view: VIEW_GRID,
  query: "",
  cat: null,
};

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

// 防 XSS：转义 HTML 特殊字符（属性用双引号包裹，单引号无需转义）
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 预聚合分类计数（Map: cat -> count），renderCats 直接查表
function catCounts() {
  const m = new Map();
  SKILLS_DATA.skills.forEach((s) => m.set(s.category, (m.get(s.category) || 0) + 1));
  return m;
}

// 名称 -> 技能对象索引（01-state 共享作用域），避免每次卡片点击线性扫描全部技能
let SKILL_MAP = new Map();

// 搜索匹配：名称 / 描述 / 分类（不区分大小写）
// 预聚合小写检索串缓存在 s._hay（见 05-main init），避免每次输入重复拼接+小写化
function matches(s, q) {
  if (!q) return true;
  const hay = s._hay != null ? s._hay : (s.name + " " + s.zh + " " + s.description + " " + s.category).toLowerCase();
  return hay.includes(q.toLowerCase());
}
