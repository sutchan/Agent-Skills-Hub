// app/lib/skills.ts v1.19.4 — 技能数据读取与类型
// 数据源：app/data/skills-data.json（由 app/scripts/sync-data.cjs 从仓库根
// data/skills-data.json 同步，构建期由 build-skills-data.mjs 生成）。
// 在 Next.js 服务端组件中以 fs 读取，避免客户端拉取大体积 JSON。

import fs from "node:fs";
import path from "node:path";

export interface Skill {
  name: string;
  zh: string;
  description: string;
  category: string;
  // 英文分类名（frontmatter en_category），英文态 chip/卡片/详情显示
  enCategory?: string;
  // build-skills-data.mjs 生成的英文描述（原 description 迁移），卡片在英文态显示（对齐原型 cardHTML）
  enDescription?: string;
  // build-skills-data.mjs 经 normalizeTools() 已规范为 string[]（见 prototype 修复 v1.14.6）。
  // 这里以 string[] 为权威类型，渲染层无需再 split。
  allowedTools?: string[];
  tags?: string[];
  // 与 data/skills-data.json 一致：hidden 技能在展示页/索引中隐藏（build-skills-data.mjs 写入）
  hidden?: boolean;
}

export interface SkillsData {
  // 与 build-skills-data.mjs 生成结构一致：{ total, categories, categoryEn, skills }
  total: number;
  categories: string[];
  // 分类中文名 -> 英文名映射（英文态 chip 显示）
  categoryEn?: Record<string, string>;
  skills: Skill[];
}

const DATA_PATH = path.resolve(__dirname, "..", "data", "skills-data.json");

// 模块级缓存：skills-data.json 为构建期静态文件，运行期不变。
// 避免每个请求重复 readFileSync + JSON.parse（Vercel server-hoist-static-io）。
// dev 下修改数据需重启进程（predev 已重新同步），production 下零成本复用。
let cached: SkillsData | null = null;

export function loadSkills(): SkillsData {
  if (cached) return cached;
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const data = JSON.parse(raw) as SkillsData;
    // 防御性兜底：即使数据异常也保证字段存在，避免渲染层崩溃
    cached = {
      total: data.total || (data.skills ? data.skills.length : 0),
      categories: data.categories || [],
      skills: data.skills || [],
    };
    return cached;
  } catch (e) {
    // 容错：数据缺失时返回空结构，页面不崩溃
    return { total: 0, categories: [], skills: [] };
  }
}
