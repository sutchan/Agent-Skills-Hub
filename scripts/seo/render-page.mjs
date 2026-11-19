// scripts/seo/render-page.mjs — 生成注入 src/index.html 的 JSON-LD 与静态可抓取目录区块
//
// 站点是 JS 驱动的单页应用：卡片由 window.SKILLS_DATA 渲染，不执行 JS 的爬虫只能看到骨架屏。
// 这里生成一份静态 HTML 目录 + 问答，让搜索引擎与生成式引擎无需执行脚本即可读到真实内容。
import { SITE, SITE_DESCRIPTION, total, recordCount, hiddenCount, groups, faq, lastmod, esc, summary, skillUrl } from './facts.mjs';

const LF = '\n';

/** JSON-LD：WebSite / CollectionPage / SoftwareApplication / FAQPage 四类实体 */
export function renderJsonLd() {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: `${SITE.url}/`,
      name: SITE.name,
      alternateName: ['Agent 技能枢纽', 'Agent Skills Hub 技能目录'],
      description: SITE_DESCRIPTION,
      inLanguage: ['zh-CN', 'zh-TW', 'en'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE.url}/#q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'CollectionPage',
      '@id': `${SITE.url}/#collection`,
      url: `${SITE.url}/`,
      name: 'AI Agent 技能目录',
      description: `按 SKILL.md 规范整理的 ${total} 个开源 AI Agent 技能，覆盖 ${groups.length} 个分类，支持中文检索与中英双语描述。`,
      isPartOf: { '@id': `${SITE.url}/#website` },
      numberOfItems: total,
      dateModified: lastmod,
      inLanguage: ['zh-CN', 'en'],
      hasPart: groups.map((g) => ({
        '@type': 'Collection',
        name: `${g.name} / ${g.en}`,
        numberOfItems: g.skills.length,
      })),
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE.url}/#app`,
      name: SITE.name,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      url: `${SITE.url}/`,
      description: SITE_DESCRIPTION,
      license: SITE.license,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      inLanguage: ['zh-CN', 'zh-TW', 'en'],
      sameAs: [SITE.repo],
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE.url}/#faq`,
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
  // `<` 统一转义，避免任何文本意外闭合 </script>
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${LF}${json}${LF}</script>`;
}

/** 静态可见内容：事实段落 + FAQ + 折叠的全量技能索引（details 是合法交互，非隐藏文本） */
export function renderDirectory() {
  const lines = [
    '<section class="seo-directory" id="site-directory" aria-labelledby="site-directory-title">',
    '  <h2 id="site-directory-title">关于 Agent Skills Hub</h2>',
    `  <p class="seo-lead" id="site-directory-lead">${esc(SITE_DESCRIPTION)} 当前展示 ${total} 个可见技能、${groups.length} 个分类；权威数据共 ${recordCount} 条记录，其中 ${hiddenCount} 条标记为隐藏。完整清单见 <a href="/llms-full.txt">llms-full.txt</a>，机器可读元数据见 <a href="/data/skills-data.json">skills-data.json</a>。</p>`,
    '  <dl class="seo-faq" id="site-faq">',
  ];
  for (const f of faq) {
    lines.push(`    <div><dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd></div>`);
  }
  lines.push('  </dl>');
  lines.push(`  <details class="seo-index" id="skill-index">`);
  lines.push(`    <summary>全部 ${total} 个技能索引（按 ${groups.length} 个分类）</summary>`);
  lines.push('    <div class="seo-index-body">');
  for (const g of groups) {
    lines.push(`      <h3>${esc(g.name)} / ${esc(g.en)}（${g.skills.length}）</h3>`);
    lines.push('      <ul>');
    for (const s of g.skills) {
      const label = esc(`${s.name}${s.zh ? ` · ${s.zh}` : ''}`);
      lines.push(`        <li><a href="${esc(skillUrl(s))}">${label}</a> — ${summary(s.description)}</li>`);
    }
    lines.push('      </ul>');
  }
  lines.push('    </div>');
  lines.push('  </details>');
  lines.push('</section>');
  return lines.map((line) => '  ' + line).join(LF);
}
