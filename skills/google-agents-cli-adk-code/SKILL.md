---
name: google-agents-cli-adk-code
description: |-
  使用 Google ADK（智能体开发套件）编写智能体代码——智能体类型、工具定义、回调、状态管理、Workflow API 模式及代码示例。
en_description: |-
  Write agent code with Google ADK (Agent Development Kit) — agent types, tool definitions, callbacks, state management, Workflow API patterns and code examples.
zh_displayName: Google ADK 代码模式
category: AI 与智能体
en_category: AI & Agents
metadata: 
---
# ADK Code Reference

Activate `/google-agents-cli-workflow` first for required development phases and scaffolding steps.

## 1. Study Recipes (No Project Needed)

**Python — read the topic index in `references/samples.md` before answering "how do I build X".**
Worked implementations exist for: sandboxed/per-user code execution, agent-loadable `SKILL.md`
skills, cross-session memory, approval gates before risky actions, tool guardrails, per-user
credentials, and scheduled/event-driven runs.

**Go — read the upstream [`examples/`](https://github.com/google/adk-go/tree/main/examples).**
clone the repo and read the one matching the capability you need before implementing it.

## 2. Prerequisites for Writing Code

Do NOT write agent code until a project is scaffolded.

1. Verify project: run `agents-cli info` (proceed if config exists).
2. New project: run `agents-cli scaffold create <name>` — add `--agent adk_go` for Go.
3. Existing code: run `agents-cli scaffold enhance .`.

## Quick Reference — Most Common Patterns

See `references/adk-python.md` and `references/adk-go.md` for Python and Go code examples, respectively.

---

## References

Use the cheatsheets for common patterns. For deep knowledge, fetch the docs index or inspect the
installed package.

| Reference | Language | When to read |
|------|------|-------------|
| `references/samples.md` | Python | **Topic-indexed catalog of ADK reference recipes.** Read in workflow Phase 1 — before scaffolding and before writing code — maps a capability to the recipe that implements it. |
| `references/adk-python.md` | Python | Core ADK API: `Agent`, tools, callbacks, plugins, state, artifacts, multi-agent systems, `SequentialAgent` / `ParallelAgent` / `LoopAgent`, custom `BaseAgent`, `ManagedAgent` (server-hosted first-party agents), A2A protocol, A2UI. Default for most agents. |
| `references/adk-python-workflows.md` | Python | Graph-based Workflow API (ADK Python 2.0): nodes, edges, fan-out/fan-in, HITL, parallel processing. Use when you need explicit graph topology. |
| `references/adk-python-live.md` | Python | Live and voice agents: `Runner.run_live`, `LiveRequestQueue`, model and regional availability, voice/`speech_config`, VAD, session limits, `/run_live` serving. Use for real-time voice or video agents. |
| `references/adk-go.md` | Go | Core ADK Go API: `llmagent`, tools, callbacks, plugins, state, artifacts, multi-agent systems, sequential/parallel/loop agents, custom agents, the runner, serving over HTTP, A2A protocol, and ambient triggers. Default for most agents. |
| `references/adk-go-workflows.md` | Go | Graph-based Workflow API: nodes, edges, fan-out/fan-in, HITL, parallel processing. Use when you need explicit graph topology. |
| [`examples/`](https://github.com/google/adk-go/tree/main/examples) | Go | Runnable upstream programs — the closest thing to a recipe catalog for Go. |
| `curl https://adk.dev/llms.txt` | Python | Docs index (every page title + URL). Fetch it, then `WebFetch` the specific page for anything beyond the cheatsheets. |
| Installed ADK package | Python | Exact signatures and symbols — inspect the source (see "Inspecting ADK Source Code" in `references/adk-python.md`). |

## Related Skills

- `/google-agents-cli-workflow` — Development workflow, coding guidelines, and operational rules
- `/google-agents-cli-scaffold` — Project creation and enhancement with `agents-cli scaffold create` / `scaffold enhance`
- `/google-agents-cli-eval` — Evaluation methodology, dataset schema, and the eval-fix loop
- `/google-agents-cli-deploy` — Deployment targets, CI/CD pipelines, and production workflows
