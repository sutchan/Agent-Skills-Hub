// app/lib/share.ts v1.1.3 — 分享逻辑与项目宣传文案
// 文案集合与 prototype/src/i18n.js 的 share.promos 保持逐字一致（openspec §4.5.4.3：
// 两层复用同一文案集合，避免漂移）。原型 i18n.js 为权威来源，本文件与其同步。

export type Lang = "zh" | "en";

/** 项目宣传文案：中/英各 ≥3 条，复制时随机取 1 条（openspec §4.5.4.2）。
 *  文案与 prototype/src/i18n.js 的 share.promos 逐字对齐，{n} 由 buildShareText 注入真实技能总数，
 *  品牌名统一为 Agent Skills Hub（与 app/layout.tsx metadata、原型 title 一致）。 */
export const SHARE_PROMOS: Record<Lang, string[]> = {
  zh: [
    "😎 我在 Agent Skills Hub 发现了超好用的 AI 技能库，{n} 高质量技能免费收藏，即取即用！",
    "🚀 Agent Skills Hub：{n} 精选 Agent 技能，按分类浏览、搜索、查看详情，提升你的 AI 编码工作流。",
    "💡 想让你的 Coding Agent 更强？来看看 Agent Skills Hub：{n} 个即插即用的技能，开源免费！",
  ],
  en: [
    "😎 I found Agent Skills Hub — a library of {n} high-quality AI agent skills you can drop straight into your coding agent. Free & open source!",
    "🚀 Agent Skills Hub: {n} curated agent skills. Browse by category, search, inspect details — boost your AI coding workflow.",
    "💡 Want a stronger coding agent? Explore Agent Skills Hub: {n} plug-and-play skills, open source and free!",
  ],
};

/** 反馈文案，与 prototype i18n.js 的 share.copied / share.failed 对齐 */
export const SHARE_FEEDBACK: Record<Lang, { ok: string; fail: string; btn: string }> = {
  zh: { ok: "已复制链接与宣传文案", fail: "复制失败，请手动复制", btn: "分享" },
  en: { ok: "Link & promo copied", fail: "Copy failed, please copy manually", btn: "Share" },
};

/**
 * 构造分享文本：技能分析链接 + 随机宣传文案（二者以空行分隔）。
 * 链接 = 站点根 + skills/<name>/（部署后带域名，离线回退相对路径）。
 */
export function buildShareText(
  name: string,
  lang: Lang,
  total = 0,
  origin?: string,
  basePath?: string
): string {
  let link = `skills/${name}/`;
  if (typeof window !== "undefined") {
    const root = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
    link = window.location.origin + root + `/skills/${name}/`;
  } else if (origin) {
    const root = (basePath ?? "").replace(/\/$/, "");
    link = `${origin}${root}/skills/${name}/`;
  }
  const promos = SHARE_PROMOS[lang] ?? SHARE_PROMOS.zh;
  const promo = promos.length
    ? promos[Math.floor(Math.random() * promos.length)].replace("{n}", String(total))
    : "";
  return `${link}\n\n${promo}`;
}

/** 复制文本到剪贴板：优先 Clipboard API，失败降级 execCommand（openspec §4.5.4.5） */
export async function copyShareText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 降级到 execCommand */
  }
  if (typeof document === "undefined") return false;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
