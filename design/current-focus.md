# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투) + Phase 2 콘텐츠 + Phase 5 (채팅) Step 5 종료
**최근 세션**: 2026-05-02 ~ 03 — **자율 4시간 종합 (펜딩 7+8번 처리) + 게임 정체성 심도 대화**
**유닛 수**: 51 일반 + 영웅 1장 고정 / 스펠 44 / 유물 12

> 🤝 **핸드오프**: [`docs/handoff/handoff-2026-05-03-0150.md`](docs/handoff/handoff-2026-05-03-0150.md) — 자율 작업 종합 + 정체성 대화 + 다음 4안 (A/B/C/D)

## 🎯 게임 정체성 정의 (2026-05-03 사용자 확정)

> "**내 카드를 키워 → 시즌마다 신좌 점유자 도전 → 신전 회랑에 이름 새김 → 5시즌 동반자**"

- **핵심 정서**: 포켓몬스터처럼 수많은 유닛 중 **나만의 카드로 1등 하는 희열**
- **시간축**: 1~2시즌 만렙 도달 불가 / **5시즌째 도달** / 시즌별 캡 풀기 (Lv 20→40→60→80→100)
- **삼각 결합**: 정체성 + lore-bible v2 점유자 신화 + 신전(temple) placeholder 활성화

### 정체성 4단계 진단
| 단계 | 정서 | 메커니즘 | 현재 |
|---|---|---|---|
| ① 선택 | "내 카드는 이거" | 영입 + favorite | 🟡 시그니처 표시 누락 |
| ② 육성 | "내가 키웠어" | 단련/분배/장비/스킬교체 | 🟢 단련+분배 OK / 장비·스킬교체 placeholder |
| ③ 도달 | "신화 달성" | rarity + 시즌 캡 | 🟢 5단계+만렙100 / **시즌 캡 풀기 미구현** |
| ④ 자랑 | "내가 그 카드의 신" | 호칭+회랑+채팅 | 🔴 **호칭 0** / 회랑 placeholder / 채팅 OK |

### ✅ 2026-05-02 세션 완료 (자율 작업 포함, 추가)
- [x] **PHASE 5 채팅 Step 4 v2 / 1+2+3+4+5단계** — 카드 이름 자동 링크 + `@` mention dropdown + 마우스 클릭 + 키보드 nav (↑↓Enter/Tab/Esc, wrap-around) + cursor 재평가 (click/keyup/focus). 회귀+ui-inspector+play-director 풀 검증.
- [x] **훈련장 분리 + 단련 재설계 (펜딩 7번)** — `#training-screen` 신규 (단련+스킬교체 2탭). 단련 = 골드→exp (1:1, `100×L^1.5` 곡선) + 자동 레벨업 + freePoints +5 분배 (6스탯). rarity 강제승급 폐기. 만렙 100 cap. 이펙트: `.lv-up-label` 2.6rem 골든 텍스트 + 기존 burst/glow/particles 재활용. 왕궁 단련 탭 폐기 → 퀘스트+전직(placeholder). NPC choices 갱신.
- [x] **lore audit 2026-05-02 일괄 처리** — Critical 6건 + High 3건 + Medium M-1+M-2 = 11건. PHASE1/2/3/5 의 가챠/뽑기 표현 단어 교체, "전설 뽑기권" → "전설 소환권", 신살 플레이버 세계관화. 코드 변경 0.
- [x] **채팅 mention dropdown maxHeight 220→270** — 8 항목 무스크롤 (264 < 270).
- [x] **dead code 정리** — castle-tab-upgrade CSS / 좌표 토큰 제거. 62_ghost_pvp showTraining monkey-patch 제거 (훈련장↔결투장 명확 분리).
- [x] **회귀 12/12 PASS** 모든 변경 후

### 🔴 다음 세션 — 사용자 결정 4안 (A/B/C/D)

> 정체성 정리 OK 면 다음 큰 결정. 핸드오프 `handoff-2026-05-03-0150.md` 상세.
> **2026-05-03 자율 세션 (2시간) 결과**: A·B 설계 문서 2개 작성 + lore + game-designer 이중 검증 + P0 2건 + P1 8건 + P2 4건 모두 반영. 사용자 복귀 시 결정 5+5 = 10건만 확인하면 phase 진입 가능. → `design/autonomous_session_2026-05-03.md` 참조.

- **A. 호칭/점유자 시스템 신설** (큰 phase) — ✅ **`design/throne_system_plan.md` 작성 완료** (~390 줄, 14건 권장 반영). 정체성 ④ + 신전 활성화 + lore-bible 결합. **이거 가장 우선 추천**.
- **B. 시즌 캡 시스템 STEP 1** (중간 phase) — ✅ **`design/season_cap_plan.md` 작성 완료** (~245 줄, 14건 권장 반영). Lv 20→40→60→80→100 곡선, 12주/시즌, 5시즌=15개월, catch-up + overflow B' (저장+상한). **A안과 동시 phase 권장**.
- **C. 카드 V4 모바일 비례화** (중간 작업) — px → calc 변수. 두 플랫폼 결합 기반. (자율 세션에서 안 다룸 — 시각 변경 ui-inspector 동반 의무)
- **D. MUST 5 항목 풀 완성 로드맵** (planning) — 3~6개월 일정표. A/B/C 결정 후 작성 가능.

### 🟢 마이너 백로그 (자율 가능)

- 단련 detail 잔여 ~10px overflow (overflow-y:auto 동작 OK, 추가 압축 또는 layout 재배치)
- 가지뷰 컨셉 라인 채택 — `design/branch_suggestions_2026-05-02.md` 9 안 검토
- 하네스 05-game-narrative 도입
- CSV import 스크립트
- 여관(NRG 회복) 의미 재설계 (성당 합병 또는 일일 보상/출석 시스템으로)

### ✅ 카드 V4 시각 검수 결과

검수 폴더: `shots/card_v4_2026-05-02/` (자율 검수관 산출물).
- 6 사이즈 (235 / 260 / 336 / 172 / 210 / 378) all_sizes.png 일괄 비교 완료
- name-box / lv-box / HP·NRG bar / parch / elem_icon 모두 일관 — 시각 통과
- geom.json + wb_geom.json 정량 데이터 보존

### 🟢 자율 감사 결과 (2026-05-02, 사용자 결정 후 patch)

- 🟢 **balance** — backlog 5건 모두 P1 강등 또는 철회 (해소) / 새 P0 1건: `sea_priest` atk 8→6, hpReg 4→2 / 암흑·신성 원소 40~50% 부족 — `design/balance_audit_2026-05-02.md`
- 🟠 **lore** — 12건 (Critical 6 / High 3 / Medium 2). PHASE1·PHASE3_COATING "가챠" 표현 6건 위반. **코팅 가챠는 단어 교체 아닌 구조 재설계 필요** — `design/lore_audit_2026-05-02.md`
- ✅ **카드 V4 elem_icon 9 사이즈 시각 검수 통과** — `design/v4_elem_check_2026-05-02.md`
- 🟢 **가지뷰 컨셉 라인 9 안 추천** — lore-bible 6신좌 + 무파벌 3 = `design/branch_suggestions_2026-05-02.md`

### 🟢 누적 미해결 (다른 트랙, 변동 없음)

- ✅ **미수집 카드 클릭 힌트 모달** — 2026-05-02 자율 작업 시 처리 완료. `js/53_game_deck.js` `_codexAcquireHint` 헬퍼 + showCodexDetail 모달에 등급별 획득 경로 표시 (bronze/silver/gold/legendary/divine + 영웅 별도 안내).

- 🟠 직접 플레이 검증 (이번 세션 변경 다수 — elem_icon 9 사이즈, share 폐기, 카드 도식화 4탭)
- 🟡 PHASE 5 Step 6 — 신고 + 모더레이션 UI
- 🟡 004_s5_limits.sql Supabase 대시보드 수동 적용
- 🟢 dead-code archive 26건
- 🟢 bonusTrigger v2 시스템 이식

## 막혀있는 것
- 📌 AcoustID Application API Key
- 📌 `gate.png` 404
- 📌 hero_* skinKey CARD_IMG 매핑 1장
- 📌 004_s5_limits.sql Supabase 적용
- 📌 직업 트리 — 무기/스펠 레벨링 선행 시스템 부재

## 노트
- **카드 V4 사이즈 9종 운영** — 160/172/190/210/235/260/280/336/378. 상세: `design/card_size_usage.md`
- **elem_icon 좌표 정책** — bottom 비례가 사이즈별 12~54% 폭 (parch px 고정 + 카드 height 가변). left/size 는 일관(~-1.5% / ~18.6%). CSS 변수 + selector 스코프
- **카드 도식화 LocalStorage 키**: `rof.cards_flow_map.placeholders` (units / branches / skills_passive / skills_active / unit_skill_links)
- **share 폐기 → 링크 시스템 대체** — `_showCardDetailModal` 함수 보존. 텍스트 내 카드 이름 → @ 자동완성 → default 모달 (별도 phase)
