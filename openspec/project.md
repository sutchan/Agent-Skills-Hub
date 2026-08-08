# Project Specification — Agent Skills Hub

> 本文件是 OpenSpec 的项目级规范（project spec），定义变更工作流、产物约定与本仓库结构对齐方式。
> 配套技能：`skills/openspec-propose`、`skills/openspec-apply-change`、`skills/openspec-explore`、`skills/openspec-archive-change`。

## 1. 项目概览

Agent Skills Hub 是一个面向开发、设计、测试、DevOps、Agent 工程及各行业领域的 AI 技能集合仓库。
仓库以 `skills/<name>/SKILL.md` 为核心单元组织，并提供 `prototype/` 静态展示页（Next.js）做可视化浏览。

## 2. 目录结构约定

| 路径 | 用途 | 是否变更常客 |
|---|---|---|
| `skills/<name>/SKILL.md` | 单个技能定义（frontmatter + 正文） | ✅ 高频 |
| `skills/<name>/references/`、`scripts/`、`assets/` | 技能的参考资料 / 脚本 / 资源 | ✅ 中频 |
| `README.md` | 技能清单（中文描述映射） | ✅ 中频 |
| `prototype/` | 预构建静态 HTML 高保真原型（打开 `prototype/out/index.html` 预览） | ✅ 中频 |
| `prototype/DESIGN.md`、`prototype/COMPONENTS.md` | 原型设计规范与组件库说明（已预构建产物，源码不随仓库分发） | ✅ 中频 |
| `tools/` | 仓库级脚本（`coverage.py`、`skills_readme.py`） | ◻️ 低频 |
| `openspec/` | OpenSpec 变更产物 | ✅ 本目录 |

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
- **design.md**：只写「怎么做」，含文件级改动清单、数据结构、回退方案；引用本项目现有模块（如 `build_site.py`、展示页）而非重复其全文。
- **tasks.md**：步骤须可独立验证，每步标注涉及文件。
- **约束**：`openspec instructions` 返回的 `context` / `rules` / `project_context` 是给 AI 的约束，**不得**写入产物文件。

## 4.5 数据结构与接口标准（展示页）

展示页为纯静态 SSG，`prototype/data/skills.json` 是唯一数据接口，由 `prototype/build_site.mjs`（或 `build_site.py`）在 `build` 阶段从磁盘生成。**严禁手改业务字段**，仅允许本地修正后重跑 `npm run build`。

### 4.5.1 `skills.json` Schema

```jsonc
{
  "meta":   { "title", "subtitle", "author", "repo", "count", "generated_at" },
  "categories": [ { "name": "中文分类名", "en": "English Category", "count": 整数 } ],
  "skills": [ {
    "name":        "中文技能名",
    "en_name":     "english-skill-name",   // 英文别名；UI 仅当 en_name !== name 时展示
    "en_desc":     "English description",   // 英文简介（en 视图 / 回退）
    "zh_desc":     "中文简介",              // 中文简介（zh 视图 / 回退）
    "category":    "中文分类名",            // 必须命中 categories[].name
    "dir":         "skills/<dir>/",         // 磁盘目录名，须真实存在
    "has_scripts":     boolean,             // 是否有 scripts/（只读徽章）
    "has_references":  boolean,             // 是否有 references/（只读徽章）
    "has_assets":      boolean              // 是否有 assets/（只读徽章）
  } ]
}
```

### 4.5.2 原型形态与数据来源

| 项 | 说明 |
|---|---|
| 形态 | 原型为**预构建静态 HTML**（`prototype/out/index.html` + `prototype/out/_next/` 静态资源），可离线打开，无运行时依赖，不随源码分发 |
| 技能数据来源 | 权威数据 = `skills/<name>/SKILL.md`（frontmatter + 正文），原型在构建时已将 200 技能 / 13 分类预渲染进 HTML/JS bundle |
| 分类归属 | 取 `SKILL.md` frontmatter `category`，回退 `README.md` 的 `### 分类（N）` 标题 |
| 中文描述 | 取自 `README.md` 的 `- **[name](skills/name/)** — desc` 映射 |
| 计数 | `meta.count` = 技能总数（200）；各分类计数动态写入 |

### 4.5.3 展示页交互规则（已固化进静态产物）

1. **过滤维度两项**：① 关键词搜索（`name`/`zh_desc`/`en_desc`/`category` 不敏感匹配）；② 分类单选（chip 切换，「全部」复位）。二者取交集。
2. **标签展示**：卡片与详情页展示由目录名派生的关键词 `#tags`（如 `agent-browser` → `#agent #browser`），仅作展示，不提供标签维度过滤。
3. **视图切换**：`grid`（多列卡片）/ `list`（单列横向）仅改变布局，不影响过滤结果。
4. **英文别名展示**：仅当 `en_name !== name` 时渲染英文别名，避免与中文名重复。

## 5. 仓库一致性红线（本项目的额外约束）

1. **单一数据源**：技能权威 = `skills/<name>/SKILL.md`；原型为预构建静态产物，**数据源以磁盘 SKILL.md 为准**。
2. **无嵌套副本**：技能不得出现在非 `skills/<name>/` 的位置（如 `skills/video-use/skills/`、`skills/tools/` 均为非法）。
3. **数据有效性**：原型展示的技能必须与磁盘 `skills/<name>/SKILL.md` 一致；删除技能时同步清理 `README.md`。
4. **展示页规范**：UI 设计须对齐 `prototype/DESIGN.md`（配色令牌、响应式、可访问性、交互流程）。
5. **原型可复现**：HTML 原型由 Next.js 源码（`prototype/` 历史版本）构建；如需修订展示效果，应基于源码重新构建并将 `prototype/out/` 同步回仓库；`prototype/DESIGN.md` 与 `prototype/COMPONENTS.md` 须与实际产物一致。

## 6. 版本与发布

- 语义化版本（SemVer），变更在 `CHANGELOG.md` 追加条目。
- 展示页版本见 `prototype/package.json`（`version`）。
- 发版步骤：更新 `skills.json`（重跑脚本）→ 更新 `CHANGELOG.md` → 打 tag。

## 7. 提交信息规范

沿用仓库根 `README.md` / 协作规则：`<type>: <描述>`（feat/fix/docs/refactor/style/test/chore/perf/ci/revert），描述 ≤ 50 字符、动词开头、无句号。
