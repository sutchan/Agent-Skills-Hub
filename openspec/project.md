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
| `prototype/` | Next.js 静态展示页原型 | ✅ 中频 |
| `prototype/data/skills.json` | 由 `prototype/build_site.py` 生成，**勿手改业务字段** | ⚠️ 自动生成 |
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

展示页为纯静态 SSG，`prototype/data/skills.json` 是唯一数据接口，由 `prototype/build_site.py` 在 `prebuild` 阶段从磁盘生成。**严禁手改业务字段**，仅允许本地修正后重跑 `npm run build`。

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

### 4.5.2 接口契约（build_site.py）

| 职责 | 规则 |
|---|---|
| 技能发现 | 遍历 `skills/` 下含 `SKILL.md` 的目录，解析其 frontmatter + 正文第一段 |
| 分类归属 | 优先取 `SKILL.md` frontmatter `category`，回退 `README.md` 的 `### 分类（N）` 标题 |
| 分类英文 | 由 `build_site.py` 内 `CAT_EN` 映射写入 `categories[].en`；未在映射中的分类回退为原名 |
| 中文描述 | 解析 `README.md` 中 `- **[name](skills/name/)** — desc` 行的 `desc` 作 `zh_desc` |
| 计数 | `meta.count` = `skills.length`；各 `category.count` = 该分类技能数（动态计算） |
| 输出 | 写入 `prototype/data/skills.json`，UTF-8，缩进 2 |

### 4.5.3 业务规则（展示页过滤与展示）

1. **过滤维度仅两项**：① 关键词搜索（`name`/`zh_desc`/`en_desc`/`category` 不敏感匹配）；② 分类单选（chip 切换，「全部」复位）。二者取交集。
2. **无标签过滤**：技能数据**不含 `tags` 字段**，`has_*` 为只读状态徽章，不提供标签维度过滤。
3. **视图切换**：`grid`（多列卡片）/ `list`（单列横向）仅改变布局，不影响过滤结果。
4. **英文别名展示**：卡片/Modal 仅当 `en_name !== name` 时渲染英文别名，避免与中文名重复。
5. **分类英文来源**：前端 `catName()` 从 `categories[].en` 读取，**禁止在 `Showcase.jsx` 硬编码映射**。

## 5. 仓库一致性红线（本项目的额外约束）

1. **单一数据源**：技能权威 = `skills/<name>/SKILL.md`；`prototype/data/skills.json` 仅供展示，由 `prototype/build_site.py` 生成，禁止手改业务字段。
2. **无嵌套副本**：技能不得出现在非 `skills/<name>/` 的位置（如 `skills/video-use/skills/`、`skills/tools/` 均为非法）。
3. **数据有效性**：`skills.json` 的每个 `dir` 必须对应磁盘真实存在的 `skills/<dir>/`；删除技能时同步清理 `README.md` 与重跑 `build_site.py`。
4. **分类英文数据驱动**：`Showcase.jsx` 的分类英文名从 `skills.json` 的 `categories[].en` 读取，新增分类只需在 `build_site.py` 的 `CAT_EN` 补充，前端不改代码。
5. **展示页规范**：UI 改动须对齐 `prototype/DESIGN.md`（配色令牌、响应式、可访问性、交互流程）。
6. **数据契约**：`skills.json` 的结构、字段语义与生成规则以 §4.5 为准；新增/修改技能字段须同步更新 `build_site.py`、`prototype/DESIGN.md` 与 §4.5，三者严格对应、不得歧义。

## 6. 版本与发布

- 语义化版本（SemVer），变更在 `CHANGELOG.md` 追加条目。
- 展示页版本见 `prototype/package.json`（`version`）。
- 发版步骤：更新 `skills.json`（重跑脚本）→ 更新 `CHANGELOG.md` → 打 tag。

## 7. 提交信息规范

沿用仓库根 `README.md` / 协作规则：`<type>: <描述>`（feat/fix/docs/refactor/style/test/chore/perf/ci/revert），描述 ≤ 50 字符、动词开头、无句号。
