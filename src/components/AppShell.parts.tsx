// src/components/AppShell.parts.tsx v1.14.89 — AppShell 展示型子组件（品牌标识 / 顶栏 / Hero / 页脚）
"use client";
import type { Lang } from "../lib/share";
import { REPO_URL } from "../lib/share";
import { track } from "../lib/analytics";
import type { HeroCatCount } from "./HeroNet";
import { HeroNet } from "./HeroNet";

export function BrandMark() {
  return (
    <svg className="logo" viewBox="0 0 32 32" role="img" aria-label="Agent Skills Hub">
      <rect width="32" height="32" rx="8" fill="hsl(152 56% 40%)" />
      <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight={700} fill="#fff">H</text>
    </svg>
  );
}

export function TopBar({
  lang,
  theme,
  onToggleLang,
  onToggleTheme,
}: {
  lang: Lang;
  theme: "light" | "dark";
  onToggleLang: () => void;
  onToggleTheme: () => void;
}) {
  return (
    <header className="topbar" id="appHeader">
      <div className="topbar-inner">
        <div className="brand" id="brandBlock">
          <BrandMark />
          <span className="brand-text">
            <span className="brand-name">Agent Skills Hub</span>
            <small className="brand-sub">{lang === "zh" ? "高质量 Agent 技能库" : "Curated agent skill library"}</small>
          </span>
        </div>
        <div className="topbar-actions" id="topbarActions">
          <button
            id="langBtn"
            className="icon-btn"
            title="语言 / Language"
            aria-label={lang === "zh" ? "切换语言" : "Switch language"}
            onClick={onToggleLang}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
            </svg>
          </button>
          <button
            id="themeBtn"
            className="icon-btn"
            title="主题 / Theme"
            aria-label={theme === "dark" ? "切换到浅色" : "切换到深色"}
            onClick={onToggleTheme}
          >
            {theme === "dark" ? "☀" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}

export function HeroSection({
  lang,
  cats,
  onDice,
}: {
  lang: Lang;
  cats: HeroCatCount[];
  onDice: () => void;
}) {
  return (
    <section className="hero" id="hero" aria-labelledby={lang === "en" ? "heroTitleEn" : "heroTitle"}>
      <HeroNet cats={cats} />
      <div className="hero-inner">
        <span className="hero-eyebrow">{lang === "zh" ? "Agent 技能枢纽" : "Agent Skills Hub"}</span>
        <h1 className="zh" id="heroTitle">零散的 agent 技能，<br /><span className="accent">汇聚</span>成一处可检索的枢纽</h1>
        <h1 className="en" id="heroTitleEn" aria-hidden="true">Scattered agent skills,<br /> <span className="accent">unified</span> into one searchable hub</h1>
        <p className="zh">按分类浏览、搜索，或查看技能详情——为你的编码 agent 即取即用。</p>
        <p className="en">Browse by category, search, or inspect skill details — ready to drop into your coding agent.</p>
        <ul className="hero-features" aria-label="Highlights">
          <li className="zh">⚙️ 零维护清单 · 构建自动生成</li>
          <li className="en">⚙️ Zero-maintenance, auto-generated</li>
          <li className="zh">🌏 中文本地化 · 开箱即用</li>
          <li className="en">🌏 Chinese-localized, ready to use</li>
          <li className="zh">🚀 离线可用 · 无框架依赖</li>
          <li className="en">🚀 Works offline, framework-free</li>
        </ul>
        <div className="hero-dice">
          <button type="button" id="diceBtn" className="btn-dice" aria-label="随机抽一个技能" onClick={onDice}>
            <span className="dice-face" aria-hidden="true">🎲</span>
            <span className="zh">今天学点什么</span>
            <span className="en">Learn something</span>
          </button>
          <span className="dice-hint zh">不知道从哪开始？让骰子决定。</span>
          <span className="dice-hint en">Not sure where to start? Let the dice decide.</span>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter({
  lang,
  version,
  updatedAt,
  toast,
  onShareRepo,
}: {
  lang: Lang;
  version?: string;
  updatedAt?: string;
  toast?: string | null;
  onShareRepo: () => void;
}) {
  return (
    <footer className="footer" id="appFooter">
      <div className="footer-inner">
        <div className="footer-info">
          <span className="footer-name">Agent Skills Hub</span>
          <span className="footer-desc">{lang === "zh" ? "开源免费 · MIT 协议" : "Open source · MIT License"}</span>
        </div>
        <div className="footer-meta" id="footerMeta">
          {version ? <span className="footer-version">v{version}</span> : null}
          {updatedAt ? (
            <span className="footer-updated">{lang === "zh" ? `更新于 ${updatedAt}` : `Updated ${updatedAt}`}</span>
          ) : null}
        </div>
        <div className="footer-cta" id="footerCta">
          <a
            className="star-btn"
            id="starBtn"
            href={`${REPO_URL}/stargazers`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={lang === "zh" ? "给仓库点 Star" : "Star this repo"}
            onClick={() => track("star_click", { repo: "Agent-Skills-Hub" })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 2.5z" />
            </svg>
            <span>{lang === "zh" ? "给仓库点个 Star ⭐" : "Star this repo ⭐"}</span>
          </a>
          <button
            className="share-btn"
            id="shareBtn"
            type="button"
            aria-label={lang === "zh" ? "分享" : "Share"}
            onClick={onShareRepo}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
            </svg>
            <span>{lang === "zh" ? "分享" : "Share"}</span>
          </button>
        </div>
      </div>
      {toast ? (
        <div className="toast show" id="toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </footer>
  );
}
