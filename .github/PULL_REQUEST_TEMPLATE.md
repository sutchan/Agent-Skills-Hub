## 变更总结

<!-- 简要说明本次 PR 做了什么、为什么（动机）。 -->

## 变更类型

<!-- 在对应项勾选（提交信息需与 type 一致）。 -->

- [ ] feat: 新功能
- [ ] fix: 修复 bug
- [ ] docs: 文档更新
- [ ] style: 代码风格 / 格式
- [ ] refactor: 代码重构（无行为变化）
- [ ] test: 测试相关
- [ ] chore: 构建 / 依赖 / 配置
- [ ] perf: 性能优化
- [ ] ci: CI/CD 配置
- [ ] revert: 回滚

## 提交信息

<!-- 请提供一个符合 Conventional Commits 的提交信息示例：
     `<type>: <描述>`，如 `docs: 新增 .github Community Health Files`
     若涉及版本变更，请在正文/页脚标注新版本号。 -->

```
<type>: <描述>
```

## 一致性检查清单

- [ ] `npm run build` 已运行且通过；技能数据改动已手工更新 `data/skills-data.json`（非构建产物）并运行 `npm run sync:data`
- [ ] 涉及技能改动时，`SKILL.md` 前置元数据完整（name/description/zh_displayName/en_description/category/en_category）
- [ ] `en_description` 变更时已同步更新 `description` 中文译文
- [ ] README 中英文、CHANGELOG、package.json 版本号三者一致（含版本 bump）
- [ ] 全量版本展示位一致：docs/AGENTS.md·project.md·spec.md·tasks.md 头版本、prototype/DESIGN.md·COMPONENTS.md·IMPROVEMENT-SPEC.md 头版本、prototype/wireframes.html 页脚
- [ ] CHANGELOG 已新增对应版本小节，且有对应 release tag 锚点
- [ ] 涉及 UI 文案时 i18n 字典 zh/tw/en 三语键位齐全（简体中文 > 繁体中文 > 英语）
- [ ] 无 `console.log` / `debugger` 残留（脚本除外）
- [ ] 新文件头已标注路径与版本号

## 测试说明

<!-- 描述如何验证本次变更（构建、本地预览、手工用例等）。 -->

## 相关 Issue / PR

<!-- 引用相关 issue 或 PR，如 `Closes #123`。 -->
