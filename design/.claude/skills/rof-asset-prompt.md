# Realm of Fates — 카드 일러스트 프롬프트 빌더 (rof-asset-prompt)

> **목적**: 카드 id 입력 → 등급/역할/원소 자동 조합 → 일관된 SD/ChatGPT 프롬프트 출력
> 도구: `c:/work/game/tools/build_prompt.py`

---

## 🛠 사용

### 단일 카드
```bash
cd /c/work/game
python tools/build_prompt.py h_m_fire           # 영웅 (근접/원소)
python tools/build_prompt.py sk_godslayer       # 스킬
python tools/build_prompt.py rl_wrath           # 유물

# Negative 함께
python tools/build_prompt.py h_m_fire --negative
```

### 일괄
```bash
python tools/build_prompt.py --all-heroes > heroes_all.txt
python tools/build_prompt.py --all-skills > skills_all.txt
```

### 출력 예시
```
Dark fantasy card illustration, single character portrait, chest-up composition...,
heavy armored warrior, massive sword or battle axe..., 
flaming red and orange palette, volcanic battlefield background, ...
```

---

## 🎯 사용 시점

- **영웅 18장 재생성** (`hero_prompts.txt` 자동 갱신용)
- 새 카드 추가 (`레시피 A` 5단계 — 일러스트 생성)
- 기존 카드 일러스트 품질 개선 시
- ChatGPT 이미지 생성용 프롬프트 일관성 유지

---

## 📐 구성 요소

빌더 내부 구조 (`build_prompt.py`):
- **BASE**: 모든 카드 공통 접두사 (다크 판타지/구도/금지 사항)
- **NEGATIVE**: 모든 카드 공통 네거티브
- **ELEM**: 6원소별 색감/배경/오라
- **ROLE**: 3역할별 캐릭터 묘사 (m=근접, r=원거리, s=지원)
- **SKILL_DESC**: 30개 스킬별 비주얼 설명 (1줄)
- **RELIC_DESC**: 12개 유물별 비주얼 설명 (1줄)

---

## ⚠️ 원칙

1. **일관성 우선**: 같은 원소는 같은 색 팔레트
2. **금지어 자동 회피**: NEGATIVE에 hearthstone/blizzard 포함
3. **카드 id 그대로**: 출력 파일명도 `h_m_fire.png`, `sk_godslayer.png` 형식
4. **빌더 수정 신중**: 18장 일관성을 깨면 18장 모두 재생성 필요

---

## 🔄 새 카드 추가 시 빌더 갱신
1. `js/12_data_skills.js` (또는 unit/relic) 에 데이터 추가
2. `tools/build_prompt.py`의 SKILL_DESC/RELIC_DESC dict에 항목 추가
3. `python tools/build_prompt.py <new_id>` → 프롬프트 생성
4. 이미지 생성 후 `img/<new_id>.png` 배치
5. `js/14_data_images.js`의 CARD_IMG에 매핑 추가
6. 검증: `node tools/game_inspect.js units-grid`
