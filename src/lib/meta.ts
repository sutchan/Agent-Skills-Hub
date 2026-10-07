// app/lib/meta.ts v1.14.60 — 读取应用版本与更新日期（单一事实源：package.json + CHANGELOG.md）
import fs from "node:fs";
import path from "node:path";

export interface AppMeta {
  version: string;
  /** 最新版本的发布/更新日期，格式 YYYY-MM-DD（取自 CHANGELOG.md 顶部小节） */
  updatedAt: string;
}

let cached: AppMeta | null = null;

// package.json / CHANGELOG.md 为静态文件，运行期不变，模块级缓存避免每次请求重复读盘
export function getAppMeta(): AppMeta {
  if (cached) return cached;
  let version = "";
  try {
    const raw = fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8");
    version = JSON.parse(raw).version || "";
  } catch {
    /* 读取失败留空，不影响其余渲染 */
  }
  let updatedAt = "";
  try {
    const raw = fs.readFileSync(path.resolve(process.cwd(), "CHANGELOG.md"), "utf8");
    // 匹配顶部首个小节标题：## [x.y.z] - YYYY-MM-DD
    const m = raw.match(/^##\s+\[[^\]]+\]\s*-\s*(\d{4}-\d{2}-\d{2})/m);
    updatedAt = m ? m[1] : "";
  } catch {
    /* 读取失败留空 */
  }
  cached = { version, updatedAt };
  return cached;
}
