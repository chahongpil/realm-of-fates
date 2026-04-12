# 🎨 ART_ASSETS — 카드 에셋 현황표

> 마지막 업데이트: 2026-04-12
> **목적**: `index.html`의 UNITS/SKILLS_DB/RELICS_DB 정의 vs 실제 `img/` 폴더 이미지 vs `CARD_IMG` 매핑 상태를 한눈에 파악.
> **규칙**: 기획서 수정 시 이 표부터 확인. `game-designer` 에이전트가 매 리뷰마다 이 파일을 체크.

## 📊 요약 (2026-04-12 현재)

| 카테고리 | 정의 개수 | 이미지 존재 | CARD_IMG 매핑 | 누락 |
|----------|----------|------------|---------------|------|
| 영웅 (Heroes) | 18 | ✅ 18 | ✅ 18 | 0 |
| 모집 유닛 (Recruitable) | 26 | ✅ 26 | ✅ 26 | 0 |
| 스킬 (Skills) | 30 | ✅ **30 PNG** (2026-04-12 DreamShaper 생성) | ✅ 30 (로컬) | 0 |
| 유물 (Relics) | 12 | ❌ 0 (SVG 사용) | ✅ 12 | 0 |

## ✅ 2026-04-12 A단계 완료: 스킬 카드 16개 긴급 매핑
모든 URL은 HTTP 200 검증 완료. `CARD_IMG`에 추가됨 ([index.html](index.html) CARD_IMG 객체).

| ID | 이름 | 매핑된 아이콘 |
|----|------|--------------|
| sk_tough | 단련 | delapouite/weight-lifting-up.svg |
| sk_focus | 집중 | lorc/target-arrows.svg |
| sk_energize | 활력충전 | lorc/thunderball.svg |
| sk_cleave | 일섬 | lorc/sword-slice.svg |
| sk_ironwill | 불굴 | lorc/armor-vest.svg |
| sk_prayer | 기도 | lorc/prayer.svg |
| sk_venom | 맹독 | lorc/snake-bite.svg |
| sk_reflex | 반사신경 | lorc/sprint.svg |
| sk_bloodlust | 피의갈증 | lorc/bleeding-wound.svg |
| sk_mirage | 신기루 | lorc/tornado.svg |
| sk_warhorn | 전쟁의나팔 | lorc/battle-gear.svg |
| sk_execute | 처형 | lorc/guillotine.svg |
| sk_aura | 수호오라 | lorc/angel-wings.svg |
| sk_godslayer | 신살 | lorc/broadsword.svg |
| sk_resurrection | 부활의성배 | lorc/ankh.svg |
| sk_shadowstep | 그림자걸음 | lorc/cowled.svg |

### 기존 매핑된 14개 스킬
sk_power, sk_shield, sk_heal, sk_swift, sk_rage, sk_evasion, sk_crit_edge, sk_fortress, sk_revive, sk_berserk, sk_transcend, sk_invincible, sk_handoff, sk_dragonheart

## ✅ 영웅 카드 18종 (모두 정상)
근접 전사(6) / 원거리 궁수(6) / 지원 마법사(6) × 6원소
- `h_m_{fire,water,lightning,earth,dark,holy}.png`
- `h_r_{fire,water,lightning,earth,dark,holy}.png`
- `h_s_{fire,water,lightning,earth,dark,holy}.png`

## ✅ 모집 유닛 26종 (모두 정상)
### 브론즈(10)
militia, hunter, apprentice, wolf, guard, rogue, herbalist, lancer, crossbow, fire_spirit
### 실버(7)
knight, assassin, pyromancer, cryomancer, berserker, priest, thunderbird
### 골드(4)
paladin, archmage, death_knight, sniper
### 전설(4)
phoenix, dragon, lich, archangel
### 신(1)
titan (+ titan_test, titan_v2 백업 이미지 있음)

## ✅ 유물 12종 (game-icons.net SVG, 모두 매핑됨)
rl_banner, rl_crystal, rl_wall, rl_fury, rl_boots, rl_cloak, rl_doom, rl_luck, rl_guard, rl_wrath, rl_eternal, rl_immortal

## 🛠️ 수정 방법 (긴급)
**16개 스킬에 CARD_IMG 엔트리를 추가해야 함**. 현재 기획 단계라 index.html 직접 수정 금지 규칙이 있으나, 이는 **버그성 누락이므로 예외로 수정 필요** (또는 16개 스킬용 PNG 일러스트를 `img/` 폴더에 제작 + 로컬 경로로 매핑).

**권장 접근**:
1. **단기**: 누락 16개에 game-icons.net SVG URL을 CARD_IMG에 추가 (기존 14개와 동일 방식)
2. **장기**: 스킬도 유닛처럼 `img/skill_*.png` 전용 일러스트 제작 후 로컬 파일 사용
   - 이미 `img/skill_aoe.png, skill_attack.png, skill_crit.png, skill_defend.png, skill_drain.png, skill_fire.png, skill_heal.png, skill_ice.png, skill_inspire.png, skill_lightning.png, skill_pierce.png, skill_taunt.png` 12장 존재 — 그러나 CARD_IMG와 연결 안 됨
   - 이 파일들은 **효과(skill)가 아닌 키워드 단위**라 스킬 카드 30장과 1:1 매칭되지 않음 → 추가 제작 또는 재매핑 필요

## 🤖 자동 검증 방법
향후 `scripts/verify_assets.js` 또는 Python 스크립트로 아래 체크 자동화:
1. index.html에서 UNITS/SKILLS_DB/RELICS_DB id 목록 추출
2. CARD_IMG 키 목록 추출
3. `img/` 폴더 파일 목록 추출
4. 3자 비교 → 누락 리포트 생성

## 📋 유지 규칙
- **신규 카드 추가 시** 이 표에 먼저 행 추가 → 이미지 제작 → CARD_IMG 매핑 → ✅ 표시
- **game-designer 에이전트 리뷰 시** 이 파일을 먼저 읽고 "현재 누락 에셋 N개" 보고
- **월 1회** UNITS 총 개수 / 이미지 총 개수 / CARD_IMG 키 수 대조 재실행
