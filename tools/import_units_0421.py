# -*- coding: utf-8 -*-
"""2026-04-21 신규 유닛 14장 import.
- 소스: C:/Users/USER/Downloads/0421추가유닛작업/normalized/ (400x600 cover 정규화 완료)
- 대상: game/img/
- 11장 신규 + 3장 기존 교체 (infantry/lancer/priest)
"""
from PIL import Image
import os, sys, shutil

SRC = r'C:\Users\USER\Downloads\0421추가유닛작업\normalized'
DST = r'C:\work\game\img'

MAP = {
    # 신규 11종
    '번개채들러_희귀.png':  'stormcaller',
    '산악파괴자.png':       'mountain_breaker',
    '석공전사_희귀.png':    'stonemason',
    '석공전사_고귀.png':    'stonemason_noble',
    '어둠의주술사.png':     'dark_shaman',
    '해신팔라딘_전설.png':  'sea_paladin',
    '해적_남.png':          'pirate',
    '해파의기사_희귀.png':  'tidal_knight',
    '해파의기사_고귀.png':  'tidal_knight_noble',
    '화염의수호자.png':     'flame_guardian',
    '화염의전사.png':       'flame_warrior',
    # 기존 이미지 교체 3종
    '보병.png':             'infantry',
    '창병.png':             'lancer',
    '성직자_남자.png':      'priest',
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
            note = '(교체)' if uid in ('infantry','lancer','priest') else '(신규)'
            print(f'  OK  {kr:30s} -> {uid}.png  ({sz}KB) {note}')
            ok += 1
        except Exception as e:
            print(f'  ! FAIL {kr}: {e}'); fail += 1
    print(f'\n=== {ok}/{len(MAP)} imported, {fail} failed ===')

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
