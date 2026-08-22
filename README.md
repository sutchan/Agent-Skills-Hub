# Agent Skills Hub

![Agent Skills Hub Banner](app/public/banner.svg)

[![版本](https://img.shields.io/badge/version-v1.20.11-blue)](CHANGELOG.md) [![许可证](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![英文文档](https://img.shields.io/badge/docs-English-blue)](README.en.md) [![技能数量](https://img.shields.io/badge/skills-动态-blue)](prototype/index.html)

一个集中管理的 AI 技能（Skill）集合，涵盖品牌与设计、文档与内容、数据分析与可视化、开发框架与平台、文件与格式处理、自动化与集成、AI 与智能体、音视频与多媒体、安全 9 大稳定领域，共 179 个技能包（其中 1 个标记为隐藏，公开可见 178 个）。每个技能是独立目录，内含 `SKILL.md`（技能说明与触发描述，含 frontmatter 前置元数据）及可选的 `scripts/`、`references/`、`assets/`、`agents/` 等资源；本仓库做了“中文目录 + 中文描述”的本地化，正文主要保留上游英文，翻译覆盖率由 `tools/coverage.py` 统计。

## 项目亮点

> 为什么选择 Agent Skills Hub？

| | 亮点 | 说明 |
|---|---|---|
| ⚙️ | **零维护清单** | 技能数据与展示页由 `npm run build` 从磁盘 `skills/*/SKILL.md` 自动生成，技能增删无需手工维护任何清单 |
| 🗂️ | **179 技能 · 9 大领域** | 覆盖品牌与设计、文档与内容、数据分析与可视化、开发框架与平台、文件与格式处理、自动化与集成、AI 与智能体、音视频与多媒体、安全 |
| 🌏 | **默认中文** | 中文目录 + 中文一句话简介 + 中文完整描述（`description`，默认展示语言），英文原文存 `en_description`，中文 Agent 用户开箱即用 |
| 📦 | **一键安装** | 配合 [skills-manager](https://github.com/xingkongliang/skills-manager) 批量安装 / 更新 / 卸载 |
| 🚀 | **离线可用** | 自包含静态展示页（`prototype/index.html`）内联全部数据，双击即可浏览全部技能，无框架依赖 |

## 目录

- [仓库结构](#仓库结构)
- [技能浏览](#技能浏览)
- [使用方式](#使用方式)
- [在线展示页面](#在线展示页面)
- [贡献指南](#贡献指南)
- [许可证](#许可证)
- [相关文档](#相关文档)

## 仓库结构

```
<skill-name>/
├── SKILL.md          # 技能入口：frontmatter 前置元数据（name/description/en_description/zh_displayName/category/en_category 等）+ 使用说明
├── scripts/          # 可选：可执行脚本
├── references/       # 可选：参考文档
├── assets/           # 可选：模板/素材
└── agents/           # 可选：子代理定义
```

## 技能浏览

技能按以下领域组织（完整技能列表与实时数量见 [在线展示页面](#在线展示页面)，本清单为领域导航，不随单个技能增删而频繁变动）：

| 领域 | 技能数 |
|------|--------|
| 品牌与设计 | 27 |
| 文档与内容 | 21 |
| 数据分析与可视化 | 2 |
| 开发框架与平台 | 78 |
| 文件与格式处理 | 4 |
| 自动化与集成 | 10 |
| AI 与智能体 | 8 |
| 音视频与多媒体 | 24 |
| 安全 | 4 |

> 浏览全部技能：
> - 静态展示页：[`prototype/index.html`](prototype/index.html)
> - 数据文件：[`data/skills-data.json`](data/skills-data.json)（稳定元数据，由 `npm run build` 从 `skills/` 自动生成）+ [`data/skills-metrics.json`](data/skills-metrics.json)（频繁更新的派生指标，独立存储）
> - 在线应用：见下方 [在线展示页面](#在线展示页面)

## 使用方式

先到 [在线展示页面](#在线展示页面)（或直接打开 [`prototype/index.html`](prototype/index.html)）浏览全部技能，挑出需要的，再按下面任一方式安装到你的 Agent。

### 方式 A：手动复制（快速上手）

1. 将需要的技能目录复制到你的 Agent 技能目录下（如 Claude Code / CodeBuddy 的 skills 路径）。
2. 技能通过 `SKILL.md` 的 `description` 字段自动触发，也可在对话中显式 `@技能名` 调用。
3. 部分技能依赖 `scripts/` 脚本或外部工具，使用前请阅读对应 `SKILL.md` 的依赖说明。

### 方式 B：skills-manager 一键安装与管理

推荐使用 [skills-manager](https://github.com/xingkongliang/skills-manager) 批量安装、更新与卸载技能，免去手动复制目录的麻烦：

```bash
git clone https://github.com/sutchan/Agent-Skills-Hub.git
# 按 skills-manager 的用法将本项目 skills/ 目录中的技能导入/链接到你的 Agent
```

具体命令与配置请参考 [skills-manager 仓库文档](https://github.com/xingkongliang/skills-manager)。

## 在线展示页面

仓库提供两种可运行的展示方式，均从 `skills/<name>/SKILL.md` 自动生成，技能增删后运行 `npm run build` 即可更新，无需手工维护清单：

| 目录 | 类型 | 用途 |
|------|------|------|
| `prototype/index.html` | 静态单文件展示页 | 自包含全部技能数据，构建时内联，可离线打开 |
| `app/` | 可运行 Web 应用（源码） | 基于 Next.js，从 `skills/` 实时生成数据 |

`app/` 是应用源码工作区，技术栈与命令见 `app/package.json` 与 `app/` 下源码：

```bash
cd app
npm install
npm run dev      # 本地开发服务器
npm run build    # 生产构建
npm run start    # 启动生产服务
```

## 贡献指南

- 新增技能：使用 [`skill-creator`](skills/skill-creator/) 技能按规范创建与评估。
- 技能目录命名使用小写中划线（`kebab-case`），如 `python-testing/`，目录名须与 frontmatter `name` 字段保持一致。
- `SKILL.md` 必须包含 `name`、`description`、`en_description`、`zh_displayName`、`category` 与 `en_category` 前置元数据：`category` 取 9 大稳定领域之一（中文，稳定键：品牌与设计 / 文档与内容 / 数据分析与可视化 / 开发框架与平台 / 文件与格式处理 / 自动化与集成 / AI 与智能体 / 音视频与多媒体 / 安全），`en_category` 为对应英文分类名；`zh_displayName` 为中文一句话简介；**`description` 为中文完整描述（默认展示语言），`en_description` 为英文原文描述**。`tools/build-skills-data.mjs` 以磁盘 `skills/` 为唯一权威源读取这些字段，未知分类自动追加为末位「其他」类（属违规，须为零）。
- 技能变更后运行 `npm run build` 重新生成 `data/skills-data.json` + `data/skills-metrics.json` 与展示页。频繁更新的指标（popularity/stars/size/files）仅需重算 `skills-metrics.json`，主数据文件保持轻量。

## 许可证

各技能许可证见其目录内 `LICENSE` 文件（如 [`skill-creator/LICENSE.txt`](skill-creator/LICENSE.txt)）。

## 相关文档

- [变更记录](CHANGELOG.md) — 版本与重要变更记录（Keep a Changelog + SemVer）
- [贡献指南](.github/CONTRIBUTING.md) — 如何新增/更新技能并保持 README 同步
- [行为准则](.github/CODE_OF_CONDUCT.md) — 社区参与基本准则
- [安全政策](.github/SECURITY.md) — 漏洞私密报告渠道与安全红线
- [获取支持](.github/SUPPORT.md) — 问题反馈、FAQ 与联系渠道
- [英文文档](README.en.md) — English README
- [许可证](LICENSE) — 项目整体许可证（MIT）
- 项目地址：https://github.com/sutchan/Agent-Skills-Hub
