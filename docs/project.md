# 仓库约定（Project Conventions）

> 路径：`docs/project.md` · 版本：1.16.30
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
| `next.config.mjs` + `vercel.json` | Next.js 纯静态导出契约：`output: "export"` → 产物 `out/`；`vercel.json` 声明 `buildCommand: "npm run build"` 与 `outputDirectory: "out"`，修复 Vercel 的 `STATIC_BUILD_NO_OUT_DIR`（项目设置优先级更高，须同步为 `out` 或留空） | ◻️ 低频 |
| `server/` | 本地服务模块化实现：`config.js`（路径/环境常量）、`fs-util.js`（JSON 安全读 + 原子写）、`store.js`（技能名白名单；v1.16.25 移除内存 KV）、`blob-store.js`（**统一存储层**：Vercel Blob / 本地文件回退）、`kv-ops.js`（校验/计票共用逻辑）、`ratelimit.js`（IP 限流持久化）、`api.js`（async `/api/votes`、`/api/favorites`）、`pages.js`（静态资源与 SPA 回退）；根 `server.js` 为薄装配层 | ◻️ 低频 |
| `api/` | **Vercel Serverless Functions**（v1.16.25 起）：`votes.js` / `favorites.js` 提供生产 `/api/*`，复用 `server/blob-store.js` + `server/kv-ops.js`，CORS + OPTIONS 预检 | ◻️ 低频 |
| `server.js` | 本地服务入口（Express 薄装配，仅挂载 `server/` 各模块、维持中间件顺序） | ◻️ 低频 |
| `edge-worker.js` + `edgeone.config.json` | 历史生产方案（Edge KV `ASH_KV`，键 `vote:<name>`/`fav:<name>`）；v1.16.25 起生产 API 改由 Vercel Functions + Blob 提供，本文件保留作回退参考 | ◻️ 低频 |
| `prototype/` | 高保真**设计规范**事实来源：`DESIGN.md` / `COMPONENTS.md` / `wireframes.html` / `states.html` / `template.html`（DOM 结构契约，v1.16.19 起无占位符）等；**不参与构建、非运行产物** | ◻️ 低频 |
| `tools/` | 仓库级脚本：`check-version.mjs`（版本/CHANGELOG/tag 一致性）、`ensure-lf.mjs`（LF 归一）、`extract-release-notes.mjs`（抽取发行说明）、`validate-skills.mjs`（校验 `skills/*/SKILL.md` frontmatter，硬失败/软警告）、`check-skill-yaml.mjs`（Bun 真实 YAML 解析校验 frontmatter，`npm run validate:yaml`）；`tools/lib/` 为 Node 内置测试（`skills-data.test.mjs` 校验 data JSON、`kv-store.test.mjs`） | ◻️ 低频 |
| `scripts/` | `tag-release.mjs`（按 `package.json` 版本幂等创建 `vX.Y.Z` 注解 tag）、`verify-storage.mjs`（votes/favorites API 端到端验证）、`sync-inline-data.mjs`（`npm run sync:data`：从 `data/skills-data.json` 重建 `src/index.html` 内联 `window.SKILLS_DATA`）、`inject-ga.mjs`（构建期以 `src/index.html` 为源生成 `out/index.html`，并注入 GA / 版本 / 构建号，占位符残留时硬失败）、`sync-seo-assets.mjs`（`npm run sync:seo`：幂等生成 SEO/GEO 资产并注入页面生成区）、`seo/`（`facts` / `render-assets` / `render-page` 生成模块） | ◻️ 低频 |
| `data/` | 提交态数据：`skills-data.json`（技能元数据，权威源）、`skills-metrics.json`（派生指标）；运行时状态 `kv-store.json` / `ratelimit.json` 已 gitignore（v1.16.18 起不再跟踪），由 `server/blob-store.js`（本地回退）/ `server/ratelimit.js` 首次写入自建；**生产真源为 Vercel Blob 对象 `kv-store.json`**（v1.16.25 起）；`skills-votes.json` 已删除 | ✅ 中频 |
| `public/` | 品牌资产（banner / favicon / og 图等）+ **SEO/GEO 抓取层**：`robots.txt` / `sitemap.xml` / `llms.txt` / `llms-full.txt`（均由 `sync-seo-assets.mjs` 生成）+ `data/skills-data.json`（权威数据的只读发布副本，保证静态部署产物中该 URL 可达）；随静态服务与 `out/` 对外提供 | ◻️ 低频 |
| `e2e/` | Playwright 冒烟测试（`smoke.spec.ts`，验证 `#grid` 渲染与 `#search-input` 过滤），CI `e2e` job 真实运行 | ◻️ 低频 |
| ~~`live_page.html`~~ | **已移除**（v1.16.x）：曾为并行自包含快照，存在版本漂移风险，已从仓库删除；现仅 `src/index.html` 单一站点本体 | — |
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
3. **验收**：`node tools/validate-skills.mjs`（SKILL.md frontmatter）、`npm run validate:yaml`（Bun 真 YAML 解析）、`node --test tools/lib/*.test.mjs`（data JSON 回归）、`tsc --noEmit`、`node tools/check-version.mjs`、`node tools/check-inline-js.mjs`；`npm run dev` 起 `server.js` 预览；`npm run e2e`（Playwright 冒烟）、必要时 `node scripts/verify-storage.mjs` 验证投票/收藏存储。
   - **改 id 时**：kebab-case 命名，同步 `src/index.html`（CSS/JS 选择器 + ARIA 关联）、三份 `prototype/*.html`、`e2e/smoke.spec.ts` 与 `DESIGN.md §4.7`；禁止重复 id 与 camelCase 别名。
   - **拆分约束**：自有源码（`server/`、`tools/`、`scripts/`、`e2e/`、`src/app/`、`edge-worker.js`）均须 ≤200 行；`src/index.html` 按 [spec.md §7 红线 10](spec.md) 作为自包含单文件应用豁免；`skills/` 为上游技能包，不纳入本项目源码拆分范围；文档（含 `prototype/*.html` 设计稿）保持完整不拆分。
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
| 本地服务 | `server/`（config/fs-util/store/blob-store/kv-ops/ratelimit/api/pages）+ 薄装配 `server.js`（Express）：静态托管收窄为 `public/` 与 `/skills`，提供 `/api/votes`、`/api/favorites`；无 token 时 KV 落 `data/kv-store.json`，限流持久化 `data/ratelimit.json`（120 次/分/IP） |
| 生产后端 | Vercel Serverless Functions `api/votes.js` / `api/favorites.js` + Vercel Blob（v1.16.25 起）；`server/blob-store.js` 按 `VERCEL`/`USE_BLOB` 与 token 自动切换 Blob/本地。历史 `edge-worker.js` + Edge KV（`ASH_KV`）保留作回退参考 |
| 数据源（展示数据） | `data/skills-data.json`：提交态、**手工维护**的技能元数据（**无 `SKILL.md`→data 自动生成脚本**）；`skills/*/SKILL.md` 是技能**内容**权威，二者间无自动桥接（`sync:data` 仅 data→内联单向） |
| 派生指标 | `data/skills-metrics.json`：以 `name` 为 key 的 map（popularity/size/files 等），同为提交态、手工维护 |
| 投票/收藏真源 | 生产 Vercel Blob 私有对象 `kv-store.json`（v1.16.25 起，`{ votes, favorites }`）；本地无 token 时回退 `data/kv-store.json`（原子写） |
| 原型 | `prototype/`：高保真设计规范事实来源（`DESIGN.md` 等），非运行产物 |
| 14 大领域 | 稳定中文分类键契约（见 [spec.md §2.1](spec.md)），运行数据固化于 `src/index.html` 内联数据（sync:data 派生注入，当前 13 键活跃） |
| frontmatter 契约 | `name`/`description`(中)/`en_description`(英)/`zh_displayName`/`category`(14类键，当前活跃13类)/`en_category` 六必备字段，顺序固定 |
| 界面语言优先级 | 简体中文 `zh`（默认）> 繁体中文 `tw`（`html lang="zh-Hant"`）> 英语 `en`；`src/index.html` 内联 `translations` 三份字典键位一一对应 |
| 技能数据语言 | 技能名称/描述仅有简体中文与英文原文两版（`description` / `enDescription`）；繁体界面下回退简体名 + 英文副标题，待数据级繁体化 |
| 数据型数字 | README/应用内技能总数与领域表计数，须以 `data/skills-data.json` 实算，禁止手填 |
| 红线 | 本仓库强制约束（见 [spec.md §7](spec.md)），违反即导致数据/展示失真或破坏契约 |

---

## 6. 文档索引与引用关系

- **spec.md**（权威）：frontmatter 契约、数据契约、构建部署、一致性红线。
- **project.md**（本文件）：目录结构、变更工作流、任务准则、术语表。
- **AGENTS.md**：AI 助手协作流程与质量门禁。
- **CONTRIBUTING.md**（`.github/`）：贡献者操作指南。
- 所有规范文档互为引用、不重复定义；冲突以 **spec.md** 为准。
