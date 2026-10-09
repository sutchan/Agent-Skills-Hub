'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // If accessed via Next.js client, redirect to the root static prototype
    window.location.href = '/index.html';
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Agent Skills Hub</h1>
      <p>正在加载技能目录，请稍候...</p>
    </main>
  );
}
