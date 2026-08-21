// app/components/SkillsExplorer.tsx v1.19.14 — 技能浏览器（分类多选 + 搜索 + 排序 + 视图切换 + UI元素显隐 + 名称显示 + 卡片网格 + 详情弹窗）
"use client";
import { useEffect, useMemo, useState } from "react";
import type { Lang } from "../lib/share";
import type { SkillsData, Skill } from "../lib/skills";
import { SkillCard } from "./skill-card";
import { DetailModal } from "./detail-modal";

export function SkillsExplorer({
  data,
  lang,
}: {
  data: SkillsData;
  lang: Lang;
}) {
  const [cats, setCats] = useState<string[]>([]); // 多选 OR，空 = 全部（v1.19.8 由单选 cat 升级）
  const [q, setQ] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<"name" | "name-desc" | "cat" | "zh">("name");
  // UI 元素显隐设置：默认全部开启，独立持久化到 localStorage，并同步到 <html data-show-*> 供 CSS 隐藏
  const [showDesc, setShowDesc] = useState(true);
  const [showCat, setShowCat] = useState(true);
  const [showBar, setShowBar] = useState(true);
  // 名称显示策略：默认双显（中文名 + 英文原名），可切仅中文 / 仅英文
  const [nameMode, setNameMode] = useState<"both" | "zh" | "en">("both");
  const [settingsOpen, setShowSettings] = useState(false);
  const [detail, setDetail] = useState<Skill | null>(null);

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
  }, []);

  // 偏好变化时同步到 <html data-show-*> / data-name-mode + 持久化
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-show-desc", showDesc ? "on" : "off");
    root.setAttribute("data-show-cat", showCat ? "on" : "off");
    root.setAttribute("data-show-bar", showBar ? "on" : "off");
    root.setAttribute("data-name-mode", nameMode);
    const writeStr = (k: string, v: string) => {
      try { localStorage.setItem(k, v); } catch { /* 隐私模式忽略 */ }
    };
    const writeBool = (k: string, v: boolean) => {
      try { localStorage.setItem(k, v ? "true" : "false"); } catch { /* 隐私模式忽略 */ }
    };
    writeBool("ash-show-desc", showDesc);
    writeBool("ash-show-cat", showCat);
    writeBool("ash-show-bar", showBar);
    writeStr("ash-name-mode", nameMode);
  }, [showDesc, showCat, showBar, nameMode]);

  const catsAll = useMemo(() => data.categories, [data.categories]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const list = data.skills.filter((s) => {
      if (s.hidden) return false;
      if (cats.length && !cats.includes(s.category)) return false;
      if (kw && !(`${s.name} ${s.zh || ""} ${s.description}`.toLowerCase().includes(kw))) return false;
      return true;
    });
    const cmp: Record<typeof sort, (a: any, b: any) => number> = {
      name: (a, b) => String(a.name).localeCompare(String(b.name)),
      "name-desc": (a, b) => String(b.name).localeCompare(String(a.name)),
      cat: (a, b) => String(a.category).localeCompare(String(b.category), "zh") || String(a.name).localeCompare(String(b.name)),
      zh: (a, b) => String(a.zh || a.name).localeCompare(String(b.zh || b.name), "zh"),
    };
    return [...list].sort(cmp[sort]);
  }, [data.skills, cats, q, sort]);

  // 分类 chip 点击：多选 toggle（"全部"清空）
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
            value={q}
            onChange={(e) => setQ(e.target.value)}
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
        <div id="settingsPanel" className="settings-panel" role="dialog" aria-label={lang === "zh" ? "设置" : "Settings"}>
          <div className="settings-section">
            <h3>{lang === "zh" ? "界面元素" : "UI elements"}</h3>
            <label className="settings-row">
              <span>{lang === "zh" ? "显示技能描述" : "Show skill description"}</span>
              <input type="checkbox" checked={showDesc} onChange={(e) => setShowDesc(e.target.checked)} />
            </label>
            <label className="settings-row">
              <span>{lang === "zh" ? "显示分类标签" : "Show category label"}</span>
              <input type="checkbox" checked={showCat} onChange={(e) => setShowCat(e.target.checked)} />
            </label>
            <label className="settings-row">
              <span>{lang === "zh" ? "显示分类色条" : "Show category color bar"}</span>
              <input type="checkbox" checked={showBar} onChange={(e) => setShowBar(e.target.checked)} />
            </label>
          </div>
          <div className="settings-section">
            <h3>{lang === "zh" ? "名称显示" : "Name display"}</h3>
            <div className="seg" role="group" aria-label={lang === "zh" ? "名称显示" : "Name display"}>
              <button
                type="button"
                className={`seg-btn${nameMode === "both" ? " active" : ""}`}
                aria-pressed={nameMode === "both"}
                onClick={() => setNameMode("both")}
              >
                {lang === "zh" ? "双显" : "Both"}
              </button>
              <button
                type="button"
                className={`seg-btn${nameMode === "zh" ? " active" : ""}`}
                aria-pressed={nameMode === "zh"}
                onClick={() => setNameMode("zh")}
              >
                {lang === "zh" ? "仅中文" : "Chinese"}
              </button>
              <button
                type="button"
                className={`seg-btn${nameMode === "en" ? " active" : ""}`}
                aria-pressed={nameMode === "en"}
                onClick={() => setNameMode("en")}
              >
                {lang === "zh" ? "仅英文" : "English"}
              </button>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowSettings(false)}>
            {lang === "zh" ? "完成" : "Done"}
          </button>
        </div>
      )}

      <div id="resultCount" className="result-count" aria-live="polite">
        {lang === "zh" ? `共 ${filtered.length} 个结果` : `${filtered.length} results`}
      </div>

      <div className={`grid ${view}`} id="grid">
        {filtered.map((s) => (
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

      {detail && (
        <DetailModal
          skill={detail}
          lang={lang}
          allSkills={data.skills}
          onClose={() => setDetail(null)}
        />
      )}
    </section>
  );
}
