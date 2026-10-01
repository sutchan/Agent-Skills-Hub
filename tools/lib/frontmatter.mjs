// tools/lib/frontmatter.mjs — 手写 YAML frontmatter 解析（共享）
//
// 原内联于 build-skills-data.mjs 的解析逻辑在此统一定义，供 build-skills-data.mjs
// 与各 fix-* 脚本统一引用，消除解析漂移。行为与原实现完全一致：
//   支持纯量、引号，以及折叠（> / >-）与字面量（| / |-）块标量；
//   折叠标量段内换行折叠为空格、空行分隔段落保留换行；
//   字面量标量保留所有换行；顶层嵌套块（有缩进）整体跳过。

// YAML 折叠/字面量块标量标志（行内为空值或仅折叠符）
export const BLOCK_SCALAR = /^(?:[>|])-?$/;

// 行内值在保留时去除的 YAML 注释（仅当注释前为空格/行首，忽略引号内的井号）
export function stripInlineComment(v) {
  const out = [];
  let inS = false;
  let inD = false;
  for (let i = 0; i < v.length; i++) {
    const c = v[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (c === "#" && !inS && !inD && (i === 0 || v[i - 1] === " ")) break;
    out.push(c);
  }
  return out.join("").trim();
}

// 解析 frontmatter：支持纯量、引号、以及折叠（> / >-）与字面量（| / |-）块标量。
// 块标量内容取后续缩进行；折叠标量段内换行折叠为空格、空行分隔的段落保留换行，
// 字面量标量保留所有换行——便于多段中文描述（zh-desc）在产物/展示中正确换行。
export function parseFrontmatter(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  const fm = {};
  if (!m) return fm;
  const lines = m[1].split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const idx = line.indexOf(":");
    // 仅处理顶层键（行首无缩进）；嵌套块（有缩进）整体跳过
    if (idx === -1 || line.startsWith(" ")) {
      i++;
      continue;
    }
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // 若是块标量标志，读取后续缩进行
    if (BLOCK_SCALAR.test(val)) {
      const literal = val.startsWith("|"); // | 字面量保留换行；> 折叠按空行分段
      i++;
      const block = [];
      while (i < lines.length && (lines[i].trim() === "" || lines[i].startsWith(" "))) {
        block.push(lines[i]);
        i++;
      }
      // 行内首尾空格归一，过滤头部连续空行
      const norm = block
        .map((l) => l.replace(/^\s+/, "").replace(/\s+$/, ""))
        .filter((l, j, arr) => !(l === "" && (j === 0 || arr[j - 1] === "")));
      if (literal) {
        // 字面量：保留换行，折叠连续空行
        fm[key] = norm.filter((l, j, arr) => !(l === "" && arr[j + 1] === "")).join("\n").trim();
      } else {
        // 折叠标量：段内（连续非空行）以空格连接；空行视为段落分隔 → 换行
        const paras = [];
        let cur = [];
        for (const l of norm) {
          if (l === "") { if (cur.length) { paras.push(cur.join(" ")); cur = []; } }
          else cur.push(l);
        }
        if (cur.length) paras.push(cur.join(" "));
        fm[key] = paras.join("\n").trim();
      }
      continue;
    }
    // 普通纯量 / 引号（顶层键，无后续缩进子块）
    val = stripInlineComment(val).replace(/^["']|["']$/g, "");
    fm[key] = val;
    i++;
  }
  return fm;
}
