#!/usr/bin/env python3
# build_site.py — 解析 README.md 与 skills/*/SKILL.md，生成展示页数据 data/skills.json
# 路径: site/build_site.py 版本: 1.0.0

import json
import re
import os

# 仓库根目录（脚本位于 site/ 下，上级目录即仓库根）
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
README = os.path.join(ROOT, "README.md")
SKILLS_DIR = os.path.join(ROOT, "skills")
OUT = os.path.join(ROOT, "site", "data", "skills.json")


def parse_readme():
    """解析 README，返回 {分类名: [(名称, 中文描述), ...]} 与元信息。"""
    with open(README, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()

    # 元信息
    meta = {"title": "Skills 技能库", "author": "", "repo": "", "count": ""}
    for line in lines[:15]:
        m = re.search(r"技能数量.*?(\d+)", line)
        if m:
            meta["count"] = int(m.group(1))
        m = re.search(r"作者[：:]\s*(.+)", line)
        if m:
            meta["author"] = m.group(1).strip()
        m = re.search(r"项目地址[：:]\s*(\S+)", line)
        if m:
            meta["repo"] = m.group(1).strip()

    # 分类 + 条目
    categories = {}
    current_cat = None
    cat_order = []
    cat_re = re.compile(r"^###\s+(.+?)(?:（(\d+)）)?$")
    item_re = re.compile(r"^\s*-\s+\*\*\[([^\]]+)\]\(([^)]+)\)\*\*\s*[—-]\s*(.+)$")

    for line in lines:
        if re.match(r"^###\s", line) and not line.startswith("## "):
            name = cat_re.match(line).group(1).strip()
            if name in ("目录", "仓库结构"):
                current_cat = None
                continue
            current_cat = name
            if current_cat not in categories:
                categories[current_cat] = []
                cat_order.append(current_cat)
            continue
        if current_cat is None:
            continue
        im = item_re.match(line)
        if im:
            name = im.group(1).strip()
            desc = im.group(3).strip()
            desc = desc.rstrip("。 ")
            categories[current_cat].append((name, desc))

    return meta, categories, cat_order


def read_skill_meta(skill_dir):
    """读取 SKILL.md 的 frontmatter（name/description）。"""
    skill_path = os.path.join(SKILLS_DIR, skill_dir)
    if not os.path.isdir(skill_path):
        return None
    skill_md = os.path.join(skill_path, "SKILL.md")
    if not os.path.isfile(skill_md):
        return None
    with open(skill_md, "r", encoding="utf-8") as f:
        content = f.read()
    meta = {"en_name": skill_dir, "en_desc": "", "name": skill_dir}
    m = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if m:
        fm = m.group(1)
        for key in ("name", "description"):
            km = re.search(rf"^{key}:\s*(.+)$", fm, re.MULTILINE)
            if km:
                meta[key if key == "name" else "en_desc"] = km.group(1).strip()
    meta["has_scripts"] = os.path.isdir(os.path.join(skill_path, "scripts"))
    meta["has_references"] = os.path.isdir(os.path.join(skill_path, "references"))
    meta["has_assets"] = os.path.isdir(os.path.join(skill_path, "assets"))
    meta["dir"] = skill_dir
    return meta


def main():
    meta, categories, cat_order = parse_readme()
    skills = []
    seen = set()
    for cat in cat_order:
        for name, zh_desc in categories[cat]:
            if name in seen:
                continue
            seen.add(name)
            sm = read_skill_meta(name)
            if sm is None:
                sm = {
                    "en_name": name, "en_desc": "", "name": name,
                    "has_scripts": False, "has_references": False,
                    "has_assets": False, "dir": name,
                }
            sm["category"] = cat
            sm["zh_desc"] = zh_desc
            skills.append(sm)

    # 丢弃无技能条目的分类（如“使用方式”下的说明小节）
    cat_order = [c for c in cat_order if categories[c]]

    data = {
        "meta": {
            "title": "Skills 技能库",
            "subtitle": "面向开发、设计、测试、DevOps、Agent 工程及各行业领域的 AI 技能集合",
            "author": meta["author"],
            "repo": meta["repo"] or "https://github.com/sutchan/skills-chinese",
            "count": len(skills),
            "generated_at": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
        },
        "categories": [
            {"name": c, "count": len(categories[c])} for c in cat_order
        ],
        "skills": skills,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"已生成 {OUT}")
    print(f"技能总数: {len(skills)}  分类数: {len(cat_order)}")


if __name__ == "__main__":
    main()
