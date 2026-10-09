import React from 'react';

export const metadata = {
  title: 'Agent Skills Hub · 高质量 Agent 技能目录',
  description: '集中管理 171+ 高质量 Agent 技能：按分类浏览、搜索、即取即用。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
