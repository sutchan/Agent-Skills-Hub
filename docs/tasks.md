# 任务清单（进行中 / 待处理）— Agent Skills Hub

> 最后更新：**2026-10-22**（v1.14.98）。本轮为一次全面体检，识别出下列**待完善项**；此前迭代（一至八）均已完成并归档至 `docs/tasks-done.md`。
> 版本单一来源 `package.json.version`（当前 **1.14.98**）。

---

## 一、待完善任务（2026-10-22 审查产出）

### P0 · 阻断 CI / 影响正确性 / 契约失守

| # | 任务 | 优先级 | 状态 | 证据 / 说明 |
|---|------|--------|------|-------------|
| 1 | 补齐 E2E 测试目录或关闭 e2e 环节 | P0 | ⬜ 待处理 | `playwright.config.ts` 声明 `testDir: "./e2e"`，但仓库**无 `e2e/` 目录**（读取 ENOENT）；`bun run e2e`（`playwright test`）会报 No tests found，CI `e2e` job 必失败并阻断 deploy/release。二选一：新增冒烟用例（推荐，覆盖首页渲染/搜索/筛选/收藏）或暂时移除该 job。 |
| 2 | 修正部署目标与静态导出不一致 | P0 | ⬜ 待处理 | `next.config.mjs` 为 `output:"export"`，真实站点产物在 **`out/`**；而 `ci.yml` 部署的是 **`./.next`**。请确认 EdgeOne CLI 期望目录，若为静态站根需改为 `./out`（先在 preview 验证）。 |
| 3 | 重建数据并收录缺失的 6 个技能 | P0 | ⬜ 待处理 | node 核对：`skills/` 有 169 个目录，`data/skills-data.json` 仅 162 条（hidden=1）；`canvas-design`、`pdf`、`playwright-cli`、`pptx`、`rust-skills`、`skill-creator` **均有 SKILL.md 却未进入数据**（站点漏展示）。需重跑构建或按收录策略处理。 |
| 4 | 恢复 SKILL.md frontmatter 契约校验（硬门禁） | P0 | ⬜ 待处理 | 原 `tools/validate-skills.mjs` 已随 `tools/` 精简删除；`tools/` 现仅 `ensure-lf.mjs` + `lib/*.test.mjs`；`ci.yml` 无 validate-skills 步骤。`docs/spec.md §2` 的六字段/顺序契约**已无任何门禁**，回归将静默通过。 |

### P1 · 文档与构建一致性

| # | 任务 | 优先级 | 状态 | 证据 / 说明 |
|---|------|--------|------|-------------|
| 5 | 恢复/明确数据构建流水线 | P1 | ⬜ 待处理 | `package.json` 的 `build` 现仅 `next build && cp src/index.html out/index.html`；`tools/build-skills-data.mjs`、`build.mjs`、`lib/taxonomy.mjs`、`sync-css.mjs`、`sync-tokens.mjs` **均不存在**。→ data/ 与原型无法在仓库内重建，只能依赖外部 skills-manager。需重建脚本或在文档中明确"外部生成"并给出可复现步骤。 |
| 6 | 更新 `docs/spec.md`（自称唯一权威源） | P1 | ⬜ 待处理 | 版本仍 **1.14.88**；引用 `tools/lib/taxonomy.mjs`、`validate-skills.mjs`、`build-skills-data.mjs`、`build.mjs`、`sync-*.mjs`、`prototype/prototype.html`、`prototype/src/styles/tokens.css`、`src/lib/skills.ts`、`SkillsExplorer.tsx`、`02-render.js` 等**均已不存在**。 |
| 7 | 更新 `docs/project.md`、`docs/AGENTS.md`、`.github/CONTRIBUTING.md` | P1 | ⬜ 待处理 | 同样引用已删除的 `validate-skills.mjs`/`build-skills-data.mjs`/`build.mjs`/`prototype.html`/`src/lib`/`src/components`；`CONTRIBUTING.md` 头版本 1.14.84，且引用不存在的 `vercel.json`、`npm run serve`。 |
| 8 | 清理 `skills/` 垃圾目录 | P1 | ⬜ 待处理 | `skills/RecycleBin~1e76.ffs_tmp`（FreeFileSync 临时目录，无 SKILL.md）混入，需删除以免污染全量解析/统计。 |
| 9 | 修复或废弃 `scripts/verify-storage.mjs` | P1 | ⬜ 待处理 | 脚本使用 `test-verification-skill`/`react-best-practices`/`tailwind-patterns` 等**不在白名单**的技能名，会被 `server.js` 的 `validSkillNames` 白名单 **400 拒绝**（测试 2/4 必失败）；且未接入任何 npm script 或 CI。 |
| 10 | 可复现构建：提交 `bun.lock`、固定版本、action 钉 SHA | P1 | ⬜ 待处理 | 根目录**无任何锁文件**（无 bun.lock/package-lock.json/pnpm-lock.yaml）；`ci.yml` 用 `BUN_VERSION: latest`；第三方 action 未按 commit SHA 固定（供应链加固）。 |

### P2 · 安全 / 健壮性 / 卫生 / 增强

| # | 任务 | 优先级 | 状态 | 证据 / 说明 |
|---|------|--------|------|-------------|
| 11 | `server.js` 收敛静态暴露范围 | P2 | ⬜ 待处理 | `app.use('/data', express.static(...))` 会把 `data/kv-store.json`、`data/skills-votes.json` 公开为可下载 URL，泄露投票/收藏数据；应改为白名单或禁止 `/data` 目录直出。 |
| 12 | 统一 `/api/favorites` 响应形状 | P2 | ⬜ 待处理 | `GET /api/favorites` 返回对象 `{name:true}`（server.js L118），而 `POST` 返回 `favorites: string[]`（L145）；客户端需兼容两套结构，易出错。建议统一为一种。 |
| 13 | 清理死代码与架构冗余评估 | P2 | ⬜ 待处理 | `src/parts/03-detail.js` 无任何引用（全仓检索 0 命中）；`src/app/page.tsx` 仅为客户端跳转到 `/index.html` 的壳，与静态 `src/index.html` 双应用并存——评估合并或明确职责。 |
| 14 | 统一版本展示位（版本漂移） | P2 | ⬜ 待处理 | `prototype/wireframes.html` 页脚 `footerVer` 仍 `v1.14.85`、`docs/spec.md` 1.14.88、`CONTRIBUTING.md` 1.14.84，与 `package.json` 1.14.98 不一致（`src/index.html` 已 1.14.98）。 |
| 15 | 交互增强（可选） | P2 | ⬜ 待处理 | ①筛选/搜索/排序后自动回顶（当前仅手动"回到顶部"）；②`/skills/[slug]/` 详情深链自动弹窗（当前仅 hash 承载筛选/搜索/排序/页码，详情需点击卡片）。二者此前记为"刻意设计/未实现"，若产品需要再排期。 |
| 16 | 限流持久化评估 | P2 | ⬜ 待处理 | `server.js` 限流为进程内存 `Map`，重启/多实例即失效；Edge 部署下不生效。评估改用平台能力或持久化计数。 |

---

## 二、本次审查方法

- 通读 `docs/spec.md`、`docs/project.md`、`docs/AGENTS.md`、`.github/CONTRIBUTING.md`、`docs/tasks-done.md`；
- 核对 `package.json` scripts、`.github/workflows/ci.yml`、`next.config.mjs`、`playwright.config.ts`、`server.js`；
- 用 node 统计 `skills/` 目录数与 `data/skills-data.json` 条目/隐藏数、目录-数据差集；
- 全仓检索残留引用（`validate-skills`/`build-skills-data`/`build.mjs`/`prototype.html`/`03-detail` 等）与版本号，定位文档漂移与死代码。

---

## 三、历史归档

迭代一至七、后续迭代（#11–#17）、本轮收口（#4/#5/#6/#7/#14）、原型规约同步 5 项（迭代八）均已完成，详见 `docs/tasks-done.md`。

> 最后同步：2026-10-22 — 新增待完善任务清单（P0 4 项 / P1 6 项 / P2 6 项），均**未开始**。
