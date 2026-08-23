// prototype/src/parts/04-interactions.js v1.20.46 — 主题/语言/视图/密度/UI元素/名称显示/分类多选/排序/分页 切换与事件绑定 + Hero 搜索联动
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const btn = $("#themeBtn");
  if (btn) {
    btn.setAttribute("aria-label", I18N.t("theme.toggle"));
    // aria-pressed 表示当前是否处于深色（按钮状态语义）
    btn.setAttribute("aria-pressed", state.theme === "dark" ? "true" : "false");
  }
}

// 视图模式（网格/列表）：同步到 <html data-view>，驱动 .grid 列布局与卡片排布
function applyView() {
  document.documentElement.setAttribute("data-view", state.view);
  // 顶栏视图切换按钮的 active 态同步（与设置弹窗内的切换保持一致）
  $$(".view-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === state.view));
}

// 显示密度（舒适/紧凑）：同步到 <html data-density>，由 CSS 控制卡片间距与内边距
function applyDensity() {
  document.documentElement.setAttribute("data-density", state.density);
}

// UI 元素显隐（描述/分类标签/分类色条）：同步到 <html data-show-*>，驱动卡片局部隐藏
function applyUI() {
  const root = document.documentElement;
  root.setAttribute("data-show-desc", state.showDesc ? "on" : "off");
  root.setAttribute("data-show-cat", state.showCat ? "on" : "off");
  root.setAttribute("data-show-bar", state.showBar ? "on" : "off");
}

// 名称显示策略（双显/仅中文/仅英文）：同步到 <html data-name-mode>，由 CSS 控制 .card-title 标题显隐
function applyNameMode() {
  document.documentElement.setAttribute("data-name-mode", state.nameMode);
}

function applyLang() {
  I18N.setLang(state.lang);
  const btn = $("#langBtn");
  if (btn) {
    // 方案 A：按钮文本显示「当前语言」（中/EN），与可见文本一致；
    // aria-pressed 表示当前是否 en（语义稳定），aria-label 明确当前语言与切换意图
    btn.textContent = state.lang === "zh" ? "中" : "EN";
    btn.setAttribute("aria-label", (state.lang === "zh" ? "当前语言：中文，点击切换为英文" : "Current: English, click to switch to Chinese"));
    btn.setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
  }
  // 输入框占位符为单节点，无法用 CSS 显隐，故由 i18n 直接驱动
  const si = $("#searchInput");
  if (si) si.placeholder = I18N.t("search.placeholder");
  // hero 区 aria-labelledby 指向当前可见语言的标题（en 模式 zh 标题被 CSS 隐藏，需切换引用）
  const hero = $("#hero");
  if (hero) hero.setAttribute("aria-labelledby", state.lang === "en" ? "heroTitleEn" : "heroTitle");
  // 双 h1 视觉互斥：隐藏的那个加 aria-hidden，避免读屏重复朗读两个标题（P3）
  const hZh = $("#heroTitle"), hEn = $("#heroTitleEn");
  if (hZh) hZh.setAttribute("aria-hidden", state.lang === "en" ? "true" : "false");
  if (hEn) hEn.setAttribute("aria-hidden", state.lang === "en" ? "false" : "true");
  // 分类筛选区的「全部」等文案由 renderCats 用 I18N.t 动态生成（非 data-i18n 静态属性），
  // 语言切换后必须重渲染网格才能刷新分类文案，否则切换语言后 chips 仍显示旧语言
  renderGrid();
}

// 空值安全绑定：元素缺失时跳过该绑定，避免单一节点缺失中断其余全部交互
function on(sel, evt, fn, root) {
  const el = (root || document).querySelector(sel);
  if (el) el.addEventListener(evt, fn);
}

function bind() {
  // 主题（用户主动点击才记录；不随 applyTheme 在 init 误上报）
  on("#themeBtn", "click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    savePref(LS_THEME, state.theme);
    applyTheme();
  });
  // 语言
  on("#langBtn", "click", () => {
    state.lang = state.lang === "zh" ? "en" : "zh";
    savePref(LS_LANG, state.lang);
    applyLang();
  });
  // 搜索（防抖）
  // 中文/日文等输入法 composition 期间不触发筛选，避免拼音输入过程狂刷网格
  let t;
  let composing = false;
  on("#searchInput", "compositionstart", () => { composing = true; clearTimeout(t); });
  on("#searchInput", "compositionend", (e) => {
    composing = false;
    const v = e.target.value;
    t = setTimeout(() => { state.query = v; state.page = 0; renderGrid(); if (v) track("search", { query: v }); }, DEBOUNCE_MS);
  });
  on("#searchInput", "input", (e) => {
    if (composing) return; // 输入法组合中，跳过
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => { state.query = v; state.page = 0; renderGrid(); if (v) track("search", { query: v }); }, DEBOUNCE_MS);
  });
  // 方案 B：骰子按钮
  const diceBtn = $("#diceBtn");
  if (diceBtn) diceBtn.addEventListener("click", rollDice);
  // 视图切换
  $$(".view-btn").forEach((b) => {
    b.addEventListener("click", () => {
      state.view = b.dataset.view;
      savePref(LS_VIEW, state.view);
      applyView();
      track("toggle_view", { view: state.view });
      renderGrid();
    });
  });
  // 分类导航（事件委托，v1.19.8 起多选 OR）
  on("#cats", "click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const val = chip.dataset.cat || "";
    if (!val) { state.cats = []; } // "全部"清空多选
    else {
      const i = state.cats.indexOf(val);
      if (i === -1) state.cats.push(val); else state.cats.splice(i, 1);
    }
    track("filter_category", { categories: state.cats.slice() });
    state.page = 0; // 筛选变化回到第一页
    renderCats(aggregateFilters()); // 重渲分类 chips，刷新 active 态（彩色选中背景依赖此）
    updateHeroNet();
    renderGrid();
  });
  // 卡片点击打开详情（事件委托）
  // 卡片为原生 <button>，Enter/Space 原生触发 click，此处仅需处理 click，避免 double-open
  on("#grid", "click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const s = SKILL_MAP.get(card.dataset.name);
    if (s) openDetail(s);
  });
  // 排序下拉（v1.19.8）
  on("#sortSelect", "change", (e) => {
    const el = e.target;
    state.sort = el.value || "name";
    state.page = 0; // 排序变化回到第一页
    track("sort", { sort: state.sort });
    renderGrid();
  });
  // 空状态清除筛选（document 级兜底）
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "clearFilters") { state.query = ""; state.cats = []; state.sort = "name"; state.page = 0; const si = $("#searchInput"); if (si) si.value = ""; const ss = $("#sortSelect"); if (ss) ss.value = "name"; updateHeroNet(); renderGrid(); }
  });
  // 弹窗遮罩点击关闭
  on("#overlay", "click", (e) => { if (e.target.id === "overlay") closeDetail(); });
  // 分页器（事件委托：数字页码 / 上下页，data-page 为目标页 0 基）
  on("#pager", "click", (e) => {
    const btn = e.target.closest(".pg-btn");
    if (!btn || btn.disabled) return;
    const p = Number(btn.dataset.page);
    if (Number.isNaN(p)) return;
    state.page = p;
    renderGrid();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  // 设置按钮：打开设置弹窗（复用 dialog 框架）
  on("#settingsBtn", "click", () => openSettings());
  // 分享按钮：随机文案 + 完整 GitHub URL，复制到剪贴板并 toast（v1.20.9）
  const shareBtn = $("#shareBtn");
  if (shareBtn) shareBtn.addEventListener("click", () => shareRepo());
  // 回到顶部：滚动超阈值后显示按钮（.show），并监听 scroll/resize 更新
  // 使用 passive 监听避免阻塞滚动（Vercel: client-passive-event-listeners）
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
    // 用 rAF 节流，避免高频 scroll 事件反复触发布局读取
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { updateToTop(); ticking = false; });
      }
    }, { passive: true });
    updateToTop();
  }
}

// 方案 A：搜索/筛选时点亮节点网核心，节点随查询激活（视觉联动反馈）
function updateHeroNet() {
  const net = $("#heroNet");
  if (!net) return;
  const active = Boolean(state.query) || (state.cats && state.cats.length > 0);
  net.classList.toggle("filtering", active);
  net.classList.toggle("searching", Boolean(state.query));
  // 方案 A：同步节点 active 态（被选中的分类高亮）
  net.querySelectorAll(".hub-node[data-cat]").forEach((n) => {
    n.classList.toggle("active", state.cats.includes(n.getAttribute("data-cat")));
  });
  // 选中单个分类时，核心节点（.hub-core / .hub-glow）同步为该分类色；多选/清空回落主色绿（CSS 默认 --core-hue 未定义）
  const core = net.querySelector(".hub-core");
  const glow = net.querySelector(".hub-glow");
  if (state.cats.length === 1) {
    const hue = catHue(state.cats[0]);
    [core, glow].forEach((el) => { if (el) el.style.setProperty("--core-hue", String(hue)); });
  } else {
    [core, glow].forEach((el) => { if (el) el.style.removeProperty("--core-hue"); });
  }
}

// 方案 A：按分类动态生成节点（半径随技能数变化），环绕核心排布，可交互
function renderHeroNodes() {
  const g = $("#netNodes");
  if (!g || !SKILLS_DATA.categories) return;
  // 统计各分类技能数（categories 为分类名字符串数组，计数需从 skills 聚合）
  const counts = new Map();
  SKILLS_DATA.skills.forEach((s) => { if (!s.hidden) counts.set(s.category, (counts.get(s.category) || 0) + 1); });
  const cats = SKILLS_DATA.categories;
  const vals = cats.map((c) => counts.get(c) || 0);
  const min = Math.min(...vals), max = Math.max(...vals);
  const cx = 600, cy = 120; // 核心坐标（右移，避开左侧文字）
  const n = cats.length;
  g.innerHTML = "";
  // 动态生成核心→节点连线（随随机分布变化，替代 index.html 静态 line）
  const lineG = document.getElementById("netLines");
  if (lineG) {
    lineG.innerHTML = "";
    cats.forEach(() => {
      const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("class", "net-line");
      ln.setAttribute("x1", cx); ln.setAttribute("y1", cy);
      ln.setAttribute("stroke", "hsl(var(--line))");
      ln.setAttribute("stroke-width", "2.4");
      lineG.appendChild(ln);
    });
  }
  // 每次刷新随机分布：覆盖整个 viewBox 并允许略溢出（约 -30~830 / -20~260），分布更开阔、线条更明显
  // 窄屏收敛边界，避免 slice 裁切掉过多节点（P1-4）
  const narrow = window.innerWidth < 640;
  const x0 = narrow ? 40 : -30, x1 = narrow ? 760 : 830;
  const y0 = narrow ? 10 : -20, y1 = narrow ? 230 : 260;
  const placed = [];
  const minDist = narrow ? 24 : 30; // 节点最小间距，防止重叠（窄屏更密可适当减小）
  cats.forEach((c, idx) => {
    let x, y, ok = false, tries = 0;
    do {
      x = x0 + Math.random() * (x1 - x0);
      y = y0 + Math.random() * (y1 - y0);
      ok = placed.every((p) => Math.hypot(p.x - x, p.y - y) >= minDist);
      tries++;
    } while (!ok && tries < 40);
    placed.push({ x, y });
    const t = max > min ? ((counts.get(c) || 0) - min) / (max - min) : .5;
    const r = 3 + Math.pow(t, 1.4) * 13; // 半径 ~3~16 随计数，非线性放大大小差异（大分类更突出）
    const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    node.setAttribute("class", "hub-node");
    node.setAttribute("cx", x.toFixed(1));
    node.setAttribute("cy", y.toFixed(1));
    node.setAttribute("r", r.toFixed(1));
    node.setAttribute("fill", `hsl(${catHue(c)} 65% 38%)`);
    node.setAttribute("data-cat", c);
    node.setAttribute("role", "button");
    node.setAttribute("tabindex", "0");
    node.setAttribute("aria-label", `${c} ${counts.get(c) || 0}`);
    // 同步对应连线终点
    if (lineG && lineG.children[idx]) {
      lineG.children[idx].setAttribute("x2", x.toFixed(1));
      lineG.children[idx].setAttribute("y2", y.toFixed(1));
      // 连线上的缓慢移动圆点：用 SVG animateMotion 沿 core→节点路径流动（错峰时长，纯 SMIL 合成不逐帧）
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("class", "net-dot");
      dot.setAttribute("r", "2.2");
      const motion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
      motion.setAttribute("dur", (4 + (idx % 5) * 0.7).toFixed(1) + "s");
      motion.setAttribute("repeatCount", "indefinite");
      motion.setAttribute("path", `M${cx} ${cy} L${x.toFixed(1)} ${y.toFixed(1)}`);
      dot.appendChild(motion);
      lineG.appendChild(dot);
    }
    // 错峰浮动：按节点序号注入固定相位偏移（5.5s 周期内均分），刷新稳定不跳变，纯 CSS 合成不逐帧
    node.style.animationDelay = (-(5.5 * idx / n)).toFixed(2) + "s";
    node.addEventListener("mouseenter", () => highlightCatCards(c, true));
    node.addEventListener("mouseleave", () => highlightCatCards(c, false));
    node.addEventListener("click", () => toggleHeroCat(c));
    node.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleHeroCat(c); } });
    g.appendChild(node);
  });
  // 连线常态错峰呼吸：注入相位偏移（4.8s 周期均分），强化节点网"信号流动"观感
  if (lineG) {
    const lines = lineG.querySelectorAll(".net-line");
    lines.forEach((ln, i) => { ln.style.animationDelay = (-(4.8 * i / lines.length)).toFixed(2) + "s"; });
  }
}

// 方案 A：节点 hover → 对应分类卡片脉冲高亮
function highlightCatCards(cat, on) {
  document.querySelectorAll("#grid .card").forEach((card) => {
    if (card.dataset.cat === cat) card.classList.toggle("pulse", on);
  });
}

// 方案 A：节点 click → 切换该分类筛选
function toggleHeroCat(cat) {
  const i = state.cats.indexOf(cat);
  if (i >= 0) state.cats.splice(i, 1); else state.cats.push(cat);
  state.page = 0;
  renderCats(aggregateFilters());
  updateHeroNet();
  renderGrid();
  track("hero_node_filter", { cat, active: state.cats.includes(cat) });
}

// 方案 B：随机抽一个技能（翻牌动画开盲盒）
function rollDice() {
  const pool = SKILLS_DATA.skills.filter((s) => !s.hidden);
  if (!pool.length) return;
  const skill = pool[Math.floor(Math.random() * pool.length)];
  const dialog = document.getElementById("dialog");
  openDetail(skill);
  if (dialog) {
    dialog.classList.remove("flip");
    void dialog.offsetWidth; // 触发重排以重启动画
    dialog.classList.add("flip");
  }
  track("dice_roll", { skill: skill.name });
}

// 设置弹窗：复用常驻 #dialog 容器（与详情共用框架），注入设置面板并绑定交互
function openSettings() {
  const dialog = $("#dialog");
  const overlay = $("#overlay");
  if (!dialog || !overlay) return;
  const t = (k) => I18N.t(k);
  // 单选组：根据 state 当前值标记 active；点击即写回 state + 持久化 + 应用
  const seg = (name, current, opts) =>
    `<div class="seg" role="group" aria-label="${esc(t(name))}">` +
    opts.map((o) =>
      `<button type="button" class="seg-btn${o.val === current ? " active" : ""}" data-name="${name}" data-val="${o.val}">${esc(t(o.label))}</button>`
    ).join("") +
    `</div>`;
  const toggle = (key, on) =>
    `<button type="button" class="switch${on ? " on" : ""}" data-switch="${key}" role="switch" aria-checked="${on}" aria-label="${esc(t(key))}"><span class="knob"></span></button>`;

  dialog.innerHTML = `
  <div class="settings-panel" id="settingsPanel" role="document">
    <div class="settings-head">
      <h2 class="zh" data-i18n="settings.title">设置</h2>
      <h2 class="en" data-i18n="settings.title">Settings</h2>
      <button type="button" class="icon-btn close-x" id="settingsClose" aria-label="${esc(t("settings.done"))}">&times;</button>
    </div>
    <div class="settings-body">
      <div class="settings-group">
        <div class="settings-label zh" data-i18n="settings.langGroup">语言 / Language</div>
        <div class="settings-label en" data-i18n="settings.langGroup">Language</div>
        ${seg("settings.language", state.lang, [{ val: "zh", label: "language.zh" }, { val: "en", label: "language.en" }])}
      </div>
      <div class="settings-group">
        <div class="settings-label zh" data-i18n="settings.themeGroup">主题 / Theme</div>
        <div class="settings-label en" data-i18n="settings.themeGroup">Theme</div>
        ${seg("settings.theme", state.theme, [{ val: "light", label: "theme.light" }, { val: "dark", label: "theme.dark" }])}
      </div>
      <div class="settings-group">
        <div class="settings-label zh" data-i18n="settings.viewGroup">布局 / Layout</div>
        <div class="settings-label en" data-i18n="settings.viewGroup">Layout</div>
        ${seg("settings.view", state.view, [{ val: VIEW_GRID, label: "settings.viewGrid" }, { val: VIEW_LIST, label: "settings.viewList" }])}
      </div>
      <div class="settings-group">
        <div class="settings-label zh" data-i18n="settings.densityGroup">密度 / Density</div>
        <div class="settings-label en" data-i18n="settings.densityGroup">Density</div>
        ${seg("settings.density", state.density, [{ val: DENSITY_COMFORT, label: "settings.densityComfortable" }, { val: DENSITY_COMPACT, label: "settings.densityCompact" }])}
      </div>
      <div class="settings-group">
        <div class="settings-label zh" data-i18n="settings.uiGroup">界面元素 / UI elements</div>
        <div class="settings-label en" data-i18n="settings.uiGroup">UI elements</div>
        <div class="settings-row"><span class="zh" data-i18n="settings.showDesc">显示技能描述</span><span class="en" data-i18n="settings.showDesc">Show skill description</span>${toggle("showDesc", state.showDesc)}</div>
        <div class="settings-row"><span class="zh" data-i18n="settings.showCat">显示分类标签</span><span class="en" data-i18n="settings.showCat">Show category label</span>${toggle("showCat", state.showCat)}</div>
        <div class="settings-row"><span class="zh" data-i18n="settings.showBar">显示分类色条</span><span class="en" data-i18n="settings.showBar">Show category color bar</span>${toggle("showBar", state.showBar)}</div>
      </div>
      <div class="settings-group">
        <div class="settings-label zh" data-i18n="settings.nameGroup">名称显示 / Name display</div>
        <div class="settings-label en" data-i18n="settings.nameGroup">Name display</div>
        ${seg("settings.name", state.nameMode, [{ val: NAME_MODE_BOTH, label: "settings.nameBoth" }, { val: NAME_MODE_ZH, label: "settings.nameZh" }, { val: NAME_MODE_EN, label: "settings.nameEn" }])}
      </div>
    </div>
  </div>`;
  // 选中态同步到 <html data-*>，保证 .modal 居中（非移动端 Sheet）
  dialog.classList.remove("sheet");
  dialog.classList.add("modal");
  dialog.setAttribute("aria-labelledby", "");
  overlay.classList.add("show");
  dialog.classList.add("show");
  document.body.classList.add("no-scroll");
  I18N.setLang(state.lang); // 触发 syncDOM 刷新面板内 data-i18n 文案

  // 单选段按钮
  dialog.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name, val = btn.dataset.val;
      if (name === "settings.language") { state.lang = val; savePref(LS_LANG, val); applyLang(); }
      else if (name === "settings.theme") { state.theme = val; savePref(LS_THEME, val); applyTheme(); }
      else if (name === "settings.view") { state.view = val; savePref(LS_VIEW, val); applyView(); renderGrid(); }
      else if (name === "settings.density") { state.density = val; savePref(LS_DENSITY, val); applyDensity(); }
      else if (name === "settings.name") { state.nameMode = val; savePref(LS_NAME_MODE, val); applyNameMode(); }
      dialog.querySelectorAll(`.seg-btn[data-name="${name}"]`).forEach((b) => b.classList.toggle("active", b === btn));
    });
  });
  // 开关
  dialog.querySelectorAll(".switch").forEach((sw) => {
    sw.addEventListener("click", () => {
      const key = sw.dataset.switch;
      const next = !sw.classList.contains("on");
      sw.classList.toggle("on", next);
      sw.setAttribute("aria-checked", String(next));
      if (key === "showDesc") { state.showDesc = next; savePref(LS_SHOW_DESC, String(next)); }
      else if (key === "showCat") { state.showCat = next; savePref(LS_SHOW_CAT, String(next)); }
      else if (key === "showBar") { state.showBar = next; savePref(LS_SHOW_BAR, String(next)); }
      applyUI();
    });
  });
  const closeBtn = $("#settingsClose");
  if (closeBtn) closeBtn.addEventListener("click", closeDetail);
}

// 复制文本到剪贴板：优先 Clipboard API，失败降级 execCommand；返回是否成功
function copyText(text) {
  return new Promise((resolve) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => resolve(true)).catch(() => {
        try { fallbackCopy(text, () => resolve(true)); } catch { resolve(false); }
      });
    } else {
      try { fallbackCopy(text, () => resolve(true)); } catch { resolve(false); }
    }
  });
}

// 分享仓库：基于部署站点 origin 构造（openspec §4.5.4.4 优先 location.origin），回退 GitHub
const REPO_URL = (typeof location !== "undefined" && location.origin)
  ? location.origin
  : "https://github.com/sutchan/Agent-Skills-Hub";
function shareRepo() {
  const promos = I18N.t("share.promos");
  const list = Array.isArray(promos) ? promos : [String(promos || "")];
  const tpl = list.length ? list[Math.floor(Math.random() * list.length)] : "";
  const total = (SKILLS_DATA && SKILLS_DATA.skills) ? SKILLS_DATA.skills.filter((s) => !s.hidden).length : 0;
  const text = `${tpl.replace(/\{n\}/g, total)}\n${REPO_URL}`;
  copyText(text).then((ok) => {
    showToast(ok ? I18N.t("share.copied") : I18N.t("share.failed"));
    if (ok) track("share_repo", { promoted: tpl });
  });
}

// 轻量 toast：复用 .toast 节点，自动消失（v1.20.9）
let _toastTimer = null;
function showToast(msg) {
  let el = $("#toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}
