# Agent-Skills-Hub 改进项实施交付总结

> 主理人：齐活林（Qi）｜实施：工程师 寇豆码（Kou）｜独立验证：QA 严过关（Yan）
> 依据：`deliverables/agentskillhub-review-2026-08-25.md`（审查报告）

## 一、TL;DR
审查报告中的 P0–P3 全部改进项已落地并通过独立验证（QA 路由 NoOne），数据管线行为保全、契约常量已去重；另顺手修正了 QA 发现的 `prototype-2/3` name 重名导致 metrics 指标丢失的次要数据缺陷。

## 二、改动清单

### P0 — 配置/文档一致性（阻断级）
- `package.json`：新增 `dev`(`next dev`)、`start`(`next start`)、`predev`(`node tools/build-skills-data.mjs && node tools/build.mjs`)，对齐 README 与 `app/lib/skills.ts` 约定。

### P1 — 可维护性 / 质量保障
- 新建 `tools/lib/taxonomy.mjs`：集中 13 类 `CATEGORY_ORDER`/`CATEGORY_EN` 与校验集合 `VALID_CATEGORIES`/`VALID_EN_CATEGORIES`/`REQUIRED`/`CONTRACT_ORDER`/`CONFLICT_KEYS`（`VALID_*` 由前两者派生，零漂移）。
- 新建 `tools/lib/frontmatter.mjs`：集中 `parseFrontmatter`/`stripInlineComment`/`BLOCK_SCALAR`（行为与原实现逐字节一致）。
- 重构 `tools/build-skills-data.mjs`、`tools/validate-skills.mjs`、`tools/import-from-github.mjs`、`tools/fix-skill-meta.mjs`、`tools/migrate-category.mjs`、`tools/fix-new-skills.mjs` → 统一从 `tools/lib/` 引入，删除本地重复定义。
- 新建 `.github/workflows/ci.yml`：`push(main)`/`pull_request` → setup-node 22.x → `npm ci` → `validate-skills.mjs` 门禁 + `build-skills-data.mjs` 冒烟。

### P2 — 配置/冗余清理
- `package.json`：`build` 移除中段冗余 `npm install`；`engines.node` `24.x`→`22.x`；新建根 `.nvmrc`(`22`)。
- 精确删除根目录 12 个临时脚本（`_tmp_*`×11 + `_scan_headers.mjs`），保留 `next.config.mjs`。
- 新建 `tools/lib/frontmatter.test.mjs`：node:test 回归测试（7 用例覆盖标量/引号/行内#/折叠/字面量/嵌套跳过/缺失块）。
- 顺带补全 7 个缺失必填 frontmatter 的技能 SKILL.md（html-prototype、prototype-2/3、prototype-designer、prototype-pattern、prototype-pollution、web-prototype），使 CI 门禁可绿。

### P3 — 低优清理
- `tsconfig.json`：删除未使用的 `paths.@/*`。
- `.gitignore`：删除失效白名单 `!build.mjs`/`!build-skills-data.mjs`。
- `tools/build.mjs`：GA 注释澄清（逻辑不变，仍 `GA_MEASUREMENT_ID || 兜底`）。
- `README.md`：版本徽章 `v1.20.55`→`v1.20.56`；技能数对齐 `data` total。

### 次要缺陷修正（QA 发现）
- `skills/prototype-2/SKILL.md` 与 `skills/prototype-3/SKILL.md` 的 `name` 由 `"prototype"` 改为各自目录名，消除 `skills-metrics.json` 按 name 去重丢指标（键数 220→222）。

## 三、验证结果（独立复验）
| 项 | 命令 | 结果 |
|---|---|---|
| 门禁校验 | `node tools/validate-skills.mjs` | 退出码 0（222 技能规范） |
| 数据构建 | `node tools/build-skills-data.mjs` | 退出码 0，`total=221`，metrics 键数=222 |
| 原型构建 | `node tools/build.mjs` | 退出码 0（prototype.html ~353KB） |
| 回归测试 | `node --test "tools/lib/*.test.mjs"` | 7/7 pass |
| 语法/JSON | `node --check` 全部脚本 + JSON.parse 全部配置 | 全部 OK |
| 无重复常量 | Grep `tools/*.mjs` | 定义仅存于 `tools/lib/` |

## 四、遗留 / 待确认
- `validate-skills.mjs` 报错文案仍写"9 类合法集合"（实为 13 类），陈旧文案，无害。
- README 领域导航表合计 217 ≠ 221，属历史文档漂移（README 已注明该表不随单技能增删频繁变动）。
- `web-prototype/SKILL.md` 原有 `od:`（疑似损坏的 `mode:`）字段，非本次引入，不影响校验/构建。
- `prototype/build-skills-data.mjs` 转发层保留（待确认外部 CI 是否仍调用）。
- 若需将单测纳入 CI 门禁，可在 `.github/workflows/ci.yml` 增加一步 `node --test "tools/lib/*.test.mjs"`（本地/CI 统一用 glob 形式，勿用 `node --test tools/lib/` 尾斜杠写法，Node 22 下会失败）。

## 五、用户下一步
1. `npm install` 后 `npm run dev` 即可本地预览（或 `npm run build` 生成双形态产物）。
2. 推送分支触发 `.github/workflows/ci.yml` 自动门禁。
3. 若 `prototype-2/3` 的分类（QA 补的 `category`）与预期不符，可再调整其 frontmatter。
4. 可选：把单测步骤加入 CI；清理陈旧文案/文档漂移。
