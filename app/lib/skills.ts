// app/lib/skills.ts v1.20.3 — 技能数据读取与类型
// 数据源：仓库根 data/skills-data.json（稳定元数据，由 build-skills-data.mjs 生成）
// + data/skills-metrics.json（频繁更新的派生指标：popularity/size/files/stars/firstSeen/skillVersion）。
// 两文件合并后提供给渲染层，指标独立存储避免每次重算重写大文件。
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
  installCommand: string; // 安装命令，恒定派生为 npx skills add sutchan/Agent-Skills-Hub/skills/<name>
  githubDir: string; // GitHub 源码目录，恒定派生为 skills/<name>
  // 派生展示指标（来自 data/skills-metrics.json，build-skills-data.mjs 计算）
  size?: number; // 技能目录总字节数
  files?: number; // 文件数（递归）
  popularity?: number; // 被其他技能 description 提及次数（相关性热度代理）
  // 元信息（build-skills-data.mjs 提取自 frontmatter，详情弹窗展示）
  author?: string;
  license?: string;
  skillVersion?: string;
  stars?: number;
  firstSeen?: string;
  // 来源网址（homepage / source / url / website 多键兼容）
  homepage?: string;
}

/** 频繁更新的指标结构（data/skills-metrics.json 中每个技能的 value） */
interface SkillMetrics {
  popularity?: number;
  size?: number;
  files?: number;
  stars?: number;
  firstSeen?: string;
  skillVersion?: string;
}

export interface SkillsData {
  // 与 build-skills-data.mjs 生成结构一致：{ total, categories, categoryEn, skills }
  total: number;
  categories: string[];
  // 分类中文名 -> 英文名映射（英文态 chip 显示）
  categoryEn?: Record<string, string>;
  skills: Skill[];
}

// 仓库根 data/：__dirname=app/lib → 上提两级到仓库根
const DATA_PATH = path.resolve(__dirname, "..", "..", "data", "skills-data.json");
const METRICS_PATH = path.resolve(__dirname, "..", "..", "data", "skills-metrics.json");

// 模块级缓存：数据文件为构建期静态文件，运行期不变。
// 避免每个请求重复 readFileSync + JSON.parse（Vercel server-hoist-static-io）。
// dev 下修改数据需重启进程（predev 已重新同步），production 下零成本复用。
let cached: SkillsData | null = null;

export function loadSkills(): SkillsData {
  if (cached) return cached;
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const data = JSON.parse(raw) as SkillsData;
    // 合并频繁更新指标：以 name 为 key 的 map 覆盖到主数据 skill 对象
    let metrics: Record<string, SkillMetrics> = {};
    try {
      metrics = JSON.parse(fs.readFileSync(METRICS_PATH, "utf8")) as Record<string, SkillMetrics>;
    } catch {
      // 指标文件缺失时不阻断主流程，主数据已含兜底字段
    }
    const skills = (data.skills || []).map((s) => {
      const m = metrics[s.name];
      return m ? { ...s, ...m } : s;
    });
    // 防御性兜底：即使数据异常也保证字段存在，避免渲染层崩溃
    cached = {
      total: data.total || skills.length,
      categories: data.categories || [],
      skills,
    };
    return cached;
  } catch (e) {
    // 容错：数据缺失时返回空结构，页面不崩溃
    return { total: 0, categories: [], skills: [] };
  }
}
