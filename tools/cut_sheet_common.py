"""
공용 시트 커터. 가장자리 flood-fill 로 외부 흰 배경만 투명화(내부 흰점 보존).
사용법:
  python tools/cut_sheet_common.py <src> <out_dir> <name1> [name2 ...]
  - 발견한 바운딩박스를 y/x 순 정렬 후 name 리스트에 순서대로 배정
"""
import os, sys
from PIL import Image
import numpy as np
from scipy.ndimage import label, find_objects, binary_dilation, binary_fill_holes

def main(src, out_dir, names):
    img = Image.open(src).convert('RGBA')
    arr = np.array(img)
    H, W = arr.shape[:2]
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    mx = np.maximum(np.maximum(r,g), b)
    mn = np.minimum(np.minimum(r,g), b)
    near_white = (r >= 230) & (g >= 230) & (b >= 230) & ((mx - mn) <= 25)

    # 가장자리에서 flood fill: 경계에 닿는 흰 영역만 "외부"
    lbl, _ = label(near_white)
    edge_labels = set()
    edge_labels.update(np.unique(lbl[0, :]))
    edge_labels.update(np.unique(lbl[-1, :]))
    edge_labels.update(np.unique(lbl[:, 0]))
    edge_labels.update(np.unique(lbl[:, -1]))
    edge_labels.discard(0)
    outer_white = np.isin(lbl, list(edge_labels))

    is_content = ~outer_white
    dilated = binary_dilation(is_content, iterations=3)
    labeled, _ = label(dilated)
    boxes = []
    for i, sl in enumerate(find_objects(labeled)):
        if sl is None: continue
        y0, y1 = sl[0].start, sl[0].stop - 1
        x0, x1 = sl[1].start, sl[1].stop - 1
        if (x1-x0+1) < 100 or (y1-y0+1) < 20: continue
        comp = (labeled == (i + 1)) & is_content
        if comp.sum() < 1000: continue
        ys, xs = np.where(comp)
        boxes.append((xs.min(), ys.min(), xs.max(), ys.max()))
    boxes.sort(key=lambda b: (b[1] // 80, b[0]))
    if len(boxes) < len(names):
        raise SystemExit(f'발견 {len(boxes)}개 < 필요 {len(names)}개')

    for name, (x0,y0,x1,y1) in zip(names, boxes[:len(names)]):
        crop = arr[y0:y1+1, x0:x1+1].copy()
        local_outer = outer_white[y0:y1+1, x0:x1+1]
        crop[local_outer, 3] = 0
        out = os.path.join(out_dir, name)
        Image.fromarray(crop, 'RGBA').save(out)
        print(f'저장: {out}  ({x1-x0+1}x{y1-y0+1})')

if __name__ == '__main__':
    src = sys.argv[1]
    out_dir = sys.argv[2]
    names = sys.argv[3:]
    main(src, out_dir, names)
