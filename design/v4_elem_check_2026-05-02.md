# 카드 V4 elem_icon 9 사이즈 시각 검수 (2026-05-02)

> rof-ui-inspector 자율 호출 결과 (사용자 외출 중).
> 검수 대상: `temp/elem_card_test/preview_size_check.html` (정본 CSS link + 9 사이즈 카드, game-mode body class).

---

## 결론: ✅ 통과

| 항목 | 평가 |
|---|---|
| 좌표 정확성 | 사용자 결정값과 ±0.1% 이내 일치 |
| selector 스코프 매칭 | 9/9 정확 |
| parch 충돌 | 0 건 |
| 사이즈 그룹 일관성 | 양호 |
| 블로커 | 없음 |

## 사이즈별 평가

| 사이즈 | 위치 | 충돌 | 균형 | 인지성 | 비고 |
|---|---|---|---|---|---|
| 160 (cardselect) | high | none | mid | high | 작은 카드 — elem 비중 큼 |
| 172 (battle compact) | high | none | mid | high | 동일 |
| 190 (formation) | high | none | mid | high | 동일 |
| 210 (battle stage) | high | none | high | high | **스윗스팟** — parch 바로 위 |
| 235 (tavern+) | high | none | high | high | **스윗스팟** |
| 260 (default) | high | none | high | high | 일러스트 핵심부 안 가림 |
| 280 (match) | high | none | high | high | 동일 |
| 336 (deckview 확대) | mid-high | none | high | high | left -2.68% 살짝 외부 |
| 378 (battle focus) | high | none | high | mid-high | 같은 원소 일러스트와 톤 약간 묻힘 |

## 좌측 음수 (-2.7%) 평가

336/378 의 `left: -2.65~-2.68%` = 실측 -9~-10px 외부.
카드 외곽선 1.5~2px 감안 시 elem_icon 의 **외측 1/3 정도가 카드 라인 밖**.

**평가**: **의도된 "배지·뱃지" 디자인 언어로 자연스러움**. CCG 류에서 등급/원소 마커가 외곽으로 살짝 나오는 건 흔한 강조 기법 (sigil pattern).

## 0502 네모프레임 (`elem_icon3`) vs 0502 원형 (`elem_icon2`)

| 항목 | 네모프레임 (icon3) | 원형 (icon2) |
|---|---|---|
| 카드 디자인과 기하 | ⭐ 일치 (직사각·parch 직선) | 약함 ("스티커" 처럼 떠 보임) |
| 좌하단 parch 윗선과 평행 | ⭐ 시각 안정감 | 부족 |
| 05-design-direction 통일감 | ⭐ 다크 석재 고딕 + 직선 모서리 | 부족 |

→ **네모프레임이 정답.** 정본 적용 (`elem_icon3_*`) 유지.

---

## 권장 후속 (별도)

1. ⚠️ **그리드 column-gap 검증** — `#tav-grid` (235) / `#cs-grid` (160) 의 column-gap ≥ 12px 유지 시 좌측 -1.7% 외부 노출이 인접 카드와 겹치지 않음. 현재 grid CSS 검증 필요.
2. ⚠️ **이미지 자산 sweep** — `holy_paladin.png`, `storm_archer.png` 등 일부 파일 누락 (검수 페이지에서 broken img). 이번 검수와 무관하나 별도 정리 필요.
3. 🟢 정본 적용 안정 → 추가 변경 없이 사용자 시각 확인만 권장.

---

## 검사 산출물 (스크린샷)

- `temp/elem_card_test/shots_size_check/full_v2.png` — 9 카드 전체 lineup
- `temp/elem_card_test/shots_size_check/case_3.png ~ case_8.png` — 210/235/260/280/336/378 단일 카드
- `temp/elem_card_test/shots_size_check/corner_5.png, corner_8.png` — 260/378 좌하단 줌
