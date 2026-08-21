// app/components/ui/skeleton.tsx v1.14.72 — 骨架屏原语（对齐 COMPONENTS #5 与 prototype .skeleton）
import type { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ width, height = 16, className = "", style, ...rest }: Props) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}
