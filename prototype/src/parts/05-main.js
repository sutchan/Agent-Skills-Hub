// prototype/src/parts/05-main.js v1.14.30 — 应用启动编排
function init() {
  // 从偏好恢复（localStorage 不可用时回退默认）
  state.theme = loadPref(LS_THEME, "light");
  state.lang = loadPref(LS_LANG, "zh");
  // 预聚合：每个技能缓存小写检索串 _hay，并建立 name->skill 索引，避免运行时重复计算
  SKILLS_DATA.skills.forEach((s) => {
    s._hay = (s.name + " " + s.zh + " " + s.description + " " + s.category).toLowerCase();
    SKILL_MAP.set(s.name, s);
  });
  applyTheme();
  applyLang(); // 内部触发 I18N.setLang -> syncDOM 填充全站文案
  bind();
  renderGrid();
}

document.addEventListener("DOMContentLoaded", init);
