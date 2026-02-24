#!/usr/bin/env python3
"""Interactive comment reviewer.

Usage:
  python scripts/comment_reviewer.py src
  python scripts/comment_reviewer.py src scripts --ext .ts .vue .js .py

Behavior:
- Detects comment lines in supported text files.
- Prompts decision per comment: 1 = delete, 0 = keep.
- Writes changes immediately after each delete decision.
"""

from __future__ import annotations

import argparse
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

DEFAULT_EXTENSIONS = {
    ".py",
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".vue",
    ".java",
    ".c",
    ".cc",
    ".cpp",
    ".h",
    ".hpp",
    ".go",
    ".rs",
    ".php",
    ".css",
    ".scss",
    ".html",
    ".xml",
    ".yml",
    ".yaml",
    ".sh",
}

@dataclass
class CommentHit:
    file_path: Path
    line_idx: int
    original_line: str


@dataclass
class FileChange:
    path: Path
    lines: list[str]
    removed_line_indexes: set[int]


def should_skip_dir(dir_name: str) -> bool:
    return dir_name in {
        ".git",
        "node_modules",
        "dist",
        "build",
        "coverage",
        "__pycache__",
        ".idea",
        ".vscode",
    }


def iter_files(paths: Iterable[Path], allowed_exts: set[str]) -> Iterable[Path]:
    for base in paths:
        if not base.exists():
            continue
        if base.is_file():
            if base.suffix.lower() in allowed_exts:
                yield base
            continue
        for root, dirs, files in os.walk(base):
            dirs[:] = [d for d in dirs if not should_skip_dir(d)]
            root_path = Path(root)
            for name in files:
                fp = root_path / name
                if fp.suffix.lower() in allowed_exts:
                    yield fp


def single_line_prefixes_for_file(file_path: Path) -> tuple[str, ...]:
    suffix = file_path.suffix.lower()

    hash_exts = {
        ".py",
        ".sh",
        ".yml",
        ".yaml",
        ".toml",
        ".rb",
        ".pl",
        ".ps1",
        ".conf",
    }
    slash_exts = {
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".vue",
        ".java",
        ".c",
        ".cc",
        ".cpp",
        ".h",
        ".hpp",
        ".go",
        ".rs",
        ".php",
        ".css",
        ".scss",
        ".html",
        ".xml",
    }
    dash_exts = {".sql", ".lua"}
    semicolon_exts = {".ini", ".cfg", ".properties"}

    prefixes: list[str] = []
    if suffix in hash_exts:
        prefixes.append("#")
    if suffix in slash_exts:
        prefixes.append("//")
    if suffix in dash_exts:
        prefixes.append("--")
    if suffix in semicolon_exts:
        prefixes.append(";")
    return tuple(prefixes)


def is_comment_line(line: str, in_block: bool, single_line_prefixes: tuple[str, ...]) -> tuple[bool, bool]:
    stripped = line.lstrip()

    if in_block:
        if "*/" in stripped or "-->" in stripped:
            return True, False
        return True, True

    if not stripped:
        return False, False

    if single_line_prefixes and stripped.startswith(single_line_prefixes):
        return True, False

    if stripped.startswith("/*"):
        return True, "*/" not in stripped

    if stripped.startswith("<!--"):
        return True, "-->" not in stripped

    return False, False


def find_comment_hits(file_path: Path) -> list[CommentHit]:
    try:
        content = file_path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return []

    lines = content.splitlines(keepends=True)
    hits: list[CommentHit] = []
    in_block = False
    single_line_prefixes = single_line_prefixes_for_file(file_path)

    for idx, line in enumerate(lines):
        is_comment, in_block = is_comment_line(line, in_block, single_line_prefixes)
        if is_comment:
            hits.append(CommentHit(file_path=file_path, line_idx=idx, original_line=line))

    return hits


def show_context(lines: list[str], target_idx: int, context: int) -> None:
    start = max(0, target_idx - context)
    end = min(len(lines), target_idx + context + 1)
    for idx in range(start, end):
        marker = ">" if idx == target_idx else " "
        line_text = lines[idx].rstrip("\n")
        print(f"{marker} {idx + 1:4d} | {line_text}")


def format_progress(reviewed: int, total: int) -> str:
    if total <= 0:
        return "（0/0 剩余）- 100%"
    remaining = max(total - reviewed, 0)
    percent = (reviewed / total) * 100
    return f"（{remaining}/{total} 剩余）- {percent:.1f}%"


def print_report(status: str, reviewed: int, total: int, removed: int, updated_files_count: int) -> None:
    kept = max(reviewed - removed, 0)
    remaining = max(total - reviewed, 0)
    percent = (reviewed / total * 100) if total > 0 else 100.0
    print("")
    print("审核报告")
    print(f"- 状态: {status}")
    print(f"- 进度: {reviewed}/{total} ({percent:.1f}%)")
    print(f"- 清除: {removed}")
    print(f"- 保留: {kept}")
    print(f"- 剩余: {remaining}")
    print(f"- 更新文件: {updated_files_count}")


def prompt_decision(hit: CommentHit, lines: list[str], context: int, progress_text: str) -> str:
    jump_target = f"{hit.file_path}:{hit.line_idx + 1}"
    print(f"\n位置: {jump_target}")
    show_context(lines, hit.line_idx, context)
    while True:
        try:
            value = input(f"{progress_text} | 操作? 1=清除, 0=保留, q=退出: ").strip().lower()
        except (KeyboardInterrupt, EOFError):
            return "interrupt"
        if value in {"1", "0", "q"}:
            return value
        print("请输入 1 / 0 / q")


def build_changes(comment_hits: list[CommentHit]) -> dict[Path, FileChange]:
    changes: dict[Path, FileChange] = {}

    for hit in comment_hits:
        if hit.file_path in changes:
            continue
        try:
            text = hit.file_path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        changes[hit.file_path] = FileChange(path=hit.file_path, lines=text.splitlines(keepends=True), removed_line_indexes=set())

    return changes


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="识别注释并审核：1=清除，0=保留")
    parser.add_argument("paths", nargs="+", help="要扫描的文件或目录")
    parser.add_argument(
        "--ext",
        nargs="*",
        default=sorted(DEFAULT_EXTENSIONS),
        help="要扫描的扩展名，例如: --ext .py .ts .vue",
    )
    parser.add_argument(
        "--context",
        type=int,
        default=1,
        help="每条注释显示前后多少行上下文，默认 1",
    )
    return parser.parse_args()


def normalize_exts(exts: list[str]) -> set[str]:
    result = set()
    for ext in exts:
        ext = ext.strip().lower()
        if not ext:
            continue
        if not ext.startswith("."):
            ext = "." + ext
        result.add(ext)
    return result or set(DEFAULT_EXTENSIONS)


def main() -> int:
    args = parse_args()
    if args.context < 0:
        print("--context 不能小于 0")
        return 2

    allowed_exts = normalize_exts(args.ext)
    base_paths = [Path(p).resolve() for p in args.paths]

    all_hits: list[CommentHit] = []
    for fp in iter_files(base_paths, allowed_exts):
        all_hits.extend(find_comment_hits(fp))

    if not all_hits:
        print("没有找到注释。")
        return 0

    print(f"共找到 {len(all_hits)} 条注释，开始审核。")

    changes = build_changes(all_hits)
    reviewed = 0
    removed = 0
    updated_files: set[Path] = set()
    removed_offsets: dict[Path, int] = {}

    for hit in all_hits:
        file_change = changes.get(hit.file_path)
        if file_change is None:
            continue

        offset = removed_offsets.get(hit.file_path, 0)
        current_idx = hit.line_idx - offset
        if current_idx < 0 or current_idx >= len(file_change.lines):
            continue

        progress_text = format_progress(reviewed, len(all_hits))
        decision = prompt_decision(
            CommentHit(file_path=hit.file_path, line_idx=current_idx, original_line=file_change.lines[current_idx]),
            file_change.lines,
            args.context,
            progress_text,
        )
        if decision == "interrupt":
            print_report("中断退出 (Ctrl+C / EOF)", reviewed, len(all_hits), removed, len(updated_files))
            return 130
        if decision == "q":
            print_report("用户退出 (q)", reviewed, len(all_hits), removed, len(updated_files))
            return 1
        reviewed += 1
        if decision == "1":
            del file_change.lines[current_idx]
            file_change.path.write_text("".join(file_change.lines), encoding="utf-8")
            removed_offsets[hit.file_path] = offset + 1
            updated_files.add(hit.file_path)
            removed += 1

    print_report("已完成", reviewed, len(all_hits), removed, len(updated_files))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
