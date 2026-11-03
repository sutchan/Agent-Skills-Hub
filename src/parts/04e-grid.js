// prototype/src/parts/04e-grid.js v1.16.6 — 卡片点击 / 分页 / 排序 / 设置 / 分享 / 回顶 绑定
function bindGrid() {
  on("#grid", "click", (e) => {
    if (e.target.closest("[data-vote-row]")) return;
    const card = e.target.closest(".card");
    if (!card) return;
    const s = SKILL_MAP.get(card.dataset.name);
    if (s) openDetail(s);
  });
  on("#sortSelect", "change", (e) => {
    const el = e.target;
    state.sort = el.value || "name";
    state.page = 0;
    track("sort", { sort: state.sort });
    renderGrid();
  });
  on("#overlay", "click", (e) => { if (e.target.id === "overlay") closeDetail(); });
  on("#pager", "click", (e) => {
    const btn = e.target.closest(".pg-btn");
    if (!btn || btn.disabled) return;
    const p = Number(btn.dataset.page);
    if (Number.isNaN(p)) return;
    state.page = p;
    renderGrid();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  on("#settingsBtn", "click", () => openSettings());
  const shareBtn = $("#shareBtn");
  if (shareBtn) shareBtn.addEventListener("click", () => shareRepo());
  const starBtn = $("#starBtn");
  if (starBtn) starBtn.addEventListener("click", () => track("star_click", { repo: "Agent-Skills-Hub" }));
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
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(() => { updateToTop(); ticking = false; }); }
    }, { passive: true });
    updateToTop();
  }
}
