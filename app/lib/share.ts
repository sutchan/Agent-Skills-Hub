// app/lib/share.ts v1.1.1 — 分享逻辑与项目宣传文案
// 文案集合与 prototype/src/i18n.js 的 share.* 保持一致（openspec §4.5.4.3：
// 两层复用同一文案集合，避免漂移）。本文件为 app 层单一真实来源。

export type Lang = "zh" | "en";

/** 项目宣传文案：中/英各 ≥3 条，复制时随机取 1 条（openspec §4.5.4.2）。
 *  文案与 prototype/src/i18n.js 的 share.promos 逐字对齐，{n} 由 buildShareText 注入真实技能总数，
 *  避免两层文案漂移与硬编码数量（openspec §4.5.4.3）。 */
export const SHARE_PROMOS: Record<Lang, string[]> = {
  zh: [
    "🚀 Agent-Skills-Hub：汇聚 {n} 个精品 agent 技能，一键直达官方仓库，让你的 AI 助手即插即用。",
    "💡 想给 AI 加新能力？来 Agent-Skills-Hub，{n} 个技能覆盖开发、写作、设计，开箱即用。",
    "🧩 {n} 个精选 skill，覆盖主流场景——Agent-Skills-Hub 让 AI 能力像积木一样拼装。",
  ],
  en: [
    "🚀 Agent-Skills-Hub: {n} curated agent skills, one-click to the official repo, plug & play for your AI assistant.",
    "💡 Want new powers for your AI? Agent-Skills-Hub has {n} skills for dev, writing & design — ready to use.",
    "🧩 {n} hand-picked skills across scenarios — Agent-Skills-Hub lets you snap AI capabilities together like blocks.",
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
