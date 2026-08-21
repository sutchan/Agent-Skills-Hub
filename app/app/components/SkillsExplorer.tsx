// app/components/SkillsExplorer.tsx v1.16.2 — 技能浏览器（网格/列表/搜索/分类/视图）
// 自包含查询/视图/toast 状态，组合 ui 原语与 SkillCard；双语通过 lib/i18n 的 t() 取词，与原型一致。
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Skill } from "@/lib/types";
import { catHue } from "@/lib/catHue";
import { t } from "@/lib/i18n";
import { Input } from "./ui/input";
import { ViewToggle } from "./ui/view-toggle";
import { SkillCard } from "./skill-card";
import { SkillDialog } from "./SkillDialog";

interface Props {
  skills: Skill[];
  lang: "zh" | "en";
}

export function SkillsExplorer({ skills, lang }: Props) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState<Skill | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const toast = (msg: string) => setToastMsg(msg);
  // 反馈 toast 2.4s 后自动消失，对齐 prototype 04-interactions sharedFeedback
  useEffect(() => {
    if (!toastMsg) return;
    const id = window.setTimeout(() => setToastMsg(""), 2400);
    return () => window.clearTimeout(id);
  }, [toastMsg]);

  const cats = useMemo(() => {
    const set = new Set(skills.map((s) => s.category));
    return Array.from(set);
  }, [skills]);

  // 分类中文名 -> 英文名映射（英文态 chip 显示；从各技能 enCategory 派生）
  const categoryEn = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of skills) if (!m[s.category] && s.enCategory) m[s.category] = s.enCategory;
    return m;
  }, [skills]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      const okCat = activeCat == null || s.category === activeCat;
      const hay = `${s.name} ${s.zh} ${s.description} ${s.enDescription || ""} ${s.category}`.toLowerCase();
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
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t(lang, "search.placeholder")}
        />
        <ViewToggle view={view} onChange={setView} />
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
                <span className="zh">{c}</span>
                <span className="en">{categoryEn[c] || c}</span>
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
          <button type="button" className="btn btn-ghost" onClick={() => { setQuery(""); setActiveCat(null); }}>
            {t(lang, "empty.clear")}
          </button>
        </div>
      ) : null}

      <SkillDialog skill={showDetail} lang={lang} toast={toast} onClose={() => setShowDetail(null)} />

      {toastMsg ? (
        <div className="toast" id="toast" role="status" aria-live="polite">{toastMsg}</div>
      ) : null}
    </section>
  );
}
