// src/components/AppShell.hooks.ts v1.14.89 — AppShell 副作用钩子（顶栏高度 / Hero 交互 / 筛选状态同步 / 分享反馈）
import { useEffect } from "react";
import type { Lang } from "../lib/share";
import { SHARE_FEEDBACK } from "../lib/share";
import { catHue } from "../lib/catHue";

// 量取顶栏高度注入 --topbar-h，供 .controls sticky 偏移（对齐 prototype 05-main.js setTopbarH）
export function useTopbarHeight(): void {
  useEffect(() => {
    const setTopbarH = () => {
      const h = document.getElementById("appHeader");
      if (h) document.documentElement.style.setProperty("--topbar-h", h.offsetHeight + "px");
    };
    setTopbarH();
    window.addEventListener("resize", setTopbarH);
    return () => window.removeEventListener("resize", setTopbarH);
  }, []);
}

// Hero 节点网交互：经 #heroNet 事件委托（hover 高亮卡片 / click 切分类），纯 DOM 监听不重建节点
export function useHeroInteractions(): void {
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
}

// 搜索/筛选时点亮 Hero 核心（对齐 prototype updateHeroNet）：监听 SkillsExplorer 派发的筛选状态
export function useFilterStateSync(): void {
  useEffect(() => {
    const apply = (e: Event) => {
      const svg = document.getElementById("heroNet") as SVGSVGElement | null;
      if (!svg) return;
      const detail = (e as CustomEvent<{ cat?: string; query?: string }>).detail || {};
      const isFiltered = Boolean(detail.query) || Boolean(detail.cat);
      svg.classList.toggle("filtering", isFiltered);
      svg.classList.toggle("searching", Boolean(detail.query));
      const active = new Set<string>(detail.cat ? [detail.cat] : []);
      svg.querySelectorAll<SVGCircleElement>(".hub-node[data-cat]").forEach((nd) =>
        nd.classList.toggle("active", active.has(nd.getAttribute("data-cat") || ""))
      );
      const core = svg.querySelector<SVGCircleElement>(".hub-core");
      const glow = svg.querySelector<SVGCircleElement>(".hub-glow");
      if (detail.cat) {
        const hue = catHue(detail.cat);
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
}

// 详情弹窗分享技能反馈（detail-modal 派发 skill-share-feedback 事件）
export function useShareFeedback(lang: Lang, setToast: (t: string | null) => void): void {
  useEffect(() => {
    const onShare = (e: Event) => {
      const ok = (e as CustomEvent<{ ok: boolean }>).detail?.ok;
      const fb = SHARE_FEEDBACK[lang];
      setToast(ok ? fb.ok : fb.fail);
      window.setTimeout(() => setToast(null), 1800);
    };
    window.addEventListener("skill-share-feedback", onShare as EventListener);
    return () => window.removeEventListener("skill-share-feedback", onShare as EventListener);
  }, [lang, setToast]);
}
