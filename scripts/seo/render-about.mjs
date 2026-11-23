// scripts/seo/render-about.mjs — 生成独立关于页 public/about.html（自包含静态 HTML）
//
// 首页只保留简短「关于」引导，完整 FAQ 移入本页；两者共用 facts.mjs
// 的实算数据与 render-page.mjs 的 renderAboutBody()，避免两处数字/文案漂移。
// 本页不展示技能索引：完整可读清单由 /llms-full.txt 承载，机器可读数据见 /data/skills-data.json。
// FAQPage JSON-LD 也随之从首页迁到本页，保证结构化数据与可见内容同源。
import { SITE, SITE_DESCRIPTION, faq, lastmod, esc } from './facts.mjs';
import { renderAboutBody } from './render-page.mjs';

const LF = '\n';
const ABOUT_URL = `${SITE.url}/about.html`;
const TITLE = `关于 ${SITE.name} · 开源 AI Agent 技能目录`;
const DESCRIPTION = `${SITE_DESCRIPTION} 本页提供常见问题与数据入口；完整技能清单见 llms-full.txt。`;

/** 关于页 JSON-LD：AboutPage + FAQPage（FAQ 与页面可见 #site-faq 逐字一致） */
export function renderAboutJsonLd() {
  const graph = [
    {
      '@type': 'AboutPage',
      '@id': `${ABOUT_URL}#about`,
      url: ABOUT_URL,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { '@id': `${SITE.url}/#website` },
      inLanguage: ['zh-CN', 'zh-TW', 'en'],
      dateModified: lastmod,
    },
    {
      '@type': 'FAQPage',
      '@id': `${ABOUT_URL}#faq`,
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${LF}${json}${LF}</script>`;
}

/** 极简自包含样式：复用首页设计令牌的取值，不依赖首页 140KB 内联 CSS */
const STYLE = `
:root{--background:0 0% 100%;--foreground:224 24% 12%;--card:0 0% 100%;--primary:152 56% 40%;--secondary:220 16% 96%;--border:220 14% 90%;--muted-foreground:220 9% 46%;--maxw:900px;--font-display:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Songti SC","STSong","PingFang SC","Microsoft YaHei",system-ui,serif;--font-sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",system-ui,sans-serif;--shadow-sm:0 1px 2px hsl(224 32% 20% / .05),0 2px 6px -1px hsl(224 32% 20% / .08)}
html[data-theme="dark"]{--background:224 28% 8%;--foreground:220 18% 92%;--card:224 24% 11%;--primary:152 56% 58%;--secondary:224 18% 18%;--border:224 14% 22%;--muted-foreground:220 12% 68%}
*{box-sizing:border-box}
html{color-scheme:light dark}
body{margin:0;background:hsl(var(--background));color:hsl(var(--foreground));font-family:var(--font-sans);font-size:14px;line-height:1.7}
.about-wrap{max-width:var(--maxw);margin:0 auto;padding:28px 20px 64px}
.about-back{display:inline-flex;align-items:center;gap:6px;color:hsl(var(--primary));text-decoration:none;font-size:13px;font-weight:600}
.about-back:hover{text-decoration:underline}
.seo-directory{margin-top:20px;padding:28px;border:1px solid hsl(var(--border));border-radius:14px;background:hsl(var(--card));box-shadow:var(--shadow-sm)}
.seo-directory h1{font-family:var(--font-display);font-size:28px;line-height:1.25;margin:0 0 12px}
.seo-directory .seo-lead{max-width:88ch;margin:0 0 20px;color:hsl(var(--muted-foreground))}
.seo-directory a{color:hsl(var(--primary));text-decoration:underline;text-underline-offset:2px}
.seo-directory a:hover{text-decoration-thickness:2px}
.seo-directory h2{font-size:17px;margin:24px 0 10px}
.seo-faq{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px 24px;margin:0}
.seo-faq>div{min-width:0;padding:12px 14px;border:1px solid hsl(var(--border));border-radius:10px;background:hsl(var(--secondary))}
.seo-faq dt{font-weight:600}
.seo-faq dd{margin:4px 0 0;color:hsl(var(--muted-foreground))}
/* 繁体/简体文案互斥：与首页 html[data-lang] 约定一致 */
.lang-tw{display:none}
html[data-lang="tw"] .lang-zh{display:none}
html[data-lang="tw"] .lang-tw{display:block}
.about-lang{display:flex;gap:6px;margin:0 0 12px}
.about-lang button{padding:4px 12px;border:1px solid hsl(var(--border));border-radius:999px;background:transparent;color:hsl(var(--muted-foreground));font:inherit;font-size:12px;cursor:pointer}
.about-lang button.active{background:hsl(var(--primary));border-color:hsl(var(--primary));color:#fff}
@media(max-width:640px){.about-wrap{padding:20px 14px 48px}.seo-directory{padding:18px 16px}.seo-directory h1{font-size:23px}}
`;

/** 生成完整独立关于页 HTML（写入 public/about.html，Next export 与本地静态服务均可达） */
export function renderAboutPage() {
  const jsonLd = renderAboutJsonLd();
  const body = renderAboutBody();
  return [
    '<!DOCTYPE html>',
    `<!-- public/about.html — 由 scripts/sync-seo-assets.mjs 生成，请勿手工编辑；事实源 data/skills-data.json -->`,
    '<html lang="zh" data-theme="light">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `  <title>${esc(TITLE)}</title>`,
    `  <meta name="description" content="${esc(DESCRIPTION)}" />`,
    '  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />',
    `  <link rel="canonical" href="${ABOUT_URL}" />`,
    `  <meta property="og:type" content="website" />`,
    `  <meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `  <meta property="og:title" content="${esc(TITLE)}" />`,
    `  <meta property="og:description" content="${esc(DESCRIPTION)}" />`,
    `  <meta property="og:url" content="${ABOUT_URL}" />`,
    `  <link rel="icon" href="${SITE.url}/favicon.svg" />`,
    `  <style>${STYLE}</style>`,
    `  ${jsonLd}`,
    '</head>',
    '<body>',
    '  <div class="about-wrap">',
    '    <div class="about-lang" id="about-lang" aria-label="语言 / Language"><button type="button" data-lang-set="zh">简体</button><button type="button" data-lang-set="tw">繁體</button></div>',
    `    <a class="about-back" href="/" aria-label="返回技能目录首页 / Back to home">← 返回技能目录首页</a>`,
    '    <main class="seo-directory" id="site-directory" aria-labelledby="about-title">',
    '      <h1 id="about-title">关于 Agent Skills Hub</h1>',
    ...body.split(LF).map((line) => `      ${line}`),
    '    </main>',
    '  </div>',
    `  <script>
(function () {
  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  var lang = params.get('lang');
  if (lang !== 'tw' && lang !== 'zh') {
    try { lang = (localStorage.getItem('ash-lang') || '').indexOf('tw') >= 0 ? 'tw' : 'zh'; } catch (e) { lang = 'zh'; }
  }
  if (lang !== 'tw' && lang !== 'zh') lang = 'zh';
  function apply(next) {
    root.setAttribute('data-lang', next);
    root.setAttribute('lang', next === 'tw' ? 'zh-Hant' : 'zh-CN');
    document.querySelectorAll('[data-lang-set]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang-set') === next);
    });
  }
  apply(lang);
  document.querySelectorAll('[data-lang-set]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = btn.getAttribute('data-lang-set');
      apply(next);
      var p = new URLSearchParams(location.search);
      p.set('lang', next);
      history.replaceState(null, '', location.pathname + '?' + p.toString());
      try { localStorage.setItem('ash-lang', next); } catch (e) {}
    });
  });
})();
  </script>`,
    '</body>',
    '</html>',
    '',
  ].join(LF);
}
