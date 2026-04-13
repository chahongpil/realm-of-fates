"""
cut_button_states.py
Downloads/block2 의 두 스프라이트 시트(2×2 grid, Normal/Hover/Active/Disabled)
에서 돌판 부분만 잘라 game/img/ui/btn_stone_*.png 로 저장.
- 1번 이미지 = 기본
- 2번 이미지 = hover 글로우 버전 → hover 만 채택, 나머지는 1번이 우위
"""
import os
import numpy as np
from PIL import Image

SRC = 'C:/Users/USER/Downloads/block2'
OUT = 'c:/work/game/img/ui'
os.makedirs(OUT, exist_ok=True)

FILES = {
    'plain': 'ChatGPT Image Apr 13, 2026, 05_45_23 PM.png',
    'glow':  'ChatGPT Image Apr 13, 2026, 05_47_31 PM.png',
}
STATES = ['normal', 'hover', 'active', 'disabled']  # row-major: TL TR BL BR

def crop_plate(cell_arr):
    """셀에서 돌판만 추출 (하단 라벨 텍스트 제외)."""
    r, g, b = cell_arr[:,:,0], cell_arr[:,:,1], cell_arr[:,:,2]
    is_white = (r >= 240) & (g >= 240) & (b >= 240)
    content = ~is_white
    # 행별 content 폭
    row_widths = content.sum(axis=1)
    if row_widths.max() == 0:
        return None
    threshold = row_widths.max() * 0.4
    # plate 행: 폭이 임계값 이상인 연속 구간 중 가장 큰 것 (라벨은 짧음)
    in_run = False
    runs = []
    for i, w in enumerate(row_widths):
        if w >= threshold:
            if not in_run:
                start = i; in_run = True
        else:
            if in_run:
                runs.append((start, i - 1)); in_run = False
    if in_run:
        runs.append((start, len(row_widths) - 1))
    if not runs:
        return None
    plate = max(runs, key=lambda r: r[1] - r[0])
    y0, y1 = plate
    # 약간 여유
    y0 = max(0, y0 - 4); y1 = min(len(row_widths) - 1, y1 + 4)
    # X bbox
    cols = content[y0:y1+1].any(axis=0)
    xs = np.where(cols)[0]
    if len(xs) == 0: return None
    x0, x1 = max(0, xs.min() - 4), min(content.shape[1] - 1, xs.max() + 4)
    crop = cell_arr[y0:y1+1, x0:x1+1].copy()
    # 흰 배경 투명화
    cr, cg, cb = crop[:,:,0], crop[:,:,1], crop[:,:,2]
    mask = (cr >= 240) & (cg >= 240) & (cb >= 240)
    if crop.shape[2] == 3:
        alpha = np.where(mask, 0, 255).astype(np.uint8)
        crop = np.dstack([crop, alpha])
    else:
        crop[mask, 3] = 0
    return crop

def split_quadrants(arr):
    H, W = arr.shape[:2]
    h2, w2 = H // 2, W // 2
    return [
        arr[:h2, :w2],   # TL = normal
        arr[:h2, w2:],   # TR = hover
        arr[h2:, :w2],   # BL = active
        arr[h2:, w2:],   # BR = disabled
    ]

results = {}
for key, fname in FILES.items():
    path = os.path.join(SRC, fname)
    img = Image.open(path).convert('RGBA')
    arr = np.array(img)
    quads = split_quadrants(arr)
    for state, q in zip(STATES, quads):
        plate = crop_plate(q)
        if plate is None:
            print(f'  ⚠️  {key}/{state}: no plate found')
            continue
        results[(key, state)] = plate
        h, w = plate.shape[:2]
        print(f'  {key}/{state}: {w}x{h}')

# 최종 채택: glow 의 hover, 나머지는 plain
final = {
    'normal':   results[('plain', 'normal')],
    'hover':    results[('glow',  'hover')],
    'active':   results[('plain', 'active')],
    'disabled': results[('plain', 'disabled')],
}
for state, arr in final.items():
    out = os.path.join(OUT, f'btn_stone_{state}.png')
    Image.fromarray(arr, 'RGBA').save(out)
    h, w = arr.shape[:2]
    print(f'[OK] {out}  ({w}x{h})')
