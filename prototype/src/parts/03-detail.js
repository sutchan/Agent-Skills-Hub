// prototype/src/parts/03-detail.js v1.20.17 — 详情弹窗：元信息区 + 安装命令 + 相关技能 + 复制 + 移动端 Sheet
// 全局函数风格：state / SKILLS_DATA / SKILL_MAP / esc / catHue / I18N 由其它脚本按序注入

// GitHub 仓库基础路径（详情弹窗跳转源码目录用）
const GITHUB_TREE = "https://github.com/sutchan/Agent-Skills-Hub/tree/main";

// 取同类技能（排除自身，最多 4 个）作为「相关技能」
function relatedSkills(skill) {
  return SKILLS_DATA.skills
    .filter((s) => s.name !== skill.name && s.category === skill.category && !s.hidden)
    .slice(0, 4);
}

// 字节数 → 友好文本（KB / MB）
function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

// 热度：5 格指示，按全局最大提及数归一（0 提及显示「独立 / standalone」）
let _maxPop = 0;
function maxPopularity() {
  if (_maxPop) return _maxPop;
  _maxPop = SKILLS_DATA.skills.reduce((m, s) => Math.max(m, s.popularity || 0), 0);
  return _maxPop;
}
function popularityHTML(pop) {
  const max = maxPopularity();
  const filled = max > 0 ? Math.round((pop / max) * 5) : 0;
  const bars = Array.from({ length: 5 }, (_, i) =>
    `<i class="heat${i < filled ? " on" : ""}"></i>`
  ).join("");
  const label = pop > 0 ? `${pop} ${I18N.t("detail.popRefs")}` : I18N.t("detail.popStandalone");
  return `<div class="metric-pop"><span class="heat-bars">${bars}</span><span class="pop-label">${esc(label)}</span></div>`;
}

// 复制技能名到剪贴板（提示已复制）
function copySkillName(name) {
  const done = () => {
    const tip = $("#copyTip");
    if (tip) {
      tip.textContent = I18N.t("detail.copied");
      tip.classList.add("show");
      setTimeout(() => tip.classList.remove("show"), 1400);
    }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(name).then(done).catch(() => fallbackCopy(name, done));
  } else {
    fallbackCopy(name, done);
  }
}
function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); done(); } catch { /* 忽略 */ }
  document.body.removeChild(ta);
}

// 复制安装命令：读取按钮 data-cmd，提示到该弹窗内 #copyCmdTip（区别于复制名称的 #copyTip）
function copyCmdButton(btn) {
  const cmd = btn.getAttribute("data-cmd") || "";
  const done = () => {
    const tip = $("#copyCmdTip");
    if (tip) {
      tip.textContent = I18N.t("detail.copied");
      tip.classList.add("show");
      setTimeout(() => tip.classList.remove("show"), 1400);
    }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cmd).then(done).catch(() => fallbackCopy(cmd, done));
  } else {
    fallbackCopy(cmd, done);
  }
}

function metaRow(label, value, isLink) {
  if (!value) return "";
  if (isLink) {
    return `<div class="meta-row"><span class="meta-k">${esc(label)}</span><a class="meta-v link" href="${esc(value)}" target="_blank" rel="noopener">${esc(value.replace(/^https?:\/\//, ""))}</a></div>`;
  }
  return `<div class="meta-row"><span class="meta-k">${esc(label)}</span><span class="meta-v">${esc(value)}</span></div>`;
}

function detailHTML(skill) {
  const st = state;
  const related = relatedSkills(skill);
  const githubUrl = `${GITHUB_TREE}/${skill.githubDir}`;
  const tools = (skill.allowedTools || []).filter(Boolean);

  const desc = st.lang === "zh" ? skill.description : (skill.enDescription || skill.description);
  const titleZh = skill.zh || skill.name;
  const titleEn = skill.name;

  // 名称显示策略（与卡片一致）
  let titleHTML = "";
  if (st.nameMode === "en") {
    titleHTML = `<h2 class="d-title" id="d-title"><span class="en">${esc(titleEn)}</span></h2>`;
  } else if (st.nameMode === "zh") {
    titleHTML = `<h2 class="d-title" id="d-title"><span class="zh">${esc(titleZh)}</span></h2>`;
  } else {
    titleHTML = `<h2 class="d-title" id="d-title"><span class="zh">${esc(titleZh)}</span><span class="en">${esc(titleEn)}</span></h2>`;
  }

  // 元信息区：技能名称 / 分类 / 主页 / GitHub 目录
  // 仅渲染 data 中真实存在的字段（author/stars/license/version/firstSeen 在数据源中不存在，已移除对应死代码）
  // 未知项（空值）直接不显示，不渲染占位符
  const catText = skill.enCategory ? `${skill.category} · ${skill.enCategory}` : (skill.category || "");
  // 仅当 homepage 为合法 http(s) 链接时才作为外链展示
  const hp = /^https?:\/\//i.test(skill.homepage || "") ? skill.homepage : "";
  const metaRows = [
    metaRow(I18N.t("detail.rawName"), skill.name),
    metaRow(I18N.t("detail.category"), catText),
    metaRow(I18N.t("detail.homepage"), hp, true),
    metaRow(I18N.t("detail.githubDir"), githubUrl, true),
  ].join("");

  // 安装命令区（复制即用）
  const cmd = skill.installCommand || `npx skills add sutchan/Agent-Skills-Hub/skills/${skill.name}`;
  const installHTML = `
    <div class="d-install">
      <h4>${I18N.t("detail.install")}</h4>
      <div class="cmd-row">
        <code class="cmd-text" id="installCmd">${esc(cmd)}</code>
        <button id="copyCmdBtn" class="btn ghost" data-cmd="${esc(cmd)}" aria-label="${I18N.t("detail.copyCmd")}">${I18N.t("detail.copyCmd")}</button>
      </div>
      <span id="copyCmdTip" class="copy-tip"></span>
    </div>`;

  // 派生指标：大小 / 文件数 / 热度
  const sizeText = formatSize(skill.size);
  const filesText = skill.files != null ? `${skill.files} ${I18N.t("detail.filesUnit")}` : "";
  const metricHTML = `
    <div class="detail-metrics">
      ${sizeText ? `<div class="metric"><span class="metric-k">${esc(I18N.t("detail.size"))}</span><span class="metric-v">${esc(sizeText)}</span></div>` : ""}
      ${filesText ? `<div class="metric"><span class="metric-k">${esc(I18N.t("detail.files"))}</span><span class="metric-v">${esc(filesText)}</span></div>` : ""}
      <div class="metric metric-pop-wrap">
        <span class="metric-k">${esc(I18N.t("detail.popularity"))}</span>
        ${popularityHTML(skill.popularity || 0)}
      </div>
    </div>`;

  const toolsHTML = tools.length
    ? `<div class="d-tools"><h4>${I18N.t("detail.tools")}</h4><div class="tool-chips">${tools
        .map((t) => `<span class="tool-chip">${esc(t)}</span>`)
        .join("")}</div></div>`
    : "";

  const relatedHTML = related.length
    ? `<div class="d-related"><h4>${I18N.t("detail.related")}</h4><div class="related-list">${related
        .map(
          (r) =>
            `<button class="related-card" data-name="${esc(r.name)}"><span class="rc-cat">${esc(r.category)}</span><span class="rc-name">${esc(r.zh || r.name)}</span></button>`
        )
        .join("")}</div></div>`
    : "";

  return `
  <div id="detailPanel" class="detail" role="dialog" aria-modal="true" aria-label="${esc(titleZh)}">
    <div class="detail-head">
      ${titleHTML}
      <div class="d-actions">
        <button id="copyNameBtn" class="btn ghost" data-name="${esc(skill.name)}">${I18N.t("detail.copyName")}</button>
        <span id="copyTip" class="copy-tip"></span>
      </div>
      <button id="detailClose" class="detail-close" aria-label="${I18N.t("detail.close")}">×</button>
    </div>
    <div class="detail-meta">${metaRows}</div>
    ${installHTML}
    ${metricHTML}
    <div class="detail-body">
      <p class="d-desc">${esc(desc || "")}</p>
      ${toolsHTML}
      ${relatedHTML}
    </div>
  </div>`;
}

function openDetail(arg) {
  // 04-interactions 可能传入 skill 对象（原委托逻辑），也可能传入 name 字符串
  const skill = typeof arg === "string" ? SKILL_MAP.get(arg) : arg;
  if (!skill || !skill.name) return;
  const overlay = $("#overlay");
  const dialog = $("#dialog");
  // 详情内容注入常驻 #dialog（保留元素，避免破坏设置弹窗等复用者）
  dialog.innerHTML = detailHTML(skill);
  // 方案 C：移动端（≤640px）改为底部抽屉 Sheet，否则居中 Modal
  const isSheet = window.matchMedia("(max-width: 640px)").matches;
  dialog.classList.toggle("sheet", isSheet);
  dialog.classList.toggle("modal", !isSheet);
  // 无障碍：弹窗标题由详情动态渲染的 #d-title 提供（避免指向不存在的静态 id）
  dialog.setAttribute("aria-labelledby", "d-title");
  overlay.classList.add("show");
  dialog.classList.add("show"); // #dialog 默认 display:none，需 .show 才可见
  document.body.classList.add("no-scroll");

  $("#detailClose").addEventListener("click", closeDetail);
  const copyBtn = $("#copyNameBtn");
  if (copyBtn) copyBtn.addEventListener("click", () => copySkillName(skill.name));
  // 复制安装命令
  const copyCmdBtn = $("#copyCmdBtn");
  if (copyCmdBtn) copyCmdButton(copyCmdBtn);

  // 相关技能点击 → 切换详情
  dialog.querySelectorAll(".related-card").forEach((btn) => {
    btn.addEventListener("click", () => openDetail(btn.getAttribute("data-name")));
  });
}

function closeDetail() {
  const overlay = $("#overlay");
  const dialog = $("#dialog");
  if (!overlay) return;
  overlay.classList.remove("show");
  if (dialog) {
    dialog.classList.remove("show"); // 还原 #dialog 隐藏态
    dialog.classList.remove("sheet", "modal", "flip");
    dialog.removeAttribute("aria-labelledby");
    dialog.innerHTML = ""; // 仅清空内容，保留 #dialog 容器
  }
  document.body.classList.remove("no-scroll");
}

// 全局 Esc 关闭（grid 点击委托与 overlay 点击关闭已在 04-interactions 处理）
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const overlay = $("#overlay");
    if (overlay && overlay.classList.contains("show")) closeDetail();
  }
});
