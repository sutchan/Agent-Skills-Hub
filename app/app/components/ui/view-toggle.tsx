// app/components/ui/view-toggle.tsx v1.18.0 — 视图切换 网格/列表（对齐 prototype .view-toggle）
interface Props {
  view: "grid" | "list";
  onChange: (v: "grid" | "list") => void;
}

export function ViewToggle({ view, onChange }: Props) {
  return (
    <div id="viewToggle" className="view-toggle" role="group" aria-label="View">
      <button
        type="button"
        className={view === "grid" ? "active" : ""}
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        title="网格"
      >
        ▦
      </button>
      <button
        type="button"
        className={view === "list" ? "active" : ""}
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        title="列表"
      >
        ☰
      </button>
    </div>
  );
}
