// src/components/SkillsExplorer.tsx v1.14.89 — 应用主面板编排：组合搜索/分类/排序/网格/详情，挂载深链与偏好同步
"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Lang } from "../lib/share";
import type { SkillsData, Skill } from "../lib/skills";
import { SkillCard } from "./skill-card";
import { DetailModal } from "./detail-modal";
import { SettingsPanel } from "./settings-panel";
import { Pager } from "./pager";
import type { SortKey } from "./SkillsExplorer.hash";
import { PAGE_SIZE, computeCatCounts, filterAndSort } from "./SkillsExplorer.filters";
import { SearchControls } from "./SkillsExplorer.controls";
import { useHashSync, useExplorerEffects, usePrefsSync } from "./SkillsExplorer.hooks";

export function SkillsExplorer({
  data,
  lang,
}: {
  data: SkillsData;
  lang: Lang;
}) {
  const [cat, setCat] = useState(""); // 分类单选，空串 = 全部
  const [raw, setRaw] = useState(""); // 搜索框即时输入（受控）
  const [q, setQ] = useState(""); // 防抖后的查询（实际用于过滤，对齐原型 DEBOUNCE_MS=120）
  const composing = useRef(false); // 输入法组合中标志，避免拼音过程狂刷网格
  // v1.14.42：初值统一用默认值，偏好在下方 useEffect 中一次性恢复。
  // 此前在 useState 初始化函数里读 localStorage：① SSR 首屏可能执行 ② 与 useEffect 重复读取导致二次渲染。
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<SortKey>("name");
  // UI 元素显隐设置（独立持久化到 localStorage + <html data-show-*>）
  const [showDesc, setShowDesc] = useState(true);
  const [showCat, setShowCat] = useState(true);
  const [showBar, setShowBar] = useState(true);
  const [nameMode, setNameMode] = useState<"both" | "zh" | "en">("both");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [settingsOpen, setShowSettings] = useState(false);
  const [detail, setDetail] = useState<Skill | null>(null);
  const [page, setPage] = useState(0);
  const [showToTop, setShowToTop] = useState(false);

  // 稳定回调（v1.14.42）：内联箭头函数每次渲染都是新引用，会使 SkillCard 的 memo 失效，
  // 导致本页最多 36 张卡片在数据未变时全部重渲染。此处以 useCallback 固定引用（rerender-memo）。
  const openSkill = useCallback((sk: Skill) => setDetail(sk), []);
  const closeDetail = useCallback(() => setDetail(null), []);

  useHashSync(setCat, setRaw, setQ, setSort, setPage);
  useExplorerEffects(raw, setQ, cat, q, sort, page, setPage, data, setDetail, setShowToTop);
  usePrefsSync(
    setShowDesc, setShowCat, setShowBar, setNameMode, setDensity, setView,
    showDesc, showCat, showBar, nameMode, density, view,
  );

  const catsAll = data.categories;

  const catCounts = useMemo(() => computeCatCounts(data.skills), [data]);

  const filtered = useMemo(
    () => filterAndSort({ skills: data.skills, q, cat, sort }),
    [data.skills, cat, q, sort]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = useMemo(
    () => filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [filtered, safePage]
  );

  // 翻页：更新页码并滚动回网格顶部
  const goPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 单选：点「全部」或再次点击当前项即取消筛选（回到全部）
  const toggleCat = (c: string) => {
    if (c === "all") { setCat(""); return; }
    setCat((prev) => (prev === c ? "" : c));
  };

  return (
    <section id="skillsExplorer" className="explorer">
      <SearchControls
        lang={lang}
        raw={raw}
        setRaw={setRaw}
        composing={composing}
        view={view}
        setView={setView}
        sort={sort}
        setSort={setSort}
        catsAll={catsAll}
        cat={cat}
        catCounts={catCounts}
        toggleCat={toggleCat}
        onSettings={() => setShowSettings(true)}
      />

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
            onOpen={openSkill}
            lang={lang}
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
          onClose={closeDetail}
          onOpenSkill={openSkill}
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
