# Agent-Skills-Hub 能力基线（Spec）

> 路径：`docs/spec.md` · 版本：1.16.2
> 本文件固化**当前已落地能力**的基线规范，是 frontmatter 契约、数据契约与一致性红线的**唯一权威源**（变更起点与回退基准）。
> 仓库约定见 [project.md](project.md)；AI 协作流程见 [AGENTS.md](AGENTS.md)；贡献指引见 [CONTRIBUTING.md](../.github/CONTRIBUTING.md)。
> ⚠️ 本 spec 反映**截至 v1.16.2 的真实状态**；早期「Next.js 14 / React 18 / build-skills-data / validate-skills / sync-* / src/lib / prototype.html」等描述已被后续迭代移除，见 §8 已知技术债。

---

## 1. 范围与权威源

- **项目定位**：Agent 技能集合仓库。技能内容权威 = 磁盘 `skills/<name>/SKILL.md`；展示数据 = 提交态 `data/skills-data.json`（**手工维护，二者间无自动构建桥接**）。
- **应用形态**：自包含静态单页 `src/index.html`（原生 JS、内联 `window.SKILLS_DATA` + CSS）为站点本体；`src/app/`（Next.js 16 App Router）仅为将 `/` 重定向到 `/index.html` 的存根；`server.js`（Express）提供本地静态托管与投票/收藏 API；`edge-worker.js`（EdgeOne Edge KV）承接生产侧投票/收藏。
- **设计规范权威源**：`prototype/`（`DESIGN.md` / `COMPONENTS.md` 等）；设计令牌历史上源自 `prototype/src/styles/tokens.css`，现随产物**内联进 `src/index.html`**。
- **版本权威源**：根 `package.json` 的 `version`（当前 **1.16.2**）。README 中/英徽章、CHANGELOG 顶部、各文档头注释须与之一致。

---

## 2. Frontmatter 契约（必填六字段）

`SKILL.md` 以 YAML frontmatter 开头，前 6 个为**契约字段**（顺序固定）：

| 顺序 | 字段 | 语义 | 约束 |
|---|---|---|---|
| 1 | `name` | 技能名（kebab-case） | 与目录名一致，唯一键 |
| 2 | `description` | 中文完整描述 | 默认展示语言，用 `\|-\` 块标量，禁双引号单行包裹 |
| 3 | `en_description` | 英文原文描述 | 处理技能时保留，与 `description` 中英共存 |
| 4 | `zh_displayName` | 中文一句话摘要 | 卡片标题 |
| 5 | `category` | 中文分类键 | **14 大稳定领域**之一（见 §2.1） |
| 6 | `en_category` | 英文分类名 | 与 `category` 对应（如 `品牌与设计`→`Brand & Design`） |

**字段顺序规范**：`name`→`description`→`en_description`→`zh_displayName`→`category`→`en_category`，其后为可选身份/来源/能力字段，最后为 `metadata` 嵌套块。未知字段追加在 `metadata` 之前。

**可选字段**（平台/工具元数据，不参与展示）：`version` / `compatibility` / `license` / `author` / `homepage` / `displayName` / `emoji` / `slug` / `keywords` / `argument-hint` / `effort` / `user-invocable` / `allowed-tools` / `disable-model-invocation` / `hooks` / `model` / `risk_level` / `acceptLicenseTerms` / `hidden` / `origin` / `last_modified` / `metadata`。

**禁止字段**：不得出现 `description_zh` / `description_en` 等冲突键；中文译文统一写 `description`，英文原文写 `en_description`。

**校验现状**：历史上由 `tools/validate-skills.mjs` 从 `SKILL.md` frontmatter 直接校验；该脚本**已移除**。当前契约回归由 `tools/lib/skills-data.test.mjs` 承担——校验 `data/skills-data.json` 的字段完整性、`name` 唯一、`githubDir` 一致、`total` == 可见数。**不再有从 SKILL.md 直连 data 的自动校验**（见 §8）。

### 2.1 14 大领域（稳定分类键）

固化于 `src/index.html`（分类渲染）与 `data/skills-data.json`（`categories` / `categoryEn`）。历史上由 `tools/lib/taxonomy.mjs` 维护，该文件**已移除**。未知分类会被归为末位「其他」类（**属违规，须为零**）。

| 中文键 | 英文 |
|---|---|
| 品牌与设计 | Brand & Design |
| 文档与内容 | Docs & Content |
| 数据分析与可视化 | Data Analysis & Visualization |
| 前端开发 | Frontend Dev |
| 后端与平台 | Backend & Platform |
| 移动端开发 | Mobile Dev |
| WordPress 与 CMS | WordPress & CMS |
| 工程实践与质量 | Engineering Practice & Quality |
| 文件与格式处理 | File & Format Handling |
| 自动化与集成 | Automation & Integration |
| AI 与智能体 | AI & Agents |
| 音视频与多媒体 | Media & Multimedia |
| 桌面与客户端 | Desktop & Client |
| 安全 | Security |

---

## 3. 数据契约（提交态）

> ⚠️ 与旧版 spec 的关键差异：`data/*.json` **不再是构建产物**，而是**提交进 git、手工维护**的数据源。`npm run build` **不触碰 `data/`**（见 §4）。"勿手改、重跑 build 再生" 的旧约束**已失效**。

由 `skills/*/SKILL.md` 解析生成的历史流程（`build-skills-data.mjs`）**已移除**。当前两份核心数据：

- `data/skills-data.json`：稳定技能元数据（`total` / `categories` / `categoryEn` / `skills[]`）。
- `data/skills-metrics.json`：频繁派生指标，以 `name` 为 key 的 map。

二者内容被**内联进 `src/index.html` 的 `window.SKILLS_DATA`**（前端唯一读取源；不 `fetch` data json）。

### 3.1 技能条目（SkillEntry）

```ts
type SkillEntry = {
  name: string;            // 目录名（kebab-case），唯一键
  category: string;        // 中文分类名（稳定键）
  enCategory: string;      // 英文分类名（en_category）
  zh: string;              // 中文一句话摘要（zh_displayName）
  description: string;     // 中文完整描述（默认展示语言）
  enDescription: string;   // 英文原文描述（en_description）
  allowedTools: string[];  // allowed-tools（无则 []）
  hidden: boolean;         // 是否隐藏（hidden:true）
  source?: string;         // 可选，上游 owner/repo（溯源）
  homepage?: string;       // 可选，来源网址
  installCommand: string;  // 恒定派生：npx skills add sutchan/Agent-Skills-Hub/skills/<name>
  githubDir: string;       // 恒定派生：skills/<name>
  tags?: string[];         // 功能标签（卡片第二组筛选）
};
```

### 3.2 派生指标（SkillMetrics）

```ts
type SkillMetrics = {
  popularity?: number;     // 被其他技能 description 提及次数
  size?: number;           // 目录总字节数
  files?: number;          // 文件数（递归）
  stars?: number;          // GitHub 星标（定期抓取）
  firstSeen?: string;      // 首次收录日期
  skillVersion?: string;   // 技能版本
};
```

### 3.3 顶层结构（SkillsData）

```ts
type SkillsData = {
  total: number;                     // 过滤 hidden 后的可见技能数（动态统计，非硬编码）
  categories: string[];              // 去重中文分类名（由 skills[].category 推导，不存 count）
  categoryEn: Record<string,string>; // 中文→英文映射（英文态 chip/展示）
  skills: SkillEntry[];
};
```

### 3.4 一致性规则

- `category` 必须是 **14 大稳定中文分类键**之一；`en_category` 为对应英文名；未知分类归「其他」类（须为零）。
- **中英共存**：每技能同时提供中文 `description` 与英文 `en_description`。
- **改技能展示须三处同步**：`data/skills-data.json`（+ 需要时 `skills-metrics.json`）与 `src/index.html` 内联 `window.SKILLS_DATA`——**当前靠手工保持一致**。
- **`skills-votes.json` 已弃用**：现为空 `{}`，无写入方；投票/收藏真源为本地 `data/kv-store.json` / 生产 Edge KV。
- **数据型数字**：README/应用内技能总数与领域表计数须以 `data/skills-data.json` 实算，**禁止手填**（注意：`src/index.html` 的 `<meta>` 描述文案与内联 `total` 曾出现口径不一致，改前务必实算）。

---

## 4. 构建与部署

- **本地**：`npm run dev` / `npm run start` = `node server.js`（Express，默认 `http://localhost:3000`），`GET /` 返回 `src/index.html`，并提供 `/api/votes`、`/api/favorites`。
- **构建**：`npm run build` = `NODE_ENV=production next build && cp src/index.html out/index.html`。`next.config.mjs` 为 `output:"export"`（纯静态，产物落 `out/`）。由于 `src/app` 仅导出一个重定向占位页，随后被 `cp` 用真正的静态应用**覆盖** `out/index.html`，故 **Next 层对最终页面无实质贡献**，真实可部署物 = `src/index.html` + `public/` + `data/` + `skills/`。
- **生产 API**：`edge-worker.js`（Edge KV `ASH_KV`）实现投票/收藏，`edgeone.config.json` 将 `*/api/*` 路由指向它；键 `vote:<name>`（`{up}`）/ `fav:<name>`，契约与 `server.js` 对齐。
- **CI/CD**（`.github/workflows/ci.yml`，**Bun**）：单一串行流水线 `validate`（`tsc --noEmit` + `node --test tools/lib` + `tools/check-version.mjs`）→ `build`（上传 `.next` 构件）→ `e2e`（Playwright，`webServer` = `bun run start`）→ `deploy`（EdgeOne Pages）→ `release`（tag 触发，抽 CHANGELOG 发行说明，附 `data/*.json`）。
- **发版步骤**：bump `package.json` version → 更新 `CHANGELOG.md` → `npm run tag`（创建 `vX.Y.Z` 注解 tag）→ 推送 tag 触发 CI 部署与 Release。
- ⚠️ **已知待确认**：CI 上传/部署的是 `.next`，而 `output:"export"` 产物在 `out/`；`ci.yml` 已标注该项待确认（详见 §8.1）。

---

## 5. 应用（`src/index.html`）交互（已落地）

自包含静态单页（原生 JS、无框架运行时）。完整视觉/组件规范以 `prototype/DESIGN.md` / `prototype/COMPONENTS.md` 为准，交互要点：

- **搜索**：前端关键词匹配 `name` / `zh` / `description`，支持中文子序列模糊匹配与 `scoreSkill` 加权（名称/中文名 > 标签 > 分类 > 描述），查询态按相关性降序。
- **分类筛选**：分类 chip **单选**（同一时刻至多一个分类；点「全部」或再次点击当前项即复位为空）。
- **标签筛选**：功能标签 chip **多选**（OR），与分类以 AND 交叉过滤；空结果页提供热门标签一键直达。
- **分页**：`PAGE_SIZE=36` 数字翻页（约 5 页覆盖全部技能）。
- **视图**：`grid` / `list` 仅改布局，不影响过滤。
- **详情弹窗**：语义化 `id` + `aria-modal` + `aria-labelledby`，展示中英描述、分类、allowedTools、安装命令/复制、相关技能；含焦点陷阱、ESC 关闭、背景滚动锁定、`prefers-reduced-motion` 适配。
- **投票 / 收藏**：`localStorage`（`ash-votes` / `ash-favorites`）+ `initCloudSync()` 与 `/api/votes`、`/api/favorites` 云同步；赞为累加制 + 独立撤销，无「踩」。
- **语义化 id**：主要容器/弹窗均加 kebab-case 语义化 `id` 与 ARIA 属性（便于调试/无障碍/e2e 定位）。

---

## 6. 分享功能（已落地）

技能详情点击「分享」复制**分析链接**（技能详情页 URL `skills/<name>/`）：

1. 剪贴板 = 链接 + 一条**随机**宣传文案（中/英各 ≥3 条，按当前语言随机取 1 条），二者以空行分隔，纯文本。
2. 文案统一定义于 `src/index.html` 内联 i18n 的 `share.promos`（zh/en），不重复定义。
3. 链接构造：优先 `location.origin + 根 path + skills/<name>/`，离线回退相对路径。
4. 复制容错：`navigator.clipboard.writeText` → 降级 `execCommand('copy')` → 明确失败提示。
5. 反馈：轻量 toast（`role="status"` / `aria-live="polite"`，3 秒消失、可键盘关闭）；分享按钮带 `aria-label`。

---

## 7. 一致性红线（本仓库强制约束）

> 红线为**硬约束**，违反即导致数据/展示失真或破坏契约。

1. **技能内容权威**：技能正文/资源唯一真相在 `skills/<name>/`；但**展示数据 `data/*.json` 与 `src/index.html` 内联数据当前无自动生成**，改动须手工三处同步（见 §3.4）。
2. **无嵌套副本**：技能仅落 `skills/<name>/`，禁止 `skills/<x>/skills/<name>/` 之类嵌套。
3. **数据有效性**：展示须与磁盘一致；删除技能同步清理 `data/skills-data.json` 与 `src/index.html` 内联数据。
4. **展示页规范**：UI 须对齐 `prototype/DESIGN.md`（配色令牌、响应式、可访问性、品牌形象）。
5. **换行符**：`skills/**` 强制 LF（CRLF 红线，详见 CONTRIBUTING「文件换行符规范」）。
6. **版本 bump**：任何文件修改升最小版本号；仅被改文件的头注释版本号更新，**禁止全仓库批量刷写头注释**。
7. **数据型数字**：README/应用内技能总数与领域表计数须以 `data/skills-data.json` 实算，**禁止手填**。
8. **语义化 id**：应用主要容器加 kebab-case 语义化 `id`（见 §5）。
9. **提交信息**：遵循 `<type>: <描述>`（Conventional Commits，详见 CONTRIBUTING「提交规范」）。
10. **单文件应用例外**：源码 >200 行拆分规则**仅适用于可拆分代码**；`src/index.html` 为有意维持的内联单文件应用（v1.14.98 决策 #7），**豁免拆分**，但新增逻辑须模块化、加语义化 id 与注释。

---

## 8. 已知技术债与不一致（诚实记录，非规范目标）

> 以下为当前真实存在、待后续迭代处理的问题，**不影响上述契约的事实性**，但改动相关区域前须先知悉。

- **8.1 部署产物错位**：`output:"export"` 产物在 `out/`，CI 却上传/部署 `.next`（`ci.yml` 已标注待确认）。对静态托管，`.next` 可能不是可服务站点根。
- **8.2 数据管线断裂**：无任何脚本从 `SKILL.md` 再生 `data/*.json`；`npm run build` 不碰 `data/`；数据全手工维护，易与 `skills/` 漂移。复现/回填：数据由外部 skills-manager 基于 `skills/*/SKILL.md` 的 §2 六字段 frontmatter 生成；新增/修改技能须先满足 §2 契约（`tools/validate-skills.mjs` 软门禁会提示缺失字段），再经 skills-manager 提交 `data/`；仓库内不保留自动构建脚本，避免与「手工维护」契约冲突（见 #5）。
- **8.3 frontmatter 校验降级**：`validate-skills.mjs` 已移除，改为校验 data JSON 的 `skills-data.test.mjs`；**SKILL.md 与 data 之间无自动一致性校验**。
- **8.4 e2e 空跑**：`playwright.config.ts` 指向 `./e2e`，但仓库无 `e2e/` 目录/测试，`bun run e2e` 会因无测试失败。
- **8.5 Bun 无 lock**：CI 全程用 `bun`，仓库无 `bun.lock`，构建不可完全复现。
- **8.6 静态站与 Next 并存**：`src/index.html`（真实应用）与 `src/app`（重定向壳）双层并存，仅一层有用。
- **8.7 边缘产物未入部署**：`edge-worker.js` / `edgeone.config.json` 在仓库根，`next build`/`cp` 不把它们纳入 `out/`，其随 EdgeOne 部署的保证未在流水线中明确。
- **8.8 技能数量口径不一**（已修复，v1.16.0）：原 `<meta>` 文案 171 / 内联 `total` 161 的口径问题，已通过 `npm run sync:data` 从 `data/skills-data.json` 重建内联数据消除；现 meta、内联 `total` 与 data 文件三处均为实算值 167（spec §3.4）。
- **8.9 过期引用残留**（部分已修复，v1.16.0）：`src/parts/03-detail.js` 死代码已删除（规范 §7.10 内联单文件应用豁免拆分）；`.gitignore` 与 `banner-og.svg` 注释中仍引用不存在的 `build.mjs`/`build-skills-data.mjs`，属低优先级待清理项。

---

## 9. 演进方式

- 任何对已落地能力的修改，先在 [tasks.md](tasks.md) 登记任务（参考 [AGENTS.md](AGENTS.md)），完成后将任务状态更新为「已完成」并归档至 `docs/tasks-done.md`。
- 本 spec 仅在能力真正落地/移除时更新，保持「当前真相」语义；§8 技术债随修复进度收敛。

---

## 10. 外部技能生态参考（skills.sh）

本仓库并非封闭孤岛——业界存在开放的 **Agent Skills 生态系统 [skills.sh](https://www.skills.sh)**（由 Vercel 出品、技能开源在 GitHub），可作为**选品参考、能力对标与补充来源**。

- **生态概况**：开放的 Agent 技能目录，通过 CLI `npx skills add <owner/repo>` 一键安装增强代理的程序性知识。
- **程序化访问**：橱窗 API `https://skills.sh/api/v1/`（需 Vercel OIDC Token，600 请求/分钟）；**真实数据源是 GitHub 仓库**（`npx skills` CLI 不依赖 skills.sh API，公开仓库免 token 直连 GitHub）。
- **导入**：历史上由 `tools/import-from-github.mjs` 免 token 批量导入（列 tree → 拉 SKILL.md → 补 4 必备字段 + 溯源），该脚本**已移除**；当前新增/导入为**手工**流程（补 `zh_displayName`/`category`/`en_category`/`en_description` 并译 `description` 为中文）。
- **与本仓库的关系**：仅作选品/对标参考；本仓库自有 14 大稳定分类体系（见 §2.1），不照搬 skills.sh 的 Topics；凡源自生态上游的技能建议在 frontmatter 标注 `source: <owner/repo>` 便于溯源。
