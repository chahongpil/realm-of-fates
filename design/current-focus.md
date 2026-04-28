# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투) + Phase 2 콘텐츠 + **Phase 5 (채팅) Step 5 종료**
**최근 세션**: 2026-04-28 — **PAT 누출 정리 + AcoustID fingerprint + PHASE 5 Step 5 (4 sub-step) 완료**
**마지막 커밋**: `e2bf9c3` feat(chat): PHASE 5 Step 5c/5d — 금칙어 마스킹 + URL 차단
**누적 커밋**: 5건 이번 세션 (`1689186` → `92251f1` → `b956616` → `e96dafe` → `e2bf9c3`), origin 동기
**유닛 수**: 51 일반 + 6 신 영웅 / 스펠 44 / 유물 12 (변동 없음)

### ✅ 2026-04-28 세션 완료
- [x] **🚨 Supabase PAT 누출 정리** (`1689186`) — public repo 노출 → 자동 revoke 처리됨. handoff `[REDACTED]` 교체, changelog 영구 기록
- [x] **secret-scan 훅 신규** — `.claude/hooks/post_edit_secrets.js` 11개 패턴(sbp_/JWT/sk-ant/ghp_/AKIA/xoxb 등) 차단. settings.json 등록, 자가 테스트 통과
- [x] **08-garbage-lessons.md 5조 교훈** — "핸드오프 = public repo 가정", "revoke 권고 작성 금지 — 즉시 revoke"
- [x] **AcoustID fpcalc 1.5.1 설치 + 7곡 fingerprint 추출** — Application Key 발급 막힘으로 lookup 보류
- [x] **PHASE 5 Step 5a** Lv5 미만 world 채널 차단 (`b956616`) — 클라 검증 + 004 migration RLS WITH CHECK
- [x] **PHASE 5 Step 5b** 도배 감지 (`e96dafe`) — 클라 sliding window(8개=경고/10개=뮤트안내) + 서버 trg_auto_mute_on_flood (30분)
- [x] **PHASE 5 Step 5c/5d** 금칙어/URL (`e2bf9c3`) — `js/38_chat_filters.js` 신규 (49 욕설 + URL regex), `_sendMessage` censor wiring
- [x] **회귀 12/12 PASS** (chat-filters 테스트 추가)

### 🔴 다음 세션 우선순위

1. **🟠 직접 플레이 검증** — 2026-04-27 세션 변경 6건 + 2026-04-28 PHASE 5 Step 5 (Lv5 차단/도배/금칙어/URL)
2. **🟡 Supabase 대시보드 — 004_s5_limits.sql 적용** — RLS chat_insert_world_min_level + trg_auto_mute_on_flood (Migration 수동 push 또는 PAT 재발급 후 자동)
3. **🟡 PHASE 5 Step 6** — 신고 + 모더레이션 (chat_reports INSERT / 자동 뮤트 trigger 는 003 에 이미 있음 → UI 만 만들면 됨)
4. **🟢 PHASE 5 Step 7** — 전투 중 채팅 숨김 + 읽지 않은 배지
5. **🟢 AcoustID lookup 재시도** — Application Key 발급 + `node c:/work/tools/fpcalc/lookup.js` 1회 실행

## 막혀있는 것
- 📌 AcoustID Application API Key (User Key 가 아닌, https://acoustid.org/new-application 등록 필요. 프로필에 이메일 추가 후 재시도)
- 📌 `gate.png` 404 (대표님 공급 또는 fallback 유지)
- 📌 hero_* skinKey CARD_IMG 매핑 1장 잔여
- 📌 **004_s5_limits.sql Supabase 대시보드 적용 필요** — PAT revoke 상태라 자동 push 불가. 새 PAT 발급 받거나 SQL 에디터로 수동 실행

## 노트
- **secret-scan 가드** — Edit/Write 직후 알려진 토큰 패턴 매치 시 즉시 block. `[REDACTED]` 표지 같은 라인은 skip. 패턴 추가 시 `c:/work/.claude/hooks/post_edit_secrets.js` 수정.
- **AcoustID 키 종류** — User API Key (submit 용, /api-key) ≠ Application API Key (lookup 용, /new-application). 헷갈리지 말 것.
- **rembg 배경 제거 워크플로** — 흰 배경 PNG 자동 알파 추출. backup .bak.png → 검증 → trash.
- **NPC 거절 패턴** — choice.guard(game) + denyMsg. forge/tavern 등 향후 확장 시 1줄로 추가 가능.

## 이번 세션 커밋 (시간순)
- `1689186` security: Supabase PAT 누출 사후 정리 + secret-scan 훅
- `92251f1` docs: 2026-04-28 세션 결과 반영 (current-focus + AcoustID fingerprint 보존)
- `b956616` feat(chat): PHASE 5 Step 5a — Lv5 미만 world 채널 차단
- `e96dafe` feat(chat): PHASE 5 Step 5b — 도배 사전 경고 (클라 sliding window)
- `e2bf9c3` feat(chat): PHASE 5 Step 5c/5d — 금칙어 마스킹 + URL 차단
