# 밸런스 감사 보고서 — 2026-05-02

> 감사관: balance-auditor (독립 에이전트)
> 기준: `.claude/rules/04-balance.md` (2026-04-21 A안 정본)
> 대상: `js/11_data_units.js` 전 유닛 (bronze 13 / silver 13 / gold 10 / legendary 11 / divine 4 = 총 51종)
> 목적: 2026-04-29 핸드오프 backlog P0 5건 재감사 + 신규 P0 탐색

---

## 1. P0 backlog 5건 재감사

### 1-1. 범위 체크 기준표 (04-balance.md)

| 등급 | 역할 | atk | hp | def | spd | nrg |
|---|---|---|---|---|---|---|
| gold | attack | 6~9 | 15~25 | 0~3 | 2~5 | 3~20 |
| gold | defense | 4~6 | 22~30 | 4~6 | 1~2 | 4~8 |
| gold | support | 3~6 | 18~24 | 1~3 | 2~4 | 6~20 |
| legendary | attack | 8~12 | 25~42 | 1~5 | 2~5 | 5~25 |
| legendary | defense | 7~10 | 40~50 | 8~14 | 2~3 | 5~10 |
| legendary | support | 6~9 | 38~48 | 3~6 | 4~6 | 20~25 |
| silver | attack | 4~6 | 10~18 | 0~2 | 2~5 | 2~12 |
| silver | support | 1~3 | 13~16 | 1~2 | 1~2 | 14~16 |

---

### 1-2. archmage (gold / attack / ranged)

| 스탯 | 현재값 | 허용 범위 | 판정 |
|---|---|---|---|
| atk | 6 | 6~9 | 통과 |
| hp | 18 | 15~25 | 통과 |
| def | 0 | 0~3 | 통과 |
| spd | 3 | 2~5 | 통과 |
| nrg | 20 | 3~20 | 통과 (경계값) |

**역할 적합성 (딜러: atk 상위, hp 하위)**
- atk=6: gold attack 평균 7.5, 현재 -20% → 경고
- hp=18: gold attack 평균 20, 현재 -10% → 허용
- spd=3: 중위 — 딜러 기준 하위 경계, 허용

**판정: 경고 (atk 낮음)**

> atk=6은 gold attack 범위 최솟값. 평균(7.5) 대비 -20% 로 딜러 역할치고 공격력이 빈약함.
> 다만 스펠 딜러 컨셉(nrg 20, double_cast 스킬)으로 정당화 가능. P0 강등.

**권장 조치:** P0 → P1 강등. atk를 7~8로 상향하거나 현 값 유지 + 컨셉 주석 추가.

---

### 1-3. sniper (gold / attack / ranged)

| 스탯 | 현재값 | 허용 범위 | 판정 |
|---|---|---|---|
| atk | 6 | 6~9 | 통과 (경계값) |
| hp | 16 | 15~25 | 통과 |
| def | 0 | 0~3 | 통과 |
| spd | 4 | 2~5 | 통과 |
| nrg | 5 | 3~20 | 통과 |
| luck | 5 | (제한 없음) | — |

**역할 적합성 (딜러: atk 상위, hp 하위, spd 중·상위)**
- atk=6: 범위 최솟값, 평균(7.5) 대비 -20% → archmage 와 동일 경고
- hp=16: 평균(20) 대비 -20% → 딜러 기준으로 오히려 적합 (hp 낮은 것이 딜러)
- spd=4: 상위 — 딜러 기준 적합
- luck=5: 치명타율 5% 추가. pierce(방어무시) + headshot(HP 10% 즉사) 조합은 강력하나 luck 자체는 허용 범위 내

**판정: 경고 (atk 낮음, archmage와 동일 패턴)**

**권장 조치:** P0 → P1 강등. atk 7로 상향 권장. luck 5는 pierce + headshot 스킬 조합상 과도하지 않음.

---

### 1-4. lich (legendary / attack / ranged)

| 스탯 | 현재값 | 허용 범위 | 판정 |
|---|---|---|---|
| atk | 8 | 8~12 | 통과 (경계값) |
| hp | 28 | 25~42 | 통과 |
| def | 1 | 1~5 | 통과 |
| spd | 2 | 2~5 | 통과 (경계값) |
| nrg | 25 | 5~25 | 통과 (경계값) |

**역할 적합성 (딜러: atk 상위, hp 하위)**
- atk=8: legendary attack 최솟값, 평균(10) 대비 -20% → 경고
- hp=28: 평균(33.5) 대비 -16% → 딜러 기준 적합 (낮은 hp)
- nrg=25: 상한값. drain(패시브 80% 흡수) + raise_dead 조합으로 지속력 과강 가능성

**판정: 경고 (atk 낮음, nrg 상한값, 스킬 시너지 우려)**

> drain 80% 확률 + life_steal 계열은 legendary 단계에서 사실상 자가 회복 무한에 가까움.
> nrg=25 + nrgReg=4 조합 추가 주의.

**권장 조치:** P0 → P1 강등. atk 9~10 상향 권장. drain 확률 0.6~0.7로 하향 검토.

---

### 1-5. pirate (silver / attack / melee)

| 스탯 | 현재값 | 허용 범위 | 판정 |
|---|---|---|---|
| atk | 4 | 4~6 | 통과 |
| hp | 12 | 10~18 | 통과 |
| def | 0 | 0~2 | 통과 |
| spd | 3 | 2~5 | 통과 |
| nrg | 2 | 2~12 | 통과 |

**rarity 적합성 검토**
- silver melee attack: 스탯 모두 범위 내
- 컨셉(해적 / melee / attack): silver 등급 적합. 바닷물 원소(water)는 melee attack 치고 이례적이나 금지 규칙 없음
- 스킬: crit 15% (silver 기준 단일 효과 — 적합), stealth 20% (보조 트리거 — 적합)
- 기존 P0 의혹: "rarity가 lore/스탯과 불일치 또는 P2W 분포" → 수치상 silver 범위 완전 통과

**판정: 통과 — P0 철회**

> silver 범위 내 모든 스탯 적합. P2W 분포 우려는 드롭률 테이블 기준으로 silver 30%(일반)/40%(엘리트)/30%(보스) — 과도한 강세 없음.

---

### 1-6. dark_shaman (gold / support / ranged)

| 스탯 | 현재값 | 허용 범위 | 판정 |
|---|---|---|---|
| atk | 3 | 3~6 | 통과 (경계 최솟값) |
| hp | 18 | 18~24 | 통과 (경계 최솟값) |
| def | 1 | 1~3 | 통과 |
| spd | 2 | 2~4 | 통과 (경계 최솟값) |
| nrg | 15 | 6~20 | 통과 |

**역할 적합성 (서포터: nrg·spd 상위, atk 하위)**
- atk=3: 최솟값 — 서포터 기준 적합 (atk 하위)
- spd=2: 최솟값. 서포터는 spd 상위여야 하나 최솟값 → 경고
- nrg=15: 중위 — 적합

**rarity 적합성 (gold support)**
- 스킬: drain 패시브 50% + raise_dead 25% 조합
- drain(아군 회복)은 서포터 스킬로 적합. raise_dead(적을 아군으로 전환)는 gold 단계에서 강력한 효과
- rarity gold 기준: 2~3개 효과 조합 — raise_dead 25% 트리거는 gold 허용 범위 내

**판정: 경고 (spd 최솟값, 서포터 역할 부적합)**

> spd=2는 gold support 최솟값으로 서포터 불문율 "spd 상위" 위반에 근접.
> rarity 자체는 gold 적합. P0 철회, P1로 강등.

**권장 조치:** spd 3으로 1 상향. 서포터 역할에 맞게 nrg 상향(16~18) 도 검토 가능.

---

## 2. P0 backlog 5건 결론

| 유닛 | 이전 판정 | 재감사 결과 | 조치 |
|---|---|---|---|
| archmage | P0 (hp 범위 초과) | **경고** — 범위 내, atk 낮음 | P0 철회 → P1 |
| sniper | P0 (hp 범위 초과) | **경고** — 범위 내, atk 낮음 | P0 철회 → P1 |
| lich | P0 (hp 범위 초과) | **경고** — 범위 내, 스킬 시너지 우려 | P0 철회 → P1 |
| pirate | P0 (rarity 불일치) | **통과** — 범위·lore 적합 | P0 철회 |
| dark_shaman | P0 (rarity 불일치) | **경고** — spd 최솟값, 서포터 부적합 | P0 철회 → P1 |

> **결론: 현재 데이터 기준 범위 초과 P0는 5건 모두 해소됨.** 다만 경고 4건은 P1로 관리 필요.

---

## 3. 신규 P0 발견 (전수 감사)

### 3-1. sea_priest (legendary / support / ranged) — P0

| 스탯 | 현재값 | 허용 범위 | 판정 |
|---|---|---|---|
| atk | **8** | 6~9 | 범위 내이나 **서포터 불문율 위반** |
| hp | 42 | 38~48 | 통과 |
| def | 3 | 3~6 | 통과 |
| spd | **5** | 4~6 | 통과 |
| nrg | 22 | 20~25 | 통과 |

**역할 적합성 위반 (서포터 불문율: atk 하위)**
- legendary support atk 범위 6~9, 평균 7.5
- sea_priest atk=8: 평균 대비 +6.7% — 수치는 허용 범위이나
- **서포터 불문율 "atk 하위"와 정반대**: sea_priest는 서포터 중 가장 높은 atk=8
- 비교: 같은 legendary support인 archangel은 atk=7, griffin_rider처럼 attack 역할 유닛과 동급
- hpReg=4 + mass_heal(HP+8) + spd=5 조합: legendary support 중 압도적 힐량

**추가 위반: hp=42, atk=8 동시 상위**
- legendary support hp 평균: (38+48)/2 = 43, hp=42 — 평균 부근이나
- atk=8(상위) + hp=42(평균) + spd=5(상위) + nrg=22(상위) + hpReg=4 = 전 스탯 중·상위
- 딜러보다 공격적이고 탱커보다 지속력 있는 올라운더 → 역할 정체성 붕괴

**판정: P0 — 역할 적합성 위반 (서포터 불문율: atk 하위 미충족)**

| 항목 | 현재값 | 권장값 | 이유 |
|---|---|---|---|
| atk | 8 | **5~6** | 서포터 불문율 "atk 하위". 6 이하로 조정. |
| hpReg | 4 | **2~3** | atk 낮춰도 힐량 보존 시 과강. mass_heal HP+8은 이미 강력. |

---

### 3-2. genie_noble (gold / support / ranged) — 경고 (P1)

| 스탯 | 현재값 | 허용 범위 | 판정 |
|---|---|---|---|
| atk | **5** | 3~6 | 범위 내, 평균(4.5) 대비 +11% |
| hp | 22 | 18~24 | 통과 |
| def | 2 | 1~3 | 통과 |
| spd | 4 | 2~4 | 통과 (상한값) |
| nrg | **20** | 6~20 | 통과 (상한값) |

**역할 적합성 (서포터 불문율: atk 하위)**
- atk=5: gold support 평균(4.5) 대비 +11% — 15% 이내이므로 P0 아님
- 그러나 스킬이 "arcane_burst: 적 전체 3데미지 (에너지5)" → 공격형 서포터
- 컨셉이 딜+지원 혼합(지니)이므로 어느 정도 정당화 가능
- 서포터 스킬 체크: 아군 힐 조합(group_heal 30%) 있어 최소한 서포터 기능 보유

**판정: 경고 (P1) — atk와 공격 스킬 조합이 서포터 기준 경계선**

---

### 3-3. 전체 유닛 범위 위반 없음 확인

아래 유닛들은 2026-04-21 04-balance.md 메모에서 "재감사 필요"로 표기되었으나 현재 범위 내 확인됨:

| 유닛 | 등급/역할 | 핵심 스탯 | 판정 |
|---|---|---|---|
| dragon | legendary / attack / melee | atk=10(범위8~12), hp=35(범위25~42) | 통과 |
| archangel | legendary / defense / melee | hp=40(범위40~50 최솟값), def=8(범위8~14 최솟값) | 통과 |

---

## 4. 전체 P0 / P1 요약

### P0 (반드시 수정)

| # | 유닛 | 문제 | 권장 수정 |
|---|---|---|---|
| 1 | **sea_priest** | atk=8로 legendary support 불문율 위반 (서포터 atk 하위 미충족), hpReg=4+mass_heal HP+8 올라운더화 | atk → 5~6, hpReg → 2~3 |

### P1 (재검토 권장)

| # | 유닛 | 문제 | 권장 수정 |
|---|---|---|---|
| 1 | **archmage** | atk=6, gold attack 최솟값, 평균(7.5) 대비 -20% | atk → 7~8 |
| 2 | **sniper** | atk=6, gold attack 최솟값, 평균(7.5) 대비 -20% | atk → 7 |
| 3 | **lich** | atk=8 legendary attack 최솟값, drain 80%+nrg=25 지속력 과강 우려 | drain 확률 → 0.65, atk → 9 |
| 4 | **dark_shaman** | spd=2, gold support 최솟값, 서포터 "spd 상위" 불문율 미흡 | spd → 3 |
| 5 | **genie_noble** | atk=5, gold support 평균(4.5) 대비 +11%, 공격 스킬 조합 | atk → 4 또는 스킬 힐 비중 증가 |

---

## 5. 권장 patch 상세

### P0: sea_priest

```js
// 현재
{id:'sea_priest', atk:8, hp:42, def:3, spd:5, nrg:22, luck:3, eva:2, meva:5, hpReg:4, nrgReg:3, ...}

// 권장
{id:'sea_priest', atk:6, hp:42, def:3, spd:5, nrg:22, luck:3, eva:2, meva:5, hpReg:2, nrgReg:3, ...}
// atk: 8 → 6 (legendary support 불문율 준수)
// hpReg: 4 → 2 (mass_heal HP+8 이미 강력, hpReg과 중첩 과강 방지)
```

### P1: archmage

```js
// 현재: atk:6
// 권장: atk:7
// 이유: gold attack 평균 7.5에 근접, 스펠 딜러이지만 atk 최솟값은 약점 과다
```

### P1: sniper

```js
// 현재: atk:6
// 권장: atk:7
// 이유: pierce(방어무시) + headshot(즉사) 조합으로 실효 딜은 높으나, 기본 atk는 평균 근처 필요
```

### P1: lich

```js
// 현재: atk:8, skillChance:0.8(drain)
// 권장: atk:9, skillChance:0.65(drain)
// 이유: legendary attack 평균(10) 대비 현재 -20%, drain 80%는 사실상 자가 회복 과강
```

### P1: dark_shaman

```js
// 현재: spd:2
// 권장: spd:3
// 이유: gold support 최솟값, 서포터 불문율 "spd 상위" 미충족
```

### P1: genie_noble

```js
// 현재: atk:5
// 권장: atk:4
// 이유: gold support 평균(4.5) 대비 +11%, arcane_burst 공격 스킬과 조합 시 딜러 경향 과다
```

---

## 6. 원소 분포 체크 (불문율 5: 원소별 평균 ±10% 이내)

| 원소 | 유닛 수 | 메모 |
|---|---|---|
| earth | 8 | militia, wolf, herbalist, infantry, stonemason, armored_griffin, stonemason_noble, earth_guardian, behemoth (9) |
| fire | 7 | apprentice, crossbow, fire_spirit, berserker, pyromancer, phoenix, dragon, griffin_knight, flame_warrior, flame_guardian (10) |
| lightning | 8 | lancer, archer, thunderbird, griffin, stormcaller, archmage, sniper, genie_noble, titan, genie_legendary (10) |
| water | 7 | guard, cryomancer, cryomancer_f, pirate, tidal_knight, tidal_knight_noble, sea_priest, sea_paladin, leviathan (9) |
| dark | 6 | rogue, assassin, death_knight, dark_shaman, lich, archfiend (6) |
| holy | 4 | knight, priest, paladin, archangel, griffin_rider (5) |

> 암흑(6)과 신성(5)이 다른 원소(9~10) 대비 약 40~50% 적음 → 원소 분포 불균형 P1 주의.
> 이번 감사 대상 외 항목이므로 별도 보고.

---

## 7. 결론

- **P0 (즉시 수정 필요)**: 1건 — sea_priest atk/hpReg
- **P1 (재검토 권장)**: 5건 — archmage / sniper / lich / dark_shaman / genie_noble
- **backlog 5건 중 범위 초과 P0 없음**: 실측 결과 모두 범위 내 (경고 수준 조정 필요)
- **추가 주의**: 암흑/신성 원소 유닛 수 부족 (다음 캐릭터 추가 시 우선 배정 권장)

> 코드 수정은 하지 않음. 사용자 결정 후 `/캐릭터추가` 또는 직접 patch 적용 권장.

---

*감사 완료: 2026-05-02 | balance-auditor*
