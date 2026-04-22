# 가비지 정리 실행 로그 (2026-04-22)

> 근거: [`garbage_scan_2026-04-21.md`](garbage_scan_2026-04-21.md) 의 🔴 5건 중 안전 이동 가능 항목.
> git 비활성 저장소라 일반 `mv` 사용. trash 디렉토리: `game/trash/2026-04-22_garbage_r5/`.
> 회귀 검증: `node tools/test_run.js` → **11/11 PASS**.

## 요약

| 항목 | 대상 수 | 이동 크기 |
|---|---|---|
| img/_archive/ 구세대 PNG | 5개 | 19.77 MB |
| snd/_archive/ 원본 BGM | 1개 | 3.55 MB |
| mockup 폐기 시안 | 1개 | 16 KB |
| **합계** | **7개** | **약 22.4 MB** |

## 이동 내역

### 1. img/_archive/ (5건, 19.77 MB)

| 파일 | 크기 | 이유 |
|---|---|---|
| `bg_title_2026-04-19_archangel_master.png` | 2.92 MB | 2026-04-19 타이틀 세대 교체 후 참조 0 |
| `bg_title_2026-04-21.png` | 1.80 MB | 2026-04-21 타이틀 세대 교체 후 참조 0 |
| `bg_title_2026-04-21_v2.png` | 9.55 MB | QHD 재생성본, 현재 정본(3771) 으로 교체됨 |
| `bg_title_pre_2026-04-19.png` | 2.22 MB | 2026-04-19 이전 원본, 복귀 의사 없음 |
| `bg_title_wide_2026-04-21.png` | 2.36 MB | 파노라마 계획 폐기 |

**보존**: `bg_title_angel_2026-04-22_qhd_original.png` (17.05 MB), `bg_title_demon_2026-04-22_qhd_original.png` (14.99 MB) 는 오늘(2026-04-22) 생성된 QHD 원본이라 제외. 리포트 범위 밖.

### 2. snd/_archive/ (1건, 3.55 MB)

| 파일 | 크기 | 이유 |
|---|---|---|
| `title1_original_2026-04-11.mp3` | 3.55 MB | 대표님 "지겨워서" 교체, 복귀 의사 없음. SOURCES.md 의 "보존" 메모만 남은 상태 |

### 3. mockup/card_v4_top/ (1건, 16 KB)

| 파일 | 크기 | 이유 |
|---|---|---|
| `v2_editor.html` | 16 KB | V4 카드 상단 3안 중 v1 채택 완료. v2_editor 비채택본 |

## 리포트 #1, #2 현황 (이미 처리됨)

리포트의 🔴 #1 (`img/bg_title_angel.png`) 과 #2 (`img/bg_title_wide.png`) 는 **스캔 시점 이후 이미 다른 세션에서 처리됨**. `img/bg_title*.png` (루트) 는 전부 `game-legacy/` 또는 `design-system/assets/` 로 이동된 상태 (Glob 결과에 `game/img/bg_title*.png` 없음). 중복 이동 방지를 위해 건드리지 않음.

## 건드리지 않은 🟡 항목 (8건, 대표님 판단용)

리포트의 🟡 는 판단 애매 — 이번 세션에서 **제외**.

| # | 항목 | 크기 | 판단 필요 이유 |
|---|---|---|---|
| 6 | `mockup/frame_check/index.html` + `mockup/frame_wiring/index.html` | 7.7 KB | 프레임 재검증 시 재사용 가능성 |
| 7 | `mockup/v4_card/v1.html`, `v2.html` (v3 채택) | 30 KB | 비채택 시안, "3안 비교 규칙" 때문에 보존 가치 가능 |
| 8 | `mockup/protagonist_create/v1.html`, `v3.html` (v2 채택) | 14.8 KB | P6 이식 전 비교 참조 가능성 |
| 9 | `design/prototypes/town_editor.html`, `town_v1.html` | 24.5 KB | 타운 프로토타입 보존 관행 vs 미사용 |
| 10 | `design/prompts/_*.py` (6개) | 14 KB | 타운 재생성 시 재사용 — 🟢 보존 쪽 |
| 11 | 오래된 핸드오프 13개 (2026-04-13 ~ 16) | 150 KB | `handoff_archive_survey_2026-04-20.md` 에 아카이브 제안 있음. 대표님 검토 필요 |
| 12 | `design/autonomous_work_summary_2026-04-20.md` | 6 KB | 밸런스 A안 근거 — 🟢 보존 쪽 |
| — | `img/_archive/bg_title_{angel,demon}_2026-04-22_qhd_original.png` | 32 MB | 오늘(2026-04-22) 생성 QHD 원본. 스캔 리포트에 없던 신규 파일 |

## 되돌리기 명령

혹시 복원이 필요하면:

```bash
# 개별 복원 (예시)
mv c:/work/game/trash/2026-04-22_garbage_r5/img/_archive/bg_title_2026-04-21_v2.png c:/work/game/img/_archive/

# 전체 복원
mv c:/work/game/trash/2026-04-22_garbage_r5/img/_archive/*.png c:/work/game/img/_archive/
mv c:/work/game/trash/2026-04-22_garbage_r5/snd/_archive/*.mp3 c:/work/game/snd/_archive/
mv c:/work/game/trash/2026-04-22_garbage_r5/mockup/card_v4_top/v2_editor.html c:/work/game/mockup/card_v4_top/
```

## 회귀 위험

- **없음**: 7개 파일 모두 코드(`js/`, `css/`, `*.html`) 참조 0건 (grep 재검증 완료).
- 문서 참조는 `snd/SOURCES.md:29` (title1_original 보존 메모), `design/garbage_scan_2026-04-21.md` (리포트 자체) 2건 뿐. 둘 다 과거형 서술이라 파일 부재시 정보 가치만 약간 감소, 코드 영향 없음.
- **회귀 테스트**: `node tools/test_run.js` → 11/11 PASS (이동 후 실행).

## 증류된 교훈

### 스캔 리포트는 실시간 아니다 — 실행 전 재검증 필수

- **증상**: 리포트의 🔴 #1, #2 (`bg_title_angel.png`, `bg_title_wide.png`) 가 이미 다른 경로로 사라진 상태. 스캔 후 1일 간 다른 세션이 처리함.
- **원인**: garbage-cleaner 스캔과 이동 실행 사이 시차 동안 파일 시스템 변경. 병렬 세션 환경(tracks/)에서 특히 빈번.
- **예방**: 실행 전 **각 대상 파일 존재 여부 glob 재검증**. 리포트 항목 중 "이미 처리됨" 카테고리를 허용. 아직 존재하는 것만 이동.

### trash 디렉토리 관례는 `YYYY-MM-DD_<topic>` 형식 고정

- **증상**: 이번 세션에서 `trash/2026-04-22_garbage_r5/` 형식 선택 — 기존 `2026-04-19_cleanup`, `img_cleanup_2026-04-13` 관례 확장.
- **관례 확정**: `game/trash/<날짜>_<주제>/<원본경로그대로>` — 원본 경로(img/_archive, snd/_archive, mockup/...) 를 trash 하위에 그대로 미러링. 복원 시 상대경로 swap 만으로 복구 가능.

> 위 두 교훈은 "1회성" 이라 `08-garbage-lessons.md` append 대상 아님. 다음 정리 세션에서 재발 시 승격.
