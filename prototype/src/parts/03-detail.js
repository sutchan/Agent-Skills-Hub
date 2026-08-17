// prototype/src/parts/03-detail.js v1.14.29 — 详情弹窗、键盘可达性与分享
// 查看技能按钮指向 GitHub 仓库中该 skill 的目录（tree 视图），稳定可用、跨部署环境一致
const REPO_SKILLS_TREE = "https://github.com/sutchan/Agent-Skills-Hub/tree/main/skills/";
function openDetail(s) {
  track("view_skill", { skill: s.name, category: s.category });
  const overlay = $("#overlay");
  const dialog = $("#dialog");
  // 记录打开前的焦点元素，关闭后归还（WCAG 焦点管理）
  dialog._lastFocused = document.activeElement;
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
      <section id="dialogBlockTools" class="block"><h3>${I18N.t("detail.toolsTitle")}</h3><div class="tools">${(Array.isArray(s.allowedTools) ? s.allowedTools : String(s.allowedTools || "").split(",").map((t) => t.trim()).filter(Boolean)).map((t) => `<code>${esc(t)}</code>`).join("")}</div></section>
    </div>
    <div id="dialogFoot" class="dialog-foot">
      <a class="btn btn-primary" href="${REPO_SKILLS_TREE}${encodeURIComponent(s.name)}/" target="_blank" rel="noopener">
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
  // 移除焦点陷阱的 keydown 监听，避免多次打开后监听器在 #dialog 上累积叠加
  if (typeof dialog._onKey === "function") {
    dialog.removeEventListener("keydown", dialog._onKey);
    dialog._onKey = null;
  }
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
  // 保存引用供 closeDetail 统一移除（无论通过 Esc 还是关闭按钮/遮罩关闭都能清理）
  container._onKey = function onKey(e) {
    if (e.key === "Escape") { closeDetail(); return; }
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  container.addEventListener("keydown", container._onKey);
}

function shareSkill(s) {
  track("share_skill", { skill: s.name });
  const text = buildShareText(s.name);
  if (navigator.share) {
    // 系统分享：成功/失败都给出可见反馈；被取消或失败则回退到剪贴板复制
    navigator.share({ title: "Agent Skills Hub", text, url: location.href })
      .then(() => showToast(I18N.t("share.copied")))
      .catch((err) => {
        if (err && err.name === "AbortError") return; // 用户主动取消，不回退
        copyToClipboard(text);
      });
  } else {
    copyToClipboard(text);
  }
}

// 统一的剪贴板复制入口：优先 Clipboard API，失败降级到 textarea execCommand
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(I18N.t("share.copied"))).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

// 分享链接使用绝对 GitHub URL（与 #dialog 的「查看技能」按钮一致的 REPO_SKILLS_TREE 常量），
// 保证复制到外部平台（微信/Twitter 等）后可直接点击打开，与 app 层 share.ts 行为对齐（openspec §4.5.4）
function buildShareText(name) {
  const base = REPO_SKILLS_TREE + encodeURIComponent(name) + "/";
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
