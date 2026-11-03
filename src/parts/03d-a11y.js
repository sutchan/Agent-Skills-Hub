// prototype/src/parts/03d-a11y.js v1.16.6 — 弹窗键盘交互与焦点陷阱

// 全局 Esc 关闭（grid 点击委托与 overlay 点击关闭已在 04-interactions 处理）
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const overlay = $("#overlay");
    if (overlay && overlay.classList.contains("show")) closeDetail();
  }
});

// 键盘快捷键 'f' / 'F'：快速收藏当前选中的技能卡片；Enter / Space：打开选中的卡片
document.addEventListener("keydown", (e) => {
  const active = document.activeElement;
  if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT")) {
    return;
  }
  if (e.key === "f" || e.key === "F") {
    const overlay = $("#overlay");
    if (overlay && overlay.classList.contains("show")) {
      const favBtn = $("#dialog .fav-btn[data-fav-name]");
      if (favBtn) {
        const name = favBtn.getAttribute("data-fav-name");
        if (name) {
          e.preventDefault();
          const isFav = toggleFavorite(name);
          syncFavUI(name);
          showToast(isFav ? (state.lang === 'zh' ? `已快捷收藏: ${name}` : `Bookmarked: ${name}`) : (state.lang === 'zh' ? `已取消快捷收藏: ${name}` : `Unbookmarked: ${name}`));
          track("keyboard_favorite", { skill: name, favorite: isFav });
          return;
        }
      }
    }
    let card = active ? active.closest(".card") : null;
    if (!card) {
      card = $("#grid .card");
    }
    if (card) {
      const name = card.dataset.name;
      if (name) {
        e.preventDefault();
        const isFav = toggleFavorite(name);
        syncFavUI(name);
        showToast(isFav ? (state.lang === 'zh' ? `已快捷收藏: ${name}` : `Bookmarked: ${name}`) : (state.lang === 'zh' ? `已取消快捷收藏: ${name}` : `Unbookmarked: ${name}`));
        track("keyboard_favorite", { skill: name, favorite: isFav });
      }
    }
  } else if ((e.key === "Enter" || e.key === " ") && active && active.classList.contains("card")) {
    const cardOpen = active.querySelector(".card-open");
    if (cardOpen) {
      e.preventDefault();
      cardOpen.click();
    }
  }
});

// 弹窗焦点陷阱：打开（overlay.show）时 Tab/Shift+Tab 在弹窗内循环，防止键盘焦点逃逸到背景（WCAG 2.1.2）。
// 详情与设置弹窗共用 #overlay/#dialog，故统一在此拦截（A1）。
document.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const overlay = $("#overlay");
  if (!overlay || !overlay.classList.contains("show")) return;
  const f = overlay.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// 弹窗打开前的焦点持有者，供 closeDetail 归还（模块级，避免污染 state）
let _lastFocus = null;
