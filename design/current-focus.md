# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투) + Phase 2 콘텐츠 + Phase 5 (채팅) Step 5 종료
**최근 세션**: 2026-04-29 — **직접 플레이 검증 + 발견 버그 4건 fix + 자율학습 3 감사**
**유닛 수**: 51 일반 + 6 신 영웅 / 스펠 44 / 유물 12 (변동 없음)

### ✅ 2026-04-29 세션 완료
- [x] **NPC 액션 화면 진입 fix (3건)** — 도서관/선술집/왕궁의 4개 탭 전환 메서드를 wrapper 3개로 감싸 화면 진입 + 탭 전환 동시 처리. `showCodexView`, `showTavernHeroEntry`, `showCastleQuestEntry` 신규.
- [x] **AoE 스킬 dim 누수 fix** — 번개사슬 시전 후 우리편 검은색 잠긴 상태 버그. `startCombatExecution` 라운드 종료 + `onCharClick` 2지점에 `clearTargetHighlight()` 추가.
- [x] **NRG 이중방어** — `legacyCardToV2Unit` 1419 라인 `?? 0` → `?? c.nrg ?? 10` (HP 패턴 일치).
- [x] **자율학습 3 감사 보고**: balance / lore / garbage 결과 changelog 영구 기록.
- [x] **회귀 12/12 PASS**

### 🔴 다음 세션 우선순위

1. **🟠 직접 플레이 재검증** — 이번 fix 4건 동작 확인 (도서관/선술집/왕궁 NPC 클릭 → 정상 화면 진입, 번개사슬 시전 → dim 잔류 없음)
2. **🟡 balance P0 5건 수정** — archmage/sniper/lich hp 상향 + pirate/dark_shaman rarity 정정 (자율학습 감사 결과)
3. **🟡 lore Critical 5건 정리** — PHASE 1/2/3 기획서 "가챠/뽑기" 표현 제거 (monetization v2.1 위반)
4. **🟡 PHASE 5 Step 6** — 신고 + 모더레이션 UI
5. **🟢 dead-code archive** — design/ 19개 + tools/ 7개 정리 (-2K 줄, 사전 정찰 필요한 5건은 별도)
6. **🟢 004_s5_limits.sql** Supabase 대시보드 수동 적용

## 막혀있는 것
- 📌 AcoustID Application API Key (User Key 가 아닌, /new-application 등록 필요)
- 📌 `gate.png` 404 (대표님 공급 또는 fallback 유지)
- 📌 hero_* skinKey CARD_IMG 매핑 1장 잔여
- 📌 004_s5_limits.sql Supabase 대시보드 적용 (PAT revoke 상태)
- 📌 `60_turnbattle.js` 폐기 — 2 fallback 진입점(`55:339`, `62_ghost_pvp:150`) 존재. archive 전 해당 조건 도달 가능성 검증 필요.

## 노트
- **NPC choice action 패턴** — `RoF.Game[action]()` 직접 호출 구조라 action 이 화면 진입 메서드인지 탭 전환 메서드인지 검증 없음. 신규 NPC choice 추가 시 action 이 `UI.show()` 를 호출하는지 확인 필수.
- **상태 클래스 누수 점검** — `is-dimmed` 외 `is-acted/queued/selected/target-valid` 는 lifecycle 클리어 정상. 신규 클래스 추가 시 lifecycle 매핑 확인.
