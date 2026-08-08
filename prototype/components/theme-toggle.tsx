// prototype/components/theme-toggle.tsx — 1.7.0
"use client";

import * as React from "react";
import { Moon, Sun } from "@/components/icons";
import { Button } from "@/components/ui/button";

// 深浅主题切换：持久化到 localStorage，首屏由 layout 内联脚本防闪烁
export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("ash-theme", next ? "dark" : "light");
    } catch {
      /* 忽略隐私模式写入失败 */
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={dark ? "切换到浅色主题" : "切换到深色主题"}
      title={dark ? "浅色" : "深色"}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
