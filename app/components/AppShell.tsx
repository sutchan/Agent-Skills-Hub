// app/components/AppShell.tsx v1.14.51 — 应用外壳（顶栏品牌区 + Hero 节点网 + 语言/主题切换 + 技能浏览器 + 页脚统计）
"use client";
import { useEffect, useMemo, useState } from "react";
import type { Lang } from "../lib/share";
import { SHARE_FEEDBACK, REPO_URL, copyRepoShare } from "../lib/share";
import type { SkillsData } from "../lib/skills";
import { catHue } from "../lib/catHue";
import { useLangPref, useThemePref, setLangPref, setThemePref } from "../lib/prefs";
import { SkillsExplorer } from "./SkillsExplorer";
import { HeroNet, type HeroCatCount } from "./HeroNet";

// 统计事件上报：对齐 prototype 01-state.js track —— 仅当 GA(gtag) 注入时上报，否则静默
function track(event: string, params?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && typeof (window as unknown as { gtag?: (e: string, n: string, p?: object) => void }).gtag === "function") {
      (window as unknown as { gtag: (e: string, n: string, p?: object) => void }).gtag("event", event, params || {});
    }
  } catch { /* 统计失败不影响主流程 */ }
}

function BrandMark() {
  return (
    <svg className="logo" viewBox="0 0 32 32" role="img" aria-label="Agent Skills Hub">
      <rect width="32" height="32" rx="8" fill="hsl(152 56% 40%)" />
      <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight={700} fill="#fff">H</text>
    </svg>
  );
}

// Hero 节点网交互：经 <svg> 事件委托（hover 高亮对应分类卡片 / click 切分类筛选）
function bindHeroInteractions(svg: SVGSVGElement | null) {
  if (!svg) return;
  const catOf = (t: EventTarget | null) => (t as Element | null)?.getAttribute?.("data-cat") || "";
  const highlight = (cat: string, on: boolean) =>
    document.querySelectorAll<HTMLElement>("#grid .card").forEach((card) => {
      if (card.dataset.cat === cat) card.classList.toggle("pulse", on);
    });
  svg.addEventListener("mouseover", (e) => { const c = catOf(e.target); if (c) highlight(c, true); });
  svg.addEventListener("mouseout", (e) => { const c = catOf(e.target); if (c) highlight(c, false); });
  svg.addEventListener("click", (e) => {
    const c = catOf(e.target);
    if (c) window.dispatchEvent(new CustomEvent("ash:cat-toggle", { detail: { cat: c } }));
  });
  svg.addEventListener("keydown", (e) => {
    const c = catOf(e.target);
    if (c && (e as KeyboardEvent).key === "Enter") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("ash:cat-toggle", { detail: { cat: c } }));
    }
  });
}

export function AppShell({ data, version }: { data: SkillsData; version?: string }) {
  const lang = useLangPref();
  const theme = useThemePref();
  const [toast, setToast] = useState<string | null>(null);

  // 主题/语言切换：经惰性 store 写入，避免整树重渲（prefs 仅订阅组件刷新）
  const toggleLang = () => setLangPref(lang === "zh" ? "en" : "zh");
  const toggleTheme = () => setThemePref(theme === "dark" ? "light" : "dark");

  // 量取顶栏高度注入 --topbar-h，供 .controls sticky 偏移（对齐 prototype 05-main.js setTopbarH）
  useEffect(() => {
    const setTopbarH = () => {
      const h = document.getElementById("appHeader");
      if (h) document.documentElement.style.setProperty("--topbar-h", h.offsetHeight + "px");
    };
    setTopbarH();
    window.addEventListener("resize", setTopbarH);
    return () => window.removeEventListener("resize", setTopbarH);
  }, []);

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
  const heroCats = useMemo<HeroCatCount[]>(() => {
    const visible = (data.skills || []).filter((s) => !s.hidden);
    const counts = new Map<string, number>();
    for (const s of visible) counts.set(s.category, (counts.get(s.category) || 0) + 1);
    return (data.categories || []).map((c) => ({ cat: c, count: counts.get(c) || 0 }));
  }, [data]);

  // Hero 节点网交互：经 #heroNet 事件委托（hover 高亮卡片 / click 切分类），纯 DOM 监听不重建节点
  useEffect(() => {
    const svg = document.getElementById("heroNet") as SVGSVGElement | null;
    if (!svg) return;
    const catOf = (t: EventTarget | null) => (t as Element | null)?.getAttribute?.("data-cat") || "";
    const highlight = (cat: string, on: boolean) =>
      document.querySelectorAll<HTMLElement>("#grid .card").forEach((card) => {
        if (card.dataset.cat === cat) card.classList.toggle("pulse", on);
      });
    const onOver = (e: Event) => { const c = catOf(e.target); if (c) highlight(c, true); };
    const onOut = (e: Event) => { const c = catOf(e.target); if (c) highlight(c, false); };
    const onClick = (e: Event) => {
      const c = catOf(e.target);
      if (c) window.dispatchEvent(new CustomEvent("ash:cat-toggle", { detail: { cat: c } }));
    };
    const onKey = (e: Event) => {
      const c = catOf(e.target);
      if (c && (e as KeyboardEvent).key === "Enter") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("ash:cat-toggle", { detail: { cat: c } }));
      }
    };
    svg.addEventListener("mouseover", onOver);
    svg.addEventListener("mouseout", onOut);
    svg.addEventListener("click", onClick);
    svg.addEventListener("keydown", onKey);
    return () => {
      svg.removeEventListener("mouseover", onOver);
      svg.removeEventListener("mouseout", onOut);
      svg.removeEventListener("click", onClick);
      svg.removeEventListener("keydown", onKey);
    };
  }, []);

  // 搜索/筛选时点亮 Hero 核心（对齐 prototype updateHeroNet）：监听 SkillsExplorer 派发的筛选状态
  useEffect(() => {
    const apply = (e: Event) => {
      const svg = document.getElementById("heroNet") as SVGSVGElement | null;
      if (!svg) return;
      const detail = (e as CustomEvent<{ cats?: string[]; query?: string }>).detail || {};
      const isFiltered = Boolean(detail.query) || (detail.cats?.length ?? 0) > 0;
      svg.classList.toggle("filtering", isFiltered);
      svg.classList.toggle("searching", Boolean(detail.query));
      const active = new Set(detail.cats || []);
      svg.querySelectorAll<SVGCircleElement>(".hub-node[data-cat]").forEach((nd) =>
        nd.classList.toggle("active", active.has(nd.getAttribute("data-cat") || ""))
      );
      const core = svg.querySelector<SVGCircleElement>(".hub-core");
      const glow = svg.querySelector<SVGCircleElement>(".hub-glow");
      if ((detail.cats || []).length === 1) {
        const hue = catHue(detail.cats![0]);
        core?.style.setProperty("--core-hue", String(hue));
        glow?.style.setProperty("--core-hue", String(hue));
      } else {
        core?.style.removeProperty("--core-hue");
        glow?.style.removeProperty("--core-hue");
      }
    };
    window.addEventListener("ash:filter-state", apply as EventListener);
    return () => window.removeEventListener("ash:filter-state", apply as EventListener);
  }, []);

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
              onClick={toggleLang}
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
              onClick={toggleTheme}
            >
              {theme === "dark" ? "☀" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <section className="hero" id="hero" aria-labelledby={lang === "en" ? "heroTitleEn" : "heroTitle"}>
        <HeroNet cats={heroCats} />
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
            <button type="button" id="diceBtn" className="btn-dice" aria-label="随机抽一个技能" onClick={handleDice}>
              <span className="dice-face" aria-hidden="true">🎲</span>
              <span className="zh">今天学点什么</span>
              <span className="en">Learn something</span>
            </button>
            <span className="dice-hint zh">不知道从哪开始？让骰子决定。</span>
            <span className="dice-hint en">Not sure where to start? Let the dice decide.</span>
          </div>
        </div>
      </section>

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
          <nav className="footer-links" id="footerLinks" aria-label={lang === "zh" ? "页脚导航" : "Footer navigation"}>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">{lang === "zh" ? "GitHub" : "GitHub"}</a>
            <a href={`${REPO_URL}#readme`} target="_blank" rel="noopener noreferrer">{lang === "zh" ? "README" : "README"}</a>
          </nav>
          <div className="footer-stats" id="footerStats">
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
