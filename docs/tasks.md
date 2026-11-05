# 任务清单（未完成任务） — Agent Skills Hub

> 最后更新：**2026-11-05**（v1.16.13）。
> 本文件仅保存**未完成**任务；已完成任务全部归档于 `docs/tasks-done.md`（迭代一至二十七）。
> 版本单一来源 `package.json.version`（当前 **v1.16.13**）。

---

## 未完成任务

| # | 任务 | 优先级 | 状态 | 备注 |
|---|---|---|---|---|
| 1 | 补录「桌面与客户端」领域技能 | P3 | ⬜ 待开始 | `data/skills-data.json` 实算仅 13 个活跃分类，14 大领域中「桌面与客户端」当前无技能收录；如需覆盖该领域需补录技能并同步 data / 内联数据 |
| 2 | 全量重算 `data/skills-metrics.json` 的 `size` / `files` | P3 | ⬜ 待开始 | v1.16.12 / v1.16.13 仅刷新被更新技能的指标；其余约 150 个技能的 `size` / `files` 仍为历史快照（如 `canvas-design` 记 1 文件、实际 83 文件），需按磁盘实算全量重算 |
| 3 | 收敛 `data/skills-metrics.json` 的 `popularity` 口径 | P3 | ⬜ 待开始 | `popularity`（被其他技能描述提及次数）当前无脚本可复现（描述提及统计与现有取值不符），需定义口径后再全量重算 |
| 4 | 清理 data 层描述中的残留引号 | P3 | ⬜ 待开始 | 部分技能 `enDescription` 值首尾带有字面引号（如 `wp-patterns` / `wp-playground` 的 `"Pattern: …"`），源于历史手工维护时把 SKILL.md 的引号一并写入；需去除首尾冗余引号 |
| 5 | 复核 `data/skills-data.json` 与磁盘的逐字一致性 | P3 | ⬜ 待开始 | v1.16.13 已补齐 8 个技能与新技能的差异；`data` 层为手工维护，缺 `SKILL.md`→data 生成脚本（spec §8.2 既定取舍），后续上游同步后仍需人工逐字比对 |

---
