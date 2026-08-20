// app/components/AppShell.tsx v1.14.71 — 应用外壳（语言/主题切换 + 品牌 + 技能浏览）
"use client";

import { useEffect, useState } from "react";
import type { Skill } from "../lib/skills";
import type { Lang } from "../lib/share";
import { SkillsExplorer } from "./SkillsExplorer";
import { LangToggle } from "./ui/lang-toggle";
import { ThemeToggle } from "./ui/theme-toggle";
import { t } from "@/lib/i18n";

// 品牌标记：引用唯一来源 app/public/hub.svg 的 <symbol id="ash-hub">（currentColor 驱动）
// 图形造型单一来源，消除硬编码副本；主绿由 --primary #2e9e6b 通过 color 注入
function BrandMark() {
  return (
    <svg className="logo" width="64" height="64" viewBox="0 0 32 32" role="img" aria-label="Agent Skills Hub">
      <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
      <use href="/hub.svg#ash-hub" xlinkHref="/hub.svg#ash-hub" width="32" height="32" color="#fff" />
    </svg>
  );
}

interface Props {
  skills: Skill[];
  categories: string[];
  total: number;
  version?: string;
}

/** 应用外壳：管理当前界面语言（中/英）与主题（浅/深），承载技能浏览与分享。 */
export function AppShell({ skills, categories, total, version = "" }: Props) {
  const [lang, setLang] = useState<Lang>("zh");
  const [dark, setDark] = useState(false);

  // 从 localStorage 恢复偏好（对齐 prototype 01-state：key ash-theme / ash-lang，SSR 安全）
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const savedLang = window.localStorage.getItem("ash-lang");
      if (savedLang === "zh" || savedLang === "en") setLang(savedLang as Lang);
      const savedTheme = window.localStorage.getItem("ash-theme");
      if (savedTheme === "light" || savedTheme === "dark") setDark(savedTheme === "dark");
    } catch {
      /* 隐私模式等场景忽略 */
    }
  }, []);

  // 同步主题到 <html data-theme> + localStorage，驱动 CSS 变量切换
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try { window.localStorage.setItem("ash-theme", dark ? "dark" : "light"); } catch { /* ignore */ }
  }, [dark]);

  // 同步语言到 <html data-lang> + localStorage（对齐原型 html[data-lang]）
  useEffect(() => {
    document.documentElement.setAttribute("data-lang", lang);
    try { window.localStorage.setItem("ash-lang", lang); } catch { /* ignore */ }
  }, [lang]);

  return (
    <div className="app-shell" data-lang={lang} data-theme={dark ? "dark" : "light"}>
      <header className="topbar" id="appHeader">
        <div className="brand" id="brandBlock">
          <BrandMark />
          <span className="brand-name">Agent Skills Hub</span>
        </div>
        <div className="topbar-actions">
          <LangToggle lang={lang} onToggle={() => setLang((l) => (l === "zh" ? "en" : "zh"))} />
          <ThemeToggle theme={dark ? "dark" : "light"} onToggle={() => setDark((d) => !d)} lang={lang} />
        </div>
      </header>
      {/* 签名元素：Hero 节点网（呼应品牌 Hub 隐喻；对齐 prototype DESIGN §4） */}
      <section className="hero" id="hero" aria-labelledby="heroTitle">
        <svg className="hero-net" viewBox="0 0 800 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g stroke="hsl(var(--line))" strokeWidth="1" opacity=".5">
            <line x1="120" y1="60" x2="400" y2="120" /><line x1="400" y1="120" x2="680" y2="70" />
            <line x1="400" y1="120" x2="220" y2="200" /><line x1="400" y1="120" x2="600" y2="190" />
            <line x1="120" y1="60" x2="220" y2="200" /><line x1="680" y1="70" x2="600" y2="190" />
          </g>
          <g fill="hsl(var(--node))">
            <circle cx="120" cy="60" r="5" /><circle cx="680" cy="70" r="5" />
            <circle cx="220" cy="200" r="5" /><circle cx="600" cy="190" r="5" />
            <circle cx="400" cy="120" r="11" fill="hsl(var(--primary))" />
          </g>
        </svg>
        <div className="hero-inner">
        <span className="hero-eyebrow">{lang === "zh" ? "Agent 技能枢纽" : "Agent Skills Hub"}</span>
        <h1 id="heroTitle">
          {lang === "zh" ? (
            <>零散的 agent 技能，<span className="accent">汇聚</span>成一处可检索的枢纽</>
          ) : (
            <>Scattered agent skills, <span className="accent">unified</span> into one searchable hub</>
          )}
        </h1>
        <p>
          {lang === "zh"
            ? "按分类浏览、搜索，或查看技能详情——为你的编码 agent 即取即用。"
            : "Browse by category, search, or inspect skill details — ready to drop into your coding agent."}
        </p>
        <div className="hero-stat" aria-live="polite">
          <div className="stat"><div className="num">{total}</div><div className="lbl">{lang === "zh" ? "技能总数" : "Total skills"}</div></div>
          <div className="stat"><div className="num">{categories.length}</div><div className="lbl">{lang === "zh" ? "分类" : "Categories"}</div></div>
        </div>
        </div>
      </section>

      <SkillsExplorer skills={skills} lang={lang} total={total} />

      {/* 页脚区：品牌 + 导航链接 + 版本/协议（id 供测试与无障碍定位） */}
      <footer className="site-footer" id="siteFooter">
        <div className="footer-inner" id="footerInner">
          <div className="footer-brand" id="footerBrand">
            <a className="footer-logo" id="footerLogo" href="#" aria-label="Agent Skills Hub">
              <BrandMark />
              <span>Skills Hub</span>
            </a>
            {lang === "zh" ? (
              <p className="footer-desc" id="footerDescZh">高质量 Agent 技能目录，按分类浏览、搜索、即取即用。</p>
            ) : (
              <p className="footer-desc" id="footerDescEn">A curated directory of high-quality agent skills — browse, search, and reuse.</p>
            )}
          </div>
          <nav className="footer-links" id="footerLinks" aria-label="页脚导航 / Footer links">
            <a className="footer-link" href="https://github.com/sutchan/Agent-Skills-Hub" target="_blank" rel="noopener">GitHub</a>
            <a className="footer-link" href="https://github.com/sutchan/Agent-Skills-Hub#readme" target="_blank" rel="noopener">README</a>
          </nav>
        </div>
        <div className="footer-bottom" id="footerBottom">
          {version && <span className="footer-ver" id="footerVer">v{version}</span>}
          {version && <span className="footer-sep" aria-hidden="true">·</span>}
          {lang === "zh" ? (
            <span className="footer-copy" id="footerCopyZh">开源免费 · MIT 协议</span>
          ) : (
            <span className="footer-copy" id="footerCopyEn">Open source · MIT License</span>
          )}
        </div>
      </footer>
    </div>
  );
}
