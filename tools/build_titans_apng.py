# -*- coding: utf-8 -*-
"""유닛 애니메이션 APNG 합성기.
- 2026-04-20 (4차): 타이탄 전용 → 범용 (타이탄/그리핀용사 둘 다 지원).
- 400×600 캔버스, 90ms/frame, infinite loop.
- 각 JOB 은 SRC 폴더 + 파일명 패턴 + 출력 경로를 정의.
"""
from PIL import Image
import os, sys

BASE = r'C:\work\game\source_art\units'
TARGET_W = 400
TARGET_H = 600
FRAMES = 8
DURATION = 90  # ms

JOBS = [
    {
        'name': 'titan',
        'src': os.path.join(BASE, 'titan_frames'),
        'pattern': 'f{i}.jpg',
        'dst': r'C:\work\game\img\titan.png',
    },
    {
        'name': 'griffin_rider',
        'src': os.path.join(BASE, 'griffin_rider_frames'),
        'pattern': 'f{i}.png',
        'dst': r'C:\work\game\img\griffin_rider.png',
    },
]

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

def build_apng(job):
    print(f'\n--- {job["name"]} ---')
    frames = []
    for i in range(1, FRAMES + 1):
        path = os.path.join(job['src'], job['pattern'].format(i=i))
        if not os.path.exists(path):
            print(f'! MISSING frame {i}: {path}', file=sys.stderr); sys.exit(1)
        im = Image.open(path)
        frames.append(resize_to_card(im))
        print(f'  loaded frame {i}/{FRAMES}: {frames[-1].size}')

    frames[0].save(
        job['dst'],
        save_all=True,
        append_images=frames[1:],
        duration=DURATION,
        loop=0,
        format='PNG',
        optimize=True,
    )
    sz_mb = os.path.getsize(job['dst']) / 1024 / 1024
    print(f'  APNG written: {job["dst"]}  ({sz_mb:.2f} MB)')

def main():
    for job in JOBS:
        build_apng(job)
    print(f'\n=== {len(JOBS)} APNGs built ({FRAMES} frames @ {DURATION}ms each) ===')

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
