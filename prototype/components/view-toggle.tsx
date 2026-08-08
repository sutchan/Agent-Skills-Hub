// prototype/components/view-toggle.tsx — 1.7.0
"use client";

import { LayoutGrid, Rows3 } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type View = "grid" | "list";

// 视图切换：grid 多列卡片 / list 单列横向（仅改布局，不影响过滤）
export function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <div
      role="group"
      aria-label="视图切换"
      className="inline-flex h-10 items-center rounded-md bg-muted p-1"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange("grid")}
        aria-pressed={view === "grid"}
        aria-label="网格视图"
        className={cn(
          "h-8 w-8",
          view === "grid" && "bg-background shadow-xs hover:bg-background"
        )}
      >
        <LayoutGrid />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange("list")}
        aria-pressed={view === "list"}
        aria-label="列表视图"
        className={cn(
          "h-8 w-8",
          view === "list" && "bg-background shadow-xs hover:bg-background"
        )}
      >
        <Rows3 />
      </Button>
    </div>
  );
}
