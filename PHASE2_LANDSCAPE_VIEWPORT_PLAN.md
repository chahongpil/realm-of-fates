# PHASE 2 — 가로 뷰포트 고정 기획서 (Landscape Viewport Lock)

> 작성: 2026-04-12 (원 세로 기획서 대체)
> 담당: 메인 (구현 + 유지)
> 근거: 사용자 확정 결정 — **1280×720 가로 고정, 되돌리지 않음**

---

## 🔒 최종 확정 사항

| 항목 | 값 |
|---|---|
| **베이스 해상도** | **1280 × 720 픽셀** |
| **비율** | **16:9 (HD / 720p)** |
| **방향** | **가로 (Landscape)** |
| **스케일링** | `transform: scale(Math.min(vw/1280, vh/720))` |
| **캔버스** | `.game-root { width:1280px; height:720px }` — 고정, 변경 금지 |

**이 결정은 앞으로 변경되지 않는다.** 이전에 논의됐던 390×844 세로, 480×xxx 스플래시 등의 기준은 전부 폐기.

---

## 1. 왜 1280×720 인가

### 업계 표준
- **HD/720p** — Steam 최소 요구 해상도, 모든 모니터 호환
- **16:9 완벽 비율** — PC 모니터 99% + 게임 콘솔 + 모바일 가로 (iPhone 844×390 ≈ 19.5:9 는 약간 레터박스)
- **카드게임 레퍼런스** — Slay the Spire, Balatro, Monster Train, StS2 전부 가로 720p 기본
- **스케일 깔끔** — 1920×1080 에서 1.5배, 2560×1440 에서 2배

### 우리 장르와 맞음
RoF 는 **로그라이크 덱빌더 + 카드 배틀러**. 이 장르는:
- 전투가 본질적으로 가로 배치 (적 위 / 아군 아래)
- 손패가 가로 부채꼴
- 유물·HUD 가 상·하·측면
- 마우스/터치 겸용 작동

세로 모바일은 Hearthstone / Marvel Snap 같은 PvP CCG 에 맞는 포맷. RoF 는 다름.

---

## 2. 기술 구현 — 현재 상태

### 이미 구현 완료
- `js/99_bootstrap.js` `viewportBoot()` IIFE:
  - `wrapGameRoot()`: DOM 로드 후 body 자식을 `.game-root` 로 런타임 래핑 + `body.game-mode` 클래스
  - `fitViewport()`: `Math.min(vw/1280, vh/720)` 계산 후 `transform: scale()` 적용
  - resize/orientationchange 리스너
- `css/00_reset.css`:
  - `body.game-mode` — 검은 배경, flex 중앙 정렬, overflow hidden
  - `body.game-mode .game-root` — 1280×720 고정, `transform-origin: center`
- `css/10_tokens.css`:
  - `--viewport-w: 1280px`, `--viewport-h: 720px`
- `css/20_layout.css`:
  - `.screen` — `position: absolute`, `width: 100%`, `height: 100%` (= game-root 기준)
- `css/42_screens.css`:
  - `body.game-mode .*` PC-scale 기본값 규칙 (폰트, 버튼, 카드, 모달 등 50+개)

### 수정/폐기 사항
- ❌ `height: 100vh` / `width: 100vw` — **금지**. 항상 `100%` (= game-root 기준) 사용
- ❌ `max-width: 1200px` 같은 개별 화면 폭 제한 — 불필요 (.game-root 가 이미 1280 고정)
- ❌ `@media(min-width:1024px)` — **사용 금지**. 게임 캔버스가 항상 1280 이므로 뷰포트 기반 반응형 무의미. 대신 `body.game-mode .*` 로 스코프.
- ❌ "스플래시 480 / 게임플레이 1200" 이원 정책 — 폐기
- ❌ 세로 390×844 기획 (`PHASE2_PORTRAIT_VIEWPORT_PLAN.md`) — 이 문서가 대체

---

## 3. 특수 케이스: 마을 맵

### 현 상태 (2026-04-12)
- 맵 에셋: `img/bg_town_v2.png` (848×1264 **세로** composed, design 폴더에서 이주)
- 좌표: `design/refs/town/slot_coords.json` 기반 BUILDINGS x/y % 변환 완료
- 랜더링: `.town-container` 가 `height:100%` + `aspect-ratio:848/1264` → 1280×720 안에서 **좌측 ~483×720** 차지
- 우측 ~797×720 은 **빈 공간** (사이드 패널 배치 예정)

### 향후 작업 (사용자 담당)
- **사용자가 가로 버전 맵 에셋을 재제작** (design 폴더에서 작업) → 교체
- 사이드 패널 UI 설계 (HUD, 유물, 퀘스트 등)
- 기획서 내 맵 관련 구 문서들 갱신

**주의**: 맵 관련 수정 시 사용자가 별도로 지시할 때까지 코드상 맵 레이아웃 건드리지 않는다.

---

## 4. 규칙 — 앞으로 개발 시

### 절대 금지
1. `100vh` / `100vw` 사용 — 항상 `100%`
2. `.game-root` 의 `width` / `height` 값 변경 — 고정
3. `@media(min-width:XXXpx)` 로 뷰포트 크기 분기 — 게임 캔버스는 항상 1280×720
4. `max-width: 1200px` / `1600px` 등 개별 화면 폭 제한 신규 추가
5. "모바일 전용" / "PC 전용" CSS 분기 — 단일 기준

### 필수
1. 새 화면 추가 시 `1280×720` 안에 전부 들어가도록 설계
2. 절대 위치 필요 시 `%` 로 (`.game-root` 기준 자동 스케일)
3. 폰트·버튼·모달 크기는 `body.game-mode .*` 또는 baseline 기본값 사용
4. `.screen` 은 `position: absolute` + `width:100%` + `height:100%` 유지

### 검증
- 창 크기 조정 시 스케일 자동 반응 확인
- DevTools Device Mode 에서 1920×1080 / 1280×720 / 844×390 (모바일 가로) 셋 다 OK
- `body.game-mode` 클래스가 제대로 붙는지 (에디터 페이지는 안 붙음)

---

## 5. 마이그레이션 결과

| 화면 | 상태 |
|---|---|
| title / login / signup / prologue | 🟢 PC-scale 복원 → 정상 |
| char-select | 🟢 CardComponent 이주됨 |
| menu (마을) | 🟡 세로 맵 + 우측 빈 공간 (사용자 예정) |
| tavern / deckview / castle / church / forge / shop / training | 🟢 flex 레이아웃 1280 에 자연 적응 |
| formation | 🟢 슬롯 그리드 |
| battle | 🟢 가로 레이아웃 본래 의도대로 |
| reward / gameover / upgrade / match / choice / pick | 🟢 모달 |

예상 잔존 이슈는 개별 화면 개별 수정으로 처리.

---

## 6. 이후 편집기 호환성

모든 화면 편집기(`tools/screen_editor_*.html`) 는 **1280×720 베이스**를 가정해야 한다:
- 좌표 편집기 (카드 프레임): 프레임 내부 % — 영향 없음
- 맵 편집기: 848×1264 맵 내부 % — 영향 없음
- 전투/편성/영웅선택 슬라이더 편집기: CSS 변수 — 값만 조정, 베이스 무관

---

## 7. 롤백 계획

이 기획서의 결정은 **되돌리지 않는다**. 하지만 기술적 비상시:
1. `.game-root { transform: none; width: auto; height: auto }` — 스케일만 해제 (원래 흐름)
2. `document.body.classList.remove('game-mode')` — 캔버스 모드 해제
3. 이상 2줄이면 임시로 pre-Phase2 상태 비슷하게 복구

---

## 8. 관련 파일

- [css/10_tokens.css](css/10_tokens.css) — `--viewport-w/h`
- [css/00_reset.css](css/00_reset.css) — `body.game-mode` / `.game-root`
- [css/20_layout.css](css/20_layout.css) — `.screen`
- [css/42_screens.css](css/42_screens.css) — PC-scale 기본값
- [js/99_bootstrap.js](js/99_bootstrap.js) — `wrapGameRoot` / `fitViewport`
- [.claude/rules/01-project.md](.claude/rules/01-project.md) — 고정 해상도 규칙 추가

---

**끝.**
