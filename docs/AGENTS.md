# AI 协作指引（AGENTS）

> 路径：`docs/AGENTS.md` · 版本：1.14.98
> 本文件供 AI 编码助手（如 CodeBuddy / Claude）在处理本仓库变更时遵循。能力契约见 [spec.md](spec.md)，仓库约定见 [project.md](project.md)，贡献操作见 [CONTRIBUTING.md](../.github/CONTRIBUTING.md)。

---

## 快速开始

> 本仓库**不使用 OpenSpec CLI**；变更通过 [docs/tasks.md](tasks.md) 任务清单跟踪，直接提交到 `main`。

变更流程：
1. 在 [docs/tasks.md](tasks.md) 新增任务条目（标题 / 优先级 / 状态 / 备注），描述变更范围。
2. 按仓库规范实施：先读 [spec.md](spec.md) 了解能力契约与一致性红线，再读 [project.md](project.md) 了解目录约定与变更工作流。
3. 本地验收：`node --test tools/lib/*.test.mjs`（数据契约回归）、`tsc --noEmit`（类型）、`node tools/check-version.mjs`（版本一致）；`npm run dev` 起 `server.js` 预览；改投票/收藏可跑 `node scripts/verify-storage.mjs`。
4. 完成后将任务状态更新为「已完成」并归档至 `docs/tasks-done.md`，更新 `CHANGELOG.md`（新增版本小节）。

---

## 角色契约

- **变更前**：先读 `spec.md` 了解当前能力基线（frontmatter 契约、数据契约、一致性红线），再读 `project.md` 了解目录约定与变更工作流。
- **任务登记**：变更统一在 `docs/tasks.md` 登记任务条目；本仓库**不生成 proposal.md / design.md 独立产物文件**，设计要点直接写在对应变更文件或 tasks.md 备注栏。
- **数据纪律（重要，已变）**：`data/skills-data.json` / `skills-metrics.json` 是**提交态、手工维护**的数据，`npm run build` **不再生成它们**。改技能展示须**手工三处同步**：`data/skills-data.json`（+ 需要时 `skills-metrics.json`）与 `src/index.html` 内联 `window.SKILLS_DATA`。技能**正文/资源**权威仍是磁盘 `skills/<name>/SKILL.md`，但其与展示数据之间**无自动构建桥接**（详见 [spec.md §3](spec.md) / §8）。
- **应用形态**：站点本体是自包含静态单页 `src/index.html`（原生 JS、内联数据），`server.js`（Express）提供本地托管与投票/收藏 API，`edge-worker.js` 承接生产侧存储；`src/app/`（Next.js）仅为重定向存根。
- **无嵌套副本**：新技能只能落在 `skills/<name>/`，不得创建 `skills/<x>/skills/<name>/` 之类嵌套。
- **数据型数字**：README/应用内技能总数与领域表计数须以 `data/skills-data.json` 实算，禁止手填。
- **单文件应用例外**：`src/index.html` 为有意维持的内联单文件（v1.14.98 决策），豁免「>200 行拆分」规则；新增逻辑须模块化、加语义化 id 与注释。

---

## 与本仓库技能的关系

仓库 `skills/` 下的 `skill-creator` / `openspec-implementation` 等技能提供创建/评估与工作流落地实现，其 `SKILL.md` 含逐步指令，涉及相关工作流可调用。

---

## 质量门禁

- 涉及展示效果的改动须对齐 `prototype/DESIGN.md`（配色令牌、响应式、可访问性）；改后确认 `src/index.html` 内联产物一致。
- 提交前运行 `node --test tools/lib/*.test.mjs` 做数据契约回归；`tsc --noEmit` 过类型；`node tools/check-version.mjs` 校验 `package.json` == 最新 CHANGELOG ==（可选）git tag。**注意 `validate-skills.mjs` 已移除**，frontmatter 契约回归现由 `tools/lib/skills-data.test.mjs` 覆盖 data 层。
- 提交信息遵循 `<type>: <描述>` 规范（Conventional Commits，详见 CONTRIBUTING「提交规范」）。
- 变更完成后更新 `CHANGELOG.md`（新增版本小节，含 release tag 锚点）。
- 任何修改都 bump 最小版本号，仅更新被改文件的头注释版本号（禁止全仓库批量刷写）。
- 发版用 `npm run tag` 创建 `vX.Y.Z` 注解 tag，推送 tag 触发 CI 部署（EdgeOne Pages）与 GitHub Release。
