// app/skills/[slug]/page.tsx v1.0.0 — 技能分享深链页
// 对齐 share.ts buildShareText 生成的 /skills/<slug>/ 链接。
// @note 修复：此前分享链接无对应路由，接收方打开即 404。本页渲染完整应用外壳，
// 并由 SkillOpener 自动打开对应技能详情弹窗，与首页点击卡片体验一致。
import fs from "node:fs";
import path from "node:path";
import { loadSkills } from "../../lib/skills";
import { skillSlug } from "../../lib/skillSlug";
import { AppShell } from "../../components/AppShell";
import { SkillOpener } from "./skill-opener";

// 静态预渲染，与 app/page.tsx 一致
export const dynamic = "force-static";
// 未知/隐藏技能的旧分享链接直接 404（not-found 页），不动态渲染
export const dynamicParams = false;

// 项目版本取自根 package.json（与 app/page.tsx 同源逻辑，模块级缓存）
const VERSION: string = (() => {
  try {
    const raw = fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8");
    return JSON.parse(raw).version || "";
  } catch {
    return "";
  }
})();

export function generateStaticParams() {
  return loadSkills()
    .skills.filter((s) => !s.hidden)
    .map((s) => ({ slug: skillSlug(s.name) }));
}

export default function SkillPage({ params }: { params: { slug: string } }) {
  const data = loadSkills();
  const skill = data.skills.find((s) => skillSlug(s.name) === params.slug && !s.hidden);
  // dynamicParams=false 下未知 slug 已由 Next 按 404 处理，此处不会命中
  if (!skill) return null;
  return (
    <>
      <AppShell data={data} version={VERSION} />
      <SkillOpener name={skill.name} />
    </>
  );
}
