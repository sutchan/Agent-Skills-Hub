// prototype/components/lang-toggle.tsx — 1.7.0
"use client";

import { cn } from "@/lib/utils";

type Lang = "zh" | "en";

// 中英语言切换：受控组件，状态提升到父级
export function LangToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div
      role="group"
      aria-label="语言切换"
      className="inline-flex h-10 items-center rounded-md bg-muted p-1"
    >
      {(["zh", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          aria-pressed={lang === l}
          className={cn(
            "inline-flex h-8 items-center rounded-sm px-3 text-sm font-medium transition-all duration-200 ease-out-quint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            lang === l
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l === "zh" ? "中文" : "EN"}
        </button>
      ))}
    </div>
  );
}
