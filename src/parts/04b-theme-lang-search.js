// prototype/src/parts/04b-theme-lang-search.js v1.16.6 — 主题/语言/搜索 绑定
function bindThemeLang() {
  on("#themeBtn", "click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    savePref(LS_THEME, state.theme);
    applyTheme();
  });
  on("#langBtn", "click", () => {
    state.lang = state.lang === "zh" ? "en" : "zh";
    savePref(LS_LANG, state.lang);
    applyLang();
  });
}
function bindSearch() {
  let t;
  let composing = false;
  on("#searchInput", "compositionstart", () => { composing = true; clearTimeout(t); });
  on("#searchInput", "compositionend", (e) => {
    composing = false;
    const v = e.target.value;
    t = setTimeout(() => { state.query = v; state.page = 0; renderGrid(); if (v) track("search", { query: v }); }, DEBOUNCE_MS);
  });
  on("#searchInput", "input", (e) => {
    if (composing) return;
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => { state.query = v; state.page = 0; renderGrid(); if (v) track("search", { query: v }); }, DEBOUNCE_MS);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      const si = $("#searchInput");
      if (si) { si.focus(); si.select(); }
    }
  });
}
