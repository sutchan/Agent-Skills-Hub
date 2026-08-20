# Agent Skills Hub

![Agent Skills Hub Banner](app/public/banner.svg)

[![Version](https://img.shields.io/badge/version-v1.14.64-blue)](CHANGELOG.md) [![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![中文文档](https://img.shields.io/badge/docs-中文-blue)](README.md) [![Skills](https://img.shields.io/badge/skills-dynamic-blue)](prototype/index.html)

> **Author**: Sut Chan ｜ **Repository**: https://github.com/sutchan/Agent-Skills-Hub
>
> A centrally managed collection of AI skills covering brand design, docs & content, data analysis, dev frameworks, and file & format handling — 49 skill packs on GitHub.

Each skill is a standalone directory containing `SKILL.md` (name + description metadata + usage notes) plus optional `scripts/`, `references/`, `assets/`, `agents/`. This repo localizes skills with Chinese categories and descriptions; skill bodies (`SKILL.md`) largely keep upstream English, with translation coverage tracked by `tools/coverage.py` in CI.

## Table of Contents

- [Repository Structure](#repository-structure)
- [Browsing Skills](#browsing-skills)
- [Usage](#usage)
- [Online Showcase](#online-showcase)
- [Brand Assets](#brand-assets)
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
| Brand & Design | 8 |
| Docs & Content | 11 |
| Data Analysis & Visualization | 1 |
| Dev Frameworks & Platforms | 25 |
| File & Format Handling | 4 |

> Browse all skills:
> - Static showcase: [`prototype/index.html`](prototype/index.html)
> - Data file: [`data/skills-data.json`](data/skills-data.json) (auto-generated from `skills/` via `npm run build`)
> - Web app: see [Online Showcase](#online-showcase) below

## Usage

1. Copy the needed skill directory into your agent's skills path (e.g. Claude Code / CodeBuddy `skills/`).
2. Skills auto-trigger via the `description` field in `SKILL.md`, or can be invoked explicitly with `@skill-name`.
3. Some skills depend on `scripts/` or external tools — read the skill's `SKILL.md` before use.

### Install & manage with skills-manager

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

## Brand Assets

The project uses a unified vector logo and favicon in brand green `#2e9e6b` (HSL `152 56% 40%`), sharing the same hue as the design system `--primary` (light mode brightens to `#5cc98c` / `146 52% 60%`). The brand glyph (three nodes converging to a hub) has a single source of truth in [`app/public/hub.svg`](app/public/hub.svg) as `<symbol id="ash-hub">` (driven by `currentColor`); all marks live in [`app/public/`](app/public/) and reference the same symbol via `<use href="/hub.svg#ash-hub">`, so the prototype and `app/` share one glyph definition with zero hard-coded copies.

| Asset | File | Description |
|-------|------|-------------|
| Glyph source | [`app/public/hub.svg`](app/public/hub.svg) | `<symbol id="ash-hub">` single glyph definition (currentColor) |
| Color logo | [`app/public/logo.svg`](app/public/logo.svg) | Rounded-square tile with three nodes converging to a hub; for headers and covers |
| Monochrome logo | [`app/public/logo-monochrome.svg`](app/public/logo-monochrome.svg) | Dark-green tile with brand-green glyph; for light footers / print |
| Favicon | [`app/public/favicon.svg`](app/public/favicon.svg) | Solid green, no gradient; for browser tabs and bookmarks; also served as Next.js `/favicon.svg` |
| README banner | [`app/public/banner.svg`](app/public/banner.svg) | 1200×400 brand-green gradient + serif title/subtitle |
| Social share banner | [`app/public/banner-og.svg`](app/public/banner-og.svg) | 1200×628 Open Graph / social card |

## Contributing

- New skills: use the [`skill-creator`](skills/skill-creator/) skill to create and evaluate per guidelines.
- Name skill directories in `kebab-case`, e.g. `python-testing/`.
- `SKILL.md` must include `name`, `description`, `category`, and `zh` front-matter; `category` is one of the 5 domains defined in [`prototype/`](prototype/), `zh` is a one-line Chinese description, and `build-skills-data.mjs` reads these fields from the on-disk `skills/` as the single source of truth.
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
- [Workspace](agent-skills-hub.code-workspace) — workspace config
- Repository: https://github.com/sutchan/Agent-Skills-Hub
