#!/usr/bin/env bun
// tools/check-skill-yaml.mjs — 用真实 YAML 解析器校验 skills/*/SKILL.md 的 frontmatter
//
// 为什么需要：`tools/validate-skills.mjs` 用宽松的行解析，只看「键是否存在」，
// 无法发现 YAML 层面的破坏（孤立缩进块、双引号标量过度转义、多行 plain scalar
// 顶格续行等）。这类破坏会让标准 YAML 解析器（skills 平台 / IDE 插件）直接
// 解析失败，技能无法被加载。本工具以 Bun.YAML 真实解析 + 契约校验兜底。
//
// 运行：bun run tools/check-skill-yaml.mjs（CI validate job 亦调用）

const CONTRACT = ['name', 'description', 'en_description', 'zh_displayName', 'category', 'en_category'];
const CATEGORIES = [
  '品牌与设计', '文档与内容', '数据分析与可视化', '前端开发', '后端与平台', '移动端开发',
  'WordPress 与 CMS', '工程实践与质量', '文件与格式处理', '自动化与集成', 'AI 与智能体',
  '音视频与多媒体', '桌面与客户端', '安全',
];

const failures = [];
const glob = new Bun.Glob('skills/*/SKILL.md');
let count = 0;

for await (const rel of glob.scan('.')) {
  const path = rel.replace(/\\/g, '/');
  const dir = path.split('/')[1];
  count++;
  const raw = await Bun.file(path).text();

  if (raw.includes('\r\n')) failures.push(`${dir}: CRLF 换行（须为 LF）`);

  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  if (lines[0] !== '---') {
    failures.push(`${dir}: 首行非 '---'（frontmatter 未开启）`);
    continue;
  }
  const end = lines.indexOf('---', 1);
  if (end === -1) {
    failures.push(`${dir}: frontmatter 未闭合（缺 '---'）`);
    continue;
  }

  let fm;
  try {
    fm = Bun.YAML.parse(lines.slice(1, end).join('\n')) ?? {};
  } catch (e) {
    failures.push(`${dir}: YAML 解析失败 → ${String(e.message).split('\n')[0]}`);
    continue;
  }
  if (typeof fm !== 'object') {
    failures.push(`${dir}: frontmatter 解析结果非映射`);
    continue;
  }

  for (const key of CONTRACT) {
    const v = fm[key];
    if (typeof v !== 'string' || !v.trim()) failures.push(`${dir}: 契约字段 ${key} 缺失或为空`);
  }
  if (fm.name && fm.name !== dir) failures.push(`${dir}: name(${fm.name}) ≠ 目录名`);
  if (fm.category && !CATEGORIES.includes(String(fm.category))) {
    failures.push(`${dir}: 非法分类 "${fm.category}"`);
  }
  if (fm.category && fm.en_category && CATEGORIES.includes(String(fm.category))) {
    const expect = {
      品牌与设计: 'Brand & Design', 文档与内容: 'Docs & Content', 数据分析与可视化: 'Data Analysis & Visualization',
      前端开发: 'Frontend Dev', 后端与平台: 'Backend & Platform', 移动端开发: 'Mobile Dev',
      'WordPress 与 CMS': 'WordPress & CMS', 工程实践与质量: 'Engineering Practice & Quality',
      文件与格式处理: 'File & Format Handling', 自动化与集成: 'Automation & Integration',
      'AI 与智能体': 'AI & Agents', 音视频与多媒体: 'Media & Multimedia',
      桌面与客户端: 'Desktop & Client', 安全: 'Security',
    }[String(fm.category)];
    if (expect && fm.en_category !== expect) {
      failures.push(`${dir}: en_category(${fm.en_category}) 与 category(${fm.category}) 不匹配（应为 ${expect}）`);
    }
  }
}

if (failures.length) {
  console.error(`✗ SKILL.md frontmatter YAML 校验失败（${failures.length} 项）：`);
  failures.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log(`✓ SKILL.md frontmatter YAML 校验通过：${count} 个技能均可被标准 YAML 解析器解析且契约齐备`);
