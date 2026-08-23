---
name: handoff
description: 将当前对话压缩成一份交接文档，供另一个 agent 接手继续工作。
en_description: Compact the current conversation into a handoff document for another agent to pick up.
zh_displayName: 会话交接文档
category: 工程实践与质量
en_category: Engineering Practice & Quality
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS - not the current workspace.

Include a "suggested skills" section in the document, naming which skills the next agent should call the Skill tool for.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.
