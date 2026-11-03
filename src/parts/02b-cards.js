// prototype/src/parts/02b-cards.js v1.16.6 — 卡片 / 空态 / 搜索相关性评分

// 字段加权评分：名称/中文名命中权重最高，其次标签与分类，描述最低；用于查询时结果排序
function scoreSkill(s, terms) {
  if (!terms || !terms.length) return 0;
  const name = (s.name || "").toLowerCase();
  const zh = (s.zh || "").toLowerCase();
  const cat = (s.category || "").toLowerCase();
  const desc = ((s.description || "") + " " + (s.enDescription || "")).toLowerCase();
  const tags = (s.tags || []).join(" ").toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (name.includes(t)) score += 10;
    if (zh.includes(t)) score += 8;
    if (tags.includes(t)) score += 5;
    if (cat.includes(t)) score += 4;
    if (desc.includes(t)) score += 2;
  }
  return score;
}

// 排序比较器：name / name-desc / votes（按点赞数降序）/ cat / zh；查询态下改为按加权相关性降序
function sortSkills(list) {
  const arr = list.slice();
  // 查询态：按加权相关性降序排序（再按名称稳定化）
  const terms = queryTerms(state.query);
  if (terms && terms.length) {
    return arr
      .map((s) => ({ s, sc: scoreSkill(s, terms) }))
      .sort((a, b) => b.sc - a.sc || String(a.s.name).localeCompare(String(b.s.name)))
      .map((x) => x.s);
  }
  const cmp = {
    name: (a, b) => String(a.name).localeCompare(String(b.name)),
    "name-desc": (a, b) => String(b.name).localeCompare(String(a.name)),
    votes: (a, b) => {
      const va = (voteCounts(a.name) || {}).up || 0;
      const vb = (voteCounts(b.name) || {}).up || 0;
      return vb - va || String(a.name).localeCompare(String(b.name));
    },
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
// 卡片为 <div> 容器而非 <button>：打开详情由 .card-open 承担，赞/踩为其后同级独立按钮，
// 避免「按钮内嵌按钮」的无效 HTML 与读屏器无法区分二者（见 06-votes.js）
// 默认展示语言为中文：标题与描述均按当前语言互斥显示（.zh/.en 由 base.css html[data-lang] 控制）：
// 中文态显示中文名 + 中文描述（description），英文态显示英文名 + 英文描述（enDescription）
function cardHTML(s) {
  const label = s.zh ? `${s.name}（${s.zh}）` : s.name;
  const descZh = s.description || s.zh || I18N.t("card.noDesc");
  const fav = isFavorite(s.name);
  return `<div class="card" id="skill-${skillSlug(s.name)}" role="button" aria-label="${esc(label)}" tabindex="0" data-name="${esc(s.name)}" data-cat="${esc(s.category)}">
    <div class="cat-bar" style="--hue:${catHue(s.category)}" aria-hidden="true"></div>
    <button type="button" id="fav-${skillSlug(s.name)}" class="fav-btn${fav ? " bookmarked" : ""}" data-fav-name="${esc(s.name)}" aria-label="${fav ? "取消收藏" : "收藏"} ${esc(s.name)} (按 F 键快速收藏)" title="${fav ? "取消收藏" : "收藏"} (按 F 键快速收藏)">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="${fav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
    <div class="card-body">
      <button type="button" class="card-open" aria-label="${esc(label)}">
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
        <div class="card-cat">
          <span class="cat-indicator" style="background: hsl(${catHue(s.category)} 65% 48%)" aria-hidden="true"></span>
          <span class="zh">${esc(s.category)}</span><span class="en">${esc(s.enCategory || s.category)}</span>
        </div>
      </button>
    </div>
    ${voteHTML(s.name)}
  </div>`;
}

function emptyHTML() {
  // 空结果智能推荐：聚合可见技能高频标签，提供一键直达筛选
  const counts = new Map();
  SKILLS_DATA.skills.forEach((s) => {
    if (s.hidden) return;
    (s.tags || []).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
  });
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const suggest = top.length
    ? `<div class="empty-suggest" style="margin-top:18px"><span class="empty-suggest-label">${I18N.t("empty.suggest")}</span><div class="empty-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;justify-content:center">` +
      top.map(([t]) => `<button type="button" class="chip chip-tag" data-tag="${esc(t)}" style="--hue:270">${esc(t)}</button>`).join("") +
      `</div></div>`
    : "";
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
    ${suggest}
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
