# AI 协作指引（AGENTS）

> 路径：`docs/AGENTS.md` · 版本：1.14.58
> 本文件供 AI 编码助手（如 CodeBuddy / Claude）在处理本仓库变更时遵循。能力契约见 [spec.md](spec.md)，仓库约定见 [project.md](project.md)，贡献操作见 [CONTRIBUTING.md](../.github/CONTRIBUTING.md)。

---

## 快速开始

> 本仓库**不使用 OpenSpec CLI**；变更通过 [docs/tasks.md](tasks.md) 任务清单跟踪，直接提交到 `main`。

变更流程：
1. 在 [docs/tasks.md](tasks.md) 新增任务条目（标题 / 优先级 / 状态 / 备注），描述变更范围。
2. 按仓库规范实施：先读 [spec.md](spec.md) 了解能力契约与一致性红线，再读 [project.md](project.md) 了解目录约定与变更工作流。
3. 完成后将任务状态更新为「已完成」，运行 `npm run build` 重新生成数据，并更新 `CHANGELOG.md`（新增对应版本小节）。

---

## 角色契约

- **变更前**：先读 `spec.md` 了解当前能力基线（frontmatter 契约、数据契约、一致性红线），再读 `project.md` 了解目录约定与变更工作流。
- **任务登记**：变更统一在 `docs/tasks.md` 登记任务条目（标题/优先级/状态/备注）；本仓库**不生成 proposal.md / design.md 独立产物文件**，设计要点直接写在对应变更文件或 tasks.md 备注栏。
- **数据纪律**：技能权威是磁盘 `skills/<name>/SKILL.md`；`data/*.json` 与 `prototype/prototype.html` 为构建产物，**勿手改**，改后重跑 `npm run build`。`app/` 同样以 SKILL.md 为权威数据源。
- **无嵌套副本**：新技能只能落在 `skills/<name>/`，不得创建 `skills/<x>/skills/<name>/` 之类嵌套。
- **数据型数字**：README 中/英技能总数与领域表计数须以 `data/skills-data.json` 实算，禁止手填。

---

## 与本仓库技能的关系

仓库 `skills/openspec-implementation/` 提供 OpenSpec 落地实现技能，其 `SKILL.md` 含逐步指令，涉及 OpenSpec 相关工作流可调用该技能。

---

## 质量门禁

- 涉及展示页的改动须对齐 `prototype/DESIGN.md`（配色令牌、响应式、可访问性）。
- 提交前运行 `node tools/validate-skills.mjs` 校验 frontmatter 契约（必填、分类、顺序、无冲突键）。
- 提交信息遵循 `<type>: <描述>` 规范（Conventional Commits，详见 CONTRIBUTING「提交规范」）。
- 变更完成后更新 `CHANGELOG.md`（新增版本小节，含 release tag 锚点）。
- 任何修改都 bump 最小版本号，仅更新被改文件的头注释版本号（禁止全仓库批量刷写）。
