// app/layout.tsx v1.14.29 — 根布局（含全站 GA4 注入）
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Skills Hub",
  description: "Discover & reuse 200+ high-quality agent skills.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

// GA4 Measurement ID：优先取环境变量，缺省回退仓库配置值（本地/部署皆可生效）
const GA_ID = process.env.GA_MEASUREMENT_ID || "G-WQDDVB14PF";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
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
