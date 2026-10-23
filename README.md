# Agent Skills Hub

![Agent Skills Hub Banner](public/banner.svg)

[![版本](https://img.shields.io/badge/version-v1.15.4-blue)](CHANGELOG.md) [![许可证](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![英文文档](https://img.shields.io/badge/docs-English-blue)](README.en.md)

> 其他语言：[English](README.en.md)

一个集中管理的 AI 技能（Skill）集合，覆盖多个领域。每个技能是独立目录，内含 `SKILL.md`（说明与触发描述 + frontmatter 元数据）及可选的 `scripts/`、`references/`、`assets/`、`agents/` 资源。仓库做了「中文目录 + 中文描述」本地化，英文原文存 `en_description`，中文用户开箱即用。

## 快速开始

> 只想用技能？无需碰任何构建脚本。

1. **浏览技能**：运行本地服务后访问站点，按领域筛选查看技能。
2. **安装技能**：把 `skills/<name>/` 整个目录复制到你的 Agent 技能目录（如 Claude Code 的 `~/.claude/skills/`）。
3. **触发使用**：技能靠 `SKILL.md` 的 `description` 自动触发，也可在对话中显式 `@技能名` 调用。
4. **查看依赖**：部分技能依赖 `scripts/` 脚本或外部工具，使用前先读对应 `SKILL.md`。

## 本地预览

仓库为纯静态站点，由 `server.js`（Express）提供预览服务：

```bash
npm install
npm run dev      # 启动静态服务，默认 http://localhost:3000
```

技能数据维护于 `data/skills-data.json`（稳定元数据）与 `data/skills-metrics.json`（派生指标）。

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

各技能许可证见其目录内 `LICENSE` 文件（如 [`skill-creator/LICENSE.txt`](skill-creator/LICENSE.txt)）。项目整体采用 [MIT](LICENSE) 协议。

## 相关文档

- [变更记录](CHANGELOG.md) · [贡献指南](.github/CONTRIBUTING.md) · [英文文档](README.en.md)
- 项目地址：https://github.com/sutchan/Agent-Skills-Hub
