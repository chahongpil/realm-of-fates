"""rembg + 내부 흰색 키 제거 하이브리드.
1) rembg로 건물 외곽 실루엣 알파 생성
2) 그 안에 남은 흰 픽셀(아치 사이 하늘 등)을 추가로 투명화
"""
import pathlib, time
from PIL import Image
from rembg import remove, new_session

GEM = pathlib.Path(r"c:\work\design\refs\town\gemini")
CUT = pathlib.Path(r"c:\work\design\refs\town\cutouts")
CUT.mkdir(parents=True, exist_ok=True)

BUILDINGS = ["castle", "forge", "library", "portal", "arena", "cathedral", "tavern", "shop"]

# 흰 픽셀 판정 임계값 — 모든 RGB 채널이 이 값 이상이면 흰색으로 간주
WHITE_THRESH = 235
# 채널 간 차이 — 무채색에 가까울수록 더 확실한 배경
GRAY_TOLERANCE = 18

def kill_interior_white(img: Image.Image) -> Image.Image:
    """rembg 후처리: foreground 영역에서도 흰 픽셀을 투명화."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    cleared = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if r >= WHITE_THRESH and g >= WHITE_THRESH and b >= WHITE_THRESH:
                # 추가 검증: 무채색에 가까운가
                if abs(r - g) < GRAY_TOLERANCE and abs(g - b) < GRAY_TOLERANCE and abs(r - b) < GRAY_TOLERANCE:
                    px[x, y] = (r, g, b, 0)
                    cleared += 1
    return img, cleared

print("[1] rembg 세션 (u2net)...")
t0 = time.time()
session = new_session("u2net")
print(f"    ok ({time.time()-t0:.1f}s)")

for name in BUILDINGS:
    src = GEM / f"{name}.png"
    if not src.exists():
        print(f"    SKIP {name}: missing")
        continue
    t1 = time.time()
    im = Image.open(src)
    out = remove(im, session=session)
    out, n_white = kill_interior_white(out)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    out.save(CUT / f"{name}.png")
    print(f"    {name:10s} {im.size} -> {out.size}  killed_white={n_white}  ({time.time()-t1:.1f}s)")

print(f"\nDONE  total {time.time()-t0:.1f}s")
