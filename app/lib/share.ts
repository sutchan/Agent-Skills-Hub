// app/lib/share.ts v1.1.0 — 分享逻辑与项目宣传文案
// 文案集合与 prototype/src/i18n.js 的 share.* 保持一致（openspec §4.5.4.3：
// 两层复用同一文案集合，避免漂移）。本文件为 app 层单一真实来源。

export type Lang = "zh" | "en";

/** 项目宣传文案：中/英各 ≥3 条，复制时随机取 1 条（openspec §4.5.4.2） */
export const SHARE_PROMOS: Record<Lang, string[]> = {
  zh: [
    "😎 我在 Agent Skills Hub 发现了超好用的 AI 技能库，200+ 高质量技能免费收藏，直接丢进你的编程 Agent 就能用！",
    "🚀 Agent Skills Hub：200+ 精选 Agent 技能，按分类浏览、搜索、看详情，提升你的 AI 编码效率。",
    "💡 想让你的 Coding Agent 更强？来 Agent Skills Hub 逛逛，200+ 技能即插即用，开源免费！",
  ],
  en: [
    "😎 I found Agent Skills Hub — a library of 200+ high-quality AI agent skills you can drop straight into your coding agent. Free & open source!",
    "🚀 Agent Skills Hub: 200+ curated agent skills. Browse by category, search, inspect details — boost your AI coding workflow.",
    "💡 Want a stronger coding agent? Explore Agent Skills Hub: 200+ plug-and-play skills, open source and free!",
  ],
};

/** 反馈文案，与 prototype i18n.js 的 share.copyOk / share.copyFail 对齐 */
export const SHARE_FEEDBACK: Record<Lang, { ok: string; fail: string; btn: string }> = {
  zh: { ok: "已复制链接与宣传文案", fail: "复制失败，请手动复制", btn: "分享" },
  en: { ok: "Link & promo copied", fail: "Copy failed, please copy manually", btn: "Share" },
};

/**
 * 构造分享文本：技能分析链接 + 随机宣传文案（二者以空行分隔）。
 * 链接 = 站点根 + skills/<name>/（部署后带域名，离线回退相对路径）。
 */
export function buildShareText(name: string, lang: Lang, origin?: string, basePath?: string): string {
  let link = `skills/${name}/`;
  if (typeof window !== "undefined") {
    const root = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
    link = window.location.origin + root + `/skills/${name}/`;
  } else if (origin) {
    const root = (basePath ?? "").replace(/\/$/, "");
    link = `${origin}${root}/skills/${name}/`;
  }
  const promos = SHARE_PROMOS[lang] ?? SHARE_PROMOS.zh;
  const promo = promos.length ? promos[Math.floor(Math.random() * promos.length)] : "";
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
