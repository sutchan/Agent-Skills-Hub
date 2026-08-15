// app/page.tsx v1.1.0 — 首页（服务端读取技能数据并交由客户端外壳渲染）
import { loadSkills } from "./lib/skills";
import { AppShell } from "./components/AppShell";

export default function Page() {
  const data = loadSkills();
  return <AppShell skills={data.skills} categories={data.categories} />;
}
