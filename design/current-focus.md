# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투 리뉴얼) + Phase 2 콘텐츠
**최근 세션**: 2026-04-19 (오후 정비/검수)
**마지막 커밋**: `e816b02` 편성 공명 배지 + skillIds 필드 + Type A 래퍼 CSS 전면 통일

### 이번 세션 완료 (2026-04-19 오후)
- [x] 회귀테스트 9/9 통과 (skillIds 케이스 포함)
- [x] 시각검수관 호출 — P0 2건 false positive 확정 (4/15 옛날 스크린샷 기반), P1 토큰화 2건 수정
- [x] S2 고스트 PvP 진단 — 99% 구현 완료 발견 (SQL + Backend 4 API + RoF.Arena + 자동 스냅샷 훅)
- [x] `tracks/_signals/online-backend.md` 보충 7건 (4/16~4/19 누락 기록 회복)
- [x] P1 토큰화: `.fr-badge` `#888 → var(--text-3)`, `.rew-pick-card` raw rgba → color-mix

### 이전 세션 완료 (2026-04-19 심야)
- [x] 편성 공명 배지 미리보기 (Battle.computeResonance 재사용)
- [x] skillIds 명시 필드 도입 (단일 SoT)
- [x] Type A 래퍼 CSS 전면 통일 (tavern/deckview/castle)

### 다음 작업 (우선순위)
- [ ] 🟡 **P0-3 카드 등급 색 CSS** — 신 등급 다이아 테두리 + 샤인 스윕 (대표님 프레임 작업과 충돌 조율)
- [ ] 🟡 **S2 마무리** — 봇 시드 SQL + 패배 정책 결정 + 콜로세움 UX 검토 + E2E 테스트
- [ ] 🟢 **divine 5원소 유닛** — 불/물/땅/암흑/신성 5종 (titan 외, 일러스트 선행)
- [ ] 🟢 **legendary/divine 액티브 스킬 확장** — 현재 액티브 8장(bronze 2 + silver 4 + gold 2), 강력 등급 0장

## 막혀있는 것
- 📌 **대표님 프레임 적용 작업 진행 중** — 25장 일러스트 → 프레임 합성 (방패프레임_투명3번째 정본)
  - 합성은 대표님이 직접. 메인은 받은 PNG → 게임 적용(파일명 변환·400×600·`game/img/`·신규 캐릭터 데이터)만
- Supabase 이메일 확인 OFF (대시보드 토글 — 대표님 직접)

## 노트
- **검수관 결과 검증 룰**: 검수관이 본 스크린샷 타임스탬프 확인 필수. 4/15 옛날 스크린샷이 4/19 코드 갭으로 보일 수 있음 — false positive 사례 누적
- **메인 세션 시그널 의무**: supabase/, 35_backend.js 등 트랙 영역 건드릴 때 `tracks/_signals/online-backend.md` 에 append. 4/16~4/19 누락 발견하고 보충함
- **핸드오프**: `game/docs/handoff/handoff-2026-04-19-2221.md`
- **index.html 수정 허용** — 단, 구조 변경은 동의 후
