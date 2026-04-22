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

### 다음 세션 오프닝 추천 (우선순위)
- [ ] 🚨 **PAT revoke 확인** — Supabase account/tokens 에서 "rof-migration" revoke 상태 확인
- [ ] 🔴 **Realtime 대시보드 토글** — Database → Publications → supabase_realtime → chat_messages 체크박스 (1분 UI 확인. Management API 불가능 부분. 켜져있으면 타 유저 메시지 실시간 수신 100% 보장)
- [ ] 🟠 **PHASE 5 Step 3** — 3채널 탭 (world/league/guild). 사전 조사 완료 — getLeague() → id 매핑, save.league 필드 자동 저장 로직, guild 는 placeholder
- [x] ~~B. 가비지 trash 이동~~ — 2026-04-22 밤 완료 (7파일 23MB)
- [ ] 🔴 **F. 카드 일러스트 검은 박스 진단** — 전투 v2 에서 CARD_IMG 매핑 실패. rof-ui-inspector 병행. ※ 일부는 스펠 8건 복구로 해소됨 (낮 완료), 전투 v2 쪽 별개 검증 필요
- [ ] 🔴 **G. `RoF.Battle.state.speed` undefined 수정** — setSpeed 호출 무효. 큐잉 30s/실행 60s 규칙 실효 가능
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
