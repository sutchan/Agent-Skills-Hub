// prototype/src/i18n.js v1.14.2 — 独立国际化模块
// 设计目标：
//   1. 集中管理 UI 文案字典（zh / en），避免散落硬编码。
//   2. 翻译函数 t(key) 永远不抛错：key 缺失或语言缺失时降级到 zh / key 原文，
//      保证「即使翻译文件/字典出错，应用也不会崩溃」。
//   3. 语言状态、切换、DOM 同步全部收敛到本模块，与 UI 渲染解耦。
(function (global) {
  "use strict";

  // ---------- 1. 翻译字典（唯一来源） ----------
  // 若本字典在运行时被外部篡改或加载失败，模块仍可通过兜底逻辑运行。
  var translations = {
    zh: {
      "brand.subtitle": "Agent Skills Hub 原型",
      "lang.toggle": "中 / EN",
      "theme.toggle": "主题 / Theme",
      "hero.title": "发现并复用 {n} 高质量 Agent 技能",
      "hero.subtitle": "按分类浏览、搜索，或查看技能详情——为你的编码 agent 即取即用。",
      "stat.total": "技能总数",
      "stat.cats": "分类",
      "stat.shown": "当前展示",
      "search.placeholder": "搜索技能名称或描述…",
      "empty": "未找到匹配的技能",
      "detail.zhTitle": "中文描述",
      "detail.enTitle": "英文说明",
      "detail.catTitle": "分类 / Category",
      "detail.toolsTitle": "授权工具 / Allowed tools",
      "detail.close": "关闭 / Close",
      "detail.open": "查看技能",
      "detail.openEn": "Open skill",
      "detail.zhName": "中文名", // 详情弹窗内中文名标题（预留）
      "empty.desc": "换个关键词或分类试试，或清除当前筛选。",
      "empty.clear": "清除筛选",
      "share.btn": "分享",
      "share.copyOk": "已复制链接与宣传文案",
      "share.copyFail": "复制失败，请手动复制",
      "share.promos": [
        "😎 我在 Agent Skills Hub 发现了超好用的 AI 技能库，200+ 高质量技能免费收藏，直接丢进你的编程 Agent 就能用！",
        "🚀 Agent Skills Hub：200+ 精选 Agent 技能，按分类浏览、搜索、看详情，提升你的 AI 编码效率。",
        "💡 想让你的 Coding Agent 更强？来 Agent Skills Hub 逛逛，200+ 技能即插即用，开源免费！"
      ]
    },
    en: {
      "brand.subtitle": "Agent Skills Hub Prototype",
      "lang.toggle": "中 / EN",
      "theme.toggle": "主题 / Theme",
      "hero.title": "Discover & reuse {n} high-quality agent skills",
      "hero.subtitle": "Browse by category, search, or inspect skill details — ready to drop into your coding agent.",
      "stat.total": "Total skills",
      "stat.cats": "Categories",
      "stat.shown": "Shown",
      "search.placeholder": "Search skills by name or description…",
      "empty": "No matching skills",
      "detail.zhTitle": "Description (zh)",
      "detail.enTitle": "Description (en)",
      "detail.catTitle": "Category / 分类",
      "detail.toolsTitle": "Allowed tools / 授权工具",
      "detail.close": "Close / 关闭",
      "detail.open": "查看技能",
      "detail.openEn": "Open skill",
      "detail.zhName": "Chinese name",
      "empty.desc": "Try a different keyword or category, or clear the current filter.",
      "empty.clear": "Clear filters",
      "share.btn": "Share",
      "share.copyOk": "Link & promo copied",
      "share.copyFail": "Copy failed, please copy manually",
      "share.promos": [
        "😎 I found Agent Skills Hub — a library of 200+ high-quality AI agent skills you can drop straight into your coding agent. Free & open source!",
        "🚀 Agent Skills Hub: 200+ curated agent skills. Browse by category, search, inspect details — boost your AI coding workflow.",
        "💡 Want a stronger coding agent? Explore Agent Skills Hub: 200+ plug-and-play skills, open source and free!"
      ]
    }
  };

  var SUPPORTED = ["zh", "en"];
  var FALLBACK = "zh";

  // ---------- 2. 状态（带容错默认值） ----------
  var current = FALLBACK;
  var listeners = [];

  function safeGet(obj, path) {
    try {
      return obj && obj[path];
    } catch (e) {
      return undefined;
    }
  }

  // ---------- 3. 核心翻译函数（永不抛错） ----------
  // 降级策略：目标语言缺失 -> 回退 zh -> 仍缺失则返回 key 原文
  function t(key, lang) {
    try {
      var l = lang || current;
      if (!key) return "";
      var dict = safeGet(translations, l);
      var val = safeGet(dict, key);
      if (val === undefined || val === null || val === "") {
        // 回退到兜底语言
        var fb = safeGet(translations, FALLBACK);
        val = safeGet(fb, key);
      }
      if (val === undefined || val === null || val === "") {
        // 最终兜底：返回 key 本身，保证页面有可见文本且不崩溃
        return String(key);
      }
      return String(val);
    } catch (e) {
      // 任何意外错误都不向外传播
      return key ? String(key) : "";
    }
  }

  // ---------- 4. 语言状态管理 ----------
  function getLang() {
    return current;
  }
  function isSupported(lang) {
    return SUPPORTED.indexOf(lang) !== -1;
  }
  function setLang(lang) {
    if (!isSupported(lang)) return current; // 忽略非法语言，保持现状
    current = lang;
    syncDOM();
    emit();
    return current;
  }
  function toggleLang() {
    return setLang(current === "zh" ? "en" : "zh");
  }
  function onLangChange(cb) {
    if (typeof cb === "function") listeners.push(cb);
  }
  function emit() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](current); } catch (e) { /* 单个监听出错不影响其他 */ }
    }
  }

  // ---------- 5. DOM 同步（属性 + 静态文案填充） ----------
  // 即使字典出错，这里也会被 try/catch 包住，不会阻断应用其余逻辑。
  function syncDOM() {
    try {
      var root = document.documentElement;
      if (root) {
        root.setAttribute("data-lang", current);
        root.setAttribute("lang", current); // 同步可访问性/SEO 的 lang 属性
      }
      // 填充所有带 data-i18n 的静态节点：
      //   .zh 节点取 zh 文案，.en 节点取 en 文案；
      //   若节点无 .zh/.en 类，则按当前语言取。
      var nodes = document.querySelectorAll("[data-i18n]");
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var key = node.getAttribute("data-i18n");
        var text;
        if (node.classList.contains("en")) text = t(key, "en");
        else if (node.classList.contains("zh")) text = t(key, "zh");
        else text = t(key, current);
        if (text) node.textContent = text;
      }
    } catch (e) {
      // 同步失败不应影响交互逻辑
    }
  }

  // ---------- 6. 对外暴露 ----------
  var api = {
    translations: translations,
    supported: SUPPORTED,
    fallback: FALLBACK,
    t: t,
    getLang: getLang,
    setLang: setLang,
    toggleLang: toggleLang,
    onLangChange: onLangChange,
    syncDOM: syncDOM
  };

  // 兼容全局与模块化两种引入方式
  global.I18N = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : this);
