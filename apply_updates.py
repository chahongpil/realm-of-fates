"""
리팩토링된 코드에 새 기획 일괄 적용
1. 영웅/유닛 스탯 수정
2. 전투 공식 수정
3. 화폐 시스템 추가
"""
import re

# === 1. 유닛 스탯 수정 (11_data_units.js) ===
print("=== 1. 유닛 스탯 수정 ===")

with open("js/11_data_units.js", "r", encoding="utf-8") as f:
    content = f.read()

# 코멘트 업데이트
content = content.replace(
    "// Base: 전사(atk7,hp45,def5,spd3,rage5,nrg3,luck3,eva1,meva2,hpReg3,nrgReg1)\n//       궁수(atk9,hp22,def1,spd8,rage4,nrg5,luck7,eva6,meva2,hpReg1,nrgReg2)\n//       마법사(atk4,hp28,def2,spd5,rage2,nrg12,luck5,eva3,meva8,hpReg2,nrgReg5)",
    "// Base: 전사(atk2,hp50,def1,spd1,rage5,nrg5,luck1,eva1,meva1,hpReg2,nrgReg1)\n//       원거리(atk3,hp30,def1,spd1,rage1,nrg10,luck1,eva1,meva1,hpReg1,nrgReg1)\n//       지원(atk1,hp25,def1,spd1,rage1,nrg30,luck1,eva1,meva1,hpReg1,nrgReg2)\n// 일반유닛: 브론즈(HP8~12) 실버(HP12~18) 골드(HP18~25) 전설(HP30~40) 신(HP55)"
)

# 영웅 스탯 교체 함수
ELEM = {
    "fire":     {"atk":2,"rage":2},
    "water":    {"hp":8,"hpReg":1},
    "lightning":{"spd":3,"eva":2},
    "earth":    {"hp":5,"def":2},
    "dark":     {"atk":1,"luck":3},
    "holy":     {"nrg":3,"meva":2},
}

HERO_BASE = {
    "전사":  {"atk":2,"hp":50,"def":1,"spd":1,"rage":5,"nrg":5, "luck":1,"eva":1,"meva":1,"hpReg":2,"nrgReg":1},
    "사수":  {"atk":3,"hp":30,"def":1,"spd":1,"rage":1,"nrg":10,"luck":1,"eva":1,"meva":1,"hpReg":1,"nrgReg":1},
    "마법사":{"atk":1,"hp":25,"def":1,"spd":1,"rage":1,"nrg":30,"luck":1,"eva":1,"meva":1,"hpReg":1,"nrgReg":2},
}

def calc_hero(utype, elem):
    base = dict(HERO_BASE[utype])
    for k,v in ELEM.get(elem,{}).items():
        base[k] = base.get(k,0)+v
    return base

def stat_str(s):
    return ",".join(f"{k}:{s[k]}" for k in ["atk","hp","def","spd","rage","nrg","luck","eva","meva","hpReg","nrgReg"])

def replace_unit(content, uid, stats):
    pat = rf"(id:'{uid}'[^}}]*?)(atk:\d+,hp:\d+,def:\d+,spd:\d+,rage:\d+,nrg:\d+,luck:\d+,eva:\d+,meva:\d+,hpReg:\d+,nrgReg:\d+)"
    ss = stat_str(stats)
    new, n = re.subn(pat, rf"\1{ss}", content)
    if n: print(f"  ✅ {uid}")
    else: print(f"  ❌ {uid} 못찾음")
    return new

# 영웅 18종
hero_map = {
    "h_m_fire":"전사","h_m_water":"전사","h_m_lightning":"전사","h_m_earth":"전사","h_m_dark":"전사","h_m_holy":"전사",
    "h_r_fire":"사수","h_r_water":"사수","h_r_lightning":"사수","h_r_earth":"사수","h_r_dark":"사수","h_r_holy":"사수",
    "h_s_fire":"마법사","h_s_water":"마법사","h_s_lightning":"마법사","h_s_earth":"마법사","h_s_dark":"마법사","h_s_holy":"마법사",
}
for uid, utype in hero_map.items():
    elem = uid.split("_")[2]
    content = replace_unit(content, uid, calc_hero(utype, elem))

# 모집 유닛 (브론즈~신)
recruit = {
    "militia":     {"atk":2,"hp":10,"def":1,"spd":1,"rage":2,"nrg":1,"luck":1,"eva":1,"meva":1,"hpReg":0,"nrgReg":0},
    "guard":       {"atk":1,"hp":12,"def":2,"spd":1,"rage":1,"nrg":1,"luck":1,"eva":0,"meva":1,"hpReg":0,"nrgReg":0},
    "lancer":      {"atk":3,"hp":8, "def":1,"spd":2,"rage":2,"nrg":1,"luck":1,"eva":1,"meva":1,"hpReg":0,"nrgReg":0},
    "hunter":      {"atk":3,"hp":8, "def":0,"spd":2,"rage":1,"nrg":3,"luck":2,"eva":2,"meva":1,"hpReg":0,"nrgReg":1},
    "rogue":       {"atk":3,"hp":6, "def":0,"spd":3,"rage":1,"nrg":2,"luck":3,"eva":3,"meva":1,"hpReg":0,"nrgReg":1},
    "crossbow":    {"atk":4,"hp":7, "def":0,"spd":1,"rage":1,"nrg":2,"luck":1,"eva":1,"meva":1,"hpReg":0,"nrgReg":1},
    "apprentice":  {"atk":1,"hp":8, "def":0,"spd":1,"rage":1,"nrg":8,"luck":1,"eva":1,"meva":2,"hpReg":0,"nrgReg":2},
    "herbalist":   {"atk":1,"hp":9, "def":0,"spd":1,"rage":1,"nrg":10,"luck":1,"eva":1,"meva":2,"hpReg":1,"nrgReg":2},
    "wolf":        {"atk":3,"hp":6, "def":0,"spd":3,"rage":3,"nrg":1,"luck":1,"eva":2,"meva":0,"hpReg":0,"nrgReg":0},
    "fire_spirit": {"atk":2,"hp":5, "def":0,"spd":2,"rage":1,"nrg":6,"luck":1,"eva":2,"meva":1,"hpReg":0,"nrgReg":2},
    "knight":      {"atk":3,"hp":18,"def":3,"spd":1,"rage":2,"nrg":2,"luck":1,"eva":1,"meva":2,"hpReg":1,"nrgReg":1},
    "assassin":    {"atk":5,"hp":10,"def":0,"spd":4,"rage":3,"nrg":3,"luck":5,"eva":4,"meva":1,"hpReg":0,"nrgReg":1},
    "pyromancer":  {"atk":4,"hp":12,"def":0,"spd":2,"rage":2,"nrg":12,"luck":2,"eva":1,"meva":3,"hpReg":0,"nrgReg":2},
    "cryomancer":  {"atk":2,"hp":14,"def":1,"spd":2,"rage":1,"nrg":12,"luck":2,"eva":1,"meva":3,"hpReg":1,"nrgReg":2},
    "berserker":   {"atk":5,"hp":15,"def":0,"spd":2,"rage":8,"nrg":2,"luck":2,"eva":1,"meva":0,"hpReg":0,"nrgReg":1},
    "priest":      {"atk":1,"hp":14,"def":1,"spd":1,"rage":1,"nrg":15,"luck":2,"eva":1,"meva":4,"hpReg":1,"nrgReg":3},
    "thunderbird": {"atk":4,"hp":10,"def":0,"spd":5,"rage":2,"nrg":3,"luck":2,"eva":4,"meva":1,"hpReg":0,"nrgReg":1},
    "paladin":     {"atk":4,"hp":25,"def":4,"spd":1,"rage":2,"nrg":5,"luck":2,"eva":1,"meva":4,"hpReg":2,"nrgReg":2},
    "archmage":    {"atk":6,"hp":12,"def":0,"spd":3,"rage":1,"nrg":20,"luck":3,"eva":2,"meva":5,"hpReg":0,"nrgReg":3},
    "death_knight":{"atk":7,"hp":22,"def":3,"spd":1,"rage":6,"nrg":3,"luck":3,"eva":1,"meva":2,"hpReg":0,"nrgReg":1},
    "sniper":      {"atk":7,"hp":8, "def":0,"spd":4,"rage":1,"nrg":5,"luck":5,"eva":3,"meva":1,"hpReg":0,"nrgReg":1},
    "phoenix":     {"atk":4,"hp":18,"def":1,"spd":2,"rage":2,"nrg":6,"luck":3,"eva":2,"meva":3,"hpReg":2,"nrgReg":2},
    "dragon":      {"atk":10,"hp":35,"def":3,"spd":2,"rage":8,"nrg":6,"luck":3,"eva":1,"meva":2,"hpReg":1,"nrgReg":1},
    "lich":        {"atk":8, "hp":20,"def":1,"spd":2,"rage":3,"nrg":25,"luck":4,"eva":2,"meva":6,"hpReg":0,"nrgReg":4},
    "archangel":   {"atk":6, "hp":40,"def":5,"spd":2,"rage":2,"nrg":15,"luck":3,"eva":2,"meva":6,"hpReg":3,"nrgReg":3},
    "titan":       {"atk":15,"hp":55,"def":4,"spd":3,"rage":10,"nrg":10,"luck":5,"eva":2,"meva":4,"hpReg":2,"nrgReg":2},
}
for uid, stats in recruit.items():
    content = replace_unit(content, uid, stats)

with open("js/11_data_units.js", "w", encoding="utf-8") as f:
    f.write(content)

print(f"\n유닛 스탯 수정 완료!")

# === 2. 전투 공식 수정 (60_turnbattle.js) ===
print("\n=== 2. 전투 공식은 기존 코드 구조를 확인 후 수정 필요 ===")
print("  → 60_turnbattle.js의 데미지 계산 부분을 찾아서 수정합니다")

# === 3. 화폐 시스템 (50_game_core.js) ===
print("\n=== 3. 화폐 시스템 ===")
with open("js/50_game_core.js", "r", encoding="utf-8") as f:
    core = f.read()

# gold 외에 gems, blessings, divineGrace 추가
if "gems" not in core:
    # load 함수에서 추가 변수 로드
    core = core.replace(
        "gold:s.gold||5,",
        "gold:s.gold||20,gems:s.gems||0,blessings:s.blessings||0,divineGrace:s.divineGrace||0,"
    )
    # persist 함수에서 저장
    core = core.replace(
        "gold:this.gold,",
        "gold:this.gold,gems:this.gems||0,blessings:this.blessings||0,divineGrace:this.divineGrace||0,"
    )
    with open("js/50_game_core.js", "w", encoding="utf-8") as f:
        f.write(core)
    print("  ✅ 화폐 4종 추가 (gems/blessings/divineGrace)")
else:
    print("  ⏭ 이미 gems 존재")

print("\n=== 모든 업데이트 완료! ===")
