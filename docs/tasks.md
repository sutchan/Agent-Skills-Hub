# 任务清单（未完成任务） — Agent Skills Hub

> 最后更新：**2026-11-23**（v1.21.1）。
> 本文件仅保存**未完成**任务；已完成任务全部归档于 `docs/tasks-done.md`（迭代一至三十六）。
> 版本单一来源 `package.json.version`（当前 **v1.21.1**）。
> 界面语言优先级：简体中文 > 繁体中文 > 英语（见 `docs/spec.md` §5 / `src/index.html` 内联 i18n）。

---

## 未完成任务

| # | 任务 | 优先级 | 状态 | 备注 |
|---|---|---|---|---|
| 1 | 补录「桌面与客户端」领域技能 | P3 | ⬜ 待开始 | `data/skills-data.json` 实算仅 13 个活跃分类，14 大领域中「桌面与客户端」当前无技能收录；补录需真实技能素材（SKILL.md + frontmatter 六字段），并同步 data / 内联数据 / SEO 资产 |
| 2 | 边缘函数重新部署到 EdgeOne 控制台 | P3 | ⬜ 待开始 | `edge-worker.js` 已内联 169 个技能名白名单并改为 fail-closed（v1.21.0）；生产主路径已是 Vercel Functions + Blob，边缘方案仅作回退参考，重新部署需在控制台粘贴最新文件 |
| 3 | 线上 API 可达性与写接口联调复核 | P3 | ⬜ 待开始 | 需在可访问外网的环境验证 `/api/votes`、`/api/favorites` 的 200/400/429/503 四类响应与 Blob 写入；本机对生产域名不可直连，无法在本地闭环 |
| 4 | 技能数据级繁体化 | P3 | ⬜ 待开始 | 技能数据仅有简中 `description` 与英文 `enDescription`；繁体界面当前回退「简体名 + 英文副标题」，若需数据级繁体需在 `data/skills-data.json` 增加 `tw*` 字段并同步内联数据与 UI |

---

## 口径说明

- `data/skills-data.json` 为展示数据**唯一权威源**；`data/skills-metrics.json` 的 `size` / `files` / `popularity` 由 `npm run sync:metrics` **按磁盘实算**生成，CI 以 `npm run check:metrics` 校验一致性。
- `public/data/skills-data.json` 为静态发布副本，由 `npm run sync:data` 从权威源单向复制，**勿手工维护**。