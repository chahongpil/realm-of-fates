# -*- coding: utf-8 -*-
"""대표님이 프레임 일체화한 한글 PNG 41장을 game/img/ 에 ID.png 로 이식.
- 일반 25장: 기존 ID 매칭 → 400×600 LANCZOS
- 신규 6장: 신규 ID + 데이터 추가 대상
- 타이탄 8장: 별도 스크립트로 APNG (build_titans_apng.py)
"""
from PIL import Image
import os, sys, io

SRC = r'C:\work\game\이미지제작_원본\일반유닛_원본\프레임 일체화'
DST = r'C:\work\game\img'
TARGET_W = 400
TARGET_H = 600

# 한글 파일명 → 게임 ID 매핑 (타이탄 제외)
MAP = {
    # 기존 ID 매칭 25장
    '견습 마법사.png': 'apprentice',
    '광전사.png': 'berserker',
    '기사.png': 'knight',
    '늑대.png': 'wolf',
    '대천사.png': 'archangel',
    '도적.png': 'rogue',
    '민병대.png': 'militia',
    '보병.png': 'infantry',
    '불꽃정령.png': 'fire_spirit',
    '사냥꾼.png': 'hunter',
    '석궁병.png': 'crossbow',
    '수비병.png': 'guard',
    '썬더버드.png': 'thunderbird',
    '약초사.png': 'herbalist',
    '창병.png': 'lancer',
    '화염술사.png': 'pyromancer',
    '17.암살자.png': 'assassin',
    '18. 사제.png': 'priest',
    '19.성기사_0419.png': 'paladin',
    '20.저격수.png': 'sniper',
    '21.죽음의기사.png': 'death_knight',
    '22.대마법사.png': 'archmage',
    '23.불사조.png': 'phoenix',
    '화염의 신 드래곤.png': 'dragon',
    '빙결술사_남자.png': 'cryomancer',
    '27.거인 리치.png': 'lich',
    # 신규 6장 (신규 ID)
    '빙결술사_여자.png': 'cryomancer_f',
    '궁병.png': 'archer',
    '그리핀.png': 'griffin',
    '24. 빨강망토기사.png': 'griffin_knight',
    '24. 전설의 그리핀용사.png': 'griffin_rider',
    '25.중장갑옷그리핀.png': 'armored_griffin',
    # 신규 divine (2026-04-20 2차)
    '암흑의신대악마.png': 'archfiend',
}

def resize_to_card(im):
    """비율 유지하면서 400×600 캔버스에 중앙 배치 (투명 배경 보존)."""
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
            print(f'  ! MISSING: {kr}'); skip += 1; continue
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
