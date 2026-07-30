// 路径: site/app.js 版本: 1.0.0
// 展示页交互：加载 data.json，渲染分类筛选、搜索与技能卡片详情弹窗。

(function () {
  "use strict";

  var state = {
    data: null,
    activeCat: "全部",
    query: "",
  };

  var els = {
    title: document.getElementById("site-title"),
    subtitle: document.getElementById("site-subtitle"),
    stats: document.getElementById("stats"),
    repoLink: document.getElementById("repo-link"),
    filters: document.getElementById("filters"),
    grid: document.getElementById("grid"),
    search: document.getElementById("search"),
    resultCount: document.getElementById("result-count"),
    empty: document.getElementById("empty"),
    footerMeta: document.getElementById("footer-meta"),
    modal: document.getElementById("modal"),
    modalCat: document.getElementById("modal-cat"),
    modalTitle: document.getElementById("modal-title"),
    modalZh: document.getElementById("modal-zh"),
    modalEn: document.getElementById("modal-en"),
    modalTags: document.getElementById("modal-tags"),
    modalLink: document.getElementById("modal-link"),
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderMeta() {
    var m = state.data.meta;
    if (m.title) els.title.textContent = m.title;
    if (m.subtitle) els.subtitle.textContent = m.subtitle;
    if (m.repo) els.repoLink.href = m.repo;
    var stats = [
      { num: m.count, label: "个技能" },
      { num: state.data.categories.length, label: "个分类" },
    ];
    els.stats.innerHTML = stats.map(function (s) {
      return '<div class="stat"><div class="stat-num">' + esc(s.num) +
        '</div><div class="stat-label">' + esc(s.label) + "</div></div>";
    }).join("");
    els.footerMeta.innerHTML = "共 " + esc(m.count) + " 个技能 · 由 " +
      esc(m.author || "社区") + " 维护 · 生成于 " + esc((m.generated_at || "").slice(0, 10));
  }

  function renderFilters() {
    var cats = [{ name: "全部", count: state.data.skills.length }].concat(state.data.categories);
    els.filters.innerHTML = cats.map(function (c) {
      var active = c.name === state.activeCat ? " active" : "";
      return '<button class="chip' + active + '" data-cat="' + esc(c.name) + '">' +
        esc(c.name) + '<span class="count">' + esc(c.count) + "</span></button>";
    }).join("");
    Array.prototype.forEach.call(els.filters.querySelectorAll(".chip"), function (btn) {
      btn.addEventListener("click", function () {
        state.activeCat = btn.getAttribute("data-cat");
        renderFilters();
        renderGrid();
      });
    });
  }

  function filtered() {
    var q = state.query.trim().toLowerCase();
    return state.data.skills.filter(function (s) {
      if (state.activeCat !== "全部" && s.category !== state.activeCat) return false;
      if (!q) return true;
      var hay = [s.name, s.zh_desc, s.en_desc, s.category].join(" ").toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function tagHtml(s) {
    function t(label, ok) {
      return '<span class="tag' + (ok ? " has" : "") + '">' + esc(label) + "</span>";
    }
    return t("scripts", s.has_scripts) + t("references", s.has_references) + t("assets", s.has_assets);
  }

  function renderGrid() {
    var list = filtered();
    els.resultCount.textContent = "显示 " + list.length + " / " + state.data.skills.length + " 个技能";
    els.empty.hidden = list.length !== 0;
    els.grid.innerHTML = list.map(function (s) {
      return '<article class="card" data-dir="' + esc(s.dir) + '">' +
        '<div class="card-cat">' + esc(s.category) + "</div>" +
        '<h3 class="card-name">' + esc(s.name) + "</h3>" +
        '<p class="card-zh">' + esc(s.zh_desc || "") + "</p>" +
        '<p class="card-en">' + esc(s.en_desc || "") + "</p>" +
        '<div class="card-foot">' + tagHtml(s) + "</div>" +
        "</article>";
    }).join("");
    Array.prototype.forEach.call(els.grid.querySelectorAll(".card"), function (card) {
      card.addEventListener("click", function () {
        var s = findSkill(card.getAttribute("data-dir"));
        if (s) openModal(s);
      });
    });
  }

  function findSkill(dir) {
    return state.data.skills.filter(function (s) { return s.dir === dir; })[0];
  }

  function openModal(s) {
    var base = (state.data.meta.repo || "").replace(/\/$/, "");
    els.modalCat.textContent = s.category;
    els.modalTitle.textContent = s.name;
    els.modalZh.textContent = s.zh_desc || "";
    els.modalEn.textContent = s.en_desc || "";
    els.modalTags.innerHTML = tagHtml(s);
    els.modalLink.href = base + "/tree/main/skills/" + encodeURIComponent(s.dir) + "/SKILL.md";
    els.modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    els.modal.hidden = true;
    document.body.style.overflow = "";
  }

  function bindModal() {
    Array.prototype.forEach.call(els.modal.querySelectorAll("[data-close]"), function (el) {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !els.modal.hidden) closeModal();
    });
  }

  function bindSearch() {
    els.search.addEventListener("input", function () {
      state.query = els.search.value;
      renderGrid();
    });
  }

  function init() {
    bindModal();
    bindSearch();
    fetch("data.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (d) {
        state.data = d;
        renderMeta();
        renderFilters();
        renderGrid();
      })
      .catch(function (err) {
        els.grid.innerHTML = '<p class="empty">数据加载失败：' + esc(err.message) +
          "。请通过本地服务器访问本页面（如 <code>python -m http.server</code>）。</p>";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
