// app/components/useShare.ts v1.1.0 — 分享交互 Hook（复制 + toast）
"use client";

import { useCallback, useRef, useState } from "react";
import { buildShareText, copyShareText, SHARE_FEEDBACK, type Lang } from "../lib/share";

export interface ToastState {
  msg: string;
  isErr: boolean;
  show: boolean;
}

/** 分享交互：复制「技能链接+随机文案」并给出 toast 反馈（openspec §4.5.4） */
export function useShare(lang: Lang) {
  const [toast, setToast] = useState<ToastState>({ msg: "", isErr: false, show: false });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, isErr: boolean) => {
    setToast({ msg, isErr, show: true });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }, []);

  const shareSkill = useCallback(
    async (name: string) => {
      if (!name) return;
      const text = buildShareText(name, lang);
      const ok = await copyShareText(text);
      showToast(ok ? SHARE_FEEDBACK[lang].ok : SHARE_FEEDBACK[lang].fail, !ok);
    },
    [lang, showToast]
  );

  return { toast, shareSkill };
}
