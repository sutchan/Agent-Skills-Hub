// scripts/seo/render-page.mjs — 首页 JSON-LD + 供独立关于页复用的静态正文
//
// 站点是 JS 驱动的单页应用：卡片由 window.SKILLS_DATA 渲染，不执行 JS 的爬虫只能看到骨架屏。
// 结构化数据（JSON-LD）留在首页 head，完整关于正文 + FAQ 由 render-about.mjs 生成到 /about.html。
import { SITE, SITE_DESCRIPTION, total, recordCount, hiddenCount, groups, faq, faqTw, lastmod, esc } from './facts.mjs';

const LF = '\n';

/** 首页 JSON-LD：WebSite / CollectionPage / SoftwareApplication 三类实体。
 *  FAQPage 已随可见 FAQ 移入独立 /about.html（结构化数据须与页面可见内容同源，
 *  否则 Google 会以「结构化数据与正文不符」处罚）；见 render-about.mjs。 */
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
    // FAQPage 已移入独立关于页（render-about.mjs），首页不再声明与可见内容不符的 FAQ 实体
  ];
  // `<` 统一转义，避免任何文本意外闭合 </script>
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${LF}${json}${LF}</script>`;
}

/** 供独立关于页复用的静态正文：事实段落 + FAQ。
 *  页面不再展示技能索引；完整可读清单由 /llms-full.txt 承担，机器可读数据由 /data/skills-data.json 承担。 */
export function renderAboutBody() {
  const links = '完整清单见 <a href="/llms-full.txt">llms-full.txt</a>，机器可读元数据见 <a href="/data/skills-data.json">skills-data.json</a>。';
  const linksTw = '完整清單見 <a href="/llms-full.txt">llms-full.txt</a>，機器可讀中繼資料見 <a href="/data/skills-data.json">skills-data.json</a>。';
  const leadZh = `${esc(SITE_DESCRIPTION)} 当前展示 ${total} 个可见技能、${groups.length} 个分类；权威数据共 ${recordCount} 条记录，其中 ${hiddenCount} 条标记为隐藏。`;
  const leadTw = `開源 AI Agent 技能目錄：按 SKILL.md 規範整理，提供分類瀏覽、關鍵字搜尋、中英雙語描述與一鍵安裝路徑；介面支援簡體中文、繁體中文與英語，專案整體採用 MIT 授權條款。 目前展示 ${total} 個可見技能，涵蓋 ${groups.length} 個分類；權威資料共 ${recordCount} 筆記錄，其中 ${hiddenCount} 筆標記為隱藏。`;
  const lines = [
    `<p class="seo-lead" id="site-directory-lead"><span class="lang-zh">${leadZh}${links}</span><span class="lang-tw">${esc(leadTw)}${linksTw}</span></p>`,
    '  <dl class="seo-faq" id="site-faq">',
  ];
  for (let i = 0; i < faq.length; i++) {
    lines.push(`    <div class="lang-zh"><dt>${esc(faq[i].q)}</dt><dd>${esc(faq[i].a)}</dd></div>`);
    lines.push(`    <div class="lang-tw"><dt>${esc(faqTw[i].q)}</dt><dd>${esc(faqTw[i].a)}</dd></div>`);
  }
  lines.push('  </dl>');
  return lines.join(LF);
}
