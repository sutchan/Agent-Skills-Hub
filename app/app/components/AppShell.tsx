// app/components/AppShell.tsx v1.14.44 — 应用外壳（语言/主题切换 + 品牌 + 技能浏览）
"use client";

import { useEffect, useState } from "react";
import type { Skill } from "../lib/skills";
import type { Lang } from "../lib/share";
import { SkillsExplorer } from "./SkillsExplorer";

// 品牌标记：三节点汇聚中心 Hub，主绿对齐设计系统 --primary #2e9e6b（与 app/public/ 资产同源）
function BrandMark() {
  return (
    <svg className="logo" width="64" height="64" viewBox="0 0 32 32" role="img" aria-label="Agent Skills Hub">
      <rect width="32" height="32" rx="8" fill="#2e9e6b" />
      <g fill="#fff" stroke="#fff" strokeWidth="1.4" strokeLinecap="round">
        <line x1="16" y1="16" x2="16" y2="7.5" opacity=".55" />
        <line x1="16" y1="16" x2="24.5" y2="21" opacity=".55" />
        <line x1="16" y1="16" x2="7.5" y2="21" opacity=".55" />
        <circle cx="16" cy="16" r="3.4" fill="#fff" stroke="none" />
        <circle cx="16" cy="7.5" r="2.3" stroke="none" />
        <circle cx="24.5" cy="21" r="2.3" stroke="none" />
        <circle cx="7.5" cy="21" r="2.3" stroke="none" />
      </g>
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

  // 同步主题到 <html data-theme>，驱动 CSS 变量切换
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="app-shell" data-lang={lang} data-theme={dark ? "dark" : "light"}>
      <header className="topbar" id="appHeader">
        <div className="brand" id="brandBlock">
          <BrandMark />
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
