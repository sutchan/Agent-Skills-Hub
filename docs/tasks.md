# 任务清单（未完成任务） — Agent Skills Hub

> 最后更新：**2026-10-29**（v1.16.3）。
> 本文件仅保存**未完成**任务；已完成任务全部归档于 `docs/tasks-done.md`。
> 版本单一来源 `package.json.version`（当前 **v1.16.3**）。

---

## 未完成任务

（无）

---

> **代码与页面 UI 专项审查（13 项）已在 v1.16.0 全部修复并归档**：详见 `docs/tasks-done.md` 迭代十九。
> 修复要点：内联数据漂移（161→167，新增 `npm run sync:data`）、server `trust proxy`、静态目录收窄、JSON 404 / SPA 回退、卡片 a11y、同步失败 toast、页脚日期、离线文案弱化、删除死代码 `03-detail.js`；server.js 已按"源码 ≤200 行"规则拆分为 `server/` 模块（v1.16.2，迭代二十）。
> 维持项（经评估无需改）：#10 Next 重定向壳（`next build` 构建依赖）、#11 单文件内联豁免拆分（spec §7.10）、#13 `og:url` 指向仓库主页（符合项目地址约定）、#5 `<html lang>` 切换（代码已具备）。
> **GA4 衡量 ID 环境变量化（用户此前请求）已于 v1.15.7 完成**（源码占位符 `__GA_MEASUREMENT_ID__` + 构建期 `scripts/inject-ga.mjs` 注入 + `server/config.js` GA_TOKEN/GA_ID 与 CI `vars.GA_MEASUREMENT_ID`），此前未登记，本轮补录至 `docs/tasks-done.md` 迭代二十一；经 v1.16.x 重构验证机制完好。
