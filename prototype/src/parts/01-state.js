// prototype/src/parts/01-state.js v1.14.6 — 常量、偏好状态与纯工具函数
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

// 搜索匹配：名称 / 描述 / 分类（不区分大小写）
function matches(s, q) {
  if (!q) return true;
  const hay = (s.name + " " + s.zh + " " + s.description + " " + s.category).toLowerCase();
  return hay.includes(q.toLowerCase());
}
