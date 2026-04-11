# Section 03: 데이터 파일 분리 (Phase 2)

> 참고: `claude-plan.md` "Phase 2: 데이터 파일 분리"
> 테스트: `claude-plan-tdd.md` "Phase 2: 데이터 파일 분리"

## 목표

JavaScript 상수/데이터를 `RoF.Data` 네임스페이스로 이동. 6개 JS 파일 생성.

## 작업 목록

1. `js/00_namespace.js` 생성 — `window.RoF = { version, Data: {}, debug: {} }` + 전역 에러 핸들러
2. `js/10_constants.js` — `R_LABEL`, `R_ORDER`, `ROLE_L`, `ATTACK_EFFECTS`, `ELEMENTS`, `ELEM_L`, `ELEM_ICON`, `ELEM_COLOR`, `ENEMY_NAMES`, `HERO_ROLES` 이동
3. `js/11_data_units.js` — `UNITS` 배열 이동 (190줄)
4. `js/12_data_skills.js` — `SKILLS_DB` 이동
5. `js/13_data_relics.js` — `RELICS_DB` 이동
6. `js/14_data_images.js` — `GI`, `IMG`, `CARD_IMG`, `getCardImg` 이동
7. `js/15_data_traits.js` — `TRAITS`, `getTraits` 이동
8. `index.html` 에서 이동한 상수 코드 삭제
9. 호환성 레이어: `window.UNITS = RoF.Data.UNITS;` 형태로 각 파일 끝에 추가
10. `index.html` head 에 `<script defer src="js/00_namespace.js">` 등 7개 script 태그 추가
11. 참조 누락 확인 (grep 베이스라인 비교)
12. 커밋: `[Refactor Phase 2/6] 데이터 상수 RoF.Data 네임스페이스로 분리`

## 패턴 예시

```javascript
// js/11_data_units.js
RoF.Data.UNITS = Object.freeze([
  { id: '...', name: '...', /* ... */ },
  // ...
]);

// 호환성 레이어
window.UNITS = RoF.Data.UNITS;
```

## 주의사항

- `Object.freeze()` 로 데이터 동결 (실수로 수정 방지)
- 기존 코드가 UNITS 를 수정하는 경우가 있는지 grep 으로 사전 확인. 있다면 freeze 제외.
- 모든 상수 선언이 `RoF.Data.XXX` 또는 호환 레이어로 접근 가능해야 함

## 완료 조건

- 7개 JS 파일 생성
- `index.html` 에서 상수 코드 제거됨
- `<script defer>` 7개 추가됨
- Phase 2 테스트 스텁 PASS (RoF.Data.UNITS 접근 가능, 게임 시작 가능, 콘솔 에러 0)

## 리스크

**중간**. 참조 누락이 가장 흔한 실수. grep 후 수동 교체 과정 주의.

---

## 실제 구현 결과 (Phase 2 완료)

### 생성 파일

- `js/00_namespace.js` — 15줄. `RoF = { version:'1.0.0', Data:{}, debug:{} }` + 전역 에러 핸들러
- `js/10_constants.js` — 44줄. R_LABEL, R_ORDER, ROLE_L, ATTACK_EFFECTS, ELEMENTS, ELEM_*, ENEMY_NAMES, HERO_ROLES
- `js/11_data_units.js` — 202줄. UNITS 배열 (44 유닛)
- `js/12_data_skills.js` — 41줄. `RoF.Data.SKILLS` (30 스킬) + `window.SKILLS_DB` 호환
- `js/13_data_relics.js` — 19줄. `RoF.Data.RELICS` (12 유물) + `window.RELICS_DB` 호환
- `js/14_data_images.js` — 70줄. GI, IMG, CARD_IMG, getCardImg. **IIFE 래핑됨** (코드 리뷰 auto-fix, `__GI/__IMG` 스크립트 스코프 오염 방지)
- `js/15_data_traits.js` — 47줄. TRAITS, getTraits

### index.html 변경

- `<head>` 에 `<script defer>` 7개 추가 (GSAP 다음)
- 상수 코드 314줄 제거 (UNITS 190 + SKILLS_DB 37 + RELICS_DB 15 + ENEMY_NAMES 12 + HERO_ROLES 6 + CARD_IMG/GI/IMG/getCardImg 54)
- **유지된 헬퍼** (Phase 3 에서 이동 예정): `upgradeRarity`, `fuseCard`, `enemyName`, `getHeroId`, `uid`
- 총 라인: 4669 → 4355 (−314)

### 참조 베이스라인 대비

| 패턴      | 베이스라인 | Phase 2 후 | Δ                       |
| --------- | ---------- | ---------- | ----------------------- |
| UNITS     | 20         | 18         | −2 (선언 + 내부 주석)   |
| SKILLS_DB | 5          | 4          | −1 (선언)               |
| SFX.      | 94         | 94         | 0                       |
| Auth.     | 21         | 21         | 0                       |
| Game.     | 61         | 61         | 0                       |

### 데이터 완전성 자동 검증

- UNITS 44개 (원본 == 새 파일) ✓
- SKILLS 30개 ✓
- RELICS 12개 ✓
- 모든 JS 파일 `node --check` 통과 ✓
- 인라인 `<script>` 블록도 `node --check` 통과 ✓

### Plan 대비 차이점 / 결정사항

1. **SKILLS_DB/RELICS_DB 네임스페이스**: `RoF.Data.SKILLS` + `window.SKILLS_DB` (plan verbatim 유지). 리뷰어가 `RoF.Data.SKILLS_DB` 통일 제안했으나 plan 명시 패턴 우선. 사용자 결정.
2. **Object.freeze 범위**: Shallow (최상위 배열만). 런타임 mutation grep 으로 없음 확인. Deep freeze 는 scope creep 으로 판단. 사용자 결정.
3. **14_data_images.js IIFE 래핑**: 코드 리뷰 auto-fix. `const __GI/__IMG` 가 classic script 의 공유 "script record" 스코프로 leak 되는 것을 방지.
4. **`RoF.getCardImg` / `RoF.getTraits` 위치**: `RoF.*` (plan 383라인 명시).

### 수동 회귀 테스트 (TDD Phase 2)

브라우저에서 `index.html` 열고 콘솔에서 확인:

```javascript
// Test 2.1: 네임스페이스
typeof RoF                     // "object"
RoF.version                    // "1.0.0"

// Test 2.2: 데이터 접근
RoF.Data.UNITS.length          // 44
RoF.Data.SKILLS.length         // 30
RoF.Data.RELICS.length         // 12
typeof RoF.Data.CARD_IMG       // "object"

// Test 2.3: 호환 레이어
UNITS === RoF.Data.UNITS       // true
SKILLS_DB === RoF.Data.SKILLS  // true
RELICS_DB === RoF.Data.RELICS  // true
TRAITS === RoF.Data.TRAITS     // true
getCardImg === RoF.getCardImg  // true
getTraits === RoF.getTraits    // true

// Test 2.4: freeze
Object.isFrozen(RoF.Data.UNITS)  // true
```

- **Test 2.5**: 타이틀 → 로그인 → 마을 → 술집/교회/대장간 각 클릭 → 전투 → 콘솔 에러 0 확인
- **Test 2.6**: 13개 회귀 체크리스트 (`claude-plan-tdd.md` Phase 0) 수행

### 후속 작업

Phase 3 에서 `upgradeRarity`, `fuseCard`, `enemyName`, `getHeroId`, `uid` 등 헬퍼를 `20_helpers.js` 로 이동 예정.
