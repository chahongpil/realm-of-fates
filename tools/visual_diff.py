#!/usr/bin/env python
"""
visual_diff.py — 두 PNG 비교 → 차이 영역 빨간 박스로 표시
사용:
  python tools/visual_diff.py <before.png> <after.png>
  python tools/visual_diff.py shots/before/menu.png shots/menu.png
출력:
  shots/diff_<basename>.png  (변경 전+후 + diff 오버레이)
  콘솔에 변화율 % 보고
"""
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    before_path = Path(sys.argv[1])
    after_path = Path(sys.argv[2])

    if not before_path.exists():
        print(f"FAIL: {before_path} not found")
        sys.exit(1)
    if not after_path.exists():
        print(f"FAIL: {after_path} not found")
        sys.exit(1)

    a = Image.open(before_path).convert('RGBA')
    b = Image.open(after_path).convert('RGBA')

    if a.size != b.size:
        print(f"⚠️ size mismatch: {a.size} vs {b.size}")
        b = b.resize(a.size)

    # diff
    diff = ImageChops.difference(a.convert('RGB'), b.convert('RGB'))
    # threshold to find changed pixels
    bbox = diff.getbbox()
    if not bbox:
        print("[OK] No visual difference")
        return

    # compute % changed
    total = a.size[0] * a.size[1]
    changed = sum(1 for px in diff.getdata() if sum(px) > 30)
    pct = changed / total * 100

    # output: side-by-side with diff overlay
    out_w = a.size[0] * 2 + 20
    out_h = a.size[1] + 40
    canvas = Image.new('RGB', (out_w, out_h), (10, 10, 20))
    canvas.paste(a, (0, 30))
    canvas.paste(b, (a.size[0] + 20, 30))

    # red overlay on changed pixels (over the "after" side)
    overlay = Image.new('RGBA', a.size, (0,0,0,0))
    od = ImageDraw.Draw(overlay)
    threshold = 30
    pxa = a.load()
    pxb = b.load()
    for y in range(0, a.size[1], 2):  # sample every 2px for speed
        for x in range(0, a.size[0], 2):
            d = sum(abs(pxa[x,y][i] - pxb[x,y][i]) for i in range(3))
            if d > threshold:
                od.rectangle([x, y, x+2, y+2], fill=(255, 50, 50, 120))
    after_with_overlay = Image.alpha_composite(b, overlay)
    canvas.paste(after_with_overlay, (a.size[0] + 20, 30))

    # labels
    draw = ImageDraw.Draw(canvas)
    draw.rectangle([0, 0, out_w, 25], fill=(20, 20, 30))
    draw.text((10, 5), f"BEFORE: {before_path.name}", fill=(200, 200, 200))
    draw.text((a.size[0] + 30, 5), f"AFTER: {after_path.name}  (red=changed)", fill=(255, 200, 200))

    out = Path('shots') / f'diff_{after_path.stem}.png'
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out)
    print(f"[CHANGED] {pct:.2f}%  ({changed:,} pixels)")
    print(f"[BBOX]    {bbox}")
    print(f"[SAVED]   {out}")

if __name__ == '__main__':
    main()
