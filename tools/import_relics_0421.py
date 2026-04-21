# -*- coding: utf-8 -*-
"""2026-04-21 신규 유물 6장 import.
- 소스: C:/Users/USER/Downloads/0421추가유물작업/normalized/
- 대상: game/img/
- SVG → PNG 전환 (14_data_images.js 매핑 변경 병행 필요)
"""
import os, sys, shutil

SRC = r'C:\Users\USER\Downloads\0421추가유물작업\normalized'
DST = r'C:\work\game\img'

MAP = {
    '불멸갑옷.png':   'rl_immortal',
    '수호방패.png':   'rl_guard',
    '신의분노.png':   'rl_wrath',
    '영원의성배.png': 'rl_eternal',
    '파멸의검.png':   'rl_doom',
    '행운부적.png':   'rl_luck',
}

def main():
    ok = fail = 0
    for kr, uid in MAP.items():
        src = os.path.join(SRC, kr)
        dst = os.path.join(DST, f'{uid}.png')
        if not os.path.exists(src):
            print(f'  ! MISSING: {kr}'); fail += 1; continue
        try:
            shutil.copy2(src, dst)
            sz = os.path.getsize(dst) // 1024
            print(f'  OK  {kr:20s} -> {uid}.png  ({sz}KB)')
            ok += 1
        except Exception as e:
            print(f'  ! FAIL {kr}: {e}'); fail += 1
    print(f'\n=== {ok}/{len(MAP)} imported, {fail} failed ===')

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
