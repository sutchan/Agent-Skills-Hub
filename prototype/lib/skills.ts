// prototype/lib/skills.ts — 1.7.0
// 展示页数据接口：读取 build_site.py 生成的 skills.json（单一数据源，勿手改业务字段）
import data from "@/data/skills.json";

export interface Skill {
  name: string;
  en_name: string;
  en_desc: string;
  zh_desc: string;
  category: string;
  dir: string;
  tags: string[];
  has_scripts: boolean;
  has_references: boolean;
  has_assets: boolean;
}

export interface Category {
  name: string;
  en: string;
  count: number;
}

export interface SkillsData {
  meta: {
    title: string;
    title_zh: string;
    subtitle: string;
    author: string;
    repo: string;
    count: number;
    version: string;
    updated_at: string;
    generated_at: string;
  };
  categories: Category[];
  skills: Skill[];
}

const typed = data as unknown as SkillsData;

export function getSkillsData(): SkillsData {
  return typed;
}

// 分类英文名：仅从数据读取，禁止硬编码映射（对齐 openspec/project.md §4.5.3）
export function catName(cats: Category[], zh: string): string {
  const found = cats.find((c) => c.name === zh);
  return found ? found.en : zh;
}
