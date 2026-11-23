// scripts/seo/render-assets.mjs — 生成 robots.txt / sitemap.xml / llms.txt / llms-full.txt
//
// 生成结果全部来自 facts.mjs 的真实数据；文件按 LF 换行写入，保证跨 Windows/CI 幂等。
import { SITE, SITE_DESCRIPTION, total, hiddenCount, recordCount, groups, lastmod, skillUrl, detailUrl } from './facts.mjs';

const LF = '\n';

/** 纯文本单行化：保留原始字符（不转义 HTML 实体），仅压缩空白 */
function plain(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function renderRobots() {
  return [
    `# ${SITE.name} — ${SITE.url}`,
    '# 公开内容与 AI 可读清单允许所有搜索引擎 / 生成式引擎抓取；API 仅用于投票收藏，不供索引。',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${SITE.url}/sitemap.xml`,
    '',
  ].join(LF);
}

export function renderSitemap() {
  // SPA 的 #cat / #q / #skill 深链返回同一份首页 HTML，canonical 也指向首页；
  // 把它们列进 sitemap 只会制造重复内容，因此只收录首页与独立关于页两个唯一可索引页面。
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    `    <loc>${SITE.url}/</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    '    <changefreq>weekly</changefreq>',
    '    <priority>1.0</priority>',
    '  </url>',
    '  <url>',
    `    <loc>${SITE.url}/about.html</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.6</priority>',
    '  </url>',
    '</urlset>',
    '',
  ].join(LF);
}

/** llms.txt：标准摘要入口，给生成式引擎提供「站点是什么 + 去哪里拿完整数据」 */
export function renderLlms() {
  const lines = [
    `# ${SITE.name}`,
    '',
    `> 开源 AI Agent 技能目录：${total} 个可见技能、${groups.length} 个分类，中英双语描述，MIT 协议，纯静态站点。`,
    '',
    SITE_DESCRIPTION,
    '',
    `- 在线站点：${SITE.url}/`,
    `- [关于页（常见问题与数据入口）](${SITE.url}/about.html)`,
    `- GitHub 仓库：${SITE.repo}`,
    '- 界面语言：简体中文 / 繁体中文 / 英语',
    '- 许可证：MIT（整体）',
    `- 数据规模：${recordCount} 条记录，其中 ${hiddenCount} 条隐藏；对外展示 ${total} 个技能`,
    '',
    '## 数据与检索',
    '',
    `- [完整技能清单（Markdown，${total} 条）](${SITE.url}/llms-full.txt)：按分类列出全部技能的名称、中文名、描述、安装路径与源码链接`,
    `- [技能元数据 JSON（权威数据源）](${SITE.url}/data/skills-data.json)：机器可读的完整字段`,
    `- [在线检索（示例：#q=wordpress）](${SITE.url}/#q=wordpress)：支持关键词、分类、标签筛选与排序`,
    `- [站点地图](${SITE.url}/sitemap.xml)`,
    '',
    `## 分类（${groups.length} 类）`,
    '',
    ...groups.map((g) => `- ${g.name} / ${g.en}（${g.skills.length} 个技能）`),
    '',
    '## 常见问题',
    '',
    '- 是什么：开源、免费、纯静态的 AI Agent 技能目录，技能按 SKILL.md 规范组织',
    `- 有多少：${total} 个可见技能 / ${groups.length} 个分类，以 ${SITE.url}/data/skills-data.json 为准`,
    '- 是否免费：免费开源，项目整体 MIT 协议',
    '- 如何安装：复制 skills/<技能名>/ 目录到 Agent 技能目录，由 SKILL.md 的 description 自动触发',
    '- 是否支持中文：界面简中 / 繁中 / 英语三语，每条技能均有中文描述与英文原文',
    '',
    '## Optional',
    '',
    `- [GitHub 仓库](${SITE.repo})`,
    `- [更新日志](${SITE.repo}/blob/main/CHANGELOG.md)`,
    `- [许可证](${SITE.repo}/blob/main/LICENSE)`,
    `- [技能规范说明](${SITE.repo}/blob/main/docs/spec.md)`,
    '',
  ];
  return lines.join(LF);
}

/** llms-full.txt：完整可引用清单，AI 无需执行 JS 即可读到全部技能事实 */
export function renderLlmsFull() {
  const lines = [
    `# ${SITE.name} — 完整技能清单`,
    '',
    `> 由 scripts/sync-seo-assets.mjs 从 data/skills-data.json 生成：${total} 个可见技能 / ${groups.length} 个分类。请勿手工编辑。`,
    '',
    `- 数据源：${SITE.url}/data/skills-data.json（${recordCount} 条记录，${hiddenCount} 条隐藏）`,
    `- 在线检索：${SITE.url}/`,
    `- 许可证：${SITE.license}`,
    '- 安装方式：复制 skills/<技能名>/ 目录到你的 Agent 技能目录',
    '',
  ];
  for (const g of groups) {
    lines.push(`## ${g.name} / ${g.en}（${g.skills.length}）`, '');
    for (const s of g.skills) {
      const zh = plain(s.zh) ? `（${plain(s.zh)}）` : '';
      const tags = (s.tags || []).length ? ` · 标签：${s.tags.map(plain).join('、')}` : '';
      lines.push(
        `- **${plain(s.name)}**${zh} — ${plain(s.description)}${tags}`,
        `  - 安装：\`${plain(s.githubDir || `skills/${s.name}`)}/\` · 源码：${skillUrl(s)} · 详情：${detailUrl(s)}`,
      );
    }
    lines.push('');
  }
  return lines.join(LF);
}
