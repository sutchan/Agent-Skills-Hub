# Agent-Skills-Hub 能力基线（Spec）

> 路径：`docs/spec.md` · 版本：1.16.23
> 本文件固化**当前已落地能力**的基线规范，是 frontmatter 契约、数据契约与一致性红线的**唯一权威源**（变更起点与回退基准）。
> 仓库约定见 [project.md](project.md)；AI 协作流程见 [AGENTS.md](AGENTS.md)；贡献指引见 [CONTRIBUTING.md](../.github/CONTRIBUTING.md)。
> ⚠️ 本 spec 反映**截至 v1.16.23 的真实状态**；早期「Next.js 14 / React 18 / build-skills-data / sync-* / src/lib / prototype.html」等描述已被后续迭代移除。

---

## 1. 范围与权威源

- **项目定位**：Agent 技能集合仓库。技能内容权威 = 磁盘 `skills/<name>/SKILL.md`；展示数据 = 提交态 `data/skills-data.json`（**手工维护，无从 `SKILL.md` 自动生成脚本**）。
- **应用形态**：自包含静态单页 `src/index.html`（原生 JS、内联 `window.SKILLS_DATA` + CSS）为站点本体；`src/app/`（Next.js 16 App Router）仅为将 `/` 重定向到 `/index.html` 的存根；`server/`（Express，薄装配 `server.js`）提供本地静态托管与投票/收藏 API；`edge-worker.js`（EdgeOne Edge KV）承接生产侧投票/收藏。
- **设计规范权威源**：`prototype/`（`DESIGN.md` / `COMPONENTS.md` 等）；设计令牌历史上源自 `prototype/src/styles/tokens.css`，现随产物**内联进 `src/index.html`**。
- **版本权威源**：根 `package.json` 的 `version`（当前 **1.16.18**）。README 中/英徽章、CHANGELOG 顶部、各文档头注释须与之一致。

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

**校验现状（三层）**：
- `tools/validate-skills.mjs`：**校验源 `skills/*/SKILL.md` frontmatter**。硬失败（exit 1）= 缺 `name`/`description`、`name≠目录名`、`category` 非法；软警告（exit 0）= 缺 `en_description`/`zh_displayName`/`category`/`en_category`。CI `validate` job 调用。
- `tools/check-skill-yaml.mjs`（Bun，`npm run validate:yaml`）：**以真实 YAML 解析器解析 frontmatter**并校验六字段齐备、`name`==目录名、`category` 属于 §2.1、`en_category` 与 `category` 匹配、文件为 LF。用于兜住宽松行解析发现不了的破坏（孤立缩进块、双引号标量过度转义、plain scalar 顶格续行等）——这类破坏会让标准 YAML 解析器（skills 平台 / IDE 插件）直接加载失败。CI `validate` job 调用。
- `tools/lib/skills-data.test.mjs`：**校验 `data/skills-data.json`**（字段完整性 / `name` 唯一 / `githubDir` 一致 / `total` == 可见数）。二者互补，SKILL.md 与 data 均有自动校验覆盖。

### 2.1 14 大领域（稳定分类键）

分类键契约固化于 [CONTRIBUTING.md](.github/CONTRIBUTING.md)；运行数据固化于 `src/index.html` 内联数据（`categories` / `categoryEn`，由 `npm run sync:data` 从 `skills[].category` 派生注入，**当前 13 键活跃**，「桌面与客户端」暂无技能）。历史上由 `tools/lib/taxonomy.mjs` 维护，该文件**已移除**。未知分类会被归为末位「其他」类（**属违规，须为零**）。

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

> ⚠️ `data/*.json` **不是构建产物**，而是**提交进 git、手工维护**的数据源。`npm run build` **不触碰 `data/`**（见 §4）。

由 `skills/*/SKILL.md` 解析生成的历史流程（`build-skills-data.mjs`）**已移除**，当前**无脚本**从 `SKILL.md` 反向生成 `data/skills-data.json`（属已确认的设计取舍：数据由外部 skills-manager 基于 §2 六字段 frontmatter 生成并手工提交）。当前两份核心数据：

- `data/skills-data.json`：稳定技能元数据（`total` / `categories` / `categoryEn` / `skills[]`），**权威源**。
- `data/skills-metrics.json`：频繁派生指标，以 `name` 为 key 的 map。

二者内容经 `npm run sync:data`（读取 `data/skills-data.json`）**单向重建**进 `src/index.html` 的 `window.SKILLS_DATA`（前端唯一读取源；不 `fetch` data json）。历史并行快照 `live_page.html` **已从仓库移除**（见 §8.3），`sync:data` 现只更新唯一站点本体 `src/index.html`。

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

### 3.3 顶层结构（SkillsData，即内联 `window.SKILLS_DATA`）

> 注：`categories` / `categoryEn` 仅存在于**内联数据**（由 `npm run sync:data` 派生注入）；`data/skills-data.json` 文件本身只有 `total` + `skills` 两个顶层键。

```ts
type SkillsData = {
  total: number;                     // 过滤 hidden 后的可见技能数（动态统计，非硬编码）
  categories: string[];              // 去重中文分类名（由 skills[].category 推导，不存 count）
  categoryEn: Record<string,string>; // 中文→英文映射（英文态 chip/展示）
  skills: SkillEntry[];
};
```

### 3.4 一致性规则

- `category` 必须是 **14 大稳定中文分类键**之一（当前活跃 13 键）；`en_category` 为对应英文名；未知分类归「其他」类（须为零）。
- **中英共存**：每技能同时提供中文 `description` 与英文 `en_description`。
- **改技能展示的同步流程**：① 手工编辑 `data/skills-data.json`（+ 需要时 `skills-metrics.json`）；② 运行 `npm run sync:data` **自动**重建 `src/index.html` 内联 `window.SKILLS_DATA`。
- **`skills-votes.json` 已删除**（v1.16.18 结构清理）：历史上为空 `{}` 且无写入方，已从仓库移除；投票/收藏真源为本地 `data/kv-store.json`（运行时生成、已停止 git 跟踪）/ 生产 Edge KV。`src/index.html` 中 `a.download = "skills-votes.json"` 仅为导出文件名，与已删文件无关。
- **数据型数字**：README/应用内技能总数与领域表计数须以 `data/skills-data.json` 实算，**禁止手填**。

---

## 4. 构建与部署

- **本地**：`npm run dev` / `npm run start` = `node server.js`（Express，默认 `http://localhost:3000`），`GET /` 返回 `src/index.html`，并提供 `/api/votes`、`/api/favorites`。
- **构建**：`npm run build` = `node scripts/sync-seo-assets.mjs && next build && node scripts/inject-ga.mjs`（**v1.16.20 起**构建前先幂等同步 SEO/GEO 资产；**v1.16.19 起**移除 Unix 专用 `NODE_ENV=production` / `cp` 语法，Next 构建自身设置 production；注入脚本直接以 `src/index.html` 为源写出 `out/index.html`，Windows / CI 行为一致）。`next.config.mjs` 为 `output:"export"`（纯静态，产物落 `out/`）。由于 `src/app` 仅导出一个重定向占位页，随后被注入脚本用真正的静态应用**覆盖** `out/index.html`，故 **Next 层对最终页面无实质贡献**，真实可部署物 = `src/index.html` + `public/` + `data/` + `skills/` + `out/` 导出壳。`inject-ga.mjs` 一次性替换 `__GA_MEASUREMENT_ID__`（环境变量，缺省回退 `G-WQDDVB14PF`）、`__APP_VERSION__`、`__BUILD_ID__`，并在源文件或占位符残留时**硬失败**（旧版缺产物时静默跳过会部署空白页）。
- **Vercel 静态导出（v1.16.23 契约）**：`vercel.json` 固定 `framework: null`（禁用 Next 构建器——`output: "export"` 的纯静态产物无需 `routes-manifest.json`，若保留 `"nextjs"` 会在 `out/` 查找该清单而报 `NEXT_NO_ROUTES_MANIFEST`）/ `buildCommand: "npm run build"` / `outputDirectory: "out"`。构建链仍为 `sync:seo → next build → inject-ga`。**项目设置优先级高于仓库配置**：Vercel 控制台需把 Framework Preset 设为 Other / Static，Output Directory 设为 `out` 或清空；`GA_MEASUREMENT_ID` 由环境变量注入，缺省回退。Vercel 仅发布静态产物，`/api/*` 投票收藏由 EdgeOne 边缘函数提供。
- **SEO / GEO（v1.16.20 契约）**：`public/` 为抓取层唯一发布入口，含 `robots.txt`（允许公开内容、`Disallow: /api/`、`Sitemap` 指令）、`sitemap.xml`（仅首页；hash 深链复用同一首页 HTML，列入即重复内容）、`llms.txt`（生成式引擎摘要）、`llms-full.txt`（全部可见技能可读清单）、`data/skills-data.json`（权威数据的只读发布副本，保证 `/data/skills-data.json` 在 `out/` 中可达）。`src/index.html` 的 `SEO-JSONLD:BEGIN/END` 与 `SEO-DIRECTORY:BEGIN/END` 标记之间为生成区：前者是 `WebSite`/`CollectionPage`/`SoftwareApplication`/`FAQPage` 四类 JSON-LD，后者是静态可见的关于文案、FAQ 与 `<details>` 折叠技能索引（爬虫无需执行 JS 即可读到真实内容）。生成逻辑在 `scripts/seo/{facts,render-assets,render-page}.mjs` 与 `scripts/sync-seo-assets.mjs`，数量/分类/描述**一律从 `data/skills-data.json` 实算**，写入幂等；`npm run sync:seo` 手动触发，`sync:data` 与 `build` 自动触发。页面 head 为单一 `<h1>`、canonical 指向站点绝对 URL；三语共用一 URL，不添加 `hreflang` 自引用，语言由 `og:locale` + `documentElement.lang` 表达。
- **生产 API**：`edge-worker.js`（Edge KV `ASH_KV`）实现投票/收藏，`edgeone.config.json` 将 `*/api/*` 路由指向它；键 `vote:<name>`（`{up}`）/ `fav:<name>`，契约与 `server/` 对齐。
- **CI/CD**（`.github/workflows/ci.yml`，**Bun + `bun.lock`** `--frozen-lockfile`）：串行流水线 `validate`（`tsc --noEmit` + `bun run test`（node --test tools/lib）+ `tools/validate-skills.mjs` + `tools/check-skill-yaml.mjs` + `tools/check-version.mjs` + `tools/check-inline-js.mjs`）→ `build`（导出 `out/`、上传构件）→ `e2e`（Playwright，`webServer` = `bun run start`，跑 `e2e/smoke.spec.ts`）→ `deploy`（`npx edgeone pages deploy ./out` 到 EdgeOne Pages）→ `release`（`refs/tags/v*` 或 main 分支触发，抽 CHANGELOG 发行说明，附 `data/*.json`）。
- **发版（v1.16.18 起自动，规范：所有工作流全绿后自动发布 Releases）**：bump `package.json` version → 更新 `CHANGELOG.md` → push main；`validate`/`build`/`e2e`/`deploy` 全部通过后，`release` job 幂等检查 `v{version}` Release——不存在则经 GitHub API 自动创建注解 tag（基于本次 HEAD，与部署同一提交）并发布；已存在则跳过（版本未 bump 的普通 push 不重复发版）。手动补发路径：`npm run tag` + 推送 `v*` tag。

---

## 5. 应用（`src/index.html`）交互（已落地）

自包含静态单页（原生 JS、无框架运行时）。完整视觉/组件规范以 `prototype/DESIGN.md` / `prototype/COMPONENTS.md` 为准，交互要点：

- **搜索**：前端关键词匹配 `name` / `zh` / `description`，支持中文子序列模糊匹配与 `scoreSkill` 加权（名称/中文名 > 标签 > 分类 > 描述），查询态按相关性降序。
- **分类筛选**：分类 chip **单选**（同一时刻至多一个分类；点「全部」或再次点击当前项即复位为空）。
- **标签筛选**：功能标签 chip **多选**（OR），与分类以 AND 交叉过滤；空结果页提供热门标签一键直达。
- **分页**：`PAGE_SIZE=36` 数字翻页（覆盖全部技能）。
- **视图**：`grid` / `list` 仅改布局，不影响过滤。
- **详情弹窗**：语义化 `id` + `aria-modal` + `aria-labelledby`，展示中英描述、分类、allowedTools、安装命令/复制、相关技能；含焦点陷阱、ESC 关闭、背景滚动锁定、`prefers-reduced-motion` 适配。
- **投票 / 收藏**：`localStorage`（`ash-votes` / `ash-favorites`）+ `initCloudSync()` 与 `/api/votes`、`/api/favorites` 云同步；赞为累加制 + 独立撤销，无「踩」。
- **语义化 id**：主要容器/弹窗均加 kebab-case 语义化 `id` 与 ARIA 属性（便于调试/无障碍/e2e 定位）。**v1.16.19 全量迁移**：应用与原型中历史的 92 个 camelCase id（如 `searchInput` / `siteFooter`）统一为 kebab-case（`search-input` / `site-footer`），动态前缀（`tag-chip-*` / `cat-slice-*` / `cat-legend-*`）同步；CSS 选择器、`$("#…")`、`getElementById()`、ARIA 关联、e2e 选择器与三份原型 HTML 一次性对齐。详情标题 `id="detail-title"` 只声明一次，消除互斥模板中的重复 id；历史 `data-alias` 双 id 语义已移除。
- **三语界面（v1.16.17）**：语言优先级 = 简体中文 `zh`（默认）> 繁体中文 `tw` > 英语 `en`；`SUPPORTED` / 回退链（tw、en 缺词回退 zh）/ 顶栏三语循环 / 设置面板三选项 / `loadEnum(LS_LANG, …)` 枚举校验均已落地。`html lang` 映射为 `zh` / `zh-Hant` / `en`；静态文案用 `.zh`/`.tw`/`.en` + `data-i18n` 三节点互斥显隐，图标提示另配 `data-tip-tw`。技能数据本身仅有简体中文名与英文原文（**暂无繁体数据**），繁体界面下卡片/详情标题回退「简体名 + 英文副标题」，数据级繁体化为后续任务。

---

## 6. 分享功能（已落地）

技能详情点击「分享」复制**分析链接**（技能详情页 URL `skills/<name>/`）：

1. 剪贴板 = 链接 + 一条**随机**宣传文案（简中/繁中/英各 3 条，按当前语言随机取 1 条），二者以空行分隔，纯文本。
2. 文案统一定义于 `src/index.html` 内联 i18n 的 `share.promos`（zh/tw/en），不重复定义。
3. 链接构造：优先 `location.origin + 根 path + skills/<name>/`，离线回退相对路径。
4. 复制容错：`navigator.clipboard.writeText` → 降级 `execCommand('copy')` → 明确失败提示。
5. 反馈：轻量 toast（`role="status"` / `aria-live="polite"`，3 秒消失、可键盘关闭）；分享按钮带 `aria-label`。

---

## 7. 一致性红线（本仓库强制约束）

> 红线为**硬约束**，违反即导致数据/展示失真或破坏契约。

1. **技能内容权威**：技能正文/资源唯一真相在 `skills/<name>/`；展示数据 `data/*.json` 须手工维护（无 `SKILL.md` 自动生成脚本），但内联 `window.SKILLS_DATA` 可由 `npm run sync:data` 自动重建（见 §3.4）。
2. **无嵌套副本**：技能仅落 `skills/<name>/`，禁止 `skills/<x>/skills/<name>/` 之类嵌套。
3. **数据有效性**：展示须与磁盘一致；删除技能同步清理 `data/skills-data.json` 与 `src/index.html` 内联数据。
4. **展示页规范**：UI 须对齐 `prototype/DESIGN.md`（配色令牌、响应式、可访问性、品牌形象）。
5. **换行符**：`skills/**` 强制 LF（CRLF 红线，详见 CONTRIBUTING「文件换行符规范」）。
6. **版本 bump**：任何文件修改升最小版本号；仅被改文件的头注释版本号更新，**禁止全仓库批量刷写头注释**。
7. **数据型数字**：README/应用内技能总数与领域表计数须以 `data/skills-data.json` 实算，**禁止手填**。
8. **语义化 id**：应用主要容器加 kebab-case 语义化 `id`（见 §5）。
9. **提交信息**：遵循 `<type>: <描述>`（Conventional Commits，详见 CONTRIBUTING「提交规范」）。
10. **单文件应用例外**：源码 >200 行拆分规则**仅适用于可拆分代码**；`src/index.html` 为有意维持的内联单文件应用，豁免拆分，但新增逻辑须模块化、加语义化 id 与注释。
11. **三语词条齐全**：`translations.zh` / `translations.tw` / `translations.en` 键位必须一一对应；静态文案三类节点与 `data-tip-tw` 同步补齐；禁止以「回退 zh」作为繁体/英文态的交付结果（详见 §5）。

---

## 8. 已知技术债与不一致（诚实记录）

> 以下为当前真实存在、待后续迭代处理的问题；历史已修复项附于末尾备查。**改动相关区域前须先知悉**。

- **8.1 Next 壳冗余**：`src/index.html`（真实应用）与 `src/app`（重定向壳）双层并存，仅一层有用；`src/app` 仅导出占位页随后被 `cp` 覆盖。候选清理：删除 `src/app` 或改 `next.config` 直接以 `src/index.html` 为入口。
- **8.2 无 `SKILL.md`→`data` 生成器**：`data/*.json` 由外部 skills-manager 基于 §2 六字段 frontmatter 生成并手工提交仓库；仓库内不保留反向生成脚本，**属已确认设计取舍**（非 bug）。新增/修改技能须先满足 §2 契约（`validate-skills.mjs` 软门禁提示缺失字段），再经 skills-manager 落 `data/`。
- **8.3 `live_page.html`（已失效）**：该并行快照文件已从仓库移除，本条仅存档；`npm run sync:data` 现只更新 `src/index.html`（唯一站点本体），若未来恢复快照文件需重新评估同步策略。
- **8.4 过期引用残留（v1.16.18 部分清理）**：`src/index.html` 头注释与 og 注释、`.gitignore` 幽灵规则已清理；历史 CHANGELOG 中旧双轨版本号（1.20.x / 2026-08 的 1.16.x 与现行体系重名）仅存档不动。
- **8.5 边缘产物部署保证**：`edge-worker.js` / `edgeone.config.json` 在仓库根，`next build`/`cp` 不把它们纳入 `out/`；其随 EdgeOne 部署的保证未在流水线中明确，待确认。

**历史已修复（记录备查，勿再标为问题）**：
- **v1.16.19 代码审查**：① 工作区配置中的明文 IDE accessToken 移除并脱敏后重新纳入版本控制；② `edge-worker.js` 回源失败补 502 兜底、GET /api/votes 改并行 KV 读取、兼容 KV list 两种返回形态；③ `server/store.js` 增加退出前强制落盘（防最后 100ms 投票/收藏丢失），`server/pages.js` 首页注入结果按 mtime 缓存；④ 详情外链加 http/https 协议白名单，复制降级路径按 `execCommand` 真实结果反馈；⑤ id 全量 kebab-case 化并消除重复 id；⑥ `prototype/template.html` 从残留占位符模板重写为 DOM 结构契约，三份原型的 favicon 引用与页脚结构对齐实现。
- 内联数据漂移（161→167）：v1.16.0 起 `npm run sync:data` 从 `data/skills-data.json` 重建内联 `window.SKILLS_DATA`，meta/内联 `total`/data 三处实算一致。
- 限流在生产反代下误伤全站：server 增加 `trust proxy` + `X-Forwarded-For` 取真实 IP。
- SPA 深链与未知 API 返回不当内容：`/api` JSON 404、全局错误兜底、非 `/api` SPA 回退（返回首页并注入 GA ID）。
- `server.js` 拆分：`server/` 模块化（v1.16.2），解决单文件 >200 行问题。
- `bun.lock` 提交（v1.16.1），CI `--frozen-lockfile` 可复现。
- `validate-skills.mjs` 恢复（v1.16.x），SKILL.md 源 frontmatter 重获自动校验。
- `e2e/` 补齐（`smoke.spec.ts`）并接入 CI `e2e` job，不再空跑。
- CI 部署目录由 `.next` 修正为 `out/`（纯静态导出产物）。

---

## 9. 演进方式

- 任何对已落地能力的修改，先在 [tasks.md](tasks.md) 登记任务（参考 [AGENTS.md](AGENTS.md)），完成后将任务状态更新为「已完成」并归档至 `docs/tasks-done.md`。
- 本 spec 仅在能力真正落地/移除时更新，保持「当前真相」语义；§8 技术债随修复进度收敛。

---

## 10. 外部技能生态参考（skills.sh）

本仓库并非封闭孤岛——业界存在开放的 **Agent Skills 生态系统 [skills.sh](https://www.skills.sh)**（由 Vercel 出品、技能开源在 GitHub），可作为**选品参考、能力对标与补充来源**。

- **生态概况**：开放的 Agent 技能目录，通过 CLI `npx skills add <owner/repo>` 一键安装增强代理的程序性知识。
- **程序化访问**：橱窗 API `https://skills.sh/api/v1/`（需 Vercel OIDC Token，600 请求/分钟）；**真实数据源是 GitHub 仓库**（`npx skills` CLI 不依赖 skills.sh API，公开仓库免 token 直连 GitHub）。
- **导入**：历史上由 `tools/import-from-github.mjs` 免 token 批量导入，该脚本**已移除**；当前新增/导入为**手工**流程（补 `zh_displayName`/`category`/`en_category`/`en_description` 并译 `description` 为中文）。
- **与本仓库的关系**：仅作选品/对标参考；本仓库自有 14 大稳定分类体系（见 §2.1），不照搬 skills.sh 的 Topics；凡源自生态上游的技能建议在 frontmatter 标注 `source: <owner/repo>` 便于溯源。
