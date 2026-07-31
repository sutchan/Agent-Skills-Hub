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
"""
from __future__ import annotations

import argparse
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS_DIR = os.path.join(ROOT, "skills")
README = os.path.join(ROOT, "README.md")
README_EN = os.path.join(ROOT, "README.en.md")

CATEGORY_EN = {
    "前端与 UI 设计": "Frontend & UI Design",
    "后端、语言与框架": "Backend, Languages & Frameworks",
    "架构与设计": "Architecture & Design",
    "测试与质量": "Testing & Quality",
    "Agent 与 AI 工程": "Agent & AI Engineering",
    "DevOps 与基础设施": "DevOps & Infrastructure",
    "数据与机器学习": "Data & Machine Learning",
    "内容、文档与写作": "Content, Docs & Writing",
    "视频与媒体": "Video & Media",
    "行业领域": "Industry Domains",
    "生产力与工具": "Productivity & Tools",
    "上下文与提示工程": "Context & Prompt Engineering",
    "其他": "Others",
}

TOTAL_RE = re.compile(r"包含\s*(\d+)\s*个")
CATEGORY_RE = re.compile(r"^###\s+(.+?)（(\d+)）\s*$")
LINK_RE = re.compile(r"-\s+\*\*\[([^\]]+)\]\(([^)]+)\)\*\*")


def read_description(skill: str) -> str:
    """Extract and unfold the ``description`` frontmatter field of a skill."""
    path = os.path.join(SKILLS_DIR, skill, "SKILL.md")
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except FileNotFoundError:
        return ""
    # Match the YAML frontmatter block (between the first pair of `---`).
    fm = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    block = fm.group(1) if fm else text
    # Strip any leading indentation (common in nested YAML) per line.
    block_lines = [ln.lstrip() for ln in block.splitlines()]
    block = "\n".join(block_lines)
    # Block scalar: description: |  /  >  /  |-  /  >-  (possibly indented).
    m = re.search(
        r"^description:\s*[-|>]+\s*$\n((?:[ \t]+.*\n?)*)",
        block, re.MULTILINE)
    if m:
        body = m.group(1)
        # Drop the YAML indentation block indicator footprint and join lines.
        lines = [ln.strip() for ln in body.splitlines() if ln.strip()]
        desc = " ".join(lines).strip()
        desc = desc.replace("|-", "").replace(">-", "").strip()
        if desc:
            return desc
    # Plain scalar (quoted or bare), possibly multi-line folded onto one line.
    m = re.search(r"^description:\s*(.+)$", block, re.MULTILINE)
    if m:
        return m.group(1).strip().strip('"').strip("'").strip()
    return ""


def list_skill_dirs() -> list[str]:
    """Return sorted skill directory names that contain a ``SKILL.md``."""
    names = []
    for name in os.listdir(SKILLS_DIR):
        path = os.path.join(SKILLS_DIR, name)
        if os.path.isdir(path) and os.path.exists(os.path.join(path, "SKILL.md")):
            names.append(name)
    return sorted(names)


def parse_readme() -> tuple[int | None, list[dict]]:
    """Parse README: total count + list of categories with declared count/entries."""
    with open(README, encoding="utf-8") as fh:
        text = fh.read()
    total = None
    m = TOTAL_RE.search(text)
    if m:
        total = int(m.group(1))
    categories: list[dict] = []
    current: dict | None = None
    in_section = False
    for line in text.splitlines():
        if line.startswith("## 技能分类"):
            in_section = True
            continue
        if in_section and line.startswith("## "):
            break
        if not in_section:
            continue
        cm = CATEGORY_RE.match(line)
        if cm:
            current = {"name": cm.group(1), "count": int(cm.group(2)), "skills": []}
            categories.append(current)
            continue
        lm = LINK_RE.match(line)
        if lm and current is not None:
            # Identify skills by their directory name (last path segment,
            # without trailing slash) so the "skills/" prefix doesn't cause
            # false drift against list_skill_dirs().
            current["skills"].append(lm.group(2).rstrip("/").split("/")[-1])
    return total, categories


def read_description(skill: str) -> str:
    """Extract and unfold the ``description`` frontmatter field of a skill."""
    path = os.path.join(SKILLS_DIR, skill, "SKILL.md")
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except FileNotFoundError:
        return ""
    # Match the YAML frontmatter block (between the first pair of `---`).
    fm = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    block = fm.group(1) if fm else text
    # Block scalar: description: |  /  >  /  |-  /  >-  followed by indented lines.
    m = re.search(
        r"^description:\s*[-|>]+\s*$\n((?:[ \t]+.*(?:\n|$))*)",
        block, re.MULTILINE)
    if m:
        body = m.group(1)
        lines = [ln.strip() for ln in body.splitlines() if ln.strip()]
        desc = " ".join(lines).strip()
        if desc:
            return desc
    # Plain scalar (quoted or bare), single line (no following indented block).
    m = re.search(r"^description:\s*(\S.*)$", block, re.MULTILINE)
    if m:
        return m.group(1).strip().strip('"').strip("'").strip()
    return ""


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
    lines.append("> Note: This repo localizes skills with Chinese categories and "
                 "Chinese descriptions. Skills whose body is already English keep "
                 "their English `SKILL.md`; a few Chinese-only skills keep Chinese "
                 "descriptions here. Translation coverage is tracked by "
                 "`tools/coverage.py` in CI.")
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
    lines.append("### Install & manage with skills-manager")
    lines.append("")
    lines.append("We recommend [skills-manager](https://github.com/xingkongliang/"
                 "skills-manager) for batch install/update/uninstall of skills, "
                 "avoiding manual directory copying.")
    lines.append("")
    lines.append("```bash")
    lines.append("git clone https://github.com/sutchan/Agent-Skills-Hub.git")
    lines.append("# import/link skills from skills/ into your agent via skills-manager")
    lines.append("```")
    lines.append("")
    lines.append("See the [skills-manager docs](https://github.com/xingkongliang/"
                 "skills-manager) for commands and configuration.")
    lines.append("")
    lines.append("### Online showcase")
    lines.append("")
    lines.append("The repo ships a standalone static [Next.js](site/) showcase "
                 "(`output: export`) deployable to EdgeOne / object storage for "
                 "browsing all skills online.")
    lines.append("")
    lines.append("```bash")
    lines.append("cd site")
    lines.append("npm install")
    lines.append("npm run dev      # http://localhost:3000")
    lines.append("npm run build    # output to site/out/")
    lines.append("python build_site.py   # regenerate data after editing skills")
    lines.append("```")
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
    lines.append("- [Contributing](CONTRIBUTING.md) — how to add/update skills")
    lines.append("- [License](LICENSE) — project license")
    lines.append("- [中文文档](README.md) — Chinese README")
    lines.append("- [Workspace](agent-skills-hub.code-workspace) — workspace config")
    lines.append("- Repository: https://github.com/sutchan/Agent-Skills-Hub")
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
