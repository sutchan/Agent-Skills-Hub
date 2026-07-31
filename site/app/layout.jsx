// 路径: site/app/layout.jsx 版本: 1.0.0
import "./globals.css";

export const metadata = {
  title: "Agent Skills Hub · AI 技能集合展示",
  description:
    "面向开发、设计、测试、DevOps、Agent 工程及各行业领域的开源 AI 技能集合（Agent Skills Hub）静态展示页。",
  openGraph: {
    title: "Agent Skills Hub",
    description: "面向开发与各行业的开源 AI 技能集合展示。",
    type: "website",
  },
};

// 首屏前根据 localStorage / 系统偏好设置主题，避免浅色闪烁
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
