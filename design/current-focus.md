# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투 리뉴얼) + Phase 2 콘텐츠 + **Design System V4 확장 (Step 5)**
**최근 세션**: 2026-04-21 (오전 Step 5 V4 확장 4커밋 + 오후 Step 5C Battle 기획서 작성)
**마지막 커밋**: `4c04731` docs: 핸드오프 저장 — 2026-04-21 11:15 (Step 5 V4 확장 4커밋 마감)
**유닛 수**: 58 유닛 / 회귀 9/9 PASS
**DS 레포**: https://github.com/chahongpil/realm-of-fates-design-system (private)

### V4 확장 진행도 (9/9 완결)
- [x] Tavern / Deckview / Formation / Cardselect / Castle / Church / Matching / Pick
- [x] **Battle** — Step 5C 완료. Stage 10장 V4 compact(172×248) + Focus V4 (310×446). setter API 전면 활용. 2026-04-21 오후

### 다음 작업 (우선순위)
- [ ] 🔴 **Step 5C Battle 옵션 확정** — A(Compact Variant) vs B(확대만 V4), A3(Focus) 포함 여부, 9px 스탯 허용선, parch.desc 처리 (4건)
- [ ] 🔴 **이미지 작업 반영** (대표님 공급 시) — 유닛 P0 4장 / 스킬 B 10장 / effect 아이콘 14종
- [ ] 🟡 **암흑의저격수 데이터 추가** — rarity 확정 후
- [ ] 🟡 **Church z-index / Codex 5-col / B3 `!important` 정리** — 자투리
- [ ] 🟡 **역할 5종 분화 결정** — 현 3종 → DS 5종 전환 여부 (58 유닛 재분류 영향)
- [x] ~~`rules/04-balance.md` vs `design/balance.md` 수치 동기화~~ **2026-04-21 A안 완료**

## 막혀있는 것
- 📌 **암흑의저격수 rarity** — 일러스트는 공급됐으나 rarity/id 확정 대기
- 📌 **P0 5건** — dragon/archangel divine 미달, lich/archmage/sniper hp 미달
- 📌 Supabase 봇 시드 + S2 E2E 8개 — 대표님 직접

## 노트
- **V4 수치 확정**: 카드 260 은 이상, 실적용 235 (stage 1240 / 5-col 물리 한계). `#tav-grid` override 에 `display:grid + repeat(auto-fill, 235px) + gap 10` + `.card-v4 width:235 !important`
- **Claude Design 파이프라인**: 대표님이 일러스트/아이콘 공급 → Claude Design 이 프레임/UI → 내가 적용·검증
- **CSS 디자인 금지**: 아이콘/프레임/색/그라디언트/효과는 대표님 공급, 내가 CSS 로 직접 만들지 않음
