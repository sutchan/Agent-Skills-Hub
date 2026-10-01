# 任务清单 — Agent Skills Hub

> 最后更新：2026-10-01 20:42 (UTC+8)

---

## 当前迭代：修复 CI 验证失败

**问题来源**：commit `998370c` (chore: 批量更新技能配置与文档) 覆盖了 111 个 SKILL.md 文件的 frontmatter，删除了 4 个必填字段（`en_description` / `zh_displayName` / `category` / `en_category`），且将中文 `description` 替换为英文原文。导致 CI 校验失败。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | 运行 `node tools/validate-skills.mjs` 确认错误范围 | P0 | ✅ 已完成 | 初检 125 个技能有 471+ 错误 |
| 2 | 编写 git 历史恢复脚本 `tools/_fix-from-history.mjs` | P0 | ✅ 已完成 | 从 `998370c~1` 提取完整 frontmatter，合并到当前版本 |
| 3 | 从 git 历史恢复 113 个技能的 frontmatter 字段 | P0 | ✅ 已完成 | 113/125 技能被修复；12 个跳过（历史版本也不完整或文件不存在） |
| 4 | 编写手动补全脚本 `tools/_fix-remaining.mjs` 处理 26 个遗留技能 | P0 | ✅ 已完成 | 预置映射表补全所有缺失字段；24/26 修复，2 个目录不存在 |
| 5 | 修复 `ai-image-generation` 契约字段顺序问题 | P1 | ✅ 已完成 | description ↔ en_description 位置交换 |
| 6 | 运行验证脚本确认 `validate-skills.mjs` 通过 | P0 | ✅ 已完成 | 169 个技能 frontmatter 规范 ✅ |
| 7 | 重建 `data/skills-data.json` + `data/skills-metrics.json` + `prototype/prototype.html` | P0 | ✅ 已完成 | npm run build（Next.js 因 Windows EPERM 失败，属环境限制） |
| 8 | 运行单元测试 `node --test tools/lib/*.test.mjs` | P1 | ✅ 已完成 | 13/13 pass ✅ |
| 9 | 清理临时脚本 `tools/_fix-from-history.mjs` / `tools/_fix-remaining.mjs` | P2 | ✅ 已完成 | 修复完成后已删除 |
| 10 | 提交变更（convention: `fix: restore 125 skills frontmatter fields broken by 998370c`）| P0 | ✅ 已完成 | 实证 `git status` 显示 `main...origin/main [ahead 1]`，修复链已提交（HEAD `631ba62`）；暂存区 130 files 已落库 |

---

## 后续迭代（建议）

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 11 | 分析 commit 998370c 的来源（Skills Manager 批量更新），建立防护机制 | P1 | 🔄 进行中 | 根因：Skills Manager 批量更新覆盖 frontmatter；防护=CI 硬门禁（见下方任务11执行） |
| 12 | 检查 998370c 是否还有其他破坏性变更未被发现 | P2 | ✅ 已完成 | 实证 `git show --stat 998370c`：仅 frontmatter 覆盖（7+-）+ 新增 vercel-react 技能/_bundled 脚本，无删除配置/CI 等破坏性变更；data 无"其他"类（validate 通过） |
| 13 | 运行 `npm run build` 的 Next.js 部分在 WSL/Linux 环境验证 | P3 | 🔄 进行中 | 本机 Windows EPERM 限制，尝试 `pnpm build` 验证（仓库用 pnpm） |

---

## 变更摘要

- **修复前**：125 个技能缺失 4 个必填 frontmatter 字段 → `validate-skills.mjs` 失败 → CI 失败
- **修复后**：169 个技能全部通过校验，数据和原型已重建
- **关键改动**：
  - 113 个 SKILL.md：从 git 历史恢复完整 frontmatter
  - 24 个 SKILL.md：手动补全缺失字段（含 en_description / zh_displayName / category / en_category）
  - 1 个 SKILL.md：修正契约字段顺序
  - `data/skills-data.json` / `data/skills-metrics.json` / `prototype/prototype.html`：重建
