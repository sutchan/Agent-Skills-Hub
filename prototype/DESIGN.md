# Agent Skills Hub · 原型设计规范（Design Spec）

> 路径：`prototype/DESIGN.md` · 版本：1.5.0
> 本文档是原型设计的事实来源（Single Source of Truth），涵盖设计原则、设计系统、组件库、交互标准与响应式规范。
> 适用目录：`prototype/`（原 `site/`，已移入并重命名）。

---

## 1. 设计原则

| 原则 | 说明 |
|------|------|
| 极简（Minimal） | 克制的视觉语言，留白即设计；单一主色，避免渐变滥用与装饰性元素 |
| 层级清晰（Hierarchy） | 通过字号、字重、色彩对比建立明确的信息层级，首屏 3 秒可读懂核心 |
| 一致（Consistent） | 所有间距、圆角、阴影、动效遵循统一 Token，组件同源 |
| 真实（Real Data） | 原型读取 `data/skills.json`（由 `build_site.py` 从磁盘 SKILL.md 生成），非占位假数据 |
| 无障碍（Accessible） | 对比度 ≥ WCAG AA，键盘可达，支持 `prefers-reduced-motion` |

---

## 2. 设计系统（Design Tokens）

设计 Token 以 CSS 变量定义在 `app/globals.css` 的 `:root`（浅色）与 `:root[data-theme="dark"]`（深色）中，是全局唯一来源。

### 2.1 色彩

| Token | 浅色 | 深色 | 用途 |
|-------|------|------|------|
| `--bg` | `#fafafa` | `#09090b` | 页面背景 |
| `--surface` | `#ffffff` | `#131316` | 卡片/弹窗表面 |
| `--surface-2` | `#f4f4f5` | `#1c1c20` | 次级表面（按钮、标签底） |
| `--surface-3` | `#ececee` | `#26262b` | 三级表面 |
| `--border` | `#e4e4e7` | `#27272a` | 默认边框 |
| `--border-strong` | `#d4d4d8` | `#3f3f46` | 悬停边框 |
| `--text` | `#18181b` | `#fafafa` | 主文字 |
| `--text-2` | `#3f3f46` | `#e4e4e7` | 次要文字 |
| `--muted` | `#71717a` | `#a1a1aa` | 辅助文字 |
| `--muted-2` | `#a1a1aa` | `#71717a` | 禁用/极弱 |
| `--primary` | `#4f46e5` | `#818cf8` | **主色（单一靛蓝）** |
| `--primary-hover` | `#4338ca` | `#a5b4fc` | 主色悬停 |
| `--primary-soft` | `#eef2ff` | `#1e1b4b` | 主色浅底（聚焦环、徽章） |
| `--primary-soft-border` | `#c7d2fe` | `#3730a3` | 主色浅底边框 |
| `--accent` | `#059669` | `#34d399` | 强调（状态标签，低频使用） |
| `--accent-soft` / `--accent-border` | `#ecfdf5` / `#a7f3d0` | `#052e1a` / `#065f46` | 强调浅底 |

色彩纪律：**主色仅用于主按钮、聚焦态、分类标识、选中态**；强调色仅用于 `scripts/references/assets` 等资源标签。禁止大面积渐变背景（Hero 仅保留极淡的光晕 `radial-gradient`，透明度 ≤ 0.6）。

### 2.2 字体

| Token | 值 |
|------|----|
| `--font-sans` | `Inter, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif` |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` |

- 基础字号 `15px`，行高 `1.6`
- 大标题 `clamp(34px, 5.5vw, 52px)`，字重 `700`，字距 `-0.02em`
- 卡片标题 `16px`，字重 `650`，字距 `-0.01em`
- 英文 UI 文案首字母大写，中文不加字距

### 2.3 间距（4 的倍数尺度）

| Token | 值 | 典型用途 |
|-------|----|---------|
| `--sp-1` | 4px | 标签内边距微调 |
| `--sp-2` | 8px | 元素间紧凑间距 |
| `--sp-3` | 12px | chip/标签内边距 |
| `--sp-4` | 16px | 卡片内边距基准 |
| `--sp-5` | 24px | 区块/工具栏内边距 |
| `--sp-6` | 32px | 容器/章节间距 |
| `--sp-7` | 48px | Hero 内边距、弹窗内边距 |
| `--sp-8` | 64px | 大区块间距 |

### 2.4 圆角

| Token | 值 | 用途 |
|-------|----|------|
| `--r-sm` | 8px | 标签、输入框 |
| `--r-md` | 12px | 按钮、搜索框 |
| `--r-lg` | 16px | 卡片（默认 `--radius`） |
| `--r-xl` | 20px | 弹窗、统计条 |
| `--r-pill` | 999px | chip、徽章、按钮胶囊 |

### 2.5 阴影（分层次，浅而柔）

| Token | 值 |
|-------|----|
| `--shadow-xs` | `0 1px 2px rgba(24,24,27,.04)` |
| `--shadow-sm` | `0 1px 3px rgba(24,24,27,.06), 0 1px 2px rgba(24,24,27,.04)` |
| `--shadow-md` | `0 4px 12px rgba(24,24,27,.07), 0 2px 4px rgba(24,24,27,.04)` |
| `--shadow-lg` | `0 12px 32px rgba(24,24,27,.10), 0 4px 8px rgba(24,24,27,.05)` |

### 2.6 图标

- 全部使用**内联 SVG**（无外部依赖），描边图标 `strokeWidth=2`、圆角端点；填充图标仅用于搜索/主题切换。
- 图标尺寸统一 `18–20px`；图标按钮点击区 `46×46px`（移动端 `42×42px`）。
- 图标颜色继承 `currentColor`，随状态变化。
- 图标集集中在 `Showcase.jsx` 的 `Icon` 对象：`search / sun / moon / grid / list / empty`。

### 2.7 动效（Motion）

| Token | 值 |
|-------|----|
| `--ease` | `cubic-bezier(0.22, 1, 0.36, 1)`（easeOutQuint，顺滑收尾） |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--dur-fast` | 140ms |
| `--dur` | 220ms |
| `--dur-slow` | 360ms |

动效纪律：
- 交互反馈（hover/active）仅用 `--dur-fast`，位移 ≤ 3px。
- 弹窗：`fade`（背景）+ `pop`（卡片，`translateY(12px)→0, scale .98→1`）。
- 必须尊重 `prefers-reduced-motion: reduce`——所有动画/过渡降为 `0.001ms`。

---

## 3. 组件库（Component Library）

组件分三类：**基础（Base）**、**复合（Composite）**、**业务（Domain）**。以下为规范与代码位置（`app/Showcase.jsx` + `app/globals.css`）。

### 3.1 基础组件（Base）

| 组件 | 类名 / 元素 | 状态 | 规范 |
|------|------------|------|------|
| 按钮 Button | `.btn` / `.btn-primary` / `.btn-ghost` | default / hover / active | 主按钮填充主色+阴影；幽灵按钮描边。active 下移 1px |
| 图标按钮 IconButton | `.icon-btn` | default / hover / active / `.active`(选中) | 46×46，选中态填充主色反白 |
| 标签 Tag | `.tag` / `.tag.has` | default / has | 浅底描边；`.has` 用强调色（绿）表示资源存在 |
| Chip 分类筛选 | `.chip` | default / hover / `.active` | 胶囊，选中态反色（`--text` 底 + `--bg` 字） |
| 输入框 Input | `#search` | default / focus | focus 主色边框 + 4px 主色浅底聚焦环 |

### 3.2 复合组件（Composite）

| 组件 | 结构 | 规范 |
|------|------|------|
| Hero | `.hero > .hero-inner > .badge + h1 + .subtitle + .stats + .cta` | 居中、极淡光晕；标题字距收紧；统计条为胶囊卡片 |
| Stat 统计条 | `.stats > .stat` | 两个数据（技能数/分类数），分隔竖线 |
| Toolbar | `.toolbar > .toolbar-top + .filters` | sticky 吸顶，`scrolled` 态显示底边框；搜索框 + 三个图标按钮 + 分类 chip 横滑 |
| Grid 网格 | `.grid` / `.grid.list` | `auto-fill minmax(300px,1fr)`；列表态单列、行内布局 |
| Card 卡片 | `.card > .card-cat + .card-name + .card-alias? + .card-desc + .card-foot` | hover 上移 3px + 阴影提升 + 极淡主色光晕；`:focus-visible` 主色聚焦环 |
| Modal 弹窗 | `.modal > .modal-backdrop + .modal-card` | 居中、最大宽 620px、最大高 88vh、滚动；Esc 关闭、点背景关闭、锁滚动 |
| Empty 空状态 | `.empty` | 图标 + 标题 + 描述，虚线边框卡片 |

### 3.3 业务组件（Domain）

| 组件 | 数据来源 | 说明 |
|------|----------|------|
| SkillCard | `skills[].{name,en_name,category,zh_desc,en_desc,has_*}` | 展示单技能；`en_name` 与 `name` 不同才显示别名行 |
| SkillModal | 同上 + `dir` | 详情弹窗；"查看 SKILL.md"链接到 `repo/tree/main/skills/{dir}/SKILL.md` |
| CategoryFilter | `categories[].{name,en,count}` | 由磁盘分类动态生成，附加「全部」项 |
| LangSwitch / ThemeSwitch | `localStorage` + `data-theme`/`data-lang` | 中英切换、深浅主题切换，持久化 |
| ViewToggle | `view: grid | list` | 网格/列表切换，状态反映到 `.grid` 类名 |

---

## 4. 交互标准（Interaction Standards）

### 4.1 模式（Patterns）

- **单一主任务流**：浏览 → 搜索/筛选 → 查看详情（弹窗）→ 跳转仓库。无多级路由，详情用模态而非新页面（保持原型轻量）。
- **即时筛选**：搜索与分类筛选为受控状态、实时过滤，无需提交按钮。
- **双语即时切换**：语言切换即时重渲 UI 文案与分类英文名，不刷新。

### 4.2 反馈（Feedback）

| 场景 | 反馈 |
|------|------|
| 输入聚焦 | 主色边框 + 4px 主色浅底聚焦环 |
| 按钮悬停/点击 | 颜色/阴影变化，active 下移 1px |
| 卡片悬停 | 上移 3px + 阴影提升 + 极淡光晕 |
| 筛选结果变化 | `result-count` 用 `aria-live="polite"` 播报数量 |
| 弹窗打开 | 背景 `fade` + 卡片 `pop` 入场 |

### 4.3 错误（Error）

- 原型为只读展示，无表单提交错误。
- 边界情况：技能 `zh_desc`/`en_desc` 缺失时回退到另一语言（`lang ? en_desc || zh_desc : zh_desc || en_desc`）。
- 仓库链接指向 `main` 分支固定路径，避免 404（若子路径不存在由 GitHub 处理）。

### 4.4 空状态（Empty）

- 搜索/筛选无结果时显示 `.empty`：图标 + 标题「没有匹配的技能」+ 描述「换个关键词或分类试试」。
- 不显示空白页；保持布局稳定。

### 4.5 键盘与可达性

- 卡片 `role="button"` + `tabIndex=0`，支持 `Enter`/`Space` 打开。
- 弹窗支持 `Esc` 关闭、`role="dialog"` `aria-modal="true"`。
- 分类 chip 用 `role="tab"` + `aria-selected`。
- 所有图标按钮带 `aria-label`。

---

## 5. 响应式（Responsive）

| 断点 | 布局 |
|------|------|
| ≥ 721px | 网格 `minmax(300px,1fr)` 自适应多列；工具栏横排 |
| ≤ 720px | 网格单列；列表视图卡片自动换行；统计条缩小 |
| ≤ 420px | 图标按钮缩至 42px，间距收紧 |

- 移动端优先保证触控目标 ≥ 42px。
- 分类 chip 横向滚动（`scrollbar-width: none` 隐藏滚动条）。

---

## 6. 数据架构（Data Contract）

- **单一事实来源**：磁盘 `skills/<name>/SKILL.md` → `build_site.py` → `data/skills.json` → 原型读取。
- `skills.json` Schema（详见 `openspec/project.md` §4.5）：`meta{count,author,repo,generated_at}` + `categories[]{name,en,count}` + `skills[]{name,en_name,dir,category,zh_desc,en_desc,has_scripts,has_references,has_assets}`。
- 分类英文名为数据驱动（`categories[].en`），非硬编码。
- 红色底线：数据契约须与 `build_site.py`、`openspec/project.md` 严格一致。

---

## 7. 技术栈

- Next.js 15（App Router）+ React 19，静态导出（`output: "export"`），无服务端。
- 部署：腾讯云 EdgeOne（`edgeone.json`，`cd prototype && npm run build`，输出 `./prototype/out`）。
- 无外部 UI 库、无图标库依赖（全部内联）。
