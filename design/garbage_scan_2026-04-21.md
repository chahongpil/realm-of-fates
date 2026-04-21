# 가비지 스캔 리포트 (2026-04-21)

> garbage-cleaner 에이전트 스캔. **리포트만** — 실제 이동은 사용자 승인 후.
> 삭제 시 전부 `c:/work/trash/2026-04-21/` 로 mv.

## 요약

| 카테고리 | 건수 | 용량 |
|---|---|---|
| 🔴 즉시 trash 권고 | 5건 | ~51 MB |
| 🟡 검토 필요 | 8건 | ~2 MB |
| 🟢 보존 (아카이브 가치) | 4건 | ~23 MB |

**총 절감 예상**: 🔴 만 이동 시 약 **51 MB** (대부분 bg_title 중복 17MB × 2 + img/_archive 19MB + snd/_archive 3.6MB).

---

## 🔴 즉시 trash 권고 (5건)

### 1. `img/bg_title_angel.png` — **완전 중복**
- **크기**: 17.05 MB
- **증거**: MD5 해시가 `img/bg_title.png` 와 동일 (`a60fd991607d2cf5b7cddfa0281d23d2`).
- **참조**: `css/42_screens.css:7,12` 가 `bg_title_angel.png` 를 참조. 그러나 `css/42_screens.css:13` 의 `.bg-demon` 분기는 `bg_title_demon.png` (다른 해시).
- **원인**: 파일명을 `bg_title → bg_title_angel` 로 리네임하면서 원본을 복사 남김. `bg_title.png` 는 `HANDOFF.md:138` 에서 "덮어쓰기 대상" 으로 언급되어 있어 두 이름 모두 유효한 상태로 보존됨.
- **조치 제안**: `bg_title.png` 만 유지하고 CSS 를 `bg_title.png` 로 통일 후 `bg_title_angel.png` 제거. 또는 `bg_title.png` 제거(단, HANDOFF 문서 업데이트).
- **주의**: CSS 수정이 동반되므로 단순 이동이 아님. 대표님 승인 후 CSS 교체 + 이동 1회 커밋.

### 2. `img/bg_title_wide.png` — **완전 중복 (미참조)**
- **크기**: 17.05 MB
- **증거**: MD5 해시 `a60fd991607d2cf5b7cddfa0281d23d2` (bg_title.png, bg_title_angel.png 와 동일).
- **참조**: `css/*` / `js/*` 어디서도 런타임 참조 **0건**. `design/changelog.md:37` 에 "`body.game-mode:has(#title-screen.active)` + `bg_title_wide.png` 레이어" 언급만 있으나 실제 CSS 는 구현되지 않음 (stale design note).
- **원인**: 2560×720 파노라마 계획이었는데 angel/demon 랜덤으로 방향 전환되면서 파일만 남음. 파일 내용은 angel 이미지로 오버라이트됨.
- **조치**: 즉시 trash.

### 3. `img/_archive/` 전체 (4개 파일)
- **크기**: 19 MB
  - `bg_title_2026-04-19_archangel_master.png` 2.92 MB
  - `bg_title_2026-04-21.png` 1.80 MB
  - `bg_title_2026-04-21_v2.png` 9.55 MB (2560×1440 QHD, 3771 로 교체)
  - `bg_title_pre_2026-04-19.png` 2.22 MB
  - `bg_title_wide_2026-04-21.png` 2.36 MB
- **참조**: 전 코드베이스 grep **0건**. `_archive/` prefix 는 런타임 조회 스킵 규약.
- **원인**: 세대별 교체 시마다 "혹시 복귀할지 모르니" 아카이브. 실제 복귀는 한 번도 없었음 (2026-04-19 → 2026-04-21 3세대 교체, 전부 forward 진행).
- **조치**: 전체 trash. 복귀 필요 시 trash/ 에서 복원 가능.

### 4. `snd/_archive/title1_original_2026-04-11.mp3`
- **크기**: 3.55 MB
- **참조**: `snd/SOURCES.md:29` 에만 "보존" 기록. 코드 참조 0건.
- **원인**: 대표님이 "지겨워서" 교체 (2026-04-21). 원본 복귀 의사 없음.
- **조치**: trash. SOURCES.md 의 "_archive 보존" 라인은 남겨둬도 무해 (단순 크레딧 기록).

### 5. `game/mockup/card_v4_top/v2_editor.html`
- **크기**: 16 KB
- **참조**: 전 코드베이스 grep **0건**. 같은 폴더 `v1.html` 만 채택됨 (`design/worldbuilding_audit_2026-04-21.md:50` 이 `v1.html` 참조).
- **원인**: V4 카드 상단 리디자인 3안 중 v1 채택 → v2_editor 는 폐기 시안. "이제 됐다" 승인 후 남은 잔재.
- **조치**: trash. 필요 시 `v1.html` 도 정본이 실제 CSS 에 반영되었는지 확인 후 같이 정리 가능.

---

## 🟡 검토 필요 (8건)

### 6. `game/mockup/frame_check/index.html` + `game/mockup/frame_wiring/index.html`
- **크기**: 4 KB + 3.7 KB (합 7.7 KB)
- **참조**: `docs/handoff/handoff-2026-04-18-session-end.md:54-55,166-167` 에만 언급. 런타임 참조 0.
- **원인**: 프레임 9장 투명도 검증 + CSS 배선 테스트용 일회성 페이지. 역할 완료 후 방치.
- **판정 근거 부족**: 향후 프레임 재검증 시 재사용 가능성. 대표님 확인 필요.

### 7. `game/mockup/v4_card/v1.html`, `v2.html` (v3 채택)
- **크기**: 15 KB + 14.9 KB = 30 KB
- **참조**: `css/32_card_v4.css:5` + `js/40_cards.js:209` + `design/changelog.md:351` 가 `v3.html` 만 정본으로 명시 ("대표님 선택"). v1/v2 는 폐기 시안.
- **원인**: mockup 시안 3안 중 1개만 채택되는 워크플로. 나머지는 비교용으로 남음.
- **판정 근거**: 문서가 "v3 채택" 이라고만 하지 v1/v2 보존 지시 없음. 그러나 "시안 3개 비교 규칙" (`feedback_ui_mockup_first.md`) 때문에 보존 가치 있을 수 있음.

### 8. `game/mockup/protagonist_create/v1.html`, `v3.html` (v2 채택)
- **크기**: 6.9 KB + 7.9 KB = 14.8 KB
- **참조**: `docs/handoff/handoff-2026-04-21-2030.md:84,159` 가 v2 (Cockpit) 채택 명시. P6 에 이식 예정.
- **원인**: #7 과 동일. 3안 중 1개 채택.
- **판정 근거 부족**: v2 이식이 완료되기 전에는 v1/v3 비교 참조 가능성 있음.

### 9. `game/design/prototypes/town_editor.html`, `town_v1.html`
- **크기**: 15.8 KB + 8.7 KB
- **날짜**: 2026-04-16 생성, 이후 수정 없음 (5일 정체).
- **참조**: 현재 코드에서 쓰이지 않음. design/refs/town/ 도 같은 시기.
- **원인**: 타운 Gemini 생성 프로토타입. 실제 타운은 별도 경로로 구현됨.
- **판정 근거 부족**: 프로토타입 보존 관행 vs 미사용. 대표님 판단.

### 10. `game/design/prompts/_*.py` (6개)
- **크기**: 14 KB 합산
- **참조**: 자체 실행 스크립트 (town 생성용). 현재 호출되지 않음.
- **원인**: Gemini town asset 생성 때 쓴 일회성 파이썬. Phase 완료 후 stale.
- **판정**: 보존 가치 있음 — 타운 재생성 시 재사용. 🟢 보존 쪽에 가까움.

### 11. 오래된 핸드오프 9개 (2026-04-14 ~ 2026-04-16)
- `handoff-2026-04-14-PHASE3-{READY, V2-STORYBOARD-PENDING, V2-SLICE-SHIPPED}.md`
- `handoff-2026-04-15-{PHASE3-READY-TO-PORT, PHASE3-BLOCKERS-CLEARED, session-end}.md`
- `handoff-2026-04-16-{session-end, session2}.md`
- `handoff-2026-04-13-{1915, 2115, 2233, 2236}.md` (추가 4개)
- **총**: 13개, ~150 KB
- **참조**: `docs/handoff_archive_survey_2026-04-20.md` 가 "아카이브 제안" 으로 이미 분류. P3 (PHASE3) 이행 완료 후 stale.
- **원인**: 세션별 핸드오프를 누적. 정리 제안 문서는 있었으나 실행 안 됨.
- **판정**: 대표님의 "handoff_archive_survey" 검토 결과 반영 필요.

### 12. `game/design/autonomous_work_summary_2026-04-20.md`
- **크기**: ~6 KB
- **참조**: `docs/handoff/handoff-2026-04-21-0046.md:36,161`, `design/changelog.md:308` 에서 인용. "역사적 근거 문서" 로 참조됨.
- **원인**: 밸런스 문서 충돌 해결 (A안 채택) 의 근거. 결정 이후 stale 하나 근거는 남아야.
- **판정**: 🟢 보존 쪽. 대표님 확인만.

---

## 🟢 보존 (아카이브 가치, 4건)

### 13. `design/balance_audit_2026-04-20-night.md`, `balance_audit_2026-04-21.md`
- 밸런스 Source of Truth 확정 (2026-04-21 A안) 의 직접 근거. P0 재감사 예정 (rules/04-balance.md:84 에서 참조).
- **보존**.

### 14. `design/code_review_step4_2026-04-20.md`, `ui_inspection_2026-04-20-night.md`
- 자율 세션의 코드/UI 리뷰 결과. 향후 Step 5 참조 가능.
- **보존**.

### 15. `design/step5a_scan_2026-04-21.md`, `step5c_battle_v4_plan.md`, `v4_audit_2026-04-21.md`, `worldbuilding_audit_2026-04-21.md`, `lore_research_2026-04-21.md`, `play_director_report_2026-04-21.md`
- 오늘 생성, 진행 중 작업의 참조 문서.
- **보존**.

### 16. `game/shots/*.png` (67장, 76 MB)
- **날짜**: 2026-04-12 ~ 2026-04-21. 대부분 7일 내.
- 회귀 테스트 증빙 + 기획서 참조용. 오래된 것(`banner_long_thumb.png`, `char-select*.png` 4/12) 은 10일차 도달했으나 아직 참조 흔적 있을 수 있음.
- **판정**: 🟡 에 가깝지만 png 는 소모 속도가 느려 보존. 다음 세션에서 30일 기준으로 재검토.

---

## 🔎 코드 내 dead 참조 재검증

### rage 필드 잔존 (완료 상태)
- `js/55_game_battle.js:425` — 주석만 (`// 2026-04-21: rage 스탯 제거`). 실제 코드 참조 0.
- `js/11_data_heroes.js:25` — 주석만 (`// 2026-04-21: rage 제거 → fire 는 atk 만 +2`).
- `js/12_data_skills.js:29` — `sk_rage` 는 **스킬 id** (광전사의외침). 스탯 `rage` 와 무관, 유효.
- `js/14_data_images.js:51` — `sk_rage:__IMG+'sk_rage.png'` (스킬 아이콘). 유효.
- `js/60_turnbattle_v2.js:1412` — `imgKey:'sk_rage'` (스킬 아이콘 참조). 유효.
- **결론**: **rage 스탯은 완전히 제거됨**. `sk_rage` (스킬 id) 와 혼동하지 말 것. dead 참조 **0건**.

### PHASE 2 레거시 (유지 상태)
- `55_game_battle.js`, `56_game_effects.js` — `index.html:48-49` 에서 로드 중. **살아있음** (PHASE 3 시네마틱 = `60_turnbattle_v2.js`, PHASE 2 라운드 = `59_game_battle_round.js` / `55_game_battle.js`). 둘 다 공존 — 완전 대체 아님. dead 아님.

---

## 증류된 교훈 (반복 패턴, 2건 이상)

### 1. **리네임 시 원본 복사 보존은 즉시 중복 되는 함정**
- 증상: `bg_title.png` = `bg_title_angel.png` = `bg_title_wide.png` 가 모두 MD5 동일 (17MB × 3 = 51MB 중 34MB 순중복).
- 원인: 파일명 변경 시 `cp` 로 새 이름 만들고 원본은 "참조 있을까봐" 남김. 그러나 CSS 는 새 이름만 참조. 결국 3중 복사.
- 예방: **파일 리네임 시 `mv` 만 사용**. 참조 끊어질까 걱정되면 grep 먼저. cp 는 진짜 분기가 필요할 때만 (angel vs demon 처럼 실제 내용 다름).

### 2. **세대별 _archive 폴더는 "언젠가 복귀" 믿음인데 통계적으로 0%**
- 증상: `img/_archive/` 5개 + `snd/_archive/` 1개 = 22.6MB. 2026-04-19 이후 복귀 케이스 0건.
- 원인: 교체 시마다 "혹시 모르니" 보존. forward 진행만 됨.
- 예방: **git 이력이 이미 아카이브다**. _archive/ 폴더 규약 폐지 제안. 파일 삭제 시 바로 trash, git blame 으로 복원.

### 3. **mockup 3안 중 2개 폐기본 처리 규약 부재**
- 증상: `card_v4_top/v2_editor.html`, `v4_card/v{1,2}.html`, `protagonist_create/v{1,3}.html` 전부 비채택본. 4~5 KB 씩 누적.
- 원인: `feedback_ui_mockup_first.md` 는 "3안 먼저" 까지만 규정. 채택 후 비채택본 처리 규칙 없음.
- 예방: 채택 결정 시 비채택본 자동 trash 규약. 또는 `mockup/_rejected/` 로 이동.

---

## 다음 행동

대표님 OK 하시면:
1. 🔴 5건 (51MB) 을 `trash/2026-04-21/` 로 이동.
   - `bg_title_angel.png` 이동 시 **CSS 교체 동반** (`42_screens.css:7,12` → `bg_title.png`).
2. 🟡 8건은 **각각 개별 판단** — 번호로 알려주시면 해당만 이동.
3. 교훈 3건을 `.claude/rules/08-garbage-lessons.md` 에 append.

**제외 요청 방식**: "1, 2, 4 만 이동" / "🔴 전부 OK, 🟡 11 (핸드오프) 만 추가" 식으로.
