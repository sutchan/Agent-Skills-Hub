// prototype/src/parts/02a-filters.js v1.16.6 — 筛选 chips + 分类占比环形图
// prototype/src/parts/02-render.js v1.20.60 — 列表/网格渲染
// 历史函数移除：renderStats（页脚全库统计台账）已随页脚精简移除（v1.14.81）。

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

// 分类 chips（单选）：state.cats 为空串 = 全部，选中项与 state.cats 相等；数据来自 aggregateFilters 实况
function renderCats(agg) {
  const allActive = !state.cats;
  const items = buildFilterItems(agg).catItems;
  // "全部"chip 用中性 hue，置于分类项之前
  const allBtn = `<button class="chip chip-all${allActive ? " active" : ""}" id="catChip-all" data-cat="" style="--hue:152" tabindex="0" aria-pressed="${allActive}">${I18N.t("filter.all")}</button>`;
  const container = $("#cats");
  if (container) {
    container.innerHTML = allBtn + items.map((it) => {
      const active = state.cats === it.key;
      const safeKey = it.key.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "");
      return `<button class="chip${active ? " active" : ""}" id="catChip-${safeKey}" data-cat="${esc(it.key)}" style="--hue:${it.hue}" tabindex="0" aria-pressed="${active}"><span class="zh">${esc(it.zh)}</span><span class="en">${esc(it.en)}</span> <span class="chip-count">${it.count}</span></button>`;
    }).join("");
  }
  // 联动渲染分类占比环形图
  renderCategoryChart(items);
}

// 标签多选筛选 chips：聚合可见技能标签频次（取前 28），选中态与 state.tags 对齐（标签间 OR，与分类 AND）
function renderTags() {
  const container = $("#tagChips");
  if (!container) return;
  const counts = new Map();
  SKILLS_DATA.skills.forEach((s) => {
    if (s.hidden) return;
    (s.tags || []).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
  });
  const tags = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 28);
  const allActive = state.tags.length === 0;
  const allBtn = `<button class="chip chip-all${allActive ? " active" : ""}" id="tagChip-all" data-tag="" style="--hue:270" tabindex="0" aria-pressed="${allActive}">${I18N.t("filter.tags")} · ${I18N.t("filter.all")}</button>`;
  container.innerHTML = allBtn + tags.map(([t, c]) => {
    const active = state.tags.includes(t);
    const safe = t.replace(/[^a-zA-Z0-9一-龥_-]/g, "");
    return `<button class="chip${active ? " active" : ""}" id="tagChip-${safe}" data-tag="${esc(t)}" style="--hue:270" tabindex="0" aria-pressed="${active}"><span class="zh">${esc(t)}</span> <span class="chip-count">${c}</span></button>`;
  }).join("");
}

// 分类占比环形图（遵循 D3 极坐标圆弧投影规范构建轻量 SVG 环形图与图例）
function renderCategoryChart(items) {
  const slicesG = $("#catDonutSlices");
  const legendWrap = $("#catLegendWrap");
  const centerNum = $("#donutCenterNum");
  const centerLabel = $("#donutCenterLabel");
  const centerHint = $("#donutCenterHint");
  const centerBox = $("#catDonutCenter");
  if (!slicesG || !legendWrap) return;

  const total = items.reduce((sum, it) => sum + it.count, 0);
  const activeItem = state.cats ? items.find((it) => it.key === state.cats) : null;
  const isZh = I18N.getLang() === "zh";

  if (centerNum) {
    centerNum.textContent = activeItem ? String(activeItem.count) : String(total);
  }
  if (centerLabel) {
    if (activeItem) {
      centerLabel.textContent = isZh ? activeItem.zh : activeItem.en;
    } else {
      centerLabel.textContent = isZh ? "全部技能" : "Total Skills";
    }
  }
  if (centerHint) {
    if (activeItem && total > 0) {
      const activePct = ((activeItem.count / total) * 100).toFixed(1) + "%";
      centerHint.textContent = `${activePct} · ${isZh ? "点击重置" : "Reset"}`;
    } else {
      centerHint.textContent = isZh ? "点击分类筛选" : "Click to filter";
    }
  }
  if (centerBox) {
    centerBox.classList.toggle("has-active", Boolean(activeItem));
    if (activeItem) {
      const activePct = total > 0 ? ((activeItem.count / total) * 100).toFixed(1) + "%" : "0%";
      centerBox.setAttribute("title", isZh ? `当前筛选：${activeItem.zh} (${activeItem.count} 个 · ${activePct})，点击重置为全部` : `Filtered: ${activeItem.en} (${activeItem.count} · ${activePct}), click to reset`);
      centerBox.setAttribute("aria-label", isZh ? `${activeItem.zh} (${activeItem.count}个 · ${activePct})，点击重置为全部` : `${activeItem.en} (${activeItem.count} · ${activePct}), click to reset`);
    } else {
      centerBox.setAttribute("title", isZh ? `共 ${total} 个技能，点击扇区或图例进行分类筛选` : `${total} skills total, click slice or legend to filter`);
      centerBox.setAttribute("aria-label", isZh ? `全部技能共 ${total} 个` : `Total skills: ${total}`);
    }
  }

  // 极坐标几何参数
  const outerR = 92;
  const innerR = 60;
  const padAngle = 0.022; // 扇区弧度间距 (D3 padAngle)

  let curAngle = -Math.PI / 2; // 起始角度：12 点钟方向
  let slicePaths = [];
  let legendHTML = [];

  items.forEach((it) => {
    const frac = total > 0 ? it.count / total : 0;
    const sweep = frac * Math.PI * 2;
    const startA = curAngle + padAngle / 2;
    const endA = curAngle + sweep - padAngle / 2;
    curAngle += sweep;

    const isActive = state.cats === it.key;
    const hasFilter = Boolean(state.cats);
    const isDimmed = hasFilter && !isActive;
    const safeKey = it.key.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "");

    // 计算圆弧内外径端点 (D3 arc generator 规范)
    let d = "";
    if (endA > startA) {
      const cos1 = Math.cos(startA), sin1 = Math.sin(startA);
      const cos2 = Math.cos(endA), sin2 = Math.sin(endA);
      const largeArc = (endA - startA) > Math.PI ? 1 : 0;

      const p0x = (outerR * cos1).toFixed(2), p0y = (outerR * sin1).toFixed(2);
      const p1x = (outerR * cos2).toFixed(2), p1y = (outerR * sin2).toFixed(2);
      const p2x = (innerR * cos2).toFixed(2), p2y = (innerR * sin2).toFixed(2);
      const p3x = (innerR * cos1).toFixed(2), p3y = (innerR * sin1).toFixed(2);

      d = `M ${p0x} ${p0y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${p1x} ${p1y} L ${p2x} ${p2y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${p3x} ${p3y} Z`;
    }

    const pctText = (frac * 100).toFixed(1) + "%";
    const titleText = `${it.zh} (${it.en}) · ${it.count} 个 (${pctText})`;

    if (d) {
      slicePaths.push(`
        <path class="cat-donut-slice${isActive ? " active" : ""}${isDimmed ? " dimmed" : ""}"
              id="catSlice-${safeKey}"
              d="${d}"
              fill="hsl(${it.hue} 75% 45%)"
              data-cat="${esc(it.key)}"
              tabindex="0"
              role="button"
              aria-label="${esc(titleText)}"
              aria-pressed="${isActive ? "true" : "false"}">
          <title>${esc(titleText)}</title>
        </path>
      `);
    }

    // 图例数据明细行（带微型占比进度条，强化数据可视化属性）
    legendHTML.push(`
      <div class="cat-legend-item${isActive ? " active" : ""}${isDimmed ? " dimmed" : ""}"
           id="catLegend-${safeKey}"
           data-cat="${esc(it.key)}"
           role="button"
           tabindex="0"
           aria-pressed="${isActive ? "true" : "false"}"
           style="--hue:${it.hue}">
        <span class="cat-legend-dot" style="background:hsl(${it.hue} 75% 45%)"></span>
        <div class="cat-legend-content">
          <div class="cat-legend-top">
            <span class="cat-legend-name">
              <span class="zh">${esc(it.zh)}</span>
              <span class="en">${esc(it.en)}</span>
            </span>
            <span class="cat-legend-meta">
              <span class="cat-legend-count">${it.count}</span>
              <span class="cat-legend-pct">${pctText}</span>
            </span>
          </div>
          <div class="cat-legend-bar-bg" aria-hidden="true">
            <div class="cat-legend-bar-fill" style="width:${pctText}; background:hsl(${it.hue} 75% 45%)"></div>
          </div>
        </div>
      </div>
    `);
  });

  slicesG.innerHTML = slicePaths.join("");
  legendWrap.innerHTML = legendHTML.join("");
}
