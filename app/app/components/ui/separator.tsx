// app/components/ui/separator.tsx v1.14.72 — 分隔线原语（对齐 COMPONENTS #6 与 prototype .separator）
import type { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({ orientation = "horizontal", className = "", ...rest }: Props) {
  return (
    <hr
      className={`separator ${orientation === "vertical" ? "v" : ""} ${className}`.trim()}
      {...rest}
    />
  );
}
