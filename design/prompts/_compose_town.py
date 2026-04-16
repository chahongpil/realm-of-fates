"""마을 합성 — slot_coords.json 기반 (에디터 결과 반영)
1) 8개 건물 cutout (이미 transparent 처리됨) 로드
2) JSON의 x,y,w,h로 베이스 위에 정확히 합성
3) 결과: refs/town/town_composed.png
"""
import json, pathlib
from PIL import Image

ROOT = pathlib.Path(r"c:\work\design\refs\town")
GEM  = ROOT / "gemini"
CUT  = ROOT / "cutouts"
OUT  = ROOT / "town_composed.png"
COORDS = ROOT / "slot_coords.json"

def main():
    print("[1] Loading base...")
    base = Image.open(GEM / "base_terrain.png").convert("RGBA")
    print(f"    base size: {base.size}")

    print(f"[2] Loading coords from {COORDS.name}")
    slots = json.loads(COORDS.read_text())
    # z 순서로 정렬 (낮은 z부터 그려야 위에 덮임)
    items = sorted(slots.items(), key=lambda kv: kv[1].get("z", 5))

    print("[3] Compositing...")
    canvas = base.copy()
    for name, s in items:
        src = CUT / f"{name}.png"
        if not src.exists():
            print(f"    SKIP {name}: missing cutout")
            continue
        img = Image.open(src).convert("RGBA")
        target_w, target_h = s["w"], s["h"]
        img = img.resize((target_w, target_h), Image.LANCZOS)
        canvas.alpha_composite(img, (s["x"], s["y"]))
        print(f"    {name:10s} z={s.get('z',5):>2} pos=({s['x']:>3},{s['y']:>4}) size={target_w}x{target_h}")

    print(f"[4] Saving -> {OUT}")
    canvas.save(OUT)
    print("DONE")

if __name__ == "__main__":
    main()
