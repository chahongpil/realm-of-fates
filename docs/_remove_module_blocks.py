"""Phase 5 / Section 06: Remove TurnBattle/Formation/FX blocks + scattered
init code from index.html. Also add the 4 new <script> tags.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
INDEX = ROOT / "index.html"

MODULES = ["TurnBattle", "Formation", "FX"]


def find_block(lines, name):
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


def main():
    text = INDEX.read_text(encoding="utf-8")
    lines = text.split("\n")
    removed = set()

    # 1. Remove const X={...}; blocks + optional preceding banner comment
    for name in MODULES:
        s, e = find_block(lines, name)
        print(f"Removing {name} lines {s+1}-{e+1} ({e-s+1} lines)")
        for i in range(s, e + 1):
            removed.add(i)
        # Remove preceding banner comment / blank lines
        i = s - 1
        while i >= 0 and (lines[i].strip() == "" or lines[i].strip().startswith("//")):
            banner_keywords = ("TURN-BASED", "FORMATION", "CANVAS PARTICLE", "TurnBattle", "═══")
            if any(kw in lines[i] for kw in banner_keywords):
                removed.add(i)
                i -= 1
            else:
                break

    # 2. Remove scattered init code
    # Pattern markers (search line content, remove matching & contextual lines):
    #   - "addEventListener('keydown'.*Enter" → Enter bindings (2 lines)
    #   - "Phase 3: SFX 는 defer" comment + DOMContentLoaded block for auto-login+volume
    #   - "Hook into screen changes" comment + UI.show monkey patch DOMContentLoaded
    #   - "// Init on page load" + setTimeout FX.initTitle

    # Find and remove specific blocks by scanning for markers
    def mark_from_to(start_pattern, end_pattern, desc):
        start_idx = None
        for i, line in enumerate(lines):
            if i in removed:
                continue
            if re.search(start_pattern, line):
                start_idx = i
                break
        if start_idx is None:
            print(f"  [skip] {desc}: start not found")
            return
        end_idx = None
        for i in range(start_idx, len(lines)):
            if re.search(end_pattern, lines[i]):
                end_idx = i
                break
        if end_idx is None:
            print(f"  [skip] {desc}: end not found after line {start_idx+1}")
            return
        print(f"  Removing {desc} lines {start_idx+1}-{end_idx+1}")
        for i in range(start_idx, end_idx + 1):
            removed.add(i)

    # Enter bindings + comment
    for i, line in enumerate(lines):
        if i in removed:
            continue
        if "// Enter key" in line:
            removed.add(i)
            # Next two lines should be the addEventListener keydown lines
            for k in (i + 1, i + 2):
                if k < len(lines) and "addEventListener('keydown'" in lines[k] and "Enter" in lines[k]:
                    removed.add(k)
            print(f"  Removed Enter bindings near line {i+1}")
            break

    # 마지막 로그인 정보 comment + Phase 3 SFX comment + DOMContentLoaded block
    # Find "// 마지막 로그인 정보 자동 입력" comment, and the next DOMContentLoaded until `});`
    for i, line in enumerate(lines):
        if i in removed:
            continue
        if "마지막 로그인 정보" in line:
            removed.add(i)
            # Also the Phase 3 SFX comment on next line
            if i + 1 < len(lines) and "Phase 3: SFX" in lines[i + 1]:
                removed.add(i + 1)
            # Find DOMContentLoaded start
            j = i + 2
            while j < len(lines) and "DOMContentLoaded" not in lines[j]:
                j += 1
            if j < len(lines):
                # Walk to matching closing });
                depth = 0
                started = False
                for k in range(j, len(lines)):
                    for ch in lines[k]:
                        if ch == "(":
                            depth += 1
                            started = True
                        elif ch == ")":
                            depth -= 1
                    if started and depth == 0:
                        for rr in range(j, k + 1):
                            removed.add(rr)
                        print(f"  Removed auto-login DOMContentLoaded lines {j+1}-{k+1}")
                        break
            break

    # Hook into screen changes + DOMContentLoaded UI.show monkey patch
    for i, line in enumerate(lines):
        if i in removed:
            continue
        if "Hook into screen changes" in line:
            removed.add(i)
            if i + 1 < len(lines) and "Phase 3: UI" in lines[i + 1]:
                removed.add(i + 1)
            j = i + 2
            while j < len(lines) and "DOMContentLoaded" not in lines[j]:
                j += 1
            if j < len(lines):
                depth = 0
                started = False
                for k in range(j, len(lines)):
                    for ch in lines[k]:
                        if ch == "(":
                            depth += 1
                            started = True
                        elif ch == ")":
                            depth -= 1
                    if started and depth == 0:
                        for rr in range(j, k + 1):
                            removed.add(rr)
                        print(f"  Removed UI.show hook DOMContentLoaded lines {j+1}-{k+1}")
                        break
            break

    # Initial FX setTimeout
    for i, line in enumerate(lines):
        if i in removed:
            continue
        if "Init on page load" in line:
            removed.add(i)
            if i + 1 < len(lines) and "setTimeout" in lines[i + 1] and "FX.initTitle" in lines[i + 1]:
                removed.add(i + 1)
            print(f"  Removed initial FX setTimeout lines {i+1}-{i+2}")
            break

    # 3. Add 4 new <script> tags after js/56_game_effects.js
    new_lines = []
    for i, line in enumerate(lines):
        if i in removed:
            continue
        new_lines.append(line)
        if 'src="js/56_game_effects.js"' in line:
            indent = line[: len(line) - len(line.lstrip())]
            new_lines.append(f'{indent}<script defer src="js/60_turnbattle.js"></script>')
            new_lines.append(f'{indent}<script defer src="js/70_formation.js"></script>')
            new_lines.append(f'{indent}<script defer src="js/80_fx.js"></script>')
            new_lines.append(f'{indent}<script defer src="js/99_bootstrap.js"></script>')

    INDEX.write_text("\n".join(new_lines), encoding="utf-8")
    print(f"\nNew index.html line count: {len(new_lines)} (was {len(lines)}, removed {len(lines)-len(new_lines)+4})")


if __name__ == "__main__":
    main()
