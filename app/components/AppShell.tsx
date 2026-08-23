// app/components/AppShell.tsx v1.20.33 — 应用外壳（顶栏品牌区 + 语言/主题切换 + 技能浏览器 + 页脚统计）
"use client";
import { useEffect, useMemo, useState } from "react";
import type { Lang } from "../lib/share";
import { SHARE_FEEDBACK, REPO_URL, copyRepoShare } from "../lib/share";
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
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem("ash-lang")) as Lang | null;
    if (saved === "zh" || saved === "en") setLang(saved);
    const savedTheme = localStorage?.getItem("ash-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.lang = lang;
    if (typeof localStorage !== "undefined") localStorage.setItem("ash-lang", lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (typeof localStorage !== "undefined") localStorage.setItem("ash-theme", theme);
  }, [theme]);

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

  // 页脚分享仓库：随机文案 + 完整 GitHub URL 复制到剪贴板（v1.20.9）
  const [toast, setToast] = useState<string | null>(null);
  const handleShareRepo = async () => {
    const fb = SHARE_FEEDBACK[lang];
    const ok = await copyRepoShare(lang, stats.total);
    setToast(ok ? fb.ok : fb.fail);
    window.setTimeout(() => setToast(null), 1800);
  };
  // 详情弹窗分享技能反馈（detail-modal 派发 skill-share-feedback 事件）
  useEffect(() => {
    const onShare = (e: Event) => {
      const ok = (e as CustomEvent<{ ok: boolean }>).detail?.ok;
      const fb = SHARE_FEEDBACK[lang];
      setToast(ok ? fb.ok : fb.fail);
      window.setTimeout(() => setToast(null), 1800);
    };
    window.addEventListener("skill-share-feedback", onShare as EventListener);
    return () => window.removeEventListener("skill-share-feedback", onShare as EventListener);
  }, [lang]);

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
          title="语言 / Language"
          aria-label={lang === "zh" ? "切换语言" : "Switch language"}
          onClick={() => setLang((l) => (l === "zh" ? "en" : "zh"))}
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
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        >
          {theme === "dark" ? "☀" : "🌙"}
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
          <div className="footer-cta" id="footerCta">
            <a
              className="star-btn"
              id="starBtn"
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={lang === "zh" ? "给仓库点 Star" : "Star this repo"}
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
              onClick={handleShareRepo}
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
        {toast ? (
          <div className="toast show" id="toast" role="status" aria-live="polite">
            {toast}
          </div>
        ) : null}
      </footer>
    </>
  );
}
