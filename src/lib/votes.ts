// src/lib/votes.ts v1.14.81 — 赞/踩计数（双计数独立）+ 惰性订阅 store
//
// 语义：赞与踩各自独立计数、互不抵消，可同时为正（不互相取反）。
// 无后端聚合，故数值仅代表本浏览器的累计；再次点击同一项即取消该项。
// 存储键 ash-votes，结构 { [skillName]: { up: number, down: number } }（与原型 06-votes.js 完全一致）。
//
// 实现沿用 prefs.ts 的 useSyncExternalStore 约定：不在 render 期直读 localStorage，
// SSR 返回默认值、client 挂载后经 subscribe 同步，无水合不匹配；
// store 内对象引用稳定，故投票只重渲被点的那一张卡片。
import { useSyncExternalStore } from "react";

export type VoteDir = "up" | "down";
export type Counts = { up: number; down: number };
type Store = Record<string, Counts>;

const LS_VOTES = "ash-votes";
const EVENT = "ash:votes";
// 冻结的空计数：作为稳定引用兜底，避免无票技能每次读取都产生新对象
const EMPTY: Counts = Object.freeze({ up: 0, down: 0 });

let store: Store | null = null;

function toCount(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

// 懒加载并规范化：剔除非法/负值/脏数据，不阻断渲染
function ensure(): Store {
  if (store) return store;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(LS_VOTES);
  } catch {
    raw = null; // 隐私模式：退化为纯内存
  }
  let parsed: unknown = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null; // 数据损坏：重置
    }
  }
  const clean: Store = {};
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const o = v as Record<string, unknown>;
      const up = toCount(o.up);
      const down = toCount(o.down);
      if (up || down) clean[k] = { up, down };
    }
  }
  store = clean;
  return store;
}

function persist(): void {
  try {
    localStorage.setItem(LS_VOTES, JSON.stringify(ensure()));
  } catch {
    /* 隐私模式/配额超限：仅保留内存态 */
  }
}

function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler); // 跨标签页同步
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/**
 * 切换某方向的计数：0↔1↔2…（再次点击同一项即取消该项）。
 * 另一方向完全不受影响 —— 这是「双计数独立」的核心。
 */
export function castVote(name: string, dir: VoteDir): void {
  const cur = ensure()[name] || EMPTY;
  const up = dir === "up" ? (cur.up > 0 ? 0 : cur.up + 1) : cur.up;
  const down = dir === "down" ? (cur.down > 0 ? 0 : cur.down + 1) : cur.down;
  const out: Store = { ...ensure() };
  if (up || down) out[name] = { up, down };
  else delete out[name];
  store = out; // 换新引用，触发订阅者比对
  persist();
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT));
}

/** 订阅单个技能的计数：仅该技能数值变化时，本卡片才重渲 */
export function useVotesFor(name: string): Counts {
  return useSyncExternalStore(
    subscribe,
    () => ensure()[name] || EMPTY,
    () => EMPTY
  );
}
