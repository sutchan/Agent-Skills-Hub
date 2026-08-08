# 组件库规范（Component Library Spec）

> 路径：`prototype/COMPONENTS.md` · 版本：1.5.0
> 配套 `DESIGN.md` 设计系统。本文规定每个组件的 **Props / 状态 / 用法 / 代码位置**，供后续开发与评审对齐。

代码位置统一在：
- 结构 & 逻辑：`prototype/app/Showcase.jsx`
- 样式：`prototype/app/globals.css`

---

## 一、基础组件（Base）

### 1. Button 按钮
| 变体 | 类名 | 外观 | 用途 |
|------|------|------|------|
| 主按钮 | `.btn .btn-primary` | 填充主色 + 阴影 | 主行动（查看仓库、弹窗内跳转） |
| 幽灵按钮 | `.btn .btn-ghost` | 描边 + 表面底 | 次行动（安装指南） |

状态：`hover`（主按钮变深 + 阴影提升）、`active`（`translateY(1px)`）、`focus-visible`（主色聚焦环）。
尺寸：内边距 `12px 20px`，圆角 `12px`，字号 `14px` 字重 `600`。

### 2. IconButton 图标按钮
类名：`.icon-btn`，可选 `.active`（选中态填充主色反白）。
尺寸：`46×46px`（移动端 `42×42px`），圆角 `12px`。
状态：`hover`（边框变深）、`active`（`scale(0.96)`）。
实例：语言切换（中/EN 文字）、主题切换（日/月图标）、视图切换（grid/list 图标）。

### 3. Tag 标签
类名：`.tag`，资源存在时追加 `.has`。
- 默认：灰底灰字（中性）
- `.has`：绿色强调底（`--accent-soft` + `--accent-border`），用于 `scripts / references / assets`
用途：卡片与弹窗内展示技能附带的资源类型。

### 4. Chip 分类筛选
类名：`.chip`，选中态 `.active`（反色：`--text` 底 + `--bg` 字）。
形态：胶囊（`--r-pill`），可横向滚动，右侧带 `.count` 数字。
语义：`role="tab"` + `aria-selected`。

### 5. Input 输入
ID：`#search`，`type="search"`。
聚焦：主色边框 + `0 0 0 4px var(--primary-soft)` 聚焦环。
左内嵌搜索图标（`.search-icon`，`pointer-events:none`）。

---

## 二、复合组件（Composite）

### 6. Hero
结构：`.hero` → `.hero-inner` → `.badge` + `h1` + `.subtitle` + `.stats` + `.cta`
- `.badge`：大写字母间距徽章（主色浅底）
- `.stats`：胶囊卡片，含 2 个 `.stat`（技能数 / 分类数），项间竖线分隔
- `.cta`：主按钮 + 幽灵按钮
背景：极淡 `radial-gradient` 光晕（`opacity ≤ 0.6`），非实心渐变。

### 7. Toolbar
结构：`.toolbar`（sticky）→ `.toolbar-top`（搜索 + 3 图标按钮）+ `.filters`（chip 横排）
- 吸顶 `top:0`，`scrolled` 态（`scrollY>8`）显示底边框
- 背景 `color-mix(bg 82%, transparent)` + `backdrop-filter: blur(12px)` 毛玻璃

### 8. Grid / Card
- 网格：`.grid`（`auto-fill minmax(300px,1fr)`）；列表：`.grid.list`（单列行内布局）
- Card：`.card` → `.card-cat` + `.card-name` + `.card-alias?` + `.card-desc` + `.card-foot`
  - `.card-alias` 仅当 `en_name && en_name !== name` 时渲染（等宽字体展示英文别名）
  - 描述 `line-clamp` 截断（网格 3 行 / 列表 2 行）
  - hover：上移 3px + 阴影提升 + `::after` 极淡主色光晕
  - `:focus-visible`：主色聚焦环（键盘可达）

### 9. Modal
结构：`.modal` → `.modal-backdrop`（点击关闭）+ `.modal-card`（`.modal-close` + 内容）
- 入场：背景 `fade` + 卡片 `pop`（`translateY(12px) scale(.98)` → 正常）
- 最大宽 `620px`，最大高 `88vh`，内容滚动
- 行为：`Esc` 关闭、点背景关闭、打开时锁 `body` 滚动
- 语义：`role="dialog"` `aria-modal="true"` `aria-labelledby="modal-title"`

### 10. Empty
结构：`.empty`（虚线边框卡片）→ 图标 + `<strong>` 标题 + 描述
用途：筛选/搜索无结果时占位，保持布局稳定。

---

## 三、业务组件（Domain）

### 11. SkillCard
Props（来自 `skills[]`）：
```
{ name, en_name, dir, category, zh_desc, en_desc, has_scripts, has_references, has_assets }
```
渲染：分类（数据驱动英文名）→ 名称 → 别名（条件）→ 描述（按当前语言回退）→ 3 个资源 Tag。
交互：`onClick` / `Enter` / `Space` → `openModal(s)`。

### 12. SkillModal
额外 Props：`dir`（用于构造仓库链接 `repo/tree/main/skills/{dir}/SKILL.md`）。
内容：分类 → 标题 → 别名（条件）→ 描述 → 资源 Tag → 主按钮「在仓库中查看 SKILL.md」。

### 13. CategoryFilter
数据源：`categories[]` + 内置「全部」项（`count = skills.length`）。
交互：点击 `setActiveCat`，与搜索 `query` 取交集过滤。

### 14. LangSwitch / ThemeSwitch
- `lang`：`zh` / `en`，持久化 `localStorage.lang`，写 `data-lang` + `document.lang`
- `theme`：`light` / `dark`，持久化 `localStorage.theme`，写 `data-theme`
- 初始化：读 `data-*` 属性，否则跟随 `navigator.language` / `prefers-color-scheme`

### 15. ViewToggle
`view`：`grid` | `list`，切换 `.grid` 类名；图标按钮 `.active` 反映当前态。

---

## 四、组件使用红线

1. 新组件须复用 `DESIGN.md` 的 Token，禁止硬编码颜色/间距值。
2. 图标一律内联 SVG，禁止引入图标库。
3. 所有可交互元素须有 `aria-label` 或语义角色。
4. 动效时长只允许 `--dur-fast / --dur / --dur-slow` 三档，且须兼容 `prefers-reduced-motion`。
5. 业务组件数据只读来自 `skills.json`，不内联假数据。
