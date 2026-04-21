# -*- coding: utf-8 -*-
"""주인공(protagonist) 일러스트를 game/img/ 에 이식.
- 소스: C:/Users/USER/Downloads/0421주인공추가작업/
- 규격: 400x600, 비율 유지 + 투명 캔버스 센터 배치.
- 성별 × 역할 템플릿 + 남자 전사만 스킨 3장 (랜덤 슬롯).
"""
from PIL import Image
import os, sys

SRC = r'C:\Users\USER\Downloads\0421주인공추가작업'
DST = r'C:\work\game\img'
TARGET_W = 400
TARGET_H = 600

MAP = {
    '주인공_남_전사1.png':   'protagonist_m_warrior_1',
    '주인공_남_전사2.png':   'protagonist_m_warrior_2',
    '주인공_남_전사3(창).png': 'protagonist_m_warrior_3',
    '주인공_남_원거리.png':  'protagonist_m_ranger',
    '주인공_남_지원.png':    'protagonist_m_support',
    '주인공_여_전사.png':    'protagonist_f_warrior',
    '주인공_여_원거리.png':  'protagonist_f_ranger',
    '주인공_여_지원.png':    'protagonist_f_support',
}

def resize_to_card(im):
    im = im.convert('RGBA')
    w, h = im.size
    ratio = min(TARGET_W / w, TARGET_H / h)
    nw, nh = int(w * ratio), int(h * ratio)
    resized = im.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new('RGBA', (TARGET_W, TARGET_H), (0, 0, 0, 0))
    ox = (TARGET_W - nw) // 2
    oy = (TARGET_H - nh) // 2
    canvas.paste(resized, (ox, oy), resized)
    return canvas

def main():
    if not os.path.isdir(SRC):
        print('SRC missing:', SRC, file=sys.stderr); sys.exit(1)

    total = ok = skip = 0
    for kr, uid in MAP.items():
        src_path = os.path.join(SRC, kr)
        if not os.path.exists(src_path):
            print(f'  ! MISSING: {kr}'); skip += 1; total += 1; continue
        dst_path = os.path.join(DST, f'{uid}.png')
        try:
            im = Image.open(src_path)
            out = resize_to_card(im)
            out.save(dst_path, format='PNG', optimize=True)
            sz = os.path.getsize(dst_path) // 1024
            print(f'  OK  {kr:30s} -> {uid}.png  ({out.size[0]}x{out.size[1]}, {sz}KB)')
            ok += 1
        except Exception as e:
            print(f'  ! FAIL {kr}: {e}'); skip += 1
        total += 1

    print(f'\n=== {ok}/{total} converted, {skip} skipped/failed ===')

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
