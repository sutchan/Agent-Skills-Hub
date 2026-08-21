// app/components/SkillsExplorer.tsx v1.19.4 — 技能浏览器（分类筛选 + 搜索 + 视图切换 + 卡片网格）
"use client";
import { useMemo, useState } from "react";
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
      </div>

      <div id="resultCount" className="result-count" aria-live="polite">
        {lang === "zh" ? `共 ${filtered.length} 个结果` : `${filtered.length} results`}
      </div>

      <div className={`grid ${view}`} id="grid">
        {filtered.map((s) => (
          <SkillCard key={s.name} skill={s} onOpen={() => {}} />
        ))}
      </div>
    </section>
  );
}
