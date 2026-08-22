# Agent Skills Hub

![Agent Skills Hub Banner](app/public/banner.svg)

[![Version](https://img.shields.io/badge/version-v1.19.41-blue)](CHANGELOG.md) [![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![中文文档](https://img.shields.io/badge/docs-中文-blue)](README.md) [![Skills](https://img.shields.io/badge/skills-dynamic-blue)](prototype/index.html)

> **Author**: Sut Chan ｜ **Repository**: https://github.com/sutchan/Agent-Skills-Hub

A centrally managed collection of AI skills covering Brand & Design, Docs & Content, Data Analysis & Visualization, Dev Frameworks & Platforms, File & Format Handling, Automation & Integration, AI & Agents, Media & Multimedia, and Security across 9 domains — 152 skill packs on GitHub. Each skill is a standalone directory with `SKILL.md` plus optional `scripts/`, `references/`, `assets/`, `agents/`; localized with Chinese categories and descriptions, while bodies keep upstream English (coverage tracked by `tools/coverage.py`).

## Highlights

> Why choose Agent Skills Hub?

| | Highlight | Description |
|---|---|---|
| ⚙️ | **Zero-maintenance listing** | Skill data and the showcase page are auto-generated from on-disk `skills/*/SKILL.md` by `npm run build` — no manual listing to maintain when adding or removing skills |
| 🗂️ | **152 skills · 9 domains** | Covers Brand & Design, Docs & Content, Data Analysis & Visualization, Dev Frameworks & Platforms, File & Format Handling, Automation & Integration, AI & Agents, Media & Multimedia, Security |
| 🌏 | **Chinese by default** | Chinese category (`category`) + English category (`en_category`) + one-line summary + full Chinese description (`description`, default display language), English original in `en_description` — ready for Chinese-speaking agent users |
| 📦 | **One-click install** | Bulk install / update / remove via [skills-manager](https://github.com/xingkongliang/skills-manager) |
| 🚀 | **Works offline** | Self-contained static showcase (`prototype/index.html`) inlines all data — double-click to browse every skill with no framework dependency |

## Table of Contents

- [Repository Structure](#repository-structure)
- [Browsing Skills](#browsing-skills)
- [Usage](#usage)
- [Online Showcase](#online-showcase)
- [Contributing](#contributing)
- [License](#license)
- [Related Documents](#related-documents)

## Repository Structure

```
<skill-name>/
├── SKILL.md          # entry: name + description metadata + notes
├── scripts/          # optional: executables
├── references/       # optional: reference docs
├── assets/           # optional: templates/assets
└── agents/           # optional: sub-agent definitions
```

## Browsing Skills

Skills are organized into the following domains (see the [Online Showcase](#online-showcase) for the full, live list; this table is a navigation aid and does not churn with every skill add/remove):

| Domain | Skills |
|--------|--------|
| Brand & Design | 27 |
| Docs & Content | 11 |
| Data Analysis & Visualization | 2 |
| Frontend Dev | 18 |
| Backend & Platform | 6 |
| Mobile Dev | 11 |
| WordPress & CMS | 12 |
| Engineering Practice & Quality | 29 |
| File & Format Handling | 4 |
| Automation & Integration | 10 |
| AI & Agents | 8 |
| Media & Multimedia | 11 |
| Security | 4 |

> Browse all skills:
> - Static showcase: [`prototype/index.html`](prototype/index.html)
> - Data file: [`data/skills-data.json`](data/skills-data.json) (auto-generated from `skills/` via `npm run build`)
> - Web app: see [Online Showcase](#online-showcase) below

## Usage

Browse the skills first in the [Online Showcase](#online-showcase) (or open [`prototype/index.html`](prototype/index.html) directly), pick what you need, then install into your agent via either approach below.

### Option A: Manual copy (quick start)

1. Copy the needed skill directory into your agent's skills path (e.g. Claude Code / CodeBuddy `skills/`).
2. Skills auto-trigger via the `description` field in `SKILL.md`, or can be invoked explicitly with `@skill-name`.
3. Some skills depend on `scripts/` or external tools — read the skill's `SKILL.md` before use.

### Option B: Install & manage with skills-manager

We recommend [skills-manager](https://github.com/xingkongliang/skills-manager) for batch install/update/uninstall of skills, avoiding manual directory copying:

```bash
git clone https://github.com/sutchan/Agent-Skills-Hub.git
# import/link skills from skills/ into your agent via skills-manager
```

See the [skills-manager docs](https://github.com/xingkongliang/skills-manager) for commands and configuration.

## Online Showcase

The repo provides two showcase options, both auto-generated from `skills/<name>/SKILL.md` — run `npm run build` after adding/removing skills, no manual list maintenance needed:

| Directory | Type | Purpose |
|-----------|------|---------|
| `prototype/index.html` | Static single-file showcase | Self-contained skill data inlined at build time; opens offline |
| `app/` | Runnable web app (source) | Next.js app generating data from `skills/` (see [`app/README.md`](app/README.md)) |

`app/` is the web app source workspace; tech stack and commands per [`app/README.md`](app/README.md):

```bash
cd app
npm install
npm run dev      # local dev server
npm run build    # production build
npm run start    # start production server
```

## Contributing

- New skills: use the [`skill-creator`](skills/skill-creator/) skill to create and evaluate per guidelines.
- Name skill directories in `kebab-case`, e.g. `python-testing/`.
- `SKILL.md` must include `name`, `description`, `en_description`, `zh_displayName`, `category`, and `en_category` front-matter; `category` is one of the 9 domains (Chinese stable key: 品牌与设计 / 文档与内容 / 数据分析与可视化 / 开发框架与平台 / 文件与格式处理 / 自动化与集成 / AI 与智能体 / 音视频与多媒体 / 安全), `en_category` is the corresponding English category name, `zh_displayName` is a one-line Chinese summary, `description` is the Chinese full description (default display language), `en_description` is the English original, and `build-skills-data.mjs` reads these fields from the on-disk `skills/` as the single source of truth.
- After skill changes, run `npm run build` to regenerate `data/skills-data.json` and the showcase.

See also [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## License

Per-skill licenses are in each directory's `LICENSE` file (e.g. [skill-creator/LICENSE.txt](skill-creator/LICENSE.txt)).

## Related Documents

- [Changelog](CHANGELOG.md) — version & change history
- [Contributing](.github/CONTRIBUTING.md) — how to add/update skills
- [Code of Conduct](.github/CODE_OF_CONDUCT.md) — community standards
- [Security Policy](.github/SECURITY.md) — private vulnerability reporting and security red lines
- [Support](.github/SUPPORT.md) — where to get help, FAQ and contact channels
- [License](LICENSE) — project license (MIT)
- [中文文档](README.md) — Chinese README
- Repository: https://github.com/sutchan/Agent-Skills-Hub
