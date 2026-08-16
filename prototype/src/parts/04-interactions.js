// prototype/src/parts/04-interactions.js v1.14.15 — 主题/语言切换与事件绑定
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const btn = $("#themeBtn");
  if (btn) btn.setAttribute("aria-label", I18N.t("theme.toggle"));
}

function applyLang() {
  I18N.setLang(state.lang);
  const btn = $("#langBtn");
  if (btn) btn.setAttribute("aria-label", I18N.t("lang.toggle"));
  // 输入框占位符为单节点，无法用 CSS 显隐，故由 i18n 直接驱动
  const si = $("#searchInput");
  if (si) si.placeholder = I18N.t("search.placeholder");
  refreshHeroCount(); // syncDOM 重置 hero 标题后重新填入动态数字
}

function bind() {
  // 主题
  $("#themeBtn").addEventListener("click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    savePref(LS_THEME, state.theme);
    applyTheme();
  });
  // 语言
  $("#langBtn").addEventListener("click", () => {
    state.lang = state.lang === "zh" ? "en" : "zh";
    savePref(LS_LANG, state.lang);
    applyLang();
  });
  // 搜索（防抖）
  let t;
  $("#searchInput").addEventListener("input", (e) => {
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => { state.query = v; renderGrid(); }, DEBOUNCE_MS);
  });
  // 视图切换
  document.querySelectorAll(".view-btn").forEach((b) => {
    b.addEventListener("click", () => {
      state.view = b.dataset.view;
      document.querySelectorAll(".view-btn").forEach((x) => x.classList.toggle("active", x === b));
      renderGrid();
    });
  });
  // 分类导航（事件委托）
  $("#cats").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    state.cat = chip.dataset.cat || null;
    renderGrid();
  });
  // 卡片点击/键盘打开详情（事件委托）
  $("#grid").addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const s = SKILLS_DATA.skills.find((x) => x.name === card.dataset.name);
    if (s) openDetail(s);
  });
  $("#grid").addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".card");
    if (!card) return;
    e.preventDefault();
    const s = SKILLS_DATA.skills.find((x) => x.name === card.dataset.name);
    if (s) openDetail(s);
  });
  // 空状态清除筛选（事件委托到 grid 已覆盖，这里兜底 document 级）
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "clearFilters") { state.query = ""; state.cat = null; $("#searchInput").value = ""; renderGrid(); }
  });
  // 弹窗遮罩点击关闭
  $("#overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") closeDetail(); });
  // 回到顶部
  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
