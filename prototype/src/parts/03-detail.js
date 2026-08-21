// prototype/src/parts/03-detail.js v1.19.14 — 详情弹窗：元信息区(作者/协议/GitHub目录) + 相关技能 + 复制命令
// 全局函数风格：state / SKILLS_DATA / SKILL_MAP / esc / catHue / I18N 由其它脚本按序注入

// GitHub 仓库基础路径（详情弹窗跳转源码目录用）
const GITHUB_TREE = "https://github.com/sutchan/Agent-Skills-Hub/tree/main";

// 取同类技能（排除自身，最多 4 个）作为「相关技能」
function relatedSkills(skill) {
  return SKILLS_DATA.skills
    .filter((s) => s.name !== skill.name && s.category === skill.category && !s.hidden)
    .slice(0, 4);
}

// 复制技能名到剪贴板（提示已复制）
function copySkillName(name) {
  const done = () => {
    const tip = document.getElementById("copyTip");
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
    titleHTML = `<h2 class="d-title"><span class="en">${esc(titleEn)}</span></h2>`;
  } else if (st.nameMode === "zh") {
    titleHTML = `<h2 class="d-title"><span class="zh">${esc(titleZh)}</span></h2>`;
  } else {
    titleHTML = `<h2 class="d-title"><span class="zh">${esc(titleZh)}</span><span class="en">${esc(titleEn)}</span></h2>`;
  }

  // 元信息区：作者 / 协议 / 版本 / GitHub 目录
  const metaRows = [
    metaRow(I18N.t("detail.author"), skill.author || I18N.t("detail.unknown")),
    metaRow(I18N.t("detail.license"), skill.license || I18N.t("detail.unknown")),
    metaRow(I18N.t("detail.version"), skill.skillVersion || "—"),
    metaRow(I18N.t("detail.githubDir"), githubUrl, true),
  ].join("");

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
    <button id="detailClose" class="detail-close" aria-label="${I18N.t("detail.close")}">×</button>
    <div class="detail-head">
      ${titleHTML}
      <div class="d-actions">
        <button id="copyNameBtn" class="btn ghost" data-name="${esc(skill.name)}">${I18N.t("detail.copyName")}</button>
        <span id="copyTip" class="copy-tip"></span>
      </div>
    </div>
    <div class="detail-meta">${metaRows}</div>
    <div class="detail-body">
      <p class="d-desc">${esc(desc || "")}</p>
      ${toolsHTML}
      ${relatedHTML}
    </div>
  </div>`;
}

function openDetail(name) {
  const skill = SKILL_MAP.get(name);
  if (!skill) return;
  const overlay = document.getElementById("overlay");
  overlay.innerHTML = detailHTML(skill);
  overlay.classList.add("show");
  document.body.classList.add("no-scroll");

  document.getElementById("detailClose").addEventListener("click", closeDetail);
  const copyBtn = document.getElementById("copyNameBtn");
  if (copyBtn) copyBtn.addEventListener("click", () => copySkillName(skill.name));

  // 相关技能点击 → 切换详情
  overlay.querySelectorAll(".related-card").forEach((btn) => {
    btn.addEventListener("click", () => openDetail(btn.getAttribute("data-name")));
  });
}

function closeDetail() {
  const overlay = document.getElementById("overlay");
  if (!overlay) return;
  overlay.classList.remove("show");
  overlay.innerHTML = "";
  document.body.classList.remove("no-scroll");
}

// 全局 Esc 关闭（grid 点击委托与 overlay 点击关闭已在 04-interactions 处理）
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const overlay = document.getElementById("overlay");
    if (overlay && overlay.classList.contains("show")) closeDetail();
  }
});
