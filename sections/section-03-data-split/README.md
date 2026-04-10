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
