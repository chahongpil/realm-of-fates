"""Phase 5 (Section 06): Split TurnBattle / Formation / FX blocks + init code
from index.html into 4 new js files:

  - js/60_turnbattle.js
  - js/70_formation.js
  - js/80_fx.js
  - js/99_bootstrap.js

Strategy:
  1. Find each `const X={` block boundary via brace walker (string/comment aware)
  2. Extract verbatim text, rewrite `const X={` → `RoF.X={`
  3. Append `window.X = RoF.X;` for backward compat with inline onclick="X.foo()"
  4. For bootstrap: collect all init code (Enter bindings, auto-login, volume,
     UI.show monkey-patch, initial FX setTimeout) into a single DOMContentLoaded
     handler + sanity check
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
INDEX = ROOT / "index.html"
JS_DIR = ROOT / "js"

MODULES = ["TurnBattle", "Formation", "FX"]


def find_block(lines, name):
    """Return (start_line_idx, end_line_idx) for `const NAME={...};` block."""
    pattern = re.compile(rf"^\s*const\s+{re.escape(name)}\s*=\s*\{{")
    start = None
    for i, line in enumerate(lines):
        if pattern.match(line):
            start = i
            break
    if start is None:
        sys.exit(f"ERROR: const {name}={{ not found")

    depth = 0
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
                    return start, i
            j += 1
    sys.exit(f"ERROR: end of {name} block not found")


def write_module(name, fname, start, end, lines, extra_head=None):
    """Write extracted module to js/fname."""
    body = lines[start : end + 1]
    # Rewrite `const X={` → `RoF.X={`
    body[0] = re.sub(
        rf"^(\s*)const\s+{re.escape(name)}\s*=",
        rf"\1RoF.{name} =",
        body[0],
    )
    # body[-1] ends with `};` — keep as is

    out_lines = [
        f"// {fname} — extracted by docs/_split_modules.py (Phase 5)",
        f"// {name} module assigned to RoF namespace.",
        "",
    ]
    if extra_head:
        out_lines.extend(extra_head)
        out_lines.append("")
    out_lines.extend(body)
    out_lines.append("")
    out_lines.append(
        f"// Expose as global for inline onclick=\"{name}.foo()\" bindings and Game cross-refs."
    )
    out_lines.append(f"window.{name} = RoF.{name};")

    path = JS_DIR / fname
    path.write_text("\n".join(out_lines), encoding="utf-8")
    print(f"Wrote {path} ({end - start + 1} source lines)")
    return start, end


def main():
    text = INDEX.read_text(encoding="utf-8")
    lines = text.split("\n")

    ranges = {}  # name -> (start, end) 0-indexed inclusive
    for name in MODULES:
        ranges[name] = find_block(lines, name)

    # Sort by start line
    ordered = sorted(ranges.items(), key=lambda kv: kv[1][0])
    print("Detected module blocks (1-indexed inclusive):")
    for n, (s, e) in ordered:
        print(f"  {n:12s} lines {s+1}-{e+1} ({e-s+1} lines)")

    # Write each module
    write_module("TurnBattle", "60_turnbattle.js", *ranges["TurnBattle"], lines=lines)
    write_module("Formation", "70_formation.js", *ranges["Formation"], lines=lines)
    write_module("FX", "80_fx.js", *ranges["FX"], lines=lines)


if __name__ == "__main__":
    main()
