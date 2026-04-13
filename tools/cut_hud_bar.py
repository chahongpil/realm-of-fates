"""
cut_hud_bar.py — Downloads/1080x80.png 시트에서 4개 HUD 바 추출.
1행 plain → banner_hud_bar.png (기본)
나머지 → banner_hud_bar_v2~v4.png (변형 보관)
"""
import os
from PIL import Image
import numpy as np
from scipy.ndimage import label, find_objects, binary_dilation

SRC = 'C:/Users/USER/Downloads/1080x80.png'
OUT = 'c:/work/game/img/ui'

img = Image.open(SRC).convert('RGBA')
arr = np.array(img)
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
is_bg = (r >= 240) & (g >= 240) & (b >= 240) & (
    (np.maximum(np.maximum(r,g),b) - np.minimum(np.minimum(r,g),b)) <= 20
)
is_content = ~is_bg
dilated = binary_dilation(is_content, iterations=3)
labeled, _ = label(dilated)
boxes = []
for i, sl in enumerate(find_objects(labeled)):
    if sl is None: continue
    y0, y1 = sl[0].start, sl[0].stop - 1
    x0, x1 = sl[1].start, sl[1].stop - 1
    if (x1-x0+1) < 200 or (y1-y0+1) < 20: continue
    comp = (labeled == (i + 1)) & is_content
    if comp.sum() < 1000: continue
    ys, xs = np.where(comp)
    boxes.append((xs.min(), ys.min(), xs.max(), ys.max()))
boxes.sort(key=lambda b: b[1])  # 위→아래
assert len(boxes) >= 4, f'바 4개 필요, 발견 {len(boxes)}'

names = ['banner_hud_bar.png', 'banner_hud_bar_v2.png', 'banner_hud_bar_v3.png', 'banner_hud_bar_v4.png']

def make_transparent(crop):
    a = crop.copy()
    rr, gg, bb = a[:,:,0], a[:,:,1], a[:,:,2]
    mx = np.maximum(np.maximum(rr,gg), bb)
    mn = np.minimum(np.minimum(rr,gg), bb)
    mask = ((rr >= 240) & (gg >= 240) & (bb >= 240)) & ((mx - mn) <= 20)
    a[mask, 3] = 0
    return a

for name, (x0,y0,x1,y1) in zip(names, boxes[:4]):
    crop = arr[y0:y1+1, x0:x1+1]
    transparent = make_transparent(crop)
    out = os.path.join(OUT, name)
    Image.fromarray(transparent, 'RGBA').save(out)
    print(f'저장: {out}  ({x1-x0+1}x{y1-y0+1})')
