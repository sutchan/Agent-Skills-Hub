# Changelog

本项目所有重要变更均记录于此文件。

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
