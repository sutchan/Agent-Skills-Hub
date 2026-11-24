# 生产就绪工程规范与完善清单

> 路径：`docs/production-readiness.md` · 版本：1.21.3
> 定位：面向生产环境的**工程规范目标 + 现状差距 + 改进清单**。本文描述「应当达到的标准」，不覆盖 `docs/spec.md` 的「当前能力真相」语义；凡标为「待落地」的条款，须在真实实现并验证后才可改为「已落地」。
> 权威源：能力契约 [spec.md](spec.md)；仓库约定 [project.md](project.md)；AI 协作 [AGENTS.md](AGENTS.md)；贡献流程 [.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md)；安全政策 [.github/SECURITY.md](../.github/SECURITY.md)。

---

## 0. 标记口径

| 标记 | 含义 |
|---|---|
| ✅ 已落地 | 仓库已有实现或门禁，可通过命令/配置验证 |
| ⚠️ 部分落地 | 有约定或工具，但缺量化门槛、强制执行或文档化 |
| ❌ 缺失 | 无明确规范、无门禁、无验证手段 |
| P0 / P1 / P2 | 上线前必须 / 一个迭代内 / 持续优化 |

---

## 1. 代码质量标准与审查流程

### 现状

- ✅ 自有源码单文件 ≤200 行；`src/index.html` 作为自包含单页应用豁免（spec §7 红线 10）；`skills/` 为上游内容不纳入拆分。
- ✅ 语义化 DOM id（kebab-case）、LF 换行、kebab-case 目录名、`tsc --noEmit` 类型检查、提交前门禁清单（AGENTS「质量门禁」）。
- ⚠️ `tsconfig.json` 为 `strict: false`；仓库无 ESLint/Prettier 规则配置，格式与风格依赖人工约定；PR 模板有检查清单但无强制审批人数与 CODEOWNERS。
- ❌ 无成文的代码审查清单（安全/数据一致性/三语同步/可访问性逐项签字），无「谁可批准生产变更」的明确规则。

### 目标规范与改进建议

| # | 建议 | 优先级 | 状态 |
|---|---|---|---|
| 1.1 | 制定并启用统一 lint/format 规则（ESLint + Prettier 或明确声明「仅 tsc + 人工审查」并给出理由），规则变更需版本 bump | P1 | 待落地 |
| 1.2 | 分阶段推进 `strict: true`：先 `noImplicitAny` / `strictNullChecks`，遗留豁免逐文件登记，禁止新增 any | P2 | 待落地 |
| 1.3 | PR 至少 1 名非作者审查通过；生产配置、数据管线、依赖变更需 CODEOWNERS 指定审查人 | P1 | 待落地 |
| 1.4 | 在 PR 模板固化审查清单：数据型数字实算、三语键位、DOM id 语义化、≤200 行、无 `console.log`/`debugger`、版本号与 CHANGELOG 同步 | P1 | 部分落地 |

---

## 2. 测试策略（单元 / 集成 / 端到端）与覆盖率

### 现状

- ✅ 单元测试：`npm test` = `node --test tools/lib/*.test.mjs`，现有 5 个套件（skills-data / kv-store / api-contract / i18n-parity / data-sync）。
- ✅ 契约校验：`validate-skills.mjs`、`validate:yaml`、`check:metrics`、`check-version`、`check-inline-js` 均在 CI `validate` job 执行。
- ✅ E2E：`npm run e2e` = Playwright（`e2e/smoke.spec.ts`，验证网格渲染与搜索过滤），CI `e2e` job 执行并在失败时上传报告。
- ✅ 存储联调：`node scripts/verify-storage.mjs` 验证 votes/favorites API 与持久化。
- ❌ 无覆盖率统计与最低门槛；无测试分层职责定义（单元/集成/E2E 各测什么）；无「新增功能必须补测试」的强制检查；E2E 仅覆盖渲染与搜索，未覆盖投票/收藏/收藏夹/详情弹窗/语言切换。

### 目标规范与改进建议

| # | 建议 | 优先级 | 状态 |
|---|---|---|---|
| 2.1 | 定义测试金字塔：单元测纯函数与数据契约；集成测 API + 存储（本地文件与 Blob 双后端）；E2E 只测关键用户旅程 | P1 | 待落地 |
| 2.2 | 引入覆盖率（`node --experimental-test-coverage` 或 c8）并设门槛：`tools/lib/` 核心 ≥80%、`scripts/` ≥60%、E2E 覆盖搜索/筛选/详情/投票/收藏/语言切换全部关键路径 | P1 | 待落地 |
| 2.3 | CI 增加覆盖率门禁与趋势输出（写入 `GITHUB_STEP_SUMMARY`），低于门槛即失败 | P1 | 待落地 |
| 2.4 | 新增测试必须覆盖边界：空数据、隐藏技能、非法技能名、限流 429、Blob 不可用 503、token 缺失 | P2 | 待落地 |

---

## 3. 安全与合规规范

### 现状

- ✅ `.github/SECURITY.md`：漏洞报告渠道、72 小时确认、CVSS 分级、披露流程、安全红线。
- ✅ 密钥不入库：GA ID 用 `vars`，`EDGEONE_API_TOKEN` / `BLOB_READ_WRITE_TOKEN` 经 Actions secrets 注入；`persist-credentials: false`；第三方 action 固定 SHA。
- ✅ 输入侧：技能名白名单（`server/store.js`）、IP 限流 120 次/分（`server/ratelimit.js`）、CORS、XSS 转义、`Disallow: /api/`。
- ⚠️ `SECURITY.md` 仅写「定期执行 npm audit / 关注 dependabot」，但仓库无 Dependabot 配置、CI 无漏洞审计步骤；限流阈值、权限矩阵、隐私与许可证合规未成文。

### 目标规范与改进建议

| # | 建议 | 优先级 | 状态 |
|---|---|---|---|
| 3.1 | CI 增加依赖漏洞审计（`npm audit --audit-level=high` 或 OSV Scanner），高危阻断合并；配套 `package-lock.json` 或可复现的 lockfile | P0 | 待落地 |
| 3.2 | 启用 Dependabot（npm + GitHub Actions）与 secret push protection；每季度人工复核权限与密钥轮换 | P1 | 待落地 |
| 3.3 | 新增「权限矩阵」：本地服务 / Vercel Functions / EdgeOne 边缘函数各自的读写范围、限流阈值、失败降级行为 | P1 | 待落地 |
| 3.4 | 明确隐私与合规：GA4 数据用途告知、无 PII 写入日志/Blob、技能正文许可证与上游来源标注、MIT 全仓许可 | P2 | 部分落地 |

---

## 4. 性能与可用性指标

### 现状

- ⚠️ 有分页（`PAGE_SIZE=36`）、图片/字体本地化、GA 异步加载等工程实践；**无任何量化性能或可用性指标**，无基线测量、无预算门禁。

### 目标规范与改进建议（阈值为建议基线，须以首次实测校准）

| # | 指标 / 建议 | 优先级 | 状态 |
|---|---|---|---|
| 4.1 | Core Web Vitals：FCP ≤1.5s、LCP ≤2.5s、CLS ≤0.1（移动端 4G 模拟，Lighthouse CI 或 Playwright 采集） | P1 | 待落地 |
| 4.2 | 资源预算：`src/index.html`（gzip）≤200KB、首屏 JS 解析 ≤300ms、无阻塞第三方脚本 | P2 | 待落地 |
| 4.3 | API：健康请求 p95 ≤300ms、错误率 <1%、限流 429 为预期行为不计入错误率 | P1 | 待落地 |
| 4.4 | 可用性目标：静态站点 99.9%；每季度人工复核生产首页与 `/api/*` 可达性 | P2 | 待落地 |

---

## 5. 日志、监控与告警机制

### 现状

- ✅ 构建/部署可观测：CI `GITHUB_STEP_SUMMARY`、`deploy.log` tee、失败时上传 Playwright 报告、PR 回写预览链接。
- ❌ 运行时无结构化日志规范、无错误聚合、无指标看板、无告警渠道；API 500 被吞成统一响应（排障信息不足）；部署失败无人主动通知。

### 目标规范与改进建议

| # | 建议 | 优先级 | 状态 |
|---|---|---|---|
| 5.1 | 统一结构化日志（单行 JSON：time/level/event/requestId/duration），禁止记录 token、Cookie、用户 PII | P1 | 待落地 |
| 5.2 | 生产错误上报与聚合（如 Sentry 或平台日志服务），保留至少 30 天；API 错误须带可关联 requestId | P1 | 待落地 |
| 5.3 | 告警：构建/部署失败、API 5xx 突增、429 激增、Blob 写入失败、每日健康检查失败 → 发送 Slack/飞书/邮件 | P0 | 待落地 |
| 5.4 | CI 增加失败通知 job（`if: failure()`），并在 summary 输出部署 URL/版本/构建号 | P1 | 待落地 |

---

## 6. 部署与回滚流程

### 现状

- ✅ CI 串行流水线（校验→构建→E2E→部署→发布）、构建一次多处复用、Bun frozen lockfile、CLI 版本固定、Release 幂等。
- ⚠️ 部署平台双轨（CI 部署 EdgeOne；仓库另有 `vercel.json` 与 Vercel Functions/Blob 生产后端），需明确唯一生产平台。
- ❌ 无回滚机制；无部署后健康检查；生产 token 缺失时 deploy 跳过但仍发版（CI 评审 P0）；无环境审批；构建制品仅保留 1 天。

### 目标规范与改进建议

| # | 建议 | 优先级 | 状态 |
|---|---|---|---|
| 6.1 | 生产 token 缺失或部署失败时流水线硬失败；release 依赖部署成功的显式输出，杜绝「未部署却发版」 | P0 | 待落地 |
| 6.2 | 部署后 `curl -fsS` 校验首页与关键资源（`/llms.txt`、`/data/skills-data.json`、`/api/*` OPTIONS），失败即回滚 | P0 | 待落地 |
| 6.3 | 定义回滚 runbook：保留最近 N 次成功 `out/` 制品 ≥7 天，平台侧用别名/快照切换；`workflow_dispatch` 提供 `rollback` 入口 | P1 | 待落地 |
| 6.4 | 使用 GitHub Environments：production 需审批与等待窗口，preview 自动；部署 job 绑定 `environment:` | P1 | 待落地 |
| 6.5 | 统一生产平台（Vercel 或 EdgeOne），另一平台仅作预览/回退并文档化数据边界 | P0 | 待落地 |

---

## 7. 版本管理与变更记录

### 现状

- ✅ `package.json.version` 单一来源；`tools/check-version.mjs` 校验 CHANGELOG 与 7 处展示位（README×2、spec、project、AGENTS、DESIGN、COMPONENTS）。
- ✅ 任何修改 bump 最小版本；仅改被改文件头注释；CHANGELOG 用 Keep a Changelog + SemVer；CI 全绿后自动建 `vX.Y.Z` tag 与 Release（幂等）；任务单源 `docs/tasks.md`，完成归档 `tasks-done.md`。

### 目标规范与改进建议

| # | 建议 | 优先级 | 状态 |
|---|---|---|---|
| 7.1 | CHANGELOG 每条须标注类型（feat/fix/docs/chore...）与影响范围；破坏性变更显式 `BREAKING CHANGE` | P2 | 部分落地 |
| 7.2 | 新增 hotfix 流程：从最新 tag 建 `hotfix/*` 分支、仅 cherry-pick 修复、发 patch 版本并记录 | P2 | 待落地 |
| 7.3 | 版本回退规则：回滚后须 bump 新 patch 版本并在 CHANGELOG 说明，禁止「版本倒退」 | P2 | 待落地 |
| 7.4 | `docs/tasks.md` 的版本头纳入 `check-version.mjs` 校验清单（当前未纳入） | P2 | 待落地 |

---

## 8. 文档完整性要求

### 现状

- ✅ 文档索引与引用关系明确（project §6），spec/project/AGENTS/CONTRIBUTING/SECURITY/tasks/tasks-done/blob-storage 各有职责；版本同步清单与数据型数字实算规则已成文。
- ⚠️ 存在「历史数字当现状」风险：README/文档中的技能数为某时点实算值，数据变更后易脱节；文档更新责任人与复审周期未定义。

### 目标规范与改进建议

| # | 建议 | 优先级 | 状态 |
|---|---|---|---|
| 8.1 | 建立「变更触发矩阵」：改数据/接口/构建/部署/语言包时，必须同步的文档与校验命令逐项列明 | P1 | 待落地 |
| 8.2 | 所有数据型数字改为「以脚本实算为准」的表述或生成式写入；无法生成时标注「截至 vX.Y.Z」 | P1 | 部分落地 |
| 8.3 | 每季度复审一次规范文档，复审日期与结论记入 CHANGELOG；文档与代码冲突时以代码实测为准并当日修正 | P2 | 待落地 |
| 8.4 | 本文件随版本 bump 同步；「待落地」项须由真实提交与门禁验证后才可改为「已落地」 | P1 | 已落地 |

---

## 9. 结构化完善清单（汇总）

| 维度 | 现状不足 | 优先级 | 具体改进建议 |
|---|---|---|---|
| 代码质量与审查 | strict=false、无 lint/format 规则、无强制审批与审查清单 | P1 | 1.1–1.4：启用规则、分阶段 strict、CODEOWNERS、PR 清单 |
| 测试与覆盖率 | 无覆盖率门槛；E2E 仅 2 条冒烟；无分层定义 | P1 | 2.1–2.4：金字塔、覆盖率门禁、关键路径补全 |
| 安全与合规 | 无 CI 漏洞审计、无 Dependabot、权限矩阵/隐私未成文 | P0/P1 | 3.1–3.4：audit 门禁、Dependabot、权限矩阵、合规说明 |
| 性能与可用性 | 无任何量化指标或预算 | P1/P2 | 4.1–4.4：CWV、资源预算、API p95、可用性目标 |
| 日志监控告警 | 无运行时日志/错误聚合/告警/失败通知 | P0/P1 | 5.1–5.4：结构化日志、错误上报、告警、失败通知 |
| 部署与回滚 | 无回滚、无部署后健康检查、token 缺失仍发版、双平台 | P0 | 6.1–6.5：硬失败、健康校验、回滚 runbook、环境审批、统一平台 |
| 版本与变更 | 基本完备；tasks.md 头未纳入校验，hotfix 未定义 | P2 | 7.1–7.4：变更类型、hotfix、回退版本规则、扩展校验 |
| 文档完整性 | 责任人与复审周期缺失，历史数字易脱节 | P1/P2 | 8.1–8.4：触发矩阵、数字实算、季度复审、状态可信 |

---

## 10. 生效与复审

- 本文为**目标规范**：标为「待落地」的条款不构成对当前代码的合规声明；实施后须更新对应条目的状态并 bump 版本。
- P0 项应在下一个生产发版前完成；P1 项按迭代推进；P2 项纳入技术债清单定期复盘。
- 复审周期：每季度一次，复审结论写入 CHANGELOG；与代码实测冲突时以实测为准。
