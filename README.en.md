# Skills

[![Skills](https://img.shields.io/badge/skills-199-blue)](README.en.md) [![License](https://img.shields.io/badge/license-see%20LICENSE-blue)](LICENSE) [![中文文档](https://img.shields.io/badge/docs-中文-blue)](README.md)

> Author: Sut Chan
>
> Repository: https://github.com/sutchan/skills-chinese
>
> A centrally managed collection of AI skills, containing 199 skill packs for development, design, testing, DevOps, agent engineering, and industry domains.

Each skill is a standalone directory containing `SKILL.md` (name + description metadata + usage notes) plus optional `scripts/`, `references/`, `assets/`, `agents/`.

## Table of Contents

- [Repository Structure](#repository-structure)
- [Skill Categories](#skill-categories)
- [Usage](#usage)
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

## Skill Categories

### Frontend & UI Design (15)

- **[skills/api-design](skills/api-design/)** — 
- **[skills/brand-guidelines](skills/brand-guidelines/)** — 
- **[skills/brand-voice](skills/brand-voice/)** — 
- **[skills/canvas-design](skills/canvas-design/)** — 
- **[skills/design-system](skills/design-system/)** — 
- **[skills/figma](skills/figma/)** — 
- **[skills/frontend-design-2](skills/frontend-design-2/)** — 
- **[skills/frontend-patterns](skills/frontend-patterns/)** — 
- **[skills/frontend-skill](skills/frontend-skill/)** — 
- **[skills/frontend-slides](skills/frontend-slides/)** — 
- **[skills/liquid-glass-design](skills/liquid-glass-design/)** — 
- **[skills/shadcn](skills/shadcn/)** — 
- **[skills/theme-factory](skills/theme-factory/)** — 
- **[skills/ui-demo](skills/ui-demo/)** — 
- **[skills/web-design-guidelines](skills/web-design-guidelines/)** — 

### Backend, Languages & Frameworks (43)

- **[skills/bun-runtime](skills/bun-runtime/)** — 
- **[skills/compose-multiplatform-patterns](skills/compose-multiplatform-patterns/)** — 
- **[skills/cpp-coding-standards](skills/cpp-coding-standards/)** — 
- **[skills/cpp-testing](skills/cpp-testing/)** — 
- **[skills/csharp-testing](skills/csharp-testing/)** — 
- **[skills/dart-flutter-patterns](skills/dart-flutter-patterns/)** — 
- **[skills/django-patterns](skills/django-patterns/)** — 
- **[skills/django-security](skills/django-security/)** — 
- **[skills/django-tdd](skills/django-tdd/)** — 
- **[skills/django-verification](skills/django-verification/)** — 
- **[skills/dotnet-patterns](skills/dotnet-patterns/)** — 
- **[skills/golang-patterns](skills/golang-patterns/)** — 
- **[skills/golang-testing](skills/golang-testing/)** — 
- **[skills/java-coding-standards](skills/java-coding-standards/)** — 
- **[skills/jpa-patterns](skills/jpa-patterns/)** — 
- **[skills/kotlin-coroutines-flows](skills/kotlin-coroutines-flows/)** — 
- **[skills/kotlin-exposed-patterns](skills/kotlin-exposed-patterns/)** — 
- **[skills/kotlin-ktor-patterns](skills/kotlin-ktor-patterns/)** — 
- **[skills/kotlin-patterns](skills/kotlin-patterns/)** — 
- **[skills/kotlin-testing](skills/kotlin-testing/)** — 
- **[skills/laravel-patterns](skills/laravel-patterns/)** — 
- **[skills/laravel-plugin-discovery](skills/laravel-plugin-discovery/)** — 
- **[skills/laravel-security](skills/laravel-security/)** — 
- **[skills/laravel-tdd](skills/laravel-tdd/)** — 
- **[skills/laravel-verification](skills/laravel-verification/)** — 
- **[skills/nestjs-patterns](skills/nestjs-patterns/)** — 
- **[skills/nextjs-turbopack](skills/nextjs-turbopack/)** — 
- **[skills/nuxt4-patterns](skills/nuxt4-patterns/)** — 
- **[skills/perl-patterns](skills/perl-patterns/)** — 
- **[skills/perl-security](skills/perl-security/)** — 
- **[skills/perl-testing](skills/perl-testing/)** — 
- **[skills/postgres-patterns](skills/postgres-patterns/)** — 
- **[skills/python-patterns](skills/python-patterns/)** — 
- **[skills/rust-patterns](skills/rust-patterns/)** — 
- **[skills/rust-testing](skills/rust-testing/)** — 
- **[skills/springboot-patterns](skills/springboot-patterns/)** — 
- **[skills/springboot-security](skills/springboot-security/)** — 
- **[skills/springboot-tdd](skills/springboot-tdd/)** — 
- **[skills/springboot-verification](skills/springboot-verification/)** — 
- **[skills/swift-actor-persistence](skills/swift-actor-persistence/)** — 
- **[skills/swift-concurrency-6-2](skills/swift-concurrency-6-2/)** — 
- **[skills/swift-protocol-di-testing](skills/swift-protocol-di-testing/)** — 
- **[skills/swiftui-patterns](skills/swiftui-patterns/)** — 

### Architecture & Design (4)

- **[skills/android-clean-architecture](skills/android-clean-architecture/)** — 
- **[skills/architecture-decision-records](skills/architecture-decision-records/)** — 
- **[skills/backend-patterns](skills/backend-patterns/)** — 
- **[skills/hexagonal-architecture](skills/hexagonal-architecture/)** — 

### Testing & Quality (19)

- **[skills/ai-regression-testing](skills/ai-regression-testing/)** — 
- **[skills/browser-qa](skills/browser-qa/)** — 
- **[skills/code-quality-check](skills/code-quality-check/)** — 
- **[skills/code-reviewer](skills/code-reviewer/)** — 
- **[skills/code-stats](skills/code-stats/)** — 
- **[skills/coding-standards](skills/coding-standards/)** — 
- **[skills/e2e-testing](skills/e2e-testing/)** — 
- **[skills/flutter-dart-code-review](skills/flutter-dart-code-review/)** — 
- **[skills/plankton-code-quality](skills/plankton-code-quality/)** — 
- **[skills/python-testing](skills/python-testing/)** — 
- **[skills/quality-nonconformance](skills/quality-nonconformance/)** — 
- **[skills/run-tests](skills/run-tests/)** — 
- **[skills/safety-guard](skills/safety-guard/)** — 
- **[skills/security-best-practices](skills/security-best-practices/)** — 
- **[skills/security-review](skills/security-review/)** — 
- **[skills/security-scan](skills/security-scan/)** — 
- **[skills/skill-comply](skills/skill-comply/)** — 
- **[skills/tdd-workflow](skills/tdd-workflow/)** — 
- **[skills/verification-loop](skills/verification-loop/)** — 

### Agent & AI Engineering (19)

- **[skills/agent-browser](skills/agent-browser/)** — 
- **[skills/agent-eval](skills/agent-eval/)** — 
- **[skills/agent-harness-construction](skills/agent-harness-construction/)** — 
- **[skills/agent-payment-x402](skills/agent-payment-x402/)** — 
- **[skills/agentic-engineering](skills/agentic-engineering/)** — 
- **[skills/ai-first-engineering](skills/ai-first-engineering/)** — 
- **[skills/autonomous-agent-harness](skills/autonomous-agent-harness/)** — 
- **[skills/autonomous-loops](skills/autonomous-loops/)** — 
- **[skills/benchmark](skills/benchmark/)** — 
- **[skills/continuous-agent-loop](skills/continuous-agent-loop/)** — 
- **[skills/continuous-learning-v2](skills/continuous-learning-v2/)** — 
- **[skills/cost-aware-llm-pipeline](skills/cost-aware-llm-pipeline/)** — 
- **[skills/data-scraper-agent](skills/data-scraper-agent/)** — 
- **[skills/deep-research](skills/deep-research/)** — 
- **[skills/enterprise-agent-ops](skills/enterprise-agent-ops/)** — 
- **[skills/eval-harness](skills/eval-harness/)** — 
- **[skills/foundation-models-on-device](skills/foundation-models-on-device/)** — 
- **[skills/healthcare-eval-harness](skills/healthcare-eval-harness/)** — 
- **[skills/prompt-optimizer](skills/prompt-optimizer/)** — 

### DevOps & Infrastructure (11)

- **[skills/build-deploy](skills/build-deploy/)** — 
- **[skills/canary-watch](skills/canary-watch/)** — 
- **[skills/claude-devfleet](skills/claude-devfleet/)** — 
- **[skills/configure-ecc](skills/configure-ecc/)** — 
- **[skills/connections-optimizer](skills/connections-optimizer/)** — 
- **[skills/database-migrations](skills/database-migrations/)** — 
- **[skills/deployment-patterns](skills/deployment-patterns/)** — 
- **[skills/docker-patterns](skills/docker-patterns/)** — 
- **[skills/gh-cli](skills/gh-cli/)** — 
- **[skills/git-commit](skills/git-commit/)** — 
- **[skills/git-workflow](skills/git-workflow/)** — 

### Data & Machine Learning (8)

- **[skills/clickhouse-io](skills/clickhouse-io/)** — 
- **[skills/defuddle](skills/defuddle/)** — 
- **[skills/exa-search](skills/exa-search/)** — 
- **[skills/gan-style-harness](skills/gan-style-harness/)** — 
- **[skills/iterative-retrieval](skills/iterative-retrieval/)** — 
- **[skills/pytorch-patterns](skills/pytorch-patterns/)** — 
- **[skills/regex-vs-llm-structured-text](skills/regex-vs-llm-structured-text/)** — 
- **[skills/social-graph-ranker](skills/social-graph-ranker/)** — 

### Content, Docs & Writing (14)

- **[skills/article-writing](skills/article-writing/)** — 
- **[skills/brainstorming](skills/brainstorming/)** — 
- **[skills/content-engine](skills/content-engine/)** — 
- **[skills/content-hash-cache-pattern](skills/content-hash-cache-pattern/)** — 
- **[skills/crosspost](skills/crosspost/)** — 
- **[skills/doc-coauthoring](skills/doc-coauthoring/)** — 
- **[skills/documentation-lookup](skills/documentation-lookup/)** — 
- **[skills/investor-materials](skills/investor-materials/)** — 
- **[skills/investor-outreach](skills/investor-outreach/)** — 
- **[skills/market-research](skills/market-research/)** — 
- **[skills/product-lens](skills/product-lens/)** — 
- **[skills/santa-method](skills/santa-method/)** — 
- **[skills/team-builder](skills/team-builder/)** — 
- **[skills/writing-plans](skills/writing-plans/)** — 

### Video & Media (7)

- **[skills/algorithmic-art](skills/algorithmic-art/)** — 
- **[skills/fal-ai-media](skills/fal-ai-media/)** — 
- **[skills/manim-video](skills/manim-video/)** — 
- **[skills/remotion-video-creation](skills/remotion-video-creation/)** — 
- **[skills/video-editing](skills/video-editing/)** — 
- **[skills/video-use](skills/video-use/)** — 
- **[skills/videodb](skills/videodb/)** — 

### Industry Domains (14)

- **[skills/carrier-relationship-management](skills/carrier-relationship-management/)** — 
- **[skills/customer-billing-ops](skills/customer-billing-ops/)** — 
- **[skills/customs-trade-compliance](skills/customs-trade-compliance/)** — 
- **[skills/energy-procurement](skills/energy-procurement/)** — 
- **[skills/google-workspace-ops](skills/google-workspace-ops/)** — 
- **[skills/healthcare-cdss-patterns](skills/healthcare-cdss-patterns/)** — 
- **[skills/healthcare-emr-patterns](skills/healthcare-emr-patterns/)** — 
- **[skills/healthcare-phi-compliance](skills/healthcare-phi-compliance/)** — 
- **[skills/inventory-demand-planning](skills/inventory-demand-planning/)** — 
- **[skills/lead-intelligence](skills/lead-intelligence/)** — 
- **[skills/logistics-exception-management](skills/logistics-exception-management/)** — 
- **[skills/production-scheduling](skills/production-scheduling/)** — 
- **[skills/returns-reverse-logistics](skills/returns-reverse-logistics/)** — 
- **[skills/visa-doc-translate](skills/visa-doc-translate/)** — 

### Productivity & Tools (20)

- **[skills/ck](skills/ck/)** — 
- **[skills/click-path-audit](skills/click-path-audit/)** — 
- **[skills/dmux-workflows](skills/dmux-workflows/)** — 
- **[skills/file-deduplicator](skills/file-deduplicator/)** — 
- **[skills/find-orphans](skills/find-orphans/)** — 
- **[skills/iga-pages](skills/iga-pages/)** — 
- **[skills/mcp-builder](skills/mcp-builder/)** — 
- **[skills/mcp-server-patterns](skills/mcp-server-patterns/)** — 
- **[skills/nanoclaw-repl](skills/nanoclaw-repl/)** — 
- **[skills/obsidian-bases](skills/obsidian-bases/)** — 
- **[skills/obsidian-cli](skills/obsidian-cli/)** — 
- **[skills/obsidian-markdown](skills/obsidian-markdown/)** — 
- **[skills/openclaw-persona-forge](skills/openclaw-persona-forge/)** — 
- **[skills/opensource-pipeline](skills/opensource-pipeline/)** — 
- **[skills/ralphinho-rfc-pipeline](skills/ralphinho-rfc-pipeline/)** — 
- **[skills/repo-scan](skills/repo-scan/)** — 
- **[skills/skill-creator](skills/skill-creator/)** — 
- **[skills/skill-stocktake](skills/skill-stocktake/)** — 
- **[skills/web-artifacts-builder](skills/web-artifacts-builder/)** — 
- **[skills/workspace-surface-audit](skills/workspace-surface-audit/)** — 

### Context & Prompt Engineering (14)

- **[skills/blueprint](skills/blueprint/)** — 
- **[skills/context-budget](skills/context-budget/)** — 
- **[skills/dogfood](skills/dogfood/)** — 
- **[skills/executing-plans](skills/executing-plans/)** — 
- **[skills/openspec-apply-change](skills/openspec-apply-change/)** — 
- **[skills/openspec-archive-change](skills/openspec-archive-change/)** — 
- **[skills/openspec-explore](skills/openspec-explore/)** — 
- **[skills/openspec-propose](skills/openspec-propose/)** — 
- **[skills/performance-analysis](skills/performance-analysis/)** — 
- **[skills/rules-distill](skills/rules-distill/)** — 
- **[skills/search-first](skills/search-first/)** — 
- **[skills/strategic-compact](skills/strategic-compact/)** — 
- **[skills/structured-context-compressor](skills/structured-context-compressor/)** — 
- **[skills/token-budget-advisor](skills/token-budget-advisor/)** — 

### Others (11)

- **[skills/claude-api](skills/claude-api/)** — 
- **[skills/codebase-onboarding](skills/codebase-onboarding/)** — 
- **[skills/dependency-management](skills/dependency-management/)** — 
- **[skills/jira-integration](skills/jira-integration/)** — 
- **[skills/nutrient-document-processing](skills/nutrient-document-processing/)** — 
- **[skills/project-flow-ops](skills/project-flow-ops/)** — 
- **[skills/project-guidelines-example](skills/project-guidelines-example/)** — 
- **[skills/vercel-react-best-practices](skills/vercel-react-best-practices/)** — 
- **[skills/vercel-react-native-skills](skills/vercel-react-native-skills/)** — 
- **[skills/x-api](skills/x-api/)** — 
- **[skills/审查项目](skills/审查项目/)** — 

## Usage

1. Copy the needed skill directory into your agent's skills path (e.g. Claude Code / CodeBuddy `skills/`).
2. Skills are auto-triggered via the `description` field in `SKILL.md`, or invoked explicitly with `@skill-name`.
3. Some skills depend on scripts or external tools — read the skill's `SKILL.md` before use.

### Finding a skill

List all skills:

```bash
ls skills/
```

Search skills by keyword (e.g. "test"):

```bash
grep -rl "test" skills/*/SKILL.md
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add or update skills, and keep `README.md` / `README.en.md` in sync.

## License

Per-skill licenses are in each directory's `LICENSE` file (e.g. [skill-creator/LICENSE.txt](skill-creator/LICENSE.txt)).

## Related Documents

- [Changelog](CHANGELOG.md) — version & change history
- [License](LICENSE) — project license
- [中文文档](README.md) — Chinese README
- [Workspace](skills-chinese.code-workspace) — workspace config
