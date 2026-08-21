// app/components/ui/theme-toggle.tsx v1.18.0 — 主题切换（对齐 COMPONENTS #11）
import { t } from "@/lib/i18n";

interface Props {
  theme: "light" | "dark";
  onToggle: () => void;
  lang: "zh" | "en";
}

export function ThemeToggle({ theme, onToggle, lang }: Props) {
  const isDark = theme === "dark";
  return (
    <button
      id="themeBtn"
      type="button"
      className="btn btn-ghost icon-btn"
      aria-label={t(lang, "a11y.theme")}
      aria-pressed={isDark}
      title={isDark ? "深色" : "浅色"}
      onClick={onToggle}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}
