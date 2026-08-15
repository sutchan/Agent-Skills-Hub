# Agent Skills Hub

[![技能数量](https://img.shields.io/badge/skills-200-blue)](README.md) [![版本](https://img.shields.io/badge/version-v1.14.3-blue)](CHANGELOG.md) [![许可证](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![英文文档](https://img.shields.io/badge/docs-English-blue)](README.en.md)

> 作者：Sut Chan
>
> 项目地址：https://github.com/sutchan/Agent-Skills-Hub
>
> 一个集中管理的 AI 技能（Skill）集合，包含 200 个面向开发、设计、
测试、DevOps、Agent 工程及各行业领域的技能包。

每个技能是一个独立目录，内含 `SKILL.md`（技能说明与触发描述）以及
可选的 `scripts/`、`references/`、`assets/`、`agents/` 等资源。

> 说明：本仓库对技能做了“中文目录 + 中文描述”的本地化；技能正文
> （`SKILL.md` 内容）目前主要保留上游英文，仅少量已全文翻译。
> 翻译覆盖率由 CI 中的 `tools/coverage.py` 统计。
> 英文版 [`README.en.md`](README.en.md) 结构与本文件一致，技能描述同样为中文。

## 目录

- [仓库结构](#仓库结构)
- [技能分类](#技能分类)
- [使用方式](#使用方式)
- [技能检索](#技能检索)
- [贡献指南](#贡献指南)
- [许可证](#许可证)
- [相关文档](#相关文档)

## 仓库结构

```
<skill-name>/
├── SKILL.md          # 技能入口：name + description 前置元数据 + 使用说明
├── scripts/          # 可选：可执行脚本
├── references/       # 可选：参考文档
├── assets/           # 可选：模板/素材
└── agents/           # 可选：子代理定义
```

## 技能分类

### 前端与 UI 设计（15）

- **[api-design](skills/api-design/)** — REST API 设计模式，涵盖资源命名、状态码、分页、过滤、错误响应、版本控制等。
- **[brand-guidelines](skills/brand-guidelines/)** — 将 Anthropic 官方品牌色与字体应用于各类产物，使其符合 Anthropic 品牌规范。
- **[brand-voice](skills/brand-voice/)** — 从真实文章、随笔、发布说明、文档或站点文案中提炼写作风格画像，并在后续内容中复用。
- **[canvas-design](skills/canvas-design/)** — 运用设计理念在 `.png` 与 `.pdf` 文档中创作精美的视觉作品。当用户需要生成图像化文档时使用。
- **[design-system](skills/design-system/)** — 用于生成或审查设计系统、检查视觉一致性，并评审涉及样式的 PR。
- **[figma](skills/figma/)** — 通过 Figma MCP 服务获取设计上下文、截图、变量与资源，并将设计稿转换为代码。
- **[frontend-design](skills/frontend-design/)** — 构建新 UI 或重塑现有界面时的差异化、有意图的视觉设计指引，帮助提升美感。
- **[frontend-patterns](skills/frontend-patterns/)** — 前端开发模式：React、Next.js、状态管理、性能优化与 UI 最佳实践。
- **[frontend-skill](skills/frontend-skill/)** — 当任务需要视觉表现力强的落地页、网站、应用、原型、演示或游戏 UI 时使用。
- **[frontend-slides](skills/frontend-slides/)** — 从零创建或将 PowerPoint 文件转换为动画丰富、惊艳的 HTML 演示文稿。
- **[liquid-glass-design](skills/liquid-glass-design/)** — iOS 26 Liquid Glass 设计体系——动态玻璃材质，含模糊、反射与可交互形变，用于 SwiftUI。
- **[shadcn](skills/shadcn/)** — 管理 shadcn 组件与项目——添加、搜索、修复、调试、美化与组合 UI。
- **[theme-factory](skills/theme-factory/)** — 为产物（演示、文档、报告、HTML 落地页等）套用主题样式的工具包。
- **[ui-demo](skills/ui-demo/)** — 使用 Playwright 录制精致的 UI 演示视频。当用户需要制作演示、操作演练、录屏时使用。
- **[web-design-guidelines](skills/web-design-guidelines/)** — 审查 UI 代码是否符合 Web 界面规范。当用户要求"审查我的 UI""检查可访问性"等时使用。

### 后端、语言与框架（43）

- **[bun-runtime](skills/bun-runtime/)** — Bun 作为运行时、包管理器、打包器与测试运行器。何时选择 Bun 而非 Node、迁移说明及 Vercel 支持。
- **[compose-multiplatform-patterns](skills/compose-multiplatform-patterns/)** — Compose Multiplatform 与 Jetpack Compose 模式（KMP 项目）——状态管理、导航、主题、性能优化等。
- **[cpp-coding-standards](skills/cpp-coding-standards/)** — 基于 C++ Core Guidelines 的 C++ 编码规范。用于编写、审查或重构 C++ 代码时。
- **[cpp-testing](skills/cpp-testing/)** — 仅用于编写/更新/修复 C++ 测试、配置 GoogleTest/CTest、诊断失败或偶发测试等场景。
- **[csharp-testing](skills/csharp-testing/)** — C# 与 .NET 测试模式：xUnit、FluentAssertions、Mocking、集成测试与测试组织最佳实践。
- **[dart-flutter-patterns](skills/dart-flutter-patterns/)** — 生产可用的 Dart 与 Flutter 模式：空安全、不可变状态、异步组合、Widget 架构等。
- **[django-patterns](skills/django-patterns/)** — Django 架构模式、DRF 的 REST API 设计、ORM 最佳实践、缓存、信号、中间件与产品化。
- **[django-security](skills/django-security/)** — Django 安全最佳实践：认证、授权、CSRF 防护、SQL 注入与 XSS 防护等。
- **[django-tdd](skills/django-tdd/)** — Django 测试策略：pytest-django、TDD 方法、factory_boy、Mocking、覆盖率及 Django REST 测试。
- **[django-verification](skills/django-verification/)** — Django 项目的验证闭环：迁移、Lint、带覆盖率的测试、安全扫描与部署就绪检查。
- **[dotnet-patterns](skills/dotnet-patterns/)** — 地道的 C# 与 .NET 模式、约定、依赖注入、async/await 及构建健壮应用的实践。
- **[golang-patterns](skills/golang-patterns/)** — 地道的 Go 模式、最佳实践与约定，用于构建健壮、高效、可维护的 Go 应用。
- **[golang-testing](skills/golang-testing/)** — Go 测试模式：表驱动测试、子测试、基准测试、模糊测试与测试覆盖率。遵循 TDD 方法。
- **[java-coding-standards](skills/java-coding-standards/)** — Spring Boot 服务的 Java 编码规范：命名、不可变性、Optional 用法、Stream、异常、泛型等。
- **[jpa-patterns](skills/jpa-patterns/)** — JPA/Hibernate 模式：实体设计、关系、查询优化、事务、审计、索引、分页等。
- **[kotlin-coroutines-flows](skills/kotlin-coroutines-flows/)** — Android 与 KMP 的 Kotlin 协程与 Flow 模式——结构化并发、Flow 操作符、StateFlow、错误处理等。
- **[kotlin-exposed-patterns](skills/kotlin-exposed-patterns/)** — JetBrains Exposed ORM 模式：DSL 查询、DAO 模式、事务、HikariCP 连接池、Flyway 迁移等。
- **[kotlin-ktor-patterns](skills/kotlin-ktor-patterns/)** — Ktor 服务端模式：路由 DSL、插件、认证、Koin DI、kotlinx.serialization、WebSockets 等。
- **[kotlin-patterns](skills/kotlin-patterns/)** — 地道的 Kotlin 模式、最佳实践与约定，用于构建健壮、高效、可维护的 Kotlin 应用。
- **[kotlin-testing](skills/kotlin-testing/)** — Kotlin 测试模式：Kotest、MockK、协程测试、属性测试与 Kover 覆盖率。遵循 TDD 方法。
- **[laravel-patterns](skills/laravel-patterns/)** — Laravel 架构模式、路由/控制器、Eloquent ORM、服务层、队列、事件、缓存与 API 响应。
- **[laravel-plugin-discovery](skills/laravel-plugin-discovery/)** — 通过 LaraPlugins.io MCP 发现与评估 Laravel 包。用户想查找插件、检查包信息时触发。
- **[laravel-security](skills/laravel-security/)** — Laravel 安全最佳实践：认证/授权、校验、CSRF、批量赋值、文件上传、密钥、限流等。
- **[laravel-tdd](skills/laravel-tdd/)** — Laravel 的测试驱动开发：PHPUnit 与 Pest、工厂、数据库测试、Fake 与覆盖率目标。
- **[laravel-verification](skills/laravel-verification/)** — Laravel 项目的验证闭环：环境检查、Lint、静态分析、带覆盖率的测试、安全扫描等。
- **[nestjs-patterns](skills/nestjs-patterns/)** — NestJS 架构模式：模块、控制器、Provider、DTO 校验、守卫、拦截器、配置等。
- **[nextjs-turbopack](skills/nextjs-turbopack/)** — Next.js 16+ 与 Turbopack——增量打包、文件系统缓存、开发速度，以及何时用 Turbopack 而非 webpack。
- **[nuxt4-patterns](skills/nuxt4-patterns/)** — Nuxt 4 应用模式：hydration 安全、性能、路由规则、懒加载，以及 SSR 安全的数据获取。
- **[perl-patterns](skills/perl-patterns/)** — 现代 Perl 5.36+ 习惯用法、最佳实践与约定，用于构建健壮、可维护的 Perl 应用。
- **[perl-security](skills/perl-security/)** — 全面的 Perl 安全：taint 模式、输入校验、安全进程执行、DBI 参数化查询等。
- **[perl-testing](skills/perl-testing/)** — Perl 测试模式：Test2::V0、Test::More、prove 运行器、Mocking、Devel::Cover 覆盖率与 TDD 方法。
- **[postgres-patterns](skills/postgres-patterns/)** — PostgreSQL 数据库模式：查询优化、模式设计、索引与安全。基于 Supabase 最佳实践。
- **[python-patterns](skills/python-patterns/)** — Python 习惯用法、PEP 8 标准、类型提示与最佳实践，用于构建健壮、高效、可维护的 Python 应用。
- **[rust-patterns](skills/rust-patterns/)** — 地道的 Rust 模式、所有权、错误处理、trait、并发与最佳实践，用于构建安全、高性能应用。
- **[rust-testing](skills/rust-testing/)** — Rust 测试模式：单元测试、集成测试、异步测试、属性测试、Mocking 与覆盖率。
- **[springboot-patterns](skills/springboot-patterns/)** — Spring Boot 架构模式、REST API 设计、分层服务、数据访问、缓存、异步处理与日志。
- **[springboot-security](skills/springboot-security/)** — Spring Security 最佳实践：认证/授权、校验、CSRF、密钥、请求头、限流与依赖安全。
- **[springboot-tdd](skills/springboot-tdd/)** — Spring Boot 的测试驱动开发：JUnit 5、Mockito、MockMvc、Testcontainers 与 JaCoCo。用于新增功能时。
- **[springboot-verification](skills/springboot-verification/)** — Spring Boot 项目的验证闭环：构建、静态分析、带覆盖率的测试、安全扫描与 diff 审查。
- **[swift-actor-persistence](skills/swift-actor-persistence/)** — Swift 中使用 actor 的线程安全数据持久化——带文件后端存储的内存缓存，消除数据竞争。
- **[swift-concurrency-6-2](skills/swift-concurrency-6-2/)** — Swift 6.2 易上手并发——默认单线程，@concurrent 用于显式后台卸载，隔离域控制。
- **[swift-protocol-di-testing](skills/swift-protocol-di-testing/)** — 基于协议（Protocol）的依赖注入，用于可测试的 Swift 代码——Mock 文件系统、网络与外部 API。
- **[swiftui-patterns](skills/swiftui-patterns/)** — SwiftUI 架构模式、@Observable 状态管理、视图组合、导航、性能优化等。

### 架构与设计（4）

- **[android-clean-architecture](skills/android-clean-architecture/)** — Android 与 Kotlin Multiplatform 项目的整洁架构模式——模块结构、依赖规则、UseCase 设计等。
- **[architecture-decision-records](skills/architecture-decision-records/)** — 将 Claude Code 会话中的架构决策记录为结构化 ADR。自动检测决策时机并记录。
- **[backend-patterns](skills/backend-patterns/)** — 后端架构模式、API 设计、数据库优化与 Node.js、Express 等服务端最佳实践。
- **[hexagonal-architecture](skills/hexagonal-architecture/)** — 设计、实现与重构端口与适配器（Ports & Adapters）系统，具备清晰领域边界、依赖倒置与可测试性。

### 测试与质量（20）

- **[ai-regression-testing](skills/ai-regression-testing/)** — AI 辅助开发的回归测试策略。沙箱模式 API 测试（无数据库依赖），自动验证行为。
- **[browser-qa](skills/browser-qa/)** — 部署前端后，使用浏览器自动化进行视觉测试与 UI 交互验证。
- **[code-quality-check](skills/code-quality-check/)** — 运行代码质量检查，含 Lint、类型检查与代码格式化。当你想确保代码符合规范时使用。
- **[code-reviewer](skills/code-reviewer/)** — 对指定文件夹内的代码进行全面审查，包含规范性检查、Bug检测、性能优化建议、可读性评估和基于华为Java编程规范的质量评分；当用户需要审查代码质量、发现潜在问题、评估代码规范符合度或生成代码审查报告时使用
- **[code-stats](skills/code-stats/)** — 生成代码统计与分析报告。当你想了解代码库结构与指标时使用。
- **[coding-standards](skills/coding-standards/)** — 通用编码规范、最佳实践与模式，面向 TypeScript、JavaScript、React 与 Node.js 开发。
- **[e2e-testing](skills/e2e-testing/)** — Playwright 端到端测试模式、Page Object Model、配置、CI/CD 集成、产物管理与偶发测试处理。
- **[flutter-dart-code-review](skills/flutter-dart-code-review/)** — 与库无关的 Flutter/Dart 代码审查清单，涵盖 Widget 最佳实践、状态管理（BLoC 等）模式。
- **[plankton-code-quality](skills/plankton-code-quality/)** — 使用 Plankton 在写作时强制执行代码质量——自动格式化、Lint 与 Claude 驱动的修复，作用于每个文件。
- **[python-testing](skills/python-testing/)** — Python 测试策略：pytest、TDD 方法、fixtures、Mocking、参数化与覆盖率要求。
- **[quality-nonconformance](skills/quality-nonconformance/)** — 质量管控与不符合项调查、根本原因分析、纠正措施（CAPA）及供应商质量管理，覆盖 FDA/IATF 16949/AS9100 等受监管制造场景。用于调查不符合项、执行根因分析、管理 CAPA、解读 SPC 或处理供应商质量问题。
- **[run-tests](skills/run-tests/)** — 运行项目测试套件，含单元测试、组件测试与端到端测试。当你想验证时使用。
- **[safety-guard](skills/safety-guard/)** — 在 production 系统上作业或自主运行 agent 时，用于防止破坏性操作。
- **[security-best-practices](skills/security-best-practices/)** — 执行语言与框架特定的安全最佳实践审查并给出改进建议。仅在相关场景触发。
- **[security-review](skills/security-review/)** — 新增认证、处理用户输入、使用密钥、创建 API 端点或实现相关逻辑时使用本技能。
- **[security-scan](skills/security-scan/)** — 扫描 Claude Code 配置（.claude/ 目录）以发现安全漏洞、错误配置与注入风险。
- **[skill-comply](skills/skill-comply/)** — 可视化技能、规则与 agent 定义是否真正被遵循——自动在 3 个提示规模上生成场景。
- **[tdd-workflow](skills/tdd-workflow/)** — 编写新功能、修复 bug 或重构代码时使用。以 80% 覆盖率为目标强制执行测试驱动开发。
- **[verification-loop](skills/verification-loop/)** — Claude Code 会话的综合验证系统。
- **[webapp-testing](skills/webapp-testing/)** — 与本地 Web 应用交互和测试的 Toolkit——浏览器自动化、端到端验证与 UI 检查。


### Agent 与 AI 工程（20）

- **[agent-browser](skills/agent-browser/)** — 面向 AI agent 的浏览器自动化 CLI。当用户需要与网站交互（导航页面等）时使用。
- **[agent-eval](skills/agent-eval/)** — 在自定义任务上对编码 agent（Claude Code、Aider、Codex 等）进行头对头对比，含通过率、成本、耗时等。
- **[agent-harness-construction](skills/agent-harness-construction/)** — 设计与优化 AI agent 的动作空间、工具定义与观察格式化，以提升完成率。
- **[agent-payment-x402](skills/agent-payment-x402/)** — 为 AI agent 添加 x402 支付能力——按任务预算、支出控制，以及通过 MCP 工具实现的非托管钱包。
- **[agentic-engineering](skills/agentic-engineering/)** — 以评估优先执行、任务拆解与成本感知的模型路由，作为 agentic 工程师运作。
- **[ai-first-engineering](skills/ai-first-engineering/)** — 面向 AI agent 产出大部分实现代码的团队的工程运作模式。
- **[autonomous-agent-harness](skills/autonomous-agent-harness/)** — 将 Claude Code 转变为具备持久记忆、定时任务、计算机使用的完全自主 agent 系统。
- **[benchmark](skills/benchmark/)** — 使用该技能测量性能基线、检测 PR 前后的回归，并对比技术栈方案。
- **[continuous-agent-loop](skills/continuous-agent-loop/)** — 带质量门禁、评估与恢复控制的持续自主 agent 循环模式。
- **[continuous-learning-v2](skills/continuous-learning-v2/)** — 基于本能的学习系统，通过 hook 观察会话，创建带置信度评分的原子本能。
- **[autonomous-loops](skills/autonomous-loops/)** — 自主 Claude Code 循环的架构与模式，用于长时间运行的自动化任务编排。
- **[continuous-learning](skills/continuous-learning/)** — 从 Claude Code 会话中自动提取可复用模式，构建带置信度的原子能力库。
- **[cost-aware-llm-pipeline](skills/cost-aware-llm-pipeline/)** — LLM API 调用的成本优化模式——按任务复杂度路由模型、预算跟踪、重试逻辑等。
- **[data-scraper-agent](skills/data-scraper-agent/)** — 为任意公开来源构建全自动的 AI 数据收集 agent——招聘网站、价格、新闻、GitHub 等。
- **[deep-research](skills/deep-research/)** — 使用 firecrawl 与 exa MCP 进行多来源深度研究。检索网络、综合发现并交付带引用的结果。
- **[enterprise-agent-ops](skills/enterprise-agent-ops/)** — 以可观测性、安全边界与生命周期管理运营长生命周期的 agent 工作负载。
- **[eval-harness](skills/eval-harness/)** — 实现评估驱动开发（EDD）原则的 Claude Code 会话形式化评估框架。
- **[foundation-models-on-device](skills/foundation-models-on-device/)** — Apple FoundationModels 框架的端侧 LLM——文本生成、@Generable 引导生成、工具调用等。
- **[healthcare-eval-harness](skills/healthcare-eval-harness/)** — 医疗应用部署的患者安全评估框架。针对 CDSS 准确性、PHI 合规等的自动化测试套件。
- **[prompt-optimizer](skills/prompt-optimizer/)** — 分析原始提示词、识别意图与缺口、匹配 ECC 组件（skills/commands/agents/hooks）并输出可直接粘贴的优化提示词；仅作顾问、绝不代为执行任务。当用户想优化/改进提示词时触发，想直接执行任务时不触发。

### DevOps 与基础设施（11）

- **[build-deploy](skills/build-deploy/)** — 将项目构建并部署到不同环境。当你想为部署做准备时使用。
- **[canary-watch](skills/canary-watch/)** — 部署、合并或依赖升级后，监控已部署 URL 是否出现回归。
- **[claude-devfleet](skills/claude-devfleet/)** — 通过 Claude DevFleet 编排多 agent 编码任务——规划项目、在隔离工作区派发并行 agent。
- **[configure-ecc](skills/configure-ecc/)** — Everything Claude Code 的交互式安装器——引导用户选择并安装技能与规则。
- **[connections-optimizer](skills/connections-optimizer/)** — 以"先审查再剪枝"的方式重组用户的 X 与 LinkedIn 网络，给出添加/关注建议与渠道专属策略。
- **[database-migrations](skills/database-migrations/)** — 数据库迁移最佳实践：模式变更、数据迁移、回滚与零停机部署。
- **[deployment-patterns](skills/deployment-patterns/)** — 部署工作流、CI/CD 流水线模式、Docker 容器化、健康检查、回滚策略与生产实践。
- **[docker-patterns](skills/docker-patterns/)** — 本地开发、容器安全、网络、卷策略与多容器编排的 Docker 与 Docker Compose 模式。
- **[gh-cli](skills/gh-cli/)** — GitHub CLI（gh）的全面参考：仓库、Issue、PR、Actions、项目、发布、Gist 等。
- **[git-commit](skills/git-commit/)** — 执行 git commit，含约定式提交信息分析、智能暂存与信息生成。当需要时触发。
- **[git-workflow](skills/git-workflow/)** — Git 工作流模式：分支策略、提交约定、merge 与 rebase、冲突解决等。

### 数据与机器学习（8）

- **[clickhouse-io](skills/clickhouse-io/)** — ClickHouse 数据库模式、查询优化、分析与数据工程最佳实践，面向高性能场景。
- **[defuddle](skills/defuddle/)** — 使用 Defuddle CLI 从网页提取干净的 Markdown 内容，去除杂讯与导航以节省 token。
- **[exa-search](skills/exa-search/)** — 通过 Exa MCP 进行神经搜索，面向网络、代码与公司研究。当用户需要网络搜索、代码示例时触发。
- **[gan-style-harness](skills/gan-style-harness/)** — 受 GAN 启发的生成器-评估器 agent 框架，用于自主构建高质量应用。基于 Anthropic 思路。
- **[iterative-retrieval](skills/iterative-retrieval/)** — 逐步精炼上下文检索以解决子 agent 上下文问题的模式。
- **[pytorch-patterns](skills/pytorch-patterns/)** — PyTorch 深度学习模式与最佳实践，用于构建健壮、高效、可复现的训练流水线。
- **[regex-vs-llm-structured-text](skills/regex-vs-llm-structured-text/)** — 解析结构化文本时在正则与 LLM 之间选择的决策框架——从正则起步，仅在必要时引入 LLM。
- **[social-graph-ranker](skills/social-graph-ranker/)** — 加权社交图谱排序，用于发现 warm intro、桥梁评分与跨 X 和 LinkedIn 的网络缺口分析。

### 内容、文档与写作（14）

- **[article-writing](skills/article-writing/)** — 以独特语体撰写文章、指南、博客、教程、简报及其他长文内容。
- **[brainstorming](skills/brainstorming/)** — 任何创造性工作（创建功能、构建组件、添加功能或修整）前必须使用本技能。
- **[content-engine](skills/content-engine/)** — 为 X、LinkedIn、TikTok、YouTube、简报与再加工的多平台内容创建原生内容系统。
- **[content-hash-cache-pattern](skills/content-hash-cache-pattern/)** — 使用 SHA-256 内容哈希缓存昂贵的文件处理结果——与路径无关、自动失效，带服务层。
- **[crosspost](skills/crosspost/)** — 跨 X、LinkedIn、Threads 与 Bluesky 的多平台内容分发。按平台适配内容。
- **[doc-coauthoring](skills/doc-coauthoring/)** — 引导用户通过结构化工作流协同撰写文档。用户想写文档时触发。
- **[documentation-lookup](skills/documentation-lookup/)** — 通过 Context7 MCP 使用最新库与框架文档，而非训练数据。在安装问题、API 调用等场景激活。
- **[investor-materials](skills/investor-materials/)** — 创建与更新融资演示、一页纸、投资人备忘录、加速器申请、财务模型与募资材料。
- **[investor-outreach](skills/investor-outreach/)** — 起草冷邮件、warm intro 简介、跟进、更新邮件及募资用的投资人沟通。
- **[market-research](skills/market-research/)** — 开展市场研究、竞品分析、投资人尽职调查与带来源归属的行业情报。
- **[product-lens](skills/product-lens/)** — 使用该技能在构建前验证"为什么"，进行产品诊断，并将模糊想法转化为规格。
- **[santa-method](skills/santa-method/)** — 多 agent 对抗式验证与收敛循环。两个独立审查 agent 都必须通过后才输出。
- **[team-builder](skills/team-builder/)** — 用于组合与派发并行团队的互动式 agent 选择器。
- **[writing-plans](skills/writing-plans/)** — 当你有多步任务的规格或需求、在动手写代码之前使用。

### 视频与媒体（7）

- **[algorithmic-art](skills/algorithmic-art/)** — 使用 p5.js 配合种子随机与交互式参数探索创作算法艺术。当用户需要时触发。
- **[fal-ai-media](skills/fal-ai-media/)** — 通过 fal.ai MCP 统一生成媒体——图像、视频与音频。涵盖文生图（Nano Banana）、文/图生视频等。
- **[manim-video](skills/manim-video/)** — 为技术概念、图表、系统图与产品演示构建可复用的 Manim 讲解动画，然后交付成果。
- **[remotion-video-creation](skills/remotion-video-creation/)** — Remotion（React 视频创作）最佳实践。29 条领域专属规则，涵盖 3D、动画、音频、字幕等。
- **[video-editing](skills/video-editing/)** — 用于剪辑、结构化与增强真实素材的 AI 辅助视频编辑工作流。涵盖完整流水线。
- **[video-use](skills/video-use/)** — 通过对话编辑任意视频。转录、剪辑、调色、生成叠加动画、烧录字幕——用于谈话类视频。
- **[videodb](skills/videodb/)** — 看见、理解、操作视频与音频。从本地文件、URL、RTSP/直播流或桌面实时录制摄入。

### 行业领域（14）

- **[carrier-relationship-management](skills/carrier-relationship-management/)** — 承运商组合管理、运费费率谈判、绩效追踪、运力分配与战略关系维护。用于管理承运商、谈判费率、评估承运商绩效或制定货运策略。
- **[customer-billing-ops](skills/customer-billing-ops/)** — 运营客户账单工作流，如订阅、退款、流失分诊、账单门户挽回与套餐变更等。
- **[customs-trade-compliance](skills/customs-trade-compliance/)** — 海关单证、税则归类、关税优化、受限方筛查与多辖区贸易合规。用于报关清关、税则归类、贸易合规、进出口单证或关税优化。
- **[energy-procurement](skills/energy-procurement/)** — 电力与天然气采购、费率优化、需量电费管理、可再生 PPA 评估与多设施能源成本管理。用于采购能源、优化费率、管理需量电费、评估 PPA 或制定能源策略。
- **[google-workspace-ops](skills/google-workspace-ops/)** — 将 Google Drive、Docs、Sheets 与 Slides 作为统一工作流面，用于计划、追踪、演示与共享文档。
- **[healthcare-cdss-patterns](skills/healthcare-cdss-patterns/)** — 临床决策支持系统（CDSS）开发模式。药物相互作用检查、剂量校验、临床场景等。
- **[healthcare-emr-patterns](skills/healthcare-emr-patterns/)** — 医疗应用的 EMR/EHR 开发模式。临床安全、就诊工作流、处方生成等。
- **[healthcare-phi-compliance](skills/healthcare-phi-compliance/)** — 医疗应用的受保护健康信息（PHI）与个人可识别信息（PII）合规模式。
- **[inventory-demand-planning](skills/inventory-demand-planning/)** — 需求预测、安全库存优化、补货计划与促销提升估计（多门店零售）。用于预测需求、设定安全库存、规划补货、管理促销或优化库存水平。
- **[lead-intelligence](skills/lead-intelligence/)** — AI 原生的销售线索情报与外联流水线。用 agent 驱动的信号评分替代 Apollo、Clay 与 ZoomInfo。
- **[logistics-exception-management](skills/logistics-exception-management/)** — 货运异常、延误、损坏、丢失与承运商争议处理。用于处置运输异常、货运索赔、交付问题或承运商争议。
- **[production-scheduling](skills/production-scheduling/)** — 生产排程、作业排序、产线平衡、换型优化与瓶颈解决（离散/批量制造）。用于排产、解决瓶颈、优化换型、应对中断或平衡产线。
- **[returns-reverse-logistics](skills/returns-reverse-logistics/)** — 退货授权、收货检验、处置决策、退款处理、欺诈检测与保修索赔管理。用于退货、逆向物流、退款决策、退货欺诈检测或保修索赔。
- **[visa-doc-translate](skills/visa-doc-translate/)** — 将签证申请材料（图片）翻译为英文，并生成含原文与译文的中英双语 PDF。

### 生产力与工具（20）

- **[ck](skills/ck/)** — Claude Code 的持久化逐项目记忆。会话开始时自动加载项目上下文，用 git 跟踪会话历史。
- **[click-path-audit](skills/click-path-audit/)** — 追踪每个面向用户的按钮/触点经过的完整状态变更序列，以发现各函数单独正常但组合后出 bug 的位置。
- **[dmux-workflows](skills/dmux-workflows/)** — 使用 dmux（面向 AI agent 的 tmux 面板管理器）进行多 agent 编排。跨项目的并行 agent 工作流模式。
- **[file-deduplicator](skills/file-deduplicator/)** — 扫描项目目录，基于内容哈希找出重复文件，并检测空文件/无效文件，安全（默认 dry-run）地清理冗余。当用户想要查找/删除重复、冗余或无效文件时使用。
- **[find-orphans](skills/find-orphans/)** — 查找项目中的孤儿文件、未使用组件与死代码。当用户需要清理代码、查找孤儿文件、删除无用代码时使用。
- **[iga-pages](skills/iga-pages/)** — 将前端与全栈项目部署到 IGA Pages。当用户提到 IGA Pages 或请求部署时触发。
- **[mcp-builder](skills/mcp-builder/)** — 创建高质量 MCP（模型上下文协议）服务器的指南，使 LLM 能与外部服务交互。
- **[mcp-server-patterns](skills/mcp-server-patterns/)** — 使用 Node/TypeScript SDK 构建 MCP 服务器——工具、资源、提示、Zod 校验、stdio 与 Streamable HTTP。
- **[nanoclaw-repl](skills/nanoclaw-repl/)** — 运维与扩展 NanoClaw v2——ECC 基于 claude -p 构建的零依赖、会话感知 REPL。
- **[obsidian-bases](skills/obsidian-bases/)** — 创建与编辑 Obsidian Bases（.base 文件），含视图、过滤、公式与汇总。处理 .base 文件时使用。
- **[obsidian-cli](skills/obsidian-cli/)** — 通过 Obsidian CLI 与 Vault 交互，读取、创建、搜索并管理笔记、任务、属性等。
- **[obsidian-markdown](skills/obsidian-markdown/)** — 创建与编辑 Obsidian Flavored Markdown，含 Wiki 链接、嵌入、标注、属性及其他 Obsidian 专属语法。
- **[openclaw-persona-forge](skills/openclaw-persona-forge/)** — 为 OpenClaw AI Agent 锻造龙虾灵魂方案：输出身份定位、SOUL.md、角色化底线规则、名字与头像生图提示词。用于创建、设计或定制 OpenClaw 龙虾灵魂。
- **[opensource-pipeline](skills/opensource-pipeline/)** — 开源流水线：fork、清洗并打包私有项目以安全公开发布。串联 3 个 agent（forker 等）。
- **[ralphinho-rfc-pipeline](skills/ralphinho-rfc-pipeline/)** — 基于 RFC 驱动的多 agent DAG 执行模式，带质量门禁、合并队列与工作单元编排。
- **[repo-scan](skills/repo-scan/)** — 跨技术栈源码资产审计——为每个文件分类、检测内嵌的第三方库，并交付报告。
- **[skill-creator](skills/skill-creator/)** — 创建新技能、修改与改进现有技能，并度量技能性能。当用户想创建技能时触发。
- **[skill-stocktake](skills/skill-stocktake/)** — 审计 Claude 技能与命令质量时使用。支持快速扫描（仅变更技能）与全量盘点。
- **[web-artifacts-builder](skills/web-artifacts-builder/)** — 使用现代前端 Web 技术创建精致、多组件 claude.ai HTML 产物的工具套件。
- **[workspace-surface-audit](skills/workspace-surface-audit/)** — 审计活跃仓库、MCP 服务器、插件、连接器、环境面与 harness 配置，然后推荐最高优先级的改进。

### 上下文与提示工程（14）

- **[blueprint](skills/blueprint/)** — 将一句话目标拆解为多会话、多 Agent 工程项目的分步构建计划，每步含自包含上下文简报。用于复杂多 PR 任务或需多会话的路线图规划。
- **[context-budget](skills/context-budget/)** — 审计 Claude Code 在 agent、技能、MCP 服务器与规则间的上下文窗口消耗。识别膨胀、冗余等。
- **[dogfood](skills/dogfood/)** — 系统性地探索与测试 Web 应用，发现 bug、UX 问题及其他问题。当用户要求"dogfood"等时使用。
- **[executing-plans](skills/executing-plans/)** — 当你有书面实现计划，要在独立会话中执行并带审查检查点时使用。
- **[openspec-apply-change](skills/openspec-apply-change/)** — 实现 OpenSpec 变更的 task。当用户想开始实现、继续实现或推进变更时使用。
- **[openspec-archive-change](skills/openspec-archive-change/)** — 在实验性工作流中归档已完成变更。当用户想在完成变更后最终化并归档时使用。
- **[openspec-explore](skills/openspec-explore/)** — 进入探索模式——用于探索想法、调查问题、澄清需求的思考伙伴。用于需求梳理时。
- **[openspec-propose](skills/openspec-propose/)** — 一步生成所有产物来提议新变更。当用户想快速描述他们想要的内容时使用。
- **[performance-analysis](skills/performance-analysis/)** — 分析项目性能，含包体积与加载时间。当你想优化性能时使用。
- **[rules-distill](skills/rules-distill/)** — 扫描技能以提取跨切面原则，并蒸馏为规则——追加、修订或创建新规则文件。
- **[search-first](skills/search-first/)** — 编码前先研究的工作流。在编写自定义代码前，搜索现有工具、库与模式。调用。
- **[strategic-compact](skills/strategic-compact/)** — 在逻辑间隔建议手动上下文压缩，以贯穿任务阶段保留上下文，而非任意截断。
- **[structured-context-compressor](skills/structured-context-compressor/)** — 将长 agent 对话压缩为九部分续写摘要，保留请求、文件、错误、用户等关键上下文。
- **[token-budget-advisor](skills/token-budget-advisor/)** — 在回答前让用户选择消耗的回答深度/长度/Token 预算，用于用户显式想控制回答长度、深度或 Token 用量的场景。

### 其他（10）

- **[claude-api](skills/claude-api/)** — Anthropic Claude API 的 Python 与 TypeScript 模式。涵盖 Messages API、流式、工具使用、视觉、扩展思考等。
- **[codebase-onboarding](skills/codebase-onboarding/)** — 分析陌生代码库并生成结构化上手指南，含架构图、关键入口、关注点等。
- **[dependency-management](skills/dependency-management/)** — 管理项目依赖，包括检查更新与安全漏洞。当你想确保依赖健康时使用。
- **[jira-integration](skills/jira-integration/)** — 当用户需要获取 Jira 工单、分析需求、更新工单状态、添加评论或流转时使用。
- **[nutrient-document-processing](skills/nutrient-document-processing/)** — 使用 Nutrient DWS API 处理、转换、OCR、提取、脱敏、签署与填写文档。支持 PDF、DOCX、XLSX 等。
- **[project-flow-ops](skills/project-flow-ops/)** — 跨 GitHub 与 Linear 运营执行流，分诊 Issue 与 PR、关联活跃工作并保持同步。
- **[project-guidelines-example](skills/project-guidelines-example/)** — 基于真实生产应用的示例项目专属技能模板。
- **[vercel-react-best-practices](skills/vercel-react-best-practices/)** — 来自 Vercel Engineering 的 React 与 Next.js 性能优化指南。编写相关代码时应使用该技能。
- **[vercel-react-native-skills](skills/vercel-react-native-skills/)** — React Native 与 Expo 构建高性能移动应用的最佳实践，涵盖组件、列表性能优化、动画与原生模块。用于 RN/Expo 开发、性能优化或原生 API 任务。
- **[x-api](skills/x-api/)** — X/Twitter API 集成，用于发推、线程、读取时间线、搜索与分析。涵盖 OAuth 认证流程。

## 使用方式

1. 将需要的技能目录复制到你的 Agent 技能目录下（如 Claude Code / CodeBuddy 的 skills 路径）。
2. 技能通过 `SKILL.md` 中的 `description` 字段被自动触发；也可在对话中显式 `@技能名` 调用。
3. 部分技能依赖 `scripts/` 中的脚本或外部工具，使用前请阅读对应 `SKILL.md` 的依赖说明。

### 使用 skills-manager 一键安装与管理

推荐使用 [skills-manager](https://github.com/xingkongliang/skills-manager) 来管理本项目的技能：它可以批量安装、更新与卸载技能，免去手动复制目录的麻烦。

```bash
# 安装 skills-manager（详见其仓库说明）
# 然后克隆本项目并使用 skills-manager 安装所需技能
git clone https://github.com/sutchan/Agent-Skills-Hub.git
# 按 skills-manager 的用法将本项目 skills/ 目录中的技能导入/链接到你的 Agent
```

具体命令与配置请参考 [skills-manager 仓库文档](https://github.com/xingkongliang/skills-manager)。

## 在线展示页面

仓库提供两层 Web 产物，满足「浏览」与「开发」两种需求：

| 目录 | 类型 | 用途 |
|------|------|------|
| `app/` | 可运行 Web 应用（**源码**） | 项目的应用源码工作区，从 `skills/<name>/SKILL.md` 实时生成数据（详见 [`app/README.md`](app/README.md)） |
| `prototype/` | 预构建静态 HTML 原型（**交付物**） | 高保真纯静态原型（原生 HTML/CSS/JS），无需构建即可离线浏览全部技能，适合一键部署到 EdgeOne / 对象存储 |

### 原型（prototype/）

仓库内置一个高保真静态原型，由原生 HTML/CSS/JS 实现（`prototype/src/` 经 `prototype/build.mjs` 注入真实数据生成自包含 `prototype/out/index.html`），**无需 React/Next.js/Tailwind 运行时**，可一键部署到腾讯云 EdgeOne / 对象存储等静态托管服务。国际化由独立模块 `prototype/src/i18n.js` 驱动（`I18N.t()` 容错兜底，翻译缺失也不崩溃）。

```bash
# 原型为预构建静态 HTML，无需安装依赖或构建：
# 直接用浏览器打开 prototype/out/index.html 即可预览（离线可用）。

# 如需本地起一个静态服务器（可选）：
cd prototype/out && python -m http.server 8080
# 然后访问 http://localhost:8080

# 如需从磁盘 skills/ 重新生成数据并重建静态产物（零 npm 依赖）：
cd prototype
node build-skills-data.mjs   # 重新生成 skills-data.json
npm run build                # 重新生成 out/index.html
```

部署时将 `prototype/out/` 目录作为站点根目录发布即可。原型为预构建静态产物，数据源以 `skills/<name>/SKILL.md` 为准。

### 应用（app/）

`app/` 是项目 Web 应用的可开发源码工作区。与 `prototype/` 的「预构建纯静态原型」不同，`app/` 用于实际开发、迭代与构建（具体技术栈见 [`app/README.md`](app/README.md)）。

```bash
cd app
npm install
npm run dev      # 本地开发服务器
npm run build    # 生产构建
npm run start    # 启动生产服务
```

应用以 `skills/<name>/SKILL.md` 为权威数据源，构建期生成技能数据供前端读取（详见 [`app/README.md`](app/README.md)）。

## 技能检索

列出全部技能：

```bash
ls skills/
```

按关键词检索技能（如 "test"）：

```bash
grep -rl "test" skills/*/SKILL.md
```

## 贡献指南

- 新增技能：使用 [`skill-creator`](skills/skill-creator/) 技能按规范创建与评估。
- 技能目录命名使用小写中划线（`kebab-case`），如 `python-testing/`。
- `SKILL.md` 必须包含 `name` 与 `description` 前置元数据。

## 许可证

各技能许可证见其目录内 `LICENSE` 文件（如 [`skill-creator/LICENSE.txt`](skill-creator/LICENSE.txt)）。

## 相关文档

- [变更记录](CHANGELOG.md) — 版本与重要变更记录（遵循 Keep a Changelog 与 SemVer）
- [贡献指南](CONTRIBUTING.md) — 如何新增/更新技能并保持 README 同步
- [行为准则](CODE_OF_CONDUCT.md) — 社区参与的基本准则（Contributor Covenant）
- [安全政策](SECURITY.md) — 漏洞私密报告渠道与项目安全红线
- [获取支持](SUPPORT.md) — 问题反馈、FAQ 与联系渠道
- [英文文档](README.en.md) — English README
- [许可证](LICENSE) — 项目整体许可证（MIT）
- 项目地址：https://github.com/sutchan/Agent-Skills-Hub
- 工作区配置：[agent-skills-hub.code-workspace](agent-skills-hub.code-workspace)
