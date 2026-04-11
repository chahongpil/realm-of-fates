"""Crude JS brace/paren/bracket balance checker for Phase 4 split files.

Skips strings and comments. Not a full parser — but catches gross imbalance
that would break script loading.
"""
import sys
from pathlib import Path


def check(path):
    content = Path(path).read_text(encoding="utf-8")
    depth = 0
    paren = 0
    bracket = 0
    i = 0
    n = len(content)
    in_s = False
    in_lc = False
    in_bc = False
    in_tpl = False  # template literal (allows ${expr})
    q = None
    while i < n:
        c = content[i]
        if in_lc:
            if c == "\n":
                in_lc = False
            i += 1
            continue
        if in_bc:
            if c == "*" and i + 1 < n and content[i + 1] == "/":
                in_bc = False
                i += 2
                continue
            i += 1
            continue
        if in_s:
            if c == "\\":
                i += 2
                continue
            if c == q:
                in_s = False
            i += 1
            continue
        if c == "/" and i + 1 < n and content[i + 1] == "/":
            in_lc = True
            i += 2
            continue
        if c == "/" and i + 1 < n and content[i + 1] == "*":
            in_bc = True
            i += 2
            continue
        if c in ('"', "'", "`"):
            in_s = True
            q = c
            i += 1
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
        elif c == "(":
            paren += 1
        elif c == ")":
            paren -= 1
        elif c == "[":
            bracket += 1
        elif c == "]":
            bracket -= 1
        i += 1
    status = "OK" if depth == 0 and paren == 0 and bracket == 0 else "FAIL"
    print(f"[{status}] {path}: brace={depth} paren={paren} bracket={bracket}")
    return depth == 0 and paren == 0 and bracket == 0


if __name__ == "__main__":
    ok = True
    for p in sys.argv[1:]:
        if not check(p):
            ok = False
    sys.exit(0 if ok else 1)
