# Realm of Fates — Balance

> ⚠️ 이 파일은 "설계 의도" 이며, 실제 수치는 `js/11_data_units.js` 등에 있다.
> 갱신 빈도: 매일 (튜닝 시).

## 📌 Source of Truth 규칙

- 공식/범위 바뀜 → 이 파일 먼저 → `/캐릭터추가` 스킬로 `js/` 반영
- 특정 캐릭터 튜닝 → `js/` 먼저 → 필요 시 이 파일의 평균 업데이트

## 스탯 범위 (레어도 × 역할)

> 섹션 헤더는 **내부 ID**(`bronze/silver/gold/legendary/divine`)를 사용.
> 표시 명칭(2026-04-15 개편): 평범 / 희귀 / 고귀 / 전설 / 신.
> UI·문서 라벨은 표시 명칭, 코드·파일은 내부 ID.

### bronze 레어도 (표시: **평범**)

| 역할    | atk   | hp    | def   | spd  |
|---------|-------|-------|-------|------|
| melee   | 8~11  | 40~55 | 4~8   | 3~5  |
| ranged  | 11~14 | 30~45 | 2~5   | 4~6  |
| support | 6~9   | 35~50 | 3~6   | 3~5  |

### silver 레어도 (표시: **희귀**)

| 역할    | atk    | hp    | def   | spd  |
|---------|--------|-------|-------|------|
| melee   | 11~14  | 55~70 | 7~11  | 3~5  |
| ranged  | 14~18  | 45~60 | 4~8   | 5~7  |
| support | 8~12   | 50~65 | 5~9   | 4~6  |

### gold 레어도 (표시: **고귀**)

| 역할    | atk    | hp    | def   | spd  |
|---------|--------|-------|-------|------|
| melee   | 14~18  | 75~90 | 10~14 | 4~6  |
| ranged  | 18~22  | 60~75 | 6~10  | 6~8  |
| support | 10~14  | 65~80 | 8~12  | 5~7  |

### legendary 레어도 (표시: **전설**)

| 역할    | atk    | hp      | def    | spd  |
|---------|--------|---------|--------|------|
| melee   | 18~23  | 95~115  | 14~18  | 5~7  |
| ranged  | 22~28  | 75~95   | 10~14  | 7~9  |
| support | 14~18  | 85~105  | 12~16  | 6~8  |

### divine 레어도 (표시: **신** — 의도된 오버파워, ±25% 허용)

| 역할    | atk    | hp       | def    | spd  |
|---------|--------|----------|--------|------|
| melee   | 22~30  | 120~150  | 18~24  | 6~8  |
| ranged  | 28~36  | 95~120   | 14~20  | 8~10 |
| support | 18~24  | 110~140  | 16~22  | 7~9  |

## 수식

### 데미지 계산
```
damage = atk × (1 - def / (def + 100)) × skill_multiplier
```

### 레벨링
```
hp_at_level(L)  = base_hp  × (1 + 0.10 × (L - 1))
atk_at_level(L) = base_atk × (1 + 0.08 × (L - 1))
def_at_level(L) = base_def × (1 + 0.05 × (L - 1))
```

### 드롭률 (전투 종료 시)

| 레어도    | 일반 던전 | 엘리트 던전 | 보스 |
|-----------|-----------|-------------|------|
| bronze    | 60%       | 30%         | 10%  |
| silver    | 30%       | 40%         | 30%  |
| gold      | 9%        | 25%         | 40%  |
| legendary | 0.9%      | 4.5%        | 18%  |
| divine    | 0.1%      | 0.5%        | 2%   |

## 밸런스 불문율

- 어떤 캐릭터도 평균 대비 **±15% 초과 금지** (divine 예외 ±25%)
- **탱커 (melee + def 비중)**: hp/def 상위, atk 중위
- **딜러 (ranged)**: atk 상위, hp/def 하위, spd 상위
- **서포터**: spd 상위, atk 하위
- 속성별 평균은 ±10% 이내로 유지 (한 속성이 압도적이면 안 됨)

## 진화 계수 (fuseCard)

합성(융합) 시 배수:

- atk, hp, maxHp: `× 1.5`
- def: `× 1.5`
- spd, rage, nrg, luck, eva: `× 1.3`
- rarity: 한 단계 상승

## 경험치 곡선

```
xp_to_next_level(L) = 100 × L^1.5
```

레벨 1→2: 100 XP
레벨 10→11: ~3,162 XP
레벨 50→50→51: ~35,355 XP

---

## PHASE 3 — 시네마틱 전투 공식 (2026-04-14 추가)

> 상세: [`game/PHASE3_BATTLE_CINEMATIC.md`](../game/PHASE3_BATTLE_CINEMATIC.md)
> 마이그레이션: [`battle-v2-migration.md`](battle-v2-migration.md)

### 무기 공격
```
dmg = floor(caster.atk × skill.mult + skill.flatBonus)
    - max(0, target.def - skill.penetration)
dmg = max(1, dmg)
```

### 스펠 공격 (DEF 무시)
```
dmg = skill.damage × (1 + target.vulnerability × 0.1)
```

### 원소 상성 (곱셈, 고전 4원소 + 빛/어둠)
- 물→불, 불→땅, 땅→전기, 전기→물 (1.3배)
- 신성↔암흑 상호 (1.3배)
- 역방향 0.77배, 나머지 1.0 중립

### 치명타 (luck 기반)
```
critRate = (caster.luck + skill.critBonus) / 100
if (random() < critRate) dmg *= skill.critMult   // 기본 1.5
```

### 합성 순서 (곱셈 고정)
```
최종 = base × elementMult × critMult
```

### 스킬 카드 등급별 수치

**스펠**:
| 등급 (내부 ID) | damage | cost(nrg) | cooldown |
|---|---|---|---|
| 평범 (`bronze`) | 8 | 3 | 0 |
| 희귀 (`silver`) | 15 | 5 | 0 |
| 고귀 (`gold`) | 25 | 10 | 1 |
| 전설 (`legendary`) | 40 | 20 | 2 |
| 신 (`divine`) | 60 | 30+TP2 | 3 |

**무기**:
| 등급 (내부 ID) | mult | flatBonus | penetration | cost |
|---|---|---|---|---|
| 평범 (`bronze`) | 1.0 | 0 | 0 | 2 |
| 희귀 (`silver`) | 1.2 | 2 | 0 | 4 |
| 고귀 (`gold`) | 1.5 | 5 | 1 | 7 |
| 전설 (`legendary`) | 2.0 | 10 | 2 | 12 |
| 신 (`divine`) | 2.5 | 15 | 3 | 20+TP2 |

### 밸런스 검증 체크리스트 (balance-auditor 참조)
- [ ] 한 스킬 평균 데미지 ≤ 타겟 평균 HP × 40% (한 방 killing 금지)
- [ ] 등급 간 효율(dmg/cost) 차이 ≤ 20%
- [ ] ATK 0 지원 캐릭터도 무기 사용 시 최소 데미지 1
- [ ] luck 100 초과 유닛 없음 (치명타 100% 방지)
- [ ] nrgMax 대비 라운드당 평균 스킬 사용 1~2회 (지속 전투 보장)
