// app/lib/hash-state.ts v1.0.0 — URL hash 深链状态编解码（纯函数，可单测）
// 与原型 05-main.js 的 writeHash/parseHash 对齐（相同序列格式 #cat=a,b&q=x&sort=name&page=2）。
// @note 修复：parseHash 不再对 URLSearchParams 已解码的值二次 decodeURIComponent。
// URLSearchParams 解析时已还原百分号编码，若值含字面 %（如搜索 "100%"），
// 二次解码会抛 URIError "URI malformed"，导致挂载/回退时整页进入错误边界（app/error.tsx）。

export const SORTS = ["name", "name-desc", "cat", "zh"] as const;

export type HashState = {
  cats: string[];
  q: string;
  sort: typeof SORTS[number];
  page: number;
};

/** 由筛选状态生成 hash 字符串（#cat=...&q=...&sort=...&page=...），空状态返回 ""。 */
export function writeHash(s: HashState): string {
  const parts: string[] = [];
  if (s.cats.length) parts.push("cat=" + encodeURIComponent(s.cats.join(",")));
  if (s.q.trim()) parts.push("q=" + encodeURIComponent(s.q.trim()));
  if (s.sort !== "name") parts.push("sort=" + encodeURIComponent(s.sort));
  if (s.page > 0) parts.push("page=" + s.page);
  return parts.length ? "#" + parts.join("&") : "";
}

/** 解析 hash 字符串（可含前导 #）。URLSearchParams 已解码百分号编码，直接取值，不再二次解码。 */
export function parseHash(raw: string): Partial<HashState> {
  if (!raw) return {};
  const p = new URLSearchParams(raw.replace(/^#/, ""));
  const out: Partial<HashState> = {};
  if (p.has("cat")) {
    const cats = p.get("cat")!.split(",").filter(Boolean);
    if (cats.length) out.cats = cats;
  }
  if (p.has("q")) out.q = p.get("q")!;
  if (p.has("sort")) {
    const sort = p.get("sort")!;
    if ((SORTS as readonly string[]).includes(sort)) out.sort = sort as typeof SORTS[number];
  }
  if (p.has("page")) {
    const pg = parseInt(p.get("page")!, 10);
    if (!Number.isNaN(pg) && pg > 0) out.page = pg;
  }
  return out;
}
