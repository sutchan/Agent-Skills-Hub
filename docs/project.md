# 仓库约定（Project Conventions）

> 路径：`docs/project.md` · 版本：1.16.4
> 本文件定义目录结构、变更工作流与术语表。能力契约（frontmatter/数据/红线）的唯一权威源是 [spec.md](spec.md)；AI 协作流程见 [AGENTS.md](AGENTS.md)。

---

## 1. 项目概览

Agent Skills Hub 是面向开发、设计、测试、DevOps、Agent 工程及各行业领域的 AI 技能集合仓库。以 `skills/<name>/SKILL.md` 为核心单元组织，并提供一层可运行的 Web 应用做可视化浏览。当前应用形态为：**自包含静态单页 `src/index.html`**（原生 JS、内联 `window.SKILLS_DATA`）+ **模块化 Express 本地服务 `server/`**（薄装配 `server.js`：静态托管 + 投票/收藏 API + KV 存储）+ **EdgeOne 边缘函数 `edge-worker.js`**（生产侧投票/收藏存储）。`prototype/` 收敛为高保真**设计规范**事实来源，不再是运行产物。

---

## 2. 目录结构约定

| 路径 | 用途 | 变更频率 |
|---|---|---|
| `skills/<name>/SKILL.md` | 单个技能定义（正文 + frontmatter；6 必备字段见 [spec.md §2](spec.md)），技能**内容权威** | ✅ 高频 |
| `skills/<name>/references/`、`scripts/`、`assets/`、`agents/` | 技能的参考资料 / 脚本 / 资源 | ✅ 中频 |
| `src/index.html` | **应用本体**：自包含静态单页（原生 JS、无框架），内联 CSS + `window.SKILLS_DATA`，`server.js` 的 `GET /` 即返回它 | ✅ 高频 |
| `src/app/` | Next.js 16 App Router **重定向存根**（`page.tsx` 将 `/` 跳转到 `/index.html`），对最终页面无实质贡献，仅占位 | ◻️ 低频 |
| `server/` | 本地服务模块化实现：`config.js`（路径/环境常量）、`fs-util.js`（JSON 安全读 + 原子写）、`store.js`（KV 模拟 + 技能白名单）、`ratelimit.js`（IP 限流持久化）、`api.js`（`/api/votes`、`/api/favorites` 路由）、`pages.js`（静态资源与 SPA 回退）；根 `server.js` 为薄装配层（~54 行） | ◻️ 低频 |
| `server.js` | 本地服务入口（Express 薄装配，仅挂载 `server/` 各模块、维持中间件顺序） | ◻️ 低频 |
| `edge-worker.js` + `edgeone.config.json` | 生产边缘函数（Edge KV 命名空间 `ASH_KV`）：投票/收藏键 `vote:<name>`/`fav:<name>`，API 契约与 `server/` 对齐；`*/api/*` 路由指向边缘函数 | ◻️ 低频 |
| `prototype/` | 高保真**设计规范**事实来源：`DESIGN.md` / `COMPONENTS.md` / `wireframes.html` / `states.html` 等；**不参与构建、非运行产物** | ◻️ 低频 |
| `tools/` | 仓库级脚本：`check-version.mjs`（版本/CHANGELOG/tag 一致性）、`ensure-lf.mjs`（LF 归一）、`extract-release-notes.mjs`（抽取发行说明）、`validate-skills.mjs`（校验 `skills/*/SKILL.md` frontmatter，硬失败/软警告）；`tools/lib/` 为 Node 内置测试（`skills-data.test.mjs` 校验 data JSON、`kv-store.test.mjs`） | ◻️ 低频 |
| `scripts/` | `tag-release.mjs`（按 `package.json` 版本幂等创建 `vX.Y.Z` 注解 tag）、`verify-storage.mjs`（votes/favorites API 端到端验证）、`sync-inline-data.mjs`（`npm run sync:data`：从 `data/skills-data.json` 重建 `src/index.html` 内联 `window.SKILLS_DATA`）、`inject-ga.mjs`（构建期将 GA 占位符替换为环境变量 `GA_MEASUREMENT_ID` 写入 `out/index.html`） | ◻️ 低频 |
| `data/` | 提交态数据：`skills-data.json`（技能元数据，权威源）、`skills-metrics.json`（派生指标）、`kv-store.json`（本地投票/收藏真源）、`ratelimit.json`（限流持久化）、`skills-votes.json`（已弃用，空 `{}`） | ✅ 中频 |
| `public/` | 品牌资产（banner / favicon / og 图等），随静态服务对外提供 | ◻️ 低频 |
| `e2e/` | Playwright 冒烟测试（`smoke.spec.ts`，验证 `#grid` 渲染与 `#search` 过滤），CI `e2e` job 真实运行 | ◻️ 低频 |
| `live_page.html` | `src/index.html` 的并行自包含预览快照（同源、内联 `window.SKILLS_DATA`），但 `sync:data` **不覆盖**它，存在版本漂移风险 | ◻️ 低频 |
| `docs/` | 项目文档：`project.md`（约定）、`spec.md`（能力基线/权威契约）、`AGENTS.md`（协作指引）、`tasks.md` / `tasks-done.md`（任务清单） | ✅ 本目录 |
| `.github/` | Community Health Files（`CONTRIBUTING.md` 等）、Issue/PR 模板、CI 工作流（`ci.yml`，Bun + EdgeOne Pages + `bun.lock`） | ◻️ 低频 |

> **关于旧工具链**：`build-skills-data.mjs`、`build.mjs`、`sync-tokens.mjs`、`sync-css.mjs`、`build-votes.mjs`、`import-from-github.mjs`、`tools/lib/taxonomy.mjs`、`src/lib/skills.ts`、`src/components/`、`src/app/globals.css` 等**已移除**，仅在历史 CHANGELOG / 旧文档中出现。**注意：`validate-skills.mjs` 已在 v1.16.x 恢复**，现位于 `tools/` 并校验 `skills/*/SKILL.md` 源 frontmatter，不再属于「已移除」清单。

---

## 3. 变更工作流（docs/tasks.md）

变更统一通过 [docs/tasks.md](tasks.md) 任务清单跟踪，直接提交到 `main`：

1. **登记任务**：在 `tasks.md` 新增任务条目（标题 / 优先级 / 状态 / 备注），描述变更范围。
2. **实施**：按仓库规范改动。
   - 改技能展示数据：先编辑 `data/skills-data.json`（+ 需要时 `skills-metrics.json`）——二者为**提交态、手工维护**，**无从 `skills/*/SKILL.md` 自动生成脚本**；保存后运行 `npm run sync:data` 自动重建 `src/index.html` 内联 `window.SKILLS_DATA`（单向：data → 内联）。
   - 改前端交互：编辑 `src/index.html`（原生 JS，注意其为单文件内联结构，豁免 >200 行拆分）。
3. **验收**：`node tools/validate-skills.mjs`（SKILL.md frontmatter）、`node --test tools/lib/*.test.mjs`（data JSON 回归）、`tsc --noEmit`、`node tools/check-version.mjs`；`npm run dev` 起 `server.js` 预览；`npm run e2e`（Playwright 冒烟）、必要时 `node scripts/verify-storage.mjs` 验证投票/收藏存储。
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
| 本地服务 | `server/`（config/fs-util/store/ratelimit/api/pages）+ 薄装配 `server.js`（Express）：静态托管收窄为 `public/` 与 `/skills`（不再挂载整个 `src/`），提供 `/api/votes`、`/api/favorites`；KV 落 `data/kv-store.json`，限流持久化 `data/ratelimit.json`（120 次/分/IP） |
| 边缘后端 | `edge-worker.js` + EdgeOne Edge KV（`ASH_KV`）：生产侧投票/收藏存储，API 契约同 `server/` |
| 数据源（展示数据） | `data/skills-data.json`：提交态、**手工维护**的技能元数据（**无 `SKILL.md`→data 自动生成脚本**）；`skills/*/SKILL.md` 是技能**内容**权威，二者间无自动桥接（`sync:data` 仅 data→内联单向） |
| 派生指标 | `data/skills-metrics.json`：以 `name` 为 key 的 map（popularity/size/files 等），同为提交态、手工维护 |
| 投票/收藏真源 | 本地 `data/kv-store.json`（`server/` 原子写）；生产 Edge KV |
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
