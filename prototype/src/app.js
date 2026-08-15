// prototype/src/app.js v1.14.5 — 原型交互逻辑（无障碍增强 + 性能优化）
// 国际化交由独立模块 I18N（见 i18n.js）管理，本文件不再维护语言字典。
// 无障碍基线：卡片 role=button + tabIndex + 键盘可达；chip aria-pressed；
// 统计区 aria-live=polite；弹窗 role=dialog + aria-modal + sr-only 标题。
// UX 增强：主题/语言偏好持久化；弹窗焦点陷阱 + 关闭后焦点归还 + 背景锁滚动。
const LS_THEME = "ash-theme", LS_LANG = "ash-lang";
// 技能在 GitHub 仓库中的真实目录（纯静态部署无 skills/<name>/ 路由，故指向仓库 tree）
const SKILL_REPO_BASE = "https://github.com/sutchan/Agent-Skills-Hub/tree/main/skills/";
function loadPref(key, fallback) {
  try { const v = localStorage.getItem(key); return v || fallback; } catch (e) { return fallback; }
}
function savePref(key, val) {
  try { localStorage.setItem(key, val); } catch (e) { /* 隐私模式等场景静默降级 */ }
}
const state = {
  q: "", cat: "全部", view: "grid",
  theme: loadPref(LS_THEME, "light"),
  lang: loadPref(LS_LANG, "zh")
};
const $ = (s) => document.querySelector(s);
const grid = $("#grid");
const overlay = $("#overlay");

// ---------- 工具函数 ----------
function initials(name) {
  const s = name.replace(/[-_]/g, " ").trim();
  return (s[0] || "S").toUpperCase();
}
// 防止 XSS：转义特殊字符后再拼入 innerHTML
function esc(str) {
  return String(str || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
// 分类计数预聚合（避免每次渲染类别时全量遍历技能，O(n) 一次）
const catCounts = (() => {
  const m = new Map();
  SKILLS_DATA.skills.forEach((s) => m.set(s.category, (m.get(s.category) || 0) + 1));
  return m;
})();

// 关键词匹配：对齐规范 4.5.3①（name / zh / en / category 不敏感匹配）
function matches(s) {
  if (state.cat !== "全部" && s.category !== state.cat) return false;
  if (!state.q) return true;
  const q = state.q.toLowerCase();
  return (s.name + " " + s.zh + " " + s.description + " " + s.category).toLowerCase().includes(q);
}

// ---------- 渲染 ----------
function renderStats(filtered) {
  $("#statTotal").textContent = SKILLS_DATA.total;
  $("#statCats").textContent = SKILLS_DATA.categories.length;
  $("#statShown").textContent = filtered.length;
}
// hero 标题数字动态注入，避免与统计脱节（{n} 由 i18n 文案占位，syncDOM 填充后替换）
function refreshHeroCount() {
  const n = SKILLS_DATA.total + "+";
  ["heroTitleZh", "heroTitleEn"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = (el.textContent || "").replace(/\{n\}/g, n);
  });
}
function renderCats() {
  const cats = ["全部", ...SKILLS_DATA.categories];
  $("#cats").innerHTML = cats
    .map((c) => {
      const n = c === "全部" ? SKILLS_DATA.total : (catCounts.get(c) || 0);
      const active = c === state.cat;
      // aria-pressed 反映分类选中态（COMPONENTS #14）
      return `<button class="chip ${active ? "active" : ""}" data-cat="${esc(c)}" aria-pressed="${active}">${esc(c)}<span class="c">${n}</span></button>`;
    })
    .join("");
}
// 卡片可键盘可达：role=button + tabIndex=0 + 语义 aria-label（COMPONENTS #12）
// 主标题显示中文名（zh）；英文技能名（name）作为 badge 始终可见——
// 它是技能的稳定标识，且用户常按英文名检索/调用，故不受语言切换隐藏规则影响
function cardHTML(s) {
  // 主标题明确显示技能名（英文名，权威标识且简短，永不丢失）；中文描述留给 .desc
  const label = s.zh ? `${s.name}（${s.zh}）` : s.name;
  return `<article class="card" data-name="${esc(s.name)}" role="button" tabindex="0" aria-label="${esc(label)}">
    <div class="avatar">${initials(s.name)}</div>
    <div class="body">
      <div class="name">${esc(s.name)}</div>
      <div class="desc zh">${esc(s.zh)}</div>
      <div class="desc en">${esc(s.description)}</div>
      <div class="meta"><span class="cat-tag">${esc(s.category)}</span></div>
    </div>
  </article>`;
}
function emptyHTML() {
  // 空状态：图标 + 标题 + 描述 + 清除筛选按钮（DESIGN §4.4）
  return `<div class="empty-state" id="emptyState">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M6 6v14a2 2 0 002 2h8a2 2 0 002-2V6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2M10 11v6M14 11v6"/></svg>
    <div class="empty-title zh">${I18N.t("empty", "zh")}</div>
    <div class="empty-title en">${I18N.t("empty", "en")}</div>
    <p class="empty-desc zh">${I18N.t("empty.desc", "zh")}</p>
    <p class="empty-desc en">${I18N.t("empty.desc", "en")}</p>
    <button class="btn btn-ghost" id="clearFilters">${I18N.t("empty.clear")}</button>
  </div>`;
}
function renderGrid() {
  const filtered = SKILLS_DATA.skills.filter(matches);
  renderStats(filtered);
  grid.className = "grid" + (state.view === "list" ? " list" : "");
  grid.innerHTML = filtered.length ? filtered.map(cardHTML).join("") : emptyHTML();
}

// ---------- 详情弹窗 ----------
let lastFocused = null; // 记录打开弹窗前的焦点元素，关闭后归还
function openDetail(name) {
  const s = SKILLS_DATA.skills.find((x) => x.name === name);
  if (!s) return;
  lastFocused = document.activeElement;
  const tools = (s.allowedTools || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `<span class="tool">${esc(t)}</span>`)
    .join("");
  $("#dialog").innerHTML = `
    <div class="sr-only" id="dialogTitle">${esc(s.zh || s.name)}</div>
    <div class="dialog-head" id="dialogHead">
      <div class="avatar">${initials(s.name)}</div>
      <div>
        <h2 id="dialogVisibleTitle">${esc(s.zh || s.name)}</h2>
        <div class="sub en">${esc(s.name)}</div>
      </div>
      <button class="icon-btn dialog-close" id="closeBtn" aria-label="${I18N.t("detail.close")}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
      </button>
    </div>
    <div class="dialog-body" id="dialogBody">
      <div class="block" id="dialogBlockZh"><h3 class="zh">${I18N.t("detail.zhTitle", "zh")}</h3><h3 class="en">${I18N.t("detail.zhTitle", "en")}</h3><p class="zh">${esc(s.zh)}</p></div>
      <div class="block" id="dialogBlockEn"><h3 class="zh">${I18N.t("detail.enTitle", "zh")}</h3><h3 class="en">${I18N.t("detail.enTitle", "en")}</h3><p class="en">${esc(s.description)}</p></div>
      <div class="block" id="dialogBlockCat"><h3>${I18N.t("detail.catTitle")}</h3><p>${esc(s.category)}</p></div>
      ${tools ? `<div class="block" id="dialogBlockTools"><h3>${I18N.t("detail.toolsTitle")}</h3><div class="tools">${tools}</div></div>` : ""}
    </div>
    <div class="dialog-foot" id="dialogFoot">
      <button class="btn btn-ghost" id="closeBtn2">${I18N.t("detail.close")}</button>
      <button class="btn btn-secondary" id="shareBtn" data-name="${esc(s.name)}" aria-label="${I18N.t("share.btn")}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"></path></svg>
        <span class="zh">${I18N.t("share.btn", "zh")}</span><span class="en">${I18N.t("share.btn", "en")}</span>
      </button>
      <a class="btn btn-primary" href="${SKILL_REPO_BASE + encodeURIComponent(s.name)}" target="_blank" rel="noopener">
        <span class="zh">${I18N.t("detail.open", "zh")}</span><span class="en">${I18N.t("detail.openEn", "en")}</span>
      </a>
    </div>`;
  overlay.classList.add("open");
  document.body.classList.add("no-scroll"); // 打开弹窗时锁定背景滚动
  const cb = $("#closeBtn"); if (cb) cb.onclick = closeDetail;
  const cb2 = $("#closeBtn2"); if (cb2) cb2.onclick = closeDetail;
  const sb = $("#shareBtn");
  if (sb) sb.onclick = () => shareSkill(sb.getAttribute("data-name"));
  if (cb) cb.focus(); // 焦点移入弹窗首个可聚焦元素，满足键盘用户可达
}
// 分享：复制「技能分析链接 + 随机宣传文案」，优先剪贴板 API，降级 execCommand
function buildShareText(name) {
  // 纯静态部署无 skills/<name>/ 路由，统一指向 GitHub 仓库对应技能目录（真实存在）
  const base = SKILL_REPO_BASE + encodeURIComponent(name);
  const promos = I18N.t("share.promos") || [];
  const n = (SKILLS_DATA ? SKILLS_DATA.total : 0) + "+";
  const promo = promos.length
    ? promos[Math.floor(Math.random() * promos.length)].replace(/\{n\}/g, n)
    : "";
  return base + "\n\n" + promo;
}
function shareSkill(name) {
  if (!name) return;
  const text = buildShareText(name);
  const done = () => showToast(I18N.t("share.copyOk"));
  const fail = () => showToast(I18N.t("share.copyFail"), true);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done, fail));
  } else {
    fallbackCopy(text, done, fail);
  }
}
// 复制降级：创建临时 textarea + execCommand('copy')
function fallbackCopy(text, done, fail) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "absolute"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    ok ? done() : fail();
  } catch (e) { fail(); }
}
// 轻量 toast 反馈（role=status, aria-live=polite；3s 自动消失）
let toastTimer = null;
function showToast(msg, isErr) {
  let el = $("#toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite"); document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.toggle("err", !!isErr);
  el.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
}
function closeDetail() {
  if (!overlay.classList.contains("open")) return;
  overlay.classList.remove("open");
  document.body.classList.remove("no-scroll");
  // 焦点归还到打开前的元素，避免键盘焦点丢失
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  lastFocused = null;
}
// 焦点陷阱：Tab 在弹窗内循环，不逃逸到背景（无障碍）
function trapFocus(e) {
  if (!overlay.classList.contains("open") || e.key !== "Tab") return;
  const f = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

// ---------- 主题 / 语言 ----------
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const sun = state.theme === "dark";
  $("#themeIcon").innerHTML = sun
    ? '<path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"></path>'
    : '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>';
}
function applyLang() {
  // 语言状态与 DOM 同步统一交给 I18N 模块，保证文案随语言联动且不崩溃
  I18N.setLang(state.lang); // 以持久化/默认语言为准初始化
  // 输入框占位符为单节点，无法用 CSS 显隐，故由 i18n 直接驱动
  const si = $("#searchInput");
  if (si) si.placeholder = I18N.t("search.placeholder");
  refreshHeroCount(); // syncDOM 重置 hero 标题后重新填入动态数字
}

// ---------- 事件绑定 ----------
function bind() {
  // 轻量防抖，避免每次按键全量重渲染（性能）
  let t;
  $("#searchInput").addEventListener("input", (e) => {
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(() => { state.q = v; renderGrid(); }, 120);
  });
  $("#viewToggle").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    state.view = b.dataset.view;
    $("#viewToggle").querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b));
    renderGrid();
  });
  $("#cats").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    state.cat = b.dataset.cat; renderCats(); renderGrid();
  });
  // 卡片点击（鼠标）与键盘（Enter/Space）统一打开详情
  grid.addEventListener("click", (e) => {
    const c = e.target.closest(".card"); if (c) openDetail(c.dataset.name);
  });
  grid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const c = e.target.closest(".card"); if (!c) return;
    e.preventDefault();
    openDetail(c.dataset.name);
  });
  // 空状态清除筛选按钮
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) { closeDetail(); return; }
    if (e.target.closest("#clearFilters")) {
      state.q = ""; state.cat = "全部";
      const si = $("#searchInput"); if (si) si.value = "";
      renderCats(); renderGrid();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDetail();
    trapFocus(e); // 弹窗内焦点陷阱
  });
  $("#themeBtn").addEventListener("click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    applyTheme(); savePref(LS_THEME, state.theme); // 持久化主题偏好
  });
  $("#langBtn").addEventListener("click", () => {
    I18N.toggleLang();
    state.lang = I18N.getLang();
    savePref(LS_LANG, state.lang); // 持久化语言偏好
  });
  // 回到顶部按钮：长列表滚动后出现，点击平滑回到顶部
  const toTop = $("#toTop");
  if (toTop) {
    window.addEventListener("scroll", () => {
      toTop.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
  // 分类条溢出指示：内容超出可视宽度时显示右侧渐隐遮罩
  const catsNav = $("#categoryNav");
  const catsScroll = $("#cats");
  function updateCatsOverflow() {
    if (!catsNav || !catsScroll) return;
    catsNav.classList.toggle("overflow", catsScroll.scrollWidth - catsScroll.clientWidth > 4);
  }
  catsScroll && catsScroll.addEventListener("scroll", updateCatsOverflow, { passive: true });
  window.addEventListener("resize", updateCatsOverflow, { passive: true });
  // 初次渲染后下一帧检测（DOM 已布局）
  requestAnimationFrame(updateCatsOverflow);
}

// ---------- 启动 ----------
function init() {
  applyTheme(); applyLang(); renderCats(); renderGrid(); bind();
}
init();
