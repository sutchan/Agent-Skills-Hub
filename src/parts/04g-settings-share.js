// prototype/src/parts/04g-settings-share.js v1.16.6 — 设置弹窗 + 分享 + toast
function openSettings() {
  const dialog = $("#dialog");
  const overlay = $("#overlay");
  if (!dialog || !overlay) return;
  _lastFocus = document.activeElement; // 记录触发元素（设置按钮），关闭时归还焦点（A1）
  const t = (k) => I18N.t(k);
  // 单选组：根据 state 当前值标记 active；点击即写回 state + 持久化 + 应用
  const seg = (name, current, opts) =>
    `<div class="seg" role="group" aria-label="${esc(t(name))}">` +
    opts.map((o) =>
      `<button type="button" class="seg-btn${o.val === current ? " active" : ""}" data-name="${name}" data-val="${o.val}" aria-pressed="${o.val === current ? "true" : "false"}">${esc(t(o.label))}</button>`
    ).join("") +
    `</div>`;
  const toggle = (key, on) =>
    `<button type="button" class="switch${on ? " on" : ""}" data-switch="${key}" role="switch" aria-checked="${on}" aria-label="${esc(t(key))}"><span class="knob"></span></button>`;

  dialog.innerHTML = `
  <div class="settings-panel" id="settingsPanel" role="document">
    <div class="settings-head">
      <h2 class="zh" data-i18n="settings.title" id="settingsTitleZh">设置</h2>
      <h2 class="en" data-i18n="settings.title" id="settingsTitleEn">Settings</h2>
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
  // 无障碍：指向设置标题（中英两 h2 随 data-lang 显隐，aria-labelledby 引用可见者，隐藏者被忽略，A3）
  dialog.setAttribute("aria-labelledby", "settingsTitleZh settingsTitleEn");
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
      dialog.querySelectorAll(`.seg-btn[data-name="${name}"]`).forEach((b) => { b.classList.toggle("active", b === btn); b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
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
  if (closeBtn) { closeBtn.addEventListener("click", closeDetail); closeBtn.focus(); }
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

// 分享仓库：优先分享当前页面 URL（含 P0-1 的 hash 深链，如 #cat=docs&q=xxx），回退 origin，再回退 GitHub
const REPO_FALLBACK = "https://github.com/sutchan/Agent-Skills-Hub";
function shareRepo() {
  const promos = I18N.t("share.promos");
  const list = Array.isArray(promos) ? promos : [String(promos || "")];
  const tpl = list.length ? list[Math.floor(Math.random() * list.length)] : "";
  const total = (SKILLS_DATA && SKILLS_DATA.skills) ? SKILLS_DATA.skills.filter((s) => !s.hidden).length : 0;
  const shareUrl = (typeof location !== "undefined" && location.href) ? location.href : REPO_FALLBACK;
  const text = `${tpl.replace(/\{n\}/g, total)}\n${shareUrl}`;
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
