# Project Specification — Agent Skills Hub

> 路径：`openspec/project.md` · 版本：1.20.14
> 本文件是 OpenSpec 的项目级规范（project spec），定义变更工作流、产物约定与本仓库结构对齐方式。
> 已落地能力基线见 [`spec.md`](spec.md)；演进提案见 [`changes/`](changes/)，已归档变更见 [`archive/`](archive/)。
> 配套技能：`skills/openspec-propose`、`skills/openspec-apply-change`、`skills/openspec-explore`、`skills/openspec-archive-change`。

## 1. 项目概览

Agent Skills Hub 是一个面向开发、设计、测试、DevOps、Agent 工程及各行业领域的 AI 技能集合仓库。
仓库以 `skills/<name>/SKILL.md` 为核心单元组织，并提供 `app/`（可运行 Web 应用源码）与 `prototype/`（预构建静态展示页）两层 Web 产物做可视化浏览与开发。

## 2. 目录结构约定

| 路径 | 用途 | 是否变更常客 |
|---|---|---|
| `skills/<name>/SKILL.md` | 单个技能定义（正文 + frontmatter；`name`/`description`/`en_description`/`zh_displayName`/`category`/`en_category` 为必备字段，构建脚本以磁盘为准读取） | ✅ 高频 |
| `skills/<name>/references/`、`scripts/`、`assets/` | 技能的参考资料 / 脚本 / 资源 | ✅ 中频 |
| `README.md` | 技能清单（中文描述映射） | ✅ 中频 |
| `app/` | 项目 Web 应用源码工作区（Next.js 14 + React 18；`dev`/`build`/`start`），从 `skills/<name>/SKILL.md` 生成数据；入口 `app/page.tsx`/`app/layout.tsx`/`app/globals.css`，共享逻辑在 `app/lib/`（`skills.ts` 数据读取与类型、`share.ts` 分享文案），品牌静态资产在仓库根 `public/`，组件在 `app/components/`（含 `detail/` 子模块），主题令牌在 `app/tokens-shared.css`（由 `tools/sync-tokens.mjs` 从原型 `tokens.css` 同步） | ✅ 中频 |
| `prototype/` | 预构建静态 HTML 高保真原型（打开 `prototype/prototype.html` 预览） | ✅ 中频 |
| `prototype/DESIGN.md`、`prototype/COMPONENTS.md` | 原型设计规范与组件库说明（源码 `prototype/src/` 随仓库分发，`prototype/` 下的 `index.html`/`favicon.svg`/`banner-og.svg` 为构建产物） | ✅ 中频 |
| `tools/` | 仓库级脚本：`build-skills-data.mjs`（解析 SKILL.md 生成数据）、`build.mjs`（合并数据内联构建原型）、`sync-tokens.mjs`（令牌同步至 app）、`validate-skills.mjs`（frontmatter 契约校验）、`ensure-lf.mjs`（统一 LF 换行）、`_scan_fm_bug.mjs`（frontmatter 泄漏扫描）、`skills_readme.py`/`_skill_readme_lib.py`（README 领域表生成）、`coverage.py`（覆盖率） | ◻️ 低频 |
| `openspec/` | OpenSpec 规范：`project.md`（约定）、`spec.md`（能力基线）、`changes/`（提案）、`archive/`（归档） | ✅ 本目录 |

## 3. 变更工作流（OpenSpec）

1. **提案**：`openspec new change <kebab-name>` 创建脚手架。
2. **产物**：每个 change 在 `openspec/changes/<name>/` 下包含：
   - `proposal.md` — 做什么 & 为什么（背景、问题、目标、非目标）
   - `design.md` — 怎么做（方案、数据模型、文件改动、风险）
   - `tasks.md` — 实施步骤（可勾选清单）
3. **就绪判定**：`openspec status --change <name>` 显示 `applyRequires` 全部 `done` 后可实施。
4. **实施**：`/opsx:apply` 或人工按 `tasks.md` 执行。
5. **归档**：完成后 `openspec archive <name>`，产物移入 `openspec/archive/`。

## 4. Artifact 内容准则

- **proposal.md**：只写「为什么」，含可观测的验收标准；不写实现细节。
- **design.md**：只写「怎么做」，含文件级改动清单、数据结构、回退方案；引用本项目现有模块（如 `tools/build.mjs`、`tools/build-skills-data.mjs`、展示页）而非重复其全文。
- **tasks.md**：步骤须可独立验证，每步标注涉及文件。
- **约束**：`openspec instructions` 返回的 `context` / `rules` / `project_context` 是给 AI 的约束，**不得**写入产物文件。

## 4.5 数据结构与接口标准（展示页）

展示页（原型）为**预构建静态产物**：`prototype/prototype.html` 为单一自包含文件（CSS/JS/数据/i18n 全部内联），技能数据在构建期由 `tools/build-skills-data.mjs` 从磁盘 `skills/<name>/SKILL.md` 生成两份数据——`data/skills-data.json`（稳定元数据，11 字段）与 `data/skills-metrics.json`（频繁更新指标：popularity/size/files/stars/firstSeen/skillVersion，以 name 为 key 的 map），再由 `tools/build.mjs` 合并两文件后内联注入并预渲染进 HTML。仓库随附的 `prototype/prototype.html` 即为最终交付物，**数据源以磁盘 `skills/<name>/SKILL.md` 为准**，勿手改产物；如需修订展示效果，应重跑 `npm run build` 并同步 `prototype/prototype.html`。

### 4.5.1 `skills-data.json` Schema

```jsonc
{
  "total":      整数,                         // 可见技能总数（动态统计 = 过滤 hidden 后的 skills.length，以运行时 data/skills-data.json 为准）
  "categories": [ "中文分类名", ... ],          // 去重后的中文分类名 string 数组（无 count）
  "skills": [ {
    "name":         "english-skill-name",     // 英文名（SKILL.md 目录名），卡片主标题
    "category":     "中文分类名",             // 必须命中 categories[] 中某一项
    "zh":           "中文一句话摘要",          // 卡片标题（zh_displayName 输出为 zh）
    "description":  "中文完整描述",            // 默认展示语言（卡片 .desc.zh 正文）
    "allowedTools": [ "string", ... ]         // 授权工具列表
  } ]
}
```

> 注：原型与 app 共用同一扁平结构；分类仅存中文名（string 数组），由 `skills[].category` 去重推导，不存 count / en_name / meta 嵌套。完整字段（含 `enCategory`/`homepage`/`source`/`installCommand`/`githubDir`/`hidden`）以 [`spec.md` §2.1](spec.md) 的 `SkillEntry` 为准；`tags` 为 app 侧预留、当前数据未生成。

### 4.5.2 原型形态与数据来源

| 项 | 说明 |
|---|---|
| 形态 | 原型为**预构建自包含静态 HTML**（`prototype/prototype.html` 单文件内联全部资源），可离线打开，无运行时依赖；`prototype/src/` 源码随仓库分发，`prototype/prototype.html` 为构建产物 |
| 技能数据来源 | 权威数据 = `skills/<name>/SKILL.md` 的 frontmatter（`tools/build-skills-data.mjs` 解析必备字段 `name`/`description`/`en_description`/`zh_displayName`/`category`/`en_category` 与可选 `allowedTools`/`hidden`），其中 **`description` 为中文完整描述（默认展示语言），`en_description` 为英文原文描述，`zh_displayName` 为中文一句话摘要（卡片标题，输出为 `zh`），`en_category` 为英文分类名**；`tools/build-skills-data.mjs` 生成 `data/skills-data.json`（稳定元数据）+ `data/skills-metrics.json`（频繁指标），`tools/build.mjs` 合并后预渲染进 `prototype/prototype.html`。README 自 v1.14.55 起改为领域概览表、不再逐项列出技能，故分类与描述**不再**依赖 README 映射 |
| 分类归属 | 分类**完全取自 `SKILL.md` frontmatter 的 `category` 字段（中文稳定键）**（`build-skills-data.mjs` 由 `skills[].category` 去重推导 `categories[]`，并生成 `categoryEn` 中文→英文映射），不再从 README 解析 |
| 中文描述 | 取自 `SKILL.md` frontmatter 的 `description` 字段（中文，默认展示），`zh` 为中文一句话摘要（卡片标题） |
| 计数 | `total` = 可见技能数（动态统计，排除 `hidden:true` 的内部预览技能，以 `data/skills-data.json` 运行时值为准）；各分类 `count` 由脚本统计写入 |

### 4.5.3 展示页交互规则（已固化进静态产物）

1. **过滤维度三项**：① 关键词搜索（`name`/`zh`/`description`/`category` 不敏感匹配）；② 分类多选（chip 可多选，OR 组合，「全部」复位）；③ 功能标签多选（第二组 chip，由 `SkillEntry.tags` 派生，OR 组合）。分类与标签取交集（AND），再与搜索取交集。
2. **标签展示与过滤**：卡片与详情页展示由 `SkillEntry.tags` 派生的关键词 `#tags`（如 `agent-browser` → `#agent #browser`）；`tags` 同时作为第二组筛选维度（多选 OR），与分类以 AND 组合。
3. **视图切换**：`grid`（多列卡片）/ `list`（单列横向）仅改变布局，不影响过滤结果。
4. **中文别名展示**：卡片主标题显示英文名 `name`，中文描述在 `.desc.zh` 行展示，不另渲染英文别名。

### 4.5.4 分享功能规则（prototype 与 app 两层共通）

当用户在技能详情弹窗/页点击「分享」按钮复制**分析链接**（即技能详情页 URL `skills/<name>/`，部署后带站点域名前缀）时：

1. **复制内容 = 链接 + 随机宣传文案**：剪贴板写入 `技能链接` 与一条**随机选取**的「项目宣传文案」，二者以空行分隔。仅复制纯文本（不依赖富文本）。
2. **多条文案、随机选取**：宣传文案在中/英两套中各维护 ≥3 条，按当前界面语言从对应语言集合中**随机取 1 条**，避免每次复制文案雷同。
3. **文案定义位置**：统一在 `prototype/src/i18n.js` 的 `share.promos` 下分 `zh`/`en` 数组维护；app 层 `app/lib/share.ts` 复用同一文案集合（不重复定义，避免漂移）。
4. **链接构造**：优先取当前页面 `location.origin + 仓库根 path + skills/<name>/`；离线/无 location 场景回退为相对路径 `skills/<name>/`。
5. **复制容错**：优先 `navigator.clipboard.writeText`（需安全上下文/用户手势）；失败降级到 `document.execCommand('copy')`；两者皆失败给出明确失败提示，不静默吞错。
6. **用户反馈**：复制成功后用轻量 toast（`role="status"`、`aria-live="polite"`）提示「已复制」，失败提示「复制失败」；toast 3 秒内自动消失且可键盘关闭。
7. **无障碍**：分享按钮带 `aria-label`；toast 不可获焦但屏幕阅读器可读。

> 版本记录：分享功能于 v1.14.0 引入，遵循上述规则，prototype 与 app 行为一致。

## 5. 仓库一致性红线（本项目的额外约束）

1. **单一数据源**：技能权威 = `skills/<name>/SKILL.md`；原型为预构建静态产物，**数据源以磁盘 SKILL.md 为准**；`data/skills-data.json` 为构建产物，**勿手改**，重跑 `npm run build` 再生。
2. **无嵌套副本**：技能不得出现在非 `skills/<name>/` 的位置（如 `skills/video-use/skills/`、`skills/tools/` 均为非法）。
3. **数据有效性**：原型展示的技能必须与磁盘 `skills/<name>/SKILL.md` 一致；删除技能时同步清理 `README.md`。
4. **展示页规范**：UI 设计须对齐 `prototype/DESIGN.md`（配色令牌、响应式、可访问性、交互流程、§8 品牌形象规范）。
5. **原型可复现**：HTML 原型由 `tools/build.mjs` 将 `prototype/src/` 模板 + `data/skills-data.json` + `data/skills-metrics.json` 合并内联构建为 `prototype/prototype.html`；如需修订展示效果，应重跑 `npm run build` 并将产物同步回仓库；`prototype/DESIGN.md` 与 `prototype/COMPONENTS.md` 须与实际产物一致。

## 6. 版本与发布

- 语义化版本（SemVer），变更在 `CHANGELOG.md` 追加条目。
- 展示页版本见仓库根 `package.json`（`version`）。
- 发版步骤：重跑 `npm run build`（生成 `data/skills-data.json` + `data/skills-metrics.json` 与 `prototype/prototype.html`）→ 更新 `CHANGELOG.md` → 打 tag。

## 7. 提交信息规范

沿用仓库根 `README.md` / 协作规则：`<type>: <描述>`（feat/fix/docs/refactor/style/test/chore/perf/ci/revert），描述 ≤ 50 字符、动词开头、无句号。
