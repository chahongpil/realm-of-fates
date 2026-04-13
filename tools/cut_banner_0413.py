"""
cut_banner_0413.py — Downloads/배너0413.png 시트를 btn_stone 4상태로 재배정.
좌상→normal, 우상→hover, 좌하→active, 우하→disabled.
"""
import os
from PIL import Image
import numpy as np
from scipy.ndimage import label, find_objects, binary_dilation

SRC = 'C:/Users/USER/Downloads/배너0413.png'
OUT = 'c:/work/game/img/ui'

img = Image.open(SRC).convert('RGBA')
arr = np.array(img)
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
is_white = (r >= 240) & (g >= 240) & (b >= 240)
ch_max = np.maximum(np.maximum(r, g), b)
ch_min = np.minimum(np.minimum(r, g), b)
is_bg = is_white & ((ch_max - ch_min) <= 20)
is_content = ~is_bg
dilated = binary_dilation(is_content, iterations=3)
labeled, num = label(dilated)
boxes = []
for i, sl in enumerate(find_objects(labeled)):
    if sl is None: continue
    y0, y1 = sl[0].start, sl[0].stop - 1
    x0, x1 = sl[1].start, sl[1].stop - 1
    if (x1-x0+1) < 100 or (y1-y0+1) < 50: continue
    comp = (labeled == (i + 1)) & is_content
    if comp.sum() < 1000: continue
    ys, xs = np.where(comp)
    boxes.append((xs.min(), ys.min(), xs.max(), ys.max()))
boxes.sort(key=lambda b: (b[1] // 80, b[0]))
assert len(boxes) >= 4

targets = [
    'btn_stone_normal.png',
    'btn_stone_hover.png',
    'btn_stone_active.png',
    'btn_stone_disabled.png',
]

def make_transparent(crop):
    a = crop.copy()
    rr, gg, bb = a[:,:,0], a[:,:,1], a[:,:,2]
    mx = np.maximum(np.maximum(rr,gg), bb)
    mn = np.minimum(np.minimum(rr,gg), bb)
    mask = ((rr >= 240) & (gg >= 240) & (bb >= 240)) & ((mx - mn) <= 20)
    a[mask, 3] = 0
    return a

for fname, (x0,y0,x1,y1) in zip(targets, boxes[:4]):
    crop = arr[y0:y1+1, x0:x1+1]
    transparent = make_transparent(crop)
    out = os.path.join(OUT, fname)
    Image.fromarray(transparent, 'RGBA').save(out)
    print(f'저장: {out}  ({x1-x0+1}x{y1-y0+1})')
