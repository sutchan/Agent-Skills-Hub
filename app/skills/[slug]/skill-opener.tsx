// app/skills/[slug]/skill-opener.tsx v1.0.0 — 分享深链页：挂载后自动打开对应技能详情弹窗
// 复用 SkillsExplorer 已注册的 ash:open-skill 监听（与 Hero 骰子同一通道），零改动打开详情。
"use client";
import { useEffect } from "react";

export function SkillOpener({ name }: { name: string }) {
  useEffect(() => {
    // 延迟到当前 commit 的 mount effect 全部执行后再派发，确保 SkillsExplorer 的监听已注册。
    const t = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("ash:open-skill", { detail: { name } }));
    }, 0);
    return () => window.clearTimeout(t);
  }, [name]);
  return null;
}
