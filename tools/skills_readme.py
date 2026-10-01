#!/usr/bin/env python3
"""Sync & verify the Skills README index with the ``skills/`` directory.

Subcommands
-----------
verify   Check that ``README.md`` is consistent with ``skills/``
         (total count, per-category counts, missing/extra/duplicate entries).
gen-en   (Re)generate ``README.en.md`` from each skill's ``SKILL.md``
         ``description`` while keeping the category structure from ``README.md``.

The script is dependency-free (standard library only) so it runs in CI
without installing anything.

解析/读取纯函数见同目录 _skill_readme_lib.py（便于单测与职责分离）。
"""
from __future__ import annotations

import argparse
import sys

from _skill_readme_lib import (
    CATEGORY_EN,
    README_EN,
    list_skill_dirs,
    parse_readme,
    read_description,
)


def verify() -> int:
    actual = set(list_skill_dirs())
    total, categories = parse_readme()
    errors: list[str] = []

    if total is not None and total != len(actual):
        errors.append(f"总数不符: README 声明 {total}，实际 {len(actual)}")

    listed: list[str] = []
    for c in categories:
        if len(c["skills"]) != c["count"]:
            errors.append(
                f"分类「{c['name']}」计数不符: 声明 {c['count']}，列出 {len(c['skills'])}")
        listed.extend(c["skills"])

    counts: dict[str, int] = {}
    for s in listed:
        counts[s] = counts.get(s, 0) + 1
    for s, n in counts.items():
        if n > 1:
            errors.append(f"技能重复列出: {s} ({n} 次)")

    listed_set = set(counts)
    for s in sorted(actual - listed_set):
        errors.append(f"README 缺失技能: {s}")
    for s in sorted(listed_set - actual):
        errors.append(f"README 多余技能(目录不存在): {s}")

    if errors:
        print("❌ README 与 skills/ 不一致:")
        for e in errors:
            print("  - " + e)
        return 1
    print(f"✅ README 与 skills/ 一致，共 {len(actual)} 个技能。")
    return 0


def gen_en() -> int:
    _, categories = parse_readme()
    lines: list[str] = []
    lines.append("# Skills")
    lines.append("")
    lines.append("[![Skills](https://img.shields.io/badge/skills-"
                 f"{len(list_skill_dirs())}-blue)](README.en.md) "
                 "[![License](https://img.shields.io/badge/license-see%20LICENSE-blue)](LICENSE) "
                 "[![中文文档](https://img.shields.io/badge/docs-中文-blue)](README.md)")
    lines.append("")
    lines.append("> Author: Sut Chan")
    lines.append(">")
    lines.append("> Repository: https://github.com/sutchan/Agent-Skills-Hub")
    lines.append(">")
    lines.append("> A centrally managed collection of AI skills, containing "
                 f"{len(list_skill_dirs())} skill packs for development, design, "
                 "testing, DevOps, agent engineering, and industry domains.")
    lines.append("")
    lines.append("Each skill is a standalone directory containing `SKILL.md` "
                 "(name + description metadata + usage notes) plus optional "
                 "`scripts/`, `references/`, `assets/`, `agents/`.")
    lines.append("")
    lines.append("## Table of Contents")
    lines.append("")
    lines.append("- [Repository Structure](#repository-structure)")
    lines.append("- [Skill Categories](#skill-categories)")
    lines.append("- [Usage](#usage)")
    lines.append("- [Contributing](#contributing)")
    lines.append("- [License](#license)")
    lines.append("- [Related Documents](#related-documents)")
    lines.append("")
    lines.append("## Repository Structure")
    lines.append("")
    lines.append("```")
    lines.append("<skill-name>/")
    lines.append("├── SKILL.md          # entry: name + description metadata + notes")
    lines.append("├── scripts/          # optional: executables")
    lines.append("├── references/       # optional: reference docs")
    lines.append("├── assets/           # optional: templates/assets")
    lines.append("└── agents/           # optional: sub-agent definitions")
    lines.append("```")
    lines.append("")
    lines.append("## Skill Categories")
    lines.append("")

    for c in categories:
        en_name = CATEGORY_EN.get(c["name"], c["name"])
        lines.append(f"### {en_name} ({len(c['skills'])})")
        lines.append("")
        for skill in c["skills"]:
            desc = read_description(skill)
            if len(desc) > 220:
                desc = desc[:217].rstrip() + "…"
            lines.append(f"- **[{skill}](skills/{skill}/)** — {desc}")
        lines.append("")

    lines.append("## Usage")
    lines.append("")
    lines.append("1. Copy the needed skill directory into your agent's skills "
                 "path (e.g. Claude Code / CodeBuddy `skills/`).")
    lines.append("2. Skills are auto-triggered via the `description` field in "
                 "`SKILL.md`, or invoked explicitly with `@skill-name`.")
    lines.append("3. Some skills depend on scripts or external tools — read the "
                 "skill's `SKILL.md` before use.")
    lines.append("")
    lines.append("### Finding a skill")
    lines.append("")
    lines.append("List all skills:")
    lines.append("")
    lines.append("```bash")
    lines.append("ls skills/")
    lines.append("```")
    lines.append("")
    lines.append("Search skills by keyword (e.g. \"test\"):")
    lines.append("")
    lines.append("```bash")
    lines.append('grep -rl "test" skills/*/SKILL.md')
    lines.append("```")
    lines.append("")
    lines.append("## Contributing")
    lines.append("")
    lines.append("See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add or update "
                 "skills, and keep `README.md` / `README.en.md` in sync.")
    lines.append("")
    lines.append("## License")
    lines.append("")
    lines.append("Per-skill licenses are in each directory's `LICENSE` file "
                 "(e.g. [skill-creator/LICENSE.txt](skill-creator/LICENSE.txt)).")
    lines.append("")
    lines.append("## Related Documents")
    lines.append("")
    lines.append("- [Changelog](CHANGELOG.md) — version & change history")
    lines.append("- [License](LICENSE) — project license")
    lines.append("- [中文文档](README.md) — Chinese README")
    lines.append("- [Workspace](agent-skills-hub.code-workspace) — workspace config")
    lines.append("")

    with open(README_EN, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))
    print(f"✅ 已生成 {README_EN}（{len(list_skill_dirs())} 个技能）。")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", nargs="?", default="verify",
                        choices=["verify", "gen-en"],
                        help="verify (default) or gen-en")
    args = parser.parse_args()
    if args.command == "verify":
        return verify()
    if args.command == "gen-en":
        return gen_en()
    return 2


if __name__ == "__main__":
    sys.exit(main())
