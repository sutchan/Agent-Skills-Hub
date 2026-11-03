// prototype/src/parts/02c-grid.js v1.16.6 — 网格渲染 + 分页器 + 活动筛选条

// 渲染当前激活的过滤项标签（关键词、分类、收藏、热榜）并提供一键移除
function renderActiveFilterBar() {
  const bar = $("#activeFilterBar");
  const container = $("#afTags");
  if (!bar || !container) return;
  const tags = [];
  if (state.query.trim()) {
    tags.push(`<span class="af-tag"><span>关键词: "${esc(state.query.trim())}"</span><button type="button" class="af-tag-remove" data-clear="query" aria-label="移除搜索词">&times;</button></span>`);
  }
  if (state.cats) {
    tags.push(`<span class="af-tag"><span>分类: ${esc(state.cats)}</span><button type="button" class="af-tag-remove" data-clear="cat" aria-label="移除分类">&times;</button></span>`);
  }
  if (state.favoritesOnly) {
    tags.push(`<span class="af-tag"><span>⭐ 仅收藏</span><button type="button" class="af-tag-remove" data-clear="favs" aria-label="取消仅看收藏">&times;</button></span>`);
  }
  state.tags.forEach((tg) => {
    tags.push(`<span class="af-tag"><span>🏷 ${esc(tg)}</span><button type="button" class="af-tag-remove" data-clear="tag" data-tag="${esc(tg)}" aria-label="移除标签">&times;</button></span>`);
  });
  if (state.sort === "votes") {
    tags.push(`<span class="af-tag"><span>🔥 最多赞</span><button type="button" class="af-tag-remove" data-clear="sort" aria-label="取消热度排序">&times;</button></span>`);
  }
  if (tags.length) {
    container.innerHTML = tags.join("");
    bar.style.display = "flex";
  } else {
    container.innerHTML = "";
    bar.style.display = "none";
  }
  const qfFavs = $("#qfFavs");
  if (qfFavs) {
    qfFavs.classList.toggle("active", Boolean(state.favoritesOnly));
    qfFavs.setAttribute("aria-pressed", String(state.favoritesOnly));
  }
  const qfPop = $("#qfPopular");
  if (qfPop) {
    const isPop = state.sort === "votes";
    qfPop.classList.toggle("active", isPop);
    qfPop.setAttribute("aria-pressed", String(isPop));
  }
}

function renderGrid() {
  const q = state.query.trim();
  const terms = queryTerms(q);
  // 过滤：可见 + 关键词匹配 + 分类单选（state.cats 为空串 = 全部）
  let list = SKILLS_DATA.skills.filter((s) => {
    if (s.hidden) return false;
    if (!matches(s, terms)) return false;
    if (state.cats && s.category !== state.cats) return false;
    if (state.favoritesOnly && !isFavorite(s.name)) return false;
    if (state.tags.length && !(s.tags || []).some((t) => state.tags.includes(t))) return false;
    return true;
  });
  list = sortSkills(list);
  const agg = aggregateFilters(); // 单次遍历聚合分类计数
  renderCats(agg);
  renderTags();
  renderActiveFilterBar(); // 同步活动筛选状态栏与标签
  // 分页：每页 PAGE_SIZE 条，page 为 0 基
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (state.page > totalPages - 1) state.page = totalPages - 1; // 筛选后页码越界回钳
  if (state.page < 0) state.page = 0;
  const start = state.page * PAGE_SIZE;
  const pageList = list.slice(start, start + PAGE_SIZE);
  const grid = $("#grid");
  grid.className = "grid " + state.view;
  grid.innerHTML = pageList.length ? pageList.map(cardHTML).join("") : emptyHTML();
  // 同步排序下拉当前值（切换语言或重置时保持一致）
  const ss = $("#sortSelect");
  if (ss) ss.value = state.sort;
  // 分页器（数字翻页 + 上下页）
  renderPager(list.length, totalPages);
  // 结果计数 live 区：搜索/筛选后只播报数量，避免读屏朗读整网格（随当前语言）
  const rc = $("#resultCount");
  if (rc) rc.textContent = list.length
    ? I18N.t("result.count").replace("{n}", list.length)
    : I18N.t("result.empty");
  // 同步深链（刷新/分享可还原当前筛选+搜索+排序+页码）
  writeHash();
}

// 分页器：渲染「上一页 / 数字页码 / 下一页」+ 当前区间提示
// total：筛选后总数；totalPages：总页数（≥1）。页码点击由 04-interactions 委托处理（data-page）
function renderPager(total, totalPages) {
  const pager = $("#pager");
  if (!pager) return;
  if (totalPages <= 1) { pager.innerHTML = ""; pager.classList.remove("show"); return; }
  pager.classList.add("show");
  const cur = state.page;
  const items = [];
  // 上一页
  items.push(`<button class="pg-btn" data-page="${cur - 1}" ${cur <= 0 ? "disabled" : ""} aria-label="${I18N.t("pager.prev")}">‹</button>`);
  // 数字页码（窗口：当前页 ±2，首尾必显）
  const win = [];
  for (let p = 0; p < totalPages; p++) {
    if (p === 0 || p === totalPages - 1 || Math.abs(p - cur) <= 2) win.push(p);
  }
  let prev = -1;
  for (const p of win) {
    if (prev !== -1 && p - prev > 1) items.push(`<span class="pg-ellipsis">…</span>`);
    items.push(`<button class="pg-btn num${p === cur ? " active" : ""}" data-page="${p}" aria-current="${p === cur ? "page" : "false"}" aria-label="${I18N.t("pager.page").replace("{n}", p + 1)}">${p + 1}</button>`);
    prev = p;
  }
  // 下一页
  items.push(`<button class="pg-btn" data-page="${cur + 1}" ${cur >= totalPages - 1 ? "disabled" : ""} aria-label="${I18N.t("pager.next")}">›</button>`);
  items.push(`<span class="pg-info">${I18N.t("pager.info").replace("{cur}", cur + 1).replace("{pages}", totalPages)}</span>`);
  pager.innerHTML = items.join("");
}
