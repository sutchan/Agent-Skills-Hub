// app/components/ui/dialog.tsx v1.14.72 — 弹窗原语（对齐 COMPONENTS #8 与 prototype .overlay/.dialog）
// 提供遮罩、居中内容、焦点陷阱、ESC 关闭、滚动锁定与 ARIA 角色，供 SkillDetail 复用。
import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, labelledBy, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // 进入时把焦点移入弹窗，便于键盘与读屏用户
    ref.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        ref={ref}
      >
        {children}
      </div>
    </div>
  );
}
