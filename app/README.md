# app/ · 项目 Web 应用

> 路径：`app/` · 本目录为 **项目 Web 应用（WebApp）** 的专属工作区。

## 定位

- 本目录用于承载 Agent Skills Hub 的 **可运行 Web 应用**（Next.js / 其他前端框架源码）。
- 与 `prototype/` 区分：`prototype/` 仅保留**预构建静态 HTML 高保真原型**（展示交付物），而 `app/` 是**可构建、可开发的真实 Web 应用源码**。
- 数据源：以磁盘 `skills/<name>/SKILL.md` 为权威来源；构建期生成技能数据（如 `skills.json`）供前端读取。

## 目录约定

| 路径 | 用途 |
|------|------|
| `app/` | Web 应用根目录（本目录） |
| `app/src` / `app/app` | 应用源码（页面、组件、库） |
| `app/public` | 静态资源（图标、字体等） |
| `app/package.json` | 依赖与脚本（`dev` / `build` / `start`） |

## 约定

- 技能权威来源始终是 `skills/<name>/SKILL.md`，勿在应用中硬编码技能数据。
- 仓库内 Markdown 文档的技能链接使用相对路径 `skills/<name>/`。
- 跨域外链使用 `{repo}/tree/main/{dir}`（repo 取自数据 `meta.repo`）。

## 本地开发

```bash
cd app
npm install
npm run dev      # 本地开发服务器
npm run build    # 生产构建
```
