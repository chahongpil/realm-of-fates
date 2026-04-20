# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투 리뉴얼) + Phase 2 콘텐츠
**최근 세션**: 2026-04-20 (프레임 일체화 PNG 41장 + 시스템 프레임 시대 종료)
**마지막 커밋**: `f7d2533` (4/19) — 4/20 작업 미커밋

### 이번 세션 완료 (2026-04-20)
- [x] 대표님 프레임 일체화 PNG 32장 일괄 임포트 (한글 → ID, 400×600)
- [x] 타이탄 8프레임 APNG 합성 (1.86MB, 90ms loop)
- [x] 신규 6캐 (archer/cryomancer_f/griffin/armored_griffin/griffin_knight/griffin_rider) → 51 유닛
- [x] **시스템 외곽 프레임 PNG 18장 폐기** (`trash/img_frames_2026-04-20/`) + CSS 정리 → 이중 프레임 해체
- [x] data/card_slot_overrides.json 스키마 작성 (런타임 적용 미완)
- [x] 회귀 9/9 PASS, Playwright 시각 확인

### 다음 작업 (우선순위)
- [ ] 🔴 **미커밋 검토 + 커밋** (32장 + js/11/14 + css/30/31 + trash + tools 2종 + data)
- [ ] 🔴 **카드별 슬롯 override 단계 A 마저** — `js/17_data_card_slots.js` (로더) + `js/40_cards.js` `applyTo` 호출
- [ ] 🟡 **단계 B 편집기** — `tools/card_slot_editor.html` + `coord_editor_server.js` 엔드포인트
- [ ] 🟡 **작은 카드 정책 결정** (A/B/C) — 대표님 답변 대기
- [ ] 🟢 검수관 재호출 (프레임 해체 후 정합 검증)

## 막혀있는 것
- 📌 카드별 슬롯 좌표 어긋남 — 대표님 통합 PNG 의 슬롯 위치가 카드마다 다름 (knight 상단 작은 배너 / archangel 중앙 큰 배너 / NRG 보석 위치 상이 / 좌측 4슬롯인데 시스템은 3개 출력). 슬롯 편집기 완성 후 대표님이 카드별 1:1 조정.
- 📌 작은 카드(전투 그리드 172×248) 에서 슬롯 박스가 너무 작아 가독성 ↓ — A/B/C 결정 대기
- 📌 Supabase 봇 시드 적용 (003_s2_bot_seed.sql) + S2 E2E 8개 — 대표님 직접

## 노트
- **새 카드 추가 흐름**: 대표님이 `이미지제작_원본/일반유닛_원본/프레임 일체화/` 에 합성 PNG 드롭 → `tools/import_unified_frames.py` 의 MAP 에 한 줄 추가 → 스크립트 실행 → `js/11_data_units.js` + `js/14_data_images.js` 추가
- **시스템 프레임 시대 종료**: card_frame.png + frame_*.png 다 trash. 앞으로 등급 표현은 100% 일러스트 위임.
- **핸드오프**: `game/docs/handoff/handoff-2026-04-20-end.md`
