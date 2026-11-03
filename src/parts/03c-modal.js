// prototype/src/parts/03c-modal.js v1.16.6 — 详情弹窗开关

function openDetail(arg) {
  // 04-interactions 可能传入 skill 对象（原委托逻辑），也可能传入 name 字符串
  const skill = typeof arg === "string" ? SKILL_MAP.get(arg) : arg;
  if (!skill || !skill.name) return;
  _lastFocus = document.activeElement; // 记录触发元素，关闭时归还焦点（A1 无障碍）
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
  // 无障碍：打开后把焦点移入弹窗（聚焦关闭按钮），关闭时归还触发元素（见 closeDetail / A1）
  const dc = $("#detailClose");
  if (dc) dc.focus();
  const copyBtn = $("#copyNameBtn");
  if (copyBtn) copyBtn.addEventListener("click", () => copySkillName(skill.name));
  // 复制安装命令
  const copyCmdBtn = $("#copyCmdBtn");
  if (copyCmdBtn) copyCmdButton(copyCmdBtn);

  const exportBtn = $("#exportVotesBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const data = JSON.stringify(ensureVotes(), null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "skills-votes.json";
      a.click();
      URL.revokeObjectURL(url);
      showToast(state.lang === 'zh' ? '反馈数据已导出' : 'Votes data exported');
    });
  }

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
  // 无障碍：归还焦点到打开弹窗前的触发元素，避免焦点丢失在 body（A1）
  if (_lastFocus && document.contains(_lastFocus)) {
    try { _lastFocus.focus(); } catch { /* 忽略 */ }
  }
  _lastFocus = null;
}
