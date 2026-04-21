# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투 리뉴얼) + Phase 2 콘텐츠
**최근 세션**: 2026-04-21 심야 — **카드 V4 redesign + rage 완전 제거 + 타이틀 배경·BGM 대개편**
**마지막 커밋**: `a4553f7` (타이틀 3곡 셔플). 이번 세션 커밋 9개 (d34b64f ~ a4553f7)
**유닛 수**: 51 일반 + 6 신 영웅 템플릿 · 스펠 44 · 유물 12 / 회귀 **11/11 PASS**
**DS 레포**: https://github.com/chahongpil/realm-of-fates-design-system (private)

### ✅ 2026-04-21 심야 완료 (9 커밋)
- [x] 타이틀 배경 angel/demon 랜덤 (3771×1684 ultrawide 페어)
- [x] BGM 셔플 플레이리스트 (title 2곡, town 5곡, battle 6곡)
- [x] title1 교체 + title2/3 추가 (Pixabay Content License, SOURCES.md 증빙 기록)
- [x] 건물 첫 방문 NPC 대화 오버레이 (8건물 lv1, localStorage 재방문 스킵)
- [x] 카드 V4 top redesign — 바 전투 한정 + 이름/Lv 박스 분리 + HP/NRG 숫자 box 내 표시
- [x] rage(분노) 스탯 완전 제거 — 데이터/파서/테스트/문서 8파일 일괄 정리
- [x] 04-19 effect 마커 드리프트 교훈 **3회차 재발** → 08-garbage-lessons.md 강화

### 다음 작업 (우선순위)
- [ ] 🔴 **P0 블로커 수정** — [js/55_game_battle.js:145](../js/55_game_battle.js#L145) `pCards:null` → `pCards:[]` 1줄 (play-director 보고. 전투 진입 불가 해결)
- [ ] 🔴 **세계관 보강 P1** — concept.md / lore-bible.md 용어 정정 3곳 + rage 참조 제거 1곳 (`design/worldbuilding_audit_2026-04-21.md` 참조)
- [ ] 🟡 **세계관 보강 P2** — 51유닛 신 계열 자동 매핑 + flavor 1줄 (2~4시간, 트랙5 전용)
- [ ] 🟡 **밸런스 P0 수정** — archmage/sniper/lich rarity 레이블 3건 (`balance_audit_2026-04-21.md`)
- [ ] 🟡 **역할 5종 분화 결정** — 현 3종 → DS 5종 전환 (51유닛 재분류 영향)
- [ ] 🟢 **대표님 공급 대기**: 원소 이펙트 PNG 6장 (`img/elem_fx_*.png`), NPC 하프바디 4장

## 막혀있는 것
- 📌 Supabase 봇 시드 + S2 E2E 8개 — 대표님 직접
- 📌 P0 전투 블로커 — 수정은 1줄이나 대표님 승인 대기

## 노트
- **타이틀 배경**: body.game-mode:has(#title-screen.active.bg-demon) 으로 분기. 테스트 환경은 angel 고정 (결정론).
- **V4 카드 바**: `.card-v4` 기본 숨김, `.with-bars` / `.card-v4-compact` 만 표시. top-row 자동 위치 이동 (8px ↔ 28px).
- **BGM 셔플**: `audio.loop = (tracks.length <= 1)` 자동 분기. 트랙 1개 = seamless loop, 2개+ = 직전회피 셔플.
- **04-19 effect 드리프트 교훈**: **rage 제거 중 3회차 재발**. 앞으로 effect/stat 필드 Edit 전에 의존성 grep **자동 루틴**으로 격상.
- **Claude Design 파이프라인**: 대표님이 일러스트/아이콘 공급 → Claude Design 이 프레임/UI → 내가 적용·검증
- **CSS 디자인 금지**: 아이콘/프레임/색/그라디언트/효과는 대표님 공급, 내가 CSS 로 직접 만들지 않음

## 이번 세션 산출 리포트
- [design/balance_audit_2026-04-21.md](balance_audit_2026-04-21.md) — P0 3건 수정 권고
- [design/play_director_report_2026-04-21.md](play_director_report_2026-04-21.md) — 전투 P0 블로커 3건
- [design/v4_audit_2026-04-21.md](v4_audit_2026-04-21.md) — V4 redesign 시각 검수
- [design/worldbuilding_audit_2026-04-21.md](worldbuilding_audit_2026-04-21.md) — 세계관 35% 채움도 진단
