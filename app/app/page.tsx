// app/page.tsx v1.1.4 — 首页（服务端读取技能数据并交由客户端外壳渲染）
import fs from "node:fs";
import path from "node:path";
import { loadSkills } from "./lib/skills";
import { AppShell } from "./components/AppShell";

// 项目版本取自根 package.json（单一权威源），供页脚展示，避免硬编码漂移。
// package.json 为静态文件，运行期不变，模块级缓存避免每次请求重复读盘（server-hoist-static-io）。
const VERSION: string = (() => {
  try {
    const raw = fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8");
    return JSON.parse(raw).version || "";
  } catch {
    return "";
  }
})();

export default function Page() {
  const data = loadSkills();
  return (
    <AppShell
      skills={data.skills}
      categories={data.categories}
      total={data.total}
      version={VERSION}
    />
  );
}
