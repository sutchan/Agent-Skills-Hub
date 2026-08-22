// app/page.tsx v1.19.38 — 首页（服务端读取技能数据并交由客户端外壳渲染）
import fs from "node:fs";
import path from "node:path";
import { loadSkills } from "./lib/skills";
import { AppShell } from "./components/AppShell";

// 数据来自本地文件、纯静态，锁静态预渲染以最优 TTFB（Vercel 最佳实践）
export const dynamic = "force-static";

// 项目版本取自根 package.json（单一权威源），供页脚展示，避免硬编码漂移。
// @note 修复：与 skills.ts 同理，__dirname 在打包后不可用，改用 process.cwd()（=app/）锚定仓库根。
// package.json 为静态文件，运行期不变，模块级缓存避免每次请求重复读盘（server-hoist-static-io）。
const VERSION: string = (() => {
  try {
    const raw = fs.readFileSync(path.resolve(process.cwd(), "..", "package.json"), "utf8");
    return JSON.parse(raw).version || "";
  } catch {
    return "";
  }
})();

export default function Page() {
  const data = loadSkills();
  return (
    <AppShell data={data} version={VERSION} />
  );
}
