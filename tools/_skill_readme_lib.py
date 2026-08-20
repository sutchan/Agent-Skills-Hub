# tools/_skill_readme_lib.py v1.12.0 — 纯函数/解析层（被 skills_readme.py 复用）
# 无副作用的解析与读取逻辑，便于单测与编排分离。
from __future__ import annotations

import os
import re

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
    "其他": "Other",
}

TOTAL_RE = re.compile(r"包含\s*(\d+)\s*个")
CATEGORY_RE = re.compile(r"^###\s+(.+?)（(\d+)）\s*$")
LINK_RE = re.compile(r"-\s+\*\*\[([^\]]+)\]\(([^)]+)\)\*\*")
DESC_FOLDED_RE = re.compile(
    r"description:\s*([>|-]?)\s*\n((?:[ \t]+.*\n?)*)")
DESC_PLAIN_RE = re.compile(r"description:\s*(.+)")


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
            # Identify skills by their link path (without trailing slash) so
            # display-name quirks (e.g. quoted "[...]") don't cause false drift.
            current["skills"].append(lm.group(2).rstrip("/"))
    return total, categories


def read_description(skill: str) -> str:
    """Extract and unfold the ``description`` frontmatter field of a skill."""
    path = os.path.join(SKILLS_DIR, skill, "SKILL.md")
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except FileNotFoundError:
        return ""
    m = DESC_FOLDED_RE.search(text)
    if m:
        lines = [ln.strip() for ln in m.group(2).splitlines() if ln.strip()]
        return " ".join(lines).strip()
    m = DESC_PLAIN_RE.search(text)
    if m:
        return m.group(1).strip().strip('"').strip("'")
    return ""
