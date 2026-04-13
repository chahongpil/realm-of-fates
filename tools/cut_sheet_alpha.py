"""
알파 기반 시트 커터. 이미 투명 배경인 PNG 에서 content bbox 추출.
사용법:
  python tools/cut_sheet_alpha.py <src> <out_dir> <name1> [name2 ...]
"""
import os, sys
from PIL import Image
import numpy as np
from scipy.ndimage import label, find_objects, binary_dilation

def main(src, out_dir, names):
    img = Image.open(src).convert('RGBA')
    arr = np.array(img)
    alpha = arr[:,:,3]
    is_content = alpha > 10
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
        crop = arr[y0:y1+1, x0:x1+1]
        out = os.path.join(out_dir, name)
        Image.fromarray(crop, 'RGBA').save(out)
        print(f'저장: {out}  ({x1-x0+1}x{y1-y0+1})')

if __name__ == '__main__':
    src = sys.argv[1]
    out_dir = sys.argv[2]
    names = sys.argv[3:]
    main(src, out_dir, names)
