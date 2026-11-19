# Agent Skills Hub

![Agent Skills Hub Banner](public/banner.svg)

[![版本](https://img.shields.io/badge/version-v1.16.22-blue)](CHANGELOG.md) [![许可证](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![CI](https://github.com/sutchan/Agent-Skills-Hub/actions/workflows/ci.yml/badge.svg)](https://github.com/sutchan/Agent-Skills-Hub/actions/workflows/ci.yml) [![英文文档](https://img.shields.io/badge/docs-English-blue)](README.en.md)

> 其他语言：[English](README.en.md)

**一个集中管理、可浏览、可检索的 AI Agent 技能目录** —— 覆盖 13 个分类、169 个技能（含 1 个隐藏），提供中文描述与英文原文，界面支持简体中文 / 繁体中文 / 英语三语切换，中文用户开箱即用。

## ✨ 特性

- 🔍 **检索与筛选**：按领域、关键词、标签实时筛选、搜索技能
- ⭐ **投票与收藏**：为常用 / 看好的技能投票、收藏，并查看热度排序
- 🌐 **三语界面**：简体中文（默认）→ 繁体中文 → 英语一键循环切换；技能描述中英共存，英文原文存于 `en_description`
- 📦 **一键安装**：复制 `skills/<name>/` 目录，或用 [skills-manager](https://github.com/xingkongliang/skills-manager) 批量管理
- 🧩 **标准化规范**：基于 `SKILL.md`（`name`/`description`/`category` 等），技能靠 `description` 自动触发
- 📈 **分类占比环形图**：13 个分类的数量/占比实算可视化，点击扇区或图例直接筛选
- 🧭 **可维护前端**：全站 DOM id 统一 kebab-case（便于调试/无障碍/e2e），页脚展示 `vX.Y.Z · build yymmddhhmm`（版本号链接 Releases，构建号点击可复制环境信息）
- 📊 **纯静态站点**：`output: "export"` 纯静态导出，已对接 EdgeOne Pages 自动部署（CI），部署简单

## 📊 规模

| 指标 | 数值 |
|---|---|
| 技能总数 | 169（含 1 个隐藏） |
| 可见技能 | 168 |
| 分类 | 13 类（契约 14 大领域，「桌面与客户端」暂无技能） |
| 许可证 | 整体 MIT（各技能许可证见其目录） |

## 🚀 快速开始

> 只想用技能？无需碰任何构建脚本。

1. **浏览技能**：运行本地服务后访问站点，按领域筛选查看技能。
2. **安装技能**：把 `skills/<name>/` 整个目录复制到你的 Agent 技能目录（如 Claude Code 的 `~/.claude/skills/`）。
3. **触发使用**：技能靠 `SKILL.md` 的 `description` 自动触发，也可在对话中显式 `@技能名` 调用。
4. **查看依赖**：部分技能依赖 `scripts/` 脚本或外部工具，使用前先读对应 `SKILL.md`。

## 📂 目录结构

```
Agent-Skills-Hub/
├── skills/            # 技能目录（每个技能一个子目录，含 SKILL.md）
├── src/index.html     # 高保真原型 / 站点前端（单文件内联）
├── server/            # 本地预览服务模块化实现（config/fs-util/store/ratelimit/api/pages）
├── server.js          # 本地预览服务入口（Express，薄装配层）
├── data/              # skills-data.json（权威元数据）/ skills-metrics.json（派生指标）
├── scripts/           # sync-inline-data / inject-ga / sync-seo-assets（数据同步·构建注入·SEO/GEO）
│   └── seo/           # facts / render-assets / render-page（SEO 资产生成模块）
├── tools/             # check-version / check-skill-yaml / check-inline-js / validate-skills 等
├── e2e/               # Playwright 冒烟测试
├── prototype/         # 设计规范（DESIGN / COMPONENTS）+ 线框/状态/结构契约 HTML，不参与构建
├── docs/              # AGENTS.md / project.md / spec.md / tasks.md / tasks-done.md
└── .github/           # CI 工作流与贡献指南
```

## 本地预览

仓库为纯静态站点，由 `server.js`（Express）提供预览服务：

```bash
npm install
npm run dev      # 启动静态服务，默认 http://localhost:3000
```

技能数据维护于 `data/skills-data.json`（稳定元数据）与 `data/skills-metrics.json`（派生指标）。改完数据后运行 `npm run sync:data` 将最新技能同步进 `src/index.html` 的内联 `window.SKILLS_DATA`，保持前端展示与权威数据一致。

## 验证与构建

```bash
npm run lint                 # TypeScript 类型检查
npm test                     # 数据契约 / KV 单测
npm run validate:yaml        # SKILL.md frontmatter 真 YAML 校验（Bun）
node tools/check-version.mjs # 版本、CHANGELOG、徽章、文档头一致性
node tools/check-inline-js.mjs # src/index.html 内联 JS 语法
npm run sync:seo             # 生成 robots/sitemap/llms*/JSON-LD/静态技能目录（幂等）
npm run build                # 先同步 SEO 资产，再静态导出 out/ + 注入 GA / 版本 / 构建号
npm run e2e                  # Playwright 冒烟测试（自动起本地服务）
node scripts/verify-storage.mjs # 投票/收藏 API 与磁盘持久化端到端验证（需服务已启动）
```

> 本机若未下载 Playwright 自带 chromium，可用 `PLAYWRIGHT_CHANNEL=msedge npm run e2e`（PowerShell：`$env:PLAYWRIGHT_CHANNEL='msedge'; npm run e2e`）复用已安装的 Edge；CI 默认通道不变。

> `src/index.html` 是**自包含单文件应用**（内联 CSS/JS/数据，双击即开），按 `docs/spec.md` §7 红线 10 豁免「单文件 >200 行拆分」规则；`prototype/template.html` 是它的 DOM 结构契约（含语义化 id），样式与脚本仍以 `src/index.html` 为唯一事实来源。

## 🔎 SEO 与 GEO（搜索引擎 / 生成式引擎）

站点同时面向传统搜索引擎与生成式引擎（LLM 抓取与引用）。所有数量、分类、描述由脚本从权威数据实算，生成物中禁止手填数字。

| 资产 | 访问路径 | 作用 |
|---|---|---|
| `robots.txt` | `/robots.txt` | 允许抓取公开内容与 AI 可读清单，屏蔽 `/api/`，声明 Sitemap |
| `sitemap.xml` | `/sitemap.xml` | 仅收录首页；`#cat` / `#q` / `#skill` 深链返回同一首页，列入会制造重复内容 |
| `llms.txt` | `/llms.txt` | 生成式引擎标准摘要入口：站点是什么、去哪里拿完整数据 |
| `llms-full.txt` | `/llms-full.txt` | 全部可见技能的完整可读清单：名称 / 中文名 / 描述 / 标签 / 安装路径 / 源码 / 详情深链 |
| JSON-LD | 页面 `<head>` | `WebSite`（含 `SearchAction`）/ `CollectionPage` / `SoftwareApplication` / `FAQPage` |
| 静态目录 | `#site-directory` | 静态 HTML 的关于文案、FAQ 与折叠全量技能索引，无需执行 JS 即可抓取 |
| 数据副本 | `/data/skills-data.json` | 权威 `data/skills-data.json` 的只读发布副本，保证静态部署产物中该 URL 真实可达 |

维护方式：

```bash
npm run sync:seo   # 重新生成全部资产（幂等：内容不变不写盘）
```

- 数据变更后运行 `npm run sync:data`，会依次同步内联 `window.SKILLS_DATA` 与全部 SEO 资产；`npm run build` 也会先跑一次，保证产物与数据一致。
- 事实来源为 `data/skills-data.json`（技能数 / 分类数 / 描述均实时读取），生成逻辑位于 `scripts/seo/` 与 `scripts/sync-seo-assets.mjs`；`src/index.html` 中 `SEO-JSONLD:BEGIN/END`、`SEO-DIRECTORY:BEGIN/END` 之间为生成区，勿手工编辑。
- 三语界面共用一个 URL（JS 切换 + `documentElement.lang` 同步），因此不添加 `hreflang` 自引用链接；语言信息由 `og:locale` / `og:locale:alternate` 与 `lang` 属性表达。
- 校验：`node tools/check-inline-js.mjs`（JSON-LD 为 `application/ld+json`，会被脚本正确跳过）、`node tools/check-version.mjs`，部署后可用 `/llms.txt` 与 `/sitemap.xml` 实查可达性。

## 安装方式

### 方式 A：手动复制

将 `skills/<name>/` 整个目录复制到你的 Agent 技能目录（如 Claude Code 的 `~/.claude/skills/`，Windows：`%USERPROFILE%\.claude\skills\`；CodeBuddy 参考客户端文档）。技能通过 `SKILL.md` 的 `description` 自动触发。

### 方式 B：skills-manager 一键管理

推荐使用 [skills-manager](https://github.com/xingkongliang/skills-manager) 批量安装、更新与卸载：

```bash
git clone https://github.com/sutchan/Agent-Skills-Hub.git
cd Agent-Skills-Hub
# 按 skills-manager 文档将 skills/ 导入/链接到你的 Agent
```

## 贡献指南

- 新增技能：使用内置 [`skill-creator`](skills/skill-creator/) 技能按规范创建与评估。
- 目录命名用小写中划线（`kebab-case`），且与 frontmatter `name` 一致。
- `SKILL.md` 必备字段：`name`、`description`(中)、`en_description`(英)、`zh_displayName`、`category`、`en_category`。
- 详细规范见 [CONTRIBUTING.md](.github/CONTRIBUTING.md)。

## 许可证

各技能许可证见其目录内 `LICENSE` 文件（如 [`skill-creator/LICENSE.txt`](skills/skill-creator/LICENSE.txt)）。项目整体采用 [MIT](LICENSE) 协议。

## 相关文档

- [变更记录](CHANGELOG.md) · [贡献指南](.github/CONTRIBUTING.md) · [协作指引](docs/AGENTS.md) · [能力契约](docs/spec.md) · [英文文档](README.en.md)
- 项目地址：https://github.com/sutchan/Agent-Skills-Hub
- 在线站点：https://skills.ewuse.com

## 环境变量（部署）

站点为纯静态导出（`next.config.mjs` 的 `output: "export"`），Google Analytics 4 衡量 ID **不再硬编码**，改由部署平台环境变量 `GA_MEASUREMENT_ID` 注入：

| 变量 | 说明 | 必填 | 默认 |
|---|---|---|---|
| `GA_MEASUREMENT_ID` | GA4 衡量 ID（形如 `G-XXXXXXXXXX`） | 否（未设置时回退 `G-WQDDVB14PF`） | `G-WQDDVB14PF` |

- **GitHub Actions 构建**：在仓库 **Settings → Variables** 新增 `GA_MEASUREMENT_ID`（值为你的 GA4 ID）。`build` job 已将其注入构建环境，`scripts/inject-ga.mjs` 在构建期写入 `out/index.html`。
- **EdgeOne Pages 构建**（若改用平台构建而非仅部署）：在 EdgeOne 项目环境变量中设置同名 `GA_MEASUREMENT_ID` 即可。
- **本地预览**：`server.js` 直接读取 `process.env.GA_MEASUREMENT_ID` 注入，未设置时回退默认值，本地 GA 不受影响。
