# AGENTS.md — OpenSpec 协作指引

本文件供 AI 编码助手（如 CodeBuddy / Claude）在处理本仓库变更时遵循。

> 路径：`openspec/AGENTS.md` · 版本：1.20.4
> 变更前先读 [`spec.md`](spec.md) 了解当前能力基线，再读 [`project.md`](project.md) 了解约定。

## 快速开始

```bash
# 1. 提出变更（生成 proposal/design/tasks 三件套）
openspec create change <kebab-name>   # 依实际 CLI 版本，等效子命令亦可
openspec status --change <kebab-name> --json   # 查看产物依赖顺序
openspec instructions <artifact-id> --change <kebab-name> --json

# 2. 实施（产物就绪后）
/opsx:apply            # 或按 tasks.md 手动执行

# 3. 归档
openspec archive <kebab-name>
```

## 角色契约

- **变更前**：先读 `openspec/spec.md` 了解当前能力基线，再读 `openspec/project.md` 了解目录约定与一致性红线。
- **写产物**：`proposal.md` 写「为什么」，`design.md` 写「怎么做」，`tasks.md` 写「步骤」。
- **约束隔离**：`openspec instructions` 返回的 `context`/`rules` 是约束，不写入产物文件。
- **数据纪律**：技能权威是 `skills/<name>/SKILL.md`；原型为预构建静态 HTML（`prototype/index.html`），数据源以磁盘 SKILL.md 为准，勿手改产物。`app/` 为可运行 Web 应用源码工作区，构建期同样以 SKILL.md 为权威数据源。
- **无嵌套副本**：新技能只能落在 `skills/<name>/`，不得创建 `skills/<x>/skills/<name>/` 之类嵌套。

## 与本仓库技能的关系

仓库 `skills/openspec-*` 提供 OpenSpec 各阶段的技能（propose/apply/explore/archive）。
处理变更时优先调用对应技能，其 SKILL.md 含逐步指令。

## 质量门禁

- 涉及展示页的改动须对齐 `prototype/DESIGN.md`。
- 提交信息遵循 `<type>: <描述>` 规范。
- 变更完成后更新 `CHANGELOG.md`。
