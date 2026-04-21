# -*- coding: utf-8 -*-
"""2026-04-21 신규 스펠 26장 import.
- 소스: C:/Users/USER/Downloads/0421스펠작업/normalized/
- 대상: game/img/
- 21장 기존 교체 + 2장 패시브(evasion/warhorn) 교체 + 3장 신규 bronze
"""
import os, sys, shutil

SRC = r'C:\Users\USER\Downloads\0421스펠작업\normalized'
DST = r'C:\work\game\img'

MAP = {
    # 액티브 스펠 — 기존 이미지 교체 (희귀 원소 3 + 고귀 축복 + 기타)
    '광폭화.png':                 'sk_berserk',
    '그림자걸음.png':             'sk_shadowstep',
    '대지방벽.png':               'sk_earth_bulwark',
    '무적.png':                   'sk_invincible',
    '번개사슬_희귀.png':          'sk_chain_lightning',
    '부활의성배.png':             'sk_resurrection',
    '부활축복.png':               'sk_revive',
    '불화살_사이즈조정필요.png':  'sk_flame_arrow',
    '수호오라.png':               'sk_aura',
    '신살.png':                   'sk_godslayer',
    '암흑저주_희귀.png':          'sk_dark_curse',
    '용의심장.png':               'sk_dragonheart',
    '처형.png':                   'sk_execute',
    '철벽.png':                   'sk_fortress',
    '초월.png':                   'sk_transcend',
    '축복의빛_고귀한.png':        'sk_blessing_light',
    '치유의빛_사이즈조정필요.png':'sk_healing_light',
    '파도강타_사이즈조정필요.png':'sk_tidal_crash',
    '피의갈증.png':               'sk_bloodlust',
    '핸드오프.png':               'sk_handoff',
    '화염폭팔_희귀.png':          'sk_inferno_blast',
    # 패시브 스킬 이미지 교체
    '잔상.png':                   'sk_evasion',
    '뿔피리.png':                 'sk_warhorn',
    # 신규 bronze 3장 (대표님 결정: _일반은 bronze 로 사용)
    '번개_일반.png':              'sk_thunder_arrow',
    '암흑저주_일반.png':          'sk_hex',
    '화염폭팔_일반.png':          'sk_ember',
}

def main():
    ok = fail = 0
    for kr, uid in MAP.items():
        src = os.path.join(SRC, kr)
        dst = os.path.join(DST, f'{uid}.png')
        if not os.path.exists(src):
            print(f'  ! MISSING: {kr}'); fail += 1; continue
        try:
            note = '(신규 bronze)' if uid in ('sk_thunder_arrow','sk_hex','sk_ember') else '(교체)'
            shutil.copy2(src, dst)
            sz = os.path.getsize(dst) // 1024
            print(f'  OK  {kr:30s} -> {uid}.png  ({sz}KB) {note}')
            ok += 1
        except Exception as e:
            print(f'  ! FAIL {kr}: {e}'); fail += 1
    print(f'\n=== {ok}/{len(MAP)} imported, {fail} failed ===')

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
