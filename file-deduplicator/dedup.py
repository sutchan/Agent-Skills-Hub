#!/usr/bin/env python3
# path: ~/.codebuddy/skills/file-deduplicator/dedup.py
# version: 1.0.0
"""基于内容哈希的项目去重工具：检测重复/空/无效文件，安全清理。"""
import argparse
import hashlib
import os
import shutil
import sys

# 默认忽略的目录（与项目构建/依赖/工具缓存相关）
DEFAULT_IGNORE = {
    ".git", "node_modules", "dist", "build", ".next", "out", ".cache",
    ".codebuddy", ".agents", "vendor", "target", "__pycache__", ".venv",
    "venv", ".idea", ".vscode",
}


def file_hash(path: str, algo: str = "sha256", chunk: int = 1 << 20) -> str:
    """计算文件内容哈希。"""
    h = hashlib.new(algo)
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(chunk), b""):
            h.update(block)
    return h.hexdigest()


def scan(root: str, min_size: int, ignore: set, follow: bool):
    """遍历目录，返回 {hash: [(path, size), ...]} 与空文件列表。"""
    groups: dict[str, list[tuple[str, int]]] = {}
    empties: list[str] = []
    for dirpath, dirnames, filenames in os.walk(root, followlinks=follow):
        # 原地修剪忽略目录
        dirnames[:] = [d for d in dirnames if d not in ignore]
        for name in filenames:
            fp = os.path.join(dirpath, name)
            if not os.path.isfile(fp) or os.path.islink(fp) and not follow:
                continue
            try:
                size = os.path.getsize(fp)
            except OSError:
                continue
            if size == 0:
                empties.append(fp)
                continue
            if size < min_size:
                continue
            try:
                digest = file_hash(fp, algo=ARGS.hash)
            except OSError:
                continue
            groups.setdefault(digest, []).append((fp, size))
    return groups, empties


def human(num: int) -> str:
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if abs(num) < 1024:
            return f"{num:.1f}{unit}"
        num /= 1024
    return f"{num:.1f}PB"


def main():
    ap = argparse.ArgumentParser(description="项目文件去重/清理工具")
    ap.add_argument("--path", required=True, help="要扫描的目录")
    ap.add_argument("--min-size", type=int, default=1, help="忽略小于该字节的文件")
    ap.add_argument("--hash", default="sha256", help="哈希算法")
    ap.add_argument("--action", default="report",
                    choices=["report", "move", "delete"])
    ap.add_argument("--trash-dir", default="./.dedup-trash", help="move 回收目录")
    ap.add_argument("--ignore", default="", help="额外忽略目录名，逗号分隔")
    ap.add_argument("--follow-symlinks", action="store_true")
    global ARGS
    ARGS = ap.parse_args()

    root = os.path.abspath(ARGS.path)
    if not os.path.isdir(root):
        sys.exit(f"错误：目录不存在 -> {root}")

    ignore = DEFAULT_IGNORE | {x.strip() for x in ARGS.ignore.split(",") if x.strip()}
    groups, empties = scan(root, ARGS.min_size, ignore, ARGS.follow_symlinks)

    dup_groups = {h: v for h, v in groups.items() if len(v) > 1}
    total_dup_files = sum(len(v) - 1 for v in dup_groups.values())
    reclaimable = sum(v[0][1] * (len(v) - 1) for v in dup_groups.values())

    print(f"扫描目录: {root}")
    print(f"重复文件组: {len(dup_groups)} | 可清理副本数: {total_dup_files} | "
          f"可释放: {human(reclaimable)}")
    print(f"空文件(0字节): {len(empties)}")
    print("-" * 60)

    if ARGS.action == "move":
        os.makedirs(ARGS.trash_dir, exist_ok=True)

    for h, files in sorted(dup_groups.items(), key=lambda kv: -kv[1][0][1]):
        print(f"\n[{h[:12]}…] {len(files)} 个副本, 单文件 {human(files[0][1])}")
        keep = files[0][0]
        print(f"  保留: {keep}")
        for fp, _ in files[1:]:
            print(f"  副本: {fp}")
            if ARGS.action == "move":
                rel = os.path.relpath(fp, root)
                dest = os.path.join(ARGS.trash_dir, rel)
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                shutil.move(fp, dest)
                print(f"    -> 已移至 {dest}")
            elif ARGS.action == "delete":
                os.remove(fp)
                print(f"    -> 已删除")

    if empties:
        print("\n空文件(0字节):")
        for fp in empties:
            print(f"  {fp}")

    if ARGS.action == "report":
        print("\n(仅报告模式，未做任何修改。加 --action move/delete 执行清理)")


if __name__ == "__main__":
    main()
