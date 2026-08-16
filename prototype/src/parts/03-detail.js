// prototype/src/parts/03-detail.js v1.14.8 — 详情弹窗、键盘可达性与分享
function openDetail(s) {
  const overlay = $("#overlay");
  const dialog = $("#dialog");
  // 记录打开前的焦点元素，关闭后归还（WCAG 焦点管理）
  dialog._lastFocused = document.activeElement;
  // 本地仓库链接用相对路径 skills/<name>/（部署后由 GitHub 自动解析为 tree/main/skills/<name>/）
  const html = `
    <div id="dialogHead" class="dialog-head">
      <div class="d-avatar">${initials(s.name)}</div>
      <div>
        <h2 id="dialogVisibleTitle" class="dialog-title">${esc(s.name)}</h2>
        <div id="dialogBlockCat" class="dialog-cat">${esc(s.category)}</div>
      </div>
      <button id="closeBtn" class="icon-btn" aria-label="${I18N.t("detail.close", "zh")}">✕</button>
    </div>
    <div id="dialogBody" class="dialog-body">
      <section id="dialogBlockZh" class="block"><h3 class="zh">${I18N.t("detail.zhTitle", "zh")}</h3><p>${esc(s.zh)}</p></section>
      <section id="dialogBlockEn" class="block"><h3 class="en">${I18N.t("detail.enTitle", "en")}</h3><p>${esc(s.description)}</p></section>
      <section id="dialogBlockTools" class="block"><h3>${I18N.t("detail.tools")}</h3><div class="tools">${(Array.isArray(s.allowedTools) ? s.allowedTools : String(s.allowedTools || "").split(",").map((t) => t.trim()).filter(Boolean)).map((t) => `<code>${esc(t)}</code>`).join("")}</div></section>
    </div>
    <div id="dialogFoot" class="dialog-foot">
      <a class="btn btn-primary" href="skills/${encodeURIComponent(s.name)}/" target="_blank" rel="noopener">
        <span class="zh">${I18N.t("detail.open", "zh")}</span><span class="en">${I18N.t("detail.openEn", "en")}</span>
      </a>
      <button id="shareBtn" class="btn btn-ghost">${I18N.t("share.btn")}</button>
    </div>`;
  dialog.innerHTML = html;
  overlay.classList.add("open");
  document.body.classList.add("no-scroll");
  trapFocus(dialog);
  $("#closeBtn").addEventListener("click", closeDetail);
  $("#shareBtn").addEventListener("click", () => shareSkill(s));
}

function closeDetail() {
  const overlay = $("#overlay");
  const dialog = $("#dialog");
  overlay.classList.remove("open");
  document.body.classList.remove("no-scroll");
  dialog.innerHTML = "";
  // 归还焦点到打开前的元素，避免 Tab 顺序跳到页面顶部
  if (dialog._lastFocused && typeof dialog._lastFocused.focus === "function") {
    dialog._lastFocused.focus();
  }
}

// 焦点陷阱：Tab 在弹窗内循环，Esc 关闭（无障碍）
function trapFocus(container) {
  const focusables = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusables.length) return;
  const first = focusables[0], last = focusables[focusables.length - 1];
  first.focus();
  container.addEventListener("keydown", function onKey(e) {
    if (e.key === "Escape") { closeDetail(); container.removeEventListener("keydown", onKey); }
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

function shareSkill(s) {
  const text = buildShareText(s.name);
  if (navigator.share) {
    navigator.share({ title: "Agent Skills Hub", text, url: location.href }).catch(() => {});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(I18N.t("share.copied"))).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

// 规范要求相对路径 skills/<name>/：部署后由 GitHub 自动解析为 tree/main/skills/<name>/，
// 离线/无 location 场景回退相对路径（不依赖任何外部 repo 配置字段）
function buildShareText(name) {
  const base = "skills/" + encodeURIComponent(name) + "/";
  const promos = I18N.t("share.promos") || [];
  const n = (SKILLS_DATA ? SKILLS_DATA.total : 0) + "+";
  const promo = promos.length
    ? promos[Math.floor(Math.random() * promos.length)].replace(/\{n\}/g, n)
    : "";
  return base + "\n\n" + promo;
}

// 复制降级方案（无 Clipboard API 时）
function fallbackCopy(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast(I18N.t("share.copied"));
  } catch (e) {
    showToast(I18N.t("share.failed"));
  }
}

function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2000);
}
