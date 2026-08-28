// app/not-found.tsx v1.14.43 — 404 页面
// 无需 'use client'：双语沿用 html[data-lang] + .zh/.en CSS 显隐，
// 而 data-lang 已由 layout.tsx 的首屏偏好脚本在解析阶段设置，静态渲染即可正确显隐。
export default function NotFound() {
  return (
    <main id="notFoundPage" className="empty-state" role="main">
      <div className="empty-title">
        <span className="zh">页面不存在</span>
        <span className="en">Page not found</span>
      </div>
      <p className="empty-desc">
        <span className="zh">你访问的页面已被移动或不存在，返回首页继续浏览技能库。</span>
        <span className="en">
          The page you requested has moved or does not exist. Head back to browse the skill library.
        </span>
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <a id="notFoundHomeLink" className="btn primary" href="/">
          <span className="zh">返回首页</span>
          <span className="en">Back home</span>
        </a>
      </div>
    </main>
  );
}
