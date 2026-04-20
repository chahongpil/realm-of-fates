# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투 리뉴얼) + Phase 2 콘텐츠 + **Design System V4 도입**
**최근 세션**: 2026-04-20 (7·8차 — 8차 = DS Step 4A/4B Tavern V4 적용 + 5-col grid 완료)
**마지막 커밋**: `8094996` feat(tavern): V4 5-col grid + 카드 폭 235 (Step 4B)
**유닛 수**: 58 유닛 / 회귀 9/9 PASS
**DS 레포**: https://github.com/chahongpil/realm-of-fates-design-system (private)

### 이번 세션(4/20 8차) 완료 — 3커밋 push
- [x] `fe04820` DS Step 1-3: 토큰 19종 + 폰트 확장 + V4 시안 3안 + infantry 교체
- [x] `681e102` Step 4A: Tavern V4 적용 (`.card-v4` + `mkCardElV4()`, Playwright v4=5/v2=0)
- [x] `8094996` **Step 4B**: 5-col grid + 카드 폭 235 (5번째 wrap 해소, 실측 rows=1)
- [x] `docs/art_queue_2026-04-20.md` — 58 유닛 매트릭스 + P0/P1/P2 9장 이미지 작업 추천
- [x] 보병 "양피지 배경" 건 확인 — 실측 톤 유사, 놔둠

### 다음 작업 (우선순위)
- [ ] 🔴 **P0 5건 결정** — dragon/archangel/lich/archmage/sniper 스탯 방향 (balance-auditor 재감사 예정)
- [ ] 🔴 **이미지 작업 P0 3장** (대표님) — 해적 수병 / 수도사 견습 / 해신 팔라딘
- [ ] 🟡 **V4 확장 화면 결정** — Collection / Deckview / Formation 중 어디 먼저?
- [ ] 🟡 **암흑의저격수 데이터 추가** — rarity 확정 후 (`source_art/units/암흑의저격수.png` 대기)
- [ ] 🟡 **역할 5종 분화 결정** — 현 3종 → DS 5종 전환 여부 (58 유닛 재분류 영향)
- [ ] 🟡 **effect 마커 재설계** — 대표님 작업 완료 시 파서/전투/데이터 3지점 동기
- [x] ~~`rules/04-balance.md` vs `design/balance.md` 수치 동기화~~ **2026-04-21 A안 완료**: design/balance.md 폐기, rules 정본화

## 막혀있는 것
- 📌 **암흑의저격수 rarity** — 일러스트는 공급됐으나 rarity/id 확정 대기
- 📌 **P0 5건** — dragon/archangel divine 미달, lich/archmage/sniper hp 미달
- 📌 Supabase 봇 시드 + S2 E2E 8개 — 대표님 직접

## 노트
- **V4 수치 확정**: 카드 260 은 이상, 실적용 235 (stage 1240 / 5-col 물리 한계). `#tav-grid` override 에 `display:grid + repeat(auto-fill, 235px) + gap 10` + `.card-v4 width:235 !important`
- **Claude Design 파이프라인**: 대표님이 일러스트/아이콘 공급 → Claude Design 이 프레임/UI → 내가 적용·검증
- **CSS 디자인 금지**: 아이콘/프레임/색/그라디언트/효과는 대표님 공급, 내가 CSS 로 직접 만들지 않음
