# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투 리뉴얼) + Phase 2 콘텐츠 + **주인공 시스템 리뉴얼 (2026-04-21)**
**최근 세션**: 2026-04-21 (오후 3차 — P0 스탯 수정 + 주인공 시스템 P1~P5 완료, P6 UI 이식 대기)
**마지막 커밋**: `40b1867` (오후 Step 5C 완결 마감) — P1~P5 작업은 커밋 전 상태
**유닛 수**: 40 일반 유닛 (영웅 18종 폐기) + 6 신 영웅 템플릿 / 회귀 9/9 PASS
**DS 레포**: https://github.com/chahongpil/realm-of-fates-design-system (private)

### 🎭 주인공 시스템 리뉴얼 진행도
- [x] **P1** 이미지 8장 import (protagonist_m/f_*.png, 400×600)
- [x] **P2** 11_data_heroes.js 신규 (6 템플릿 + createHero + 원소 보너스)
- [x] **P3** mockup/protagonist_create/v1~v3.html 3안 — **v2 Cockpit 선택**
- [x] **P4** 기존 18종 h_* 청소 (데이터/코드 참조/이미지/helpers)
- [x] **P5** 카드 렌더 원소 이펙트 오버레이 빈 레이어 + placeholder 6장
- [ ] 🔴 **P6** v2 mockup → `char-create-screen` 실 이식 + **성별 선택 단계 신규** (가장 큰 작업, 약 2~3시간)
- [ ] 🟡 **P7** 최종 회귀 + 커밋 (P6 완료 후)
- [ ] 🟢 **대표님 공급 대기**: 원소 이펙트 PNG 6장 (`img/elem_fx_{원소}.png` 파일 교체)

### V4 확장 진행도 (9/9 완결)
- [x] Tavern / Deckview / Formation / Cardselect / Castle / Church / Matching / Pick
- [x] **Battle** — Step 5C 완료. Stage 10장 V4 compact(172×248) + Focus V4 (310×446). setter API 전면 활용. 2026-04-21 오후

### 다음 작업 (우선순위)
- [ ] 🔴 **Step 5C Battle 옵션 확정** — A(Compact Variant) vs B(확대만 V4), A3(Focus) 포함 여부, 9px 스탯 허용선, parch.desc 처리 (4건)
- [ ] 🔴 **이미지 작업 반영** (대표님 공급 시) — 유닛 P0 4장 / 스킬 B 10장 / effect 아이콘 14종
- [ ] 🟡 **Church z-index / Codex 5-col / B3 `!important` 정리** — 자투리
- [ ] 🟡 **역할 5종 분화 결정** — 현 3종 → DS 5종 전환 여부 (58 유닛 재분류 영향)
- [x] ~~`rules/04-balance.md` vs `design/balance.md` 수치 동기화~~ **2026-04-21 A안 완료**

## 막혀있는 것
- ✅ **P0 5건 해결** (2026-04-21 오후) — SoT(rules/04-balance.md) 재판정 결과 3건은 이미 범위 안, 2건(archangel atk 6→7/def 5→8, sniper hp 8→10) 상향. balance-auditor 재검증 PASS.
- 📌 **주석 카운트 어긋남 (자투리)** — 11_data_units.js 의 `// GOLD (6)` / `// LEGENDARY (5)` 섹션 주석이 archmage·sniper(→silver) / lich(→gold) 재분류 이후 카운트 반영 안됨. 위치 이동 리팩터 별도.
- 📌 Supabase 봇 시드 + S2 E2E 8개 — 대표님 직접

## 노트
- **V4 수치 확정**: 카드 260 은 이상, 실적용 235 (stage 1240 / 5-col 물리 한계). `#tav-grid` override 에 `display:grid + repeat(auto-fill, 235px) + gap 10` + `.card-v4 width:235 !important`
- **Claude Design 파이프라인**: 대표님이 일러스트/아이콘 공급 → Claude Design 이 프레임/UI → 내가 적용·검증
- **CSS 디자인 금지**: 아이콘/프레임/색/그라디언트/효과는 대표님 공급, 내가 CSS 로 직접 만들지 않음
