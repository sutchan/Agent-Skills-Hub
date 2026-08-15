// app/layout.tsx v1.1.0 — 根布局
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Skills Hub",
  description: "Discover & reuse 200+ high-quality agent skills.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
