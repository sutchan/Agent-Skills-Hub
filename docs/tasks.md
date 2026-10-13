# 任务清单 — Agent Skills Hub

> 最后更新：2026-10-13（新增问题诊断分析与迭代六持续开发完善规划）

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
| 4 | 重写 `docs/AGENTS.md`（AI 协作指引） | P1 | ✅ 已完成 | 去 OpenSpec 标题；修角色契约矛盾（不再生成 proposal.md/design.md 产物，对齐 tasks.md 工作流） |
| 5 | 重写 `.github/CONTRIBUTING.md`（贡献指南） | P1 | ✅ 已完成 | 修正工作分支 `dev`→`main`；与 spec 去重；统一标题层级与代码围栏 |
| 6 | 优化 `.codebuddy/memory/MEMORY.md` | P1 | ✅ 已完成 | 主题归类（①~⑨）；标注时效/可信度；去除与文档重复的契约全文 |
| 7 | 清理 2 条失效全局记忆（55 技能/5 类、204 vs 200） | P2 | ✅ 已完成 | 与当前 169/14 矛盾，已删除 |
| 8 | 追加 daily 记录（2026-10-01.md） | P2 | ✅ 已完成 | 记录重组决策与结论 |

> 文档分工：spec.md=权威契约；project.md=仓库约定；AGENTS.md=AI 协作；CONTRIBUTING.md=贡献操作。四文档互为引用、冲突以 spec.md 为准；仓库不使用 OpenSpec CLI，变更经本 tasks.md 跟踪。

---

## 迭代三：修复重复导入技能 + 构建验证（2026-10-04，已完成）

**触发**：2026-10-04 复跑 `validate-skills` 发现新的 P0 契约违规——新增的 `skills/ai-image-generation-2/` 是重复导入且 frontmatter 不合规，会触发 ci.yml `validate-skills` 硬门禁阻断。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | 复验 `validate-skills.mjs`，定位契约违规 | P0 | ✅ 已完成 | `ai-image-generation-2/SKILL.md` 共 5 个问题：缺 `en_description`/`zh_displayName`/`category`/`en_category`，且 `name` 与目录名不一致 |
| 2 | 判定该技能为重复导入 | P0 | ✅ 已完成 | 两目录均仅含 `SKILL.md`，正文 28350 字符**完全一致**，仅 frontmatter 不同（副本为破损上游格式） |
| 3 | 删除重复技能目录 `skills/ai-image-generation-2/` | P0 | ✅ 已完成 | 按仓库去重约定删除，而非改造为 `ai-image-generation-2` 冗余技能 |
| 4 | 复验契约通过 | P0 | ✅ 已完成 | `✅ skills 校验通过：170 个技能 frontmatter 规范` |
| 5 | 运行完整 `npm run build` 验证（即原任务 #13） | P3 | ✅ 已完成 | `✓ Compiled successfully`；类型检查通过；`Generating static pages (173/173)`；路由 `/`、`/_not-found`、`/skills/[slug]` 均产出；**未再出现** Windows standalone `EPERM` |
| 6 | 重建数据 / 原型产物 | P1 | ✅ 已完成 | `Wrote 170 skills across 14 categories`；`prototype.html` 247.1 KB；`skills-metrics.json` 更新 |
| 7 | 版本 bump 1.14.61 → **1.14.73** | P1 | ✅ 已完成 | 全量扫描 CHANGELOG 后确认 1.14.x 系列在 2026-08-20 已推进至 **1.14.72**（1.14.70/71/72 均已占用），故取 1.14.73；同步 package.json / README 中英徽章 / CHANGELOG（含锚点）。注：初判的 1.14.70 存在碰撞，已修正 |
| 8 | 同步本次进度到 tasks.md | P2 | ✅ 已完成 | 时间戳 2026-10-04 |

---

## 迭代四：frontmatter 契约字段批量回填 + 版本同步至 v1.14.74（2026-10-07，已完成）

**触发**：技能 frontmatter 普遍缺 `en_description` / `zh_displayName` / `category` / `en_category` 等契约必填字段（上游导入遗留），且版本号需统一至 1.14.74。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | 以 git 历史中文权威源 `71e5f23^` 为基准，批量回填 170 个 `skills/*/SKILL.md` 的 `description`(中) / `en_description`(英) / `zh_displayName` / `category` / `en_category` 五字段；英文 `description` 迁至 `en_description`；修正 name≠目录名 | P0 | ✅ 已完成 | 外部 skills-manager 自动提交 `ab00264 chore: 回填技能 frontmatter 契约字段`；`validate-skills` → 170 技能全规范 |
| 2 | 重建 `data/skills-data.json`（170 / 14 类，无「其他」类）、`data/skills-metrics.json` 与 `prototype/prototype.html`；复验契约 | P0 | ✅ 已完成 | `ab00264`；`71e5f23` 引入的「其他」类回退随回填消除 |
| 3 | 同步 `app/globals.css` 与 token css（base / layout / components / responsive） | P1 | ✅ 已完成 | `ab00264` |
| 4 | 文档版本同步至 v1.14.74（package.json / README 徽章 / CHANGELOG / 各文档头注释） | P1 | ✅ 已完成 | 全局 1.14.74 已由外部统一；`v1.14.74` tag 仍缺失（登记于 #15） |
| 5 | 重建原型 `prototype.html` 注入版本 1.14.74（footer `v1.14.74`） | P2 | ✅ 已完成 | 对齐全局版本 |
| 6 | 核对 README 中/英分类计数表与 `data` 实算分布一致 | P2 | ✅ 已完成 | 修正「自动化与集成」误写 6→5（实算 5） |
| 7 | 更新本 tasks.md 记录迭代四 | P2 | ✅ 已完成 | 时间戳 2026-10-07 |

> 注：本次「更新原型及相关文档」由用户于 2026-10-07 发起；批量回填 / 数据重建 / 文档版本同步的主体由外部 skills-manager 自动提交（`ab00264`），本迭代收口原型版本注入与文档计数核对。

---

## 后续迭代（验证 / 建议）

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 11 | 分析 commit 998370c 来源并建立防护机制 | P1 | ✅ 已完成 | 根因：Skills Manager 批量更新覆盖 frontmatter；防护=ci.yml 的 `validate-skills` job 改为**硬门禁**（去 `continue-on-error`）；修正过时注释（"223 个/118 缺字段"→现状 169 全部规范） |
| 12 | 检查 998370c 是否还有其他破坏性变更 | P2 | ✅ 已完成 | `git show --stat 998370c`：仅 frontmatter 覆盖 + 新增 vercel-react 技能，无删除配置/CI；data 无"其他"类 |
| 13 | 验证 `npm run build` 的 Next.js 完整构建产物 | P3 | ✅ 已完成 | 2026-10-04 本地实测全绿：编译成功 + 类型检查通过 + 静态生成 173/173 + 路由表输出；历史 Windows standalone `EPERM` 未再复现 |
| 14 | 治理 CHANGELOG 版本序列 | P1 | ⬜ 待处理 | **全量诊断**：共 247 个版本小节；1.14.x（96 个）与 1.20.x（72 个）双序列交错；**28+ 版本号重复**（1.14.39–1.14.61 近乎全部重复，另含 1.20.55 / 1.20.28 / 1.20.3 / 1.19.30 / 1.19.2）；1.14.x 最大已到 1.14.72。治理需重排历史编号与锚点，属历史重写，**待用户确认方案后执行** |
| 15 | 建立 `v*` 发布 tag 流程 | P2 | ⬜ 待处理 | 仓库仅有 skills-manager 的 `sm-v-*` 自动标签，**无任何 `v1.14.x` tag**；`check-version.mjs` 仅在 tag 推送时校验 tag，故常规 CI 未暴露该缺口 |
| 16 | 修正文件头注释版本漂移 | P3 | ⬜ 待处理 | `next.config.mjs` 头注释标 `v1.20.49`、`taxonomy.mjs` 标 `v1.20.67`、prototype 令牌 base 标 `1.20.17`，与实际 1.14.x 序列不一致 |
| 17 | 处理本地重复构建被 IDE safe-delete 守卫拦截 | P3 | ⬜ 待处理 | 2026-10-04 实测：`.next` 已有 ≥500 文件时，`next build` 清理阶段触发 `[safe-delete][SAFE_DELETE_BULK_CONFIRM_REQUIRED] count:500`（IDE `node-safe-delete-shim.cjs` 拦截 `fs.unlink`）而失败；属工具环境限制，非代码缺陷。规避：构建前清空 `.next`，或以 CI ubuntu `build` job 为准 |

---

## 迭代五：点赞与收藏边缘存储集成规划（Tencent Cloud EdgeOne / EO Makers）

**目的**：为点赞与收藏功能规划基于腾讯云 EdgeOne / EO Makers 平台的边缘存储架构（Edge KV + Edge Functions），明确公共计数与用户态存储实现方法。

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | 在 `docs/project.md` 规划 EdgeOne / EO Makers 边缘存储架构 | P1 | ✅ 已完成 | 确立点赞全局 KV 计数与收藏双模（localStorage + Edge KV）存储方案 |
| 2 | 在 `docs/tasks.md` 登记点赞与收藏边缘存储开发与实施任务 | P1 | ✅ 已完成 | 本任务 |
| 3 | 编写 EdgeOne 边缘函数接口（`/api/votes`、`/api/favorites`）与 Edge KV 模拟存储逻辑 | P2 | ✅ 已完成 | 已在 `server.js` 实现，通过 `data/kv-store.json` 模拟 Edge KV |
| 4 | 扩展前端客户端收藏与点赞逻辑，双向同步对接 EO Makers 边缘云端存储 | P2 | ✅ 已完成 | 已实现 localStorage 缓存 + 异步云端 API 双向同步 |
| 5 | 为技能卡片添加键盘快捷键（按 'f' 键）快速收藏当前选中的技能 | P2 | ✅ 已完成 | 提升交互效率，支持双语 Toast 提示与分析埋点 |

---

## 应用程序存在的问题与不足深入诊断（2026-10-13）

经过对源码（`src/index.html`、`server.js`、`edge-worker.js`、`src/parts/`、`src/app/`）、构建脚本、文档基线及近期交互优化的全链路审查，提炼出当前系统存在的四个核心维度问题与改进空间：

### 1. 前端代码架构与模块化 (Architecture & Modularity)
- **单文件严重臃肿（Monolithic HTML）**：`src/index.html` 包含逾 3500 行代码，内嵌了全部 CSS 样式、近 2000 行内嵌数据包（`SKILLS_DATA` 171+ 技能全量 JSON）以及全部交互逻辑脚本（从 `01-state` 到 `06-votes`）。虽然此前在 `src/parts/` 中有过抽离尝试，但未形成统一的自动化打包构建管道，导致代码维护、审查与测试难度极高。
- **双重技术栈并存且割裂**：仓库同时存在根静态单页 `src/index.html` 与 Next.js 14/16 App Router（`src/app/`），`package.json` 中的构建脚本使用 `next build && cp src/index.html out/index.html` 强制用静态单页覆盖 Next.js 产物。两套体系维护割裂，未充分利用 Next.js 的服务端渲染（SSR）或静态增量生成（ISR）优势。
- **全局状态污染与单向数据流缺失**：所有交互状态全部挂载在非受控的全局对象（`window.state`）上，搜索、分类筛选、排序、视图模式和收藏状态的更新依赖命令式 DOM 操作与粗暴的全量 `renderGrid()` 调用，缺乏精细的组件响应式通信机制。

### 2. 用户交互、无障碍与渲染性能 (UI/UX, A11y & Performance)
- **大列表全量 DOM 渲染开销**：当未开启分页或切换到全量展示时，171+ 张包含复杂徽章、多层阴影、指标与按钮的 DOM 卡片一次性挂载，导致初次渲染产生较长的长任务（Long Task），且滚动时引发重排与复合重绘，低端移动设备存在掉帧隐患。
- **搜索匹配与多维筛选缺陷**：
  - 搜索匹配仅采用基础的大小写不敏感子串包含（`includes`），缺乏分词加权（标题权重 > 标签权重 > 描述权重）、拼音/首字母模糊索引和容错纠错匹配。
  - 分类目前仅支持单一分类高亮筛选，无法支持分类与标签（Tags）的复合交叉多选；针对用户曾反馈的“重复分类功能”，存在部分相近类别边界模糊、多标签重叠及筛选结果为空时缺乏重置引导的问题。
- **无障碍（WCAG AA）与微动效未完全闭环**：
  - 卡片的垂直位移与微缩放（`translateY(-6px) scale(1.01)`）未适配系统的 `prefers-reduced-motion: reduce` 媒体查询，开启减弱动画的用户可能产生视觉不适。
  - 技能详情 Modal / 抽屉展开时，缺乏焦点捕获（Focus Trap）与背景滚动锁定（Scroll Lock），键盘 Tab 键可逃逸至底层卡片。
  - 缺少统一的 `aria-live` 区域，点赞累加、快捷键快速收藏、筛选计数变动未向读屏软件提供无障碍实时播报。

### 3. 服务端并发、安全与存储健壮性 (Backend & Edge Reliability)
- **同步写文件与并发冲突风险**：`server.js` 内部使用同步阻塞的 `fs.writeFileSync(STORE_FILE, ...)`。在多客户端高频并发点赞/收藏时，可能引发写冲突或进程阻塞；非原子性写入（Atomic Write）在进程崩溃或异常重启时容易导致 `kv-store.json` 数据损坏。
- **接口入参白名单与安全校验缺失**：`/api/votes` 与 `/api/favorites` 仅判空 `name`，未校验其是否属于合法预定义的 171+ 技能白名单命名规范（kebab-case 且在数据字典内），恶意构造的超长或特殊字符 key 会造成存储膨胀或内存污染。缺少基础的速率限制（Rate Limit）与防刷频防护。
- **边缘环境与本地模拟割裂**：目前本地仅靠 `kv-store.json` 单文件模拟 Tencent Cloud EdgeOne KV 读写，虽然撰写了 `edge-worker.js`，但缺少 EdgeOne 真实的部署与自动化校验脚本，生产级环境鉴权与灾备回退机制未实装。

### 4. 工程化规范、测试覆盖与版本漂移 (Engineering & CI/CD)
- **测试套件空转**：`package.json` 中的 `npm test` 脚本配置为 `node --test tools/lib/*.test.mjs`，由于当前仓库根目录无 `tools/` 目录，执行测试显示 0 用例空转；缺少针对交互逻辑（输入法防抖、收藏双向同步、点赞状态累加）的自动化单元测试与 E2E 测试。
- **版本号跨文档漂移**：`package.json` 已演进至 `1.14.88`，但 `docs/spec.md` 仍停留在 `1.14.85`；此外旧有版本双序列交错治理（#14）仍待收口。

---

## 迭代六：架构解耦、交互性能与健壮性完善（持续开发规划）

**目的**：针对上述诊断出的四大维度问题，制定落地工程方案，分批次完成模块拆分解耦、搜索与筛选体验升级、无障碍合规、服务端原子化写入与测试覆盖健全。

| # | 任务 | 优先级 | 状态 | 备注与实施路径 |
|---|------|--------|------|----------------|
| 1 | `server.js` 数据存储改造为原子写入（Atomic Write）与防抖写入队列 | P0 | ✅ 已完成 | 引入临时文件交换（写入 `.tmp` 后 `fs.renameSync`）及内存写队列防抖，彻底消除并发写坏 JSON 风险 |
| 2 | 后端 API 入参校验与白名单防御（`/api/votes`、`/api/favorites`） | P0 | ✅ 已完成 | 校验 `name` 必须匹配既有技能库合法标识符，限制单 IP 请求速率，防范非法 key 污染 |
| 3 | 适配 `prefers-reduced-motion` 与键盘无障碍焦点捕获（Focus Trap） | P1 | ⬜ 待处理 | 为卡片 hover 动效添加减弱动态支持；在详情弹窗内实现焦点锁定，ESC 关闭与背景防穿透滚动 |
| 4 | 完善多维分类与多标签（Tag）复合筛选机制 | P1 | ⬜ 待处理 | 优化分类选择逻辑，支持分类与能力标签交叉多选，提供空结果智能推荐与一键重置引导 |
| 5 | 优化搜索性能与拼音/模糊权重匹配（Fuzzy Search） | P1 | ⬜ 待处理 | 建立标题、拼音首字母、分类、描述的分词加权索引，提升搜索精准度并降低长列表匹配卡顿 |
| 6 | 引入虚拟滚动（Virtual Scroll）或分页懒加载性能优化 | P2 | ⬜ 待处理 | 对 171+ 技能大列表引入按需渲染与分批加载，降低长任务 DOM 节点数，提升首屏可交互时间（TTI） |
| 7 | 梳理前端模块化打包流水线，消除 `src/index.html` 3500+ 行单文件耦合 | P2 | ⬜ 待处理 | 将内联 CSS、`SKILLS_DATA` 数据包与各个 `src/parts/*.js` 规范化分离，通过标准构建注入，明确原型与 Next.js 职责边界 |
| 8 | 修复 `npm test` 测试命令并补充核心交互单元测试与 E2E 用例 | P2 | ⬜ 待处理 | 修正测试路径，为本地存储同步、点赞累加、输入法合成防抖编写自动化回归用例 |
| 9 | 文档版本全量对齐（`spec.md` 同步至 1.14.88 及后续版本规范） | P3 | ✅ 已完成 | 更新 `docs/spec.md` 版本号及契约描述，保持与 `package.json` 及页面元数据一致 |

---

## 变更摘要

- **迭代一（修复 CI）**：125 个技能缺失 4 个必填 frontmatter 字段 → 修复后 169 个全部通过校验，数据与原型已重建；防护机制（validate-skills 硬门禁）已落地于 `ci.yml`。
- **迭代二（文档重组）**：四份规范文档统一结构/术语、spec.md 定为权威契约源；MEMORY.md 主题归类 + 时效/可信度标注；清理 2 条失效全局记忆；版本 bump 至 1.14.58。
- **迭代三（重复技能清理 + 构建验证）**：删除重复导入的 `ai-image-generation-2`（正文与 `ai-image-generation` 完全一致、frontmatter 破损），校验恢复 **170 个技能**全通过；`npm run build` 本地全绿（编译 + 类型检查 + 173/173 静态生成），任务 #13 关闭；版本 bump 至 **1.14.73**（1.14.x 系列已占用至 1.14.72）。
- **环境验证结论（2026-10-04 更新）**：Windows 上 `next build` 本次**完整通过**，此前 standalone 清理阶段的 `EPERM` 未再复现；CI ubuntu `build` job 仍保留为权威验证路径。新增待办 #14（CHANGELOG 版本序列治理：247 小节 / 双序列交错 / 28+ 版本号重复）、#15（缺 `v*` 发布 tag）、#16（文件头注释版本漂移）、#17（本地重复构建被 IDE safe-delete 守卫拦截）。
- **迭代四（frontmatter 回填 + 版本同步 v1.14.74）**：外部 skills-manager 自动提交 `ab00264` 以 `71e5f23^` 为权威源，批量回填 170 技能五契约字段（英文 `description` 迁至 `en_description`），重建 data / prototype 消除 `71e5f23` 的「其他」类回退；全局版本统一至 1.14.74（仅缺 `v1.14.74` tag，见 #15）；本迭代收口原型版本注入与 README 分类计数核对（修正「自动化与集成」6→5）。
- **迭代五（EdgeOne / EO Makers 边缘存储规划）**：确立点赞全局 KV 计数与收藏双模（localStorage + Edge KV）存储方案，在 `server.js` 实现本地模拟，支持双向同步与快捷键 'f' 收藏。
- **迭代六（应用程序全面诊断与持续开发规划）**：完成前端单文件臃肿、双轨技术栈割裂、状态管理、搜索匹配、分类多维复合筛选、动效与无障碍（WCAG AA）、服务端原子写入与并发安全、测试套件空转等系统性问题诊断，并建立包含 9 项具体任务的迭代六持续改进实施路线图。

> 最后同步：2026-10-13 — 迭代一至五已收口；新增「应用程序存在的问题与不足深入诊断」及「迭代六（持续开发规划）」。

