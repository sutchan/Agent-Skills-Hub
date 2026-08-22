// app/lib/detail-helpers.ts v1.19.38 — 详情弹窗纯函数与复制逻辑（从 detail-modal.tsx 抽离）
import type { Lang } from "./share";

/** 字节数格式化：B / KB / MB（与 prototype 一致） */
export function formatSize(bytes?: number): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

/** 计算相关技能热度归一化的基准最大值 */
export function maxPopularity(skills: { popularity?: number }[]): number {
  return skills.reduce((m, s) => Math.max(m, s.popularity || 0), 0);
}

/** 复制文本到剪贴板并触发 #copyTip 轻提示（内联轻量版，避免引入额外依赖） */
export function copyText(text: string, lang: Lang): void {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      const tip = document.getElementById("copyTip");
      if (tip) {
        tip.textContent = lang === "zh" ? "已复制" : "Copied";
        tip.classList.add("show");
        setTimeout(() => tip.classList.remove("show"), 1400);
      }
    });
  }
}
