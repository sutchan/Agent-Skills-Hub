// prototype/src/parts/05-main.js v1.14.29 — 应用启动编排
function init() {
  // 从偏好恢复（localStorage 不可用时回退默认）
  state.theme = loadPref(LS_THEME, "light");
  state.lang = loadPref(LS_LANG, "zh");
  applyTheme();
  applyLang(); // 内部触发 I18N.setLang -> syncDOM 填充全站文案
  bind();
  renderGrid();
}

document.addEventListener("DOMContentLoaded", init);
