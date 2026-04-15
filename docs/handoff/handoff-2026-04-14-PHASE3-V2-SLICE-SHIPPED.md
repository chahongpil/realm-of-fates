# 🔄 Realm of Fates — 세션 핸드오프 (PHASE 3 v2 수직슬라이스 라이브 배포)

> 이 문서를 새 세션에 붙여넣으면 맥락 즉시 복구. /clear → Ctrl+V.

생성: 2026-04-14 저녁
이유: 수동 저장 (하루 작업 마무리)

---

## 🎯 핵심 (한 줄 요약)
PHASE 3 시네마틱 전투 v2 수직슬라이스가 큐잉→SPD 실행 구조·FLIP 애니·dim 페이즈·VS 바까지 완성되어 GitHub Pages 로 라이브 배포됨. 스토리보드 19장 명세서 기반으로 P1~P8 전부 반영.

---

## 📍 현재 상태
- **Phase**: PHASE 3 시네마틱 전투 — 수직슬라이스 1차 완료
- **브랜치**: master
- **마지막 커밋**: `f30cf69 feat(battle-v2): PHASE 3 시네마틱 전투 수직 슬라이스`
- **라이브 URL**: https://chahongpil.github.io/realm-of-fates/
- **진입**: 타이틀 → `▶ PHASE 3 시네마틱 데모 (DEV)` 버튼
- **FEATURE.CINEMATIC_BATTLE**: `true` (라이브에서도 ON — 릴리스 전 false 원복 필요)
- **미커밋**: `js/12_data_skills.js.bak` 1개 (불필요, 다음 세션에 삭제 권장)

---

## ✅ 이번 세션에서 완료한 것

### 1. 스토리보드 전수 스캔 + 명세서
- `rof-storyboard-inspector` 신규 에이전트 첫 호출 → 19장 멀티모달 Read
- `design/battle_storyboard_spec.md` 9섹션 25 대조항목 생성
- 미해결 질문 7건 사용자 확정 반영 (§9):
  - 9.png "팔릴" = "짤릴" 오타
  - 6.png target-hover 해제 의미
  - 2.png 확대 배율 실측 → 약 2.0배 (최종 1.8배로 조정)
  - 13.png HP 프리뷰 `57` 최종값만 표시
  - 11.png 공격 스킬 dim: 본인+아군 전체
  - 14.png fire 모드: 캐스터 1장만 남김
  - 18.png 사망 애니는 1차 페이드아웃만

### 2. P1~P8 구현 (스토리보드 대조표 기반)
- **P1 dim 페이즈** — targetType 별 valid/dim 분기 (single_enemy / single_ally / self)
- **P2 카드 스케일** — focus 1.8배 / action 1.2배 이원화
- **P3 스킬 호버** — translateY(-120) scale(2.0) z-index:100
- **P4 HP 프리뷰 카드 내부 이전** — `.bv2c-hp-val` 직접 덮어쓰기 + `.bv2c-hp-delta-floating`
- **P5 확대 카드 자체 호버** — scale 1.1 + z-index:50 (스킬 row 위로 승격)
- **P6 fire 모드** — `#battle-v2-container.is-fire-mode` 로 그리드/스킬row/backdrop 전부 페이드아웃
- **P7 피격 흔들림** — 이미 구현됨, 검증만
- **P8 복귀 애니** — `#battle-char-focus.is-returning` + `bv2CardFocusOut` 260ms

### 3. 큐잉 → SPD 실행 구조 (사용자 재설계 지시 반영)
- `Battle.state.queue = [{attackerId, targetId, skillId}]`
- `onTargetClick` → 즉시 실행 금지, queue 에 push + `.is-queued` 체크마크 배지
- `allAlliesQueuedOrDead()` 만족 시 `autoQueueEnemies()` → `executeQueue()`
- executeQueue: SPD desc 정렬 후 순차 `performAttack` (양측 공통)
- 라운드 종료 → round++, queue reset
- `performAttack` 추출 — 공격자 그리드 위치에서 FLIP → fire → hit → 복귀 (아군/적군 공통)

### 4. FLIP 애니메이션
- `applyFocusOrigin(unit, scaleVar)` — 클릭 카드 rect 기준으로 `--bv2-origin-dx/dy/scale` 주입
- 키프레임 `bv2CardFocusIn` 재작성 — 변수 기반 이동
- 애니 재시작 패턴 (`offsetWidth` 강제 reflow)

### 5. 중앙 바 + 버튼 (index.html 구조 추가)
- `.battle-stage-mid` 신설: `[자동 전투] — VS — [전투 시작하기]`
- `Battle.onAutoBattle` — 미큐잉 아군 전부 기본 공격 자동 큐잉 후 즉시 실행
- `Battle.onStartCombat` — 남은 유닛 있으면 confirm, OK 시 대기(no-op) 로 실행
- 버튼 스타일: 금색(자동) / 주황(시작) 구분

### 6. 카드/프레임 튜닝
- 카드 크기: 130×180 → 170×240 → **210×290** (사용자 2회 요청)
- 프레임 가시성 강화: border 2→3px, inset glow 2px, 색상 선명화
- 스케일 변수 이원화: focus 1.8 / action 1.2

### 7. Git 푸시 + GitHub Pages 확인
- 23개 파일 커밋 (변경 12 + 신규 11), `.bak` 제외
- 커밋 `f30cf69` 푸시 완료, Pages 자동 배포 확인 (Last-Modified, v2 JS 최신 키워드 9건 탐지)

### 8. 메모리 신규 2건 + 에이전트 평가
- `reference_sfx_elevenlabs.md` — SFX 작업 시점에 ElevenLabs 추천
- `feedback_storyboard_inspector_first.md` — 시각 참조 있는 작업은 rof-storyboard-inspector 최우선 호출 (사용자 평가 "얘가 진짜 좋은애다")

---

## 🔴 미해결 / 후속 과제

### A. 규칙 파일 충돌 (아직 정리 안 됨)
- `.claude/rules/06-card-ui-principles.md` "전장 미니 타일 80×100, ATK/HP만" 조항이 PHASE 3 실제 구현(210×290 풀 정보 카드)과 정면 충돌
- 해결 방향: 해당 조항에 PHASE 3 예외 섹션 추가 또는 deprecated 표기

### B. `js/12_data_skills.js.bak` 잔재
- 다음 세션에서 삭제

### C. 브라우저 실측 미완
- 8개 수정사항 모두 노드 테스트만 통과 (8/8, 10/10), 실제 렌더 검증 안 됨
- 추천: `rof-ui-inspector` 로 스크린샷 기반 검증

### D. 기본 공격 stub
- 적 카운터 공격이 `BASIC_ATTACK_SKILL` 상수 1개만 쓰고 있음 (mult:1.0, flatBonus:0)
- 차후 확장: 적도 실제 스킬 셋 가지고 AI 결정

### E. 90초 큐잉 타이머 미구현
- 사용자 언급: "아군 행동 마치고 90초 안에 전투 시작 & 적 행동 마치고 90초 안에 전투 시작"
- 현재는 시각 타이머 UI 없음. 전부 큐잉되면 즉시 실행. 릴리스 전 타이머 표시 필요.

### F. FEATURE.CINEMATIC_BATTLE 라이브 true
- 개발용으로 ON. 일반 릴리스 시점에 false 원복.

---

## ⏭️ 다음에 할 일 (우선순위 순)

1. **`rof-ui-inspector` 로 배포본 시각 검증** — PHASE 3 데모 진입 후 스크린샷 캡처 → 카드 크기/프레임/VS 바/dim 페이즈 실제 렌더 확인
2. **`.bak` 파일 삭제** (`js/12_data_skills.js.bak`)
3. **06-card-ui-principles.md PHASE 3 예외 섹션 추가** — 미니타일 조항 vs 실제 구현 충돌 해소
4. **90초 큐잉 타이머 UI** — 중앙 바에 카운트다운 표시, 만료 시 자동 `onStartCombat()`
5. **적 AI 스킬 셋 확장** — BASIC_ATTACK_SKILL 단일 의존 탈피
6. **반사/카운터 스킬 targetType 예외 처리** — 공격 스킬인데 아군 대상 가능한 케이스
7. **사망 본격 애니메이션** — 원소별 `bv2CardMelt` / `bv2CardCrush` 분기
8. **실 데이터 전환** — DEMO titan 10장 → 실제 플레이어 덱 + 적 wave 데이터 로드

---

## 📝 이번 세션의 주요 결정

- **2026-04-14**: 전투 실행 모델 = **큐잉 → SPD desc 통합 정렬 → 순차 실행** (사용자 명시, 교대 턴제 거부)
- **2026-04-14**: `performAttack` 을 아군/적군 공통으로 추출, `suppressSkillRow` 로 분기
- **2026-04-14**: 카드 확대 스케일 이원화 — 유닛 선택 1.8배 / 실제 액션 1.2배
- **2026-04-14**: FLIP 애니메이션은 CSS 변수 주입 방식 (WAAPI 대신 키프레임 + `--bv2-origin-*`)
- **2026-04-14**: 스토리보드 명세서(`design/battle_storyboard_spec.md`) 가 정본. 기획서(PHASE3_BATTLE_CINEMATIC.md) 와 충돌 시 스토리보드 우선.
- **2026-04-14**: 스토리보드/레퍼런스 이미지 작업은 `rof-storyboard-inspector` 최우선 호출 (메모리에 영구 기록)

---

## 🔧 수정·신규 파일 목록

**JS**:
- `game/js/60_turnbattle_v2.js` — 큐잉/SPD/FLIP/performAttack/onAutoBattle/onStartCombat 전면 리팩터
- `game/js/config_battle.js` — 기존 유지, FEATURE 플래그 true
- `game/js/16_migration.js`, `tools/test_migration.js` — 이미 존재

**CSS**:
- `game/css/41_battle_v2.css` — 카드 크기/프레임/dim/fire-mode/is-action-mode/VS 바 스타일 대거 추가
- `game/css/80_animations_battle_v2.css` — `bv2CardFocusIn` FLIP 키프레임 재작성

**HTML**:
- `game/index.html` — `.battle-stage-mid` 바 3요소 추가

**명세·기획**:
- `design/battle_storyboard_spec.md` — 신규, 9섹션 25 대조항목
- `game/PHASE3_BATTLE_CINEMATIC.md` — 기존
- `design/battle-v2-migration.md` — 기존

**스토리보드**:
- `game/docs/battle_logic_v2/1~19.png` — 신규 (사용자 원본)

**메모리 신규**:
- `reference_sfx_elevenlabs.md`
- `feedback_storyboard_inspector_first.md`

---

## 📂 관련 참조 문서

- 스토리보드 명세서: `design/battle_storyboard_spec.md` (정본)
- 기획서: `game/PHASE3_BATTLE_CINEMATIC.md`
- 전투 엔진: `game/js/60_turnbattle_v2.js`
- 직전 체크포인트: `handoff-2026-04-14-PHASE3-V2-STORYBOARD-PENDING.md`
- 라이브: https://chahongpil.github.io/realm-of-fates/
- GitHub: https://github.com/chahongpil/realm-of-fates

---

## ⚠️ 주의사항

1. **캐릭터 이름 등장 시 `11_data_units.js` grep 필수** — 메모리 `feedback_character_identity_check.md`
2. **시각 스펙 작업은 `rof-storyboard-inspector` 먼저** — 메모리 `feedback_storyboard_inspector_first.md`
3. **레거시 `60_turnbattle.js` 수정 금지** — v2 파일만
4. **index.html 구조 변경은 사용자 동의 후** — 이번 세션에는 `.battle-stage-mid` 추가 승인 완료
5. **FEATURE.CINEMATIC_BATTLE 라이브 ON** — 릴리스 전 false 원복

---

<!-- Claude Code 지시사항: 이 문서는 이전 세션의 핸드오프입니다. 이 내용을 읽고 사용자에게 다음과 같이 응답하세요:

"🔄 핸드오프 복구 완료.

마지막 작업: PHASE 3 시네마틱 전투 v2 수직슬라이스 완성 + GitHub Pages 라이브 배포 (https://chahongpil.github.io/realm-of-fates/). 스토리보드 19장 기반 P1~P8 전부 반영, 큐잉→SPD 실행 구조, FLIP 애니, VS 바까지.

다음 작업: (1) rof-ui-inspector 로 배포본 시각 검증 → (2) .bak 파일 삭제 → (3) 06-card-ui-principles.md PHASE 3 예외 섹션 → (4) 90초 큐잉 타이머 UI

미해결: 06 규칙 파일 충돌, 적 AI 기본공격 stub 뿐, 90초 타이머 미구현, 사망 본격 애니 미구현

주의: 캐릭터 이름 grep 필수, 시각 작업은 rof-storyboard-inspector 먼저, 레거시 60_turnbattle.js 건드리지 말 것, FEATURE.CINEMATIC_BATTLE 라이브 ON 상태.

(1) 배포본 시각 검증부터 시작할까요?"

응답 후 사용자 지시 대기. -->
