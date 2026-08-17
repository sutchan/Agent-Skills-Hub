// app/components/AppShell.tsx v1.14.29 — 应用外壳（语言/主题切换 + 品牌 + 技能浏览）
"use client";

import { useEffect, useState } from "react";
import type { Skill } from "../lib/skills";
import type { Lang } from "../lib/share";
import { SkillsExplorer } from "./SkillsExplorer";

interface Props {
  skills: Skill[];
  categories: string[];
  total: number;
}

/** 应用外壳：管理当前界面语言（中/英）与主题（浅/深），承载技能浏览与分享。 */
export function AppShell({ skills, categories, total }: Props) {
  const [lang, setLang] = useState<Lang>("zh");
  const [dark, setDark] = useState(false);

  // 同步主题到 <html data-theme>，驱动 CSS 变量切换
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="app-shell" data-lang={lang} data-theme={dark ? "dark" : "light"}>
      <header className="topbar">
        <div className="brand">
          <span className="logo">🛠️</span>
          <span className="brand-name">Agent Skills Hub</span>
        </div>
        <div className="topbar-actions">
          <button
            id="langBtn"
            className="icon-btn"
            aria-label="切换语言 / Toggle language"
            aria-pressed={lang === "en"}
            onClick={() => setLang((l) => (l === "zh" ? "en" : "zh"))}
          >
            {lang === "zh" ? "EN" : "中"}
          </button>
          <button
            id="themeBtn"
            className="icon-btn"
            aria-label="切换主题 / Toggle theme"
            aria-pressed={dark}
            onClick={() => setDark((d) => !d)}
          >
            {dark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            )}
          </button>
        </div>
      </header>
      <SkillsExplorer skills={skills} categories={categories} lang={lang} total={total} />
    </div>
  );
}
