# P0 밸런스 재감사 리포트 (2026-04-21)

> 감사관: balance-auditor 에이전트
> 기준 문서: `c:/work/.claude/rules/04-balance.md` (2026-04-21 A안 Source of Truth)
> 데이터 출처: `c:/work/game/js/11_data_units.js`
> 감사 대상: dragon / archangel / lich / archmage / sniper / genie_noble / sea_priest (P0 지정 7종)

---

## 유닛별 판정

| 유닛 | rarity (코드) | role | element | 현재 스탯 | 범위 (규칙) | 판정 | 위반 항목 / 권장 조정 |
|---|---|---|---|---|---|---|---|
| dragon | legendary | attack | fire | atk:10 hp:35 def:3 spd:2 nrg:6 | atk:8~12 hp:25~42 def:1~5 spd:2~5 nrg:5~25 | 통과 | 없음 — 모든 스탯 범위 내 |
| archangel | legendary | defense | holy | atk:7 hp:40 def:8 spd:2 nrg:15 | atk:7~10 hp:40~50 def:8~14 spd:2~3 nrg:5~10 | 경고 | nrg:15 — legendary/defense 범위(5~10) 초과. 방어 역할에 비해 nrg 과잉. 권장: nrg 8~10으로 하향 |
| lich | gold | attack | dark | atk:8 hp:20 def:1 spd:2 nrg:25 | (gold/attack) atk:6~9 hp:15~25 def:0~3 spd:2~5 nrg:3~20 | 실패 | (1) nrg:25 — gold/attack nrg 범위(3~20) 초과. (2) rarity:'gold' 로 등록되었으나 legendary 섹션 사이에 위치, 실질 전투력은 legendary 급. rarity 레이블 불일치 의심. 권장: rarity를 'legendary'로 상향 또는 nrg를 20 이하로 조정. rarity 상향 시 legendary/attack 기준 재검증 필요 |
| archmage | silver | attack | lightning | atk:6 hp:12 def:0 spd:3 nrg:20 | (silver/attack) atk:4~6 hp:10~18 def:0~2 spd:2~5 nrg:2~12 | 실패 | (1) nrg:20 — silver/attack nrg 범위(2~12) 초과(+67%). (2) skillDesc '더블캐스트 2회공격'은 gold 이상 스킬 강도. (3) rarity:'silver' 로 등록되었으나 gold 섹션(L119~) 내부에 위치(L124~127). 코드 내 rarity 레이블 오류 확실. 권장: rarity를 'gold'로 수정, nrg를 gold/attack 범위(3~20) 내로 유지하면 스탯 전체 통과 |
| sniper | silver | attack | lightning | atk:6 hp:10 def:0 spd:4 nrg:5 | (silver/attack) atk:4~6 hp:10~18 def:0~2 spd:2~5 nrg:2~12 | 실패 | rarity:'silver' 로 등록되었으나 gold 섹션(L119~) 내부에 위치(L132~135). 스탯 자체는 silver/attack 범위 내이나 코드 rarity 레이블 오류. 의도된 등급 불명확. 권장: gold 섹션에 배치했다면 rarity를 'gold'로 수정 — gold/attack 기준(atk:6~9, hp:15~25) 대비 hp:10이 하한 미달이므로 hp를 15 이상으로 조정도 병행 |
| genie_noble | gold | support | lightning | atk:5 hp:22 def:2 spd:4 nrg:20 | (gold/support) atk:3~6 hp:18~24 def:1~3 spd:2~4 nrg:6~20 | 경고 | 범위 수치는 전부 통과. 그러나 역할 불문율 위반 — 서포터는 "atk 하위" 원칙인데 atk:5는 gold/support 범위(3~6) 상위 83% 지점. skill '번개 소원: 적 전체 3데미지'는 딜러성 스킬로 서포터 정체성 혼재. 권장: atk를 3~4로 낮추거나 skillDesc를 힐/버프 위주로 교체 |
| sea_priest | legendary | support | water | atk:8 hp:42 def:3 spd:5 nrg:22 | (legendary/support) atk:6~9 hp:38~48 def:3~6 spd:4~6 nrg:20~25 | 실패 | 스탯 범위는 모두 통과. 그러나 역할 불문율 위반 — atk:8은 legendary/support 범위(6~9) 상위 67% 이며 서포터 "atk 하위" 원칙 위배. 평균 대비: atk 중간값 7.5 대비 +7% (±15% 이내이나 방향성 부적합). 권장: atk를 6~7로 낮춰 서포터 정체성 강화. 또는 role을 'attack'으로 변경하고 스킬을 공격형으로 교체 |

> 출처 행 번호 (11_data_units.js):
> - dragon: L166-169
> - archangel: L174-177
> - lich: L170-173 (rarity:'gold' L173)
> - archmage: L124-127 (rarity:'silver' L127, gold 섹션 L119~)
> - sniper: L132-135 (rarity:'silver' L135, gold 섹션 L119~)
> - genie_noble: L144-147
> - sea_priest: L190-193

---

## rarity 레이블 불일치 상세

코드 파일의 섹션 주석과 실제 rarity 필드값이 불일치하는 유닛:

| 유닛 | 코드 섹션 주석 | 실제 rarity 필드 | 판정 |
|---|---|---|---|
| archmage | `// ── GOLD (9) ──` (L119) 이후 L124 배치 | `rarity:'silver'` (L127) | 레이블 오류 — gold 섹션에 silver 등록 |
| sniper | `// ── GOLD (9) ──` (L119) 이후 L132 배치 | `rarity:'silver'` (L135) | 레이블 오류 — gold 섹션에 silver 등록 |
| lich | `// ── LEGENDARY (10) ──` (L165) 이후 L170 배치 | `rarity:'gold'` (L173) | 레이블 오류 — legendary 섹션에 gold 등록 |
| dark_shaman | `// ── GOLD` 섹션 이후 L153 배치 | `rarity:'silver'` (L156) | 동일 패턴 (P0 대상 외, 참고) |
| pirate | silver 섹션(L64~) 이후 L111 배치 | `rarity:'bronze'` (L114) | 동일 패턴 (P0 대상 외, 참고) |

---

## 원소 균형 체크

P0 대상 7종의 원소 분포 및 전체 유닛 원소별 atk 평균 (참고용, 전수 감사는 별도 필요):

| 원소 | P0 대상 유닛 | 비고 |
|---|---|---|
| fire | dragon | dragon은 범위 내 통과 |
| holy | archangel | nrg 경고 |
| dark | lich | nrg 실패 + rarity 오류 |
| lightning | archmage, sniper, genie_noble | archmage·sniper rarity 오류, genie_noble 역할 경고 |
| water | sea_priest | 역할 불문율 실패 |

전체 원소 균형의 경밀 통계는 58종 전수 감사 범위로 이번 P0 감사에서는 산출 불가. 단, lightning 속성에 P0 문제 유닛이 3종 집중(archmage·sniper·genie_noble)되어 있어 lightning 섹션 전수 재검토 권장.

---

## 요약

| 항목 | 건수 |
|---|---|
| 범위 이탈 (nrg 초과) | 2건 (lich nrg:25 vs gold 3~20, archmage nrg:20 vs silver 2~12) |
| rarity 레이블 오류 | 3건 (archmage silver→gold, sniper silver→gold, lich gold→legendary) |
| 역할 불문율 위반 | 2건 (genie_noble/sea_priest — 서포터 atk 과잉) |
| 통과 | 1건 (dragon) |
| 경고 (수정 권장) | 2건 (archangel nrg, genie_noble atk) |

### 권장 조치 (우선순위 순)

1. **즉시 수정 필요** — rarity 레이블 3건: archmage `rarity:'silver'→'gold'`, sniper `rarity:'silver'→'gold'`, lich `rarity:'gold'→'legendary'`. 드롭률·선술집 등장률·진화 계수가 rarity 기준으로 계산되므로 레이블 오류는 밸런스 전체에 영향.
2. **수치 수정 필요** — nrg 범위 이탈 2건: lich nrg 25→20 이하 (gold 기준 유지 시) 또는 rarity 상향 후 legendary 재검증, archmage nrg 20→12 이하 (silver 기준 유지 시) 또는 rarity 상향 후 gold 재검증.
3. **역할 정체성 재검토** — genie_noble atk 5→3~4, sea_priest atk 8→6~7. 서포터 불문율("atk 하위") 준수.
4. **archangel nrg** 15→8~10 (legendary/defense 범위 내로).
5. **lightning 원소 전수 재감사** 권장 — P0 문제 유닛 집중.

---

*감사 완료: 2026-04-21. 코드 수정 없음 — 제안만 포함.*
