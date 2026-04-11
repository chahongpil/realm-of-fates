<!-- PROJECT_CONFIG
runtime: vanilla-js
test_command: echo "manual regression test required - see claude-plan-tdd.md"
END_PROJECT_CONFIG -->

<!-- SECTION_MANIFEST
section-01-preparation
section-02-css-split
section-03-data-split
section-04-modules-sfx-ui-auth
section-05-game-split
section-06-battle-fx
section-07-event-delegation
END_MANIFEST -->

# Realm of Fates 구조 리팩토링 — 섹션 인덱스

이 문서는 `claude-plan.md` 의 Phase 0~6 을 7개의 구현 섹션으로 매핑한다. 각 섹션은 독립된 Git 커밋 단위이며, 앞 섹션 완료 후에만 다음 섹션을 시작할 수 있다 (선형 의존).

## 프로젝트 특수사항

이 프로젝트는 **바닐라 JS + HTML** 로만 구성된 정적 웹게임이다. 다음 제약이 deep-implement 워크플로우에 영향:

- **빌드 도구 없음**: npm, Vite, Webpack 등 일체 미사용
- **자동화 테스트 프레임워크 없음**: Jest, Playwright 등 미사용
- **테스트는 전부 수동**: `claude-plan-tdd.md` 의 체크리스트 기반 수동 회귀 테스트
- **"테스트 통과" 판정**: 체크리스트 항목별로 `docs/test_results_phaseN.md` 에 수동 기록

따라서 `test_command` 는 실제 테스트 러너가 아니라 수동 검증 필요성을 알리는 플레이스홀더이다. deep-implement 실행 시 각 섹션 완료 후 **사용자에게 수동 검증을 요청**해야 한다.

## 의존성 그래프

| Section | Depends On | Blocks | Parallelizable |
|---------|------------|--------|----------------|
| section-01-preparation | - | 모두 | No |
| section-02-css-split | 01 | 03 | No |
| section-03-data-split | 02 | 04 | No |
| section-04-modules-sfx-ui-auth | 03 | 05 | No |
| section-05-game-split | 04 | 06 | No |
| section-06-battle-fx | 05 | 07 | No |
| section-07-event-delegation | 06 | - | No |

**모든 섹션이 선형 의존**. 이유: 각 섹션이 동일한 `index.html` 파일을 점진적으로 수정하므로 병렬 실행 불가.

## 실행 순서

```
section-01-preparation (Phase 0)
  ↓
section-02-css-split (Phase 1)
  ↓
section-03-data-split (Phase 2)
  ↓
section-04-modules-sfx-ui-auth (Phase 3)
  ↓
section-05-game-split (Phase 4)  ← 가장 복잡, 가장 위험
  ↓
section-06-battle-fx (Phase 5)
  ↓
section-07-event-delegation (Phase 6)
  ↓
최종 검증 + PR 생성
```

## 섹션 요약

### section-01-preparation
**매핑**: Phase 0 (사전 준비)

안전망 브랜치 생성, 디렉토리 구조 생성, Game 메서드 덤프, 참조 베이스라인 수집, onclick 감사. 코드 변경 없이 리팩토링 도중 필요한 모든 기준선을 만든다. 커밋: `[Refactor Phase 0/6] 사전 준비`

### section-02-css-split
**매핑**: Phase 1 (CSS 분리)

`<style>` 블록 580줄을 9개 CSS 파일로 분리. 기능: CSS cascade 순서 유지, 중복 selector 감사. 리스크: 최저. 커밋: `[Refactor Phase 1/6] CSS 파일 9개로 분리`

### section-03-data-split
**매핑**: Phase 2 (데이터 파일 분리)

`00_namespace.js` 생성 (`window.RoF`), 상수/데이터를 `js/10_*` ~ `js/15_*` 로 이동. 호환성 레이어 (`window.UNITS = RoF.Data.UNITS`) 유지. 리스크: 중간. 커밋: `[Refactor Phase 2/6] 데이터 상수 RoF.Data 네임스페이스로 분리`

### section-04-modules-sfx-ui-auth
**매핑**: Phase 3 (SFX/UI/Auth/helpers/cards 분리)

독립성 높은 모듈 5개 분리: `20_helpers.js`, `30_sfx.js` (+제스처 훅 IIFE), `31_ui.js`, `32_auth.js`, `40_cards.js`. 리스크: 중간. 커밋: `[Refactor Phase 3/6] SFX/UI/Auth/helpers/cards 모듈 분리`

### section-05-game-split
**매핑**: Phase 4 (Game 7개 파일 분할) — **최고 위험**

`Game` 객체 2492줄을 `Object.assign` 패턴으로 7개 파일에 분산. `50_game_core`, `51_game_town`, `52_game_tavern`, `53_game_deck`, `54_game_castle`, `55_game_battle`, `56_game_effects`. 사전 this 바인딩 감사 + 런타임 중복 키 감지 필수. 리스크: 높음. 커밋: `[Refactor Phase 4/6] Game 객체 7개 파일로 분할`

### section-06-battle-fx
**매핑**: Phase 5 (TurnBattle/Formation/FX 분리 + bootstrap)

`60_turnbattle.js`, `70_formation.js`, `80_fx.js`, `99_bootstrap.js` 생성. bootstrap에 UI.show 몽키패칭 + sanity check 통합. 리스크: 중간. 커밋: `[Refactor Phase 5/6] TurnBattle/Formation/FX 분리, bootstrap 초기화 통합`

### section-07-event-delegation
**매핑**: Phase 6 (onclick → data-action)

HTML 인라인 `onclick` 95개를 `data-action` 으로 교체. `99_bindings.js` 생성 (이벤트 위임 + Enter preventDefault). JS 내부 `el.onclick` 46개는 허용하되 호출부를 `RoF.Xxx.method()` 풀 경로로 통일. 리스크: 높음. 커밋: `[Refactor Phase 6/6] onclick → data-action 마이그레이션`

## 검증 전략

각 섹션 완료 후:
1. `claude-plan-tdd.md` 의 해당 Phase 테스트 스텁 실행
2. 20개 회귀 테스트 체크리스트 수행
3. `docs/test_results_phaseN.md` 에 결과 기록
4. **모든 테스트 통과 후에만** 커밋 진행

실패 시:
- 해당 섹션 커밋 전이면: 작업 중인 파일 되돌리기
- 이미 커밋됐으면: `git revert`
- 치명적 상황: `backup/pre-refactor` 브랜치로 복구

## deep-implement 실행 가이드

이 섹션들을 `/deep-implement` 로 실행할 때:

1. **TDD 테스트 자동 실행 없음**: 각 섹션 완료 후 사용자에게 "claude-plan-tdd.md 의 Test N.X 를 수동으로 실행해주세요" 요청
2. **테스트 통과 확인**: 사용자가 `PASS` 또는 `FAIL` 로 응답
3. **FAIL 시**: 해당 섹션 재작업, 이전 섹션으로 돌아가지 않음
4. **PASS 시**: 섹션별 커밋 생성 후 다음 섹션으로
5. **최종 섹션 완료 후**: PR 생성 (1개 PR + 7개 커밋)
