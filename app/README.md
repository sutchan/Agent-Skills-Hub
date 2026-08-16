# app/ · 项目 Web 应用

> 路径：`app/` · 本目录为 **项目 Web 应用（WebApp）** 的专属工作区。

## 定位

- 本目录用于承载 Agent Skills Hub 的 **可运行 Web 应用**（Next.js / 其他前端框架源码）。
- 与 `prototype/` 区分：`prototype/` 仅保留**预构建静态 HTML 高保真原型**（展示交付物），而 `app/` 是**可构建、可开发的真实 Web 应用源码**。
- 数据源：以磁盘 `skills/<name>/SKILL.md` 为权威来源；构建期由根目录 `build-skills-data.mjs` 生成 `data/skills-data.json`（扁平结构：`name/category/zh/description/allowedTools`）供前端读取。

## 目录约定

| 路径 | 用途 |
|------|------|
| `app/` | Web 应用根目录（本目录），同时作为 Next.js App Router 根 |
| `app/page.tsx` / `app/layout.tsx` / `app/globals.css` | Next.js 应用入口（首页、根布局、全局样式） |
| `app/components/` | 客户端组件（`AppShell` / `SkillsExplorer` / `SkillDialog` / `useShare`） |
| `app/lib/` | 共享逻辑（`share.ts` 分享文案与复制、`skills.ts` 数据读取） |
| `app/next.config.mjs` / `app/tsconfig.json` | Next.js 与 TypeScript 配置 |
| `app/package.json` | 依赖与脚本（`dev` / `build` / `start`） |

## 约定

- 技能权威来源始终是 `skills/<name>/SKILL.md`，勿在应用中硬编码技能数据。
- 仓库内 Markdown 文档的技能链接使用相对路径 `skills/<name>/`。
- 跨域外链使用 `https://github.com/sutchan/Agent-Skills-Hub/tree/main/skills/<name>/`，由 `SkillDialog.tsx` 的 `REPO_SKILLS_TREE` 常量维护。

## 本地开发

```bash
cd app
npm install
npm run dev      # 本地开发服务器
npm run build    # 生产构建
```
