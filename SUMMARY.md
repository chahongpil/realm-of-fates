# Realm of Fates — 한 페이지 요약

> 신규 세션·외부 리뷰어가 **15분 안에 전체 그림**을 잡기 위한 색인.
> 수치·결정의 정본은 본문 문서. 이 파일은 **수치를 베끼지 않는다** — 어디를 보면 되는지만 가리킴.
> 갱신 트리거: Phase 전환, 큰 결정 변경, 주요 문서 신규/폐기.

---

## 한 줄 요약

**신좌 계승 전쟁에서 카드를 모으고, 자신의 세계에 왕으로 등극한 뒤 통합 신의 자리를 다투는 로그라이크 카드 RPG.**
(원전: [`design/concept.md`](design/concept.md))

---

## 게임 컨셉

웹(`index.html`) 기반 카드 오토배틀러. **로그라이크 + 시즌형 PvP** 혼합. 6 원소 신좌 + 비어있는 7 번째 자리를 둘러싼 필멸자들의 도전. 신 카드는 2 시즌(6 개월) 후 소멸 — "덧없는 영광" 정서. **가챠 없음 확정** (v2.1, 2026-04-22). 참고작: Slay the Spire 2 / Hades / Marvel Snap / LoR / Hearthstone.

플레이 흐름: **싱글 3 액트 런 → 왕좌 획득 → 시즌 PvP 실 흡수 → 신좌 계승**.

---

## 핵심 시스템 (정본 문서 포인터)

| 시스템 | 정본 위치 |
|---|---|
| 카드 등급 5 단계 (일반/희귀/고귀한/전설의/신) | [`.claude/rules/03-terminology.md`](.claude/rules/03-terminology.md) |
| 6 원소 (불·물·전기·땅·신성·암흑) + 상성 | [`.claude/rules/03-terminology.md`](.claude/rules/03-terminology.md), [`.claude/rules/04-balance.md`](.claude/rules/04-balance.md) |
| 영웅·일반 유닛 스탯 범위 | [`.claude/rules/04-balance.md`](.claude/rules/04-balance.md) (단일 Source of Truth) |
| 전투 공식 (무기·스펠·치명타·원소 곱) | [`.claude/rules/04-balance.md`](.claude/rules/04-balance.md) §전투 공식 |
| TP/RP·라운드·큐잉 등 시네마틱 전투 | [`.claude/rules/03-terminology.md`](.claude/rules/03-terminology.md) §전투 개념 |
| 카드 UI 규격 (크기·레이아웃·정보 계층) | [`.claude/rules/06-card-ui-principles.md`](.claude/rules/06-card-ui-principles.md) |
| 디자인 방향 (등급별 스타일·테두리) | [`.claude/rules/05-design-direction.md`](.claude/rules/05-design-direction.md) |
| 화폐 (골드·보석·축복) | [`.claude/rules/03-terminology.md`](.claude/rules/03-terminology.md) §화폐 |
| 수익 모델 (시즌패스·가챠 없음) | [`design/monetization.md`](design/monetization.md) |
| 세계관·신·NPC | [`design/lore-bible.md`](design/lore-bible.md) v2 |
| 뷰포트 1280×720 고정 | [`.claude/rules/01-project.md`](.claude/rules/01-project.md) |

---

## Phase 진행 현황

| Phase | 상태 | 핵심 |
|---|---|---|
| **A — 인프라** | ✅ 완료 (2026-04-11) | 리팩토링 / 하네스 설치 |
| **B — 콘텐츠 확장** | 🚧 진행 중 | 유닛 30→80 / 스킬 50→150 / 유물 20→50 |
| **C — Phaser 전환** | 예정 | 전투씬만 Phaser, UI는 HTML |
| **D — 상업화** | 예정 | Supabase·시즌패스·IAP·AdMob |
| **E — 출시** | 예정 | 베타·Store 업로드 |

세부 트랙(Phase 1~5 기획서 묶음 안에서 동시 진행):
- **Phase 1**: 코어 전투 (완료)
- **Phase 2**: 타운·콘텐츠 (battle log / keyword / quest / synergy / town / flavor / relic identity / deck-empty / hud-font / card-component-unify / landscape-viewport)
- **Phase 3**: 시네마틱 전투 (battle_cinematic) + element / coating / evolution
- **Phase 4**: 길드 / 아레나 시즌
- **Phase 5**: 채팅 (Step 5 종료, Step 6 신고/모더레이션 미완)

현재 작업: [`design/current-focus.md`](design/current-focus.md) 자동 로드.

다음 큰 작업: **직업 트리 시스템** (영웅 lv + 무기 lv + 스펠 lv 3 축 → 직업 카드 해금 → 골드 전직).

---

## 4 기둥 하네스

| 기둥 | 역할 | 출처 |
|---|---|---|
| ① MD 규칙 | 무엇을 만들고, 어떤 원칙으로 | `rules/01~08`, `CLAUDE.md`, `design/` |
| ② CI 게이트 | 잘못된 코드 조기 차단 | `hooks/post_edit_*`, `tools/test_run.js` |
| ③ 도구 경계 | 위험 도구 차단 | `settings.json` deny, `pre_bash_guard.js` |
| ④ 피드백 루프 | 실패만 시끄럽게 | `state/failures.jsonl`, `garbage-cleaner` |

자세히: [`.claude/rules/00-index.md`](.claude/rules/00-index.md).

---

## 문서 색인 (정본 위치)

### 절대 규칙 / 작업 지침
- [`CLAUDE.md`](CLAUDE.md) — 절대 규칙 (한국어 / index.html 수정 / 디자인 차별화 / LoRA 학습 금지)
- [`.claude/rules/00-index.md`](.claude/rules/00-index.md) — 4 기둥 프레임
- [`.claude/rules/01-project.md`](.claude/rules/01-project.md) — 작업 모드, 뷰포트 고정
- [`.claude/rules/02-tech-stack.md`](.claude/rules/02-tech-stack.md) — Unity 전환 취소, 웹 유지
- [`.claude/rules/03-terminology.md`](.claude/rules/03-terminology.md) — 화폐 / 등급 / 원소 / 전투 개념 용어 통일
- [`.claude/rules/04-balance.md`](.claude/rules/04-balance.md) — **밸런스 Source of Truth** (스탯·공식·드롭률·진화·경험치)
- [`.claude/rules/05-design-direction.md`](.claude/rules/05-design-direction.md) — 카드 UI 구조, 등급별 스타일, 신 등급 다이아 테두리
- [`.claude/rules/06-card-ui-principles.md`](.claude/rules/06-card-ui-principles.md) — 카드 크기 상태별, 전장 레이아웃
- [`.claude/rules/07-tool-boundaries.md`](.claude/rules/07-tool-boundaries.md) — Bash 가드, 보호 디렉터리
- [`.claude/rules/08-garbage-lessons.md`](.claude/rules/08-garbage-lessons.md) — 반복 실패 패턴 증류

### 게임 디자인 (정본)
- [`design/concept.md`](design/concept.md) — 게임 컨셉 v2 (한 장 요약)
- [`design/lore-bible.md`](design/lore-bible.md) v2 — 세계관·신·NPC (Source of Truth)
- [`design/monetization.md`](design/monetization.md) v2.2 — 수익 모델, 가챠 없음
- [`design/roadmap.md`](design/roadmap.md) — Phase A~E 로드맵
- [`design/current-focus.md`](design/current-focus.md) — 지금 작업 중 (세션 자동 로드)
- [`design/changelog.md`](design/changelog.md) — 기획 변경 이력 (append-only)
- [`design/KNOWHOW_INDEX.md`](design/KNOWHOW_INDEX.md) — 노하우 색인
- [`design/mechanics.md`](design/mechanics.md) — 메커닉 상세
- [`design/screen_flow.md`](design/screen_flow.md) — 화면 흐름
- [`design/EDITOR_GUIDE.md`](design/EDITOR_GUIDE.md) — Zone/플로우 편집기 사용
- [`design/frame-prompt-rules.md`](design/frame-prompt-rules.md) — 카드 프레임 규격 정본

### Phase 기획서
- [`PHASE1_PLAN.md`](PHASE1_PLAN.md) — 코어 전투
- `PHASE2_*` (12 개) — 타운·콘텐츠 (battle_log / keyword / synergy / quest / town / flavor / relic / deck_empty / hud_font / card_component_unify / landscape_viewport)
- [`PHASE3_BATTLE_CINEMATIC.md`](PHASE3_BATTLE_CINEMATIC.md) — 시네마틱 전투 (현재 진행 트랙)
- `PHASE3_{COATING,ELEMENT,EVOLUTION}_PLAN.md` — 코팅/원소/진화
- [`PHASE4_GUILD_PLAN.md`](PHASE4_GUILD_PLAN.md), [`PHASE4_ARENA_SEASON_PLAN.md`](PHASE4_ARENA_SEASON_PLAN.md)
- [`PHASE5_CHAT_PLAN.md`](PHASE5_CHAT_PLAN.md) — 채팅

### 감사·검수·플랜 (수십 건, append-only)
- 위치: [`design/`](design/) 의 `*_audit_*.md`, `*_review_*.md`, `*_plan.md`
- 추적: [`design/changelog.md`](design/changelog.md)
- 검색 패턴: `audit_<date>` (밸런스/lore/UI/garbage 자율감사) / `<feature>_plan_<date>` (큰 작업 사전 기획)

### 핸드오프
- 최신: [`docs/handoff/handoff-2026-05-01-2256.md`](docs/handoff/handoff-2026-05-01-2256.md)
- 정책: 세션 종료 시마다 `docs/handoff/` 에 timestamp 파일 생성. 다음 세션은 가장 최근 파일 + 본 SUMMARY 두 개로 컨텍스트 복구.

### 코드 (구조만)
- 데이터: [`js/11_data_units.js`](js/11_data_units.js) (51 일반 + 영웅), [`js/12_data_skills.js`](js/12_data_skills.js) (44), [`js/13_data_relics.js`](js/13_data_relics.js) (12), [`js/14_data_images.js`](js/14_data_images.js) (CARD_IMG 매핑)
- 카드 UI 정본: [`css/32_card_v4.css`](css/32_card_v4.css), [`js/40_cards.js`](js/40_cards.js) `CardV4Component.create()`
- 전투 v2: [`css/41_battle_v2.css`](css/41_battle_v2.css), [`js/60_turnbattle_v2.js`](js/60_turnbattle_v2.js)

---

## 병렬 트랙 시그널

여러 Claude 창이 동시 작업할 때의 충돌 방지. 메인은 전권 + append 의무.
- 메인: [`tracks/_signals/main.md`](../tracks/_signals/main.md)
- 에셋: [`tracks/_signals/assets.md`](../tracks/_signals/assets.md)
- 데이터/밸런스: [`tracks/_signals/data-balance.md`](../tracks/_signals/data-balance.md)
- 기획/lore: [`tracks/_signals/docs-lore.md`](../tracks/_signals/docs-lore.md)
- 백엔드: [`tracks/_signals/online-backend.md`](../tracks/_signals/online-backend.md)

규칙 정본: [`CLAUDE.md`](CLAUDE.md) §병렬 트랙 시그널.

---

## 역사

| 마일스톤 | 일자 |
|---|---|
| Unity 전환 취소 → 웹 유지 | 2026-04-12 |
| 카드 V4 도입 | 2026-04-20 |
| 컨셉 v2 / Lore v2 / 신좌×점유자 이원 구조 | 2026-04-22 |
| 가챠 없음 확정 | 2026-04-22 |
| 시즌 3 달 (12 주) 확정 | 2026-04-22 |
| 영웅 = 유저 카드 1장 고정 | 2026-04-29 |
| 카드 V4 원소 아이콘 정본 | 2026-05-02 |
