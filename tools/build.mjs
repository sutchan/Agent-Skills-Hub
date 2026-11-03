// tools/build.mjs v1.16.6 — 将 src/template.html + src/styles/*.css + src/i18n*.js
// + src/parts/*.js + data/skills-data.json 组装为自包含单文件 src/index.html
// 所有源模块按职责拆分（见各文件头），构建期在此拼接；parts 合并为单一
// <script> 以保留全局作用域共享（与内联时代一致）。
import fs from 'fs';
import path from 'path';
const root = process.cwd();
const P = (...a) => path.join(root, ...a);

const template = fs.readFileSync(P('src/template.html'), 'utf8');

// 样式：tokens → base → layout → components → responsive（顺序即级联优先级）
const styleOrder = ['tokens.css', 'base.css', 'layout.css', 'components.css', 'responsive.css'];
const css = styleOrder.map((f) => fs.readFileSync(P('src/styles', f), 'utf8').trim()).join('\n');

// 国际化：字典(zh/en) 先于引擎
const i18n = [
  fs.readFileSync(P('src/i18n-zh.js'), 'utf8').trim(),
  fs.readFileSync(P('src/i18n-en.js'), 'utf8').trim(),
  fs.readFileSync(P('src/i18n.js'), 'utf8').trim(),
].join('\n');

// 逻辑模块：合并为单一 <script>（保持全局作用域共享，等价于原内联单块）
const partOrder = [
  '01-state.js', '02a-filters.js', '02b-cards.js', '02c-grid.js',
  '03a-utils.js', '03b-render.js', '03c-modal.js', '03d-a11y.js',
  '04a-apply.js', '04b-theme-lang-search.js', '04c-favorites.js', '04d-filters.js',
  '04e-grid.js', '04f-hero.js', '04g-settings-share.js', '04h-bind.js',
  '05-main.js', '06-votes.js',
];
const parts = partOrder.map((f) => fs.readFileSync(P('src/parts', f), 'utf8').trim()).join('\n');

// 技能数据：来源 data/skills-data.json，转义 <>& 防 </script> 提前闭合
const data = JSON.parse(fs.readFileSync(P('data/skills-data.json'), 'utf8'));
const json = JSON.stringify(data)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026');
const dataScript = `<script>window.SKILLS_DATA = ${json};</script>`;

const out = template
  .replace('<!--BUILD:STYLES-->', `<style>\n${css}\n</style>`)
  .replace('<!--BUILD:SKILLS_DATA-->', dataScript)
  .replace('<!--BUILD:I18N-->', `<script>\n${i18n}\n</script>`)
  .replace('<!--BUILD:PARTS-->', `<script>\n${parts}\n</script>`);

if (out.includes('<!--BUILD:')) throw new Error('未替换的构建占位符');
fs.writeFileSync(P('src/index.html'), out);
console.log('built src/index.html', out.length, 'bytes; parts:', partOrder.length);
