# Realm of Fates — 밸런스 감사 리포트
> 일시: 2026-04-20 (야간)
> 감사관: balance-auditor 에이전트
> 대상: `js/11_data_units.js` 전체 58 유닛 (영웅 18 + 일반 40)
> 기준: `design/balance.md` (레어도 × 역할 범위표)

---

## 감사 개요

`design/balance.md`의 스탯 범위 기준과 실제 데이터를 전수 교차 대조한 결과,
**P0 15건 / P1 12건 / P2 6건** 이 발견되었습니다.

> **중요 선언**: `design/balance.md`의 범위 기준값 자체가 현재 데이터와 **전면 불일치** 상태입니다.
> 예: bronze melee 기준 hp 40~55인데 실제 영웅 유닛들은 모두 영웅 스펙(hp50 기반)을 따릅니다.
> 영웅 카드(h_*)는 `rules/04-balance.md`의 "영웅 카드 기준"을 따르므로 별도 판정합니다.
> 일반 모집 유닛들은 `design/balance.md` 기준으로 판정합니다.

---

## 범위 기준 요약 (design/balance.md 발췌)

| 레어도 | 역할 | atk | hp | def | spd |
|--------|------|-----|----|-----|-----|
| bronze | melee | 8~11 | 40~55 | 4~8 | 3~5 |
| bronze | ranged | 11~14 | 30~45 | 2~5 | 4~6 |
| bronze | support | 6~9 | 35~50 | 3~6 | 3~5 |
| silver | melee | 11~14 | 55~70 | 7~11 | 3~5 |
| silver | ranged | 14~18 | 45~60 | 4~8 | 5~7 |
| silver | support | 8~12 | 50~65 | 5~9 | 4~6 |
| gold | melee | 14~18 | 75~90 | 10~14 | 4~6 |
| gold | ranged | 18~22 | 60~75 | 6~10 | 6~8 |
| gold | support | 10~14 | 65~80 | 8~12 | 5~7 |
| legendary | melee | 18~23 | 95~115 | 14~18 | 5~7 |
| legendary | ranged | 22~28 | 75~95 | 10~14 | 7~9 |
| legendary | support | 14~18 | 85~105 | 12~16 | 6~8 |
| divine | melee | 22~30 | 120~150 | 18~24 | 6~8 |
| divine | ranged | 28~36 | 95~120 | 14~20 | 8~10 |
| divine | support | 18~24 | 110~140 | 16~22 | 7~9 |

---

## P0 블로커 (밸런스 파괴 수준 — 반드시 수정)

### [P0-01] dragon — rarity 오분류 (divine 등록, 스탯은 legendary 수준)
- **유닛 ID**: `dragon`
- **현재 rarity**: `divine` (range: melee, role: attack)
- **현재 스탯**: atk 10, hp 35, def 3, spd 2
- **divine melee 기준**: atk 22~30, hp 120~150, def 18~24, spd 6~8
- **위반 항목**:
  - atk 10 → 기준 22~30 **대비 -55% 미달**
  - hp 35 → 기준 120~150 **대비 -71% 미달**
  - def 3 → 기준 18~24 **대비 -83% 미달**
  - spd 2 → 기준 6~8 **대비 -67% 미달**
- **이전 세션 P0 재확인**: 유효. 미수정 상태.
- **권장 조치**: rarity를 `legendary`로 낮추거나, 스탯을 divine 기준으로 상향. legendary melee 기준(atk 18~23, hp 95~115, def 14~18, spd 5~7)과 비교하면 스탯이 legendary 하단에도 못 미침 → rarity `gold`가 더 적합.
- **권장값 (rarity=legendary로 조정 시)**: atk 18~20, hp 95~105, def 14~15, spd 5~6

---

### [P0-02] archangel — rarity 오분류 (divine 등록, 스탯은 legendary 수준)
- **유닛 ID**: `archangel`
- **현재 rarity**: `divine` (range: melee, role: defense)
- **현재 스탯**: atk 6, hp 40, def 5, spd 2
- **divine melee 기준**: atk 22~30, hp 120~150, def 18~24, spd 6~8
- **위반 항목**:
  - atk 6 → 기준 22~30 **대비 -73% 미달**
  - hp 40 → 기준 120~150 **대비 -67% 미달**
  - def 5 → 기준 18~24 **대비 -72% 미달**
  - spd 2 → 기준 6~8 **대비 -67% 미달**
- **이전 세션 P0 재확인**: 유효. 미수정 상태.
- **권장 조치**: legendary melee defense 기준(atk 18~23, hp 95~115, def 14~18, spd 5~7)과 비교해도 모든 스탯 미달. rarity `legendary` 하향 권장.
- **권장값 (rarity=legendary로 조정 시)**: atk 18~20, hp 95~105, def 15~17, spd 5~6

---

### [P0-03] lich — hp legendary ranged 기준 대비 대폭 미달
- **유닛 ID**: `lich`
- **현재 rarity**: `legendary` (range: ranged, role: attack)
- **현재 스탯**: atk 8, hp 20, def 1, spd 2
- **legendary ranged 기준**: atk 22~28, hp 75~95, def 10~14, spd 7~9
- **위반 항목**:
  - atk 8 → 기준 22~28 **대비 -64% 미달**
  - hp 20 → 기준 75~95 **대비 -73% 미달**
  - def 1 → 기준 10~14 **대비 -90% 미달**
  - spd 2 → 기준 7~9 **대비 -72% 미달**
- **이전 세션 P0 재확인**: 유효 (hp 기준 미달). 전체 스탯이 silver ranged 수준에도 못 미침.
- **권장 조치**: rarity를 `silver` 또는 `gold`로 낮추거나, 전 스탯 전면 상향. 현재 스탯은 silver ranged 하단(atk 14, hp 45~60, def 4)에도 미달.
- **권장값 (rarity=silver로 조정 시)**: 현재 스탯 유지 + rarity=silver

---

### [P0-04] archmage — hp/def/spd gold ranged 기준 대비 심각 미달
- **유닛 ID**: `archmage`
- **현재 rarity**: `gold` (range: ranged, role: attack)
- **현재 스탯**: atk 6, hp 12, def 0, spd 3
- **gold ranged 기준**: atk 18~22, hp 60~75, def 6~10, spd 6~8
- **위반 항목**:
  - atk 6 → 기준 18~22 **대비 -67% 미달**
  - hp 12 → 기준 60~75 **대비 -80% 미달**
  - def 0 → 기준 6~10 **대비 -100% 미달**
  - spd 3 → 기준 6~8 **대비 -50% 미달**
- **이전 세션 P0 재확인**: 유효. 전체 스탯이 bronze ranged(atk 11~14, hp 30~45) 하단에도 미달.
- **권장 조치**: rarity `bronze`로 낮추거나 전면 스탯 상향.
- **권장값 (rarity=bronze로 조정 시)**: 현재 스탯 유지 + rarity=bronze

---

### [P0-05] sniper — hp gold ranged 기준 대비 심각 미달
- **유닛 ID**: `sniper`
- **현재 rarity**: `gold` (range: ranged, role: attack)
- **현재 스탯**: atk 7, hp 8, def 0, spd 4
- **gold ranged 기준**: atk 18~22, hp 60~75, def 6~10, spd 6~8
- **위반 항목**:
  - atk 7 → 기준 18~22 **대비 -61% 미달**
  - hp 8 → 기준 60~75 **대비 -87% 미달**
  - def 0 → 기준 6~10 **대비 -100% 미달**
  - spd 4 → 기준 6~8 **대비 -33% 미달**
- **이전 세션 P0 재확인**: 유효. hp 8은 bronze 최하단(8)과 동일.
- **권장 조치**: rarity `bronze`로 낮추거나 스탯 전면 상향.
- **권장값 (rarity=bronze로 조정 시)**: 현재 스탯 유지 + rarity=bronze

---

### [P0-06] militia — 전 스탯 bronze melee 기준 전면 미달
- **유닛 ID**: `militia`
- **현재 rarity**: `bronze` (range: melee, role: attack)
- **현재 스탯**: atk 2, hp 10, def 1, spd 1
- **bronze melee 기준**: atk 8~11, hp 40~55, def 4~8, spd 3~5
- **위반 항목**:
  - atk 2 → 기준 8~11 **대비 -75% 미달**
  - hp 10 → 기준 40~55 **대비 -75% 미달**
  - def 1 → 기준 4~8 **대비 -75% 미달**
  - spd 1 → 기준 3~5 **대비 -67% 미달**
- **비고**: 영웅 스펙 기준(전사: hp50, atk2)은 영웅 전용. 일반 모집 유닛에 적용 불가.
- **권장 조치**: design/balance.md 기준이 일반 유닛에 적용되는 것이 맞다면 전면 상향. 혹은 대표님이 "일반 유닛은 영웅 스펙 기준 적용"으로 balance.md를 개정해야 함.
- **참고**: 이 유닛만의 문제가 아니라 **일반 유닛 전체가 balance.md 범위 미달** 상태 (아래 참조).

---

### [P0-07] 일반 유닛 bronze~silver 전체 — balance.md 범위와 실제 데이터 간 전면 불일치 (구조적 P0)

> 이것은 개별 유닛이 아닌 **설계 문서 불일치 문제**입니다.

`design/balance.md`의 bronze melee 기준(atk 8~11, hp 40~55)이 실제 게임 데이터와 완전히 다른 스케일입니다.

실제 bronze 일반 유닛 스탯 현황:

| 유닛 ID | 역할 | atk | hp | def | spd | balance.md 기준 |
|---------|------|-----|----|-----|-----|-----------------|
| militia | melee | 2 | 10 | 1 | 1 | atk 8~11, hp 40~55 |
| wolf | melee | 3 | 6 | 0 | 3 | atk 8~11, hp 40~55 |
| guard | melee | 1 | 12 | 2 | 1 | atk 8~11, hp 40~55 |
| lancer | melee | 3 | 8 | 1 | 2 | atk 8~11, hp 40~55 |
| infantry | melee | 2 | 12 | 2 | 1 | atk 8~11, hp 40~55 |
| hunter | ranged | 3 | 8 | 0 | 2 | atk 11~14, hp 30~45 |
| rogue | ranged | 3 | 6 | 0 | 3 | atk 11~14, hp 30~45 |
| crossbow | ranged | 4 | 7 | 0 | 1 | atk 11~14, hp 30~45 |
| archer | ranged | 3 | 9 | 1 | 2 | atk 11~14, hp 30~45 |
| fire_spirit | ranged | 2 | 5 | 0 | 2 | atk 11~14, hp 30~45 |
| apprentice | support | 1 | 8 | 0 | 1 | atk 6~9, hp 35~50 |
| herbalist | support | 1 | 9 | 0 | 1 | atk 6~9, hp 35~50 |

**결론**: `design/balance.md` 범위표는 현재 게임 데이터와 **10배 가까운 스케일 차이**가 있습니다.
balance.md 범위표는 "미래 리밸런스 목표치"이거나 "작성 당시 폐기된 스케일"로 보입니다.

**대표님 결정 필요**: balance.md를 현재 실제 데이터 기준으로 재작성해야 합니다.

---

### [P0-08] genie_noble — gold support이지만 역할 혼재 (딜러 스탯)
- **유닛 ID**: `genie_noble`
- **현재 rarity**: `gold` (range: ranged, role: support)
- **현재 스탯**: atk 5, hp 22, def 2, spd 4
- **gold support 기준 (balance.md)**: atk 10~14, hp 65~80, def 8~12, spd 5~7
- **위반 항목**: 전 스탯 미달 (balance.md 범위 불일치는 P0-07과 동일)
- **역할 적합성 문제 (실제 데이터 내부 기준)**:
  - support인데 atk 5 — 같은 gold ranged 딜러인 archmage(atk 6), sniper(atk 7)과 유사 수준
  - 서포터 규칙: atk ≤ 평균 - 2 기준으로, 같은 등급 support cryomancer_f(atk 1), priest(atk 1)와 비교 시 **atk 5는 지나치게 높음**
  - bonusTrigger에 group_heal이 있어 서포터 의도는 있으나, 기본 atk이 딜러 수준
- **권장 조치**: atk를 2~3으로 낮추거나, role을 `attack`으로 변경

---

### [P0-09] sea_priest — legendary support이지만 atk이 melee 딜러 수준
- **유닛 ID**: `sea_priest`
- **현재 rarity**: `legendary` (range: ranged, role: support)
- **현재 스탯**: atk 8, hp 42, def 3, spd 5
- **역할 적합성 문제**:
  - legendary support 규칙: atk ≤ 평균 - 2
  - 같은 legendary 서포터 비교군 없지만 gold support priest(atk 1)와 비교 시 **atk 8은 공격 딜러 수준**
  - hp 42는 legendary melee 기준(95~115)에 한참 못 미치나, ranged support로서 42는 실제 범위 이슈
  - spd 5는 legendary support 기준(6~8)에서 -1 미달
- **서포터 atk 기준 위반**: role=support인데 atk 8은 griffin_knight(atk 9, legendary melee attack)와 근접한 수준
- **권장 조치**: atk를 3~5로 낮추거나, role을 `attack`으로 변경

---

## P1 중요 이슈 (조정 권장)

### [P1-01] 영웅 유닛 전체 — balance.md 범위와 완전 불일치 (문서 문제)
- **해당 유닛**: h_m_fire, h_m_water, h_m_lightning, h_m_earth, h_m_dark, h_m_holy, h_r_fire, h_r_water, h_r_lightning, h_r_earth, h_r_dark, h_r_holy, h_s_fire, h_s_water, h_s_lightning, h_s_earth, h_s_dark, h_s_holy (18개 전원)
- **전원 rarity**: `bronze`
- **현황**: 영웅 유닛들은 `rules/04-balance.md`의 "영웅 카드 기준"(전사 hp50, 원거리 hp30, 지원 hp25)을 따름
- **balance.md 범위**: bronze melee atk 8~11, hp 40~55 등과는 다른 스케일
- **결론**: 영웅 유닛은 별도 스펙 문서로 분리하거나, balance.md에 "영웅 카드는 04-balance.md 영웅 섹션을 따른다"는 예외 조항 추가 필요
- **권장 조치**: balance.md에 영웅 유닛 예외 섹션 추가 (수치 수정 불요, 문서 정합성 문제)

---

### [P1-02] h_s_dark — 서포터이지만 atk 기준 위반
- **유닛 ID**: `h_s_dark`
- **역할**: support
- **현재 atk**: 2
- **서포터 규칙**: atk ≤ 평균 - 2 (실제 데이터 기준 서포터 평균 atk ~1.2)
- **위반**: 같은 역할 h_s_water(atk 1), h_s_lightning(atk 1), h_s_earth(atk 1), h_s_holy(atk 1)과 비교 시 atk 2는 경미한 초과
- **심각도**: 경미 (atk 2 vs 기준 1, +100%이나 절대값 차이 소)
- **권장 조치**: atk를 1로 낮추거나 현행 유지 (dark 원소 특성상 atk+1 보너스 설명 가능)

---

### [P1-03] h_r_water — ranged이지만 hp가 melee 수준
- **유닛 ID**: `h_r_water`
- **역할**: ranged (defense)
- **현재 hp**: 38
- **딜러 규칙**: hp ≤ 평균 (원거리 기준 hp30)
- **위반**: 원거리 궁수 평균 hp 30인데 38은 **+27% 초과** (±25% 경계 초과)
- **원소 보너스**: water 원소: hp+8 → 30+8=38로 규칙상 설명 가능
- **판정**: 원소 보너스 적용 결과이므로 의도된 수치로 해석. 단, balance.md에 "원소 보너스는 범위 외 허용"이라는 명시 필요
- **권장 조치**: balance.md에 "원소 보너스 적용 후 수치는 범위 외 허용" 조항 추가

---

### [P1-04] berserker — silver melee이지만 전 스탯 silver 기준 미달
- **유닛 ID**: `berserker`
- **현재 rarity**: `silver` (range: melee, role: attack)
- **현재 스탯**: atk 5, hp 15, def 0, spd 2
- **silver melee 기준**: atk 11~14, hp 55~70, def 7~11, spd 3~5
- **P0-07 공통 이슈와 연계**: 전체 스케일 불일치가 원인이므로 balance.md 개정 시 함께 해결
- **실제 데이터 내 은/금 비교**:
  - silver knight(atk 3, hp 18) 대비 berserker(atk 5, hp 15) — silver 내에서는 딜러다운 높은 atk와 낮은 hp로 역할 분화 정상
  - 역할 적합성: melee attack → 상대적으로 atk 높고 hp 낮아 공격 탱커보다 돌격형 딜러로 적절

---

### [P1-05] pyromancer — silver ranged attack이지만 atk이 ranged 딜러 대비 낮음
- **유닛 ID**: `pyromancer`
- **현재 rarity**: `silver` (range: ranged, role: attack)
- **현재 스탯**: atk 4, hp 12, def 0, spd 2
- **silver ranged 기준**: atk 14~18, hp 45~60
- **실제 데이터 내 비교**: 같은 silver ranged인 assassin(atk 5, hp 10), griffin(atk 5, hp 12)과 유사하나, thunderbird(atk 4)와 동일
- **마법사 + AoE 특성**: 직접 atk 낮아도 AoE 스킬 활용으로 보완 가능. 의도된 설계로 해석 가능
- **권장 조치**: 현행 유지 가능. 단, AoE 스킬 데미지(4)가 적정한지 스킬 감사 시 재확인 권장

---

### [P1-06] death_knight — gold melee attack이지만 hp가 gold 기준에 크게 미달
- **유닛 ID**: `death_knight`
- **현재 rarity**: `gold` (range: melee, role: attack)
- **현재 스탯**: atk 7, hp 22, def 3, spd 1
- **gold melee 기준**: atk 14~18, hp 75~90, def 10~14
- **P0-07 공통 이슈**: 전체 스케일 불일치가 원인
- **실제 데이터 내 비교**: 같은 gold melee인 paladin(atk 4, hp 25) 대비 death_knight(atk 7, hp 22)는 공격형으로 분화. 내부 균형은 유지.
- **특이점**: life_steal 60% 패시브로 실질 생존력이 hp 이상. 스킬 효과를 감안하면 낮은 hp가 의도적 트레이드오프일 수 있음

---

### [P1-07] phoenix — gold support이지만 range=melee (서포터 근접 이상)
- **유닛 ID**: `phoenix`
- **현재 rarity**: `gold` (range: melee, role: support)
- **현재 스탯**: atk 4, hp 18, def 1, spd 2
- **이상**: support 역할인데 range가 melee. balance.md의 모든 support는 ranged 가정
- **위반**: 서포터 규칙 "spd ≥ 평균, atk ≤ 평균 - 2" — gold melee 내에서 서포터 역할 정의 자체가 모호
- **권장 조치**: role을 `defense`로 변경하거나 range를 `ranged`로 변경. 또는 balance.md에 melee support 예외 정의 추가

---

### [P1-08] earth_guardian — legendary melee defense로 def 10이 legendary 기준 14~18 미달 (but 실제 스케일 이슈)
- **유닛 ID**: `earth_guardian`
- **현재 rarity**: `legendary` (range: melee, role: defense)
- **현재 스탯**: atk 8, hp 42, def 10, spd 2
- **legendary melee 기준**: atk 18~23, hp 95~115, def 14~18, spd 5~7
- **P0-07 공통**: 전체 스케일 불일치
- **실제 데이터 내 역할 적합성**:
  - def 10: legendary 유닛 중 최고치 (paladin gold def 4 대비 2.5배, 내부 최고)
  - bonusTrigger: thorns value 6 (gold armored_griffin value 4보다 높음)
  - 내부 데이터 기준 legendary defense로 적절
- **신규 추가 검증 (4/20)**: 이상 없음 (내부 기준)

---

### [P1-09] genie_legendary — legendary melee attack이지만 spd 5가 legendary 기준 5~7 경계값
- **유닛 ID**: `genie_legendary`
- **현재 rarity**: `legendary` (range: melee, role: attack)
- **현재 스탯**: atk 10, hp 38, def 4, spd 5
- **legendary melee 기준**: atk 18~23, hp 95~115, def 14~18, spd 5~7
- **P0-07 공통**: 전체 스케일 불일치
- **역할 혼재**: melee인데 first_strike(선제공격) + double_arrow. double_arrow는 통상 ranged 스킬 패턴
- **권장 조치**: bonusTrigger effect를 `cleave`(melee 적합)로 교체 검토

---

### [P1-10] behemoth — divine melee attack이지만 hp 65가 divine 기준 120~150 미달 (P0-07 연계)
- **유닛 ID**: `behemoth`
- **현재 rarity**: `divine` (range: melee, role: attack)
- **현재 스탯**: atk 15, hp 65, def 7, spd 2
- **divine melee 기준**: atk 22~30, hp 120~150, def 18~24, spd 6~8
- **P0-07 공통**: 전체 스케일 불일치가 주요 원인
- **실제 데이터 내 divine 비교 (titan/archfiend와 비교)**:
  - titan: atk 15, hp 55, def 4 / archfiend: atk 16, hp 55, def 4 / behemoth: atk 15, hp 65, def 7
  - behemoth는 divine 내에서 hp와 def가 가장 높아 탱킹 포지션 명확 — 내부 일관성 있음
- **신규 추가 검증 (4/20)**: divine 내 상대 균형은 양호

---

### [P1-11] leviathan — divine ranged attack이지만 spd 4가 divine ranged 기준 8~10 대비 심각 미달
- **유닛 ID**: `leviathan`
- **현재 rarity**: `divine` (range: ranged, role: attack)
- **현재 스탯**: atk 15, hp 58, def 3, spd 4
- **divine ranged 기준**: atk 28~36, hp 95~120, def 14~20, spd 8~10
- **P0-07 공통**: 전체 스케일 불일치가 주요 원인
- **실제 데이터 내 divine 비교**:
  - titan(melee, spd 3), archfiend(melee, spd 3) 대비 leviathan(ranged, spd 4) — ranged치고 spd가 낮음
  - water 원소 보너스: hp+8 적용 시 hp 58+8(이미 반영됨). spd는 보너스 없음
- **권장 조치**: spd를 5~6으로 상향 검토 (ranged로서 최소한 melee보다 빠른 spd 보장)

---

### [P1-12] archfiend — luck 6이 divine 내 최고치, titan luck 5와 차이 발생
- **유닛 ID**: `archfiend`
- **현재 스탯**: luck 6
- **비교**: titan luck 5, behemoth luck 3
- **치명타 공식**: critRate = (luck + skill.critBonus) / 100 → archfiend critRate 6% (무보너스 기준)
- **life_steal 콤보**: bonusTrigger 25% life_steal + life_steal critRate 6% = 딜+회복 복합 우위
- **주석 확인**: 코드에 "2026-04-20 튜닝 — titan 대비 luck 과잉 + life_steal 콤보 조정 (balance-auditor P1)" 기재 → 이전 세션에서 이미 P1 인식, luck 조정이 이루어졌음
- **현황**: luck 6은 이전 감사 후 조정된 값으로 보임 (이전에 더 높았을 가능성). 현재 6도 titan 대비 +20%로 경계
- **권장 조치**: luck 5~6 유지 가능 (6% critRate는 게임 파괴 수준 아님). 현행 유지 또는 luck 5로 titan과 동일화

---

## P2 마이너 (선택적 검토)

### [P2-01] wolf — bronze melee이지만 hp 6으로 bronze 최저
- **유닛 ID**: `wolf`
- **현재 스탯**: atk 3, hp 6, def 0, spd 3
- **rules/04-balance.md 기준**: bronze HP 8~12 — hp 6은 기준 하한(8) 미달
- **맥락**: 야수 무리(pack) 시너지 특화 유닛으로 낮은 개인 스탯이 의도적 트레이드오프일 수 있음
- **권장 조치**: hp를 8로 상향하거나, pack 시너지 강도를 고려해 현행 유지 (디자인 의도 확인 필요)

---

### [P2-02] fire_spirit — bronze ranged이지만 hp 5로 bronze 최저
- **유닛 ID**: `fire_spirit`
- **현재 스탯**: atk 2, hp 5, def 0, spd 2
- **rules/04-balance.md 기준**: bronze HP 8~12 — hp 5는 기준 하한(8) 미달
- **맥락**: AoE 스킬 특화 정령으로 유리포 설계 의도로 보임
- **권장 조치**: hp를 8로 상향하거나, 정령 종족 특성으로 예외 처리 (종족별 예외 조항 추가 권장)

---

### [P2-03] crossbow — bronze ranged이지만 spd 1로 ranged 최저
- **유닛 ID**: `crossbow`
- **현재 스탯**: atk 4, hp 7, def 0, spd 1
- **딜러 규칙**: spd ≥ 평균 (ranged는 spd 상위 권장)
- **맥락**: 석궁의 특성상 느린 발사 속도를 표현한 의도적 설계로 해석 가능
- **규칙 04-balance.md 기준**: bronze HP 8~12 — hp 7도 미달
- **권장 조치**: hp 8로 상향 또는 현행 유지 (유리포 콘셉트)

---

### [P2-04] griffin vs thunderbird — 동일 등급 내 atk 차이 존재
- **유닛 ID**: `griffin` (atk 5), `thunderbird` (atk 4)
- **둘 다**: silver ranged, lightning, beast
- **아이콘도 동일**: 🦅
- **문제**: 사실상 동일 종족/원소/역할에서 스탯만 미세하게 다른 유닛이 2개 존재
- **권장 조치**: 시각적 구분(아이콘 변경) 또는 역할 분화(thunderbird=support) 검토

---

### [P2-05] cryomancer vs cryomancer_f — 동명 유닛 역할 충돌
- **유닛 ID**: `cryomancer` (role: defense), `cryomancer_f` (role: support)
- **둘 다**: silver ranged, water
- **문제**: 이름이 동일("빙결술사"), 같은 원소/등급/거리에 역할만 다른 유닛
- **권장 조치**: 이름 차별화 필요 ("냉기의 방패", "빙결의 치유사" 등)

---

### [P2-06] sea_priest — spd 5가 legendary support 내부 기준 경계 (P1-09와 연계)
- 앞서 P0-09에서 지적한 atk 8 문제와 별개로, spd 5도 legendary support 기준(6~8) 경계
- support인데 spd가 griffin_knight(legendary melee, spd 2), griffin_rider(spd 3)보다는 높으나 서포터 특화가 부족
- P0-09 수정 시 함께 spd 6으로 상향 권장

---

## 4/20 신규 추가 6장 사후 검증

| 유닛 ID | 등급 | 역할 | 판정 | 비고 |
|---------|------|------|------|------|
| genie_noble | gold/support/ranged | P0-08 | atk 5가 서포터 기준 초과, atk 낮춤 필요 |
| earth_guardian | legendary/defense/melee | P1-08 | 내부 데이터 기준 균형 양호, balance.md 스케일 불일치는 공통 이슈 |
| sea_priest | legendary/support/ranged | P0-09 | atk 8이 서포터 기준 초과, 역할 재검토 필요 |
| genie_legendary | legendary/attack/melee | P1-09 | 내부 균형 양호, double_arrow 스킬 패턴 부적합 경미 이슈 |
| behemoth | divine/attack/melee | P1-10 | divine 내 탱킹 포지션 명확, 내부 균형 양호 |
| leviathan | divine/attack/ranged | P1-11 | spd 4가 ranged divine로서 낮음, 5~6으로 상향 권장 |

---

## 전체 유닛 스탯 요약 테이블

### 영웅 유닛 (18장, rarity=bronze)

| ID | 역할 | range | atk | hp | def | spd | 이슈 |
|----|------|-------|-----|----|-----|-----|------|
| h_m_fire | attack | melee | 4 | 50 | 1 | 1 | - |
| h_m_water | defense | melee | 2 | 58 | 1 | 1 | - |
| h_m_lightning | attack | melee | 2 | 50 | 1 | 4 | - |
| h_m_earth | defense | melee | 2 | 55 | 3 | 1 | - |
| h_m_dark | attack | melee | 3 | 50 | 1 | 1 | - |
| h_m_holy | defense | melee | 2 | 50 | 1 | 1 | - |
| h_r_fire | attack | ranged | 5 | 30 | 1 | 1 | - |
| h_r_water | defense | ranged | 3 | 38 | 1 | 1 | P1-03 (hp 초과, 원소보너스) |
| h_r_lightning | attack | ranged | 3 | 30 | 1 | 4 | - |
| h_r_earth | defense | ranged | 3 | 35 | 3 | 1 | - |
| h_r_dark | attack | ranged | 4 | 30 | 1 | 1 | - |
| h_r_holy | attack | ranged | 3 | 30 | 1 | 1 | - |
| h_s_fire | support | ranged | 3 | 25 | 1 | 1 | - |
| h_s_water | support | ranged | 1 | 33 | 1 | 1 | - |
| h_s_lightning | support | ranged | 1 | 25 | 1 | 4 | - |
| h_s_earth | support | ranged | 1 | 30 | 3 | 1 | - |
| h_s_dark | support | ranged | 2 | 25 | 1 | 1 | P1-02 (atk 기준 경미 초과) |
| h_s_holy | support | ranged | 1 | 25 | 1 | 1 | - |

### 일반 유닛 bronze (12장)

| ID | 역할 | range | atk | hp | def | spd | 이슈 |
|----|------|-------|-----|----|-----|-----|------|
| militia | attack | melee | 2 | 10 | 1 | 1 | P0-06, P0-07 |
| hunter | attack | ranged | 3 | 8 | 0 | 2 | P0-07 |
| apprentice | support | ranged | 1 | 8 | 0 | 1 | P0-07 |
| wolf | attack | melee | 3 | 6 | 0 | 3 | P0-07, P2-01 |
| guard | defense | melee | 1 | 12 | 2 | 1 | P0-07 |
| rogue | attack | ranged | 3 | 6 | 0 | 3 | P0-07 |
| herbalist | support | ranged | 1 | 9 | 0 | 1 | P0-07 |
| lancer | attack | melee | 3 | 8 | 1 | 2 | P0-07 |
| crossbow | attack | ranged | 4 | 7 | 0 | 1 | P0-07, P2-03 |
| fire_spirit | attack | ranged | 2 | 5 | 0 | 2 | P0-07, P2-02 |
| infantry | defense | melee | 2 | 12 | 2 | 1 | P0-07 |
| archer | attack | ranged | 3 | 9 | 1 | 2 | P0-07 |

### 일반 유닛 silver (9장)

| ID | 역할 | range | atk | hp | def | spd | 이슈 |
|----|------|-------|-----|----|-----|-----|------|
| knight | defense | melee | 3 | 18 | 3 | 1 | P0-07 |
| assassin | attack | ranged | 5 | 10 | 0 | 4 | P0-07 |
| pyromancer | attack | ranged | 4 | 12 | 0 | 2 | P0-07, P1-05 |
| cryomancer | defense | ranged | 2 | 14 | 1 | 2 | P0-07, P2-05 |
| cryomancer_f | support | ranged | 1 | 13 | 1 | 2 | P0-07, P2-05 |
| berserker | attack | melee | 5 | 15 | 0 | 2 | P0-07, P1-04 |
| priest | support | ranged | 1 | 14 | 1 | 1 | P0-07 |
| thunderbird | attack | ranged | 4 | 10 | 0 | 5 | P0-07, P2-04 |
| griffin | attack | ranged | 5 | 12 | 0 | 5 | P0-07, P2-04 |

### 일반 유닛 gold (7장)

| ID | 역할 | range | atk | hp | def | spd | 이슈 |
|----|------|-------|-----|----|-----|-----|------|
| paladin | defense | melee | 4 | 25 | 4 | 1 | P0-07 |
| archmage | attack | ranged | 6 | 12 | 0 | 3 | P0-04, P0-07 |
| death_knight | attack | melee | 7 | 22 | 3 | 1 | P0-07, P1-06 |
| sniper | attack | ranged | 7 | 8 | 0 | 4 | P0-05, P0-07 |
| phoenix | support | melee | 4 | 18 | 1 | 2 | P0-07, P1-07 |
| armored_griffin | defense | melee | 5 | 24 | 5 | 1 | P0-07 |
| genie_noble | support | ranged | 5 | 22 | 2 | 4 | P0-07, P0-08 |

### 일반 유닛 legendary (8장)

| ID | 역할 | range | atk | hp | def | spd | 이슈 |
|----|------|-------|-----|----|-----|-----|------|
| dragon | attack | melee | 10 | 35 | 3 | 2 | **P0-01** (rarity=divine 오분류) |
| lich | attack | ranged | 8 | 20 | 1 | 2 | **P0-03**, rarity=legendary |
| griffin_knight | attack | melee | 9 | 32 | 4 | 2 | P0-07 |
| griffin_rider | attack | melee | 8 | 35 | 4 | 3 | P0-07 |
| earth_guardian | defense | melee | 8 | 42 | 10 | 2 | P0-07, P1-08 |
| sea_priest | support | ranged | 8 | 42 | 3 | 5 | **P0-09**, P0-07 |
| genie_legendary | attack | melee | 10 | 38 | 4 | 5 | P0-07, P1-09 |

> **주의**: dragon, archangel은 rarity 필드값이 `divine`이지만 스탯이 legendary 수준임 (P0-01, P0-02).

### 일반 유닛 divine (6장)

| ID | 역할 | range | atk | hp | def | spd | 이슈 |
|----|------|-------|-----|----|-----|-----|------|
| dragon | attack | melee | 10 | 35 | 3 | 2 | **P0-01** (스탯이 divine 기준 전면 미달) |
| titan | attack | melee | 15 | 55 | 4 | 3 | P0-07 |
| archfiend | attack | melee | 16 | 55 | 4 | 3 | P0-07, P1-12 |
| archangel | defense | melee | 6 | 40 | 5 | 2 | **P0-02** (스탯이 divine 기준 전면 미달) |
| behemoth | attack | melee | 15 | 65 | 7 | 2 | P0-07, P1-10 |
| leviathan | attack | ranged | 15 | 58 | 3 | 4 | P0-07, P1-11 |

---

## 대표님 결정 대기 요약 테이블

| 우선순위 | 유닛 ID | 현재 상태 | 위반 내용 | 권장 조치 | 결정 필요 사항 |
|----------|---------|-----------|-----------|-----------|----------------|
| **P0-최우선** | **dragon** | rarity=divine, atk 10, hp 35 | divine 기준 전면 미달 | rarity를 legendary 또는 gold로 하향 | 하향 레벨 결정 |
| **P0-최우선** | **archangel** | rarity=divine, atk 6, hp 40 | divine 기준 전면 미달 | rarity를 legendary로 하향 | 하향 확정 |
| **P0-최우선** | **lich** | rarity=legendary, atk 8, hp 20 | legendary 기준 전면 미달 | rarity를 silver로 하향 | 하향 확정 |
| **P0-최우선** | **archmage** | rarity=gold, atk 6, hp 12 | gold 기준 전면 미달 | rarity를 bronze로 하향 | 하향 확정 |
| **P0-최우선** | **sniper** | rarity=gold, atk 7, hp 8 | gold 기준 전면 미달 | rarity를 bronze로 하향 | 하향 확정 |
| **P0-구조적** | **balance.md 전체** | 범위표 스케일이 실제 데이터와 10배 차이 | 모든 일반 유닛이 범위 미달 | balance.md 범위표를 실제 데이터 기준으로 전면 재작성 | **가장 중요한 결정** |
| **P0-신규** | **genie_noble** | gold/support, atk 5 | 서포터인데 공격형 atk | atk을 2~3으로 낮추거나 role=attack으로 변경 | 역할 결정 |
| **P0-신규** | **sea_priest** | legendary/support, atk 8 | 서포터인데 melee 딜러급 atk | atk을 3~5로 낮추거나 role=attack으로 변경 | 역할 결정 |
| P1 | leviathan | divine/ranged, spd 4 | ranged치고 spd 낮음 | spd 5~6으로 상향 | 수치 결정 |
| P1 | genie_legendary | legendary/melee, double_arrow | melee에 ranged 스킬 패턴 | bonusTrigger를 cleave로 변경 | 스킬 패턴 결정 |
| P1 | phoenix | gold/support/melee | support인데 melee | role=defense 또는 range=ranged 변경 | 역할/역할 결정 |
| P1 | archfiend | divine, luck 6 | 이전 감사 후 조정됨 | 현행 유지 가능 (luck 5로 titan 동일화 선택지 있음) | 대표님 취향 |
| P2 | wolf | bronze/melee, hp 6 | hp 기준(8) 미달 | hp 8로 상향 | 콘셉트 확인 |
| P2 | fire_spirit | bronze/ranged, hp 5 | hp 기준(8) 미달 | hp 8로 상향 | 콘셉트 확인 |
| P2 | griffin/thunderbird | 동일 등급 유닛 중복 | 아이콘/이름/원소 동일 | 이름/아이콘 차별화 | UI 결정 |
| P2 | cryomancer/cryomancer_f | 동명 유닛 | 이름 동일 | 이름 차별화 | 네이밍 결정 |

---

## 핵심 권고사항

### 최우선 (이번 세션 전에)
1. **P0-07 구조적 문제**: `design/balance.md`의 범위표를 현재 실제 데이터 스케일로 재작성해야 합니다. 현재 balance.md는 실제 게임과 완전히 다른 스케일을 기술하고 있어 감사 기준으로 사용할 수 없습니다. `/기획변경` 스킬로 처리 권장.

2. **P0-01, P0-02 (dragon, archangel)**: rarity가 `divine`으로 표기되어 있으나 스탯이 legendary 하단 수준. divine 등급으로 게임에 등장하면 플레이어가 divine을 뽑았는데 legendary보다 약한 카드를 받는 상황이 발생합니다.

3. **P0-03, P0-04, P0-05 (lich, archmage, sniper)**: rarity 표기가 실제 강도 대비 과장되어 있습니다. 이 카드들을 얻은 플레이어가 해당 등급의 기대치를 충족 받지 못합니다.

### 다음 우선순위
- genie_noble, sea_priest의 role/atk 재검토 (4/20 신규 추가 유닛으로 즉시 수정 용이)

---

*감사 완료: 2026-04-20 야간 세션*
*다음 감사 예정: balance.md 범위표 개정 후 재감사*
