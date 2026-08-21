// app/components/AppShell.tsx v1.19.7 — 应用外壳（顶栏品牌区 + 语言切换 + 技能浏览器 + 页脚统计）
"use client";
import { useEffect, useMemo, useState } from "react";
import type { Lang } from "../lib/share";
import type { SkillsData } from "../lib/skills";
import { SkillsExplorer } from "./SkillsExplorer";

function BrandMark() {
  return (
    <svg className="logo" viewBox="0 0 32 32" role="img" aria-label="Agent Skills Hub">
      <rect width="32" height="32" rx="8" fill="hsl(152 56% 40%)" />
      <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">H</text>
    </svg>
  );
}

export function AppShell({ data, version }: { data: SkillsData; version?: string }) {
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem("ash-lang")) as Lang | null;
    if (saved === "zh" || saved === "en") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.lang = lang;
    if (typeof localStorage !== "undefined") localStorage.setItem("ash-lang", lang);
  }, [lang]);

  // 页脚统计（v1.19.7 由 hero 迁入并扩充）：可见技能总数、分类数、英文描述覆盖数、支持语言数
  const stats = useMemo(() => {
    const visible = (data.skills || []).filter((s) => !s.hidden);
    return {
      total: visible.length,
      cats: (data.categories || []).length,
      enCov: visible.filter((s) => s.enDescription && String(s.enDescription).trim()).length,
      langs: 2,
    };
  }, [data]);

  return (
    <>
      <header className="topbar" id="appHeader">
        <div className="brand" id="brandBlock">
          <BrandMark />
          <span className="brand-text">
            <span className="brand-name">Agent Skills Hub</span>
            <small className="brand-sub">{lang === "zh" ? "高质量 Agent 技能库" : "Curated agent skill library"}</small>
          </span>
        </div>
        <button
          id="langBtn"
          className="icon-btn"
          aria-label={lang === "zh" ? "切换语言" : "Switch language"}
          onClick={() => setLang((l) => (l === "zh" ? "en" : "zh"))}
        >
          {lang === "zh" ? "EN" : "中"}
        </button>
      </header>

      <main id="mainContent">
        <SkillsExplorer data={data} lang={lang} />
      </main>

      <footer className="footer" id="appFooter">
        <div className="footer-inner">
          <span>Agent Skills Hub</span>
          <span>{lang === "zh" ? "开源免费 · MIT 协议" : "Open source · MIT License"}</span>
          {version ? <span className="footer-version">v{version}</span> : null}
          <div className="footer-stats" id="footerStats" aria-live="polite">
            <div className="stat">
              <div className="num">{stats.total}</div>
              <div className="lbl">{lang === "zh" ? "技能总数" : "Total skills"}</div>
            </div>
            <div className="stat">
              <div className="num">{stats.cats}</div>
              <div className="lbl">{lang === "zh" ? "分类" : "Categories"}</div>
            </div>
            <div className="stat">
              <div className="num">{stats.enCov}</div>
              <div className="lbl">{lang === "zh" ? "英文描述" : "EN described"}</div>
            </div>
            <div className="stat">
              <div className="num">{stats.langs}</div>
              <div className="lbl">{lang === "zh" ? "支持语言" : "Languages"}</div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
