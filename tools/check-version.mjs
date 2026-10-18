// tools/check-version.mjs v1.0.0
// 校验「package.json 版本 == CHANGELOG 最新小节版本 == (可选) git tag 版本」一致性。
// 不一致或缺失直接以非 0 退出，阻断 CI 发布流程。
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const pkgVersion = pkg.version;
if (!pkgVersion) {
  console.error('✗ package.json 缺少 version 字段');
  process.exit(1);
}

const changelog = readFileSync('CHANGELOG.md', 'utf8');
// 首个版本小节标题：## [1.14.96] - ... 或 ## 1.14.96
const headingMatch = changelog.match(/^##\s+\[?v?(\d+\.\d+\.\d+)\]?/m);
if (!headingMatch) {
  console.error('✗ CHANGELOG.md 未找到版本小节（## x.y.z）');
  process.exit(1);
}
const changelogVersion = headingMatch[1];

// git tag 版本：优先取 GITHUB_REF（refs/tags/v1.14.96），其次命令行参数
let tagVersion = null;
const ref = process.env.GITHUB_REF || '';
const tagMatch = ref.match(/^refs\/tags\/v?(\d+\.\d+\.\d+)$/);
if (tagMatch) tagVersion = tagMatch[1];
if (process.argv[2]) tagVersion = process.argv[2].replace(/^v/, '');

const errors = [];
if (pkgVersion !== changelogVersion) {
  errors.push(`package.json 版本(${pkgVersion}) 与 CHANGELOG 最新小节(${changelogVersion}) 不一致`);
}
if (tagVersion && tagVersion !== pkgVersion) {
  errors.push(`git tag 版本(v${tagVersion}) 与 package.json 版本(${pkgVersion}) 不一致`);
}

if (errors.length) {
  console.error('✗ 版本一致性校验失败：');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

const scope = tagVersion ? `（tag v${tagVersion}）` : '';
console.log(`✓ 版本一致性校验通过：${pkgVersion} ${scope}`);
