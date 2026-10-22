# 仓库约定（Project Conventions）

> 路径：`docs/project.md` · 版本：1.14.98
> 本文件定义目录结构、变更工作流与术语表。能力契约（frontmatter/数据/红线）的唯一权威源是 [spec.md](spec.md)；AI 协作流程见 [AGENTS.md](AGENTS.md)。

---

## 1. 项目概览

Agent Skills Hub 是面向开发、设计、测试、DevOps、Agent 工程及各行业领域的 AI 技能集合仓库。以 `skills/<name>/SKILL.md` 为核心单元组织，并提供一层可运行的 Web 应用做可视化浏览。当前应用形态为：**自包含静态单页 `src/index.html`**（原生 JS、内联全部技能数据）+ **Express 本地服务 `server.js`**（静态托管 + 投票/收藏 API）+ **EdgeOne 边缘函数 `edge-worker.js`**（生产侧投票/收藏存储）。`prototype/` 收敛为高保真**设计规范**事实来源，不再是运行产物。

---

## 2. 目录结构约定

| 路径 | 用途 | 变更频率 |
|---|---|---|
| `skills/<name>/SKILL.md` | 单个技能定义（正文 + frontmatter；6 必备字段见 [spec.md §2](spec.md)），技能**内容权威** | ✅ 高频 |
| `skills/<name>/references/`、`scripts/`、`assets/`、`agents/` | 技能的参考资料 / 脚本 / 资源 | ✅ 中频 |
| `src/index.html` | **应用本体**：自包含静态单页（原生 JS、无框架），内联 CSS + `window.SKILLS_DATA`，`server.js` 的 `GET /` 即返回它 | ✅ 高频 |
| `src/app/` | Next.js 16 App Router **重定向存根**（`page.tsx` 将 `/` 跳转到 `/index.html`），对最终页面无实质贡献，仅占位 | ◻️ 低频 |
| `src/parts/03-detail.js` | 技能详情弹窗逻辑源快照（内容已内联进 `src/index.html`，不再被单独加载） | ◻️ 低频 |
| `server.js` | Express 本地服务：静态托管 `src/`、`public/`、`/data`、`/skills`；提供 `GET/POST /api/votes`、`GET/POST /api/favorites`；KV 存储落 `data/kv-store.json`（原子写、120 次/分/IP 限流） | ◻️ 低频 |
| `edge-worker.js` + `edgeone.config.json` | 生产边缘函数（Edge KV 命名空间 `ASH_KV`）：投票/收藏键 `vote:<name>`/`fav:<name>`，API 契约与 `server.js` 对齐；`*/api/*` 路由指向边缘函数 | ◻️ 低频 |
| `prototype/` | 高保真**设计规范**事实来源：`DESIGN.md` / `COMPONENTS.md` / `wireframes.html` / `states.html` 等；**不参与构建、非运行产物** | ◻️ 低频 |
| `tools/` | 仓库级脚本：`check-version.mjs`（版本/CHANGELOG/tag 一致性校验）、`ensure-lf.mjs`（LF 归一）、`extract-release-notes.mjs`（抽取 CHANGELOG 发行说明）；`tools/lib/` 为 Node 内置测试（`skills-data.test.mjs`、`kv-store.test.mjs`） | ◻️ 低频 |
| `scripts/` | `tag-release.mjs`（按 `package.json` 版本幂等创建 `vX.Y.Z` 注解 tag）、`verify-storage.mjs`（对本地 votes/favorites API 做端到端存储验证） | ◻️ 低频 |
| `data/` | 提交态数据：`skills-data.json`（技能元数据）、`skills-metrics.json`（派生指标）、`kv-store.json`（本地投票/收藏真源）、`skills-votes.json`（已弃用，空 `{}`） | ✅ 中频 |
| `public/` | 品牌资产（banner / favicon / og 图等），随静态服务对外提供 | ◻️ 低频 |
| `docs/` | 项目文档：`project.md`（约定）、`spec.md`（能力基线/权威契约）、`AGENTS.md`（协作指引）、`tasks.md` / `tasks-done.md`（任务清单） | ✅ 本目录 |
| `.github/` | Community Health Files（`CONTRIBUTING.md` 等）、Issue/PR 模板、CI 工作流（`ci.yml`，Bun + EdgeOne Pages） | ◻️ 低频 |

> **关于旧工具链**：`build-skills-data.mjs`、`build.mjs`、`validate-skills.mjs`、`sync-tokens.mjs`、`sync-css.mjs`、`build-votes.mjs`、`import-from-github.mjs`、`tools/lib/taxonomy.mjs`、`src/lib/skills.ts`、`src/components/`、`src/app/globals.css` 等**已全部移除**，仅在历史 CHANGELOG / 旧文档中出现，**不再存在**。

---

## 3. 变更工作流（docs/tasks.md）

变更统一通过 [docs/tasks.md](tasks.md) 任务清单跟踪，直接提交到 `main`：

1. **登记任务**：在 `tasks.md` 新增任务条目（标题 / 优先级 / 状态 / 备注），描述变更范围与动机。
2. **实施**：按仓库规范改动。
   - 改技能展示数据：**手工**同步 `data/skills-data.json`、`data/skills-metrics.json` 与 `src/index.html` 内联 `window.SKILLS_DATA`（**当前无自动生成脚本**，详见 [spec.md §3](spec.md)）。
   - 改前端交互：编辑 `src/index.html`（原生 JS，注意其为单文件内联结构）。
3. **验收**：`node --test tools/lib/*.test.mjs`（数据契约回归）、`tsc --noEmit`（类型）、`node tools/check-version.mjs`（版本一致）；本地 `npm run dev` 起 `server.js` 预览，必要时 `node scripts/verify-storage.mjs` 验证投票/收藏存储。
4. **发版**：bump `package.json` version → 更新 `CHANGELOG.md` → `npm run tag`（创建 `vX.Y.Z` tag）→ 推送 tag 触发 CI 部署（EdgeOne Pages）与 GitHub Release。
5. **归档**：完成后将 `tasks.md` 任务状态更新为「已完成」，移入 `docs/tasks-done.md`；无 `openspec archive` 步骤。

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
| 应用 / 展示应用 | `src/index.html`：自包含静态单页（原生 JS、内联 `window.SKILLS_DATA`），即站点本体 |
| 本地服务 | `server.js`（Express）：静态托管 `src/`+`public/`+`/data/`+`/skills/`，并提供投票/收藏 API |
| 边缘后端 | `edge-worker.js` + EdgeOne Edge KV（`ASH_KV`）：生产侧投票/收藏存储，API 契约同 `server.js` |
| 数据源（展示数据） | `data/skills-data.json`：提交态、**手工维护**的技能元数据；`skills/*/SKILL.md` 是技能**内容**权威，但二者之间**无自动构建桥接** |
| 派生指标 | `data/skills-metrics.json`：以 `name` 为 key 的 map（popularity/size/files 等），同为提交态、手工维护 |
| 投票/收藏真源 | 本地 `data/kv-store.json`（`server.js` 原子写）；生产 Edge KV |
| 原型 | `prototype/`：高保真设计规范事实来源（`DESIGN.md` 等），非运行产物 |
| 14 大领域 | 稳定中文分类键（见 [spec.md §2.1](spec.md)），固化于 `src/index.html` 与 `data/skills-data.json` |
| frontmatter 契约 | `name`/`description`(中)/`en_description`(英)/`zh_displayName`/`category`(14类键)/`en_category` 六必备字段，顺序固定 |
| 数据型数字 | README/应用内技能总数与领域表计数，须以 `data/skills-data.json` 实算，禁止手填 |
| 红线 | 本仓库强制约束（见 [spec.md §7](spec.md)），违反即导致数据/展示失真或破坏契约 |

---

## 6. 文档索引与引用关系

- **spec.md**（权威）：frontmatter 契约、数据契约、构建部署、一致性红线。
- **project.md**（本文件）：目录结构、变更工作流、任务准则、术语表。
- **AGENTS.md**：AI 助手协作流程与质量门禁。
- **CONTRIBUTING.md**（`.github/`）：贡献者操作指南。
- 所有规范文档互为引用、不重复定义；冲突以 **spec.md** 为准。
