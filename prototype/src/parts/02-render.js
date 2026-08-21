// prototype/src/parts/02-render.js v1.19.7 — 列表/网格渲染与统计
function renderStats() {
  // 统计区已自 hero 迁入 footer（v1.19.7）：展示可见技能总数、分类数、英文描述覆盖数、支持语言数
  const visible = SKILLS_DATA.skills.filter((s) => !s.hidden);
  const total = visible.length;
  const enCov = visible.filter((s) => s.enDescription && String(s.enDescription).trim()).length;
  $("#statTotal").textContent = total;
  $("#statCats").textContent = SKILLS_DATA.categories.length;
  $("#statEnCov").textContent = enCov;
  $("#statLangs").textContent = 2; // zh / en 双语支持
}
// 历史函数移除：hero 标题已改为静态 thesis 文案（含 accent 强调），不再需要动态 {n} 注入

function renderCats(counts) {
  const cats = SKILLS_DATA.categories;
  const en = SKILLS_DATA.categoryEn || {};
  // "全部"chip 用中性 hue，分类 chip 用 catHue 派生色相（对齐 app：--hue 驱动多色）
  const items = [`<button class="chip${state.cat == null ? " active" : ""}" data-cat="" style="--hue:152" aria-pressed="${state.cat == null}">${I18N.t("filter.all")}</button>`];
  cats.forEach((c) => {
    const active = state.cat === c;
    // chip 分类名中英互斥：中文态显示 category，英文态显示 categoryEn[c]
    items.push(`<button class="chip" data-cat="${esc(c)}" style="--hue:${catHue(c)}" aria-pressed="${active}"><span class="zh">${esc(c)}</span><span class="en">${esc(en[c] || c)}</span> <span class="chip-count">${counts.get(c) || 0}</span></button>`);
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

// 卡片：与 app SkillsExplorer 结构对齐（cat-bar 色条 + title-row + card-title/card-desc/card-cat）
// 使用原生 <button> 保证可聚焦、Enter/Space 原生触发（P1-1 a11y）；
// 默认展示语言为中文：标题与描述均按当前语言互斥显示（.zh/.en 由 base.css html[data-lang] 控制）：
// 中文态显示中文名 + 中文描述（description），英文态显示英文名 + 英文描述（enDescription）
function cardHTML(s) {
  const label = s.zh ? `${s.name}（${s.zh}）` : s.name;
  const ci = skillCatIndex(s);
  const descZh = s.description || s.zh || I18N.t("card.noDesc");
  return `<button type="button" class="card" id="skill-${skillSlug(s.name)}" data-name="${esc(s.name)}" data-cat="${ci}" aria-label="${esc(label)}">
    <div class="cat-bar" style="--hue:${catHue(s.category)}" aria-hidden="true"></div>
    <div class="card-body">
      <div class="title-row">
        <div class="avatar sm">${initials(s.name)}</div>
        <div class="card-title">
          <span class="zh">${esc(s.zh || s.name)}</span>
          <span class="en">${esc(s.name)}</span>
        </div>
      </div>
      <div class="card-desc">
        <span class="zh">${esc(descZh)}</span>
        <span class="en">${esc(s.enDescription || "")}</span>
      </div>
      <div class="card-cat"><span class="zh">${esc(s.category)}</span><span class="en">${esc(s.enCategory || s.category)}</span></div>
    </div>
  </button>`;
}

function emptyHTML() {
  return `<div id="emptyState" class="empty-state" aria-live="polite">
    <div class="empty-title">${I18N.t("empty.title")}</div>
    <div class="empty-desc">${I18N.t("empty.desc")}</div>
    <button id="clearFilters" class="btn btn-ghost">${I18N.t("empty.clear")}</button>
  </div>`;
}

// query 词表缓存：仅当 query 变化时重新切分，避免每张卡重复 split（Vercel: js-cache-function-results）
let _queryTermsCache = null;
function queryTerms(q) {
  if (!q) return null;
  if (_queryTermsCache && _queryTermsCache.q === q) return _queryTermsCache.terms;
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  _queryTermsCache = { q, terms };
  return terms;
}

function renderGrid() {
  const q = state.query.trim();
  const terms = queryTerms(q);
  const list = SKILLS_DATA.skills.filter((s) => !s.hidden && matches(s, terms) && (!state.cat || s.category === state.cat));
  const counts = catCounts();
  renderStats();
  renderCats(counts);
  const grid = $("#grid");
  grid.className = "grid " + state.view;
  grid.innerHTML = list.length ? list.map(cardHTML).join("") : emptyHTML();
  // 结果计数 live 区：搜索/筛选后只播报数量，避免读屏朗读整网格（随当前语言）
  const rc = $("#resultCount");
  if (rc) rc.textContent = list.length
    ? I18N.t("result.count").replace("{n}", list.length)
    : I18N.t("result.empty");
}
