// prototype/src/parts/04-interactions.js v1.19.20 — 主题/语言/视图/密度/UI元素/名称显示/分类多选/排序/分页 切换与事件绑定
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const btn = $("#themeBtn");
  if (btn) {
    btn.setAttribute("aria-label", I18N.t("theme.toggle"));
    // aria-pressed 表示当前是否处于深色（按钮状态语义）
    btn.setAttribute("aria-pressed", state.theme === "dark" ? "true" : "false");
  }
}

// 视图模式（网格/列表）：同步到 <html data-view>，驱动 .grid 列布局与卡片排布
function applyView() {
  document.documentElement.setAttribute("data-view", state.view);
  // 顶栏视图切换按钮的 active 态同步（与设置弹窗内的切换保持一致）
  $$(".view-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === state.view));
}

// 显示密度（舒适/紧凑）：同步到 <html data-density>，由 CSS 控制卡片间距与内边距
function applyDensity() {
  document.documentElement.setAttribute("data-density", state.density);
}

// UI 元素显隐（描述/分类标签/分类色条）：同步到 <html data-show-*>，驱动卡片局部隐藏
function applyUI() {
  const root = document.documentElement;
  root.setAttribute("data-show-desc", state.showDesc ? "on" : "off");
  root.setAttribute("data-show-cat", state.showCat ? "on" : "off");
  root.setAttribute("data-show-bar", state.showBar ? "on" : "off");
}

// 名称显示策略（双显/仅中文/仅英文）：同步到 <html data-name-mode>，由 CSS 控制 .card-title 标题显隐
function applyNameMode() {
  document.documentElement.setAttribute("data-name-mode", state.nameMode);
}

function applyLang() {
  I18N.setLang(state.lang);
  const btn = $("#langBtn");
  if (btn) {
    // 方案 A：按钮文本显示「当前语言」（中/EN），与可见文本一致；
    // aria-pressed 表示当前是否 en（语义稳定），aria-label 明确当前语言与切换意图
    btn.textContent = state.lang === "zh" ? "中" : "EN";
    btn.setAttribute("aria-label", (state.lang === "zh" ? "当前语言：中文，点击切换为英文" : "Current: English, click to switch to Chinese"));
    btn.setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
  }
  // 输入框占位符为单节点，无法用 CSS 显隐，故由 i18n 直接驱动
  const si = $("#searchInput");
  if (si) si.placeholder = I18N.t("search.placeholder");
  // hero 区 aria-labelledby 指向当前可见语言的标题（en 模式 zh 标题被 CSS 隐藏，需切换引用）
  const hero = $("#hero");
  if (hero) hero.setAttribute("aria-labelledby", state.lang === "en" ? "heroTitleEn" : "heroTitle");
  // 双 h1 视觉互斥：隐藏的那个加 aria-hidden，避免读屏重复朗读两个标题（P3）
  const hZh = $("#heroTitle"), hEn = $("#heroTitleEn");
  if (hZh) hZh.setAttribute("aria-hidden", state.lang === "en" ? "true" : "false");
  if (hEn) hEn.setAttribute("aria-hidden", state.lang === "en" ? "false" : "true");
  // 分类筛选区的「全部」等文案由 renderCats 用 I18N.t 动态生成（非 data-i18n 静态属性），
  // 语言切换后必须重渲染网格才能刷新分类文案，否则切换语言后 chips 仍显示旧语言
  renderGrid();
}

// 空值安全绑定：元素缺失时跳过该绑定，避免单一节点缺失中断其余全部交互
function on(sel, evt, fn, root) {
  const el = (root || document).querySelector(sel);
  if (el) el.addEventListener(evt, fn);
}

function bind() {
  // 主题（用户主动点击才记录；不随 applyTheme 在 init 误上报）
  on("#themeBtn", "click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    savePref(LS_THEME, state.theme);
    applyTheme();
  });
  // 语言
  on("#langBtn", "click", () => {
    state.lang = state.lang === "zh" ? "en" : "zh";
    savePref(LS_LANG, state.lang);
    applyLang();
  });
  // 搜索（防抖）
  // 中文/日文等输入法 composition 期间不触发筛选，避免拼音输入过程狂刷网格
  let t;
  let composing = false;
  on("#searchInput", "compositionstart", () => { composing = true; clearTimeout(t); });
  on("#searchInput", "compositionend", (e) => {
    composing = false;
    const v = e.target.value;
    t = setTimeout(() => { state.query = v; state.page = 0; renderGrid(); if (v) track("search", { query: v }); }, DEBOUNCE_MS);
  });
  on("#searchInput", "input", (e) => {
    if (composing) return; // 输入法组合中，跳过
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => { state.query = v; state.page = 0; renderGrid(); if (v) track("search", { query: v }); }, DEBOUNCE_MS);
  });
  // 视图切换
  $$(".view-btn").forEach((b) => {
    b.addEventListener("click", () => {
      state.view = b.dataset.view;
      savePref(LS_VIEW, state.view);
      applyView();
      track("toggle_view", { view: state.view });
      renderGrid();
    });
  });
  // 分类导航（事件委托，v1.19.8 起多选 OR）
  on("#cats", "click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const val = chip.dataset.cat || "";
    if (!val) { state.cats = []; } // "全部"清空多选
    else {
      const i = state.cats.indexOf(val);
      if (i === -1) state.cats.push(val); else state.cats.splice(i, 1);
    }
    track("filter_category", { categories: state.cats.slice() });
    state.page = 0; // 筛选变化回到第一页
    renderGrid();
  });
  // 卡片点击打开详情（事件委托）
  // 卡片为原生 <button>，Enter/Space 原生触发 click，此处仅需处理 click，避免 double-open
  on("#grid", "click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const s = SKILL_MAP.get(card.dataset.name);
    if (s) openDetail(s);
  });
  // 排序下拉（v1.19.8）
  on("#sortSelect", "change", (e) => {
    const el = e.target;
    state.sort = el.value || "name";
    state.page = 0; // 排序变化回到第一页
    track("sort", { sort: state.sort });
    renderGrid();
  });
  // 空状态清除筛选（document 级兜底）
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "clearFilters") { state.query = ""; state.cats = []; state.sort = "name"; state.page = 0; const si = $("#searchInput"); if (si) si.value = ""; const ss = $("#sortSelect"); if (ss) ss.value = "name"; renderGrid(); }
  });
  // 弹窗遮罩点击关闭
  on("#overlay", "click", (e) => { if (e.target.id === "overlay") closeDetail(); });
  // 分页器（事件委托：数字页码 / 上下页，data-page 为目标页 0 基）
  on("#pager", "click", (e) => {
    const btn = e.target.closest(".pg-btn");
    if (!btn || btn.disabled) return;
    const p = Number(btn.dataset.page);
    if (Number.isNaN(p)) return;
    state.page = p;
    renderGrid();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  // 设置按钮：打开设置弹窗（复用 dialog 框架）
  on("#settingsBtn", "click", () => openSettings());
  // 回到顶部：滚动超阈值后显示按钮（.show），并监听 scroll/resize 更新
  // 使用 passive 监听避免阻塞滚动（Vercel: client-passive-event-listeners）
  const toTop = document.getElementById("toTop");
  const TO_TOP_THRESHOLD = 400;
  const updateToTop = () => {
    if (!toTop) return;
    const show = window.scrollY > TO_TOP_THRESHOLD;
    toTop.classList.toggle("show", show);
    toTop.setAttribute("aria-hidden", show ? "false" : "true");
  };
  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    // 用 rAF 节流，避免高频 scroll 事件反复触发布局读取
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { updateToTop(); ticking = false; });
      }
    }, { passive: true });
    updateToTop();
  }
}
