# Changelog

本项目所有重要变更均记录于此文件。

## [1.14.41] - 2026-08-28

### fix: 修复 gitignore 误伤交付文件与 OG 图路径错误

- **根 .gitignore**：移除 `*.txt` / `*.mjs` 宽泛通配（会误伤技能 LICENSE 与工具链），
  改为精确忽略 `_*.mjs` 与 `*.log`；显式放行 `next.config.mjs`、`tools/**/*.mjs`、
  `skills/**/*.mjs` / `*.txt` / `*.md`。
- **skills/.gitignore（真凶）**：子目录级规则优先级高于根规则，其第 54-55 行
  `*.mjs` / `*.txt` 导致 11 个技能 LICENSE.txt、12 个技能脚本、3 个字体许可、
  30 个技能文档长期未入库（技能 LICENSE 合规缺失、脚本不可用）。已重写为
  仅忽略 skills 范围内的临时/缓存/依赖/凭证文件。
- 恢复入库：`next.config.mjs`（部署必需，此前被忽略）、5 个 `tools/*.mjs` 工具脚本、
  12 个 `skills/**/*.mjs` 技能脚本、11 个技能 `LICENSE.txt`、3 个 `OFL-*.txt` 字体许可。
- **tools/build.mjs**：OG 图源路径由不存在的 `app/public/` 修正为仓库根 `public/`
  （此前 banner-og.svg 从未复制到 prototype/，社交分享图缺失），并补缺失告警。
- 统一记忆目录：`.codebuddy` 与 `.workbuddy` 内容一致，已合并并以链接指向 `.workbuddy`。

## [1.14.40] - 2026-08-28

### fix: 修复原型卡片无法点击与 hero 区功能丢失

- **根因**：`prototype/src/index.html` 将数据内联为 `<script>const SKILLS_DATA = ...</script>`，
  但 `01-state.js` 以 `window.SKILLS_DATA || null` 读取；`const` 为块级作用域不挂 `window`，
  导致全部 parts 拿到 `null`，`init()` 在 `SKILLS_DATA.skills.forEach` 抛错中断——
  卡片不渲染、事件不绑定、hero 节点网不生成（两个 bug 同源）。
- `prototype/src/index.html`：改为 `<script>window.SKILLS_DATA = ...</script>` 与契约一致。
- 重建 `prototype/prototype.html` 与 `data/skills-data.json`（224 技能 / 14 类，「其他」归零）。

### fix: 治理 27 个上游导入技能分类缺失

- 27 个外部导入技能（ad-creative / agent-browser / vercel-* / web-design-guidelines 等）缺
  `category`/`en_category`/`zh_displayName`/`en_description` 字段，错误归入「其他」类（违规）。
- 按语义重归类至 14 个标准类；`en_category` 对齐 `tools/lib/taxonomy.mjs` 权威值
  （统一为 `Engineering Practice & Quality`）；修正 `agent-development` 的 `name` 对齐目录名。
- `tools/validate-skills.mjs` 校验通过（224 个技能 frontmatter 规范）。
- 同步 README / README.en 领域表计数与「14 大领域」契约描述。

## [1.14.39] - 2026-08-28

### chore: 锁定 pnpm 包管理器并规范化技能文档换行符

- `package.json`：新增 `packageManager: pnpm@9.15.0` 与 `preinstall: only-allow pnpm`，
  强制使用 pnpm；`engines` 放宽 node 至 `22.x || 26.x`、新增 `pnpm: >=9`；版本升至 v1.14.39
- `skills/**` 全量文档按 `.gitattributes` 强制 LF 换行符规范化（CRLF→LF），消除跨平台差异
- 同步补充技能 frontmatter 审查修正（ad-creative / banner-creator / vercel-* 等 50 个技能文件）
- `app/components/detail-modal.tsx` + `app/globals.css`：修复详情弹窗遮罩与显隐
- `agent-skills-hub.code-workspace`：更新工作区配置

## [1.20.68] - 2026-08-27

### fix: 修复技能详情弹窗无法打开

- **根因**：详情弹窗根节点 `.detail.dialog` 继承 `.dialog { display: none }` 基础样式，但从未加 `.show` 类，导致弹窗始终 `display:none` 不可见；卡片点击/骰子均触发了 `setDetail` 但 DOM 渲染后被 CSS 隐藏。
- **detail-modal.tsx**：弹窗根节点补 `show` 类（`detail dialog show`），覆盖 `.dialog` 的 `display:none`。
- **globals.css**：补齐缺失的 `.detail-overlay`（全屏遮罩容器）与 `.detail-backdrop`（半透明背景层）样式，原仅有 `.detail.dialog` 定义，无遮罩背景。

## [1.20.67] - 2026-08-27

### refactor: 分类体系升级为 14 类，消灭「其他」违规类

- `tools/lib/taxonomy.mjs` 分类法由 13 类演进为 14 类：新增「桌面与客户端」
  （Desktop & Client）承载 WinUI/Windows 桌面开发；保留原 13 类键不变
- 补全 14 个缺失必备字段（category/en_category/zh_displayName/description）的
  上游导入技能 frontmatter，按语义归入 14 类，彻底消除「其他」类（构建实算为 0）
- 同步 `tools/validate-skills.mjs` 注释、`openspec/spec.md` 分类清单叙事、
  README.md / README.en.md 领域表与计数（223 技能 · 14 大领域）
- `npm run build` 重算 `data/skills-data.json` 并重生成 `prototype/prototype.html`
- 版本号升至 v1.20.67

## [1.20.66] - 2026-08-27

### chore: 忽略本地协作状态目录并同步版本展示位

- `.gitignore` 新增 `.workbuddy/`（本地 WorkBuddy 协作状态目录），与既有
  `.codebuddy/` 忽略策略保持一致，避免本地状态文件误入库
- `git rm --cached` 取消跟踪误入库的 `.workbuddy/memory/2026-08-25.md`（磁盘保留）
- README.md / README.en.md 版本徽章同步至 v1.20.66
- 版本号升至 v1.20.66

## [1.20.65] - 2026-08-27

### chore: 同步 README 版本徽章并补充本地 test 脚本

- README.md / README.en.md 版本徽章 v1.20.62 → v1.20.64（消除与 HEAD 的脱节）
- package.json 新增 `test` 脚本（`node --test tools/lib/*.test.mjs`），与既有
  `.github/workflows/ci.yml` 的测试步骤保持一致，便于本地跑回归
- 版本号升至 v1.20.65

## [1.20.64] - 2026-08-27

### style: 归一化技能文件行尾为 LF

- 将工作区中 CRLF 行尾的技能文件统一归一化为 LF（对齐 .gitattributes 规则），
  消除 `git status` 中的纯行尾显示差异，无内容变更。
- 版本号升至 v1.20.64。

## [1.20.63] - 2026-08-27

### chore: 同步多个技能内容与新增 netease-music-cli

- 更新 lark-meeting / remotion-best-practices / short-drama-* / stripe-best-practices /
  ui-ux-pro-max / web-prototype / winui-* / woocommerce-backend-dev 等技能的内容
  （SKILL.md 与 references/scripts/scenes 微调，frontmatter 未变）。
- 新增技能 netease-music-cli（未跟踪目录纳入版本控制）。
- 版本号升至 v1.20.63。

## [1.20.62] - 2026-08-25

### fix: 对齐 prototype 的 appHeader/controls 布局

- AppShell.tsx 注入 --topbar-h（量取 #appHeader 高度），供 .controls sticky 偏移，避免顶栏换行错位（对齐 prototype 05-main.js setTopbarH）。
- globals.css 移除写死的 .controls top:48px，改由 --topbar-h 动态注入接管，与原型一致。
- 头注释与全局展示位同步至 v1.20.62。

### fix: 修复详情弹窗 GitHub 链接 404（对齐 prototype）

- `app/components/detail-modal.tsx` 详情链接由 `encodeURIComponent(githubDir)` 改为直接拼接路径；
  `githubDir` 为 `skills/<name>` 内部已知路径，编码斜杠会生成 `skills%2Fxxx` 致 GitHub 404。
- 对齐 `prototype/src/parts/03-detail.js:96` 直接拼接行为；头注释同步至 v1.20.62。

## [1.20.61] - 2026-08-25

### refactor: app 应用界面进一步对齐 prototype 原型

- **AppShell.tsx（Hero 节点网）**：节点加 `data-cat` + 可点击/键盘筛选分类，hover 联动 `#grid .card.pulse`；新增连线流动点 `.net-dot` 与 `.hub-glow`；监听 `ash:filter-state` 在搜索/筛选时点亮核心（`--core-hue` + `.filtering/.searching`）。
- **页脚**：新增独立 GitHub/README 导航链接（对齐 prototype footer-links）。
- **SkillsExplorer.tsx**：`toggleCat` 派发 `ash:filter-state` 通知 Hero 点亮核心。
- **detail-modal.tsx**：详情弹窗挂载时触发 `.flip` 翻牌入场动画（对齐 prototype .dialog.flip）。
- **globals.css**：补 `.card.pulse`、`.footer-links` 样式；`.net-dot`/`.hub-glow`/节点 active/搜索联动动画已齐备。

## [1.20.56] - 2026-08-24

### fix: 页脚区改进（统计标注/埋点/分享深链/版本兜底）

- 需求：grill-me 审查页脚区，提出改进并落地（用户确认：统计区「明确标注全库」+ 原型埋点）。
- **A 全库标注**：`index.html` 统计区加 `.stats-scope`「全库统计 / Full catalog」标注（CSS 在 `layout.css`），明确数字不随筛选变化，与 `resultCount` 实时匹配数区分。
- **B 数据驱动语言数**：`01-state.js` 新增 `SUPPORTED_LANGS = ["zh","en"]`；`renderStats()` 的 `statLangs` 由硬编码 `2` 改为 `SUPPORTED_LANGS.length`。
- **C 去除多余 aria-live**：`footerStats` 去掉 `aria-live="polite"`（数字仅加载时算一次，live 槽无意义）。
- **D Star 埋点**：`starBtn` 链接指向 `/stargazers`；`04-interactions.js` 绑定 `track("star_click", {repo})`，补齐原型埋点（此前仅 share 有）。
- **E 分享含深链**：`shareRepo()` 优先分享 `location.href`（含 P0-1 的 hash 筛选深链），回退 `/stargazers` 上级 origin→GitHub。
- **F 版本号兜底**：`05-main.js` init 检测 `footerVer` 仍含 `{{VERSION}}` 字面量时回退 `v1.20.56`，防 build 未替换泄漏。
- 改动文件头注释同步至 v1.20.56；根 `package.json` version 升至 v1.20.56。

[1.20.56]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.56

## [1.20.60] - 2026-08-25

### fix: CI 脚本修正与数据/原型/工具同步

- `.github/workflows/ci.yml`：修正 CI 构建与校验脚本。
- `tools/build-skills-data.mjs` / `tools/validate-skills.mjs`：修复构建与校验逻辑。
- `data/skills-data.json` / `data/skills-metrics.json`：按最新磁盘技能重建。
- `prototype/prototype.html`：同步原型展示改进。
- `skills/agent-development/SKILL.md` / `skills/prototype-designer/SKILL.md`：文档完善。
- 删除 `deliverables/` 下两个临时评审文档。
- 根 `package.json` version 升至 v1.20.60。

[1.20.60]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.60

## [1.20.59] - 2026-08-25

### fix: 翻译 43 个技能未中译的 frontmatter 字段

- 问题：扫描 223 个 SKILL.md 发现 43 个 `description` 仍为英文、1 个 `orca-cli.zh_displayName` 为英文，违反「description=中文、zh_displayName=中文」契约。
- 修复：将 43 个 `description` 翻译为中文（agent-development、banner-creator/design、dart-*/flutter-*/eve、git-cleanup、html-design-prototypes、html-prototype、hyperframes-creative、logo-creator、muapi-*、nextjs-app-router-patterns、orca-cli、persona-project-manager、prototype-*/remotion-best-practices、test-driven-development、ui-ux-pro-max、web-prototype 等），并将 `orca-cli.zh_displayName` 改为「Orca 命令行工具」。
- 复检：脚本复扫 223 个技能，中英文问题数归零；`node tools/validate-skills.mjs` 通过；数据链路重建（223 技能 / 13 类）。
- 根 `package.json` version 升至 v1.20.59；README 中/英版本徽章同步。

[1.20.59]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.59

## [1.20.58] - 2026-08-25

### chore: 补全 40 个技能缺失的 frontmatter 契约字段

- 需求：新加入/上游导入的 40 个 `skills/<name>/SKILL.md` 缺规范 6 字段（name/description/en_description/zh_displayName/category/en_category）。
- 补全范围：ad-creative、agent-browser、architecture-blueprint-generator、bailian-web-search、code-review、codebase-design、dev-builder、diagnosing-bugs、domain-modeling、flutter-apply-architecture-best-practices、google-agents-cli-adk-code、google-agents-cli-workflow、google-mobile-ads-banner、grill-me、grill-with-docs、grilling、handoff、hyperframes-core、implement-spec、improve-codebase-architecture、limrun-android-emulator、limrun-detox-testing、limrun-ios-simulator、limrun-xcode、limrun-xcode-bazel、marketing-plan、playwright-cli、playwright-explore-website、project-workflow-analysis-blueprint-generator、prototype、redesign-existing-projects、setup-matt-pocock-skills、short-drama-storyboard、short-drama-video-prompts、short-drama-write、tdd、to-spec、video、woocommerce-backend-dev、write-tech-spec。
- 按 13 类分类法归正（品牌与设计/工程实践与质量/移动端开发/自动化与集成/AI 与智能体/前端开发/后端与平台/音视频与多媒体），保留原 license/hidden/allowed-tools 等合法键；`node tools/validate-skills.mjs` 通过（223 技能）。
- 根 `package.json` version 升至 v1.20.58；README 中/英版本徽章同步。

[1.20.58]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.58

## [1.20.57] - 2026-08-25

### fix: app 与原型对齐（深链/分享/埋点/分页/视觉令牌）

- 需求：code-review 技能审查 `app/`（Next.js）与 `prototype/`（静态原型）对齐度，修复全部未对齐项。
- **P0-1 URL 深链**：`SkillsExplorer.tsx` 新增 `writeHash()`/`parseHash()`（格式 `#cat=a,b&q=x&sort=name&page=2`，与原型 05-main.js 一致，深链互认）；挂载时解析 hash 还原筛选/搜索/排序/页码，`hashchange` 事件还原，`[cats,q,sort,page]` 变化后写 hash。补齐原型 P0-1 能力。
- **P0-2 spec 脱节**：`openspec/spec.md` 头注释 v1.20.33 → v1.20.57（滞后 23 版，违反版本单一来源铁律）。
- **P1-3 分享深链**：`share.ts` 的 `buildRepoShareText` 优先 `location.href`（含 hash 深链），回退 `REPO_URL`，对齐原型 `shareRepo()`。
- **P1-4 Star 埋点**：`AppShell.tsx` 新增 `track()`（对齐原型 01-state.js，GA 注入才上报，否则静默）；`starBtn` href 改 `/stargazers` + `onClick` 上报 `star_click`；同步去掉 `footerStats` 多余 `aria-live`。
- **P1-5 分页统一**：`SkillsExplorer.tsx` `PAGE_SIZE` 48 → 36，对齐原型 `01-state.js`（`PAGE_SIZE=36`，原型为设计权威源）。
- **P2-6 card-desc 行数**：`globals.css` 默认 `-webkit-line-clamp` 2 → 3，并补 `[data-density="compact"]` 紧凑态 2 行，对齐原型 `components.css`。
- **P2-8 chip active 亮度**：`globals.css` `.chip.active` 由 `hsl(var(--hue) 68% 42%)` → `82% 46%`，对齐原型 `components.css`。
- **P2-7 reduced-motion 关 net-dot**：原型 `.hero-net .net-dot{display:none}` 对应动画点；app 的 hero 节点网为静态（无 net-dot 流动点，该动画原型 v1.20.44 新增未同步 app），全局 reduced-motion 兜底已覆盖，无需改动。
- 改动文件头注释同步至 v1.20.57；根 `package.json` version 升至 v1.20.57。
- 注：`app/` lint 报"找不到模块 react"为环境性缺依赖（根 node_modules 未装 react 类型），非本次改动引入；Next 构建需 `app/` 依赖安装后验证。

[1.20.57]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.57

## [1.20.55] - 2026-08-24

### chore: 全量补全技能契约字段并归正分类至 v1.20.55

- 磁盘技能由 199 增至 215（会话间外部新增 16 个），其中 36 个技能（agent-browser / agent-development / banner-creator / banner-design / browser-automation / dart-*（8）/ eve / flutter-*（11）/ git-cleanup / hyperframes-core / hyperframes-creative / lark-meeting / logo-creator / muapi-3d-logo-animation / muapi-logo-creator / orca-cli / remotion-best-practices / test-driven-development / ui-ux-pro-max / woocommerce-backend-dev）frontmatter 被回退/重写，丢失 en_description / zh_displayName / category / en_category 四个必填字段，导致 build 出现「其他」类（第 14 类）违规。
- 已批量补全 4 字段并正确归类：移动端开发（+28，dart/flutter 系列）、工程实践与质量（+3，agent-development / eve / test-driven-development，叠加 git-cleanup 等）、品牌与设计（banner/logo/ui-ux/muapi）、音视频与多媒体（hyperframes/remotion）、自动化与集成（agent-browser / browser-automation / lark-meeting / orca-cli）、WordPress 与 CMS（woocommerce-backend-dev）。en_description 镜像原英文 description，zh_displayName 为中文摘要，category 用 13 类中文稳定键，en_category 对齐 build 的 CATEGORY_EN（移动端开发 = "Mobile Dev"）。
- 重新生成 `data/skills-data.json`（215 技能 / 13 类、「其他」类归零、公开 214）与 `data/skills-metrics.json`；`tools/build.mjs` 重新打包 `prototype/prototype.html`（版本占位注入 1.20.55）；`tools/validate-skills.mjs` 校验通过（215 技能 frontmatter 规范）。
- README 中/英领域表计数同步（移动端开发 0/13→28、工程实践与质量 36→39、总数 199→215 / 公开 198→214）。

[1.20.55]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.55

## [1.20.55] - 2026-08-24

### refactor: remove #tagChips tag-filter feature from app (align prototype)

- `SkillsExplorer.tsx`：删除功能标签筛选全部相关代码——`TAG_LABELS` 常量、`tags` 状态、`filtered` 内的 tags AND 分支、`tagCounts` useMemo、`toggleTag` 处理器、`#tagChips` 渲染块及其事件委托；同步移除相关依赖项。
- `globals.css`：删除 `.chips.tags` 样式规则。
- 对齐 prototype：原型已于 v1.20.28 完整移除标签筛选 UI 与过滤逻辑，app 侧此前滞后未删，本次补齐删除。
- 数据契约 `skills.ts` 的 `tags?` 字段保留（build-skills-data.mjs 仍生成，原型数据层亦保留，非 UI 功能本身）。

[1.20.55]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.55

## [1.20.54] - 2026-08-24

### refactor: address code-review findings on app/ source

- `AppShell.tsx`：补缺失的版本头注释；移除 `opacity:0` 且未被脚本引用的 `hub-glow` 死 DOM；为顶栏/Hero/控制区/页脚主要容器补语义化 `id`（`#topbar`/`#hero`/`#controls`/`#site-footer`）
- `skills.ts`：补 v1.20.49 改动（路径 `../data`→`data`）漏 bump 的头注释至 v1.20.54
- 删除 `analytics.ts` 死模块（`track()` 零调用，无事件上报逻辑）
- `detail/DetailRelated.tsx`：改用 `initials()` 统一首字母派生，消除与 `skill-card`/`detail-modal` 重复的 `slice(0,2)` 逻辑
- `SkillsExplorer.tsx`：移除直接返回依赖的无意义 `useMemo`（catsAll）
- `share.ts`：移除从未被调用链传入的 `basePath` 参数（消除 Speculative Generality），分享短链统一为 `/skills/<slug>`

[1.20.54]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.54

## [1.20.53] - 2026-08-24

### fix: align app UI to prototype (hero/brand/grid/controls)

- 以 `prototype/src/styles/layout.css` 为权威源，回填此前偏离的布局细节：
  - `.hero` 恢复为原型式渐变圆角卡片（`background: linear-gradient(...)` 直接作用），移除误加的 `.hero-outer` 全宽背景层（原型无此结构），`AppShell.tsx` 同步移除包裹层
  - `.brand-name` 字号 `17px` → `24px`（对齐原型 display 字体标题）
  - `.grid` 桌面列布局 `auto-fill minmax(260px,1fr)` → `repeat(3, 1fr)`（对齐原型固定三列）
  - `.topbar-inner`/`.controls-inner` 宽度 `1200px` 硬编码 → `var(--maxw)`（与 `--maxw:1200px` 令牌同源）
  - `.controls` sticky `top: 52px` 硬编码 → `top: var(--topbar-h, 52px)`（由 JS 量取顶栏高度注入，避免换行错位）
  - 移动端 media：外层 `.topbar`/`.controls` 残留 padding 改为由 `.topbar-inner`/`.controls-inner` 承载（对齐原型，外层仅保留 `top` 偏移）

[1.20.53]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.53

## [1.20.52] - 2026-08-24

### docs: update ad-creative/marketing-plan/video skill references and evals

- 更新 `skills/ad-creative` 参考文档与评估集（creative-review/roadmap/generative-tools/hook-system/iMessage 视频广告/meta 创意格式/短视频规格/静态广告模板等）
- 更新 `skills/marketing-plan` 参考文档与评估集（aarrr 框架/预算规划/客户类型/现状评分/融资阶段解锁/增长模式/方法论/团队与代理模型等）
- 更新 `skills/video` 参考文档与评估集（ai-video-prompting/edit-anatomy）

[1.20.52]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.52

## [1.20.51] - 2026-08-24

### fix: align topbar/hero/controls to grid width

- 将「全宽背景 + 内容居中」统一模式应用到顶栏、Hero、控制区：`.topbar`/`.hero-outer`/`.controls` 外层全宽（sticky/分区背景贯通整屏），内层 `.topbar-inner`/`.hero`/`.controls-inner` 约束 `max-width: 1200px; margin: 0 auto`，与 `#grid` 严格对齐
- `app/components/AppShell.tsx`：`<header className="topbar">` 内包裹 `.topbar-inner`，`<section className="hero">` 外包 `.hero-outer`
- `app/components/SkillsExplorer.tsx`：`<div className="controls">` 内包裹 `.controls-inner`
- `app/globals.css`：新增 `.topbar-inner`/`.hero-outer`/`.controls-inner` 规则，`.hero` 背景由渐变改为卡片表面色（`--surface`），渐变背景上移至 `.hero-outer` 全宽区段
- 修复部署后 `.topbar`/`.hero` 在宽屏下比 `#grid` 更宽的对齐问题

[1.20.51]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.51

## [1.20.50] - 2026-08-24

### fix: 补全 7 个技能缺失契约字段并修复第 14 类污染至 v1.20.50

- 磁盘 `ad-creative` / `architecture-blueprint-generator` / `browser-automation` / `marketing-plan` / `playwright-explore-website` / `short-drama-write` / `video` 共 7 个技能的 frontmatter 被外部改写/回退，丢失本仓库 4 个必填字段（`en_description`/`zh_displayName`/`category`/`en_category`），导致 build 出现「其他」类（第 14 类）违规。
- 已重新补全 4 字段并正确归类：品牌与设计（ad-creative、marketing-plan、short-drama-write）、工程实践与质量（architecture-blueprint-generator）、自动化与集成（browser-automation、playwright-explore-website）、音视频与多媒体（video）；英文 description 技能保留原英文作 `en_description` 并新增中文 `description`（默认展示语言），中文 description 技能新增 `en_description`。
- 重新生成 `data/skills-data.json`（199 技能 / 13 类、「其他」类归零）与 `data/skills-metrics.json`；`tools/build.mjs` 重新打包 `prototype/prototype.html`（版本占位注入 1.20.50）；`tools/validate-skills.mjs` 校验通过（199 技能 frontmatter 规范）。README 领域表计数本次无变化（分布与 v1.20.47 一致）。

[1.20.50]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.50

## [1.20.49] - 2026-08-23

### chore: 将 Next 配置提升至仓库根并简化构建链

- 将 `app/` 下的 `package.json`、`next.config.mjs`、`tsconfig.json`、`next-env.d.ts`、`package-lock.json` 移至仓库根，使仓库根成为 Next 项目根（App Router 位于根目录 `app/` 下，符合标准布局）
- 根 `package.json` 合并 `next`/`react`/`react-dom` 依赖与 `@types/*`/`typescript` devDependencies，并新增 `next build` 脚本
- 根 `build` 脚本简化为：`build-skills-data` + `build`(原型) + `npm install` + `next build`（去掉 `cd app` 与 `copy-next` 步骤）
- 删除 `tools/copy-next.mjs`（Next 直接在根构建，`.next` 已在根，无需复制）
- `app/lib/skills.ts`、`app/page.tsx` 的数据/版本读取路径由 `process.cwd()/..` 改为 `process.cwd()`（cwd 现为仓库根）
- `tsconfig.json` 的 `paths`（`@/*`→`./app/*`）与 `include`（限定 `app/**`）适配根项目，避免扫到仓库其他 ts
- 根 `package.json` version 升至 v1.20.49

[1.20.49]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.49

## [1.20.48] - 2026-08-23

### chore: 调整 EO 部署配置以匹配 Next.js 根目录部署

- 根 `package.json` 的 `build` 改为：先构建数据/原型（供 app 读），再进入 `app/` 安装并 `next build`，最后用 `tools/copy-next.mjs` 将 `app/.next` 复制到根 `.next`
- 新增 `tools/copy-next.mjs`（跨平台复制，规避 PowerShell 无 `cp`），并放行入库（`.gitignore`）
- `edgeone.json` 去掉 `rootDir`（默认根 `./`）与 `nodeVersion`（用 EO 默认 LTS），保留 framework/build/install/outputDirectory 对齐后台 Next 部署配置
- `.gitignore` 忽略根 `.next/`（Next 构建产物）
- 根 `package.json` version 升至 v1.20.48

[1.20.48]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.48

## [1.20.47] - 2026-08-23

### chore: 更新技能数据并补全新增技能契约至 v1.20.47

- 会话间新增 10 个技能（brand-operation / clean-architecture / clean-code / compliance / douyin-video / douyin-video-summary / figma-implement-design / figma-use / git-cleanup / store-operations），原 frontmatter 仅含英文 `description`，缺本仓库 4 个必填字段。已补全 `en_description`/`zh_displayName`/`category`/`en_category`，并将 `description` 改写为中文译文（默认展示语言为中文）。
- 补全后重新归类：品牌与设计 +8（含 figma-*、小红书运营类）、工程实践与质量 +3（clean-architecture / clean-code / git-cleanup）、音视频与多媒体 +1（douyin-video-summary）；「其他」类归零，回到 13 类契约。
- 重新生成 `data/skills-data.json`（199 技能、公开 198）与 `data/skills-metrics.json`；`tools/build.mjs` 重新打包 `prototype/prototype.html`（自包含，版本占位注入 1.20.47）；`tools/validate-skills.mjs` 校验通过（199 技能 frontmatter 规范）。
- README 中/英领域表计数同步（品牌与设计 38→43、工程实践与质量 33→36、音视频与多媒体 25→26、总数 189→199），根 `package.json` version 升至 v1.20.47。

[1.20.47]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.47

## [1.20.46] - 2026-08-23

### fix: 原型健壮性增强与窄屏体验优化

- 需求：分析原型可改进点（P0+P1，P2 跳过）。
- **P0-1 URL 深链**：`prototype/src/parts/05-main.js` 新增 `writeHash()` / `parseHash()`，将分类多选、搜索词、排序、页码序列化到 `location.hash`（`#cat=..&q=..&sort=..&page=..`），刷新/分享可还原；`renderGrid()` 末尾调用 `writeHash()`，`hashchange` 事件还原并刷新。
- **P0-2 hero 兜底**：`init()` 中 `renderHeroNodes()` 后校验 `netNodes` 为空则 `requestAnimationFrame` 重建，防御数据迟渲染。
- **P1-3 chip 一致性**：经复核 `.chip.active`（分类色）与 `.chip-all.active`（主色绿）视觉规则已对称，无代码改动。
- **P1-4 窄屏 hero**：`04-interactions.js` 按 `window.innerWidth<640` 收敛节点撒点边界与最小间距；`layout.css` 窄屏收敛 `.hero` 内边距并降低 `.hero-net` 透明度，避免节点网过高挤压文案。
- **P1-5 紧凑态描述行数**：`components.css` 在 `[data-density="compact"]` 下 `.card-desc` 由 3 行回退为 2 行。
- 改动文件头注释同步至 v1.20.46；根 `package.json` version 升至 v1.20.46。

[1.20.46]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.46

## [1.20.45] - 2026-08-23

### style: 加粗 hero 连线让线条更明显

- `prototype/src/parts/04-interactions.js`：连线 `<line>` 默认 `stroke-width` 由 1.4 加到 **2.4**。
- `prototype/src/styles/layout.css`：`.hero-net.searching .net-line` 的 `stroke-width` 由 2 提到 **3**，与常态加粗一致。
- 两文件头注释同步至 v1.20.45；根 `package.json` version 升至 v1.20.45。

[1.20.45]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.45

## [1.20.44] - 2026-08-23

### feat: 连线上加入缓慢移动的圆点

- 需求："#netLines 里的圆点加入缓慢移动的效果"。`#netLines` 装的是核心→节点连线（line），本身无圆点；本次为每条连线生成一个沿路径缓慢移动的 `.net-dot` 圆点。
- 实现：`prototype/src/parts/04-interactions.js` 的 `renderHeroNodes()` 在同步连线终点处，额外创建 `<circle class="net-dot">` 并用 SVG `animateMotion`（`path="M{cx} {cy} L{x} {y}"`）沿 core→节点路径流动；时长 `4 + (idx%5)*0.7`s 错峰，纯 SMIL 合成不逐帧。
- `prototype/src/styles/layout.css` 加 `.net-dot { fill: hsl(var(--primary)); opacity:.85; pointer-events:none }`；`@media (prefers-reduced-motion: reduce)` 新增 `.net-dot { display:none }` 关闭动效。
- 两文件头注释同步至 v1.20.44；根 `package.json` version 升至 v1.20.44。

[1.20.44]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.44

## [1.20.43] - 2026-08-23

### feat: 选中分类后核心节点同步分类色

- 需求：选中分类后，`.hub-node.hub-core` 也改成所选分类的颜色。
- 实现：`prototype/src/styles/layout.css` 的 `.hub-core` / `.hub-glow` 的 `fill` 改为由 CSS 变量 `--core-hue` 驱动（默认回落主色绿 152 色相）；`prototype/src/parts/04-interactions.js` 的 `updateHeroNet()` 中，当 `state.cats` 选中**单个**分类时用 `catHue()` 设 `--core-hue`，多选/清空时移除变量回落绿。`.hub-core` 用 `!important` 确保不被 `.filtering .hub-node` 的绿色覆盖。
- 改动文件头注释同步至 v1.20.43；根 `package.json` version 升至 v1.20.43。

[1.20.43]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.43

## [1.20.42] - 2026-08-23

### style: 去除 .chip 阴影效果

- `prototype/src/styles/components.css`：移除 `.chip.active` 与 `.chip-all.active` 的 `box-shadow`（含顶部高光 inset 层），选中态改为纯彩色实心底 + 上浮，无任何阴影。
- `prototype/src/styles/components.css` 头注释同步至 v1.20.42；根 `package.json` version 升至 v1.20.42。

[1.20.42]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.42

## [1.20.41] - 2026-08-23

### style: 去除 .chip 模糊效果

- `prototype/src/styles/components.css`：去掉造成柔化观感的模糊来源——① 选中态 `.chip.active` / `.chip-all.active` 的 `box-shadow` 外发光层（仅保留 `inset` 顶部高光，实体实心底不模糊）；② 默认态 hover 的 `scale(1.04)` 缩放（亚像素模糊），改为仅 `translateY` 上浮。
- `prototype/src/styles/components.css` 头注释同步至 v1.20.41；根 `package.json` version 升至 v1.20.41。

[1.20.41]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.41

## [1.20.40] - 2026-08-23

### fix: 修复分类 chip 点击后背景不变分类色

- 根因：`renderCats`（02-render.js）仅为「全部」chip 拼 `active` 类，普通分类项虽在第 45 行算了 `const active`，但第 46 行生成按钮时**漏拼 `active` 类**，导致普通分类 chip 永远无 `active` 类，`.chip.active` 的分类彩色背景（`hsl(var(--hue) 82% 46%)`）永不触发。
- 修复：第 46 行按钮 class 补 `${active ? " active" : ""}`，与 `aria-pressed` 一致；配合 v1.20.36 已补的点击重渲 `renderCats`，点击分类即以该分类色相显示彩色背景。
- `prototype/src/parts/02-render.js` 头注释同步至 v1.20.40；根 `package.json` version 升至 v1.20.40。

[1.20.40]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.40

## [1.20.39] - 2026-08-23

### style: 卡片英文名字号升至 16px

- `prototype/src/styles/components.css`：`.card-title .en` 的 `font-size` 由 12px 调整为 16px（与中文名主标题同字号）；字重/颜色仍保持弱化为副标题样式。英文态（`data-lang="en"` / `nameMode="en"`）本就 `font-size: inherit` 跟随 `.card-title` 的 16px，现两态一致。
- `prototype/src/styles/components.css` 头注释同步至 v1.20.39；根 `package.json` version 升至 v1.20.39。

[1.20.39]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.39

## [1.20.38] - 2026-08-23

### style: 卡片描述显示三行

- `prototype/src/styles/components.css`：`.card-desc` 的 `-webkit-line-clamp` / `line-clamp` 由 2 改为 3（网格态最多显示 3 行截断）；列表态（`.grid.list .card-desc`）保持 1 行不变。
- `prototype/src/styles/components.css` 头注释同步至 v1.20.38；根 `package.json` version 升至 v1.20.38。

[1.20.38]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.38

## [1.20.37] - 2026-08-23

### style: 网格固定三列、每页 36 个

- `prototype/src/styles/layout.css`：`.grid` 网格态由 `repeat(auto-fill, minmax(260px,1fr))` 改为 **`repeat(3, 1fr)`**（桌面固定三列卡片），列表态仍单列。
- `prototype/src/styles/responsive.css`：平板断点（≤1024px）降级为 `repeat(2, 1fr)`，移动端（≤640px）保持单列，避免三列在小屏挤压。
- `prototype/src/parts/01-state.js`：`PAGE_SIZE` 由 48 改为 **36**（每页显示 36 个）。
- 改动文件头注释同步至 v1.20.37；根 `package.json` version 升至 v1.20.37。

[1.20.37]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.37

## [1.20.36] - 2026-08-23

### fix: 修复选中分类不显示彩色背景

- 根因：`.cats` 分类点击处理器（04-interactions.js）只更新 `state.cats` 并调用 `renderGrid()`，**未重新渲染分类 chips**，导致 `active` 类停留在初始态，`.chip.active` 的彩色背景（`hsl(var(--hue) 82% 46%)`）永不生效。
- 修复：分类点击处补 `renderCats(aggregateFilters())` 重渲 chips 以刷新 active 态；同时修正 hero 节点点击 `toggleHeroCat` 中 `renderCats()` 缺参（应为 `renderCats(aggregateFilters())`，否则 `buildFilterItems(undefined)` 崩溃）。
- 改动文件：`prototype/src/parts/04-interactions.js`（头注释同步至 v1.20.36）。
- 根 `package.json` version 升至 v1.20.36。

[1.20.36]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.36

## [1.20.35] - 2026-08-23

### refactor: 校正技能分类并补全 traceknot 契约字段

- 重分类 18 个技能：内容创作类（`ads-creative`、`drama-*`、`sports-news`、`travel-planner*`、`wechat-article-writer`）由「文档与内容」改归「品牌与设计」；元技能/技能工程类（`find-skills*`、`grill-*`、`skill-creator`、`handoff`、`planning-with-files`）改归「工程实践与质量」。「文档与内容」回归技术文档本义（仅剩 `coding-standards`、`documentation`），13 类契约保持不变、无「其他」类。
- 补全缺失契约字段的技能：`skills/traceknot/SKILL.md`（归「工程实践与质量」）、`skills/short-drama-write/SKILL.md`（归「品牌与设计」）各补全 4 个必填 frontmatter 字段（`en_description`/`zh_displayName`/`category`/`en_category`）；`tools/validate-skills.mjs` 校验通过（189 技能 frontmatter 规范）。
- 同步 `data/skills-data.json` 与 `data/skills-metrics.json`（重新 build）；README 中/英领域表计数同步（品牌与设计 27→38、工程实践与质量 25→33、文档与内容 20→2）。
- 优化 `.cats` 选中分类显示效果（`prototype/src/styles/components.css`）：去掉脉冲点动画，选中态改为「彩色实心底 + 顶部高光 + 双层 ring（内浅色描边 + 外同色发光）+ 轻微上浮 1px」，hover 加深上浮；`.chip-all` 选中态复用同款聚焦质感，统一视觉权重。`prototype/src/styles/components.css` 头注释同步至 v1.20.35。
- 根 `package.json` version 升至 v1.20.35。

[1.20.35]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.35

## [1.20.34] - 2026-08-23

### feat: 详情卡片新增「用 Skills Manager 导入」入口

- 在技能详情安装区新增一键跳转按钮 `#skillManagerBtn`，链接至 Skills Manager 桌面应用项目（https://github.com/xingkongliang/skills-manager）。经核实该应用为 Tauri 桌面端、不支持 URL 深链接导入，故按钮以「跳转项目页 → 桌面端 + Add Skills 导入」方式实现，并带 hover 提示说明。
- 改动文件：`prototype/src/parts/03-detail.js`（安装区加链接 + i18n 文案 `detail.importWithManager` / `detail.importWithManagerHint`）、`prototype/src/i18n.js`（中英双语文案）、`app/components/detail/DetailInstall.tsx`（Next 端同位置同步）。
- 根 `package.json` version 升至 v1.20.34。

[1.20.34]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.34

## [1.20.33] - 2026-08-23

### style: 增强分类 chip 选中态的彩色显示

- `prototype/src/styles/components.css`：`.chip.active` 背景由 `hsl(var(--hue) 78% 30%)` 提亮至 `hsl(var(--hue) 82% 46%)`，新增亮色边框 `hsl(var(--hue) 85% 60%)` 与内外双层光晕，让选中的分类直接以该分类的彩色实心底呈现，色相更醒目；白字对比度仍满足 ≥4.5:1。
- 根 `package.json` version 升至 v1.20.33

[1.20.33]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.33

## [1.20.32] - 2026-08-23

### style: 补全语义化 ID 并统一原型/应用命名

- `app/components/AppShell.tsx`：分享反馈 toast 补充 `id="toast"`（此前仅 class，缺稳定定位点），与原型 `#toast` 对齐，便于调试与 e2e 定位。
- `prototype/src/parts/03-detail.js`：详情弹窗根 `id` 由 `detailPanel` 统一为 `detailDialog`，与 app 端 `detail-modal.tsx` 的 `detailDialog` 命名对齐（事件委托基于 class，无引用破坏风险）。
- 经完整核查，原型与 app 的主容器（header/main/footer）、搜索区、分类、网格、分页、弹窗（详情/设置）、卡片（`skill-{slug}`）、关键按钮（langBtn/themeBtn/settingsBtn/clearBtn 等）均已具备稳定可读的语义化 id，且两侧命名风格一致；其余主区域无需新增。
- 根 `package.json` version 升至 v1.20.32（注：对话间隙 HEAD 已由外部 bump 至 v1.20.31）

[1.20.32]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.32

## [1.20.31] - 2026-08-23

### feat: 落地 app 层技能详情分享按钮（spec §4.5.4 两层共通）

- `app/components/detail-modal.tsx` 头部新增「分享技能」按钮（`#shareSkillBtn`），调用 `copySkillShare` 并传入 `window.location.origin`，分享链接基于部署站点（openspec §4.5.4.4）
- `app/lib/share.ts` 的 `copySkillShare` 透传 `origin`/`basePath` 给 `buildShareText`，使其真正动态构造展示页链接
- `app/components/AppShell.tsx` 新增 `skill-share-feedback` 事件监听，复用 toast 显示复制成功/失败反馈
- 根 `package.json` version 升至 v1.20.31

[1.20.31]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.31

## [1.20.30] - 2026-08-23

### fix: 修复 code-review 发现的标准与规格偏差

- **Standards**：`lark-meeting` SKILL.md `description` 改 `|-` 块标量（去除双引号单行）+ 删除冗余空 `metadata` 块；`nodejs-backend-patterns` 与 `opc-mvp-designer` SKILL.md `description` 补中文译文（原仅英文，违反 frontmatter 契约）；`disk-cleaner` 经核已合规无需改。
- **Spec**：`openspec/spec.md` §2.3 分类口径同步为 13 类、明确 `description` 须 `|-` 块标量、修正 tags 已生成并消费的事实；`openspec/project.md` §4.5.3 分类筛选同步为「多选 OR」、标签维度已落地为第二组筛选；`app/lib/share.ts` 的 `buildShareText` 优先基于部署站点 `origin` 构造展示页链接（openspec §4.5.4.4），回退 GitHub；`prototype/src/parts/04-interactions.js` 分享仓库链接改 `location.origin` 动态。
- 根 `package.json` version 升至 v1.20.30

[1.20.30]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.30

## [1.20.28] - 2026-08-23

### chore: 合并标签体系并补全新增技能契约字段

- 标签合并（tools/build-skills-data.mjs TAG_DEFS + app SkillsExplorer.tsx + prototype i18n.js 三处同步）：`database` 并入 `data`（数据维度统一）；`image-design` 与 `media` 合并为 `design-media`（设计 & 媒体，并收窄正则去掉 brand/ui 泛匹配，避免与「品牌与设计」分类冲突）。标签数 16→14。
- 补全会话间新增的 4 个缺字段技能（disk-cleaner / lark-meeting / nodejs-backend-patterns / opc-mvp-designer）的 `zh_displayName / category / en_category / en_description`，归到正确 13 类，消除 build 游离「其他」类（14→13 类，「其他」归零）。
- 全链路验证：validate 189 技能规范、build 13 类、LF 完好。
- 同步 README 中/英（徽章 + 概述 + 统计卡 + 分类计数表：189 技能 / 13 类）。根 `package.json` version 升至 v1.20.28。

[1.20.28]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.28

## [1.20.28] - 2026-08-23

### refactor: 移除原型标签导航（.tags-nav）及整套标签筛选链路

- `prototype/src/index.html`：删除 `<nav class="tags-nav">`（含 `tags-label`/`#tags` 容器）。
- `prototype/src/parts/02-render.js`：移除 `renderTags` 函数；`buildFilterItems` 仅返回 `catItems`（去 `tagItems`）；`renderGrid` 删除 `renderTags(agg)` 调用与标签过滤条件（`state.tags` AND 组合分支）。
- `prototype/src/parts/01-state.js`：移除 `state.tags`；`aggregateFilters` 不再遍历 `s.tags`，仅聚合分类计数。
- `prototype/src/parts/04-interactions.js`：移除 `#tags` 点击事件委托；`clearFilters` 去掉 `state.tags = []` 复位。
- `prototype/src/i18n.js`：移除 `TAG_LABELS` / `tagLabel` 及 `api.tagLabel`/`api.TAG_LABELS` 暴露，删除无用 `filter.tags` 文案（zh/en）。
- `prototype/src/styles/layout.css`：移除 `.tags-nav`/`.tags-label`/`.tags-scroll` 规则，`.filter-scroll` 仍供分类复用；`.cats` 保留。
- 筛选现仅保留分类多维（多选 OR）+ 关键词 + 排序；动效/搜索/Hero 不受影响。无 lint 错误。
- 根 `package.json` version 升至 v1.20.28（01-state.js/04-interactions.js 头注释由滞后 v1.20.22/v1.20.26 同步至 v1.20.28）

[1.20.28]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.28

## [1.20.29] - 2026-08-23

### style: 减淡卡片分类色条 .cat-bar 颜色

- `prototype/src/styles/components.css`：`.card .cat-bar` 背景由 `hsl(var(--hue) 65% 38%)`（高饱和深彩）调整为 `hsl(var(--hue) 50% 52%)`（降饱和 65→50、提亮度 38→52），色条更柔和、降低视觉重量；hover 的 `saturate/brightness` 滤镜保持。
- 仅一处定义即全局生效（list 视图 `.cat-bar` 仍继承该色）。
- 根 `package.json` version 升至 v1.20.29（components.css 头注释由滞后 v1.20.17 同步至 v1.20.29）

[1.20.29]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.29

## [1.20.27] - 2026-08-23

### fix: 去除 Hero 随机学习按钮重复 🎲 图标

- `prototype/src/index.html` 的 `.zh`/`.en` 文本（`dice.btn`）原各自前缀 `🎲`，与相邻独立的 `<span class="dice-face">🎲</span>` 图标叠加成双图标；现移除文本内 `🎲`，图标统一由 `dice-face` 提供。
- `prototype/src/i18n.js` 的 `dice.btn` 中英文同步去掉 `🎲` 前缀（数据整洁，避免未来复用重复）。
- 验证：`node tools/build.mjs` 重建 269.0KB，产物中 `🎲 今天学点什么`/`🎲 Learn something` 均无残留，`dice-face` 保留单个 `🎲`。
- 根 `package.json` version 升至 v1.20.27（i18n.js 头注释由 v1.20.17 滞后同步至 v1.20.27）

[1.20.27]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.27

## [1.20.26] - 2026-08-23

### feat: 扩大 Hero 节点分布范围并强化连线可见度

- `prototype/src/index.html`：`<svg id="heroNet">` 加 `overflow="visible"` 允许线条/节点渲染到 viewBox 外；`#netLines` 连线组 `stroke-width` 1→1.4、`opacity` .5→.6。
- `prototype/src/parts/04-interactions.js`：随机撒点边界由局促的右侧区（x 470–790 / y 30–210）扩大为覆盖整个 viewBox 并可略溢出（x -30–830 / y -20–260），分布更开阔；最小间距 34→30；动态生成的连线 `stroke-width` 同步 1.4。
- `prototype/src/styles/layout.css`：`netBreathe` 呼吸区间 .35→.62 提升至 .5→.85（线条常态更明显）；`searching` 态连线 `stroke-width:2`、opacity .8→.85 加亮。
- 节点仍每次刷新随机分布；动效纯 CSS 合成 + `prefers-reduced-motion` 守卫不变；`.hero` 卡片保留 `overflow:hidden`，溢出仅在卡片内可见（不破坏圆角形状）。
- 根 `package.json` version 升至 v1.20.26

[1.20.26]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.26

## [1.20.25] - 2026-08-23

### feat: Hero 节点每次刷新随机分布

- `prototype/src/parts/04-interactions.js` 的 `renderHeroNodes`：原固定角度环绕改为每次刷新在核心右侧"星座区"（x 470–790 / y 30–210）随机撒点，最小间距 34px 防重叠；节点半径仍随分类计数（4~10）。核心→节点连线由 index.html 静态 6 条改为 JS 动态生成（`#netLines`），终点跟随随机节点；连线错峰呼吸相位基于动态子节点重新计算。
- `prototype/src/index.html`：移除静态 `<line>` 连线组，改为空 `<g id="netLines">` 容器交给 JS 填充。
- 刷新即重新随机；动效仍为纯 CSS 合成（nodeFloat/coreGlow/netBreathe）无 JS 逐帧开销。`prefers-reduced-motion` 守卫不变。
- 根 `package.json` version 升至 v1.20.25

[1.20.25]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.25

## [1.20.24] - 2026-08-23

### perf: 微调 Hero 焦点图动效（核心光环 + 节点呼吸 + 连线信号流）

- `prototype/src/index.html`：Hero SVG 新增 `hub-glow` 光环圆（核心外扩脉冲），核心 `hub-core` 保持右移
- `prototype/src/styles/layout.css`：新增 `@keyframes coreGlow`（光环 scale 1→1.9 渐隐，3.4s）；`nodeFloat` 由 ±3px 改为 ±4px 并叠加 opacity 呼吸（.82→1）；`net-line` 新增常态 `@keyframes netBreathe`（opacity .35→.62，4.8s）模拟信号流动。`prefers-reduced-motion` 守卫覆盖新增 `hub-glow`/`net-line` 动画
- `prototype/src/parts/04-interactions.js`：`renderHeroNodes` 节点浮动相位由随机改为按序号均分（刷新稳定不跳变）；并给静态 `net-line` 注入错峰相位（4.8s 周期均分）。全部动效仍为纯 CSS transform/opacity 合成，无 JS 逐帧开销
- 根 `package.json` version 升至 v1.20.24

[1.20.24]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.24

## [1.20.23] - 2026-08-23

### refactor: 合并分类与标签筛选（统一数据结构 + 渲染器）

- `prototype/src/parts/02-render.js`：原 `renderCats` 依赖静态 `SKILLS_DATA.categories`、`renderTags` 依赖 `TAG_LABELS`，二者数据源分散。现新增 `buildFilterItems(agg)` 从同一 `aggregateFilters()` 实况派生分类项（固定分类序、过滤 0 计数）与标签项（计数降序、过滤 0 计数），统一为 `{key,zh,en,count,hue,attr}` 结构；新增通用 `renderFilterChips()` 渲染器供标签复用，分类用内联渲染保留"全部"按钮。分类数据不再依赖静态数组，与标签同源
- `prototype/src/parts/01-state.js`：`aggregateFilters()` 同时产出 `cats`/`tags` 两个 Map，作为分类与标签唯一数据源
- 根 `package.json` version 升至 v1.20.23

[1.20.23]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.23

## [1.20.22] - 2026-08-23

### refactor: 合并 #categoryNav 与 #tagsNav 筛选计数数据（单次遍历）

- `prototype/src/parts/01-state.js`：原 `catCounts()`/`tagCounts()` 各自遍历 `SKILLS_DATA.skills` 聚合分类/标签计数，存在重复遍历。合并为 `aggregateFilters()` 单次遍历返回 `{ cats, tags }` 两个 Map
- `prototype/src/parts/02-render.js`：`renderGrid` 改为一次 `aggregateFilters()` 取两类计数，分别传给 `renderCats`/`renderTags`，消除重复扫描
- 根 `package.json` version 升至 v1.20.22

[1.20.22]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.22

## [1.20.21] - 2026-08-23

### perf: Hero 焦点图低开销动效（核心脉冲 + 节点错峰浮动）

- `prototype/src/styles/layout.css`：新增 `@keyframes corePulse`（核心节点 scale 呼吸，2.6s）与 `@keyframes nodeFloat`（节点 ±3px 浮动，5.5s）；仅用 `transform`/`opacity`，由 GPU 合成线程执行，不触发逐帧 layout/paint。`.searching` 态暂停节点动画保留连线脉冲。`prefers-reduced-motion` 下全部关闭
- `prototype/src/parts/04-interactions.js`：`renderHeroNodes` 为每个动态节点注入一次性随机 `animation-delay`（5.5s 周期内均匀分布），实现错峰浮动，无 JS rAF 逐帧开销
- 根 `package.json` version 升至 v1.20.21

[1.20.21]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.21

## [1.20.20] - 2026-08-23

### fix: Hero 焦点图重心右移，避免与文案重叠影响可读性

- `prototype/src/index.html`：Hero 节点网核心 `hub-core` 与连线端点整体右移（核心 `cx` 400→600，连线端点同步平移），焦点图重心偏右，文字留左侧
- `prototype/src/parts/04-interactions.js`：`renderHeroNodes` 环绕中心 `cx` 由 400 改为 600（与核心同步），动态分类节点网整体右移，不再压在标题/副标题上
- 节点范围 530–670 仍在 viewBox(800) 内，移动端 slice 裁切无害
- 根 `package.json` version 升至 v1.20.20

[1.20.20]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.20

## [1.20.19] - 2026-08-23

### fix: 合并 .categoryNav 与 .tags-nav 筛选条重复样式，整理 tag 数据

- `prototype/src/styles/layout.css`：将重复的 `.cats-scroll` 与 `.tags-scroll` 合并为统一基类 `.filter-scroll`（v1.20.18），消除两行垂直间距不一致（4px vs 0）导致的粘连/断裂冲突；移动端横向滚动规则统一
- `prototype/src/index.html`：分类/标签容器加 `filter-scroll` 类（保留原 id 供 JS 选择）
- `prototype/src/parts/02-render.js`：`renderTags` 过滤计数为 0 的标签，避免筛选后残留空标签占位（tag 数据合并整理）
- `app/components/SkillsExplorer.tsx`：对齐 `tagCounts`，过滤空计数标签，保持原型与 app 数据一致
- 根 `package.json` version 升至 v1.20.19

[1.20.19]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.19

## [1.20.18] - 2026-08-23

### refactor: 静态原型产物统一为 prototype.html，不再生成 index.html

- `tools/build.mjs` 仅生成 `prototype/prototype.html`（删除同源平行产物 `prototype/index.html` 的写入），消除 315KB 重复副本
- 删除仓库内 `prototype/index.html` 产物；所有文档指向由 `prototype/index.html` 改为 `prototype/prototype.html`（README 中/英、DESIGN.md、COMPONENTS.md、IMPROVEMENT-SPEC.md、states.html、openspec 三文档）
- 部署适配：静态托管默认需 `index.html` 入口，故 `vercel.json` 增 `rewrites` 将首页 `/` 重写到 `/prototype.html`；`package.json` 的 `serve` 脚本指定 `-i prototype.html` 入口
- CHANGELOG 历史小节中 `prototype/index.html` 为当时事实，按规范保留不篡改
- 根 `package.json` version 升至 v1.20.18

[1.20.18]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.18

## [1.20.17] - 2026-08-23

### chore: 整理技能去重、补全契约字段并迁移旧分类至 13 类体系

- 去重：`prototype` 系列上游重复导入（prototype-2/3/4 目录同名 `prototype`）拆为唯一 `name`（prototype-ui-variants / prototype-design-explore / prototype-stardust），并重命名目录对齐，`build` 数据 `name` 不再撞键
- 翻译头部注释：补全 16 个缺契约字段的技能（zh_displayName / category / en_category / en_description），并按契约顺序重排 frontmatter
- 迁移：将 74 个沿用旧「开发框架与平台」键的技能对照 13 类体系重新归类到前端开发 / 后端与平台 / 移动端开发 / WordPress 与 CMS / 工程实践与质量，消除游离分类（build 分类数 14→13）
- 修复 `tools/validate-skills.mjs` 分类集合（9 类→13 类），与 `build-skills-data.mjs` 对齐；`npm run build` + validate 全链路通过（186 技能 / 13 类）
- 根 `package.json` version 升至 v1.20.17

[1.20.17]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.17

## [1.20.16] - 2026-08-22

### refactor: 扁平化 app/ 目录结构并提升静态资源层级

- 消除双层 `app/app/` 嵌套：Next.js 应用代码（components/lib/layout/page/globals.css/tokens-shared.css/icon.*）上移至 `app/` 根，项目根 `app/` 即 Next 项目根（tsconfig `@/*`→`./*` 兼容，无需改；`app/lib/skills.ts` 以 `process.cwd()/../data` 锚定仓库根 data，cwd 不变）
- 品牌静态资源 `app/public/` → 仓库根 `public/`（favicon/logo/hub/banner 等），单一事实来源现位于仓库根 `public/`
- 同步更新引用：`tools/build.mjs` 品牌 favicon 复制源 `app/public/`→`public/`；README 中/英 banner 路径 `app/public/`→`public/`；`prototype/DESIGN.md` §8 品牌资产路径全部改为 `public/`
- 记忆库：删除 `brand/` 目录作为资产来源的长期使用方案（ID 94630702），MEMORY.md 明确「品牌资产单一来源现为仓库根 `public/`，`brand/` 已废弃」
- 根 `package.json` version 升至 v1.20.16

[1.20.16]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.16

## [1.20.15] - 2026-08-22

### chore: 恢复 edgeone.json 并显式声明 app/ 子项目构建（方案 B）

- 仓库根新增 `edgeone.json`：`rootDir: "app"`、`framework: "next"`、`installCommand: "npm install"`、`buildCommand: "npm run build"`、`outputDirectory: ".next"`、`nodeVersion: "18"`，将应用构建设置固化在根目录，解决腾讯云 EO 默认构建设置因入口在 `app/` 子目录而不生效的问题
- `app/next.config.mjs` 为 `output: "standalone"`（Node 运行时，产物 `app/.next/`），与 EO 输出目录一致
- 根 `package.json` version 升至 v1.20.15

[1.20.15]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.15

## [1.20.14] - 2026-08-22

### chore: 完善 app 分享功能与标签筛选样式，同步 v1.20.14

- `app/app/lib/share.ts` 补充分享按钮调用入口与仓库 URL 拼接逻辑
- `app/app/components/AppShell.tsx`、`SkillsExplorer.tsx`、`detail/DetailInstall.tsx` 接入分享/标签筛选交互
- 原型 `01-state.js`/`02-render.js`/`04-interactions.js`/`i18n.js`/`components.css`/`layout.css` 完善功能标签筛选与样式
- 根 `package.json` version 升至 v1.20.14

[1.20.14]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.14

## [1.20.13] - 2026-08-22

### feat: 根据 skills 数据自动派生功能标签，扩充筛选 chip 数量

- `tools/build-skills-data.mjs` 新增 `TAG_DEFS` 词表 + `deriveTags()`，基于技能 description/enDescription/category 关键词自动派生 1-3 个功能标签 slug，写入 `data/skills-data.json` 的 `tags` 字段（173/178 技能命中，16 个标签维度）
- 原型与 app 在分类筛选 chip 下方新增第二组「功能标签」筛选行（多选 OR，与分类以 AND 组合），标签中英显示名由 `TAG_LABELS` 提供
- 原型：`01-state.js`（tags 状态 + `tagCounts`）、`02-render.js`（`renderTags` + 过滤）、`04-interactions.js`（标签点击委托）、`i18n.js`（`TAG_LABELS` + `tagLabel`）、`index.html`（`#tags` 容器）、`layout.css`（`.tags-nav` 样式）
- app：`SkillsExplorer.tsx`（`tags` 状态 + `tagCounts` + `toggleTag` + 标签 chip 渲染）、`skills.ts`（`tags?` 字段已具备）、`globals.css`（`.chips.tags` 样式）
- `npm run build` 重建 `prototype/prototype.html`
- 根 `package.json` version 升至 v1.20.13

[1.20.13]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.13

## [1.20.12] - 2026-08-22

### feat: 页脚 Star 引导 + 分享按钮、chip 灰彩色、安装命令补全完整仓库 URL

- 原型与 app 页脚新增「给仓库点 Star ⭐」引导按钮（链接 `https://github.com/sutchan/Agent-Skills-Hub`）+「分享」按钮（随机宣传文案 + 完整仓库 URL，复制到剪贴板并 toast）
- 分类 chip 改为默认中性灰、选中态才用 `--hue` 派生彩色（原型 `components.css`/`layout.css` 与 app `globals.css` 同源对齐）
- 技能详情安装区补全完整 GitHub 仓库来源链接（`REPO_URL`）
- i18n 补 `footer.star`；`app/lib/share.ts` 新增 `REPO_URL`/`buildRepoShareText`/`copyRepoShare` 复用 `SHARE_PROMOS`
- `npm run build` 重建 `prototype/prototype.html`
- 根 `package.json` version 升至 v1.20.12

[1.20.12]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.12

## [1.20.11] - 2026-08-22

### refactor: 修复契约回归并接入重复导入技能（统一 LF）

- `traceknot` 被上游改回英文 `description` 且丢失 4 个必填字段，重新补全中文 `description` + `en_description`/`zh_displayName`(Traceknot QA 流程)/`category`(自动化与集成)
- 接入上游重复导入的两个技能 `travel-planner-2`、`travel-planner-3`：修正 `name` 等于目录名（避免 data 重复条目），补全 4 个必填字段并翻译中文 `description`
- `validate-skills.mjs` 校验 179 技能全部通过，0 头部泄漏、0 越界、0 其他类、0 重复 name
- `data/skills-data.json` 重建：179 技能 / 9 类 / 可见 178（含 1 hidden）
- 根 `package.json` version 升至 v1.20.11

[1.20.11]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.11

## [1.20.10] - 2026-08-22

### chore: 锁定 Node 引擎为 24.x 消除 Vercel 升级警告

- `package.json` `engines.node` 由 `>=24.11.0` 改为 `24.x`，避免 Vercel 在 Node 大版本发布时自动升级
- 根 `package.json` version 升至 v1.20.10

[1.20.10]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.10

## [1.20.9] - 2026-08-22

### refactor: 接入 11 个新技能并补全契约字段（统一 LF）

- 新增 11 个技能目录：drama-analyzer / drama-creator / drama-planner / drama-workflow / dramatic / hyperframes-core / hyperframes-creative / manga-drama / mcp-vods / travel-planner / planning-with-files（含 3 个短剧系列：short-drama-storyboard / short-drama-video-prompts / short-drama-write）
- 为 14 个新/改动技能补全缺失的 4 个必填字段（`en_description`/`zh_displayName`/`category`/`en_category`）；原 `category` 非法子类（story-analysis/creation/workflow）映射回 9 大稳定领域
- 全部新技能文本资源经 `ensure-lf` 转为 Unix(LF) 格式（8 个 CRLF 文件修复）
- `validate-skills.mjs` 校验 177 技能全部通过，0 头部泄漏、0 越界、0 其他类
- `data/skills-data.json` 重建：177 技能 / 9 类 / 可见 176（含 1 hidden）
- 根 `package.json` version 升至 v1.20.9

[1.20.9]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.9

## [1.20.8] - 2026-08-22

### refactor: 剥离 prototype.html 中「对齐 app 组件库」的预留类

- `prototype/src/styles/components.css`：删除仅用于 DESIGN/COMPONENTS 契约、原型从未渲染的预留类（`.badge`/`.src-badge`/`.skeleton`/`.separator`/`.dialog-title`/`.block`/`.tools`/`.skill-link`/`.tool-tag` 及对应注释）；这些组件规范已归属 `wireframes.html` 设计文档
- `prototype/prototype.html` 与 `index.html` 经 `npm run build` 重建同步（237.3 KB，仅保留应用真实使用的样式）
- 根 `package.json` version 升至 v1.20.8

[1.20.8]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.8

## [1.20.7] - 2026-08-22

### feat: 补齐 app 与原型的主题/密度/回到顶部对齐缺口

- `app/components/AppShell.tsx`：顶栏新增 `#themeBtn` 主题切换（写根节点 `data-theme` + localStorage `ash-theme`），与原型 `ThemeToggle` 对齐
- `app/components/settings-panel.tsx`：设置弹窗新增「显示密度」组（舒适/紧凑段控，`onDensity` 写入 `data-density` + `ash-density`）
- `app/components/SkillsExplorer.tsx`：新增 `#toTop` 回到顶部（滚动 >300px 显隐，`.to-top.show` 样式）；视图 `ash-view`、密度 `ash-density` 持久化补齐
- `prototype/DESIGN.md` §4.5：修正「app 层对齐」描述——删除虚构的 `ui/dialog.tsx`/`ui/settings-dialog.tsx` 引用，改为真实文件 `settings-panel.tsx`（界面元素/名称显示/显示密度三组），语言/主题/视图切换在顶栏实现
- 根 `package.json` version 升至 v1.20.7；`app/package.json` 升至 v1.1.17

[1.20.7]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.7

## [1.20.6] - 2026-08-22

### fix: 对齐 app 搜索行为与原型（防抖 + 组合拦截 + 检索字段补全）

- `app/components/SkillsExplorer.tsx`：搜索框新增 120ms 防抖（对齐原型 `DEBOUNCE_MS`）+ 输入法 `compositionstart/end` 拦截（拼音组合期间不触发筛选）；过滤检索串补全 `enDescription`/`category`/`enCategory`（原仅 `name/zh/description`），与原型 `matches()` 的 hay 字段一致
- `app/components/skill-card.tsx`：卡片根 `id` 由 `skill-${name}` 改为 `skill-${skillSlug(name)}`（新增 `app/lib/skillSlug.ts`，算法对齐原型 `01-state.js` `skillSlug`），统一两层卡片选择器与 E2E 锚点
- 根 `package.json` version 升至 v1.20.6；`app/package.json` 升至 v1.1.16
- **README 中/英领域表对齐真实数据**（v1.20.5 已清零「其他」类、orca-cli 归入 9 大领域）：自动化与集成 10 → 11，删除已不存在的「其他（待归类修正）1」行；开篇与亮点表移除「少数待归类」措辞，明确 166 含 1 hidden（公开可见 165）；贡献指南删除「当前有 1 个待修复」过时句

[1.20.6]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.6

## [1.20.5] - 2026-08-22

### fix: 补全 57 个技能未翻译字段并统一 LF（契约合规）

- 为纯英文 `description` 的 57 个技能补全中文完整描述（默认展示语言），采用 YAML `|-` 块标量
- 为 `zh_displayName` 仍为目录名的 31 个技能补全中文一句话摘要
- `orca-cli` 补齐缺失的 4 字段（`en_description`/`zh_displayName`/`category`/`en_category`）
- `validate-skills.mjs` 校验 166 技能全部通过，0 头部泄漏、0 越界、0 其他类
- 全部 `skills/` 文本资源经 `ensure-lf --check` 确认为 Unix(LF) 格式
- 根 `package.json` version 升至 v1.20.5

[1.20.5]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.5

## [1.20.4] - 2026-08-22

### docs: 修正文档事实错误与失效引用（规范/原型文档对齐最新架构）

- **prototype/DESIGN.md**：头注释 1.19.38 → 1.20.4（纠正历史记录失实）；§7 部署段落移除已删除的 `edgeone.json` 引用，改为通用静态托管表述
- **openspec/project.md**：§4.5.1 schema 注释修正（`zh`=中文摘要 / `description`=中文完整描述，原注释颠倒）；目录表与 §4.5 数据来源补全必备 6 字段（`zh_displayName` 而非 `zh`）；§4.5/§6 构建脚本路径统一补 `tools/` 前缀并补充 metrics 双产物架构；头注释 1.20.3 → 1.20.4
- **prototype/COMPONENTS.md**：第 9 行构建脚本路径补 `tools/` 前缀并补 metrics 双产物；头注释 1.20.3 → 1.20.4
- **README.en.md**：第 63/111 行补 `skills-metrics.json` 独立存储与轻量化说明，与中文版对称；版本徽章升至 v1.20.4
- 根 `package.json` version 升至 v1.20.4

### docs: 收尾对齐 openspec 与代码/原型真实状态（同 v1.20.4）

- **openspec/spec.md**：头注释 1.20.3 → 1.20.4（§1 版本号同步）；§2.1 `SkillEntry` 补 `tags?` 预留字段注释；§2.3 新增「标签对齐」条款（数据层未生成 tags、原型由 name 派生展示）
- **openspec/AGENTS.md**：头注释 1.20.3 → 1.20.4
- **openspec/project.md**：§2 目录表补全 `app/lib`（`skills.ts`/`share.ts`）与 `app/tokens-shared.css`、`tools/` 全量脚本清单（build*/sync-tokens/validate/ensure-lf/_scan_fm_bug 及 py 工具）；§4.5.1 补完整字段指向 spec §2.1

[1.20.4]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.4

## [1.20.2] - 2026-08-22

### fix: 补全新加入技能契约并归并残留废弃子类

- **新技能检查**：相对 HEAD 新增 8 个 skill（capcut / captions-and-clipping / descript / luma / opus-clip / scripting-and-storyboarding / suno / talking-head-and-piece-to-camera），原仅含 `name`+`description`+`version`，补齐缺失的 `en_description` / `zh_displayName` / `category` / `en_category` 四字段并按标准顺序重排（name → description → en_description → zh_displayName → category → en_category → version），全部归入「音视频与多媒体 / Media & Multimedia」
- **残留废弃子类归并**：80 个 SKILL.md 的 `category`/`en_category` 仍停留在废除的 5 个子类（前端开发 / 工程实践与质量 / WordPress 与 CMS / 后端与平台 / 移动端开发），全部重映射回「开发框架与平台 / Dev Frameworks & Platforms」
- **校验结果**：`tools/validate-skills.mjs` 168 → 0 问题（166 技能全部通过）；`tools/_scan_fm_bug.mjs` 头部泄漏 0；`build-skills-data.mjs` 输出 166 技能（含 1 hidden）/ 9 类 / 0 越界
- README 中/英领域表与计数同步（音视频与多媒体 11 → 19，总数 157 → 165）；prototype/index.html 重建
- 版本同步：根 `package.json` 升至 v1.20.2，README 中/英文徽章对齐

## [1.20.3] - 2026-08-22

### refactor: 拆分频繁更新指标到独立数据文件

- `tools/build-skills-data.mjs` 拆分为两个产物：`data/skills-data.json`（稳定元数据，仅 11 字段）+ `data/skills-metrics.json`（频繁更新指标 popularity/size/files/stars/firstSeen/skillVersion，以 name 为 key 的 map）
- 主数据不再含频繁更新字段，指标更新时只重写小的 metrics 文件，避免每次重算重写整个大 JSON（166 技能）
- `app/lib/skills.ts` `loadSkills()` 合并两个数据源；`tools/build.mjs` 构建时合并后注入 prototype（保持自包含）
- 文档（README 中/英、CONTRIBUTING）更新数据架构说明；版本同步至 v1.20.3

## [1.20.3] - 2026-08-22（补：文档缺陷修复）

### docs: 按最新现状修复项目文档事实错误与失效引用

- **README 中/英领域表计数修正**：自动化与集成 11 → 10、补充「其他（待归类修正）1」类，合计 166；开篇「9 大领域 / 165」改为真实表述（166 含待归类）
- **CONTRIBUTING 分类矛盾修复**：第 78 行示例与第 103 行正文从「9 大 / 13 大」矛盾统一为 9 大稳定领域 + 其他类说明；frontmatter 示例与契约字段 `zh` → `zh_displayName`（对齐实际磁盘字段）
- **路径失效修复**：CONTRIBUTING / openspec/spec.md / prototype/DESIGN.md 中 `scripts/validate-skills.mjs`、`node build-skills-data.mjs`、`node build.mjs` 全部补 `tools/` 前缀（脚本已迁 tools/）
- **失效引用删除**：README 中/英、prototype/DESIGN.md 删除不存在的 `app/README.md` 引用（app/ 下无 README，已确认）
- **分支表述更正**：CONTRIBUTING「发起 PR」从 `main` 改为 `dev`（本仓库工作分支为 dev）
- **openspec/spec.md 数据契约补全**：§2.1 新增 §2.1.1 派生指标（SkillMetrics 来自 skills-metrics.json）；§2.3 分类红线标注「其他」类须清零（当前 1 个待修复）；头注释与版本权威源升至 v1.20.3
- **头注释同步**：openspec/project.md、AGENTS.md、prototype/COMPONENTS.md、DESIGN.md 头注释 v1.19.38 → v1.20.3

## [1.20.1] - 2026-08-22

### docs: 统一技能文件为 Unix(LF) 换行符规范

- `.github/CONTRIBUTING.md` 新增「文件换行符规范（强制）」章节：所有 `skills/<name>/` 下文本资源统一使用 LF，禁止 CRLF；新增技能自动按 LF 写入
- `.gitattributes` 明确 `skills/** text eol=lf` 覆盖 SKILL.md 及 scripts/references/assets/agents 全部文本资源，配合编辑器 `files.eol: "\n"` 防回潮
- PR 检查清单增加「文件换行符为 Unix(LF)」勾选项；CONTRIBUTING 头注释升至 v1.20.1
- 根 `package.json` version 升至 v1.20.1

## [1.20.0] - 2026-08-22

### feat: 原型体验改进 A/B/C（Hero 搜索 + 字体色板精修 + 移动端 Sheet）

- **A 方案 · Hero 搜索前置与节点网联动**：Hero 区新增 `#heroSearch` 搜索框，与顶部 `#searchInput` 共享同一 `state.query`（双向同步）；搜索/筛选时 `#heroNet` 节点网核心点亮、连线脉冲动画，提供视觉联动反馈（`index.html`/`04-interactions.js`/`layout.css`）
- **B 方案 · 字体与品牌色精修**：`--font-display` 升级为 Iowan/Palatino 衬线栈提升展示质感；深色主题主色相由 146 统一为 152，与浅色零漂移；卡片分类条加粗至 6px 并 hover 发光、标题字号 15→16px 强化层级（`tokens.css`/`components.css`）
- **C 方案 · 移动端 Sheet 与空状态插画**：≤640px 详情弹窗改为底部抽屉 Sheet（居中 Modal 仅桌面端），`aria-labelledby` 动态绑定 `#d-title`；空状态新增节点网+放大镜「签名插画」（`03-detail.js`/`02-render.js`/`layout.css`）
- 版本同步：根 `package.json` 升至 v1.20.0，相关文件头注释对齐

## [1.19.43] - 2026-08-22

### fix: 补全 13 类分类映射并修复 prototype 构建转发

- 将 80 个仍为「开发框架与平台」的 SKILL.md 按语义归入 13 类子类（前端开发/后端与平台/移动端开发/WordPress 与 CMS/工程实践与质量）
- 修复 `prototype/build-skills-data.mjs` 转发目标（`../build-skills-data.mjs` 不存在 → `../tools/build-skills-data.mjs`），解决 CI `Cannot find module` 报错
- 重建 `data/skills-data.json`（13 类 / 158 skills）与 `prototype/index.html`
- 版本同步：根 `package.json` 升至 v1.19.43，README 中/英徽章对齐

## [1.19.41] - 2026-08-22

### fix: 分页每页显示数量由 100 调整为 48

- prototype 端 `01-state.js` 的 `PAGE_SIZE` 由 100 改为 48（`02-render.js` 分页逻辑按 `PAGE_SIZE` 推算，自动适配）
- app 端 `SkillsExplorer.tsx` 的 `PAGE_SIZE` 由 100 改为 48（分页器基于 `PAGE_SIZE` 推算总页数，无硬编码依赖）
- `app/globals.css` 分页器注释同步「每页 48 条」
- 版本同步：根 `package.json` 升至 v1.19.41，README 中/英文徽章对齐

## [1.19.40] - 2026-08-22

### feat: 分类体系恢复为 13 类 + 详情未知项不显示

- **分类重构**：将单类「开发框架与平台」(76 个) 拆为 4 个子类——前端开发 / 后端与平台 / 移动端开发 / WordPress 与 CMS，合计恢复 13 大分类
- **磁盘同步**：76 个 SKILL.md 的 `category` 与 `en_category` 字段已重映射对齐新 13 类（前端开发 18 / 后端与平台 6 / 移动端开发 11 / WordPress 与 CMS 12 / 工程实践与质量 29），无「其他」类
- **构建脚本**：`build-skills-data.mjs` 的 `CATEGORY_ORDER` 与 `CATEGORY_EN` 更新为 13 类；`build-skills-data.mjs` 头注释升至 v1.19.40
- **详情未知项隐藏**：prototype 端 `03-detail.js` 对空值（`author`/`stars`/`firstSeen`/`license`/`version`/`category`）不再渲染「未知」占位符，改为直接不显示该行（`03-detail.js` 头注释升至 v1.19.40）；app 端 `DetailMeta.tsx` 此前已用守卫逻辑隐藏空值
- README 中/英领域表与计数同步为 13 类；CONTRIBUTING 契约分类说明更新为 13 类
- 版本同步：根 `package.json` 升至 v1.19.40，README 中/英文徽章对齐

## [1.19.39] - 2026-08-22

### feat: 详情弹窗增强——必显原始名(slug) + 增加分类/网址等头部字段

- **原始名称**：详情标题区双显中文名与英文 slug；元信息区新增明确的「原始名称 / Slug」行，确保任何名称模式下都可见技能原始目录名
- **分类字段**：详情元信息新增「分类 / Category」行，展示中文分类 + 英文分类名（`category · enCategory`）
- **网址字段**：`build-skills-data.mjs` 新增提取 `homepage`（兼容 `source`/`url`/`website` 多键），详情以可点击外链展示（仅当为合法 http(s) 时）
- **其他头部字段**：作者 / 协议 / 版本 / 首次收录 / 星标 已在元信息区展示
- **字段名修正**：`zh` 显示名优先取磁盘实际字段 `zh_displayName`（原 `fm.zh` 为空导致中文名丢失，如 wp-plugin-development 现正确显示「WordPress 插件开发」）
- 原型端（`03-detail.js` + `i18n.js`）与 app 端（`DetailMeta.tsx` + `skills.ts`）同步增强
- 版本同步：根 `package.json` 升至 v1.19.39，README 徽章对齐

## [1.19.37] - 2026-08-22

### refactor: 标准化 frontmatter 字段并回退 13 类为 9 类

- **字段重命名**：133 个仍用旧 `zh:` 字段的技能统一改为契约字段 `zh_displayName:`（仅 frontmatter 顶层键，不影响正文）；同步更新 `tools/validate-skills.mjs` 必填/顺序契约（`zh` → `zh_displayName`）。
- **分类回退**：5 个非法子类（工程实践与质量 / 后端与平台 / 移动端开发 / 前端开发 / WordPress 与 CMS，共 76 个技能）重映射回合法 9 类中的「开发框架与平台」；`tools/build-skills-data.mjs` 的 `CATEGORY_ORDER` / `CATEGORY_EN` 回退为标准 9 类。
- **契约补全**：20 个缺失 `en_description` / `zh_displayName` / `en_category` 的技能（ad-creative、brand-guidelines、vercel-* 等）补全三字段并重排为契约顺序。
- **校验**：`tools/validate-skills.mjs` 通过（153 个技能规范，0 越界）；`scripts/_scan_fm_bug.mjs` 头部泄漏扫描 0 问题。
- README 中/英徽章升至 v1.19.37，领域表与计数同步为 9 类 / 152 个可见技能包。

## [1.19.38] - 2026-08-22

### fix: 对齐 Skill 类型与真实数据，清理详情弹窗死代码

- **类型与数据对齐**：`app/lib/skills.ts` 的 `Skill` 移除数据集未生成的字段（author/license/skillVersion/stars/firstSeen），保留运行时真实存在的 size/files/popularity
- **详情弹窗死代码修复**：原 `detail-modal.tsx` 引用的 `skill.author/githubStars/version/firstSeen/license/updatedAt` 在 `skills-data.json` 中均不存在，导致元信息/指标区块永远为空（真实 bug）。重写 `DetailMeta`/`DetailMetrics` 仅渲染真实字段（size/files/popularity 热度条）
- **拆分超 200 行文件**：`detail-modal.tsx`(209)→`lib/detail-helpers.ts`+`components/detail/{Meta,Metrics,Install,Related}.tsx`；`SkillsExplorer.tsx`(286)→`components/settings-panel.tsx`+`components/pager.tsx`；主文件保留编排，导出契约不变
- **语义化 id**：新增 `detailMeta/detailMetrics/detailInstall/detailTools/detailGithubLink/detailRelated/copyNameBtn/detailCloseBtn/detailDialog/detailBackdrop/copyCmdBtn/settingsPanel/pager` 等
- **版本号统一**：所有 app 源文件、openspec 三文档、prototype 两规范文档头注释升至 v1.19.38；根 package.json/README 中英文徽章同步

## [1.19.36] - 2026-08-22

### refactor: 拆分超 200 行组件并对齐规范与版本号

- **拆分超 200 行源文件**（单一职责）：
  - `detail-modal.tsx`(209行) → 抽离 `lib/detail-helpers.ts`(formatSize/maxPopularity/copyText) + `components/detail/{DetailMeta,DetailMetrics,DetailInstall,DetailRelated}.tsx`
  - `SkillsExplorer.tsx`(286行) → 抽离 `components/settings-panel.tsx` + `components/pager.tsx`
  - 主文件保留编排逻辑，导出契约（SkillCard/DetailModal/SkillsExplorer）保持不变
- **规范对齐**：`openspec/project.md` React 19 修正为 React 18（对齐 `app/package.json` 实际依赖）
- **版本号统一**：11 个 app 源文件、3 个 openspec 文档、2 个 prototype 规范文档头注释统一升至 v1.19.36；根 package.json/README 中英文徽章同步
- 语义化 id：新增 `detailMeta/detailMetrics/detailInstall/detailTools/detailGithubLink/detailRelated/copyNameBtn/detailCloseBtn/detailDialog/detailBackdrop/copyCmdBtn` 等
- 鲁棒性：localStorage 读取包 try/catch 容错；Pager 页码窗口省略号逻辑收敛

## [1.19.35] - 2026-08-22

### chore: 迁移 scripts/_scan_fm_bug.mjs 至 tools/ 并删除 scripts 目录

- **脚本迁移**：长期 frontmatter 质检脚本 `scripts/_scan_fm_bug.mjs` 移入 `tools/_scan_fm_bug.mjs`（内容重建，补位置注释；原文件未受 git 跟踪，由已知内容恢复）
- **目录清理**：删除空 `scripts/` 目录，长期脚本统一归入 `tools/`
- **gitignore 白名单**：补充 `!tools/_scan_fm_bug.mjs`
- **版本同步**：根 `package.json` 升至 v1.19.35，README 徽章对齐

## [1.19.34] - 2026-08-22

### feat: 拆分 9 大分类为 13 类，增强技能归类粒度

- 原「开发框架与平台」(72) 拆分为 5 个子类：**前端开发 / 后端与平台 / 移动端开发 / WordPress 与 CMS / 工程实践与质量**
- 补齐 19 个缺失 `category` 字段的技能（含 `ads-creative`、`eve`、`orca-cli`、`php-pro`、`video` 等），消除"其他"越界类
- `tools/build-skills-data.mjs`：`CATEGORY_ORDER` 更新为 13 类，新增 `CATEGORY_EN` 中文→英文映射表（英文态 chip/筛选不再退化成中文）
- 当前规模：**152 个技能包 / 13 大领域**（品牌与设计 27 · 工程实践与质量 30 · 前端开发 14 · 移动端开发 12 · WordPress 10 · 音视频 11 · 文档 11 · 自动化 10 · 后端 9 · AI 8 · 数据分析 2 · 文件 4 · 安全 4）
- README 中/英领域表与计数同步；原型与 app 筛选器动态读取数据，无需硬编码改动
- 版本同步：根 `package.json` 升至 v1.19.34，README 徽章对齐

## [1.19.33] - 2026-08-22

### refactor: 补齐组件头注释并抽离复制逻辑

- **头注释对齐**：`skill-card.tsx`/`detail-modal.tsx` 头注释升至 v1.19.33（修复之前 bump 漏改导致的脱节）
- **标题渲染合并**：`skill-card.tsx` 英文标题分支合并为单一 `showEn = nameMode==="both" || nameMode==="en"`，去除互斥重复渲染
- **复制逻辑抽离**：`detail-modal.tsx` 抽离 `copyText(text, lang)` helper，替代 `copyName`/`copyCmd` 重复实现
- 版本同步：根 `package.json`/README 中英文徽章升至 v1.19.33

## [1.19.32] - 2026-08-22

### perf: 应用性能优化（静态预渲染 + standalone + 翻页滚动）

- **静态预渲染**：`page.tsx` 加 `export const dynamic = "force-static"`，锁定本地数据纯静态页，TTFB 最优
- **部署精简**：`next.config.mjs` 加 `output: "standalone"`，生成精简 server bundle，冷启更快
- **翻页体感**：`SkillsExplorer` 翻页封装 `goPage`，切换页码时 `window.scrollTo({top:0})` 回到网格顶部
- 图标路径确认：`app/icon.svg` 在位（App Router 约定式），`layout.tsx` 指向无误，无 404 风险
- GA4 `next/script strategy="afterInteractive"` 已符合最佳实践，未阻塞 LCP
- 版本同步：根 `package.json`/README 中英文徽章升至 v1.19.32

## [1.19.31] - 2026-08-22

### fix: 修复 skill 详情关闭按钮与复制名称按钮重叠

- **原型端（prototype）**：`#detailClose` 原为 `position:absolute` 浮于右上角，与头部右侧的复制名称按钮（`.d-actions`）空间争抢导致重叠；改为将关闭按钮移入 `.detail-head` flex 流程作为末尾子项，CSS 取消 absolute 定位，头部加 `position:relative` 兜底
- 版本同步：根 `package.json` 升至 v1.19.31，README 徽章对齐

## [1.19.30] - 2026-08-22

### fix: skill 详情整卡滚动而非仅底部信息区滚动

- **原型端（prototype）**：`.detail` 容器由 `overflow:hidden` 改为 `overflow-y:auto`，`.detail-body` 移除单独 `overflow:auto` 改为 `overflow:visible`，整张详情卡统一滚动
- **应用端（app）**：移除详情头部 `position:sticky` 固定，整卡随外层 `.dialog` 统一滚动，消除「头部不动、只有描述区滚动」的观感
- 版本同步：根 `package.json` 升至 v1.19.30，README 徽章对齐

## [1.19.30] - 2026-08-22

### perf: 应用性能优化（静态预渲染 + standalone + 翻页滚动）

- **静态预渲染**：`page.tsx` 加 `export const dynamic = "force-static"`，锁定本地数据纯静态页，TTFB 最优
- **部署精简**：`next.config.mjs` 加 `output: "standalone"`，生成精简 server bundle，冷启更快
- **翻页体感**：`SkillsExplorer` 翻页封装 `goPage`，切换页码时 `window.scrollTo({top:0})` 回到网格顶部
- 图标路径确认：`app/icon.svg` 在位（App Router 约定式），`layout.tsx` 指向无误，无 404 风险
- GA4 `next/script strategy="afterInteractive"` 已符合最佳实践，未阻塞 LCP
- 版本同步：根 `package.json`/README 中英文徽章升至 v1.19.30

## [1.19.29] - 2026-08-22

### refactor: 同步 app 头注释版本并抽离 initials 共享工具

- **头注释对齐**：`app/` 下 11 个源文件头注释（page/AppShell/SkillsExplorer/skill-card/detail-modal/layout/globals.css + lib 5 文件）统一升至 v1.19.29，消除长期滞后（部分停留在 v1.14.x/v1.18.x）
- **抽离共享工具**：新增 `app/lib/initials.ts`，`skill-card.tsx` 与 `detail-modal.tsx` 删除重复实现，改由单一来源导入
- **配置清理**：`next.config.mjs` 修正 React 版本注释（实为 React 18 非 19）并删除未使用的 `images` 段
- **URL 安全**：`detail-modal.tsx` 对 `githubDir` 做 `encodeURIComponent` 编码，防范特殊字符 URL 风险
- 版本同步：根 `package.json` 升至 v1.19.29，README 徽章对齐

## [1.19.28] - 2026-08-22

### chore: 迁移 validate-skills.mjs 至 tools/ 并恢复丢失脚本

- **恢复脚本**：`scripts/validate-skills.mjs` 在 `3c8c941` 后被误删，从 `3c8c941` 重建并移入 `tools/validate-skills.mjs`（UTF-8 编码，ROOT 路径逻辑不变，校验 148 技能通过）
- **gitignore 白名单**：`!scripts/validate-skills.mjs` 改为 `!tools/validate-skills.mjs`
- **版本注释**：脚本头注释更新为 `tools/validate-skills.mjs v1.19.28`
- **版本同步**：根 `package.json` 升至 v1.19.28，README 徽章对齐

## [1.19.27] - 2026-08-22

### refactor: 收尾前端扁平化迁移（app 路径修正、React 统一、单源数据、令牌拆分）

- **tsconfig 别名**：`paths "@/*"` 由 `./app/*` 改为 `./*`，适配 app 源码已上提到 `app/` 根（消除双层 app/app 混淆）
- **React 版本统一**：`app/package.json` 的 react/react-dom/@types 由 19.x 统一回 18.3.x（与 Next 14.2 官方配套，消除版本分裂）
- **数据单源读取（Q6=B）**：`app/lib/skills.ts` 的 `DATA_PATH` 改为读取仓库根 `data/skills-data.json`；删除 `app/data/skills-data.json` 副本与废弃的 `app/scripts/sync-data.cjs`，移除 `predev/prebuild` 同步钩子，杜绝双源漂移
- **令牌同步拆分（Q7/Q8=A）**：从 `tools/build.mjs` 移除写 `app/tokens-shared.css` 段落，拆出独立 `tools/sync-tokens.mjs`（抽取 prototype 令牌 :root + 暗色块写入 app 静态副本）；视觉变更后手动运行并随仓库提交
- **构建脚本迁移**：根 `build.mjs`/`build-skills-data.mjs` 已移入 `tools/`（上轮完成），ROOT 改为 `dirname(__dirname)`，根 `package.json` 的 build/serve 脚本路径同步更新
- 版本同步：根 `package.json` 升至 v1.19.27，README 徽章对齐

## [1.19.26] - 2026-08-22

### fix: 修复 skills-manager 中 description 双引号导致的渲染混乱

- 将 25 个技能 `description` 的双引号单行（`"..."`）统一改为 YAML 块标量 `|-`（含全角标点的 `winui-dev-workflow`、`wp-plugin-development` 此前在 skills-manager 显示错位，改后修复）
- `.github/CONTRIBUTING.md` 新增「值格式规范」：description/en_description 含中文全角标点或长句须用 `|-` 块标量，禁止双引号单行（部分 manager 非严格 YAML 会误解析）
- 重新 `npm run build` 验证：148 技能 / 9 分类，无「其他」类越界

## [1.19.25] - 2026-08-22

### docs: 同步文档与构建产物至 v1.19.25

## [1.19.24] - 2026-08-22

### docs: 修复文档版本滞后与技能计数矛盾

- 重跑 `npm run build` 刷新 `data/skills-data.json`（148 技能 / 9 分类，可见 147 个技能包）
- README 领域计数表修正为真实分布（品牌24/文档12/数据2/开发72/文件4/AI9/音视频10/自动化11/安全4），与构建产物一致
- 同步滞后头注释至 v1.19.24：openspec 三文档、app/README.md、.github/CONTRIBUTING.md、prototype/DESIGN.md、prototype/COMPONENTS.md
- 修正 openspec/spec.md §2.3 一致性规则（原引用已废弃的 README `### 分类（N）` 标题，改为与领域表格及动态统计一致）

## [1.19.23] - 2026-08-22

### docs: 精简 README 去除工作区配置说明

- README 中/英删除「工作区配置 / Workspace」目录条目（非必要说明）
- 版本徽章同步至 v1.19.23

### fix: 修复详情弹窗相关技能交互与前端性能/规范问题

- `detail-modal.tsx`：新增 `onOpenSkill` 回调，相关技能卡片点击由「仅关闭弹窗」改为「切换打开该技能详情」（P0 功能缺陷）
- `skill-card.tsx`：包裹 `React.memo`，避免父组件 state 变化导致全部可见卡片重渲（P1 性能）
- `SkillsExplorer.tsx`：排序比较器类型由 `any` 改为 `Skill`，符合禁 any 规范（P1）
- 删除零引用的死代码 `lib/i18n.ts`（组件全部用内联三元，无任何 import，且 `Lang` 类型来自 `share.ts`，删除无副作用）（P1）
- 被改文件头注释同步至 v1.19.23

## [1.19.22] - 2026-08-22

### docs: 精简 README 去除品牌资产等非必要章节

- README 中/英删除「品牌资产 / Brand Assets」整章及对应目录条目（品牌资产细节已集中于 `app/public/` 与代码，README 保持精简）
- 合并中/英开场白为单段，去除冗余作者/项目重复行
- 版本徽章同步至 v1.19.22（上轮为 v1.19.21，README 显示滞后已修正）

## [1.19.21] - 2026-08-21

### fix: 详情弹窗整体滚动（消除仅底部区域单独滚动条）

- `app/globals.css`：`.dialog` 由 `overflow: hidden` 改为 `overflow-y: auto`，成为整体滚动容器
- 详情弹窗各区块（`.detail-head`/`.detail-meta`/`.detail-metrics`/`.d-install`/`.detail-body`）加 `flex: none` 防止被 flex 压缩；头部 `position: sticky; top: 0` 常驻顶部
- `.detail .dialog-body` 取消单独 `overflow: auto`，滚动职责上移到外层 `.dialog`
- package.json 升至 v1.19.21

## [1.19.20] - 2026-08-21

### feat: 详情页安装命令 + STAR/首次收录 + 列表分页(每页100)

- 数据层 `build-skills-data.mjs` 提取 `metadata.stars`/`metadata.firstSeen`（用户决策本地 frontmatter 维护；skills.sh 无 STAR/firstSeen 且 API 需认证），新增恒定派生 `installCommand`（`npx skills add sutchan/Agent-Skills-Hub/skills/<name>`）
- 详情弹窗（原型 `03-detail.js` + app `detail-modal.tsx`）元信息区加「星标 / Stars」「首次收录 / First seen」，新增安装命令区（代码块 + 复制命令按钮），保留复制名称
- 列表分页：每页 100 条，数字翻页 + 上下页（页码窗口 ±2，首尾必显，省略号）；筛选/搜索/排序变化重置为首页
  - 原型 `01-state` 加 `page`/`PAGE_SIZE`，`02-render` 加 `renderPager`，`04-interactions` 绑分页委托 + 重置
  - app `SkillsExplorer` 加 `page` state + 分页 UI + 切片
- `lib/skills.ts` 补 `stars?`/`firstSeen?`/`installCommand`；i18n 补 `detail.stars/firstSeen/install/copyCmd` 与 `pager.*`；CSS 补 `.d-install`/`.cmd-row`/`.pager`/`.pg-btn`
- package.json 升至 v1.19.20

## [1.19.19] - 2026-08-21

### docs: 同步文档版本头注释与技能计数

- **技能计数修正**：README 中/英「146 → 147」（对话间隙新增技能，构建实算 `data/skills-data.json` 可见 147 / 9 类）
- **文档头注释同步 v1.19.19**：补齐长期脱节的 `.github/CONTRIBUTING.md`（v1.19.2→v1.19.19）、`prototype/DESIGN.md`（v1.19.7→v1.19.19）、`prototype/COMPONENTS.md`（v1.17.3→v1.19.19）、`app/README.md`（新增头注释）；openspec 三文档、package.json、README 中英文徽章一并对齐
- **prototype/DESIGN.md 版本历史补充**：新增 v1.19.14 详情弹窗重构与 `source` 可选字段说明，中间版本指引查根 CHANGELOG

## [1.19.18] - 2026-08-21

### docs: 更新项目规范补充外部技能生态（skills.sh）参考

- **openspec/spec.md 新增 §8 外部技能生态参考**：记录开放 Agent Skills 目录 [skills.sh](https://www.skills.sh)（Vercel 出品）的定位、安装方式 `npx skills add <owner/repo>`、API（`/api/v1/skills`、`/skills/search`、`/skills/curated`、详情端点）、Topics 分类与主流技能，明确其作为本仓库选品/对标/补充来源
- **SkillEntry 新增可选 `source` 字段**（§2.1）：本地技能可在 frontmatter 标注 `source: <owner/repo>` 指向 skills.sh 上游，便于外部溯源，`build-skills-data.mjs` 读取写入
- **版本同步**：openspec 三文档头注释由 v1.19.2 升至 v1.19.18（修正长期脱节）；package.json / README 中英文徽章同步 v1.19.18

## [1.19.17] - 2026-08-21

### fix: 修复技能详情弹窗无法打开

- 原型 `03-detail.js`：`openDetail(arg)` 兼容 04-interactions 传入的 skill 对象与 name 字符串（原按字符串查 `SKILL_MAP.get(object)` 返回 undefined 直接 return，导致弹窗不渲染）
- 详情注入常驻 `#dialog` 并补 `.show` 类使其可见（原仅给遮罩 `#overlay` 加 `.show`，`#dialog` 默认 `display:none` 不可见）；`closeDetail` 同步移除 `.show` 且只清空内容、保留 `#dialog` 容器（避免破坏设置弹窗等复用者）
- `.detail` 改为绝对填满 `#dialog`，消除双重圆角边框
- package.json 升至 v1.19.17

## [1.19.16] - 2026-08-21

### feat: 详情弹窗新增大小 / 文件数 / 热度指标

- **`build-skills-data.mjs` 派生展示指标**：`size`（技能目录总字节数，递归统计）、`files`（文件数）、`popularity`（被其他技能 description 提及次数，相关性热度代理）
- **原型 `03-detail.js`**：元信息区下新增指标条（大小 KB/MB、文件数、5 格热度条 + 引用次数/独立标签）；`i18n.js` 补 `detail.size/files/filesUnit/popularity/popRefs/popStandalone` 双语；`components.css` 补 `.detail-metrics/.metric/.heat-bars` 样式
- **app `detail-modal.tsx`**：同步指标渲染（TS 实现 formatSize/maxPopularity/热度条），`lib/skills.ts` 类型补 `size/files/popularity`，`globals.css` 补同款样式；`app/data/skills-data.json` 已同步根数据

## [1.19.15] - 2026-08-21

### refactor: 技能详情弹窗指标基线（构建链打通）

- 详情弹窗指标展示能力的前置构建链就绪（数据派生与渲染框架就位）

## [1.19.14] - 2026-08-21

### feat: 完善技能详情弹窗——元信息区 + 相关技能 + 复制名称

- `build-skills-data.mjs` 提取 `metadata.author`(作者)、`metadata.license`(协议)、`metadata.version`(版本)，并恒定派生 `githubDir`(`skills/<name>`，详情可跳转 GitHub 源码目录)
- 原型 `03-detail.js` 详情弹窗重构：新增 2 列元信息区（作者 / 协议 / 版本 / GitHub 目录链接）、授权工具 chips、同类相关技能卡片、复制技能名按钮（含已复制提示）；`i18n.js` 补 `detail.author/license/version/githubDir/tools/related/copyName/copied/unknown` 双语；`components.css` 补 `.detail/.detail-meta/.meta-row/.d-tools/.related-card` 等样式
- app `SkillsExplorer.tsx` 接入详情弹窗（新增 `detail-modal.tsx`，复用 `.dialog` 框架渲染元信息区/相关技能/复制名称）；`lib/skills.ts` 补 `author/license/skillVersion/githubDir` 字段；`globals.css` 补对应样式
- package.json 升至 v1.19.14

## [1.19.13] - 2026-08-21

### feat: 筛选增强——分类多选 + 结果排序

- 分类筛选由单选升级为**多选 OR**（state.cat → state.cats 数组，空=全部；点击 chip 切换选中，非破坏式）
- 新增**排序**下拉（控制区 `#sortSelect`）：名称 A-Z / 名称 Z-A / 按分类 / 按中文名，默认名称 A-Z
- 原型 `02-render.js` 新增 `sortSkills()`，renderGrid 过滤后排序并同步 select 值；`renderCats` 改按 `state.cats.includes` 判断 active
- 原型 `04-interactions.js` 分类点击改 toggle 多选，`clearFilters` 重置 cats+sort；新增 `#sortSelect` change 绑定
- 原型 `index.html` 控制区加排序下拉（含 data-i18n 文案）；`i18n.js` 加 `sort.name/nameDesc/cat/zh` 中英文案；`components.css` 加 `.sort-wrap select` 样式
- app `SkillsExplorer.tsx` 改 `cats` 多选（toggleCat）+ `sort` state + 排序比较器 + 控制区排序 select；`globals.css` 补 `.sort-wrap` 样式与原型对齐
- package.json 升至 v1.19.13

## [1.19.12] - 2026-08-21

### style: 全字段规范重排 SKILL.md 头部注释

- **完整排序方案**（4 段）：①契约字段 `name → description → en_description → zh → category → en_category`；②身份/来源 `displayName → slug → emoji → author → homepage → license → version → compatibility → origin → last_modified`；③能力/调用 `keywords → argument-hint → effort → user-invocable → allowed-tools → disable-model-invocation → hooks → model → risk_level → acceptLicenseTerms → hidden`；④平台嵌套块 `metadata`（最后）
- **执行范围**：148 个技能中 23 个存在乱序被重排，其余已符合或仅含 6 契约字段；块标量（`>`/`|-`）与引号格式零破坏
- **CONTRIBUTING 同步**：字段顺序规范升级为完整推荐顺序参考表，未知字段约定置于 `metadata` 之前
- **校验**：`scripts/validate-skills.mjs` 重排后仍通过 148/148

## [1.19.11] - 2026-08-21

### refactor: 规范 SKILL.md frontmatter 结构与校验门禁

- **P0 冲突键清理**：删除 `cloudbase` 的 `description_zh` / `description_en` 冗余键（与契约 `description`/`en_description` 语义重叠，存在 YAML 覆盖隐患），中文/英文统一由契约字段承载
- **P1.4 字段顺序统一**：148 个技能 frontmatter 的 6 个契约字段统一为 `name → description → en_description → zh → category → en_category`，其余平台/工具元数据（version/metadata/hooks/risk_level 等）原样后置；块标量（`>`/`|-`）与引号格式零破坏
- **P1.3 CONTRIBUTING 规范补全**：明确「展示契约字段」与「平台/工具元数据可选白名单」两类，列明禁止字段（`description_zh`/`description_en`），新增字段顺序规范与 `scripts/validate-skills.mjs` 校验说明、PR 清单项
- **P2 校验脚本**：新增 `scripts/validate-skills.mjs`，CI 门禁检查必填齐全、`category ∈ 9 类`、`en_description` 存在、无冲突键、契约字段顺序、无重复顶层键；运行通过 148/148

## [1.19.10] - 2026-08-21

### docs: 补全 15 个技能的 en_description 双语字段

- **范围**：banner-creator、banner-design、blueprint、google-mobile-ads-banner、implement-spec、openspec-implementation、reddit-automation、woocommerce-backend-dev、wordpress-router、wp-abilities-audit、wp-abilities-verify、wp-patterns、wp-playground、wp-plugin-directory-guidelines、write-tech-spec
- **做法**：原 `description` 英文原文完整迁移至 `en_description`（保留 `>-` / `>` 块标量格式），`description` 改写为中文翻译，实现中英双语对称
- **结果**：`en_description` 覆盖率 133/148 → 148/148（100%），中英切换展示一致
- **全链路同步**：`package.json`→v1.19.10；`build.mjs` 头注释→v1.19.10；`prototype/index.html` 经 `npm run build` 重建（180.5KB）

## [1.19.9] - 2026-08-21

### style: 调大技能卡片名称字号

- **prototype/src/styles/components.css**：`.card-title` 新增 `font-size: 15px; line-height: 1.3`（原继承约 14px），英文原名副标题 `.card-title .en` 11px→12px
- **app/globals.css**：同步上述两处字号调整
- **prototype/index.html** 经 `npm run build` 重建（180.5KB），验证 `font-size: 15px` 已注入

## [1.19.8] - 2026-08-21

### feat: 新增 3 个 WordPress 技能并补全 frontmatter，消除未分类项

- **新增技能（3 个）**：wp-block-themes（WordPress 块主题）、wp-performance（WordPress 性能优化）、wp-plugin-development（WordPress 插件开发），均归入开发框架与平台
- **frontmatter 补全**：3 个技能补齐 `category`/`en_category`/`zh`/`en_description` 字段，全部脱离「其他」分类（OTHER_COUNT=0）
- **9 类计数更新**：开发框架与平台 59→62、AI 与智能体 8→9（共 146 可见技能）
- **全链路同步**：`package.json`→v1.19.8；README/README.en 领域表与开场总数（146）同步；`prototype/index.html` 经 `npm run build` 重建（180.4KB）

## [1.19.7] - 2026-08-21

### feat: 统计数据由 hero 迁入页脚并扩充

- hero 区移除 `#heroStats` 统计块（保留 hero-features 亮点行）
- footer `#footerInner` 新增 `#footerStats` 统计区，4 项指标：技能总数（可见）、分类数、英文描述覆盖数、支持语言数（zh/en=2）
- 原型 `02-render.js` 的 `renderStats()` 重算 4 项（英文覆盖按 `enDescription` 非空）；`i18n.js` 新增 `stat.enCov`/`stat.langs` 中英文案；`layout.css` 新增 `.footer-stats`（flex 平铺 + 虚线分隔）
- app `AppShell.tsx` 用 `useMemo` 计算同样 4 项并渲染 `#footerStats`；`globals.css` 补 `.footer-stats` 样式，与原型对齐
- package.json 升至 v1.19.7

## [1.19.6] - 2026-08-21

### feat: 设置项新增「名称显示」分组并紧凑化设置弹窗

- 名称显示策略 `nameMode`（默认 `both` 双显）：中文态中文名主 + 英文原名弱化副标题；可选「仅中文」「仅英文」
- 原型 `01-state.js` 新增 `NAME_MODE_BOTH/ZH/EN` 常量 + `state.nameMode`（默认 both）、`LS_NAME_MODE` 键；`05-main.js` 用 `loadEnum` 恢复并调用 `applyNameMode()`；`04-interactions.js` 新增 `applyNameMode()` 同步 `<html data-name-mode>`；`03-detail.js` 设置弹窗新增「名称显示」分段组（3 个 `.seg-btn` 单选）并绑定切换；`i18n.js` 补 `settings.nameGroup/nameBoth/nameZh/nameEn` 中英文案
- 原型 `components.css` 补 `data-name-mode` 标题显隐规则（双显中文态 override 全局 `data-lang=zh .en` 隐藏，强制显示英文原名副标题）；`.card-title .en` 仍为 11px 弱化
- 设置弹窗紧凑化：`.block` margin 18→10px、`.settings-row` padding 10→6px 且字号 14→13px、`.dialog-foot` padding 16→12px；新增 `.seg` 分段控件（横向等宽，替代独立 outline 按钮，更省空间）
- app `SkillsExplorer.tsx` 新增 `nameMode` 状态（localStorage 恢复 `ash-name-mode` + 同步 `<html data-name-mode>` 持久化）+ 内联面板「名称显示」分段组；`skill-card.tsx` 接收 `nameMode` 条件渲染 `.card-title`(showZh/showEnSub/en)；`globals.css` 补 `data-name-mode` 规则与 `.seg` 样式，设置面板更紧凑
- 两层 UX 一致：双显中文态中英并列、仅中文只显中文名、仅英文只显英文原名；设置项整体更紧凑
- package.json 升至 v1.19.6

## [1.19.5] - 2026-08-21

### feat: 设置项新增「界面元素」分组（描述/分类标签/分类色条显隐）

- 原型 `prototype/src/parts/01-state.js` 新增 `showDesc/showCat/showBar` 状态与 `ash-show-desc/ash-show-cat/ash-show-bar` 持久化键（默认开启）；`05-main.js` 恢复偏好并调用 `applyUI()`，`04-interactions.js` 新增 `applyUI()` 同步 `<html data-show-*>`；`03-detail.js` 设置弹窗新增「界面元素」分组（3 个开关），`i18n.js` 补中英文案
- 原型 CSS：`components.css` 补 `:root[data-show-{desc,cat,bar}="off"]` 隐藏规则（网格/列表态色条均覆盖）
- app `SkillsExplorer.tsx` 新增 3 个显隐状态（localStorage 恢复+持久化+同步 `<html data-show-*>`）与内联设置面板（`#settingsBtn` 触发），`skill-card.tsx` 接收 `showDesc/showCat/showBar` 条件渲染对应块；`globals.css` 补隐藏规则与设置面板样式
- 两层 UX 一致：关描述→卡片仅标题+分类；关分类标签→仅标题+描述；关色条→卡片去顶部/左侧色条
- package.json 升至 v1.19.5

### fix: 校正技能分类，消除「其他」分类回归 9 大领域

- 补正 15 个缺/错 `category` 的技能 frontmatter（banner-creator/design、google-mobile-ads-banner、implement-spec、reddit-automation、ai-image-generation、blueprint、openspec-implementation、wordpress-router、wp-abilities-audit/verify、wp-patterns、wp-playground、wp-plugin-directory-guidelines、write-tech-spec、woocommerce-backend-dev），统一归入 9 个稳定分类键
- 删除 `ai-image-generation-2` 重复废弃副本（违反单一数据源红线）
- `data/skills-data.json` 由 10 类（含「其他」）回到 9 类，可见技能 144 个
- README 中/英计数由 125/130 修正为 144，概览句补全 9 类领域

## [1.19.4] - 2026-08-21

### fix: 重建 app 客户端卡片层并应用双语标题+列表布局修复

- 并行会话删除 `app/app/components/*` 后未重建，导致 `app/page.tsx` import 失效、app 无法运行；本次在 `app/components/` 下重建 `AppShell`/`SkillsExplorer`/`skill-card`（最小可用，跳过设置弹窗/详情弹窗）
- **卡片双名**：`skill-card.tsx` 输出 `.card-title .zh`(中文译名主)+`.en`(英文原名弱化副标题)，中文态同显，对齐原型 v1.19.3 双语契约
- **列表布局修复**：卡片加 `.card-body` 包裹层；`globals.css` 补 `.card-body{flex:1;min-width:0}` 与列表态 `.grid.list .card-desc` 限 1 行、`avatar.sm{flex:none}`，消除横向挤压错位
- 数据路径修复：`app/data/skills-data.json`（由 `app/lib/skills.ts` 读取）；`page.tsx` 改为传整体 `data`；`AppShell` 接收 `data`+`version`，页脚展示版本号
- 补充 `.icon-btn`(语言切换)/`.footer-version` 样式；TS 类型检查通过（`app/components/*` 零错误）
- package.json 升至 v1.19.4

## [1.19.3] - 2026-08-21

### style: 卡片双语标题与列表模式布局修复

- **中文态双名**：卡片标题区保持中文译名（主）+ 英文原名（弱化副标题 `.card-title .en`）同时显示，符合 v1.18.1 双语契约
- **新增 .card-body 包裹层**：将 title-row / card-desc / card-cat 包入 `.card-body`，列表模式 `.grid.list .card`（flex-row）下内容不再被横向挤压错位——`.card-body` 占满剩余宽度（flex:1; min-width:0），内部纵向排布
- **列表态描述限行**：`.grid.list .card-desc` 限制 1 行截断（`-webkit-line-clamp:1`），避免长描述撑破行高；avatar 加 `flex:none` 固定不被压缩
- **同步范围**：`prototype/src/parts/02-render.js`（结构）+ `prototype/src/styles/{components,layout}.css`（布局）；`npm run build` 重建 `prototype/index.html`
- **版本同步**：`package.json` 升至 v1.19.3

## [1.19.2] - 2026-08-21

### feat: 新增 6 个技能并补全 frontmatter，消除未分类项

- **新增技能（6 个）**：executing-plans、writing-plans、planning-with-files（归入开发框架与平台）、marketing-plan（文档与内容）、recipe-plan-weekly-schedule（自动化与集成）、remotion-best-practices（音视频与多媒体）
- **frontmatter 补全**：6 个技能补齐 `category`/`en_category`/`zh`/`en_description` 字段，全部脱离「其他」分类（OTHER_COUNT=0）
- **解析器修复**：`build-skills-data.mjs` 的 `parseFrontmatter` 仅识别顶层键、跳过嵌套块（如 `metadata.openclaw.category`），避免 `recipe-plan-weekly-schedule` 的 `metadata` 内 `category: "recipe"` 误读为分类
- **9 类计数更新**：开发框架与平台 56→59、文档与内容 11→12、音视频与多媒体 9→10、自动化与集成 9→10（共 130 可见技能）
- **全链路同步**：`package.json`→v1.19.2；README/README.en 领域表与开场总数（130）同步；`prototype/index.html` 经 `npm run build` 重建

## [1.19.2] - 2026-08-21

### docs: 同步项目规范与文档至 v1.19.2 对齐现状

- **openspec 三文档版本**：`project.md`/`spec.md`/`AGENTS.md` 由 v1.14.61 升至 v1.19.2（此前长期未随发版更新）
- **技术栈修正**：openspec 与 app/README 中 React 18 更正为 React 19，对齐 `app/package.json`（`react`/`react-dom` `^19.2.8`）
- **构建脚本引用修正**：openspec `project.md` 中失效的 `build_site.py` 引用改为实际根脚本 `build.mjs` / `build-skills-data.mjs`
- **app 目录结构更新**：`app/app/` 嵌套路由已扁平化至 `app/` 根（`page.tsx`/`layout.tsx`/`globals.css`），重寫 `app/README.md` 与 openspec §2 目录表
- **分类体系对齐**：openspec 与 README.en 中残留的「5 类 / 5 domains」表述统一为 9 大领域（125 技能）
- **版本同步**：`package.json` 升至 v1.19.2，README 中/英徽章、`.github/CONTRIBUTING.md`、`prototype/DESIGN.md` 头注释同步；`npm run build` 注入 footer v1.19.2

## [1.19.0] - 2026-08-21

### feat: 新增 4 个平行分类维度，扩展技能领域体系

- **新增分类**（从既有 5 类扩展为 9 类）：`AI 与智能体`(AI & Agents)、`音视频与多媒体`(Media & Multimedia)、`自动化与集成`(Automation & Integration)、`安全`(Security)
- **重归类 32 个技能**：跨类技能按语义归入新维度（如 agent-development/eve/google-agents-cli-* 归入 AI 与智能体；ai-video-generation/ai-music/remotion/video 等归入音视频与多媒体；twitter-api/instagram-api/workflow/windows-ui-automation 等归入自动化与集成；better-auth/fix-sentry-issues/safe-debug/clerk 归入安全）
- **9 类计数**：品牌与设计 21 / 文档与内容 11 / 数据分析与可视化 2 / 开发框架与平台 56 / 文件与格式处理 4 / AI 与智能体 8 / 音视频与多媒体 10 / 自动化与集成 10 / 安全 4（共 125 可见）
- **全链路同步**：`build-skills-data.mjs` 分类动态追加（未知分类自动末位）；`prototype/index.html` 与 `app`（读根 `data/skills-data.json`）经 `npm run build` 自动带 9 分类；展示层 `categoryEn` 映射动态生成
- **文档同步**：README/README.en 领域表（9 类）、开场文案（9 domains）、CONTRIBUTING 分类清单、头注释与版本徽章同步至 v1.19.0

## [1.18.3] - 2026-08-21

### style: 优化页眉 logo 品牌区视觉层级

- **品牌名衬线化**：主名「Agent Skills Hub」改用衬线 `--font-display`（17px/700/字距 -.01em），符合 DESIGN §2.2/§8.6，与无衬线正文形成层级对比
- **两行层级结构**：新增 `.brand-text` 容器，主名 + 副标题（11px/`--text-2`/弱化）分两行清晰呈现，副标题长文本 ellipsis 防溢出
- **logo 质感提升**：30×30 圆角底 + 极淡主绿光晕 `box-shadow`(.28)，hover `scale(1.06)` 微缩放 + 光晕加深(.42)，过渡 0.25s；尊重 `prefers-reduced-motion`
- **同步范围**：`prototype/src/index.html`+`layout.css` 与 `app/app/AppShell.tsx`+`globals.css`；`prototype/DESIGN.md` §8 版本标注与 §8.6 使用约定同步
- **版本同步**：`package.json` 升至 v1.18.3，被改文件头注释同步；`npm run build` 注入 footer v1.18.3

## [1.18.2] - 2026-08-21

### perf: 修复依赖一致性并按 React/Next 性能最佳实践优化渲染

- **依赖修复**：`app/package.json` 中 `react-dom` 由 `^18.3.0` 统一至 `^19.2.8`，`@types/react-dom` 同步至 `^19.2.18`，消除与 React 19 reconciler 不兼容的运行时崩溃风险
- **配置清理**：`app/next.config.mjs` 移除 React 19 下已弃用且失效的 `reactStrictMode` 字段，补充 `images.formats`（avif/webp）优化占位
- **渲染优化**：`SkillsExplorer` 将分类计数预计算为 `useMemo`（`catCount`），避免渲染期对每个分类重复 `skills.filter()` 全量遍历（语言切换/每次 render 不再重算）
- **版本同步**：`package.json` 升至 v1.18.2，被改文件头注释同步；`app/package.json` 升至 v1.1.14

## [1.18.1] - 2026-08-21

### feat: 中文态标题同时显示英文原名与中文译名（原型 + app 同步）

- **卡片标题双语言**：中文态下 `.card-title` 显示中文译名（主，font-weight:600）+ 英文原名（副，11px 弱化 `--text-2`、margin-top:2px）；英文态恢复仅英文原名为主标题（由全局 `[data-lang=en] .zh` 隐藏中文译名）
- **详情弹窗副标题**：中文态 `.sub.en` 弱化为副标题展示英文原名；英文态隐藏（避免英文名重复）
- **选择器提权**：用 `:root[data-lang="zh"] .card-title .en` / `:root[data-lang="zh"] #dialog .sub.en` 权重 (0,3,0) 覆盖全局 `html[data-lang=zh] .en{display:none}` (0,2,0)，确保中文态英文副名可见
- **同步范围**：`prototype/src/styles/components.css` + `app/app/globals.css`；描述区 `.card-desc .zh/.en` 仍互斥（仅标题双显，符合需求）
- **版本同步**：`package.json` 升至 v1.18.1，改动 CSS 头注释同步；`npm run build` 注入 footer v1.18.1

## [1.18.0] - 2026-08-21

### fix: 第四轮补全 14 个新技能 frontmatter 消除「其他」分类

- **补全字段**：为 `ai-research-reproduction`、`code-review-and-quality`、`debugging-and-error-recovery`、`flux-kontext`、`google-agents-cli-adk-code`、`google-agents-cli-workflow`、`insforge-debug`、`receiving-code-review`、`requesting-code-review`、`review-animations`、`safe-debug`、`shadcn-ui`、`systematic-debugging`、`ui-ux-pro-max` 补齐 `category` / `en_category` / `zh` / `description`(中文) / `en_description`(英文) 字段；其中 `flux-kontext`/`review-animations`/`ui-ux-pro-max` 归入品牌与设计，其余归入开发框架与平台
- **消除「其他」分类**：「其他」分类归零，5 大领域稳定；技能总数 122（可见 122，hidden 1，共 123 目录）
- **数据重建**：`npm run build` 重建 `data/skills-data.json`，同步 `prototype/index.html` 与 `app/app/data/skills-data.json`；README/README.en 技能总数（122）对齐

### fix: 第五轮补全 4 个未翻译技能 frontmatter 消除「其他」分类

- **补全字段**：为 `code-review`（开发框架与平台）、`grill-me`/`grill-with-docs`/`grilling`（文档与内容）补齐 `category` / `en_category` / `zh` / `description`(中文) / `en_description`(英文) 字段
- **全量翻译校验通过**：所有 122 个可见技能的 `description` 均为中文、均含 `zh` 与 `en_description`，「其他」分类归零

### fix: 第六轮补全 3 个 WinUI 技能 frontmatter 消除「其他」分类

- **补全字段**：为 `windows-ui-automation`、`winui-dev-workflow`（开发框架与平台）、`winui-design`（品牌与设计）补齐 `category` / `en_category` / `zh` / `description`(中文) / `en_description`(英文) 字段；`windows-ui-automation` 的 `risk_level`/`model` 额外字段保留
- **全量翻译校验通过**：所有 125 个可见技能的 `description` 均为中文、均含 `zh` 与 `en_description`，「其他」分类归零；README/README.en 技能总数（125）对齐

### feat: 完善设置弹窗（新增视图模式与显示密度选项）

- **设置项扩充**：设置弹窗在原有「语言 / 主题」基础上新增「布局（网格 / 列表）」与「密度（舒适 / 紧凑）」两组切换
- **视图模式持久化**：`state.view` 写入 `localStorage`（键 `ash-view`），`init()` 启动时恢复并同步顶栏 `.view-btn` 的 active 态
- **显示密度**：新增 `state.density`（comfortable / compact），通过 `<html data-density>` 驱动 CSS 间距（卡片内边距、色条外边距、网格 gap），写入 `localStorage`（键 `ash-density`）
- **无障碍**：两组选项均为 `<button aria-pressed>`，切换后由 `refreshSettingsBody()` 就地刷新双语文案（不重建弹窗，避免焦点陷阱监听累积）
- **i18n**：`i18n.js` 新增 `settings.viewGroup/view/viewGrid/viewList/densityGroup/density/densityComfortable/densityCompact` 中英文案
- **版本同步**：`package.json` 升至 v1.18.0，6 个改动源文件头注释同步；`npm run build` 注入 footer v1.18.0

### refactor: app 层对齐原型（同版本 v1.18.0）

补齐 app（Next.js 实现）相对 prototype 的对齐缺口（code-review 双轴审查发现）：
- **设置弹窗**：新增 `app/app/components/ui/settings-dialog.tsx` + 顶栏 `#settingsBtn` 齿轮按钮，聚合语言/主题/视图/密度四组（复用 Dialog 焦点陷阱）
- **显示密度**：`AppShell` 新增 `density` 状态（`ash-density` 持久化 + `<html data-density>`），`globals.css` 补 `:root[data-density="compact"]` 间距规则
- **视图持久化**：view 状态提升至 `AppShell` 统一持有（`ash-view` 恢复/写回），设置弹窗与顶栏 ViewToggle 同步切换
- **搜索防抖 + composition 拦截**：`SkillsExplorer` 输入 120ms 防抖，中文/日文输入未落定时不触发过滤（对齐原型）
- **结果计数 + 回到顶部**：新增 `#resultCount`（`aria-live` 实时播报）与 `#toTop`（滚动阈值显示）
- **原生 button 卡片**：`skill-card.tsx` 由 `role="button"+tabIndex` 改为原生 `<button>`
- **焦点陷阱**：`ui/dialog.tsx` 补 Tab 循环陷阱（对齐原型 `trapFocus`）
- **a11y 修复**：`i18n.ts` 补 `a11y.lang`/`a11y.theme` 等键（修复 LangToggle/ThemeToggle aria-label 显示 key 原文）；`skill-detail.tsx` zh 缺失回退 name
- **规范同步**：app 下 11 个源文件头注释统一至 v1.18.0；`tsc --noEmit` 通过

## [1.17.4] - 2026-08-21

### fix: 补全技能 frontmatter 消除「其他」分类、清理重复描述并重建数据

- **补全字段**：为 `bun`、`chrome-webstore-release-blueprint`、`favicon`、`find-skills-2`、`fix-sentry-issues`、`limrun-android-emulator`、`limrun-detox-testing`、`limrun-ios-simulator`、`limrun-xcode`、`limrun-xcode-bazel`、`logo-creator`、`logo-designer`、`muapi-3d-logo-animation`、`muapi-logo-creator`、`react-doctor`、`svg-logo-designer`、`logo-animation` 17 个技能补齐 `category` / `en_category` / `zh` / `description`(中文) / `en_description`(英文) 字段
- **消除「其他」分类**：此前这些技能缺 `category` 归入「其他」，补全后回归 5 大领域（品牌与设计 17 / 文档与内容 13 / 数据分析与可视化 1 / 开发框架与平台 48 / 文件与格式处理 4）
- **清理重复 `description`**：上述部分技能 frontmatter 存在重复的英文 `description` 键（位于 `en_description` 之后），解析器取末值导致默认描述变回英文；已移除重复键，确保 `description` 为中文、`en_description` 为英文
- **名称与翻译修正**：`find-skills-2` 名称去重为 `find-skills-2`；`svg-logo-designer` 名称统一为 `svg-logo-designer`；`instagram-api` 的 `description` 翻译为中文，与默认中文展示保持一致
- **数据重建**：`node build-skills-data.mjs` 重建 `data/skills-data.json`，技能总数 82（可见 82，hidden 1，共 83 个目录），无「其他」分类；`npm run build` 同步 `prototype/index.html` 与 `app/app/data/skills-data.json`
- **版本同步**：`package.json` 升至 v1.17.4，README/README.en 技能总数（82）、领域表计数与版本徽章对齐

### fix: 第二轮补全 24 个新技能 frontmatter 消除「其他」分类

- **补全字段**：为 `analyze-project`、`codebase-design`、`diagnosing-bugs`、`domain-modeling`、`paper-context-resolver`、`prototype`、`repo-intake-and-plan`、`tdd`、`to-spec`（开发方法论）、`twitter-automation`（文档）、`insforge-cli`、`tiktok-api`、`traceknot`、`vue-best-practices`、`vue-debug-guides`、`vue-pinia-best-practices`、`vue-router-best-practices`、`better-auth-best-practices`、`remotion-best-practices`、`supabase-postgres-best-practices`、`fastify-best-practices`、`flutter-apply-architecture-best-practices`、`nestjs-best-practices`、`stripe-best-practices`、`uni-app`（开发框架）、`wechat-article-writer`（文档）共 26 个技能补齐 `category` / `en_category` / `zh` / `description`(中文) / `en_description`(英文) 字段
- **消除「其他」分类**：分多批补全后「其他」分类归零，5 大领域计数为：品牌与设计 17 / 文档与内容 15 / 数据分析与可视化 1 / 开发框架与平台 70 / 文件与格式处理 4
- **数据重建**：`npm run build` 重建 `data/skills-data.json`（total 106，可见 106，hidden 1，共 107 目录），同步 `prototype/index.html` 与 `app/app/data/skills-data.json`；README/README.en 技能总数（106）、领域表计数对齐

### fix: 第三轮补全 2 个新技能 frontmatter 消除「其他」分类

- **补全字段**：为 `football-data`（数据分析与可视化）、`sports-news`（文档与内容）补齐 `category` / `en_category` / `zh` / `description`(中文) / `en_description`(英文) 字段
- **消除「其他」分类**：「其他」分类归零，技能总数 108（可见 108，hidden 1，共 109 目录）；README/README.en 技能总数（108）对齐

## [1.17.3] - 2026-08-21

### feat: 补全 8 个新技能 frontmatter 并重建技能数据

- **补全字段**：为 `eve`、`improve-codebase-architecture`、`handoff`、`orca-cli`、`setup-matt-pocock-skills`、`vercel-composition-patterns`、`lark-meeting`、`twitter-api` 8 个新技能补齐 `category` / `en_category` / `zh` / `description`(中文) / `en_description`(英文) 字段
- **消除「其他」分类**：此前这些技能缺 `category` 归入「其他」，补全后回归 5 大领域（品牌与设计 12 / 文档与内容 12 / 数据分析与可视化 1 / 开发框架与平台 34 / 文件与格式处理 4）
- **数据重建**：`node build-skills-data.mjs` 重建 `data/skills-data.json`，技能总数 55 → 63（可见 62，hidden 1）
- **文档同步**：README/README.en 技能总数（55→63）、领域表计数、版本徽章升至 v1.17.3
- **版本同步**：`package.json` 升至 v1.17.3

## [1.16.2] - 2026-08-21

### feat: category 增加英文 en_category，英文态分类名本地化

- **字段新增**：55 个 `SKILL.md` frontmatter 增加 `en_category`（英文分类名），`category`（中文）保留为稳定键
- **数据契约**：`build-skills-data.mjs` 输出每技能 `enCategory`（英文分类名）+ 顶层 `categoryEn`（中文→英文映射）；`total=54`、5 大分类不变
- **原型展示**：`02-render.js`（chip + 卡片分类名）、`03-detail.js`（详情分类名）英文态 `.en` 显示 `enCategory`，中文态 `.zh` 显示 `category`；搜索 haystack 加入 `enCategory`
- **app 展示**：`skills.ts` 类型加 `enCategory`/`categoryEn`，`SkillsExplorer` chip、`skill-card`、`skill-detail` 英文态显示英文分类名
- **版本同步**：`package.json` 升至 v1.16.2，README/README.en 徽章、CHANGELOG 顶部对齐

## [1.16.1] - 2026-08-21

### refactor: SKILL.md description 中文化，默认展示中文

- **字段契约调整**：`SKILL.md` frontmatter 的 `description` 由「英文原文」改为「中文完整描述」（默认展示语言），英文原文迁移至新增 `en_description` 字段；删除冗余 `zh-desc`
- **批量改写 55 个 SKILL.md**：`description` ← 原 `zh-desc`（中文），`en_description` ← 原 `description`（英文），`zh` 一句话摘要保留
- **数据契约**：`build-skills-data.mjs` 输出 `description`（中文）+ `enDescription`（英文），取代 `zhDesc`；数据 `total=54`、5 大分类无「其他」
- **原型展示**：`02-render.js` / `03-detail.js` 中文态默认展示 `description`，英文态展示 `enDescription`；搜索 haystack 覆盖中英描述
- **app 展示**：`skills.ts` 类型 `zhDesc`→`enDescription`，`skill-card` / `skill-detail` / `SkillsExplorer` 同步
- **文档同步**：README/README.en、`.github/CONTRIBUTING`、`PULL_REQUEST_TEMPLATE`、`openspec/spec`、`openspec/project` 更新 frontmatter 字段说明
- **版本同步**：`package.json` 升至 v1.16.1，README/README.en 徽章、CHANGELOG 顶部对齐

## [1.16.0] - 2026-08-21

### fix: 修复卡片技能描述误入技能名称的 bug

- **根因**：源 `skills/<name>/SKILL.md` 的 `zh` frontmatter 语义应为「简短中文名称」（卡片标题），但 30 个技能误将完整描述句填入 `zh`，导致卡片标题区显示成描述文字
- **修复**：将 30 个过长的 `zh` 浓缩为简短中文标题（如 `brainstorming` →「头脑风暴」），原描述内容保留在 `zh-desc`（卡片描述区），描述信息无丢失
- **数据重建**：`node build-skills-data.mjs` 重建 `data/skills-data.json`
- **约定明确**：修正 `build-skills-data.mjs` 头注释，明确 `zh`=简短中文名称、`zh-desc`=中文描述，防止再次误填
- **版本同步**：`package.json` 为权威源 v1.16.0，README/README.en 版本徽章、CHANGELOG 顶部对齐

## [1.14.72] - 2026-08-20

### fix: 修复 CI 找不到 prototype/build-skills-data.mjs 报错

- **根因**：CI 历史配置硬编码调用 `node prototype/build-skills-data.mjs`，但权威脚本已迁移至仓库根目录（`build-skills-data.mjs`），`prototype/` 下无该文件导致 `MODULE_NOT_FOUND`
- **修复**：新增 `prototype/build-skills-data.mjs` 作为兼容转发层，复用根目录权威脚本（单一数据源，无逻辑重复）
- **附带提交**：app 组件重构（skill-card / skill-detail / ui 子组件库、catHue、i18n、types 抽离）、prototype 构建产物同步
- **版本同步**：`package.json` 升至 v1.14.72，新建文件头注释同步

## [1.14.71] - 2026-08-20

### feat: app 与原型对齐（卡片描述语言互斥、cat-bar 动态色、多词搜索、偏好持久化）

- **数据同步**：`app/scripts/sync-data.cjs` 同步根 `data/skills-data.json` 至 app（49 skills + 新增 `zhDesc` 中文描述字段）
- **Skill 接口**：`lib/skills.ts` 补 `zhDesc?: string` 字段
- **Hero 节点网**：`AppShell.tsx` 节点连线改用 `--line`、节点改用 `--node`（对齐原型，非主绿）；`globals.css` `.hero-net` 透明度提至 `.68`
- **cat-bar 动态色**：`globals.css` 删固定 0-8 色板，`.card .cat-bar` 改用 `--hue`（catHue 派生，与 chip 同分类同色）；`SkillsExplorer.tsx` 卡片内联 `--hue`
- **卡片描述语言互斥**：`SkillsExplorer.tsx` 标题按语言（中文名/英文名）切换，新增 `.card-desc` 中文态显示 `zhDesc`、英文态显示 `description`（对齐原型 cardHTML）
- **多词搜索**：`SkillsExplorer.tsx` 搜索改为空格分词 AND 匹配（对齐原型 matches）
- **偏好持久化**：`AppShell.tsx` 主题/语言改用 localStorage（key `ash-theme`/`ash-lang`，与原型 01-state 兼容），并同步 `data-lang` 到 `<html>`
- **"全部" chip 色相**：由 220 改为主绿 152（对齐原型）
- **版本同步**：根 `package.json` 及 4 个 app 被改文件头注释、README/README.en 徽章升至 v1.14.71

## [1.14.70] - 2026-08-20

### docs: 新增 .github Community Health Files

- **补全 `.github/` 社区健康文件**（GitHub 优先读取 `.github/` 作为单一来源），消除此前 README/README.en「相关文档」对缺失文件的死链：
  - [`CONTRIBUTING.md`](.github/CONTRIBUTING.md)：仓库速览、环境准备、新增/更新技能规范、SKILL.md frontmatter 要求、数据与构建、版本一致性、提交规范（Conventional Commits）、PR 流程
  - [`CODE_OF_CONDUCT.md`](.github/CODE_OF_CONDUCT.md)：Contributor Covenant 2.1 行为准则（含执行准则）
  - [`SECURITY.md`](.github/SECURITY.md)：受支持版本、私密漏洞报告渠道（GitHub Security Advisory）、处理流程与项目安全红线（无密钥/输入校验/依赖审计/HTTPS）
  - [`SUPPORT.md`](.github/SUPPORT.md)：使用问题、Bug/功能、安全漏洞、FAQ 的分类指引
  - [`PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)：提交信息规范 + 一致性检查清单
  - [`ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/)：`bug_report.yml`、`feature_request.yml`、`config.yml`（禁用空白 Issue，引导安全与讨论到对应渠道）
- **版本同步**：根 `package.json`、README/README.en 徽章、CHANGELOG 升至 v1.14.70；新文件头标注路径与版本号

## [1.14.69] - 2026-08-20

### feat: 全面突出项目特点优势（开源推广 + 技能消费者）

- **README/README.en 首屏新增「项目亮点 / Highlights」区块**：聚合 5 大核心卖点（零维护清单、48 技能·5 大领域、中文本地化、一键安装、离线可用），访客几秒读懂「为什么用」
- **原型 Hero 强化价值主张**：`heroStats` 后新增 `hero-features` 标签条（⚙️ 零维护清单 · 🌏 中文本地化 · 🚀 离线可用），首屏传递核心差异点
- **社交分享横幅加数据徽标**：`app/public/banner-og.svg` 新增「48 Skills · 5 Domains · Offline-ready」数据徽标行；`app/public/banner.svg` 副标题区新增「48 Skills · 5 Domains · Offline-ready」紧凑文案，让社交分享直接传达规模卖点
- **安装引导重构为双路径**：先引导到展示页挑技能，再分「方式 A 手动复制 / 方式 B skills-manager 一键」，降低试用门槛
- **版本同步**：根 `package.json` 及被改文件头注释（prototype/src/index.html、styles/layout.css、banner-og.svg、banner.svg）、README/README.en 徽章升至 v1.14.69

## [1.14.68] - 2026-08-20

### fix: 原型 UI 问题修复与视觉改进

- **B1 sticky 悬空间隙**：`.controls` 的 `top` 由 56px（desktop）/52px（mobile）改为 52px/48px，与 `.topbar` 实际高度一致，消除滚动时二者之间的 4px 空隙
- **A1 中文标题字体**：`--font-display` 中文 fallback 由宋体（Songti/STSong）改为系统黑体（PingFang SC / Microsoft YaHei / Noto Sans SC），中文 hero/卡片标题不再用细宋体，中英混排更清晰统一
- **A2 hero 节点网提亮**：`.hero-net` 静态透明度由 `.5` 提到 `.68`，hover 到 `.9`，让签名节点网在首屏更可见
- **B2 移动端视图切换**：`max-width:640px` 下隐藏 `.view-toggle`（移动端 grid/list 视觉相同，避免无效控件）
- **D1 cat-bar 动态色**：`.cat-bar` 由固定 0-8 色板改为 `catHue(category)` 派生的 `--hue`（与分类 chip 同色），任意分类均有色，不再受固定色板数量限制
- **版本同步**：根 `package.json` 及 5 个被改文件头注释、README/README.en 徽章升至 v1.14.68

## [1.14.67] - 2026-08-20

### feat: 卡片描述按当前语言互斥显示

- `02-render.js` `cardHTML` 卡片新增 `.card-desc` 描述区，标题与描述均以 `.zh`/`.en` 双节点按语言互斥渲染：中文态显示中文名 + 中文描述（`zhDesc`），英文态显示英文名 + 英文描述（`description`）
- `components.css` 新增 `.card-desc` 样式（最多 2 行截断），移除旧的 `.card-sub` 规则
- 版本同步：根 `package.json` 及 `02-render.js`/`components.css` 头注释、README/README.en 徽章升至 v1.14.67

## [1.14.66] - 2026-08-20

### fix: 修复原型逻辑缺陷（init 误埋点、事件绑定健壮性、多词搜索、模板注入防护、chip 色）

- **移除 init 误触发埋点**：`04-interactions.js` 的 `applyTheme`/`applyLang` 内不再调用 `track("toggle_theme")`/`track("toggle_lang")`（此前页面加载时 `init()` 会误上报一次"切换主题/语言"污染 GA；对齐 app `analytics.ts` 仅埋点 search/filter/view/share）
- **事件绑定空值保护**：`bind()` 改用 `on()` 空值安全绑定，单一节点（themeBtn/langBtn 等）缺失时不再抛错中断其余全部交互
- **多词 AND 搜索**：`01-state.js` `matches()` 按空白拆分多词，全部命中才返回（如"flutter 布局"需同时命中 flutter 与布局），提升检索可用性
- **模板注入防护**：`esc()` 补转义反引号 `` ` `` 与 `${`，防止技能名/描述/分类含此类字符时破坏模板字符串或引入注入（数据来自本地 SKILL.md，属纵深防御）
- **"全部" chip 色相统一**：`02-render.js` 全部 chip 的 `--hue` 由 220（蓝）改为主绿 152，与页面主色协调
- **版本同步**：根 `package.json` 及 3 个被改文件头注释、README/README.en 徽章升至 v1.14.66

## [1.14.65] - 2026-08-20

### fix: 修复原型 UI 问题（弹窗显示、按钮样式、空状态、遮罩令牌、无障碍）

- **弹窗显示修复**：`03-detail.js` 弹窗遮罩/对话框统一使用 `show` 类驱动（此前 `open`/`show` 类名不匹配导致弹窗无法打开；该修复 HEAD 侧已由并发进程补齐，构建产物确认 `.overlay.show`/`.dialog.show` 均生效）
- **视图切换样式**：`components.css` 补 `.view-toggle`/`.view-btn`（网格/列表图标按钮，active 态主色高亮），修复切换按钮无样式、以原始按钮形态显示的问题
- **列表视图**：`layout.css` 新增 `.grid.list`（单列 + 卡片横向排布 + 左侧色条），使 `view-toggle` 的 list 态有真实布局
- **空状态**：`.empty-state` 补 `grid-column: 1/-1`（grid 内横跨整行居中）+ 明确 `.empty-title`/`.empty-desc` 层级
- **遮罩令牌化**：`.overlay` 背景由硬编码 `rgba(15,23,42,.5)` 改为 `hsl(var(--shadow-color) / .5)` + `backdrop-filter`，对齐令牌体系
- **按钮补全**：`components.css` 补 `.btn-ghost`（透明底幽灵按钮），供弹窗分享按钮/空态清除按钮使用
- **无障碍**：`04-interactions.js` 在语言切换时动态更新 hero 的 `aria-labelledby`（en 模式指向 `heroTitleEn`，避免指向被 CSS 隐藏的 zh 标题）
- **清理死代码**：移除 `layout.css` 遗留 `.empty`、responsive 中失效的 `.card .desc` 规则；搜索图标补 `.icon` 类使半透明样式生效
- **版本同步**：根 `package.json` 及 5 个被改文件头注释、README/README.en 徽章升至 v1.14.65

## [1.14.64] - 2026-08-20

### fix: 清除 13 个 SKILL.md 的 Git 冲突标记，消除技能数据重复

- **冲突清理**：`skills/` 下 13 个 SKILL.md 因自动备份工具混入 Git 冲突标记（`<<<<<<< HEAD`/`=======`/`>>>>>>>`），导致 `build-skills-data.mjs` 解析出错误 frontmatter（如 `ai-video-generation` 与 `ai-video-generation-2` name 重复、category 丢失）。已按既定决策「保留本地 HEAD 侧」清除全部冲突标记，保留完整中文元数据（category/zh/zh-desc）
- **换行统一**：13 个文件由 CRLF 统一为 LF，消除 Windows 行尾对构建解析的干扰
- **数据验证**：重新 `npm run build` 后 49 技能 / 5 分类，`ai-video-generation` 重复消除，冲突标记清零，`zhDesc` 覆盖 49/49；`total=48`（agent-browser 为 hidden，设计行为）
- **版本同步**：根 `package.json` → v1.14.64；README/README.en 徽章、CHANGELOG 同步

## [1.14.63] - 2026-08-20

### fix: 修复 SKILL.md 头部插入的中文描述（zh-desc）展示不换行

- **构建脚本**：`build-skills-data.mjs` 对 YAML 块标量的解析区分折叠（`>`）与字面量（`|`）——折叠标量段内换行折叠为空格、**空行分隔的段落之间保留换行 `\n`**；字面量标量保留所有换行，使多段中文描述能进入 `data/skills-data.json` 的 `zhDesc`
- **数据落库**：为 11 个超长 `zh-desc`（≥150 字，如 agent-browser、ai-avatar-video、ai-image-generation、xlsx、image-to-video、video-edit、wp-playground 等）按语义断点（`。`/`；`）拆分为多个自然段落；仅含单句的长描述（如 supabase-postgres-best-practices、agent-development）保持单段，避免破坏语法
- **原型展示**：`components.css` 新增 `.zh-desc { white-space: pre-line }`，让详情弹窗中的多段中文描述按段落换行显示
- **版本同步**：根 `package.json` → v1.14.63；README/README.en 徽章、`build-skills-data.mjs`/`components.css` 头注释同步更新

## [1.14.62] - 2026-08-20

### feat: 原型优化并与 app 代码对齐（Hero 节点网 + 卡片分类色条 + 多色 chip）

- **令牌同步**：`prototype/src/styles/tokens.css` 补 `--node`/`--line` 节点令牌（浅 `152 58% 56%`/`152 40% 82%`、深 `146 52% 62%`/`146 30% 34%`），经 `build.mjs` 自动同步至 `app/app/tokens-shared.css`，消除 app `globals.css` 引用 `var(--node)` 无值的问题
- **Hero 升级**：`prototype/src/index.html` hero 由纯文本 + 3 统计改为签名节点网（`.hero-net` SVG 呼应品牌 Hub）+ `.hero-eyebrow` + thesis 标题（`<span class="accent">` 强调）+ 2 统计（可见技能数/分类数），对齐 app `AppShell.tsx`（DESIGN §4.1.1）
- **卡片结构对齐**：`02-render.js` `cardHTML` 由 `.top/h3/.desc/.tags` 改为 `.cat-bar`（分类色条，`data-cat` 序号）+ `.title-row`（`.avatar.sm` + `.card-title` 中文名）+ `.card-sub.en`（英文名）+ `.card-cat`，对齐 app `SkillsExplorer.tsx`；`components.css` 新增 cat-bar 0-8 色板
- **多色 chip**：`renderCats` 按分类派生 `--hue`（新增 `catHue()` 算法，与 app 一致），chip 由单一主色改为按分类着色
- **弹窗对齐**：`03-detail.js` 弹窗头部改用 `zh||name` 作标题 + `.sub.en` + `.dialog-cat` + `.dialog-close`，对齐 app `SkillDialog.tsx`
- **i18n 调整**：`hero.eyebrow` 新增；`hero.title` 改 thesis 文案；移除 `stat.shown`（hero 仅 2 统计）
- **版本同步**：根 `package.json` 及 9 个被改文件头注释、README/README.en 徽章升至 v1.14.62

## [1.14.61] - 2026-08-20

### feat: 处理技能时同步翻译 description 为中文（新增 zh-desc 字段）

- **数据契约扩展**：`SkillEntry` 新增 `zhDesc`（`description` 的完整中文译文），由 `build-skills-data.mjs` 从各 `SKILL.md` frontmatter 的 `zh-desc` 字段读取；`zh-desc` 为**必填**前置元数据，处理技能时必须将英文 `description` 翻译为中文写入，区别于一句话摘要 `zh`
- **构建脚本**：`build-skills-data.mjs` 解析 `zh-desc` → 输出 `zhDesc` 至 `data/skills-data.json`
- **原型展示**：详情弹窗中文描述区块（`dialogBlockZh`）追加 `.zh-desc` 完整译文；卡片渲染在 `.desc.zh` 一句话摘要后追加 `.desc.zh-desc`（有则显示）
- **数据落库**：为 49 个技能目录的 `SKILL.md` 补齐 `zh-desc` 中文译文；为 `clerk-nextjs-patterns`/`code-review`/`nextjs-app-router-patterns`/`nextjs-code-review`/`video`/`video-editing` 6 个缺字段技能补 `category`/`zh`，消除「其他」分类；重建后 49 技能 / 5 分类（品牌与设计 8 / 文档与内容 11 / 数据分析与可视化 1 / 开发框架与平台 25 / 文件与格式处理 4）
- **规范文档同步**：`openspec/spec.md` §2.1/§2.3、`openspec/project.md` §4.5.2、`prototype/DESIGN.md` §6、`README.md` 贡献指南均补充 `zh-desc` 必填与翻译要求；README/README.en 领域表计数同步至当前真实值
- **版本同步**：根 `package.json` → v1.14.61；README/README.en 徽章、`build-skills-data.mjs`/`03-detail.js`/`02-render.js` 头注释与各被改规范文档头版本升至 v1.14.61

## [1.14.60] - 2026-08-20

### fix: 修复代码审查问题并消除类型/规范漂移

- **Skill 类型补全**：`lib/skills.ts` 的 `Skill` 接口补 `hidden?: boolean`，修复渲染层访问 `s.hidden` 的 TS 类型缺失（strict 编译风险）
- **消除 any 类型**：`lib/analytics.ts` 的 `track()` 改用 `WindowWithGtag` 接口替代 `window as any`，符合全局禁 any 规则
- **令牌化散写色**：`AppShell.tsx` 的 `BrandMark` 底色与 Hero 节点网 SVG 由硬编码 `#2e9e6b`/`hsl(152...)` 改为 `hsl(var(--primary))`，落实 spec §6.2 令牌单一来源
- **统计一致性**：`SkillsExplorer.tsx` 状态行「总数」改为可见技能数（过滤 hidden），与 Hero 的 `total` 及网格过滤结果一致
- **版本头同步**：被改 app 文件头注释统一至 v1.14.60（消除 v1.1.x 失真子版本）

## [1.14.59] - 2026-08-20

### fix: 修复原型卡片样式脱节与清理死代码

- **卡片类名对齐**：`parts/02-render.js` 的 `cardHTML` 由 `.body/.title-row/.name/.meta` 改为与 `components.css` 选择器一致的 `.top/h3/.tags/.cat-tag`，修复 avatar 与标题布局失效（原 `.title-row`/`.name` 无样式）
- **删除死代码样式**：移除 `layout.css` 的 `.sort`/`.lang-switch`/`.hero .pill`/`.hero .meta`（模板无对应 DOM）与 `components.css` 的 `.src-badge`（数据无 `source` 字段，永不渲染）
- **Hero 字体签名**：`#hero h1` 改用 `--font-display` 衬线字体，落实排版个性（原走 `--font-sans` 无差异点）
- **数据重建**：`data/skills-data.json` 由磁盘 44 真技能重建，清除残留 Git 冲突标记（`<<<<<<< HEAD`）
- **版本同步**：根 `package.json` 与 `02-render.js`/`layout.css`/`components.css` 头注释升至 v1.14.59

## [1.14.58] - 2026-08-20

### feat: 原型设计改进并同步到应用代码

- **签名元素 Hero 节点网**：原型 `index.html` 与 app `AppShell.tsx` 顶部新增 Hero 区，内嵌呼应品牌 Hub 隐喻的 SVG 节点网（分散节点汇聚中心），thesis 文案强调"零散技能汇聚成可检索枢纽"，替代通用"大数字+标签"模板；hover 微增强节点透明度，尊重 reduced-motion
- **卡片分类色条**：`cardHTML`(原型) 与 `SkillsExplorer`(app) 卡片顶部加 `.cat-bar`，按分类序号 `data-cat="0..8"` 映射到绿调→蓝紫色板，用结构编码分类；avatar 改用主绿→节点绿渐变 + hover 光环
- **调色去模板感**：背景去纯白改极浅暖绿白（`150 24% 99%`）、墨色转深墨绿（`152 28% 13%`）、边界/次级/阴影转绿调；新增 `--node`(节点亮绿) 与 `--line` 令牌，制造层次对比
- **字体意向**：display 改 Space Grotesk（几何工艺感，回退 Georgia）、sans/mono 改 Inter/JetBrains Mono 栈，避免默认观感
- **应用代码对齐**：`app/app/globals.css` 补 hero + 卡片色条样式（对齐 prototype/components.css）；`SkillsExplorer` 卡片加 `data-cat` + `.cat-bar`；令牌经 `build.mjs` 自动生成的 `tokens-shared.css` 同步到 app
- **规范文档**：`DESIGN.md` §2.1 色彩表、§2.2 字体、新增 §4.1.1 Hero 签名元素与卡片分类色条规范；版本头升至 v1.14.58
- **版本同步**：根 `package.json`/README/README.en 徽章、build.mjs/AppShell/SkillsExplorer/globals.css 头注释升至 v1.14.58

## [1.14.57] - 2026-08-20

### feat: 原型与 app 品牌/令牌/字段同步，规范文档对齐

- **图形单一来源（消 5 份副本）**：新建 `app/public/hub.svg` 的 `<symbol id="ash-hub">` 为唯一图形定义；`app/public/logo|favicon|mono.svg` 与 `app/app/components/AppShell.tsx` 的 `BrandMark` 均改为 `<use href="/hub.svg#ash-hub">` 引用，消除原先 app/public 内 3 份内联 symbol 副本 + AppShell 硬编码副本 + 原型内联副本的漂移风险
- **设计令牌同步（消手抄漂移）**：`build.mjs` 新增从 `prototype/src/styles/tokens.css`（DESIGN §2 事实源）提取纯变量块并生成 `app/app/tokens-shared.css`；`app/app/globals.css` 改用 `@import "./tokens-shared.css"` 取代手抄令牌块。改原型令牌后 rebuild 即自动同步到 Next 应用
- **详情字段契约（openspec）**：`spec.md` §2.1 补 `tags?` 可选字段；新增 §3.1「详情字段契约一致性」，明确原型 `03-detail.js` 与 app `SkillDialog.tsx` 共用 `SkillEntry` 字段清单，消除字段漂移
- **规范文档同步**：`DESIGN.md` 修正 `brand/`、`app/icon.svg` 死引用（已废弃/删除），§8 声明图形真源 = `app/public/hub.svg`、令牌同步机制；`README` 品牌资产章节改为 `app/public/hub.svg` 单一源并去掉 `app/icon.svg`；原型 `index.html` 死注释修正
- **版本同步**：根 `package.json`、README/README.en 徽章、`DESIGN.md` 头、build.mjs/AppShell/globals.css 头注释升至 v1.14.57

## [1.14.56] - 2026-08-20

### docs: 以磁盘 skills/ 为基准重建技能数据并同步版本号至 v1.14.56

- **数据权威源重构**：`build-skills-data.mjs` 改为以磁盘 `skills/<name>/SKILL.md` 为唯一权威源，**移除对 README 内嵌清单的依赖**；分类（`category`）与中文简介（`zh`）改由每个 `SKILL.md` 的 frontmatter 提供
- **技能元数据补全**：为磁盘 28 个技能目录的 `SKILL.md` 补 `category`（5 大领域之一）与 `zh`（中文简介）前置字段；两个 `name` 含空格的技能（`agent-development`、`svg-logo-designer`）规范化，使 frontmatter `name` 与目录名（kebab-case）一致
- **数据产物重建**：重新生成 `data/skills-data.json`，与磁盘真实技能 1:1 对齐（28 技能 / 5 分类），消除旧产物中的幽灵条目与新技能缺失
- **app 数据同步修复**：`app/scripts/sync-data.cjs` 的 `findRepoRoot` 改为以 `build-skills-data.mjs` 判定仓库根，修正因旧 `app/data/` 残留导致的目标路径偏移；现已正确写入 `app/app/data/skills-data.json`（app 实际读取路径）
- **版本号同步**：根 `package.json` → v1.14.56；README/README.en 版本徽章、openspec `spec.md`/`project.md`/`AGENTS.md` 头注释同步至 1.14.56
- **贡献规范更新**：README 贡献指南补充 `SKILL.md` 须含 `category`/`zh` 字段、目录名与 `name` 一致的要求

- **根目录技能副本清理**：删除仓库根目录被 FreeFileSync 镜像产生的 33 个同名技能目录（物理 + `git rm --cached` 解除跟踪），`skills/` 现为本仓库唯一技能存放处；根目录与 `skills/` 同名技能经比对正文一致（差异仅换行符与新补元数据），删除无内容损失

> 注（已闭环）：本版本发布时 `prototype/src` 下缺失 `tokens.css`/`responsive.css`/`i18n.js`/`parts/03-detail.js`/`parts/04-interactions.js`/`parts/05-main.js` 共 6 个源文件（仅产物 `prototype/index.html` 完整），导致 `npm run build` 的 `build.mjs` 阶段抛错无法重跑产物。后续已从产物 `prototype/index.html` 反向重建上述 6 个源文件（头注释统一 v1.14.56），`npm run build` 现已可完整跑通，产物与源文件双向一致。

## [1.14.55] - 2026-08-20

### docs: 使 README 更稳健，不随技能清单变动而频繁更新

- **移除内嵌技能清单**：将 README/README.en 中原有 13 类 / 173 项的内嵌技能链接列表移除，改为「领域概览表（仅分类名，不写死数量）」
- **技能浏览改为动态引用**：README 只保留简介、领域导航、仓库结构、使用方式、展示页入口、品牌资产等稳定内容；完整技能列表与实时数量交给 `npm run build` 自动生成的 `data/skills-data.json`、`prototype/index.html` 与 `app/` 在线展示页
- **技能增删不再要求更新 README**：技能变更后只需运行 `npm run build`，README 主体保持稳定（贡献指南已注明）
- **徽章调整**：技能数量徽章由固定数字改为「动态」，指向展示页
- **版本号同步**：根 `package.json` → v1.14.55，README/README.en 版本徽章同步

## [1.14.54] - 2026-08-20

### docs: 精简并美化中英文 README

- **技能清单改为紧凑链接列表**：将原本 13 类 / 173 项逐条长描述（约 210 行）精简为「分类标题 + 技能名链接」的紧凑列表（约 30 行），保留全部可导航链接，大幅缩短正文并提升可扫读性
- **精简简介与章节**：压缩项目简介、说明块、使用方式、在线展示、品牌资产、技能检索、贡献指南等叙述，去除冗余，结构更清晰
- **目录补齐**：新增「在线展示页面」「品牌资产」目录项，与正文章节一一对应
- **修复英文描述截断**：README.en.md 中 `vercel-react-native-skills` 描述原以不完整 "Use" 结尾，已在精简时一并修正
- **版本号同步**：根 `package.json` → v1.14.54，README/README.en 版本徽章同步

## [1.14.53] - 2026-08-19

### refactor: 完善 YAML 折叠标量解析并同步 openspec 文档版本头

- **build-skills-data.mjs 支持折叠/字面量块标量**：修复 `description: >`/`>-`/`|`/`|-` 后内容未完整解析、展示页残留 `>-`/`>` 等垃圾串的问题；现正确折叠缩进行为单段描述，并去除行内 YAML 注释（`stripInlineComment`）
- **openspec 版本头同步**：`openspec/project.md`/`spec.md` 头注释 → 1.14.53；`spec.md` §1「版本权威源当前」同步为 1.14.53
- **版本号同步**：根 `package.json` → v1.14.53，README/README.en 版本徽章同步
- 注：`data/skills-data.json` 与 `prototype/index.html` 技能数受磁盘 `skills/` 实况驱动（当前磁盘含 SKILL.md 的技能目录在整理中），本次未重新 build 以免破坏进行中的技能库变更

## [1.14.52] - 2026-08-19

### refactor: 原型修复未定义 CSS 变量、补全分类选中态并清理死代码

- **修复未定义 CSS 变量**：`layout.css`/`components.css`/`base.css` 多处引用未定义的 `--ink`（文字色）、`--gradient`（Hero/头像背景），导致浅色下白字不可见、深色下破损；统一改用已定义的语义/桥接令牌（`--text`/`--primary`/`--primary-foreground`），Hero 按 DESIGN §2.1 改为主绿底 + 极淡光晕
- **修正文字色误用**：多处把 `--muted`（表面色）当文字色，浅色下对比不足；改为 `--text-2`（辅助文字），符合 DESIGN §2.1/§8.3 单一主色纪律
- **补全分类 chip 选中态**：render 生成 `chip active` 但 CSS 缺失 `.chip.active`，分类选中无视觉反馈；补上 hover/active 态与 `chip-count` 样式，并删除 layout.css 中无对应元素的孤儿 `.cat` 定义
- **清理死代码**：移除 `02-render.js` 中 `catHue()` 与 `--hue` 内联（CSS 从不消费，且与单一主色规范冲突）
- **修复 meta 技能数漂移**：`index.html` meta/og/twitter 描述硬编码 `173` 与实际 165 不符，改为 `{SKILLS_TOTAL}` 占位符由 `build.mjs` 注入真实数据 total，单一来源
- **版本号同步**：根 `package.json` → v1.14.52，被改文件头注释（`src/index.html`、`styles/base|layout|components.css`、`parts/01|02`、`build.mjs`）同步；重建 `prototype/index.html` 产物

## [1.14.50] - 2026-08-19

### fix: 重建 prototype/index.html 为 173，补齐 v1.14.49 遗漏的原型产物

- **重建原型产物**：v1.14.49 虽将 README 与 `data/skills-data.json` 清理为 173，但 `prototype/index.html`（out 产物）仍内嵌旧 200 条数据；本次重新执行 `npm run build`，以磁盘 173 个技能重建 `prototype/index.html`（107.4 KB），消除原型中 27 个幽灵技能导致的「查看技能」404
- **源码注释同步**：`prototype/src/parts/01-state.js` 索引扫描注释「200 条」→「173 条」
- **版本号同步**：根 `package.json` → v1.14.50，README/README.en 版本徽章、`src/index.html` 头注释同步

## [1.14.49] - 2026-08-19

### refactor: 技能数据以磁盘实况重建为 173，README 移除原型描述

- **重建技能数据为 173**：`build-skills-data.mjs` 以磁盘 `skills/`（含 `SKILL.md` 的 173 个目录）为权威源重新生成 `data/skills-data.json`，并重建 `prototype/index.html` 静态产物；彻底消除此前 data/README 中 27 个「幽灵技能」（如 `agent-eval`、`webapp-testing`、`brainstorming`、`brand-guidelines` 等磁盘不存在条目），避免「查看技能」链接 404
- **README 移除原型描述**：`README.md` 与 `README.en.md` 删除「在线展示页面」中的 `prototype/` 行、「原型（prototype/）」整节及品牌资产中对 `prototype/DESIGN.md` 的引用，README 仅保留 `app/` Web 应用介绍
- **技能清单与计数同步**：中英文 README 各分类计数与总技能数（200→173）同步更新，与磁盘实况一致
- **版本号同步**：根 `package.json` → v1.14.49，README/README.en 版本徽章同步

## [1.14.48] - 2026-08-19

### docs: 核对并同步 README 技能中文描述与 SKILL.md 一致

- **逐技能核对**：以磁盘实况（本地 173 个含 `SKILL.md` 的技能）为准，逐一比对 `README.md` 中各技能中文描述与其 `SKILL.md` 的 `description` 字段语义，绝大多数描述已准确一致
- **描述修订**：`manim-video`（补全为数学/技术动画生产管线、3Blue1Brown 风格）、`dart-flutter-patterns`（补全 BLoC/Riverpod/Provider 状态管理、GoRouter、Dio、整洁架构）两处中文描述完善为更贴合 SKILL.md
- **版本号同步**：根 `package.json` → v1.14.48，README/README.en 版本徽章同步

## [1.14.47] - 2026-08-19

### docs: 同步规范文档版本头与数据事实（204→200、categories string[]）

- **版本头同步**：`openspec/project.md`/`spec.md`/`AGENTS.md`、`prototype/DESIGN.md`/`COMPONENTS.md` 头部版本由 v1.14.44~45 统一升至 v1.14.47，与根 `package.json`/README/CHANGELOG 对齐
- **数据事实修正（"约 204" → 200）**：`openspec/project.md` §4.5.1/§4.5.2、`openspec/spec.md` §2.3 中「当前约 204」与磁盘实况脱节，统一改为 200（与 README 声明、`data/skills-data.json` 的 `total` 一致）
- **spec.md 版本权威源过时**：§1「版本权威源当前 1.14.38」过时，改为动态描述（指向 `package.json`，避免再次脱节）
- **spec.md CI 路径错误**：§5 注释「CI 脚本 `prototype/skills-data.json`」改为实际产物路径 `data/skills-data.json`
- **数据契约修正（`categories` 为 `string[]`）**：`prototype/DESIGN.md` §6 数据 Schema 与 `COMPONENTS.md` §14 原写 `categories:[{name,count}]` 对象数组，实际为去重中文分类名 `string[]`，同步修正
- **版本号同步**：根 `package.json` → v1.14.47

## [1.14.46] - 2026-08-18

### fix: 修正 app favicon 引用 404

- **根因**：v1.14.38 重构删除 `app/public/icon.svg`，但 `app/app/layout.tsx` 的 `metadata.icons.icon` / `apple` 仍指向已删除的 `/icon.svg`，导致 Next.js 部署后浏览器标签图标与 apple-touch-icon 均 404
- **修复**：`metadata.icons.icon` 与 `apple` 改为 `/favicon.svg`（对应 `app/public/favicon.svg`，已存在且为 `brand/hub.svg` symbol 同源资产）
- **版本同步**：`app/app/layout.tsx` 头注释、根 `package.json`、README/README.en 版本徽章升至 v1.14.46

## [1.14.45] - 2026-08-18

### fix: 原型 logo 改用同源 symbol 引用

- **原型图形单一来源化**：`prototype/src/index.html` 在 `<body>` 内联隐藏 `<svg><symbol id="ash-hub">`（内容与 `brand/hub.svg` 一致，currentColor 驱动），页眉与页脚 logo 由硬编码重复内联 SVG 改为 `<use href="#ash-hub" color="#fff">` 同源引用，落实 DESIGN §8.2「标志统一用 `<use>` 引用 symbol」要求
- **全局记忆校正**：品牌资产管理方案从「集中 brand/」更新为真实架构「`brand/hub.svg`(symbol 源) + `app/public/`(资产目录)」，各资产 `<use>` 同源、主色 `#2e9e6b` 与 `--primary` 严格一致
- **版本同步**：`prototype/src/index.html` 头注释、根 `package.json`、`prototype/DESIGN.md`、README/README.en 版本徽章升至 v1.14.45

## [1.14.44] - 2026-08-18

### docs: 对齐规范文档与实现、补语义化 id、统一版本

- **规范文档对齐 `openspec/`**：`spec.md`/`project.md`/`AGENTS.md` 头版本更新至 v1.14.44；修正产物路径 `prototype/out/` → `prototype/`（v1.14.42 已将 HTML 产物移出 `out/` 子目录）；修正 `skills-data.json` 数据契约 `categories` 为 `string[]`（实为去重中文分类名，非 `{category,count}[]`）
- **规范文档对齐 `prototype/`**：`DESIGN.md`/`COMPONENTS.md` 头版本更新至 v1.14.44；样式引用由已废弃的 `src/app.css` 对齐至 v1.14.42 拆分后的 `src/styles/{tokens,base,layout,components,responsive}.css`
- **语义化 id（app 层）**：`AppShell.tsx` 的 `header.topbar`/`brand` 加 `id="appHeader"`/`id="brandBlock"`；`SkillsExplorer.tsx` 的 grid 加 `id="skillsGrid"`、空状态加 `id="emptyState"`（顶部按钮、搜索框、分类、页脚等 id 此前已具备）
- **构建脚本修复**：`package.json` 的 `serve` 脚本由 `prototype/out` 修正为 `prototype`，与 `build.mjs` 实际产物目录一致
- **版本统一**：`package.json`/`README*` 徽章同步至 v1.14.44

## [1.14.43] - 2026-08-18

### fix: 完善原型无障碍、社交分享与 DOM 锚点

- **社交分享 meta（OG/Twitter Card）**：`prototype/src/index.html` 新增 Open Graph 与 Twitter Card 元标签，`og:image`/`twitter:image` 指向 `banner-og.svg`；`build.mjs` 同步复制 `app/public/banner-og.svg` 到 `prototype/` 根
- **卡片语义化 id**：`02-render.js` 的 `cardHTML` 新增 `id="skill-<slug>"`（slug 由技能名派生），便于锚点跳转与 E2E 精确选取（保留既有 `data-name`）
- **reduced-motion 优化**：`base.css` 在 `prefers-reduced-motion` 下去除 `.to-top`/`.toast` 的 transform 位移，仅保留淡入，避免瞬跳（WCAG 2.3.3）
- **文档头注释同步**：`index.html`/`02-render.js`/`base.css`/`build.mjs` 头版本更新至 v1.14.43；README 徽章同步
- **数据一致性已确认**：磁盘 `skills/` 共 204 目录，其中 `.skills-manager`/`cache`/`logs`/`scenarios` 为非技能目录（无 SKILL.md），生成器正确跳过；有效技能 **200** 个与 README 声明一致，无需改动

## [1.14.42] - 2026-08-18

### refactor: 优化 prototype 目录结构并将样式按职责拆分

- **产物移出 out/ 子目录**：`build.mjs` 的 `OUT_DIR` 由 `prototype/out` 改为 `prototype/`，构建产物直接输出 `prototype/index.html` + `prototype/favicon.svg`，删除 `prototype/out/` 嵌套；`edgeone.json` 的 `outputDirectory` 由 `./prototype/out` 改为 `./prototype`，使 `prototype/index.html` 即部署入口
- **CSS 按职责拆分**（修复 app.css 268 行超 200 行规则）：原 `prototype/src/app.css` 拆分为 `src/styles/` 下 `base.css`（全局 UX/无障碍/动效/toast）、`layout.css`（顶栏/Hero/控制/分类/网格/弹窗/页脚）、`components.css`（卡片/chip/按钮/弹窗操作区）、`responsive.css`（媒体查询，最后加载保证覆盖）；`build.mjs` 改为按显式顺序 `tokens→base→layout→components→responsive` 拼接
- **文档同步**：`DESIGN.md`/`COMPONENTS.md` 的 `prototype/out/` 引用更新为 `prototype/` 与 `prototype/index.html`，头版本同步至 v1.14.42；README 徽章同步
- **版本同步**：根 package.json → v1.14.42

## [1.14.41] - 2026-08-18

### fix: 排除腾讯云 EO 与 Vercel 部署问题

- **Vercel 缺失配置**：新增 `vercel.json`，显式指定 `installCommand`/`buildCommand` 进入 `app/` 构建 Next.js、`outputDirectory` 为 `app/.next`、`rootDirectory` 为仓库根（保留对 `data/` 的访问），避免 Vercel 默认误把根 `package.json` 静态原型当作项目而构建失败
- **Next.js App Router 目录冲突**：`app/` 目录名与 Next App Router 约定目录同名导致 `next build` 报 "Couldn't find any pages or app directory"；将路由文件（`layout/page/components/lib/globals.css/icon.svg`）移入 `app/app/`，`tsconfig` 的 `@/*` 指向 `./app/*`，修复构建失败
- **app 数据缺失**：`app/lib/skills.ts` 原从 `../../data` 读取仓库根 `data/skills-data.json`，Vercel 以 `app/` 为 Root 时无法访问；新增 `app/scripts/sync-data.cjs`（向上查找仓库根）在 `prebuild`/`predev` 同步数据到 `app/app/data/`，`skills.ts` 改为读取本地副本，`app/.gitignore` 忽略该副本保持单一来源
- **globals.css 注释块格式错误**：头部裸 `*` 行导致 cssnano 压缩 "Unexpected '/'"; 修正为合法块注释，修复生产构建失败
- **版本同步**：根 package.json → v1.14.41；app package.json → v1.1.13；相关头注释与 README 徽章同步

## [1.1.12] - 2026-08-18

### fix: app 层左上角 logo 尺寸调整至 64px

- **app**（AppShell.tsx / globals.css）：`BrandMark` SVG 与 `.logo` 基础尺寸由 22/40px 统一为 64px，与 prototype 左上角 logo 对齐；页脚 logo 维持 20px 覆盖

## [1.14.40] - 2026-08-18

### fix: 页脚去除规范/Specs 与品牌资产/Brand 链接，README 指向 GitHub 仓库

- **prototype**（src/index.html）：页脚 `footer-links` 移除「规范 / Specs」(`openspec/project.md`) 与「品牌资产 / Brand」(`app/public/logo.svg`)；「README」链接由相对路径 `README.md` 改为 GitHub 仓库绝对地址 `https://github.com/sutchan/Agent-Skills-Hub#readme`（避免静态部署后 404）
- **app**（AppShell.tsx）：同步移除页脚同样两项链接，README 链接同样改为 GitHub 仓库绝对地址
- **版本号同步**：package.json → v1.14.40；app/components/AppShell.tsx 头 → v1.14.40

## [1.14.39] - 2026-08-18

### brand: 以 favicon 为品牌标准规范统一所有资产

- **Hub 图形单一来源对齐**：以 `app/public/favicon.svg`（`#2e9e6b` 纯主绿、无渐变、symbol `stroke-width="1.4"` 连线 `opacity=".55"` 节点 `stroke="none"`）为基准，回退 `banner.svg` 中偏离的新版线框，使全部 7 个品牌资产（`favicon/icon/logo/logo-monochrome/banner/banner-og/brand/hub`）的 Hub 图形本体逐字符一致
- **保留语义化配色**：纯色（`favicon/icon`）、渐变（`logo/banner`）、单色（`logo-monochrome`）、源 symbol 无底板（`brand/hub.svg`）按各自用途保留，仅统一图形造型
- **版本同步**：package.json 与 banner 头注释 → v1.14.39，README/README.en 版本徽章同步

## [1.14.38] - 2026-08-18

### brand: 全面实施 banner/标志改进并新增社交分享横幅

- **主标题改衬线展示体**：`banner.svg` 项目名用 Georgia / 中文宋体（Songti SC）衬线字体，正文仍无衬线，形成展示层级对比
- **新增社交分享横幅 `banner-og.svg`**（1200×628，1.91:1）：用于 Open Graph / Twitter·X / LinkedIn 社交卡，避免 3:1 横幅在 OG 场景文字被裁切
- **品牌图形单一来源**：新增 [`brand/hub.svg`](brand/hub.svg) 定义 `<symbol id="ash-hub">`（`currentColor` 驱动），`logo/favicon/icon/mono/banner` 全部内联同源 symbol，造型一处维护
- **兼容性回退**：所有标志 `<use>` 补 `xlink:href` + 声明 `xmlns:xlink`，兼容旧版渲染器（邮件/Inkscape）
- **可读性（WCAG AA）**：文案加墨绿 `#10231a` 描边滤镜（`feMorphology` 膨胀 + 合并），标题字号由 68 升至 76，强化层级
- **装饰改为品牌波纹点阵**：以右下为中心扩散的同心淡圆，呼应「技能汇聚」语义，替代原对称白圆
- **渐变角度差异化**：背景 135° 对角、logo 45° 反向，增加微对比；`<svg>` 补 `focusable="false"`
- **文案打磨**：英文行改为 "Curated, open-source agent skills — free to use"，中英对应统一
- **版本同步**：package.json 与全部品牌资产头注释 → v1.14.38

## [1.14.37] - 2026-08-18

### fix/brand: 重做 README 横幅，修复字体/无障碍/同源复用/事实脱节

- **字体规范统一**：标题与正文由衬线 `Georgia` 改为无衬线品牌字体栈（Inter/系统字体 + 中文 PingFang/微软雅黑），对齐设计系统与全局品牌调性
- **无障碍增强**：新增 `<title>`/`aria-labelledby` 与 `<desc>`，补充 `lang="zh-CN"`，屏幕阅读器可正确朗读横幅含义
- **同源复用 Hub 图形**：banner 内联 `<symbol id="ash-hub">` 定义三节点 Hub，`<use>` 引用，与 `logo.svg` 造型单一来源，避免未来 logo 调整时 banner 漂移
- **消除 id 冲突隐患**：渐变 id 加 `ash-` 命名空间前缀（`ash-banner-bg`/`ash-banner-logo`）
- **事实脱节修复**：移除写死的 `200+` 计数（与磁盘实有技能数口径不一），改为中性 "Open-source & free curated agent skills"，避免社交预览缓存旧值与仓库真相矛盾
- **版本同步**：banner 头注释与 package.json → v1.14.37

## [1.14.36] - 2026-08-18

### feat: 新增 README banner 横幅

- 新增 `app/public/banner.svg`（1200×400，品牌主绿渐变 `#2e9e6b→#5cc98c`，复用 logo 三节点 Hub 图形 + 项目名/副标题），作为品牌资产单一来源
- `README.md`/`README.en.md` 标题下引用 banner（`![Agent Skills Hub Banner](app/public/banner.svg)`）；英文版标题同步修正为 `Agent Skills Hub`
- 文档同步：`DESIGN.md` §8 新增 banner 资产说明与表格行；README 中英「品牌资产」章节表格补充 banner 行
- 版本号同步至 v1.14.36

## [1.14.35] - 2026-08-18

### feat: 页面新增页脚区（原型 + 应用代码同步）

- **原型层**：`index.html` 在技能网格后新增语义化 `<footer id="siteFooter">`，含品牌区（logo/名称/简介）、导航链接（GitHub/README/规范/品牌资产）与版本+协议行
- **版本注入**：`build.mjs` 新增 `{{VERSION}}` 占位符，从根 `package.json` 读取项目版本注入页脚，避免硬编码漂移
- **i18n 同步**：`i18n.js` 新增 `footer.desc` / `footer.copyright`，zh/en 双语随语言切换
- **样式**：`app.css` 新增页脚样式（移动端竖向堆叠），与 `app/globals.css` 对齐
- **应用层**：`AppShell.tsx` 新增 footer（`lang` 条件渲染），`page.tsx` 服务端读取根 `package.json` 版本经 `version` prop 传入
- **规范文档**：`DESIGN.md` 新增 §4.6 页脚区设计规范
- 版本号同步至 v1.14.35（app 层 page.tsx → v1.1.3、globals.css → v1.1.12）

## [1.14.34] - 2026-08-17

### refactor: 品牌资产迁入 app/public，应用图标保留于 app/

- **品牌资产迁移**：将仓库根 `brand/` 目录的 `logo.svg`/`logo-monochrome.svg`/`favicon.svg` 移入 `app/public/`，由 Next.js 以 `/logo.svg`、`/favicon.svg` 等路径统一提供（单一来源）
- **应用图标不动**：`app/icon.svg` 保留在 `app/`（Next.js 约定自动识别为 favicon/apple-touch），与 `app/public/favicon.svg` 同源
- **`build.mjs` 复制源更新**：favicon 复制源由 `brand/favicon.svg` 改为 `app/public/favicon.svg`；构建验证通过
- **文档同步路径**：`README.md`/`README.en.md`「品牌资产」章节与 `prototype/DESIGN.md` §8 全部引用改为 `app/public/`；清理根目录遗留临时验证脚本 `_verify_brand.cjs`/`_verify_out.cjs`
- **版本号同步**：package.json → v1.14.34；build.mjs / AppShell.tsx 头注释 → v1.14.34

### fix: 调整 logo 尺寸、主标题字号并修复头像背景丢失

- **prototype**：`.brand .logo` 尺寸 32px→64px（圆角 16px、内部图标 28px）；`.hero h1` 主标题 30px→36px；修复 `.avatar` 背景丢失 bug——原背景写在 `.card .avatar`（特异性限定）导致弹窗头像（`.dialog-head .avatar`）不命中而丢失渐变，抽取基础 `.avatar` 规则承载渐变背景，卡片与弹窗共用
- **app（Next.js）**：顶栏主标题 `.brand` 18px→24px、`.logo` 22px→40px（emoji 图标按视觉协调放大）；app 层 `.avatar` 基础规则本身含背景，无此 bug
- **版本号同步**：prototype/src/app.css 头 → v1.14.34；app/package.json → v1.1.11、app/globals.css 头 → v1.1.11

## [1.14.33] - 2026-08-17

### fix: 设计系统主绿降饱和统一

- 设计系统 `--primary` 主绿统一为降饱和 `#2e9e6b`（HSL `152 56% 40%`），logo 渐变端点 `#2e9e6b→#5cc98c`；favicon/应用图标纯 `#2e9e6b` 无渐变（详见 `prototype/DESIGN.md` §8）
- 版本号同步至 v1.14.33（补录：本轮改动此前未写入 CHANGELOG）

## [1.14.32] - 2026-08-17

### chore: 品牌资产集中到 brand/ 目录

- **建立 `brand/` 单一来源目录**：将根目录 `logo.svg`/`favicon.svg`/`logo-monochrome.svg` 移入 `brand/`，作为品牌视觉资产的统一存放位置，消除根目录资产碎片化
- **保留 `app/icon.svg`**：因 Next.js 约定 `app/icon.svg` 自动识别为 favicon / apple-touch，保留在 `app/`，并在 DESIGN §8.6 注明其与 `brand/favicon.svg` 同源生成关系
- **`build.mjs` 复制源更新**：从 `brand/favicon.svg` 复制至 `prototype/out/favicon.svg`（头注释升至 v1.14.32）
- **文档同步路径**：`README.md`/`README.en.md`「品牌资产」章节与 `prototype/DESIGN.md` §8 全部引用改为 `brand/` 路径；版本徽章、DESIGN 头、`package.json` 同步至 v1.14.32
- 验证：`node build.mjs` 成功，`prototype/out/favicon.svg` 正确从 `brand/` 复制

## [1.14.31] - 2026-08-17

### docs: 完善品牌形象规范与资产索引

- **新增单色品牌标志**：仓库根新增 `logo-monochrome.svg`（深墨绿底 `#10231a` + 主绿图形），用于浅色页脚/印刷单色场景，与彩色 `logo.svg`、纯绿 `favicon.svg`/`app/icon.svg` 构成完整变体体系
- **品牌资产注释规范化**：`logo.svg`/`favicon.svg`/`app/icon.svg` 补充分版本与释义注释（v1.14.31），`favicon.svg` 标注「纯绿无渐变、适配 16-32px」规格
- **DESIGN.md 新增 §8 品牌形象规范**：覆盖标志释义、变体与安全区、最小尺寸、品牌配色板（主绿 HSL 通道同源 `--primary`）、favicon 规格、禁用示例（Don'ts）与使用约定，作为品牌视觉事实来源
- **文档同步品牌资产**：`README.md`/`README.en.md` 新增「品牌资产」章节索引四类 SVG 并指向 DESIGN §8；版本徽章升至 v1.14.31；`openspec/project.md` 展示页规范引用 §8，版本头同步
- **版本号同步**：根 `package.json` → v1.14.31；`prototype/DESIGN.md` 版本头 → v1.14.31；`openspec/project.md` 版本头 → v1.14.31

## [1.14.30] - 2026-08-17

### fix: 修复语言切换分类文案不刷新并优化检索性能

- **i18n bug（真实）**：原型层分类筛选区「全部」等文案由 `renderCats` 用 `I18N.t` 动态生成（非 `data-i18n` 静态属性），但 `applyLang()` 切换语言后未重渲染网格，导致切换语言后分类 chips 仍显示旧语言；`applyLang` 末尾补充 `renderGrid()` 刷新（app 层 `SkillsExplorer` 的 `cats` 由 `useMemo([lang])` 重算，本无此问题）
- **性能优化（matches 检索串缓存）**：`02-render.js` 的 `matches()` 原每次输入对全部 200 条重复拼接+小写化检索串；改为 `05-main` 初始化时预计算并缓存 `s._hay`，搜索时直接 `includes`
- **性能优化（O(1) 技能查找）**：`04-interactions.js` 卡片点击/回车原用 `SKILLS_DATA.skills.find(name===)` 线性扫描；新增 `01-state` 共享 `SKILL_MAP`（`name -> skill`），改为 `SKILL_MAP.get()`
- **版本号同步**：package.json → v1.14.30；prototype/src/parts 01/04/05 头注释 → v1.14.30

### feat: 完善项目品牌形象（logo / favicon）

- **新增统一品牌标记**：设计「三节点汇聚中心 Hub」SVG 标识（主绿 `#2f9e63` 对齐设计系统），符号化表达「skills 聚合到 hub」语义；仓库根新增权威矢量资产 `logo.svg`（渐变版，供文档/README）、`favicon.svg`（纯绿版，站点 favicon）
- **app 层注入品牌**：`app/icon.svg`（Next.js 自动识别为 favicon）；`app/layout.tsx` 的 `metadata.icons` 指向 `/icon.svg`（含 apple-touch）；`app/components/AppShell.tsx` 将emoji 占位「🛠️」替换为内联同款品牌 SVG 标记
- **prototype 层注入品牌**：`prototype/src/index.html` 头部加入自包含 data URI favicon（离线可预览）+ 外部 `favicon.svg`/`apple-touch-icon` 回退；body 顶部「S」占位符替换为内联品牌 SVG 标记；`build.mjs` 构建时复制 `favicon.svg` 到 `prototype/out/`，确保部署后可达
- **版本号同步**：`prototype/src/index.html` 头注释 → v1.14.30；`app/components/AppShell.tsx`、`app/layout.tsx`、`build.mjs` 头注释 → v1.14.30

## [1.14.29] - 2026-08-17

### 设计系统对齐与代码/原型一致性

- **统一设计令牌事实来源（DESIGN §2）**：`prototype/src/styles/tokens.css` 重写为 shadcn/ui 风格 HSL 语义令牌（`--background`/`--primary`/`--card`/`--muted`/`--ring`/`--radius`/`--shadow-*` 等），作为全局唯一来源；保留扁平桥接别名（`--bg`/`--surface`/`--text-2` …）供 `app.css` 历史消费名兼容
- **app 与 prototype 视觉对齐（不引入 Tailwind/Radix 运行时）**：`app/globals.css` 重构为与 prototype 同源的 HSL 语义令牌体系，**主色由靛蓝 `#4f46e5` 统一为绿色** `152 56% 40%`（对齐原型单一主色），修正 `--font-en` 误用 mono、深色主题色相偏差；修复 `app/README.md` 中已删除目录与失效统计的说明
- **修复文档与代码偏差（文档规范同步）**：`DESIGN.md` 修正深色主题选择器描述（`.dark` → 代码实际的 `html[data-theme="dark"]`）、阴影表补充 `--shadow-color` 与 `shadow-pop` 条目；`COMPONENTS.md` 修正对已不存在的 `src/app.js` 的引用，改为 `src/parts/*.js`
- **版本线统一**：prototype 各源码/构建脚本头注释（tokens/app.css/index.html/i18n/parts 01-05/build.mjs）+ 根 `build.mjs`/`build-skills-data.mjs` 统一至 v1.14.29；`app/` 组件文件头（AppShell/SkillsExplorer/SkillDialog/layout）统一至 v1.14.29，消除 1.1.x 与全局版本脱节；根 `package.json` 升至 1.14.29（app/package.json 保持子项目独立版本 1.1.10）
- **原型视觉微调（极简质感）**：卡片静止态阴影由 `--shadow-sm` 降至 `--shadow-xs`、hover 提升至 `--shadow-md`，增强悬浮层次；视图切换激活态用 `--shadow-sm`
- **复查纠正回归**：撤销对 `app/components/SkillDialog.tsx` 的 `REPO_SKILLS_TREE` 误改（相对路径会致外部平台无法点击），恢复与 DESIGN §4.3 / openspec §4.5.4 一致的绝对 GitHub 链接，保持 app 与原型两层一致

## [1.14.28] - 2026-08-17

### fix: 修复分享链接为相对路径且对齐原型/规范文档

- **分享链接不可达（真 bug）**：`prototype/src/parts/03-detail.js` 的 `buildShareText` 原生成相对路径 `skills/<name>/`，复制到微信/Twitter 等外部平台后无法点击打开；改为使用 `REPO_SKILLS_TREE` 绝对 GitHub URL 拼接，与弹窗「查看技能」按钮、app 层 `share.ts` 行为一致（openspec §4.5.4 两层复用）
- **误导注释清理**：移除 03-detail.js 中「规范要求相对路径、离线回退相对路径」的过期注释（实现已用绝对链接，与 app 层一致）
- **COMPONENTS.md Radix 措辞**：第 30/56/62 行的 Radix `Slot`/Dialog/Sheet 标注为「app 层实现」，避免与「原型纯原生」混淆
- **openspec 目录表 frontmatter 措辞**：`skills/<name>/SKILL.md` 由「frontmatter + 正文」改为「正文为主，frontmatter 可选当前未用」，与 §4.5.2 一致
- **版本号同步**：package.json → v1.14.28；prototype/src/parts/03-detail.js 头注释 → v1.14.28

## [1.14.27] - 2026-08-17

### docs: 对齐原型/规范文档与项目代码事实

- **外链路径描述（P0 行为冲突）**：DESIGN §3.2、COMPONENTS §13 原称「查看技能」用本地相对路径 `skills/<name>/` 由 GitHub 解析，实际代码 `03-detail.js` 与 app `SkillDialog.tsx` 均硬编码绝对 GitHub 链接 `REPO_SKILLS_TREE`；文档改为与代码一致（绝对链接，由常量维护，两层对齐）
- **分类归属来源（P0 事实错误）**：openspec §4.5.2 原称「取 SKILL.md frontmatter category，回退 README」；实测 200/200 SKILL.md 无 frontmatter，分类完全来自 README 解析（`build-skills-data.mjs` 仅 `readmeMap[name]`）；同步修正 §4.5.2 数据来源（frontmatter 为可选当前未用）
- **源码分发描述自相矛盾（P0 事实错误）**：openspec §2 目录表曾称「DESIGN/COMPONENTS 已预构建、源码不随仓库分发」，与 DESIGN §1 承认 `prototype/src/` 随仓库分发矛盾；改为「源码随仓库分发，out/ 为构建产物」
- **Radix/Tailwind 误导措辞（P1）**：DESIGN §3-§4 多处将原型实现称为「shadcn 基线 / Tailwind 构建 / Radix Tabs/Dialog/Sheet」；已改为「视觉风格参考 shadcn，原型纯原生 CSS/JS 实现，无 Radix/Tailwind 运行时」，组件表标注 Radix 风格可访问性模式
- **版本号同步**：package.json → v1.14.27（注：DESIGN.md/COMPONENTS.md/openspec 文档无文件头版本号，无需改）

## [1.14.26] - 2026-08-17

### fix: 修复覆盖率脚本崩溃与详情弹窗焦点/分享反馈缺陷

- **tools/coverage.py 崩溃（必现）**：原 `re.match(...)` 对无 frontmatter 的 SKILL.md 返回 None，随后 `text[m.end():]` 抛 AttributeError，导致脚本对所有 200 个技能文件 100% 崩溃、CI 门禁/翻译统计完全失效；改为无 frontmatter 时整篇视为正文参与 CJK 占比统计（版本 1.0.0→1.0.1）
- **详情弹窗焦点陷阱监听器泄漏**：`trapFocus` 每次打开在 `#dialog` 上新增 keydown 监听，但仅 Esc 关闭路径移除，点关闭按钮/遮罩关闭时不移除，多次打开后监听器累积叠加；改为将 `onKey` 存为 `dialog._onKey`，`closeDetail` 统一移除（覆盖所有关闭路径）
- **分享无反馈且吞错误**：`shareSkill` 在原 `navigator.share` 分支 `.catch(()=>{})` 吞错、成功/失败均不 toast、失败不回退；改为成功/失败均 toast 提示，非用户取消的失败回退到剪贴板复制，新增统一 `copyToClipboard` 入口，与 app 层 `useShare` 行为对齐（openspec §4.5.4）
- **版本号同步**：package.json → v1.14.26；prototype/src/parts/03-detail.js 头注释 → v1.14.26；tools/coverage.py 头注释 → 1.0.1

### fix: 修复深色模式下部分按钮可读性差的问题

- **问题**：深色背景下 `.btn-ghost` 无边框与背景融合、`.chip`/`.cat-tag` 彩字亮度过低（32%/36%）对比度不足，小字号难以辨认
- **prototype**：`.btn-ghost` 加 `--border` 边框 + hover 提亮；`.chip` 文字 32%→42%、hover 36%→42%；`.cat-tag` 文字 32%→42%；新增 `html[data-theme="dark"]` 覆盖块，将 chip/cat-tag/btn-ghost 文字在暗背景下进一步提亮（hue 55%/65%）
- **app（Next.js）**：同步 `.chip`/`.btn-ghost` 提亮与边框；深色块补充 chip/btn-ghost 覆盖（app 卡片分类标签 `.card-cat` 用 primary 色深色下对比度充足，无需调整）
- **版本号同步**：package.json → v1.14.26；prototype/src/app.css → v1.14.26；app/package.json → v1.1.10、app/globals.css → v1.1.10

## [1.14.25] - 2026-08-16

### fix: 统一页面元素间距至 4 的倍数尺度

- **依据**：对齐 `prototype/DESIGN.md` §2.3 间距规范（4 的倍数），消除两层非规范值
- **prototype**：`.cats` 上间距 18px→16px、`.grid` 上间距 22px→24px、`.stat .label` 加 `margin-top:2px` 避免与数字贴太紧、`.desc.zh` 间距 8px→6px 避免与卡片 gap 叠加成 16px 双倍过松
- **app（Next.js）**：`.toolbar` 上间距 10px→12px、`.stat` 外边距 14px→16px、`.grid` gap 14px→16px、`.card` 内 gap 4px→8px（缓解标题/描述/分类贴太紧）、`.dialog-body` gap 14px→16px
- **版本号同步**：package.json → v1.14.25；prototype/src/app.css → v1.14.25；app/package.json → v1.1.9、app/globals.css → v1.1.9

## [1.14.24] - 2026-08-16

### feat: 字体体系优化（参考 Claude/Anthropic 设计）

- **背景**：参考 Claude（Anthropic）官方品牌字体（标题 Anthropic Serif、正文 Anthropic Sans、代码 Anthropic Mono），外部实现以 `Georgia`/`system-ui` 系统栈回退，不内嵌自定义字体
- **prototype**：`tokens.css` 新增 `--font-display`（衬线标题）、新增 `--font-mono`，`--font-sans` 调整为贴近 Anthropic Sans 的系统栈；`app.css` 的 `.hero h1` / `.brand` / `.card .name` / `.dialog-head h2` / `.empty-state .empty-title` 改用 `--font-display` 衬线
- **app（Next.js）**：`globals.css` 同步新增 `--font-display`/`--font-mono`、调整 `--font-sans`，`.brand` / `.card-title` / `.dialog-head h2` 衬线化
- **文档**：`prototype/DESIGN.md` §2.2 字体表更新为 Claude 风格体系与回退栈说明
- **版本号同步**：package.json → v1.14.24；prototype/src/styles/tokens.css、prototype/src/app.css → v1.14.24；app/package.json → v1.1.8、app/globals.css → v1.1.8

### 文档同步（补齐历史遗漏）

- **README 版本徽章**：中英文 `version-v1.14.18` → `v1.14.24`，与 package.json / CHANGELOG 顶部一致
- **CHANGELOG release 锚点**：补全 v1.0.5–v1.14.24 缺失的 `[x.y.z]:` 链接定义，使所有版本小节标题可点击
- 注：README 技能数仍为 200（与分类明细自洽），磁盘 `skills/` 目录实有 204 个，后续建议用 `tools/skills_readme.py` 重生成对齐

## [1.14.23] - 2026-08-16

### fix: 卡片分类标签 .cat-tag 加对应淡彩色背景

- **prototype**：`02-render.js` 的 `cardHTML` 给 `.cat-tag` 注入 `--hue`（由类别名经 `catHue()` 派生，与分类条同算法）；`app.css` 的 `.cat-tag` 由纯灰边样式改为 `color-mix` 淡彩色背景+边框+文字，与 `.chip` 视觉一致
- **版本号同步**：package.json → v1.14.23；prototype/src/app.css → v1.14.23、prototype/src/parts/02-render.js → v1.14.23

## [1.14.22] - 2026-08-16

### fix: 分类条溢出改换行 + 淡彩色背景区分

- **prototype**：`app.css` 的 `.cats-scroll` 由横向滚动改为 `flex-wrap: wrap`，移除横向溢出渐隐遮罩（`.cats::after` / `.cats.overflow`）；`.chip` 改为按 `--hue` 着色（color-mix 淡彩色背景+边框+文字），active 时加深；`02-render.js` 给每个 chip 注入 `--hue`（类别名 hash 派生），移除 overflow 检测逻辑
- **app（Next.js）**：`globals.css` 的 `.cats-scroll` 同步改 `flex-wrap: wrap`，`.chip` 加 `--hue` 淡彩色背景；`SkillsExplorer.tsx` 新增 `catHue()`（与 prototype 同算法）并给 chip 注入 `--hue`，「全部」固定 hue 220
- **版本号同步**：package.json → v1.14.22、app/package.json → v1.1.7；prototype/src/parts/02-render.js → v1.14.22、app/components/SkillsExplorer.tsx → v1.1.7

## [1.14.21] - 2026-08-16

### fix: 消除两层分享反馈文案漂移并修正文档/注释

- **分享反馈文案对齐（openspec §4.5.4）**：`app/lib/share.ts` 的 `SHARE_FEEDBACK.ok` 由 `已复制链接与宣传文案` / `Link & promo copied` 改为与 `prototype/src/i18n.js` 的 `share.copied` 逐字一致：`已复制到剪贴板` / `Copied to clipboard`，消除 prototype 与 app 两层漂移
- **app/README.md 过时说明修正**：原「repo 取自数据 `repo` 字段」改为「由 `SkillDialog.tsx` 的 `REPO_SKILLS_TREE` 常量维护」，与当前无 `repo` 字段的数据及硬编码实现一致
- **app/next.config.mjs 注释修正**：「原型 app」措辞改为「Web 应用」，app 为真实 Next.js 应用而非原型
- **版本号同步**：package.json → v1.14.21；app/package.json → v1.1.7；app/lib/share.ts、app/next.config.mjs 头注释 → v1.1.7

## [1.14.20] - 2026-08-16

### feat: 全站接入 Google Analytics (GA4)

- **app（Next.js）全站注入**：`layout.tsx` 用 `next/script`（strategy=afterInteractive）注入 GA4，覆盖所有路由页面；ID 优先取环境变量 `GA_MEASUREMENT_ID`，缺省回退 `G-WQDDVB14PF`
- **app 事件埋点**：新增 `lib/analytics.ts` 的 `track()`（仅当 `window.gtag` 存在时上报，否则静默）；`SkillsExplorer` 在搜索/分类筛选/查看技能处上报，`SkillDialog` 在分享处上报，与 prototype 埋点语义一致
- **prototype**：已于 v1.14.19 接入（构建期 `{{ANALYTICS}}` 注入），本次全站覆盖包含 app 层
- **范围**：prototype 静态站 + app Next.js 应用两个部署面全部页面
- **版本号同步**：package.json → v1.14.20、app/package.json → v1.1.6；app/layout.tsx、components/SkillsExplorer.tsx、components/SkillDialog.tsx、lib/analytics.ts → v1.1.6

## [1.14.19] - 2026-08-16

### feat: 接入 Google Analytics (GA4) 统计

- **构建注入**：`index.html` 的 `<head>` 新增 `{{ANALYTICS}}` 占位；`build.mjs` 读取环境变量 `GA_MEASUREMENT_ID`（缺省回退 `G-WQDDVB14PF`）生成 GA4 脚本并内联，本地构建无需设变量即可生成空占位，避免 ID 硬编码进仓库
- **事件埋点**：`parts/01-state.js` 新增 `track()` 工具（仅当 `window.gtag` 存在时上报，否则静默）；`04-interactions.js` 在主题/语言/搜索/视图/分类筛选处上报，`03-detail.js` 在查看技能与分享处上报（`view_skill` / `share_skill` 等）
- **范围**：仅 prototype 静态站（主部署面）；app 层 Next 代码未接入 EdgeOne 部署，暂不加
- **版本号同步**：package.json → v1.14.19；prototype/src/index.html、build.mjs、parts/01-04 → v1.14.19

## [1.14.18] - 2026-08-16

### fix: 去除部署页面「原型」字样残留，统一品牌定位文案

- **页面 title**：`Agent Skills Hub · 原型` → `Agent Skills Hub · 高质量 Agent 技能目录`
- **顶栏副标题（brand.subtitle）**：
  - zh：`Agent Skills Hub 原型` → `高质量 Agent 技能库`
  - en：`Agent Skills Hub Prototype` → `Curated agent skill library`
- **同步范围**：`prototype/src/index.html`（title + 静态兜底）、`prototype/src/i18n.js`（zh/en 字典）；重建 `prototype/out/index.html` 部署产物
- **说明**：`prototype/src/*` 文件头注释、`out/index.html` 内的源码署名注释及 frontend-skill 技能描述中的「原型」属内部注释/数据内容，不向用户展示，无需更改
- **版本号同步**：package.json → v1.14.18；prototype/src/index.html、i18n.js 头注释 → v1.14.18

## [1.14.17] - 2026-08-16

### docs: 修复文案漂移与死键，统一品牌展示名

- **分享文案漂移修复（openspec §4.5.4.3）**：`app/lib/share.ts` 的 `SHARE_PROMOS` 原与 `prototype/src/i18n.js` 的 `share.promos` 完全不同且注释声称「逐字对齐」；现以 i18n 为权威逐字统一，消除 app 与原型分享文案不一致
- **品牌名统一为 `Agent Skills Hub`（空格）**：app 分享文案中 3 处 `Agent-Skills-Hub` 连字符改为空格展示名（与 `app/layout.tsx` metadata、`index.html` title 一致）；npm 包名 `agent-skills-hub-app` 与 GitHub 仓库 URL 中 `Agent-Skills-Hub` 因属技术标识保持连字符真实形态（最佳实践：展示名空格、技术标识连字符）
- **清理原型 i18n 死键**：删除从未被引用的 `share.copyOk`/`share.copyFail`/`empty`（zh+en）；`detail.catTitle`/`detail.zhName` 标注为预留键
- **hero 文案优化**：`hero.title` 由「发现并复用 {n} 高质量 Agent 技能」改为「发现并复用 {n} 个高质量 Agent 技能」（补量词更通顺）
- **用词统一**：`SkillsExplorer` 统计文案「当前显示」→「当前展示」，与原型 `stat.shown` 一致
- **版本号同步**：package.json → v1.14.17；prototype/src/i18n.js → v1.14.17；app/lib/share.ts → v1.1.3；app/components/SkillsExplorer.tsx → v1.1.3

## [1.14.16] - 2026-08-16

### 优化：语言/主题切换按钮（原型 + 应用）

- **prototype**：
  - `index.html`：语言按钮文本改为显示「目标语言」（zh→`EN`、en→`中`），更直接；主题按钮增加月亮图标组（`<g class="theme-moon">`），由 CSS 按 `data-theme` 切换太阳/月亮
  - `app.css`：`.icon-btn` 增加 `:focus-visible` 焦点环、`:active` 缩放反馈与过渡统一；新增主题图标太阳/月亮显隐规则
  - `04-interactions.js`：`applyLang` 设置按钮文本与 `aria-pressed`（当前语言）；`applyTheme` 设置 `themeBtn` 的 `aria-pressed`（深色为 true）
- **app（Next.js）**：
  - `AppShell.tsx`：新增主题切换按钮（太阳/月亮 SVG、`aria-pressed`）与 `data-theme` 同步；语言按钮文本改目标语言并加 `aria-pressed`；新增 `.topbar-actions` 容器包裹两个按钮
  - `globals.css`：补全深色主题令牌（`html[data-theme="dark"]`），`.icon-btn` 增加 focus/active 反馈与 hover 阴影；新增 `.topbar-actions`
- **版本号同步**：package.json → v1.14.16、app/package.json → v1.1.5；prototype/src/index.html、parts/04-interactions.js → v1.14.16

## [1.14.15] - 2026-08-16

### docs: 对齐代码与原型/规范文档（版本号与事实一致性）

- **文件头注释刷写**：`prototype/src/` 全部 9 个源文件（index.html/tokens.css/app.css/i18n.js/parts/01-05）头注释版本 v1.14.8~v1.14.12 → v1.14.15；构建脚本 build.mjs/build-skills-data.mjs → v1.14.15
- **COMPONENTS.md 对齐代码**：移除不存在的 `app.js` 引用（状态/渲染/详情改为 `parts/*.js`）；ThemeToggle 恢复与代码一致的 `ash-theme` key 与 `data-theme` 属性；SkillCard 渲染改为 `name/zh/description/allowedTools`；CategoryFilter 数据源改为 `categories[]{name,count}` + `01-state.js` 的 `catCounts()`；文档版本 1.14.6 → 1.14.15
- **DESIGN.md 对齐代码**：版本 1.14.6 → 1.14.15；§6 数据契约移除过时的「字段名与 openspec 不同」描述（openspec 已对齐）；§7 技术栈 `src/app.js` → `src/parts/*.js`；§2.6 图标说明修正为 `index.html` 内联 SVG（移除不存在的 app.css :root 变量）
- **版本号同步**：package.json → v1.14.15

## [1.14.14] - 2026-08-16

### 修复：代码评审发现的文档/路径一致性问题

- **README 构建命令修正**：原 `cd prototype && node build-skills-data.mjs && npm run build` 已失效（脚本已移至仓库根），改为根目录 `npm run build`（生成 `data/skills-data.json` + `prototype/out/index.html`）
- **app/lib/skills.ts 路径稳健化**：`DATA_PATH` 由 `process.cwd()/../data` 改为 `path.resolve(__dirname, "..", "..", "data", ...)`，避免 EdgeOne 在仓库根执行构建时 cwd 偏差导致读空数据
- **版本徽章同步**：README.md / README.en.md 徽章 v1.14.8 → v1.14.14
- **openspec/project.md §4.5 对齐实际实现**：`skills.json` Schema 改为真实 `skills-data.json` 扁平结构（`name/category/zh/description/allowedTools`）；形态表移除不存在的 `_next/`；§4.5.3 字段名 `zh_desc/en_desc/en_name` → `zh/description/name`；§5.5 构建方式改为 `build.mjs`；§6 发版步骤引用 `skills.json` → `data/skills-data.json`
- **app/README.md 修正**：产物文件名 `skills.json` → `skills-data.json`；外链说明移除不存在的 `meta.repo`
- **tools/coverage.py 健壮性**：`--threshold` 参数加边界与类型校验，避免末尾参数 `IndexError`
- **版本号同步**：package.json → v1.14.14；build-skills-data.mjs / build.mjs → v1.14.14；app/lib/skills.ts → v1.1.2

## [1.14.13] - 2026-08-16

### 重构：技能数据源 skills-data.json 移入 /data 目录

- **目录整理**：将 `skills-data.json` 从根目录移入独立 `/data` 目录（由 git mv 保留历史），清理 `prototype/` 下残留副本，使 `prototype/` 仅保留 html 原型与文档
- **build-skills-data.mjs**：`OUT` 由 `prototype/skills-data.json` 改为 `data/skills-data.json`
- **build.mjs**：读取数据路径由 `prototype/skills-data.json` 改为 `data/skills-data.json`（仍内联注入 `prototype/out/index.html`，部署后线上不受路径影响）
- **app/lib/skills.ts**：`DATA_PATH` 由 `../prototype/skills-data.json` 改为 `../data/skills-data.json`，注释同步更新
- **文档**：DESIGN.md / COMPONENTS.md 中数据路径引用同步更新为 `data/skills-data.json`
- **版本号同步**：package.json → v1.14.13；build-skills-data.mjs → v1.14.13；build.mjs → v1.14.13

## [1.14.12] - 2026-08-16

### 优化：查看技能按钮指向 GitHub 仓库

- **prototype**：`03-detail.js` 新增 `REPO_SKILLS_TREE` 常量（`https://github.com/sutchan/Agent-Skills-Hub/tree/main/skills/`），`.btn-primary`「查看技能」由相对路径 `skills/<name>/` 改为绝对 GitHub 仓库链接，跨部署环境稳定可用
- **app（Next.js）**：`SkillDialog.tsx` 同步新增 `REPO_SKILLS_TREE` 常量，`.btn-primary` href 改为 GitHub 仓库绝对链接（经 `encodeURIComponent` 编码名称）
- **说明**：分享文案里的相对路径 `skills/<name>/` 仍按 openspec §4.5.4 保留（分享语义不同，未改动）
- **版本号同步**：prototype/src/parts/03-detail.js → v1.14.12；app/components/SkillDialog.tsx → v1.1.4；package.json → v1.14.12、app/package.json → v1.1.4

## [1.14.11] - 2026-08-16

### 优化：缩小卡片头像尺寸 + 中文描述上间距

- **prototype**：`app.css` 将 `.card .avatar` 由 40×40 缩至 32×32（圆角 11→9px），字体 16px 不变；新增 `.card .desc.zh { margin-top: 8px }` 为中文描述上方增加间距
- **app（Next.js）**：`globals.css` 将 `.avatar` 由 44×44 缩至 36×36（sm 36→30），字体保持默认/13px 不变
- **版本号同步**：package.json → v1.14.11、app/package.json → v1.1.3

## [1.14.10] - 2026-08-16

### 优化：卡片头像与名称同行

- **prototype**：`02-render.js` 的 `cardHTML` 将 `.avatar` 移入 `.body` 并与 `.name` 包进新增的 `.title-row`（flex 横向）；`app.css` 移除旧的独立 `.card .avatar` 规则，新增 `.title-row { display:flex; align-items:center; gap:10px }`，列表视图（list）保持兼容
- **app（Next.js）**：`SkillsExplorer.tsx` 卡片把 `.avatar.sm` 与 `.card-title` 包进 `.title-row`；`globals.css` 新增 `.title-row` 并实现同行，移除 `.card-title` 多余上边距
- **版本号同步**：prototype/src/parts/02-render.js → v1.14.10；app/components/SkillsExplorer.tsx → v1.1.2；package.json → v1.14.10、app/package.json → v1.1.2

## [1.14.9] - 2026-08-16

### 修复：详情弹窗 i18n key 与分享文案漂移

- **修复弹窗授权工具标题显示 key 原文**：`03-detail.js` 引用不存在的 `detail.tools`，回退为字面量 `"detail.tools"`；改为正确的 `detail.toolsTitle`
- **修复 app 层分享文案硬编码 `"200+"` 与 prototype 漂移（违反 openspec §4.5.4.3）**：`lib/share.ts` 文案改为 `{n}` 占位并在 `buildShareText` 注入 `SKILLS_DATA.total`，与 prototype 动态数量一致；`useShare`/`SkillDialog`/`SkillsExplorer`/`AppShell`/`page` 透传 `total`
- **修复 app 层 `allowedTools` 类型契约崩溃风险**：`lib/skills.ts` 的 `Skill.allowedTools` 由 `string` 改为 `string[]`（与 `build-skills-data.mjs` 实际输出一致），`SkillDialog` 移除 `.split(",")` 调用，避免数组调用 split 抛 `TypeError`
- **修复 app 弹窗焦点陷阱失效与 Escape 冒泡**：焦点移出弹窗（如 body）时按方向拉回边界；Escape 时 `preventDefault` 后关闭
- **版本号同步**：prototype/src/parts/03-detail.js → v1.14.9；app 层 7 个被改文件头 → v1.1.1；package.json → v1.14.9、app/package.json → v1.1.1
- **修复构建产物 JS 语法错误导致全站白屏（🔴 严重）**：`build.mjs` 用 `String.replace` 注入 `js` 片段时，`$$` 在替换字符串中被解释为字面 `$`，使 parts 里的 `const $$ = ...` 在 `out/index.html` 中塌缩为 `const $ = ...`，与上方 `const $` 重复声明触发 `SyntaxError`，整段脚本不执行、统计与卡片恒为 0；改为函数式替换 `() => js` 规避特殊字符解释。同等处理 `{{CSS}}/{{DATA}}/{{I18N}}`。`build.mjs` 头版本 → v1.14.9

## [1.14.8] - 2026-08-16

### 修复：原型运行时崩溃与交互失效

- **修复全局 `$` 未定义导致白屏（🔴 严重）**：`src/parts/*.js` 全程使用 `$()` 选择器但无任何文件定义，运行至首个 `$()` 调用即抛 `ReferenceError` 整页崩溃；在 `01-state.js` 新增共享的 `$` / `$$` 辅助函数，统一供各 parts 使用
- **修复视图切换失效**：`04-interactions.js` 用 `.view-btn` 选择器绑定 grid/list 切换按钮，但 `index.html` 按钮无该类名，点击无反应；为两个按钮补 `view-btn` 类
- **修复分享反馈无载体**：`03-detail.js` 的 `showToast` 取 `#toast` 节点但该节点在模板中缺失，复制提示永不显示且触发 null 报错；`index.html` 补 `<div class="toast" id="toast" role="status" aria-live="polite">`
- **补全缺失的 i18n key**：`parts` 引用的 `filter.all` / `empty.title` / `share.copied` / `share.failed` 在字典中不存在，回退为 key 原文；`i18n.js` 中英字典补齐四者
- **启用分类条溢出遮罩**：`renderCats` 末尾新增 `scrollWidth > clientWidth` 检测并 toggle `#categoryNav.overflow`，驱动 CSS 右侧渐隐遮罩
- **弹窗滚动锁定统一**：`openDetail`/`closeDetail` 由 `body.style.overflow` 内联改为 `body.no-scroll` 语义类
- **弹窗焦点回归（WCAG）**：`openDetail` 记录打开前焦点元素，`closeDetail` 关闭后归还，避免 Tab 顺序跳回页面顶部
- **hero 计数解耦**：`refreshHeroCount` 改为直接读取 i18n 文案替换 `{n}`，不再依赖模板残留占位符
- **版本号同步**：prototype/src 全部被改文件头（01~05 parts、i18n、index.html、app.css、tokens.css）、package.json（原 1.14.6 未同步，本次一并修正为 1.14.8）统一至 v1.14.8

## [1.14.7] - 2026-08-16

### 文档：Health Files 统一迁移至 `.github/`

- 将 `CODE_OF_CONDUCT.md` / `SECURITY.md` / `SUPPORT.md` / `CONTRIBUTING.md` 从仓库根目录迁移至 `.github/`，作为 Community Health Files 的单一来源（GitHub 优先读取 `.github/`）
- 补全 `.github/` 完整集合：行为准则、安全政策、支持渠道、贡献指南，内容与根目录版本对齐并补充版本标识与修正文案笔误
- 同步更新 `README.md` / `README.en.md` 中相关文档链接至 `.github/` 路径；修正 `.github/CONTRIBUTING.md` 内 `LICENSE` 相对路径
- 升级至 v1.14.7

## [1.14.6] - 2026-08-15

### 重构与规范对齐：脚本拆分、分享链接回归规范、文档同步

- **分享/查看链接回归规范**：`openDetail` 与 `buildShareText` 的链接由硬编码 GitHub 绝对 URL 改回相对路径 `skills/<name>/`，对齐 openspec §4.5.4 与 DESIGN §4.3（部署后由 GitHub 自动解析为 tree/main/skills/<name>/，不依赖外部 repo 配置）
- **脚本拆分（>200 行规则）**：`src/app.js`（317 行）按职责拆分为 `src/parts/` 五模块（01-state / 02-render / 03-detail / 04-interactions / 05-main），`build.mjs` 改为按序拼接 `src/parts/*.js`，保持同作用域、函数声明 hoist
- **无障碍**：修正详情弹窗 `aria-labelledby` 指向真实存在的 `dialogVisibleTitle`（原先引用不存在的 `dialogTitle`）
- **文档对齐**：DESIGN.md / COMPONENTS.md 版本与「实现方式 / 源码映射」描述同步为 parts 拆分形态
- **修复数据层 bug**：`build-skills-data.mjs` 的 `allowedTools` 原本原样存为逗号分隔字符串，导致详情弹窗 `openDetail` 调用 `.map` 崩溃（点击卡片无反应）；新增 `normalizeTools()` 规范为数组，渲染层 `03-detail.js` 同时加 `Array.isArray` 防御性兜底；已验证 200 技能全部可安全打开详情
- **版本号**：prototype/src 全部文件头、package.json、README 徽章统一至 v1.14.6

## [1.14.5] - 2026-08-15

### 修复：卡片 skill 名字丢失（主标题语义错位）

- **根因**：卡片 `.name` 显示 `s.zh`（整段中文描述）而非技能名，且 `.desc.zh` 重复显示同一段描述；真正的技能名仅藏在 `.badge` 里、被长描述挤到换行后，视觉上「没有名字」
- **修复**：`.name` 主标题明确显示技能英文名 `s.name`（权威标识、简短、永不丢失）；中文描述交由 `.desc.zh`，移除与名字重复的 `.badge`；详情弹窗 `#dName` 已用 `s.name`，语义一致
- 版本号：app.js 头、package.json、README 徽章统一至 v1.14.5

## [1.14.4] - 2026-08-15

### 修复：卡片 skill 名称显示不全

- **根因**：`.card .name` 为 `display:flex` 且未设 `flex-wrap`，内部长中文描述文本与英文名 badge 挤在同一行无法换行，文本被压缩/挤出可视区导致名称显示不全
- **修复**：`.name` 加 `flex-wrap: wrap` 允许长文本换行完整显示；`.badge` 加 `flex-shrink: 0` 防止英文名被压缩丢失
- 版本号：app.css 头、package.json、README 徽章统一至 v1.14.4

## [1.14.3] - 2026-08-15

### 修复：英文模式查看技能按钮显中文 + 分享文案硬编码数字

- **英文模式按钮误显中文**：en 字典 `detail.open` 误填中文「查看技能」，英文模式下弹窗按钮显示中文；已修正为 "Open skill"，zh 字典保留「查看技能」
- **分享文案硬编码 200+**：`share.promos` 中英各 3 条营销文案写死 "200+"，与统计脱节；改为 `{n}` 占位符，由 `buildShareText` 注入 `SKILLS_DATA.total` 动态替换
- 版本号：i18n.js/app.js 头、package.json、README 徽章统一至 v1.14.3

## [1.14.2] - 2026-08-15

### 修复：失效链接、hero 标题硬编码、版本号不一致

- **失效链接**：详情弹窗「查看技能」按钮与分享文案链接原指向 `skills/<name>/`，纯静态部署无此路由必 404；统一改为 GitHub 仓库真实技能目录 `https://github.com/sutchan/Agent-Skills-Hub/tree/main/skills/<name>`
- **hero 标题硬编码**：`hero.title` 写死 "200+"，与动态统计脱节；改用 `{n}` 占位符 + `refreshHeroCount()` 注入 `SKILLS_DATA.total`，语言切换后也同步刷新
- **版本号统一**：prototype/src 五个文件头（app.js/i18n.js/app.css/tokens.css/index.html）与 package.json/README 徽章统一至 v1.14.2

## [1.14.1] - 2026-08-15

### 修复：线上部署技能数据全为 0 + 品牌标题拼接瑕疵

- **根因（数据全 0）**：`package.json` 的 `build` 脚本仅运行 `build.mjs`，后者依赖预提交的 `skills-data.json`；EdgeOne 部署重新构建时若数据文件缺失/未就绪，`build.mjs` 抛 ENOENT 失败或产出空页面，导致线上 `SKILLS_DATA` 为空、统计与卡片全为 0
- **修复**：`build` 脚本改为先 `build-skills-data.mjs` 生成数据再 `build.mjs` 内联，彻底消除对预提交数据文件的依赖，CI 重构建必产出 200 技能 / 13 分类
- **标题瑕疵**：`index.html` 品牌名与副标题 `<small>` 间缺空格，渲染为「Skills HubAgent Skills Hub 原型」，已补空格
- 版本号：package.json、index.html 头、README 徽章统一至 v1.14.1

## [1.14.0] - 2026-08-15

### feat: 分享功能 — 复制分析链接时同时复制随机项目宣传文案

- **分享按钮**：技能详情弹窗新增「分享」按钮，点击将技能分析链接（`skills/<name>/`，部署后带域名）与一条**随机选取**的项目宣传文案一并复制到剪贴板
- **多语言随机文案**：中/英各 3 条宣传文案，按当前界面语言随机取 1 条避免雷同；prototype（`i18n.js`）与 app（`lib/share.ts`）复用同一文案集合，避免漂移
- **复制容错**：优先 `navigator.clipboard.writeText`，失败降级 `document.execCommand('copy')`，皆失败给出明确提示
- **用户反馈**：复制成功/失败用轻量 toast（`role="status"` `aria-live="polite"`，3s 自动消失）提示
- **两层实现**：prototype 静态原型与 app（Next.js）行为一致；规范更新至 `openspec/project.md §4.5.4` 与 `prototype/DESIGN.md §3.2/§4.2`
- 版本号：prototype/src 改动文件头统一至 v1.14.0；app 包升至 v1.1.0

## [1.13.2] - 2026-08-15

### 修复：卡片技能名在中文模式下不显示

- **根因**：卡片英文名 badge 带 `en` class，被 `html[data-lang="zh"] .en { display: none }` 规则在默认中文模式下隐藏；而 `.name` 显示的是 `s.zh` 中文长描述，导致用户看不到技能名（英文标识）
- **修复**：卡片英文名 badge 去除 `en` class，使其不受语言切换显隐规则影响、始终可见（英文名是技能稳定标识，用户常按英文名检索/调用）
- 版本号：prototype/src/app.js 文件头、package.json 统一至 v1.13.2

## [1.13.1] - 2026-08-15

### 样式优化：降低绿色主色调饱和度提升文字可读性

- **主色调降饱和**：浅色 `--primary` `#16a34a`→`#2e9e6b`、深色 `#4ade80`→`#5cc98c`，降低饱和度并微调明度
- **白字对比度**：主按钮/选中态绿底白字对比度达 WCAG AA（≥4.5:1），文字更清晰可读
- **同步**：DESIGN.md 主色 HSL 表（142 71%→152 56% / 146 52%）、渐变端点、原型产物 `out/index.html` 一并更新
- 版本号：prototype/src 改动文件头统一至 v1.13.1

## [1.13.0] - 2026-08-15

### UI/UX 完善：偏好持久化、弹窗无障碍与长列表导航

- **偏好持久化**：主题（明/暗）与语言（中/英）写入 localStorage，刷新后保持，避免每次重置
- **弹窗无障碍增强**：打开弹窗时焦点移入、Tab 焦点陷阱不逃逸背景、`Esc`/遮罩关闭后焦点归还触发卡片；打开期间锁定背景滚动（`body.no-scroll`）
- **全局可访问性**：`:focus-visible` 仅键盘焦点显示焦点环；`prefers-reduced-motion` 下停用过渡动画（WCAG 2.3.3）
- **长列表导航**：新增「回到顶部」按钮（`#toTop`），滚动超阈值淡入、点击平滑回顶；分类条右侧溢出渐隐遮罩提示可横向滚动
- 版本号：prototype/src 改动文件头统一至 v1.13.0

### 主色调由紫色改为绿色 + 设计文档对齐

- `prototype/src/styles/tokens.css`：浅色 `--primary` `#4f46e5`→`#16a34a`、`--primary-weak` `#eef0fe`→`#e7f6ec`、`--primary-strong` `#4338ca`→`#15803d`；深色 `--primary` `#818cf8`→`#4ade80`、`--primary-weak` `#232644`→`#16291f`、`--primary-strong` `#a5b0ff`→`#86efac`
- `prototype/src/app.css`：品牌 logo 与卡片头像渐变末端 `#8b5cf6`→`#22c55e`（2 处）
- `prototype/DESIGN.md`：§2.1 色彩表 `--primary`/`--accent`/`--ring` 的 HSL 值与描述同步为绿色（原文档 HSL 仍写紫，已修正为 `142 71%` 绿相，消除文档与代码脱节）
- `prototype/out/index.html`：重跑 `node build.mjs` 重新生成自包含产物，已无紫色残留（校验 0 处）
- 校验：仅替换色值，未改动 DOM 结构与交互逻辑；语义化 id（上轮 v1.10.0 已加）保持不动；对比度仍满足 WCAG AA

## [1.12.0] - 2026-08-15

### 代码审查：无障碍增强、性能优化、规范对齐与模块拆分

- **无障碍（WCAG AA 基线）**：卡片补充 `role=button`+`tabIndex=0`+`aria-label` 并支持 Enter/Space 键打开；分类 chip 加 `aria-pressed`；统计区与结果网格加 `aria-live=polite`；弹窗 `role=dialog`+`aria-modal`+`sr-only` 标题；图标按钮/搜索框/分类 nav 补 `aria-label`；聚焦环 `.card:focus-visible`
- **空状态增强**：新增图标 + 双语描述 + 「清除筛选」按钮（`#clearFilters`），对齐 DESIGN §4.4
- **性能优化**：分类计数由每次渲染全量遍历改为预聚合 `catCounts`（O(n) 一次）；关键词匹配补全 `category` 字段（对齐规范 4.5.3①）；搜索输入加 120ms 防抖
- **健壮性**：删除未使用 `pick` 函数与空 `listCls` 计算；搜索框占位符随语言由 `I18N.t()` 驱动；i18n 容错兜底保持不变
- **模块拆分**：`app.css` 拆出 `src/styles/tokens.css`（设计令牌 + reset + `.sr-only`）；`tools/skills_readme.py`(265行) 拆出纯函数层 `tools/_skill_readme_lib.py`（解析/读取），主文件降为编排层。所有源文件 ≤200 行
- **规范对齐（DESIGN.md / COMPONENTS.md）**：修正过时引用（Next.js/React/Tailwind → 纯原生 HTML/CSS/JS；`build_site.mjs`/`skills.json 的 meta.repo` → `build.mjs`/`skills-data.json` 扁平结构）；README/README.en 同步纯静态实现与构建命令、`app/` 技术栈断言去具体化
- **版本号统一**：prototype/src 各文件头、package.json、README 徽章统一至 v1.12.0

## [1.11.2] - 2026-08-15

### 加固 EdgeOne CI 依赖安装修复（v1.11.1 修复未生效）

- **根因复盘**：v1.11.1 在 `edgeone.json` 设 `installCommand: ""` 未生效，CLI 仍回退默认 `npm install` 并因根目录无 `package.json` 而 ENOENT 失败（空字符串被判定为"未设置"）
- **双保险修复**：
  1. 新增根 `package.json`（无 dependencies，含 `build` 脚本指向 `node prototype/build.mjs`），即使 CLI 回退默认 `npm install` 也会因有清单且零依赖而立即 exit 0
  2. `edgeone.json` 的 `installCommand` 改为非空命令 `echo 'no npm dependencies to install'`，确保 CLI 执行它而非回退默认；`buildCommand` 改为 `npm run build`
- 本地校验：`npm run build` 成功生成 `prototype/out/index.html`，两处 JSON 均合法

## [1.11.1] - 2026-08-15

### 修复 EdgeOne Makers CI 依赖安装失败（ENOENT package.json）

- **根因**：`edgeone.json` 未配置 `installCommand`，CI 默认执行 `npm install`，但仓库根目录无 `package.json`（原型为纯静态站点，`prototype/out/` 为已入库的预构建产物），导致 ENOENT 构建失败
- **修复** `edgeone.json`：新增 `installCommand: ""` 跳过无意义依赖安装；新增 `buildCommand: "node prototype/build.mjs"` 在部署前重新生成自包含静态产物（`build.mjs` 仅依赖 Node 内置模块，无需 npm 安装）
- 校验：`edgeone.json` 通过 `JSON.parse` 合法性检查；`build.mjs` 确认仅引用 `node:fs`/`node:path`/`node:url` 内置模块，CI 无需第三方依赖即可构建

## [1.9.1] - 2026-08-15

### 原型重构：纯 HTML 自包含高保真原型

- **重构 `prototype/out/index.html`**：从 Next.js 预渲染产物改为**纯 HTML 自包含单文件原型**，内联 CSS + JS + 真实技能数据，双击即可离线预览，零构建依赖
- **新增数据管道** `prototype/build-skills-data.mjs`：从磁盘 `skills/<name>/SKILL.md` 与 `README.md` 真实提取 200 个技能、13 个分类（名称、中文/英文描述、授权工具），生成 `prototype/skills-data.json`
- **新增原型源码** `prototype/src/`（`index.html` 模板 + `app.css` 设计系统 + `app.js` 交互逻辑），按职责拆分且均 ≤200 行
- **新增构建脚本** `prototype/build.mjs`：将 `src` 模板与真实数据内联为自包含 `out/index.html`（约 91 KB）
- **实现交互**：实时搜索、分类筛选（带计数）、网格/列表视图切换、技能详情弹窗（桌面 Dialog + 移动端底部 Sheet）、中英语言切换、深浅主题切换、Esc/点击遮罩关闭
- **对齐设计系统** `prototype/DESIGN.md` / `COMPONENTS.md`：语义色板、圆角、阴影、PingFang/微软雅黑字体栈、响应式断点（桌面 Dialog / 移动 Sheet）
- 清理 `out/` 下旧 Next.js 导出遗留文件（`_next/`、`404.html`、`icon.svg`、`index.txt`）
- 校验：`node prototype/build-skills-data.mjs && node prototype/build.mjs` 可复现；产物不依赖 `out/_next/` 资源

## [1.11.0] - 2026-08-15

### 国际化独立模块化 + 容错降级

- **新增独立 i18n 模块** `prototype/src/i18n.js`：集中管理 zh/en 文案字典，对外暴露 `t(key)`、`getLang()`、`setLang()`、`toggleLang()`、`onLangChange()`、`syncDOM()`，与 UI 渲染解耦
- **容错设计**：`t(key)` 在任何情况下都不抛错——目标语言缺失回退 zh，仍缺失返回 key 原文；字典被外部篡改/加载失败时降级到 HTML 原始双写文案，应用不崩溃
- **静态文案数据驱动**：`prototype/src/index.html` 的 13 处双语文案加 `data-i18n` 占位，启动时由 i18n 模块按 `zh`/`en` 类填充
- **动态文案集中**：`prototype/src/app.js` 的空状态、详情弹窗标题改用 `I18N.t(key)`，语言状态与 `data-lang`/`<html lang>` 同步统一交给模块
- **构建管道** `prototype/build.mjs`：新增 `{{I18N}}` 占位符，将 `i18n.js` 内联进 `out/index.html`（保证 `I18N` 在 `app.js` 前加载）
- 校验：Node 单测覆盖字典覆盖、缺失 key 兜底、非法语言忽略、字典损坏不抛错；构建产物已验证内联且无残留占位符

## [1.10.0] - 2026-08-15

### 原型页语义化 id 增强（可访问性与锚点）

- `prototype/src/index.html`：为顶栏（`siteHeader`/`topbarInner`/`brandLink`）、英雄区（`hero`/`heroTitleZh`/`heroTitleEn`/`heroSubtitleZh`/`heroSubtitleEn`/`heroStats`）、搜索控制区（`searchControls`/`searchBox`）、分类导航（`categoryNav`）、主列表（`grid` 增加 `aria-label`）与弹窗容器（`dialog` 增加 `aria-modal` + `aria-labelledby`）补充语义化 id 与可访问性属性
- `prototype/src/app.js`：详情弹窗模板内区块（`dialogHead`/`dialogBody`/`dialogFoot`/`dialogBlockZh`/`dialogBlockEn`/`dialogBlockCat`/`dialogBlockTools`）与标题（`dialogTitle`，关联 `aria-labelledby`）、空状态（`emptyStateZh`/`emptyStateEn`）补充语义化 id
- 校验：新增 id 均为纯结构属性，未改动既有 `state`/`bind()` 选择器逻辑，向后兼容；JS 仍通过既有 `#grid`/`#cats`/`#searchInput` 等引用，无破坏性变更

## [1.9.0] - 2026-08-15

### 社区健康文件（Community Health Files）完善 + CI 修复

- **新增行为准则** `CODE_OF_CONDUCT.md`：基于 Contributor Covenant v2.1，明确承诺、准则、执行流程与举报渠道
- **新增安全政策** `SECURITY.md`：声明受支持版本（latest/main）、私密漏洞报告渠道（GitHub Security Advisory + 邮箱）、处理流程与项目安全红线
- **新增支持文档** `SUPPORT.md`：问题反馈渠道、FAQ、行为准则与维护者信息
- **新增 Issue 模板**：`bug_report.yml`（缺陷）、`feature_request.yml`（功能建议）、`config.yml`（关闭空白 Issue，引导安全漏洞与讨论到对应渠道）
- **新增 PR 模板** `.github/PULL_REQUEST_TEMPLATE.md`：集成 `<type>: <描述>` 提交规范、README 一致性校验与 CHANGELOG 检查清单
- **新增依赖自动化** `.github/dependabot.yml`：对 `app/`、`prototype/` 的 npm 与根目录 GitHub Actions 执行每周自动升级
- **修复失效 CI** `.github/workflows/site.yml`：原 `site/**` 路径指向已重命名为 `prototype/` 的废弃目录，改为 `prototype/**` + `app/**` 双构建任务（prototype 以 `node prototype/build-skills-data.mjs` 校验 `skills-data.json`、app Next.js 构建），与新目录结构一致
- **同步 README** `README.md` / `README.en.md`：顶部新增版本徽章（v1.9.0）、MIT 许可标注；「相关文档」补列 CODE_OF_CONDUCT / SECURITY / SUPPORT
- 校验：新增 Health Files 不引入构建依赖；CI 路径与 `prototype/build_site.mjs`、`app/` 实际入口对齐

## [1.8.0] - 2026-08-08

### 新增 app/ Web 应用工作区 + 文档索引更新

- **新增 `app/` 目录**：作为项目可运行 Web 应用（WebApp）专属工作区，基于 Next.js 14 + React 18，
  与 `prototype/`（预构建静态原型）分层——`app/` 用于开发/构建，`prototype/` 为离线浏览交付物
- **目录约定固化**：`app/README.md` 明确数据源纪律（`skills/<name>/SKILL.md` 为权威）、md 用相对链接、跨域用 `{repo}/tree/main/{dir}`
- **文档索引同步**：`README.md`/`README.en.md` 的「在线展示页面」拆为 `app/` 与 `prototype/` 两层对照表；
  `openspec/project.md` §1 概览与 §2 目录结构表新增 `app/` 行；`openspec/AGENTS.md` 数据纪律补 `app/` 说明
- 校验：仓库结构清晰，`prototype/` 已清理散落文件（仅 `out/` + 文档），`app/` 为未跟踪新目录

## [1.7.0] - 2026-08-08

### 原型 shadcn/ui 重构 + 文档/规范对齐

- **UI 框架升级**：将原型从手写 CSS 重构为 **shadcn/ui（new-york 风格）+ Tailwind CSS 3 + Radix UI + lucide-react**，
  初始化 `tailwind.config.ts`、`postcss.config.js`、`components.json`、`tsconfig.json`、`lib/utils.ts`（cn）等基础设施
- **设计令牌映射**：`DESIGN.md` 的色彩/间距/圆角/阴影/动效改写为 shadcn HSL CSS 变量（`app/globals.css`），
  由 Tailwind 主题消费；新增 `.dark` 深色主题与 `prefers-reduced-motion` 全局兼容
- **组件库替换**：新增 `components/ui/*`（Button/Input/Badge/Card/Skeleton/Separator/Tabs/Dialog/Sheet），
  `components/*`（ThemeToggle/LangToggle/ViewToggle/SkillCard/SkillDetail），全部基于 shadcn 原语
- **响应式详情载体**：桌面端（>640px）用 Radix Dialog 居中弹窗，移动端（≤640px）用 Sheet 右侧抽屉（`matchMedia` 实时判定）
- **去除冗余**：删除旧 `app/Showcase.jsx`（逻辑合并入 `app/page.tsx`）、`lib/skills.js`（升级为 `lib/skills.ts`），
  原型结构精简；构建脚本 `build_site.py` 移植为 `build_site.mjs`（Node 可跑，无 Python 环境可构建），py 版保留为备用
- **规范同步**：重写 `DESIGN.md`（1.7.0）与 `COMPONENTS.md`（1.7.0）对齐 shadcn 架构；
  `openspec/project.md` §4.5 与 `AGENTS.md` 同步为 `build_site.mjs`/`app/page.tsx` 引用；
  `README.md`/`README.en.md` 构建命令更新为 `node build_site.mjs`
- **全面测试**：`npm install` + `npm run build` 通过（Next 14.2.33 静态导出，200 技能 / 13 分类，首屏 JS 146 kB）；
  `next.config.mjs` `output: export` 与所有 Radix 组件兼容
- 校验：构建成功、类型检查通过、三向数据一致、深浅主题/双语/网格列表/空态/键盘可达均可用

## [1.6.0] - 2026-08-08

### 原型目录重构 + 高保真重设计

- **目录精简**：将静态展示页 `site/` 整体移动为 `prototype/`（git 保留重命名历史），
  统一原型入口，消除 `site/` 与 `prototype/` 命名歧义
- 同步更新部署配置 `edgeone.json`（`cd prototype && npm run build`，输出 `./prototype/out`）、
  `README.md` / `README.en.md` 展示页章节、`openspec/project.md` 与 `openspec/AGENTS.md` 的路径引用；
  修正 `build_site.py` 的 `OUT` 路径指向 `prototype/data/skills.json`（修复重跑时写回已删除的 `site/` 的缺陷）
- **设计规范建立**：重撰 `prototype/DESIGN.md` 为完整设计规范——设计原则、设计系统
  （色彩/字体/间距/圆角/阴影/图标/动效 Token）、组件库（基础/复合/业务）、交互标准
  （模式/反馈/错误/空状态）、响应式、数据契约、技术栈
- **组件库规范**：新增 `prototype/COMPONENTS.md`，逐一定义 15 个组件的 Props/状态/用法/代码位置与红线
- **极简重设计**：`globals.css` 重写为克制设计语言（中性灰阶 + 单一靛蓝主色、4 倍数间距尺度、
  分层阴影、easeOutQuint 动效、毛玻璃吸顶工具栏、极淡 Hero 光晕）；`Showcase.jsx` 重构为
  国际顶尖水准可交互原型（中英双语即时切换、深浅主题、网格/列表切换、滚动边框态、键盘可达、
  空状态、弹窗 pop/fade 入场、尊重 `prefers-reduced-motion`）
- 校验：`skills.json` 200 条字段完整；lint 0 错误；三向数据一致；原型内无 `site/` 残留路径

格式遵循 [Keep a Changelog](https://keepachangelog.com/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)（SemVer）。

## [1.0.0] - 2026-07-30

### 新增

- 初始化 Agent Skills Hub，纳入 201 个技能包
- 按领域建立 13 个分类：前端与 UI 设计、后端/语言与框架、架构与设计、
  测试与质量、Agent 与 AI 工程、DevOps 与基础设施、数据与机器学习、
  内容/文档与写作、视频与媒体、行业领域、生产力与工具、上下文与提示工程、其他
- 新增项目文档 `README.md`，提供仓库结构说明、技能分类索引、使用方式与贡献指南

### 说明

- 仓库以多次 `backup: 同步 Skills 库` 提交持续同步技能内容
- 各技能许可证见其目录内 `LICENSE` 文件

## [1.0.1] - 2026-07-30

### 文档

- 完善 `README.md`：补充作者（Sut Chan）与项目地址
- 将全部技能说明翻译为中文
- 修正技能总数（201）与分类计数，清理重复条目
- 新增「相关文档」章节，链接 `CHANGELOG.md` 与 `LICENSE`

## [1.0.2] - 2026-07-30

### 文档与工程

- 新增 `README` GitHub 徽章（技能数量 / 许可证 / 英文文档）与「技能检索」指引
- 提取独立 `CONTRIBUTING.md`，并在「相关文档」中链接
- 新增英文版 `README.en.md`（与中文版结构一致，含英文描述与检索指引）
- 新增 `tools/skills_readme.py`：校验 README 与 `skills/` 一致性、生成英文 README
- 新增 CI 工作流 `.github/workflows/verify.yml`，在 push/PR 时校验一致性
- 在 `agent-skills-hub.code-workspace` 补充作者与项目元信息

## [1.0.3] - 2026-07-31

### 文档

- 修正 `README.md` 与 `README.en.md` 技能总数（201 → 199）
- 修正「测试与质量」「Agent 与 AI 工程」分类计数（20 → 19），使各分类合计与总数一致
- 中文版与英文版均补充本地化说明段，明确技能描述为「中文目录 + 中文描述」
- 修复 `tools/skills_readme.py`：verify 误将 `skills/` 路径前缀当作技能名导致全量误报；gen-en 生成链接路径补全 `skills/` 前缀

### 文档

- 删除冗余技能，技能总数由 201 调整为 199
- `continuous-learning`：已有 `continuous-learning-v2` 替代，删除旧版
- `webapp-testing-2`：与 `e2e-testing` / `browser-qa` 功能重叠且命名遗留 `-2`，删除
- 同步更新 `README.md`、`README.en.md`（分类计数与总数）与 `site/data/skills.json`

## [1.0.4] - 2026-07-31

### 文档

- 重构 `README.en.md` 为真正的英文文档：英文标题/栏目/说明，技能描述由 `gen-en` 从各 `SKILL.md` 自动提取（英文技能保留英文描述，中文技能保留中文描述）
- 英文版补充「Repository Structure」「Usage（含 skills-manager 一键安装、Next.js 在线展示、技能检索）」「Contributing」「Related Documents」等章节
- 修正英文版仓库链接（旧 `skills-chinese` → `Agent-Skills-Hub`）与 workspace 文件名引用
- 增强 `tools/skills_readme.py` 的 `read_description`：正确解析 YAML 折叠块标量（`|`/`>`/`|-`/`>-`），修复中文技能描述被截断或误取标记符号的问题
- 修复后 `gen-en` 产出描述完整，`verify` 校验通过（199 个技能一致）

## [1.0.5] - 2026-07-31

### 文档

- 删除冗余技能 `autonomous-loops`：其 `SKILL.md` 已声明 canonical 名改为 `continuous-agent-loop`，保留一个版本避免破坏现有工作流，与 `continuous-learning`（v2 替代 v1）、`webapp-testing-2`（遗留 `-2` 命名）同属被替代/遗留命名的冗余清理
- 同步更新 `README.md`、`README.en.md`（总数 199→198，「Agent 与 AI 工程」分类 19→18）与 `site/data/skills.json`
- 清理临时分析文件 `descs.txt`、`sim.txt`

## [1.0.6] - 2026-07-31

### 功能

- `site` 展示页新增中英文切换功能
- `Showcase.jsx`：新增 `lang` 状态与 `toggleLang`；界面文案（标题、按钮、统计标签、搜索占位、分类名、空态、页脚）双语化；分类名维护中文→英文映射；卡片与弹窗按当前语言显示对应描述（缺失时回退另一语言）
- `layout.jsx`：新增首屏 `lang` 内联脚本，避免语言切换闪烁，同步 `<html lang>`
- `globals.css`：新增 `.lang-toggle` 按钮样式，卡片/弹窗描述样式合并为 `.card-desc` / `.modal-desc`
- 语言偏好持久化到 `localStorage`，默认跟随浏览器语言

## [1.4.0] - 2026-08-08

### 数据一致性修复（续）

- 修复 `site/build_site.py`：frontmatter 解析时对 `name`/`description`/`category`
  去除 YAML 引号包裹，根治 `security-best-practices` 的 name 被包裹为
  `"security-best-practices"` 导致无法匹配磁盘与 README 的问题
- 重新生成 `site/data/skills.json`：技能总数 197 → 200（与磁盘含 `SKILL.md`
  的目录数一致），`meta.count` 196 → 200，分类计数全量同步
- 补全 README 缺失的 3 个技能条目：`autonomous-loops`、`continuous-learning`、
  `webapp-testing`（原仓库新增未同步至 README）
- 修正 README 与 README.en.md 技能总数徽标/正文（198 → 200）及相应分类计数
- 消除三向数据源不一致：磁盘（200）= `skills.json`（200）= README 链接（200）

## [1.5.0] - 2026-08-08

### 英文 README 与生成脚本修复

- 修正 `README.en.md` 脏条目：`frontend-design-2` → `frontend-design`（目录名
  错误），删除磁盘不存在的 `审查项目` 垃圾条目，补回缺失的 `frontend-design`
- 统一中英文 README 分类英文名：`Others` → `Other`，与 `skills.json` 的
  `categories[].en` 对齐；同步修正「其他」分类计数（11 → 10）
- 修复 `tools/skills_readme.py`：`gen-en` 仓库地址
  `sutchan/skills-chinese` → `sutchan/Agent-Skills-Hub`，相关文档链接
  `skills-chinese.code-workspace` → `agent-skills-hub.code-workspace`，
  分类英文映射 `其他: "Others"` → `"Other"`
- 校验结果：中文 README（200）/ 英文 README（200）/ `skills.json`（200）三向
  完全一致，中英文条目集合零差异
- 已知残留：`skills/` 下 21 个 SKILL.md 的 frontmatter 字段（20 个 description
  + 1 个 name）仍带 YAML 引号包裹，两个生成脚本均已兼容去引号，产物不受影响；
  源文件清理因 `git-commit` 内部含单引号存在 YAML 破坏风险，留待后续逐文件处理

## [1.3.0] - 2026-08-08

### 原型更新（site/ 展示页）

- 新增 grid/list 视图切换：Toolbar 图标按钮切换，list 为单列横向卡片布局
- 卡片与 Modal 增加英文别名 `en_name` 展示（仅当 `en_name !== name` 时以小字等宽字体渲染）
- 明确过滤交互：搜索 + 分类 chip 两项取交集；`has_*` 为只读状态徽章，不提供标签过滤
- 同步样式：新增 `.view-toggle`、列表视图、英文别名样式（globals.css）

### 规范文档修订

- `site/DESIGN.md`：纠正配色令牌（以 globals.css 真实值为准，原 `#6d28d9` 等有误）；
  修正间距/圆角/断点；消除"标签取交集""锚点区块"歧义；对齐视图切换与 en_name 展示
- `openspec/project.md`：新增 §4.5 数据结构与接口标准（skills.json Schema、build_site.py
  契约、过滤/展示业务规则）；红线补充数据契约交叉引用，确保文档与最新原型严格对应

## [1.2.0] - 2026-08-08

### 文档与规范

- 新增 `site/DESIGN.md`：Web 展示原型设计规范，定义视觉令牌（配色/字体/
  间距/响应式）、布局组件、交互与数据架构（单一数据源 = 磁盘 SKILL.md →
  build_site.py → skills.json → 原型）
- 新增 `openspec/project.md`：OpenSpec 项目规范，定义 change 工作流、
  artifact 准则与本仓库一致性红线（单一数据源、无嵌套副本、分类英文数据驱动）
- 新增 `openspec/AGENTS.md`：AI 协作指引，含 OpenSpec CLI 快速命令与角色契约

## [1.1.0] - 2026-08-07

### 原型对齐与数据治理

- 改进展示页原型（`site/`）：分类英文名从 `data/skills.json` 的
  `categories[].en` 字段读取，删除 `Showcase.jsx` 中硬编码的 `CAT_EN`
  映射，新增分类无需改动前端代码
- 增强 `site/build_site.py`：生成 `categories` 时写入 `en` 字段，
  数据重生成自动携带分类英文名，原型与数据源一致
- 修正 `site/data/skills.json`：删除磁盘已不存在的 `审查项目` 条目，
  将错误目录 `frontend-design-2` 修正为真实 `frontend-design`，
  技能总数 198 → 196，分类计数同步更新
- 修正 `README.md`：同上述两处坏条目，使 README、skills.json 与
  磁盘 `skills/` 三套数据对齐（单一数据源 = 磁盘 SKILL.md）

### 仓库清理

- 恢复根 `tools/coverage.py` 与 `tools/skills_readme.py`（此前误置于
  `skills/tools/` 嵌套副本），删除非法嵌套目录 `skills/tools/`、`skills/site/`
- 解决 `manim-video` 版本冲突：将完整生产级版本（version 1.0.0，含
  14 份 references 文档与 `scripts/setup.sh`）从错误嵌套位置
  `skills/video-use/skills/manim-video` 归位到根 `skills/manim-video/`
  （保留 `assets/network_graph_scene.py` 示例），删除非法嵌套目录；
  同步 `skills.json` 的 `has_scripts`/`has_references` 与 `en_desc`

[1.0.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.0.0
[1.0.1]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.0.1
[1.0.2]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.0.2
[1.0.3]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.0.3
[1.0.4]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.0.4
[1.9.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.9.0
[1.9.1]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.9.1
[1.10.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.10.0
[1.13.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.13.0
[1.0.5]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.0.5
[1.0.6]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.0.6
[1.1.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.1.0
[1.2.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.2.0
[1.3.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.3.0
[1.4.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.4.0
[1.5.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.5.0
[1.6.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.6.0
[1.7.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.7.0
[1.8.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.8.0
[1.11.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.11.0
[1.11.1]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.11.1
[1.11.2]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.11.2
[1.12.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.12.0
[1.13.1]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.13.1
[1.13.2]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.13.2
[1.14.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.0
[1.14.1]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.1
[1.14.2]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.2
[1.14.3]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.3
[1.14.4]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.4
[1.14.5]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.5
[1.14.6]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.6
[1.14.7]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.7
[1.14.8]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.8
[1.14.9]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.9
[1.14.10]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.10
[1.14.11]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.11
[1.14.12]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.12
[1.14.13]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.13
[1.14.14]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.14
[1.14.15]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.15
[1.14.16]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.16
[1.14.17]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.17
[1.14.18]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.18
[1.14.19]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.19
[1.14.20]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.20
[1.14.21]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.21
[1.14.22]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.22
[1.14.23]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.23
[1.14.24]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.24
[1.14.25]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.25
[1.14.26]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.26
[1.14.27]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.27
[1.14.28]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.28
[1.14.29]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.29
[1.14.30]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.30
[1.14.31]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.31
[1.14.32]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.32
[1.14.33]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.33
[1.14.34]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.34
[1.14.35]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.35
[1.14.36]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.36
[1.14.37]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.37
[1.14.38]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.38
[1.14.39]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.39
[1.14.40]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.40
[1.14.41]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.41
[1.14.42]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.42
[1.14.43]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.43
[1.14.44]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.44
[1.14.45]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.45
[1.14.46]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.46
[1.14.47]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.47
[1.14.48]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.48
[1.14.49]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.49
[1.14.50]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.50
[1.14.51]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.51
[1.14.52]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.52
[1.14.53]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.53
[1.14.54]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.54
[1.14.55]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.55
[1.14.56]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.56
[1.14.57]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.57
[1.14.58]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.58
[1.14.59]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.59
[1.14.60]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.60
[1.14.61]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.61
[1.14.62]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.62
[1.14.63]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.63
[1.14.64]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.64
[1.14.65]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.65
[1.14.66]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.66
[1.14.67]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.67
[1.14.68]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.68
[1.14.69]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.69
[1.14.70]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.70
[1.14.71]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.71
[1.14.72]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.14.72
[1.17.4]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.17.4
[1.18.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.18.0
[1.18.1]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.18.1
[1.18.2]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.18.2
[1.18.3]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.18.3
[1.19.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.0
[1.19.2]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.2
[1.19.3]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.3
[1.19.4]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.4
[1.19.5]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.5
[1.19.6]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.6
[1.19.7]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.7
[1.19.8]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.8
[1.19.9]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.9
[1.19.10]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.10
[1.19.11]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.11
[1.19.12]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.12
[1.19.13]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.13
[1.19.14]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.14
[1.19.15]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.15
[1.19.16]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.16
[1.19.17]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.17
[1.19.18]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.18
[1.19.19]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.19
[1.19.20]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.20
[1.19.21]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.21
[1.19.22]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.22
[1.19.23]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.23
[1.19.24]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.24
[1.19.25]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.25
[1.19.26]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.26
[1.19.27]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.27
[1.19.28]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.28
[1.19.29]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.29
[1.19.30]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.30
[1.19.31]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.31
[1.19.32]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.32
[1.19.33]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.33
[1.19.34]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.34
[1.19.35]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.35
[1.19.36]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.36
[1.19.38]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.38
[1.19.37]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.37

[1.19.40]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.40
[1.19.39]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.39
[1.19.41]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.41
[1.20.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.0
[1.20.1]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.1
[1.20.3]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.3
[1.19.42]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.19.42

[1.20.2]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.2
[1.20.61]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.61
[1.20.62]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.62
[1.20.63]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.63
[1.20.64]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.64
[1.20.65]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.65
[1.20.66]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.66
[1.20.67]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.20.67
