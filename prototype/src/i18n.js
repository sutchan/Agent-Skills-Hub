// prototype/src/i18n.js v1.20.27 — 独立国际化模块
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
      "brand.subtitle": "高质量 Agent 技能库",
      "lang.toggle": "中 / EN",
      "theme.toggle": "主题 / Theme",
      "hero.eyebrow": "Agent 技能枢纽",
      "hero.title": "零散的 agent 技能，汇聚成一处可检索的枢纽",
      "hero.subtitle": "按分类浏览、搜索，或查看技能详情——为你的编码 agent 即取即用。",
      "stat.total": "技能总数",
      "stat.cats": "分类",
      "stat.enCov": "英文描述",
      "stat.langs": "支持语言",
      "search.placeholder": "搜索技能名称或描述…",
      "detail.category": "分类 / Category",
      "detail.homepage": "主页 / Homepage",
      "detail.rawName": "技能名称 / Name",
      "detail.toolsTitle": "授权工具 / Allowed tools",
      "detail.close": "关闭 / Close",
      "detail.license": "协议 / License",
      "detail.version": "版本 / Version",
      "detail.githubDir": "GitHub 源码 / Source",
      "detail.stars": "星标 / Stars",
      "detail.firstSeen": "首次收录 / First seen",
      "detail.install": "安装命令 / Install",
      "detail.copyCmd": "复制命令",
      "detail.tools": "授权工具 / Allowed tools",
      "detail.related": "相关技能 / Related",
      "detail.copyName": "复制名称",
      "detail.copied": "已复制",
      "detail.unknown": "未知 / Unknown",
      "detail.size": "大小 / Size",
      "detail.files": "文件数 / Files",
      "detail.filesUnit": "个",
      "detail.popularity": "热度 / Popularity",
      "detail.popRefs": "次被引用",
      "detail.popStandalone": "独立（无引用）",
      "empty.desc": "换个关键词或分类试试，或清除当前筛选。",
      "empty.clear": "清除筛选",
      "share.btn": "分享",
      "share.copied": "已复制到剪贴板",
      "share.failed": "复制失败，请手动复制",
      "filter.all": "全部",
      "filter.tags": "标签",
      "dice.btn": "今天学点什么",
      "dice.title": "为你抽中的技能",
      "dice.hint": "不知道从哪开始？让骰子决定。",
      "sort.name": "名称 A-Z",
      "sort.nameDesc": "名称 Z-A",
      "sort.cat": "按分类",
      "sort.zh": "按中文名",
      "empty.title": "未找到匹配的技能",
      "card.noDesc": "暂无中文描述。",
      "result.count": "共 {n} 个技能",
      "result.empty": "无匹配结果",
      "pager.prev": "上一页",
      "pager.next": "下一页",
      "pager.page": "第 {n} 页",
      "pager.info": "第 {cur} / {pages} 页",
      "settings.title": "设置",
      "settings.langGroup": "语言 / Language",
      "settings.language": "界面语言",
      "settings.themeGroup": "主题 / Theme",
      "settings.theme": "外观主题",
      "settings.viewGroup": "布局 / Layout",
      "settings.view": "视图模式",
      "settings.viewGrid": "网格 / Grid",
      "settings.viewList": "列表 / List",
      "settings.densityGroup": "密度 / Density",
      "settings.density": "卡片间距",
      "settings.densityComfortable": "舒适 / Comfortable",
      "settings.densityCompact": "紧凑 / Compact",
      "settings.uiGroup": "界面元素 / UI elements",
      "settings.showDesc": "显示技能描述",
      "settings.showCat": "显示分类标签",
      "settings.showBar": "显示分类色条",
      "settings.nameGroup": "名称显示 / Name display",
      "settings.nameBoth": "双显",
      "settings.nameZh": "仅中文",
      "settings.nameEn": "仅英文",
      "settings.done": "完成",
      "language.zh": "中文",
      "language.en": "英文",
      "theme.light": "浅色",
      "theme.dark": "深色",
      "share.promos": [
        "😎 我在 Agent Skills Hub 发现了超好用的 AI 技能库，{n} 高质量技能免费收藏，直接丢进你的编程 Agent 就能用！",
        "🚀 Agent Skills Hub：{n} 精选 Agent 技能，按分类浏览、搜索、看详情，提升你的 AI 编码效率。",
        "💡 想让你的 Coding Agent 更强？来 Agent Skills Hub 逛逛，{n} 技能即插即用，开源免费！"
      ],
      "footer.desc": "高质量 Agent 技能目录，按分类浏览、搜索、即取即用。",
      "footer.copyright": "开源免费 · MIT 协议",
      "footer.star": "给仓库点个 Star ⭐"
    },
    en: {
      "brand.subtitle": "Curated agent skill library",
      "lang.toggle": "中 / EN",
      "theme.toggle": "主题 / Theme",
      "hero.eyebrow": "Agent Skills Hub",
      "hero.title": "Scattered agent skills, unified into one searchable hub",
      "hero.subtitle": "Browse by category, search, or inspect skill details — ready to drop into your coding agent.",
      "stat.total": "Total skills",
      "stat.cats": "Categories",
      "stat.enCov": "EN described",
      "stat.langs": "Languages",
      "search.placeholder": "Search skills by name or description…",
      "detail.category": "Category",
      "detail.homepage": "Homepage",
      "detail.rawName": "Skill name / Name",
      "detail.toolsTitle": "Allowed tools / 授权工具",
      "detail.close": "Close / 关闭",
      "detail.githubDir": "GitHub source",
      "detail.install": "Install",
      "detail.copyCmd": "Copy command",
      "detail.tools": "Allowed tools",
      "detail.related": "Related skills",
      "detail.copyName": "Copy name",
      "detail.copied": "Copied",
      "detail.size": "Size",
      "detail.files": "Files",
      "detail.filesUnit": "",
      "detail.popularity": "Popularity",
      "detail.popRefs": "refs",
      "detail.popStandalone": "Standalone",
      "empty.desc": "Try a different keyword or category, or clear the current filter.",
      "empty.clear": "Clear filters",
      "share.btn": "Share",
      "share.copied": "Copied to clipboard",
      "share.failed": "Copy failed, please copy manually",
      "filter.all": "All",
      "filter.tags": "Tags",
      "dice.btn": "Learn something",
      "dice.title": "Your skill draw",
      "dice.hint": "Not sure where to start? Let the dice decide.",
      "sort.name": "Name A-Z",
      "sort.nameDesc": "Name Z-A",
      "sort.cat": "By category",
      "sort.zh": "By Chinese name",
      "empty.title": "No matching skills",
      "card.noDesc": "No description available.",
      "result.count": "{n} skills",
      "result.empty": "No matches",
      "pager.prev": "Previous",
      "pager.next": "Next",
      "pager.page": "Page {n}",
      "pager.info": "Page {cur} / {pages}",
      "settings.title": "Settings",
      "settings.langGroup": "Language",
      "settings.language": "Interface language",
      "settings.themeGroup": "Theme",
      "settings.theme": "Appearance theme",
      "settings.viewGroup": "Layout",
      "settings.view": "View mode",
      "settings.viewGrid": "Grid",
      "settings.viewList": "List",
      "settings.densityGroup": "Density",
      "settings.density": "Card spacing",
      "settings.densityComfortable": "Comfortable",
      "settings.densityCompact": "Compact",
      "settings.uiGroup": "UI elements",
      "settings.showDesc": "Show skill description",
      "settings.showCat": "Show category label",
      "settings.showBar": "Show category color bar",
      "settings.nameGroup": "Name display",
      "settings.nameBoth": "Both",
      "settings.nameZh": "Chinese",
      "settings.nameEn": "English",
      "settings.done": "Done",
      "language.zh": "Chinese",
      "language.en": "English",
      "theme.light": "Light",
      "theme.dark": "Dark",
      "share.promos": [
        "😎 I found Agent Skills Hub — a library of {n} high-quality AI agent skills you can drop straight into your coding agent. Free & open source!",
        "🚀 Agent Skills Hub: {n} curated agent skills. Browse by category, search, inspect details — boost your AI coding workflow.",
        "💡 Want a stronger coding agent? Explore Agent Skills Hub: {n} plug-and-play skills, open source and free!"
      ],
      "footer.desc": "A curated directory of high-quality agent skills — browse, search, and reuse.",
      "footer.copyright": "Open source · MIT License",
      "footer.star": "Star this repo ⭐"
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
  // 功能标签中英显示名（与 tools/build-skills-data.mjs TAG_DEFS 的 slug 对齐，v1.20.12）
  var TAG_LABELS = {
    "ai-agent": { zh: "AI 与智能体", en: "AI & Agents" },
    "cli": { zh: "命令行", en: "CLI" },
    "web-frontend": { zh: "Web 前端", en: "Web & Frontend" },
    "doc-writing": { zh: "文档写作", en: "Docs & Writing" },
    "spreadsheet-data": { zh: "表格数据", en: "Spreadsheet & Data" },
    "pdf": { zh: "PDF", en: "PDF" },
    "image-design": { zh: "图片设计", en: "Image & Design" },
    "media": { zh: "音视频", en: "Audio & Video" },
    "test-qa": { zh: "测试质量", en: "Testing & QA" },
    "devops": { zh: "部署运维", en: "DevOps" },
    "database": { zh: "数据库", en: "Database" },
    "security": { zh: "安全", en: "Security" },
    "automation": { zh: "自动化", en: "Automation" },
    "wordpress": { zh: "WordPress", en: "WordPress" },
    "i18n": { zh: "翻译多语", en: "i18n & Translate" },
    "scraping": { zh: "爬虫抓取", en: "Scraping" }
  };
  function tagLabel(slug, lang) {
    var m = TAG_LABELS[slug];
    if (!m) return slug;
    return lang === "en" ? m.en : m.zh;
  }

  var api = {
    translations: translations,
    supported: SUPPORTED,
    fallback: FALLBACK,
    t: t,
    getLang: getLang,
    setLang: setLang,
    toggleLang: toggleLang,
    onLangChange: onLangChange,
    syncDOM: syncDOM,
    tagLabel: tagLabel,
    TAG_LABELS: TAG_LABELS
  };

  // 兼容全局与模块化两种引入方式
  global.I18N = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : this);
