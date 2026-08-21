// app/components/SkillsExplorer.tsx v1.18.0 — 技能浏览器（网格/列表/搜索/分类/视图/回到顶部/结果计数）
// 自包含查询/视图/toast 状态，组合 ui 原语与 SkillCard；双语通过 lib/i18n 的 t() 取词，与原型一致。
// 对齐原型 04-interactions：搜索防抖(120ms) + composition 拦截、视图持久化 ash-view、结果计数 aria-live、回到顶部。
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  density: "comfortable" | "compact";
  view: "grid" | "list";
  onView: (v: "grid" | "list") => void;
}

const DEBOUNCE_MS = 120;
const TOP_THRESHOLD = 400;

export function SkillsExplorer({ skills, lang, density, view, onView }: Props) {
  const [query, setQuery] = useState("");
  const [deferredQuery, setDeferredQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState<Skill | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [showTop, setShowTop] = useState(false);
  // composition 进行中（中文/日文输入未落定）时不触发搜索，对齐原型 compositionstart/end 拦截
  const composing = useRef(false);

  const toast = (msg: string) => setToastMsg(msg);
  // 反馈 toast 2.4s 后自动消失，对齐 prototype 04-interactions sharedFeedback
  useEffect(() => {
    if (!toastMsg) return;
    const id = window.setTimeout(() => setToastMsg(""), 2400);
    return () => window.clearTimeout(id);
  }, [toastMsg]);

  // 同步当前视图到 <html data-view>（持久化由 AppShell 持有 ash-view 统一负责）
  useEffect(() => {
    document.documentElement.setAttribute("data-view", view);
  }, [view]);

  // 搜索防抖：输入 120ms 后才更新过滤条件（对齐原型 DEBOUNCE_MS）
  useEffect(() => {
    if (composing.current) return;
    const id = window.setTimeout(() => setDeferredQuery(query), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  // 回到顶部：滚动超阈值显示 #toTop（passive + rAF，对齐原型 04-interactions toTop 监听）
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        setShowTop(window.scrollY > TOP_THRESHOLD);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) window.cancelAnimationFrame(raf); };
  }, []);

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
    const q = deferredQuery.trim().toLowerCase();
    return skills.filter((s) => {
      const okCat = activeCat == null || s.category === activeCat;
      const hay = `${s.name} ${s.zh} ${s.description} ${s.enDescription || ""} ${s.category}`.toLowerCase();
      const okQ = !q || hay.includes(q);
      return okCat && okQ;
    });
  }, [skills, deferredQuery, activeCat]);

  const resultText = list.length
    ? t(lang, "result.count").replace("{n}", String(list.length))
    : t(lang, "result.empty");

  return (
    <section id="skills" className="skills" data-density={density} aria-label={t(lang, "stat.total")}>
      <div className="controls" id="searchControls">
        <Input
          id="search"
          type="search"
          placeholder={t(lang, "search.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={(e) => {
            composing.current = false;
            setQuery((e.target as HTMLInputElement).value);
          }}
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
                <span className="zh">{c}</span>
                <span className="en">{categoryEn[c] || c}</span>
                <span className="chip-count">{count}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="result-count" id="resultCount" aria-live="polite">{resultText}</div>

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
          <button type="button" className="btn btn-ghost" onClick={() => { setQuery(""); setDeferredQuery(""); setActiveCat(null); }}>
            {t(lang, "empty.clear")}
          </button>
        </div>
      ) : null}

      <SkillDialog skill={showDetail} lang={lang} toast={toast} onClose={() => setShowDetail(null)} />

      {showTop ? (
        <button
          id="toTop"
          type="button"
          className="to-top show"
          aria-label={t(lang, "a11y.backTop")}
          title={t(lang, "a11y.backTop")}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      ) : null}

      {toastMsg ? (
        <div className="toast" id="toast" role="status" aria-live="polite">{toastMsg}</div>
      ) : null}
    </section>
  );
}
