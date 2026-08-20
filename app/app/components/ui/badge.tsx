// app/components/ui/badge.tsx v1.14.72 — 徽章原语（对齐 COMPONENTS #4 与 prototype .badge）
import type { HTMLAttributes, ReactNode } from "react";

type Variant = "default" | "secondary" | "muted" | "outline";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANT_CLASS: Record<Variant, string> = {
  default: "badge",
  secondary: "badge secondary",
  muted: "badge muted",
  outline: "badge outline",
};

export function Badge({ variant = "default", className = "", children, ...rest }: Props) {
  return (
    <span className={`${VARIANT_CLASS[variant]} ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}
