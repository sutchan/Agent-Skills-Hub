// src/components/SkillsExplorer.controls.tsx v1.14.89 — 搜索 / 视图 / 排序 / 分类筛选 控件
"use client";
import type { MutableRefObject } from "react";
import type { Lang } from "../lib/share";
import { catHue } from "../lib/catHue";
import type { SortKey } from "./SkillsExplorer.hash";

export function SearchControls(props: {
  lang: Lang;
  raw: string;
  setRaw: (v: string) => void;
  composing: MutableRefObject<boolean>;
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  catsAll: string[];
  cat: string;
  catCounts: Record<string, number>;
  toggleCat: (c: string) => void;
  onSettings: () => void;
}) {
  const {
    lang, raw, setRaw, composing, view, setView, sort, setSort,
    catsAll, cat, catCounts, toggleCat, onSettings,
  } = props;
  return (
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
        <div className="toolbar-right" id="toolbarRight">
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
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label={lang === "zh" ? "排序" : "Sort"}
            >
              <option value="name">{lang === "zh" ? "名称 A-Z" : "Name A-Z"}</option>
              <option value="name-desc">{lang === "zh" ? "名称 Z-A" : "Name Z-A"}</option>
              <option value="cat">{lang === "zh" ? "按分类" : "By category"}</option>
              <option value="zh">{lang === "zh" ? "按中文名" : "By Chinese name"}</option>
            </select>
          </label>
        </div>
        <div className="chips" id="categoryChips" role="group" aria-label={lang === "zh" ? "分类（单选）" : "Categories (single select)"}>
          <button
            key="all"
            className={`chip chip-all${cat === "" ? " active" : ""}`}
            style={{ ["--hue" as string]: 152 }}
            aria-pressed={cat === ""}
            onClick={() => toggleCat("all")}
          >
            {lang === "zh" ? "全部" : "All"}
          </button>
          {catsAll.map((c) => (
            <button
              key={c}
              className={`chip${cat === c ? " active" : ""}`}
              style={{ ["--hue" as string]: catHue(c) }}
              aria-pressed={cat === c}
              onClick={() => toggleCat(c)}
            >
              <span>{c}</span>
              <span className="chip-count">{catCounts[c] ?? 0}</span>
            </button>
          ))}
        </div>
        <button
          id="settingsBtn"
          className="icon-btn"
          aria-label={lang === "zh" ? "设置" : "Settings"}
          onClick={onSettings}
        >
          ⚙
        </button>
      </div>
    </div>
  );
}
