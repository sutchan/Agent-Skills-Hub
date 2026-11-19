# 获取支持

> 路径：`.github/SUPPORT.md` · 版本：1.16.25
> 项目地址：https://github.com/sutchan/Agent-Skills-Hub

需要帮助？这里按问题类型指引你到正确的渠道，以最快获得响应。

## 使用本项目遇到问题

先自查：

- 阅读 [`README.md`](../README.md) 的「快速开始」与「本地预览」。
- 打开站点本体 [`src/index.html`](../src/index.html)（或本地 `npm run dev` 预览）浏览全部技能与说明。
- 阅读对应技能目录的 `SKILL.md`，确认依赖（`scripts/`、外部工具）已满足。

若仍未解决，请到 [GitHub Discussions](https://github.com/sutchan/Agent-Skills-Hub/discussions) 提问，或按 [Issue 模板](../.github/ISSUE_TEMPLATE/) 提交 issue。

## 报告 Bug / 请求功能

- **Bug**：使用 [Bug Report 模板](../.github/ISSUE_TEMPLATE/bug_report.yml) 提交，尽量包含复现步骤、期望/实际结果、环境信息。
- **功能建议**：使用 [Feature Request 模板](../.github/ISSUE_TEMPLATE/feature_request.yml) 提交，说明动机与预期收益。

## 安全漏洞

**请勿公开报告安全漏洞。** 一律通过私密渠道：

- GitHub Security Advisory（仓库 → `Security` → `Report a vulnerability`）
- 详见 [SECURITY.md](SECURITY.md)

## 常见问题（FAQ）

**Q：如何一键安装多个技能？**
A：推荐使用 [skills-manager](https://github.com/xingkongliang/skills-manager) 批量安装/更新/卸载，见 [`README.md`](../README.md)「安装方式」。

**Q：新增一个技能需要改什么？**
A：见 [CONTRIBUTING.md](CONTRIBUTING.md)「新增或更新技能」，重点是 `SKILL.md` 的前置元数据，并运行 `npm run sync:data` 同步内联数据。

**Q：`data/skills-data.json` 能手改吗？**
A：可以，它是**手工维护**的权威数据（非构建产物）：直接编辑后运行 `npm run sync:data` 同步 `src/index.html` 内联数据即可。

**Q：项目使用什么许可证？**
A：仓库整体使用 [MIT](../LICENSE)；各技能目录可能带各自 `LICENSE`，请分别查看。

## 参与贡献

欢迎提交 PR 或 Issue。请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 与 [行为准则](CODE_OF_CONDUCT.md)。
