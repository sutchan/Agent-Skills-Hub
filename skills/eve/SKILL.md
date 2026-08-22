---
name: eve
description: |-
  用 eve 框架构建持久化后端 AI 智能体。在创建、编辑或调试 eve 项目——智能体指令、技能、工具、连接、频道、沙箱、子智能体、调度或评测时使用。
en_description: Build durable backend AI agents with the eve framework. Use when creating, editing, or debugging an eve project — agent instructions, skills, tools, connections, channels, sandboxes, subagents, schedules, or evals.
zh_displayName: eve 后端智能体框架
category: 开发框架与平台
en_category: Dev Frameworks & Platforms
---

# eve

eve is a filesystem-first framework for durable backend AI agents. An agent is
a directory on disk — instructions, skills, tools, connections, channels,
subagents, and schedules are all files — and eve compiles and runs it.

## Source of truth

The complete documentation ships inside the `eve` package. Do not rely on this
skill for guidance — always read the bundled docs, which match the installed
version exactly:

```
node_modules/eve/docs/
```

Start with `node_modules/eve/docs/README.md`. It contains the full
index and recommended reading order. Before writing any eve code, read the
relevant guide there first.

If `eve` is not installed yet, install it (`npm install eve`) or scaffold a new
agent with `npx eve init <agent-name>`, then read the bundled docs.
