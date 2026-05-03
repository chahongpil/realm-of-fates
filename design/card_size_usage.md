# Card V4 — 사이즈별 사용처 매핑

> 2026-05-02 작성. `--card-v4-w` 토큰으로 카드 폭이 화면별로 다르게 설정됨.
> share(100) 폐기 후 **총 9 사이즈** 운영.
> Source of Truth: `css/10_tokens.css` (root default) + `css/32_card_v4.css` + `css/41_*.css` + `css/42_screens.css`.

---

## 한 눈에 — 9 사이즈 표

| 폭(px) | 높이(px) | 비율 | selector / 스코프 | 화면·용도 | 카드 클래스 |
|---|---|---|---|---|---|
| **160** | 280 | 4:7 | `body.game-mode #cardselect-screen #cs-grid` | 카드 선택 (영웅 선택 / 카드 픽업 등 4×2 그리드) | `.card-v4` |
| **172** | 248 | auto | `.card-v4.card-v4-compact` (default for compact) | (compact 변형 default — 주로 battle 시작점) | `.card-v4-compact` |
| **190** | ~332 | 4:7 | `body.game-mode #form-diamond .card-v4` | 진형 (formation) — 다이아몬드 5 슬롯 배치 | `.card-v4` |
| **210** | 290 | auto | `body.game-mode #battle-v2-container .card-v4-compact` (단 `.bcf-main-card .card-v4` 제외) | **전투 stage** (PHASE 3 시네마틱 — 5×2 = 10장 그리드) | `.card-v4-compact` |
| **235** | ~412 | 4:7 | `#tav-grid` / `#deckview-screen #deck-tab` / `#deckview-screen #codex-tab` / `#castle-screen #castle-upgrade-grid` / `#church-screen #church-grid` | 선술집 / 덱 / 도감 / 강화 / 교회 — **5-col grid 표준** | `.card-v4` |
| **260** | ~455 | 4:7 | `:root --card-v4-w` (default) + `#pick-grid` | **디자인 기본값** (override 없는 곳 + 카드 선택 picker) | `.card-v4` |
| **280** | ~490 | 4:7 | `body.game-mode #match-screen` | 매치메이킹 (1:1 vs 두 카드만) | `.card-v4` |
| **336** | 588 | 4:7 | `body.game-mode .dvf-main-card` | 덱뷰 카드 클릭 시 **확대 모달** (1.6배) | `.card-v4` |
| **378** | 522 | auto | `body.game-mode .bcf-main-card .card-v4-compact` | **전투 focus** — 캐릭터 클릭 시 무대 위 확대 (1.8배) | `.card-v4-compact` |

---

## 그룹화 (사실상 4 그룹)

| 그룹 | 사이즈 | 특징 |
|---|---|---|
| **미니** | 160 / 190 | 좁은 영역 (선택·진형) — desc 표시 |
| **표준 (5-col)** | 172 / 210 / 235 | 그리드 한 줄에 여러 장 (battle compact·battle stage·tavern 등). 이 셋 사이의 **35~63px 차이가 가장 모호** — 통합 검토 가능 |
| **큰** | 260 / 280 | 디자인 default + 매치 (강조) |
| **확대** | 336 / 378 | 클릭 시 강조 (1.6~1.8배) |

---

## 점진적 진화 이력 (왜 이렇게 됐나)

| 일자 | 사건 | 추가/변경 사이즈 |
|---|---|---|
| 2026-04-12 | 카드 V4 도입 | 260 (default) |
| 2026-04-20 | Step 4B (V4 5-col grid 양산) | 235 (tavern·deckview) |
| 2026-04-21 | B1 토큰화 (`--card-v4-w` 정착) | — |
| 2026-04-21 | Step 5C battle V4 이식 | 172 (compact), 378 (focus 확대) |
| 2026-04-22 | Phase 5 Step 4 share 미니카드 | ~~100 (share)~~ ❌ 2026-05-02 폐기 |
| 2026-04-23 | 전투 카드 원래 크기 복원 | 210 (battle stage v2 — 172→210) |
| 2026-04-** | 매치 화면 별도 폭 | 280 |
| 2026-04-** | 덱뷰 확대 모달 | 336 |
| 2026-04-** | 진형 다이아 슬롯 | 190 |
| 2026-04-** | 카드 선택 4×2 그리드 | 160 |

→ **점진적 추가**. 화면 추가될 때마다 적정 폭을 결정 → 토큰 박힘. 통합 검토 안 됨.

---

## elem_icon 좌표 (2026-05-02 사용자 편집기 결정값)

각 사이즈별로 사용자가 직접 드래그로 잡은 좌표. CSS 변수 + selector 스코프 적용 (`32_card_v4.css`).

| 폭 | bottom% | left% | size% | bottom px (실측) | size px |
|---|---|---|---|---|---|
| 160 | 53.93 | -1.25 | 18.75 | 151 | 30 |
| 172 (compact) | 26.21 | -1.74 | 18.60 | 65 | 32 |
| 190 | 45.48 | 0 | 18.42 | 151 | 35 |
| 210 (battle stage) | 23.10 | -1.90 | 18.57 | 67 | 39 |
| 235 (tavern+) | 37.38 | -1.70 | 18.72 | 154 | 44 |
| 260 (default) | 32.97 | -1.15 | 18.46 | 150 | 48 |
| 280 (match) | 30.82 | -1.43 | 18.57 | 151 | 52 |
| 336 (.dvf-main-card) | 25.68 | -2.68 | 18.75 | 151 | 63 |
| 378 (.bcf-main-card) | 12.45 | -2.65 | 18.52 | 65 | 70 |

**관찰**:
- **size %** 거의 일관 (18.42~18.75%) — 카드 폭의 ~18.6% 정사각
- **left %** 거의 일관 (-2.68~0%) — 카드 좌측 가장자리 살짝 밖 (-1~-2%)
- **bottom %** 폭 넓음 (12.45~53.93%) — 사이즈별 매우 다름. parch(양피지) 가 px 고정이라 카드 height 가 변할수록 상대 위치 다름. compact 카드는 parch 작음 → bottom 25% 안쪽, non-compact 큰 카드는 parch + desc 큼 → bottom 30~50%.

---

## 통합 가능성 검토 (보류 — 별도 리팩터)

**중복 후보**:
- 235 vs 260 (10% 차이) — `tavern` / `default` 통합 가능
- 210 vs 235 (12% 차이) — battle stage 와 tavern 통합 검토
- 160 vs 190 (16% 차이) — cardselect 와 formation 통합 검토

**권장**: 5 사이즈로 정리 — 미니(170) / 표준(230) / 큰(280) / 확대1(340) / 확대2(450). 단 **현재 운영 안정** 이라 굳이 리팩터 안 해도 됨. 향후 디자인 시스템 정비 시 검토.

---

## 카드 내부 요소도 비례화 검토 (별도 작업)

`.card-v4` 내부 요소 (`.name`, `.lv`, `.parch padding`, `.bars`, `.shield-badge`) 가 **px 고정**. 큰 카드(378) 에서 폰트가 상대적으로 작아 보임 (172 카드의 5.8% → 378 카드의 3.7%, 약 35% 작아 보임).

**해결안 후보**:
- A. CSS calc 변수 (`--card-scale`) — 한 번에 전체 비례
- B. container query (`cqw`)
- C. 사용처별 명시 override

(상세는 사용자와 결정 후 별도 phase 로 진행)

---

## 참조

- `css/10_tokens.css:540` — `--card-v4-w` root default
- `css/32_card_v4.css` — V4 컴포넌트 정본 + 사이즈별 elem_icon 좌표
- `css/41_battle_v2.css:78,83` — battle stage / focus 토큰
- `css/41_formation.css:13` — formation 190
- `css/42_screens.css:301,328,510,530,1549` — cardselect / tavern / pick / match / dvf 토큰
- `js/40_cards.js` — `CardV4Component.create()`
- 편집기: `c:/work/temp/elem_card_test/preview_multisize.html`
