// prototype/src/parts/02-render.js v1.14.56 — 列表/网格渲染与统计
function renderStats(filtered) {
  $("#statTotal").textContent = SKILLS_DATA.total;
  $("#statCats").textContent = SKILLS_DATA.categories.length;
  $("#statShown").textContent = filtered.length;
}
// hero 标题数字动态注入：直接由 i18n 文案替换 {n}，避免依赖模板残留占位符
function refreshHeroCount() {
  const n = (SKILLS_DATA ? SKILLS_DATA.total : 0) + "+";
  document.getElementById("heroTitleZh").textContent = I18N.t("hero.title", "zh").replace(/\{n\}/g, n);
  document.getElementById("heroTitleEn").textContent = I18N.t("hero.title", "en").replace(/\{n\}/g, n);
}

function renderCats(counts) {
  const cats = SKILLS_DATA.categories;
  const items = [`<button class="chip${state.cat == null ? " active" : ""}" data-cat="" aria-pressed="${state.cat == null}">${I18N.t("filter.all")}</button>`];
  cats.forEach((c) => {
    const active = state.cat === c;
    items.push(`<button class="chip" data-cat="${esc(c)}" aria-pressed="${active}">${esc(c)} <span class="chip-count">${counts.get(c) || 0}</span></button>`);
  });
  $("#cats").innerHTML = items.join("");
}

// 由技能名派生稳定且 URL/ID 安全的 slug（小写中划线），供卡片 id 锚点与 E2E 定位
function skillSlug(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// 卡片：主标题显示技能英文名（权威标识、简短、永不丢失），中文描述交给 .desc
function cardHTML(s) {
  const label = s.zh ? `${s.name}（${s.zh}）` : s.name;
  return `<article class="card" id="skill-${skillSlug(s.name)}" data-name="${esc(s.name)}" role="button" tabindex="0" aria-label="${esc(label)}">
    <div class="body">
      <div class="title-row">
        <div class="avatar">${initials(s.name)}</div>
        <div class="name">${esc(s.name)}</div>
      </div>
      <div class="desc zh">${esc(s.zh)}</div>
      <div class="desc en">${esc(s.description)}</div>
      <div class="meta"><span class="cat-tag">${esc(s.category)}</span></div>
    </div>
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
  const list = SKILLS_DATA.skills.filter((s) => matches(s, q) && (!state.cat || s.category === state.cat));
  const counts = catCounts();
  renderStats(list);
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
