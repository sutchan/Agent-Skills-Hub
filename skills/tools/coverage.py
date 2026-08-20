#!/usr/bin/env python3
# coverage.py — 统计 skills/*/SKILL.md 的中文（CJK）翻译覆盖情况
# 路径: tools/coverage.py 版本: 1.0.1

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILLS_DIR = os.path.join(ROOT, "skills")

# 正文 CJK 占比低于该值视为“未翻译（英文为主）”
DEFAULT_THRESHOLD = 0.05
CJK = re.compile(r"[\u4e00-\u9fff]")


def main():
    threshold = DEFAULT_THRESHOLD
    min_ratio = None
    args = sys.argv[1:]
    if "--threshold" in args:
        ti = args.index("--threshold")
        if ti + 1 >= len(args):
            sys.exit("错误：--threshold 需要跟一个数值参数")
        try:
            threshold = float(args[ti + 1])
        except ValueError:
            sys.exit(f"错误：--threshold 参数无效：{args[ti + 1]!r}")
    if "--min-translated-ratio" in args:
        min_ratio = float(args[args.index("--min-translated-ratio") + 1])

    rows = []
    for name in sorted(os.listdir(SKILLS_DIR)):
        d = os.path.join(SKILLS_DIR, name)
        md = os.path.join(d, "SKILL.md")
        if not os.path.isfile(md):
            continue
        with open(md, "r", encoding="utf-8") as f:
            text = f.read()
        m = re.match(r"^---\s*\n.*?\n---", text, re.DOTALL)
        if m:
            body = text[m.end():]
        else:
            # 无 frontmatter（如社区技能直接以正文开头）时，整篇视为正文参与 CJK 占比统计
            body = text
        cjk = len(CJK.findall(body))
        total = len(body)
        ratio = cjk / total if total else 0.0
        rows.append((name, cjk, total, ratio))

    total_n = len(rows)
    translated = [r for r in rows if r[3] >= threshold]
    untranslated = [r for r in rows if r[3] < threshold]

    print(f"技能总数: {total_n}")
    print(f"已翻译(中文占比≥{threshold}): {len(translated)}")
    print(f"未翻译(英文为主): {len(untranslated)}")
    print(f"翻译覆盖率: {len(translated) / total_n:.1%}")
    print("\n未翻译技能列表:")
    for r in untranslated:
        print(f"  - {r[0]} (中文占比 {r[3]:.1%})")

    if min_ratio is not None:
        actual = len(translated) / total_n
        if actual < min_ratio:
            print(f"\n[FAIL] 翻译覆盖率 {actual:.1%} 低于门槛 {min_ratio:.1%}")
            sys.exit(1)
        print(f"\n[OK] 翻译覆盖率 {actual:.1%} 达标 (门槛 {min_ratio:.1%})")


if __name__ == "__main__":
    main()
