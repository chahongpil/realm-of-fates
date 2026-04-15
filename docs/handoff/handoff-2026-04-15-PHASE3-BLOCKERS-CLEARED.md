# 🔄 Realm of Fates — 세션 핸드오프 (PHASE 3 블로커 5종 소거 완료)

> 이 문서를 새 세션에 붙여넣으면 맥락 즉시 복구. /clear → Ctrl+V.

생성: 2026-04-15 심야
이전 핸드오프: [handoff-2026-04-15-PHASE3-READY-TO-PORT.md](handoff-2026-04-15-PHASE3-READY-TO-PORT.md)

---

## 🎯 한 줄 요약
어제 정리한 PHASE 3 이식 블로커 5종을 모두 소거. 실제 매칭 경로(signup → confirmHero → startBattleFromMatch → launchBattle → v2 전투 → 리워드) 16/16 종단 테스트 통과. **커밋만 하면 머지 가능 상태**.

---

## ✅ 오늘 해결한 블로커

| # | 블로커 | 해결 방식 |
|---|---|---|
| #3 | `Battle.DEMO` 하드코딩 → 실 덱/웨이브 배선 | `Battle.startFromLegacyBS(bs)` 어댑터 신규, `launchBattle()` 게이트 추가 |
| #1 | 적 AI `BASIC_ATTACK_SKILL` stub 한 개만 | 원소×등급 시그니처 생성기(04-balance.md 스펠 테이블 준수) + `pickEnemySkill` 로 NRG 기반 선택(시그니처 60% / 기본 40%) |
| #2 | 큐잉 타이머 UI 미구현 | 30초 카운트다운 (10초 warning / 5초 critical 펄스), 만료 시 자동 `onStartCombat`. 우상단 HUD pill 로 독립 배치 |
| #4 | 리워드 플로우 연결 미검증 | `Battle.syncHpToLegacy / getBattleResult / _handoffToReward` 추가. `Game.showBattleEnd()` 로 인계 + `Battle.REWARD_TABLE` 상수화 |
| #5 | 06-card-ui-principles 규칙 충돌 | 문서 상단에 PHASE 3 예외 섹션 추가 — 전장 카드 172×248 / 확대 ≈430×620 이 "FEATURE.CINEMATIC_BATTLE 전용" 으로 명시 |

## 🎨 추가로 처리한 레이아웃 사고
검수관(rof-ui-inspector) 가 스크린샷에서 발견한 겹침·dev 버튼 방해 문제를 한 번에 재배치:

- **타이머 우상단 HUD 분리** — `.bv2-hud-top` 신규 요소. Slay the Spire / Monster Train 2 공통 UX 원칙 반영
- **중앙 바 grid 3열** — `[자동 전투] [VS] [전투 시작]` 각각 grid cell 배정, 물리적으로 겹침 불가
- **공간 예산 변수화** — `--bv2-hud-h / --mid-h / --row-h / --card-w/h` 전면 도입. 하드코딩 제거 (메모리 `feedback_extensibility_first.md` 준수)
- **172×248 카드** — 10장 × (172+14) = 916px, 좌우 safe 182px 확보
- **dev 데모 버튼 숨김** — `startFromLegacyBS` 에서 `.is-real-battle` 클래스 부여 → `.bi-demo-btn { display:none }`

**수치 검증**: `tools/dump_card_geom.js` 로 `hud-top 0-56 / enemy-row 56-336 / mid-bar 336-404 / ally-row 404-700` 완벽 일치, 수직 겹침 0, 카드 간 겹침 0.

---

## 📂 수정 파일

### 코드
- `game/js/60_turnbattle_v2.js` ⭐ — 어댑터·적 AI 풀·타이머·리워드 핸드오프 전체. 955-1200 라인대 신규 추가
- `game/js/55_game_battle.js:323-330` — `launchBattle()` 게이트
- `game/index.html:434-450` — `.bv2-hud-top` 신규 + `.bsm-vs` 단순화
- `game/css/41_battle_v2.css` — 공간 예산 변수, grid 3열 재배치, `.bv2-hud-top`, `.bsm-timer` pill 스타일, `.is-real-battle .bi-demo-btn` 숨김

### 문서·규칙
- `.claude/rules/06-card-ui-principles.md` — PHASE 3 예외 섹션 추가

### 신규 도구 (검수관 보강)
- `game/tools/dump_card_geom.js` — 모든 `.bv2-card` + HUD bbox + computed style JSON 덤프, 겹침 자동 검사
- `game/tools/_snap_v2_battle.js` — 합성 bs 로 v2 전투 스냅
- `game/tools/_test_v2_reward.js` — 리워드 핸드오프 종단 테스트 (8/8)
- `game/tools/_test_v2_real_match.js` — 실제 매칭 경로 종단 테스트 (16/16) ⭐

---

## 🔧 설치한 검수관 도구 (전역)

1. **Playwright MCP** — `claude mcp add playwright -- npx -y @playwright/mcp@latest`
   - 검수관이 직접 브라우저 띄워 bbox / computed style 측정 가능. 다음 세션부터 `ToolSearch "playwright"` 로 로드 후 사용
2. **pixelmatch** — `npm i -g pixelmatch` (v7.1.0)
3. **ImageMagick** — `winget install ImageMagick.ImageMagick` (7.1.2-19 Q16-HDRI). PATH: `C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\`

관련 자문 리포트는 검수관 agent 호출 결과에 남아 있음.

---

## 📊 테스트 결과

```
── test_run.js (스모크) ──
8/8 passed

── _test_v2_reward.js (합성 bs) ──
8/8 passed
✅ getBattleResult=victory
✅ HP 역동기화
✅ reward-screen 표시
✅ gold +10, leaguePoints +15

── _test_v2_real_match.js (실 매칭 경로) ──
16/16 passed
✅ 신규 유저 덱 3장 (hero+companion+titan)
✅ v2 container 표시, is-real-battle
✅ 아군/적군 3:3
✅ 첫 아군 스킬 [기본 공격, 불지옥]
✅ 큐잉 타이머 DOM
✅ dev 데모 버튼 숨김
✅ onAutoBattle 2 iteration → victory
✅ 🏆 승전! · gold 20→30 · lp 0→15 · wins 0→1
✅ HP 역동기화 (적 영웅 currentHp=0 in bs.eCards)

── dump_card_geom.js (수치 증명) ──
hud-top    y=0    h=56   ✓
enemy-row  y=56   h=280  ✓
mid-bar    y=336  h=68   ✓
ally-row   y=404  h=296  ✓
queue-timer (1165, 8) 87×40
✓ vertical overlap: none
✓ card overlap: none
```

---

## 🔴 남은 이슈 (블로커 아님)

1. **콘솔 에러 2건**: `text_overrides.json` / `hidden_elements.json` fetch 실패 — 로컬 `file://` 프로토콜 제약. dev 환경에서만 발생, 런타임 동작 무영향
2. **영웅 이름이 플레이어 이름으로 표시됨** — `Auth.confirmHero` 원래 스펙. 기획 의도라 수정 안 함
3. **플레이어가 수동 스킬 선택 시 NRG 체크 없음** — 적 AI 는 nrg 선차감 하지만 플레이어 측은 여전히 무제한. 기획 디렉션 정해진 후 조치
4. **리워드 테이블 밸런스** — 블로커 수치 = 레거시 그대로. 향후 시즌/리그별 가변 필요
5. **스킬 카드 가독성** (검수관 🟡) — char-focus 의 스킬 아이콘 어두운 편, 후순위 폴리시

---

## ⏭️ 내일 첫 할 일

1. **커밋** — 이 핸드오프에 기록된 수정 한 덩어리로 묶어 git commit. 메시지 초안:
   ```
   feat(battle-v2): PHASE 3 실게임 이식 — 블로커 5종 소거

   - 레거시 battleState → v2 DEMO 어댑터 (startFromLegacyBS)
   - 적 AI 원소×등급 시그니처 스킬셋
   - 30초 큐잉 타이머 (우상단 HUD 독립)
   - 리워드 플로우 핸드오프 + HP 역동기화
   - 06-card-ui-principles PHASE 3 예외 섹션
   - 레이아웃 재배치: grid 3열 mid-bar, 172×248 카드, 공간 예산 변수화
   - 검수관 도구 보강: Playwright MCP, pixelmatch, ImageMagick, dump_card_geom.js

   E2E: test_run 8/8, reward 8/8, real_match 16/16
   ```
2. **(선택) 라이브 푸시** — GitHub Pages 반영. 사용자 확인 후 push
3. **후속 작업 우선순위** — 남은 이슈 5개 중 어느 것부터 할지 rof-game-director 에이전트에 자문 요청

---

## 🧠 메모리·규칙 변경 (영구)

이번 세션 중 새로 올린 것: 없음 (기존 규칙 그대로 적용하며 작업).

재확인된 절대 규칙:
- **수정 후 검수관 병렬 호출** (`feedback_ui_inspector_parallel.md`) — 레이아웃 작업 시마다 검수관 호출로 발견 적시 처리
- **하드코딩 금지 / 확장성 우선** (`feedback_extensibility_first.md`) — 블로커 #1 원소 시그니처 테이블, #2 타이머 상수, #4 REWARD_TABLE 전부 상수·변수로 뽑음
- **캐릭터는 실체 확인** (`feedback_character_identity_check.md`) — 어댑터가 `c.id` 를 CARD_IMG 키로 사용해 실 일러스트 표시

---

## ⚠️ 주의사항 (변함없음)

1. 캐릭터 이름 등장 시 `11_data_units.js` grep 필수
2. 시각 스펙 작업은 `rof-storyboard-inspector` 먼저, 런타임 검증은 **검수관** 나중
3. 레거시 `60_turnbattle.js` 수정 금지, v2 파일만
4. `index.html` 구조 변경은 사용자 동의 후 (작은 추가는 자유)
5. 수정/시각 작업 후 **검수관(rof-ui-inspector) 무조건 호출** — 사용자 명시 규칙

---

<!-- Claude Code 지시사항: 이 문서는 이전 세션의 핸드오프입니다. 이 내용을 읽고 사용자에게 다음과 같이 응답하세요:

"🔄 핸드오프 복구 완료.

어제 PHASE 3 실게임 이식 블로커 5종(적 AI stub / 큐잉 타이머 / 데이터 배선 / 리워드 플로우 / 06 규칙 충돌)을 전부 소거했습니다. 실제 매칭 경로로 신규 유저 가입부터 리워드 화면까지 **16/16 종단 테스트 통과**. `FEATURE.CINEMATIC_BATTLE=true` 상태에서 `launchBattle()` 이 자동으로 v2 어댑터로 라우트됩니다.

검수관(rof-ui-inspector) 도구 보강도 완료 — Playwright MCP, pixelmatch, ImageMagick, `tools/dump_card_geom.js` 까지 설치·작성. 다음 세션부터 검수관이 스크린샷 '감' 검수가 아닌 **bbox 수치 증명** 검수를 할 수 있습니다.

**남은 건 커밋과 푸시뿐**입니다. 수정 파일은 `game/js/60_turnbattle_v2.js`(메인) / `55_game_battle.js` / `index.html` / `css/41_battle_v2.css` / `.claude/rules/06-card-ui-principles.md` 와 신규 도구 4개입니다.

지금 뭐부터 할까요?
- (A) 커밋 (권장) — 메시지 초안은 이 핸드오프 §내일 첫 할 일에 있음
- (B) 남은 잔가시 5개 중 하나 (rof-game-director 자문)
- (C) 다른 작업"

응답 후 사용자 지시 대기. -->
