# -*- coding: utf-8 -*-
"""다운로드 폴더의 신규 이미지들을 400x600 투명 캔버스로 정규화.
- 비율 유지 (contain). 안 짤림. 남는 여백 투명.
- 원본 보존: 각 소스 폴더의 `normalized/` 하위에 저장.
- ID 매핑(한국어→영어)은 별도 단계. 이 스크립트는 크기만 통일.
"""
from PIL import Image
import os, sys

TARGET_W = 400
TARGET_H = 600

SOURCES = [
    r'C:\Users\USER\Downloads\0421스펠작업',
    r'C:\Users\USER\Downloads\0421추가유물작업',
    r'C:\Users\USER\Downloads\0421추가유닛작업',
]

def resize_to_card(im):
    """cover 방식: 400x600 캔버스를 꽉 채움. 비율 차이는 중앙 crop 으로 흡수 (가장자리 최소 손실).
    여백 0 을 우선 — 원본 비율(0.8~0.83)과 목표 비율(0.667)의 차이만큼만 좌우 crop."""
    im = im.convert('RGBA')
    w, h = im.size
    ratio = max(TARGET_W / w, TARGET_H / h)
    nw, nh = int(w * ratio), int(h * ratio)
    resized = im.resize((nw, nh), Image.LANCZOS)
    # 중앙 crop
    x0 = (nw - TARGET_W) // 2
    y0 = (nh - TARGET_H) // 2
    return resized.crop((x0, y0, x0 + TARGET_W, y0 + TARGET_H))

def process_dir(src_dir):
    if not os.path.isdir(src_dir):
        print(f'  ! missing dir: {src_dir}', file=sys.stderr); return (0, 0)
    dst_dir = os.path.join(src_dir, 'normalized')
    os.makedirs(dst_dir, exist_ok=True)
    ok = skip = 0
    for fname in sorted(os.listdir(src_dir)):
        if not fname.lower().endswith('.png'): continue
        src_path = os.path.join(src_dir, fname)
        if not os.path.isfile(src_path): continue
        dst_path = os.path.join(dst_dir, fname)
        try:
            im = Image.open(src_path)
            orig_size = im.size
            out = resize_to_card(im)
            out.save(dst_path, format='PNG', optimize=True)
            sz_kb = os.path.getsize(dst_path) // 1024
            print(f'  OK  {fname:40s} {orig_size[0]}x{orig_size[1]} -> 400x600 ({sz_kb}KB)')
            ok += 1
        except Exception as e:
            print(f'  ! FAIL {fname}: {e}'); skip += 1
    return (ok, skip)

def main():
    grand_ok = grand_skip = 0
    for src in SOURCES:
        print(f'\n=== {os.path.basename(src)} ===')
        ok, skip = process_dir(src)
        grand_ok += ok; grand_skip += skip
    print(f'\n=== TOTAL: {grand_ok} converted, {grand_skip} failed ===')

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
