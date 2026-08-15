// app/lib/skills.ts v1.1.0 — 技能数据读取与类型
// 权威数据源：prototype/skills-data.json（构建期由 scripts/generate-data.mjs 生成）。
// 在 Next.js 服务端组件中以 fs 读取，避免客户端拉取大体积 JSON。

import fs from "node:fs";
import path from "node:path";

export interface Skill {
  name: string;
  zh: string;
  description: string;
  category: string;
  allowedTools?: string;
  tags?: string[];
}

export interface SkillsData {
  meta: { count: number; generatedAt: string };
  categories: string[];
  skills: Skill[];
}

const DATA_PATH = path.resolve(process.cwd(), "..", "prototype", "skills-data.json");

export function loadSkills(): SkillsData {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw) as SkillsData;
  } catch (e) {
    // 容错：数据缺失时返回空结构，页面不崩溃
    return { meta: { count: 0, generatedAt: "" }, categories: [], skills: [] };
  }
}
