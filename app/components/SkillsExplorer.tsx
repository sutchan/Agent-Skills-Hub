// app/components/SkillsExplorer.tsx v1.20.51 — 应用主面板：搜索 / 分类 / 排序 / 视图 / 分页 / 网格渲染 / 标签筛选 / 骰子拉起详情
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "../lib/share";
import type { SkillsData, Skill } from "../lib/skills";
import { SkillCard } from "./skill-card";
import { DetailModal } from "./detail-modal";
import { SettingsPanel } from "./settings-panel";
import { Pager } from "./pager";

// 每页 48 条（用户需求）
const PAGE_SIZE = 48;

// 功能标签中英显示名（slug 与 tools/build-skills-data.mjs TAG_DEFS 对齐，v1.20.12）
// slider 派生自技能 description/enDescription/category，作为分类之下的细化主题筛选维度
const TAG_LABELS: Record<string, { zh: string; en: string }> = {
  "ai-agent": { zh: "AI 与智能体", en: "AI & Agents" },
  "cli": { zh: "命令行", en: "CLI" },
  "web-frontend": { zh: "Web 前端", en: "Web & Frontend" },
  "doc-writing": { zh: "文档写作", en: "Docs & Writing" },
  "data": { zh: "数据", en: "Data" },
  "pdf": { zh: "PDF", en: "PDF" },
  "design-media": { zh: "设计 & 媒体", en: "Design & Media" },
  "test-qa": { zh: "测试质量", en: "Testing & QA" },
  "devops": { zh: "部署运维", en: "DevOps" },
  "security": { zh: "安全", en: "Security" },
  "automation": { zh: "自动化", en: "Automation" },
  "wordpress": { zh: "WordPress", en: "WordPress" },
  "i18n": { zh: "翻译多语", en: "i18n & Translate" },
  "scraping": { zh: "爬虫抓取", en: "Scraping" },
};

export function SkillsExplorer({
  data,
  lang,
}: {
  data: SkillsData;
  lang: Lang;
}) {
  const [cats, setCats] = useState<string[]>([]); // 多选 OR，空 = 全部
  const [tags, setTags] = useState<string[]>([]); // 功能标签多选 OR，空 = 全部（与 cats AND 组合）
  const [raw, setRaw] = useState(""); // 搜索框即时输入（受控）
  const [q, setQ] = useState(""); // 防抖后的查询（实际用于过滤，对齐原型 DEBOUNCE_MS=120）
  const composing = useRef(false); // 输入法组合中标志，避免拼音过程狂刷网格
  const [view, setView] = useState<"grid" | "list">(() => {
    try {
      const v = localStorage.getItem("ash-view");
      return v === "list" ? "list" : "grid";
    } catch {
      return "grid";
    }
  });
  const [sort, setSort] = useState<"name" | "name-desc" | "cat" | "zh">("name");
  // UI 元素显隐设置（独立持久化到 localStorage + <html data-show-*>）
  const [showDesc, setShowDesc] = useState(true);
  const [showCat, setShowCat] = useState(true);
  const [showBar, setShowBar] = useState(true);
  const [nameMode, setNameMode] = useState<"both" | "zh" | "en">("both");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [settingsOpen, setShowSettings] = useState(false);
  const [detail, setDetail] = useState<Skill | null>(null);
  const [page, setPage] = useState(0);

  // 接收 Hero 骰子派发的随机技能打开详情（对齐 prototype 03-detail.js shareSkill/openDetail）
  useEffect(() => {
    const onPick = (e: Event) => {
      const name = (e as CustomEvent<{ name?: string }>).detail?.name;
      if (!name) return;
      const sk = data.skills.find((s) => s.name === name && !s.hidden);
      if (sk) setDetail(sk);
    };
    window.addEventListener("ash:open-skill", onPick as EventListener);
    return () => window.removeEventListener("ash:open-skill", onPick as EventListener);
  }, [data.skills]);

  // 恢复偏好（localStorage 不可用时回退默认）
  useEffect(() => {
    const read = (k: string) => {
      try { return localStorage.getItem(k); } catch { return null; }
    };
    const on = (v: string | null) => v !== "false";
    setShowDesc(on(read("ash-show-desc")));
    setShowCat(on(read("ash-show-cat")));
    setShowBar(on(read("ash-show-bar")));
    const nm = read("ash-name-mode");
    if (nm === "zh" || nm === "en") setNameMode(nm);
    const d = read("ash-density");
    if (d === "comfortable" || d === "compact") setDensity(d);
    const v = read("ash-view");
    if (v === "grid" || v === "list") setView(v);
  }, []);

  // 搜索防抖（对齐原型 DEBOUNCE_MS=120）：raw 停止输入 120ms 后写入 q 触发过滤
  useEffect(() => {
    const t = setTimeout(() => setQ(raw), 120);
    return () => clearTimeout(t);
  }, [raw]);

  // 回到顶部（对齐原型 toTop：滚动超 300px 显隐）
  const [showToTop, setShowToTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowToTop(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 偏好变化时同步到 <html data-show-*> / data-name-mode + 持久化
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-show-desc", showDesc ? "on" : "off");
    root.setAttribute("data-show-cat", showCat ? "on" : "off");
    root.setAttribute("data-show-bar", showBar ? "on" : "off");
    root.setAttribute("data-name-mode", nameMode);
    root.setAttribute("data-density", density);
    const writeBool = (k: string, v: boolean) => {
      try { localStorage.setItem(k, v ? "true" : "false"); } catch { /* 隐私模式忽略 */ }
    };
    const writeStr = (k: string, v: string) => {
      try { localStorage.setItem(k, v); } catch { /* 隐私模式忽略 */ }
    };
    writeBool("ash-show-desc", showDesc);
    writeBool("ash-show-cat", showCat);
    writeBool("ash-show-bar", showBar);
    writeStr("ash-name-mode", nameMode);
    writeStr("ash-density", density);
    writeStr("ash-view", view);
  }, [showDesc, showCat, showBar, nameMode, density, view]);

  const catsAll = useMemo(() => data.categories, [data.categories]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const list = data.skills.filter((s) => {
      if (s.hidden) return false;
      if (cats.length && !cats.includes(s.category)) return false;
      if (tags.length) {
        const st = (s.tags as string[] | undefined) ?? [];
        if (!tags.every((t) => st.includes(t))) return false;
      }
      if (kw && !(`${s.name} ${s.zh || ""} ${s.description} ${s.enDescription || ""} ${s.category} ${s.enCategory || ""}`.toLowerCase().includes(kw))) return false;
      return true;
    });
    const cmp: Record<typeof sort, (a: Skill, b: Skill) => number> = {
      name: (a, b) => String(a.name).localeCompare(String(b.name)),
      "name-desc": (a, b) => String(b.name).localeCompare(String(a.name)),
      cat: (a, b) => String(a.category).localeCompare(String(b.category), "zh") || String(a.name).localeCompare(String(b.name)),
      zh: (a, b) => String(a.zh || a.name).localeCompare(String(b.zh || b.name), "zh"),
    };
    return [...list].sort(cmp[sort]);
  }, [data.skills, cats, tags, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = useMemo(
    () => filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [filtered, safePage]
  );
  useEffect(() => { setPage(0); }, [q, cats, tags, sort]);

  // 翻页：更新页码并滚动回网格顶部
  const goPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCat = (c: string) => {
    if (c === "all") { setCats([]); return; }
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };
  const toggleTag = (t: string) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };
  // 标签计数：仅统计当前可见（已通过分类/关键词过滤前的全量）技能中出现过的标签，按命中数降序
  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    data.skills.forEach((s) => {
      if (s.hidden) return;
      const st = (s.tags as string[] | undefined) ?? [];
      st.forEach((t) => m.set(t, (m.get(t) || 0) + 1));
    });
    return Array.from(m.entries()).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  }, [data.skills]);

  return (
    <section id="skillsExplorer" className="explorer">
      <div className="controls" id="controls">
       <div className="controls-inner">
        <div className="search" id="searchWrap">
          <input
            id="search"
            type="search"
            placeholder={lang === "zh" ? "搜索技能名称或描述…" : "Search skills by name or description…"}
            value={raw}
            onChange={(e) => { if (composing.current) return; setRaw(e.target.value); }}
            onCompositionStart={() => { composing.current = true; }}
            onCompositionEnd={(e) => { composing.current = false; setRaw(e.currentTarget.value); }}
            aria-label={lang === "zh" ? "搜索技能" : "Search skills"}
          />
        </div>
        <div className="chips" id="categoryChips" role="group" aria-label={lang === "zh" ? "分类（可多选）" : "Categories (multi-select)"}>
          <button
            key="all"
            className={`chip${cats.length === 0 ? " active" : ""}`}
            aria-pressed={cats.length === 0}
            onClick={() => toggleCat("all")}
          >
            {lang === "zh" ? "全部" : "All"}
          </button>
          {catsAll.map((c) => (
            <button
              key={c}
              className={`chip${cats.includes(c) ? " active" : ""}`}
              aria-pressed={cats.includes(c)}
              onClick={() => toggleCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="chips tags" id="tagChips" role="group" aria-label={lang === "zh" ? "功能标签（可多选）" : "Tags (multi-select)"}>
          {tagCounts.map(([slug, n]) => (
            <button
              key={slug}
              className={`chip${tags.includes(slug) ? " active" : ""}`}
              aria-pressed={tags.includes(slug)}
              onClick={() => toggleTag(slug)}
            >
              {TAG_LABELS[slug] ? (lang === "zh" ? TAG_LABELS[slug].zh : TAG_LABELS[slug].en) : slug}{" "}
              <span className="chip-count">{n}</span>
            </button>
          ))}
        </div>
        <div className="view-toggle" id="viewToggle" role="group" aria-label={lang === "zh" ? "视图模式" : "View mode"}>
          <button
            className={`view-btn${view === "grid" ? " active" : ""}`}
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
            aria-label={lang === "zh" ? "网格视图" : "Grid view"}
          >
            ▦
          </button>
          <button
            className={`view-btn${view === "list" ? " active" : ""}`}
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            aria-label={lang === "zh" ? "列表视图" : "List view"}
          >
            ☰
          </button>
        </div>
        <label className="sort-wrap" id="sortWrap">
          <span className="sr-only">{lang === "zh" ? "排序" : "Sort"}</span>
          <select
            id="sortSelect"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            aria-label={lang === "zh" ? "排序" : "Sort"}
          >
            <option value="name">{lang === "zh" ? "名称 A-Z" : "Name A-Z"}</option>
            <option value="name-desc">{lang === "zh" ? "名称 Z-A" : "Name Z-A"}</option>
            <option value="cat">{lang === "zh" ? "按分类" : "By category"}</option>
            <option value="zh">{lang === "zh" ? "按中文名" : "By Chinese name"}</option>
          </select>
        </label>
        <button
          id="settingsBtn"
          className="icon-btn"
          aria-label={lang === "zh" ? "设置" : "Settings"}
          onClick={() => setShowSettings(true)}
        >
          ⚙
        </button>
       </div>
      </div>

      {settingsOpen && (
        <SettingsPanel
          lang={lang}
          showDesc={showDesc}
          showCat={showCat}
          showBar={showBar}
          nameMode={nameMode}
          density={density}
          onShowDesc={setShowDesc}
          onShowCat={setShowCat}
          onShowBar={setShowBar}
          onNameMode={setNameMode}
          onDensity={setDensity}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div id="resultCount" className="result-count" aria-live="polite">
        {lang === "zh" ? `共 ${filtered.length} 个结果` : `${filtered.length} results`}
      </div>

      <div className={`grid ${view}`} id="grid">
        {pageItems.map((s) => (
          <SkillCard
            key={s.name}
            skill={s}
            onOpen={(sk) => setDetail(sk)}
            showDesc={showDesc}
            showCat={showCat}
            showBar={showBar}
            nameMode={nameMode}
          />
        ))}
      </div>

      <Pager lang={lang} totalPages={totalPages} safePage={safePage} goPage={goPage} />

      {detail && (
        <DetailModal
          skill={detail}
          lang={lang}
          allSkills={data.skills}
          onClose={() => setDetail(null)}
          onOpenSkill={(sk) => setDetail(sk)}
        />
      )}

      <button
        id="toTop"
        className={`to-top${showToTop ? " show" : ""}`}
        aria-label={lang === "zh" ? "回到顶部" : "Back to top"}
        aria-hidden={!showToTop}
        tabIndex={showToTop ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </section>
  );
}
