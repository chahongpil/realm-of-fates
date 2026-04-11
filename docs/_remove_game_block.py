"""Remove const Game={...}; block from index.html (Phase 4)."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
INDEX = ROOT / "index.html"


def main():
    text = INDEX.read_text(encoding="utf-8")
    lines = text.split("\n")

    start = None
    for i, line in enumerate(lines):
        if re.match(r"^\s*const\s+Game\s*=\s*\{", line):
            start = i
            break
    if start is None:
        sys.exit("ERROR: const Game={ not found")

    # Brace walker (string/comment aware)
    depth = 0
    end = None
    for i in range(start, len(lines)):
        line = lines[i]
        j = 0
        while j < len(line):
            ch = line[j]
            if ch in ("'", '"', "`"):
                q = ch
                j += 1
                while j < len(line):
                    if line[j] == "\\":
                        j += 2
                        continue
                    if line[j] == q:
                        j += 1
                        break
                    j += 1
                continue
            if ch == "/" and j + 1 < len(line) and line[j + 1] == "/":
                break
            if ch == "/" and j + 1 < len(line) and line[j + 1] == "*":
                e = line.find("*/", j + 2)
                if e == -1:
                    j = len(line)
                else:
                    j = e + 2
                continue
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i
                    break
            j += 1
        if end is not None:
            break
    if end is None:
        sys.exit("ERROR: end of Game block not found")

    print(f"Removing lines {start+1}-{end+1} ({end-start+1} lines)")

    # Also remove the "// ============ GAME ============" banner immediately above
    banner_lines = []
    i = start - 1
    while i >= 0 and lines[i].strip() == "":
        i -= 1
    if i >= 0 and "// ============ GAME" in lines[i]:
        banner_lines.append(i)
        print(f"Also removing banner line {i+1}")

    # Build new content
    removed = set(range(start, end + 1)) | set(banner_lines)
    new_lines = [l for idx, l in enumerate(lines) if idx not in removed]
    INDEX.write_text("\n".join(new_lines), encoding="utf-8")
    print(f"New index.html line count: {len(new_lines)}")


if __name__ == "__main__":
    main()
