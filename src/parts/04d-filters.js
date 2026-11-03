// prototype/src/parts/04d-filters.js v1.16.6 — 分类单选 / 标签多选 / 环形图 / 图表折叠 绑定
function setCategory(val, source = "unknown") {
  const nextCat = !val || state.cats === val ? "" : val;
  state.cats = nextCat;
  state.page = 0;
  track("filter_category", { category: state.cats, source });
  updateHeroNet();
  renderGrid();
  requestAnimationFrame(() => {
    const activeChip = $("#cats .chip.active") || $("#cats #catChip-all");
    if (activeChip && typeof activeChip.scrollIntoView === "function") {
      activeChip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  });
}
window.setCategory = setCategory;
function toggleTag(val) {
  if (!val) { state.tags = []; }
  else {
    const i = state.tags.indexOf(val);
    if (i >= 0) state.tags.splice(i, 1); else state.tags.push(val);
  }
  state.page = 0;
  renderGrid();
  track("filter_tag", { tag: val, active: state.tags.includes(val) });
}
window.toggleTag = toggleTag;
function bindFilters() {
  on("#afTags", "click", (e) => {
    const btn = e.target.closest(".af-tag-remove");
    if (!btn) return;
    const type = btn.dataset.clear;
    if (type === "query") { state.query = ""; const si = $("#searchInput"); if (si) si.value = ""; }
    else if (type === "cat") { setCategory("", "af_tag_clear"); return; }
    else if (type === "favs") { state.favoritesOnly = false; const ftb = $("#favToggleBtn"); if (ftb) { ftb.classList.remove("active"); ftb.setAttribute("aria-pressed", "false"); } }
    else if (type === "tag") { state.tags = state.tags.filter((t) => t !== btn.dataset.tag); }
    else if (type === "sort") { state.sort = "name"; }
    state.page = 0; renderGrid();
  });
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "clearFilters") {
      state.query = ""; state.favoritesOnly = false; state.sort = "name"; state.tags = []; state.page = 0;
      const si = $("#searchInput"); if (si) si.value = "";
      const ss = $("#sortSelect"); if (ss) ss.value = "name";
      setCategory("", "clear_filters_btn");
    }
  });
  on("#cats", "click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    setCategory(chip.dataset.cat || "", "chip");
  });
  on("#tagChips", "click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip || (chip.id !== "tagChip-all" && !chip.dataset.tag)) return;
    toggleTag(chip.dataset.tag || "");
  });
  document.addEventListener("click", (e) => {
    const tc = e.target.closest(".empty-tags .chip");
    if (tc && tc.dataset.tag) toggleTag(tc.dataset.tag);
  });
  on("#catDonutSlices", "click", (e) => {
    const slice = e.target.closest(".cat-donut-slice");
    if (!slice) return;
    setCategory(slice.dataset.cat || "", "donut_slice");
  });
  on("#catDonutSlices", "keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const slice = e.target.closest(".cat-donut-slice");
      if (slice) { e.preventDefault(); setCategory(slice.dataset.cat || "", "donut_slice"); }
    }
  });
  on("#catDonutCenter", "click", () => setCategory("", "donut_center_reset"));
  on("#catDonutCenter", "keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCategory("", "donut_center_reset"); }
  });
  on("#catLegendWrap", "click", (e) => {
    const item = e.target.closest(".cat-legend-item");
    if (!item) return;
    setCategory(item.dataset.cat || "", "donut_legend");
  });
  on("#catLegendWrap", "keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const item = e.target.closest(".cat-legend-item");
      if (item) { e.preventDefault(); setCategory(item.dataset.cat || "", "donut_legend"); }
    }
  });
  const chartWrapper = $("#catChartWrapper");
  const chartToggle = $("#catChartToggle");
  const LS_CHART_COLLAPSED = "ash-chart-collapsed";
  if (chartWrapper && chartToggle) {
    if (loadPref(LS_CHART_COLLAPSED, "false") === "true") {
      chartWrapper.classList.add("collapsed");
      chartToggle.setAttribute("aria-expanded", "false");
      const zhSpan = chartToggle.querySelector(".toggle-text.zh");
      const enSpan = chartToggle.querySelector(".toggle-text.en");
      if (zhSpan) zhSpan.textContent = "展开图表";
      if (enSpan) enSpan.textContent = "Expand";
    }
    chartToggle.addEventListener("click", () => {
      const isCollapsed = chartWrapper.classList.toggle("collapsed");
      chartToggle.setAttribute("aria-expanded", String(!isCollapsed));
      savePref(LS_CHART_COLLAPSED, String(isCollapsed));
      const zhSpan = chartToggle.querySelector(".toggle-text.zh");
      const enSpan = chartToggle.querySelector(".toggle-text.en");
      if (zhSpan) zhSpan.textContent = isCollapsed ? "展开图表" : "收起图表";
      if (enSpan) enSpan.textContent = isCollapsed ? "Expand" : "Collapse";
      track("toggle_chart", { collapsed: isCollapsed });
    });
  }
}
