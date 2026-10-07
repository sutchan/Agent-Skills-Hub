// app/components/pager.tsx v1.19.38 — 分页器（纯展示，页码窗口 + 上一页/下一页 + 信息）
import type { Lang } from "../lib/share";

/** 分页器：受控展示，goPage 由父组件实现（含滚动回顶） */
export function Pager({
  lang,
  totalPages,
  safePage,
  goPage,
}: {
  lang: Lang;
  totalPages: number;
  safePage: number;
  goPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pager show" id="pager" aria-label={lang === "zh" ? "分页" : "Pagination"}>
      <button
        type="button"
        className="pg-btn"
        disabled={safePage <= 0}
        aria-label={lang === "zh" ? "上一页" : "Previous"}
        onClick={() => goPage(Math.max(0, safePage - 1))}
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, p) => {
        const win = p === 0 || p === totalPages - 1 || Math.abs(p - safePage) <= 2;
        if (!win && p > 0 && p < totalPages - 1 && Math.abs(p - safePage) > 2) {
          if (p > 1 && p < totalPages - 2 && Math.abs(p - safePage) === 3) {
            return <span key={p} className="pg-ellipsis">…</span>;
          }
          return null;
        }
        return (
          <button
            key={p}
            type="button"
            className={`pg-btn num${p === safePage ? " active" : ""}`}
            aria-current={p === safePage ? "page" : "false"}
            onClick={() => goPage(p)}
          >
            {p + 1}
          </button>
        );
      })}
      <button
        type="button"
        className="pg-btn"
        disabled={safePage >= totalPages - 1}
        aria-label={lang === "zh" ? "下一页" : "Next"}
        onClick={() => goPage(Math.min(totalPages - 1, safePage + 1))}
      >
        ›
      </button>
      <span className="pg-info">
        {lang === "zh" ? `第 ${safePage + 1} / ${totalPages} 页` : `Page ${safePage + 1} / ${totalPages}`}
      </span>
    </nav>
  );
}
