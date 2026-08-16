// app/lib/skills.ts v1.1.1 — 技能数据读取与类型
// 权威数据源：data/skills-data.json（构建期由 build-skills-data.mjs 生成）。
// 在 Next.js 服务端组件中以 fs 读取，避免客户端拉取大体积 JSON。

import fs from "node:fs";
import path from "node:path";

export interface Skill {
  name: string;
  zh: string;
  description: string;
  category: string;
  // build-skills-data.mjs 经 normalizeTools() 已规范为 string[]（见 prototype 修复 v1.14.6）。
  // 这里以 string[] 为权威类型，渲染层无需再 split。
  allowedTools?: string[];
  tags?: string[];
}

export interface SkillsData {
  // 与 build-skills-data.mjs 生成结构一致：{ total, categories, skills }
  total: number;
  categories: string[];
  skills: Skill[];
}

const DATA_PATH = path.resolve(process.cwd(), "..", "data", "skills-data.json");

export function loadSkills(): SkillsData {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const data = JSON.parse(raw) as SkillsData;
    // 防御性兜底：即使数据异常也保证字段存在，避免渲染层崩溃
    return {
      total: data.total || (data.skills ? data.skills.length : 0),
      categories: data.categories || [],
      skills: data.skills || [],
    };
  } catch (e) {
    // 容错：数据缺失时返回空结构，页面不崩溃
    return { total: 0, categories: [], skills: [] };
  }
}
