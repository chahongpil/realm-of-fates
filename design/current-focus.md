# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투) + Phase 2 콘텐츠 + **Phase 5 (채팅) Step 4 종료**
**최근 세션**: 2026-04-27 (밤) — **NPC 투명 + 카드 레이아웃 + 전투 2버그 + NPC 거절 + 가비지 + PHASE 5 Step 4**
**마지막 커밋**: `adb25ea` feat(chat): PHASE 5 Step 4 — 카드 공유 (4a~4d)
**누적 커밋**: 4건 이번 세션 (`f9cac48` → `3b46281` → `54f0131` → `adb25ea`), origin 동기
**유닛 수**: 51 일반 + 6 신 영웅 / 스펠 44 / 유물 12 (변동 없음)

### ✅ 2026-04-27 밤 세션 완료
- [x] **여관 NPC 흰 배경 → 투명** — rembg, alpha 0% → 44.9% (`f9cac48`)
- [x] **카드 V4 이름박스/Lv박스** — parch 위로 이동 (bottom:100%) → 일러스트 상단 전체 확장
- [x] **첫 유닛 클릭 엄청 확대 버그** — applyFocusOrigin 단위 불일치 (viewport vs local) → offsetWidth 사용
- [x] **모든 유닛 NRG=0 시작 버그** — curNrg ?? 0 → ?? c.nrg (HP 패턴 일치)
- [x] **NPC 조건부 거절 시스템** — choice.guard + denyMsg, chat 모드 재사용 (church 부상자/장례, inn 휴식)
- [x] **가비지 정리** — tools/_ 12건 + 백업 PNG 2건 + 진단 스크립트 1건 → trash (15건 5.24MB)
- [x] **PHASE 5 Step 4 카드 공유** — 4a(kind:'share') / 4b(+ picker) / 4c(미니카드 렌더) / 4d(풀모달)
- [x] **회귀 11/11 PASS** (각 단계마다 확인)

### 🔴 다음 세션 우선순위

1. **🟠 직접 플레이 검증** — 이번 세션 6개 변경사항 (NPC 투명·카드 레이아웃·첫클릭 확대·NRG=0·NPC 거절·카드 공유)
2. **🟡 PHASE 5 Step 5** — 발언 제한 세부 (Lv5 이하 world 차단 / 1분 10개 플러드 / 금칙어 50개 / URL 차단)
3. **🟡 PHASE 5 Step 6** — 신고 + 모더레이션 (chat_reports INSERT / 자동 뮤트)
4. **🟢 PHASE 5 Step 7** — 전투 중 채팅 숨김 + 읽지 않은 배지
5. **🟢 AcoustID 키 재발급 + 미매칭 7곡 lookup**

## 막혀있는 것
- 📌 AcoustID 키 (대표님 발급 필요, 무료 등록)
- 📌 `gate.png` 404 (대표님 공급 또는 fallback 유지)
- 📌 hero_* skinKey CARD_IMG 매핑 1장 잔여

## 노트
- **rembg 배경 제거 워크플로** — 흰 배경 PNG 자동 알파 추출. backup .bak.png → 검증 → trash. NPC PNG 추가 시 동일 패턴.
- **NPC 거절 패턴 표준화** — choice.guard(game) + denyMsg. forge/tavern 등 향후 확장 시 1줄로 추가 가능.
- **viewport vs local pixel 트랩** — `getBoundingClientRect().width` 는 game-root scale 후, CSS 변수는 local. 비교 시 단위 일치 (offsetWidth) 또는 scale 보정 필수.
- **카드 V4 share 사이즈** — 100×175 (aspect 4/7). PHASE5 plan 120×170 은 비율 안 맞아서 폐기.

## 이번 세션 커밋 (시간순)
- `f9cac48` fix(npc): 여관 NPC 흰 배경 → 투명 (rembg)
- `3b46281` fix(card+battle+npc): 카드 레이아웃 + 전투 2버그 + NPC 조건부 거절
- `54f0131` chore(cleanup): tools/_ 12건 + play_sk_check.js → trash
- `adb25ea` feat(chat): PHASE 5 Step 4 — 카드 공유 (4a~4d 완료)
