# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투 리뉴얼) + Phase 2 콘텐츠
**최근 세션**: 2026-04-22 낮 — **play-director 실플레이 검수 + P0 자매 버그 수정**
**마지막 커밋**: `9f43333` (HANDOFF 정리). 배틀 플로우 login→battle→라운드2 완주 확인 (pageError 0건)
**유닛 수**: 51 일반 + 6 신 영웅 템플릿 · 스펠 44 · 유물 12 / 회귀 **11/11 PASS**

### ✅ 2026-04-21~22 세션 완료 (총 13 커밋)
- [x] 타이틀 angel/demon 랜덤 (3771×1684 QHD)
- [x] BGM 3영역 셔플 (title/town/battle)
- [x] NPC 대화 오버레이 (8건물 lv1)
- [x] 카드 V4 top redesign + 바 전투 한정
- [x] rage 스탯 완전 제거 + effect drift 3회차 교훈 강화
- [x] **P0 전투 블로커 수정** (pCards null 가드)
- [x] rage 문서 3건 + CSS `--stat-rage`→`--stat-burn` + bg_title 3중 중복 해결 (34MB)
- [x] 밸런스 rarity 3건 + gate.png 404 제거
- [x] 세계관 용어 5곳 정정 (concept/lore-bible)
- [x] fuseCard 진화계수 `EVOLVE_COEF` 테이블화

### ✅ 2026-04-22 낮 완료
- [x] **A. 배틀 플로우 완주 검수** — play-director PASS, 23.5초 프로브 pageError 0건
- [x] **P0 자매 버그 수정** — launchBattle 의 `bs` 자체 null 가드 추가 (55_game_battle.js:314)
- [x] HANDOFF 경로 정정 (09d1187 수정 파일은 57_game_battle_ui.js)
- [x] **타이틀 배경 최적화** — PNG 32MB → JPEG 1.3MB (25배, GitHub Pages 로딩 개선)
- [x] **에셋 매핑 복구 8건** — 스펠 CARD_IMG 누락 (전투 중 검은박스 원인 해소)
- [x] **유물 PNG 3장** — rl_banner/crystal/wall (대표님 공급 → img/ 이식)
- [x] **V4 프레임 통합** — 스펠·유물 V4 kind='spell'/'relic' 컴팩트 + top-row 4줄 정렬

### ✅ 2026-04-22 밤 완료 (자율 30분 — PHASE 5 채팅 시작)
- [x] **PHASE 5 채팅 기획서** — [PHASE5_CHAT_PLAN.md](../PHASE5_CHAT_PLAN.md) 7 Step 로드맵 + 대표님 결정 4건 반영
- [x] **Step 1 — Supabase 스키마** — [003_s3_chat.sql](../supabase/migrations/003_s3_chat.sql) PAT 으로 자동 적용 완료 (테이블 3/정책 7/뷰 1/트리거 1/realtime publication 2/pg_cron 2)
- [x] **Step 2 — world 채널 UI/클라** — 토글 패널 + 메시지 전송/수신 + 뮤트·쿨다운·200자 캡
- [x] **Step 2 블로커 보조** — Realtime INSERT 미브로드캐스트 발견 (play-director [chat_step2_validation_2026-04-22.md](chat_step2_validation_2026-04-22.md) 블로커 B1). Replica Identity FULL 적용 + optimistic append + id dedup 으로 본인 메시지 즉시 렌더 보장.
- [x] **가비지 🔴 7파일 23MB trash 이동** — [garbage_cleaned_2026-04-22.md](garbage_cleaned_2026-04-22.md), 회귀 11/11 PASS

### ✅ 2026-04-22 저녁 완료 (트랙5 운영 결정 3건)
- [x] **가챠 제거 확정** — monetization v2.1 § 0 / § 3 재설계 (누적 조각 완성 · 랭크 확정 지급 · 원소 선택). "확정형 뽑기" 용어 삭제
- [x] **1 시즌 = 3 달 (12 주) 확정** — § 4.1 임시값 해제. 신 카드 2 시즌 수명 = 6 개월 정서
- [x] **lore-consistency-auditor 에이전트 설치** — `.claude/agents/lore-consistency-auditor.md` (balance-auditor lore 판본, 9 범주 판정)
- [x] story_redesign § 16 플래그 2 건 해소 + § 17.1 P0 2 개 완료 처리
- [x] concept v2.1 시즌 리듬에 3달 명시

### ✅ 2026-04-22 저녁 (4) 완료 (감사 후속 대량 수정 — "너 추천대로")
- [x] **신전 건물 리스트 등록** — `design/new_buildings_todo.md` 신규 (옵션 B 확정)
- [x] **Quick Wins 4 건**:
  - C1: js/32_auth.js:56 블랙드래곤 → 메인 시그널 위임
  - C2: roadmap.md:36 배틀패스 → 시즌패스 (3 달 주기)
  - C3: PROMPT_RECIPES.md 구 등급 7 건 → 일반/고귀한/전설의
  - C4: 03-terminology + ELEMENT_PALETTE "전기(공식)/번개(아트 별칭)" 공식화
- [x] **B3 PHASE4_GACHA_PLAN.md 폐기** — DEPRECATED 배너 + `trash/` 이동
- [x] **B1 GDD.md 부분 수정** — 배너 + 장르 + 세계관 + 시즌 3 달 (4 곳)
- [x] **B2 CURRENCY_SYSTEM.md 부분 수정** — 배너 + 화폐 표 확장 + § 3 영웅 가챠 → 실타래+잔재 (3 곳)
- [x] **B4 PHASE4_ARENA_SEASON_PLAN.md** — 시즌 3 달 + 테마 6 시즌 재배치 (2 곳)

### ✅ 2026-04-22 저녁 (3) 완료 (자율 30분 — lore 정합성 1차 감사)
- [x] **lore 정합성 감사 리포트** — `design/lore_audit_2026-04-22-evening.md` 신규 (10 섹션)
- [x] **최우선 발견 🔴🔴🔴**: `js/32_auth.js:56` 프롤로그 "블랙드래곤" 실제 UI 노출 — 메인 즉시 수정 필요 (5분)
- [x] **대대적 재설계/폐기 대상 🔴🔴**: `GDD.md` (가챠 14회) · `CURRENCY_SYSTEM.md` (영웅가챠 16회) · `PHASE4_GACHA_PLAN.md`
- [x] **부분 수정 6파일** (`GACHA_EFFECT.md` · `PHASE1_PLAN.md:70` · `PHASE3_COATING_PLAN.md` · `roadmap.md:36` · `next-actions.md` · `WEB_ARCHITECTURE.md`) 목록화
- [x] **v2 문서군 5개 내부정합성 양호** — 미세 경고 2건만 (lore-bible § 14.3 "현 세대" 시간 종속 / god_npc_spec § 6.5 "이전 세대" 모호)
- [x] **에이전트 운영 이슈 파악**: 신규 에이전트는 세션 재시작 전 미등록. 다음 세션부터 lore-consistency-auditor 정식 호출 가능

### ✅ 2026-04-22 저녁 (2) 완료 (운영 설계 P0 #1 — 신 NPC 처우)
- [x] **신 NPC 처우 스펙 확정** — `god_npc_spec.md` v1 신규 (12 섹션). 결정 8 건 (공유풀 / 5세대 활성 / 명예의 전당 전시 / 확률+초대장 조합 조우 / 이관 영구 고정 / C+ 하이브리드 대사 / 명명 규칙 / 이중 스폰)
- [x] **C+ 대사 시스템**: 템플릿 50~60 + 자유 1 문장 (60 자) + 자동 필터 + 시즌 전환 3주 검수 → 연 28 문장만 검수
- [x] lore-bible v2 § 14 — 5 세대 활성 원칙 명시 + god_npc_spec 참조

### 운영 설계 남은 질문 (이어서 / 다음 세션)
- [x] ~~이전 시즌 신 NPC 처우~~ → **god_npc_spec v1 확정 (2026-04-22 저녁 2)**
- [ ] **성 허브 퀘스트 설계** — 6 암시장 로테이션 UI · 꺼진 신좌의 방 (소멸 의식) · 역대 점유자 회랑 · 명예의 전당 · 옛 신의 초대장 상점 등 성 허브 내 신규 공간 설계 (god_npc_spec 의 UI 측면 포함)
- [ ] **.claude/rules/04-balance.md** 에 Lv 100 등급별 상한 (60/70/80/90/100) 반영 (주로 밸런스 트랙2)
- [ ] **lore-consistency-auditor 1 차 감사 실행** — 현 lore-bible / concept / monetization v2.1 + 기존 PHASE*.md · 카드 flavor 텍스트 전체 감사

### ✅ 메인 세션 처리 완료 (2026-04-22~23)

- [x] ~~🔴🔴🔴 `js/32_auth.js` 프롤로그 "블랙드래곤 → 레드드래곤"~~ — 커밋 `1f85e53` 로 이미 수정됨 (2026-04-22 22:24). 현재 라인 [js/32_auth.js:94](js/32_auth.js#L94) "불의 레드드래곤 · 물의 히드라\n땅의 외눈 거인 · 번개의 타이탄". lore_audit § 2.1 해소.

### ✅ 2026-04-23 낮 결정 (트랙 5 — 문서 거버넌스)

- [x] **v2 문서군 5 개를 Source of Truth 정본으로 확정**
  (`lore-bible.md` v2 / `concept.md` v2.1 / `monetization.md` v2.1 / `story_redesign_2026-04-22.md` / `god_npc_spec.md` v1)
- [x] **GDD.md / CURRENCY_SYSTEM.md 완전 재작성 않음** — 대표님 결정: 부분 수정 상태 유지 + LEGACY 배너 강화
  - GDD.md: 상단 LEGACY 배너 + § 3-1/3-6/3-7 인라인 DEPRECATED 마커 3 건
  - CURRENCY_SYSTEM.md: 상단 LEGACY 배너 + § 2/4/5 인라인 DEPRECATED 마커 3 건
- [x] **2026-04-22 저녁 (4) 의 "[대표님] GDD_v2/CURRENCY_SYSTEM_v2 완전 재작성 여부 결정" 대기 항목 해소** (= 재작성 없음)
- 근거: `design/changelog.md` 2026-04-23 ▶ 범위 ▶ v2 문서군 정본 확정

### ✅ 2026-04-23 낮 결정 (트랙 5 — 화폐 해금 + "???" 숨김 카드)

- [x] **monetization v2.1 → v2.2 개정** — § 3.5 화폐 해금 섹션 신규
- [x] **4 원칙 확정**: (1) 영구 컬렉션 해금 / (2) 골드만 (보석·잔재·축복 불가) / (3) XP 가속만 골드 허용 (합성은 유지) / (4) divine 은 해금 불가
- [x] **비용 확정**: bronze 500 · silver 3,000 · gold 30,000 · **legendary 600,000** · divine 해금 불가
- [x] **"???" 숨김 카드 도입 (옵션 C)** — 레어도 건드리지 않고 카드 단위 `secretUnlock: true` 플래그. 레전드리 + 일부 골드 영웅 대상. divine 제외.
- 후속 미정 (트랙 2 · 5 협력):
  - [ ] "???" 카드 구체 목록 + 해금 조건 ID 매핑 (서사 맞춤)
  - [ ] `.claude/rules/04-balance.md` 에 § 골드 해금 비용 표 + `secretUnlock` 플래그 스키마 반영 (**트랙 2 인계**)
  - [ ] XP 부스터 골드 가격 비율 결정 (**트랙 2 밸런스**)
  - [ ] 컬렉션 화면 "???" UI 스펙 (힌트 노출 규칙 포함)
- 근거: `design/changelog.md` 2026-04-23 ▶ 수익 모델 ▶ 화폐 해금 경로 + "???" 숨김 카드

### ✅ 2026-04-23 낮 결정 (트랙 5 — 영웅 프리셋 4종 해금 조건)

- [x] **`design/character_preset_spec_2026-04-23.md` v1 신규** (7 섹션)
- [x] **설계: C 안 (혼합 해금)** — 서사 × 행동 카운터 조합. StS 스타일 기본 1 + 해금 3
- [x] **해금 조건 확정**:
  - **마을 청년**: 기본 지급 (튜토리얼 직후)
  - **이름 없는 도적**: 암시장 첫 방문 + 엘리트 5 처치
  - **탈주 병사**: 아군 3 희생 + 싱글 런 3 완주
  - **파문당한 사제** (대안 2): 특정 보스 격파 + 어둠 원소 유닛 3 회 지휘
- 후속 미정:
  - [ ] "특정 보스" 최종 지정 (A 네크리온 휘하 / B 교회 히든 / C 일반 엘리트 중)
  - [ ] 각 프리셋 서사 문장 4~6 줄 (hover 툴팁용)
  - [ ] 해금 조건 힌트 문구 (레벨 1~4)
  - [ ] 힌트 노출 규칙 최종 채택 (단순 vs 4 레벨)
  - [ ] 트랙 2 밸런스 검증 (카운트 수치 적정성)
- 구현 인계 (메인): save 스키마 확장 (`visitedMarkets`·`eliteKills`·`sacrificeCount`·`runsCompleted`·`darkElementRunsCompleted`·`defeatedBosses`) + 프리셋 선택 화면 미해금 자물쇠 UI
- 근거: `design/changelog.md` 2026-04-23 ▶ 콘텐츠 ▶ 영웅 프리셋 4종 해금 조건

### ✅ 2026-04-23 저녁 결정 (트랙 5 — 프리셋 업그레이드 트리 + 서사 + 6 암시장 + 무한도전 결정)

- [x] **character_preset_spec v1 → v2** — 프리셋 업그레이드 트리 (§ 8) + 4 프리셋 서사 (§ 9) + 특정 보스 A 확정 (§ 3.1)
- [x] **"???" 시스템 구체화**: 각 bronze 프리셋 → silver 변형 3~5 개 = 총 12~20 개 silver 영웅 카드 풀이 "???" 주 적용 대상. monetization v2.2 § 3.5.3 교차 참조 보강
- [x] **파문당한 사제 "특정 보스" = 옵션 A 확정** — 네크리온 휘하 보스 1인. "어둠을 다뤄본 자만이 네크리온에게 닿는다" 서사 연결
- [x] **프리셋 4종 서사 완성** (4~6 줄 × 4):
  - 마을 청년: "영웅은 태어나는 것이 아니라 결심하는 것이다"
  - 이름 없는 도적: "이름은 짐이다"
  - 탈주 병사: "명령은 버렸지만 희생은 이 검에 실려있다"
  - 파문당한 사제: "사랑과 구원은 하나의 신에게만 있는 것이 아니다"
- [x] **`design/six_markets_lore_2026-04-23.md` v1 신규** (9 섹션) — 6 암시장 lore (이름·위치·분위기·전용 품목·신좌 관계·시즌 테마 영향). **운영자는 공통 1인 TBD** (대표님 결정: 동일 인물, 정체는 차후 업데이트)
- [x] **무한도전 관련 결정**:
  - **본격 스펙은 스킵** (대표님: "일단 싱글 런 + PvP 만 먼저")
  - **보스풀 원칙**: 당대 활성 신 NPC (매 시즌 1세대 → 2세대 자동 로테이션) — 대표님 선결정
  - **진입 조건**: 지난 시즌 1 위 ("💖 신의 사랑을 받는 자") 만 다음 1 시즌 한정
- 후속 대기 (차후 세션):
  - [ ] 6 암시장 운영자 공통 1인 정체·이름·서사 (A/B/C 컨셉 중)
  - [ ] 프리셋 silver 변형 구체 목록 (§ 8 예시 → 대표님 검토)
  - [ ] 무한도전 본격 스펙 (싱글·PvP 완성 후)
- 근거: `design/changelog.md` 2026-04-23 ▶ 콘텐츠 ▶ 프리셋 업그레이드 + 6 암시장 lore + 무한도전 원칙

### ✅ 2026-04-23 오전 완료 (NPC 일러스트 적용)

- [x] **NPC Lv1 일러스트 5장 이식** — 대표님 공급 (`Downloads/`) → `img/npc_*.png`
  - `주점_npc.png` → `npc_tavern_1.png` (주막주인)
  - `행상인할머니_npc.png` → `npc_shop_1.png` (행상인)
  - `수녀원_npc1.png` → `npc_church_1.png` (수녀) — **흰 배경 threshold 투명화 적용**
  - `서생_npc.png` → `npc_library_1.png` (서생)
  - `성기사.png` → `npc_gate_5.png` (수호기사단장 — 할로·성광·금빛 방패가 "천공문" 상징 일치)
- [x] **용량 최적화** 500×750 으로 리사이즈 — 총 12.8MB → 2.8MB (78% 절감)
- [x] **Playwright 실제 overlay 5건 시각 검수** — 5/5 PASS
- [⏸️] **건물 외관 2장** (`선술집11.png`·`대장간111.png`) — skip 결정 (대표님: "뭐지? 내가 받은 게 있나?" → 이전 세션 잔재로 추정)

### ✅ 2026-04-23 오후 완료 (P0 NPC 4장 + 씬별 표정 시스템)

- [x] **P0 NPC Lv1 4장 추가 이식** (누적 9 슬롯 완성):
  - `늙은 조언자_npc.png` → `npc_castle_1.png` (흰 배경 투명화)
  - `파수꾼소년_일반_npc.png` → `npc_gate_1.png`
  - `견습공_일반_npc.png` → `npc_forge_1.png` (체크보드 배경 투명화)
  - `허수아비.png` → `npc_training_1.png`
- [x] **🎭 씬별 표정 분기 시스템 구현** (대표님 요청) — scenes 스키마 `string | {text, expr}` 확장, `_renderNpcDialogScene` 에 expr 매핑 로직 (`img/npc_{b}_{lv}_{expr}.png`) + 404 자동 폴백. 하위 호환 유지.
- [x] **forge Lv1 견습공 3씬 표정 variants 실전 적용** (npc_forge_1_working.png·_proud.png):
  - 씬 0 기본 → 수줍은 인사 · "어... 어서 오세요!"
  - 씬 1 `working` → 모루 작업 · "여긴 대장간이에요..."
  - 씬 2 `proud` → 활짝 웃음 · "뭐... 뭐 만들어 드릴까요?"
- [x] **Playwright 3단 전환 실전 테스트 PASS** + 회귀 **11/11 PASS**
- [ ] **대기**: church Lv1 12표정 variants 이식 (Downloads 공급됨, 대사 재구성 필요), tavern/shop/library Lv1 표정 variants (후속 공급 요청 예정)

### ✅ 2026-04-23 저녁 완료 (P0 전투 버그 G — speed 미러링)

- [x] **진단**: `setSpeed` 는 `Battle.SPEED`(대문자)에만 저장, probe 는 `Battle.state.speed`(소문자)를 읽음 → **observer 편의 미러링 부재**. 실제 게임 로직 정상 (오진).
- [x] **수정**: [config_battle.js:46](js/config_battle.js#L46) `setSpeed` 에 `Battle.state.speed = s` 미러링 라인 추가 (로드 순서 가드 포함).
- [x] [60_turnbattle_v2.js:35,331](js/60_turnbattle_v2.js#L35) `Battle.state` 초기화 + `resetState` 2곳에 `speed` 필드 유지.
- [x] **검증 (Playwright)**: SPEED=1→2→4→1 전이 시 `Battle.SPEED` · `Battle.state.speed` · CSS `--battle-speed` 3지점 전부 동기. invalid(3) 거부. `resetState` 후에도 speed 보존. 회귀 **11/11 PASS**.
- [x] **P0 G 완료** — 큐잉 30s/실행 60s 관련 별도 이슈는 이 수정과 무관 (speed 는 beat ms 제수 역할로 정상 작동 중).

### ✅ 2026-04-23 (이어서) 완료 (PHASE 5 Step 3 + P1 전투 일러스트 F 해결)

- [x] **🔴 P1 F — 전투 v2 카드 일러스트 검은 박스 해결** (낮 세션의 play-director 지적 사항):
  - **진단**: Playwright `tools/_battle_v2_art_audit.js` 실측 → 카드 8장 전부 `art.src` 빈 상태. 전투 v2 가 `unit.id` 에 전투용 uid(`a_*`/`e_*`)를 덮어쓰기 때문에 CARD_IMG 매핑 실패. 원본 id 는 이미 `imgKey`/`unitId` 필드에 백업되어 있음 (60_turnbattle_v2.js:1359 주석 `imgKey: c.id  // CARD_IMG key = 원본 id` 가 이 의도).
  - **수정**: `js/14_data_images.js` `RoF.getCardImg()` 에 `imgKey`/`unitId` 폴백 1줄 추가. 영웅 분기는 `_isHero || isHero` 로 확장.
  - **결과**: 카드 7장 중 **6장 정상 복구** (`militia`/`hunter`/`apprentice`/`dark_shaman` 전부 `naturalW:400` 로딩 OK).
  - **남은 1장**: 플레이어 영웅 `a_my_hero_001` — CARD_IMG 에 `hero_*` 키 자체가 0개 (별건). 영웅 스킨 이미지 공급 + 매핑 필요.
  - 회귀 11/11 PASS, pageErrors 0, failedImg 0.

- [x] **Step 3 — 3채널 탭 (world/league/guild) 검증·완료** — 코드는 Step 2 세션에 선반영됨. 이 세션은 Playwright 실측 검증만 수행:
  - 탭 3 렌더 OK (world 66px / league 61px / guild 61px, 패널 320px 안 꽉)
  - league 클릭 → "🏛 브론즈 모임" + `ch_league_bronze` 해석 정상
  - guild 클릭 → placeholder "아직 길드에 속해 있지 않습니다" + input/send 잠금
  - world 복귀 → `ch_world`
  - console/page errors **0건**, 회귀 **11/11 PASS**
- 다음 Step 4 후보: 카드 공유 (`+` 버튼 → 덱 picker → attached_card JSON). kind='share' V4 컴포넌트 신규 필요.

### 다음 세션 오프닝 추천 (우선순위)
- [ ] 🚨 **PAT revoke 확인** — Supabase account/tokens 에서 "rof-migration" revoke 상태 확인
- [ ] 🔴 **Realtime 대시보드 토글** — Database → Publications → supabase_realtime → chat_messages 체크박스 (1분 UI 확인. Management API 불가능 부분. 켜져있으면 타 유저 메시지 실시간 수신 100% 보장)
- [x] ~~🟠 PHASE 5 Step 3~~ — 2026-04-23 검증 완료
- [ ] 🟠 **PHASE 5 Step 4** — 카드 공유 (덱 picker + attached_card + kind='share' V4 미니카드)
- [x] ~~B. 가비지 trash 이동~~ — 2026-04-22 밤 완료 (7파일 23MB)
- [x] ~~🔴 F. 카드 일러스트 검은 박스~~ — 2026-04-23 해결 (getCardImg imgKey/unitId 폴백). 영웅은 별건 (CARD_IMG hero_* 키 공급 필요)
- [ ] 🟠 **F-후속. 영웅 스킨 이미지 CARD_IMG 매핑** — `hero_m_warrior_fire` 등 skinKey 기반 영웅 이미지 공급 + 14_data_images.js 에 키 추가 필요
- [x] ~~🔴 G. `RoF.Battle.state.speed` undefined 수정~~ — 2026-04-23 저녁 완료 (setSpeed 에 미러링 추가, 실제 버그 아닌 observer 오진)
- [ ] 🟡 **C. 성별 토글 CSS transition** (15분) — minor_bugs #3 Option B, fade 200ms 추가
- [ ] 🟡 **D. 51유닛 신 계열 매핑** — **대표님 직접 진행 예정** (2~4시간, 트랙5)
- [ ] 🟢 **E. P4 큰 리팩터 2건** — CardV4.create() 쪼개기 / BUILDINGS.action 함수화 (위험도 중간)

## 막혀있는 것
- 📌 Supabase 봇 시드 + S2 E2E 8개 — 대표님 직접
- 📌 대표님 공급 대기: 원소 이펙트 PNG 6장, NPC 하프바디 일러 4장

## 노트
- **P0 수정 핵심**: pCards:null 은 "초기화 필요" sentinel. launchBattle 의 `if(!bs.pCards)` 에서 배열로 채움. 단순히 `[]` 로 초기화하면 초기화 분기가 트리거 안 됨. → 호출자 측 방어 가드가 정답.
- **effect drift 3회차**: rage 제거 때 코드 3점은 동시 수정 OK, **기획 문서 3건(.md)** 은 놓침. 다음부터 stat 제거 체크리스트에 `grep -rn "<키워드>" game/*.md` 추가.
- **bg_title 3중 중복 사고**: cp 3번 한 결과. 대안: mv + 심볼릭 링크, or 단일 파일 + CSS 변수 참조.
- **Claude Design 파이프라인**: 대표님 일러스트/아이콘 공급 → Claude Design 프레임/UI → 내가 적용·검증
- **CSS 디자인 금지**: 아이콘/프레임/색/그라디언트/효과는 대표님 공급, 내가 CSS 로 직접 만들지 않음

## 이번 세션 리포트 8건 (design/)
- [balance_audit_2026-04-21.md](balance_audit_2026-04-21.md) · [play_director_report_2026-04-21.md](play_director_report_2026-04-21.md)
- [v4_audit_2026-04-21.md](v4_audit_2026-04-21.md) · [worldbuilding_audit_2026-04-21.md](worldbuilding_audit_2026-04-21.md)
- [minor_bugs_2026-04-21.md](minor_bugs_2026-04-21.md) · [code_extensibility_review_2026-04-21.md](code_extensibility_review_2026-04-21.md)
- [garbage_scan_2026-04-21.md](garbage_scan_2026-04-21.md) · lore_research_2026-04-21.md (이전 세션)
