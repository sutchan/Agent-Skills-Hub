# Changelog

本项目所有重要变更均记录于此文件。

## [1.14.9] - 2026-08-16

### 修复：详情弹窗 i18n key 与分享文案漂移

- **修复弹窗授权工具标题显示 key 原文**：`03-detail.js` 引用不存在的 `detail.tools`，回退为字面量 `"detail.tools"`；改为正确的 `detail.toolsTitle`
- **修复 app 层分享文案硬编码 `"200+"` 与 prototype 漂移（违反 openspec §4.5.4.3）**：`lib/share.ts` 文案改为 `{n}` 占位并在 `buildShareText` 注入 `SKILLS_DATA.total`，与 prototype 动态数量一致；`useShare`/`SkillDialog`/`SkillsExplorer`/`AppShell`/`page` 透传 `total`
- **修复 app 层 `allowedTools` 类型契约崩溃风险**：`lib/skills.ts` 的 `Skill.allowedTools` 由 `string` 改为 `string[]`（与 `build-skills-data.mjs` 实际输出一致），`SkillDialog` 移除 `.split(",")` 调用，避免数组调用 split 抛 `TypeError`
- **修复 app 弹窗焦点陷阱失效与 Escape 冒泡**：焦点移出弹窗（如 body）时按方向拉回边界；Escape 时 `preventDefault` 后关闭
- **版本号同步**：prototype/src/parts/03-detail.js → v1.14.9；app 层 7 个被改文件头 → v1.1.1；package.json → v1.14.9、app/package.json → v1.1.1
- **修复构建产物 JS 语法错误导致全站白屏（🔴 严重）**：`build.mjs` 用 `String.replace` 注入 `js` 片段时，`$$` 在替换字符串中被解释为字面 `$`，使 parts 里的 `const $$ = ...` 在 `out/index.html` 中塌缩为 `const $ = ...`，与上方 `const $` 重复声明触发 `SyntaxError`，整段脚本不执行、统计与卡片恒为 0；改为函数式替换 `() => js` 规避特殊字符解释。同等处理 `{{CSS}}/{{DATA}}/{{I18N}}`。`build.mjs` 头版本 → v1.14.9

## [1.14.8] - 2026-08-16

### 修复：原型运行时崩溃与交互失效

- **修复全局 `$` 未定义导致白屏（🔴 严重）**：`src/parts/*.js` 全程使用 `$()` 选择器但无任何文件定义，运行至首个 `$()` 调用即抛 `ReferenceError` 整页崩溃；在 `01-state.js` 新增共享的 `$` / `$$` 辅助函数，统一供各 parts 使用
- **修复视图切换失效**：`04-interactions.js` 用 `.view-btn` 选择器绑定 grid/list 切换按钮，但 `index.html` 按钮无该类名，点击无反应；为两个按钮补 `view-btn` 类
- **修复分享反馈无载体**：`03-detail.js` 的 `showToast` 取 `#toast` 节点但该节点在模板中缺失，复制提示永不显示且触发 null 报错；`index.html` 补 `<div class="toast" id="toast" role="status" aria-live="polite">`
- **补全缺失的 i18n key**：`parts` 引用的 `filter.all` / `empty.title` / `share.copied` / `share.failed` 在字典中不存在，回退为 key 原文；`i18n.js` 中英字典补齐四者
- **启用分类条溢出遮罩**：`renderCats` 末尾新增 `scrollWidth > clientWidth` 检测并 toggle `#categoryNav.overflow`，驱动 CSS 右侧渐隐遮罩
- **弹窗滚动锁定统一**：`openDetail`/`closeDetail` 由 `body.style.overflow` 内联改为 `body.no-scroll` 语义类
- **弹窗焦点回归（WCAG）**：`openDetail` 记录打开前焦点元素，`closeDetail` 关闭后归还，避免 Tab 顺序跳回页面顶部
- **hero 计数解耦**：`refreshHeroCount` 改为直接读取 i18n 文案替换 `{n}`，不再依赖模板残留占位符
- **版本号同步**：prototype/src 全部被改文件头（01~05 parts、i18n、index.html、app.css、tokens.css）、package.json（原 1.14.6 未同步，本次一并修正为 1.14.8）统一至 v1.14.8

## [1.14.7] - 2026-08-16

### 文档：Health Files 统一迁移至 `.github/`

- 将 `CODE_OF_CONDUCT.md` / `SECURITY.md` / `SUPPORT.md` / `CONTRIBUTING.md` 从仓库根目录迁移至 `.github/`，作为 Community Health Files 的单一来源（GitHub 优先读取 `.github/`）
- 补全 `.github/` 完整集合：行为准则、安全政策、支持渠道、贡献指南，内容与根目录版本对齐并补充版本标识与修正文案笔误
- 同步更新 `README.md` / `README.en.md` 中相关文档链接至 `.github/` 路径；修正 `.github/CONTRIBUTING.md` 内 `LICENSE` 相对路径
- 升级至 v1.14.7

## [1.14.6] - 2026-08-15

### 重构与规范对齐：脚本拆分、分享链接回归规范、文档同步

- **分享/查看链接回归规范**：`openDetail` 与 `buildShareText` 的链接由硬编码 GitHub 绝对 URL 改回相对路径 `skills/<name>/`，对齐 openspec §4.5.4 与 DESIGN §4.3（部署后由 GitHub 自动解析为 tree/main/skills/<name>/，不依赖外部 repo 配置）
- **脚本拆分（>200 行规则）**：`src/app.js`（317 行）按职责拆分为 `src/parts/` 五模块（01-state / 02-render / 03-detail / 04-interactions / 05-main），`build.mjs` 改为按序拼接 `src/parts/*.js`，保持同作用域、函数声明 hoist
- **无障碍**：修正详情弹窗 `aria-labelledby` 指向真实存在的 `dialogVisibleTitle`（原先引用不存在的 `dialogTitle`）
- **文档对齐**：DESIGN.md / COMPONENTS.md 版本与「实现方式 / 源码映射」描述同步为 parts 拆分形态
- **修复数据层 bug**：`build-skills-data.mjs` 的 `allowedTools` 原本原样存为逗号分隔字符串，导致详情弹窗 `openDetail` 调用 `.map` 崩溃（点击卡片无反应）；新增 `normalizeTools()` 规范为数组，渲染层 `03-detail.js` 同时加 `Array.isArray` 防御性兜底；已验证 200 技能全部可安全打开详情
- **版本号**：prototype/src 全部文件头、package.json、README 徽章统一至 v1.14.6

## [1.14.5] - 2026-08-15

### 修复：卡片 skill 名字丢失（主标题语义错位）

- **根因**：卡片 `.name` 显示 `s.zh`（整段中文描述）而非技能名，且 `.desc.zh` 重复显示同一段描述；真正的技能名仅藏在 `.badge` 里、被长描述挤到换行后，视觉上「没有名字」
- **修复**：`.name` 主标题明确显示技能英文名 `s.name`（权威标识、简短、永不丢失）；中文描述交由 `.desc.zh`，移除与名字重复的 `.badge`；详情弹窗 `#dName` 已用 `s.name`，语义一致
- 版本号：app.js 头、package.json、README 徽章统一至 v1.14.5

## [1.14.4] - 2026-08-15

### 修复：卡片 skill 名称显示不全

- **根因**：`.card .name` 为 `display:flex` 且未设 `flex-wrap`，内部长中文描述文本与英文名 badge 挤在同一行无法换行，文本被压缩/挤出可视区导致名称显示不全
- **修复**：`.name` 加 `flex-wrap: wrap` 允许长文本换行完整显示；`.badge` 加 `flex-shrink: 0` 防止英文名被压缩丢失
- 版本号：app.css 头、package.json、README 徽章统一至 v1.14.4

## [1.14.3] - 2026-08-15

### 修复：英文模式查看技能按钮显中文 + 分享文案硬编码数字

- **英文模式按钮误显中文**：en 字典 `detail.open` 误填中文「查看技能」，英文模式下弹窗按钮显示中文；已修正为 "Open skill"，zh 字典保留「查看技能」
- **分享文案硬编码 200+**：`share.promos` 中英各 3 条营销文案写死 "200+"，与统计脱节；改为 `{n}` 占位符，由 `buildShareText` 注入 `SKILLS_DATA.total` 动态替换
- 版本号：i18n.js/app.js 头、package.json、README 徽章统一至 v1.14.3

## [1.14.2] - 2026-08-15

### 修复：失效链接、hero 标题硬编码、版本号不一致

- **失效链接**：详情弹窗「查看技能」按钮与分享文案链接原指向 `skills/<name>/`，纯静态部署无此路由必 404；统一改为 GitHub 仓库真实技能目录 `https://github.com/sutchan/Agent-Skills-Hub/tree/main/skills/<name>`
- **hero 标题硬编码**：`hero.title` 写死 "200+"，与动态统计脱节；改用 `{n}` 占位符 + `refreshHeroCount()` 注入 `SKILLS_DATA.total`，语言切换后也同步刷新
- **版本号统一**：prototype/src 五个文件头（app.js/i18n.js/app.css/tokens.css/index.html）与 package.json/README 徽章统一至 v1.14.2

## [1.14.1] - 2026-08-15

### 修复：线上部署技能数据全为 0 + 品牌标题拼接瑕疵

- **根因（数据全 0）**：`package.json` 的 `build` 脚本仅运行 `build.mjs`，后者依赖预提交的 `skills-data.json`；EdgeOne 部署重新构建时若数据文件缺失/未就绪，`build.mjs` 抛 ENOENT 失败或产出空页面，导致线上 `SKILLS_DATA` 为空、统计与卡片全为 0
- **修复**：`build` 脚本改为先 `build-skills-data.mjs` 生成数据再 `build.mjs` 内联，彻底消除对预提交数据文件的依赖，CI 重构建必产出 200 技能 / 13 分类
- **标题瑕疵**：`index.html` 品牌名与副标题 `<small>` 间缺空格，渲染为「Skills HubAgent Skills Hub 原型」，已补空格
- 版本号：package.json、index.html 头、README 徽章统一至 v1.14.1

## [1.14.0] - 2026-08-15

### feat: 分享功能 — 复制分析链接时同时复制随机项目宣传文案

- **分享按钮**：技能详情弹窗新增「分享」按钮，点击将技能分析链接（`skills/<name>/`，部署后带域名）与一条**随机选取**的项目宣传文案一并复制到剪贴板
- **多语言随机文案**：中/英各 3 条宣传文案，按当前界面语言随机取 1 条避免雷同；prototype（`i18n.js`）与 app（`lib/share.ts`）复用同一文案集合，避免漂移
- **复制容错**：优先 `navigator.clipboard.writeText`，失败降级 `document.execCommand('copy')`，皆失败给出明确提示
- **用户反馈**：复制成功/失败用轻量 toast（`role="status"` `aria-live="polite"`，3s 自动消失）提示
- **两层实现**：prototype 静态原型与 app（Next.js）行为一致；规范更新至 `openspec/project.md §4.5.4` 与 `prototype/DESIGN.md §3.2/§4.2`
- 版本号：prototype/src 改动文件头统一至 v1.14.0；app 包升至 v1.1.0

## [1.13.2] - 2026-08-15

### 修复：卡片技能名在中文模式下不显示

- **根因**：卡片英文名 badge 带 `en` class，被 `html[data-lang="zh"] .en { display: none }` 规则在默认中文模式下隐藏；而 `.name` 显示的是 `s.zh` 中文长描述，导致用户看不到技能名（英文标识）
- **修复**：卡片英文名 badge 去除 `en` class，使其不受语言切换显隐规则影响、始终可见（英文名是技能稳定标识，用户常按英文名检索/调用）
- 版本号：prototype/src/app.js 文件头、package.json 统一至 v1.13.2

## [1.13.1] - 2026-08-15

### 样式优化：降低绿色主色调饱和度提升文字可读性

- **主色调降饱和**：浅色 `--primary` `#16a34a`→`#2e9e6b`、深色 `#4ade80`→`#5cc98c`，降低饱和度并微调明度
- **白字对比度**：主按钮/选中态绿底白字对比度达 WCAG AA（≥4.5:1），文字更清晰可读
- **同步**：DESIGN.md 主色 HSL 表（142 71%→152 56% / 146 52%）、渐变端点、原型产物 `out/index.html` 一并更新
- 版本号：prototype/src 改动文件头统一至 v1.13.1

## [1.13.0] - 2026-08-15

### UI/UX 完善：偏好持久化、弹窗无障碍与长列表导航

- **偏好持久化**：主题（明/暗）与语言（中/英）写入 localStorage，刷新后保持，避免每次重置
- **弹窗无障碍增强**：打开弹窗时焦点移入、Tab 焦点陷阱不逃逸背景、`Esc`/遮罩关闭后焦点归还触发卡片；打开期间锁定背景滚动（`body.no-scroll`）
- **全局可访问性**：`:focus-visible` 仅键盘焦点显示焦点环；`prefers-reduced-motion` 下停用过渡动画（WCAG 2.3.3）
- **长列表导航**：新增「回到顶部」按钮（`#toTop`），滚动超阈值淡入、点击平滑回顶；分类条右侧溢出渐隐遮罩提示可横向滚动
- 版本号：prototype/src 改动文件头统一至 v1.13.0

## [1.12.0] - 2026-08-15

### 代码审查：无障碍增强、性能优化、规范对齐与模块拆分

- **无障碍（WCAG AA 基线）**：卡片补充 `role=button`+`tabIndex=0`+`aria-label` 并支持 Enter/Space 键打开；分类 chip 加 `aria-pressed`；统计区与结果网格加 `aria-live=polite`；弹窗 `role=dialog`+`aria-modal`+`sr-only` 标题；图标按钮/搜索框/分类 nav 补 `aria-label`；聚焦环 `.card:focus-visible`
- **空状态增强**：新增图标 + 双语描述 + 「清除筛选」按钮（`#clearFilters`），对齐 DESIGN §4.4
- **性能优化**：分类计数由每次渲染全量遍历改为预聚合 `catCounts`（O(n) 一次）；关键词匹配补全 `category` 字段（对齐规范 4.5.3①）；搜索输入加 120ms 防抖
- **健壮性**：删除未使用 `pick` 函数与空 `listCls` 计算；搜索框占位符随语言由 `I18N.t()` 驱动；i18n 容错兜底保持不变
- **模块拆分**：`app.css` 拆出 `src/styles/tokens.css`（设计令牌 + reset + `.sr-only`）；`tools/skills_readme.py`(265行) 拆出纯函数层 `tools/_skill_readme_lib.py`（解析/读取），主文件降为编排层。所有源文件 ≤200 行
- **规范对齐（DESIGN.md / COMPONENTS.md）**：修正过时引用（Next.js/React/Tailwind → 纯原生 HTML/CSS/JS；`build_site.mjs`/`skills.json 的 meta.repo` → `build.mjs`/`skills-data.json` 扁平结构）；README/README.en 同步纯静态实现与构建命令、`app/` 技术栈断言去具体化
- **版本号统一**：prototype/src 各文件头、package.json、README 徽章统一至 v1.12.0

## [1.11.2] - 2026-08-15

### 加固 EdgeOne CI 依赖安装修复（v1.11.1 修复未生效）

- **根因复盘**：v1.11.1 在 `edgeone.json` 设 `installCommand: ""` 未生效，CLI 仍回退默认 `npm install` 并因根目录无 `package.json` 而 ENOENT 失败（空字符串被判定为"未设置"）
- **双保险修复**：
  1. 新增根 `package.json`（无 dependencies，含 `build` 脚本指向 `node prototype/build.mjs`），即使 CLI 回退默认 `npm install` 也会因有清单且零依赖而立即 exit 0
  2. `edgeone.json` 的 `installCommand` 改为非空命令 `echo 'no npm dependencies to install'`，确保 CLI 执行它而非回退默认；`buildCommand` 改为 `npm run build`
- 本地校验：`npm run build` 成功生成 `prototype/out/index.html`，两处 JSON 均合法

## [1.11.1] - 2026-08-15

### 修复 EdgeOne Makers CI 依赖安装失败（ENOENT package.json）

- **根因**：`edgeone.json` 未配置 `installCommand`，CI 默认执行 `npm install`，但仓库根目录无 `package.json`（原型为纯静态站点，`prototype/out/` 为已入库的预构建产物），导致 ENOENT 构建失败
- **修复** `edgeone.json`：新增 `installCommand: ""` 跳过无意义依赖安装；新增 `buildCommand: "node prototype/build.mjs"` 在部署前重新生成自包含静态产物（`build.mjs` 仅依赖 Node 内置模块，无需 npm 安装）
- 校验：`edgeone.json` 通过 `JSON.parse` 合法性检查；`build.mjs` 确认仅引用 `node:fs`/`node:path`/`node:url` 内置模块，CI 无需第三方依赖即可构建

## [1.9.1] - 2026-08-15

### 原型重构：纯 HTML 自包含高保真原型

- **重构 `prototype/out/index.html`**：从 Next.js 预渲染产物改为**纯 HTML 自包含单文件原型**，内联 CSS + JS + 真实技能数据，双击即可离线预览，零构建依赖
- **新增数据管道** `prototype/build-skills-data.mjs`：从磁盘 `skills/<name>/SKILL.md` 与 `README.md` 真实提取 200 个技能、13 个分类（名称、中文/英文描述、授权工具），生成 `prototype/skills-data.json`
- **新增原型源码** `prototype/src/`（`index.html` 模板 + `app.css` 设计系统 + `app.js` 交互逻辑），按职责拆分且均 ≤200 行
- **新增构建脚本** `prototype/build.mjs`：将 `src` 模板与真实数据内联为自包含 `out/index.html`（约 91 KB）
- **实现交互**：实时搜索、分类筛选（带计数）、网格/列表视图切换、技能详情弹窗（桌面 Dialog + 移动端底部 Sheet）、中英语言切换、深浅主题切换、Esc/点击遮罩关闭
- **对齐设计系统** `prototype/DESIGN.md` / `COMPONENTS.md`：语义色板、圆角、阴影、PingFang/微软雅黑字体栈、响应式断点（桌面 Dialog / 移动 Sheet）
- 清理 `out/` 下旧 Next.js 导出遗留文件（`_next/`、`404.html`、`icon.svg`、`index.txt`）
- 校验：`node prototype/build-skills-data.mjs && node prototype/build.mjs` 可复现；产物不依赖 `out/_next/` 资源

## [1.11.0] - 2026-08-15

### 国际化独立模块化 + 容错降级

- **新增独立 i18n 模块** `prototype/src/i18n.js`：集中管理 zh/en 文案字典，对外暴露 `t(key)`、`getLang()`、`setLang()`、`toggleLang()`、`onLangChange()`、`syncDOM()`，与 UI 渲染解耦
- **容错设计**：`t(key)` 在任何情况下都不抛错——目标语言缺失回退 zh，仍缺失返回 key 原文；字典被外部篡改/加载失败时降级到 HTML 原始双写文案，应用不崩溃
- **静态文案数据驱动**：`prototype/src/index.html` 的 13 处双语文案加 `data-i18n` 占位，启动时由 i18n 模块按 `zh`/`en` 类填充
- **动态文案集中**：`prototype/src/app.js` 的空状态、详情弹窗标题改用 `I18N.t(key)`，语言状态与 `data-lang`/`<html lang>` 同步统一交给模块
- **构建管道** `prototype/build.mjs`：新增 `{{I18N}}` 占位符，将 `i18n.js` 内联进 `out/index.html`（保证 `I18N` 在 `app.js` 前加载）
- 校验：Node 单测覆盖字典覆盖、缺失 key 兜底、非法语言忽略、字典损坏不抛错；构建产物已验证内联且无残留占位符

## [1.13.1] - 2026-08-15

### 样式优化：降低绿色主色调饱和度提升文字可读性

- **主色调降饱和**：浅色 `--primary` `#16a34a`→`#2e9e6b`、深色 `#4ade80`→`#5cc98c`，降低饱和度并微调明度
- **白字对比度**：主按钮/选中态绿底白字对比度达 WCAG AA（≥4.5:1），文字更清晰可读
- **同步**：DESIGN.md 主色 HSL 表（142 71%→152 56% / 146 52%）、渐变端点、原型产物 `out/index.html` 一并更新
- 版本号：prototype/src 改动文件头统一至 v1.13.1

## [1.13.0] - 2026-08-15

### 主色调由紫色改为绿色 + 设计文档对齐

- `prototype/src/styles/tokens.css`：浅色 `--primary` `#4f46e5`→`#16a34a`、`--primary-weak` `#eef0fe`→`#e7f6ec`、`--primary-strong` `#4338ca`→`#15803d`；深色 `--primary` `#818cf8`→`#4ade80`、`--primary-weak` `#232644`→`#16291f`、`--primary-strong` `#a5b0ff`→`#86efac`
- `prototype/src/app.css`：品牌 logo 与卡片头像渐变末端 `#8b5cf6`→`#22c55e`（2 处）
- `prototype/DESIGN.md`：§2.1 色彩表 `--primary`/`--accent`/`--ring` 的 HSL 值与描述同步为绿色（原文档 HSL 仍写紫，已修正为 `142 71%` 绿相，消除文档与代码脱节）
- `prototype/out/index.html`：重跑 `node build.mjs` 重新生成自包含产物，已无紫色残留（校验 0 处）
- 校验：仅替换色值，未改动 DOM 结构与交互逻辑；语义化 id（上轮 v1.10.0 已加）保持不动；对比度仍满足 WCAG AA

## [1.10.0] - 2026-08-15

### 原型页语义化 id 增强（可访问性与锚点）

- `prototype/src/index.html`：为顶栏（`siteHeader`/`topbarInner`/`brandLink`）、英雄区（`hero`/`heroTitleZh`/`heroTitleEn`/`heroSubtitleZh`/`heroSubtitleEn`/`heroStats`）、搜索控制区（`searchControls`/`searchBox`）、分类导航（`categoryNav`）、主列表（`grid` 增加 `aria-label`）与弹窗容器（`dialog` 增加 `aria-modal` + `aria-labelledby`）补充语义化 id 与可访问性属性
- `prototype/src/app.js`：详情弹窗模板内区块（`dialogHead`/`dialogBody`/`dialogFoot`/`dialogBlockZh`/`dialogBlockEn`/`dialogBlockCat`/`dialogBlockTools`）与标题（`dialogTitle`，关联 `aria-labelledby`）、空状态（`emptyStateZh`/`emptyStateEn`）补充语义化 id
- 校验：新增 id 均为纯结构属性，未改动既有 `state`/`bind()` 选择器逻辑，向后兼容；JS 仍通过既有 `#grid`/`#cats`/`#searchInput` 等引用，无破坏性变更

## [1.9.0] - 2026-08-15

### 社区健康文件（Community Health Files）完善 + CI 修复

- **新增行为准则** `CODE_OF_CONDUCT.md`：基于 Contributor Covenant v2.1，明确承诺、准则、执行流程与举报渠道
- **新增安全政策** `SECURITY.md`：声明受支持版本（latest/main）、私密漏洞报告渠道（GitHub Security Advisory + 邮箱）、处理流程与项目安全红线
- **新增支持文档** `SUPPORT.md`：问题反馈渠道、FAQ、行为准则与维护者信息
- **新增 Issue 模板**：`bug_report.yml`（缺陷）、`feature_request.yml`（功能建议）、`config.yml`（关闭空白 Issue，引导安全漏洞与讨论到对应渠道）
- **新增 PR 模板** `.github/PULL_REQUEST_TEMPLATE.md`：集成 `<type>: <描述>` 提交规范、README 一致性校验与 CHANGELOG 检查清单
- **新增依赖自动化** `.github/dependabot.yml`：对 `app/`、`prototype/` 的 npm 与根目录 GitHub Actions 执行每周自动升级
- **修复失效 CI** `.github/workflows/site.yml`：原 `site/**` 路径指向已重命名为 `prototype/` 的废弃目录，改为 `prototype/**` + `app/**` 双构建任务（prototype 以 `node prototype/build-skills-data.mjs` 校验 `skills-data.json`、app Next.js 构建），与新目录结构一致
- **同步 README** `README.md` / `README.en.md`：顶部新增版本徽章（v1.9.0）、MIT 许可标注；「相关文档」补列 CODE_OF_CONDUCT / SECURITY / SUPPORT
- 校验：新增 Health Files 不引入构建依赖；CI 路径与 `prototype/build_site.mjs`、`app/` 实际入口对齐

## [1.8.0] - 2026-08-08

### 新增 app/ Web 应用工作区 + 文档索引更新

- **新增 `app/` 目录**：作为项目可运行 Web 应用（WebApp）专属工作区，基于 Next.js 14 + React 18，
  与 `prototype/`（预构建静态原型）分层——`app/` 用于开发/构建，`prototype/` 为离线浏览交付物
- **目录约定固化**：`app/README.md` 明确数据源纪律（`skills/<name>/SKILL.md` 为权威）、md 用相对链接、跨域用 `{repo}/tree/main/{dir}`
- **文档索引同步**：`README.md`/`README.en.md` 的「在线展示页面」拆为 `app/` 与 `prototype/` 两层对照表；
  `openspec/project.md` §1 概览与 §2 目录结构表新增 `app/` 行；`openspec/AGENTS.md` 数据纪律补 `app/` 说明
- 校验：仓库结构清晰，`prototype/` 已清理散落文件（仅 `out/` + 文档），`app/` 为未跟踪新目录

## [1.7.0] - 2026-08-08

### 原型 shadcn/ui 重构 + 文档/规范对齐

- **UI 框架升级**：将原型从手写 CSS 重构为 **shadcn/ui（new-york 风格）+ Tailwind CSS 3 + Radix UI + lucide-react**，
  初始化 `tailwind.config.ts`、`postcss.config.js`、`components.json`、`tsconfig.json`、`lib/utils.ts`（cn）等基础设施
- **设计令牌映射**：`DESIGN.md` 的色彩/间距/圆角/阴影/动效改写为 shadcn HSL CSS 变量（`app/globals.css`），
  由 Tailwind 主题消费；新增 `.dark` 深色主题与 `prefers-reduced-motion` 全局兼容
- **组件库替换**：新增 `components/ui/*`（Button/Input/Badge/Card/Skeleton/Separator/Tabs/Dialog/Sheet），
  `components/*`（ThemeToggle/LangToggle/ViewToggle/SkillCard/SkillDetail），全部基于 shadcn 原语
- **响应式详情载体**：桌面端（>640px）用 Radix Dialog 居中弹窗，移动端（≤640px）用 Sheet 右侧抽屉（`matchMedia` 实时判定）
- **去除冗余**：删除旧 `app/Showcase.jsx`（逻辑合并入 `app/page.tsx`）、`lib/skills.js`（升级为 `lib/skills.ts`），
  原型结构精简；构建脚本 `build_site.py` 移植为 `build_site.mjs`（Node 可跑，无 Python 环境可构建），py 版保留为备用
- **规范同步**：重写 `DESIGN.md`（1.7.0）与 `COMPONENTS.md`（1.7.0）对齐 shadcn 架构；
  `openspec/project.md` §4.5 与 `AGENTS.md` 同步为 `build_site.mjs`/`app/page.tsx` 引用；
  `README.md`/`README.en.md` 构建命令更新为 `node build_site.mjs`
- **全面测试**：`npm install` + `npm run build` 通过（Next 14.2.33 静态导出，200 技能 / 13 分类，首屏 JS 146 kB）；
  `next.config.mjs` `output: export` 与所有 Radix 组件兼容
- 校验：构建成功、类型检查通过、三向数据一致、深浅主题/双语/网格列表/空态/键盘可达均可用

## [1.6.0] - 2026-08-08

### 原型目录重构 + 高保真重设计

- **目录精简**：将静态展示页 `site/` 整体移动为 `prototype/`（git 保留重命名历史），
  统一原型入口，消除 `site/` 与 `prototype/` 命名歧义
- 同步更新部署配置 `edgeone.json`（`cd prototype && npm run build`，输出 `./prototype/out`）、
  `README.md` / `README.en.md` 展示页章节、`openspec/project.md` 与 `openspec/AGENTS.md` 的路径引用；
  修正 `build_site.py` 的 `OUT` 路径指向 `prototype/data/skills.json`（修复重跑时写回已删除的 `site/` 的缺陷）
- **设计规范建立**：重撰 `prototype/DESIGN.md` 为完整设计规范——设计原则、设计系统
  （色彩/字体/间距/圆角/阴影/图标/动效 Token）、组件库（基础/复合/业务）、交互标准
  （模式/反馈/错误/空状态）、响应式、数据契约、技术栈
- **组件库规范**：新增 `prototype/COMPONENTS.md`，逐一定义 15 个组件的 Props/状态/用法/代码位置与红线
- **极简重设计**：`globals.css` 重写为克制设计语言（中性灰阶 + 单一靛蓝主色、4 倍数间距尺度、
  分层阴影、easeOutQuint 动效、毛玻璃吸顶工具栏、极淡 Hero 光晕）；`Showcase.jsx` 重构为
  国际顶尖水准可交互原型（中英双语即时切换、深浅主题、网格/列表切换、滚动边框态、键盘可达、
  空状态、弹窗 pop/fade 入场、尊重 `prefers-reduced-motion`）
- 校验：`skills.json` 200 条字段完整；lint 0 错误；三向数据一致；原型内无 `site/` 残留路径

格式遵循 [Keep a Changelog](https://keepachangelog.com/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)（SemVer）。

## [1.0.0] - 2026-07-30

### 新增

- 初始化 Agent Skills Hub，纳入 201 个技能包
- 按领域建立 13 个分类：前端与 UI 设计、后端/语言与框架、架构与设计、
  测试与质量、Agent 与 AI 工程、DevOps 与基础设施、数据与机器学习、
  内容/文档与写作、视频与媒体、行业领域、生产力与工具、上下文与提示工程、其他
- 新增项目文档 `README.md`，提供仓库结构说明、技能分类索引、使用方式与贡献指南

### 说明

- 仓库以多次 `backup: 同步 Skills 库` 提交持续同步技能内容
- 各技能许可证见其目录内 `LICENSE` 文件

## [1.0.1] - 2026-07-30

### 文档

- 完善 `README.md`：补充作者（Sut Chan）与项目地址
- 将全部技能说明翻译为中文
- 修正技能总数（201）与分类计数，清理重复条目
- 新增「相关文档」章节，链接 `CHANGELOG.md` 与 `LICENSE`

## [1.0.2] - 2026-07-30

### 文档与工程

- 新增 `README` GitHub 徽章（技能数量 / 许可证 / 英文文档）与「技能检索」指引
- 提取独立 `CONTRIBUTING.md`，并在「相关文档」中链接
- 新增英文版 `README.en.md`（与中文版结构一致，含英文描述与检索指引）
- 新增 `tools/skills_readme.py`：校验 README 与 `skills/` 一致性、生成英文 README
- 新增 CI 工作流 `.github/workflows/verify.yml`，在 push/PR 时校验一致性
- 在 `agent-skills-hub.code-workspace` 补充作者与项目元信息

## [1.0.3] - 2026-07-31

### 文档

- 修正 `README.md` 与 `README.en.md` 技能总数（201 → 199）
- 修正「测试与质量」「Agent 与 AI 工程」分类计数（20 → 19），使各分类合计与总数一致
- 中文版与英文版均补充本地化说明段，明确技能描述为「中文目录 + 中文描述」
- 修复 `tools/skills_readme.py`：verify 误将 `skills/` 路径前缀当作技能名导致全量误报；gen-en 生成链接路径补全 `skills/` 前缀

## [1.4.0] - 2026-08-08

### 数据一致性修复（续）

- 修复 `site/build_site.py`：frontmatter 解析时对 `name`/`description`/`category`
  去除 YAML 引号包裹，根治 `security-best-practices` 的 name 被包裹为
  `"security-best-practices"` 导致无法匹配磁盘与 README 的问题
- 重新生成 `site/data/skills.json`：技能总数 197 → 200（与磁盘含 `SKILL.md`
  的目录数一致），`meta.count` 196 → 200，分类计数全量同步
- 补全 README 缺失的 3 个技能条目：`autonomous-loops`、`continuous-learning`、
  `webapp-testing`（原仓库新增未同步至 README）
- 修正 README 与 README.en.md 技能总数徽标/正文（198 → 200）及相应分类计数
- 消除三向数据源不一致：磁盘（200）= `skills.json`（200）= README 链接（200）

## [1.5.0] - 2026-08-08

### 英文 README 与生成脚本修复

- 修正 `README.en.md` 脏条目：`frontend-design-2` → `frontend-design`（目录名
  错误），删除磁盘不存在的 `审查项目` 垃圾条目，补回缺失的 `frontend-design`
- 统一中英文 README 分类英文名：`Others` → `Other`，与 `skills.json` 的
  `categories[].en` 对齐；同步修正「其他」分类计数（11 → 10）
- 修复 `tools/skills_readme.py`：`gen-en` 仓库地址
  `sutchan/skills-chinese` → `sutchan/Agent-Skills-Hub`，相关文档链接
  `skills-chinese.code-workspace` → `agent-skills-hub.code-workspace`，
  分类英文映射 `其他: "Others"` → `"Other"`
- 校验结果：中文 README（200）/ 英文 README（200）/ `skills.json`（200）三向
  完全一致，中英文条目集合零差异
- 已知残留：`skills/` 下 21 个 SKILL.md 的 frontmatter 字段（20 个 description
  + 1 个 name）仍带 YAML 引号包裹，两个生成脚本均已兼容去引号，产物不受影响；
  源文件清理因 `git-commit` 内部含单引号存在 YAML 破坏风险，留待后续逐文件处理

## [1.3.0] - 2026-08-08

### 原型更新（site/ 展示页）

- 新增 grid/list 视图切换：Toolbar 图标按钮切换，list 为单列横向卡片布局
- 卡片与 Modal 增加英文别名 `en_name` 展示（仅当 `en_name !== name` 时以小字等宽字体渲染）
- 明确过滤交互：搜索 + 分类 chip 两项取交集；`has_*` 为只读状态徽章，不提供标签过滤
- 同步样式：新增 `.view-toggle`、列表视图、英文别名样式（globals.css）

### 规范文档修订

- `site/DESIGN.md`：纠正配色令牌（以 globals.css 真实值为准，原 `#6d28d9` 等有误）；
  修正间距/圆角/断点；消除"标签取交集""锚点区块"歧义；对齐视图切换与 en_name 展示
- `openspec/project.md`：新增 §4.5 数据结构与接口标准（skills.json Schema、build_site.py
  契约、过滤/展示业务规则）；红线补充数据契约交叉引用，确保文档与最新原型严格对应

## [1.2.0] - 2026-08-08

### 文档与规范

- 新增 `site/DESIGN.md`：Web 展示原型设计规范，定义视觉令牌（配色/字体/
  间距/响应式）、布局组件、交互与数据架构（单一数据源 = 磁盘 SKILL.md →
  build_site.py → skills.json → 原型）
- 新增 `openspec/project.md`：OpenSpec 项目规范，定义 change 工作流、
  artifact 准则与本仓库一致性红线（单一数据源、无嵌套副本、分类英文数据驱动）
- 新增 `openspec/AGENTS.md`：AI 协作指引，含 OpenSpec CLI 快速命令与角色契约

## [1.1.0] - 2026-08-07

### 原型对齐与数据治理

- 改进展示页原型（`site/`）：分类英文名从 `data/skills.json` 的
  `categories[].en` 字段读取，删除 `Showcase.jsx` 中硬编码的 `CAT_EN`
  映射，新增分类无需改动前端代码
- 增强 `site/build_site.py`：生成 `categories` 时写入 `en` 字段，
  数据重生成自动携带分类英文名，原型与数据源一致
- 修正 `site/data/skills.json`：删除磁盘已不存在的 `审查项目` 条目，
  将错误目录 `frontend-design-2` 修正为真实 `frontend-design`，
  技能总数 198 → 196，分类计数同步更新
- 修正 `README.md`：同上述两处坏条目，使 README、skills.json 与
  磁盘 `skills/` 三套数据对齐（单一数据源 = 磁盘 SKILL.md）

### 仓库清理

- 恢复根 `tools/coverage.py` 与 `tools/skills_readme.py`（此前误置于
  `skills/tools/` 嵌套副本），删除非法嵌套目录 `skills/tools/`、`skills/site/`
- 解决 `manim-video` 版本冲突：将完整生产级版本（version 1.0.0，含
  14 份 references 文档与 `scripts/setup.sh`）从错误嵌套位置
  `skills/video-use/skills/manim-video` 归位到根 `skills/manim-video/`
  （保留 `assets/network_graph_scene.py` 示例），删除非法嵌套目录；
  同步 `skills.json` 的 `has_scripts`/`has_references` 与 `en_desc`

[1.0.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.0.0
[1.0.1]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.0.1
[1.0.2]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.0.2
[1.0.3]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.0.3
[1.0.4]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.0.4
[1.9.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.9.0
[1.9.1]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.9.1
[1.10.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.10.0
[1.13.0]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/v1.13.0

## [1.0.3] - 2026-07-31

### 文档

- 删除冗余技能，技能总数由 201 调整为 199
- `continuous-learning`：已有 `continuous-learning-v2` 替代，删除旧版
- `webapp-testing-2`：与 `e2e-testing` / `browser-qa` 功能重叠且命名遗留 `-2`，删除
- 同步更新 `README.md`、`README.en.md`（分类计数与总数）与 `site/data/skills.json`

## [1.0.4] - 2026-07-31

### 文档

- 重构 `README.en.md` 为真正的英文文档：英文标题/栏目/说明，技能描述由 `gen-en` 从各 `SKILL.md` 自动提取（英文技能保留英文描述，中文技能保留中文描述）
- 英文版补充「Repository Structure」「Usage（含 skills-manager 一键安装、Next.js 在线展示、技能检索）」「Contributing」「Related Documents」等章节
- 修正英文版仓库链接（旧 `skills-chinese` → `Agent-Skills-Hub`）与 workspace 文件名引用
- 增强 `tools/skills_readme.py` 的 `read_description`：正确解析 YAML 折叠块标量（`|`/`>`/`|-`/`>-`），修复中文技能描述被截断或误取标记符号的问题
- 修复后 `gen-en` 产出描述完整，`verify` 校验通过（199 个技能一致）

## [1.0.5] - 2026-07-31

### 文档

- 删除冗余技能 `autonomous-loops`：其 `SKILL.md` 已声明 canonical 名改为 `continuous-agent-loop`，保留一个版本避免破坏现有工作流，与 `continuous-learning`（v2 替代 v1）、`webapp-testing-2`（遗留 `-2` 命名）同属被替代/遗留命名的冗余清理
- 同步更新 `README.md`、`README.en.md`（总数 199→198，「Agent 与 AI 工程」分类 19→18）与 `site/data/skills.json`
- 清理临时分析文件 `descs.txt`、`sim.txt`

## [1.0.6] - 2026-07-31

### 功能

- `site` 展示页新增中英文切换功能
- `Showcase.jsx`：新增 `lang` 状态与 `toggleLang`；界面文案（标题、按钮、统计标签、搜索占位、分类名、空态、页脚）双语化；分类名维护中文→英文映射；卡片与弹窗按当前语言显示对应描述（缺失时回退另一语言）
- `layout.jsx`：新增首屏 `lang` 内联脚本，避免语言切换闪烁，同步 `<html lang>`
- `globals.css`：新增 `.lang-toggle` 按钮样式，卡片/弹窗描述样式合并为 `.card-desc` / `.modal-desc`
- 语言偏好持久化到 `localStorage`，默认跟随浏览器语言
