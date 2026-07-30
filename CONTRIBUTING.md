# 贡献指南

欢迎为 Skills 技能库贡献技能与改进！

## 新增技能

- 使用 [`skill-creator`](skills/skill-creator/) 技能按规范创建与评估。
- 技能目录命名使用小写中划线（`kebab-case`），如 `python-testing/`。
- 目录结构：

  ```
  <skill-name>/
  ├── SKILL.md          # 必须：name + description 前置元数据 + 使用说明
  ├── scripts/          # 可选：可执行脚本
  ├── references/       # 可选：参考文档
  ├── assets/           # 可选：模板/素材
  └── agents/           # 可选：子代理定义
  ```

- `SKILL.md` 的 `description` 应简洁明了，说明触发场景与能力边界。

## 更新技能

- 修改技能后，同步更新其 `SKILL.md` 的 `description`。
- 若影响分类或总数，请运行以下命令检查 README 是否同步：

  ```bash
  python tools/skills_readme.py verify
  ```

- 中文 README（`README.md`）与英文 README（`README.en.md`）需保持一致：
  修改技能后可重新生成英文版：

  ```bash
  python tools/skills_readme.py gen-en
  ```

- 通过校验后，在 `CHANGELOG.md` 追加变更记录（遵循 Keep a Changelog 与 SemVer）。

## 提交规范

- 提交信息遵循仓库规范：`type: 描述`（`feat` / `fix` / `docs` / ...）。
- 文档类变更为 patch 版本，新功能为 minor，破坏性变更为 major。

## 许可证

- 各技能许可证见其目录内 `LICENSE` 文件。
- 项目整体许可证见根目录 [`LICENSE`](LICENSE)。
