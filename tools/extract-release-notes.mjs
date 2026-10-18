// tools/extract-release-notes.mjs v1.0.0
// 用法：node tools/extract-release-notes.mjs <version> <changelog.md> <out.md>
// 从 CHANGELOG 提取指定版本（## [x.y.z] 或 ## x.y.z）的整个小节，写入 out.md 作为 Release 说明。
import { readFileSync, writeFileSync } from 'node:fs';

const [, , version, changelogPath, outPath] = process.argv;
if (!version || !changelogPath || !outPath) {
  console.error('用法：node tools/extract-release-notes.mjs <version> <changelog.md> <out.md>');
  process.exit(1);
}

const changelog = readFileSync(changelogPath, 'utf8');
const lines = changelog.split(/\r?\n/);

// 定位目标版本小节（容忍 [x.y.z] 与 x.y.z 两种写法）
const escaped = version.replace(/\./g, '\\.');
const startRe = new RegExp(`^##\\s+\\[?v?${escaped}\\]?`);
let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (startRe.test(lines[i])) {
    startIdx = i;
    break;
  }
}
if (startIdx === -1) {
  console.error(`✗ CHANGELOG 未找到版本 ${version} 的小节`);
  process.exit(1);
}

// 截取到下一个同级 ## 小节或文件结尾
let endIdx = lines.length;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (/^##\s+/.test(lines[i])) {
    endIdx = i;
    break;
  }
}

const section = lines.slice(startIdx, endIdx).join('\n').trimEnd() + '\n';
writeFileSync(outPath, section);
console.log(`✓ 已提取 ${version} 发行说明 → ${outPath}`);
