// prototype/src/parts/03a-utils.js v1.16.6 — 详情工具函数（相关技能/大小/复制/元信息）
// prototype/src/parts/03-detail.js v1.14.88 — 详情弹窗：元信息区 + 安装命令 + 相关技能 + 复制 + 移动端 Sheet
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
