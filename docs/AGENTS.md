# AGENTS.md — OpenSpec 协作指引

> 路径：`docs/AGENTS.md` · 版本：1.14.57

本文件供 AI 编码助手（如 CodeBuddy / Claude）在处理本仓库变更时遵循。

> 路径：`docs/AGENTS.md` · 版本：1.14.57
> 变更前先读 [`spec.md`](spec.md) 了解当前能力基线，再读 [`project.md`](project.md) 了解约定。

## 快速开始

> 本仓库**不使用 OpenSpec CLI**；变更通过 [`docs/tasks.md`](tasks.md) 任务清单跟踪，直接提交到 `main`。

变更流程：
1. 在 [`docs/tasks.md`](tasks.md) 新增任务条目（标题 / 优先级 / 状态 / 备注），描述变更范围。
2. 按仓库规范实施：先读 [`docs/spec.md`](spec.md) 了解当前能力基线，再读 [`docs/project.md`](project.md) 了解目录约定与一致性红线。
3. 完成后将任务状态更新为「已完成」，运行 `npm run build` 重新生成数据，并更新 `CHANGELOG.md`（新增对应版本小节）。

## 角色契约

- **变更前**：先读 `docs/spec.md` 了解当前能力基线，再读 `docs/project.md` 了解目录约定与一致性红线。
- **写产物**：`proposal.md` 写「为什么」，`design.md` 写「怎么做」，`tasks.md` 写「步骤」。
- **约束隔离**：`openspec instructions` 返回的 `context`/`rules` 是约束，不写入产物文件。
- **数据纪律**：技能权威是 `skills/<name>/SKILL.md`；原型为预构建静态 HTML（`prototype/prototype.html`），数据源以磁盘 SKILL.md 为准，勿手改产物。`app/` 为可运行 Web 应用源码工作区，构建期同样以 SKILL.md 为权威数据源。
- **无嵌套副本**：新技能只能落在 `skills/<name>/`，不得创建 `skills/<x>/skills/<name>/` 之类嵌套。

## 与本仓库技能的关系

仓库 `skills/openspec-implementation/` 提供 OpenSpec 落地实现技能，其 `SKILL.md` 含逐步指令，涉及 OpenSpec 相关工作流可调用该技能。

## 质量门禁

- 涉及展示页的改动须对齐 `prototype/DESIGN.md`。
- 提交信息遵循 `<type>: <描述>` 规范。
- 变更完成后更新 `CHANGELOG.md`。
