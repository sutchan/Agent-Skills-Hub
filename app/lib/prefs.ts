// app/lib/prefs.ts v1.14.51 — 偏好惰性订阅（useSyncExternalStore）
// 用于避免在 render 期直读 localStorage（Vercel rerender-isolate-client 实践），
// 并消除 AppShell 巨型客户端组件因偏好变化导致的整树重渲。
// SSR 阶段返回默认值，client 挂载后经 subscribe 同步真实值，无水合不匹配。

import { useSyncExternalStore } from "react";
import type { Lang } from "./share";

type Theme = "light" | "dark";

// 单一订阅源：document.documentElement 上的 data-lang / data-theme。
// 既作为外部 store，也作为 localStorage 的写入落点（沿用既有 ash-lang / ash-theme 键名）。

const LS_LANG = "ash-lang";
const LS_THEME = "ash-theme";

function readLang(): Lang {
  if (typeof document === "undefined") return "zh";
  const v = document.documentElement.getAttribute("data-lang");
  if (v === "zh" || v === "en") return v;
  try {
    const ls = localStorage.getItem(LS_LANG);
    if (ls === "zh" || ls === "en") return ls;
  } catch { /* ignore */ }
  return "zh";
}

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const v = document.documentElement.getAttribute("data-theme");
  if (v === "light" || v === "dark") return v;
  try {
    const ls = localStorage.getItem(LS_THEME);
    if (ls === "light" || ls === "dark") return ls;
  } catch { /* ignore */ }
  return "light";
}

// 订阅：仅在 document.documentElement 属性变化或 storage 事件时通知。
// 自定义事件 ash:pref 由 writeLang/writeTheme 派发，确保多实例同步。
function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("ash:pref", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("ash:pref", handler);
    window.removeEventListener("storage", handler);
  };
}

export function getLang(): Lang { return readLang(); }
export function getTheme(): Theme { return readTheme(); }

export function useLangPref(): Lang {
  return useSyncExternalStore(subscribe, readLang, () => "zh" as Lang);
}

export function useThemePref(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);
}

// 写入：同步到 DOM 属性 + localStorage + 派发通知（供 useSyncExternalStore 刷新）。
export function setLangPref(lang: Lang): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-lang", lang);
  document.documentElement.lang = lang;
  try { localStorage.setItem(LS_LANG, lang); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent("ash:pref"));
}

export function setThemePref(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem(LS_THEME, theme); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent("ash:pref"));
}
