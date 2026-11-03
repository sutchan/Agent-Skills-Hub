// prototype/src/i18n.js v1.16.6 — 国际化引擎（字典见 i18n-zh.js / i18n-en.js）
(function (global) {
  "use strict";
  // 翻译字典由 i18n-zh.js / i18n-en.js 以全局 I18N_ZH / I18N_EN 注入
  var translations = { zh: I18N_ZH, en: I18N_EN };
  var SUPPORTED = ["zh", "en"];
  var FALLBACK = "zh";
