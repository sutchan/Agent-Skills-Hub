// prototype/src/parts/05-main.js v1.14.88 — 应用启动编排
// URL hash 深链：筛选/搜索/排序/页码可分享、刷新可还原（P0-1）
// 序列化规则：#cat=docs&q=xxx&sort=name&page=2，无筛选时清空 hash（分类为单选，仅一个值）
function writeHash() {
  const parts = [];
  if (state.cats) parts.push("cat=" + encodeURIComponent(state.cats));
  if (state.query.trim()) parts.push("q=" + encodeURIComponent(state.query.trim()));
  if (state.sort && state.sort !== "name") parts.push("sort=" + encodeURIComponent(state.sort));
  if (state.page > 0) parts.push("page=" + state.page);
  const h = parts.length ? "#" + parts.join("&") : "";
  // 仅当不同时才改写，避免触发多余 hashchange
  if (location.hash !== h) history.replaceState(null, "", h || location.pathname + location.search);
}
// 解析 hash 写回 state；返回是否发生变更（供 init 决定是否重渲）
function parseHash() {
  const raw = location.hash.replace(/^#/, "");
  if (!raw) return false;
  const params = new URLSearchParams(raw);
  let changed = false;
  if (params.has("cat")) {
    // 单选：仅取一个分类；兼容旧版多选链接（#cat=a,b），取第一个有效值
    const cat = params.get("cat").split(",").map((c) => decodeURIComponent(c)).filter(Boolean)[0] || "";
    if (cat !== state.cats) { state.cats = cat; changed = true; }
  }
  if (params.has("q")) {
    const q = decodeURIComponent(params.get("q"));
    if (q !== state.query) { state.query = q; changed = true; }
  }
  if (params.has("sort")) {
    const sort = params.get("sort");
    if (sort !== state.sort) { state.sort = sort; changed = true; }
  }
  if (params.has("page")) {
    const p = parseInt(params.get("page"), 10);
    if (!Number.isNaN(p) && p !== state.page) { state.page = p; changed = true; }
  }
  // 同步搜索框 / 排序框 DOM（刷新后 DOM 需回显）
  const si = $("#searchInput"); if (si && state.query) si.value = state.query;
  const ss = $("#sortSelect"); if (ss && state.sort) ss.value = state.sort;
  return changed;
}

function init() {
  // 从偏好恢复（localStorage 不可用时回退默认）
  state.theme = loadPref(LS_THEME, "light");
  state.lang = loadPref(LS_LANG, "zh");
  state.view = loadEnum(LS_VIEW, [VIEW_GRID, VIEW_LIST], VIEW_GRID);
  state.density = loadEnum(LS_DENSITY, [DENSITY_COMFORT, DENSITY_COMPACT], DENSITY_COMFORT);
  // UI 元素显隐：存储为字符串 "true"/"false"，缺失即默认开启
  state.showDesc = loadPref(LS_SHOW_DESC, "true") !== "false";
  state.showCat = loadPref(LS_SHOW_CAT, "true") !== "false";
  state.showBar = loadPref(LS_SHOW_BAR, "true") !== "false";
  // 名称显示策略：枚举 both/zh/en，缺失或非法回退默认双显
  state.nameMode = loadEnum(LS_NAME_MODE, [NAME_MODE_BOTH, NAME_MODE_ZH, NAME_MODE_EN], NAME_MODE_BOTH);
  // 还原深链（须在设置解析后、渲染前，使搜索框/排序框回显并由后续 render 体现）
  parseHash();
  // 预聚合：每个技能缓存小写检索串 _hay，并建立 name->skill 索引，避免运行时重复计算
  SKILLS_DATA.skills.forEach((s) => {
    s._hay = (s.name + " " + s.zh + " " + s.description + " " + (s.enDescription || "") + " " + s.category + " " + (s.enCategory || "")).toLowerCase();
    SKILL_MAP.set(s.name, s);
  });
  applyTheme();
  applyView();
  applyDensity();
  applyUI();
  applyNameMode();
  applyLang(); // 内部触发 I18N.setLang -> syncDOM 填充全站文案
  bind();
  // 浏览器前进/后退或外部修改 hash 时还原深链并刷新
  window.addEventListener("hashchange", () => { if (parseHash()) renderGrid(); });
  renderHeroNodes(); // 方案 A：按分类动态生成可交互节点网
  // 兜底：若节点网因数据迟于渲染而为空，下一帧重建（防御性，当前 init 顺序已保证数据先就绪）
  const nn = document.getElementById("netNodes");
  if (nn && nn.children.length === 0) requestAnimationFrame(renderHeroNodes);
  renderGrid();
  // 量取顶栏高度注入 --topbar-h，供 .controls sticky 偏移使用（P2-1），并监听 resize 更新
  const setTopbarH = () => {
    const h = document.getElementById("siteHeader");
    if (h) document.documentElement.style.setProperty("--topbar-h", h.offsetHeight + "px");
  };
  setTopbarH();
  window.addEventListener("resize", setTopbarH);
  // 页脚版本号兜底：若 build 未替换 {{VERSION}} 字面量，运行时回退到真实版本（F 改进）
  const fv = $("#footerVer");
  // 兜底：若 index.html 未经 build 注入（仍含占位符 {{...}}），取 <meta name="app-version"> 的真实版本，
  // 避免展示裸露占位符或硬编码陈旧版本号（B4）；双保险仍失败才回退常量
  if (fv && fv.textContent.includes("{{")) {
    const meta = document.querySelector('meta[name="app-version"]');
    const v = (meta && meta.content && !meta.content.includes("{{")) ? meta.content : "1.14.49";
    fv.textContent = "v" + v;
  }
  // 页脚更新日期兜底：若 build 未替换 {{BUILD_DATE}} 字面量，运行时回退到今日日期
  const fd = $("#footerDate");
  if (fd && fd.textContent.includes("{{BUILD_DATE}}")) {
    fd.innerHTML = fd.innerHTML.replace("{{BUILD_DATE}}", new Date().toISOString().slice(0, 10));
  }
}

document.addEventListener("DOMContentLoaded", init);
