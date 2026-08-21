---
name: playwriter
category: 自动化与集成
en_category: Automation & Integration
zh: Playwriter 浏览器控制
description: "Playwriter：通过 Playwriter CLI 控制用户当前已打开的 Chrome 标签页（不新开浏览器）。当你需要检查实时 UI 状态、运行脚本化浏览器操作、捕获控制台输出，或直接在用户标签页中复现前端问题时使用；支持创建会话、读取页面结构与日志、执行点击/输入/悬停/求值等操作，并以精确 ID、时间戳与状态变化总结结果。"
en_description: "Playwriter: control the user's currently open Chrome tab through the Playwriter CLI (no new browser launch). Use when you need to inspect live UI state, run scripted browser actions, capture console output, or reproduce frontend issues directly in the user's tab; supports creating sessions, reading page structure and logs, executing click/type/hover/evaluate actions, and summarizing findings with exact IDs, timestamps, and observed state transitions."
---

# Playwriter

Use this skill to drive the user's active Chrome tab via Playwriter.

Full documentation is available here: https://playwriter.dev/

## Quick Start

1. Ensure the Playwriter extension is enabled (green) on the target tab.
2. Ensure CLI is available:

```bash
playwriter --version || npx -y playwriter --version
```

3. Create/attach a session:

```bash
playwriter session new
```

4. Run commands against that session:

```bash
playwriter -s 1 -e "console.log(await page.url())"
```

## Core Workflow

1. Confirm connection and correct tab:

```bash
playwriter -s <session> -e "console.log(await page.url()); console.log(await page.title());"
```

2. Collect page structure when needed:

```bash
playwriter -s <session> -e "console.log(await accessibilitySnapshot({ page }))"
```

3. Execute targeted actions (click/type/hover/fetch/evaluate).
4. Pull logs and structured state via `page.evaluate`.
5. Summarize findings with exact IDs, timestamps, and observed state transitions.

## Useful Commands

Get list rows/options from current app UI:

```bash
playwriter -s <session> -e "const rows = await page.getByRole('option').all(); console.log(rows.length);"
```

Read popup/hover content:

```bash
playwriter -s <session> -e "const row = page.getByRole('option').nth(0); await row.hover(); await page.waitForTimeout(700); console.log(await page.locator('[data-side]').first().innerText());"
```

Run arbitrary in-page debug code:

```bash
playwriter -s <session> -e "const out = await page.evaluate(() => ({ href: location.href })); console.log(out);"
```

## Troubleshooting

- If the session attaches to the wrong tab, click the extension icon on the intended tab and re-run `playwriter session new`.
- If `playwriter` command is missing, use `npx -y playwriter ...` or install globally.
- If execution errors suggest stale connection, create a fresh session.

## Guardrails

- Prefer read-only inspection unless the task requires mutation.
- Announce destructive UI actions before running them.
- When capturing logs, redact sensitive tokens/user data in summaries.
