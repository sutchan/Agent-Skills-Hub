# 任务清单（未完成任务） — Agent Skills Hub

> 最后更新：**2026-10-23**（v1.15.6）。
> 本文件仅保存**未完成**任务；已完成任务全部归档于 `docs/tasks-done.md`。
> 版本单一来源 `package.json.version`（当前 **v1.15.6**）。

---

## 未完成任务

### 代码与页面 UI 专项审查（2026-10-23）

> 说明：v1.15.6 前已完成大量迭代（含 a11y 焦点陷阱、reduced-motion、空状态、原子写入、`/data` 暴露收敛、限流持久化等，详见 `docs/tasks-done.md` 迭代 1–18）。本轮聚焦**当前代码与页面 UI 仍存的问题**，逐项附证据。

| # | 任务 | 优先级 | 状态 | 证据 / 说明 |
|---|------|--------|------|-------------|
| 1 | 应用内联数据与权威数据脱节（drift） | P1 | ⬜ 待处理 | `src/index.html` 内联 `window.SKILLS_DATA.total=161`（L1365），但 `data/skills-data.json` 已 `total=167`（skills=168, hidden=1）；全仓检索 `SKILLS_DATA` 仅出现在内联处、0 处脚本生成。后果：UI 少展示 6 个技能；后端白名单（来自 data 文件）/ 公开 `/data/skills-data.json`(167) 与 UI(161) 三处不一致。建议运行时 `fetch('/data/skills-data.json')` 或构建期注入，删除手工内联副本。 |
| 2 | `server.js` 限流未设 trust proxy（生产误伤风险） | P1 | ⬜ 待处理 | `server.js` 用 `req.ip` 限流（L126），但无 `app.set('trust proxy', …)`；经 EdgeOne/反代后 `req.ip` 为边缘节点 IP，全站用户共用一个 120/min 桶，极易触发全员 429 导致站点不可用。需启用 trust proxy 并从 `x-forwarded-for` 取真实客户端 IP。 |
| 3 | `server.js` 静态挂载 `src/` 暴露多余文件 | P2 | ⬜ 待处理 | `server.js` L16 `app.use(express.static(src))` 暴露死代码 `src/parts/03-detail.js` 与 Next 壳 `src/app/*`；建议收窄为仅 `public/` + 显式 `index.html` 路由。 |
| 4 | 「离线可用」声称无 PWA 支撑 | P3 | ⬜ 待处理 | `src/index.html` L1125 声称离线可用，但全仓无 service worker / manifest / PWA。仅依赖 HTTP 缓存；建议加 SW 或弱化文案。 |
| 5 | `<html lang>` 切换语言不更新 | P3 | ⬜ 待处理 | L3 固定 `lang="zh"`，切到英文时读屏仍以中文朗读界面；应在语言 toggle 同步 `document.documentElement.lang`。 |
| 6 | 卡片可聚焦但缺 `role`/`aria-label` | P3 | ⬜ 待处理 | L2109 卡片 `tabindex="0"` 可聚焦、Enter/Space 可触发，但无 `role="button"`/`aria-label`，读屏语义不明确。 |
| 7 | API 失败静默无反馈 | P3 | ⬜ 待处理 | votes/favorites `fetch(...).then(...).catch(()=>{})`（L1771/L3443/L3455 等）吞掉 429/500/离线错误，无 toast；建议失败提示。 |
| 8 | `server.js` 无 404/全局错误处理 | P3 | ⬜ 待处理 | 未知 `/api/*` 返回 express 默认 HTML 404，JSON 客户端拿到 HTML；建议加 JSON 404 / 全局错误中间件。 |
| 9 | 死代码 `src/parts/03-detail.js` | P3 | ⬜ 待处理 | 全仓检索 `03-detail` / `src/parts` 0 引用，应删除。 |
| 10 | Next 跳转壳冗余 `src/app/page.tsx` | P3 | ⬜ 待处理 | 仅客户端重定向 `/index.html`；`output:"export"` 产物即静态站，该壳可随静态部署去除或注明职责。 |
| 11 | 性能：单文件 322KB + 内联阻塞脚本 | P3 | ⬜ 待处理 | 无 `defer`/`async`、hero 动画；此前评估维持内联（迭代十五 #7），列为可选优化。 |
| 12 | 页脚「最后更新」硬编码日期 hack | P3 | ⬜ 待处理 | L3430 `fd.innerHTML.replace("2026-10-09", …)` 脆弱，日期格式变更即静默失效；建议数据驱动。 |
| 13 | `og:url` 指向 GitHub 仓库 | P3 | ⬜ 待处理 | L16 `og:url=https://github.com/sutchan/...` 与站点域名不符，SEO 正确性。 |

---

> **#22b「推送 `main` 分支与剩余 tag 至远端」已于本轮完成**：本地 `main`（`61d714f0`）已推送，`git log origin/main..main` 为空（完全同步）；远端 `v*` tag 增至 **31** 个（新增 `v1.15.3`/`v1.15.4`/`v1.15.5`），远端 `sm-v*` 备份标签仍为 **0**。归档见 `docs/tasks-done.md` 迭代十八。

> 最后同步：2026-10-23 — 新增「代码与页面 UI 专项审查」**13 项（P1×2 / P2×1 / P3×10）**；此前迭代 1–18 已完成并归档于 `docs/tasks-done.md`。
