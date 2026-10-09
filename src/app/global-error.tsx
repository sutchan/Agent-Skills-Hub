'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh">
      <body>
        <h2>出了点问题</h2>
        <button onClick={() => reset()}>重试</button>
      </body>
    </html>
  );
}
