# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투) + Phase 2 콘텐츠 + Phase 5 (채팅) Step 5 종료
**최근 세션**: 2026-04-29 — **영웅 시스템 단일화 + 전투 속도 B+D + 직업 트리 결정**
**유닛 수**: 51 일반 + 영웅 1장 고정 (회원가입 시 1명 createHero) / 스펠 44 / 유물 12

### ✅ 2026-04-29 세션 완료
- [x] **NPC 화면 진입 fix 4건** — 도서관/선술집/왕궁 NPC 액션 wrapper 추가 (showCodexView/showTavernHeroEntry/showCastleQuestEntry)
  → 단 `showTavernHeroEntry` 는 영웅 폐기로 후속 삭제됨
- [x] **AoE dim 누수 fix** — 번개사슬 시전 후 우리편 검은색 잔류 버그
- [x] **NRG 이중방어** — `legacyCardToV2Unit` 1419 라인
- [x] **영웅 = 유저 카드 1장 고정** — 선술집 영웅 영입 시스템 완전 폐기
- [x] **전투 속도 B+D** — TIMING 4개 절대값 상향 + 속도 토글 UI (×1/×2/×4)
- [x] **자율학습 3 감사** (balance/lore/garbage) — changelog 영구 기록
- [x] **08-garbage-lessons.md 6번째 교훈** — HTML ↔ JS 경계 element/참조 동기화
- [x] **회귀 12/12 PASS**

### 🔴 다음 세션 우선순위 (직업 트리 시스템 — 큰 작업)

1. **🟠 Step 1: 직업 트리 기획서 작성** — `design/job_system_plan.md` 신규
   - 직업 N개 리스트 (마검사 / 성기사 / 암살자 / 정령사 등)
   - 각 직업 해금 조건 3축: 영웅 lv + 무기 lv + 스펠 lv
   - 전직 후 효과 (역할/원소/스킬셋 변경)
   - 골드 비용 산정
2. **🟡 Step 2: 무기 레벨 시스템** — 데이터 + 강화 메커닉 + 대장간 UI
3. **🟡 Step 3: 스펠 레벨 시스템** — 같은 패턴
4. **🟡 Step 4: 직업 데이터 + 해금 판정**
5. **🟡 Step 5: 왕궁 전직 UI**

### 🟢 누적 미해결 (다른 트랙)

- 🟠 직접 플레이 검증 — 2026-04-27 변경 6건 + Step 5 + 이번 세션 변경 (속도 UI / NPC 화면 / 선술집 단일 탭)
- 🟡 balance P0 5건 — archmage/sniper/lich hp + pirate/dark_shaman rarity (자율감사 결과)
- 🟡 lore Critical 5건 — PHASE 1/2/3 "가챠/뽑기" 표현 제거 (monetization v2.1 위반)
- 🟡 PHASE 5 Step 6 — 신고 + 모더레이션 UI
- 🟡 004_s5_limits.sql Supabase 대시보드 수동 적용
- 🟢 dead-code archive 26건 (design 19 + tools 7) — `60_turnbattle.js` 100% dead 아님 (2 fallback)
- 🟢 bonusTrigger v2 시스템 이식 (큰 작업, 별도 phase 가능)

## 막혀있는 것
- 📌 AcoustID Application API Key (User Key 가 아닌, /new-application 등록 필요)
- 📌 `gate.png` 404 (대표님 공급 또는 fallback 유지)
- 📌 hero_* skinKey CARD_IMG 매핑 1장 잔여
- 📌 004_s5_limits.sql Supabase 대시보드 적용 (PAT revoke 상태)
- 📌 직업 트리 시스템 — 무기/스펠 레벨링 선행 시스템 부재 (5단계 의존)

## 노트
- **영웅 = 유저 카드 1장**: 회원가입 시 1명 `createHero(g/r/e)` 생성, 추가 영입 불가. 선술집은 용병 전용.
- **createHero 매트릭스**: 2 성별 × 3 역할 × 6 원소 = 36 조합. 유저는 그 중 1개 선택.
- **단련 시스템 변경 예정** (다음 세션): freePoints +5 → +1, lv 5당 등급 자동 상승 폐기, 별도 자격(직업 카드 해금)으로 등급 상승.
- **전직 = 직업 카드 해금 + 선택**: 영웅 lv + 무기 lv + 스펠 lv 3축 충족 → 카드 해금 → 골드로 전직.
- **속도 UI 패턴**: `data-speed` 속성으로 매직 넘버 제거. 새 배수 추가 시 index.html 의 button 만 추가.
