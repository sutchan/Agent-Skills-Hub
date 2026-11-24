# Agent Skills Hub

![Agent Skills Hub Banner](public/banner.svg)

[![Version](https://img.shields.io/badge/version-v1.21.5-blue)](CHANGELOG.md) [![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![CI](https://github.com/sutchan/Agent-Skills-Hub/actions/workflows/ci.yml/badge.svg)](https://github.com/sutchan/Agent-Skills-Hub/actions/workflows/ci.yml) [![中文文档](https://img.shields.io/badge/docs-中文-blue)](README.md)

> Other languages: [中文文档](README.md)

**A centrally managed, browsable, and searchable catalog of AI agent skills** — spanning 13 categories with 169 skills (1 hidden), offering Chinese descriptions alongside English originals. The UI supports three languages: Simplified Chinese (default), Traditional Chinese, and English.

## ✨ Features

- 🔍 **Search & filter**: filter and search skills by domain, keyword, and tag in real time
- ⭐ **Vote & favorite**: vote and bookmark your most-used / most-promising skills, and sort by popularity
- 🌐 **Trilingual UI**: Simplified Chinese (default) → Traditional Chinese → English in one click; skill data keeps Chinese + English descriptions, with English originals in `en_description`
- 📦 **One-click install**: copy `skills/<name>/`, or use [skills-manager](https://github.com/xingkongliang/skills-manager) for batch management
- 🧩 **Standardized spec**: based on `SKILL.md` (`name`/`description`/`category`, etc.); skills auto-trigger via `description`
- 📈 **Category donut chart**: real counts / shares for all 13 categories; click a slice or legend item to filter
- 🧭 **Maintainable front end**: all DOM ids are kebab-case (debugging / a11y / e2e), footer shows `vX.Y.Z · build yymmddhhmm` (version links to Releases; clicking the build id copies the environment info)
- 📊 **Pure static site**: `output: "export"` static export, wired for EdgeOne Pages auto-deploy via CI — easy to deploy

## 📊 Scale

| Metric | Value |
|---|---|
| Total skills | 169 (1 hidden) |
| Visible skills | 168 |
| Categories | 13 (14-domain taxonomy; "Desktop & Clients" currently empty) |
| License | MIT overall (per-skill licenses in each dir) |

## 🚀 Quick Start

> Just want to use a skill? No build scripts needed.

1. **Browse skills**: run the local server and visit the site, then filter by domain to explore skills.
2. **Install**: copy the whole `skills/<name>/` directory into your agent's skills path (e.g. Claude Code's `~/.claude/skills/`).
3. **Trigger**: skills auto-trigger via the `description` in `SKILL.md`, or invoke explicitly with `@skill-name`.
4. **Check dependencies**: some skills need `scripts/` or external tools — read the skill's `SKILL.md` first.

## 📂 Directory Structure

```
Agent-Skills-Hub/
├── skills/            # Skill directories (one subdir per skill, with SKILL.md)
├── src/index.html     # High-fidelity prototype / site frontend (single-file inline)
├── server/            # Local preview server modules (config/fs-util/store/ratelimit/api/pages)
├── server.js          # Local preview server entry (Express, thin assembly)
├── data/              # skills-data.json (source of truth) / skills-metrics.json (derived)
├── scripts/           # sync-inline-data / inject-ga / tag-release (sync · build inject · release)
├── tools/             # check-version / check-skill-yaml / check-inline-js / validate-skills etc.
├── e2e/               # Playwright smoke tests
├── prototype/         # Design specs (DESIGN / COMPONENTS) + wireframe/state/structure contract HTML (not built)
├── docs/              # AGENTS.md / project.md / spec.md / tasks.md / tasks-done.md
└── .github/           # CI workflows and contributing guide
```

## Local Preview

The repo is a static site served by `server.js` (Express):

```bash
npm install
npm run dev      # start the server, default http://localhost:3000
```

Skill data is maintained in `data/skills-data.json` (stable metadata) and `data/skills-metrics.json` (derived metrics), and synced into `src/index.html`'s inline `window.SKILLS_DATA` via `npm run sync:data` to keep the UI consistent with the source of truth.

## Validation & Build

```bash
npm run lint                  # TypeScript type check
npm test                      # data contract / three-backend contract / i18n parity / data-chain unit tests
npm run validate:yaml         # real YAML frontmatter validation (Bun)
node tools/check-version.mjs  # version / CHANGELOG / badges / doc headers
node tools/check-inline-js.mjs # inline JS syntax
npm run sync:seo              # generate robots/sitemap/llms*/JSON-LD/static index (idempotent)
npm run sync:metrics          # recompute skill metrics from disk (size / files / popularity)
npm run check:metrics         # verify metrics match disk (also runs in CI)
npm run build                 # sync data + SEO assets -> emit out/ -> inject GA/version/build id
npm run e2e                   # Playwright smoke tests (starts the server)
node scripts/verify-storage.mjs # votes/favorites API + disk persistence e2e (server must be running)
```

> If Playwright's bundled chromium is not installed locally, run `PLAYWRIGHT_CHANNEL=msedge npm run e2e` to reuse an installed Edge; the CI default channel is unchanged.

> `src/index.html` is a **self-contained single-file app** (inline CSS/JS/data, opens by double-click) and is exempt from the ">200 lines must be split" rule per `docs/spec.md` §7 red line 10; `prototype/template.html` is its DOM structure contract (semantic ids included), while `src/index.html` remains the single source of truth for styles and scripts.

## SEO & GEO (Search / Generative Engines)

The site serves both classic search engines and generative engines (LLM crawlers and citation). All counts, categories and descriptions are computed from the authoritative data file — generated files never contain hand-written numbers.

| Asset | URL | Purpose |
|---|---|---|
| `robots.txt` | `/robots.txt` | Allows public content and AI-readable manifests, disallows `/api/`, declares the sitemap |
| `sitemap.xml` | `/sitemap.xml` | Homepage and standalone about page; `#cat` / `#q` / `#skill` deep links return the same HTML and would create duplicate content |
| `llms.txt` | `/llms.txt` | Standard summary entry point for generative engines |
| `llms-full.txt` | `/llms-full.txt` | Full readable index of every visible skill: name, Chinese name, description, tags, install path, source, detail link |
| `about.html` | `/about.html` | Standalone about page (`/about` 301 redirects): home of the FAQ and data entry points — crawlable without executing JS |
| JSON-LD | page `<head>` | Homepage: `WebSite` (with `SearchAction`), `CollectionPage`, `SoftwareApplication`; about page: `AboutPage`, `FAQPage` |
| About content | `/about.html` | The homepage no longer renders an about section; the about blurb, FAQ and data entry points live exclusively on the standalone about page (full list: `/llms-full.txt`) |
| Data copy | `/data/skills-data.json` | Read-only deploy copy of the authoritative `data/skills-data.json` |

```bash
npm run sync:seo   # regenerate every asset (idempotent: no write when unchanged)
```

- After a data change, run `npm run sync:data` before building: it syncs inline `window.SKILLS_DATA`, the static publish copy `public/data/skills-data.json`, the whitelist manifests and all SEO assets. `npm run build` already runs `sync:data` (use `npm run sync:seo` when you only want SEO assets).
- Generated logic lives in `scripts/seo/` and `scripts/sync-seo-assets.mjs`. Only the block between `SEO-JSONLD:BEGIN/END` in `src/index.html` is generated — do not edit by hand; all about content is generated into `public/about.html`.
- All three UI languages share one URL, so no self-referencing `hreflang` links are emitted; language is expressed via `og:locale` / `og:locale:alternate` and `documentElement.lang`.

## Installation

### Option A: Manual copy

Copy the whole `skills/<name>/` directory into your agent's skills path (e.g. Claude Code's `~/.claude/skills/`, Windows: `%USERPROFILE%\.claude\skills\`; for CodeBuddy see client docs). Skills auto-trigger via the `description` in `SKILL.md`.

### Option B: Install & manage with skills-manager

We recommend [skills-manager](https://github.com/xingkongliang/skills-manager) for batch install/update/uninstall:

```bash
git clone https://github.com/sutchan/Agent-Skills-Hub.git
cd Agent-Skills-Hub
# import/link skills from skills/ into your agent via skills-manager
```

## Contributing

- New skills: use the built-in [`skill-creator`](skills/skill-creator/) skill to create and evaluate per guidelines.
- Name skill directories in `kebab-case`, matching the frontmatter `name`.
- `SKILL.md` required fields: `name`, `description` (zh), `en_description` (en), `zh_displayName`, `category`, `en_category`.
- Details in [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## License

Per-skill licenses are in each directory's `LICENSE` file (e.g. [`skill-creator/LICENSE.txt`](skills/skill-creator/LICENSE.txt)). The project itself is [MIT](LICENSE).

## Related Documents

- [Changelog](CHANGELOG.md) · [Contributing](.github/CONTRIBUTING.md) · [AI collaboration guide](docs/AGENTS.md) · [Capability spec](docs/spec.md) · [中文文档](README.md)
- Repository: https://github.com/sutchan/Agent-Skills-Hub
- Live site: https://skills.ewuse.com

## Environment Variables (Deployment)

The site is a pure static artifact (`npm run build` = sync data -> `scripts/build-static.mjs` emits `out/` -> `scripts/inject-ga.mjs` injects GA / version / build id). The Google Analytics 4 measurement ID is **no longer hard-coded** and is injected via the `GA_MEASUREMENT_ID` environment variable at deploy time:

| Variable | Description | Required | Default |
|---|---|---|---|
| `GA_MEASUREMENT_ID` | GA4 measurement ID (e.g. `G-XXXXXXXXXX`) | No (falls back to `G-WQDDVB14PF`) | `G-WQDDVB14PF` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token (votes/favorites storage; Vercel dashboard → Storage → Blob) | Required in production; local falls back to file | — |
| `USE_BLOB` | Force Vercel Blob locally (set to `1`); auto-enabled in production (`VERCEL=1`) | No | — |

- **Vercel build**: `vercel.json` declares `framework: null` (publish as a pure static site — framework detection disabled), `buildCommand: "npm run build"` and `outputDirectory: "out"`. **Project settings override repo config**: set Framework Preset to Other / Static in the Vercel dashboard; if Output Directory was set manually, change it to `out` or clear it — otherwise `STATIC_BUILD_NO_OUT_DIR` persists. Vercel publishes the static `out/` and auto-detects root `api/` as Serverless Functions: `/api/votes` and `/api/favorites` are served by `api/*.js` + Vercel Blob (**since v1.16.25**; the EdgeOne edge worker is the legacy approach).
- **GitHub Actions build**: add `GA_MEASUREMENT_ID` (your GA4 ID) under repo **Settings → Variables**. The `build` job injects it, and `scripts/inject-ga.mjs` writes it into `out/index.html` at build time.
- **EdgeOne Pages build** (if using platform build instead of deploy-only): the root `edgeone.json` explicitly declares `buildCommand: "npm run build"` and `outputDirectory: "out"`, overriding console defaults — in v1.21.1 the platform used a stale preset and failed at `lstat .next` after a successful build (CLI exit 18). Pure static sites need no `framework` field; this file is distinct from `edgeone.config.json` (edge function routes / KV bindings). Set `GA_MEASUREMENT_ID` in the EdgeOne project environment variables.
- **Local preview**: `server.js` reads `process.env.GA_MEASUREMENT_ID` directly, falling back to the default when unset — local GA is unaffected.
