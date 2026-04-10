# Deep-Plan 인터뷰 기록

> 작성일: 2026-04-11
> 인터뷰 대상: 차민규 (belozoglu84-gif)
> 프로젝트: Realm of Fates 구조 리팩토링

## Q1. 네임스페이스 이름

**질문**: 기존 전역 객체(`Game`, `Auth`, `SFX`)를 어떤 네임스페이스 아래로 정리할 것인가?

**선택지**:
- A: `RoF` (리서치 권장)
- B: `ROF` (대문자)
- C: `Realm` (풀 단어 축약)
- D: 네임스페이스 없음 (기존 전역 유지)

**답변**: **A (`RoF`)**

**근거**: 가장 간결하고 리서치 권장. 호환성 트릭(`window.Game = RoF.Game`)으로 기존 onclick도 그대로 작동 가능.

---

## Q2. Game 객체 분할 방식

**질문**: 2492줄짜리 `Game` 객체를 어떻게 쪼갤 것인가?

**선택지**:
- A: 7개 파일로 세분화 (core/town/tavern/deck/castle/battle/effects)
- B: 3개 파일로 중간 분할
- C: Game 파일 하나로 유지

**답변**: **A (7개 파일 세분화)**

**근거**: 리팩토링 목적이 "협업 충돌 방지"인데 C는 절반밖에 달성 못함. A는 `Object.assign(RoF.Game, {...})` 패턴으로 같은 객체에 메서드 추가하므로 기존 호출 방식 유지.

**분할 구조**:
```
50_game_core.js     — 기본 (load, persist, logout, 상태 관리)
51_game_town.js     — 마을/건물 (showMenu, upgradeBuilding)
52_game_tavern.js   — 술집/영입 (showTavern, hireTavern)
53_game_deck.js     — 덱 보기/도감 (showDeckView, showCardDetail)
54_game_castle.js   — 성/교회/대장간
55_game_battle.js   — 전투 흐름 (showMatchmaking, showBattleEnd, showRoundChoice)
56_game_effects.js  — 이펙트 (showDmg, showHeal, showGameOver)
```

---

## Q3. 기존 브랜치(`feature/defeat-animation`) 처리

**질문**: 패배 연출 작업 중인 브랜치를 어떻게 할 것인가?

**선택지**:
- A-1: PR 올려서 팀원 리뷰받고 머지
- A-2: 로컬에만 두고(커밋만), master에서 리팩토링 먼저
- B: 브랜치 버리고 나중에 새 구조에서 재구현
- C: 현재 브랜치에서 그대로 리팩토링 진행

**답변**: **A-2 (로컬만 유지, 리팩토링 우선)**

**근거**:
- 현재 패배 연출은 "허접한" 수준이라 팀원에게 보여주기엔 부적합
- 어차피 리팩토링 후 PixiJS로 재작업 예정
- 리팩토링이 최우선 작업
- 현재 연출 코드는 기준점/참고용으로만 로컬 보존

---

## Q4. 마이그레이션 커밋/PR 전략

**질문**: 5개 Phase를 어떻게 커밋하고 PR을 올릴 것인가?

**선택지**:
- A: 각 Phase마다 별도 PR (5개 PR)
- A': 1개 PR 안에 5개 커밋 (단일 PR, 커밋 분리)
- C: 한 번에 전부 커밋 + 1개 PR

**답변**: **A' (1개 PR + 5개 커밋)**

**근거**:
- 팀원이 비개발자(동생)이라 PR 5번 리뷰 부담 큼
- A'는 A의 장점(단계별 롤백, 디버깅 추적)을 그대로 가지면서 팀원 부담만 줄임
- 디버깅 정확도는 커밋 단위로 보장됨 (어느 Phase에서 깨졌는지 추적 가능)

---

## Q5. 팀원 PR 검토 방식

**질문**: 비개발자 팀원(동생)이 리팩토링 PR을 어떻게 검토할 것인가?

**선택지**:
- 1: 게임을 직접 플레이해서 기능 확인만
- 2: 팀원의 클로드코드에 PR 검토 시키기
- 3: PR 없이 바로 머지

**답변**: **2 (클로드코드로 검토)**

**근거**:
- 동생은 코드 못 읽음
- 클로드코드가 있으니 "이 PR 검토해줘" 한 줄로 AI가 전체 코드 변경 읽고 요약 + 위험 요소 보고 가능
- 바이브코딩 시대 협업의 실용적 방식

**검토 플로우**:
1. 당신이 PR 생성
2. 동생에게 PR 링크 전달
3. 동생이 클로드코드에 "이 PR 검토해줘" 입력
4. AI 검토 결과 확인
5. (선택) 게임 직접 플레이
6. 동생 승인 → 머지

---

## Q6. onclick 핸들러 처리 전략

**질문**: HTML에 박힌 40+개 `onclick="Game.xxx()"` 핸들러를 어떻게 처리할 것인가?

**선택지**:
- A: 호환성 트릭 (`window.Game = RoF.Game`) 유지, HTML 수정 0줄
- B: addEventListener로 완전 마이그레이션

**답변**: **B (addEventListener로 전환, Phase 6 추가)**

**근거**:
- 클린 아키텍처 지향
- HTML에서 인라인 이벤트 제거 → 구조 깨끗해짐
- 리팩토링 범위는 커지지만 한 번에 제대로 처리

**변경사항**: 5개 Phase → **6개 Phase**로 확장. Phase 6을 맨 마지막에 배치.

---

## Q7. 이벤트 바인딩 배치 전략

**질문**: addEventListener를 어떤 패턴으로 배치할 것인가?

**선택지**:
- A: 각 모듈 파일 안에서 바인딩
- B: 전용 `99_bindings.js` 파일에 모두 모음
- C: HTML에 `data-action` 속성 + 이벤트 위임

**답변**: **C (data-action + 이벤트 위임)**

**근거**:
- 클린 아키텍처 지향에 가장 부합
- HTML 가독성 최고 (`<button data-action="auth.login">`)
- 대규모 앱(Gmail, Notion)이 쓰는 패턴
- 버튼 추가 시 바인딩 재작성 불필요 (이벤트 위임)

**구현 예시**:
```html
<button data-action="auth.login">입장</button>
```
```javascript
// 99_bindings.js
document.addEventListener('click', (e) => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  const [module, method] = action.split('.');
  RoF[module]?.[method]?.();
});
```

---

## Q8. 회귀 테스트 엄격도

**질문**: 각 Phase 후 어느 정도로 검증할 것인가?

**선택지**:
- A: 각 Phase 후 체크리스트 전체 수동 실행 (높음)
- B: Phase 1,3,5 후만 검증 (중간)
- C: 마지막에 1번만 전체 검증 (낮음)
- D: Playwright E2E 자동화

**답변**: **A (매 Phase 후 전체 체크리스트 수동 실행)**

**근거**:
- 정확성과 디버깅 용이성 최우선
- Phase 별로 검증하면 "어느 Phase에서 깨졌는지" 즉시 특정 가능
- D(자동화)는 범위 초과 (빌드 도구 없이 구현 어렵고 리팩토링보다 커짐)

**체크리스트** (13개, REFACTOR_SPEC.md 기반):
1. 타이틀 화면 → 로그인 버튼 작동
2. 회원가입 → 캐릭터 선택 → 마을 진입
3. 기존 계정 로그인 → 마을 진입
4. 마을 건물 클릭 → 각 화면 진입
5. 술집에서 카드 영입
6. 덱 보기 → 카드 상세 → 스탯 분배
7. 전투 시작 → 전투 중 이펙트 정상
8. 전투 승리 → 보상 화면
9. 전투 패배 → 게임오버 화면
10. 사운드 재생 (BGM + SFX)
11. 저장/불러오기 (localStorage)
12. 볼륨 조절
13. 새로고침 후 데이터 유지

---

## 인터뷰 결론

모든 선택이 **"클린 아키텍처 + 정확성 + 디버깅 용이성"** 방향으로 수렴했다.

**핵심 결정**:
- 네임스페이스: `RoF`
- Game 객체: 7개 파일로 세분화
- Phase: 5개 → **6개**로 확장 (Phase 6 = onclick 마이그레이션)
- PR 전략: 1개 PR + 6개 커밋
- 팀원 검토: 클로드코드 AI 검토
- 이벤트 바인딩: `data-action` + 이벤트 위임
- 회귀 테스트: 매 Phase 후 전체 13개 체크리스트 수동 실행

**현재 브랜치 처리**: `feature/defeat-animation` 로컬만 유지 (미커밋), master에서 새 브랜치 `refactor/structure-split` 생성 예정
