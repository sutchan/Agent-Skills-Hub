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
