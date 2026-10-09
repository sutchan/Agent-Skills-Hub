// src/components/SkillsExplorer.hooks.ts v1.14.89 — SkillsExplorer 副作用钩子（深链 / 偏好 / 滚动 / 筛选联动 / 翻页）
import { useEffect } from "react";
import type { SkillsData, Skill } from "../lib/skills";
import type { SortKey } from "./SkillsExplorer.hash";
import { parseHash, writeHash } from "./SkillsExplorer.hash";

// URL 深链：挂载还原筛选/搜索/排序/页码 + 浏览器前进后退/外部改 hash 还原
export function useHashSync(
  setCat: (v: string) => void,
  setRaw: (v: string) => void,
  setQ: (v: string) => void,
  setSort: (v: SortKey) => void,
  setPage: (v: number) => void,
): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = parseHash();
    if (h.cat) setCat(h.cat);
    if (typeof h.q === "string") { setRaw(h.q); setQ(h.q); }
    if (h.sort) setSort(h.sort);
    if (typeof h.page === "number") setPage(h.page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHash = () => {
      const h = parseHash();
      if (h.cat) setCat(h.cat);
      if (typeof h.q === "string") { setRaw(h.q); setQ(h.q); }
      if (h.sort) setSort(h.sort);
      if (typeof h.page === "number") setPage(h.page);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [setCat, setRaw, setQ, setSort, setPage]);
}

// 搜索防抖 / 深链写入 / 骰子开详情 / 翻页重置 / 回到顶部 / 筛选联动 Hero
export function useExplorerEffects(
  raw: string,
  setQ: (v: string) => void,
  cat: string,
  q: string,
  sort: SortKey,
  page: number,
  setPage: (v: number) => void,
  data: SkillsData,
  setDetail: (v: Skill | null) => void,
  setShowToTop: (v: boolean) => void,
): void {
  // 搜索防抖（对齐原型 DEBOUNCE_MS=120）：raw 停止输入 120ms 后写入 q 触发过滤
  useEffect(() => {
    const t = setTimeout(() => setQ(raw), 120);
    return () => clearTimeout(t);
  }, [raw, setQ]);

  // 深链写入：筛选/搜索/排序/页码变化后同步到 location.hash（刷新/分享可还原，对齐原型 P0-1）
  useEffect(() => {
    writeHash({ cat, q, sort, page });
  }, [cat, q, sort, page]);

  // 接收 Hero 骰子派发的随机技能打开详情（对齐 prototype 03-detail.js shareSkill/openDetail）
  useEffect(() => {
    const onPick = (e: Event) => {
      const name = (e as CustomEvent<{ name?: string }>).detail?.name;
      if (!name) return;
      const sk = data.skills.find((s) => s.name === name && !s.hidden);
      if (sk) setDetail(sk);
    };
    window.addEventListener("ash:open-skill", onPick as EventListener);
    return () => window.removeEventListener("ash:open-skill", onPick as EventListener);
  }, [data.skills, setDetail]);

  // 翻页：筛选/搜索/排序变化时回到第 0 页
  useEffect(() => { setPage(0); }, [q, cat, sort, setPage]);

  // 回到顶部（对齐原型 toTop：滚动超 300px 显隐）
  useEffect(() => {
    const onScroll = () => setShowToTop(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setShowToTop]);

  // 分类点击联动 Hero 节点网：派发当前筛选状态供 AppShell 点亮核心（对齐 prototype updateHeroNet）
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("ash:filter-state", { detail: { cat, query: q } }));
  }, [cat, q]);
}

// 偏好恢复（挂载一次）+ 偏好变化同步到 <html data-show-*> / data-name-mode 并持久化
export function usePrefsSync(
  setShowDesc: (v: boolean) => void,
  setShowCat: (v: boolean) => void,
  setShowBar: (v: boolean) => void,
  setNameMode: (v: "both" | "zh" | "en") => void,
  setDensity: (v: "comfortable" | "compact") => void,
  setView: (v: "grid" | "list") => void,
  showDesc: boolean,
  showCat: boolean,
  showBar: boolean,
  nameMode: "both" | "zh" | "en",
  density: "comfortable" | "compact",
  view: "grid" | "list",
): void {
  useEffect(() => {
    const read = (k: string) => {
      try { return localStorage.getItem(k); } catch { return null; }
    };
    const on = (v: string | null) => v !== "false";
    setShowDesc(on(read("ash-show-desc")));
    setShowCat(on(read("ash-show-cat")));
    setShowBar(on(read("ash-show-bar")));
    const nm = read("ash-name-mode");
    if (nm === "zh" || nm === "en") setNameMode(nm);
    const d = read("ash-density");
    if (d === "comfortable" || d === "compact") setDensity(d);
    const v = read("ash-view");
    if (v === "grid" || v === "list") setView(v);
  }, [setShowDesc, setShowCat, setShowBar, setNameMode, setDensity, setView]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-show-desc", showDesc ? "on" : "off");
    root.setAttribute("data-show-cat", showCat ? "on" : "off");
    root.setAttribute("data-show-bar", showBar ? "on" : "off");
    root.setAttribute("data-name-mode", nameMode);
    root.setAttribute("data-density", density);
    const writeBool = (k: string, v: boolean) => {
      try { localStorage.setItem(k, v ? "true" : "false"); } catch { /* 隐私模式忽略 */ }
    };
    const writeStr = (k: string, v: string) => {
      try { localStorage.setItem(k, v); } catch { /* 隐私模式忽略 */ }
    };
    writeBool("ash-show-desc", showDesc);
    writeBool("ash-show-cat", showCat);
    writeBool("ash-show-bar", showBar);
    writeStr("ash-name-mode", nameMode);
    writeStr("ash-density", density);
    writeStr("ash-view", view);
  }, [showDesc, showCat, showBar, nameMode, density, view]);
}
