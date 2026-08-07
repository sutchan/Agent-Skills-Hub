# Project Specification — Agent Skills Hub

> 本文件是 OpenSpec 的项目级规范（project spec），定义变更工作流、产物约定与本仓库结构对齐方式。
> 配套技能：`skills/openspec-propose`、`skills/openspec-apply-change`、`skills/openspec-explore`、`skills/openspec-archive-change`。

## 1. 项目概览

Agent Skills Hub 是一个面向开发、设计、测试、DevOps、Agent 工程及各行业领域的 AI 技能集合仓库。
仓库以 `skills/<name>/SKILL.md` 为核心单元组织，并提供 `site/` 静态展示页（Next.js）做可视化浏览。

## 2. 目录结构约定

| 路径 | 用途 | 是否变更常客 |
|---|---|---|
| `skills/<name>/SKILL.md` | 单个技能定义（frontmatter + 正文） | ✅ 高频 |
| `skills/<name>/references/`、`scripts/`、`assets/` | 技能的参考资料 / 脚本 / 资源 | ✅ 中频 |
| `README.md` | 技能清单（中文描述映射） | ✅ 中频 |
| `site/` | Next.js 静态展示页原型 | ✅ 中频 |
| `site/data/skills.json` | 由 `site/build_site.py` 生成，**勿手改业务字段** | ⚠️ 自动生成 |
| `tools/` | 仓库级脚本（`coverage.py`、`skills_readme.py`） | ◻️ 低频 |
| `openspec/` | OpenSpec 变更产物 | ✅ 本目录 |

## 3. 变更工作流（OpenSpec）

1. **提案**：`openspec new change <kebab-name>` 创建脚手架。
2. **产物**：每个 change 在 `openspec/changes/<name>/` 下包含：
   - `proposal.md` — 做什么 & 为什么（背景、问题、目标、非目标）
   - `design.md` — 怎么做（方案、数据模型、文件改动、风险）
   - `tasks.md` — 实施步骤（可勾选清单）
3. **就绪判定**：`openspec status --change <name>` 显示 `applyRequires` 全部 `done` 后可实施。
4. **实施**：`/opsx:apply` 或人工按 `tasks.md` 执行。
5. **归档**：完成后 `openspec archive <name>`，产物移入 `openspec/archive/`。

## 4. Artifact 内容准则

- **proposal.md**：只写「为什么」，含可观测的验收标准；不写实现细节。
- **design.md**：只写「怎么做」，含文件级改动清单、数据结构、回退方案；引用本项目现有模块（如 `build_site.py`、展示页）而非重复其全文。
- **tasks.md**：步骤须可独立验证，每步标注涉及文件。
- **约束**：`openspec instructions` 返回的 `context` / `rules` / `project_context` 是给 AI 的约束，**不得**写入产物文件。

## 5. 仓库一致性红线（本项目的额外约束）

1. **单一数据源**：技能权威 = `skills/<name>/SKILL.md`；`site/data/skills.json` 仅供展示，由 `site/build_site.py` 生成，禁止手改业务字段。
2. **无嵌套副本**：技能不得出现在非 `skills/<name>/` 的位置（如 `skills/video-use/skills/`、`skills/tools/` 均为非法）。
3. **数据有效性**：`skills.json` 的每个 `dir` 必须对应磁盘真实存在的 `skills/<dir>/`；删除技能时同步清理 `README.md` 与重跑 `build_site.py`。
4. **分类英文数据驱动**：`Showcase.jsx` 的分类英文名从 `skills.json` 的 `categories[].en` 读取，新增分类只需在 `build_site.py` 的 `CAT_EN` 补充，前端不改代码。
5. **展示页规范**：UI 改动须对齐 `site/DESIGN.md`（配色令牌、响应式、可访问性）。

## 6. 版本与发布

- 语义化版本（SemVer），变更在 `CHANGELOG.md` 追加条目。
- 展示页版本见 `site/package.json`（`version`）。
- 发版步骤：更新 `skills.json`（重跑脚本）→ 更新 `CHANGELOG.md` → 打 tag。

## 7. 提交信息规范

沿用仓库根 `README.md` / 协作规则：`<type>: <描述>`（feat/fix/docs/refactor/style/test/chore/perf/ci/revert），描述 ≤ 50 字符、动词开头、无句号。
