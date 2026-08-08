# 组件库规范（Component Library Spec）

> 路径：`prototype/COMPONENTS.md` · 版本：1.7.0
> 配套 `DESIGN.md` 设计系统。本文规定每个组件的 **Props / 状态 / 用法 / 代码位置**，供后续开发与评审对齐。
> 所有组件基于 **shadcn/ui（new-york）+ Tailwind CSS** 构建，样式由 `tailwind.config.ts` 的 Token 驱动，不手写重复 CSS。

代码位置：
- 基础/复合 UI 原语：`prototype/components/ui/*`
- 业务组件：`prototype/components/*`
- 页面装配：`prototype/app/page.tsx`（原 `Showcase.jsx` 已合并入此，冗余文件已删除）
- 设计令牌：`prototype/app/globals.css` + `prototype/tailwind.config.ts`

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
`asChild`：通过 Radix `Slot` 将样式应用到 `<a>`（如 GitHub 外链）。

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
文件：`components/ui/dialog.tsx`（Radix Dialog）
入场：`data-[state=open]:animate-pop-in` + 遮罩 `animate-fade-in`。
结构：`Dialog > DialogContent > DialogHeader > DialogTitle(sr-only) + SkillDetail`。
行为：原生 `Esc` 关闭、点遮罩关闭、焦点陷阱、`aria-modal`。

### 8. Sheet 抽屉（移动详情）
文件：`components/ui/sheet.tsx`（Radix Dialog 改右侧抽屉）
入场：`animate-slide-in-right` / 关闭 `animate-slide-out-right`。
`side="right"`，`sm:max-w-md`。结构与 Dialog 对齐，共用 `SkillDetail`。

---

## 二、业务组件（Domain · `components`）

### 9. ThemeToggle 主题切换
文件：`components/theme-toggle.tsx`
- 状态：`dark`（首次挂载读 `document.documentElement.classList`）。
- 切换：toggle 根节点 `dark` 类 + 写 `localStorage.ash-theme`。
- 防闪烁：`layout.tsx` 首屏内联脚本在渲染前应用主题。
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
渲染：分类（`catEn`）→ 名称 → 别名（`en_name && en_name!==name` 时，`font-mono`）→ 描述（按语言回退，`line-clamp-2`/列表 `line-clamp-1`）→ 资源徽章（`has_scripts/references/assets` 条件）→ 关键词标签（`#tags`，由 `build_site` 从目录名派生，每张卡片必有）。
交互：`role="button"` + `tabIndex=0` + `Enter/Space` → `onOpen(skill)`。
布局：`view==="list"` 时 `flex items-start gap-4` 横向。

### 13. SkillDetail 技能详情
文件：`components/skill-detail.tsx`
Props：`{ skill: Skill, lang, catEn }`。
内容：标题 + 分类 Badge → 别名 → 描述 → 目录 `code` 块 → 资源标签组 → 关键词标签（`#tags`）→ 仓库外链 `ExternalLink`（指向 `{repo}/tree/main/{skill.dir}`，`repo` 取自 `skills.json` 的 `meta.repo`）。

> 说明：仓库内 Markdown 文档（README / CONTRIBUTING 等）中的技能链接使用相对路径
> `skills/<name>/`，由 GitHub 自动解析；原型站点因跨域需外链，使用上述绝对 GitHub URL。
Dialog 与 Sheet 共用此内容体。

### 14. CategoryFilter（Chip）
位置：`app/page.tsx` 内联 `Chip` 子组件。
数据源：`categories[]` + 内置「全部」（`activeCat===null`）。
交互：点击 `setActiveCat`（再次点击取消）；`aria-pressed` 反映选中；选中态 `border-primary bg-primary text-primary-foreground`。

### 15. 主页面装配（合并自旧 Showcase.jsx）
文件：`app/page.tsx`
- 状态：`lang / view / query / activeCat / selected / sheetOpen / isMobile / loading`。
- 响应式：`matchMedia("(max-width:640px)")` 决定详情用 Dialog 还是 Sheet。
- 载入：120ms 骨架屏（`setLoading(false)`），SSG 下近乎瞬时但保证体验一致。
- 过滤 `useMemo`：`activeCat` ∩ `query`（匹配 name/en_name/双语 desc/category）。

---

## 三、组件使用红线

1. 新组件须复用 `DESIGN.md` 的 Tailwind Token（`bg-card`/`text-muted-foreground`/`shadow-md` 等），禁止硬编码颜色/间距值。
2. 图标统一用 `components/icons.tsx` 本地内联 SVG 集（lucide 风格），禁止引入其他图标库或重复手绘。
3. 所有可交互元素须有 `aria-label` 或语义角色；弹窗标题用 `sr-only` 保证可访问性。
4. 动效时长只允许 200ms 基准 + `ease-out-quint`，且全局兼容 `prefers-reduced-motion`。
5. 业务组件数据只读来自 `skills.json`，不内联假数据。
6. 新增 UI 原语优先从 shadcn/ui 复制（new-york 风格），保持组件同源。
