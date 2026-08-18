// app/components/SkillsExplorer.tsx v1.14.44 — 技能浏览（搜索/分类 + 卡片网格 + 详情弹窗）
"use client";

import { useMemo, useState } from "react";
import type { Skill } from "../lib/skills";
import type { Lang } from "../lib/share";
import { SkillDialog } from "./SkillDialog";
import { track } from "../lib/analytics";

// 由类别名稳定派生色相（0-359），与 prototype 的 catHue 算法一致，保证两层同分类同色
function catHue(c: string): number {
  let h = 0;
  for (let i = 0; i < c.length; i++) h = (h * 31 + c.charCodeAt(i)) % 360;
  return h;
}

interface Props {
  skills: Skill[];
  categories: string[];
  lang: Lang;
  total: number;
}

const UI: Record<Lang, { search: string; all: string; total: string; shown: string; empty: string }> = {
  zh: { search: "按名称或描述搜索技能…", all: "全部", total: "技能总数", shown: "当前展示", empty: "未找到匹配的技能" },
  en: { search: "Search skills by name or description…", all: "All", total: "Total skills", shown: "Shown", empty: "No matching skills" },
};

/** 技能浏览主组件：筛选 + 卡片网格 + 详情弹窗（openspec §4.5 展示页交互） */
export function SkillsExplorer({ skills, categories, lang, total }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("全部");
  const [open, setOpen] = useState<Skill | null>(null);

  const cats = useMemo(() => ["全部", ...categories], [categories]);
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return skills.filter((s) => {
      const matchCat = cat === "全部" || s.category === cat;
      const matchQ =
        !k ||
        s.name.toLowerCase().includes(k) ||
        (s.zh || "").toLowerCase().includes(k) ||
        (s.description || "").toLowerCase().includes(k) ||
        (s.category || "").toLowerCase().includes(k);
      return matchCat && matchQ;
    });
  }, [skills, q, cat]);

  const t = UI[lang];

  return (
    <main id="main-content" className="explorer">
      <div className="toolbar">
        <input
          id="search"
          className="search-input"
          type="search"
          placeholder={t.search}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (e.target.value) track("search", { query: e.target.value });
          }}
          aria-label={t.search}
        />
      </div>

      <nav className="cats" aria-label="分类筛选">
        <div className="cats-scroll" id="cats">
          {cats.map((c) => (
            <button
              key={c}
              className={"chip" + (c === cat ? " active" : "")}
              style={{ "--hue": c === "全部" ? 220 : catHue(c) } as React.CSSProperties}
              aria-pressed={c === cat}
              onClick={() => {
                setCat(c);
                track("filter_category", { category: c });
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </nav>

      <div className="stat" aria-live="polite">
        {t.shown}: {filtered.length} / {t.total}: {skills.length}
      </div>

      {filtered.length ? (
        <div className="grid" id="skillsGrid">
          {filtered.map((s) => (
            <button key={s.name} className="card" role="button" onClick={() => { track("view_skill", { skill: s.name, category: s.category }); setOpen(s); }}>
              <div className="title-row">
                <div className="avatar sm">{(s.name || "?").slice(0, 2).toUpperCase()}</div>
                <div className="card-title">{s.zh || s.name}</div>
              </div>
              <div className="card-sub en">{s.name}</div>
              <div className="card-cat">{s.category}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty" id="emptyState">{t.empty}</div>
      )}

      {open && <SkillDialog skill={open} lang={lang} total={total} onClose={() => setOpen(null)} />}
    </main>
  );
}
