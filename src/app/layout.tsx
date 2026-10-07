// app/layout.tsx v1.14.42 — 根布局（含全站 GA4 注入与首屏偏好预置）
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Skills Hub",
  description: "Discover & reuse high-quality agent skills.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

// GA4 Measurement ID：优先取环境变量，缺省回退仓库配置值（本地/部署皆可生效）
const GA_ID = process.env.GA_MEASUREMENT_ID || "G-WQDDVB14PF";

// 首屏偏好预置脚本（v1.14.42）：在 HTML 解析阶段同步应用 theme / lang / nameMode，
// 避免水合后置应用导致的主题闪烁（FOUC）与语言跳变。对齐 AppShell 的 localStorage 键。
// 必须在 <head> 内同步执行，且早于 React 水合（rendering-hydration-no-flicker）。
const PREF_BOOTSTRAP = `(function(){try{
var t=localStorage.getItem('ash-theme')||'light';
var l=localStorage.getItem('ash-lang')||'zh';
var n=localStorage.getItem('ash-name-mode')||'both';
var d=document.documentElement;
if(t!=='light'&&t!=='dark'){t='light';}
if(l!=='zh'&&l!=='en'){l='zh';}
if(['both','zh','en'].indexOf(n)<0){n='both';}
d.setAttribute('data-theme',t);
d.setAttribute('data-lang',l);
d.setAttribute('data-name-mode',n);
d.setAttribute('lang',l==='zh'?'zh-CN':'en');
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        {/* 同步执行：先于 CSS 绘制应用偏好，消除水合闪烁 */}
        <script dangerouslySetInnerHTML={{ __html: PREF_BOOTSTRAP }} />
      </head>
      <body>
        {children}
        {/* Google Analytics (GA4)：afterInteractive 确保不影响首屏渲染 */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
