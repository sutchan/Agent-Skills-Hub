// prototype/src/parts/02-render.js v1.20.46 — 列表/网格渲染与统计
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

// 分类筛选项结构，数据源合并自 aggregateFilters()（实况派生，不再依赖静态 categories 数组）。
// 分类项：key=分类名，hue=catHue 彩色。
function buildFilterItems(agg) {
  const en = SKILLS_DATA.categoryEn || {};
  // 分类项保持与 app 一致的固定分类序（SKILLS_DATA.categories），仅过滤计数 0 项
  const catOrder = SKILLS_DATA.categories || [];
  const catItems = catOrder
    .filter((c) => (agg.cats.get(c) || 0) > 0)
    .map((c) => ({ key: c, zh: c, en: en[c] || c, count: agg.cats.get(c) || 0, hue: catHue(c), attr: "data-cat" }));
  return { catItems };
}

// 通用筛选 chip 渲染器（分类/标签共用，v1.20.22 合并渲染逻辑）
function renderFilterChips(container, items, activeSet, allActive) {
  if (!container) return;
  const html = items.map((it) => {
    const active = activeSet.indexOf(it.key) !== -1;
    return `<button class="chip" ${it.attr}="${esc(it.key)}" style="--hue:${it.hue}" aria-pressed="${active}"><span class="zh">${esc(it.zh)}</span><span class="en">${esc(it.en)}</span> <span class="chip-count">${it.count}</span></button>`;
  });
  container.innerHTML = html.join("");
}

// 分类 chips（v1.19.8 起多选 OR）：state.cats 为空 = 全部；数据来自 aggregateFilters 实况（v1.20.22 合并）
function renderCats(agg) {
  const allActive = state.cats.length === 0;
  const items = buildFilterItems(agg).catItems;
  // "全部"chip 用中性 hue，置于分类项之前
  const allBtn = `<button class="chip chip-all${allActive ? " active" : ""}" data-cat="" style="--hue:152" aria-pressed="${allActive}">${I18N.t("filter.all")}</button>`;
  const container = $("#cats");
  if (!container) return;
  container.innerHTML = allBtn + items.map((it) => {
    const active = state.cats.indexOf(it.key) !== -1;
    return `<button class="chip${active ? " active" : ""}" data-cat="${esc(it.key)}" style="--hue:${it.hue}" aria-pressed="${active}"><span class="zh">${esc(it.zh)}</span><span class="en">${esc(it.en)}</span> <span class="chip-count">${it.count}</span></button>`;
  }).join("");
}

// 排序比较器：name（英文原名 A-Z）/ name-desc（Z-A）/ cat（按分类字典序）/ zh（按中文名）
function sortSkills(list) {
  const arr = list.slice();
  const cmp = {
    name: (a, b) => String(a.name).localeCompare(String(b.name)),
    "name-desc": (a, b) => String(b.name).localeCompare(String(a.name)),
    cat: (a, b) => String(a.category).localeCompare(String(b.category), "zh") || String(a.name).localeCompare(String(b.name)),
    zh: (a, b) => String(a.zh || a.name).localeCompare(String(b.zh || b.name), "zh"),
  }[state.sort] || ((a, b) => String(a.name).localeCompare(String(b.name)));
  arr.sort(cmp);
  return arr;
}

// 由技能名派生稳定且 URL/ID 安全的 slug（小写中划线），供卡片 id 锚点与 E2E 定位
function skillSlug(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// 分类在固定顺序中的序号（与 app SkillsExplorer data-cat 对齐，驱动 cat-bar 色板）
// 卡片：与 app SkillsExplorer 结构对齐（cat-bar 色条 + title-row + card-title/card-desc/card-cat）
// 使用原生 <button> 保证可聚焦、Enter/Space 原生触发（P1-1 a11y）；
// 默认展示语言为中文：标题与描述均按当前语言互斥显示（.zh/.en 由 base.css html[data-lang] 控制）：
// 中文态显示中文名 + 中文描述（description），英文态显示英文名 + 英文描述（enDescription）
function cardHTML(s) {
  const label = s.zh ? `${s.name}（${s.zh}）` : s.name;
  const descZh = s.description || s.zh || I18N.t("card.noDesc");
  return `<button type="button" class="card" id="skill-${skillSlug(s.name)}" data-name="${esc(s.name)}" data-cat="${esc(s.category)}" aria-label="${esc(label)}">
    <div class="cat-bar" style="--hue:${catHue(s.category)}" aria-hidden="true"></div>
    <div class="card-body">
      <div class="title-row">
        <div class="avatar sm" style="--hue:${catHue(s.category)}">${initials(s.name)}</div>
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
    <svg class="empty-net" viewBox="0 0 160 100" aria-hidden="true">
      <g class="en-line">
        <line x1="40" y1="30" x2="80" y2="55" /><line x1="80" y1="55" x2="120" y2="35" />
        <line x1="80" y1="55" x2="55" y2="82" /><line x1="80" y1="55" x2="110" y2="80" />
        <line x1="40" y1="30" x2="55" y2="82" /><line x1="120" y1="35" x2="110" y2="80" />
      </g>
      <g class="en-node"><circle cx="40" cy="30" r="4" /><circle cx="120" cy="35" r="4" /><circle cx="55" cy="82" r="4" /><circle cx="110" cy="80" r="4" /></g>
      <circle class="en-core" cx="80" cy="55" r="8" />
      <circle class="en-glass" cx="100" cy="70" r="14" />
      <line class="en-handle" x1="110" y1="80" x2="120" y2="90" />
    </svg>
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
  // 过滤：可见 + 关键词匹配 + 分类多选 OR（cats 为空 = 全部）
  let list = SKILLS_DATA.skills.filter((s) => {
    if (s.hidden) return false;
    if (!matches(s, terms)) return false;
    if (state.cats.length && state.cats.indexOf(s.category) === -1) return false;
    return true;
  });
  list = sortSkills(list);
  const agg = aggregateFilters(); // 单次遍历聚合分类计数
  renderStats();
  renderCats(agg);
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
