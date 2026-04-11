"""Extract inline <script> tags from index.html and save concatenated for syntax check."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
INDEX = ROOT / "index.html"
OUT = ROOT / "docs" / "_inline_scripts_combined.js"


def main():
    text = INDEX.read_text(encoding="utf-8")
    # Only extract inline scripts (no src attribute)
    pattern = re.compile(
        r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>',
        re.DOTALL | re.IGNORECASE,
    )
    matches = pattern.findall(text)
    print(f"Found {len(matches)} inline script blocks")
    combined = "\n// ---- BLOCK SEPARATOR ----\n".join(matches)
    OUT.write_text(combined, encoding="utf-8")
    print(f"Wrote {OUT} ({len(combined)} chars)")


if __name__ == "__main__":
    main()
