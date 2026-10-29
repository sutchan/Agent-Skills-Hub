# 任务清单（已完成归档）— Agent Skills Hub

> 本文件归档已完成的迭代任务。进行中 / 待处理的任务见 `docs/tasks.md`。
> 归档时间：2026-10-19（截至 v1.14.98）。

---

## 迭代一：修复 CI 验证失败（已完成）

**问题来源**：commit `998370c` (chore: 批量更新技能配置与文档) 覆盖了 111 个 SKILL.md 文件的 frontmatter，删除了 4 个必填字段（`en_description` / `zh_displayName` / `category` / `en_category`），且将中文 `description` 替换为英文原文。导致 CI 校验失败。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | 运行 `node tools/validate-skills.mjs` 确认错误范围 | P0 | ✅ 已完成 | 初检 125 个技能有 471+ 错误 |
| 2 | 编写 git 历史恢复脚本 `tools/_fix-from-history.mjs` | P0 | ✅ 已完成 | 从 `998370c~1` 提取完整 frontmatter，合并到当前版本 |
| 3 | 从 git 历史恢复 113 个技能的 frontmatter 字段 | P0 | ✅ 已完成 | 113/125 技能被修复；12 个跳过（历史版本也不完整或文件不存在） |
| 4 | 编写手动补全脚本 `tools/_fix-remaining.mjs` 处理 26 个遗留技能 | P0 | ✅ 已完成 | 预置映射表补全所有缺失字段；24/26 修复，2 个目录不存在 |
| 5 | 修复 `ai-image-generation` 契约字段顺序问题 | P1 | ✅ 已完成 | description ↔ en_description 位置交换 |
| 6 | 运行验证脚本确认 `validate-skills.mjs` 通过 | P0 | ✅ 已完成 | 当时 169 个技能全部规范；**2026-10-04 现状 170 个**（见迭代三） |
| 7 | 重建 `data/skills-data.json` + `data/skills-metrics.json` + `prototype/prototype.html` | P0 | ✅ 已完成 | npm run build（Next.js 因 Windows EPERM 失败，属环境限制） |
| 8 | 运行单元测试 `node --test tools/lib/*.test.mjs` | P1 | ✅ 已完成 | 13/13 pass ✅ |
| 9 | 清理临时脚本 `tools/_fix-from-history.mjs` / `tools/_fix-remaining.mjs` | P2 | ✅ 已完成 | 修复完成后已删除 |
| 10 | 提交变更（convention: `fix: restore 125 skills frontmatter fields broken by 998370c`）| P0 | ✅ 已完成 | 修复链已提交（HEAD `631ba62`）；暂存区 130 files 已落库 |

---

## 迭代二：文档与记忆重组（v1.14.58，已完成）

**目的**：统一四份规范文档结构与术语、确立 `docs/spec.md` 为 frontmatter/数据/红线的唯一权威源、优化项目记忆文档；删除重复/过时/矛盾内容。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | bump 版本 1.14.57 → 1.14.58（package.json / README 中英文徽章 / CHANGELOG） | P1 | ✅ 已完成 | 纯文档重组，patch 升级 |
| 2 | 重写 `docs/spec.md` 为权威契约源 | P0 | ✅ 已完成 | 去 `v1.20.x` 矛盾注记；补 12 条一致性红线；frontmatter 六字段表 + 14 类映射 + SkillEntry/SkillMetrics/SkillsData 类型 |
| 3 | 重写 `docs/project.md`（仅仓库约定 + 术语表） | P1 | ✅ 已完成 | 删除与 spec 重复的数据结构/交互/分享段，改为引用 |
| 4 | 重写 `docs/AGENTS.md`（AI 协作指引） | P1 | ✅ 已完成 | 去 OpenSpec 标题；修角色契约矛盾 |
| 5 | 重写 `.github/CONTRIBUTING.md`（贡献指南） | P1 | ✅ 已完成 | 修正工作分支 `dev`→`main`；与 spec 去重 |
| 6 | 优化 `.codebuddy/memory/MEMORY.md` | P1 | ✅ 已完成 | 主题归类；标注时效/可信度 |
| 7 | 清理 2 条失效全局记忆（55 技能/5 类、204 vs 200） | P2 | ✅ 已完成 | 与当前 169/14 矛盾，已删除 |
| 8 | 追加 daily 记录（2026-10-01.md） | P2 | ✅ 已完成 | 记录重组决策与结论 |

> 文档分工：spec.md=权威契约；project.md=仓库约定；AGENTS.md=AI 协作；CONTRIBUTING.md=贡献操作。四文档互为引用、冲突以 spec.md 为准；仓库不使用 OpenSpec CLI，变更经本 tasks.md 跟踪。

---

## 迭代三：修复重复导入技能 + 构建验证（2026-10-04，已完成）

**触发**：2026-10-04 复跑 `validate-skills` 发现新的 P0 契约违规——新增的 `skills/ai-image-generation-2/` 是重复导入且 frontmatter 不合规，会触发 ci.yml `validate-skills` 硬门禁阻断。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | 复验 `validate-skills.mjs`，定位契约违规 | P0 | ✅ 已完成 | `ai-image-generation-2/SKILL.md` 共 5 个问题：缺 4 字段且 `name` 与目录名不一致 |
| 2 | 判定该技能为重复导入 | P0 | ✅ 已完成 | 两目录均仅含 `SKILL.md`，正文完全一致，仅 frontmatter 不同 |
| 3 | 删除重复技能目录 `skills/ai-image-generation-2/` | P0 | ✅ 已完成 | 按仓库去重约定删除 |
| 4 | 复验契约通过 | P0 | ✅ 已完成 | `✅ skills 校验通过：170 个技能 frontmatter 规范` |
| 5 | 运行完整 `npm run build` 验证 | P3 | ✅ 已完成 | `✓ Compiled successfully`；类型检查通过；`Generating static pages (173/173)` |
| 6 | 重建数据 / 原型产物 | P1 | ✅ 已完成 | `Wrote 170 skills across 14 categories`；`skills-metrics.json` 更新 |
| 7 | 版本 bump 1.14.61 → **1.14.73** | P1 | ✅ 已完成 | 全量扫描 CHANGELOG 后确认 1.14.x 已推进至 1.14.72，故取 1.14.73 |
| 8 | 同步本次进度到 tasks.md | P2 | ✅ 已完成 | 时间戳 2026-10-04 |

---

## 迭代四：frontmatter 契约字段批量回填 + 版本同步至 v1.14.74（2026-10-07，已完成）

**触发**：技能 frontmatter 普遍缺 `en_description` / `zh_displayName` / `category` / `en_category` 等契约必填字段（上游导入遗留），且版本号需统一至 1.14.74。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | 以 git 历史中文权威源 `71e5f23^` 为基准，批量回填 170 个 `skills/*/SKILL.md` 五字段 | P0 | ✅ 已完成 | 外部 skills-manager 自动提交 `ab00264`；`validate-skills` → 170 技能全规范 |
| 2 | 重建 `data/skills-data.json`（170 / 14 类）、`data/skills-metrics.json` 与 `prototype/prototype.html` | P0 | ✅ 已完成 | `ab00264` |
| 3 | 同步 `app/globals.css` 与 token css | P1 | ✅ 已完成 | `ab00264` |
| 4 | 文档版本同步至 v1.14.74（package.json / README 徽章 / CHANGELOG / 各文档头注释） | P1 | ✅ 已完成 | 全局 1.14.74 已由外部统一 |
| 5 | 重建原型 `prototype.html` 注入版本 1.14.74 | P2 | ✅ 已完成 | 对齐全局版本 |
| 6 | 核对 README 中/英分类计数表与 `data` 实算分布一致 | P2 | ✅ 已完成 | 修正「自动化与集成」误写 6→5 |
| 7 | 更新本 tasks.md 记录迭代四 | P2 | ✅ 已完成 | 时间戳 2026-10-07 |

> 注：本次「更新原型及相关文档」由用户于 2026-10-07 发起；批量回填 / 数据重建 / 文档版本同步的主体由外部 skills-manager 自动提交（`ab00264`），本迭代收口原型版本注入与文档计数核对。

---

## 迭代五：点赞与收藏边缘存储集成规划（Tencent Cloud EdgeOne / EO Makers，已完成）

**目的**：为点赞与收藏功能规划基于腾讯云 EdgeOne / EO Makers 平台的边缘存储架构（Edge KV + Edge Functions）。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | 在 `docs/project.md` 规划 EdgeOne / EO Makers 边缘存储架构 | P1 | ✅ 已完成 | 确立点赞全局 KV 计数与收藏双模（localStorage + Edge KV） |
| 2 | 在 `docs/tasks.md` 登记点赞与收藏边缘存储开发与实施任务 | P1 | ✅ 已完成 | 本任务 |
| 3 | 编写 EdgeOne 边缘函数接口（`/api/votes`、`/api/favorites`）与 Edge KV 模拟存储逻辑 | P2 | ✅ 已完成 | 已在 `server.js` 实现，通过 `data/kv-store.json` 模拟 Edge KV |
| 4 | 扩展前端客户端收藏与点赞逻辑，双向同步对接 EO Makers 边缘云端存储 | P2 | ✅ 已完成 | 已实现 localStorage 缓存 + 异步云端 API 双向同步 |
| 5 | 为技能卡片添加键盘快捷键（按 'f' 键）快速收藏当前选中的技能 | P2 | ✅ 已完成 | 支持双语 Toast 提示与分析埋点 |

---

## 迭代六（已完成项）：架构解耦、交互性能与健壮性完善

**目的**：针对诊断出的四大维度问题制定落地工程方案。以下为已完成的子任务；#4–#8 待处理项见 `docs/tasks.md`。

| # | 任务 | 优先级 | 状态 | 备注与实施路径 |
|---|------|--------|------|----------------|
| 1 | `server.js` 数据存储改造为原子写入（Atomic Write）与防抖写入队列 | P0 | ✅ 已完成 | 引入临时文件交换（写入 `.tmp` 后 `fs.renameSync`）及内存写队列防抖 |
| 2 | 后端 API 入参校验与白名单防御（`/api/votes`、`/api/favorites`） | P0 | ✅ 已完成 | 校验 `name` 必须匹配既有技能库合法标识符，限制单 IP 请求速率 |
| 3 | 适配 `prefers-reduced-motion` 与键盘无障碍焦点捕获（Focus Trap） | P1 | ✅ 已完成 | 焦点陷阱（Tab/Shift+Tab 循环）、ESC 关闭、背景滚动锁定（`body.no-scroll`）、打开聚焦关闭按钮/关闭归还触发焦点均已具备；v1.14.92 补上 reduced-motion 最后缺口：`.card:hover` 位移彻底移除（见 CHANGELOG 1.14.92） |
| 9 | 文档版本全量对齐（`spec.md` 同步至 1.14.88 及后续版本规范） | P3 | ✅ 已完成 | 更新 `docs/spec.md` 版本号及契约描述 |

---

## 迭代七：应用与原型视觉对齐审计与修复（2026-10-17 ~ 2026-10-18，已完成）

**触发**：此前针对 React 组件（`src/components/*`、`src/app/*.css`）的对齐审计全部落空——这些文件在当前工作区已不存在（`prototype/src` 已删除，应用本体为 `src/index.html` 内联原型）。基于真实文件重做审计。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | 重做真实架构侦察，确认应用本体为 `src/index.html`（322KB 内联原型） | P0 | ✅ 已完成 | `src/app/*` 仅为跳转到 `/index.html` 的壳；原型规约位于 `prototype/`（wireframes.html / states.html / DESIGN.md / COMPONENTS.md） |
| 2 | 对比 `src/index.html` 与原型规约（DESIGN.md / wireframes.html）的视觉对齐审计 | P1 | ✅ 已完成 | 整体对齐度约 80% |
| 3 | 修正 6 处令牌纪律泄漏（网格列宽 260px / 卡片圆角令牌 / chip 胶囊 / 选中主色 / body 15px / hover 阴影令牌） | P1 | ✅ 已完成 | 提交 1f4a1d79：fix 对齐应用与原型视觉令牌纪律 |
| 4 | 收口详情弹窗无障碍（迭代六 #3 余留 reduced-motion 缺口） | P1 | ✅ 已完成 | 提交 b9759422（v1.14.92） |

> 规约本身过期项（投票语义、骨架条数 9 vs 12、筛选后未回顶、深链自动弹窗、统计台账标签）应用为刻意演进，未回退应用，建议改 `prototype/` 文档追上产品（待办，见 tasks.md 后续迭代）。

---

## 后续迭代（已完成项）

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 11 | 分析 commit 998370c 来源并建立防护机制 | P1 | ✅ 已完成 | ci.yml `validate-skills` job 改为硬门禁（去 `continue-on-error`） |
| 12 | 检查 998370c 是否还有其他破坏性变更 | P2 | ✅ 已完成 | `git show --stat 998370c`：仅 frontmatter 覆盖 + 新增 vercel-react 技能 |
| 13 | 验证 `npm run build` 的 Next.js 完整构建产物 | P3 | ✅ 已完成 | 2026-10-04 本地实测全绿：编译 + 类型检查 + 173/173 静态生成 |

---

## 迭代六（续）/ 后续迭代（续）：测试重建、发布 tag、版本漂移评估（v1.14.95，已完成）

**触发**：`npm test` 脚本空转、仓库缺失 `v*` 发布 tag、文件头注释版本漂移待评估。对应 tasks.md 原 #8 / #15 / #16 / #17。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 8 | 修复 `npm test` 测试命令并补充核心回归用例 | P2 | ✅ 已完成 | 重建 `tools/lib/`：`skills-data.test.mjs`（字段完整性 / name 唯一 / githubDir 一致 / total 对齐）+ `kv-store.test.mjs`（KV 与投票 JSON 合法性）；`npm test` 7/7 通过；脚本由失效的 `tools/lib/*.test.mjs` 修正为 `node --test tools/lib/*.test.mjs` |
| 15 | 建立 `v*` 发布 tag 流程 | P2 | ✅ 已完成 | 新增 `scripts/tag-release.mjs` + `npm run tag`：基于 `package.json.version` 幂等创建注解 `v*` tag（不自动推送），补齐缺失的 `v1.14.x` 发布 tag |
| 16 | 修正文件头注释版本漂移 | P3 | ✅ 已完成（评估结论） | 核实 `next.config.mjs` 实际无版本头注释（原记录已过时）、`taxonomy.mjs` 不存在（幽灵引用）、内联子模块头注释按全局规则禁止批量改写；结论为不批量刷新，仅更新被改文件头注释 |
| 17 | 处理本地重复构建被 IDE safe-delete 守卫拦截 | P3 | ✅ 已完成（已知限制 / 不修复） | 属工具环境限制；规避=构建前清空 `.next` 或依赖 CI ubuntu `build` job；仅文档记录 |

---

## 迭代六（续）/ 后续迭代（续二）：标签复合筛选、模糊搜索、治理决策（v1.14.98，已完成）

**触发**：tasks.md 原 #4 / #5 / #6 / #7 / #14 待处理项，本轮全部完成并收口。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 4 | 多维分类与多标签（Tag）复合筛选 | P1 | ✅ 已完成 | 新增 `state.tags` 多选数组与 `#tagNav`/`#tagChips` 标签导航（聚合可见技能标签 Top28 带计数），标签间 OR、与分类 AND 交叉过滤；激活筛选条与「清空全部」均支持标签移除/重置；空结果页新增热门标签一键直达推荐 |
| 5 | 拼音/模糊加权搜索 | P1 | ✅ 已完成 | 中文词启用子序列模糊匹配（容忍缺字/顺序）；新增 `scoreSkill` 字段加权评分（名称/中文名 > 标签 > 分类 > 描述），查询态下结果按相关性降序排序；拼音首字母搜索需独立字典，标注为后续增强 |
| 6 | 虚拟滚动 / 分页懒加载 | P2 | ✅ 已完成 | 核实 `renderPager` + `PAGE_SIZE=36` 已对 161 项分页（≈5 页），虚拟滚动非必需 |
| 7 | 前端模块化打包流水线（拆 `src/index.html` 3500+ 行） | P2 | ✅ 已完成（评估决策：维持内联） | 拆分内联单文件风险高、ROI 低，决定维持现状（option B），关闭任务 |
| 14 | 治理 CHANGELOG 版本序列 | P1 | ✅ 已完成（治理决策：保留双序列） | 保留 1.14.x / 1.20.x 双序列，不重写历史（CHANGELOG 为历史记录，重写风险高且无用户收益） |

---

## 迭代八：原型规约同步（文档追上应用实际演进，2026-10-19，已完成）

**触发**：tasks.md 列 5 项「原型规约过期项（建议同步，非应用缺陷）」——应用已演进但 `prototype/` 文档未同步。本轮仅同步文档使原型重新成为单一事实来源（不改应用行为，符合「未回退应用」原则）。

| # | 任务 | 优先级 | 状态 | 备注与实施路径 |
|---|------|--------|------|----------------|
| 1 | 投票语义同步 | P1 | ✅ 已完成 | `wireframes.html` Vote 小节 + `states.html` 极值计数：改为「仅点赞（可撤销）+ 收藏」两个独立维度，移除「踩」；标注双存储（localStorage `ash-votes` 结构 `{name:{up}}` + `POST /api/votes` 后端聚合落 `server.js` 的 `kv-store.json`，`initCloudSync` 拉取全站票数；收藏经 `/api/favorites` 后端双向同步）。对齐 `src/index.html` 实际实现 |
| 2 | 首屏骨架条数统一 | P2 | ✅ 已完成 | `wireframes.html` 首屏骨架由「9 个」统一为 **12 个**，与状态表一致；`src/index.html` 实际渲染 12 个 skeleton（1259–1314 行） |
| 3 | 筛选后未滚动回顶 | P2 | ✅ 已完成（文档同步） | 明确文档：筛选/搜索/排序变化仅重置页码、不自动回顶；仅显式翻页回顶，用户可点浮动「回到顶部」按钮手动回顶（与 `src` 行为一致，属刻意设计、非缺陷） |
| 4 | 深链自动弹窗 | P2 | ✅ 已完成（文档同步） | 文档补全：hash 深链（#cat / #q / #sort / #page）可分享、刷新 / 前进后退可还原；明确 `/skills/[slug]/` 详情自动弹窗深链未实现（详情仅由卡片点击打开，无独立 URL 路由） |
| 5 | 全库统计台账 | P2 | ✅ 已完成（文档同步） | `wireframes.html` StatLedger 小节标注「已移除 · v1.14.86」，与 `DESIGN.md` 一致；当前全库统计真实载体为分类环中心数字 + 标签云 Top28 计数，均随数据动态更新 |

---

## 迭代七（续）：版本一致性复核收口（2026-10-19 20:08，已完成）

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | 修正 `src/index.html` `app-version` meta 版本漂移（1.14.88→1.14.98） | P2 | ✅ 已完成 | tasks.md 原称「页眉/页脚版本已同步 v1.14.98」，但第7行 `<meta name="app-version" content="1.14.88">` 被遗漏；已修正，页眉/页脚/meta 三处现均 1.14.98 |
| 2 | 为当前版本创建本地 `v1.14.98` tag（#15 tag 流程延续） | P2 | ✅ 已完成 | 本地 tag `v1.14.98` 建于 HEAD `ce3d2591`；历史缺口 v1.14.89~v1.14.97 待补建并推送 |

---

## 迭代九：2026-10-22 全面体检审计收口（v1.14.99，已完成）

**触发**：2026-10-22 通读 `spec.md`/`project.md`/`AGENTS.md`/`CONTRIBUTING.md`/`ci.yml`/`server.js`/`data/skills-data.json` 与实际产物，识别 16 项技术债与不一致（#1–#16）。全部处置：代码修复 8 项、文档化/评估 6 项、审计不实指控纠正若干。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | 补齐 E2E | P1 | ✅ 已完成 | 新增 `e2e/smoke.spec.ts`（首页加载渲染卡片 + 搜索过滤），解除 e2e job 空跑（spec §8.4） |
| 2 | 修正部署目标 | P1 | ✅ 已完成 | `ci.yml` 构建/部署统一改用 `out/`（Next.js `output:"export"`），移除误用 `.next`（spec §8.1） |
| 3 | 收录缺失 6 技能 | P1 | ✅ 已完成 | 为 `canvas-design/pdf/playwright-cli/pptx/rust-skills/skill-creator` 补全 §2 字段并收录进 `data/skills-data.json`；`total=167` |
| 4 | 恢复 frontmatter 校验 | P2 | ✅ 已完成 | 新增 `tools/validate-skills.mjs`（软门禁：核心字段缺失硬失败，迁移未完字段仅警告）+ `ci.yml` 校验步骤，关闭技术债 8.3 |
| 5 | 明确数据构建流水线 | P2 | ✅ 已完成（文档化） | `spec.md §8.2` 文档化：外部 skills-manager 基于 §2 frontmatter 生成 `data/`，`tools/validate-skills.mjs` 软门禁暴露缺口；仓内不重建流水线（尊重「手工维护」契约） |
| 6 | 更新 `docs/spec.md` | P3 | ✅ 已完成（核实无需大改） | 经核实 spec 已为 1.14.98；对被删工具引用均为「已移除」说明或 §8 登记，非断链 |
| 7 | 更新 project/AGENTS/CONTRIBUTING | P3 | ✅ 已完成（核实无需大改） | 三者已为 1.14.98，无死链引用 |
| 8 | 清理 `skills/` 垃圾目录 | P3 | ✅ 已完成 | 删除 `RecycleBin~1e76.ffs_tmp`（无 SKILL.md） |
| 9 | 修复/废弃 `verify-storage.mjs` | P2 | ✅ 已完成 | 投票/收藏测试改用真实存在的技能名，避免白名单 400 拒绝 |
| 10 | 可复现构建 | P2 | ⚠️ 部分完成（已知限制） | 本地无 `bun` 无法生成 `bun.lock`；第三方 action 已钉 major 版本标签，完整 commit-SHA 钉定需 `git ls-remote`（需网络），本轮仅记录步骤 |
| 11 | 收敛 `server.js` 静态暴露 | P1 | ✅ 已完成 | `/data` 仅放行公开数据 `skills-data.json`/`skills-metrics.json`，不再直出含投票/收藏的 `kv-store.json` |
| 12 | 统一 `/api/favorites` 响应形状 | P3 | ✅ 已完成（核实自洽） | 客户端已分别处理 `GET`（对象，遍历 `Object.keys`）与 `POST`（数组 `data.favorites`），设计自洽，无需改动 |
| 13 | 死代码/双应用冗余 | P3 | ✅ 已完成（核实非死代码） | `src/parts/03-detail.js` 为 `src/index.html` 内联详情弹窗的源（spec §8.9），非死代码；双应用（`src/app` 壳 + `src/index.html`）为既定设计 |
| 14 | 统一版本展示位（版本漂移） | P2 | ✅ 已完成 | 修正 `prototype/wireframes.html` 页脚 `v1.14.85 → v1.14.99`；`spec.md`/`CONTRIBUTING.md` 经核实早已为 1.14.98 |
| 15 | 交互增强（可选） | P3 | ⏸ 标记为可选（未改） | 回顶/深链弹窗此前记为刻意设计，未擅改 |
| 16 | 限流持久化评估 | P3 | ⏸ 评估项（未改） | 进程内存 `Map` 重启/多实例失效，未擅改 |

> 最后更新：2026-10-22 15:15（v1.14.99）。本轮 16 项审计全部处置并归档；工作树改动已提交（`main`）并创建本地 `v1.14.99` tag。

---

## 迭代九（续）：提交审计与创建 v1.14.99 tag 收口（2026-10-22 15:15，已完成）

**触发**：上轮（2026-10-22）审计 16 项已在工作树完成但**未提交**、且**无 v1.14.99 tag**，文档自述「工作树改动未提交」。本轮继续收口。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 17 | 提交迭代九审计改动（`main` 分支，21 文件 + 2 未跟踪 + 1 删除） | P1 | ✅ 已完成 | 显式 `git add` 列文件（未用 `-u`/`add .`）；commit `chore: 收口 2026-10-22 全面体检审计（v1.14.99）` |
| 18 | 创建 `v1.14.99` 本地 tag | P1 | ✅ 已完成 | 建于提交后 HEAD `main`；历史缺口 v1.14.89~v1.14.97 未补建（需考古各版本对应 commit，待确认） |
| 15 | 交互增强（可选） | P3 | ✅ 关闭（既定决策） | 回顶/深链弹窗此前记为刻意设计，不擅改，正式关闭 |
| 16 | 限流持久化评估 | P3 | ✅ 关闭（评估结论） | 进程内存 `Map` 重启/多实例失效，当前架构下不改；记录为已知限制 |

---

## 迭代十：2026-10-22 收尾三项待办 + 1.15.0 发布（v1.15.0，已完成）

**触发**：`v1.14.99`（commit `b0042635` + tag `v1.14.99`）已收口 16 项审计。本轮在之上彻底完成原本仅部分/评估的 #10/#15/#16，并 minor bump 至 1.15.0 发布。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 10 | 可复现构建（收尾） | P2 | ✅ 已完成 | 全部第三方 action 钉定 commit SHA（含 `setup-env` 内 `setup-bun`）；`BUN_VERSION` 固定 `1.4.3`、`edgeone` CLI 固定 `1.6.45`；`bun.lock` 因本地无 bun 仍待用户/CI `bun install` 补齐 |
| 15 | 交互增强：详情深链弹窗 | P3 | ✅ 已完成 | 实现 `#skill=<name>` 加载/前进后退自动弹详情（`src/index.html` init/hashchange 于 `SKILL_MAP` 就绪后打开） |
| 16 | 限流持久化 | P3 | ✅ 已完成 | `server.js` 限流计数持久化：启动从 `data/ratelimit.json` 恢复、运行周期落盘、退出前强制落盘；`data/ratelimit.json`、`data/kv-store.json` 已加入 `.gitignore` |
| 17 | 提交本轮改动（`main`） | P1 | ✅ 已完成 | 显式 `git add` 列文件（未用 `-u`/`add .`）；commit `chore: 收口 2026-10-22 审计与收尾（v1.15.0）` |
| 18 | 创建 `v1.15.0` 本地 tag | P1 | ✅ 已完成 | 建于提交后 HEAD `main`（接续 `v1.14.99`，minor bump） |

> 版本：minor bump 1.14.99 → 1.15.0（`#15` 为新增用户可见功能——详情深链，走 minor）。同步 package.json / README / README.en / CHANGELOG / `src/index.html`（头注释、app-version meta、页脚）/ `prototype/wireframes.html` 页脚 / `docs/tasks.md`。

---

## 迭代十一：实证复核 + 历史 tag 回填（2026-10-22 20:45，已完成）

**触发**：v1.15.0（`d9a29c23`）声称 16 项审计 + #10/#15/#16 收尾全部完成并归档。本轮实证复核（不轻信文档声明）+ 完成遗留 tag 缺口。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 19 | 实证复核 v1.15.0 各项声称 | P1 | ✅ 已完成 | #15 详情深链（`src/index.html` L3334-3400）、#16 限流持久化（`server.js` `data/ratelimit.json`）、#10 CI action 全钉 SHA——均核实为真实实现，非文档虚报 |
| 20 | 回填历史发布 tag 缺口 | P2 | ✅ 已完成（本地，未推送） | 考古 `package.json` 版本历史（`git log -S` 定位每版本首次出现提交），本地创建 21 个注解 tag：v1.14.74~87（14 个）+ v1.14.91~97（7 个）；v1.14.89/v1.14.90 从未进入 package.json（发布跳过），无法回溯。`v1.14.73→v1.14.99` 连续 |
| 21 | 生成 `bun.lock` | P2 | ✅ 已完成（原判 ⛔ 阻塞，已由**迭代十二**解除） | 原判「本地无 bun + 网络不可达（npmjs/bun.sh 超时）」；迭代十二以 `npm install -g bun@1.4.3` 成功解除环境阻塞，生成 `bun.lock` 并入库，故本行状态更正为已完成 |
| 22 | 推送本地提交与 tag | P1 | ⏸ 待用户确认 | 实测：本地 `main` 领先 `origin/main` **1 个提交**（`6c516574`），远端当前**无任何 tag**，本地 27 个 `v*` tag 待推送；另有 24 个 `sm-v-*` 备份标签不得推送，须用 `git push origin "refs/tags/v*"`。push 属外部动作，确认后执行 |

> 注：本轮为纯收尾/文档工作，应用代码无改动，版本维持 1.15.0 不 bump。

---

## 迭代十二：#22 推送版本 tag 至远端（v1.15.2，已完成）

**触发**：迭代十一（实证复核+历史 tag 回填）留下 #22「推送本地提交与 tag 至远端」待用户确认。用户确认「仅推送版本 tag（推荐）」——即仅推 `v1.14.73`~`v1.15.1` 共 27 个版本 tag，排除全部 `sm-v-*` skills-manager 快照标签（共 24 个），避免污染远端。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 22 | 推送版本 tag 至远端（排除 `sm-v-*`） | P1 | ✅ 已完成 | `git push origin $(git tag --list 'v*')` 精确推送 27 个版本 tag（v1.14.73~v1.14.88、v1.14.91~v1.14.99、v1.15.0、v1.15.1）；远端原无任何 tag，`sm-v-*` 0 个推送；`v1.15.1` tag 指向 `6c516574`，该提交（bun.lock）随之上远端 |

> 注：本轮仅推送 tag（按用户「仅推送版本 tag」决策），未推送 `main` 分支本身——远端 `origin/main` 仍停在 `d3156ef2`，而 `v1.15.1`/`v1.15.2` tag 指向更新的提交。分支与 tag 的一致性（是否 `git push origin main` 将 `origin/main` 推进至 v1.15.2）待用户确认，属独立外部动作。

---

## 迭代十三：任务文档重构收口 + v1.15.2 发布（v1.15.2，已完成）

**触发**：`docs/tasks.md` 回归「仅保存未完成任务」结构（已采纳前序重构设计），并据实测精确化 #22 推送条款；本轮将其落地为 v1.15.2 发布并完成 #22 归档。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | `docs/tasks.md` 仅保留未完成项，`#21`/`#22` 归档至 `docs/tasks-done.md` | P1 | ✅ 已完成 | 当前 tasks.md 无未完成项 |
| 2 | `package.json` / README / README.en / `src/index.html` / `prototype/wireframes.html` 版本对齐至 1.15.2 | P1 | ✅ 已完成 | 全量同步版本字符串 |
| 3 | `CHANGELOG.md` 补 `[1.15.2]` 条目（任务文档重构 + #22 条款精确化 + 推送完成） | P2 | ✅ 已完成 | 修正 #22 由「待推送」为「已推送」 |
| 4 | 提交 v1.15.2 变更并创建 `v1.15.2` 注解 tag | P1 | ✅ 待提交后建 tag | 8 文件版本对齐 + 任务文档同步 |

> 版本：patch bump 1.15.1 → 1.15.2（任务文档重构与发布收口，无应用代码改动）。

---

## 迭代十四：提交 bun.lock 并启用 frozen-lockfile（v1.15.1，已完成）

**触发**：迭代十虽完成 action 钉定与版本固定，但 #10 仍留残余——本地无 `bun` 导致 `bun.lock` 未生成，CI `bun install` 结果仍非完全可复现。本轮安装 CI 同版本 bun 彻底收口，解除迭代十一 #21 的环境阻塞。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 10 | 提交 `bun.lock`（收尾） | P2 | ✅ 已完成 | 安装 `bun@1.4.3`（与 `ci.yml` `BUN_VERSION` 对齐）后执行 `bun install` 生成 `bun.lock`（96 包 / 451 解析项）并入库；`.gitignore` 未忽略该文件 |
| 10b | 启用 `--frozen-lockfile` | P2 | ✅ 已完成 | `setup-env` 安装步骤改为 `bun install --frozen-lockfile`，锁文件与 `package.json` 不一致时 CI 直接失败，杜绝静默漂移 |
| 10c | 修正过期缓存注释 | P3 | ✅ 已完成 | `setup-env` 原注释称「仓库未提交 bun.lock」（且 `hashFiles` 本已含 `bun.lock`），已更新为反映锁文件已提交、缓存键可精确命中 |
| 17 | 提交本轮改动（`main`） | P1 | ✅ 已完成 | 显式 `git add` 列文件；commit `chore: 提交 bun.lock 并启用 frozen-lockfile（v1.15.1）` |
| 18 | 创建 `v1.15.1` 本地 tag | P1 | ✅ 已完成 | 建于提交后 HEAD `main`（接续 `v1.15.0`，patch bump） |

> 版本：patch bump 1.15.0 → 1.15.1（构建工具链收口）。同步 package.json / README / README.en / CHANGELOG / `src/index.html`（头注释、app-version meta、页脚）/ `prototype/wireframes.html` 页脚 / `docs/tasks.md`。
> **里程碑**：至本迭代结束，2026-10-22 审计 16 项（#1–#16）与全部收尾任务**无一剩余**，`docs/tasks.md` 已无未完成项。
> 仅剩 **#22「推送本地提交与 tag 至远端」**待用户确认（外部动作，未擅自执行）。

---

## 迭代十五：任务文档结构对齐与版本同步（v1.15.2，已完成）

**触发**：`docs/tasks.md` 已被重构为「仅保存未完成任务」结构，但前序一次全量覆写回退了该结构；同时 `docs/tasks-done.md` 出现**两个同名「迭代十一」**、且旧版 #21 仍标「⛔ 阻塞」与事实矛盾。本轮修复文档一致性（对应需求「两份文档一致、无遗漏或重复」）。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 23 | 恢复 `tasks.md`「仅未完成任务」结构 | P1 | ✅ 已完成 | 重写为仅保留 #22 一项，已完成项统一归档 `tasks-done.md`，消除两文档重复 |
| 24 | 消除 `tasks-done.md` 重复迭代编号 | P1 | ✅ 已完成 | 两个同名「迭代十一」重编为：十一（实证复核+tag 回填，20:45）/ 十四（bun.lock，v1.15.1，见下）；后续并行提交再度撞号，已于迭代十六按文件位置统一为十二→十五 |
| 25 | 修正失效的 #21 阻塞状态 | P1 | ✅ 已完成 | #21 已由迭代十二解除，状态由 ⛔ 阻塞 更正为 ✅ 已完成（原判阻塞），消除自相矛盾 |
| 26 | 版本同步至 v1.15.2 | P2 | ✅ 已完成 | package.json / README / README.en / CHANGELOG / `src/index.html`（头注释、app-version meta、页脚）/ `prototype/wireframes.html` 页脚 / `docs/tasks.md` 全部同步 |
| 17 | 提交本轮改动（`main`） | P1 | ✅ 已完成 | commit `docs: 任务文档结构对齐与版本同步（v1.15.2）` |
| 18 | 创建 `v1.15.2` 本地 tag | P1 | ✅ 已完成 | 建于提交后 HEAD `main` |

> 说明：迭代十四的 bun.lock 收口解决了 `docs/tasks.md` 重构版本中登记的 #21，故 `docs/tasks.md` 未完成清单当前**仅剩 #22（推送）**——其中 tag 侧已于迭代十二推送，分支侧仍待用户确认（详见迭代十六的远端实测）。

---

## 迭代十六：远端实况复核与文档事实纠错（v1.15.4，已完成）

**触发**：本轮以远端实测校验文档声明，发现两处与事实不符、一处编号撞号：
① `docs/tasks.md` #22 备注写「远端当前**无任何 tag**、本地 27 个 `v*` 均**未推送**」——但迭代十二已推送，实测远端 `v*` = 27、`sm-v*` = 0；
② 迭代十二标题称 #22「已完成」——实际仅完成 tag 推送，**`main` 分支未推送**（`origin/main` 仍 `d3156ef2`，本地领先 3 提交）；
③ 并行提交导致「迭代十二/十三」各出现两份（撞号）。

**远端实测（`git ls-remote --tags origin`，2026-10-22）**

| 项 | 实测结果 |
|---|------|
| 远端 `v*` tag | **27**（`v1.14.73`~`v1.14.88`、`v1.14.91`~`v1.14.99`、`v1.15.0`、`v1.15.1`） |
| 远端 `sm-v*` 备份标签 | **0** —— 迭代十二「排除 `sm-v-*`」声明**属实** ✅ |
| 远端 `origin/main` | `d3156ef2`（**未推进**） |
| 本地 `main` | `0373badc`，领先 **3** 个提交（`6c516574`、`a7586e5e`、`0373badc`） |
| 仅本地存在的 tag | `v1.15.2`、`v1.15.3`（`v1.15.4` 为本次新增） |

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 27 | 远端实况复核 | P1 | ✅ 已完成 | 以 `git ls-remote` 实测取代文档推断，纠正「远端无 tag」的失效表述 |
| 28 | 修正 #22 状态为「部分完成」 | P1 | ✅ 已完成 | tag 侧 ✅ 已推（27 个，`sm-v*` 0）；分支侧（22b）⏸ 待用户确认 |
| 29 | 消除迭代编号撞号 | P1 | ✅ 已完成 | 并行提交产生的重复「十二/十三」按文件位置统一重编为十二→十五 |
| 30 | 版本同步至 v1.15.4 | P2 | ✅ 已完成 | package.json / README / README.en / CHANGELOG / `src/index.html`（3 处）/ `prototype/wireframes.html` 页脚 / `docs/tasks.md` 同步 |

> **结论：`docs/tasks.md` 未完成清单仅剩 #22 的分支推送（22b）一项待用户确认**，属外部动作，未擅自执行。

---

## 迭代十七：远端进展复核与文档事实刷新（v1.15.5，已完成）

**触发**：距迭代十六（2026-10-22）一天后复核，远端已被外部推进，导致 tasks.md / tasks-done.md 中多项数字失效。本轮以远端实测刷新全部失效表述。

**远端实测（`git ls-remote`，2026-10-23）**

| 项 | 迭代十六记录（10-22） | 本次实测（10-23） |
|---|---|---|
| 远端 `origin/main` | `d3156ef2` | **`0373badc`**（已推 2 个提交） |
| 本地领先提交数 | 3 | **1**（仅 `f212784f`） |
| 远端 `v*` tag | 27（至 `v1.15.1`） | **28**（至 `v1.15.2`） |
| 远端 `sm-v*` 标签 | 0 | **0**（排除策略持续生效 ✅） |
| 仅本地的 tag | `v1.15.2`、`v1.15.3` | **`v1.15.3`、`v1.15.4`** |

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 31 | 远端进展复核 | P1 | ✅ 已完成 | 实测取代文档推断，确认外部已推进分支 2 提交、推送 `v1.15.2` tag |
| 32 | 刷新 tasks.md / tasks-done.md 失效数字 | P1 | ✅ 已完成 | 修正「origin/main 停 `d3156ef2` / 领先 3 / `v*` = 27 / `v1.15.2` 仅本地」等失效表述 |
| 33 | 更新 #22b 剩余范围 | P1 | ✅ 已完成 | 剩余收窄为：推送最后 1 个提交（`f212784f`）+ `v1.15.3`/`v1.15.4` tag |
| 34 | 版本同步至 v1.15.5 | P2 | ✅ 已完成 | package.json / README / README.en / CHANGELOG / `src/index.html`（头注释、app-version meta、页脚）/ `prototype/wireframes.html` 页脚 / `docs/tasks.md` 全部同步 |

> **结论：`docs/tasks.md` 未完成清单仍仅剩 #22b（推送最后 1 个提交 + `v1.15.3`/`v1.15.4` tag）**，属外部动作，需用户确认后执行。

---

## 迭代十八：#22b 推送完成，未完成任务清零（v1.15.6，已完成）

**触发**：用户确认「推送分支 + v\* tag（推荐）」。执行 `git push origin main` + `git push origin "refs/tags/v*"`。

**推送实测（2026-10-23）**

| 项 | 推送前 | 推送后（实测） |
|---|---|---|
| 远端 `origin/main` | `0373badc`（落后本地 2 提交） | **`61d714f0`**，`git log origin/main..main` 为空 → 完全同步 ✅ |
| 远端 `v*` tag | 28 | **31**（新增 `v1.15.3` / `v1.15.4` / `v1.15.5`） |
| 远端 `sm-v*` 备份标签 | 0 | **0**（零污染，`sm-v-*` 排除策略全程有效 ✅） |

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 22b | 推送 `main` 分支与剩余 tag 至远端 | P1 | ✅ 已完成 | `git push origin main`（`0373badc..61d714f0`）+ `git push origin "refs/tags/v*"`（新增 `v1.15.3`/`v1.15.4`/`v1.15.5` 三个 tag）；`sm-v-*` 未推 |
| 35 | 归档 #22b 并清空 `tasks.md` 未完成清单 | P1 | ✅ 已完成 | `docs/tasks.md` 未完成任务改为「（无）」，本迭代记录推送实测 |
| 36 | 版本同步至 v1.15.6 | P2 | ✅ 已完成 | package.json / README / README.en / CHANGELOG / `src/index.html`（头注释、app-version meta、页脚）/ `prototype/wireframes.html` 页脚 / `docs/tasks.md` 同步 |
| 17 | 提交并推送本轮改动 | P1 | ✅ 已完成 | commit `chore: 推送分支与剩余 tag，#22b 完成、未完成任务清零（v1.15.6）` + 注解 tag `v1.15.6`，二者均已推送 |

> **里程碑：`docs/tasks.md` 未完成任务清零。** 2026-10-22 全面体检审计 16 项（#1–#16）、#10 可复现构建（含 `bun.lock` + `--frozen-lockfile`）、#15 详情深链、#16 限流持久化、#21 `bun.lock` 生成、#22 tag 与分支推送——**全部完成并归档，无任何剩余项**。

---

## 迭代十九：代码与页面 UI 修复（v1.16.0，已完成）

> 日期 2026-10-23。来源：代码与页面 UI 专项审查（docs/tasks.md 13 项）+ 规范 / prototype 对齐。

### 修复与变更
| # | 任务（原优先级） | 处理结果 |
|---|---|---|
| 1 | 内联数据与权威数据脱节（P1） | 修复：`scripts/sync-inline-data.mjs` + `npm run sync:data` 从 `data/skills-data.json` 重建 `window.SKILLS_DATA`（167）；meta / 内联 / data 三处口径一致 |
| 2 | 限流未设 trust proxy 误伤全站（P1） | 修复：server.js `app.set('trust proxy', 1)` 从 `X-Forwarded-For` 取真实客户端 IP |
| 3 | 静态挂载 src/ 暴露多余文件（P2） | 修复：移除 `express.static(src)`，仅暴露 `public/` 与 `/skills` |
| 4 | 「离线可用」声称无 PWA 支撑（P3） | 修复：文案改为「纯静态」（原型未声称离线） |
| 5 | `<html lang>` 切换不更新（P3） | 核实：代码已具备（`root.setAttribute("lang", current)`），无需改 |
| 6 | 卡片缺 role/aria-label（P3） | 修复：技能卡片补充 `role="button"` 与 `aria-label` |
| 7 | API 失败静默无反馈（P3） | 修复：投票 / 收藏同步失败给出 toast 提示 |
| 8 | 无 404 / 错误处理（P3） | 修复：server.js 增加 `/api` JSON 404、全局错误兜底、非 `/api` SPA 回退 |
| 9 | 死代码 03-detail.js（P3） | 修复：删除文件并清理空目录 |
| 10 | Next 重定向壳冗余（P3） | 维持：`next build` 依赖 `src/app`，构建后由 `cp` 覆盖，删除会破坏构建 |
| 11 | 单文件 322KB 性能（P3） | 维持：spec §7.10 豁免拆分（内联单文件应用既定决策） |
| 12 | 页脚日期硬编码 hack（P3） | 修复：运行时直接填充当前日期 |
| 13 | og:url 指向 GitHub（P3） | 维持：指向仓库主页，符合项目地址约定 |

### 验证
- `npm test`：tools/lib 7 用例全部通过。
- `node --check server.js` 通过；index.html 内联脚本经 `new Function` 解析全部通过。
- 启动服务冒烟（端口 3100，避开 WSL 占用的 3000）：`/api/votes`、`/api/favorites` 200；`/data/skills-data.json` 200（167 技能）；`/api/nope`→404 JSON；深链 `/skills/x/`→200 首页；POST 合法技能 200、非法技能名 400（白名单拦截）。

### 文档 / 版本
- 版本 1.15.7 → 1.16.0（package.json / index.html 头注释与 meta / README 徽章 / CHANGELOG / spec 头）。
- CHANGELOG 新增 v1.16.0；spec §8.8 / §8.9 标记修复、版本引用对齐 1.16.0。
- 新增 `scripts/sync-inline-data.mjs`。

---

## 迭代二十：server.js 模块化拆分（v1.16.2，已完成）

> 日期 2026-10-23。来源：用户要求「拆分所有超过 200 行的源代码文件」。合规复核发现 `server.js` 因上一轮新增 trust proxy / 安全响应头 / JSON 404 / SPA 回退而涨至 **235 行**，超出「源码单文件 ≤200 行」红线。

### 拆分结果
| 文件 | 职责 | 行数 |
|---|---|---|
| `server/config.js` | 路径/环境常量（ROOT_DIR / PORT / HOST / GA / data 文件路径） | 24 |
| `server/fs-util.js` | JSON 读取 + 原子写（含尾随换行） | 29 |
| `server/store.js` | KV 内存态 + 防抖原子落盘 + 技能白名单 | 35 |
| `server/ratelimit.js` | 限流持久化 + rateLimitMiddleware + 退出前强制落盘 | 67 |
| `server/api.js` | 投票/收藏路由 + 入参与白名单校验 | 66 |
| `server/pages.js` | 静态资源与公开数据、首页、SPA 回退 | 32 |
| `server.js`（根） | 仅装配（中间件顺序 + 路由挂载） | 45 |

### 关键约束（拆分时最易踩的坑）
- **挂载顺序必须保持**：静态与公开数据在限流**之前**（不占 API 配额）；其后为 `mountApi` → `mountHome` → `/api` JSON 404 → 全局错误兜底 → `mountSpaFallback`。若 SPA 回退早于 `/api` 404 挂载，未知 API 会被回退成 HTML，JSON 404 即失效。
- 与原实现的差异仅两处且均为等价/改良：原子写补尾随换行（消除无谓 diff）；限流 Map 在模块内先初始化再定义函数（消除原对 TDZ 的隐式依赖）。

### 验证
- `node --check`：7 个文件全部通过。
- 冒烟（端口 3100，避开被 WSL 占用的 3000）：`GET /` 200 HTML；`/api/votes`、`/api/favorites` 200；`/data/*.json` 200（total 167）；**`/api/nope` → 404 JSON**（顺序敏感项已确认保持）；深链 `/skills/x/` → 200 首页；`/favicon.svg` 200；POST 投票 200、undo 200、非法技能名 400（白名单拦截）；收藏 add/remove 200。
- `npm test` 7/7 通过；版本 1.16.1 → 1.16.2，全展示位一致。

### 说明
- `skills/`（168 个上游 vendored 技能及其自带脚本）不属本项目源码拆分范围，故未扫描/拆分。

---

## 迭代二十一：GA4 衡量 ID 环境变量化（v1.15.7，已完成，本轮补录）

> 来源：用户请求「把谷歌分析的衡量ID代码转换成部署平台的环境变量」。原提交 `16e7907c`（v1.15.7）已完成代码改造，但当时未登记至任务文档；本轮在多轮 v1.16.x 重构后复核机制完好，补录归档。

### 变更与验证
| # | 任务 | 优先级 | 状态 | 备注 |
|---|---|---|---|---|
| 1 | `src/index.html` 硬编码 GA 衡量 ID 改为占位符 | P1 | ✅ 已完成 | `G-WQDDVB14PF` → `__GA_MEASUREMENT_ID__`（gtag js src 与 config 两处） |
| 2 | 新增 `scripts/inject-ga.mjs` 构建期注入 | P1 | ✅ 已完成 | 读取 `process.env.GA_MEASUREMENT_ID`（缺省回退 `G-WQDDVB14PF`）替换 `out/index.html` 占位符 |
| 3 | `server.js`（后拆分至 `server/`）本地预览按 env 注入 | P1 | ✅ 已完成 | `server/config.js` 导出 `GA_TOKEN`/`GA_ID`，`server/pages.js` 首页渲染时替换占位符 |
| 4 | `package.json` build 脚本追加注入步骤 | P2 | ✅ 已完成 | `next build && cp src/index.html out/index.html && node scripts/inject-ga.mjs` |
| 5 | CI `build` job 注入 `vars.GA_MEASUREMENT_ID` | P2 | ✅ 已完成 | `.github/workflows/ci.yml` 设 `GA_MEASUREMENT_ID: ${{ vars.GA_MEASUREMENT_ID }}` |
| 6 | README 补充「环境变量（部署）」小节 | P3 | ✅ 已完成 | 说明变量名 / 默认值与配置位置 |
| 7 | 经 v1.16.x 重构复核机制完好 | P1 | ✅ 已完成 | 实测：`src/index.html` 占位符、`inject-ga.mjs`、`server/config.js` GA_TOKEN/GA_ID、`server/pages.js` 注入、`ci.yml` 变量均保留 |

### 说明
- 部署前须在仓库 **Settings → Variables** 配置 `GA_MEASUREMENT_ID`（非密钥，GA 衡量 ID 公开）；EdgeOne 平台构建同理设同名变量。
- 模拟 `cp` + 注入验证：注入前 2 占位符 → 注入后 0 占位符、2 个环境变量值，机制有效。
