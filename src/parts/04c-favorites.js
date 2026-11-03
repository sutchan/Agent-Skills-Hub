// prototype/src/parts/04c-favorites.js v1.16.6 — 收藏切换 / 顶栏收藏夹 / 快捷过滤药丸 绑定
function bindFavorites() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".fav-btn");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const name = btn.getAttribute("data-fav-name");
    if (!name) return;
    const isFav = toggleFavorite(name);
    syncFavUI(name);
    showToast(isFav ? "已加入收藏夹" : "已移出收藏夹");
    track("favorite_toggle", { skill: name, favorite: isFav });
  });
  const favToggleBtn = $("#favToggleBtn");
  if (favToggleBtn) {
    favToggleBtn.addEventListener("click", () => {
      state.favoritesOnly = !state.favoritesOnly;
      state.page = 0;
      favToggleBtn.classList.toggle("active", state.favoritesOnly);
      favToggleBtn.setAttribute("aria-pressed", String(state.favoritesOnly));
      renderGrid();
      track("favorites_filter_toggle", { active: state.favoritesOnly });
    });
  }
  on("#qfFavs", "click", () => {
    state.favoritesOnly = !state.favoritesOnly;
    state.page = 0;
    const ftb = $("#favToggleBtn");
    if (ftb) { ftb.classList.toggle("active", state.favoritesOnly); ftb.setAttribute("aria-pressed", String(state.favoritesOnly)); }
    renderGrid();
    track("quick_filter_favorites", { active: state.favoritesOnly });
  });
  on("#afClearAll", "click", () => {
    state.query = "";
    state.favoritesOnly = false;
    state.sort = "name";
    state.tags = [];
    state.page = 0;
    const si = $("#searchInput"); if (si) si.value = "";
    const ftb = $("#favToggleBtn");
    if (ftb) { ftb.classList.remove("active"); ftb.setAttribute("aria-pressed", "false"); }
    setCategory("", "af_clear_all");
  });
}
