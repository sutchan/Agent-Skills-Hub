# 仓库约定（Project Conventions）

> 路径：`docs/project.md` · 版本：1.14.76
> 本文件定义目录结构、变更工作流与术语表。能力契约（frontmatter/数据/红线）的唯一权威源是 [spec.md](spec.md)；AI 协作流程见 [AGENTS.md](AGENTS.md)。

---

## 1. 项目概览

Agent Skills Hub 是面向开发、设计、测试、DevOps、Agent 工程及各行业领域的 AI 技能集合仓库。以 `skills/<name>/SKILL.md` 为核心单元组织，并提供 `app/`（可运行 Web 应用源码）与 `prototype/`（预构建静态展示页）两层 Web 产物做可视化浏览与开发。

---

## 2. 目录结构约定

| 路径 | 用途 | 变更频率 |
|---|---|---|
| `skills/<name>/SKILL.md` | 单个技能定义（正文 + frontmatter；6 必备字段见 [spec.md §2](spec.md)），构建脚本以磁盘为准读取 | ✅ 高频 |
| `skills/<name>/references/`、`scripts/`、`assets/`、`agents/` | 技能的参考资料 / 脚本 / 资源 | ✅ 中频 |
| `README.md` / `README.en.md` | 技能清单（中/英文描述映射、领域概览表） | ✅ 中频 |
| `app/` | 项目 Web 应用源码工作区（Next.js 14 + React 18；`dev`/`build`/`start`），从 SKILL.md 生成数据；入口 `app/page.tsx`/`app/layout.tsx`/`app/globals.css`，共享逻辑 `app/lib/`（`skills.ts` 数据读取与类型、`share.ts` 分享文案），品牌资产在仓库根 `public/`，组件 `app/components/`（含 `detail/` 子模块），主题令牌 `app/tokens-shared.css`（由 `tools/sync-tokens.mjs` 从原型 `tokens.css` 同步） | ✅ 中频 |
| `prototype/` | 预构建静态 HTML 高保真原型（打开 `prototype/prototype.html` 预览） | ✅ 中频 |
| `prototype/DESIGN.md`、`prototype/COMPONENTS.md` | 原型设计规范与组件库说明（源码 `prototype/src/` 随仓库分发；`prototype/` 下的 `prototype.html`/`favicon.svg`/`banner-og.svg` 为构建产物） | ✅ 中频 |
| `tools/` | 仓库级脚本：`build-skills-data.mjs`（解析 SKILL.md 生成数据）、`build.mjs`（合并数据内联构建原型）、`sync-tokens.mjs`/`sync-css.mjs`（令牌/样式同步至 app）、`validate-skills.mjs`（frontmatter 契约校验）、`ensure-lf.mjs`（统一 LF）、`import-from-github.mjs`（生态导入） | ◻️ 低频 |
| `docs/` | 项目文档：`project.md`（约定）、`spec.md`（能力基线/权威契约）、`AGENTS.md`（协作指引）、`tasks.md`（任务清单，变更跟踪） | ✅ 本目录 |
| `.github/` | Community Health Files：`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`SUPPORT.md`、Issue/PR 模板、CI 工作流 | ◻️ 低频 |

---

## 3. 变更工作流（docs/tasks.md）

本仓库**不使用 OpenSpec CLI**，变更统一通过 [docs/tasks.md](tasks.md) 任务清单跟踪，直接提交到 `main`：

1. **登记任务**：在 `tasks.md` 新增任务条目（标题 / 优先级 / 状态 / 备注），描述变更范围与动机。
2. **实施**：按仓库规范改动（技能改 `skills/<name>/SKILL.md`，文档改对应 `.md`）；涉及展示页须重跑 `npm run build` 重新生成 `data/` 与 `prototype/prototype.html`。
3. **验收**：运行 `node tools/validate-skills.mjs` 校验 frontmatter 契约；确保 README 中/英、CHANGELOG、package.json 版本一致（每次修改 bump 最小版本号，仅更新被改文件头注释）。
4. **归档**：完成后将 `tasks.md` 任务状态更新为「已完成」，并在 `CHANGELOG.md` 新增对应版本小节；无 `openspec archive` 步骤。

---

## 4. 任务条目准则

- 每个任务须可独立验证，标注涉及文件与优先级（P0/P1/P2）。
- 任务描述聚焦「做什么 & 为什么」，实现细节写在对应变更的文件里，不重复全文。
- 复杂跨文件变更可在 `tasks.md` 备注栏附设计要点；无需单独的 proposal/design 产物文件。

---

## 5. 术语表

> 术语定义以本表为准，跨文档统一使用以下中文术语（避免同物异名）。

| 术语 | 含义 |
|---|---|
| 技能（Skill） | `skills/<name>/` 目录，含 `SKILL.md`（frontmatter + 说明），本仓库最小可分发单元 |
| 展示页 / 原型 | `prototype/prototype.html`，由 `tools/build.mjs` 从 `data/` 内联构建的自包含静态 HTML |
| app | `app/` 下的 Next.js 14 + React 18 Web 应用，`npm run build` 产物部署于 EdgeOne |
| 数据源（权威源） | 技能权威 = 磁盘 `skills/<name>/SKILL.md` frontmatter；构建脚本唯一读取源 |
| 构建产物 | `data/skills-data.json`、`data/skills-metrics.json`、`prototype/prototype.html`（由 `npm run build` 生成，**勿手改**） |
| 14 大领域 | 稳定中文分类键（见 [spec.md §2.1](spec.md)），固化于 `tools/lib/taxonomy.mjs` 的 `CATEGORY_ORDER` |
| frontmatter 契约 | `name`/`description`(中)/`en_description`(英)/`zh_displayName`/`category`(14类键)/`en_category` 六必备字段，顺序由 `tools/validate-skills.mjs` 校验 |
| 数据型数字 | README 中/英的技能总数与领域表计数，须以 `data/skills-data.json` 实算，禁止手填 |
| 红线 | 本仓库强制约束（见 [spec.md §7](spec.md)），违反即阻断 CI 或导致数据/展示失真 |
| 一致性红线 | 上述红线中与版本/数据/格式一致性相关的子集 |

---

## 6. 文档索引与引用关系

- **spec.md**（权威）：frontmatter 契约、数据契约、构建发版、一致性红线、外部生态。
- **project.md**（本文件）：目录结构、变更工作流、任务准则、术语表。
- **AGENTS.md**：AI 助手协作流程与质量门禁。
- **CONTRIBUTING.md**（`.github/`）：贡献者操作指南（新增技能、构建、版本同步、部署、提交、PR）。
- 所有规范文档互为引用、不重复定义；冲突以 **spec.md** 为准。
