// app/components/settings-panel.tsx v1.20.7 — 设置面板（界面元素显隐 + 名称显示策略 + 显示密度）
import type { Lang } from "../lib/share";

/** 设置面板：受控展示组件，state 由父组件持有 */
export function SettingsPanel({
  lang,
  showDesc,
  showCat,
  showBar,
  nameMode,
  density,
  onShowDesc,
  onShowCat,
  onShowBar,
  onNameMode,
  onDensity,
  onClose,
}: {
  lang: Lang;
  showDesc: boolean;
  showCat: boolean;
  showBar: boolean;
  nameMode: "both" | "zh" | "en";
  density: "comfortable" | "compact";
  onShowDesc: (v: boolean) => void;
  onShowCat: (v: boolean) => void;
  onShowBar: (v: boolean) => void;
  onNameMode: (m: "both" | "zh" | "en") => void;
  onDensity: (d: "comfortable" | "compact") => void;
  onClose: () => void;
}) {
  return (
    <div id="settingsPanel" className="settings-panel" role="dialog" aria-label={lang === "zh" ? "设置" : "Settings"}>
      <div className="settings-section">
        <h3>{lang === "zh" ? "界面元素" : "UI elements"}</h3>
        <label className="settings-row">
          <span>{lang === "zh" ? "显示技能描述" : "Show skill description"}</span>
          <input type="checkbox" checked={showDesc} onChange={(e) => onShowDesc(e.target.checked)} />
        </label>
        <label className="settings-row">
          <span>{lang === "zh" ? "显示分类标签" : "Show category label"}</span>
          <input type="checkbox" checked={showCat} onChange={(e) => onShowCat(e.target.checked)} />
        </label>
        <label className="settings-row">
          <span>{lang === "zh" ? "显示分类色条" : "Show category color bar"}</span>
          <input type="checkbox" checked={showBar} onChange={(e) => onShowBar(e.target.checked)} />
        </label>
      </div>
      <div className="settings-section">
        <h3>{lang === "zh" ? "名称显示" : "Name display"}</h3>
        <div className="seg" role="group" aria-label={lang === "zh" ? "名称显示" : "Name display"}>
          <button
            type="button"
            className={`seg-btn${nameMode === "both" ? " active" : ""}`}
            aria-pressed={nameMode === "both"}
            onClick={() => onNameMode("both")}
          >
            {lang === "zh" ? "双显" : "Both"}
          </button>
          <button
            type="button"
            className={`seg-btn${nameMode === "zh" ? " active" : ""}`}
            aria-pressed={nameMode === "zh"}
            onClick={() => onNameMode("zh")}
          >
            {lang === "zh" ? "仅中文" : "Chinese"}
          </button>
          <button
            type="button"
            className={`seg-btn${nameMode === "en" ? " active" : ""}`}
            aria-pressed={nameMode === "en"}
            onClick={() => onNameMode("en")}
          >
            {lang === "zh" ? "仅英文" : "English"}
          </button>
        </div>
      </div>
      <div className="settings-section">
        <h3>{lang === "zh" ? "显示密度" : "Density"}</h3>
        <div className="seg" role="group" aria-label={lang === "zh" ? "显示密度" : "Density"}>
          <button
            type="button"
            className={`seg-btn${density === "comfortable" ? " active" : ""}`}
            aria-pressed={density === "comfortable"}
            onClick={() => onDensity("comfortable")}
          >
            {lang === "zh" ? "舒适" : "Comfortable"}
          </button>
          <button
            type="button"
            className={`seg-btn${density === "compact" ? " active" : ""}`}
            aria-pressed={density === "compact"}
            onClick={() => onDensity("compact")}
          >
            {lang === "zh" ? "紧凑" : "Compact"}
          </button>
        </div>
      </div>
      <button className="btn btn-primary" onClick={onClose}>
        {lang === "zh" ? "完成" : "Done"}
      </button>
    </div>
  );
}
