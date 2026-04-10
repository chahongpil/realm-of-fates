"""Phase 0: Static extraction of Game object top-level keys from index.html.

This mimics `Object.keys(Game).sort()` without running JS. Used as a baseline
for Phase 4 comparison. Not 100% accurate (strings/comments/nested objects
may confuse heuristics), but close enough for a reference snapshot.
"""
import re
import sys
from pathlib import Path


def main():
    index_path = Path(__file__).parent.parent / "index.html"
    content = index_path.read_text(encoding="utf-8")
    lines = content.split("\n")

    start_line = None
    for i, line in enumerate(lines):
        if re.match(r"^\s*const\s+Game\s*=\s*\{", line):
            start_line = i
            break
    if start_line is None:
        print("ERROR: 'const Game={' not found", file=sys.stderr)
        sys.exit(1)

    # First pass: find matching closing brace (end of Game block)
    depth = 0
    end_line = None
    for i in range(start_line, len(lines)):
        line = lines[i]
        j = 0
        while j < len(line):
            ch = line[j]
            # String literals (', ", `)
            if ch in ("'", '"', "`"):
                quote = ch
                j += 1
                while j < len(line):
                    if line[j] == "\\":
                        j += 2
                        continue
                    if line[j] == quote:
                        j += 1
                        break
                    j += 1
                continue
            # Line comment
            if ch == "/" and j + 1 < len(line) and line[j + 1] == "/":
                break
            # Block comment (single-line only)
            if ch == "/" and j + 1 < len(line) and line[j + 1] == "*":
                end = line.find("*/", j + 2)
                if end == -1:
                    j = len(line)
                else:
                    j = end + 2
                continue
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end_line = i
                    break
            j += 1
        if end_line is not None:
            break

    if end_line is None:
        print("ERROR: end of Game block not found", file=sys.stderr)
        sys.exit(1)

    print(f"# Game block: lines {start_line + 1}-{end_line + 1}")

    # Second pass: collect identifiers at depth == 1 followed by : or (
    depth = 0
    keys = []
    for i in range(start_line, end_line + 1):
        line = lines[i]
        j = 0
        while j < len(line):
            ch = line[j]
            if ch in ("'", '"', "`"):
                quote = ch
                j += 1
                while j < len(line):
                    if line[j] == "\\":
                        j += 2
                        continue
                    if line[j] == quote:
                        j += 1
                        break
                    j += 1
                continue
            if ch == "/" and j + 1 < len(line) and line[j + 1] == "/":
                break
            if ch == "/" and j + 1 < len(line) and line[j + 1] == "*":
                end = line.find("*/", j + 2)
                if end == -1:
                    j = len(line)
                else:
                    j = end + 2
                continue
            if ch == "{":
                depth += 1
                j += 1
                continue
            if ch == "}":
                depth -= 1
                j += 1
                continue
            if depth == 1 and (ch.isalpha() or ch == "_" or ch == "$"):
                m = re.match(r"[A-Za-z_$][A-Za-z0-9_$]*", line[j:])
                if m:
                    name = m.group(0)
                    after = j + len(name)
                    k = after
                    while k < len(line) and line[k] in " \t":
                        k += 1
                    if k < len(line) and line[k] in (":", "("):
                        keys.append(name)
                    j = after
                    continue
            j += 1

    unique = sorted(set(keys))
    print(f"# Found {len(unique)} top-level keys")
    for k in unique:
        print(k)


if __name__ == "__main__":
    main()
