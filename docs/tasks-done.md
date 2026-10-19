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

> 改动未提交（工作树含 `src/index.html`、`docs/tasks.md`、`docs/tasks-done.md`）。
