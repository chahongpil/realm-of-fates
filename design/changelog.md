# 기획 변경 로그

> ⚠️ 이 파일은 **append-only**. 과거 기록 수정/삭제 금지. 번복은 새 항목으로.
>
> 형식: `## YYYY-MM-DD ▶ 카테고리 ▶ 제목` / 변경 / 이유 / 영향 / 이전 결정 관계
>
> 카테고리: `기술 스택`, `수익 모델`, `게임 메커닉`, `밸런스`, `콘텐츠`, `범위`, `팀/협업`, `세션`

---

## 2026-04-21 저녁 ▶ 콘텐츠 ▶ 신규 유닛 14장 이식 (11종 신규 + 3종 이미지 교체)
- 변경:
  1. **신규 유닛 11종** (51 유닛, +11):
     - bronze(1): pirate
     - silver(4): stormcaller / stonemason / tidal_knight / dark_shaman
     - gold(3): stonemason_noble / tidal_knight_noble / flame_warrior
     - legendary(3): mountain_breaker / sea_paladin / flame_guardian
  2. **이미지 교체 3장** (기존 유닛 유지): infantry / lancer / priest
  3. 스크립트 `tools/import_units_0421.py` (normalized/ → game/img/ 매핑 14장 한국어→영문 ID).
- 이유: 대표님 2026-04-21 공급 일러스트 14장. 원소 균형(fire/water/earth/dark 보강) + 역할 균형(defense 탱커 4종 보강).
- 영향: 회귀 9/9 PASS (UNITS 40→51). 등급 조정 2회 (1회차 내가 이미지만 보고 추정 → 2회차 대표님 확정 등급 반영). 최종 confirmed: pirate=bronze, dark_shaman=silver, flame_warrior=gold, flame_guardian=legendary, mountain_breaker=legendary.
- 관계: 주인공 시스템 리뉴얼과 독립. P6 UI 이식 + 스펠/유물 이식은 별도 커밋.

## 2026-04-21 오후(3차) ▶ 콘텐츠 ▶ 주인공 시스템 리뉴얼 (P1~P5)
- 변경:
  1. **기존 18종 영웅 폐기** — `h_m/r/s_*` × 6원소 = 18 (`js/11_data_units.js` 에서 삭제, `img/h_*.png` 18장 → `trash/img_heroes_legacy_2026-04-21/`).
  2. **신 구조**: `js/11_data_heroes.js` 신규. 성별(m/f) × 역할(warrior/ranger/support) = 6 템플릿 + `ELEMENT_BONUS` 런타임 주입 + `HERO_SKILL_TABLE` (원소×역할 시그니처 스킬/보너스). `RoF.Data.createHero({gender, role, element, skinIndex})` 이 유닛 객체 반환.
  3. **이미지**: `protagonist_m/f_{warrior_1..3,ranger,support}.png` 8장 공급 (400×600, 비율 유지 투명 캔버스). `tools/import_protagonists.py` 스크립트. 남자 전사 3장은 스킨 랜덤(skinIndex), 나머지 1장씩.
  4. **state 구조**: `state.heroBaseId` 폐기 → `state.hero = {gender, role, element, skinIndex}` 로 전환. `50_game_core.load/persist`, `32_auth.confirmHero`, `57_game_battle_ui.newRun`, `99_bootstrap.js` 3군데 전환.
  5. **라우팅 참조**: `32_auth._showHeroScreen` + `55_game_battle` 봇 생성 둘 다 `createHero()` 로 교체. `20_helpers.getHeroId` deprecated 처리 (hero_* 포맷 반환).
  6. **원소 이펙트 오버레이**: `.card-v4-elem-fx` 빈 레이어 추가 (`css/32_card_v4.css`, `40_cards.js`). 대표님 공급 대기 중이라 placeholder 1×1 투명 PNG 6장 선제 생성(`img/elem_fx_{원소}.png`). 공급 시 파일만 교체.
  7. **mockup 3안** — `game/mockup/protagonist_create/v1~v3.html` (3-Step / Cockpit / Radial). 대표님 v2(Cockpit) 선택 → P6 이식 예정.
  8. **test_run.js**: `h_m_fire` skillIds 테스트 → `createHero({gender:'m',role:'warrior',element:'fire'})` 기반으로 갱신. **회귀 9/9 PASS**.
- 이유: 기존 18종은 "선택지 중복"(성별 없음) + "이미지 1:1 강제"라 확장성 부재. Q2 "외형 바리에이션만" 결정으로 스탯·스킬은 원소별 차별(기존 계승) + 이미지는 성별×역할 슬롯 + 랜덤 스킨 구조로 분리.
- 영향: **balance-auditor PASS** (기존 h_m_fire 와 신 createHero 산출 스탯 100% 일치 — base(2,50,1,1,5,5,1,1,1,2,1) + fire bonus(atk+2, rage+2) = atk4/hp50/def1/spd1/rage7/nrg5. 18칸 전부 `04-balance.md` 영웅 범위 내). UNITS 수 58→40 (영웅 18 소멸). 경고 2건 기록: ① 경계값 집중 (원소 보너스 1 더 올리면 범위 초과), ② ranger/support non-lightning spd 1 (기존 18종부터 있던 이슈). 
- 관계: Q1(역할 A) / Q2(외형 바리에이션만) / Q5(mockup 3안) / Q6(skinIndex 고정) / Q7(이펙트 빈 레이어) / Q8(B 코스메틱만) 대표님 결정 반영. 다음: **P6 — v2 mockup → `char-create-screen` 실 이식 + 성별 선택 단계 추가**, P7 — 최종 회귀·커밋.

## 2026-04-21 오후(2차) ▶ 밸런스 ▶ P0 5건 SoT 재판정 + archangel/sniper 상향
- 변경:
  1. **archangel** (legendary melee defense): atk 6→7, def 5→8. SoT(rules/04-balance.md) legendary defense 범위 atk7~10/def8~14 하한 맞춤.
  2. **sniper** (silver ranged attack): hp 8→10. SoT silver attack 범위 hp10~18 하한 맞춤.
  3. **dragon/lich/archmage 는 수정 없음** — 기존 rarity 하향 조치(legendary/gold/silver)가 이미 신 SoT 범위 안이라 재판정 결과 PASS.
- 이유: 2026-04-21 A안 확정으로 구 `design/balance.md` 폐기 후 `rules/04-balance.md` 가 단일 SoT. 구 감사 리포트(`balance_audit_2026-04-20-night.md`)는 폐기된 스케일 기준이라 scope 10배 과장되어 있었음. 신 SoT 로 재판정하니 P0 5건 → 실 수정 2건.
- 영향: 58 유닛, 회귀 9/9 PASS, balance-auditor 재검증 PASS. 코드·데이터 정합성 복구.
- 관계: current-focus.md "P0 5건 대기" 해소. "암흑의저격수 대기" 항목은 대표님 지시로 제거(데이터 추가 취소).

## 2026-04-21 오후 ▶ 콘텐츠 ▶ Step 5C Battle V4 이식 기획서 작성
- 변경: `design/step5c_battle_v4_plan.md` 신규. Phase 3 시네마틱 전투 `.bv2-card` → `.card-v4.card-v4-compact` 이식 플랜. 옵션 A(Compact Variant, 권장) · B(확대만 V4) · C(row 확장) 3안 비교. 권장 A 의 4단계 분해(A1 CSS ~45분 / A2 Stage 렌더 ~60분 / A3 Focus 카드 ~90분 / A4 검증 ~30분, 총 3:45).
- 이유: Step 5 V4 확장 8화면 완결 후 남은 유일 화면 = 전투. 별도 규격(172×248 기본 / 430×620 확대)이라 Step 5A~5D 와 분리된 기획 필요. 대표님 결정 대기 항목 4건 (옵션 A 채택 / A3 포함 / 9px 스탯 허용선 / parch.desc 처리).
- 영향: 코드 수정 0. 대표님 승인 후 실행. 뷰포트 1280×720 고정 준수(옵션 C 배제). V4 setter API(setHP/setNRG/setStatus/setShield/setStatModifier) 실전 검증 기회.
- 관계: handoff-2026-04-21-1115.md "P0 Step 5C Battle 이식" 구체화.

## 2026-04-21 오후 ▶ 세션 ▶ 핸드오프 저장
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-21-1500.md` 에 저장.
- 이유: 수동 저장 (대표님 지시 "마무리하자"). 오후 4커밋 Step 5C 완결 + 정리 마감.
- 영향: 다음 세션 `/clear → Ctrl+V` 로 맥락 복구.

## 2026-04-21 오후 ▶ 콘텐츠 ▶ Step 5C 후속 3건 (v2.* console noise 제거 + is-action-mode 진단)
- 변경:
  1. **99_bindings v2.* silent skip** (`js/99_bindings.js`) — `data-action="v2.charClick"` 등은 `Battle._installDelegatedListeners` 가 자체 처리. 99_bindings 는 "v2" 모듈 몰라서 매 클릭마다 `[bindings] 알 수 없는 모듈: v2` 에러 찍던 noise. `resolveAction` 에서 `moduleName==='v2'` 조기 return null.
  2. **is-action-mode / is-returning 초기 잔재 진단** — 핸드오프 4/21 11:15 에 기록된 "Focus 카드가 처음 클릭 시 1.2배로 보임" 추정 버그. Playwright 재검증 결과 **정상**: page load → start → click → 500ms 후까지 모두 `className="battle-sub"` 깨끗. 이전 관찰은 반복 click/cancel/재click 누적 결과로 판명. 실질 버그 없음.
- 이유: 전투 UX 미세 개선. 콘솔 노이즈가 디버깅 시 가짜 신호.
- 영향: 회귀 9/9 PASS. 전투 플로우 동일.
- 관계: Step 5C dead code 청소(eea005b) 직후 final 마감.

## 2026-04-21 오후 ▶ 콘텐츠 ▶ Step 5C dead code 청소 (.bv2-card / .bv2c-* / bcf-*)
- 변경:
  1. **CSS `.bv2-card` 블록 일괄 삭제** (`css/41_battle_v2.css` L233-491, 약 260줄) — wrapper/frame/img/icon/name/status-row/hp/stats/desc/nrg + 상태 클래스(is-selected/is-target-*/is-hit/is-dead/is-dying-*/is-acted/is-queued/is-dimmed) 전부 dead. Step 5C 에서 `.card-v4.card-v4-compact` 로 전환 후 자식 `.bv2c-*` 생성 안 됨. `.bv2c-hp-delta-floating` (HP 프리뷰 floating 라벨) 만 유지.
  2. **JS 셀렉터 치환** (`js/60_turnbattle_v2.js`) — `.battle-stage-grid .bv2-card` × 9 → `.card-v4-compact`. `buildCardEl` 에서 `classList.add('bv2-card')` 하위호환 제거.
  3. **CSS fire-mode 셀렉터 치환** (`css/41_battle_v2.css`) — `.battle-stage-grid .bv2-card` → `.card-v4-compact` (2곳).
  4. **index.html bcf-* 자식 마크업 제거** — `#battle-char-focus .bcf-main-card` 의 bcf-card-img/bcf-hp/bcf-stat-col/bcf-atk/bcf-def/bcf-spd/bcf-name/bcf-desc/bcf-nrg (6자식) 삭제. `CardV4Component` 가 런타임에 전담.
  5. **CSS bcf-* 자식 규칙 삭제** — `.bcf-card-img/.bcf-hp/.bcf-stat-col/.bcf-atk/.bcf-def/.bcf-spd/.bcf-name/.bcf-desc/.bcf-nrg` 전체 블록 제거. `.bcf-main-card`/`.bcf-backdrop`/`.bcf-skill-row`/`.bcf-skill-card`/`.bsc-*` 는 유지.
- 이유: Step 5C V4 이식으로 발생한 dead code (무해하나 유지보수 혼란) 일괄 청소. V4 전환 직후에 정리해야 다른 개발자/future self 가 "이 블록 뭐지?" 헷갈리지 않음.
- 영향: 회귀 9/9 PASS. Playwright 전투 진입 검증 — v4compact=10 / bv2-card class=0 / bv2c-frame=0 / bcf-main-card 자식 1개(V4 인스턴스만). 시각 동일, 기능 동일.
- 관계: Step 5C (d2c1d8f) 직후 청소. `.bv2c-hp-delta-floating`, CSS 변수 `--bv2-card-w/h/gap/focus-scale/action-scale/hover-scale` 는 유지 (공간 토큰·floating 레이어).
- 변경:
  1. **Church NPC z-index** (`css/42_screens.css`) — `#church-npc { position:relative; z-index:20 }`. V4 카드(church-grid)가 document order 상 뒤에 있어 stacking 위로 떠서 npc 대화 바 상단을 가리던 이슈 해결. 부상자 카드 많을 때 첫 행이 npc 영역 침범하면 가렸던 상황.
  2. **Codex 5-col grid 복구** (`css/42_screens.css`) — `#codex-tab` 에 `padding:0` + `scrollbar-gutter:stable`. 40장 로드 시 세로 스크롤바가 16px 잡아먹어 유효 폭 1208 → 5×235+4×10=1215 초과로 4-col 로 떨어지던 이슈. padding 제거 + gutter 예약으로 1224 여유 확보.
- 이유: 핸드오프 4/21 11:15 이월 P1 2건 정리. 실제 플레이 시각 품질 개선.
- 영향: 회귀 9/9 PASS. Tavern 은 영향 없음 (8장이라 스크롤 안 남). Castle/Church 양식 동일하지만 church-grid 만 npc 바 있어서 church-grid 는 건드리지 않고 npc 바만 z-index 승격.
- 관계: handoff-2026-04-21-1115.md "P1 Church z-index 정리 / Codex 5-col 조사" 클리어.

## 2026-04-21 오후 ▶ 콘텐츠 ▶ Step 5C Battle V4 이식 실행 (A1~A4 전부)
- 변경: 대표님 결정 반영 (옵션 A / A3 포함 / 9px 너판단 / parch.desc 완전숨김).
  1. **A1 CSS Compact Variant** — `css/32_card_v4.css` 에 `.card-v4-compact` modifier (172×248, aspect:auto, parch.desc 숨김, 스탯 9px). `css/41_battle_v2.css` 에 상태 블록 (`.card-v4-compact` × is-selected/is-target-valid/is-target-hover/is-hit/is-dead/is-dying-melt|crush/is-acted/is-queued/is-dimmed).
  2. **A2 Stage 렌더 교체** — `js/60_turnbattle_v2.js` `buildCardEl` → `CardV4Component.create()` + `.card-v4-compact` + 인스턴스 맵 `Battle._stageInstances[id]`. `refreshStageCard` setter 기반(setHP/setNRG/setStatus/setShield). `stageCardOf` 인스턴스 우선 조회. HP 프리뷰(clearHpPreview/renderTargetPreview) 도 setter 이식.
  3. **A3 Focus 카드 V4** — `renderCharFocus` 에서 `#bcf-main-card` innerHTML 비우고 `CardV4Component.create()` appendChild, `Battle._focusInstance` 저장. CSS `.bcf-main-card` 투명화(background/border/box-shadow 제거) 후 V4 가 전담. focus 카드는 compact 아닌 표준 V4 (310×446, 3줄 desc 유지, 스탯 14px).
  4. **A4 검증** — 회귀 9/9 PASS. Playwright 전투 진입 10장 V4 compact 렌더 확인(bv2c-frame 0), Focus 카드 310×446 정확. 9px 가독성 OK (상향 불필요).
- 이유: V4 확장 9화면 중 마지막 전투 완결. 세계관 톤 통일.
- 영향: `.bv2-card` / `.bv2c-*` 자식 셀렉터 CSS 규칙은 legacy 로 잔존 (dom 에서 참조 없음, 무해). index.html 의 `bcf-main-card` 자식 마크업도 잔존(런타임 `innerHTML=''` 로 제거). 차후 정리 기회.
- 관계: step5c_battle_v4_plan.md 실행. V4 확장 9/9 완결.

## 2026-04-21 11:15 ▶ 세션 ▶ 핸드오프 저장
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-21-1115.md` 에 저장 + 푸시 완료 (`3952096..8334bbc`).
- 이유: 수동 저장 (대표님 지시 "푸시하고 핸드오프하자"). 오늘 4커밋 Step 5 V4 확장 마무리 정리.
- 영향: 다음 세션 `/clear → Ctrl+V` 로 맥락 복구.

## 2026-04-21 (8차-D) ▶ 콘텐츠 ▶ Step 5D pick-screen V4 이식 + .card 셀렉터 버그 수정
- 변경:
  1. **Preview 경로** (`js/99_bootstrap.js:211`) `mkCardEl → mkCardElV4`.
  2. **실전 로직** (`js/59_game_battle_round.js:163`) 라운드 끝 "동료 추가" 3지선다. `mkCardEl → mkCardElV4`. V4 overflow:hidden 이라 중복 합성 badge (`🔀 합성 가능!`) 를 카드 밖에 두기 위해 `.pick-card-wrap` 으로 감쌈 (flex column).
  3. **기존 버그 부수적 수정** — `grid.querySelectorAll('.card')` → `.card-v4` (2곳). V2 시대에도 `.card-v2` 를 써야 했는데 `.card` 로 조회되어 dim 처리가 작동 안 했을 가능성. V4 전환 김에 셀렉터 정상화.
  4. **CSS** — `#pick-grid { --card-v4-w:260px }` + `.pick-card-wrap{display:flex;flex-direction:column;align-items:center}` 추가.
- 이유: Step 5 의 마지막 경량 작업. Tavern 초반 영입부터 라운드 중간 뽑기까지 V4 통일 마감. scan doc 의 "Step 5C Round Reward" 는 실제로는 pick-screen (Battle 별도 화면) 이었음.
- 영향: 3 V4 카드 / 0 V2, 버튼 정상 작동. 회귀 9/9 PASS. 스크린샷 `shots/pick_v4_step5d.png`.
- 이전 결정 관계: (8차-C) 연속. Step 5 A/B/D 완결. Step 5C (실제 Battle bv2-card 별도 규격) 만 남음 — 반나절 규모이므로 별도 기획.

## 2026-04-21 (8차-C) ▶ 콘텐츠 ▶ Step 5B Castle + Church + Matching V4 이식
- 변경:
  1. **Castle Upgrade** (`js/54_game_castle.js:40`) — 단련 대상 카드 grid, `mkCardEl → mkCardElV4`. 기존 wrapper 패턴 유지.
  2. **Church** (`js/54_game_castle.js:95`) — 부상자 치유/장례 grid, `mkCardEl → mkCardElV4`. grayscale/brightness 필터 유지.
  3. **Matching Phase 1** (`js/55_game_battle.js:76`) — "검색 중" 내 영웅 카드 V4.
  4. **Matching Phase 2** (`js/55_game_battle.js:104, 114`) — "도전자 발견" 상대/내 카드 양쪽 V4, 카운트다운+자동출전 그대로.
  5. **Match placeholder** — `width:280px;height:420→490px` (V4 4:7 비율 맞춤).
  6. **CSS 스코프** — `#castle-upgrade-grid { --card-v4-w:235px }`, `#church-grid { --card-v4-w:235px }`, `#match-screen { --card-v4-w:280px }` 추가.
- 이유: 매칭 → 출전편성 → 배틀 플로우에서 Tavern/Deckview/Formation/Cardselect 와 톤 통일. 유닛 단련/치유 화면도 V4 로.
- 영향: Castle 4장 / Church 1장 (데모) / Matching 양측 280×490 검증. 회귀 9/9 PASS. 스크린샷 `shots/castle_v4_step5b.png`, `church_v4_step5b.png`, `match_v4_step5b_phase1.png`.
- 이전 결정 관계: (8차-B) 연속. 5B 완결 (Castle+Church+Matching). 남은 Step 5C (Battle bv2-card) 는 별도 규격, 5D (Onboarding) 는 경량.

## 2026-04-21 (8차-B) ▶ 콘텐츠 ▶ Step 5A-2 cardselect-screen V4 이식
- 변경: `js/55_game_battle.js:192` `renderCardSelect()` 의 `mkCardEl(c)` → `mkCardElV4(c)`. V4 는 overflow:hidden 이라 "지휘권 소비/자동 출전/부상" badge 를 카드 밖에 두기 위해 `.cs-card-wrap` 으로 감쌈 (flex column). `css/42_screens.css` `#cs-grid` 스코프에 `--card-v4-w:160px` + `.cs-card-wrap{display:flex;flex-direction:column;align-items:center}` 추가.
- 이유: step5a_scan 의 Step 5A-2 는 2부분으로 나뉘어 있었음 — (A) formation-screen (앞 커밋), (B) cardselect-screen (이 커밋). 출전 편성 플로우 양쪽 V4 톤 통일.
- 영향: 8 V4 카드 + 8 wrapper, 카드 폭 160×280. hero .selected / injured .opacity/.filter / 선택시 .selected 토글 전부 V4 에 그대로 동작. 회귀 9/9 PASS. 스크린샷 `shots/cardselect_v4_step5a2.png`.
- 이전 결정 관계: 2026-04-21 (8차) 바로 뒤 연속.

## 2026-04-21 (8차) ▶ 콘텐츠 ▶ Step 5A-2 Formation V4 이식 + 자동 배치 버그 수정
- 변경:
  1. **자동 배치 리렌더 버그 fix** — `js/99_bootstrap.js:192` preview 네비게이터가 `UI.show('formation-screen')` 만 호출하고 `Formation.show()` 를 안 불러 `_cards` 가 비어 있던 문제. `RoF.Formation.show()` 로 교체 (fallback 유지).
  2. **Formation V4 이식** — `js/70_formation.js` render() 에 `RoF.CardV4Component.create(c,{}).el` 적용. 슬롯 선택 시 `setSelected(true)` 로 V4 황금 오라 사용. 빈 슬롯은 `.form-slot-empty` (dashed + ➕ 글리프).
  3. **레이아웃 토큰 조정** — `--form-diamond-h: 180→335`, `--form-bench-label-y: 380→535`, `--form-bench-y: 420→565`, `--form-bench-h: 200→70` (V4 카드 높이 333 수용).
  4. **CSS 스코프** — `css/42_screens.css` `#form-diamond` 에 `--card-v4-w: 190px` + flex + gap 8 + center 주입. `css/41_formation.css` `.form-slot` 는 wrapper, `.form-slot-empty` 는 독립 스타일.
  5. **index.html** — `#form-diamond` 인라인 `flex-wrap:wrap` + `padding:15px 10px` 제거 (기존 레거시 레이아웃 잔재).
- 이유: ui-inspector 2026-04-20 보고의 "F1_formation_auto 에서 + 더미 유지" 버그 + Tavern/Deckview V4 톤 통일 확장.
- 영향: 진입 → `_cards=Game.deck` 주입 → render 시 V4 카드 5장, 공명 배지, bench 3장. Playwright 검증 완료 (`shots/formation_v4_step5a2_1600.png`, `shots/formation_v4_step5a2_selected.png`). 회귀 9/9 PASS.
- 이전 결정 관계: 2026-04-20 Step 4A/4B Tavern V4 → Step 5A-1 Deckview V4 → 이번 Step 5A-2 Formation V4. 다음: Step 5C Battle.

## 2026-04-20 21:44 ▶ 세션 ▶ 핸드오프 저장
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-20-2144.md` 에 저장 + `current-focus.md` 4·5·6차 반영 갱신.
- 이유: 수동 저장 (대표님 지시, 세션 마무리).
- 영향: 다음 세션 `/clear → Ctrl+V` 로 맥락 즉시 복구.

## 2026-04-21 00:46 ▶ 세션 ▶ 핸드오프 저장 (일일 11커밋 마감)
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-21-0046.md` 에 저장. 클립보드 복사 완료.
- 이유: 대표님 마무리 지시 "여기까지". 오늘 누적 11커밋 (Tavern 4B / A안 정본화 / P0 / B1·B2 / Step 5A-1 등) 완료.
- 영향: 다음 세션 `/clear → Ctrl+V` 로 맥락 즉시 복구. Step 5A-2 Formation 또는 Step 5C Battle 부터 이어감.

## 2026-04-21 ▶ 디자인 ▶ Step 5A-1 — Deckview V4 확장 (Deck + Codex 탭)

- **변경**:
  - `js/53_game_deck.js:54` — Codex 그리드 `mkCardEl(u)` → `mkCardElV4(u)` (혈통 40장)
  - `js/53_game_deck.js:121` — Deck 그리드 `mkCardEl(c)` → `mkCardElV4(c)` (보유 덱)
  - `css/42_screens.css` — `#deck-tab / #codex-tab` 에 `--card-v4-w: 235px` + `#dv-grid / #codex-grid` grid 5-col override (`!important` — 인라인 `display:flex` 무효화).

- **이유**: Step 5A-1 — rof-ui-inspector 권장 순서대로 Tavern → Deckview 흐름이 V4 프레임으로 통일됨. "영입 → 내 덱 확인" 체감 격차 제거.

- **영향**:
  - Deck 탭: 보유 유닛 V4 프레임 (235×411).
  - Codex 탭: 전체 40 일반 유닛 V4 렌더 (회색 필터 유지 — 미획득 표시).
  - 회귀 9/9 PASS. V2 호출부 남아있음: castle/battle/round/bootstrap 등 (Step 5B/C/D 에서).

- **검증**:
  - Playwright: `#dv-grid .card-v4` 7장, `#codex-grid .card-v4` 40장, V2 잔존 0.
  - `shots/deckview_v4_step5a1.png` — Deck 탭 첫 화면
  - `shots/deckview_v4_codex_step5a1.png` — Codex 탭

- **남은 과제**:
  - Step 5A-2 Formation (`js/55_game_battle.js:192`) — 자동 배치 리렌더 버그(ui-inspector 보고) 먼저 점검.
  - Codex 전체(40장) 에서 grid-template-columns 가 4-col 로 계산되는 이유 조사 (현재 5-col 목표 대비 1 적음). 스크롤 있으니 UX 영향 작음.

## 2026-04-21 ▶ 리팩터 ▶ B2 mkCardElV4 → CardV4Component setter API 이식

- **변경**:
  - `js/40_cards.js` — `RoF.CardV4Component` 신규 (CardComponent V2 미러).
    create() 이 인스턴스 반환: `{el, unit, _refs, _state, _opts, setHP, setNRG, setShield, setStatModifier, setStatus, setSelected, destroy, _snapshot}`.
    rebuild() 헬퍼도 추가 (레벨업 재생성).
    기존 `mkCardElV4(c)` 는 래퍼로 유지 (el 만 반환) → 호환성 0 손실.
  - `css/32_card_v4.css` — setter 시각 요소 추가:
    - `.v4-status` + `.v4-status-badge` (상단 중앙, burn/poison/frozen/invincible)
    - `.shield-badge` (좌상단 오버레이)
    - `.stat .mod` (+N/-N buff/debuff 배지)
    - `.card-v4.selected` + `@keyframes v4-selected-pulse` (V2 와 동일 golden 오라)
  - **ribbon 라벨**: "DIVINE" → "신" (판타지 한국어 규칙 준수, code-review I6).

- **이유**:
  - code-review BLOCKER B2 해결 — 전투(Battle) 로 V4 확장 시 `setHP/setNRG/setStatus` API 필수.
  - Step 5B/5C 이식 전제. 지금 없으면 전투 루프가 안 돔.
  - STATUS_GLYPHS 을 이모지(🔥☠️❄️🛡️)로 단순화 — V2 의 SVG 대신 가벼운 방식.

- **영향**:
  - 기존 Tavern 호출부 (`mkCardElV4(c)`) **변경 0** — 래퍼가 el 만 반환.
  - 새 코드는 `RoF.CardV4Component.create(c, {})` 호출하면 setter 활용 가능.
  - 렌더 결과 동일 (Playwright Tavern 235×411 4장 유지).
  - 회귀 9/9 PASS.

- **검증**:
  - `shots/v4_b2_setter_demo.png` — 테스트 카드 직접 생성 + 모든 setter 호출 + 시각 확인.
    HP 25/100, NRG 12/20, Shield 7, ATK+3, DEF-2, 🔥3 ☠️2, selected 금광 모두 정상.

- **남은 과제**:
  - Step 5B/5C 에서 실 Battle 호출부가 이 API 사용 시작 시 실전 검증.
  - rebuild() 는 아직 호출부 없음. 레벨업 이식 시점에 활성화.

## 2026-04-21 ▶ 리팩터 ▶ B1 매직 넘버 토큰화 + 유물 imgKey + Step 5A 스캔

- **변경**:
  - **B1 토큰화**: `css/10_tokens.css` 섹션 14-7 추가 — `--card-v4-w: 260px` (기본값). `css/32_card_v4.css` `.card-v4` width 하드코딩 `260px` → `var(--card-v4-w, 260px)`. `css/42_screens.css` `#tav-grid` 에 `--card-v4-w: 235px` override 주입 (세 곳 중복 → 한 곳으로 통일). `grid-template-columns: repeat(auto-fill, var(--card-v4-w))`.
  - **B (유물 imgKey)**: `js/13_data_relics.js` 12 유물 전부 `imgKey` 필드 추가 (rl_banner ~ rl_immortal). 이미지 공급 대기.
  - **C (Step 5A 스캔)**: `design/step5a_scan_2026-04-21.md` 신규 — V4 확장 대상 12 mkCardEl 호출 전수 정리 + 5A/5B/5C/5D 단계 분리 + 공수 추정.

- **이유**:
  - code-review (`code_review_step4_2026-04-20.md`) BLOCKER B1 해결 — Step 5 (다른 화면 V4 확장) 전 매직 넘버 일원화 필수.
  - 유물 imgKey 는 art_queue_skills_relics 의 rl_* 이미지 공급 시 즉시 연결 준비.
  - Step 5A 스캔으로 작업 전 사전 파악.

- **영향**:
  - 렌더 결과 완전 동일 (Playwright 측정 235×411 유지).
  - 회귀 9/9 PASS.
  - 이후 Collection/Formation 확장 시 `#화면-scope { --card-v4-w: 값; }` 한 줄로 해결.

- **남은 과제**:
  - B3 (`!important` 4개) 는 현 setup 에서 유지 필요 (inline style 제거 부작용 큼). Step 5 진행 중 재평가.
  - I1 (CRIT/EVA 하드코딩) 는 Step 5 호출부 다양화 시 빌더 옵션화 권장.

## 2026-04-21 ▶ 밸런스 ▶ P0 5건 등급 하향 조정

- **변경**:
  - `dragon`: divine → legendary (atk 10 hp 35 = legendary attack 범위 내)
  - `archangel`: divine → legendary (atk 6 hp 40 def 5 = legendary 수준)
  - `lich`: legendary → gold (atk 8 hp 20 def 1 = gold attack 범위 완벽)
  - `archmage`: gold → silver (atk 6 hp 12 = silver attack 매칭)
  - `sniper`: gold → silver + atk 7→6 (hp 8 gold 미달, atk 소폭 하향)
- **이유**: 새 rules/04-balance.md 범위 기준 스탯 대비 등급 초과. 스탯 상향(밸런스 파급 큼) 대신 등급 하향(레이블 변경, 드롭률만 바뀜) 선택.
- **영향**:
  - 드롭률 변동: 5장이 더 흔한 등급으로 이동 → 플레이어 입수 난이도 ↓
  - 명칭/시각 효과 변화: 신 등급 금박·샤인 효과 해제 (dragon/archangel)
  - P0 7건 중 5건 해결. 남은 2건 (genie_noble gold support atk 5, sea_priest legendary support atk 8) 은 새 규칙 범위 내로 판정되어 변경 없음.
- **검증**: 회귀 9/9 PASS, units=58/skills=37/relics=12 유지.
- **이전 결정 관계**: 2026-04-20 night balance-auditor 감사 결과 반영.

## 2026-04-21 ▶ 콘텐츠 ▶ 스킬·유물 이미지 작업 큐 작성
- **변경**: `docs/art_queue_skills_relics_2026-04-21.md` 신규 — 37 스킬(패시브 29 + 액티브 8) + 12 유물 전체에 대한 비주얼 컨셉·배경·프롬프트 힌트 정리. P0(액티브 스펠 8) / P1(전설 패시브+유물 10) / P2(골드 12) / P3(실버·브론즈 18) 우선순위.
- **이유**: 대표님 이미지 작업 큐 요청. 유닛 추천(art_queue_2026-04-20.md) 과 동일 형식.
- **영향**: 대표님 작업 후 img/sk_*.png / img/rl_*.png 로 공급 → 12_data_skills.js 의 imgKey 활용 또는 13_data_relics.js 에 imgKey 필드 추가.

## 2026-04-21 ▶ 밸런스 ▶ A안 — design/balance.md 폐기 + rules/04-balance.md 정본화

- **변경**:
  - `.claude/rules/04-balance.md` 전면 재작성 — 실데이터 기반 역할별(attack/defense/support) 세분화 + 원소 보너스 + 전투 공식 + 스킬 등급 수치 + 레벨링 + 드롭률 + 진화 계수 + 경험치 곡선 + 불문율 + 검증 체크리스트 전부 흡수.
  - `design/balance.md` → `trash/design_balance_deprecated_2026-04-21.md` 이동.
  - 참조 업데이트 10+ 건: `CLAUDE.md`, `.claude/rules/00-index.md`, `.claude/agents/balance-auditor.md`, `.claude/agents/content-generator.md`, `.claude/commands/밸런스검증.md`, `.claude/skills/{스킬추가, 유물추가, 캐릭터추가, 밸런스검증, 기획변경}/SKILL.md`, `tracks/02-data-balance/START.md`, `tracks/05-docs-lore/START.md`, `tracks/06-backend/START.md`, `tracks/README.md`.
  - `game/tools/audit_stats.js` 신규 — 실데이터 기반 범위 추출 재사용 가능.

- **이유**: `rules/04-balance.md` (HP 8-12) vs `design/balance.md` (HP 40-55) 가 4~5배 스케일 차이. 실제 js 데이터는 rules 와 일치. design/balance.md 는 하네스 초기(2026-04-12) 설계로 추정되며 죽은 구버전. balance-auditor / content-generator / 각 스킬이 이 문서 참조 → 감사 결과 무의미. 2026-04-20 night 자율 감사(`autonomous_work_summary`, `balance_docs_sync`, `balance_audit_2026-04-20-night`) 3건에서 교차 확인.

- **영향**:
  - Source of Truth 단일화: 앞으로 모든 밸런스 참조는 `.claude/rules/04-balance.md` 하나.
  - js 데이터 수정 0 (문서가 실측에 맞춘 것).
  - 회귀 9/9 PASS (확인 후 보고).
  - 핸드오프 22개·자율 리포트 6개에 포함된 `design/balance.md` 언급은 과거 기록이라 수정하지 않음 (append-only 원칙).

- **이전 결정 관계**: **번복**. 2026-04-12 초기 설계의 "design/balance.md 상세 테이블·수식 Source of Truth" 결정을 완전 번복. 해당 내용은 rules/04-balance.md 로 이관.

- **다음 작업**:
  - P0 7건 튜닝 (dragon/archangel/lich/archmage/sniper/genie_noble/sea_priest) 대표님 결정 필요 (각 유닛마다 "스탯 상향 vs 등급 하향").
  - balance-auditor 에이전트 재호출해서 새 규칙 잘 읽는지 1회 검증 권장.

## 2026-04-20 23:04 ▶ 세션 ▶ 핸드오프 저장 (7차 마무리)
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-20-2304.md` 에 저장. 클립보드 복사 완료.
- 이유: 7차 세션 마감 (C 선택). 로컬 2커밋(`fe04820`, `681e102`) 미push 상태.
- 영향: 다음 세션 `/clear → Ctrl+V` 로 Tavern V4 적용 후속 UI 조정 3건부터 이어감.

## 2026-04-20 (Step 4B) ▶ 디자인 ▶ Tavern V4 5-col grid 전환 + 카드 폭 235
- 변경:
  - `css/42_screens.css` `#tav-grid` override 블록에 `display:grid !important; grid-template-columns:repeat(auto-fill, 235px); gap:10px; justify-content:center;` 추가.
  - `body.game-mode #tav-grid .card-v4 { width:235px !important }` + `.tavern-card-wrap { width:235px }`.
  - 이전 inline style 의 `display:flex;flex-wrap:wrap` 이 5번째 카드 wrap 원인이었음. grid override 로 해결.
- 이유: 설계값 260×455 복원은 stage 1240 에서 5-col 불가능(5×260+gap=1300+ > 1240). 235×411 (90% 축소) 로 5장 한 줄 보장.
- 영향:
  - Tavern Unit/Hero 탭 모두 5-col grid.
  - 5 슬롯 동시 표시 시 wrap 없음 (실측 rows=1, 5×235 + 4×10 = 1215 < 1240 usable).
  - Hero 탭(3장) 은 `auto-fill` 로 중앙 정렬.
  - 이전 세션 "보병 양피지 배경 충돌" 은 실제 렌더 확인 결과 다른 캐릭터와 톤 유사, 당분간 놔둠.
- 검증: 회귀 9/9 PASS, Playwright shots `shots/tavern_v4_step4b_5col.png`.
- 남은 과제: 다른 화면(Collection/Formation/Battle) V4 확장은 Step 5 로 분리. Tavern 내부 카드·버튼 간격 미세 조정은 사용자 피드백 받아 후속.

## 2026-04-20 (art queue) ▶ 콘텐츠 ▶ 이미지 작업 추천 큐 정리
- 변경: `docs/art_queue_2026-04-20.md` 신규 — 58 유닛 매트릭스 + P0/P1/P2 9장 추천 (해적 수병/수도사 견습/해신 팔라딘/석공 전사/번개 채널러/해파 기사/어둠 주술사/화염 수호자/산악 파괴자).
- 이유: 대표님 이미지 작업 큐 요청. divine 제외 4등급 × 원소 × 역할 매트릭스에서 공백 셀 우선순위화.
- 영향: 대표님 이미지 공급 후 `/캐릭터추가` 스킬로 데이터 편입 예정. legendary water/defense = 핵심 시그니처 후보.

## 2026-04-20 (7차) ▶ 디자인 ▶ Claude Design System 도입 Step 1-3 (토큰 + 폰트 + V4 카드 시안)
- 변경:
  - Claude Design zip(93파일/21MB) → `c:/work/design-system/` 압축 해제 + git init + GitHub private 레포 `chahongpil/realm-of-fates-design-system` push (커밋 `63d6557`).
  - `game/css/10_tokens.css` **섹션 14 추가** — DS `handoff/DESIGN_TOKENS.md` 반영: parchment-0..3 / ink-0..2 / rubric / lapis / malachite / gilt / r-guardian·melee·ranged·caster-m·caster-r. 사용처 0 무해.
  - `game/index.html:6` 폰트 로드 확장 — Cinzel 500/900 + Cinzel Decorative 700/900 + Noto Sans KR 400-900 + Noto Serif KR 400-900.
  - `game/mockup/v4_card/v1~v3.html` — Tavern 6장(등급5 + divine 2원소) V4 프레임 시안 3안:
    - v1: 순수 DS 톤(가죽 `#1a0f08` + 양피지 `#f1e4c3`)
    - v2: 현 게임 배경(`#080810`) + V4 양피지 원본(톤 충돌 체감용)
    - v3: 현 게임 배경 + 양피지 톤다운(`#d4bf88`) 타협안
  - `game/shots/v4_mockup/v1~v3.png` (gitignore, 로컬 검수용).
- 이유: 전면 V4 카드 프레임 전환의 출발점. 대표님이 시안 3안 중 선택 → Step 4 (실제 화면 적용) 진행.
- 영향: 회귀 9/9 PASS. 기존 UI 변경 없음. V4 전환·톤 시프트·역할 5종 분화는 후속 작업.

## 2026-04-20 (6차) ▶ 콘텐츠 ▶ 신규 6장 추가 (divine 6원소 완성 + legendary 갭 메움 + UI 아이콘 사양서)
- 변경: ① **신규 유닛 6장 추가** (52 → **58 유닛**):
  - `genie_noble` (고귀한 지니) — gold / lightning / support / ranged. atk:5 hp:22 def:2 spd:4. 액티브 80% arcane_burst "번개 소원" + 30% group_heal 트리거.
  - `earth_guardian` (대지의 수호자) — legendary / earth / defense / melee. atk:8 hp:42 def:10 spd:2. 패시브 armor -5 + 30% thorns(6) 반사.
  - `sea_priest` (심해의 대신관) — legendary / water / support / ranged. atk:8 hp:42 def:3 spd:5. 액티브 90% mass_heal +8 + 30% bless 보호막 트리거.
  - `genie_legendary` (전설의 지니) — legendary / lightning / attack / melee. atk:10 hp:38 def:4 spd:5. 패시브 first_strike + 30% double_arrow 쌍발.
  - `behemoth` (땅의 신 베히모스) — divine / earth / attack / melee. atk:15 hp:65 def:7 spd:2. 액티브 80% breath 전체8 + 30% cleave 진동파.
  - `leviathan` (바다의 신 레비아탄) — divine / water / attack / ranged. atk:15 hp:58 def:3 spd:4. 액티브 80% breath 전체7 + 30% arcane_burst 해일 추가딜.
  ② **UI 아이콘 원본 공개** — 다운로드 폴더에서 받은 이미지 5개 + 사양서를 `source_art/ui/` 에 정리. elements.png(6원소 2×3 합본), role/{defense, melee, ranged_support_giant_3in1, divine_defense_melee_2in1}, effects/effects_3x5.png(상태 배지 14종). `source_art/ui/README.md` 에 각 셀의 영어 라벨과 게임 effect 마커 매핑 + 표시 규칙(거인상 보류, divine defense 만 특별 방패) 문서화. ③ **effect 마커 정리** — 신규 6장 전부 기존 마커 재사용(group_heal/double_arrow/thorns/bless/cleave/arcane_burst) — 파서 드리프트 0. ④ **balance-auditor 반영** — 신규 6장 검증 후 P1 3건 + P2 2건 수정: genie_noble atk 4→5, earth_guardian atk 7→8, sea_priest atk 5→8·spd 3→5, behemoth atk 14→15, leviathan atk 13→15·spd 3→4. genie_legendary 는 전 항목 통과.
- 이유: ① divine 6원소 완성 — 기존 4원소(fire/lightning/holy/dark) 에 water(leviathan) + earth(behemoth) 추가로 6원소 대장 카드 전부 확보. ② legendary 3장(lich/griffin_knight/griffin_rider)이 전부 attack 이라 defense/support 슬롯이 비어있던 문제를 earth_guardian(defense) + sea_priest(support) 로 해소. ③ 지니 2등급 체인 — noble(지원 팔짱) → legendary(전사 검방패) 컨셉으로 단일 캐릭터의 2등급 표현. 이것이 앞으로 원본 파일명 규칙(`genie_noble.png` / `genie_legendary.png`) 의 첫 사례. ④ Claude Design 협업 전환(5차) 결정에 맞춰 UI 아이콘 시스템도 "원본 공급 → CSS로 내가 직접 안 만듦 → 개별 crop/배치는 Claude Design" 파이프라인으로 통일. `feedback_no_css_design.md` 메모리 저장.
- 영향: ① 58 유닛 풀. divine 6원소 전부 확보로 원소 편성 메타 가능. legendary 6장 풀(+defense/+support) 로 역할 다양성 회복. ② `game/img/` 에 behemoth/earth_guardian/genie_legendary/genie_noble/leviathan/sea_priest 6장 이미 배치(5차 재임포트 때 같이 import됨, 데이터만 지금 연결). ③ 회귀 9/9 PASS(2회). ④ 다음 작업 대기: 암흑의저격수 rarity 확정 및 데이터 추가, Claude Design 이 crop + 카드 UI 적용한 결과물 수신.
- 이전 결정: 2026-04-20 5차 "프레임 일체화 폐기 + Claude Design 협업" 의 후속. 2026-04-20 4차 balance-auditor 가 제시한 신규 legendary 3장 스탯 범위 가이드(earth defense / water support / lightning ranged) 를 이번 세션에서 구현.

## 2026-04-20 (5차) ▶ 콘텐츠·시스템 ▶ 프레임 일체화 폐기 + 순수 캐릭터 일러스트 전환 (Claude Design 프레임 협업)
- 변경: ① **이미지 파이프라인 전환** — "프레임+유닛 일체화" PNG 방식 폐기, **순수 캐릭터 일러스트만** 받는 방식으로 전환. Claude Design(2026-04-17 출시) 과 협업 확정 — 대표님이 순수 캐릭터 일러스트 제공하면 Claude Design 이 시스템 프레임(등급 테두리/배너/슬롯 박스)을 CSS/코드 레벨로 씌움, 시스템은 그 위에 공격/체력 같은 숫자 데이터만 오버레이. ② **31장 재임포트** — `이미지제작_원본/일반유닛_원본/` 루트에서 대표님이 새로 제공한 순수 캐릭터 일러스트 31장 이식. `tools/import_unified_frames.py` 의 SRC 를 루트 폴더로 변경하고 MAP 을 새 파일명 체계(번호 prefix, 공백 위치 변동)로 전면 재작성. ③ **titan.png APNG 갱신** — 기존 프레임 일체화 8프레임 → 순수 일러스트 8프레임(`titan2/1~8.jpg` 400×600 90ms loop=0, 1.86MB → 3.58MB). ④ **griffin_rider.png APNG 신규** — 전설의 그리핀용사를 애니메이션 카드로 전환(`그리핀용사 프레임/프레임1~8.png` 8프레임 90ms, 4.22MB). ⑤ **build_titans_apng.py 범용화** — 타이탄 전용 → `JOBS` 배열 구조로 타이탄/그리핀용사 둘 다 처리. ⑥ **보류 폴더 trash/ 이동** — `프레임 일체화_보류/` 폴더 전체를 `trash/img_unified_frames_hold_2026-04-20/` 로 이동(구 일체화 PNG 보존). ⑦ **26번 유닛(그리핀 탄 빨강망토기사) 삭제** — 대표님이 원본 폴더에서 이미 삭제, 코드상 존재하지 않던 유닛이라 추가 정리 불필요.
- 이유: 2026-04-20 1차에 "대표님 통합 PNG 가 프레임/슬롯박스/이름배너까지 다 포함하므로 이중 프레임 해체" 로 결정했으나, Claude Design 과 협업 경로가 확정되면서 방향 재조정 — 대표님은 **캐릭터 일러스트에만 집중**, 프레임/배너/UI 는 Claude Design 이 시스템으로 통일. 이 방식이 ⓐ 이미지 생성 비용 감소 (프레임 매번 합성 불필요), ⓑ 등급/원소 변경 시 프레임만 CSS 갈아끼우면 됨, ⓒ 시각 일관성(같은 등급 카드가 완전 동일한 프레임) 측면에서 우월. griffin_rider 는 "전설의 그리핀용사" 라는 대표 legendary 유닛이므로 titan 과 동일하게 APNG 애니 카드로 격상(정적 카드보다 시각 임팩트 큼).
- 영향: ① `game/img/` 의 31장이 순수 캐릭터 일러스트로 교체 → 현재 `.cv-frame display:none` + `.cv-illust contain` 설정에서는 프레임 없이 캐릭터만 풀카드 표시 (슬롯 박스 없는 상태). Claude Design 시스템 프레임이 씌워지기 전까지 일시적으로 "숫자 오버레이가 일러스트 위에 직접 뜨는" 상태. ② 런타임 성능: titan.png 1.86MB → 3.58MB, griffin_rider 는 정적 519KB → 애니 4.22MB. divine·legendary 대표 카드 2장 추가 데이터 ~6MB 증가. 전투 중 두 카드 중앙 무대(275×400) 확대 시 시각 임팩트 크게 향상. ③ 좌표 시스템(`css/11_frame_coords.json`, `tools/coord_editor.html`, `tools/json_to_frame_css.js`) 은 **숫자 슬롯 좌표 편집기로 유지** — Claude Design 프레임 스펙 수신 후 재조정 예정. divine.elements 원소별 분기는 현재 상태 유지(나중에 단순화 여부 결정). ④ 회귀 9/9 PASS. ⑤ 다음 작업 대기: 신규 7장 데이터 추가(지니 2장·대지의수호자·심해의대신관·땅의신베히모스·바다의신레비아탄·암흑의저격수), 영어 파일명 rename + 공개 레포 push(대표님 제안).
- 이전 결정: 2026-04-20 1차 "시스템 카드 프레임 PNG/CSS 전면 해체" → 4차(이번) 에서 "프레임 일체화" 자체를 폐기하고 Claude Design 시스템 프레임으로 이행. 2026-04-17 "Claude Design 협업 탐색" 의 공식화.

---

## 2026-04-20 (4차) ▶ 밸런스 ▶ archfiend 튜닝 + 52유닛 감사 (P0 5건 보고)
- 변경: ① **archfiend 수치 조정** — luck 8→6, bonusTrigger.chance 0.3→0.25. titan 대비 +60% luck + life_steal 시너지 과잉(balance-auditor P1) 해소. 나머지 스탯(atk:16, hp:55, def:4, spd:3)은 titan 동급 유지. ② **전체 52유닛 감사 보고서** — balance-auditor 에이전트가 `rules/04-balance.md` + `design/balance.md` 대비 검증. P0(범위 이탈) 5건 발견: dragon(divine hp:35 미달) / archangel(divine hp:40 미달) / lich(legendary hp:20 크게 미달) / archmage(gold hp:12 미달) / sniper(gold hp:8 극단 유리대포). 수정은 대표님 결정 대기. ③ 영웅 카드 18장 원소 보너스 일관성 전체 통과. 회귀 9/9 PASS.
- 이유: 4/20 3차 직후 밸런스 검증 + 회귀. archfiend 초안(titan 기반)이 dark 보너스 luck+3 을 base luck 5 위에 더해 8이 됐는데, titan luck 5 가 이미 lightning 보너스 포함 결과라 일관성 불일치. 동일 논리로 archfiend base luck 3 + dark +3 = 6이 형평. life_steal 30% + critRate 8% 콤보는 지속성 과도 → 25%/6 으로 완화.
- 영향: archfiend 전투 강도 약 -10% (luck 2↓ + proc 5%p↓). titan 과 실질 전투력 근접. P0 5건 수정 대기 — dragon/archangel 은 4/20 2차 divine 승격 후 스탯 미상향이 원인 가능성(기획 결정 필요), lich/archmage/sniper 는 "유리대포 의도" 여부 확인 필요. luck 시스템 전반 공백(divine 최대 critRate 8%)도 설계 재검토 대상.
- 이전 결정: 2026-04-20 2차 "divine 원소별 좌표 확장 + archfiend 신규(초안 titan 기반)" 의 튜닝 마무리.

## 2026-04-20 19:01 ▶ 세션 ▶ 핸드오프 저장
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-20-1901.md` (246줄) 에 저장 + 클립보드 복사.
- 이유: 수동 저장 (대표님 지시, 세션 마무리).
- 영향: 다음 세션에서 `/clear → Ctrl+V` 로 맥락 즉시 복구 가능.

## 2026-04-20 (3차) ▶ 게임 메커닉 ▶ 좌측 4번째 슬롯 `luck` 추가 (크리티컬 연동) + card_slot_editor 롤백
- 변경: ① **LUCK 슬롯 추가** — 합성 PNG 의 좌측 4색 슬롯(빨·파·초·노) 중 노란색 4번째 칸에 `luck` 값 매핑. `.cv-luck` DOM + CSS(`#ffe066` 황금톤), `css/11_frame_coords.json` 9 블록(5 등급 + divine 4 원소) 각각 `slots.luck` 시드 추가 (spd 좌표 + y 7% 기준 자동 시드, 대표님 편집기에서 드래그 튜닝). CSS 18 변수(`--gem-luck-x/y`) 자동 생성. `40_cards.js` 의 `create()` 에 `refs.luck = mkSlot('cv-luck', unit.luck||0)` 추가. 편집기(`coord_editor.html`)의 `SLOTS` 배열·범례·마커 색상·readout 모두 6 슬롯으로 확장(`--luck:#ffcc22`). 서버 `handleSave` 의 `SLOT_NAMES` + `test_run.js` card-coords 측정 배열 동기화. 동적 슬롯 카운트로 메시지 `1 rarities × 6 slots` 자동 출력. ② **card_slot_editor 롤백** — 단계 A(`b295bc2`, js/17 로더) + 단계 B(`fadd27d`, 편집기+엔드포인트) revert 후 `data/card_slot_overrides.json` 도 삭제. 롤백 사유: 같은 등급 프레임은 슬롯 위치 공통(대표님 지적) → 카드별 override 과잉 설계.
- 이유: 대표님 결정. ① "4번째 슬롯에 무엇을 매핑?" → `luck` (크리티컬과 연동되는 기존 스탯) 선택. 기존 유닛 데이터에 `luck` 이 이미 있어 마이그레이션 0. ② card_slot_editor 과잉 설계 → 삭제로 코드 복잡도 감소. no-op 보존보단 명확히 제거가 유지보수 측면 유리.
- 영향: ① 카드 UI 정보 밀도 증가 — 좌측 4슬롯 합성 PNG 디자인과 1:1 매칭. luck 값이 카드 위에 숫자로 보임(예: knight luck 3). 4 색 빈 슬롯이 시각적으로 완성. ② 서버 엔드포인트 `/save|load-card-slot-overrides` 제거, `js/17_data_card_slots.js` 삭제, `tools/card_slot_editor.html` 삭제, `index.html` 스크립트 태그 제거, `js/40_cards.js` 의 `RoF.CardSlots.applyTo` 훅 제거. 전체 코드 121줄 감소 + 761줄 감소(편집기).
- 이전 결정: 2026-04-20 2차 "divine 원소별 좌표 확장" 의 후속. card_slot_editor 는 2차에서 보조 도구로 보존 권고했으나 3차에서 롤백 확정.

## 2026-04-20 (2차) ▶ 콘텐츠·시스템 ▶ divine 원소별 좌표 확장 + 대악마(archfiend) 신규 + 편집기 8슬롯
- 변경: ① divine 등급 실제 구성(fire=dragon, lightning=titan, holy=archangel, dark=archfiend)을 데이터에 반영 — dragon·archangel 의 rarity legendary→divine 승격, archfiend 신규 카드 추가(divine/dark/attack, race:demon, icon:😈, 초안 스탯은 titan 기반 + dark 보너스 반영, 대표님 밸런스 튜닝 예정). 52 유닛. ② 합성 PNG `img/archfiend.png` 임포트(이미지제작_원본/.../암흑의신대악마.png → 400×600 LANCZOS). `tools/import_unified_frames.py` MAP 갱신 + `js/14_data_images.js` 매핑. ③ 프레임 좌표 스키마 확장 — `css/11_frame_coords.json` 의 `divine` 하위에 `elements.{fire,lightning,holy,dark}` 중첩 추가(default slots/boxes 는 fallback 유지). `tools/json_to_frame_css.js` 에 원소별 CSS 블록 생성 로직 추가 → `[data-element="..."]` 셀렉터로 CSS 출력, 40_cards.js 의 `data-element` 속성과 자동 매칭(런타임 JS 수정 불필요). ④ 편집기 재구성 — `tools/coord_editor.html` 을 8슬롯(4등급 + divine 4원소)로 확장: `RARITIES`/`SAMPLE_BG` 를 `SLOT_NODES` 배열로 통합, `coordData[rarity]` 접근을 `node.data()` 람다로 추상화. 배경 샘플: bronze=apprentice/silver=knight/gold=phoenix/legendary=griffin_knight(archangel 이 divine 으로 이동하여 교체), divine_fire=dragon/divine_lightning=titan/divine_holy=archangel/divine_dark=archfiend. ⑤ 서버 `/save-coords` 검증 확장 — `data.divine.elements` 각 원소 slots 검증(슬롯 이름·숫자·범위). ⑥ 기존 미커밋 8건(4/20 1차)을 먼저 3커밋으로 분리(에셋 일괄/프레임 해체/스키마+핸드오프) + 단계 A(카드별 override 로더)·단계 B(card_slot_editor 편집기) 2커밋 + Step C 2커밋 → 총 8커밋 origin/master push 완료(`f30cf69..0d9b701`).
- 이유: 대표님 지적 "같은 등급 프레임을 쓰는 유닛은 슬롯 위치가 다 똑같고, 카드별이 아니라 등급별로만 맞추면 된다" → 카드별 override(단계 A/B)는 과잉 설계로 판명. 다만 divine 은 원소별 프레임이 달라 단일 등급 좌표로 불충분 → 등급별 1세트 + divine 만 원소별 4세트 하이브리드가 정답. `이미지제작_원본/.../암흑의신대악마.png` 가 이미 합성되어 있었는데 데이터가 아직 등록 안 된 상태였고, dragon/archangel 은 4/19 이전부터 "신 드래곤"·"신 대천사" 로 네이밍됐지만 rarity 는 legendary 로 잘못 들어가 있었음.
- 영향: ① divine 카드 4장 확정(fire/lightning/holy/dark — water/earth 는 차후). ② legendary 가 lich/griffin_knight/griffin_rider 3장(전부 attack 롤)만 남아 defense/support 공백 → 대표님 새 legendary 제작 예정. ③ 편집기 좌표 편집이 이제 **그리드 1장(기존 coord_editor) 으로 완결** — card_slot_editor(단계 A/B 보조 도구)는 빈 override = no-op 상태로 남아 역할 없음(향후 롤백 검토). ④ Claude Design(2026-04-17 출시) 활용 논의 — 공개 레포 `github.com/chahongpil/realm-of-fates` push 완료로 design-system 학습 가능, handoff bundle 로 Claude Code 연계하는 폐쇄 루프 준비됨. ⑤ 4번째 좌측 슬롯(노란색) 기획 미결 — rage/luck 중 선택 대기.
- 이전 결정: 2026-04-20 1차 "시스템 프레임 시대 종료" → 2차에서 divine 원소별 구조 완성. 2026-04-15 "divine 다이아 테두리 스펙" 의 CSS 정식화.

## 2026-04-20 ▶ 콘텐츠 ▶ 일러스트 일괄 교체 (대표님 프레임 일체화 32장 + 타이탄 8프레임 APNG + 신규 6캐)
- 변경: 대표님이 합성한 "프레임+유닛 일체화" 한글 PNG 41장 → game/img/ 에 이식. ① 기존 ID 매칭 25장(견습마법사~화염의신드래곤+빙결술사_남자→cryomancer+거인리치→lich) → 400×600 LANCZOS 비율유지 캔버스. ② 신규 6캐: archer(궁병, bronze lightning ranged) / cryomancer_f(빙결술사_여, silver water support) / griffin(silver lightning beast) / griffin_knight(legendary fire human, "심홍의 그리핀 기사") / griffin_rider(legendary holy human, "전설의 그리핀 용사") / armored_griffin(gold earth beast). 11_data_units.js 6항목 추가 + 14_data_images.js 매핑 추가. ③ 타이탄 8장(타이탄1~8.png) → APNG 8프레임 90ms loop=0 합성 → titan.png 1.86MB 갱신. 도구: tools/import_unified_frames.py + tools/build_titans_apng.py.
- 이유: 대표님이 25장 + 신규 7장 + 타이탄 시퀀스를 프레임 일체화 상태로 일괄 제공. 메인은 합성 안 하고 받은 PNG 그대로 ID 변환·리사이즈·배포만(2026-04-19 결정 재확인). divine 등급 5원소 확장의 첫 단계로 신규 그리핀 시리즈가 legendary 풀 보강.
- 영향: 유닛 51종(기존 45 + 신규 6). 회귀 9/9 PASS(2회). 한 폴더(`game/이미지제작_원본/일반유닛_원본/프레임 일체화/`) 일괄 임포트 → ID·리사이즈·배포 자동화 도구 정착(`tools/import_unified_frames.py` 재사용 가능).
- 이전 결정: 2026-04-19 "프레임 합성은 대표님이 직접, 메인은 받은 PNG 적용만" 결정의 첫 대규모 적용.

## 2026-04-20 ▶ 게임 메커닉 ▶ 시스템 카드 프레임 PNG/CSS 전면 해체 (대표님 통합 PNG 풀카드 표시)
- 변경: 시스템이 카드 위에 씌우던 외곽 프레임 PNG 18장(`card_frame.png` + `frame_*.png` 17장) 전부 폐기 → `trash/img_frames_2026-04-20/` 보존. CSS 정리: ① `css/30_components.css` `.card-inner::before` (card_frame.png 오버레이) 제거 + `.card-icon img` `object-fit:cover → contain`, ② `css/31_card_system.css` `.cv-illust` `left:20% top:12% width:60% height:60% cover → inset:0 + background-size:contain` (풀카드, 잘림 0), `.cv-frame` `display:none` (등급별 frame_*_tank.png 매핑 일괄 폐기). 대표님 통합 PNG 가 프레임/슬롯박스/이름배너까지 다 포함하므로 **이중 프레임 해체**. 시스템은 일러스트 풀카드 표시 + 숫자/이름 오버레이만 담당. 검정 배경 fallback 으로 종횡비 차이 흡수.
- 이유: 4/19 대표님 프레임 일체화 PNG 25장 + 신규 6캐 적용 후 시각 검증에서 "시스템 프레임 안에 일러스트 프레임이 또 들어간 이중 프레임" 확인. 대표님 결정: "프레임 자체를 날려버려, 앞으로는 프레임+유닛 결합된 카드를 그대로 짤리지 않게 쓰면 된다". 메인은 합성/외곽 프레임 책임에서 손 떼고 풀카드 표시 + 숫자 오버레이만.
- 영향: card-v2 컴포넌트의 시각 책임이 단순화(외곽/등급 표현 100% 일러스트 위임). 다음 단계로 카드별 슬롯 좌표 매핑(현재 등급별 1세트 → 카드별 override) + 슬롯 편집기 필요 — 대표님 통합 PNG 의 슬롯 위치가 카드마다 다르기 때문(예: knight=상단 작은 배너 / archangel=중앙 큰 배너 / NRG 보석 위치 카드별 상이). `data/card_slot_overrides.json` 스키마 작성까지 진행, 런타임 로더/렌더러 적용 + 편집기 UI 는 다음 세션. 회귀 9/9 PASS, 시각 검증 완료(`shots/2026-04-20-cards-after-frame-removal.png`).
- 이전 결정: 2026-04-12 "card-v2 다크 석재 고딕 아치 프레임 도입" → 2026-04-18 "PHASE 3 방패 프레임" → 2026-04-19 "암흑 divine 프레임 추가" 의 종결. 이제 시스템 프레임 시대 종료, 대표님 통합 PNG 시대 시작.

## 2026-04-19 23:43 ▶ 세션 ▶ 핸드오프 저장
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-19-2343.md` 에 저장 + 클립보드 복사.
- 이유: 수동 저장 (세션 마무리, 대표님 휴식).
- 영향: 다음 세션은 이 문서 붙여넣기로 즉시 컨텍스트 복구.

## 2026-04-19 ▶ 팀/협업 ▶ S2 고스트 PvP 마무리 결정 (봇 시드·패배 정책·UX)
- 변경: S2 고스트 PvP 99% 구현 완료 상태에서 남은 4건 결정 정리. ① 봇 시드 — `supabase/migrations/003_s2_bot_seed.sql` 5명(유랑검사/잿빛 마법사/강철의 약속/독사의 미소/용맹의 깃발, LP 10/25/50/75/120) + `deck_snapshots.user_id` NULL 허용. ② 패배 정책 — 현행 유지(승리 시만 스냅샷, "최고의 순간 박제" 컨셉). ③ 콜로세움 UX — C안 추천(훈련 화면에 "🏟️ 아레나 도전" 버튼 명시 진입, 별도 작업으로 분리). ④ E2E 체크리스트 8개 정리. 결정 정본은 `design/s2-finalization.md`.
- 이유: 코드는 4/16~4/19 사이에 구현 완료됐으나 시그널 미반영(트랙6 시그널이 4/15 1줄만)으로 진행 상황이 가려졌음. 후속 운영 결정(봇 / 매칭 정화 / UX 진입점) 이 미정인 상태에서 출시하면 첫 유저가 매칭 0%, 약덱 박제, 훈련/PvP 혼동 등 즉각 블로커. 결정 문서로 매듭짓고 시드 SQL 까지 미리 준비.
- 영향: 대표님이 Supabase Studio 에서 003 SQL 실행 → E2E 8개 체크 → 출시 준비 완료. 트랙6 시그널 보충 7건 append 로 가시성 회복. 메인 세션이 트랙 영역(supabase/, 35_backend.js) 건드릴 때 시그널 append 의무 재확인.
- 이전 결정: 2026-04-15 "트랙 6 신설 (경로 C 풀 PvP MMO, 가챠 없음)" — S2 단계 진입.

## 2026-04-19 ▶ UI ▶ 타이틀 배경 + 게이트 1클릭 + 토큰화 위생 + 검수관 검증 룰
- 변경: ① **타이틀 배경**: 대천사 일러스트(1672×941 → 1280×720 LANCZOS) 로 교체, 단일 `rgba(0,0,0,.3)` 오버레이 → 그라디언트(`.05 → .15 → .4`) 로 신성 톤 살리고 하단 가독성 유지. 기존 PNG 는 `img/_archive/bg_title_pre_2026-04-19.png` 로 백업. ② **게이트 1클릭**: `js/51_game_town.js:223-237` `gate` ID 분기 추가. 나무문~천공문 한 번 클릭 시 즉시 `startBattle` (편성) 진입. 다른 건물(성/대장간/선술집 등) 은 두 번 클릭 패턴 유지(첫 클릭 = 증축 버튼 노출 의도). ③ **토큰화 위생**: `.fr-badge` `#888 → var(--text-3)`, `#eee → var(--text-1)` (4곳, 41_formation.css). `.rew-pick-card` raw `rgba(...)` → `color-mix(in srgb, var(--token) X%, transparent)` (3곳, 42_screens.css). ④ **검수관 검증 룰**: 검수관 P0 2건이 4/15 옛날 스크린샷 기반 false positive 로 판명(HP 위치 / 보상 4지선다 깨짐). 4/19 최신 스크린샷에서 모두 정상.
- 이유: ① 기존 갈색 배경이 게임 톤(다크 판타지 + 신성)과 부합도 낮았고 신성 일러스트가 P2 컨셉에 맞음. ② 대표님 지적 — 나무문이 게임 진입의 핵심인데 두 번 클릭 패턴이라 마찰. 다른 건물은 증축 결정 단계가 있어 두 번 클릭이 안전. ③ 검수관 P1 토큰 외 raw 색 지적 — `--rar-*`, `--curr-gold`, `--text-*` 토큰 팔레트 외 직접 hex/rgba 가 누적되면 등급 색 일괄 교체가 어려움. ④ 검수관이 본 스크린샷이 코드 변경 후 갱신 안 된 상태였음. 정적 검사 도구가 시각 상태를 표상한다는 가정이 깨질 수 있음 → 타임스탬프 검증 룰 추가.
- 영향: 회귀테스트 9/9 통과(2회). 시그널 append 5건(main/docs-lore/online-backend/assets). `current-focus.md` 4/16 → 4/19 갱신. 검수관 호출 시 향후 "검수관이 본 스크린샷의 mtime ≥ 마지막 관련 코드 변경 시점" 확인 권장 — `08-garbage-lessons.md` 후속 추가 검토.
- 이전 결정: 2026-04-13 "타이틀 버튼 나무 배경 사고" — 투명 PNG + 100% 100% 스트레치 트랩 교훈. 2026-04-15 "PHASE 3 사망 애니" — 검수관·플레이 디렉터 교차검증 도입.

## 2026-04-19 ▶ 구조 ▶ Type A 래퍼 CSS 전면 통일 (tavern/deckview/castle)
- 변경: 3개 Type A 래퍼의 CSS 를 `position:absolute; inset:0; width:100%; height:100%; padding:0; margin:0; pointer-events:none;` + `> *{pointer-events:auto}` 로 통일. 자식 토큰 8건(`tav-tab-unit/hero`, `tav-info`, `dv-tab-deck/codex`, `castle-tab-upgrade/quest`) 의 좌표를 부모 top/left 포함한 스테이지 절대좌표로 재설정 — 예: `tav-tab-unit-y: 600 → 660`, `tav-tab-unit-x: 463 → 483`. 편집기 `screen_editor_zones.html` defaults 동기화. church 는 제목 텍스트가 flow 렌더라 Type B (부분 absolute) 유지. 실측 위치 불변 (offsetTop 검증 완료: tav-tab-unit y=660, tab-deck y=122, castle-tab-upgrade y=111).
- 이유: 2026-04-19 선술집 탭 잠금 사고의 근본 해결. 당시 부모 래퍼 `top:60` + 자식 `top:659` → 실측 y=719 (뷰포트 720 탈출, 탭 비가시)를 증상 대응(`659→600`)으로 막았지만, 편집기 defaults(스테이지 기준)와 런타임 토큰(상대 기준)이 엇갈리는 구조적 원인이 남아있었음. 다음에 대표님이 편집기에서 좌표 드래그할 때 같은 사고 재발을 막는 예방 리팩터.
- 영향: 편집기에서 본 좌표와 런타임 좌표가 1:1 대응. `/래퍼분해` 스킬의 Type A 골든 패턴 규정화(`pointer-events:none` 래퍼 + `auto` 자식). `rules/08-garbage-lessons.md` 에 후속 조치 + 골든 패턴 추가. 회귀테스트 9/9 통과.
- 이전 결정: 2026-04-19 "Type A 래퍼 좌표 중첩 사고" 교훈 증류 후 예고된 "별도 과제".

## 2026-04-19 ▶ 게임 메커닉 ▶ skillIds 명시 액티브 필드 도입
- 변경: `11_data_units.js` 에 선택 필드 `skillIds?: string[]` 추가. 명시 시 `ACTIVE_BY_ELEM_ROLE` 원소+역할 자동매칭을 대체하며 `12_data_skills.js` 의 passive=false 스킬을 ownerId 스탬프해 유닛에 붙인다. 기본 공격/원소 시그니처 2장은 항상 자동 생성. `buildUnitSkillSet` 분기 구조: `unit.skillIds` 배열 존재 시 → DB 해결, 미지정 시 → 기존 자동매칭 fallback. `Battle.getSkillsOf` 는 STATE.skills filter 만 담당(1순위 중복 분기 제거 — 단일 해석 지점). `legacyCardToV2Unit` 에 skillIds 패스스루. 샘플 유닛 2종(`h_m_fire`/`knight`) 에 `skillIds` 명시 — 둘 다 현행 fallback 결과와 동일 스킬이라 **밸런스 변동 0**.
- 이유: 액티브 스킬 할당이 원소+역할+등급 규칙에 갇혀 있어 콘텐츠 작가가 "이 유닛에만 이 스킬" 을 표현할 수 없었음. divine 급이나 특이 유닛(예: titan 의 뇌격)이 자동매칭에 의존하면 시그니처 스킬과 겹치거나 공백이 되는 문제가 예상됨. skillIds 필드는 content-as-data 의 기본 — 마이그레이션 안전장치(fallback 유지)를 깔고 점진적 전환 가능.
- 영향: 향후 신규 유닛/리워드에서 특수 액티브 지정이 한 줄로 가능(`skillIds:['sk_foo','sk_bar']`). test_run.js 에 파이프라인 회귀 추가(h_m_fire pinned / knight pinned / h_m_water fallback). `units_export.txt` 에도 필드 안내 필요(후속). 빈 배열 `[]` = "액티브 없음 의도" 로 명확히 구분.
- 이전 결정: 2026-04-19 "액티브 스킬 8장 + 원소+역할 자동매칭" — 도입 당시 "추후 skillIds 필드 생기면 fallback" 으로 주석에 예고돼 있었던 계획된 다음 단계.

## 2026-04-19 ▶ UI ▶ 편성 화면 원소 공명 미리보기 배지
- 변경: 편성 화면(`#formation-screen`) 서브 텍스트 아래에 `#form-resonance` 배지 영역 추가. 현재 슬롯 원소 카운트를 `Battle.computeResonance` 로 실시간 계산 → 2체+ 원소마다 `🔥 ×2 +10%` 형태의 pill 배지. 티어별 시각 차등: `fr-t2`(기본) / `fr-t3`(1.05배 확대) / `fr-t4`(1.10배 + 1.6s 펄스 글로우). 공명 없을 땐 `::before` 로 "동일 원소 2명 이상 편성 시 공명 효과 발동" 안내. 다중 원소 공명 시 카운트 내림차순 정렬. 호버 title 에 피격 저항(3체+ = -10%, 4체+ = -20%) 까지 노출.
- 이유: 원소 공명은 전투 중에만 배지로 인지되었고(`#battle-hit-react .bhr-reso`) 편성 단계에서는 "이 조합이 공명이 터지는가?" 를 전혀 보여주지 못해 편성 의사결정 레이어가 비어있었음. 공명을 전투의 핵심 결정축으로 설계한 PHASE3_ELEMENT_PLAN 의도상 편성 단계에서 미리 보여주는 게 정본.
- 영향: 플레이어가 덱 5장을 배치·교체할 때마다 공명 배지가 즉시 업데이트. 공격 +N% / 저항 -N% 수치가 투명하게 보여 편성 실험의 체감 비용이 사라짐. 전투 엔진의 `Battle.computeResonance` 재사용이라 단일 source of truth. 편집기 zones 에도 `form-reso` 추가되어 대표님이 위치 튜닝 가능.
- 이전 결정: 2026-04-19 "원소 공명 (편성형) 전투 엔진 반영" 및 같은 날 "원소 공명 발동 배지 (데미지 팝업)" 의 편성 단계 확장 — 계획된 다음 단계.

## 2026-04-19 16:02 ▶ 세션 ▶ 핸드오프 저장
- **변경**: 이번 세션 상태를 `docs/handoff/handoff-2026-04-19-1602.md` 에 저장 + 클립보드 복사.
- **이유**: 수동 저장 (세션 마무리).
- **영향**: `docs/handoff/`.
- **이전 핸드오프**: `handoff-2026-04-19-session-mid.md` (오후 중반).

---

## 2026-04-19 ▶ 게임 메커닉 ▶ armor/thorns 파서 파라미터화 + infantry 하위 차별
- **변경**: `55_game_battle.js` 의 armor 감쇄 하드코딩 `-3`, thorns 데미지 하드코딩 `4` 를 각각 `ct.skillArmor ?? 3`, `dbt.value ?? 4` 로 파라미터화.
- **데이터 적용**: infantry 에 `skillArmor:2`, `bonusTrigger.value:3` 신규 필드 추가. desc 도 `-2 / 3데미지` 로 조정. 기존 영웅(h_m_earth/h_r_earth) 은 필드 없으므로 기본값(3/4) 폴백 — 기존 밸런스 보존.
- **결과**: 영웅 armor -3 / thorns 4 vs 일반 보병 armor -2 / thorns 3. 일반이 영웅 하위판으로 정상 차등.
- **이유**: balance-auditor 가 지적한 "armor+thorns 조합이 영웅·일반 중복 설계" 해소 + desc/파서 수치 불일치 해결.
- **파일**: `js/55_game_battle.js`, `js/11_data_units.js`.

---

## 2026-04-19 ▶ UI ▶ 원소 공명 발동 배지 (데미지 팝업)
- **변경**: 피격 시 데미지 숫자 아래에 `공명 +N% · 저항 -N%` 배지 900ms 플로팅. `calc.resoMult > 1` 또는 `calc.resoResist < 1` 일 때만 노출.
- **이유**: 공명 로직이 있어도 체감 경로가 없으면 편성 전략 유도 불가 (검수관 지적).
- **구현**: `index.html` `#battle-hit-react` 에 `.bhr-reso` slot 추가. `css/41_battle_v2.css` 에 `bv2ResoFadeUp` 키프레임. `js/60_turnbattle_v2.js` `renderHitReact` 에서 배수 라벨 조립.
- **파일**: `index.html`, `css/41_battle_v2.css`, `js/60_turnbattle_v2.js`.

---

## 2026-04-19 ▶ 콘텐츠 ▶ 일반 유닛 bronze 추가 — 보병 (infantry)
- **추가**: `infantry` / 보병 / earth / defense / melee / human / 🪖 아이콘. 스탯 `atk2 hp12 def2 spd1`, skill `armor(피해-3)`, bonusTrigger `thorns 20%(반사4)`.
- **포지션**: earth 공명 편성의 첫 일반 defense 탱커. 기존 earth bronze 는 `militia/wolf(attack)` + `herbalist(support)` 만 있어 defense 슬롯 공백이었음.
- **일러스트**: 대표님 `이미지제작_원본/일반유닛_원본/일반_보병_투명.png` 제공 → `img/infantry.png` (400×600, 432KB 리사이즈).
- **검증 결과**: balance-auditor 1차 블로커(desc vs 파서 수치 불일치) → desc 를 파서 고정값(armor -3, thorns 4) 에 맞춰 수정 후 통과.
- **잔존 이슈**: `armor`/`thorns` 파서가 55_game_battle.js 에 하드코딩. 유닛별 수치 차등화 불가. 추후 `dbt.value` 파라미터화로 영웅(강)/일반(약) 구분 가능. 현재는 h_m_earth 와 스킬 구성 중복이지만 역할(영웅 vs 소모품)로 차별.
- **파일**: `js/11_data_units.js`, `js/14_data_images.js`, `img/infantry.png`.

---

## 2026-04-19 ▶ 게임 메커닉 ▶ 원소 공명 (편성형) 전투 엔진 반영
- **변경**: PHASE3_ELEMENT_PLAN.md 의 편성형 공명 수치를 데미지 계산기에 합성. 전투 시작 시 `Battle.STATE.allyReso`/`enemyReso` 에 원소별 카운트를 stamp.
- **배수**: 같은 원소 2체 ×1.10 / 3체 ×1.20 / 4체+ ×1.35 (공격 측 `caster.element` 기준).
- **저항**: 피격자 편이 동일 원소 3체+면 받는 데미지 ×0.90 / 4체+면 ×0.80 (저항 해석은 "같은 원소 공격에 대한 감쇄"로 단순화).
- **합성 순서**: `base × elementMult × critMult × resonanceBonus × resonanceResist`. 기존 값 보존, 공명이 독립 곱셈으로 추가.
- **미구현**: 4체 특수 효과(화염폭풍/빙하의축복/번개의각성 등)는 후속 반복에서 진행. 편성 단계 UI 배지(공명 등급 표시)도 미구현.
- **파일**: `js/60_turnbattle_v2.js`.
- **이전 결정**: 2026-04-18 "액티브 스킬 확장 → 원소 공명 로직 추가" 핸드오프 메모에서 "편성형 vs 연쇄형" 중 PHASE3 기획서 정본인 **편성형만** 채택.

---

## 2026-04-19 ▶ UI ▶ 선술집 탭 상호 배타 비활성화 (편집기 지시반영)
- **변경**: 선술집 `용병 모병` / `영웅 모집` 탭 중 **현재 선택된 탭은 짙은 회색으로 잠금**(disabled + `.tav-tab-current`). 반대 탭은 금색(클릭 가능).
- **이유**: 대표님 편집기 지시 박스 — "같은 탭을 다시 누를 필요가 없으므로 시각적으로 잠그면 명확".
- **영향**: 진입 시 기본이 "용병 모병" 이므로 그 탭이 회색 잠금, 영웅 모집 클릭 시 반전. 기능 동일.
- **보조 수정**: `--tav-tab-unit-y` / `--tav-tab-hero-y` 토큰을 `659px → 600px` 로 내림. 부모 `.tav-tabs` 래퍼가 `position:absolute; top:60px` 이어서 자식 `659` 가 실측 `719` 로 뷰포트 720 밖에 탈출하던 레거시 이슈 동시 해결(검수관 블로커 지적).
- **관련 파일**: `js/52_game_tavern.js`, `css/42_screens.css`, `css/10_tokens.css`.
- **잔존 이슈**: Type A 래퍼(부모 absolute → 자식 absolute) 는 스테이지 좌표가 부모 오프셋과 중첩되는 구조적 문제 존재. prologue/deckview/castle 등 동일 패턴 래퍼에도 유사 y-drift 가능성. 다음 세션에 일괄 점검 필요.

---

## 2026-04-19 14:10 ▶ 세션 ▶ 핸드오프 저장 (세션 2 중간)

**변경**: 세션 상태를 `docs/handoff/handoff-2026-04-19-session-mid.md` 에 저장.
**이유**: 수동 저장. P0 3건 + P1 3건 + 가비지 2차 청소 + 구조 단일화까지 9 커밋 완주 후 대표님 이미지·스탯 편집 시간 확보용 체크포인트.
**영향**: `docs/handoff/`

---

## 2026-04-19 ▶ 팀/협업 ▶ 트랙 규칙 비대칭 전환

**변경**:
- **메인 세션**: 전 영역 편집 가능. 건드린 트랙 영역은 `tracks/_signals/<track>.md` 에 append 필수 (의무)
- **트랙 전용 세션**: 자기 `START.md` 의 "수정 허용" 범위만 — "집중 모드"로 표현 변경 (기존 "절대 금지" 문구 완화)
- **점유 선언**: 트랙이 1시간 이상 작업 시 `🔒 점유 시작 — …` 를 신호에 먼저 쓰고, 메인은 점유 중 영역 건드리기 전 확인
- 각 트랙 `START.md` 4종에 점유 선언 예시 블록 추가

**이유**:
메인이 이미 `design/`, `PHASE*.md`, `.claude/rules/` 같은 트랙 영역을 자주 편집하는데 기존 규칙상 "트랙 전용"이라 신호에 안 남음 → 트랙 전용 세션 레이더에서 실종됨. 대칭 규칙은 현실과 맞지 않아 시그널 무결성이 무너짐. 비대칭으로 전환하여 "메인 전권 + append 의무" 로 현실화.

**영향**:
- `CLAUDE.md` — 병렬 트랙 섹션 재작성
- `tracks/01-assets/START.md`, `tracks/02-data-balance/START.md`, `tracks/05-docs-lore/START.md`, `tracks/06-backend/START.md` — "절대 금지" → "집중 모드 범위 밖" 표현 + 점유 선언 섹션
- 향후 메인 세션은 트랙 영역 편집 시 반드시 signals append

**이전 결정 관계**:
- 2026-04-14 (병렬 트랙 구조 세팅) 의 후속. 대칭 규칙의 현실 괴리를 비대칭으로 보정.

---

## 2026-04-19 ▶ 구조 ▶ 상위 `c:/work/design/` 폐기 — game/design 단일화

**변경**:
- `c:/work/design/` 전체를 `c:/work/trash/design_root_2026-04-19/` 로 이동 (삭제 아님, 안전망)
- `c:/work/game/design/` 를 유일한 정본으로 확정
- `c:/work/.claude/hooks/session_start.py` 의 `ROOT/design/current-focus.md` 경로를 `ROOT/game/design/current-focus.md` 로 수정
- 상위에만 있던 `frame-prompt-rules.md` 는 하위로 복사 후 이관
- 상위에만 있던 `game-harness-v1.0 (2)/` 아카이브는 trash 와 함께 이동

**이유**:
`c:/work/design/` 와 `c:/work/game/design/` 이 평행선으로 공존하며 파일 14개는 같고 1개(`changelog.md`)만 분기되는 일이 반복됨. 4/16 세션에 "design/ 통합" 을 한 번 했으나 수동 복사이라 다시 분기됨. `c:/work` 는 non-git 이고 `c:/work/game` 이 git 정본이므로, 하위로 단일화하고 훅 경로만 맞추는 게 근본 해결.

**영향**:
- `session_start.py` 1줄 변경 — 이후 세션 `current-focus.md` 를 정본에서 로드
- 상위 `design/` 참조하던 임시 문서/스크립트는 폴백 실패 시 trash 폴더에서 복구 가능
- git diff 에는 game repo 내부 영향 없음 (`c:/work/design/` 는 git 밖이었음)

**이전 결정 관계**:
- 2026-04-16 "design/ 통합 완료" 의 후속. 수동 복사 방식의 결함을 단일화로 해소.

---

## 2026-04-19 ▶ 세션 ▶ 핸드오프 저장 (심야)

**변경**: 세션 상태를 `docs/handoff/handoff-2026-04-19-session-end.md` 에 저장.
**이유**: 수동 저장. demo/dev 잔재 제거 + 분할 커밋 4건 + 패시브 스킬 전면 개편 완료 후 다음 세션에 "계속 진행" 으로 이어감.
**영향**: `docs/handoff/`

---

## 2026-04-19 ▶ 밸런스 ▶ 패시브 스킬 전면 개편

**변경**: 패시브 29장 → 28장 (맹독 제거). 전 패시브 `cost:0`. 수치 전반 축소(atk+3→+1, eva+6→+1 등). `role:'crit'` 카테고리 신설(sk_tough). 확률 발동 마커 4종 도입 — `proc_double_cast`/`proc_nullify_hit`/`hp_mult`/`grant_rebirth(params)` + 별도 필드(procChance, hpMult, rebirthHp 등). `invincible3` 하드코딩 → 정규식 `invincible(\d+)`. `sk_handoff` 의미 변경(아군 40% 추가공격권 → 3% 본인 2회 캐스팅).
**이유**: 대표님이 `c:/tmp/skills_relics_export.txt` 편집으로 직접 재디자인. 장착 가격 제거로 덱 빌딩 자유도 확보, 수치 축소로 단일 스킬 파워 스파이크 완화.
**영향**: `js/12_data_skills.js`(데이터), `js/20_helpers.js`(파싱), `js/55_game_battle.js`(dead handoff 블록 삭제), `tools/test_run.js`(sk_handoff golden 갱신). 신규 마커 실제 전투 발동 로직은 다음 스프린트.

---

## 2026-04-18 ▶ 게임 메커닉 ▶ demo/dev 잔재 전면 제거

**변경**: 본판 UI 의 "▶ PHASE 3 시네마틱 데모 (DEV)" 타이틀 버튼 + "수직 슬라이스 데모 시작" 전투 idle 버튼 삭제. `Battle.DEMO` → `Battle.STATE` 리네임. 번개 타이탄 5+5 하드코딩 + ally_1 스킬 5장 삭제. `findSkillById`/`getSkillsOf` SKILLS_DB 1순위 반전. `v2.demoStart` 핸들러 / `startDemo` / `playDemoRound` 함수 / `is-real-battle` 클래스 전부 삭제.
**이유**: 대표님 "본판에 데모(dev)가 있는데 이건 왜 그런거지?" 지적. 수직슬라이스 초기 하드코딩이 본판에 그대로 노출되어 있었음. 실전 경로를 `startFromLegacyBS(bs)` 단일로 정리.
**영향**: `index.html`, `css/41_battle_v2.css`, `js/60_turnbattle_v2.js`, `js/62_ghost_pvp.js`, `js/config_battle.js`, `tools/_*.js` 5개. 커밋 `3e1018b`.

---

## 2026-04-16 ▶ 세션 ▶ 핸드오프 저장 (오후)

**변경**: 세션 상태를 `docs/handoff/handoff-2026-04-16-session2.md` 에 저장.
**이유**: P1-3 Ready + P2-1 Lore Bible + S2 Ghost PvP + design/ 통합 완료. 커밋 4개.
**영향**: `docs/handoff/`

---

## 2026-04-16 ▶ 게임 메커닉 ▶ S2 고스트 PvP 비동기 대전

**변경**: deck_snapshots + pvp_matches DB, Backend API 4종, Arena 모듈, 매칭 UI.
**이유**: 트랙6 S2. LP ±100 범위 랜덤 매칭, 승리 시 덱 자동 스냅샷.
**영향**: `js/62_ghost_pvp.js`(신규), `js/35_backend.js`, `js/58_game_battle_end.js`, `supabase/migrations/002_s2_ghost_pvp.sql`

---

## 2026-04-16 ▶ 게임 메커닉 ▶ P1-3 큐잉 Ready 버튼 + 10초 타임아웃

**변경**: 큐잉 타이머 30초→10초 단축. "⚔️ 준비 완료" Ready 버튼 추가 — 누르면 즉시 실행 단계.
**이유**: 3장 덱으로 28초 순수 대기 문제 (플레이 디렉터 실측). 전투 템포 개선.
**영향**: `js/60_turnbattle_v2.js`, `index.html`, `css/41_battle_v2.css`

---

## 2026-04-16 ▶ 콘텐츠 ▶ P2-1 6원소 신 Lore Bible 1-pass

**변경**: `design/lore-bible.md` 신규 작성. 6원소 신 개별 서사 (성격/시험/파편/가호/저주/관계/대사 샘플) + 운명의 여신 + 관계 매트릭스 + 게임 내 활용 가이드.
**이유**: 평의회 지적 "세계관 공백 — 서사 레이어 없음". 카드 설명/NPC 대사/프롬프트 소스.
**영향**: `design/lore-bible.md` (신규), 향후 카드/스킬 텍스트에 적용

---

## 2026-04-16 ▶ 세션 ▶ 핸드오프 저장

**변경**: 세션 상태를 `game/docs/handoff/handoff-2026-04-16-session-end.md` 에 저장.
**이유**: S1 백엔드 구축 + 4지선다 보상 + 레시피 v2 완료. 커밋 4개, 검수관 2회.
**영향**: `game/docs/handoff/`

---

## 2026-04-16 ▶ 게임 메커닉 ▶ 4지선다 보상 시스템 (상자 제거)

**변경**: 기존 금/은/동 상자 보상 완전 제거 → 유닛/스킬/유물/골드 4개 중 택1.
**이유**: StS 스타일 전략적 보상 선택. 골드는 1~100 랜덤 도박 + 신의 은총 2배(유료 BM).
**영향**: `js/58_game_battle_end.js`, `css/42_screens.css`

---

## 2026-04-16 ▶ 수익 모델 ▶ 신의 은총 = 골드 도박 2배

**변경**: 신의 은총을 "광고 시청 → 골드 2배"에서 "골드 선택지 결과 2배"로 재정의. 무료=광고, 유료=광고 제거 BM.
**이유**: 가챠 폐지 이후 자연스러운 수익 포인트. 4지선다 골드 도박과 시너지.
**영향**: `js/58_game_battle_end.js`

---

## 2026-04-16 ▶ 기술 스택 ▶ S1 Supabase 백엔드 구축

**변경**: Supabase Auth + 클라우드 세이브 전체 파이프라인 구축. B안(기존 로컬 유지 + 선택적 이메일 연결).
**이유**: 트랙 6 로드맵 S1. 기기 간 동기화 + 향후 PvP 기반.
**영향**: `js/35_backend.js`(신규), `supabase/migrations/001_s1_init.sql`(신규), `index.html`, `js/50_game_core.js`, `js/32_auth.js`, `js/99_bindings.js`, `js/99_bootstrap.js`, `css/30_components.css`

---

## 2026-04-16 ▶ 콘텐츠 ▶ 프롬프트 레시피 v2 (얇은 금속 필리그리)

**변경**: 카드 프레임 스타일 "다크 석재 고딕 아치" 폐기 → "얇은 금속 필리그리 60~80px" 전환. 5등급 전부 프레임 프롬프트 완비.
**이유**: 대표님 "동굴 모양 싫어" 지적. 가볍고 우아한 방향.
**영향**: `game/PROMPT_RECIPES.md`

---

## 2026-04-15 ▶ 세션 ▶ 핸드오프 저장 (대형 세션 종료)

**변경**: 세션 상태를 `game/docs/handoff/handoff-2026-04-15-session-end.md` 에 저장. 클립보드 복사 완료.
**이유**: 컨텍스트 부담 + 대표님 휴식. 이번 세션은 평의회 회의·P0 3건·카드 등급 개편·"일곱 번째 자리" 스토리·트랙 6 신설·카드 레이아웃 v2 까지 5 결정이 누적.
**영향**: `game/docs/handoff/` (신규 문서 1건)

---

## 2026-04-15 ▶ 콘텐츠 ▶ 카드 레이아웃 v2 (14 영역 고정 좌표) + LUCK 앞면 표시 + 역할별 외곽 실루엣

**변경**: 카드 프레임을 **역할별 3종(tank/dps/support) × 등급별 5종 + 신 6원소** = **총 30 장**으로 확장하고, 앞면 UI 영역을 **14개 고정 픽셀 좌표**로 못 박음. 신규 스탯 **LUCK(행운/치명)** 를 앞면에 추가 (좌측 4번 슬롯).

**핵심 결정**:
- **캔버스**: 1024×1536 (2:3, 유지). 중앙 투명창 870×1010 (154-1024 x, 160-1170 y)
- **좌측 스탯 4 슬롯**: ATK / DEF / SPD / **LUCK** (각 100×190, y 180~970)
- **상단 바**: Lv 배지(40-140 x) / 원소 아이콘(160-260 x) / 이름(280-780) / HP(820-984)
- **장비 아이콘 3개**: 설명 바로 위, 가운데 정렬 (x 357-667, y 1180-1270, 각 90×90)
- **설명 영역**: 904×170 (60-964 x, 1280-1450 y)
- **NRG 배지**: 우하단 마름모 (820-984 x, 1460-1520 y)
- **역할별 실루엣**: 탱커=방패형(하단 V) / DPS=표준+고딕아치 / 지원=타원·둥근. **내부 14 영역 좌표는 전 30장 동일**
- **파일명**: `frame_{tier}_{role}.png` (일반), `frame_divine_{element}_{role}.png` (신)

**카드 앞면 스탯 (6종)**: HP / ATK / DEF / SPD / **LUCK** / NRG
**팝업 전용**: rage / eva / meva / hpReg / honor / curShield(0일 때) / status effects

**이유**:
- 평의회 회의(2026-04-15) 에서 **"카드 등급 개편이 픽셀에 안 보임 — 회색 덩어리"** 지적 (검수관) + **"역할별 시각 차별화 필요"** (게임 디자이너). 한 번에 해결.
- LUCK 추가: 치명타율은 전투 핵심이라 앞면에 필수 (밸런스 테스터 권고).
- 14 영역 고정: 프레임 30장 각자 텍스트 위치가 다르면 CSS 조건 분기 폭발 → 앞면 UI 한 번에 작성 불가. **단일 좌표 = 단일 CSS**.
- 역할 실루엣은 외곽만 변형: 데이터 연결 필드는 `range`(melee/ranged/support) 그대로 유지, 표시만 3역할 통합 (DPS = melee+ranged).

**영향**:
- [`design/card-layout.md`](card-layout.md) (신규) — Source of Truth, 14 영역 좌표표 + 역할 실루엣 + 파일명 규칙 + 카드 상태별 스케일
- `game/PROMPT_RECIPES.md` (예정) — 프롬프트 레시피 v2 (역할 모양 + 등급 색 + 신 원소) 추가 필요
- **대표님 작업**: 프레임 30장 PNG 신규 생성 (1024×1536, 14 영역 고정)
- **재상 병렬 작업**: CSS `--rarity-*` 토큰 + `.bv2-card` 자식 selector 14 좌표 매핑 + 신 등급 원소별 매핑 + 샤인 스윕 애니
- **미영향**: `js/11_data_units.js` 의 `rarity`/`range` 필드는 불변. 데이터 마이그레이션 0.

**이전 결정 관계**:
- [확장] 2026-04-15 "카드 등급 명칭·색 체계 개편" — 명칭·색 결정 위에 **좌표·실루엣·앞면 스탯 세트** 를 얹은 확장.
- [확장] 2026-04-13 "등급별 스타일 예산 (AAA/A/B/C/D)" — 아트 디테일 배분 위에 **UI 고정 좌표** 추가.
- [보완] `.claude/rules/06-card-ui-principles.md` 카드 상태별 크기 규칙은 그대로 유지. 이 문서는 **원본(1024×1536) 기준 UI 영역**을 정의, 상태별 스케일은 CSS 변수(`--bv2-card-w/h`)가 처리.

---

## 2026-04-15 ▶ 범위 ▶ 트랙 6 신설 (온라인·백엔드, 경로 C 확정)

**변경**: 게임 아키텍처를 **경로 C (풀 PvP MMO)** 로 확정. **가챠 시스템은 제거**. 작업을 **트랙 6 "온라인·백엔드"** 로 분리해 대표님이 병렬 Claude 세션으로 직접 리드.

**결정 사항**:
- **아키텍처**: 싱글플레이 코어 유지하되 Supabase + Colyseus 기반 온라인 레이어 추가
- **가챠 폐지**: 확률형 아이템 전면 금지 (한국 확률형 아이템 법규 우회 + 서버측 RNG 검증 부담 제거)
- **대체 수익 모델**: 시즌패스 + 카드 코팅 + 캐릭터 팩 직접 구매 (전부 RNG 없음)
- **6단계 로드맵**: S1 Auth+클라우드세이브 → S2 고스트PvP → S3 랭킹시즌 → S4 실시간1v1PvP → S5 길드·채팅 → S6 안티치트
- **현재 단계**: S1 진행 예정, 대표님 직접 리드

**기술 스택 확정**:
- Supabase (PostgreSQL + Auth + Realtime) — 무료 티어 시작
- Colyseus (Node.js, S4 부터)
- Cloudflare Pages (정적), Fly.io (서버)
- 유저 1000명까지 월 $10 이하

**파일 경계 (트랙 6 ↔ 메인 세션)**:
- 트랙 6 전담: `supabase/**`, `server/**`, `js/35_backend.js`(신규), `PHASE4_*.md`
- 메인 세션 전담: `index.html`, `css/**`, `js/32_auth.js`, `js/60_turnbattle_v2.js` 등 전투·UI·서사
- 조율 지점: `js/32_auth.js` 가 `Backend.*` 함수만 호출 (트랙 6 이 구현)
- 폴백 원칙: Backend 가 준비 안 됐으면 (`isReady=false`) 기존 localStorage 로 자동 폴백 → 싱글플레이 항상 작동

**이유**:
- 평의회 회의(2026-04-15)에서 기획서가 말하는 PvP/길드/시즌이 현재 아키텍처로 **구현 자체가 불가능** 임이 드러남 (서버 0, localStorage 평문, 클라측 RNG 등)
- 대표님이 풀 MMO 를 원함 → 경로 C 선택. 다만 가챠는 **법적 리스크 + 확률 검증 부담** 이 과해 제거
- 1인 개발 한계로 메인 세션(재미 구축) 과 트랙 6(인프라) 를 **분리 병렬** 작업 체제로 전환
- Supabase 선택 이유: PostgreSQL 네이티브, Firebase 보다 이관 쉬움, 무료 티어 넉넉 (유저 1만까지 무료)

**영향 파일**:
- `tracks/06-backend/START.md` (신규) — 포괄 브리핑, S1 체크리스트, 스키마 초안, 인터페이스 계약
- `tracks/_signals/online-backend.md` (신규) — 트랙 6 시그널 파일
- `tracks/README.md` — 트랙 6 행 추가, 충돌 방지 규칙 확장
- `.claude/settings.json` — Notification 훅에 트랙 6 소리(988→1319→1760, B5→E6→A6) 추가
- `.claude/hooks/session_start.py` — 트랙 6 감지 로직 추가
- `design/next-actions.md` — S1~S6 로드맵 편입

**후속 작업 (트랙 6 이 수행)**:
- Supabase 프로젝트 생성 → 001_s1_init.sql 스키마 적용
- `js/35_backend.js` 스켈레톤 → S1 API 구현 → 클라우드 세이브 → 마이그레이션
- `PHASE4_GACHA_PLAN.md` 를 "가챠 없음 / 시즌패스·코팅·직접구매" 로 재작성
- `PHASE4_ARENA_SEASON_PLAN.md` 를 S2·S3·S4 로 분해

**이전 결정 관계**: [전면 재정의] 2026-04-11 PHASE4 시리즈 (ARENA/GACHA/GUILD 기획서) 는 현재 아키텍처와 불일치. 트랙 6 이 이 문서들을 "S 단계" 기준으로 재작성.

---

## 2026-04-15 ▶ 콘텐츠 ▶ "일곱 번째 자리" 스토리 확정

**변경**: 게임 메인 스토리를 **"일곱 번째 자리 (The Seventh Throne)"** 영웅 서사시로 확정. 프롤로그 10씬 교체. `design/concept.md` 세계관 섹션 전면 재작성.

**핵심 뼈대**:
- 창세에 운명의 여신이 **일곱 자리** 를 남김. 여섯은 원초의 여섯이 차지, 일곱 번째는 비어 있음 — 조건: **"필멸자 출신만이 오를 수 있다"**
- 여섯은 이 자리를 두려워해 자신의 파편을 세상에 흘림 → 파편 = 카드
- 플레이어 = 평범한 필멸자 → 여섯의 시험 통과 → 일곱 번째 자리 등극
- 카드 등급(평범→희귀→고귀→전설→신) = 필멸자의 상승 단계와 일치 → 등급업 자체가 스토리
- 엔딩: 플레이어 영웅 카드가 신 등급으로 각성, 다섯 테두리 순차 피어남 + 원소+다이아 테두리 출현 + 여섯이 고개 숙임

**원초의 여섯 (확정)**:
| 원소 | 형상 | 이름 | 호칭 | 시험 축 |
|---|---|---|---|---|
| 🔥 불 | 블랙드래곤 | 그라힘 | 재의 왕 | 폭력 |
| 🌊 물 | 히드라 | 모라스 | 심연의 어머니 | 망각 |
| ⛰️ 땅 | 싸이클롭스 | 에이드라 | 외눈의 수호자 | 인내 |
| ⚡ 전기 | 번개 타이탄 | 비리얀 | 분노의 망치 | 속도 |
| ✨ 신성 | 대천사 | 세라피엘 | 새벽의 창 | 약속 |
| 🌑 암흑 | 대악마 | 네크리온 | 밤의 계약자 | 계약 |

계보 구성: 그리스 3(히드라/싸이클롭스/타이탄) + 성경 2(대천사/대악마) + 판타지 1(블랙드래곤).

**이유**:
- 이전 세계관은 "신들의 시대가 끝나고..." 두 문장 공백. 6원소 신이 이름조차 없어 영웅/스킬/플레이버 텍스트가 모두 공중에 떠 있었음 (디자이너 회의 지적: "이름은 있는데 이야기가 없다").
- 사용자 의도 = 영웅 서사시 + 상승 아크("내가 신이 된다"). 이 뼈대를 **카드 등급 시스템과 직접 결합** 해야 등급업이 플레이어에게 서사적 의미를 가짐.
- 6신의 "시험 축"(폭력/망각/인내/속도/약속/계약) 이 6원소 빌드 축과 1:1 매핑 → 덱빌딩 정체성이 **서사 선택** 이 됨 ("나는 네크리온의 길을 간다").
- 희생 코스트 시스템이 네크리온의 "밤의 계약" 철학과 일치 → 이미 구현된 메커닉에 서사적 정당성 부여.

**영향**:
- `game/js/32_auth.js:49-60` `showPrologue` 씬 배열 10개 교체 (7좌/여섯 신 형상·이름/필멸자 조건/일곱 번째 각성)
- `design/concept.md` 세계관 섹션 전면 재작성
- **후속 작업 (다른 세션)**:
  - 6신 각자의 시그니처 스킬·플레이버 텍스트 (콘텐츠 기획자 확장)
  - 6원소 영웅 18인 배경 서사 (P2-1 Lore Bible 1-pass 의 일부)
  - 네이밍 보이스 "망각된 신의 언어" 톤 통일 (콘텐츠 기획자 제안)
  - 엔딩 각성 컷신 구현 (등급 테두리 순차 피어남 + 원소+다이아)
- **코드 영향 없음** — 데이터 마이그레이션 불필요

**이전 결정 관계**: [확장] 2026-04-15 "카드 등급 명칭·색 체계 개편" (평범/희귀/고귀/전설/신+다이아) 위에 서사 레이어를 얹은 확장. 등급 시스템 자체는 불변. 내부 ID(`bronze~divine`) 도 불변.

---

## 2026-04-15 ▶ 콘텐츠 ▶ 카드 등급 명칭·색 체계 개편

**변경**: 카드 등급 표시 명칭과 색 팔레트를 전면 교체. 내부 데이터 ID(`rarity` 필드값)는 기존 그대로 유지 — 마이그레이션 비용 0.

| 내부 ID | 이전 명칭 | **새 명칭** | **새 표시색** |
|---|---|---|---|
| `bronze` | 브론즈 | 평범 | `#b8b8c0` (실버) |
| `silver` | 실버 | 희귀 | `#3a7bd5` (코발트) |
| `gold` | 골드 | 고귀 | `#9b59b6` (자수정) |
| `legendary` | 전설 | 전설 | `#f39c12` (호박금) |
| `divine` | 신 | 신 | 원소 가변 + **다이아 테두리** |

**신 등급 다이아 테두리 스펙**:
- 이중 테두리 — 안쪽: 원소색 실선(불 `#e74c3c` / 물 `#3498db` / 땅 `#8b5a2b` / 전기 `#f1c40f` / 신성 `#ffd700` / 암흑 `#8e44ad`), 바깥쪽: 흰색 glow + transparent fade
- 간헐적 샤인 스윕 애니 (6~10초 주기, 0.8초 지속, 피크 opacity ~0.35)
- 원칙: "평상시 조용, 특정 순간만 샤인" — StS2 / LoR 전설 연출 공식, 전투 중 시선 과점유 금지
- 금지: 무지개 회전, 상시 파티클, 테두리 두께 2배 초과

**이유**:
- 이전 "브론즈/실버/골드" 는 **리그 명칭**(브론즈~신의영역)과 충돌해 유저 뇌에 혼란.
- MTG/HS/LoR 관습상 초록 = uncommon, 파랑 = rare 로 고정되어 있어, 새 팔레트는 **카드게임 관습** 을 따라 온보딩 비용 0.
- "신" 등급이 다른 등급과 시각적으로 격이 달라야 하는데, 기존에는 단색 테두리라 차이가 불분명. 원소 가변 + 다이아 이중 테두리로 "격이 다르다" 를 즉시 전달.
- 빨강은 전투 UI에서 "적·위험" 신호색과 충돌해 등급 테두리로 부적합 → 호박금으로 교체.

**영향**:
- `.claude/rules/03-terminology.md` — 카드 등급 표 개편 + "등급 ≠ 리그 ≠ 코팅" 명시
- `.claude/rules/04-balance.md` — 유닛 등급 / 스킬 스펠·무기 표 명칭 교체 (내부 ID 병기)
- `.claude/rules/05-design-direction.md` — 등급 스타일 예산 표 + 신규 "등급별 테두리 팔레트" / "신 등급 다이아 스펙" 섹션 추가
- `design/balance.md` — 스탯 범위 섹션 헤더에 표시 명칭 병기, PHASE 3 스킬 수치표 명칭 교체
- **미수정 (의도적)**: `game/PHASE*.md` 17개 — 역사적 계획 문서. Source of Truth 전파로 자연 승계.
- **코드 영향 (별도 작업 승격)**: CSS 변수 `--rarity-*` 전역 교체, `rarityLabel(id)` / `rarityColor(id, element)` 헬퍼 신설, 신 등급 다이아 테두리 컴포넌트 + 샤인 애니 구현. `js/11_data_units.js` 의 `rarity` 필드값은 **불변** — 코드 마이그레이션 불필요.

**이전 결정 관계**: [확장] 2026-04-13 "등급별 스타일 예산" (05-design-direction.md, AAA/A/B/C/D 별칭 + bronze~divine 내부 ID) 은 유지. 이번 변경은 그 위에 표시 레이어만 추가한 보완. 내부 ID 를 건드리지 않으므로 번복 아님.

---

## 2026-04-14 20:46 ▶ 세션 ▶ 핸드오프 저장

**변경**: 세션 상태를 `docs/handoff/handoff-2026-04-14-2046.md` 에 저장
**이유**: 수동 저장 — 이번 세션 실질 작업 없이 직전 세션(2026-04-13 심야) 상태 그대로 이월
**영향**: `docs/handoff/` (신규 디렉터리)

---

## 2026-04-13 22:36 ▶ 세션 ▶ 핸드오프 저장

**변경**: 세션 상태를 `game/docs/handoff/handoff-2026-04-13-2236.md` 에 저장
**이유**: 수동 저장 (번개 타이탄 애니 교체 작업 단락 종료)
**영향**: `game/docs/handoff/`, `game/img/titan.png` (정적 → 애니 APNG 3.3MB, 8프레임, 400×600, 90ms/프레임), `game/img/titan_static.png` (원본 백업 신규), `game/img/titan.webp` (WebP 대기본 신규, 미적용)

---

## 2026-04-12 ▶ 기술 스택 ▶ 게임 개발 하네스 설치

**변경**: Claude Code 프로젝트 하네스 구축 (`.claude/`, `design/`, `CLAUDE.md`).

**이유**: 비개발자 2인 팀이 변화무쌍한 기획으로 게임 개발하려니 매 세션마다 맥락 재설명, 스키마 기억, 기획 변경 추적이 고통이었음. 8개 스킬 + 2개 에이전트로 자연어 한 마디에 데이터/문서/테스트를 한 번에 처리하게 함.

**영향**:
- 새 파일 29개 생성 (CLAUDE.md + .claude/ 21개 + design/ 7개)
- 기존 `js/`, `css/`, `index.html` 수정 없음
- 사용예시 문서 `docs/사용예시.md` 추가
- 설계 문서 `docs/superpowers/specs/2026-04-12-game-harness-design.md`

**이전 결정 관계**: 프로젝트 초기부터의 자연스러운 진화. 기존 결정 번복 없음.

---
