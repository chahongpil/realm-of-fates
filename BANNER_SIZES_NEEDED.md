# 배너 에셋 — 필요 사이즈 목록

> 2026-04-13. 기존 `img/ui/banner_*.png` 11종은 모두 삭제. 35_banners.css 비활성.
> 아래 목록을 Gemini/Midjourney 로 새로 제작 후 `c:/work/game/img/ui/` 에 저장 + 35_banners.css 재작성.
> **베이스 해상도 1280×720 (16:9 가로). 모든 사이즈는 이 캔버스 기준 픽셀.**

## 우선순위 P0 (게임 기본 동작에 직접 노출)

| # | 파일명 | 권장 사이즈 (px) | 비율 | 용도 | 적용 셀렉터 |
|---|---|---|---|---|---|
| 1 | `banner_hud_bar.png` | **1280×80** | 16:1 | 화면 상단 HUD 가로 바 (이름/스탯/리그) | `.hud`, `.town-hud` |
| 2 | `banner_screen_title.png` | **640×96** | 6.7:1 | 화면 타이틀 가로 스크롤 | `.char-select-title`, `.form-title`, `.upgrade-title`, `.choice-title`, `.reward-title`, `.pick-title` |
| 3 | `banner_modal_box.png` | **520×440** | 1.18:1 | 일반 모달 사각 액자 | `.modal-box` |
| 4 | `banner_auth_box.png` | **520×520** | 1:1 | 로그인/가입 큰 사각 액자 | `.auth-box` |

## 우선순위 P1 (자주 노출되지만 최소 동작은 됨)

| # | 파일명 | 권장 사이즈 (px) | 비율 | 용도 | 적용 셀렉터 |
|---|---|---|---|---|---|
| 5 | `banner_panel_wide.png` | **720×96** | 7.5:1 | 출정 편성 패널 / NPC 대화 | `#cs-selected`, `#cs-relics-selected`, `.tut-box`, `.npc-bar` |
| 6 | `banner_modal_small.png` | **400×320` | 1.25:1 | 작은 모달 / 장비 모달 | `.modal-box.modal-small`, `.equip-modal-box` |
| 7 | `banner_tab_bar.png` | **720×80** | 9:1 | 탭바 (선술집/덱뷰/성) | tav-tabs / dv-tabs / castle-tabs 래퍼 |
| 8 | `banner_btn_strip.png` | **600×112** | 5.4:1 | 하단 버튼 바 / 타이틀 버튼 그룹 | `.title-buttons`, pick-screen 하단 |

## 우선순위 P2 (장식, 없어도 무방)

| # | 파일명 | 권장 사이즈 (px) | 비율 | 용도 | 적용 셀렉터 |
|---|---|---|---|---|---|
| 9 | `banner_info_plate.png` | **300×72** | 4.2:1 | 작은 정보 라벨 | `#cs-info`, `#tav-info`, `#church-info`, `#castle-upgrade-info`, `#upg-info`, `.char-select-sub`, `.form-sub` |
| 10 | `banner_medal_round.png` | **256×256** | 1:1 (원형 알파) | 원형 메달 프레임 | `.medal-frame` |
| 11 | `banner_sidepanel_tall.png` | **240×640** | 1:2.67 | 세로 사이드패널 | `.sidepanel-tall` |

## 제작 가이드라인

- **공통 톤**: 회색 돌판 + 어두운 금속 테두리 (block2 버튼 스킨과 동일 계열)
- **9-slice 가능 구조**: 네 모서리 장식, 가운데는 단순 텍스처 → CSS `border-image` 로 가변 폭 늘릴 수 있게
- **알파 채널**: 둥근 모서리/장식 부분은 투명, 직사각형 캔버스 가득 채우지 말 것
- **텍스트 영역 보장**: 중앙 60% 이상은 평탄한 면 (글자 가독성)
- **그림자 외부 여백**: 캔버스 가장자리에 4-8px 여백 (drop-shadow 잘림 방지)
- **`min-height` 기준**: 표 사이즈 그대로 쓰되 가로는 `background-size:100% 100%` 로 늘릴 예정. 세로 늘림은 화질 깨지므로 9-slice 권장.

## 제작 후 작업

1. `c:/work/game/img/ui/` 에 파일 저장
2. `c:/work/game/css/35_banners.css` 재작성 (이전 버전 [git history](../game/css/35_banners.css) 참고)
3. `/회귀테스트` 스킬로 화면 시각 확인
