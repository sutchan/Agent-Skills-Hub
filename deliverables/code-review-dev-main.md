# 代码审查报告：Agent Skills Hub（基准 `dev` → 对比 `main`）

> 审查维度：规范（Standards）+ 规格（Spec）两轴并行，子代理隔离上下文后聚合。
> 基准点：`dev`（对比 `git diff dev..main`）。`main` 领先 `dev` **88 个提交**，即"main 上尚未同步回 dev 的全部工作"。
> 规模：整体 768 文件 / +142,392 行；本报告聚焦真实"代码"区域：`app/`（4,125 行 diff）、`tools/`、`scripts/`、`prototype/`、`openspec/`。`skills/` 的 639 个文件主要为 `SKILL.md` 文档变更，未逐行审查。

## 重要前置说明：版本号"倒挂"
`dev..main` 的拓扑上 `main` 领先 `dev` 88 个提交，但 `main` 顶端 `package.json` 版本为 **1.14.55**，低于 `dev` 的 **1.19.32**。根因：`main` 最新提交 `e6a52a5` 本身即 "…v1.14.55"——**main 分支版本号被回退/重置**到 1.14.x（历史曾出现 v1.20.66）。这不是基准选错，而是 main 自身的发版异常，且直接触发了下方多处"版本单一来源"硬违规。

---

## Standards（规范 + 代码异味）

### (a) 文档化规范硬违规
1. **版本号系统性回退/不一致**（CONTRIBUTING L119–121「被改文件头注释须与 package.json 一致，版本单一来源」）
   - `app/components/AppShell.tsx`：`v1.19.29 → v1.14.51`；`SkillsExplorer.tsx`：`v1.19.32 → v1.14.42`；`detail-modal.tsx`：`v1.19.29 → v1.14.55`
   - `tools/build-skills-data.mjs` 头 `v1.20.28`、`validate-skills.mjs` 头 `v1.20.17`，而 `package.json = 1.14.55`
   - 违反「bump 一次最小版本号」与「版本单一来源」红线。
2. **分类数文档/代码三方漂移**（CONTRIBUTING L78/L103 vs `taxonomy.mjs` vs `validate-skills.mjs`）
   - CONTRIBUTING 写「9 大稳定领域」；`validate-skills.mjs` L74/L79 报「13 类合法集合」；`taxonomy.mjs` 注释「13 类」；**实际 `CATEGORY_ORDER` = 14 项**（含「桌面与客户端」）。9 / 13 / 14 三套数字并存，误导贡献者。
3. **原型散写颜色字面量**（CONTRIBUTING L115 红线「禁止在 components.css 散写颜色字面量」）
   - `prototype/src/styles/components.css` 含 `#fff`、`rgba(0,0,0,.25)`、`hsl(0 0% 100%)` 等硬编码，未走 `tokens.css` 的 `--xxx` 令牌。
   - 三轴交叉印证：app / tools / spec 三路独立均抓到此问题。

### (b) Fowler 代码异味（判断性；文档未强制）
**app/**
- **Duplicated Code + Speculative Generality**：`app/components/AppShell.tsx` 的 `bindHeroInteractions`（31–51 行）定义后**从未调用**（死代码），而 92–124 行 `useEffect` 又内联重复了完全相同的 catOf/highlight + mouseover/mouseout/click/keydown 四监听器。
- **Divergent Change / Primitive Obsession**：自定义事件名以字符串字面量硬编码、散落 4 文件（`AppShell.tsx`: `ash:cat-toggle`/`ash:filter-state`/`ash:open-skill`/`skill-share-feedback`；`SkillsExplorer.tsx`；`detail-modal.tsx`；`prefs.ts`）。改名需多处改（散弹式），建议抽为共享事件名常量模块。
- **Duplicated Code（次要）**：`AppShell.tsx` 中 `setToast(...); window.setTimeout(()=>setToast(null),1800)` 在 166–167 与 174–175 行重复 → 抽 `showToast` 辅助。

**tools/ + prototype/**
- **Duplicated Code**：frontmatter 解析重复。`tools/lib/frontmatter.mjs` 的 `parseFrontmatter` 本为共享权威，但 `fix-new-skills.mjs`(L34)、`fix-skill-meta.mjs`(L142)、`migrate-category.mjs`(L96)、`_scan_fm_bug.mjs`(L15) 各自重写 `parseFm` + 相同正则 `^---\s*\n([\s\S]*?)\n---\s*\n`，恰好否定「消除解析漂移」目标 → 统一调用 `parseFrontmatter`。
- **Speculative Generality / 死代码**：`_scan_fm_bug.mjs` 为一次性调试脚本（`_` 前缀、注释「检查头部注释泄漏 bug」），未接入任何 npm 脚本，不应常驻 `tools/`。
- **Primitive Obsession / 脆弱路径**：`migrate-category`/`fix-*`/`_scan_fm_bug` 用 `process.cwd()+"skills"` 定位，缺「目录存在」校验，与 `build-skills-data.mjs` 的 `__dirname` 派生 `ROOT` 不一致；从错误 cwd 运行会静默改写错误位置的 skills。

### (c) 附加风险（tools/ 写入安全）
- 改写脚本（`migrate-category.mjs`、`fix-*.mjs`）的 `writeFileSync` **均无 try/catch、无 dry-run/备份**。
- `migrate-category.mjs` 的 `serialize` 一律以 `|-` 输出块标量，会把原 `>` 折叠标量改写为字面量，改变 `description` 折叠语义（**潜在数据污染**）。
- `updated++` 在 `replace` 未命中时仍计数（静默 no-op 记为已更新）。

---

## Spec（openspec 规格符合度）

### (a) 规格要求但缺失 / 部分实现
1. **版本声明漂移**：`spec.md:13`、`project.md:3`、`AGENTS.md:3` 均标注「当前版本 1.20.57」，但 `main` 实际 `package.json = 1.14.55`（与 CHANGELOG 顶端、README 徽章一致）。spec 自身「版本权威源 = package.json（当前 1.20.57）」的陈述与真相不符 → 破坏 spec 自洽性。
2. **build 命令超出 spec 字面**：spec §5 规定 `npm run build = node tools/build-skills-data.mjs && node tools/build.mjs`；`main` 的 `build`/`predev` 还串接 `sync-tokens.mjs` 与 `sync-css.mjs`（package.json:scripts）。功能合理，但与 spec 不一致。
3. **tags 字段已正确派生**（达标）：`build-skills-data.mjs:47/129` deriveTags，`total` 动态统计（:149 排除 hidden），`categoryEn` 映射（:151）正确。

### (b) 范围蔓延（diff 有、规格未要求）
1. 新增仓库级工具未在 `project.md §2` 工具清单：`tools/sync-css.mjs`、`fix-new-skills.mjs`、`fix-skill-meta.mjs`、`migrate-category.mjs`、`import-from-github.mjs`、`tools/lib/frontmatter.mjs`、`tools/lib/popularity.mjs`。
2. app CSS 架构重组：新增 `app/base-shared.css` / `components-shared.css` / `layout-shared.css` + `sync-css.mjs` 双产物样式同步；spec `project.md §2` 仅规定 `tokens-shared.css` 经 `sync-tokens.mjs` 同步，未规定组件级共享 CSS 同步机制。
3. 大量二进制资产（`.html.zip` / `.pdf`）落入 `skills/<name>/`，规格未禁止但属增量内容。

### (c) 看似实现但可能错误
1. **「其他」违规类残留风险**：`build-skills-data.mjs:77` `const category = fm.category || "其他"` 兜底缺失分类；虽 `validate-skills.mjs` 的 REQUIRED 含 category 会拦截，但兜底分支仍可能在异常 SKILL.md 下产出「其他」技能，而 `:146` 的 `order` 仅过滤 `CATEGORY_ORDER`，使 `skill.category="其他"` 不出现在 `categories[]` → 潜在数据不一致。本次扫描未发现缺失分类，属潜在风险。
2. `taxonomy.mjs:48/51` 注释写「13 类合法键集合」，但 `CATEGORY_ORDER` 实际含 **14** 项（Set 本身正确，注释与实现不符）。
3. **版本倒挂**：提交历史出现 v1.20.66，`main` 顶端却回退至 v1.14.55，三件套一致但相对历史大幅倒退，疑似发版流程异常，建议核实。

### 合规项（已验证通过）
- tags 派生正确、`total` 动态统计正确、`categoryEn` 映射正确；`share.promos` zh/en 各 3 条（≥3，§4.5.4.2 合规）；data 13 分类且无「其他」（§2.3 合规）；`app loadSkills()` 合并 `skills-data.json` + `skills-metrics.json` 正确（§2 合规）。

---

## 汇总
- **Standards 轴**：3 项硬违规 + 约 6 类代码异味 + 3 项写入安全风险。
  - **最严重（Standards 内）**：版本号系统性回退/跨文件头注释不一致——违反 CONTRIBUTING 版本单一来源，根因是 main 版本倒挂。
- **Spec 轴**：2 项规格滞后/不一致 + 3 项范围蔓延 + 3 项实现疑点。
  - **最严重（Spec 内）**：版本声明漂移 + 版本倒挂——spec 自洽性破坏，疑似发版流程异常。

> 两轴各自最严重的项互不从属：代码可能处处符合规范却仍在"版本/发版"上系统性出错，这正是两轴分离的意义。建议合并 `dev←main` 前优先修复：**版本倒挂根因**、**分类数 9/13/14 统一为单一真相**、**原型颜色令牌化**、**migrate 脚本的写入安全与折叠语义**。

_审查执行：code-review 技能两轴并行子代理（app-standards-reviewer-2 / tools-standards-reviewer-2 / spec-reviewer-2），基准 `git diff dev..main`（main 领先 dev 88 提交）。_
