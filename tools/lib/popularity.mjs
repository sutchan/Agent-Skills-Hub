// tools/lib/popularity.mjs — 相关性热度（popularity）计算
// 被其他技能在 description/enDescription 中提及本技能名的次数（相关性代理）。
//
// 关键修正（v1.20.x）：原实现用 `hay.includes(name)` 子串匹配，会产生假阳性，
// 例如 "api" 误命中 "graphql-api"、"css" 误命中 "scss"、"react" 误命中 "reactor"。
// 现改为「词边界匹配」：名称前后均不是 单词字符([\w]) 或 连字符(-) 时才算命中，
// 即要求名称作为独立 token 出现，消除子串误判。

/** 转义正则特殊字符（名称可能含 . / - 等） */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\/-]/g, "\\$&");
}

/**
 * 构造名称的词边界正则：前后均非 单词字符 且 非连字符。
 * 例：namePattern("api") 不会匹配 "graphql-api" 中的 "api"（前有 -）。
 */
export function namePattern(name) {
  const esc = escapeRegex(name);
  return new RegExp(`(?<![\\w-])${esc}(?![\\w-])`, "i");
}

/**
 * 计算每个技能的 popularity。
 * @param {Array<{name:string, description?:string, enDescription?:string}>} skills
 * @returns {Record<string, number>} name -> 被提及次数
 */
export function computePopularity(skills) {
  // 预编译每个名称的正则，避免 O(n^2) 重复编译
  const patterns = skills.map((s) => ({ name: s.name, re: namePattern(s.name) }));
  const pop = {};
  for (const s of skills) {
    const hay = `${(s.description || "").toLowerCase()} ${(s.enDescription || "").toLowerCase()}`;
    let count = 0;
    for (const p of patterns) {
      if (p.name === s.name) continue; // 不计自身
      if (p.re.test(hay)) count++;
    }
    pop[s.name] = count;
  }
  return pop;
}
