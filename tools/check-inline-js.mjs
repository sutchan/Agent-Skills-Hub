// tools/check-inline-js.mjs v1.0.0
// 产物级校验：解析 src/index.html 中全部「内联」<script> 块，确保每条都能被 JS 引擎解析。
// 目的：CI 此前只做 tsc + 单测 + SKILL frontmatter + 版本一致性，从不校验最终产物的内联脚本，
// 导致语法错误的 src/index.html 能进入仓库并部署（见 1.16.7 CHANGELOG）。本脚本为最后一道闸门。
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const file = 'src/index.html';
const html = readFileSync(file, 'utf8');
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let m;
const blocks = [];
while ((m = re.exec(html))) {
  const attrs = m[1] || '';
  const body = m[2] || '';
  if (/\bsrc\s*=/.test(attrs)) continue; // 外部脚本跳过
  const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1] || '';
  const isJs = type === '' || /javascript|module/i.test(type);
  if (!isJs) continue; // JSON-LD 等跳过
  if (!body.trim()) continue;
  blocks.push({ body });
}

if (!blocks.length) {
  console.error(`✗ ${file} 中未发现任何内联 JS <script> 块`);
  process.exit(1);
}

let failed = 0;
blocks.forEach((b, i) => {
  try {
    new vm.Script(b.body, { filename: `${file}#script-${i + 1}` });
    console.log(`✓ script-${i + 1} (${b.body.length} 字节) 解析通过`);
  } catch (e) {
    failed++;
    console.error(`✗ script-${i + 1} 语法错误：${e.message}`);
    const first = (e.stack || '').split('\n')[0]?.trim();
    if (first) console.error(`    ${first}`);
  }
});

if (failed) {
  console.error(`\n✗ ${failed} 个内联脚本解析失败，产物不可用`);
  process.exit(1);
}
console.log(`\n✓ 产物级校验通过：${blocks.length} 个内联脚本全部可解析`);
