// src/components/SkillsExplorer.hash.ts v1.14.89 — URL hash 深链序列化（与原型 05-main.js writeHash/parseHash 对齐）
// 使 app 筛选/搜索/排序/页码可分享、刷新可还原，且与原型深链链接互认。
// 分类为单选，故 cat 只有一个值（空串 = 全部）。
export const SORTS = ["name", "name-desc", "cat", "zh"] as const;
export type SortKey = (typeof SORTS)[number];

export type HashState = { cat: string; q: string; sort: SortKey; page: number };

// 深链参数解码（安全降级）：writeHash 写入时经 encodeURIComponent 编码，URLSearchParams 解析时会先解码一次，
// 因此 parseHash 需二次 decodeURIComponent 还原；但若 hash 含孤立 %（如用户搜索 "50%" 写入 #q=50%25，
// URLSearchParams 已解码为 "50%"），二次解码会抛 URIError 导致应用崩溃。解码失败时保留原始值，不中断深链还原。
function safeDecode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export function writeHash(s: HashState): void {
  if (typeof window === "undefined") return;
  const parts: string[] = [];
  if (s.cat) parts.push("cat=" + encodeURIComponent(s.cat));
  if (s.q.trim()) parts.push("q=" + encodeURIComponent(s.q.trim()));
  if (s.sort !== "name") parts.push("sort=" + encodeURIComponent(s.sort));
  if (s.page > 0) parts.push("page=" + s.page);
  const h = parts.length ? "#" + parts.join("&") : "";
  if (window.location.hash !== h) {
    history.replaceState(null, "", h || window.location.pathname + window.location.search);
  }
}

export function parseHash(): Partial<HashState> {
  if (typeof window === "undefined") return {};
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return {};
  const p = new URLSearchParams(raw);
  const out: Partial<HashState> = {};
  if (p.has("cat")) {
    // 单选：仅取一个分类；兼容旧版多选链接（#cat=a,b），取第一个有效值
    const cat = p.get("cat")!.split(",").map((c) => safeDecode(c)).filter(Boolean)[0];
    if (cat) out.cat = cat;
  }
  if (p.has("q")) out.q = safeDecode(p.get("q")!);
  if (p.has("sort")) {
    const sort = p.get("sort")!;
    if ((SORTS as readonly string[]).includes(sort)) out.sort = sort as SortKey;
  }
  if (p.has("page")) {
    const pg = parseInt(p.get("page")!, 10);
    if (!Number.isNaN(pg) && pg > 0) out.page = pg;
  }
  return out;
}
