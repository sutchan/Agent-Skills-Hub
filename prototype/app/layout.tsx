// prototype/app/layout.tsx — 1.7.0
import type { Metadata } from "next";
import "./globals.css";
import { getSkillsData } from "@/lib/skills";

const { meta } = getSkillsData();

export const metadata: Metadata = {
  title: meta.title,
  description: meta.subtitle,
};

// 内联脚本：在首屏渲染前应用主题，避免深浅主题闪烁（FOUC）
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('ash-theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
