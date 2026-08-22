// app/lib/analytics.ts v1.19.38 — GA4 事件上报工具
"use client";

/**
 * 统计事件上报：仅当页面已注入 GA（window.gtag 存在）时上报，否则静默。
 * 与 prototype 的 track() 语义一致，避免第三方脚本缺失时影响主流程。
 */
interface WindowWithGtag extends Window {
  gtag?: (...args: unknown[]) => void;
}

export function track(event: string, params?: Record<string, unknown>): void {
  try {
    const gtag = (window as WindowWithGtag).gtag;
    if (typeof gtag === "function") {
      gtag("event", event, params || {});
    }
  } catch {
    /* 统计失败不影响主流程 */
  }
}
