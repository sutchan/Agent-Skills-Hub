// src/lib/votes.ts v1.14.85 — 赞计数（累加制 + 独立撤销）+ 惰性订阅 store + 导出上报
//
// 语义（v1.14.85 起）：点击「赞」为累加（up + 1），可反复表达「它对我有多有用」；
// 「撤销」把该技能的赞清零（up = 0）。此前语义为「双计数独立的布尔开关（0↔1）」——
// 该语义下票数恒为 0/1，既无法区分强弱、没有策展价值，也与「计数」这一命名不符，故改为累加制。
//
// 移除「踩」：无身份、无审核的前提下，踩是纯攻击面（改一个 localStorage key 即可把所有
// 技能打成负分且无法自动修复），且踩的动机远比赞嘈杂。负向反馈改由「有问题？提 Issue」承接。
//
// 存储：localStorage 键 ash-votes，结构 { [skillName]: { up: number } }（与原型 06-votes.js 一致）。
// 无后端聚合，数值仅代表本浏览器的累计；listVoted()/formatVoteReport() 供「导出上报」使用，
// 维护者把导出结果汇总进 data/skills-votes.json，由构建期合并进页面（见 tools/build-votes.mjs）。
//
// 实现沿用 prefs.ts 的 useSyncExternalStore 约定：不在 render 期直读 localStorage，
// SSR 返回默认值、client 挂载后经 subscribe 同步，无水合不匹配；
// store 内对象引用稳定，故投票只重渲被点的那一张卡片。
import { useSyncExternalStore } from "react";
import { track } from "./analytics";

export type Counts = { up: number };
type Store = Record<string, Counts>;

const LS_VOTES = "ash-votes";
const EVENT = "ash:votes";
// 冻结的空计数：作为稳定引用兜底，避免无票技能每次读取都产生新对象
const EMPTY: Counts = Object.freeze({ up: 0 });

let store: Store | null = null;

function toCount(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

// 无原型链的空对象：技能名若恰为 __proto__/constructor，赋值会落到自有属性而非污染原型
// （与原型 06-votes.js 的 Object.create(null) 对齐）
function emptyStore(): Store {
  return Object.create(null) as Store;
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
  const clean = emptyStore();
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      // 仅取 up：踩已移除，遗留的 down 字段在此被丢弃（存量数据自动迁移）
      const up = toCount((v as Record<string, unknown>).up);
      if (up) clean[k] = { up };
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

// 换新引用（触发 useSyncExternalStore 快照比对）+ 落盘 + 通知订阅者
function commit(next: Store): void {
  store = next;
  persist();
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT));
}

function clone(): Store {
  return Object.assign(emptyStore(), ensure());
}

/** 赞 +1（累加制）。同一技能可反复点击，计数递增，用以表达「它对我有多有用」。 */
export function castVote(name: string): void {
  const cur = ensure()[name];
  const up = (cur ? cur.up : 0) + 1;
  const out = clone();
  out[name] = { up };
  commit(out);
  track("vote", { skill: name, dir: "up", total: up });
}

/** 撤销该技能的全部赞（up 归零）。未投过赞时为空操作。 */
export function clearVote(name: string): void {
  if (!ensure()[name]) return;
  const out = clone();
  delete out[name];
  commit(out);
  track("vote_clear", { skill: name });
}

/** 已赞技能清单（导出上报用）：按累计降序、技能名升序。 */
export function listVoted(): { name: string; up: number }[] {
  return Object.entries(ensure())
    .map(([name, v]) => ({ name, up: v.up }))
    .filter((x) => x.up > 0)
    .sort((a, b) => b.up - a.up || a.name.localeCompare(b.name));
}

/** 生成上报文本（Markdown），供用户贴到仓库的投票汇总 Issue，构建期由 build-votes.mjs 解析。 */
export function formatVoteReport(voted: { name: string; up: number }[] = listVoted()): string {
  if (!voted.length) return "";
  const sum = voted.reduce((s, v) => s + v.up, 0);
  return [
    "<!-- agent-skills-hub:vote-report -->",
    `赞反馈：${voted.length} 个技能，合计 ${sum} 赞`,
    "",
    ...voted.map((v) => `- \`${v.name}\` × ${v.up}`),
  ].join("\n");
}

/** 订阅单个技能的计数：仅该技能数值变化时，本卡片才重渲 */
export function useVotesFor(name: string): Counts {
  return useSyncExternalStore(
    subscribe,
    () => ensure()[name] || EMPTY,
    () => EMPTY
  );
}

/** 订阅已赞技能数（导出按钮的可用态/计数）：SSR 返回 0，避免水合不一致 */
export function useVotedCount(): number {
  return useSyncExternalStore(
    subscribe,
    () => listVoted().length,
    () => 0
  );
}
