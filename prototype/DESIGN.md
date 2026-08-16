# Agent Skills Hub · 原型设计规范（Design Spec）

> 路径：`prototype/DESIGN.md` · 版本：1.14.6
> 本文档是原型设计的事实来源（Single Source of Truth），涵盖设计原则、设计系统、组件库、交互标准与响应式规范。
> 适用目录：`prototype/`（已重命名自 `site/`）。
>
> **原型实现方式（v1.9.1 起，v1.12.0 对齐，v1.14.6 交互脚本拆分为 parts）**：`prototype/out/index.html` 为纯 HTML 自包含单文件——由根目录 `build.mjs` 将 `src/index.html` 模板内联 `src/styles/tokens.css` + `src/app.css`、`src/i18n.js`、按序拼接的 `src/parts/*.js`（状态/渲染/详情/交互/启动五模块）与真实技能数据 `data/skills-data.json` 注入生成，双击即可离线预览，无 Next.js/Tailwind/React 构建。国际化由独立模块 `src/i18n.js` 驱动（`data-i18n` 占位 + `I18N.t()` 容错兜底）。源码在 `prototype/src/` 随仓库分发；`prototype/out/` 为构建产物（构建脚本 `build.mjs`/`build-skills-data.mjs` 置于仓库根，不混入原型目录）。

---

## 1. 设计原则

| 原则 | 说明 |
|------|------|
| 极简（Minimal） | 克制的视觉语言，留白即设计；单一主色，避免渐变滥用与装饰性元素 |
| 层级清晰（Hierarchy） | 通过字号、字重、色彩对比建立明确的信息层级，首屏 3 秒可读懂核心 |
| 一致（Consistent） | 所有间距、圆角、阴影、动效遵循统一 Token，组件同源（shadcn/ui 基线） |
| 真实（Real Data） | 原型数据为构建期从磁盘 `skills/<name>/SKILL.md` 由根目录 `build-skills-data.mjs` 生成 `data/skills-data.json`，再由根目录 `build.mjs` 注入并预渲染进 `prototype/out/`，非占位假数据 |
| 无障碍（Accessible） | 对比度 ≥ WCAG AA，键盘可达，支持 `prefers-reduced-motion` |

---

## 2. 设计系统（Design Tokens）

设计 Token 以 **shadcn/ui CSS 变量（HSL 通道）** 定义在 `prototype/src/styles/tokens.css` 的 `:root`（浅色）与 `.dark`（深色）中，由 `prototype/src/app.css` 直接消费（原型为纯原生 CSS，无 Tailwind/React 运行时）。这是全局唯一来源。

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

| Token | 值 |
|------|----|
| `--font-sans` | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif` |
| `--font-mono` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` |

- 基础字号 `15px`，行高 `1.6`
- 大标题 `clamp(34px, 5.5vw, 52px)`，字重 `700`，字距 `-0.02em`
- 卡片标题 `15px`，字重 `600`，字距 `-0.01em`
- 英文 UI 文案首字母大写，中文不加字距

### 2.3 间距（4 的倍数尺度，Tailwind 默认 scale）

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

### 2.4 圆角（Tailwind 映射到 `--radius`）

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
| `shadow-xs` | `0 1px 2px hsl(var(--shadow-color)/.04), 0 1px 3px hsl(var(--shadow-color)/.06)` |
| `shadow-sm` | `0 1px 2px hsl(var(--shadow-color)/.05), 0 2px 6px -1px hsl(var(--shadow-color)/.08)` |
| `shadow-md` | `0 4px 12px -2px hsl(var(--shadow-color)/.10), 0 2px 6px -2px hsl(var(--shadow-color)/.06)` |
| `shadow-lg` | `0 12px 32px -8px hsl(var(--shadow-color)/.16), 0 4px 10px -4px hsl(var(--shadow-color)/.08)` |

### 2.6 图标

- 使用 **本地内联 SVG 图标集**（定义在 `prototype/src/app.css` 的 `:root` 变量与 `index.html` 模板中，随 `prototype/src/` 源码分发），零外部依赖，统一 `24x24 viewBox` + `currentColor` 描边，等价于 lucide 风格。
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

组件分三类：**基础（Base）**、**复合（Composite）**、**业务（Domain）**。全部基于 shadcn/ui（new-york 风格）+ Tailwind 构建，禁止手写重复样式。

### 3.1 基础组件（Base）— `components/ui/*`（构建期源码映射）

> 以下组件为**原型源码结构映射**（源码在 `prototype/src/` 随仓库分发，由 `build.mjs` 内联为静态产物 `prototype/out/index.html`）；此处列出供理解静态产物的实现结构与评审对齐。注：当前实现为原生 HTML/CSS/JS（非 React 组件文件），交互脚本已按职责拆分到 `src/parts/`（01-state / 02-render / 03-detail / 04-interactions / 05-main），以下按职责对应到对应 parts 模块的渲染/交互函数。

| 组件 | 文件 | 变体/状态 |
|------|------|-----------|
| Button | `button.tsx` | `default/secondary/outline/ghost/destructive` × `default/sm/lg/icon`；`asChild` 支持 `a` 包装 |
| Input | `input.tsx` | default / focus（ring） |
| Badge | `badge.tsx` | `default/secondary/outline/muted/accent` |
| Card | `card.tsx` | `Card/CardHeader/CardTitle/CardContent` |
| Skeleton | `skeleton.tsx` | `animate-pulse` 占位 |
| Separator | `separator.tsx` | horizontal / vertical |
| Tabs | `tabs.tsx` | Radix Tabs（复合，可扩展多视图切换） |
| Dialog | `dialog.tsx` | Radix Dialog（桌面详情弹窗） |
| Sheet | `sheet.tsx` | Radix Dialog 改右侧抽屉（移动详情） |

### 3.2 复合/业务组件（对应 `src/app.js` 渲染函数）

| 职责 | 实现 | 说明 |
|------|------|------|
| ThemeToggle | `04-interactions.js` 的 `applyTheme()` | 深浅主题切换，写根节点 `data-theme` |
| LangToggle | `i18n.js` 的 `I18N.toggleLang()` | 中英切换（受控），`I18N.syncDOM()` 同步 `data-lang` 与 `<html lang>` |
| ViewToggle | `01-state.js` 的 `state.view` + `02-render.js` 的 `renderGrid()` | 网格/列表切换（受控） |
| ShareButton | `03-detail.js` 的 `shareSkill(name)` | 技能详情弹窗内的「分享」按钮；点击复制「技能链接 + 随机宣传文案」并 toast 反馈 |
| SkillCard | `02-render.js` 的 `cardHTML()` | 网格/列表共用；`role=button`+`tabIndex=0`+`Enter/Space`；双语描述与分类标签 |
| SkillDetail | `03-detail.js` 的 `openDetail()` | 弹窗内容体；含中英文描述、分类、授权工具、本地仓库链接 |
| 主页面 | `05-main.js` 的 `init()` | 承载 Hero、Toolbar、Chip 过滤、结果区、响应式弹窗调度 |

### 3.3 业务数据契约

| 组件 | 数据来源（`skills-data.json` 扁平结构） |
|------|----------|
| SkillCard / SkillDetail | `skill{name, category, zh, description, allowedTools}`（含 `name` 为权威标识） |
| CategoryFilter（Chip） | `categories[](string)` + 内置「全部」；计数由 `app.js` 预聚合 `catCounts` |
| 语言/主题 | 根节点 `data-lang` / `data-theme` 属性 |

---

## 4. 交互标准（Interaction Standards）

### 4.1 模式（Patterns）

- **单一主任务流**：浏览 → 搜索/筛选 → 查看详情（弹窗/抽屉）→ 跳转仓库。无多级路由，详情用模态而非新页面（保持原型轻量）。
- **响应式详情载体**：桌面（`>640px`）用 Dialog 居中弹窗；移动端（`≤640px`）用 Sheet 右侧抽屉（`matchMedia` 实时判定）。
- **即时筛选**：搜索与分类筛选为受控状态、实时过滤，无需提交按钮。
- **双语即时切换**：语言切换即时重渲 UI 文案与分类英文名，不刷新。

### 4.2 反馈（Feedback）

| 场景 | 反馈 |
|------|------|
| 输入聚焦 | 主色边框 + 2px 主色聚焦环（`focus-visible:ring-2 ring-ring`） |
| 按钮悬停/点击 | 颜色/阴影变化，`active:scale-[0.98]` |
| 卡片悬停 | `hover:border-primary/40 hover:shadow-md` + 轻微上浮 |
| 筛选结果变化 | 数量文本实时更新（可加 `aria-live="polite"`） |
| 弹窗打开 | 背景 `fade` + 卡片 `pop`（桌面）/ 抽屉 `slide-in-right`（移动） |
| 复制分享链接 | 成功 toast「已复制链接」（`role="status"` `aria-live="polite"`）；失败 toast「复制失败，请手动复制」；3s 自动消失 |

### 4.3 错误（Error）

- 原型为只读展示，无表单提交错误。
- 边界情况：技能 `zh`/`description` 缺失时由 `esc()` 安全降级为空串，i18n 缺失 key 时由 `I18N.t()` 回退 zh / key 原文，均不崩溃。
- 仓库内 Markdown 文档（README / CONTRIBUTING 等）的技能链接使用相对路径 `skills/<name>/`，由 GitHub 自动解析，避免硬编码用户名。
- 原型站点详情弹窗的"查看技能"使用本地相对路径 `skills/<name>/`（部署后由 GitHub 自动解析为 `tree/main/skills/<name>/`），不依赖任何外部 `repo` 配置字段。

### 4.4 空状态（Empty）

- 搜索/筛选无结果时显示空状态区（`#emptyState`）：图标 + 双语标题「未找到匹配的技能」+ 描述 + 「清除筛选」按钮（`#clearFilters`，点击重置 `q`/`cat` 并重渲染）。
- 不显示空白页；保持布局稳定。

### 4.5 键盘与可达性

- 卡片 `role="button"` + `tabIndex=0`，支持 `Enter`/`Space` 打开。
- 弹窗/抽屉基于 Radix，原生支持 `Esc` 关闭、焦点陷阱、`aria-modal`。
- 分类 chip 用 `aria-pressed` 反映选中态。
- 所有图标按钮带 `aria-label`；`DialogTitle`/`SheetTitle` 用 `sr-only` 保证可访问标题。

---

## 5. 响应式（Responsive）

| 断点 | 布局 |
|------|------|
| `sm` ≥ 640px | 工具栏横排；详情用 Dialog |
| `lg` ≥ 1024px | 网格 3 列（`lg:grid-cols-3`） |
| `sm` ≥ 640px | 网格 2 列（`sm:grid-cols-2`） |
| `< 640px` | 网格单列；详情用 Sheet 抽屉；分类 chip 横排可滚动 |

- 移动端优先保证触控目标 ≥ 42px（按钮 `h-10`、图标按钮 `h-10 w-10`）。
- 分类 chip 横向排列，超出可滚动。

---

## 6. 数据架构（Data Contract）

- **单一事实来源**：磁盘 `skills/<name>/SKILL.md` → 根目录 `build-skills-data.mjs`（生成 `data/skills-data.json`）→ 根目录 `build.mjs`（注入 `src/index.html` 模板）→ 预渲染进 `prototype/out/index.html` 静态产物（仓库已入库 `prototype/out/`，如需更新数据重跑两脚本即可）。
- 数据 Schema（实际为扁平结构）：`{ total:number, categories:string[], skills: Skill[] }`，其中 `Skill{ name, category, zh, description, allowedTools }`（字段名与 `openspec/project.md` §4.5 的 `name/en_name/dir/zh_desc/en_desc/...` 命名不同，以 `skills-data.json` 实际字段为准）。
- 分类英文名为文档映射（`tools/_skill_readme_lib.py` 的 `CATEGORY_EN`），非数据内嵌。
- 注意：`app/` 是项目**可运行 Web 应用**源码工作区（见 `app/README.md`），与 `prototype/`（预构建静态原型）分层；两者数据源均为磁盘 `skills/<name>/SKILL.md`。
- 红色底线：数据契约须与 `build-skills-data.mjs`/`build.mjs`、`openspec/project.md` 严格一致。

---

## 7. 技术栈（构建期，产物已预渲染）

- 原型为**纯静态原生实现**：`src/index.html`（HTML 模板）+ `src/styles/tokens.css` + `src/app.css`（设计令牌与组件样式，以 `:root` CSS 变量为唯一来源，非 Tailwind/HSL）+ `src/i18n.js`（独立国际化模块）+ `src/app.js`（原生 JS 渲染与交互，无 React/Next.js/Radix）。
- 构建：根目录 `build.mjs` 将 CSS/JS/数据内联进 `src/index.html` 生成自包含 `prototype/out/index.html`；无任何 npm 运行时依赖（仅 Node 内置模块）。
- 数据源：`skills/<name>/SKILL.md` → `build-skills-data.mjs` 生成 `data/skills-data.json` → `build.mjs` 注入并预渲染进 `prototype/out/index.html`。
- 分发形态：仓库保留 `prototype/src/` 源码与其构建产物 `prototype/out/index.html`、设计文档（`DESIGN.md` / `COMPONENTS.md`）。
- 部署：腾讯云 EdgeOne（`edgeone.json`，以 `prototype/out/` 为站点根目录；`installCommand` 跳过依赖安装，`buildCommand` 执行 `npm run build` 重新生成产物）。
