"""체커 패턴이 그려진 PNG의 회색/흰색을 투명화.
- 무채색(R≈G≈B)이면서
- 밝기가 [185, 260) 범위 (흰 ~ 연회색)
이면 투명화. 건물의 실제 회색 돌은 채도가 약간 있어서 보존됨.
"""
import pathlib
from PIL import Image

CUT = pathlib.Path(r"c:\work\design\refs\town\cutouts")
TARGETS = ["arena", "cathedral"]

GRAY_TOLERANCE = 6      # R/G/B 채널 차이 한계
LO, HI = 185, 260       # 회색/흰색 범위

def kill_checker(img: Image.Image):
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    cleared = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            v = (r + g + b) / 3
            if LO <= v < HI and abs(r - g) <= GRAY_TOLERANCE and abs(g - b) <= GRAY_TOLERANCE and abs(r - b) <= GRAY_TOLERANCE:
                px[x, y] = (r, g, b, 0)
                cleared += 1
    return img, cleared

for name in TARGETS:
    src = CUT / f"{name}.png"
    im = Image.open(src)
    out, n = kill_checker(im)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    out.save(src)
    print(f"{name}: cleared={n} -> size={out.size}")
print("DONE")
