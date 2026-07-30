---
name: file-deduplicator
description: 扫描项目目录，基于内容哈希找出重复文件，并检测空文件/无效文件，安全（默认 dry-run）地清理冗余。Use when the user wants to find/remove duplicate, redundant, or invalid files in a project.
user-invocable: true
---

# File Deduplicator

清理项目中的**重复 / 冗余 / 无效文件**。通过内容哈希（默认 SHA-256）识别内容完全相同的文件，
并检测空文件（0 字节）等无效文件。

## 安全原则

- **默认只报告，不删除**：任何删除动作都必须显式加 `--action delete` 或 `--action move`。
- **保留一份**：每个重复组只保留第一个文件，其余副本才被处理。
- **先 review 再执行**：先跑一次默认（dry-run）报告，确认无误后再执行删除/移动。

## 用法

脚本位于本技能目录下的 `dedup.mjs`，基于 Node.js（跨平台，需 Node 16+，无需额外依赖）。

```bash
# 1) 仅扫描并报告重复/空文件（默认行为，安全）
node "<skill_dir>/dedup.mjs" --path "<项目目录>"

# 2) 将重复副本移入回收目录（不真正删除，可恢复）
node "<skill_dir>/dedup.mjs" --path "<项目目录>" --action move --trash-dir "./.dedup-trash"

# 3) 真正删除重复副本（危险，请先确认报告）
node "<skill_dir>/dedup.mjs" --path "<项目目录>" --action delete
```

## 参数

| 参数 | 说明 | 默认 |
|------|------|------|
| `--path` | 要扫描的目录（必填） | - |
| `--min-size` | 忽略小于该字节数的文件 | `1`（忽略 0 字节空文件） |
| `--hash` | 哈希算法 | `sha256` |
| `--action` | `report`(默认) / `move` / `delete` | `report` |
| `--trash-dir` | move 模式下的回收目录 | `./.dedup-trash` |
| `--ignore` | 额外忽略的目录名（逗号分隔） | 见脚本内置列表 |
| `--follow-symlinks` | 跟踪符号链接 | 关闭 |

## 内置忽略目录

`.git` `node_modules` `dist` `build` `.next` `out` `.cache`
`.codebuddy` `.agents` `vendor` `target` `__pycache__` `.venv` `venv`

## 工作流程（建议）

1. 先用默认 `--action report` 生成清单，人工核对重复组是否合理。
2. 用 `--action move` 做一次软清理（可恢复），重新运行项目测试/构建确认无破坏。
3. 确认无误后，用 `--action delete` 永久删除；或直接删除 `.dedup-trash` 目录。

## 输出

- 重复组：列出每组哈希、文件数、可释放字节数、文件清单。
- 空文件：列出所有 0 字节文件，供判断是否为无效文件。
- 汇总：重复文件数、可释放总大小、空文件数。
