# 组件库规范（Component Library Spec）

> 路径：`prototype/COMPONENTS.md` · 版本：1.14.42
> 配套 `DESIGN.md` 设计系统。本文规定每个组件的 **Props / 状态 / 用法 / 代码位置**，供后续开发与评审对齐。
> 原型落地为 **纯原生 HTML/CSS/JS**（非 React/Tailwind），样式由 `src/styles/tokens.css` + `src/app.css` 的 `:root` CSS 变量单一来源驱动，不手写重复 CSS。
>
> **原型落地（v1.12.0）**：`prototype/index.html` 用纯 HTML/CSS/JS 实现下表组件（顶栏、Hero、搜索、视图切换、分类条、卡片网格/列表、详情 Dialog），状态与交互由 `prototype/src/parts/*.js` 管理（01-state 常量/偏好/工具、02-render 渲染、03-detail 弹窗与分享、04-interactions 主题/语言/事件、05-main 启动编排），国际化由 `prototype/src/i18n.js` 驱动，无需框架运行时。

代码位置（**原型源码映射**，源码在 `prototype/src/` 随仓库分发，由 `build.mjs` 内联为静态产物 `prototype/index.html`）：
- 设计令牌：`src/styles/tokens.css`(`:root` CSS 变量) + `src/app.css`(组件样式)
- 国际化：源码 `src/i18n.js`（`I18N.t()` / 语言状态 / DOM 同步）
- 交互与渲染：源码 `src/parts/*.js`（按序拼接：`01-state` 常量与工具、`02-render` 渲染、`03-detail` 弹窗与分享、`04-interactions` 主题/语言/事件、`05-main` 启动编排）
- 页面模板：源码 `src/index.html`

---

## 一、基础组件（Base · `components/ui`）

### 1. Button 按钮
文件：`components/ui/button.tsx`
| 变体 | 外观 | 用途 |
|------|------|------|
| `default` | 填充主色 + `shadow-xs` | 主行动（查看仓库、弹窗内跳转） |
| `secondary` | 次级表面底 | 次行动 |
| `outline` | 描边 + 背景 | 中性次行动 |
| `ghost` | 透明悬停底 | 图标/低强调 |

尺寸：`default`(h-10) / `sm`(h-8) / `lg`(h-11) / `icon`(h-10 w-10)。
状态：`hover`（变深/阴影提升）、`active:scale-[0.98]`、`focus-visible:ring-2 ring-ring ring-offset-2`。
`asChild`：通过 Radix `Slot` 将样式应用到 `<a>`（如 GitHub 外链，app 层实现）。

### 2. Input 输入
文件：`components/ui/input.tsx`
`type="search"`，左内嵌 `Search` 图标（`pointer-events-none absolute`）。
聚焦：`focus-visible:ring-2 ring-ring ring-offset-2`。

### 3. Badge 徽章
文件：`components/ui/badge.tsx`
变体：`default`(主色) / `secondary` / `outline` / `muted` / `accent`。
用途：分类标签（`muted`）、Hero 计数（`accent`）。`text-2xs`（11px）小字。

### 4. Card 卡片
文件：`components/ui/card.tsx`
结构：`Card > CardHeader > CardTitle` + `CardContent`。
默认 `rounded-lg border bg-card shadow-sm`，hover 态由业务组件附加。

### 5. Skeleton 骨架
文件：`components/ui/skeleton.tsx`
`animate-pulse rounded-md bg-muted`。首屏载入占位（9 个，grid/list 自适应高度）。

### 6. Separator 分隔线
文件：`components/ui/separator.tsx`
`horizontal` / `vertical`，`bg-border`。详情弹窗内分区。

### 7. Dialog 弹窗（桌面详情）
文件：`components/ui/dialog.tsx`（Radix Dialog，app 层实现）
入场：`data-[state=open]:animate-pop-in` + 遮罩 `animate-fade-in`。
结构：`Dialog > DialogContent > DialogHeader > DialogTitle(sr-only) + SkillDetail`。
行为：原生 `Esc` 关闭、点遮罩关闭、焦点陷阱、`aria-modal`。

### 8. Sheet 抽屉（移动详情）
文件：`components/ui/sheet.tsx`（Radix Dialog 改右侧抽屉，app 层实现）
入场：`animate-slide-in-right` / 关闭 `animate-slide-out-right`。
`side="right"`，`sm:max-w-md`。结构与 Dialog 对齐，共用 `SkillDetail`。

---

## 二、业务组件（Domain · `components`）

### 9. ThemeToggle 主题切换
文件：`components/theme-toggle.tsx`（原型对应 `src/parts/04-interactions.js` 的 `applyTheme()`）
- 状态：`light`/`dark`（首次挂载读 `document.documentElement` 的 `data-theme` 属性）。
- 切换：`04-interactions.js` 写根节点 `data-theme` 属性 + 写 `localStorage` 的 `ash-theme` key（见 `01-state.js` 的 `LS_THEME`）。
- 防闪烁：HTML 模板内联脚本在渲染前应用主题。
- 图标：`Moon`/`Sun`，`aria-label` 双语语义。

### 10. LangToggle 语言切换
文件：`components/lang-toggle.tsx`
- 受控：`lang: "zh" | "en"` + `onChange`。
- 形态：`bg-muted` 胶囊组，选中项 `bg-background shadow-xs`。
- 语义：`role="group"` + 按钮 `aria-pressed`。

### 11. ViewToggle 视图切换
文件：`components/view-toggle.tsx`
- 受控：`view: "grid" | "list"` + `onChange`。
- 图标 `LayoutGrid`/`Rows3`，选中项填充表面。

### 12. SkillCard 技能卡片
文件：`components/skill-card.tsx`
Props：
```
{ skill: Skill, lang: "zh"|"en", view: "grid"|"list", onOpen: (s)=>void, catEn: string }
```
渲染：分类（`catEn`）→ 名称（`name` 英文目录名，卡片主标题）→ 中文描述（`zh`，`.desc.zh` 行）→ 英文描述（`description` 详情页 en 视图/回退，`line-clamp-2`/列表 `line-clamp-1`）→ 授权工具（`allowedTools` 条件）→ 关键词标签（`#tags`，由 `build.mjs` 从目录名派生，每张卡片必有）。
交互：`role="button"` + `tabIndex=0` + `Enter/Space` → `onOpen(skill)`。
布局：`view==="list"` 时 `flex items-start gap-4` 横向。

### 13. SkillDetail 技能详情
实现：`src/parts/03-detail.js` 的 `openDetail()` 渲染进 `#dialog`。
内容：头像 + 标题（`#dialogVisibleTitle`）+ 英文别名 → 中文描述（`#dialogBlockZh`）→ 英文描述（`#dialogBlockEn`）→ 分类（`#dialogBlockCat`）→ 授权工具（`#dialogBlockTools`，条件渲染）→ 仓库链接按钮（绝对 GitHub 链接 `https://github.com/sutchan/Agent-Skills-Hub/tree/main/skills/<name>/`，由 `REPO_SKILLS_TREE` 常量维护，与 app 层 `SkillDialog.tsx` 硬编码实现保持一致）。
Dialog 由 `#dialog`（`role="dialog"` `aria-modal="true"` `aria-labelledby="dialogTitle"`）承载。

### 14. CategoryFilter（Chip）
位置：`src/parts/04-interactions.js` 的 `bindChips()`（原型）/ `app/page.tsx`（应用层）。
数据源：`categories[]`（对象数组 `{name, count}`）+ 内置「全部」（`activeCat===null`）；计数由 `01-state.js` 的 `catCounts()` 按 `state.categories` 聚合。
交互：点击 `setActiveCat`（再次点击取消）；`aria-pressed` 反映选中；选中态 `border-primary bg-primary text-primary-foreground`。

### 15. 主页面装配（合并自旧 Showcase.jsx）
文件：`app/page.tsx`
- 状态：`lang / view / query / activeCat / selected / sheetOpen / isMobile / loading`。
- 响应式：`matchMedia("(max-width:640px)")` 决定详情用 Dialog 还是 Sheet。
- 载入：120ms 骨架屏（`setLoading(false)`），SSG 下近乎瞬时但保证体验一致。
- 过滤：`state.cat` ∩ `state.q`（匹配 `name`/`zh`/`description`/`category`，见 `src/parts/01-state.js` 的 `matches()`）。

---

## 三、组件使用红线

1. 新组件须复用 `DESIGN.md` / `src/styles/tokens.css` 的 CSS 变量（`--surface`/`--text-2`/`--shadow-card` 等），禁止硬编码颜色/间距值。
2. 图标统一用 `src/index.html` 内联 SVG（lucide 风格），禁止引入其他图标库或重复手绘。
3. 所有可交互元素须有 `aria-label` 或语义角色；弹窗标题用 `sr-only`（`.sr-only` 工具类）保证可访问性。
4. 动效时长只允许 ~200ms 基准 + `ease`，且全局兼容 `prefers-reduced-motion`（已在 tokens 中 transition 约束）。
5. 业务数据只读来自 `data/skills-data.json`（扁平结构 `skill{name,category,zh,description,allowedTools}`），不内联假数据。
6. 组件样式优先定义在 `src/styles/` 或 `src/app.css`，保持与令牌同源。
