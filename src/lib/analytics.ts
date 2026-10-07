// src/lib/analytics.ts v1.14.85 — GA4 统计事件上报（app 侧共享单一来源）
// 对齐 prototype 01-state.js track：仅当 gtag 已注入时上报，否则静默失败。
// v1.14.85：从 AppShell.tsx 内的私有函数抽为共享模块，供 votes.ts 复用
//（此前 app 侧只有 star_click 能上报，投票事件仅存在于原型，真实部署等于无数据）。
export function track(event: string, params?: Record<string, unknown>): void {
  try {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      gtag?: (e: string, n: string, p?: object) => void;
    };
    if (typeof w.gtag === "function") w.gtag("event", event, params || {});
  } catch {
    /* 统计失败不影响主流程 */
  }
}