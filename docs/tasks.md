# 任务清单（进行中 / 待处理）— Agent Skills Hub

> 最后更新：**2026-10-22 20:45**（v1.15.0）。
> 版本单一来源 `package.json.version`（当前 **1.15.0**）。

---

## 本轮收口结果（2026-10-22 审计 16 项 + 收尾）

2026-10-22 全面体检识别 16 项技术债（#1–#16），全部处置并归档至 `docs/tasks-done.md`。
其中 #10/#15/#16 在首轮仅部分/评估，本轮（v1.15.0）彻底完成。

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
| 10 | 可复现构建 | ✅ 全部第三方 action 钉定 commit SHA（含 `setup-env` 内 `setup-bun`）、`BUN_VERSION` 固定 `1.4.3`、`edgeone` CLI 固定 `1.6.45`；`bun.lock` 因本地无 bun 仍待用户/CI `bun install` 补齐 |
| 11 | 收敛 `server.js` 静态暴露 | ✅ `/data` 仅放行公开数据 `skills-data.json`/`skills-metrics.json`，不再直出 `kv-store.json` |
| 12 | 统一 `/api/favorites` 响应形状 | ✅ 核实客户端已分别处理 `GET`/`POST`，设计自洽，无需改动 |
| 13 | 死代码/双应用冗余 | ✅ 核实 `src/parts/03-detail.js` 为 `src/index.html` 内联详情弹窗的源，非死代码；双应用为既定设计 |
| 14 | 统一版本展示位（版本漂移） | ✅ 修正 `prototype/wireframes.html` 页脚版本漂移（1.14.85 → 1.15.0）；`spec.md`/`CONTRIBUTING.md` 经核实早已为 1.14.98 |
| 15 | 交互增强（详情深链弹窗） | ✅ 实现 `#skill=<name>` 详情深链：加载与前进/后退时自动弹出对应技能详情 |
| 16 | 限流持久化 | ✅ 实现限流计数持久化：启动从 `data/ratelimit.json` 恢复、运行时周期落盘、退出前强制落盘，解决重启/多实例失效 |

---

## 收尾（版本发布）

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 17 | 提交本轮全部改动（`main`） | P1 | ✅ 已完成 | 显式 `git add` 列文件；commit `chore: 收口 2026-10-22 审计与收尾（v1.15.0）` |
| 18 | 创建 `v1.15.0` 本地 tag | P1 | ✅ 已完成 | 建于提交后 HEAD `main` |

---

## 审查方法（供复现）

- 通读 `docs/spec.md`、`docs/project.md`、`docs/AGENTS.md`、`.github/CONTRIBUTING.md`、`docs/tasks-done.md`；
- 核对 `package.json` scripts、`.github/workflows/ci.yml`、`next.config.mjs`、`playwright.config.ts`、`server.js`；
- 用 node 统计 `skills/` 目录数与 `data/skills-data.json` 条目/隐藏数、目录-数据差集；
- 全仓检索残留引用与版本号，定位文档漂移与死代码（`prototype/wireframes.html` 页脚曾停 `v1.14.85`，已统一至 `v1.15.0`）。

## 本轮继续收口（2026-10-22 20:45）：实证复核 + 历史 tag 回填

v1.15.0（commit `d9a29c23` + tag `v1.15.0`）声称 16 项审计 + #10/#15/#16 收尾全部完成。本轮**实证复核**（不轻信文档声明）确认属实，并完成遗留的 tag 缺口回填：

| # | 任务 | 优先级 | 状态 | 备注 |
|---|------|--------|------|------|
| 19 | 实证复核 v1.15.0 各项声称 | P1 | ✅ 已完成 | #15 详情深链（`src/index.html` L3334-3400 `#skill=<name>` hashchange/replaceState）、#16 限流持久化（`server.js` `data/ratelimit.json` 加载/周期落盘/退出强制落盘）、#10 CI 第三方 action 全钉 commit SHA——均核实为真实实现 |
| 20 | 回填历史发布 tag 缺口 | P2 | ✅ 已完成（本地） | 考古 `package.json` 版本历史，本地创建 21 个注解 tag（v1.14.74~87、v1.14.91~97）；v1.14.89/v1.14.90 从未进入 package.json 历史（发布时跳过），无法回溯。`v1.14.73→v1.14.99` 序列现已连续 |
| 21 | 生成 `bun.lock` | P2 | ⛔ 阻塞（环境） | 本地无 bun 且网络不可达（npmjs/bun.sh 均超时），无法 `bun install` 解析生成；待用户/CI 在有网环境执行 `bun install` 补齐。`.gitignore` 未忽略 lockfile，可入库 |
| 22 | 推送本地提交与 tag | P1 | ⏸ 待确认 | 本地领先远端：commit `b0042635`（v1.14.99）、`d9a29c23`（v1.15.0）+ tag `v1.14.74~v1.15.0` 共 23 个未推送；push 属外部动作，需用户确认后执行 `git push && git push --tags` |

> 最后同步：2026-10-22 20:45 — v1.15.0；实证复核确认 v1.15.0 全部声称属实；历史 tag 缺口已本地回填（21/23，2 个无对应提交）；`bun.lock` 环境阻塞；推送待用户确认。
