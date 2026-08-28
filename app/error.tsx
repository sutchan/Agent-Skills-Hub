// app/error.tsx v1.14.43 — 全局错误边界（Client Component，必备）
// 作用：捕获路由段内任意 Client 组件运行时异常，避免整页白屏；提供重置入口。
// 约定：主要容器加语义化 id（#errorBoundary）；中英双语沿用 html[data-lang] + .zh/.en 显隐。
"use client";

import { useEffect, useState } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // 初值 zh 与 SSR 输出一致，挂载后按实际偏好同步，避免水合不匹配
  const [lang, setLang] = useState<"zh" | "en">("zh");

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-lang");
    setLang(attr === "en" ? "en" : "zh");
  }, []);

  // 便于排障：错误摘要打到控制台（不含敏感信息）
  useEffect(() => {
    console.error("[SkillsHub] render error:", error?.message, error?.digest ? `digest=${error.digest}` : "");
  }, [error]);

  return (
    <main id="errorBoundary" className="empty-state" role="alert" aria-live="assertive">
      <div className="empty-title">
        <span className="zh">页面出错了</span>
        <span className="en">Something went wrong</span>
      </div>
      <p className="empty-desc">
        <span className="zh">技能列表加载或渲染失败，你可以重试，或返回首页重新浏览。</span>
        <span className="en">
          Failed to load or render the skill list. You can retry, or go back home.
        </span>
      </p>
      {error?.digest ? (
        <p className="empty-desc" style={{ opacity: 0.7 }}>
          <span className="zh">错误编号：{error.digest}</span>
          <span className="en">Error code: {error.digest}</span>
        </p>
      ) : null}
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button id="errorRetryBtn" type="button" className="btn primary" onClick={reset}>
          <span className="zh">重试</span>
          <span className="en">Retry</span>
        </button>
        <a id="errorHomeLink" className="btn" href="/">
          <span className="zh">返回首页</span>
          <span className="en">Back home</span>
        </a>
      </div>
    </main>
  );
}
