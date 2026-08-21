// app/components/SkillsExplorer.tsx v1.19.5 — 技能浏览器（分类筛选 + 搜索 + 视图切换 + UI元素显隐 + 卡片网格）
"use client";
import { useEffect, useMemo, useState } from "react";
import type { Lang } from "../lib/share";
import type { SkillsData } from "../lib/skills";
import { SkillCard } from "./skill-card";

export function SkillsExplorer({
  data,
  lang,
}: {
  data: SkillsData;
  lang: Lang;
}) {
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  // UI 元素显隐设置：默认全部开启，独立持久化到 localStorage，并同步到 <html data-show-*> 供 CSS 隐藏
  const [showDesc, setShowDesc] = useState(true);
  const [showCat, setShowCat] = useState(true);
  const [showBar, setShowBar] = useState(true);
  const [settingsOpen, setShowSettings] = useState(false);

  // 恢复偏好（localStorage 不可用时回退默认）
  useEffect(() => {
    const read = (k: string) => {
      try { return localStorage.getItem(k); } catch { return null; }
    };
    const on = (v: string | null) => v !== "false";
    setShowDesc(on(read("ash-show-desc")));
    setShowCat(on(read("ash-show-cat")));
    setShowBar(on(read("ash-show-bar")));
  }, []);

  // 偏好变化时同步到 <html data-show-*> + 持久化
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-show-desc", showDesc ? "on" : "off");
    root.setAttribute("data-show-cat", showCat ? "on" : "off");
    root.setAttribute("data-show-bar", showBar ? "on" : "off");
    const write = (k: string, v: boolean) => {
      try { localStorage.setItem(k, v ? "true" : "false"); } catch { /* 隐私模式忽略 */ }
    };
    write("ash-show-desc", showDesc);
    write("ash-show-cat", showCat);
    write("ash-show-bar", showBar);
  }, [showDesc, showCat, showBar]);

  const cats = useMemo(() => ["all", ...data.categories], [data.categories]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return data.skills.filter((s) => {
      if (s.hidden) return false;
      if (cat !== "all" && s.category !== cat) return false;
      if (kw && !(`${s.name} ${s.zh || ""} ${s.description}`.toLowerCase().includes(kw))) return false;
      return true;
    });
  }, [data.skills, cat, q]);

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
        <div className="chips" id="categoryChips" role="tablist" aria-label={lang === "zh" ? "分类" : "Categories"}>
          {cats.map((c) => (
            <button
              key={c}
              className={`chip${c === cat ? " active" : ""}`}
              role="tab"
              aria-selected={c === cat}
              onClick={() => setCat(c)}
            >
              {c === "all" ? (lang === "zh" ? "全部" : "All") : c}
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
            onOpen={() => {}}
            showDesc={showDesc}
            showCat={showCat}
            showBar={showBar}
          />
        ))}
      </div>
    </section>
  );
}
