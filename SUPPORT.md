# 获取支持（Support）

欢迎使用 **Agent Skills Hub**！如果你在使用过程中遇到问题或想参与贡献，可参考以下渠道。

## 我可以到哪里获得帮助？

| 渠道 | 适用场景 | 链接 |
|------|---------|------|
| GitHub Issues | 报告技能缺陷、数据不一致、文档错误 | [新建 Issue](https://github.com/sutchan/Agent-Skills-Hub/issues) |
| GitHub Discussions | 使用讨论、技能推荐、最佳实践交流 | [仓库 Discussions](https://github.com/sutchan/Agent-Skills-Hub/discussions) |
| 贡献指南 | 想新增/更新技能、提交 PR | [CONTRIBUTING.md](CONTRIBUTING.md) |
| 安全漏洞 | 私密报告安全问题（**勿公开 Issue**） | [SECURITY.md](SECURITY.md) |

## 常见问题（FAQ）

**Q：技能如何安装？**
A：推荐用 [skills-manager](https://github.com/xingkongliang/skills-manager) 一键安装；也可将 `skills/<name>/` 目录复制到你的 Agent 技能路径（详见 `README.md` 的「使用方式」）。

**Q：我想新增一个技能，该怎么做？**
A：使用仓库内置的 `skills/skill-creator/` 技能按规范创建，并确保 `README.md` / `README.en.md` 同步更新（可运行 `python tools/skills_readme.py verify` 校验）。详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

**Q：发现 `README` 与磁盘技能数量不一致？**
A：可运行 `python tools/skills_readme.py verify` 自检；通常由新增技能后未重新生成 `README.en.md` 或 `skills.json` 导致，CI 也会在 PR 中拦截。

**Q：技能正文为什么大多是英文？**
A：本仓库对技能做了「中文目录 + 中文描述」的本地化，但 `SKILL.md` 正文目前主要保留上游英文（少量已全文翻译）。翻译覆盖率由 CI 中的 `tools/coverage.py` 统计。

## 行为准则

参与本社区即表示你同意遵守 [行为准则](CODE_OF_CONDUCT.md)。

## 维护者

- 项目所有者：[@sutchan](https://github.com/sutchan)
- 仓库地址：https://github.com/sutchan/Agent-Skills-Hub
