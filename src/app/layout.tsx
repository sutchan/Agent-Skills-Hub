import type { Metadata } from 'next';
import React from 'react';

// 静态导出产物 out/index.html 由 scripts/inject-ga.mjs 从 src/index.html 覆盖，
// 但 Next 生成的附属页面（如 404）沿用此处 metadata；口径须与站点 head 保持一致。
export const metadata: Metadata = {
  metadataBase: new URL('https://skills.ewuse.com'),
  title: 'Agent Skills Hub · 开源 AI Agent 技能目录（中文可检索）',
  description:
    '开源 AI Agent 技能目录：按 SKILL.md 规范整理，提供分类浏览、关键词搜索、中英双语描述与一键安装路径；界面支持简体中文、繁体中文与英语，项目整体采用 MIT 协议。',
  applicationName: 'Agent Skills Hub',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Agent Skills Hub',
    title: 'Agent Skills Hub · 开源 AI Agent 技能目录（中文可检索）',
    description: '开源 AI Agent 技能目录：分类浏览、关键词搜索、中英双语描述，可一键复制技能目录即用。MIT 协议。',
    locale: 'zh_CN',
    alternateLocale: ['zh_TW', 'en_US'],
    images: [{ url: '/banner-og.svg', alt: 'Agent Skills Hub — 开源 AI Agent 技能目录' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Skills Hub · 开源 AI Agent 技能目录（中文可检索）',
    description: '开源 AI Agent 技能目录：分类浏览、关键词搜索、中英双语描述，可一键复制技能目录即用。MIT 协议。',
    images: ['/banner-og.svg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
