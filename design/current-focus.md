# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투 리뉴얼) + Phase 2 콘텐츠 + **주인공 시스템 리뉴얼 (2026-04-21)**
**최근 세션**: 2026-04-21 저녁 — 타이틀 배경 QHD 업그레이드 (bg_title/bg_title_wide 모두 2560×1440 교체)
**마지막 커밋**: `ee82453` (원소 이펙트 mix-blend-mode). 미커밋 4파일: css/30_components.css · index.html · js/51_game_town.js · img/bg_title*.png
**유닛 수**: 51 일반 + 6 신 영웅 템플릿 · **스펠 44** (40→44) · 유물 12 / 회귀 11/11 PASS
**DS 레포**: https://github.com/chahongpil/realm-of-fates-design-system (private)

### 🎭 주인공 시스템 리뉴얼 진행도
- [x] **P1~P5** 이미지·데이터·mockup·청소·이펙트 레이어
- [x] **P6** Cockpit 시도 후 **롤백** → 기존 2단계(원소→역할) 유지 + 성별 토글 (🧔/👩) 추가
- [x] **P7** 최종 회귀 + 커밋 (`e1c4db5`)
- [ ] 🟢 **대표님 공급 대기**: 원소 이펙트 PNG 6장 (`img/elem_fx_*.png`)

### 🖥️ 뷰포트 · 타이틀 배경 확장 (2026-04-21 저녁 완료)
- [x] 전체화면 토글 (⛶ 버튼 + F 키 단축키, Fullscreen API)
- [x] 배경 확장 CSS 사전 연결 (`body.game-mode:has(#title-screen.active)`)
- [x] 타이틀 배경 3771×1684 (21:9 ultrawide) 교체 — 대천사 대군세 확장판. 양옆 여유 공간 덕에 center/cover 크롭에도 시각 누락 없음. 2560×1440 백업은 _archive/.

### 다음 작업 (우선순위)
- [ ] 🔴 **Step 5C Battle 옵션 확정** — A(Compact Variant) vs B(확대만 V4), A3(Focus), 9px 스탯 허용선, parch.desc (4건)
- [ ] 🔴 **이미지 작업 반영** (공급 시) — 유닛 P0 4장 / 스킬 B 10장 / effect 아이콘 14종 / gold 화염 스펠 신규
- [x] ~~Church z-index~~ — 이미 `#church-npc z-index:20` 설정 (css/42_screens.css:452). 2026-04-21 확인.
- [x] ~~Codex 5-col~~ — 이미 `#codex-tab --card-v4-w:235px` + `repeat(auto-fill,235px)` + `scrollbar-gutter:stable` (css/42_screens.css:395-422). 2026-04-21 확인.
- [ ] 🟡 **B3 `!important` 정리** — index.html 6곳 인라인 `style="display:flex..."` → CSS 이관. 구조 변경 수준 낮지만 **대표님 동의 필요** (동시 변경 시 카드 그리드 리스크).
- [ ] 🟡 **역할 5종 분화 결정** — 현 3종 → DS 5종 전환 (51 유닛 재분류 영향)
- [x] ~~11_data_units.js 주석 카운트~~ — 이미 BRONZE(13)/SILVER(15)/GOLD(9)/LEGENDARY(10)/DIVINE(4) 로 정확. 2026-04-21 확인.

## 막혀있는 것
- 📌 Supabase 봇 시드 + S2 E2E 8개 — 대표님 직접

## 노트
- **테두리 등급별 차등화 (B-2)**: bronze 2 / silver 3 / gold 3 / leg 4 / divine 4 + 이중글로우 (rules/05-design-direction.md)
- **SFX 자동 mute**: iframe / webdriver / `?mute=1` / `localStorage.rof8_mute` / UA 5중. 테스트 시 URL 에 `?mute=1` 필수.
- **P6 교훈**: 1화면 Cockpit 레이아웃은 1280×720 뷰포트에 본질적으로 안 맞음. 시각 검수 건너뛰면 큰 시간 낭비 (이번 세션 실증).
- **Claude Design 파이프라인**: 대표님이 일러스트/아이콘 공급 → Claude Design 이 프레임/UI → 내가 적용·검증
- **CSS 디자인 금지**: 아이콘/프레임/색/그라디언트/효과는 대표님 공급, 내가 CSS 로 직접 만들지 않음
