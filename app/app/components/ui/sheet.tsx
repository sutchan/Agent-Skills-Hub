// app/components/ui/sheet.tsx v1.14.72 — 抽屉原语（对齐 COMPONENTS #9 与 prototype .sheet）
// 移动端底部上滑抽屉；桌面端隐藏（由调用方按断点切换 Dialog/Sheet）。
import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
}

export function Sheet({ open, onClose, labelledBy, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
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
        className="sheet show"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        ref={ref}
      >
        <span className="sheet-grip" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
