// prototype/src/parts/03b-render.js v1.16.6 — 详情弹窗 HTML 组装

function detailHTML(skill) {
  const st = state;
  const related = relatedSkills(skill);
  const githubUrl = `${GITHUB_TREE}/${skill.githubDir}`;
  const tools = (skill.allowedTools || []).filter(Boolean);

  const desc = st.lang === "zh" ? skill.description : (skill.enDescription || skill.description);
  const titleZh = skill.zh || skill.name;
  const titleEn = skill.name;
  const fav = isFavorite(skill.name);

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
  // Skills Manager 桌面应用：不支持深链接导入，按钮跳转到项目页，由用户在桌面端用「+ Add Skills」导入
  const SKILLS_MANAGER_URL = "https://github.com/xingkongliang/skills-manager";
  const installHTML = `
    <div class="d-install">
      <h4>${I18N.t("detail.install")}</h4>
      <div class="cmd-row">
        <code class="cmd-text" id="installCmd">${esc(cmd)}</code>
        <button id="copyCmdBtn" class="btn ghost" data-cmd="${esc(cmd)}" aria-label="${I18N.t("detail.copyCmd")}">${I18N.t("detail.copyCmd")}</button>
      </div>
      <span id="copyCmdTip" class="copy-tip"></span>
      <a id="skillManagerBtn" class="btn primary open-ext" href="${SKILLS_MANAGER_URL}" target="_blank" rel="noopener noreferrer" title="${I18N.t("detail.importWithManagerHint")}">
        ${I18N.t("detail.importWithManager")}
      </a>
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
  <div id="detailDialog" class="detail" role="dialog" aria-modal="true" aria-label="${esc(titleZh)}">
    <div class="detail-head">
      ${titleHTML}
      <div class="d-actions">
        <button type="button" class="fav-btn${fav ? " bookmarked" : ""}" data-fav-name="${esc(skill.name)}" aria-label="${fav ? "取消收藏" : "收藏"} ${esc(skill.name)}" title="${fav ? "取消收藏" : "收藏"}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${fav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
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
      <div class="d-vote" id="detailVote"><div class="d-vote-head"><h4>${I18N.t("vote.title")}</h4><div style="display:inline-flex;gap:8px;align-items:center;"><button type="button" id="exportVotesBtn" class="btn ghost sm" style="font-size:12px;padding:3px 8px;">导出反馈</button><a id="reportIssueLink" href="https://github.com/sutchan/Agent-Skills-Hub/issues/new" target="_blank" rel="noopener noreferrer" class="btn ghost sm open-ext" style="font-size:12px;padding:3px 8px;text-decoration:none;">反馈问题</a></div></div>${voteHTML(skill.name)}<p class="d-vote-note">${I18N.t("vote.note")}</p></div>
      ${relatedHTML}
    </div>
  </div>`;
}
