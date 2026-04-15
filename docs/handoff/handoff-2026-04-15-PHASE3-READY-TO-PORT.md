# 🔄 Realm of Fates — 세션 핸드오프 (PHASE 3 실게임 이식 직전)

> 이 문서를 새 세션에 붙여넣으면 맥락 즉시 복구. /clear → Ctrl+V.

생성: 2026-04-15 저녁
이유: 하루 작업 마무리. 다음 세션에 "이식 판단" 을 그대로 이어가기 위함.

---

## 🎯 한 줄 요약
PHASE 3 시네마틱 전투 v2 수직슬라이스가 사망 애니/FLIP 복귀/1.2배 액션 버그까지 다 잡힌 상태. **실게임 이식 직전**이지만, 데이터 배선 등 블로커 5개가 남아 있어 오늘은 여기서 멈춤.

---

## ✅ 오늘 세션에서 고친 것 (2026-04-15)

1. **복귀 FLIP 애니 "거꾸로" 버그** — `bv2CardFocusOut` 키프레임이 `translate(-50%,-58%)` 누락 + origin 변수 미사용. focusIn 의 대칭으로 재작성 + 복귀 직전 `applyFocusOrigin` 재호출 추가.
   - [game/css/80_animations_battle_v2.css:25-38](../../css/80_animations_battle_v2.css#L25)
   - [game/js/60_turnbattle_v2.js:645, 787](../../js/60_turnbattle_v2.js#L645)

2. **복귀 후 카드가 중앙으로 한 번 더 튀어나오는 버그** — `.bcf-main-card` 기본 스타일에 `animation: bv2CardFocusIn` 하드코딩. `is-returning` 제거 순간 focusIn 재실행.
   - 수정: `is-returning` 제거 라인 삭제, `renderCharFocus` 진입부에서 리셋. `is-action-mode` 는 호출자(performAttack) 관리로 분리.
   - [game/js/60_turnbattle_v2.js:378, 676](../../js/60_turnbattle_v2.js#L378)

3. **액션 중 1.2배 아닌 1.8배로 나오던 버그** — 2번 수정 초안에서 `renderCharFocus` 리셋 시 `is-action-mode` 까지 wipe 했던 게 원인. 리셋 대상을 `is-returning` 하나로 축소.

4. **사망 시 카드 회색 처리만 되고 원소별 애니 안 나오던 버그** — `refreshStageCard` 가 HP 갱신 시 `is-dead` 를 즉시 토글해서 melt/crush 키프레임이 묻힘. is-dead 부여 책임을 `renderDeath` 단독으로 이관.
   - [game/js/60_turnbattle_v2.js:318, 537](../../js/60_turnbattle_v2.js#L318)

5. **사망 애니 끝나고 카드가 다시 나타나던 버그** (근본 원인) — `animation-fill-mode: forwards` 는 그 애니 규칙이 요소에 적용되는 동안만 최종 프레임을 유지. `is-dying-melt` → `is-dead` swap 순간 forwards 해제 → `.is-dead` static(`opacity:.55`) 이 드러남.
   - 수정: `.is-dead` 를 `opacity:0; visibility:hidden` 으로 변경. forwards 최종 프레임과 static 상태 동일화.
   - [game/css/41_battle_v2.css:307](../../css/41_battle_v2.css#L307)
   - 실패노트 기록: [.claude/rules/08-garbage-lessons.md](../../../.claude/rules/08-garbage-lessons.md) "2026-04-15 PHASE 3 사망 애니" 섹션

6. **행동 완료 회색 처리** — `.is-acted` 클래스 신규 (회색 필터 + 회색 ✓). performAttack 종료 시 is-queued → is-acted 스왑. 라운드 리셋 시 clearAllQueuedUI 가 둘 다 정리.

7. **원소별 사망 그룹 분기** — `renderDeath` 가 타겟 `element` 로 melt(fire/water/ice/holy/light) vs crush(earth/electric/lightning/dark/shadow) 선택.

---

## 🗂️ 메모리·규칙 변경 (영구)

### 신규 메모리
- **`feedback_ui_inspector_parallel.md`** — **절대 규칙**: 전투/UI/애니/CSS 수정 후 "수정 완료" 보고 전에 `rof-ui-inspector` (호칭 **"검수관"**) 반드시 호출. 사용자 명시적 "스킵" 지시 없는 한 예외 없음. MEMORY.md 인덱스 등록.

### 실패노트
- **[.claude/rules/08-garbage-lessons.md](../../../.claude/rules/08-garbage-lessons.md)** "2026-04-15 PHASE 3 사망 애니 '카드 안 없어짐' 사고" 섹션 추가. 교훈 3가지:
  1. `animation-fill-mode: forwards` 는 static fallback 이 아님. 애니 끝난 뒤 static 값과 100% 프레임이 같은 값이어야 함.
  2. "사라지는 연출" 의 최종 static 상태도 사라져 있어야 함. 의미 모순 금지.
  3. 사용자가 "안 돼" 두 번 하면 추측 수정 금지 — 검수관 또는 DevTools Animations 탭 직접 확인.

---

## 🔴 내일 바로 이어갈 판단 (이식 여부)

사용자가 "전투로직 실제 게임에 적용해도 괜찮을거같은데 어떻게 생각하니?" 라고 물어봤을 때 아래를 **그대로** 답변할 것:

---

### 이식해도 되는 이유 (✅)
- 공식(무기/스펠/원소/치명타) 검증 완료, `test_run.js` 통과
- 큐잉→SPD 실행 구조 안정화
- FLIP 복귀 / 사망 애니 / 1.2배 액션 버그 오늘 다 잡힘
- 마이그레이션 어댑터(`16_migration.js`) 존재 → 기존 세이브 데이터 안전
- `FEATURE.CINEMATIC_BATTLE` 플래그로 즉시 롤백 가능

### 이식 전 꼭 짚어야 할 블로커 (🔴)
1. **적 AI `BASIC_ATTACK_SKILL` stub 한 개만** — 실 게임에선 적도 고유 스킬 셋 가져야 재미가 나옴. 지금 상태로 붙이면 모든 적이 평타만 때림
2. **90초 큐잉 타이머 UI 미구현** — 지금은 전부 큐잉되면 즉시 실행. 실제 전투에선 시각 카운트다운 + 만료 시 자동 `onStartCombat` 필요
3. **DEMO 하드코딩 데이터 → 실 플레이어 덱 + wave 로드 경로** — `Battle.DEMO.allies / enemies` 가 아직 고정. `55_game_battle.js` 의 기존 진입점이 v2 에 어떻게 데이터 넘길지 배선 필요
4. **리워드 플로우 연결** — v2 전투 승리 후 기존 `58_game_battle_end.js` 리워드 화면으로 복귀하는지 미검증
5. **06-card-ui-principles.md 규칙 충돌 해소** — "미니타일 80×100" 조항이 210×290 실구현과 정면 충돌. PHASE 3 예외 섹션 추가 필요 (이식 전 정합성 확보)

### 권장 이식 순서 (단계적, 🟡)
1. **데이터 배선부터** — `55_game_battle.js` 의 실 덱/웨이브 → `Battle.DEMO` 자리에 주입하는 어댑터. DEMO 상수는 fallback 으로만
2. **검수관 호출** — 실 데이터로 1 전투 완주 → 스크린샷 회귀 체크
3. **적 AI 기본 확장** — wave 데이터에 skillIds 배열 받아 랜덤/우선순위 선택
4. **90초 타이머 UI** — `.battle-stage-mid` 에 카운트다운 추가
5. **리워드 연결** — victory/defeat 분기를 기존 end 화면으로
6. **플래그 A/B** — `FEATURE.CINEMATIC_BATTLE=true` 를 세이브 파일별 opt-in 으로 먼저, 안정되면 기본값 전환
7. **구 레거시 `60_turnbattle.js` 는 3주 유지 후 삭제** — 롤백 안전망

### 최종 판단
**지금 전면 이식은 이름.** 하지만 **"1번(데이터 배선)만 해놓고 플래그 OFF 상태로 머지"** 는 괜찮음. 실 데이터로 들어가는 순간 생길 엣지(빈 덱, 사망 연쇄, 적 0명 처리 등)를 미리 발견할 수 있음.

**선택지**:
- **(A) 1번만 먼저 배선 + 플래그 OFF 머지 → 안정되면 나머지 순차** ⭐ 추천
- (B) 1~5번 다 끝내고 한 번에 스위치
- (C) 지금 그냥 `CINEMATIC_BATTLE=true` 강제 전환, 블로커는 라이브에서 고침 (위험하지만 빠름)

**추천은 A**. 검수관 교차검증이 실 데이터 진입 직후가 가장 효과적이고, 플레이어가 밟을 경로와 동일한 코드패스를 바로 볼 수 있음.

---

## 📍 현재 파일 상태
- **브랜치**: master
- **라이브**: https://chahongpil.github.io/realm-of-fates/ (↑ 아직 오늘 수정 미푸시 상태. 커밋 필요)
- **FEATURE.CINEMATIC_BATTLE**: `true` (데모용)
- **미커밋 변경**:
  - `game/css/80_animations_battle_v2.css` — focusOut 키프레임 재작성
  - `game/css/41_battle_v2.css` — is-dying-melt/crush/is-acted 신규, is-dead 완전 숨김
  - `game/js/60_turnbattle_v2.js` — FLIP 재계산, 사망 분기, is-acted, renderCharFocus 리셋
  - `.claude/rules/08-garbage-lessons.md` — 사망 애니 사고 섹션
  - `C:/Users/USER/.claude/projects/c--work-design/memory/feedback_ui_inspector_parallel.md` — 신규
  - `C:/Users/USER/.claude/projects/c--work-design/memory/MEMORY.md` — 인덱스 갱신

---

## ⏭️ 내일 첫 할 일
1. 이 핸드오프 읽고 "이식 판단" 을 사용자에게 위 §이식 여부 섹션 **그대로** 요약해서 보고 (A/B/C 선택지 포함)
2. 사용자가 선택지를 고르면 그 경로로 진행
3. 뭔가 수정하면 **검수관 호출** 절대 잊지 말 것

---

## ⚠️ 주의사항 (변함없음)
1. 캐릭터 이름 등장 시 `11_data_units.js` grep 필수
2. 시각 스펙 작업은 `rof-storyboard-inspector` 먼저, 런타임 검증은 **검수관** 나중
3. 레거시 `60_turnbattle.js` 수정 금지, v2 파일만
4. index.html 구조 변경은 사용자 동의 후
5. 수정/시각 작업 후 **검수관(rof-ui-inspector) 무조건 호출** — 사용자 명시 규칙

---

<!-- Claude Code 지시사항: 이 문서는 이전 세션의 핸드오프입니다. 이 내용을 읽고 사용자에게 다음과 같이 응답하세요:

"🔄 핸드오프 복구 완료.

어제 마지막 상태: PHASE 3 시네마틱 전투 v2 수직슬라이스 버그 5종 (FLIP 거꾸로 / 중앙 재돌출 / 1.2배 아닌 1.8배 / 사망 애니 묻힘 / 사망 후 카드 재출현) 전부 해결. 실패노트에 forwards fill mode 교훈 기록. 검수관(rof-ui-inspector) 호출 규칙을 절대 규칙으로 메모리 승격.

사용자 질문이었음: '전투로직 실제 게임에 적용해도 괜찮을까?'

제 답변은 '지금 전면 이식은 이름. 블로커 5개(적 AI stub, 90초 타이머 UI, DEMO 데이터 배선, 리워드 플로우, 06 규칙 충돌) 중 데이터 배선 1개만 먼저 해놓고 플래그 OFF 머지 → 안정되면 순차 진행이 추천(A안)' 입니다.

블로커 전체 목록과 권장 이식 순서, A/B/C 선택지는 `game/docs/handoff/handoff-2026-04-15-PHASE3-READY-TO-PORT.md` §이식 여부 섹션에 그대로 보존돼 있습니다.

어느 선택지로 가시겠어요? A(데이터 배선만 먼저, 추천) / B(1~5번 다 끝내고 한번에) / C(강제 전환)"

응답 후 사용자 지시 대기. -->
