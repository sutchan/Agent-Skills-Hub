# 任务清单（进行中 / 待处理）— Agent Skills Hub

> 最后更新：**2026-10-22**（v1.15.1）。
> 版本单一来源 `package.json.version`（当前 **1.15.1**）。

---

## 本轮收口结果（2026-10-22 审计 16 项 + 收尾）

2026-10-22 全面体检识别 16 项技术债（#1–#16），全部处置并归档至 `docs/tasks-done.md`。
其中 #10/#15/#16 在首轮仅部分/评估，已于 **v1.15.0** 彻底完成；#10 遗留的 `bun.lock`
问题于 **v1.15.1** 收口，至此 16 项无一残余。

| # | 任务 | 处置 |
|---|------|------|
| 1 | 补齐 E2E | ✅ 新增 `e2e/smoke.spec.ts` 冒烟用例，解除 e2e job 空跑（spec §8.4） |
| 2 | 修正部署目标 | ✅ `ci.yml` 构建/部署统一改用 `out/`，移除误用 `.next`（spec §8.1） |
| 3 | 收录缺失 6 技能 | ✅ 补全 §2 字段并收录进 `data/skills-data.json`，`total=167`（spec §8.2） |
| 4 | 恢复 frontmatter 校验 | ✅ 新增 `tools/validate-skills.mjs`（软门禁）+ `ci.yml` 校验步骤，关闭技术债 8.3 |
| 5 | 明确数据构建流水线 | ✅ `spec.md §8.2` 文档化外部 skills-manager 生成 `data/` 的可复现步骤 |
| 6 | 更新 `docs/spec.md` | ✅ 经核实已为 1.14.98，对被删工具的引用均为「已移除」说明或 §8 登记，非断链 |
| 7 | 更新 project/AGENTS/CONTRIBUTING | ✅ 经核实三者已为 1.14.98，无死链引用 |
| 8 | 清理 `skills/` 垃圾目录 | ✅ 删除 `RecycleBin~1e76.ffs_tmp`（无 SKILL.md） |
| 9 | 修复/废弃 `verify-storage.mjs` | ✅ 投票/收藏测试改用真实存在的技能名，避免白名单 400 拒绝 |
| 10 | 可复现构建 | ✅ 第三方 action 全部钉定 commit SHA（含 `setup-env` 内 `setup-bun`）、`BUN_VERSION` 固定 `1.4.3`、`edgeone` CLI 固定 `1.6.45`；**并已提交 `bun.lock`（bun 1.4.3，96 包）+ 启用 `bun install --frozen-lockfile`**，依赖终态完全固化，无残余 |
| 11 | 收敛 `server.js` 静态暴露 | ✅ `/data` 仅放行公开数据 `skills-data.json`/`skills-metrics.json`，不再直出 `kv-store.json` |
| 12 | 统一 `/api/favorites` 响应形状 | ✅ 核实客户端已分别处理 `GET`/`POST`，设计自洽，无需改动 |
| 13 | 死代码/双应用冗余 | ✅ 核实 `src/parts/03-detail.js` 为 `src/index.html` 内联详情弹窗的源，非死代码；双应用为既定设计 |
| 14 | 统一版本展示位（版本漂移） | ✅ 修正 `prototype/wireframes.html` 页脚版本漂移（1.14.85 → 1.15.1）；`spec.md`/`CONTRIBUTING.md` 经核实早已为 1.14.98 |
| 15 | 交互增强（详情深链弹窗） | ✅ 实现 `#skill=<name>` 详情深链：加载与前进/后退时自动弹出对应技能详情 |
| 16 | 限流持久化 | ✅ 实现限流计数持久化：启动从 `data/ratelimit.json` 恢复、运行时周期落盘、退出前强制落盘，解决重启/多实例失效 |

---

## 收尾（版本发布）

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 17 | 提交本轮改动（`main`） | P1 | ✅ 已完成 | 显式 `git add` 列文件；commit `chore: 提交 bun.lock 并启用 frozen-lockfile（v1.15.1）` |
| 18 | 创建 `v1.15.1` 本地 tag | P1 | ✅ 已完成 | 建于提交后 HEAD `main` |

---

## 审查方法（供复现）

- 通读 `docs/spec.md`、`docs/project.md`、`docs/AGENTS.md`、`.github/CONTRIBUTING.md`、`docs/tasks-done.md`；
- 核对 `package.json` scripts、`.github/workflows/ci.yml`、`.github/actions/setup-env/action.yml`、`next.config.mjs`、`playwright.config.ts`、`server.js`；
- 用 node 统计 `skills/` 目录数与 `data/skills-data.json` 条目/隐藏数、目录-数据差集；
- 全仓检索残留引用与版本号，定位文档漂移与死代码（`prototype/wireframes.html` 页脚曾停 `v1.14.85`，已统一至 `v1.15.1`）。

> 最后同步：2026-10-22 — v1.15.1；审计 16 项 + #10/#15/#16 收尾全部完成并归档，**无任何残余项**；工作树已提交（`main`）并创建本地 `v1.15.1` tag。
