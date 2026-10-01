# 任务清单 — Agent Skills Hub

> 最后更新：2026-10-01（本次整理，本地构建验证进行中）

---

## 迭代一：修复 CI 验证失败（已完成）

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
| 10 | 提交变更（convention: `fix: restore 125 skills frontmatter fields broken by 998370c`）| P0 | ✅ 已完成 | 修复链已提交（HEAD `631ba62`）；暂存区 130 files 已落库 |

---

## 迭代二：文档与记忆重组（v1.14.58，已完成）

**目的**：统一四份规范文档结构与术语、确立 `docs/spec.md` 为 frontmatter/数据/红线的唯一权威源、优化项目记忆文档；删除重复/过时/矛盾内容。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | bump 版本 1.14.57 → 1.14.58（package.json / README 中英文徽章 / CHANGELOG） | P1 | ✅ 已完成 | 纯文档重组，patch 升级 |
| 2 | 重写 `docs/spec.md` 为权威契约源 | P0 | ✅ 已完成 | 去 `v1.20.x` 矛盾注记；补 12 条一致性红线；frontmatter 六字段表 + 14 类映射 + SkillEntry/SkillMetrics/SkillsData 类型 |
| 3 | 重写 `docs/project.md`（仅仓库约定 + 术语表） | P1 | ✅ 已完成 | 删除与 spec 重复的数据结构/交互/分享段，改为引用 |
| 4 | 重写 `docs/AGENTS.md`（AI 协作指引） | P1 | ✅ 已完成 | 去 OpenSpec 标题；修角色契约矛盾（不再生成 proposal.md/design.md 产物，对齐 tasks.md 工作流） |
| 5 | 重写 `.github/CONTRIBUTING.md`（贡献指南） | P1 | ✅ 已完成 | 修正工作分支 `dev`→`main`；与 spec 去重；统一标题层级与代码围栏 |
| 6 | 优化 `.codebuddy/memory/MEMORY.md` | P1 | ✅ 已完成 | 主题归类（①~⑨）；标注时效/可信度；去除与文档重复的契约全文 |
| 7 | 清理 2 条失效全局记忆（55 技能/5 类、204 vs 200） | P2 | ✅ 已完成 | 与当前 169/14 矛盾，已删除 |
| 8 | 追加 daily 记录（2026-10-01.md） | P2 | ✅ 已完成 | 记录重组决策与结论 |

> 文档分工：spec.md=权威契约；project.md=仓库约定；AGENTS.md=AI 协作；CONTRIBUTING.md=贡献操作。四文档互为引用、冲突以 spec.md 为准；仓库不使用 OpenSpec CLI，变更经本 tasks.md 跟踪。

---

## 后续迭代（验证 / 建议）

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 11 | 分析 commit 998370c 来源并建立防护机制 | P1 | ✅ 已完成 | 根因：Skills Manager 批量更新覆盖 frontmatter；防护=ci.yml 的 `validate-skills` job 改为**硬门禁**（去 `continue-on-error`）；修正过时注释（"223 个/118 缺字段"→现状 169 全部规范） |
| 12 | 检查 998370c 是否还有其他破坏性变更 | P2 | ✅ 已完成 | `git show --stat 998370c`：仅 frontmatter 覆盖 + 新增 vercel-react 技能，无删除配置/CI；data 无"其他"类 |
| 13 | 验证 `npm run build` 的 Next.js 独立构建产物（Linux/CI） | P3 | 🔄 验证中 | 本地 Windows `npm run build` 构建运行中：数据/原型/令牌链路预期成功，next build 在 `.next/standalone` 清理阶段历史报 `EPERM`（Windows 权限限制）；完整构建依赖 ubuntu CI `build` job（已在 ci.yml 配置）。结论待回写 |

---

## 变更摘要

- **迭代一（修复 CI）**：125 个技能缺失 4 个必填 frontmatter 字段 → 修复后 169 个全部通过校验，数据与原型已重建；防护机制（validate-skills 硬门禁）已落地于 `ci.yml`。
- **迭代二（文档重组）**：四份规范文档统一结构/术语、spec.md 定为权威契约源；MEMORY.md 主题归类 + 时效/可信度标注；清理 2 条失效全局记忆；版本 bump 至 1.14.58。
- **环境验证结论（沿用）**：本机 Windows `pnpm/npm build` 在 Next.js standalone 清理阶段因 `EPERM` 失败（已知 Windows 限制），但数据/原型链路成功且产物与仓库无 diff（可复现）；完整 Next 构建依赖 ubuntu CI 的 `build` job。

> 最后同步：2026-10-01 — 迭代一、迭代二全部完成；#13 本地验证构建运行中，结论待回写。
