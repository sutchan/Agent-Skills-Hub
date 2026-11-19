# 组件库规范（Component Library Spec）

> 路径：`prototype/COMPONENTS.md` · 版本：1.16.22
> 配套 `DESIGN.md` 设计系统。本文规定每个组件的 **Props / 状态 / 用法 / 代码位置**，供后续开发与评审对齐。
> 原型落地为 **纯原生 HTML/CSS/JS**（非 React/Tailwind），样式由 `src/index.html` 内联 CSS 的 `:root` CSS 变量单一来源驱动，不手写重复 CSS。
>
> **实际交付形态（与 `docs/spec.md` 对齐）**：站点本体为自包含静态单页 `src/index.html`（内联 CSS + 内联 JS + 内联 `window.SKILLS_DATA`），由 `scripts/sync-inline-data.mjs` 注入数据；旧文档描述的 `prototype/src/parts/*` + `build.mjs` → `prototype/prototype.html` 构建流程已废弃。

代码位置（**设计参考 → 实现落点**）：下列组件均实现于单体文件 `src/index.html` 的内联脚本（非独立文件），此处仅标注对应职责：
- 设计令牌：`src/index.html` 顶部 `:root` CSS 变量（与 `DESIGN.md` 令牌表一一对应）
- 国际化：`src/index.html` 内联 `I18N.t()`（三语 `zh`/`tw`/`en` 状态 / 回退链 / DOM 同步；`html lang` 繁体为 `zh-Hant`）
- 交互与渲染：`src/index.html` 内联脚本（状态 / 渲染 / 详情弹窗与分享 / 主题语言事件 / 启动编排，按职责函数拆分，非独立文件）
- 页面模板：`src/index.html`

---

## 一、基础组件（Base · shadcn/ui 设计参考命名）

> 下文文件名（`components/ui/*.tsx`）为**历史 React 层记法存档**（该层已于 v1.16.x 移除）；当前运行实现均为 `src/index.html` 内联 CSS 类（变体/尺寸/状态语义不变）。

### 1. Button 按钮
文件：`src/index.html` 内联 `.btn` / `.btn-dice` / `.star-btn` 等（历史 React 层 `components/ui/button.tsx` 已移除）
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
文件：`src/index.html` 内联 `applyTheme()`
- 状态：`light`/`dark`（首次挂载读 `document.documentElement` 的 `data-theme` 属性）。
- 切换：内联脚本写根节点 `data-theme` 属性 + 写 `localStorage` 的 `ash-theme` key（`LS_THEME`）。
- 防闪烁：HTML 模板内联脚本在渲染前应用主题。
- 图标：`Moon`/`Sun`，`aria-label` 三语语义。

### 10. LangToggle 语言切换
文件：`src/index.html` 内联 `applyLang()` / `I18N.toggleLang()` 与 `#lang-btn`
- 受控：`state.lang: "zh" | "tw" | "en"`（优先级 简体中文 > 繁体中文 > 英语），写 `localStorage` 的 `ash-lang`（`LS_LANG`）+ 同步 `data-lang` 与 `<html lang>`（`zh` / `zh-Hant` / `en`）；读取时 `loadEnum` 枚举校验。
- 循环：中 → 繁 → EN → 中；设置面板另有「简体中文 / 繁體中文 / English」三选一。
- 形态：顶栏图标按钮 `.icon-btn`；**按钮文本显示「当前语言」短标**（中/繁/EN），`aria-pressed` 表示当前是否 en；`aria-label` 明确当前语言与下一次切换目标；tooltip 三语由 `data-tip-zh` / `data-tip-tw` / `data-tip-en` 驱动。

### 11. ViewToggle 视图切换
文件：`src/index.html` 内联（顶栏视图切换按钮组）
- 受控：`view: "grid" | "list"` + `onChange`。
- 图标 `LayoutGrid`/`Rows3`，选中项填充表面。

### 12. SkillCard 技能卡片
文件：`src/index.html` 内联 `cardHTML()`
Props：
```
{ skill: Skill, lang: "zh"|"tw"|"en", view: "grid"|"list", onOpen: (s)=>void, catEn: string }
```
渲染：分类（`category`/`enCategory`）→ 名称（`name` 英文目录名，卡片主标题）→ 中文描述（`description` 中文，`.desc.zh` 行）→ 英文描述（`enDescription`，详情页 en 视图/回退，`line-clamp-2`/列表 `line-clamp-1`）→ 授权工具（`allowedTools` 条件）。
交互：根节点为 **`<div class="card" role="button" tabindex="0">`**（v1.16.19 实态校正，卡片内含收藏/投票按钮故不能嵌套原生 button）；Enter/Space 由键盘处理触发，点击经 `#grid` 事件委托 → `openDetail(skill)`（v1.16.0 修复 double-open）。
布局：`view==="list"` 时横向；描述三级回退 `description → zh → enDescription`（v1.15.0），英文长 slug 用 `word-break` 防溢出（v1.17.0）。

### 13. SkillDetail 技能详情
实现：`src/index.html` 内联 `openDetail()` 渲染进 `#dialog`。
内容：头像 + 标题（`#dialogVisibleTitle`）→ 中文块 `#dialogBlockZh`（`.zh` 类）→ 英文块 `#dialogBlockEn`（`.en` 类）→ 分类 → 授权工具（条件渲染）→ 仓库链接按钮（绝对 GitHub 链接 `https://github.com/sutchan/Agent-Skills-Hub/tree/main/skills/<name>/`，由 `REPO_SKILLS_TREE` 常量维护；历史 app 层 `SkillDialog.tsx` 已移除，现仅内联实现）。
语言态：技能数据仅有简体中文块（`.zh`）与英文块（`.en`），由 `html[data-lang]` 全局显隐（v1.16.0）；en 态隐藏中文块，**tw 态隐藏简体块并回退「简体名 + 英文副标题」**（`html[data-lang="tw"] .card-title .en` / `.d-title .en` 恢复显示，因技能数据尚无繁体版）。UI 静态文案另有独立的 `.tw` 节点。
Dialog 由 `#dialog`（`role="dialog"` `aria-modal="true"` `aria-labelledby="dialogTitle"`）承载；文案用 `I18N.t()` 跟随当前语言（v1.16.0 去除硬编码 zh）。

### 14. CategoryFilter（Chip）
位置：`src/index.html` 内联 `renderCats()`。
数据源：内联数据 `categories[]`（去重中文分类名 `string[]`，由 sync:data 派生）+ `categoryEn{}`（中文→英文映射）+ 内置「全部」（`activeCat===null`）；计数由内联 `catCounts()` 预聚合为 `Map`。
交互：点击 `state.cat` 过滤（再次点击取消）；`aria-pressed` 反映选中；选中态主色高亮。chips 为原生 `<button>`（键盘 Tab 天然可达，移动端横向滚动容器自动跟随焦点）。

### 15. 主页面装配（合并自旧 Showcase.jsx）
文件：`src/index.html` 内联 `init()`
- 状态：`lang / view / query / activeCat / selected / theme`。
- 响应式：当前实现**桌面与移动端均用居中 Dialog**（`.sheet` 抽屉为预留未启用，v1.17.2 未接入 `matchMedia` 切换）。
- 布局：全宽栏（顶栏/控制/分类/页脚）内容限宽居中 `--maxw:1200px`；网格 `auto-fill minmax(260px,1fr)` 自适应列（v1.17.1）。
- 过滤：`state.cat` ∩ `state.q`（匹配 `name`/`zh`/`description`/`enDescription`/`category`，见内联 `matches(s, terms)`，词表预切分缓存）。

### 16. SettingsButton 设置按钮（v1.17.2 新增，文档 v1.18.0 同步）
位置：`src/index.html` 的 `#settings-btn`（顶部栏右上角）+ 内联 `openSettings()`。
行为：点击打开设置弹窗，**复用 `#dialog` 框架**（焦点陷阱/Esc/遮罩关闭）。
内容：四组切换 —— ①语言（`ash-lang` 持久化，触发 `applyLang`）；②主题（`ash-theme` 持久化，触发 `applyTheme`）；③视图模式 网格/列表（`ash-view` 持久化，`init()` 恢复并同步顶栏 `.view-btn` active）；④显示密度 舒适/紧凑（`ash-density` 持久化，触发 `applyDensity`，CSS `:root[data-density="compact"]` 控制间距）。全部切换就地刷新动态文案（`refreshSettingsBody()`，不重建弹窗避免焦点陷阱监听累积）。
样式：`.icon-btn`（34px、flex 居中、`aria-label`）；弹窗内 `.settings-row`/`.settings-label`；各切换项为 `<button aria-pressed>`。

---

## 三、组件使用红线

1. 新组件须复用 `DESIGN.md` / `src/index.html` 顶部 tokens 段的 CSS 变量（`--surface`/`--text-2`/`--shadow-card` 等），禁止硬编码颜色/间距值。
2. 图标统一用 `src/index.html` 内联 SVG（lucide 风格），禁止引入其他图标库或重复手绘。
3. 所有可交互元素须有 `aria-label` 或语义角色；弹窗标题用 `sr-only`（`.sr-only` 工具类）保证可访问性。
4. 动效时长只允许 ~200ms 基准 + `ease`，且全局兼容 `prefers-reduced-motion`（已在 tokens 中 transition 约束）。
5. 业务数据只读来自 `data/skills-data.json`（扁平结构 `skill{name,category,enCategory,zh,description(中文),enDescription(英文),allowedTools,hidden}` + 根级 `categoryEn{}`），不内联假数据。
6. 组件样式统一内联定义在 `src/index.html`（`:root` tokens + 组件样式段），保持与令牌同源；历史 `src/styles/*.css` 已移除，不得重建独立样式文件。
