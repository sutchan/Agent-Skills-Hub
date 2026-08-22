# 贡献指南

感谢你愿意为 **Agent Skills Hub** 贡献！本指南帮助你在不破坏数据管线与规范的前提下，新增或更新技能、修复文档、提交变更。

> 路径：`.github/CONTRIBUTING.md` · 版本：1.19.24
> 项目地址：https://github.com/sutchan/Agent-Skills-Hub

## 目录

- [仓库速览](#仓库速览)
- [环境准备](#环境准备)
- [新增或更新技能](#新增或更新技能)
- [SKILL.md 前置元数据要求](#skillmd-前置元数据要求)
- [数据与构建](#数据与构建)
- [文档与版本一致性](#文档与版本一致性)
- [提交规范](#提交规范)
- [发起 Pull Request](#发起-pull-request)
- [行为准则](#行为准则)

## 仓库速览

- 每个技能是 `skills/<name>/SKILL.md` 的独立目录，可含 `scripts/`、`references/`、`assets/`、`agents/` 等资源。
- 技能数据由根目录 `npm run build` 从磁盘 `skills/` 自动生成，产物为 `data/skills-data.json` 与自包含静态展示页 `prototype/index.html`。
- 展示方式：`prototype/index.html`（静态单文件，可离线打开）+ `app/`（Next.js 应用源码工作区）。

## 环境准备

```bash
git clone https://github.com/sutchan/Agent-Skills-Hub.git
cd Agent-Skills-Hub
npm install          # 安装根依赖（构建脚本所需）
npm run build        # 验证构建链路，生成 data 与 prototype
```

> 要求 Node.js ≥ 24.11.0（见根 `package.json` `engines`）。

## 新增或更新技能

### 新增技能

1. 建议先使用内置的 [`skill-creator`](../skills/skill-creator/) 技能按规范创建与评估新技能。
2. 在 `skills/<name>/` 下创建目录，命名使用小写中划线（`kebab-case`），目录名须与 frontmatter `name` 字段一致，例如 `python-testing/`。
3. 编写 `SKILL.md`（正文 + 前置元数据，见下节）。
4. 可选：补充 `scripts/`、`references/`、`assets/`、`agents/` 等资源。
5. 运行 `npm run build` 重新生成数据与展示页。

### 更新已有技能

- 修改 `SKILL.md` 正文或前置元数据后，同样运行 `npm run build` 刷新产物。
- 若改动 `en_description`（英文原文），必须同步更新 `description`（中文译文），保持中英一致。

## SKILL.md 前置元数据要求

`SKILL.md` 必须以 YAML frontmatter 开头，必填字段如下：

```yaml
---
name: <kebab-case 技能名，与目录名一致>
description: <中文完整描述，默认展示语言>
en_description: <英文原文描述，处理技能时保留>
zh: <中文一句话简介>
category: <9 大领域之一，中文稳定键>
en_category: <对应英文分类名，英文态展示>
# 以下为可选字段（平台/工具元数据），原样保留即可：
# version / compatibility / license / author / homepage
# metadata:        # 平台专用嵌套块（如 metadata.openclaw.category）
# user-invocable / allowed-tools / hooks / risk_level / model
# displayName / emoji / slug / keywords / argument-hint / effort / origin / last_modified / acceptLicenseTerms / disable-model-invocation
---
```

**字段顺序规范**（推荐完整顺序，CI 校验前 6 个契约字段顺序与必填完整性）：

1. **契约字段（必填，前置）**：`name` → `description` → `en_description` → `zh` → `category` → `en_category`
2. **身份 / 来源**：`displayName` → `slug` → `emoji` → `author` → `homepage` → `license` → `version` → `compatibility` → `origin` → `last_modified`
3. **能力 / 调用**：`keywords` → `argument-hint` → `effort` → `user-invocable` → `allowed-tools` → `disable-model-invocation` → `hooks` → `model` → `risk_level` → `acceptLicenseTerms` → `hidden`
4. **平台嵌套块（最后）**：`metadata`

未知字段追加在 `metadata` 之前即可。CI 通过 `scripts/validate-skills.mjs` 校验契约字段顺序与必填完整性。

**字段分类**：
- **展示契约字段**（参与卡片渲染，必填）：`name` / `description`（中文） / `en_description`（英文原文） / `zh` / `category` / `en_category`
- **平台/工具元数据**（可选，仅运行时或 Agent 平台使用，不参与展示）：`version`、`compatibility`、`license`、`author`、`homepage`、`metadata`（嵌套块，如 `metadata.openclaw.category`）、`user-invocable`、`allowed-tools`、`hooks`、`risk_level`、`model`、`displayName`、`emoji`、`slug`、`keywords`、`argument-hint`、`effort`、`origin`、`last_modified`、`acceptLicenseTerms`、`disable-model-invocation`

**禁止字段**：不得出现 `description_zh` / `description_en` 等冲突键，中文译文统一写入 `description`、英文原文写入 `en_description`。

- `category` 取 13 大领域之一（中文，稳定键）：`品牌与设计`、`文档与内容`、`数据分析与可视化`、`前端开发`、`后端与平台`、`移动端开发`、`WordPress 与 CMS`、`工程实践与质量`、`文件与格式处理`、`自动化与集成`、`AI 与智能体`、`音视频与多媒体`、`安全`；`en_category` 为对应英文分类名（如 `品牌与设计` → `Brand & Design`、`前端开发` → `Frontend Dev`、`AI 与智能体` → `AI & Agents`）。
- `description` 与 `zh` 的区别：`zh` 是一句话摘要，`description` 是完整中文描述；`en_description` 为英文原文描述（默认展示中文，英文态展示英文）。
- `build-skills-data.mjs` 以磁盘 `skills/` 为唯一权威源读取这些字段，`category` 与 README 分类名严格一致。

## 数据与构建

```bash
npm run build   # = node build-skills-data.mjs && node build.mjs
```

- `data/skills-data.json` 为**构建产物，勿手改**，需通过 `npm run build` 重新生成。
- **frontmatter 校验**：提交前运行 `node scripts/validate-skills.mjs`，确保必填字段齐全、`category` 合法、无冲突键、契约字段顺序正确。CI 亦会执行此校验。
- 原型样式令牌仅改 `prototype/src/styles/tokens.css`，禁止在 `components.css`/`responsive.css`/`index.html` 散写颜色字面量。

## 文档与版本一致性

- **版本单一来源**：根 `package.json` 的 `version`。README 中英文徽章、CHANGELOG 顶部、以及被改文件头注释须与之一致。
- 任何修改后均需 **bump 一次最小版本号**（修复/文档/配置 = patch；新功能 = minor；破坏性变更 = major）。
- 只有实际改动的文件才更新其文件头注释版本号，禁止全仓库批量刷写头注释。
- CHANGELOG 遵循 [Keep a Changelog](https://keepachangelog.com/) + SemVer，每个版本小节须在底部有对应 release tag 锚点。
- 详细流程见 [`openspec/spec.md`](../openspec/spec.md)「构建与发版」与「一致性红线」。

## 提交规范

提交信息使用 Conventional Commits：

```
<type>: <描述>

[可选正文]
```

- `type`：`feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore` / `perf` / `ci` / `revert`
- 描述 ≤ 50 字符、首字母小写、以动词开头、无句号结尾
- 涉及版本变更时，在正文或页脚标注新版本号

示例：

```
docs: 新增 .github Community Health Files 并同步版本至 v1.14.70
```

## 发起 Pull Request

1. 从 `main` 拉出 `feature/*` 或 `fix/*` 分支进行改动。
2. 完成后运行 `npm run build`，确认构建通过。
3. 提交前检查清单：
   - [ ] `SKILL.md` frontmatter 字段完整（name/description/en_description/zh/category/en_category）
   - [ ] `node scripts/validate-skills.mjs` 校验通过（必填、分类、顺序、无冲突键）
   - [ ] 数据已通过 `npm run build` 重新生成
   - [ ] README 中英文、CHANGELOG、package.json 版本号一致
   - [ ] 无 `console.log` / `debugger` 残留（脚本除外）
4. 使用仓库的 [Pull Request 模板](PULL_REQUEST_TEMPLATE.md) 提交 PR 到 `main`。
5. 描述中说明：变更总结、动机、测试/构建验证方式。

## 行为准则

参与本项目即表示你同意遵守 [行为准则](CODE_OF_CONDUCT.md)。请保持尊重、友善与建设性。
