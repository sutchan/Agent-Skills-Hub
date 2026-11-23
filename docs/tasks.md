# 任务清单（未完成任务） — Agent Skills Hub

> 最后更新：**2026-11-23 22:51（UTC+8）**（v1.21.2）。
> 本文件仅保存**未完成**任务；已完成任务全部归档于 `docs/tasks-done.md`（迭代一至三十七）。
> 版本单一来源 `package.json.version`（当前 **v1.21.2**）。
> 界面语言优先级：简体中文 > 繁体中文 > 英语（见 `docs/spec.md` §5 / `src/index.html` 内联 i18n）。

---

## 未完成任务

| # | 任务 | 优先级 | 状态 | 备注 |
|---|---|---|---|---|
| 1 | 补录「桌面与客户端」领域技能 | P3 | ⛔ 阻塞（缺真实素材） | 2026-11-23 复核：`skills/` 169 个目录与 `data/skills-data.json` 实算 13 分类，均无桌面/客户端相关 SKILL.md；按数据真实性红线**不编造**。需用户提供 ≥1 份真实技能素材（SKILL.md + frontmatter 六字段）后补录，并同步 data / 内联数据 / SEO 资产 |
| 2 | 边缘函数重新部署到 EdgeOne 控制台 | P4 | ⛔ 阻塞（需平台操作） | 2026-11-23 复核：生产主路径已是 Vercel Functions + Blob，边缘方案仅作回退参考；重新部署需登录 EdgeOne 控制台粘贴最新 `edge-worker.js`（需账号/token），本地无法完成。**优先级 P3→P4** |
| 3 | 线上 API 可达性与写接口联调复核 | P2 | ⛔ 阻塞（需外网环境） | 2026-11-23 复核：本机 `curl https://skills.ewuse.com/api/votes` 因证书吊销检查离线失败（`CRYPT_E_REVOCATION_OFFLINE`），无法验证 200/400/429/503 与 Blob 写入。**优先级 P3→P2**（生产写接口正确性），需在有网环境执行 |
| 4 | 技能数据级繁体化 | P3 | ⛔ 阻塞（缺转换工具/素材） | 2026-11-23 复核：UI 已有 `tw \|\| zh` 回退（`renderCats`、环形图中心标签），但数据层缺 `tw*` 字段；本机无 Python/opencc、node_modules 无 opencc-js，按数据真实性红线**不手写映射表转换真实描述**。需确认安装 `opencc-js` 或提供人工繁体译文后推进 |

---

## 状态说明

- ⬜ 待开始：可立即推进，无外部依赖。
- ⛔ 阻塞：已复核，缺外部条件（真实素材 / 平台访问 / 外网环境 / 转换工具）；**不得为「完成」而编造数据或结果**。
- ✅ 已完成：移入 `docs/tasks-done.md` 对应迭代归档。

## 口径说明

- `data/skills-data.json` 为展示数据**唯一权威源**；`data/skills-metrics.json` 的 `size` / `files` / `popularity` 由 `npm run sync:metrics` **按磁盘实算**生成，CI 以 `npm run check:metrics` 校验一致性。
- `public/data/skills-data.json` 为静态发布副本，由 `npm run sync:data` 从权威源单向复制，**勿手工维护**。
