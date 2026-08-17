# Agent-Skills-Hub 能力基线（Spec）

> 路径：`openspec/spec.md` · 版本：1.14.28
> 本文件固化**当前已落地能力**的基线规范，作为变更的起点与回退基准。
> 详细数据契约、交互与分享规则见 [`project.md`](project.md)；演进提案见 [`changes/`](changes/)，已归档变更见 [`archive/`](archive/)。

---

## 1. 范围与权威源

- **项目定位**：Agent 技能集合仓库，提供 `skills/`（原始技能）、`prototype/`（静态展示页）、`app/`（Next.js 应用工作区）三套资产。
- **设计令牌权威源**：`prototype/src/styles/tokens.css`（单一来源，浅/深双主题）。主色绿：浅 `#2e9e6b`、深 `#5cc98c`。
- **版本权威源**：仓库根 `package.json` 的 `version`（当前 1.14.28）。README 中英文徽章、CHANGELOG 顶部须与之保持一致。

---

## 2. 数据契约（已落地）

展示页与任何消费方共享的数据结构，由 `build-skills-data.mjs` 从磁盘 `skills/<name>/SKILL.md` 解析生成，输出至仓库根 `data/skills-data.json`，再由 `build.mjs` 内联进 `prototype/out/index.html`。

### 2.1 技能条目（SkillEntry）
```ts
type SkillEntry = {
  name: string;            // 目录名（kebab-case），唯一键
  category: string;        // 中文分类名（仅存中文，如 "前端与 UI 设计"）
  zh: string;              // 中文一句话描述
  description: string;     // 英文原文描述（SKILL.md 正文/description）
  allowedTools: string[];  // SKILL.md frontmatter 的 allowed-tools（无则 []）
};
```

### 2.2 顶层结构
```ts
type SkillsData = {
  total: number;           // = skills.length（动态统计，非硬编码）
  categories: { category: string; count: number }[];  // 13 个中文分类 + 计数
  skills: SkillEntry[];
};
```

### 2.3 一致性规则（固化）
- `category` 必须与 README 分类标题（英文 README 的 `### Category (N)`）**名称一致**；中文 README 分类标题用 `### 分类（N）` 形式。
- `zh` 取自中文 README 表格第二列；英文 `description` 取自 SKILL.md 原文。
- `data/skills-data.json` 为**构建产物，勿手改**，重跑 `npm run build` 再生。
- 当前磁盘技能目录约 **204** 个（README 声明 200 且分类明细自洽，待 `tools/skills_readme.py` 重生成对齐）。

---

## 3. 展示页交互（已落地）

`prototype/out/index.html` 为自包含静态页（无 React/Next 运行时）：

- **搜索**：前端关键词匹配 `name` / `zh` / `description`，输入即时过滤。
- **分类筛选**：点击分类标签过滤；"全部"重置。
- **卡片网格**：每卡显示头像（首字母）、名称、中文描述、分类标签。
- **详情弹窗**：点击卡片打开 dialog（语义化 `id` + `aria-modal` + `aria-labelledby`），展示中英文描述、分类、allowedTools；支持分享。
- **分享/复制**：将当前技能链接写入剪贴板。
- 主要容器与弹窗均已加语义化 `id` 与 ARIA 属性（便于调试/无障碍/e2e 定位）。

---

## 4. 分享功能（已落地，v1.14.0）

- 技能详情支持生成可分享链接（URL 携带技能标识）。
- 详情页首屏 SEO：`<title>` 与 `<meta name="description">` 使用技能中文名 + 描述。
- 分享文案遵循项目文案基调（见 `project.md` §4.5.2 第4-6条）。

---

## 5. 构建与发版（已落地）

- **构建**：根 `package.json` 的 `npm run build` = `node build-skills-data.mjs && node build.mjs`，产物 `data/skills-data.json` + `prototype/out/index.html`。
- **发版步骤**：bump `package.json` version → 重跑 build → 同步 README 徽章/CHANGELOG → 打 tag `vX.Y.Z` 推送。
- **CI**：`.github/workflows/` 校验 `prototype/skills-data.json`（注：实际产物路径为仓库根 `data/skills-data.json`，CI 脚本应据此核对）。

---

## 6. 一致性红线（已落地）

1. `data/skills-data.json` 为构建产物，勿手改，重跑 `npm run build` 再生。
2. 设计令牌仅改 `tokens.css`，禁止在 `app.css`/`out/index.html` 散写颜色字面量（改后须 rebuild）。
3. README 中英文、CHANGELOG、package.json 版本号三者一致。
4. 技能 `category` 与 README 分类名严格一致。

---

## 7. 演进方式

- 任何对已落地能力的修改，先在 `changes/` 提案（参考 `AGENTS.md`），归档至 `archive/`。
- 本 spec 仅在能力真正落地/移除时更新，保持"当前真相"语义。
