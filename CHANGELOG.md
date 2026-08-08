# Changelog

本项目所有重要变更均记录于此文件。

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
