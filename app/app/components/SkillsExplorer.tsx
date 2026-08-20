// app/components/SkillsExplorer.tsx v1.14.72 — 技能浏览器（网格/列表/搜索/分类/视图）
// 组合 ui 原语与 SkillCard；双语通过 lib/i18n 的 t() 取词，与原型保持一致。
"use client";

import { useMemo, useState } from "react";
import type { Skill } from "@/lib/types";
import { catHue } from "@/lib/catHue";
import { t } from "@/lib/i18n";
import { Input } from "./ui/input";
import { ViewToggle } from "./ui/view-toggle";
import { SkillCard } from "./skill-card";
import { SkillDialog } from "./SkillDialog";

interface Props {
  skills: Skill[];
  query: string;
  onQuery: (q: string) => void;
  view: "grid" | "list";
  onView: (v: "grid" | "list") => void;
  lang: "zh" | "en";
  toast: (msg: string) => void;
}

export function SkillsExplorer({ skills, query, onQuery, view, onView, lang, toast }: Props) {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState<Skill | null>(null);

  const cats = useMemo(() => {
    const set = new Set(skills.map((s) => s.category));
    return Array.from(set);
  }, [skills]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      const okCat = activeCat == null || s.category === activeCat;
      const hay = `${s.name} ${s.zh} ${s.description} ${s.category}`.toLowerCase();
      const okQ = !q || hay.includes(q);
      return okCat && okQ;
    });
  }, [skills, query, activeCat]);

  return (
    <section id="skills" className="skills" aria-label={t(lang, "stat.total")}>
      <div className="controls" id="searchControls">
        <Input
          id="search"
          type="search"
          placeholder={t(lang, "search.placeholder")}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          aria-label={t(lang, "search.placeholder")}
        />
        <ViewToggle view={view} onChange={onView} />
      </div>

      <nav className="cats" id="categoryNav" aria-label={`${t(lang, "filter.all")} / Categories`}>
        <div className="cats-scroll" id="cats" role="tablist">
          <button
            type="button"
            className={`chip ${activeCat == null ? "active" : ""}`}
            style={{ "--hue": "152" } as React.CSSProperties}
            aria-pressed={activeCat == null}
            onClick={() => setActiveCat(null)}
          >
            {t(lang, "filter.all")}
            <span className="chip-count">{skills.length}</span>
          </button>
          {cats.map((c) => {
            const count = skills.filter((s) => s.category === c).length;
            return (
              <button
                key={c}
                type="button"
                className={`chip ${activeCat === c ? "active" : ""}`}
                style={{ "--hue": String(catHue(c)) } as React.CSSProperties}
                aria-pressed={activeCat === c}
                onClick={() => setActiveCat(c)}
              >
                {c}
                <span className="chip-count">{count}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className={`grid ${view}`} id="skillGrid">
        {list.map((s) => (
          <SkillCard key={s.name} skill={s} view={view} onOpen={setShowDetail} />
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-state" id="emptyState">
          <div className="empty-icon" aria-hidden="true">🔍</div>
          <h3>{t(lang, "empty.title")}</h3>
          <p>{t(lang, "empty.desc")}</p>
          <button type="button" className="btn btn-ghost" onClick={() => { onQuery(""); setActiveCat(null); }}>
            {t(lang, "empty.clear")}
          </button>
        </div>
      ) : null}

      <SkillDialog skill={showDetail} lang={lang} toast={toast} onClose={() => setShowDetail(null)} />
    </section>
  );
}
