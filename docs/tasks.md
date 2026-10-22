# 任务清单（进行中 / 待处理）— Agent Skills Hub

> 最后更新：**2026-10-22**（v1.14.99）。2026-10-22 全面体检识别的 16 项待完善任务（#1–#16）已全部处置并归档至 `docs/tasks-done.md`。
> 版本单一来源 `package.json.version`（当前 **1.14.99**）。

---

## 本轮收口结果（2026-10-22 审计 16 项）

全部 16 项均已处置，其中代码修复 8 项、文档化/评估 6 项、审计不实指控纠正若干（#6/#7 经核实 spec/CONTRIBUTING 已为 1.14.98 无需大改；#13 经核实 03-detail.js 为内联源非死代码；#14 仅 wireframes.html 真实漂移）。详见 `docs/tasks-done.md`。

| # | 任务 | 处置 |
|---|------|------|
| 1 | 补齐 E2E | ✅ 新增 `e2e/smoke.spec.ts` 冒烟用例，解除 e2e job 空跑（spec §8.4） |
| 2 | 修正部署目标 | ✅ `ci.yml` 构建/部署统一改用 `out/`，移除误用 `.next`（spec §8.1） |
| 3 | 收录缺失 6 技能 | ✅ 补全 §2 字段并收录进 `data/skills-data.json`，`total=167`（spec §8.2） |
| 4 | 恢复 frontmatter 校验 | ✅ 新增 `tools/validate-skills.mjs`（软门禁）+ `ci.yml` 校验步骤，关闭技术债 8.3 |
| 5 | 明确数据构建流水线 | ✅ `spec.md §8.2` 文档化外部 skills-manager 生成 `data/` 的可复现步骤 |
| 6 | 更新 `docs/spec.md` | ✅ 经核实已为 1.14.98，对被删工具的引用均为「已移除」说明或 §8 登记，非断链，无需大改 |
| 7 | 更新 project/AGENTS/CONTRIBUTING | ✅ 经核实三者已为 1.14.98，无死链引用 |
| 8 | 清理 `skills/` 垃圾目录 | ✅ 删除 `RecycleBin~1e76.ffs_tmp`（无 SKILL.md） |
| 9 | 修复/废弃 `verify-storage.mjs` | ✅ 投票/收藏测试改用真实存在的技能名，避免白名单 400 拒绝 |
| 10 | 可复现构建 | ⚠️ 部分：本地无 `bun` 无法生成 `bun.lock`；第三方 action 已钉 major 版本标签，完整 commit-SHA 钉定需 `git ls-remote`（需网络），本轮仅记录步骤 |
| 11 | 收敛 `server.js` 静态暴露 | ✅ `/data` 仅放行公开数据 `skills-data.json`/`skills-metrics.json`，不再直出含投票/收藏的 `kv-store.json` |
| 12 | 统一 `/api/favorites` 响应形状 | ✅ 核实客户端已分别处理 `GET`（对象，遍历 `Object.keys`）与 `POST`（数组 `data.favorites`），设计自洽，无需改动 |
| 13 | 死代码/双应用冗余 | ✅ 核实 `src/parts/03-detail.js` 为 `src/index.html` 内联详情弹窗的源（spec §8.9），非死代码，未删除；双应用（`src/app` 壳 + `src/index.html`）为既定设计 |
| 14 | 统一版本展示位（版本漂移） | ✅ 修正 `prototype/wireframes.html` 页脚 `v1.14.85 → v1.14.99`；`spec.md`/`CONTRIBUTING.md` 经核实早已为 1.14.98 |
| 15 | 交互增强（可选） | ⏸ 标记为可选（回顶/深链弹窗），此前记为刻意设计，未擅改 |
| 16 | 限流持久化评估 | ⏸ 评估项（进程内存 `Map` 重启/多实例失效），未擅改 |

---

## 审查方法（供复现）

- 通读 `docs/spec.md`、`docs/project.md`、`docs/AGENTS.md`、`.github/CONTRIBUTING.md`、`docs/tasks-done.md`；
- 核对 `package.json` scripts、`.github/workflows/ci.yml`、`next.config.mjs`、`playwright.config.ts`、`server.js`；
- 用 node 统计 `skills/` 目录数与 `data/skills-data.json` 条目/隐藏数、目录-数据差集；
- 全仓检索残留引用（`validate-skills`/`build-skills-data`/`build.mjs`/`prototype.html`/`03-detail` 等）与版本号，定位文档漂移与死代码。

> 最后同步：2026-10-22 15:15 — v1.14.99；审计 16 项已处置并归档；本轮将工作树改动提交（`main`）并创建本地 `v1.14.99` tag，未完成项 #15/#16 按既定决策关闭。

---

## 本轮继续收口（2026-10-22 15:15）：提交审计 + 创建 v1.14.99 tag

上轮（2026-10-22）审计 16 项已在工作树完成但**未提交**、且**无 v1.14.99 tag**。本轮继续收口：

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 17 | 提交迭代九审计改动（`main` 分支，21 文件 + 2 未跟踪 + 1 删除） | P1 | ✅ 已完成 | 显式 `git add` 列文件（未用 `-u`/`add .`）；commit `chore: 收口 2026-10-22 全面体检审计（v1.14.99）` |
| 18 | 创建 `v1.14.99` 本地 tag | P1 | ✅ 已完成 | 建于提交后 HEAD；历史缺口 v1.14.89~v1.14.97 未补建（需考古各版本对应 commit，待确认） |
| 15 | 交互增强（可选） | P3 | ✅ 关闭（既定决策） | 回顶/深链弹窗此前记为刻意设计，本轮不擅改，正式关闭 |
| 16 | 限流持久化评估 | P3 | ✅ 关闭（评估结论） | 进程内存 `Map` 重启/多实例失效，当前架构下不改；记录为已知限制 |
