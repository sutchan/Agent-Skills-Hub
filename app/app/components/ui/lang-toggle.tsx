// app/components/ui/lang-toggle.tsx v1.18.0 — 语言切换（对齐 COMPONENTS #12）
import { t } from "@/lib/i18n";

interface Props {
  lang: "zh" | "en";
  onToggle: () => void;
}

export function LangToggle({ lang, onToggle }: Props) {
  return (
    <button
      id="langBtn"
      type="button"
      className="btn btn-ghost icon-btn"
      aria-label={t(lang, "a11y.lang")}
      onClick={onToggle}
    >
      {lang === "zh" ? "EN" : "中"}
    </button>
  );
}
