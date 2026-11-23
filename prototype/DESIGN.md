# Agent Skills Hub · 原型设计规范（Design Spec）

> 路径：`prototype/DESIGN.md` · 版本：1.21.2
> 本文档是**视觉 / 交互设计的事实来源（Single Source of Truth）**，涵盖设计原则、设计系统、组件库、交互标准与响应式规范。
> 适用目录：`prototype/`（已重命名自 `site/`）。
>
> **实际交付形态（与 docs/spec.md §1 对齐）**：站点本体为自包含静态单页 `src/index.html`（原生 JS + 内联 CSS + 内联 `window.SKILLS_DATA`）；`npm run build` = `npm run sync:data` → `scripts/build-static.mjs`（生成 `out/`）→ `scripts/inject-ga.mjs`（注入 GA/版本/构建号）；**无前端框架运行时**（v1.21.0 起移除 Next.js 存根与 react 依赖）；本地预览由 `server/`（Express）提供，`edge-worker.js` 承接生产侧投票 / 收藏。本 DESIGN.md 的**设计令牌与组件规范依然为准**，但「由 `tools/build.mjs` 从 `prototype/src` 拼装产物」的旧构建流程已废弃，请勿据此重建产物。

---

## 1. 设计原则

| 原则 | 说明 |
|------|------|
| 极简（Minimal） | 克制的视觉语言，留白即设计；单一主色，避免渐变滥用与装饰性元素 |
| 层级清晰（Hierarchy） | 通过字号、字重、色彩对比建立明确的信息层级，首屏 3 秒可读懂核心 |
| 一致（Consistent） | 所有间距、圆角、阴影、动效遵循统一 Token，视觉基线参考 shadcn/ui（**仅为设计风格参考，原型无 shadcn/Tailwind/Radix 运行时**） |
| 真实（Real Data） | 原型数据为手工维护的 `data/skills-data.json` 经 `scripts/sync-inline-data.mjs`（`npm run sync:data`）注入 `src/index.html` 内联 `window.SKILLS_DATA`（无 SKILL.md 自动生成脚本，spec §8.2 既定取舍），非占位假数据 |
| 无障碍（Accessible） | 对比度 ≥ WCAG AA，键盘可达，支持 `prefers-reduced-motion` |

---

## 2. 设计系统（Design Tokens）

设计 Token 以 **shadcn/ui CSS 变量（HSL 通道）** 内联定义在 `src/index.html` 的 `:root`（浅色）与 `html[data-theme="dark"]`（深色，主题由 `<html data-theme>` 切换）中（历史上位于 `prototype/src/styles/*.css`，v1.16.x 随产物内联，旧文件已移除）。这是全局唯一来源。

### 2.1 色彩（HSL 通道，语义化命名）

| Token | 浅色 | 深色 | 用途 |
|-------|------|------|------|
| `--background` | `0 0% 100%` | `224 28% 8%` | 页面背景 |
| `--foreground` | `224 24% 12%` | `220 18% 92%` | 主文字 |
| `--card` / `--card-foreground` | `0 0% 100%` / `224 24% 12%` | `224 24% 11%` / `220 18% 92%` | 卡片/弹窗表面 |
| `--popover` / `--popover-foreground` | 同 card | 同 card（深） | 浮层表面 |
| `--primary` / `--primary-foreground` | `152 56% 40%` / `0 0% 100%` | `146 52% 60%` / `224 32% 8%` | **主色（单一绿色，降饱和）** |
| `--secondary` / `--secondary-foreground` | `220 16% 96%` / `224 24% 18%` | `224 18% 18%` / `220 18% 88%` | 次级表面（按钮、标签底） |
| `--muted` / `--muted-foreground` | `220 16% 96%` / `220 9% 46%` | `224 18% 16%` / `220 12% 60%` | 辅助表面 / 辅助文字 |
| `--accent` / `--accent-foreground` | `152 56% 95%` / `152 56% 33%` | `146 52% 22%` / `146 52% 82%` | 主色浅底（聚焦环、徽章） |
| `--destructive` / `--destructive-foreground` | `0 72% 51%` / `0 0% 100%` | `0 62% 52%` / `0 0% 100%` | 破坏性操作 |
| `--border` / `--input` / `--ring` | `220 14% 90%` / 同 border / `152 56% 40%` | `224 16% 22%` / `224 16% 24%` / `146 52% 60%` | 边框 / 输入 / 聚焦环 |
| `--radius` | `0.75rem` | 同 | 默认圆角基准 |
| `--shadow-color` | `224 32% 20%` | `0 0% 0%` | 阴影色相（中性低透明） |

色彩纪律：**主色仅用于主按钮、聚焦态、分类标识、选中态**；强调色仅用于 `scripts/references/assets` 等资源标签。禁止大面积渐变背景（Hero 仅保留极淡光晕 `radial-gradient`，透明度 ≤ 0.08）。

### 2.2 字体

参考 Claude（Anthropic）官方品牌字体体系：标题使用衬线（Anthropic Serif，外部实现以 `Georgia` 为官方回退），正文/界面使用无衬线系统栈（Anthropic Sans，外部实现以 `system-ui` 为回退）。本项目为纯静态/Next.js 实现，不内嵌自定义字体，统一采用以下回退栈。

| Token | 值 | 用途 |
|------|----|------|
| `--font-display` | `Georgia, "Times New Roman", "Songti SC", "STSong", serif` | 标题/品牌名/卡片名（衬线，对标 Anthropic Serif） |
| `--font-sans` | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif` | 正文与界面（无衬线，对标 Anthropic Sans） |
| `--font-en` | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | 英文 UI 文案 |
| `--font-mono` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` | 代码/英文名等宽展示 |

- 基础字号 `15px`，行高 `1.6`
- 大标题 `clamp(34px, 5.5vw, 52px)`，字重 `700`，字距 `-0.02em`，字体 `--font-display`
- 卡片标题 `15px`，字重 `600`，字距 `-0.01em`，字体 `--font-display`
- 品牌名、弹窗标题、空状态标题均使用 `--font-display` 衬线，与正文无衬线形成层级对比
- 英文 UI 文案首字母大写，中文不加字距

### 2.3 间距（4 的倍数尺度，取值约定参照 Tailwind 默认值）

| 值 | 典型用途 |
|----|---------|
| `4px` (1) | 标签内边距微调 |
| `8px` (2) | 元素间紧凑间距 |
| `12px` (3) | chip/标签内边距 |
| `16px` (4) | 卡片内边距基准 |
| `24px` (6) | 区块/工具栏内边距 |
| `32px` (8) | 容器/章节间距 |
| `48px` (12) | Hero 内边距、弹窗内边距 |
| `64px` (16) | 大区块间距 |

### 2.4 圆角（映射到 `--radius` 设计令牌）

| Token | 值 | 用途 |
|-------|----|------|
| `rounded-sm` | `calc(--radius - 4px)` | 标签、输入框 |
| `rounded-md` | `calc(--radius - 2px)` | 按钮、搜索框 |
| `rounded-lg` | `--radius` (0.75rem) | 卡片（默认） |
| `rounded-xl` | 1rem | 弹窗、统计条 |
| `rounded-full` | 999px | chip、徽章、按钮胶囊 |

### 2.5 阴影（分层次，浅而柔，带 `--shadow-color`）

| Token | 值 |
|-------|----|
| `--shadow-color` | `224 32% 20%`（浅）/ `0 0% 0%`（深）— 阴影色相，统一低透明 |
| `shadow-xs` | `0 1px 2px hsl(var(--shadow-color)/.04), 0 1px 3px hsl(var(--shadow-color)/.06)` |
| `shadow-sm` | `0 1px 2px hsl(var(--shadow-color)/.05), 0 2px 6px -1px hsl(var(--shadow-color)/.08)` |
| `shadow-md` | `0 4px 12px -2px hsl(var(--shadow-color)/.10), 0 2px 6px -2px hsl(var(--shadow-color)/.06)` |
| `shadow-lg` | `0 12px 32px -8px hsl(var(--shadow-color)/.16), 0 4px 10px -4px hsl(var(--shadow-color)/.08)` |
| `shadow-pop` | `var(--shadow-lg)`（弹窗/浮层专用，桌面 Dialog 与卡片 hover 使用） |

### 2.6 图标

- 使用 **本地内联 SVG 图标集**（定义在 `src/index.html` 模板中），零外部依赖，统一 `24x24 viewBox` + `currentColor` 描边，等价于 lucide 风格。
- 图标尺寸统一 `16-20px`（`h-4 w-4` / `h-5 w-5`），颜色继承 `currentColor` 随状态变化。
- 业务图标语义：搜索 `Search`、主题 `Sun/Moon`、视图 `LayoutGrid/Rows3`、资源 `FileCode2/BookOpen/FolderOpen`、外链 `ExternalLink`、空态 `SlidersHorizontal`、品牌 `Boxes`、GitHub `Github`、关闭 `X`。

### 2.7 动效（Motion）

| Token | 值 |
|-------|----|
| `ease-out-quint` | `cubic-bezier(0.22, 1, 0.36, 1)`（顺滑收尾） |
| `duration-200` | 200ms（交互反馈基准） |
| `animate-fade-in` | `fade-in 0.3s easeOutQuint`（背景/遮罩） |
| `animate-pop-in` | `pop-in 0.28s easeOutQuint`（弹窗卡片） |
| `animate-slide-in-right` / `slide-out-right` | 移动端 Sheet 抽屉 |

动效纪律：
- 交互反馈（hover/active）仅 200ms，位移 ≤ 3px（`active:scale-[0.98]`）。
- 弹窗：背景 `fade` + 卡片 `pop`。
- 必须尊重 `prefers-reduced-motion: reduce`——全局动画/过渡降为 `0.001ms`。

---

## 3. 组件库（Component Library）

组件分三类：**基础（Base）**、**复合（Composite）**、**业务（Domain）**。视觉风格参考 shadcn/ui（new-york），原型以**纯原生 CSS/JS 实现**（无 Tailwind/React/Radix 运行时），禁止手写重复样式。

### 3.1 基础组件（Base）— `components/ui/*`（构建期源码映射）

> 以下组件为**设计参考清单**（视觉/交互规范以本表为准）；其实现均位于单体文件 `src/index.html` 的内联脚本中（非独立组件文件）。旧文档曾将实现映射到 `prototype/src/` + `build.mjs` + `src/parts/*`，该构建流程已废弃，请勿据此重建产物。

| 组件 | 文件 | 变体/状态 |
|------|------|-----------|
| Button | `button.tsx` | `default/secondary/outline/ghost/destructive` × `default/sm/lg/icon`；`asChild` 支持 `a` 包装 |
| Input | `input.tsx` | default / focus（ring） |
| Badge | `badge.tsx` | `default/secondary/outline/muted/accent` |
| Card | `card.tsx` | `Card/CardHeader/CardTitle/CardContent` |
| Skeleton | `skeleton.tsx` | `animate-pulse` 占位 |
| Separator | `separator.tsx` | horizontal / vertical |
| Tabs | `src/index.html`（内联）视图切换 | 原生实现（Radix Tabs 风格的可访问性模式，无 Radix 依赖） |
| Dialog | `src/index.html`（内联）`openDetail()` | 原生实现（Radix Dialog 风格焦点陷阱 + `aria-modal`，无 Radix 依赖） |
| Sheet | `src/index.html` 预留 `.sheet` | 移动端详情**复用居中 Dialog**（未启用独立抽屉；`.sheet`/`.sheet-grip` 为预留样式，标注保留未启用，无对应 DOM/JS） |

### 3.2 复合/业务组件（全部内联于 `src/index.html`）

> 旧 `src/parts/01~05-*.js` 分模块实现已于 v1.16.x 合并为单体文件，下表「实现」均为 `src/index.html` 内联函数。

| 职责 | 实现（内联函数） | 说明 |
|------|------|------|
| ThemeToggle | `applyTheme()` | 深浅主题切换，写根节点 `data-theme` |
| LangToggle | `I18N.toggleLang()` | **三语循环**切换（简体 `zh` → 繁体 `tw` → 英语 `en`，受控），`I18N.syncDOM()` 同步 `data-lang` 与 `<html lang>`（`tw` → `zh-Hant`） |
| ViewToggle | `state.view` + `renderGrid()` | 网格/列表切换（受控） |
| ShareButton | `shareSkill(name)` | 技能详情弹窗内的「分享」按钮；点击复制「技能链接 + 随机宣传文案」并 toast 反馈 |
| SkillCard | `cardHTML()` | 网格/列表共用；**渲染为原生 `<button type="button" class="card">`**（a11y 语义，Enter/Space 原生触发，点击经 `#grid` 委托打开详情）；中英双语描述与分类标签（界面另支持繁体回退） |
| SkillDetail | `openDetail()` | 弹窗内容体；含中英文描述、分类、授权工具、本地仓库链接 |
| SettingsButton | `openSettings()` | 顶部栏右上角齿轮按钮 `#settings-btn`；复用 Dialog 框架承载语言/主题/视图模式/显示密度四组切换（就地刷新文案，不重建弹窗） |
| 主页面 | `init()` | 承载 Hero、Toolbar、Chip 过滤、结果区、响应式弹窗调度 |

### 3.3 业务数据契约

| 组件 | 数据来源（`skills-data.json` 扁平结构） |
|------|----------|
| SkillCard / SkillDetail | `skill{name, category, enCategory, zh, description(中文), enDescription(英文), allowedTools}`（`name` 为权威标识；`description` 为中文描述，`enDescription` 为英文描述） |
| CategoryFilter（Chip） | `categories[](string)` + `categoryEn{}`（分类中文→英文映射）+ 内置「全部」；计数由内联 `catCounts()` 预聚合 |
| 语言/主题 | 根节点 `data-lang` / `data-theme` 属性 |

---

## 4. 交互标准（Interaction Standards）

### 4.1 模式（Patterns）

- **单一主任务流**：浏览 → 搜索/筛选 → 查看详情（弹窗/抽屉）→ 跳转仓库。无多级路由，详情用模态而非新页面（保持原型轻量）。
- **响应式详情载体**：当前实现桌面与移动端**均用居中 Dialog**（`.sheet` 抽屉为预留样式未启用，v1.17.2 暂未接入）。
- **即时筛选**：搜索与分类筛选为受控状态、实时过滤，无需提交按钮。
- **三语即时切换**：语言切换（简体中文 → 繁体中文 → 英语）即时重渲 UI 文案与分类英文名，不刷新；缺失词条回退简体中文，技能数据繁体态回退「简体名 + 英文副标题」。

### 4.2 反馈（Feedback）

| 场景 | 反馈 |
|------|------|
| 输入聚焦 | 主色边框 + 2px 主色聚焦环（`focus-visible:ring-2 ring-ring`） |
| 按钮悬停/点击 | 颜色/阴影变化，`active:scale-[0.98]` |
| 卡片悬停 | `hover:border-primary/40 hover:shadow-md` + 轻微上浮 |
| 筛选结果变化 | 数量文本 `#result-count` 实时更新（`aria-live="polite"` 播报条数；`#grid` 为 `aria-live="off"`，避免读屏朗读整网格） |
| 弹窗打开 | 背景 `fade` + 卡片 `pop`（桌面）/ 抽屉 `slide-in-right`（移动） |
| 复制分享链接 | 成功 toast「已复制链接」（`role="status"` `aria-live="polite"`）；失败 toast「复制失败，请手动复制」；3s 自动消失 |

### 4.3 错误（Error）

- 原型为只读展示，无表单提交错误。
- 边界情况：技能 `zh`/`description` 缺失时由 `esc()` 安全降级为空串，i18n 缺失 key 时由 `I18N.t()` 回退 zh / key 原文，均不崩溃。
- 仓库内 Markdown 文档（README / CONTRIBUTING 等）的技能链接使用相对路径 `skills/<name>/`，由 GitHub 自动解析，避免硬编码用户名。
- 站点详情弹窗的"查看技能"使用绝对 GitHub 链接 `https://github.com/sutchan/Agent-Skills-Hub/tree/main/skills/<name>/`，与数据字段 `githubDir`（`data/skills-data.json`）一致，内联实现（历史 React 层 `src/components/*.tsx` 已于 v1.16.x 移除）。

### 4.4 空状态（Empty）

- 搜索/筛选无结果时显示空状态区（`#empty-state`）：图标 + 三语标题「未找到匹配的技能」+ 描述 + 「清除筛选」按钮（`#clear-filters`，点击重置 `q`/`cat` 并重渲染）。
- 不显示空白页；保持布局稳定。

### 4.5 键盘与可达性

- 卡片根节点为 `<div class="card" role="button" tabindex="0">`（v1.16.19 实态校正）：因卡片内含收藏、投票等原生按钮，**不能**嵌套原生 `<button>`；键盘可达性由 `role` + `tabindex` + Enter/Space 处理保证，点击经 `#grid` 事件委托（v1.16.0 修复 double-open）。
- 弹窗为**原生实现**，按 Radix Dialog 风格提供 `Esc` 关闭、焦点陷阱、`aria-modal`（详见 §7，无 Radix 运行时）。
- 分类 chip 用 `aria-pressed` 反映选中态。
- 所有图标按钮带 `aria-label`；`DialogTitle`/`SheetTitle` 用 `sr-only` 保证可访问标题。
- 顶部栏图标按钮统一 `.icon-btn`（34px、flex 居中、`aria-pressed`/`aria-label`），`#settings-btn` 带 `aria-label`（v1.17.2 补齐样式，修复按钮参差对齐）。
- **历史注（v1.20.6 src React 层，已移除）**：本条所述 `src/components/*.tsx` 组件层已随 v1.16.x 单体化移除；所述行为（原生 `<button>` 卡片、Esc 关闭 + 焦点陷阱、顶栏语言/主题/视图/设置切换、设置弹窗持久化、搜索防抖 + 输入法拦截、结果计数 aria-live、回到顶部）均已内联实现于 `src/index.html`。原始记录：`src/components/skill-card.tsx` 卡片根已改为原生 `<button>`（依赖原生 Enter/Space）；`src/components/detail-modal.tsx` 自带 Esc 关闭 + 焦点陷阱（`keydown` 监听，无独立 `ui/dialog.tsx`）；顶栏（`AppShell.tsx`）已含 `#lang-btn` 语言切换与 `#theme-btn` 主题切换（写根节点 `data-theme` + localStorage `ash-theme`）；`SkillsExplorer.tsx` 顶栏含网格/列表视图切换（`#viewBtn`）与 `#settings-btn` 齿轮按钮，打开 `src/components/settings-panel.tsx` 设置弹窗（聚合「界面元素 / 名称显示 / 显示密度」三组，无独立 `ui/settings-dialog.tsx`）；视图（`ash-view`）、密度（`ash-density`，写 `data-density` + globals.css `:root[data-density="compact"]` 生效）、界面元素、名称显示均持久化；搜索框新增 120ms 防抖 + 输入法 composition 拦截（对齐原型 `DEBOUNCE_MS`）；结果计数 `#result-count`（aria-live）；滚动超 300px 显示回到顶部 `#to-top`（`.to-top.show` 样式）；`AppShell.tsx` 渲染 `<section class="hero" id="hero">` 节点网 Hero（按分类计数动态生成 `#net-nodes`，三语标题/副标题/特性标签 + 方案 B 随机骰子 `#dice-btn`，点击派发 `ash:open-skill` 由 `SkillsExplorer.tsx` 打开 `detail-modal.tsx`，样式同源 `src/globals.css`）。

### 4.6 页脚区（Footer）

- 位于技能网格 `<main>` 之后、`overlay` 之前，作为页面收尾区块（语义化 `<footer id="site-footer">`；v1.16.19 起全站 id 统一 kebab-case，历史 `appFooter` / `siteFooter` 等写法已废弃）。
- v1.16.16 起结构为**三段式版权页**（`footer-inner` flex，桌面两端对齐）：
  - **左栏 colophon**（`footer-info`）：品牌名 → MIT 协议声明 → `© 年份 · vX.Y.Z · build yymmddhhmm` 三行；版本号链接 Releases，构建号按钮悬浮显示构建时间、点击复制完整版本信息。
  - **中段辅助导航**（`footer-links`，`nav[aria-label]`）：关于 / 更新日志 / 提交 Issue（v1.16.16 重新引入外链入口；v1.14.86 精简掉的 `footer-stats` 全库统计台账不再恢复）。
  - **右段动作区**（`footer-cta`，`nav[aria-label]`）：Star 为唯一实心主动作 `star-btn`（外链 stargazers）；Share 降为**文字链** `share-btn`（无药丸/描边，下划线自左侧展开），点击复制仓库分享文案。
- **不再展示更新日期**：版本元数据为 `v主.次.修 · build yymmddhhmm`（10 位 · 2 位数年份），构建期 `inject-ga.mjs` 与本地服务 `server/config.js` 注入；裸开页面由 `meta[name=app-version]` 兜底，版本无法确定时移除死链。
- 文案遵循全局 i18n **三语**：静态节点 `.zh`/`.tw`/`.en` + `data-i18n` 互斥显隐；页脚全部交互元素有统一 `:focus-visible` 焦点环。
- 样式在 `src/index.html` 内联 CSS 维护，主色与令牌同源；≤900px 辅助导航整行下沉右对齐，≤640px 按「品牌版权（居中）→ 辅助导航 → 动作」纵向堆叠、按钮占满整行。
- 原型对齐：`prototype/template.html` 为 DOM 结构契约（含上述全部 id），`prototype/wireframes.html` 页脚为三段式线框示意；三者 id 命名一致。

### 4.7 语义化 ID 契约（v1.16.19）

- **命名**：全部应用与原型 id 统一 **kebab-case**；动态 id 亦用 kebab 前缀（`tag-chip-*`、`cat-slice-*`、`cat-legend-*`、`skill-*`、`fav-*`）。
- **单一声明**：详情标题 `id="detail-title"` 只在唯一模板中声明（互斥分支只拼装内部 span），禁止在多个分支重复定义同名 id。
- **同步范围**：改 id 时须同时更新 `src/index.html`（内联 CSS/JS 选择器、ARIA 关联）、`prototype/template.html`、`prototype/wireframes.html`、`prototype/states.html`、`e2e/smoke.spec.ts` 与本 DESIGN.md / `docs/spec.md`。
- **兼容**：历史 camelCase 别名（如 `data-alias="siteHeader"`）已移除，不再保留第二套 id 语义。

---

## 5. 响应式（Responsive）

| 断点 | 布局 |
|------|------|
| `≥1024px` | 平板/桌面中间断点（v1.15.0 新增）：压缩 hero 字号与顶栏间距 |
| `≤900px` | 页脚辅助导航整行下沉右对齐 |
| `≤860px` | Hero 两栏改单列，右侧拓扑卡片高度收敛 |
| `≤768px` | 环形图区改纵向堆叠，图例两列自适应 |
| `≥640px` | 工具栏横排；详情用居中 Dialog |
| `< 640px` | 网格单列；标签 chip 横排可滚动；工具栏纵向堆叠（`view-toggle` 隐藏） |

- **网格列数**：实际用 CSS Grid `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` **自适应**（非固定 2/3 列），由容器宽度决定列数，无需逐断点声明。
- 移动端优先保证触控目标 ≥ 42px（按钮、图标按钮 `.icon-btn` 34px）。
- 标签 chip 横向排列，超出可滚动（`#tag-nav` > `.filter-scroll` 限宽居中；分类筛选由 `#cat-chart-section` 的扇区/图例承担）。
- 顶栏/搜索控制/分类/页脚采用「背景全宽 + 内容限宽居中」结构（`--maxw: 1200px`），与网格同宽对齐（v1.17.1 修复大屏过宽断层）。

---

## 6. 数据架构（Data Contract）

- **单一事实来源**：磁盘 `skills/<name>/SKILL.md`（六字段契约）→ 手工维护 `data/skills-data.json`（含 `skills-metrics.json` 派生指标，均提交态）→ `scripts/sync-inline-data.mjs`（`npm run sync:data`，**仅读** `skills-data.json`，派生 `categories`/`categoryEn`/`total` 并注入 `src/index.html` 的 `window.SKILLS_DATA` 块）→ 自包含静态单页 `src/index.html`（数据内联，**非运行时 fetch**）。
- 数据 Schema（实际为扁平结构）：`{ total:number, categories: string[], categoryEn: Record<string,string>, skills: Skill[] }`，其中 `Skill{ name, category, enCategory, zh, description, enDescription, allowedTools, hidden }`：
  - `name`：技能唯一标识（英文 slug）。
  - `category`：中文分类名；`enCategory`：该分类的英文名。
  - `zh`：中文名（可为空，空时渲染回退 `name`）。
  - `description`：**中文描述**；`enDescription`：英文描述。
  - `allowedTools`：授权工具列表；`hidden`：是否隐藏（`renderGrid` 过滤）。
  - `categoryEn`（根级）：分类中文→英文映射对象。
- 分类计数由 `src/index.html` 内联脚本的 `catCounts()` 预聚合为 `Map`，搜索由 `matches(s, terms)`（预切分词表缓存）实现。
- 注意：`src/index.html` 是项目**可运行 Web 应用**唯一源码（单体文件）；`prototype/` 仅存放设计文档与设计稿，不再包含可运行构建产物。
- 红色底线：数据契约须与 `scripts/sync-inline-data.mjs`、`docs/spec.md` 严格一致。

---

## 7. 技术栈与构建（实际形态，与 `docs/spec.md` 对齐）

- 站点本体为**纯静态原生实现**单体文件 `src/index.html`：内联 CSS（设计令牌与组件样式，以 `:root` CSS 变量为唯一来源，非 Tailwind）+ 内联 JS（原生渲染与交互，无 React/Next.js/Radix）+ 内联 `window.SKILLS_DATA`。
- 构建：`npm run build` = `npm run sync:data` → `scripts/build-static.mjs`（生成 `out/`）→ `scripts/inject-ga.mjs`（注入 GA/版本/构建号）；无前端运行时依赖，无 Next.js / react。
- 数据源：磁盘 `skills/<name>/SKILL.md`（六字段契约）→ 手工维护 `data/skills-data.json` → `scripts/sync-inline-data.mjs`（仅读 skills-data.json）派生注入 `src/index.html` 内联数据块。
- 分发形态：仓库保留 `src/index.html`（唯一可运行产物）与 `prototype/`（设计文档与设计稿，不再含可运行构建产物）。
- 本地预览：`server/`（Express）提供静态服务与投票/收藏 API；生产部署由 `edge-worker.js` 在边缘承接投票/收藏 API（Edge KV）。静态托管服务 `out/`。

---

## 8. 品牌形象规范（Brand Identity）

品牌资产为矢量 SVG，统一位于仓库根 [`public/`](public/) 目录：`favicon.svg`（网站图标）、`hub.svg`（Hub 图形导出资产）、`banner.svg`（README 横幅）、`banner-og.svg`（社交分享横幅）。页面标志由 `src/index.html` **内联** `<symbol id="ash-hub">`（`currentColor` 驱动）渲染，不依赖外链 SVG；`src/index.html` 另有 data-URI 内联 favicon 兜底。静态资源由 `server/pages.js` 的 `express.static(PUBLIC_DIR)` 以 `/` 路径提供；`src/index.html` 的 favicon 为 **data-URI 内联**（自包含、双击即开），`public/favicon.svg` 供部署平台/书签与原型页面使用；`README.md`/`README.en.md` 头图引用 `public/banner.svg`。

> **v1.16.18 结构清理（实态校正）**：原 `public/logo.svg`（与 `favicon.svg` 内容完全相同）与 `public/logo-monochrome.svg`（与 `hub.svg` 内容完全相同）为两组重复副本且无代码引用，已删除；`src/banner-og.svg`、`src/favicon.svg` 两份孤儿副本同步删除。本节此前描述的「`<use href="/hub.svg#ash-hub">` 外链引用」「Next.js `/favicon.svg`」「README 品牌资产章节」均为历史状态，以本段为准。

> **历史版本注记（v1.16.19 整理，非当前实现）**：本节此前并列的 v1.19.x / v1.14.8x 三条长注属**旧双轨版本体系**（编号与现行 v1.16.x 不连续，且互相矛盾，如「分类多选 OR」与「改回单选」并存），仅作存档，勿据此判断当前行为。当前实现契约：
> - 分类筛选**单选**（点「全部」或再次点击当前项复位）；标签筛选**多选 OR**，与分类以 AND 交叉过滤。
> - 排序下拉已落地（名称 A-Z / Z-A / 按点赞数 / 按分类 / 按中文名），控制区 `#sort-select`。
> - 详情弹窗内联于 `src/index.html`（元信息、相关技能、复制安装命令），无 React 组件层。
> - 界面为简中 / 繁中 / 英**三语**；历史 `src/components/*`、`prototype/src/*`、`*-shared.css` 均已移除。
> - 逐版本变更以根 `CHANGELOG.md` 为准，能力基线以 `docs/spec.md` 为准。

### 8.1 标志释义（Logo）

三节点（技能）经连线汇聚至中心 Hub 圆点，象征「技能 → 统一中心枢纽」的产品定位；圆角方形承载（对齐 `--radius: 0.75rem` 视觉语言），主绿填充。

| 变体 | 文件 | 用途 | 背景 |
|------|------|------|------|
| 页面标志 | `src/index.html` 内联 `<symbol id="ash-hub">` | 页眉品牌区（30×30） | 随 `--primary` / `currentColor` |
| 单色 / 图形资产 | `public/hub.svg` | Hub 图形导出资产（历史单色版来源） | 浅色 |
| 网站图标 | `public/favicon.svg` | 浏览器标签、书签（纯绿无渐变） | 透明 |
| README 横幅 | `public/banner.svg` | `README.md`/`README.en.md` 标题下顶部 hero（1200×400） | 浅/深皆可 |
| 社交分享横幅 | `public/banner-og.svg` | Open Graph / 社交卡（1200×628，1.91:1） | 浅/深皆可 |

### 8.2 标志网格与安全区

- 画布 `viewBox="0 0 32 32"`，图形在 32×32 内居中，圆角 `rx="8"`。
- **安全区**：标志四周保留 ≥ 1/8 画布（即 4px@32）留白，避免与文字/边框贴合。
- **最小尺寸**：独立展示 ≥ 24×24px（或 16px 仅作 favicon）；低于 16px 建议仅用 `favicon.svg` 纯图形。

### 8.3 品牌配色（Brand Palette）

标志与界面共用同一套主绿，禁用其它色相作为主品牌色。

| 名称 | 色值 | HSL 通道 | 用途 |
|------|------|----------|------|
| 品牌主绿（浅） | `#2e9e6b` | `152 56% 40%` | 标志填充、主按钮、聚焦环（`--primary` 浅） |
| 品牌主绿（深/悬停） | `#5cc98c` | `146 52% 60%` | logo 渐变终点、深色模式 `--primary` 提亮（`--primary` 深） |
| 单色深底 | `#10231a` | `152 50% 9%` | 单色标志底、深背景反白 |
| 反白 | `#ffffff` | `0 0% 100%` | 标志内图形、深色文字 |

> 品牌主绿即设计系统 `--primary`（§2.1），两者必须保持同一 HSL 通道，禁止漂移。页面内联 symbol 以 `currentColor` 继承主色；`favicon.svg` 为纯 `#2e9e6b` 无渐变，保证 16px 下清晰。

### 8.4 favicon 规格

- 格式：SVG（矢量，自适应任意 DPI）；如目标平台仅接受位图，由 `favicon.svg` 栅格化为 32×32 / 180×180（apple-touch）PNG。
- 颜色：纯 `#2e9e6b` 底 + 反白图形，无渐变（保证 16px 下清晰）。
- 部署：`public/favicon.svg` 由静态服务（`server/pages.js` 的 `express.static(PUBLIC_DIR)`）以 `/favicon.svg` 提供；**v1.16.19 起** `src/index.html` 仅用 data-URI 内联 favicon——随着 `src/favicon.svg` 孤儿副本清理，原先 `href="favicon.svg"` 相对外链在裸开 `file://` 时会 404，故排除该冗余声明。`src/app/layout.tsx` 仅为重定向存根，未声明 icons 元数据。

### 8.5 禁用示例（Don'ts）

- ❌ 修改主绿色相（如改用蓝/紫）或降低饱和度至灰绿。
- ❌ 拉伸、压扁、旋转标志或改动节点相对位置。
- ❌ 在标志图形上叠加文字、阴影或额外装饰。
- ❌ 在对比度不足的浅灰背景使用彩色标志却不保留圆角底（应优先用含底的 `favicon.svg` / 内联 symbol 配圆角底容器）。
- ❌ 用等位图（JPG/PNG）替代矢量源，导致缩放失真。

### 8.6 使用约定

- 页眉品牌区：标志（30×30，圆角底 + 极淡主绿光晕 `box-shadow`，hover `scale(1.06)`）+ 文字两行——主名「Agent Skills Hub」（衬线 `--font-display`，17px/700）+ 副标题（11px/`--text-2`/弱化），见 `src/index.html` 的 `.brand` + `.brand-text` 内联实现（React 组件层已于 v1.16.x 移除）。
- 代码内联引用：`src/index.html` `<head>` 用**单一 data-URI 内联 favicon**（v1.16.19 起不再双重声明）；`<body>` 内联 `<symbol id="ash-hub">`。
- 品牌资产变更须同步：①本 §8 与 README「品牌资产」；②`src/index.html` 内联 symbol 与 `public/*` 图形造型一致；③版本号 bump。
