// prototype/src/parts/02-render.js v1.14.66 — 列表/网格渲染与统计
function renderStats() {
  // 对齐 app AppShell：hero 仅展示可见技能总数与分类数（排除 hidden）
  $("#statTotal").textContent = SKILLS_DATA.skills.filter((s) => !s.hidden).length;
  $("#statCats").textContent = SKILLS_DATA.categories.length;
}
// 历史函数移除：hero 标题已改为静态 thesis 文案（含 accent 强调），不再需要动态 {n} 注入

function renderCats(counts) {
  const cats = SKILLS_DATA.categories;
  // "全部"chip 用中性 hue，分类 chip 用 catHue 派生色相（对齐 app：--hue 驱动多色）
  const items = [`<button class="chip${state.cat == null ? " active" : ""}" data-cat="" style="--hue:152" aria-pressed="${state.cat == null}">${I18N.t("filter.all")}</button>`];
  cats.forEach((c) => {
    const active = state.cat === c;
    items.push(`<button class="chip" data-cat="${esc(c)}" style="--hue:${catHue(c)}" aria-pressed="${active}">${esc(c)} <span class="chip-count">${counts.get(c) || 0}</span></button>`);
  });
  $("#cats").innerHTML = items.join("");
}

// 由技能名派生稳定且 URL/ID 安全的 slug（小写中划线），供卡片 id 锚点与 E2E 定位
function skillSlug(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// 分类在固定顺序中的序号（与 app SkillsExplorer data-cat 对齐，驱动 cat-bar 色板）
function skillCatIndex(s) {
  return SKILLS_DATA.categories.indexOf(s.category);
}

// 卡片：与 app SkillsExplorer 结构对齐（cat-bar 色条 + title-row + card-title/card-sub/card-cat）
function cardHTML(s) {
  const label = s.zh ? `${s.name}（${s.zh}）` : s.name;
  const ci = skillCatIndex(s);
  return `<article class="card" id="skill-${skillSlug(s.name)}" data-name="${esc(s.name)}" data-cat="${ci}" role="button" tabindex="0" aria-label="${esc(label)}">
    <div class="cat-bar" aria-hidden="true"></div>
    <div class="title-row">
      <div class="avatar sm">${initials(s.name)}</div>
      <div class="card-title">${esc(s.zh || s.name)}</div>
    </div>
    <div class="card-sub en">${esc(s.name)}</div>
    <div class="card-cat">${esc(s.category)}</div>
  </article>`;
}

function emptyHTML() {
  return `<div id="emptyState" class="empty-state" aria-live="polite">
    <div class="empty-title">${I18N.t("empty.title")}</div>
    <div class="empty-desc">${I18N.t("empty.desc")}</div>
    <button id="clearFilters" class="btn btn-ghost">${I18N.t("empty.clear")}</button>
  </div>`;
}

function renderGrid() {
  const q = state.query.trim();
  const list = SKILLS_DATA.skills.filter((s) => !s.hidden && matches(s, q) && (!state.cat || s.category === state.cat));
  const counts = catCounts();
  renderStats();
  renderCats(counts);
  const grid = $("#grid");
  grid.className = "grid " + state.view;
  grid.setAttribute("aria-live", "polite");
  grid.innerHTML = list.length ? list.map(cardHTML).join("") : emptyHTML();
}

// 将 HTML 字符串转为首个元素（用于弹窗插入）
function htmlToEl(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
