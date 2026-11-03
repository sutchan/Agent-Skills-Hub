# 贡献指南

感谢你愿意为 **Agent Skills Hub** 贡献！本指南帮助你在不破坏数据管线与规范的前提下，新增或更新技能、修复文档、提交变更。

> 路径：`.github/CONTRIBUTING.md` · 版本：1.16.4
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
- **站点本体**是自包含静态单页 `src/index.html`（原生 JS、内联全部技能数据 `window.SKILLS_DATA`）；`server/`（Express，薄装配 `server.js`）提供本地静态托管与 `/api/votes`、`/api/favorites`；`edge-worker.js`（EdgeOne Edge KV）承接生产侧投票/收藏。
- **展示数据** `data/skills-data.json` / `data/skills-metrics.json` 为**提交态、手工维护**（**无 `SKILL.md`→data 自动生成脚本**）；`npm run sync:data` 可单向将其重建进 `src/index.html` 内联数据。详见 [数据与构建](#数据与构建)。
- `prototype/` 为高保真**设计规范**事实来源（`DESIGN.md` 等），非运行产物。

## 环境准备

```bash
git clone https://github.com/sutchan/Agent-Skills-Hub.git
cd Agent-Skills-Hub
bun install          # 或 npm install；CI 使用 Bun，仓库已提交 bun.lock（--frozen-lockfile）
npm run dev          # 启动 server.js，默认 http://localhost:3000
```

> 要求 Node.js `>=22.11`（见根 `package.json` `engines`）。`engines` 只声明**下限**而非大版本白名单：部署平台会在 LTS 轮换时自动升级 Node 大版本，硬钉具体大版本会在平台升级后令安装失败。

## 新增或更新技能

### 新增技能

1. 建议先使用内置的 [`skill-creator`](./skills/skill-creator/) 技能按规范创建与评估新技能。
2. 在 `skills/<name>/` 下创建目录，命名使用小写中划线（`kebab-case`），目录名须与 frontmatter `name` 字段一致，例如 `python-testing/`。
3. 编写 `SKILL.md`（正文 + 前置元数据，见下节）。**文件必须使用 Unix 换行符（LF，`\n`），禁止使用 Windows CRLF（`\r\n`）**。
4. 可选：补充 `scripts/`、`references/`、`assets/`、`agents/` 等资源。
5. **同步展示数据**：手工编辑 `data/skills-data.json`（+ 需要时 `data/skills-metrics.json`），再运行 `npm run sync:data` 自动重建 `src/index.html` 内联 `window.SKILLS_DATA`（单向：data → 内联）。

### 更新已有技能

- 修改 `SKILL.md` 正文或前置元数据后，同样**手工编辑 `data/*.json` + 运行 `npm run sync:data`** 同步内联数据。
- 若改动 `en_description`（英文原文），必须同步更新 `description`（中文译文），保持中英一致。
- 删除技能须同步清理 `data/skills-data.json` 与 `src/index.html` 内联数据（并跑 `sync:data` 重建）。

## SKILL.md 前置元数据要求

`SKILL.md` 必须以 YAML frontmatter 开头。**前 6 个为契约字段（顺序固定）**；完整约束与可选字段清单以 [docs/spec.md §2](./docs/spec.md) 为权威源。

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
# displayName / emoji / slug / keywords / argument-hint / effort / origin / last_modified / acceptLicenseTerms / disable-model-invocation / hidden
---
```

**分类键（14 大领域）**：`品牌与设计` / `文档与内容` / `数据分析与可视化` / `前端开发` / `后端与平台` / `移动端开发` / `WordPress 与 CMS` / `工程实践与质量` / `文件与格式处理` / `自动化与集成` / `AI 与智能体` / `音视频与多媒体` / `桌面与客户端` / `安全`（英文映射与「其他」违规类说明见 [spec.md §2.1](./docs/spec.md)）。

**关键约束**：
- `zh_displayName` 是一句话摘要，`description` 是完整中文描述；`en_description` 为英文原文描述（默认展示中文，英文态展示英文）。
- 不得出现 `description_zh` / `description_en` 等冲突键。
- **两层自动校验**：`tools/validate-skills.mjs` 校验 `skills/*/SKILL.md` 源 frontmatter（硬失败=缺 name/description、name≠目录名、category 非法；软警告=缺 en_description/zh_displayName/category/en_category）；`tools/lib/skills-data.test.mjs` 校验 `data/skills-data.json` 字段完整性 / `name` 唯一 / `githubDir` 一致 / `total` 对齐。提交前二者均须通过。

## 文件换行符规范（强制）

所有技能文件（`skills/<name>/` 下的全部文本资源）**统一使用 Unix 换行符（LF，`\n`）**，禁止使用 Windows CRLF（`\r\n`）。

- 仓库历史文件多为 CRLF，新增与更新时须主动转换为 LF；可用 `node tools/ensure-lf.mjs` 归一。
- Git 端到端一致性：建议在 `.gitattributes` 中声明 `*.md text eol=lf`、`*.py text eol=lf` 等。
- **红线**：CRLF 文件在做正则整块替换类批处理时易静默失效，一律改用「按行 `split(/\r?\n/)` 改写再 `join('\n')`」或 CRLF 安全的编辑工具。

## 数据与构建

```bash
npm run build    # = NODE_ENV=production next build && cp src/index.html out/index.html && node scripts/inject-ga.mjs
npm run sync:data # = node scripts/sync-inline-data.mjs（data/*.json → src/index.html 内联 window.SKILLS_DATA）
npm test         # = node --test tools/lib/*.test.mjs（data JSON 回归）
npm run lint     # = tsc --noEmit
npm run e2e      # = playwright test（e2e/smoke.spec.ts）
npm run tag      # = node scripts/tag-release.mjs（创建 vX.Y.Z 注解 tag）
```

- **`data/*.json` 为提交态、手工维护**（无 `SKILL.md`→data 生成脚本）；改技能展示须**手工编辑 `data/*.json` + 运行 `npm run sync:data`** 重建 `src/index.html` 内联数据（单向同步）。
- `next.config.mjs` 为 `output:"export"`（产物 `out/`）；由于 `src/app` 仅重定向存根，`cp src/index.html out/index.html` 会用真正的静态应用覆盖导出页，故真实可部署物 = `src/index.html` + `public/` + `data/` + `skills/` + `out/` 导出壳。`inject-ga.mjs` 将 `out/index.html` 中 `__GA_MEASUREMENT_ID__` 占位符替换为环境变量 `GA_MEASUREMENT_ID`（缺省回退 `G-WQDDVB14PF`）。
- **校验**：提交前运行 `node tools/validate-skills.mjs` + `node --test tools/lib/*.test.mjs`；CI `validate` job 亦会执行。
- 设计规范改 `prototype/DESIGN.md` 等源；改展示效果须同步 `src/index.html` 内联产物并跑 `sync:data`。

## 文档与版本一致性

- **版本单一来源**：根 `package.json` 的 `version`。README 中/英徽章、CHANGELOG 顶部、以及被改文件头注释须与之一致。
- 任何修改后均需 **bump 一次最小版本号**（修复/文档/配置 = patch；新功能 = minor；破坏性变更 = major）。
- 只有实际改动的文件才更新其文件头注释版本号，禁止全仓库批量刷写头注释。
- CHANGELOG 遵循 [Keep a Changelog](https://keepachangelog.com/) + SemVer，每个版本小节须在底部有对应 release tag 锚点。
- 详细红线见 [docs/spec.md §7](./docs/spec.md)。

### 文档同步清单（防版本/数字脱节）

**版本展示位**（均须等于根 `package.json` 的 `version`）：
- README.md / README.en.md 版本徽章（`img.shields.io/badge/version-vX.Y.Z`）
- CHANGELOG.md 顶部最新小节标题与底部 `[x.y.z]:` 锚点
- docs/AGENTS.md、docs/project.md、docs/spec.md 头注释 `· 版本：x.y.z`
- .github/CONTRIBUTING.md 头注释

**数据型数字**（须以脚本实算，禁止手填）：
- README/应用内「技能总数」与领域表计数（以 `data/skills-data.json` 实算）
- 领域表总和必须等于公开技能总数

**手动校验命令**：
```bash
node -e "const d=require('./data/skills-data.json');const m={};for(const s of d.skills){if(!s.hidden)m[s.category]=(m[s.category]||0)+1}console.log('公开',d.total,'全部',d.skills.length);console.log(m)"
```

## 部署配置

- **EdgeOne Pages（部署）**：CI（`.github/workflows/ci.yml`，Bun + `bun.lock` `--frozen-lockfile`）串行执行 校验 → 构建（导出 `out/`）→ e2e → 部署（`npx edgeone pages deploy ./out`）→ 发布；需 Secret `EDGEONE_API_TOKEN`（缺省跳过部署并提示）。
- **边缘 API**：`edge-worker.js`（Edge KV 命名空间 `ASH_KV`）承接 `/api/votes`、`/api/favorites`，`edgeone.config.json` 将 `*/api/*` 路由指向它。
- **发布**：tag `vX.Y.Z` 触发 `release` job，抽 CHANGELOG 小节作发行说明，附 `data/skills-data.json` / `data/skills-metrics.json`。
- **本地预览**：`npm run dev`（`server.js`，默认 `:3000`）。
- **GA4**：构建/运行期读取环境变量 `GA_MEASUREMENT_ID`（本地回退 `G-WQDDVB14PF`）；GitHub Actions 在仓库 **Settings → Variables** 配置该变量，`inject-ga.mjs` 写入 `out/index.html`。

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
2. 完成后本地验收：`node tools/validate-skills.mjs`、`node --test tools/lib/*.test.mjs`、`tsc --noEmit`、`node tools/check-version.mjs`。
3. 提交前检查清单：
   - [ ] `SKILL.md` frontmatter 字段完整（name/description/en_description/zh_displayName/category/en_category）
   - [ ] 文件换行符为 Unix(LF)，非 Windows CRLF
   - [ ] 展示数据已同步：手工编辑 `data/*.json` + 运行 `npm run sync:data` 重建内联
   - [ ] `node --test tools/lib/*.test.mjs` 与 `node tools/validate-skills.mjs` 通过
   - [ ] README 中/英、CHANGELOG、package.json 版本号一致
   - [ ] 无 `console.log` / `debugger` 残留（脚本除外）
4. 使用仓库的 [Pull Request 模板](./PULL_REQUEST_TEMPLATE.md) 提交 PR 到 `main`。
5. 描述中说明：变更总结、动机、测试/构建验证方式。

## 行为准则

参与本项目即表示你同意遵守 [行为准则](./CODE_OF_CONDUCT.md)。请保持尊重、友善与建设性。
