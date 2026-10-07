# Agent-Skills-Hub 能力基线（Spec）

> 路径：`docs/spec.md` · 版本：1.14.74
> 本文件固化**当前已落地能力**的基线规范，是 frontmatter 契约、数据契约与一致性红线的**唯一权威源**（变更起点与回退基准）。
> 仓库约定见 [project.md](project.md)；AI 协作流程见 [AGENTS.md](AGENTS.md)；贡献指引见 [CONTRIBUTING.md](../.github/CONTRIBUTING.md)。

---

## 1. 范围与权威源

- **项目定位**：Agent 技能集合仓库，提供 `skills/`（原始技能）、`prototype/`（静态展示页）、`app/`（Next.js 14 + React 18 应用工作区）三套资产。
- **技能权威源**：磁盘 `skills/<name>/SKILL.md` 的 frontmatter，构建脚本唯一读取源。
- **设计令牌权威源**：`prototype/src/styles/tokens.css`（单一来源，浅/深双主题；主色绿：浅 `#2e9e6b`、深 `#5cc98c`）。
- **版本权威源**：根 `package.json` 的 `version`（当前 1.14.74）。README 中/英徽章、CHANGELOG 顶部、各文档头注释须与之保持一致。

---

## 2. Frontmatter 契约（必填六字段）

`SKILL.md` 以 YAML frontmatter 开头，前 6 个为**契约字段**（顺序固定，CI 校验）：

| 顺序 | 字段 | 语义 | 约束 |
|---|---|---|---|
| 1 | `name` | 技能名（kebab-case） | 与目录名一致，唯一键 |
| 2 | `description` | 中文完整描述 | 默认展示语言，用 `\|-\` 块标量，禁双引号单行包裹 |
| 3 | `en_description` | 英文原文描述 | 处理技能时保留，与 `description` 中英共存 |
| 4 | `zh_displayName` | 中文一句话摘要 | 卡片标题 |
| 5 | `category` | 中文分类键 | **14 大稳定领域**之一（见 §2.1） |
| 6 | `en_category` | 英文分类名 | 与 `category` 对应（如 `品牌与设计`→`Brand & Design`） |

**字段顺序规范**：`name`→`description`→`en_description`→`zh_displayName`→`category`→`en_category`，其后为可选身份/来源/能力字段，最后为 `metadata` 嵌套块。未知字段追加在 `metadata` 之前。

**可选字段**（平台/工具元数据，不参与展示）：`version` / `compatibility` / `license` / `author` / `homepage` / `displayName` / `emoji` / `slug` / `keywords` / `argument-hint` / `effort` / `user-invocable` / `allowed-tools` / `disable-model-invocation` / `hooks` / `model` / `risk_level` / `acceptLicenseTerms` / `hidden` / `origin` / `last_modified` / `metadata`。

**禁止字段**：不得出现 `description_zh` / `description_en` 等冲突键；中文译文统一写 `description`，英文原文写 `en_description`。

### 2.1 14 大领域（稳定分类键）

固化于 `tools/lib/taxonomy.mjs` 的 `CATEGORY_ORDER`。新增分类须同步三处：①`taxonomy.mjs` ②`validate-skills.mjs`（注释文案）③README 中/英领域表。未知分类会被构建脚本自动追加为末位「其他」类（**属违规，须为零**）。

| 中文键 | 英文 |
|---|---|
| 品牌与设计 | Brand & Design |
| 文档与内容 | Docs & Content |
| 数据分析与可视化 | Data Analysis & Visualization |
| 前端开发 | Frontend Dev |
| 后端与平台 | Backend & Platform |
| 移动端开发 | Mobile Dev |
| WordPress 与 CMS | WordPress & CMS |
| 工程实践与质量 | Engineering Practice & Quality |
| 文件与格式处理 | File & Format Handling |
| 自动化与集成 | Automation & Integration |
| AI 与智能体 | AI & Agents |
| 音视频与多媒体 | Media & Multimedia |
| 桌面与客户端 | Desktop & Client |
| 安全 | Security |

---

## 3. 数据契约（构建产物）

由 `tools/build-skills-data.mjs` 从磁盘 `skills/<name>/SKILL.md` 解析生成，**拆分为两份产物**：`data/skills-data.json`（稳定元数据）+ `data/skills-metrics.json`（频繁派生指标，以 `name` 为 key 的 map），二者合并后由 `tools/build.mjs` 内联进 `prototype/prototype.html`，`app/lib/skills.ts` 的 `loadSkills()` 亦读取并合并。

### 3.1 技能条目（SkillEntry）

```ts
type SkillEntry = {
  name: string;            // 目录名（kebab-case），唯一键
  category: string;        // 中文分类名（稳定键）
  enCategory: string;      // 英文分类名（en_category）
  zh: string;              // 中文一句话摘要（zh_displayName）
  description: string;     // 中文完整描述（默认展示语言）
  enDescription: string;   // 英文原文描述（en_description）
  allowedTools: string[];  // allowed-tools（无则 []）
  hidden: boolean;         // 是否隐藏（hidden:true，如内部预览用 agent-browser）
  source?: string;         // 可选，上游 owner/repo（溯源 skills.sh）
  homepage?: string;       // 可选，来源网址
  installCommand: string;  // 恒定派生：npx skills add sutchan/Agent-Skills-Hub/skills/<name>
  githubDir: string;       // 恒定派生：skills/<name>
  tags?: string[];         // 关键词派生标签（见 §3.4）
};
```

### 3.2 派生指标（SkillMetrics）

```ts
type SkillMetrics = {
  popularity?: number;     // 被其他技能 description 提及次数
  size?: number;           // 目录总字节数
  files?: number;          // 文件数（递归）
  stars?: number;          // GitHub 星标（定期抓取）
  firstSeen?: string;      // 首次收录日期
  skillVersion?: string;   // 技能版本
};
```

### 3.3 顶层结构（SkillsData）

```ts
type SkillsData = {
  total: number;                     // 过滤 hidden 后的可见技能数（动态统计，非硬编码）
  categories: string[];              // 去重中文分类名（由 skills[].category 推导，不存 count）
  categoryEn: Record<string,string>; // 中文→英文映射（英文态 chip/展示）
  skills: SkillEntry[];
};
```

### 3.4 一致性规则

- `category` 必须是 **14 大稳定中文分类键**之一；`en_category` 为对应英文名；未知分类自动归「其他」类（须为零）。
- **中英共存**：处理技能时必须同时提供中文 `description` 与英文 `en_description`；`enDescription` 由构建脚本读取 `en_description`。
- `data/*.json` 均为**构建产物，勿手改**，重跑 `npm run build` 再生；频繁更新指标只需重算 `skills-metrics.json`。
- **标签（tags）**：由 `deriveTags()` 基于 description/enDescription/category 关键词自动派生，原型（`02-render.js`）与 app（`SkillsExplorer.tsx`）均消费做第二组「功能标签」筛选（多选 OR，与分类以 AND 组合）；未命中的技能不渲染标签 chip。

---

## 4. 构建与发版

- **构建**：`npm run build` = `build-skills-data.mjs` → `build.mjs` → `sync-tokens.mjs` → `sync-css.mjs` → `next build`；产物 `data/*.json` + `prototype/prototype.html` + `.next/`。
- **发版步骤**：bump `package.json` version → 重跑 build → 同步版本展示位与 CHANGELOG → 打 tag `vX.Y.Z` 推送。
- **CI 门禁**：`validate-skills` 为硬门禁（frontmatter 被破坏即阻断）；`check-version.mjs` 校验 `package.json` == 最新 CHANGELOG == git tag 三者一致。

---

## 5. 展示页（原型）与 app 交互（已落地）

`prototype/prototype.html` 为自包含静态页（无 React/Next 运行时）；`app/` 为同数据的 Next.js 应用。完整交互细节以 [project.md](project.md) 与 `prototype/DESIGN.md` / `prototype/COMPONENTS.md` 为准，要点：

- **搜索**：前端关键词匹配 `name` / `zh` / `description`，即时过滤。
- **分类筛选**：分类 chip 多选（OR），「全部」复位。
- **标签筛选**：功能标签 chip 多选（OR），与分类以 AND 组合。
- **视图**：`grid` / `list` 仅改布局，不影响过滤。
- **详情弹窗**：语义化 `id` + `aria-modal` + `aria-labelledby`，展示中英描述、分类、allowedTools，支持分享。
- **语义化 id**：原型/app 主要容器与弹窗均加 kebab-case 语义化 `id` 与 ARIA 属性（便于调试/无障碍/e2e 定位）。

## 6. 分享功能（已落地）

技能详情点击「分享」复制**分析链接**（技能详情页 URL `skills/<name>/`）：

1. 剪贴板 = 链接 + 一条**随机**宣传文案（中/英各 ≥3 条，按当前语言随机取 1 条），二者以空行分隔，纯文本。
2. 文案统一定义于 `prototype/src/i18n.js` 的 `share.promos`（zh/en），`app/lib/share.ts` 复用同一集合，不重复定义。
3. 链接构造：优先 `location.origin + 根 path + skills/<name>/`，离线回退相对路径。
4. 复制容错：`navigator.clipboard.writeText` → 降级 `execCommand('copy')` → 明确失败提示。
5. 反馈：轻量 toast（`role="status"` / `aria-live="polite"`，3 秒消失、可键盘关闭）；分享按钮带 `aria-label`。

---

## 7. 一致性红线（本仓库强制约束）

> 红线为**硬约束**，违反即阻断 CI 或导致数据/展示失真。

1. **单一数据源**：技能权威 = 磁盘 `skills/<name>/SKILL.md`；`data/*.json` 与 `prototype/prototype.html` 为构建产物，**勿手改**，重跑 `npm run build` 再生。
2. **无嵌套副本**：技能仅落 `skills/<name>/`，禁止 `skills/<x>/skills/<name>/` 之类嵌套。
3. **数据有效性**：展示须与磁盘一致；删除技能同步清理 `README.md` 与 `tasks.md`。
4. **展示页规范**：UI 须对齐 `prototype/DESIGN.md`（配色令牌、响应式、可访问性、品牌形象）。
5. **原型可复现**：改展示效果须重跑 build 并同步 `prototype/prototype.html`；`DESIGN.md` / `COMPONENTS.md` 须与实际产物一致。
6. **设计令牌**：仅改 `prototype/src/styles/tokens.css`，禁止在 `prototype/src/` 其他 css/html 散写颜色字面量（改后须 rebuild）。
7. **换行符**：`skills/**` 强制 LF（CRLF 红线，详见 CONTRIBUTING「文件换行符规范」）。
8. **版本 bump**：任何文件修改升最小版本号；仅被改文件的头注释版本号更新，**禁止全仓库批量刷写头注释**。
9. **数据型数字**：README 中/英技能总数与领域表计数须以 `data/skills-data.json` 实算，**禁止手填**。
10. **语义化 id**：原型/app 主要容器加 kebab-case 语义化 `id`（见 §5）。
11. **代码拆分**：源代码单文件 >200 行须按职责拆分（**仅代码文件，文档不拆**）。
12. **提交信息**：遵循 `<type>: <描述>`（Conventional Commits，详见 CONTRIBUTING「提交规范」）。

---

## 8. 演进方式

- 任何对已落地能力的修改，先在 [tasks.md](tasks.md) 登记任务（参考 [AGENTS.md](AGENTS.md)），完成后将任务状态更新为「已完成」。
- 本 spec 仅在能力真正落地/移除时更新，保持「当前真相」语义。

---

## 9. 外部技能生态参考（skills.sh）

本仓库并非封闭孤岛——业界存在开放的 **Agent Skills 生态系统 [skills.sh](https://www.skills.sh)**（由 Vercel 出品、技能开源在 GitHub），是当前最权威的开放 Agent Skills 目录，可作为本仓库的**选品参考、能力对标与补充来源**。

### 9.1 生态概况
- **定位**：开放的 Agent 技能目录（"The Open Agent Skills Ecosystem"），技能即"AI 代理可复用的能力"，通过 CLI 一键安装增强代理的程序性知识。
- **安装方式**：`npx skills add <owner/repo>`（官方 CLI，如 `npx skills add vercel-labs/agent-browser`）。
- **分类（Topics）**：React、Next.js、Design & UI、Mobile、Agent workflows、Databases、Testing、Marketing 等。
- **主流技能示例**：`find-skills`（vercel-labs/skills）、`agent-browser`（vercel-labs/agent-browser）、`frontend-design`（anthropics/skills）、`grill-me` / `tdd` / `prototype`（mattpocock/skills）、`vercel-react-best-practices`（vercel-labs/agent-skills）等。

### 9.2 程序化访问（API 与数据源）
- **skills.sh 橱窗 API**（仅选品/发现用）：基址 `https://skills.sh/api/v1/`，HTTPS + JSON；需 Vercel OIDC Token（`Authorization: Bearer` 或 `x-vercel-oidc-token`），否则 401；限流 600 请求/分钟。端点 `GET /skills`（排行榜 view=all-time|trending|hot）、`/skills/search`（q/limit/owner）、`/skills/curated`（官方精选）、`/skills/{source}/{skill}`（详情 files[] 含 SKILL.md 原文）。列表/搜索返回 `V1Skill`（`id/slug/name/source/installs/installUrl/url`），**不直接暴露 `category`/`description`**，主题分类仅见于网页 Topics 导航。
- **真实数据源是 GitHub 仓库**（skills.sh 仅为展示橱窗，其 API 不给 SKILL.md 内容）。`npx skills` CLI（vercel-labs/skills）完全**不依赖 skills.sh API**，公开仓库免 token 直连 GitHub。
- **免 token 批量导入链路**（已落地 `tools/import-from-github.mjs`）：
  1. `GET api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1` 递归列出所有 `SKILL.md`（匿名限流 60/小时）；
  2. `GET raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}` 拉取文件（自带 302 重定向跟随）；
  3. 解析 frontmatter → 去重（本地 `skills/<name>/` 已存在则 SKIP）→ 14 类分类映射（关键词粗匹配，人工复核）→ 补 4 必备字段（`zh_displayName`/`category`/`en_category`/`en_description`）+ `source:<owner/repo>` 溯源。
- 上游 `SKILL.md` 通常仅含 `name`/`description`(英文)/`license`/`metadata`，**全缺本仓库 4 必备字段**，`description` 需译为中文（默认展示语言）。导入工具默认 `--dry-run` 仅打印计划，加 `--write` 才落盘。

### 9.3 与本仓库的关系
- **选品/对标**：新增本地技能前，可先在 skills.sh 检索同类能力，避免重复造轮子、借鉴其 frontmatter 结构。
- **溯源标注**：凡本地技能源自 skills.sh 生态上游，建议在 `SKILL.md` frontmatter 标注 `source: <owner/repo>`，由 `build-skills-data.mjs` 读取写入 `SkillEntry.source`，便于外部溯源（见 §3.1）。
- **不强制同步**：本仓库自有 14 大稳定分类体系（见 §2.1，外加须清零的「其他」违规类），不照搬 skills.sh 的 Topics 分类；两者分类维度不同，仅作参考。
