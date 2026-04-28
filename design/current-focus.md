# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투) + Phase 2 콘텐츠 + **Phase 5 (채팅) Step 5 진입**
**최근 세션**: 2026-04-28 — **Supabase PAT 누출 사후 정리 + secret-scan 가드 + AcoustID fingerprint 보존**
**마지막 커밋**: `1689186` security: Supabase PAT 누출 사후 정리 + secret-scan 훅
**누적 커밋**: 1건 이번 세션 (`1689186`), origin 동기
**유닛 수**: 51 일반 + 6 신 영웅 / 스펠 44 / 유물 12 (변동 없음)

### ✅ 2026-04-28 세션 완료
- [x] **🚨 Supabase PAT 누출 정리** — public repo 노출 → 자동 revoke 처리됨. handoff `[REDACTED]` 교체, changelog 영구 기록
- [x] **secret-scan 훅 신규** — `.claude/hooks/post_edit_secrets.js` 11개 패턴(sbp_/JWT/sk-ant/ghp_/AKIA/xoxb 등) 차단. settings.json 등록, 자가 테스트 통과
- [x] **08-garbage-lessons.md 5조 교훈** — "핸드오프 = public repo 가정", "revoke 권고 작성 금지 — 즉시 revoke", "암묵 상식 가드 없으면 한 번은 깨진다"
- [x] **AcoustID 7곡 fingerprint 추출** — fpcalc 1.5.1 설치, 모든 곡 fingerprint 보존. SOURCES.md 에 재시도 절차 명시. **lookup 보류** (Application Key 발급이 프로필 이메일 누락으로 막힘)

### 🔴 다음 세션 우선순위

1. **🟠 직접 플레이 검증** — 2026-04-27 세션 변경 6건 (NPC 투명·카드 레이아웃·첫클릭 확대·NRG=0·NPC 거절·카드 공유)
2. **🟡 PHASE 5 Step 5** — 발언 제한 세부 (Lv5 이하 world 차단 / 1분 10개 플러드 / 금칙어 50개 / URL 차단)  ← **현재 진입 중**
3. **🟡 PHASE 5 Step 6** — 신고 + 모더레이션 (chat_reports INSERT / 자동 뮤트)
4. **🟢 PHASE 5 Step 7** — 전투 중 채팅 숨김 + 읽지 않은 배지
5. **🟢 AcoustID lookup 재시도** — Application Key 발급 + `node c:/work/tools/fpcalc/lookup.js` 1회 실행

## 막혀있는 것
- 📌 AcoustID Application API Key (User Key 가 아닌, https://acoustid.org/new-application 등록 필요. 프로필에 이메일 추가 후 재시도)
- 📌 `gate.png` 404 (대표님 공급 또는 fallback 유지)
- 📌 hero_* skinKey CARD_IMG 매핑 1장 잔여

## 노트
- **secret-scan 가드** — Edit/Write 직후 알려진 토큰 패턴 매치 시 즉시 block. `[REDACTED]` 표지 같은 라인은 skip. 패턴 추가 시 `c:/work/.claude/hooks/post_edit_secrets.js` 수정.
- **AcoustID 키 종류** — User API Key (submit 용, /api-key) ≠ Application API Key (lookup 용, /new-application). 헷갈리지 말 것.
- **rembg 배경 제거 워크플로** — 흰 배경 PNG 자동 알파 추출. backup .bak.png → 검증 → trash.
- **NPC 거절 패턴** — choice.guard(game) + denyMsg. forge/tavern 등 향후 확장 시 1줄로 추가 가능.

## 이번 세션 커밋 (시간순)
- `1689186` security: Supabase PAT 누출 사후 정리 + secret-scan 훅
