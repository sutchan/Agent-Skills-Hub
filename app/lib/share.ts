// app/lib/share.ts v1.20.57 — 分享逻辑与项目宣传文案
// 文案集合与 prototype/src/i18n.js 的 share.promos 保持逐字一致（openspec §4.5.4.3：
// 两层复用同一文案集合，避免漂移）。原型 i18n.js 为权威来源，本文件与其同步。

export type Lang = "zh" | "en";

/** 项目宣传文案：中/英各 ≥3 条，复制时随机取 1 条（openspec §4.5.4.2）。
 *  文案与 prototype/src/i18n.js 的 share.promos 逐字对齐，{n} 由 buildShareText 注入真实技能总数，
 *  品牌名统一为 Agent Skills Hub（与 app/layout.tsx metadata、原型 title 一致）。 */
export const SHARE_PROMOS: Record<Lang, string[]> = {
  zh: [
    "😎 我在 Agent Skills Hub 发现了超好用的 AI 技能库，{n} 高质量技能免费收藏，直接丢进你的编程 Agent 就能用！",
    "🚀 Agent Skills Hub：{n} 精选 Agent 技能，按分类浏览、搜索、看详情，提升你的 AI 编码效率。",
    "💡 想让你的 Coding Agent 更强？来 Agent Skills Hub 逛逛，{n} 技能即插即用，开源免费！",
  ],
  en: [
    "😎 I found Agent Skills Hub — a library of {n} high-quality AI agent skills you can drop straight into your coding agent. Free & open source!",
    "🚀 Agent Skills Hub: {n} curated agent skills. Browse by category, search, inspect details — boost your AI coding workflow.",
    "💡 Want a stronger coding agent? Explore Agent Skills Hub: {n} plug-and-play skills, open source and free!",
  ],
};

/** 反馈文案，与 prototype i18n.js 的 share.copied / share.failed 对齐 */
export const SHARE_FEEDBACK: Record<Lang, { ok: string; fail: string; btn: string }> = {
  zh: { ok: "已复制到剪贴板", fail: "复制失败，请手动复制", btn: "分享技能" },
  en: { ok: "Copied to clipboard", fail: "Copy failed, please copy manually", btn: "Share skill" },
};

/**
 * 构造分享文本：技能展示页链接 + 随机宣传文案（二者以空行分隔）。
 * 链接优先基于部署站点 origin（openspec §4.5.4.4：优先 location.origin），
 * 仅当无 origin（SSR/非浏览器）时回退 GitHub 源码 tree，保证跨部署稳定。
 */
export function buildShareText(
  name: string,
  lang: Lang,
  total = 0,
  origin?: string
): string {
  const slug = encodeURIComponent(name);
  const link = origin
    ? `${origin}/skills/${slug}/`
    : `https://github.com/sutchan/Agent-Skills-Hub/tree/main/skills/${slug}/`;
  const promos = SHARE_PROMOS[lang] ?? SHARE_PROMOS.zh;
  const promo = promos.length
    ? promos[Math.floor(Math.random() * promos.length)].replace("{n}", String(total))
    : "";
  return `${link}\n\n${promo}`;
}

/** 复制技能分享文案到剪贴板：组合链接 + 宣传文案后复制，返回是否成功。
 *  供 SkillDetail 直接调用，文案与 prototype 03-detail.js 的 share 逻辑一致。
 *  origin 优先传 window.location.origin，使分享链接基于部署站点（openspec §4.5.4.4）。 */
export async function copySkillShare(
  skill: { name: string },
  lang: Lang,
  total = 0,
  origin?: string
): Promise<boolean> {
  const text = buildShareText(skill.name, lang, total, origin);
  return copyShareText(text);
}

/** 仓库根地址：页脚 Star 引导与分享仓库文案复用 */
export const REPO_URL = "https://github.com/sutchan/Agent-Skills-Hub";

/** 构造「分享仓库」文本：随机宣传文案（含 {n} 技能总数）+ 当前页面 URL（二者以空行分隔）。
 *  优先分享 location.href（含 P0-1 的 hash 筛选深链，如 #cat=docs&q=xxx），回退 REPO_URL，
 *  与 prototype 04-interactions.js 的 shareRepo 对齐。*/
export function buildRepoShareText(lang: Lang, total = 0): string {
  const promos = SHARE_PROMOS[lang] ?? SHARE_PROMOS.zh;
  const promo = promos.length
    ? promos[Math.floor(Math.random() * promos.length)].replace("{n}", String(total))
    : "";
  const url = (typeof window !== "undefined" && window.location?.href) ? window.location.href : REPO_URL;
  return `${promo}\n${url}`;
}

/** 复制仓库分享文案到剪贴板，返回是否成功（供页脚分享按钮调用） */
export async function copyRepoShare(lang: Lang, total = 0): Promise<boolean> {
  return copyShareText(buildRepoShareText(lang, total));
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
