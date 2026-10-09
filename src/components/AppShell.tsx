// src/components/AppShell.tsx v1.14.89 — 应用外壳编排（组合 TopBar / Hero / 技能浏览器 / 页脚，挂载副作用钩子）
"use client";
import { useMemo, useState } from "react";
import type { Lang } from "../lib/share";
import { SHARE_FEEDBACK, copyRepoShare } from "../lib/share";
import type { SkillsData } from "../lib/skills";
import { useLangPref, useThemePref, setLangPref, setThemePref } from "../lib/prefs";
import { SkillsExplorer } from "./SkillsExplorer";
import { TopBar, HeroSection, SiteFooter } from "./AppShell.parts";
import {
  useTopbarHeight,
  useHeroInteractions,
  useFilterStateSync,
  useShareFeedback,
} from "./AppShell.hooks";

export function AppShell({ data, version, updatedAt }: { data: SkillsData; version?: string; updatedAt?: string }) {
  const lang = useLangPref();
  const theme = useThemePref();
  const [toast, setToast] = useState<string | null>(null);

  const toggleLang = () => setLangPref(lang === "zh" ? "en" : "zh");
  const toggleTheme = () => setThemePref(theme === "light" ? "dark" : "light");

  useTopbarHeight();
  useHeroInteractions();
  useFilterStateSync();
  useShareFeedback(lang, setToast);

  // 页脚统计：可见技能总数、分类数、英文描述覆盖数、支持语言数
  const stats = useMemo(() => {
    const visible = (data.skills || []).filter((s) => !s.hidden);
    return {
      total: visible.length,
      cats: (data.categories || []).length,
      enCov: visible.filter((s) => s.enDescription && String(s.enDescription).trim()).length,
      langs: 2,
    };
  }, [data]);

  // Hero 节点数据：按分类计数聚合（确定性，供 HeroNet SSR 渲染）
  const heroCats = useMemo(() => {
    const visible = (data.skills || []).filter((s) => !s.hidden);
    const counts = new Map<string, number>();
    for (const s of visible) counts.set(s.category, (counts.get(s.category) || 0) + 1);
    return (data.categories || []).map((c) => ({ cat: c, count: counts.get(c) || 0 }));
  }, [data]);

  // 方案 B：随机抽一个技能，派发 ash:open-skill 由 SkillsExplorer 打开详情弹窗
  const handleDice = () => {
    const visible = (data.skills || []).filter((s) => !s.hidden);
    if (!visible.length) return;
    const pick = visible[Math.floor(Math.random() * visible.length)];
    window.dispatchEvent(new CustomEvent("ash:open-skill", { detail: { name: pick.name } }));
  };

  // 页脚分享仓库（随机文案 + 完整 GitHub URL 复制到剪贴板）
  const handleShareRepo = async () => {
    const fb = SHARE_FEEDBACK[lang];
    const ok = await copyRepoShare(lang, stats.total);
    setToast(ok ? fb.ok : fb.fail);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <>
      <TopBar lang={lang} theme={theme} onToggleLang={toggleLang} onToggleTheme={toggleTheme} />
      <HeroSection lang={lang} cats={heroCats} onDice={handleDice} />
      <main id="mainContent">
        <SkillsExplorer data={data} lang={lang} />
      </main>
      <SiteFooter
        lang={lang}
        version={version}
        updatedAt={updatedAt}
        toast={toast}
        onShareRepo={handleShareRepo}
      />
    </>
  );
}
