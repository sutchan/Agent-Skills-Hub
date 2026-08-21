// prototype/src/parts/05-main.js v1.18.0 — 应用启动编排
function init() {
  // 从偏好恢复（localStorage 不可用时回退默认）
  state.theme = loadPref(LS_THEME, "light");
  state.lang = loadPref(LS_LANG, "zh");
  state.view = loadEnum(LS_VIEW, [VIEW_GRID, VIEW_LIST], VIEW_GRID);
  state.density = loadEnum(LS_DENSITY, [DENSITY_COMFORT, DENSITY_COMPACT], DENSITY_COMFORT);
  // 预聚合：每个技能缓存小写检索串 _hay，并建立 name->skill 索引，避免运行时重复计算
  SKILLS_DATA.skills.forEach((s) => {
    s._hay = (s.name + " " + s.zh + " " + s.description + " " + (s.enDescription || "") + " " + s.category + " " + (s.enCategory || "")).toLowerCase();
    SKILL_MAP.set(s.name, s);
  });
  applyTheme();
  applyView();
  applyDensity();
  applyLang(); // 内部触发 I18N.setLang -> syncDOM 填充全站文案
  bind();
  renderGrid();
  // 量取顶栏高度注入 --topbar-h，供 .controls sticky 偏移使用（P2-1），并监听 resize 更新
  const setTopbarH = () => {
    const h = document.getElementById("siteHeader");
    if (h) document.documentElement.style.setProperty("--topbar-h", h.offsetHeight + "px");
  };
  setTopbarH();
  window.addEventListener("resize", setTopbarH);
}

document.addEventListener("DOMContentLoaded", init);
