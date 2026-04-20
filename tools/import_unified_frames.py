# -*- coding: utf-8 -*-
"""대표님 순수 일러스트 PNG 를 game/img/ 에 ID.png 로 이식.
- 2026-04-20 (5차): 원본 폴더 영어 rename + 공개 레포 push. 파일명 규칙: 한 캐릭터 = 한 등급이면 접미사 없음, 여러 등급이면 `_{noble|legendary|divine}`.
- 2026-04-20 (4차): 프레임 일체화 폐기. 순수 캐릭터 일러스트만 받음.
- 소스: source_art/units/ (구 이미지제작_원본/일반유닛_원본/).
- 애니 카드는 build_titans_apng.py 로 별도 처리 (titan, griffin_rider).
"""
from PIL import Image
import os, sys

SRC = r'C:\work\game\source_art\units'
DST = r'C:\work\game\img'
TARGET_W = 400
TARGET_H = 600

# 영어 파일명 → 게임 ID 매핑 (타이탄·그리핀용사 APNG 제외, 암흑의저격수 보류)
# 파일명 == ID 이면 `.png` 확장자만 제거한 키. 지니는 접미사 필수 (두 등급 존재).
MAP = {
    # common (bronze)
    'militia.png': 'militia',
    'rogue.png': 'rogue',
    'wolf.png': 'wolf',
    'apprentice.png': 'apprentice',
    'archer.png': 'archer',
    'guard.png': 'guard',
    'crossbow.png': 'crossbow',
    'hunter.png': 'hunter',
    'lancer.png': 'lancer',
    'herbalist.png': 'herbalist',
    'fire_spirit.png': 'fire_spirit',
    # rare (silver)
    'berserker.png': 'berserker',
    'griffin.png': 'griffin',
    'knight.png': 'knight',
    'cryomancer.png': 'cryomancer',
    'cryomancer_f.png': 'cryomancer_f',
    'thunderbird.png': 'thunderbird',
    'assassin.png': 'assassin',
    'priest.png': 'priest',
    'pyromancer.png': 'pyromancer',
    # noble (gold)
    'paladin.png': 'paladin',
    'sniper.png': 'sniper',
    'death_knight.png': 'death_knight',
    'archmage.png': 'archmage',
    'phoenix.png': 'phoenix',
    'armored_griffin.png': 'armored_griffin',
    'genie_noble.png': 'genie_noble',
    # legendary
    'griffin_knight.png': 'griffin_knight',
    'lich.png': 'lich',
    'genie_legendary.png': 'genie_legendary',
    'earth_guardian.png': 'earth_guardian',
    'sea_priest.png': 'sea_priest',
    # divine
    'dragon.png': 'dragon',
    'archangel.png': 'archangel',
    'archfiend.png': 'archfiend',
    'behemoth.png': 'behemoth',
    'leviathan.png': 'leviathan',
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
