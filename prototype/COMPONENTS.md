# 组件库规范（Component Library Spec）

> 路径：`prototype/COMPONENTS.md` · 版本：1.20.57
> 配套 `DESIGN.md` 设计系统。本文规定每个组件的 **Props / 状态 / 用法 / 代码位置**，供后续开发与评审对齐。
> 原型落地为 **纯原生 HTML/CSS/JS**（非 React/Tailwind），样式由 `src/styles/tokens.css` + `src/styles/base.css`/`layout.css`/`components.css`/`responsive.css` 的 `:root` CSS 变量单一来源驱动，不手写重复 CSS。
>
> **原型落地（v1.12.0）**：`prototype/prototype.html` 用纯 HTML/CSS/JS 实现下表组件（顶栏、Hero、搜索、视图切换、分类条、卡片网格/列表、详情 Dialog），状态与交互由 `prototype/src/parts/*.js` 管理（01-state 常量/偏好/工具、02-render 渲染、03-detail 弹窗与分享、04-interactions 主题/语言/事件、05-main 启动编排），国际化由 `prototype/src/i18n.js` 驱动，无需框架运行时。

代码位置（**原型源码映射**，源码在 `prototype/src/` 随仓库分发，由 `tools/build.mjs` 合并 `data/skills-data.json` + `data/skills-metrics.json` 内联为静态产物 `prototype/prototype.html`）：
- 设计令牌：`src/styles/tokens.css`(`:root` CSS 变量) + `src/styles/components.css`(组件样式)
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
文件：`src/parts/04-interactions.js` 的 `applyLang()` / `src/index.html` 的 `#langBtn`（原型）
- 受控：`state.lang: "zh" | "en"`，写 `localStorage` 的 `ash-lang`（`LS_LANG`）+ 同步 `<html lang>` 与 `data-lang`。
- 形态：顶栏图标按钮 `.icon-btn`；**按钮文本显示「当前语言」**（中/EN），`aria-pressed` 表示当前是否 en（v1.15.0 方案 A：文本与读屏语义一致）；`aria-label` 明确当前语言与切换意图。

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
渲染：分类（`category`/`enCategory`）→ 名称（`name` 英文目录名，卡片主标题）→ 中文描述（`description` 中文，`.desc.zh` 行）→ 英文描述（`enDescription`，详情页 en 视图/回退，`line-clamp-2`/列表 `line-clamp-1`）→ 授权工具（`allowedTools` 条件）。
交互：**原生 `<button type="button" class="card">`**，Enter/Space 原生触发；点击经 `#grid` 事件委托 → `openDetail(skill)`（v1.16.0 修复 double-open，移除冗余 keydown 委托）。
布局：`view==="list"` 时横向；描述三级回退 `description → zh → enDescription`（v1.15.0），英文长 slug 用 `word-break` 防溢出（v1.17.0）。

### 13. SkillDetail 技能详情
实现：`src/parts/03-detail.js` 的 `openDetail()` 渲染进 `#dialog`。
内容：头像 + 标题（`#dialogVisibleTitle`）→ 中文块 `#dialogBlockZh`（`.zh` 类）→ 英文块 `#dialogBlockEn`（`.en` 类）→ 分类 → 授权工具（条件渲染）→ 仓库链接按钮（绝对 GitHub 链接 `https://github.com/sutchan/Agent-Skills-Hub/tree/main/skills/<name>/`，由 `REPO_SKILLS_TREE` 常量维护，与 app 层 `SkillDialog.tsx` 硬编码实现保持一致）。
语言态：中/英描述块**整块加 `.zh`/`.en` 类**，由 `html[data-lang]` 全局显隐（v1.16.0），en 态彻底隐藏中文块。
Dialog 由 `#dialog`（`role="dialog"` `aria-modal="true"` `aria-labelledby="dialogTitle"`）承载；文案用 `I18N.t()` 跟随当前语言（v1.16.0 去除硬编码 zh）。

### 14. CategoryFilter（Chip）
位置：`src/parts/02-render.js` 的 `renderCats()`（原型）/ `app/page.tsx`（应用层）。
数据源：`categories[]`（去重中文分类名 `string[]`）+ `categoryEn{}`（中文→英文映射）+ 内置「全部」（`activeCat===null`）；计数由 `02-render.js` 的 `catCounts()` 预聚合为 `Map`。
交互：点击 `state.cat` 过滤（再次点击取消）；`aria-pressed` 反映选中；选中态主色高亮。chips 为原生 `<button>`（键盘 Tab 天然可达，移动端横向滚动容器自动跟随焦点）。

### 15. 主页面装配（合并自旧 Showcase.jsx）
文件：`src/parts/05-main.js` 的 `init()`（原型）/ `app/page.tsx`（应用层）
- 状态：`lang / view / query / activeCat / selected / theme`。
- 响应式：当前实现**桌面与移动端均用居中 Dialog**（`.sheet` 抽屉为预留未启用，v1.17.2 未接入 `matchMedia` 切换）。
- 布局：全宽栏（顶栏/控制/分类/页脚）内容限宽居中 `--maxw:1200px`；网格 `auto-fill minmax(260px,1fr)` 自适应列（v1.17.1）。
- 过滤：`state.cat` ∩ `state.q`（匹配 `name`/`zh`/`description`/`enDescription`/`category`，见 `01-state.js` 的 `matches(s, terms)`，词表预切分缓存）。

### 16. SettingsButton 设置按钮（v1.17.2 新增，文档 v1.18.0 同步）
位置：`src/index.html` 的 `#settingsBtn`（顶部栏右上角）+ `src/parts/03-detail.js` 的 `openSettings()`。
行为：点击打开设置弹窗，**复用 `#dialog` 框架**（焦点陷阱/Esc/遮罩关闭）。
内容：四组切换 —— ①语言（`ash-lang` 持久化，触发 `applyLang`）；②主题（`ash-theme` 持久化，触发 `applyTheme`）；③视图模式 网格/列表（`ash-view` 持久化，`init()` 恢复并同步顶栏 `.view-btn` active）；④显示密度 舒适/紧凑（`ash-density` 持久化，触发 `applyDensity`，CSS `:root[data-density="compact"]` 控制间距）。全部切换就地刷新动态文案（`refreshSettingsBody()`，不重建弹窗避免焦点陷阱监听累积）。
样式：`.icon-btn`（34px、flex 居中、`aria-label`）；弹窗内 `.settings-row`/`.settings-label`；各切换项为 `<button aria-pressed>`。

---

## 三、组件使用红线

1. 新组件须复用 `DESIGN.md` / `src/styles/tokens.css` 的 CSS 变量（`--surface`/`--text-2`/`--shadow-card` 等），禁止硬编码颜色/间距值。
2. 图标统一用 `src/index.html` 内联 SVG（lucide 风格），禁止引入其他图标库或重复手绘。
3. 所有可交互元素须有 `aria-label` 或语义角色；弹窗标题用 `sr-only`（`.sr-only` 工具类）保证可访问性。
4. 动效时长只允许 ~200ms 基准 + `ease`，且全局兼容 `prefers-reduced-motion`（已在 tokens 中 transition 约束）。
5. 业务数据只读来自 `data/skills-data.json`（扁平结构 `skill{name,category,enCategory,zh,description(中文),enDescription(英文),allowedTools,hidden}` + 根级 `categoryEn{}`），不内联假数据。
6. 组件样式优先定义在 `src/styles/`（`tokens.css`/`base.css`/`layout.css`/`components.css`/`responsive.css`），保持与令牌同源。
