// tools/lib/taxonomy.mjs — 共享分类法与契约定义（单一权威源）
//
// 原散落于 build-skills-data.mjs（CATEGORY_ORDER / CATEGORY_EN）与
// validate-skills.mjs（VALID_CATEGORIES / VALID_EN_CATEGORIES / REQUIRED /
// CONTRACT_ORDER / CONFLICT_KEYS）的常量在此统一定义，供所有工具脚本
// 引用，消除「构建通过但校验失败」式的契约/解析漂移。
//
// 13 类分类法（v1.19.x 起由 9 类演进）。值必须与各上游脚本历史实现完全一致。

// 分类展示固定顺序（13 类：9 个稳定主类 + 将「开发框架与平台」拆为 4 个子类）
export const CATEGORY_ORDER = [
  "品牌与设计",
  "文档与内容",
  "数据分析与可视化",
  "前端开发",
  "后端与平台",
  "移动端开发",
  "WordPress 与 CMS",
  "工程实践与质量",
  "文件与格式处理",
  "自动化与集成",
  "AI 与智能体",
  "音视频与多媒体",
  "安全",
];

// 中文分类稳定键 -> 英文名（英文态 chip/筛选展示用；frontmatter en_category 优先）
export const CATEGORY_EN = {
  "品牌与设计": "Brand & Design",
  "文档与内容": "Docs & Content",
  "数据分析与可视化": "Data Analysis & Visualization",
  "前端开发": "Frontend Dev",
  "后端与平台": "Backend & Platform",
  "移动端开发": "Mobile Dev",
  "WordPress 与 CMS": "WordPress & CMS",
  "工程实践与质量": "Engineering Practice & Quality",
  "文件与格式处理": "File & Format Handling",
  "自动化与集成": "Automation & Integration",
  "AI 与智能体": "AI & Agents",
  "音视频与多媒体": "Media & Multimedia",
  "安全": "Security",
};

// 13 类合法中文键集合（与 CATEGORY_ORDER 完全一致）
export const VALID_CATEGORIES = new Set(CATEGORY_ORDER);

// 13 类合法英文键集合（与 CATEGORY_EN 值完全一致）
export const VALID_EN_CATEGORIES = new Set(Object.values(CATEGORY_EN));

// 必填展示字段
export const REQUIRED = [
  "name",
  "description",
  "en_description",
  "zh_displayName",
  "category",
  "en_category",
];

// 契约字段顺序规范：name → description → en_description → zh_displayName → category → en_category
export const CONTRACT_ORDER = [
  "name",
  "description",
  "en_description",
  "zh_displayName",
  "category",
  "en_category",
];

// 冲突键（应并入 description / en_description）
export const CONFLICT_KEYS = ["description_zh", "description_en"];
