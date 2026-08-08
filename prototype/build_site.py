#!/usr/bin/env python3
# build_site.py — 读取 skills/*/SKILL.md 的 frontmatter 生成展示页数据 data/skills.json
# 路径: prototype/build_site.py 版本: 1.5.0
#
# 数据源策略：
#   主数据源为各技能 SKILL.md 的 frontmatter（name / description / category）。
#   仅当 SKILL.md 缺 category 时，回退到 README.md 的分类映射，保证兼容性。
#
# 用法：
#   python3 build_site.py            # 生成 data/skills.json
#   python3 build_site.py --check    # CI 校验：已提交的 JSON 是否与最新生成一致
#
# 注：本仓库同时提供 Node 移植版 build_site.mjs（逻辑 1:1 对齐），
#     供无 Python 环境使用；npm run build 默认调用 build_site.mjs。

import json
import os
import re
import sys

# 仓库根目录（脚本位于 prototype/ 下，上级目录即仓库根）
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
README = os.path.join(ROOT, "README.md")
SKILLS_DIR = os.path.join(ROOT, "skills")
OUT = os.path.join(ROOT, "prototype", "data", "skills.json")

# 仓库实际地址（兜底值，README 解析失败时使用）
DEFAULT_REPO = "https://github.com/sutchan/Agent-Skills-Hub"

# README 中定义的合法分类顺序（用于排序回退）
README_CAT_ORDER = []

# 分类中文名 -> 英文显示名（与展示页原型保持一致；新增分类时在此补充）
CAT_EN = {
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



def parse_readme_categories():
    """解析 README，返回 (分类顺序, 技能名->分类名, 技能名->中文描述)。"""
    cat_map = {}
    zh_desc_map = {}
    order = []
    cat_re = re.compile(r"^###\s+(.+?)(?:（(\d+)）)?$")
    item_re = re.compile(r"^\s*-\s+\*\*\[([^\]]+)\]\(([^)]+)\)\*\*\s*[—-]\s*(.+)$")
    current_cat = None
    with open(README, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()
    for line in lines:
        if re.match(r"^###\s", line) and not line.startswith("## "):
            m = cat_re.match(line)
            if not m:
                continue
            name = m.group(1).strip()
            if name in ("目录", "仓库结构"):
                current_cat = None
                continue
            current_cat = name
            if current_cat not in order:
                order.append(current_cat)
            continue
        if current_cat is None:
            continue
        im = item_re.match(line)
        if im:
            skill = im.group(1).strip()
            desc = im.group(3).strip().rstrip("。 ")
            cat_map[skill] = current_cat
            zh_desc_map[skill] = desc
    return order, cat_map, zh_desc_map


def read_skill_meta(skill_dir):
    """读取 SKILL.md 的 frontmatter（name/description/category）与资源目录标记。"""
    skill_path = os.path.join(SKILLS_DIR, skill_dir)
    if not os.path.isdir(skill_path):
        return None
    skill_md = os.path.join(skill_path, "SKILL.md")
    if not os.path.isfile(skill_md):
        return None
    with open(skill_md, "r", encoding="utf-8") as f:
        content = f.read()
    meta = {
        "en_name": skill_dir,
        "en_desc": "",
        "name": skill_dir,
        "category": "",
    }
    m = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if m:
        fm = m.group(1)
        for key in ("name", "description", "category"):
            km = re.search(rf"^{key}:\s*(.+)$", fm, re.MULTILINE)
            if km:
                val = km.group(1).strip()
                # 去除 YAML 标量常见引号包裹（"..." 或 '...'），避免 name 带引号进入数据
                if len(val) >= 2 and val[0] == val[-1] and val[0] in ("\"", "'"):
                    val = val[1:-1].strip()
                meta[key if key in ("name", "category") else "en_desc"] = val
    meta["has_scripts"] = os.path.isdir(os.path.join(skill_path, "scripts"))
    meta["has_references"] = os.path.isdir(os.path.join(skill_path, "references"))
    meta["has_assets"] = os.path.isdir(os.path.join(skill_path, "assets"))
    meta["dir"] = skill_dir
    return meta


def parse_readme_meta():
    """解析 README 顶部元信息（作者 / 仓库地址 / 总数）。"""
    meta = {"author": "", "repo": "", "count": ""}
    with open(README, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()
    for line in lines[:15]:
        m = re.search(r"作者[：:]\s*(.+)", line)
        if m:
            meta["author"] = m.group(1).strip()
        m = re.search(r"项目地址[：:]\s*(\S+)", line)
        if m:
            meta["repo"] = m.group(1).strip()
    return meta


def build_data():
    readme_meta = parse_readme_meta()
    readme_order, readme_cat_map, readme_zh_map = parse_readme_categories()

    skills = []
    seen = set()
    # 遍历磁盘上所有含 SKILL.md 的技能目录（单一数据源）
    for entry in sorted(os.listdir(SKILLS_DIR)):
        skill_path = os.path.join(SKILLS_DIR, entry)
        if not os.path.isdir(skill_path) or not os.path.isfile(
            os.path.join(skill_path, "SKILL.md")
        ):
            continue
        if entry in seen:
            continue
        seen.add(entry)
        sm = read_skill_meta(entry)
        if sm is None:
            continue
        # 分类优先取 SKILL.md frontmatter，缺失则回退 README 映射
        if not sm.get("category"):
            sm["category"] = readme_cat_map.get(entry, "其他")
        # 中文描述以 README 为准（已本地化），缺失则为空
        sm["zh_desc"] = readme_zh_map.get(entry, "")
        skills.append(sm)

    # 分类顺序：优先 README 顺序，再补齐 frontmatter 中出现但 README 未列的分类
    cat_counts = {}
    for s in skills:
        cat_counts[s["category"]] = cat_counts.get(s["category"], 0) + 1
    ordered_cats = [c for c in readme_order if c in cat_counts]
    for c in cat_counts:
        if c not in ordered_cats:
            ordered_cats.append(c)

    categories = [
        {"name": c, "en": CAT_EN.get(c, c), "count": cat_counts[c]}
        for c in ordered_cats
    ]

    data = {
        "meta": {
            "title": "Agent Skills Hub",
            "subtitle": "面向开发、设计、测试、DevOps、Agent 工程及各行业领域的 AI 技能集合",
            "author": readme_meta["author"],
            "repo": readme_meta["repo"] or DEFAULT_REPO,
            "count": len(skills),
            "generated_at": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
        },
        "categories": categories,
        "skills": skills,
    }
    return data


def main():
    check_mode = "--check" in sys.argv
    data = build_data()

    if check_mode:
        if not os.path.isfile(OUT):
            print("ERROR: 未找到已提交的 data/skills.json，请先运行 build_site.py 生成。")
            sys.exit(1)
        with open(OUT, "r", encoding="utf-8") as f:
            existing = json.load(f)
        # 仅比较结构性字段（忽略 generated_at 时间戳）
        def normalize(d):
            return {
                "meta": {k: v for k, v in d["meta"].items() if k != "generated_at"},
                "categories": d["categories"],
                "skills": d["skills"],
            }
        if normalize(existing) != normalize(data):
            print("ERROR: data/skills.json 与最新 skills/ 不一致，请运行 build_site.py 重新生成。")
            sys.exit(1)
        print(f"OK: data/skills.json 已是最新（{len(data['skills'])} 个技能，{len(data['categories'])} 个分类）。")
        return

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"已生成 {OUT}")
    print(f"技能总数: {len(data['skills'])}  分类数: {len(data['categories'])}")


if __name__ == "__main__":
    main()
