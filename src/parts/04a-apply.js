// prototype/src/parts/04a-apply.js v1.16.6 — 主题/语言/视图/密度/UI/名称 应用函数 + 空值安全绑定
// prototype/src/parts/04-interactions.js v1.14.88 — 主题/语言/视图/密度/UI元素/名称显示/分类单选/排序/分页 切换与事件绑定 + Hero 搜索联动
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
  // 顶栏视图切换按钮的 active 态与 aria-pressed 同步（与设置弹窗内的切换保持一致）；
  // aria-pressed 表达当前视图语义，供读屏用户感知选中态（A2）
  $$(".view-btn").forEach((b) => {
    const active = b.dataset.view === state.view;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", active ? "true" : "false");
  });
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
