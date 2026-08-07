# Web 展示原型设计规范（Agent Skills Hub）

> 适用范围：仓库 `site/` 目录下的 Next.js 静态展示页原型。
> 本规范是原型的设计单一事实来源（Source of Truth），所有 UI 改动须对齐此处。

## 1. 产品定位

- 目标：以卡片网格 + 搜索过滤的方式，浏览仓库 `skills/` 下的全部 Agent 技能。
- 形态：纯静态展示页（SSG），无后端、无用户系统。
- 部署：腾讯云 EdgeOne（静态导出 `out/`）。
- 语言：中英双语（界面文案 + 技能英文名），可切换。

## 2. 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 15（App Router） |
| 渲染 | 静态导出（`output: export`） |
| UI | React 19（函数组件 + Hooks） |
| 样式 | 原生 CSS（单文件 `app/globals.css`，CSS 变量驱动主题） |
| 数据 | 构建期由 `build_site.py` 扫描 `skills/*.md` 生成 `data/skills.json` |

## 3. 设计原则

1. **数据驱动 UI**：技能列表、分类、计数全部来自 `data/skills.json`，前端不硬编码业务数据。
2. **单一数据源**：磁盘 `skills/<name>/SKILL.md` 是唯一权威；`skills.json` 由 `build_site.py` 生成，不得手改业务字段（仅允许本地修正后重跑脚本）。
3. **零依赖样式**：不引入 UI 框架，用 CSS 变量与少量工具类维持一致性。
4. **可访问性优先**：语义化标签、可见焦点环、键盘可达、`prefers-reduced-motion` 兼容。
5. **暗色友好**：所有颜色走 CSS 变量，明/暗主题自动跟随系统。

## 4. 视觉系统

### 4.1 颜色令牌（CSS 变量，定义在 `:root` 与 `@media (prefers-color-scheme: dark)`）

| 令牌 | 明色值 | 暗色值 | 用途 |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0a0a0a` | 页面背景 |
| `--bg-subtle` | `#fafafa` | `#111111` | 卡片/区块背景 |
| `--fg` | `#1a1a1a` | `#ededed` | 主文字 |
| `--fg-muted` | `#6b7280` | `#9ca3af` | 次要文字、元信息 |
| `--border` | `#e5e7eb` | `#262626` | 描边、分隔线 |
| `--accent` | `#6d28d9` | `#a78bfa` | 主强调（链接、激活态、徽章） |
| `--accent-soft` | `rgba(109,40,217,.08)` | `rgba(167,139,250,.12)` | 强调底色 |

> 改动配色须同步修改 `app/globals.css` 两处变量块，并保持对比度 ≥ WCAG AA（4.5:1）。

### 4.2 字体

- 字体栈：系统 UI 字体 + 中文回退
  `system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif`
- 标题字重：700；正文字重：400；次要信息：500 + `--fg-muted`。
- 不引入网络字体（保证离线/静态导出可用）。

### 4.3 间距与圆角

| 令牌 | 值 | 用途 |
|---|---|---|
| 半径 | `12px` | 卡片、输入框、按钮 |
| 栅格间距 | `1rem`–`1.5rem` | 卡片网格 `gap` |
| 页面边距 | 响应式（移动 `1rem`，桌面 `2rem`） | 容器 `max-width: 1200px` 居中 |

### 4.4 响应式断点

| 视口 | 列数 | 说明 |
|---|---|---|
| `< 640px` | 1 | 移动端单列 |
| `640–1024px` | 2 | 平板 |
| `> 1024px` | 3 | 桌面 |

## 5. 布局与组件

### 5.1 页面结构（`app/page.jsx` → `Showcase`）

```
┌─ Header（标题 / 副标题 / 双语切换 / 暗色自动）
├─ Toolbar（搜索框 + 视图切换 grid|list + 结果计数）
├─ FilterBar（分类锚点横向滚动，激活态 accent 下划线）
├─ Main（技能卡片网格 / 列表）
└─ Footer（生成时间 + 数据来源说明）
```

### 5.2 技能卡片（`SkillCard`）

字段：`name`（中文名）、`en_name`（英文名）、`en_desc`（英文简介）、`category`、
徽章：`has_scripts` / `has_references` / `has_assets`（有则显示，无则隐藏）。
交互：整卡为 `<a>` 链接至 `skills/<dir>/`；hover 上移 2px + 阴影加深（过渡 ≤ 200ms）。

### 5.3 状态

- **空结果**：Toolbar 下方提示「未找到匹配的技能」。
- **加载**：纯静态无加载态；`getSiteData` 同步读 JSON。
- **过滤**：搜索（名称/英文名/描述/标签）+ 分类锚点 + 标签，三者取交集。

## 6. 交互规范

- 键盘：Tab 遍历卡片与过滤项，Enter 激活；焦点环 `outline: 2px solid var(--accent)`。
- 语言切换：记忆到 `localStorage`（`lang` 键），默认跟随 `navigator.language`。
- 动画：`transition` ≤ 200ms；`prefers-reduced-motion: reduce` 时置 0。
- 锚点：`FilterBar` 分类链接使用 `slugify(英文分类名)` 生成 `#anchor`，与 `#cat-*` 区块 `id` 对应。

## 7. 数据架构

```
skills/<name>/SKILL.md  ──build_site.py──▶  site/data/skills.json  ──▶  Showcase (getSiteData)
        ▲                                        │
        │                                        ├─ meta（标题/计数/生成时间）
        │                                        ├─ categories[]（name, en, count）← 分类英文数据驱动
        │                                        └─ skills[]（dir, name, en_name, en_desc, zh_desc, category, has_*）
        └─ README.md（中文描述映射，由 build_site.py 解析）
```

- **分类英文**：存于 `skills.json` 的 `categories[].en`，前端 `catName()` 从数据读取，**禁止在 `Showcase.jsx` 硬编码映射**。
- **新增技能**：只需在 `skills/<name>/` 放 `SKILL.md` 并（可选）在 `README.md` 加一行，重跑 `npm run build` 即自动收录。
- **新增分类**：在 `build_site.py` 的 `CAT_EN` 补中英文映射 + `README.md` 加 `### 分类（N）` 标题即可，前端无需改动。

## 8. 质量门禁

- 构建：`npm run build` 须通过（prebuild 自动重生成数据）。
- 可访问性：所有交互元素可达、对比度达标、无 `console.log` 残留。
- 一致性：新增组件须使用第 4 节令牌，不得新写硬编码颜色/尺寸。
- 数据：提交前确认 `skills.json` 不含磁盘不存在的 `dir`（单一数据源约束）。
