// app/components/ui/settings-dialog.tsx v1.18.0 — 设置弹窗（对齐 prototype 03-detail.js openSettings）
// 聚合语言 / 主题 / 视图 / 密度四组切换；复用 Dialog 原语（Esc/遮罩/焦点陷阱/滚动锁定）。
// 值由 AppShell 持有并持久化（ash-lang / ash-theme / ash-view / ash-density），本组件仅触发回调就地刷新。
import { Dialog } from "./dialog";
import { t } from "@/lib/i18n";

interface Props {
  open: boolean;
  lang: "zh" | "en";
  dark: boolean;
  density: "comfortable" | "compact";
  view: "grid" | "list";
  onLang: () => void;
  onTheme: () => void;
  onView: () => void;
  onDensity: () => void;
  onClose: () => void;
}

export function SettingsDialog({ open, lang, dark, density, view, onLang, onTheme, onView, onDensity, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="settingsTitle">
      <div className="dialog-head" id="dialogHead">
        <h2 id="settingsTitle" className="dialog-title">{t(lang, "settings.title")}</h2>
        <button type="button" className="icon-btn dialog-close" aria-label={t(lang, "settings.done")} onClick={onClose}>✕</button>
      </div>
      <div className="dialog-body" id="dialogBody">
        <section className="block">
          <h3>{t(lang, "settings.langGroup")}</h3>
          <div className="settings-row">
            <span className="settings-label">{t(lang, "settings.language")}</span>
            <button type="button" className="btn btn-outline" aria-pressed={lang === "en"} onClick={onLang}>
              {lang === "zh" ? t(lang, "settings.langZh") : t(lang, "settings.langEn")}
            </button>
          </div>
        </section>
        <section className="block">
          <h3>{t(lang, "settings.themeGroup")}</h3>
          <div className="settings-row">
            <span className="settings-label">{t(lang, "settings.theme")}</span>
            <button type="button" className="btn btn-outline" aria-pressed={dark} onClick={onTheme}>
              {dark ? t(lang, "settings.themeDark") : t(lang, "settings.themeLight")}
            </button>
          </div>
        </section>
        <section className="block">
          <h3>{t(lang, "settings.viewGroup")}</h3>
          <div className="settings-row">
            <span className="settings-label">{t(lang, "settings.view")}</span>
            <button type="button" className="btn btn-outline" aria-pressed={view === "list"} onClick={onView}>
              {view === "list" ? t(lang, "settings.viewList") : t(lang, "settings.viewGrid")}
            </button>
          </div>
        </section>
        <section className="block">
          <h3>{t(lang, "settings.densityGroup")}</h3>
          <div className="settings-row">
            <span className="settings-label">{t(lang, "settings.density")}</span>
            <button type="button" className="btn btn-outline" aria-pressed={density === "compact"} onClick={onDensity}>
              {density === "compact" ? t(lang, "settings.densityCompact") : t(lang, "settings.densityComfortable")}
            </button>
          </div>
        </section>
      </div>
      <div className="dialog-foot" id="dialogFoot">
        <button type="button" className="btn btn-primary" onClick={onClose}>{t(lang, "settings.done")}</button>
      </div>
    </Dialog>
  );
}
