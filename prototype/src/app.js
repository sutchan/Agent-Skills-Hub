// prototype/src/app.js v1.11.0 — 原型交互逻辑
// 国际化交由独立模块 I18N（见 i18n.js）管理，本文件不再维护语言字典。
const state = { q: "", cat: "全部", view: "grid", theme: "light" };
const $ = (s) => document.querySelector(s);
const grid = $("#grid");
const overlay = $("#overlay");

// ---------- 工具函数 ----------
function initials(name) {
  const s = name.replace(/[-_]/g, " ").trim();
  return (s[0] || "S").toUpperCase();
}
function esc(str) {
  return String(str || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function matches(s) {
  if (state.cat !== "全部" && s.category !== state.cat) return false;
  if (!state.q) return true;
  const q = state.q.toLowerCase();
  return (s.name + " " + s.zh + " " + s.description).toLowerCase().includes(q);
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------- 渲染 ----------
function renderStats(filtered) {
  $("#statTotal").textContent = SKILLS_DATA.total;
  $("#statCats").textContent = SKILLS_DATA.categories.length;
  $("#statShown").textContent = filtered.length;
}
function renderCats() {
  const cats = ["全部", ...SKILLS_DATA.categories];
  $("#cats").innerHTML = cats
    .map((c) => {
      const n = c === "全部" ? SKILLS_DATA.total : SKILLS_DATA.skills.filter((s) => s.category === c).length;
      return `<button class="chip ${c === state.cat ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}<span class="c">${n}</span></button>`;
    })
    .join("");
}
function cardHTML(s) {
  const listCls = state.view === "list" ? "" : "";
  return `<article class="card" data-name="${esc(s.name)}">
    <div class="avatar">${initials(s.name)}</div>
    <div class="body">
      <div class="name">${esc(s.zh || s.name)}
        <span class="badge en">${esc(s.name)}</span>
      </div>
      <div class="desc zh">${esc(s.zh)}</div>
      <div class="desc en">${esc(s.description)}</div>
      <div class="meta"><span class="cat-tag">${esc(s.category)}</span></div>
    </div>
  </article>`;
}
function renderGrid() {
  const filtered = SKILLS_DATA.skills.filter(matches);
  renderStats(filtered);
  grid.className = "grid" + (state.view === "list" ? " list" : "");
  grid.innerHTML = filtered.length
    ? filtered.map(cardHTML).join("")
    : `<div class="empty zh" id="emptyStateZh">${I18N.t("empty", "zh")}</div><div class="empty en" id="emptyStateEn">${I18N.t("empty", "en")}</div>`;
}

// ---------- 详情弹窗 ----------
function openDetail(name) {
  const s = SKILLS_DATA.skills.find((x) => x.name === name);
  if (!s) return;
  const tools = (s.allowedTools || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `<span class="tool">${esc(t)}</span>`)
    .join("");
  $("#dialog").innerHTML = `
    <div class="dialog-head" id="dialogHead">
      <div class="avatar">${initials(s.name)}</div>
      <div>
        <h2 id="dialogTitle">${esc(s.zh || s.name)}</h2>
        <div class="sub en">${esc(s.name)}</div>
      </div>
      <button class="icon-btn dialog-close" id="closeBtn" aria-label="关闭">
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
      <a class="btn btn-primary" href="skills/${esc(s.name)}/" target="_blank" rel="noopener">
        <span class="zh">${I18N.t("detail.open", "zh")}</span><span class="en">${I18N.t("detail.openEn", "en")}</span>
      </a>
    </div>`;
  overlay.classList.add("open");
  $("#closeBtn").onclick = closeDetail;
  $("#closeBtn2").onclick = closeDetail;
}
function closeDetail() { overlay.classList.remove("open"); }

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
  I18N.syncDOM();
}

// ---------- 事件绑定 ----------
function bind() {
  $("#searchInput").addEventListener("input", (e) => { state.q = e.target.value; renderGrid(); });
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
  grid.addEventListener("click", (e) => {
    const c = e.target.closest(".card"); if (c) openDetail(c.dataset.name);
  });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeDetail(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDetail(); });
  $("#themeBtn").addEventListener("click", () => { state.theme = state.theme === "light" ? "dark" : "light"; applyTheme(); });
  $("#langBtn").addEventListener("click", () => { I18N.toggleLang(); });
}

// ---------- 启动 ----------
function init() {
  applyTheme(); applyLang(); renderCats(); renderGrid(); bind();
}
init();
