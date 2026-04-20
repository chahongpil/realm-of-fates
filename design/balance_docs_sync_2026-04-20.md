# 밸런스 문서 정합성 리포트 (2026-04-20 night)

> **리포트 전용** — 수치 수정 금지. 대표님 귀환 후 결정 대기.

## 🚨 핵심 발견

`rules/04-balance.md` 와 `design/balance.md` 가 **근본적으로 다른 세계관**을 전제하고 있음.

## 비교표

### Bronze (평범) 등급

| 문서 | atk | hp | 출처 |
|---|---|---|---|
| `rules/04-balance.md` | 2-3 | **8-12** | "2~3턴에 죽음, 하스스톤처럼 소모품" |
| `design/balance.md` (melee) | 8-11 | **40-55** | 역할별 상세표 |
| `design/balance.md` (ranged) | 11-14 | 30-45 | 역할별 상세표 |
| `design/balance.md` (support) | 6-9 | 35-50 | 역할별 상세표 |
| **실제 js 데이터 (일반 유닛)** | **2-4** | **7-12** | 04-balance 와 일치 |
| **실제 js 데이터 (영웅)** | **4-5** | **25-50** | 어느 쪽과도 정확히 일치 안 함 |

### Silver (희귀)

| 문서 | atk | hp |
|---|---|---|
| `rules/04-balance.md` | 3-5 | 12-18 |
| `design/balance.md` (melee) | 11-14 | 55-70 |
| **실제 js silver 일반 유닛** | 3-5 | 12-25 (대부분 15-18) |

### Gold (고귀)

| 문서 | atk | hp |
|---|---|---|
| `rules/04-balance.md` | 5-7 | 18-25 |
| `design/balance.md` (melee) | 14-18 | 75-90 |

### Legendary (전설)

| 문서 | atk | hp |
|---|---|---|
| `rules/04-balance.md` | 8-12 | 30-40 |
| `design/balance.md` (melee) | 18-23 | 95-115 |

### Divine (신)

| 문서 | atk | hp |
|---|---|---|
| `rules/04-balance.md` | 15-20 | 50-60 |
| `design/balance.md` (melee) | 22-30 | 120-150 |

## 📊 진단

### Source of Truth 판정

- **실제 데이터(js/11_data_units.js)** 는 **`rules/04-balance.md`** 와 거의 일치
- **`design/balance.md`** 는 실제 데이터의 **약 4~5배 스케일** (의도된 구버전일 가능성)
- 영웅 HP (hp:50 h_m_fire) 는 `design/balance.md` bronze melee 40-55 범위에 있지만, ATK(4) 는 그쪽(8-11) 과 안 맞음

### 원인 추정

1. **`design/balance.md` 는 과거 "스케일업 프로토타입" 버전** — 실제 게임은 더 작은 수치로 수렴
2. **영웅 vs 일반유닛 구분이 문서에 없음** — 두 문서 다 단순히 "등급별 스탯"만 기재
3. 현재 코드는:
   - 영웅(h_* 로 시작, 18명): 고HP (25-50), 초급 ATK (1-5)
   - 일반유닛(40명): 저HP (7-60), 저ATK (1-20, 단 divine 만 큼)

## 🎯 권장 해결책 (3안)

### 안 A. `design/balance.md` 폐기 + `rules/04-balance.md` 정본화
- 장점: 실제 데이터와 즉시 일치, 혼란 제거
- 단점: 그간 `design/balance.md` 의 상세 구조(역할별 세분화)를 잃음
- 난이도: 낮음 (문서 1개 삭제 + rules 에 역할 세분화 추가)

### 안 B. 두 문서 모두 유지 + 역할 구분
- `design/balance.md` 를 "**영웅 전용** 상세표" 로 재정의
- `rules/04-balance.md` 는 "**일반 유닛** 범위" 만 (현재 그 방향)
- 장점: 둘 다 살림
- 단점: 양쪽 다 재검증 필요, 영웅 데이터가 문서화된 적 없음

### 안 C. `design/balance.md` 전면 재작성 (실제 데이터 기준)
- 실제 58 유닛 평균값 뽑아서 범위 재정의
- 장점: 가장 정확
- 단점: 시간 소요 큼, 매 튜닝마다 갱신 필요

## 💡 제 의견 (안 A 추천)

**안 A** 가 제일 깨끗합니다. 현재 실제 데이터와 `rules/04-balance.md` 가 일치하므로, `design/balance.md` 의 스케일 큰 수치는 죽은 구버전입니다. 새 캐릭터 추가 시 `/캐릭터추가` 스킬이 `rules/04-balance.md` 만 참조하면 되고, `design/balance.md` 는 더 이상 참조 소스 아님.

역할별 세분화(melee/ranged/support)는 rules 에 추가 가능:

```markdown
### bronze (평범)
- 공통: HP 8~12, ATK 2~3
- melee: HP 상한 (10-12), ATK 하한 (2)
- ranged: HP 하한 (7-9), ATK 상한 (3-4)
- support: HP 중간, ATK 하한, NRG 높음
```

## 🚫 제약

**이 리포트는 진단만**. 실제 문서 변경은 대표님 결정 후. balance-auditor 에이전트 결과와 합쳐서 같이 리뷰 예정.

## 관련 파일
- `c:/work/.claude/rules/04-balance.md` — 범위표 (정본 후보)
- `c:/work/game/design/balance.md` — 상세표 (죽은 구버전 추정)
- `c:/work/game/js/11_data_units.js` — 실제 데이터 (Source of Truth)
- `c:/work/game/design/balance_audit_2026-04-20-night.md` — balance-auditor 리포트 (작성 중)
