# Agent-Skills-Hub 能力基线（Spec）

> 路径：`openspec/spec.md` · 版本：1.19.38
> 本文件固化**当前已落地能力**的基线规范，作为变更的起点与回退基准。
> 详细数据契约、交互与分享规则见 [`project.md`](project.md)；演进提案见 [`changes/`](changes/)，已归档变更见 [`archive/`](archive/)。

---

## 1. 范围与权威源

- **项目定位**：Agent 技能集合仓库，提供 `skills/`（原始技能）、`prototype/`（静态展示页）、`app/`（Next.js 应用工作区）三套资产。
- **设计令牌权威源**：`prototype/src/styles/tokens.css`（单一来源，浅/深双主题）。主色绿：浅 `#2e9e6b`、深 `#5cc98c`。
- **版本权威源**：仓库根 `package.json` 的 `version`（当前 1.19.38）。README 中英文徽章、CHANGELOG 顶部须与之保持一致。

---

## 2. 数据契约（已落地）

展示页与任何消费方共享的数据结构，由 `build-skills-data.mjs` 从磁盘 `skills/<name>/SKILL.md` 解析生成，输出至仓库根 `data/skills-data.json`，再由 `build.mjs` 内联进 `prototype/index.html`。

### 2.1 技能条目（SkillEntry）
```ts
type SkillEntry = {
  name: string;            // 目录名（kebab-case），唯一键
  category: string;        // 中文分类名（稳定键，如 "品牌与设计"）
  enCategory: string;      // 英文分类名（SKILL.md frontmatter en_category，英文态展示）
  zh: string;              // 中文一句话描述
  description: string;     // 中文完整描述（默认展示语言，SKILL.md frontmatter description）
  enDescription: string;   // 英文原文描述（SKILL.md frontmatter en_description）
  allowedTools: string[];  // SKILL.md frontmatter 的 allowed-tools（无则 []）
  hidden: boolean;         // 是否在展示页/索引中隐藏（frontmatter hidden:true，如 agent-browser 等内部预览用）
  source?: string;         // 可选，外部上游 owner/repo（如 "vercel-labs/agent-browser"），指向开放生态 skills.sh 的溯源链接
};
```

### 2.2 顶层结构
```ts
type SkillsData = {
  total: number;           // = 过滤 hidden 后的可见技能数（动态统计，非硬编码）
  categories: string[];    // 去重后的中文分类名（由 skills[].category 推导，不存 count）
  categoryEn: Record<string, string>; // 分类中文名 -> 英文名映射（英文态 chip/展示用）
  skills: SkillEntry[];
};
```

### 2.3 一致性规则（固化）
- `category` 必须是 9 大稳定中文分类键之一（见 §1 / README 领域表格）；`en_category` 为对应英文名。`build-skills-data.mjs` 以磁盘 `skills/` 为唯一权威源读取这些字段，未知分类自动追加为末位「其他」类（属违规，须为零）。
- `zh` 为中文一句话简介；`description` 为中文完整描述（默认展示语言）；`en_description` 为英文原文描述。**处理技能时必须同时提供中文 `description` 与英文 `en_description`**，`enDescription` 由构建脚本从 frontmatter `en_description` 读取。
- `data/skills-data.json` 为**构建产物，勿手改**，重跑 `npm run build` 再生；README 领域表格的计数须与构建后的 `data/skills-data.json` 一致，数量以 `total`（过滤 hidden 后的可见技能数）为准。

---

## 3. 展示页交互（已落地）

`prototype/index.html` 为自包含静态页（无 React/Next 运行时）：

- **搜索**：前端关键词匹配 `name` / `zh` / `description`，输入即时过滤。
- **分类筛选**：点击分类标签过滤；"全部"重置。
- **卡片网格**：每卡显示头像（首字母）、名称、中文描述、分类标签。
- **详情弹窗**：点击卡片打开 dialog（语义化 `id` + `aria-modal` + `aria-labelledby`），展示中英文描述、分类、allowedTools；支持分享。
- **分享/复制**：将当前技能链接写入剪贴板。
- 主要容器与弹窗均已加语义化 `id` 与 ARIA 属性（便于调试/无障碍/e2e 定位）。

---

## 4. 分享功能（已落地，v1.14.0）

- 技能详情支持生成可分享链接（URL 携带技能标识）。
- 详情页首屏 SEO：`<title>` 与 `<meta name="description">` 使用技能中文名 + 描述。
- 分享文案遵循项目文案基调（见 `project.md` §4.5.2 第4-6条）。

---

## 5. 构建与发版（已落地）

- **构建**：根 `package.json` 的 `npm run build` = `node build-skills-data.mjs && node build.mjs`，产物 `data/skills-data.json` + `prototype/index.html`。
- **发版步骤**：bump `package.json` version → 重跑 build → 同步 README 徽章/CHANGELOG → 打 tag `vX.Y.Z` 推送。
- **CI**：`.github/workflows/` 校验仓库根 `data/skills-data.json`。

---

## 6. 一致性红线（已落地）

1. `data/skills-data.json` 为构建产物，勿手改，重跑 `npm run build` 再生。
2. 设计令牌仅改 `tokens.css`，禁止在 `components.css`/`responsive.css`/`index.html` 散写颜色字面量（改后须 rebuild）。
3. README 中英文、CHANGELOG、package.json 版本号三者一致。
4. 技能 `category` 与 README 分类名严格一致。

---

## 7. 演进方式

- 任何对已落地能力的修改，先在 `changes/` 提案（参考 `AGENTS.md`），归档至 `archive/`。
- 本 spec 仅在能力真正落地/移除时更新，保持"当前真相"语义。

---

## 8. 外部技能生态参考（skills.sh）

本仓库并非封闭孤岛——业界存在开放的 **Agent Skills 生态系统 [skills.sh](https://www.skills.sh)**（由 Vercel 出品、技能开源在 GitHub），是当前最权威的开放 Agent Skills 目录，可作为本仓库的**选品参考、能力对标与补充来源**。

### 8.1 生态概况
- **定位**：开放的 Agent 技能目录（"The Open Agent Skills Ecosystem"），技能即"AI 代理可复用的能力"，通过 CLI 一键安装增强代理的程序性知识。
- **安装方式**：`$ npx skills add <owner/repo>`（官方 CLI，如 `npx skills add vercel-labs/agent-browser`）。
- **分类（Topics）**：React、Next.js、Design & UI、Mobile、Agent workflows、Databases、Testing、Marketing 等。
- **主流技能示例**：`find-skills`（vercel-labs/skills）、`agent-browser`（vercel-labs/agent-browser）、`frontend-design`（anthropics/skills）、`grill-me` / `tdd` / `prototype`（mattpocock/skills）、`vercel-react-best-practices`（vercel-labs/agent-skills）等。

### 8.2 程序化访问（API）
- 基址：`https://skills.sh/api/v1/`，HTTPS + JSON；认证用 Vercel OIDC Token（`Authorization: Bearer` 或 `x-vercel-oidc-token`），否则 401；限流 600 请求/分钟。
- 端点：
  - `GET /skills`：排行榜，`view=all-time|trending|hot`，`page`(0起)、`per_page`(1-500)
  - `GET /skills/search`：语义搜索，`q`(≥2字符)、`limit`(1-200)、可选 `owner`
  - `GET /skills/curated`：官方精选集（含独立 `owner` 字段与 `totalSkills`）
  - `GET /skills/{source}/{skill}`：单个技能详情，`files[]` 含 `SKILL.md` 原文（description 需解析 frontmatter）
- 说明：列表/搜索返回 `V1Skill` 形状（`id/slug/name/source/installs/installUrl/url`），API 不直接暴露 `category`/`description` 独立字段，主题分类仅见于网页 Topics 导航。

### 8.3 与本仓库的关系
- **选品/对标**：新增本地技能前，可先在 skills.sh 检索同类能力，避免重复造轮子、借鉴其 frontmatter 结构。
- **溯源标注**：凡本地技能源自 skills.sh 生态上游，建议在 `SKILL.md` frontmatter 标注 `source: <owner/repo>`，由 `build-skills-data.mjs` 读取写入 `SkillEntry.source`，便于外部溯源（见 §2.1）。
- **不强制同步**：本仓库自有 9 大分类体系（见 §2.2 `categoryEn`），不照搬 skills.sh 的 Topics 分类；两者分类维度不同，仅作参考。
