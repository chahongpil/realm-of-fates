# 코드 확장성 리뷰 — 2026-04-21 심야 대규모 리팩터

> code-extensibility-reviewer 에이전트 리포트
> 대상 커밋: fa5197b (V4 redesign) / 192d0ad (rage 제거) / 37a9eea (BGM 셔플) / 8df3455 (NPC 대화)

## 🔴 하드 블로커 (3건)

### 1. rage 제거 — 기획 문서 3건 dead 참조
- `game/BATTLE_FORMULA.md:112-170` — "RAGE 축적 10/20/30/100 단계" 여전히 정본처럼 설명
- `game/BUGFIX_EDGE_CASES.md:8-168` — RAGE 시스템 버그 케이스 기록 유지
- `game/BATTLE_KEYWORD_ORDER.md:47-205` — RAGE 키워드 순서 논의
- `game/ART_ASSETS.md:39` — `sk_rage` 를 "분노" 로 서술

**원인**: 08-garbage-lessons "effect 마커 드리프트 3지점 동기화" 교훈이 **데이터/파서/테스트** 만 점검, **기획 문서 (.md)** 동기화 범위에 빠짐.

**제안**: stat 제거 체크리스트에 `grep -rn "<키워드>" game/*.md` 추가. 이번 건 → 3문서에 "DEPRECATED 2026-04-21" 배너 or 섹션 삭제.

### 2. rage CSS 토큰 dead
- `css/10_tokens.css:393` `--stat-rage: #ff8844`
- `css/30_components.css:158` `.st-rage{color:#ff2266}`
- `css/40_battle.css:122` `.battle-card .bc-stt.burn{border-color:var(--stat-rage)...}`

**영향**: burn 상태 테두리 색이 "rage 색" 에 의존. 네이밍 충돌. 앞으로 burn 색 튜닝 시 `--stat-rage` 추적 혼란.

**제안**: `--stat-rage` → `--stat-burn` rename. `.st-rage` dead code 삭제.

### 3. 영웅 원소 보너스 하드코딩 (데이터 드리븐 위반)
- `js/11_data_heroes.js:25` 주석 "fire 는 atk 만 +2"
- 04-balance.md 에는 6원소 × 여러 스탯 테이블로 정의. 코드는 ELEMENT_BONUS 객체로 있지만 rage 같은 스탯 제거 시 또 편집 필요.

**제안**: 테이블 + applyHeroElementBonus(hero) 함수 패턴 — 이번 편집 범위 초과, 다음 스탯 변경 대비.

## 🟡 경고 (6건)

### 4. `_playMp3` — 트랙 타입별 확장성
`js/30_sfx.js:135-145` — `if(type==='title'){...}` switch-case. 새 타입(boss/event/victory/shop) 추가 시 2곳 수정.
**제안**: `_bgmMap = { title: {tracks, vol}, ... }` 레지스트리.

### 5. card-v4 상태 class 조합 폭발 조짐
`.with-bars` + `.card-v4-compact` 두 클래스가 **같은 조건**(bars 표시). "전투 중" 의미를 2 플래그로 표현.
**제안**: `data-variant="tavern|compact|pick|detail"` 단일 속성.

### 6. CardV4Component.create() 400줄 단일 책임 위반
9가지 책임을 한 함수가 담당. 오늘 커밋도 이 함수 중간을 편집.
**제안**: `_buildArt / _buildTopRow / _buildBars / _buildParch` 팩토리 쪼개기. PHASE 4 초입에.

### 7. NPC 대화 — lv2~5 scenes 미정의 + 키 구조
`hasSeenBuildingNpc(id)` 가 **buildingId 단위**. lv 업그레이드 후 재방문 시 새 NPC 재생 안 됨.
**제안**: `hasSeenBuildingNpc(id, lv)` 로 (id, lv) 조합 키. 데이터 채우기 전에 구조부터.

### 8. NPCS 데이터 `rand`/`pool` 특수 케이스
"성별 랜덤" 을 위해 특수 키. 유사 니즈("전직 랜덤") 생기면 또 특수 키 증가.
**제안**: `variants: [{icon, name, condition?}]` 일반화.

### 9. BUILDINGS.action 문자열 dispatch
`this[b.action]()` 강결합. 대화 → action → 콜백 3단 체인 시 콜백 지옥 가능성.
**제안**: `action: () => Game.showCastle()` 함수 참조.

## 🟢 참고 (3건)

### 10. 네이밍 일관성
`state.maxHP` vs `unit.maxHp` 혼재. 경미.

### 11. fuseCard 진화 계수 하드코딩
04-balance.md 가 정본인데 코드는 인라인 숫자. rage 제거 때 테이블이었으면 **한 줄**로 끝났을 것.
**제안**: `EVOLVE_COEF = {atk:1.5, hp:1.5, ..., spd:1.3}` 상수.

### 12. V2/V4 병렬 유지
**잘 됨**. 다만 V2 제거 일정·계획 주석 권장.

## ✅ 잘 된 점 (4건)

1. **rage 제거 04-19 교훈 재적용** — 5점(sk_rage/boil/warhorn/rl_fury/test_run) 한 커밋 동시 수정. 예방 작동 ✓
2. **원소 FX 경로 리터럴 map** — 2026-04-21 정적 게이트 교훈 같은 날 적용 ✓
3. **BGM 셔플 avoidIdx** — 트랙 개수 증가 자동 대응 ✓
4. **NPC 대화 상태 격리** — ESC install/remove 명시적, 단일 책임 ✓

## 📊 확장성 점수

| 항목 | 점수 | 근거 |
|---|---|---|
| 매직 넘버 | 7/10 | CSS top:8px/28px 리터럴, 나머지 양호 |
| 데이터 드리븐 | 6/10 | BGM 레지스트리화 필요 |
| 플래그 토글 | 7/10 | with-bars/compact variant 통합 여지 |
| 마이그레이션 안전 | **5/10** | rage 기획문서 3건 drift + CSS 토큰 dead |
| 단일 책임 | 6/10 | CardV4Component.create 400줄 |
| **총점** | **31/50** | drift 제거하면 35/50 |

## 📌 핵심 메시지

> **"코드 3점 동기화" 교훈이 코드 측은 완벽하지만 기획 문서(.md) 는 놓쳤다.**

rage 제거 커밋은 데이터/파서/테스트 동시 수정 훌륭. 그러나 `BATTLE_FORMULA.md` 등 3건이 아직 RAGE 를 정본처럼 설명. 다음 stat 제거 작업에선:
```bash
grep -rn "<키워드>" game/   # .md 까지 전부
```
를 한 세트로.

## 즉시 수정 가능 (대표님 승인 시)

### P0 — 기획 문서 3건 정리 (30분)
- `BATTLE_FORMULA.md`: RAGE 섹션 DEPRECATED 표기 or 삭제
- `BUGFIX_EDGE_CASES.md`: RAGE 버그 케이스 섹션 정리
- `BATTLE_KEYWORD_ORDER.md`: RAGE 키워드 항목 정리
- `ART_ASSETS.md:39`: sk_rage 설명 "분노" → "광전사의외침" (이름 변경 반영)

### P1 — CSS 토큰 rename (10분)
- `--stat-rage` → `--stat-burn` (의미 일치)
- `.st-rage` 선택자 삭제
- 참조처(css/40_battle.css:122) 자동 업데이트
