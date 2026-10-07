# 贡献指南

感谢你愿意为 **Agent Skills Hub** 贡献！本指南帮助你在不破坏数据管线与规范的前提下，新增或更新技能、修复文档、提交变更。

> 路径：`.github/CONTRIBUTING.md` · 版本：1.14.79
> 项目地址：https://github.com/sutchan/Agent-Skills-Hub
> 能力契约（frontmatter/数据/红线）的唯一权威源是 [docs/spec.md](./docs/spec.md)；仓库约定见 [docs/project.md](./docs/project.md)。

## 目录

- [仓库速览](#仓库速览)
- [环境准备](#环境准备)
- [新增或更新技能](#新增或更新技能)
- [SKILL.md 前置元数据要求](#skillmd-前置元数据要求)
- [文件换行符规范（强制）](#文件换行符规范强制)
- [数据与构建](#数据与构建)
- [文档与版本一致性](#文档与版本一致性)
- [部署配置](#部署配置)
- [提交规范](#提交规范)
- [发起 Pull Request](#发起-pull-request)
- [行为准则](#行为准则)

## 仓库速览

- 每个技能是 `skills/<name>/SKILL.md` 的独立目录，可含 `scripts/`、`references/`、`assets/`、`agents/` 等资源。
- 技能数据由 `npm run build` 从磁盘 `skills/` 自动生成，产物为 `data/skills-data.json`（稳定元数据）与 `data/skills-metrics.json`（频繁派生指标，以 `name` 为 key 的 map），二者合并后注入自包含静态展示页 `prototype/prototype.html`。
- 展示方式：`prototype/prototype.html`（静态单文件，可离线打开）+ `src/`（Next.js 应用源码工作区，采用 src 目录约定）。

## 环境准备

```bash
git clone https://github.com/sutchan/Agent-Skills-Hub.git
cd Agent-Skills-Hub
npm install          # 安装根依赖（构建脚本所需）
npm run build        # 验证构建链路，生成 data 与 prototype
```

> 要求 Node.js `22.x || 26.x`（见根 `package.json` `engines`）。

## 新增或更新技能

### 新增技能

1. 建议先使用内置的 [`skill-creator`](./skills/skill-creator/) 技能按规范创建与评估新技能。
2. 在 `skills/<name>/` 下创建目录，命名使用小写中划线（`kebab-case`），目录名须与 frontmatter `name` 字段一致，例如 `python-testing/`。
3. 编写 `SKILL.md`（正文 + 前置元数据，见下节）。**文件必须使用 Unix 换行符（LF，`\n`），禁止使用 Windows CRLF（`\r\n`）**。
4. 可选：补充 `scripts/`、`references/`、`assets/`、`agents/` 等资源。
5. 运行 `npm run build` 重新生成数据与展示页。

### 更新已有技能

- 修改 `SKILL.md` 正文或前置元数据后，同样运行 `npm run build` 刷新产物。
- 若改动 `en_description`（英文原文），必须同步更新 `description`（中文译文），保持中英一致。

## SKILL.md 前置元数据要求

`SKILL.md` 必须以 YAML frontmatter 开头。**前 6 个为契约字段（顺序固定，CI 校验）**；完整约束与可选字段清单以 [docs/spec.md §2](./docs/spec.md) 为权威源。

```yaml
---
name: <kebab-case 技能名，与目录名一致>
description: <中文完整描述，默认展示语言>
en_description: <英文原文描述，处理技能时保留>
zh_displayName: <中文一句话简介>
category: <14 大稳定领域之一，中文稳定键>
en_category: <对应英文分类名，英文态展示>
# 以下为可选字段（平台/工具元数据），原样保留即可：
# version / compatibility / license / author / homepage
# metadata:        # 平台专用嵌套块（如 metadata.openclaw.category）
# user-invocable / allowed-tools / hooks / risk_level / model
# displayName / emoji / slug / keywords / argument-hint / effort / origin / last_modified / acceptLicenseTerms / disable-model-invocation
---
```

**分类键（14 大领域）**：`品牌与设计` / `文档与内容` / `数据分析与可视化` / `前端开发` / `后端与平台` / `移动端开发` / `WordPress 与 CMS` / `工程实践与质量` / `文件与格式处理` / `自动化与集成` / `AI 与智能体` / `音视频与多媒体` / `桌面与客户端` / `安全`（英文映射与「其他」违规类说明见 [spec.md §2.1](./docs/spec.md)）。

**关键约束**：
- `description` 与 `zh_displayName` 区别：`zh_displayName` 是一句话摘要，`description` 是完整中文描述；`en_description` 为英文原文描述（默认展示中文，英文态展示英文）。
- 不得出现 `description_zh` / `description_en` 等冲突键。
- 构建脚本以磁盘 `skills/` 为唯一权威源读取这些字段。

## 文件换行符规范（强制）

所有技能文件（`skills/<name>/` 下的 `SKILL.md` 及 `scripts/`、`references/`、`assets/`、`agents/` 等全部文本资源）**统一使用 Unix 换行符（LF，`\n`）**，禁止使用 Windows CRLF（`\r\n`）。

- 仓库历史文件多为 CRLF，新增与更新时须主动转换为 LF。
- Git 端到端一致性：建议在仓库根 `.gitattributes` 中声明 `*.md text eol=lf`、`*.py text eol=lf` 等，使检出与提交均归一为 LF。
- 批量转换示例（PowerShell）：

  ```powershell
  # 将单个文件转为 LF
  (Get-Content -Raw -Path skills/<name>/SKILL.md) -replace "`r`n", "`n" | Set-Content -NoNewline -Encoding utf8 skills/<name>/SKILL.md
  ```

- 编辑器（VS Code）可设置 `"files.eol": "\n"` 与「在保存时删除行尾空白」，新文件自动落 LF。
- **红线**：CRLF 文件在做正则整块替换类批处理时易静默失效（捕获的 `\r\n` 与磁盘真实换行不匹配），一律改用「按行 `split(/\r?\n/)` 改写再 `join('\n')`」或直接使用 CRLF 安全的编辑工具。

## 数据与构建

```bash
npm run build   # = node tools/build-skills-data.mjs && node tools/build.mjs && node tools/sync-tokens.mjs && node tools/sync-css.mjs && next build
```

- `data/skills-data.json` 与 `data/skills-metrics.json` 均为**构建产物，勿手改**，需通过 `npm run build` 重新生成。频繁更新的指标（如 popularity/stars/size）只需重算 `skills-metrics.json`，主数据文件保持稳定。
- **frontmatter 校验**：提交前运行 `node tools/validate-skills.mjs`，确保必填字段齐全、`category` 合法、无冲突键、契约字段顺序正确。CI 亦会执行此校验（硬门禁）。
- 原型样式令牌仅改 `prototype/src/styles/tokens.css`，禁止在 `prototype/src/` 其他 css/html 散写颜色字面量（改后须 rebuild）。

## 文档与版本一致性

- **版本单一来源**：根 `package.json` 的 `version`。README 中/英徽章、CHANGELOG 顶部、以及被改文件头注释须与之一致。
- 任何修改后均需 **bump 一次最小版本号**（修复/文档/配置 = patch；新功能 = minor；破坏性变更 = major）。
- 只有实际改动的文件才更新其文件头注释版本号，禁止全仓库批量刷写头注释。
- CHANGELOG 遵循 [Keep a Changelog](https://keepachangelog.com/) + SemVer，每个版本小节须在底部有对应 release tag 锚点。
- 详细红线见 [docs/spec.md §7](./docs/spec.md)。

### 文档同步清单（防版本/数字脱节）

每次发版或文档改动，逐项核对以下「版本展示位」与「数据型数字」：

**版本展示位**（均须等于根 `package.json` 的 `version`）：
- README.md / README.en.md 版本徽章（`img.shields.io/badge/version-vX.Y.Z`）
- CHANGELOG.md 顶部最新小节标题与底部 `[x.y.z]:` 锚点
- docs/AGENTS.md、docs/project.md、docs/spec.md 头注释 `· 版本：x.y.z`
- .github/CONTRIBUTING.md 头注释

**数据型数字**（须以脚本实算，禁止手填）：
- README 中/英「技能总数」（公开数 = `data/skills-data.json` 的 `total`，全部 = `skills.length`）
- README 中/英 14 大领域表「技能数」（逐类以 `data/skills-data.json` 实算）
- 领域表总和必须等于公开技能总数

**手动校验命令**：
```bash
node -e "const d=require('./data/skills-data.json');const m={};for(const s of d.skills){if(!s.hidden)m[s.category]=(m[s.category]||0)+1}console.log('公开',d.total,'全部',d.skills.length);console.log(m)"
```

## 部署配置

- **EdgeOne（主部署）**：根 `edgeone.json` 声明 `{framework:"next",buildCommand:"npm run build",outputDirectory:".next"}`，构建产物为 Next.js 独立服务。
- **Vercel（静态通道）**：根 `vercel.json` 声明 `{outputDirectory:"prototype"}`，直接托管 `prototype/prototype.html` 静态展示页（与 EdgeOne 相互独立）。
- **原型产物**：`npm run build` 生成 `prototype/prototype.html`（自包含、内联全部数据），`vercel.json` 将其作为站点根。
- 本地预览：`npm run serve`（启动静态服务打开 `prototype.html`）。

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
docs: 同步文档版本与一致性规范
```

## 发起 Pull Request

1. 从 `main` 拉出 `feature/*` 或 `fix/*` 分支进行改动（本仓库工作分支为 `main`）。
2. 完成后运行 `npm run build`，确认构建通过。
3. 提交前检查清单：
   - [ ] `SKILL.md` frontmatter 字段完整（name/description/en_description/zh_displayName/category/en_category）
   - [ ] 文件换行符为 Unix(LF)，非 Windows CRLF
   - [ ] `node tools/validate-skills.mjs` 校验通过（必填、分类、顺序、无冲突键）
   - [ ] 数据已通过 `npm run build` 重新生成
   - [ ] README 中/英、CHANGELOG、package.json 版本号一致
   - [ ] 无 `console.log` / `debugger` 残留（脚本除外）
4. 使用仓库的 [Pull Request 模板](./PULL_REQUEST_TEMPLATE.md) 提交 PR 到 `main`。
5. 描述中说明：变更总结、动机、测试/构建验证方式。

## 行为准则

参与本项目即表示你同意遵守 [行为准则](./CODE_OF_CONDUCT.md)。请保持尊重、友善与建设性。
