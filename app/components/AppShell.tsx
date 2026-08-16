// app/components/AppShell.tsx v1.1.1 — 应用外壳（语言切换 + 品牌 + 技能浏览）
"use client";

import { useState } from "react";
import type { Skill } from "../lib/skills";
import type { Lang } from "../lib/share";
import { SkillsExplorer } from "./SkillsExplorer";

interface Props {
  skills: Skill[];
  categories: string[];
  total: number;
}

/** 应用外壳：管理当前界面语言（中/英），并承载技能浏览与分享。 */
export function AppShell({ skills, categories, total }: Props) {
  const [lang, setLang] = useState<Lang>("zh");
  return (
    <div className="app-shell" data-lang={lang}>
      <header className="topbar">
        <div className="brand">
          <span className="logo">🛠️</span>
          <span className="brand-name">Agent Skills Hub</span>
        </div>
        <button
          id="langBtn"
          className="icon-btn"
          aria-label="切换语言 / Toggle language"
          onClick={() => setLang((l) => (l === "zh" ? "en" : "zh"))}
        >
          {lang === "zh" ? "中 / EN" : "EN / 中"}
        </button>
      </header>
      <SkillsExplorer skills={skills} categories={categories} lang={lang} total={total} />
    </div>
  );
}
