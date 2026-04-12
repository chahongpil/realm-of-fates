"""
cut_banners.py — Downloads 의 배너3/긴버전/짧은버전 에서 모든 배너 추출
- 흰색 배경 감지 → 비배경 픽셀 contour → 연결 컴포넌트로 그룹화
- 각 배너 bbox 추출 + 흰색 배경 투명화
- 각 배너의 지배 색상으로 자동 분류 (gray/brown/green/purple/red/blue)
- game/img/ui/banner_<source>_<idx>_<color>.png 로 저장
"""
import os
from PIL import Image
import numpy as np

SRC_DIR = 'C:/Users/USER/Downloads'
SRC_FILES = [
    ('3',   '배너3.png'),
    ('4',   '배너4.png'),
    ('5',   '배너5.png'),
    ('long','배너긴버전.png'),
    ('short','배너짧은버전.png'),
]
OUT_DIR = 'c:/work/game/img/ui'
os.makedirs(OUT_DIR, exist_ok=True)

def find_groups(mask, min_gap=25):
    groups = []
    i = 0
    n = len(mask)
    while i < n:
        if mask[i]:
            start = i
            while i < n and mask[i]: i += 1
            groups.append((start, i - 1))
        else:
            i += 1
    merged = []
    for g in groups:
        if merged and g[0] - merged[-1][1] < min_gap:
            merged[-1] = (merged[-1][0], g[1])
        else:
            merged.append(g)
    return merged

def extract_banners(path):
    from scipy.ndimage import label, find_objects, binary_dilation
    img = Image.open(path).convert('RGBA')
    arr = np.array(img)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    is_white = (r >= 245) & (g >= 245) & (b >= 245)
    ch_max = np.maximum(np.maximum(r, g), b)
    ch_min = np.minimum(np.minimum(r, g), b)
    is_neutral = (ch_max - ch_min) <= 20
    is_bg = is_white & is_neutral
    is_content = ~is_bg

    # 작은 틈을 메우기 위해 팽창 — 같은 배너 내 그림자/밝은 부분 연결 (너무 크면 이웃 배너와 병합)
    dilated = binary_dilation(is_content, iterations=2)
    labeled, num = label(dilated)
    print(f'  (connected components: {num})')
    slices = find_objects(labeled)
    banners = []
    for i, sl in enumerate(slices):
        if sl is None: continue
        y0, y1 = sl[0].start, sl[0].stop - 1
        x0, x1 = sl[1].start, sl[1].stop - 1
        w = x1 - x0 + 1
        h = y1 - y0 + 1
        # 너무 작은 것 제외
        if w < 100 or h < 50: continue
        # 해당 컴포넌트의 실제 content 마스크 (원본, 팽창 안 된)
        comp_mask = (labeled == (i + 1)) & is_content
        if comp_mask.sum() < 1000: continue
        # 실제 content bbox 로 다시 (팽창 영역 제외)
        ys, xs = np.where(comp_mask)
        if len(ys) == 0: continue
        banners.append((xs.min(), ys.min(), xs.max(), ys.max()))
    # Y 우선, X 차순 정렬 (위→아래, 좌→우)
    banners.sort(key=lambda b: (b[1]//50, b[0]))
    return arr, banners

def classify_color(crop_arr):
    """중앙 50% 영역의 평균 색으로 분류"""
    h, w = crop_arr.shape[:2]
    center = crop_arr[h//4:3*h//4, w//4:3*w//4, :3]
    # 흰색/거의흰색 제외
    r, g, b = center[...,0], center[...,1], center[...,2]
    not_white = ~((r>=240)&(g>=240)&(b>=240))
    if not_white.sum() < 100:
        return 'unknown'
    valid = center[not_white]
    avg = valid.mean(axis=0)
    R, G, B = avg[0], avg[1], avg[2]
    # 채도 계산
    mx, mn = max(R,G,B), min(R,G,B)
    saturation = (mx - mn) / max(mx, 1)
    if saturation < 0.15:
        return 'gray'  # 회색 (채도 낮음)
    # 색조 분류
    if R > G and R > B:
        if G > B * 1.2: return 'brown'  # 갈색 (R>G>B)
        return 'red'
    if G > R and G > B: return 'green'
    if B > R and B > G:
        if R > 80 and B - R < 80: return 'purple'
        return 'blue'
    return 'mixed'

def make_transparent(rgba_arr):
    new_arr = rgba_arr.copy()
    r, g, b = new_arr[:,:,0], new_arr[:,:,1], new_arr[:,:,2]
    is_w = (r >= 245) & (g >= 245) & (b >= 245)
    ch_max = np.maximum(np.maximum(r, g), b)
    ch_min = np.minimum(np.minimum(r, g), b)
    is_neutral = (ch_max - ch_min) <= 20
    mask = is_w & is_neutral
    new_arr[mask, 3] = 0
    return new_arr

all_results = []
for src_key, fname in SRC_FILES:
    path = os.path.join(SRC_DIR, fname)
    if not os.path.exists(path):
        print(f'⚠️ 없음: {path}')
        continue
    arr, banners = extract_banners(path)
    print(f'\n=== {fname} — {len(banners)}개 배너 ===')
    for i, (x0,y0,x1,y1) in enumerate(banners):
        crop = arr[y0:y1+1, x0:x1+1]
        color = classify_color(crop)
        transparent = make_transparent(crop)
        w = x1-x0+1; h = y1-y0+1
        aspect = 'wide' if w > h*2 else ('square' if w < h*1.3 else 'mid')
        name = f'banner_{src_key}_{i+1:02d}_{color}_{aspect}'
        out_path = os.path.join(OUT_DIR, name + '.png')
        Image.fromarray(transparent, 'RGBA').save(out_path)
        print(f'  {name}  ({w}x{h})')
        all_results.append((src_key, i+1, color, aspect, w, h, name))

# 최종 요약: 회색만 추림
print('\n🔘 회색 (gray) 배너 목록:')
grays = [r for r in all_results if r[2] == 'gray']
for r in grays:
    print(f'  {r[6]}  ({r[4]}x{r[5]}, {r[3]})')
print(f'\n총 {len(grays)}개 회색 배너')
