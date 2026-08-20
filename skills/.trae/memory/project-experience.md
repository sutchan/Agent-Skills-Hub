---
alwaysApply: false
scene: project_experience
title: Agent-Skills-Hub 文档与版本同步经验
updated: 2026-08-17
---

# Agent-Skills-Hub 项目经验（文档 / 版本同步）

> 适用：本项目（sutchan/Agent-Skills-Hub）的文档维护与版本管理。

## 1. 版本权威源
- **权威源 = `package.json` 的 `version`**（截至 2026-08-17 为 **v1.14.24**）。
- 用户会高频自行 bump 版本，README 中英文版本徽章经常滞后于真实版本。
- 文档同步时以 `package.json` 为准把 README 徽章对齐，**禁止**按旧会话记忆里的 v1.13.x / 早前 v1.14.x 盲写。
- `CHANGELOG.md` 顶部 `## [x.y.z]` 必须与 `package.json` 一致。

## 2. Community Health Files 位置
- 已统一迁移到 **`.github/`**：`CODE_OF_CONDUCT.md` / `SECURITY.md` / `SUPPORT.md` / `CONTRIBUTING.md`。
- `README.md` 与 `README.en.md` 的"相关文档"链接须指向 `.github/` 路径（如 `.github/CONTRIBUTING.md`）。
- `.github/CONTRIBUTING.md` 内引用根目录 LICENSE 用 `../LICENSE`。

## 3. CHANGELOG 历史腐化（已知技术债）
- **重复小节**：`1.9.0` / `1.9.1` / `1.10.0` / `1.13.0` / `1.13.1` 各出现两次，`1.0.3` 重复——勿在补文档时误删，去重风险高。
- **release 锚点大量缺失**：仅有 `1.0.0~1.0.4`、`1.9.0`、`1.9.1`、`1.10.0`、`1.13.0` 有 `[x.y.z]:` 定义，其余版本标题为死链。
- 补全锚点格式：
  `[x.y.z]: https://github.com/sutchan/Agent-Skills-Hub/releases/tag/vX.Y.Z`

## 4. skills 数量脱节
- 磁盘 `skills/` 目录实有 **204** 个，但 README 顶部与分类明细自洽声明为 **200**
  （分类求和：15+43+4+20+20+11+8+14+7+14+20+14+10 = 200）。
- 重算须用 `tools/skills_readme.py`（`verify` / `gen-en`），**勿手改总数**以免与分类明细矛盾。

## 5. 提交建议
- `git status` 常显示源码（`prototype/src/*`、`app/globals.css`、`app/package.json`）
  与文档改动混在同一未提交集；文档同步与源码改动**分开提交**更清晰可追溯。

## 6. 主色调（既有事实）
- prototype 主色为绿色（v1.13.1 由紫改绿并降饱和）：浅色 `--primary:#2e9e6b`、深色 `--primary:#5cc98c`，
  设计令牌唯一来源 `prototype/src/styles/tokens.css`，构建 `node prototype/build.mjs` 生成自包含 `prototype/out/index.html`。
- `skills/` 下紫色为独立语义内容（库常量/主题定义/反模式示例），不随项目主色改动。
