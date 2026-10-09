import React from 'react';

export const metadata = {
  title: 'Agent Skills Hub',
  description: 'Discover and reuse high-quality AI agent skills categorized and searchable.',
  openGraph: {
    title: 'Agent Skills Hub',
    description: 'Discover and reuse high-quality AI agent skills categorized and searchable.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
