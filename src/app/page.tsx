// app/page.tsx v1.14.60 — 首页（服务端读取技能数据并交由客户端外壳渲染）
import { loadSkills } from "./lib/skills";
import { getAppMeta } from "./lib/meta";
import { AppShell } from "./components/AppShell";

// 数据来自本地文件、纯静态，锁静态预渲染以最优 TTFB（Vercel 最佳实践）
export const dynamic = "force-static";

// 版本与更新日期取自根 package.json + CHANGELOG.md（单一权威源），供页脚展示，避免硬编码漂移。
const META = getAppMeta();

export default function Page() {
  const data = loadSkills();
  return (
    <AppShell data={data} version={META.version} updatedAt={META.updatedAt} />
  );
}
