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
| `--bg` | `#f6f8fc` | `#0b0f1a` | 页面背景 |
| `--bg-soft` | `#eef2f9` | `#111726` | Hero 渐变底 |
| `--surface` | `#ffffff` | `#161d2e` | 卡片/控件背景 |
| `--surface-2` | `#eef1f7` | `#1d2638` | 次级表面、标签底 |
| `--border` | `#d8deea` | `#283248` | 描边、分隔线 |
| `--text` | `#1f2738` | `#e7ecf5` | 主文字 |
| `--text-strong` | `#0f1729` | `#ffffff` | 标题/强调文字 |
| `--muted` | `#5b6577` | `#9aa6bd` | 次要文字、元信息 |
| `--primary` | `#3b5bdb` | `#6d8bff` | 主色（链接、激活态、渐变起点） |
| `--primary-2` | `#7048c8` | `#a06bff` | 主色渐变终点 |
| `--accent` | `#0ca678` | `#34d8b4` | 强调（分类标签、徽章 `has`） |

> 配色以 `app/globals.css` 的 `:root` 与 `:root[data-theme="dark"]` 为唯一事实来源，改动须同步两处变量块并保持对比度 ≥ WCAG AA（4.5:1）。

### 4.2 字体

- 字体栈：系统 UI 字体 + 中文回退
  `system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif`
- 标题字重：700；正文字重：400；次要信息：500 + `--fg-muted`。
- 不引入网络字体（保证离线/静态导出可用）。

### 4.3 间距与圆角

| 令牌 | 值 | 用途 |
|---|---|---|
| 半径 | `16px`（`--radius`，卡片）/ `14px`（输入框、chip）/ `12px`（按钮） | 圆角 |
| 栅格间距 | `16px`（`--grid gap`） | 卡片网格间距 |
| 页面边距 | 响应式（移动 `16–20px`，桌面 `20px`） | 容器 `max-width: 1160px` 居中 |

### 4.4 响应式断点

| 视口 | 网格列数 | 列表视图 | 说明 |
|---|---|---|---|
| `< 600px` | 1 | 单列（卡片内元素换行） | 移动端 |
| `≥ 600px` | `auto-fill, minmax(280px,1fr)` | 单列横向 | 桌面/平板 |

## 5. 布局与组件

### 5.1 页面结构（`app/page.jsx` → `Showcase`）

```
┌─ Header（标题 / 副标题 / 双语切换 / 暗色自动 / 仓库 CTA）
├─ Toolbar（搜索框 + 视图切换 grid|list + 语言/主题切换 + 结果计数）
├─ FilterBar（分类 chip 横向滚动，激活态渐变填充，点击切换过滤）
├─ Main（技能卡片：grid 多列 / list 单列横向，受视图切换控制）
└─ Footer（技能总数 + 维护者 + 生成时间 + 数据来源说明）
```

### 5.2 技能卡片（`SkillCard`）

字段：`name`（中文名）、`en_name`（英文名，条件显示：当 `en_name !== name` 时以小字等宽字体展示）、`en_desc`（英文简介）、`zh_desc`（中文简介）、`category`。
徽章：`has_scripts` / `has_references` / `has_assets`（有则显示 `has` 高亮态，无则灰显）。
交互：整卡为 `role="button"` 的可点击区域（非 `<a>`），点击/Enter/Space 打开详情 Modal；hover 上移 4px + 阴影加深（过渡 ≤ 200ms）。
视图差异：grid 为纵向卡片（描述 3 行截断）；list 为横向行（分类/别名/描述/徽章分栏，描述 2 行截断）。

### 5.3 状态与交互流程

- **过滤维度（仅两项取交集）**：① 关键词搜索（匹配 `name`/`zh_desc`/`en_desc`/`category`，大小写不敏感）；② 分类 chip（单选，「全部」复位）。
- **视图切换**：Toolbar 右侧图标按钮在 `grid` / `list` 间切换，仅改变布局形态，不影响过滤结果。
- **详情 Modal**：点击卡片打开，含分类、中/英名称、简介、状态徽章、「在仓库查看 SKILL.md」外链；Esc 关闭、点击遮罩关闭、打开时锁定 body 滚动。
- **空结果**：过滤无匹配时显示提示文案。
- **加载**：纯静态无加载态；`getSiteData` 同步读取 `skills.json`。
- **明确排除**：技能数据无 `tags` 字段，`has_*` 为只读状态徽章，**不提供标签维度的过滤**（避免与原型早期描述歧义）。

## 6. 交互规范

- 键盘：Tab 遍历卡片与过滤项，Enter/Space 激活卡片打开 Modal；焦点环 `box-shadow: 0 0 0 3px rgba(109,139,255,.28)`（基于 `--primary`）。
- 语言切换：记忆到 `localStorage`（`lang` 键），默认跟随 `navigator.language`，首屏由 `layout.jsx` 内联脚本注入避免闪烁。
- 主题切换：记忆到 `localStorage`（`theme` 键），默认跟随 `prefers-color-scheme`，首屏内联脚本注入避免闪烁。
- 动画：`transition` ≤ 200ms；`prefers-reduced-motion: reduce` 时置 0。
- 分类导航：分类为 chip 按钮（单选切换过滤），**非锚点滚动**；无 `#cat-*` 区块跳转（消除早期描述歧义）。

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
