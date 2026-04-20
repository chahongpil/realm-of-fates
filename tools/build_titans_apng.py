# -*- coding: utf-8 -*-
"""대표님이 프레임 일체화한 타이탄1~8.png 8장을 APNG 로 합성.
- 400×600, 90ms/frame, infinite loop
- 출력: game/img/titan.png (기존 덮어쓰기)
"""
from PIL import Image
import os, sys

SRC = r'C:\work\game\이미지제작_원본\일반유닛_원본\프레임 일체화'
DST = r'C:\work\game\img\titan.png'
TARGET_W = 400
TARGET_H = 600
FRAMES = 8
DURATION = 90  # ms

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
    frames = []
    for i in range(1, FRAMES + 1):
        path = os.path.join(SRC, f'타이탄{i}.png')
        if not os.path.exists(path):
            print(f'! MISSING frame {i}: {path}', file=sys.stderr); sys.exit(1)
        im = Image.open(path)
        frames.append(resize_to_card(im))
        print(f'  loaded frame {i}/{FRAMES}: {frames[-1].size}')

    frames[0].save(
        DST,
        save_all=True,
        append_images=frames[1:],
        duration=DURATION,
        loop=0,
        format='PNG',
        optimize=True,
    )
    sz_mb = os.path.getsize(DST) / 1024 / 1024
    print(f'\n=== APNG written: {DST}  ({sz_mb:.2f} MB, {FRAMES} frames @ {DURATION}ms) ===')

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
