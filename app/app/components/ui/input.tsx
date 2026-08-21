// app/components/ui/input.tsx v1.18.0 — 搜索输入框（对齐 prototype .search 结构）
// 渲染 .search 包裹 .icon + input，样式由 globals.css 的 prototype .search 规则驱动。
import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
}

export function Input({ className = "", icon = "⌕", ...rest }: Props) {
  return (
    <div className={`search ${className}`.trim()}>
      <span className="icon" aria-hidden="true">{icon}</span>
      <input {...rest} />
    </div>
  );
}
