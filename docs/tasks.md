# 任务清单（未完成任务） — Agent Skills Hub

> 最后更新：**2026-11-24 11:34:27（UTC+8）**（v1.21.5）。
> 本文件仅保存**未完成**任务；已完成任务全部归档于 `docs/tasks-done.md`（迭代一至三十九）。
> 版本单一来源 `package.json.version`（当前 **v1.21.5**）。
> 界面语言优先级：简体中文 > 繁体中文 > 英语（见 `docs/spec.md` §5 / `src/index.html` 内联 i18n）。

---

## 未完成任务

| # | 任务 | 优先级 | 状态 | 备注 |
|---|---|---|---|---|
| 1 | 补录「桌面与客户端」领域技能 | P3 | ⛔ 阻塞（缺真实素材） | 2026-11-24 复核：`skills/` 169 个目录与 `data/skills-data.json` 实算 13 分类，均无桌面/客户端相关 SKILL.md；按数据真实性红线**不编造**。需用户提供 ≥1 份真实技能素材（SKILL.md + frontmatter 六字段）后补录，并同步 data / 内联数据 / SEO 资产 |
| 2 | 边缘函数重新部署到 EdgeOne 控制台 | P0 | ⛔ 阻塞（需平台操作） | 2026-11-24 复核：生产域名 `skills.ewuse.com` 由 EdgeOne Makers 提供服务，但 `/api/*` 全部 404；重新部署 `edge-worker.js` 并确认 `*/api/*` 路由生效，是修复线上 API 不可达的直接手段。**优先级 P4→P0**（由回退参考升级为线上故障修复前置）。需 EdgeOne 控制台账号/token，本地无法完成；若最终切 Vercel Functions + Blob，则本任务转为「关闭」 |
| 4 | 技能数据级繁体化 | P3 | ⛔ 阻塞（需授权安装工具） | 2026-11-24 复核：Bun 已验证可用（CI YAML 解析实测），可执行 `bun add -d opencc-js` 后自动转换；但安装新依赖 + 改写 168 条真实数据 + 同步 UI/SEO 属重大改动，需用户**明确授权**后推进。UI 已有 `tw \|\| zh` 回退，数据层缺 `tw*` 字段 |
| 5 | 修复生产 `/api/*` 404（投票/收藏 API 不可达） | P0 | ⬜ 待开始（平台侧） | 2026-11-24 复核发现：`https://skills.ewuse.com/` 200、`/llms.txt` 200、`/data/skills-data.json` 200（`Server: edgeone makers`），但 `/api/votes`、`/api/favorites` 的 GET/OPTIONS 均 **404** → 边缘函数未部署或路由未生效。需：① EdgeOne 控制台部署 `edge-worker.js` 并绑定 `ASH_KV`；**或** ② 切 Vercel Functions + Blob 并把域名指向 Vercel；③ 部署后复测 200/400/429/503。与任务 2 强关联 |

---

## 状态说明

- ⬜ 待开始：可立即推进，无外部依赖。
- ⛔ 阻塞：已复核，缺外部条件（真实素材 / 平台访问 / 转换工具授权）；**不得为「完成」而编造数据或结果**。
- ✅ 已完成：移入 `docs/tasks-done.md` 对应迭代归档。

## 口径说明

- `data/skills-data.json` 为展示数据**唯一权威源**；`data/skills-metrics.json` 的 `size` / `files` / `popularity` 由 `npm run sync:metrics` **按磁盘实算**生成，CI 以 `npm run check:metrics` 校验一致性。
- `public/data/skills-data.json` 为静态发布副本，由 `npm run sync:data` 从权威源单向复制，**勿手工维护**。
- 线上可达性复核命令：`curl --ssl-no-revoke`（Windows Schannel 证书吊销检查离线时，可绕过假性不可达；仅用于只读探测，不写生产数据）。
