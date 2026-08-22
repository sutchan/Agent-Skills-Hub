// app/components/SkillsExplorer.tsx v1.20.7 — 技能浏览器（编排：分类多选 + 搜索 + 排序 + 视图切换 + 设置 + 名称显示 + 卡片网格 + 详情弹窗 + 分页）
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

export function SkillsExplorer({
  data,
  lang,
}: {
  data: SkillsData;
  lang: Lang;
}) {
  const [cats, setCats] = useState<string[]>([]); // 多选 OR，空 = 全部
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
  }, [data.skills, cats, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = useMemo(
    () => filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [filtered, safePage]
  );
  useEffect(() => { setPage(0); }, [q, cats, sort]);

  // 翻页：更新页码并滚动回网格顶部
  const goPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCat = (c: string) => {
    if (c === "all") { setCats([]); return; }
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  return (
    <section id="skillsExplorer" className="explorer">
      <div className="controls" id="controls">
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
