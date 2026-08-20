// app/components/ui/button.tsx v1.14.72 — 按钮原语（对齐 COMPONENTS #1 与 prototype .btn）
// 视觉由 globals.css 的 .btn / .btn-primary / .btn-ghost / .btn-secondary 驱动。
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "secondary" | "outline";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn btn-primary",
  ghost: "btn btn-ghost",
  secondary: "btn btn-secondary",
  outline: "btn btn-outline",
};

export function Button({ variant = "ghost", className = "", children, ...rest }: Props) {
  return (
    <button className={`${VARIANT_CLASS[variant]} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
