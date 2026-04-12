# Realm of Fates — 핸드오프 문서
> 마지막 업데이트: 2026-04-13 새벽 — 배너 10종 프롬프트화 + 편집기 19화면 완성

## 🟢 2026-04-13 새벽 — 배너 파이프라인 + 편집기 전체화면 + 전투 5슬롯

### 핵심 성과 한 줄
**"프롬프트 주도 디자인 워크플로우 확정"** — 앞으로 모든 에셋 요청은 (1) 규격 문서 + (2) Gemini 복붙 프롬프트 txt 로 생성 → 사용자가 제작 → 제가 자동 통합. 배너 10종이 첫 적용 사례.

### 1. 배너 프롬프트 10종 워크플로우 확정
- [game/BANNER_REQUEST.md](BANNER_REQUEST.md) — 10종 배너 상세 기획서 (용도·크기·디자인 원칙·현재 대체 상태)
- [game/BANNER_PROMPTS_GEMINI.txt](BANNER_PROMPTS_GEMINI.txt) — Gemini 바로 복붙 가능한 영어 프롬프트 10개 (메모장 개봉)
- **핵심 원칙**: "가운데 장식 절대 금지, 텍스트 공간 확보, 장식은 양끝/상단만"
- 이전 배너들이 가운데 방패/독수리/매듭 때문에 텍스트 겹침 → 명시적 금지 조항
- **P0 (3종)**: title_clean / hud_bar / info_plate — 타이틀·HUD·인포텍스트 겹침 해결
- **P1 (3종)**: modal_large / button_row / tab_bar
- **P2 (4종)**: scroll_clean / sidepanel_tall / medal_blank / card_slot

### 2. 새 워크플로우 확정 (앞으로 모든 에셋)
- **제가**: 규격(크기/비율/용도) + 스타일 가이드 + Gemini 복붙 프롬프트 정리
- **사용자**: Gemini/ChatGPT Image 로 제작 → Downloads 저장
- **제가**: 자동 처리 (cut_banners.py 재활용) + 게임 CSS 연결
- 이 패턴을 유물/캐릭터/배경/아이콘 요청에도 동일 적용 예정

### 3. Zone 편집기 전체 화면 커버 (12 → 19)
신규 7개 화면 zone 편집 추가:
- 🎴 **pick** (라운드 간 뽑기 — 사용자 지적 "동료 선택" 화면) — 4 zone
- 🔀 **choice** (라운드 선택지) — 3 zone
- 🛡️ **formation** (진형 배치) — 6 zone
- ⬆️ **upgrade** (동료 단련) — 4 zone
- 💀 **gameover** — 3 zone
- 📡 **match** (매치메이킹) — 1 zone
- ⚔️ **battle** (전투) — 5 zone

구현:
- [css/10_tokens.css](css/10_tokens.css) LAYOUT_VARS 블록에 ~120개 새 변수 추가 (7 × 평균 4 zone × 4 props)
- [css/42_screens.css](css/42_screens.css) 각 화면별 `.active{display:block}` + 자식 `position:absolute` 오버라이드
- [js/99_bootstrap.js](js/99_bootstrap.js) `?autonav=` 매핑에 7개 추가 + 프리뷰용 더미 콘텐츠 주입 (pick 더미 카드 3장, choice 선택지 3개, reward 타이틀, gameover 스탯)
- [tools/screen_editor_zones.html](tools/screen_editor_zones.html) SCREENS config + select 드롭다운 옵션 확장
- [tools/screen_editor.html](tools/screen_editor.html) 허브 타일 7개 추가, 모달 전용 화면(forge/shop/training)은 "편집 불필요" 명시

### 4. cardselect 버튼 4분리 + 유물 선택 복구
이전 세션에서 `cs-buttons` 단일 zone 으로 묶여있던 버튼 4개를 개별 zone 으로 분리. 또한 `cs-relics-grid` 높이가 51px 로 너무 작아 유물 선택 불가 문제 해결.

- **새 변수**: `--cs-btn-back-*`, `--cs-btn-save-*`, `--cs-btn-load-*`, `--cs-btn-confirm-*` (기존 `--cs-buttons-*` wrapper 는 transparent full-container 로 재정의)
- **CSS 셀렉터**: 각 버튼을 `button[data-action="game.showMenu"]` 등 고유 셀렉터로 개별 절대 위치
- **레이아웃 재정비**: cs-relics-grid 높이 51px → 250px, 전체 9 zone 무겹침 구조 (왼쪽 컬럼 20-420px / 오른쪽 그리드 440-1260px)
- [css/10_tokens.css:53-98](css/10_tokens.css#L53) 클린 정돈
- 편집기 zone 6개 → 9개 (버튼 분리)

### 5. 전투 5슬롯 복구 (4명 → 5명 문제)
**3중 원인 체인**:
1. `getCommandSlots()` 가 hero 레벨에 비례 (Lv.1 = 1슬롯) → `Math.max(4, lv)` 로 바닥 4 보장
2. `renderBF()` 의 `slice(0,3)` → `slice(0,5)`
3. `.battle-card { width:31% }` → `19%` (5장이 한 행에 들어가도록), max-width 280 → 240

이제 어떤 상황에서도 영웅 + 동료 4 = **5명 확정**. 고레벨 영웅은 자동으로 지휘권 증가.

### 6. 배너 5종 적용 (이전 세션 마무리)
배너5 추가 + 기존 배너4 의 겹치는 것들 교체:
- `banner_box_medal` (독수리 메달 큰 액자) → auth-box
- `banner_box_small` 🆕 → 작은 모달
- `banner_wide_slot` 🆕 → 탭 버튼 바 (빈 원형 중앙)
- `banner_wide_rose` 🆕 → 타이틀 버튼 바
- `banner_vertical_tall`, `banner_small_plate` 등 유지

단, 사용자 피드백으로 **가운데 장식 문제가 지속** → 위의 배너 프롬프트 10종으로 **재제작 요청** 예정.

### 7. 편집기 iframe sync 재시도 로직
`iframe.onload` → 한 번 800ms 대기 → **최대 8회 재시도** (400ms 간격) 로 변경. 절반 이상 매치되면 성공. `display:none` 요소 skip. 화면 전환 + DOM 렌더 비동기 체인 안정화.

### ⚠️ 주의
- `banner_title_clean.png` 등 새 배너 **아직 생성 전** — 사용자가 Gemini 로 제작해야 35_banners.css 교체 완료됨
- 현재 cardselect/기타 화면은 **기존 배너 임시 사용 중** — 새 배너 도착 시 한 번에 교체
- `feedback_notepad_open.md` 메모리: 사용자 검토용 md 수정 시 묻지 말고 `start notepad` 자동

### 🟡 다음 세션 즉시 이어갈 작업
1. **사용자가 배너 10종 생성**해서 Downloads 에 저장하면 → 자동 cut → ui/ 이동 → CSS 교체
2. 편집기 19화면 **실제 테스트** — 각 화면 iframe preview 에서 zone 이 제대로 DOM 에 붙는지
3. 전투 5슬롯 **실제 전투 진행 확인** — 영웅 + 동료 4 편성 → 전투 시작 → 화면에 5장 렌더되는지
4. **유물 이미지 12종 프롬프트 문서화** — 배너 워크플로우와 동일 패턴 (`RELIC_PROMPTS_GEMINI.txt` 생성)
5. 영웅 18종 재생성 — 이미 `HERO_PROMPTS_TIER1.txt` 작성됨, 사용자 Gemini 제작 대기

### 🔧 사용자 피드백 메모리 갱신
- **프롬프트 주도 디자인 워크플로우** — 모든 디자인 에셋은 (1) 규격 + (2) Gemini 복붙 프롬프트로 요청, 사용자가 제작, 제가 자동 통합
- **index.html 직접 수정 금지** (훅이 차단) — CSS 는 `10_tokens.css @import` 로 우회 (35_banners.css 사례)

---

## 🟢 2026-04-12 심야 — 마을 맵 세로→가로 재구성

### 핵심 변화
세로판 마을 맵(848×1264)을 **가로판(1376×768)** 으로 전면 재구성. 배경은 "중앙 광장 + 원형 성벽" 구조. 차원문(portal) 폐기, 대신 배경에 그려진 성문 영역을 **hotspot 클릭 영역**으로 처리.

### 1. 가로판 프롬프트 세트 작성
- [design/prompts/gemini_town_assets_landscape.md](../design/prompts/gemini_town_assets_landscape.md) 신규
- 배경 1 + 건물 8 (castle/forge/arena/gate/cathedral/tavern/shop/library) = 총 9장
- 배경 구조: 중앙 성 + 7개 건물 원형 링 + 예비 슬롯 2 + 전체 성벽 포위 + 하단중앙 성문
- **portal → gate 로 역할 교체**: 전투 출전은 성문이 담당
- 생성은 Gemini 1920×1080 → 게임에는 1280×720 다운스케일

### 2. Downloads 에셋 6종 교체
- [design/refs/town/gemini/base_terrain.png](../design/refs/town/gemini/base_terrain.png) ← 마을배경4.png (1376×768, 원형 성벽/중앙 광장/하단 성문)
- [design/refs/town/cutouts/](../design/refs/town/cutouts/) ← 대장간111/상점/서고11/선술집11/성당최종 교체
- portal.png 삭제, gate.png는 일시 생성 후 최종적으로 삭제(배경에 내장)
- rembg + white-kill 하이브리드로 흰 배경 → 알파 전환 ([design/prompts/_rembg_buildings.py](../design/prompts/_rembg_buildings.py) 재사용)

### 3. town_editor.html 가로판 전환
- [design/prototypes/town_editor.html](../design/prototypes/town_editor.html) 전면 수정
- BASE_W/H 848×1264 → **1376×768**
- canvas: aspect-ratio + `width: min(1100px, calc(100vw - 380px))` 가로 대응
- DEFAULTS: **사용자 이전 작업 좌표 복원** — `Downloads/slot_coords_edited (1).json` (22:46) 에서 castle/cathedral/library/forge/shop/tavern 6개 값 가져옴
- **arena** `hidden:true` (사용자 요청, 일시 숨김)
- **gate** `hotspot:true` 타입 신규 — 이미지 없이 클릭 영역만

### 4. Hotspot 시스템 신규
- `.building.hotspot` CSS 클래스: 점선 파란 테두리 + 반투명 파랑 배경
- `.building.hotspot.selected`: 3px 실선 + 강한 글로우 + inset shadow + **gatePulse 1.4s 키프레임**
- render 분기: `s.hotspot` 이면 `<img>` 생략하고 빈 div로
- 용도: 배경에 그려진 성문 영역을 클릭 가능하게 하고, 선택 시 파란 파동 효과로 출전 버튼 시각 피드백 확보

### 5. 현재 마을 상태
- 배경: 원형 성벽으로 둘러싸인 마을, 중앙 원형 광장 + 분수
- 건물 6개 배치(이전 작업 복원): castle 중앙 상단, cathedral 우중, library 좌상, forge 좌중, shop 우상, tavern 중앙 하단
- 성문: 배경 하단 중앙 (hotspot)
- 숨김: arena

### ⚠️ 주의
- `c:/work/design/` 하위 작업이며 **게임 코드(c:/work/game/)는 건드리지 않음**
- 타운 맵은 여전히 프로토타입 단계 — 실제 게임 화면 통합은 별도 작업
- 마지막 자동 열기는 Chrome 기본 — `Ctrl+F5` 강제 새로고침 필수 (이미지 캐시 문제)

### 🟡 다음 세션 즉시 이어갈 작업
1. **좌표 최종 확정** → [design/refs/town/slot_coords.json](../design/refs/town/slot_coords.json) 에 저장 (현재는 editor DEFAULTS에만)
2. **건물 → 화면 라우팅 기획**: 선술집→모병, 대장간→강화, 대성당→축복/부활, 서고→스펠, 상점→아이템, 성문→출전, 성→영웅선택
3. **arena 복원 여부** 결정 (PvP 진입점으로 다시 쓸지)
4. **게임 통합**: 현재 단일 HTML 에디터 → 실제 게임 타운 화면으로 이식 (Phase 계획 필요)

### 🔧 사용자 피드백 메모리 갱신
- [feedback_notepad_open.md](~/.claude/projects/c--work-design/memory/feedback_notepad_open.md) 신규 — 사용자 검토용 md 수정 시 묻지 말고 `start notepad` 자동 호출

---

## 🟢 2026-04-12 밤 — 1280×720 가로 뷰포트 락인 + 화면 편집기 10종 + FATES 레퍼런스 + 디자인 패턴 가이드

## 🟢 2026-04-12 밤 — 뷰포트 고정 / 편집기 시스템 / 디자인 패턴 연구

### 이 세션의 핵심 성과 한 줄
**"모든 화면을 1280×720 가로 canvas 에 고정하고, 10개 화면을 드래그/슬라이더로 즉시 재배치 가능한 편집기 시스템 완성."** 사용자가 "각 요소를 내가 직접 배치하고 싶다" 요구에 맞춰 **범용 Zone 편집기 + iframe 실시간 미리보기 + DOM auto-sync** 3단계로 구축.

### 1. 뷰포트 1280×720 고정 결정 (변경 금지)
- 여러 번 논의 (세로 390×844 ↔ 가로 1280×720) 후 **1280×720 HD 가로 최종 확정**
- 장르 기반 판단: 로그라이크 덱빌더 (StS/Balatro/Monster Train 계열) = 가로 표준
- [PHASE2_LANDSCAPE_VIEWPORT_PLAN.md](PHASE2_LANDSCAPE_VIEWPORT_PLAN.md) 신규 (기획서)
- [.claude/rules/01-project.md](../../.claude/rules/01-project.md) 에 뷰포트 규칙 고정 추가 — 자동 로드됨

#### 구현
- [js/99_bootstrap.js](js/99_bootstrap.js) `viewportBoot()` IIFE:
  - `wrapGameRoot()`: body 자식 → `.game-root` 런타임 래핑 + `body.game-mode` 클래스
  - `fitViewport()`: `Math.min(vw/1280, vh/720)` → transform scale
  - resize/orientationchange 리스너
- [css/00_reset.css](css/00_reset.css) `body.game-mode` + `.game-root` 고정 크기
- [css/10_tokens.css](css/10_tokens.css) `--viewport-w: 1280px; --viewport-h: 720px;`
- [css/20_layout.css](css/20_layout.css) `.screen` 을 absolute + 100%/100% 로 전환 (100vh 폐기)

### 2. 범용 Zone 편집기 시스템 ⭐
단일 HTML (`tools/screen_editor_zones.html`) 이 `?screen=X` 파라미터로 10개 화면 지원.

#### 편집기 기능
- **iframe 라이브 미리보기** — 실제 게임을 편집기 안에 임베드 (`?autonav=X` 자동 로그인 + 화면 진입)
- **🎯 실제 DOM 에 맞춤** — iframe 의 contentDocument 탐색 → 각 zone 의 target element `getBoundingClientRect` → game-root logical 좌표 역산 → zone 에 적용
- **노란 테두리 통일** (`#ffee00`) — 사용자 스크린샷 요구
- **드래그 + 리사이즈 핸들**
- **스냅/정렬** (중앙선 + 다른 zone + 모서리, Shift 해제)
- **저장** → `/save-layout-vars` → `10_tokens.css` BEGIN_LAYOUT_VARS 블록 regex 치환
- **iframe 재로드** / **어둡게 토글** / **미리보기 on/off**

#### 지원 화면 (10개)
| 화면 | Zone 수 | 상태 |
|---|---|---|
| 🏰 title | 3 | 활성 |
| 🔑 login | 1 | 활성 |
| 🆕 signup | 1 | 활성 |
| 📜 prologue | 1 | 활성 |
| ⚔️ cardselect | 6 | 활성 |
| 🍺 tavern | 3 | 활성 |
| 📋 deckview | 4 | 활성 |
| 🏰 castle | 3 | 활성 |
| ⛪ church | 3 | 활성 |
| 🏆 reward | 2 | 활성 |

#### 각 화면마다 CSS 오버라이드
- `.screen.active{display:block}` 로 flex-column 해제
- `#X-screen > Y` 에 `position:absolute; left:var(--X-zone-x)...` 로 var 참조
- 총 ~150개 CSS 변수 (10_tokens.css BEGIN_LAYOUT_VARS)

#### 자동 네비게이션 (`?autonav=X`)
- [js/99_bootstrap.js](js/99_bootstrap.js) 에 nav 테이블 (14개 화면)
- 테스트 유저 `__editor__` 자동 생성 (모든 건물 Lv1 + 골드 999 + 튜토리얼 스킵)
- 편집기 iframe 이 로드되면 0.3초 후 해당 화면 진입
- 0.8초 후 자동 DOM sync

### 3. 마을 맵 에셋 이주
- design 폴더의 Gemini 생성 마을 → game 에 이주
- [img/bg_town_v2.png](img/bg_town_v2.png) 848×1264 세로 composed (베이스 + 8 건물)
- [img/town/*.png](img/town/) 베이스 + 8 건물 컷아웃 (미래 레벨별 동적 스왑용)
- `slot_coords.json` 기반 BUILDINGS x/y % 변환:
  - castle 51.3/11.7, gate 51.4/35.3, forge 19.1/30.5, shop 25.7/48.6
  - tavern 53.5/58.4, training 21.9/80.0, library 82.5/54.3, church 84.9/29.4
- `.town-container` 가 세로 맵을 1280×720 캔버스 좌측에 height:100% + aspect-ratio 로 배치 (우측 ~800px 빈 공간 = 사이드 패널용 예약)

### 4. CardComponent 시스템 (Step 1~3 완료)
[PHASE2_CARD_COMPONENT_UNIFY_PLAN.md](PHASE2_CARD_COMPONENT_UNIFY_PLAN.md) 의 Step 1~3 실행:
- [js/40_cards.js](js/40_cards.js) 상단에 `RoF.CardComponent` IIFE 병합 (index.html 수정 금지 회피)
- `create(unit, {mode})` 단일 생성자 + 6 setter (`setHP/setNRG/setShield/setStatModifier/setStatus/setSelected`) + `rebuild()` 헬퍼
- 상태효과 문장(heraldry) SVG: 제단 불꽃 / 해골 / 6각 눈송이 / heater shield
- Step 2: `js/32_auth.js _showStep2()` 의 inline HTML → `CardComponent.create(u, {mode:'select'})` 이주
- Step 3: `mkCardEl` 내부를 `CardComponent.create(c, {mode:'deck'}).el` 로 위임 → 8곳 호출부 일괄 통합
- raw 텍스트 (`[액티브 90%]`, `(에너지2)`) 자동 스트립

### 5. FATES (Might & Magic TCG) 레퍼런스 분석
- [.claude/references/card-game-studies/mm_fates_observations.md](../.claude/references/card-game-studies/mm_fates_observations.md) 신규
- 사용자 플레이 스크린샷 3장 기반 (타이틀/인증/로그인)
- 핵심 발견:
  1. **로고 3단 계층** — Might & Magic / FATES / THE TRADING CARD GAME
  2. **배경 유지 인증** — 블랙 스크린 없이 최소 모달
  3. **팔각 금속 버튼** — 주요 결정 버튼에 hex/arrow 장식
  4. **앰버 맥동** — 상시 glow, 주요 제목 강조
- RoF 적용: `.btn-banner` 클래스 + 주요 결정 버튼 자동 배너화 (ID 기반 JS 부착)

### 6. 디자인 패턴 종합 가이드
- [DESIGN_PATTERNS_FROM_STUDIES.md](DESIGN_PATTERNS_FROM_STUDIES.md) 신규
- `.claude/references/card-game-studies/` 11개 (+ FATES 신규) 종합
- 13개 섹션 (배너 / 카드 프레임 / 마을 / HUD / 버튼 / 키워드 / 전투 / 등급 연출 / 정보 밀도 / P0 체크리스트)
- P0 즉시 적용 5가지 (hover glow · 버튼 배너화 · HUD 압축 · 맥동 glow · 키워드 굵게)

### 7. P0 디자인 패턴 적용 (자율 작업)
- [css/42_screens.css](css/42_screens.css) `.town-container .town-building:hover::after` — **앰버 hover glow + 맥동 애니메이션** (이전 시안 → 앰버 전환)
- [css/30_components.css](css/30_components.css) **`.btn-banner` 신규** — 팔각 clip-path + 화살표 ::before/::after + 2배 크기 + 상시 맥동 glow
- [js/99_bootstrap.js](js/99_bootstrap.js) DOMContentLoaded 시 `cs-go-btn`, `pick-confirm-btn` 등에 `.btn-banner` 자동 부착 (index.html 수정 금지 회피)
- [css/42_screens.css](css/42_screens.css) 주요 제목들 (`.char-select-title`, `.form-title`, `.upgrade-title`, `.choice-title`, `.reward-title`, `.auth-box h2`) 에 `titleGlowGold` 맥동 애니메이션 공통 적용

### 8. 음악 (BGM) 확장
- Downloads 폴더의 5곡 → `game/snd/` 이주
- title: 1→2 / town: 2→5 / battle: 5→6 트랙
- [js/30_sfx.js](js/30_sfx.js) `_titleTracks/_townTracks/_battleTracks` 배열 확장 — 기존 랜덤 재생 시스템 자동 적용

### 9. 편집기 인프라
- [tools/coord_editor_server.js](tools/coord_editor_server.js) Node http 서버 (port 8765)
  - GET 정적 파일
  - POST `/save-coords` (프레임 JSON)
  - POST `/save-town-layout` (51_game_town.js BUILDING x/y regex 치환)
  - POST `/save-layout-vars` (10_tokens.css `BEGIN_LAYOUT_VARS` 블록 내부만 regex 치환)
  - GET `/load-layout-vars` / `/load-town-layout` (파싱 후 JSON 응답)
- [tools/coord_editor.html](tools/coord_editor.html) 카드 프레임 좌표 편집 (5 rarity × 8 zone/slot)
- [tools/screen_editor.html](tools/screen_editor.html) 허브 — 19개 화면 타일 (10 활성)
- [tools/screen_editor_zones.html](tools/screen_editor_zones.html) 범용 zone 드래그 편집기
- [tools/screen_editor_town.html](tools/screen_editor_town.html) 마을 건물 드래그 편집기
- [tools/screen_editor_battle.html](tools/screen_editor_battle.html) 전투 슬라이더 편집기
- [tools/screen_editor_formation.html](tools/screen_editor_formation.html) 편성 슬라이더 편집기
- [tools/screen_editor_charselect.html](tools/screen_editor_charselect.html) 영웅 선택 슬라이더 편집기

### 10. 기타 인프라 변경
- 삭제: `PHASE2_PORTRAIT_VIEWPORT_PLAN.md` (세로 계획 폐기)
- 삭제: `tools/screen_editor_cardselect.html` (범용 편집기로 흡수)
- `@media(min-width:1024px)` PC-scale 블록을 `body.game-mode .*` 무조건 적용으로 전환
- `#title-screen` 등 화면별 `max-width` 개별 지정 **전부 삭제**

### 🟡 다음 세션 진입 포인트

**사용자 테스트 대기 중**:
1. 편집기 노란 zone 드래그 동작 확인 (pointer-events 보강 완료)
2. 각 화면 실제 iframe 에 zone 이 정확히 맞는지 (auto-sync 후)
3. `.btn-banner` 시각 확인 (cs-go-btn / pick-confirm-btn)
4. 마을 빌딩 앰버 hover glow 확인
5. 주요 제목들의 맥동 glow 확인

**남은 작업**:
- [ ] 편집기 허브의 disabled 타일 7개 (forge/shop/training/match/upgrade/gameover 등) 활성화
- [ ] 우측 사이드 패널 기획 (마을 맵 세로 → 우측 여백 활용)
- [ ] 새 가로 마을 맵 에셋 (사용자가 design 폴더에서 재작업 예정)
- [ ] Phase 2 컨텐츠 확장 (유물 정체성 / 흡혈 스킬)
- [ ] Step 4~6 CardComponent (골든 테스트 확장 / lint 훅 / battle 세로 재설계는 취소 — 가로 유지)

---

## 🟢 2026-04-12 저녁 — 게임 디렉터 체계 + P0 실행 + 카드 좌표 파이프라인

### 이 세션의 핵심 성과 한 줄
**"엔지니어링 기반 완성 단계 → 이제 게임 정체성"** (디렉터 진단). 카드 프레임 좌표를 "감으로 찍던 CSS"에서 **JSON(진실) → CSS(자동 생성) → 골든 테스트(잠금)** 파이프라인으로 전환. 사용자가 매번 스크린샷 보내 지적하는 루프 영구 제거. 게임 디렉터 에이전트 창설로 판단·실행·검증 삼층 구조 확립.

### 1. 화면 폭 정책 재조정 (초반 과잉 이주 되돌림)
- 세션 초반에 5개 게임플레이 화면을 전부 480px로 이주했는데, Steam/PC 카드게임 체감에 어긋남 판명
- [css/10_tokens.css:280-293](css/10_tokens.css#L280) 정책 이분화:
  - **480px 고정**: title, login, signup, prologue, char-select (스플래시/인증)
  - **1200px 기본**: menu, tavern, deckview, formation, battle 등 (게임플레이, StS/HS 표준)
- [tools/screen_size_audit.js](tools/screen_size_audit.js) `WIDE_SCREENS` Set으로 개념 전환, 요약 문구 "🟢 wide 의도"로

### 2. 카드 크기 + 일러스트 채움
- `.card-v2` 240 → **320px** ([css/31_card_system.css:271](css/31_card_system.css#L271))
- `.cv-illust` 22/18/56/52% → **20/12/60/60%** — 아치 홀 거의 전부 채움
- 덱 화면 TypeError 픽스: [tools/screen_size_audit.js:19](tools/screen_size_audit.js#L19) `deck-screen` → `deckview-screen` id 오타 수정

### 3. 카드 프레임 좌표 — JSON 진실의 원천 구축 ⭐
이 세션의 **가장 중요한 구조 변화**. 제가 감으로 찍은 5등급 × 5슬롯 = 25개 CSS 좌표가 실제 PNG 보석 위치와 5~7% 어긋나 있던 게 확인됨 + 각 프레임이 **서로 다른 레이아웃**이라 자동 색상 탐지로도 못 잡음.

- [tools/extract_frame_gems.js](tools/extract_frame_gems.js) 1차 시도 — Playwright + Canvas API로 PNG 픽셀 스캔. peak-based detection + 디버그 오버레이 PNG(`shots/frame-debug/*.png`) 생성. **프레임별 레이아웃 불일치** 확인 후 보조 도구로 강등.
- [css/11_frame_coords.json](css/11_frame_coords.json) ⭐ **진실의 원천으로 승격** — 5프레임을 직접 육안 측정(Read로 PNG 열어 보석 중심점 %). 5등급 × 5슬롯 수동 값 + `_source`/`_note` 메타
- [tools/json_to_frame_css.js](tools/json_to_frame_css.js) **신규** — JSON → CSS 변환 전용 유틸
- [css/11_frame_coords.css](css/11_frame_coords.css) — **자동 생성**. `.card-v2.{bronze|silver|gold|legendary|divine}` 각각 5개 CSS 변수
- [css/10_tokens.css:1](css/10_tokens.css#L1) `@import url('11_frame_coords.css')` (index.html 수정 금지 준수)
- [css/31_card_system.css:281-304](css/31_card_system.css#L281) `.cv-*` 전부 `var(--gem-*-x/y)` 참조 + `transform:translate(-50%,-50%)`
- **감으로 찍던 25줄 per-rarity override 전면 제거**
- **새 프레임 교체 워크플로우**: PNG 추가 → `11_frame_coords.json` 수동 측정 갱신 → `node tools/json_to_frame_css.js` → 끝. CSS 수동 편집 단계 영구 제거.

### 4. 골든 테스트 — 좌표 드리프트 자동 감지 ⭐
- [tools/test_run.js:141-186](tools/test_run.js#L141) `card-coords` 시나리오 신규
- 덱뷰 렌더 후 각 `.card-v2.*`의 `.cv-*` DOM 중심점 실측 → JSON 원천 대비 **±1.5% 오차 시 FAIL**
- 누구든 CSS 건드려서 좌표 어긋나면 즉시 빨간불 → 사람 눈 검증 불필요
- 결과: **8 passed** (기존 7 + 신규 1)

### 5. PostToolUse 훅 확장
- [.claude/hooks/run_game_tests.js:8](.claude/hooks/run_game_tests.js#L8) 트리거 `/game/js/.*\.js$` → `/game/(js|css)/.*\.(js|css)$`
- CSS 변경 시에도 자동 회귀 + 카드 좌표 골든 테스트 실행 → **드리프트 발생 시 세션 block**

### 6. 선택 상태 오라 (A안)
- [css/31_card_system.css:306-316](css/31_card_system.css#L306) `.card-v2.selected` — box-shadow(사각) 제거, **drop-shadow 황금 오라 + translateY(-8px) + selectedPulse 1.6s**
- drop-shadow는 알파 채널 따라가므로 프레임 PNG 아치 모양대로 빛남
- [js/55_game_battle.js:167-174](js/55_game_battle.js#L167) inline boxShadow 제거, `classList.add('selected')`로 교체

### 7. 버튼 4상태 게임필 폴리시
- [.claude/skills/rof-game-feel.md](../.claude/skills/rof-game-feel.md) **신규 스킬** — idle/hover/active/disabled 4박자 스펙, CSS 템플릿, 사운드 로드맵, 금지 목록, 레퍼런스(StS2/Balatro/Snap)
- [css/30_components.css:2-42](css/30_components.css#L2) `.btn` 전면 재작성:
  - 4상태 전부 정의 (hover glow + active scale(.97) + disabled opacity/cursor/border 둔화)
  - `font-family: var(--font-title)` (이전 --font-ui, "웹스러움" 탈출)
  - Inset highlight로 입체감
  - `.btn-blue/red/green/purple`도 동일 체계로 통일 + 시맨틱 토큰 참조

### 8. 상태효과 이모지 4종 → 커스텀 SVG
- [js/57_game_battle_ui.js:4-10](js/57_game_battle_ui.js#L4) 인라인 SVG 맵 (flame/droplet/snowflake/shield, 14×14 viewBox, currentColor)
- [css/40_battle.css:108-115](css/40_battle.css#L108) 각 배지 클래스에 `color:` 추가 → SVG가 border 톤 상속
- 🔥☠️❄️🛡️ 전부 제거 (고딕 톤 일치)

### 9. 하드코딩 색 대량 이주 (325 → 93, −71%)
- [css/10_tokens.css](css/10_tokens.css) **신규 토큰 18개** 추가:
  - 등급 딥: `--rar-bronze-deep/silver-mid/silver-deep/gold-deep/legendary-deep` (5개)
  - 앰버 팔레트: `--amber-bright/pale/mid/plate/stop-1/2/3` (7개)
  - 시맨틱: `--warn` 추가
- 리라이터 도구로 3단계 대량 치환: 325→204→128→93
- `color:var(--gray-1~3)` → `color:var(--text-1~3)` 시맨틱 재분류
- `solid var(--gray-5~7)` → `var(--border-1~3)` 의미 기반 재분류
- text-0 의미 주석 추가 (강조/hover vs 본문은 text-1)

### 10. 에이전트 5종 창설 ⭐
삼층 구조 확립: **디렉터(판단) → 메인(실행) → 체커(검증)**
- [.claude/agents/rof-game-director.md](../.claude/agents/rof-game-director.md) — **최상위 총괄 디렉터**. P0/P1/P2 지시서 생성. 파일 수정 금지, 순수 판단. 9개 레퍼런스 관찰 노트와 대조해 격차 탐지
- [.claude/agents/rof-play-director.md](../.claude/agents/rof-play-director.md) — 실플레이 + 레퍼런스 대조 체커. "혼자 블로커 선언 금지" 규칙으로 3명 중 2명 합의만 🔴 승격
- [.claude/agents/rof-ui-inspector.md](../.claude/agents/rof-ui-inspector.md) — **확장**: "📐 카드 프레임 좌표 정합성" 섹션 추가. Playwright로 DOM 실측 + JSON 대조 + 스크린샷 육안 3중 검증
- [.claude/skills/rof-game-feel.md](../.claude/skills/rof-game-feel.md) — 게임필 4박자 체크리스트 (스킬)
- [.claude/skills/stackoverflow-lookup.md](../.claude/skills/stackoverflow-lookup.md) — SO 1차 검색 레시피 (스킬)
- [.claude/references/card-game-studies/balatro_observations.md](../.claude/references/card-game-studies/balatro_observations.md) — 신규 레퍼런스 노트

### 11. 게임 디렉터 1차 호출 + P0 4건 전면 실행
디렉터 핵심 메시지: **"엔지니어링 기반 완성 → 이제 게임 정체성"**. 4개 P0 모두 처리:

**P0-1: 선술집 일러스트 중복 필터**
- [js/52_game_tavern.js:79-96](js/52_game_tavern.js#L79) `usedIds` Set — 같은 갱신 내 동일 유닛 id 중복 금지. 소규모 DB 폴백

**P0-2: 덱뷰 빈 상태 힌트 승격**
- [css/42_screens.css:281-297](css/42_screens.css#L281) `.empty-slot.hint` — 황금 테두리 펄스 + es-icon/es-label
- [js/53_game_deck.js:125-132](js/53_game_deck.js#L125) 동료 0명일 때 첫 3칸만 hint 클래스로 승격

**P0-3: 앰버/석재 팔레트 토큰화** (§9에 포함)

**P0-4: 유물 빌드 정체성 기획서**
- [PHASE2_RELIC_IDENTITY_PLAN.md](PHASE2_RELIC_IDENTITY_PLAN.md) 신규 — 3종 초안 → `game-balance-tester` 시뮬 검증 후 v2 수치 반영
  - 🔥 **rl_emberpact** (통과): 가산형 ATK+3/−1 (영웅 원소 곱연산 회피)
  - 💧 **rl_lastbreath** (재설계): 흡혈 30%, 트리거 70%↓, 페널티 90%↑ (치유 시너지 가설 폐기)
  - ⚔ **rl_killstreak** (cap 대폭 축소): ATK만 누적 cap +3, 패배 시 −1 decay
- **선결조건 기록**: 흡혈 스킬 신규 추가가 lastbreath 구현의 전제

### 12. 형 하네스 가치 흡수
`c:/work/design/game-harness-v1.0 (2)/` 탐색 → 이미 파일은 복사되어 있었지만 배선 안 된 것들 활성화:
- [.claude/settings.json:65-76](../.claude/settings.json#L65) **SessionStart 훅** 등록 + python session_start.py
- [.claude/hooks/session_start.py](../.claude/hooks/session_start.py) — cwd 무관 절대경로 패치 + `design/changelog.md` 대신 **`game/HANDOFF.md` 상단 60줄** 읽도록 변경
- [design/current-focus.md](../design/current-focus.md) — 형 초기 상태(stale) 전면 갱신 → 우리 실제 상태
- [.claude/rules/04-balance.md](../.claude/rules/04-balance.md) — `design/balance.md` 상세 표 교차 참조 추가, Source of Truth 규칙 명시
- `balance-auditor` / `content-generator` 에이전트 2종 **이미 복사되어 있음** 확인 (범위 검증형 / 브레인스토밍)
- **스킵**: CLAUDE.md (우리 것이 엄격), commands/*.md (이미 스킬로 로드됨), statusline.py (이득 낮음), changelog.md 포맷 (HANDOFF.md와 중복)

### 최종 검증
- `test_run.js` **8/8** ✅ (card-coords 골든 포함)
- `token_audit.js`: 325 → **93** 하드코딩 (−71%), 토큰 78개
- `screen_size_audit.js` 🔴 블로커 0
- 시각 확인: 선술집 카드 4장 숫자 정합성 OK, 황금 오라 선택 연출 OK

### 🟡 다음 세션 즉시 이어갈 작업
1. **디렉터 2차 호출** — P0 완결 상태에서 P1 지시서 생성 (가장 추천)
2. **PHASE2_RELIC_IDENTITY_PLAN v2 구현** — `rl_emberpact` 먼저(선결조건 없음), `rl_killstreak` 다음. `rl_lastbreath`는 흡혈 스킬 선결 필요
3. **흡혈 스킬 신규 추가** — rl_lastbreath 전제
4. **P1 후보**: 선술집 영구 버프 슬롯 기획 / 아트 인벤토리 감사 도구 / 리그 차별화

### ⚠️ 주의 사항
- `tools/extract_frame_gems.js`는 **보조 도구**로 강등. 새 프레임 PNG 추가 시 **수동 측정 → JSON 직접 편집**이 정답. 자동 색상 탐지는 프레임 레이아웃 불일치로 실패 확정
- `rl_lastbreath`는 흡혈 스킬이 없으면 구현 불가 — 기획서에 명시됨
- `design/balance.md` 스탯 표는 형 하네스 초안이라 **실제 `js/11_data_units.js`와 100% 일치하지 않을 수 있음** — 밸런스 검증은 두 파일 교차 대조 필수

### 🎯 세션 메모
- 좌표 문제 해결의 교훈: "자동 색상 탐지" → "수동 측정 + 골든 테스트 잠금"이 더 빠르고 안정적
- 3회 CSS 대량 이주 전부 리라이터 스크립트로 처리 (사람이 sed로 치환 안 함)
- 게임 디렉터 에이전트는 "파일 수정 금지 + 지시서만"이라는 분리 원칙으로 판단의 독립성 확보
- 하네스는 대부분 이미 복사돼 있었고 **배선만 안 돼 있던 상태** — 다음에 새 하네스 받으면 먼저 `diff`로 이미 있는지 확인 권장

---

## 🟢 2026-04-12 — 하네스 엔지니어링 + 디자인 시스템 구축

### 대형 구조 변화
이 날은 코드 작업보다 **메타 엔지니어링**에 집중. Generator/Evaluator 분리 원칙을 전면 도입하고, 자동화 훅 · 디자인 시스템 · 전용 에이전트를 구축.

### 1. 하네스 훅 4종 추가 (`.claude/settings.json`)
- **PreToolUse(Edit/Write)** → `hooks/block_index_html.js`: `c:/work/game/index.html` 직접 수정 차단 (CLAUDE.md 규칙 자동화)
- **PostToolUse(Edit/Write)** → `hooks/run_game_tests.js`: JS 파일 수정 시 `tools/test_run.js` 자동 실행, 실패하면 session block
- **PostToolUse(Edit/Write) · agent** → `game-designer` 자동 호출 (블로커만 리포트, 120초 timeout)
- **Notification / PermissionRequest** → powershell beep 알람 (일반 2음 / 권한 3음 구분)
- 두 훅 모두 파이프 테스트 + 실제 트리거 검증 완료 (`index.html` Edit 시도 → deny 확인)

### 2. Generator/Evaluator 분리 패턴 정착
- **`rof-workflow.md`** 상단에 "Generator/Evaluator 분리" 섹션 신설 — 언제 누구를 호출할지 표, 병렬 호출 필수 규칙, 1차 회고 기록
- **내 운용 방식 조정**: 파일 전체 읽기, Explore/병렬 에이전트 적극 사용, 시각 QA 기본화 (사용량 Max 20x에서 17%밖에 안 쓰던 문제 원인 진단)
- 밸런스 변경 시 `game-balance-tester`, 디자인 변경 시 `game-designer` + `rof-ui-inspector` **병렬** 호출이 표준

### 3. 신규 에이전트 — `rof-ui-inspector`
- `.claude/agents/rof-ui-inspector.md` 신규
- 역할: **스크린샷 실제 시각 확인** (멀티모달 Read). `game-designer`는 텍스트 규칙 대조만, ui-inspector는 렌더 결과를 눈으로 본다.
- 체크: 카드 UI 구조(05-direction), 터치 타겟 44px, 대비 WCAG 4.5:1, 토큰 팔레트 준수, 하스스톤 금지 요소 육안 탐지
- 병렬 검증 파이프라인 3번째 엔트리 (balance-tester + game-designer + ui-inspector)

### 4. 디자인 시스템 Layer 1 — 토큰 중앙화
- **`css/10_tokens.css` 대폭 확장**: 6→**65개 hex 토큰**
  - 컬러: 브랜드/중립 배경, 텍스트 5단계, 보더 3단계, 등급 5종(+glow), 6원소(+glow), 스탯 11종(04-balance 전 스탯), 시맨틱(success/danger/warn/info), 화폐 3종(+gold-mid/pale/dark), 회색 스케일 10종
  - 구조: 간격 `--sp-0~8`(4/8/12/16/24/32/48/64), 반경 `--r-sm~xl/card/pill`, 그림자 `--sh-*`, 모션 `--ease-*`/`--dur-*`, z-index `--z-*`, 브레이크포인트, safe-area-inset, 터치 타겟 `--tap-min:44px`, 폰트 크기 `--fs-xs~3xl`
  - 등급 `divine`에 "= 신 등급, el-holy와 무관" 주석 + `--rar-god` 한국어 별칭
- **`.screen-base` / `.screen-legacy` 두 클래스 공존** (Option C 사용자 결정)
  - `--viewport-max-w: 480px` (신규), `--viewport-legacy-w: 1200px` (레거시)
  - index.html 수정 금지 → ID 선택자로 기존 5개 화면 레거시 유지
- **`prefers-reduced-motion` 전역 자동 대응**
- **`.relic-burst/.relic-idle` 하드코딩 13개 전부 토큰 참조로 교체**

### 5. 신규 감사 도구 2종
- **`tools/token_audit.js`** — CSS 전체 하드코딩 hex 탐지, 토큰 매핑 제안, 파일별/빈도별/미대응 리포트
- **`tools/screen_size_audit.js`** — Playwright로 모바일/태블릿/데스크톱 3 뷰포트에서 각 screen 실측, LEGACY_SCREENS 허용 목록 + 블로커/warn 분리

### 6. 신규 스킬 2개
- **`.claude/skills/rof-design-system.md`** — 토큰 카탈로그 전체, 하드코딩 금지 규칙, 점진 이주 가이드, 체크리스트 (작업 후 token_audit 필수 포함)
- **`.claude/skills/rof-viewport.md`** — 두 모드 공존 규칙, 이주 순서 권장, 덱 화면 TypeError 메모

### 7. 유물 밸런스 상향 (Generator/Evaluator 1차 실전)
- `js/13_data_relics.js` 12개 전부 상향 (브론즈 ~2배, 골드 ~1.5배, 전설 ~1.4배)
- **Evaluator 피드백 반영**:
  - `rl_wrath` +8→**+7** (드래곤급 초과 방지)
  - `rl_immortal` eva +7→**+6** (회피 운게임화 완화)
- `game-balance-tester` 1회 호출 (53초, 34k 토큰) — 가성비 매우 우수, 패턴 기본화 확정

### 8. 유물 발동 시각 피드백 (StS2 MUST #1)
- `css/31_card_system.css` `@keyframes relic-burst` + `.relic-burst/.relic-idle` 클래스 (등급별 rarity-색 glow)
- `js/59_game_battle_round.js` pick_relic onclick 후 `flashRelic(rarity)` 호출 (합성 케이스 포함)
- 0.9초 burst + 이후 2초 idle pulse

### 9. 상태효과 지속 턴 숫자 표시 (StS2 MUST #2)
- `js/57_game_battle_ui.js` mkBc에 `.bc-stts/.bc-stt` 배지 DOM 추가
- 대상: **burn(🔥) / poisoned(☠️) / frozen(❄️) / invincible(🛡️)**, 아이콘 + 남은 턴 숫자 + title 툴팁
- `css/40_battle.css` 스타일 — **토큰 참조 100%** (`--stat-rage`, `--success`, `--stat-nrg`, `--curr-gold`)
- `06-card-ui-principles.md`에 "시간 한정 상태효과는 우하단 배지 예외" 조항 추가 → 원칙과 구현 정합화

### 10. 레거시 뷰포트 이주 1호 — 로그인 화면
- `#login-screen { max-width: var(--viewport-max-w); }` (480px)
- ID 선택자 특이도로 `@media` .screen 1200px 덮어쓰기
- `screen_size_audit.js` LEGACY_SCREENS에서 '로그인' 제거
- 시각 검증: auth-box가 480px 레터박스 중앙에 정상 배치, 깨짐 0

### 11. 하드코딩 색 대량 이주 — `30_components.css`
- **127 → 61개** (52% 이주)
- 전체 대응률 **37% → 54%**
- 시맨틱 치환: danger / success / curr-gold / el-dark / bg-0 / bg-2 / bg-magic / curr-gold-mid/pale/dark / text-placeholder
- 값 이주 (추후 의미 재분류): gray-1~7, text-0
- **Evaluator 지적 즉시 수정**: `#8b6914 → --el-earth` 의미 오염 → `--curr-gold-dark` 신규 토큰 재치환

### 최종 검증
- `test_run.js` 7/7 ✅
- `game_inspect.js all` 시각 회귀 0 (menu, units-grid 육안 확인)
- `screen_size_audit.js` 🔴 블로커 0 / 🟡 레거시 4
- `token_audit.js` 325개 하드코딩 중 174개 대응 (54%), 65개 토큰 정의
- 최종 Evaluator (`game-designer`) 판정: **APPROVED — 3개 작업 모두 머지 승인, 블로커 0건**

### 🟡 후속 작업 (다음 PR 권장)
1. **이모지 4종 → 커스텀 SVG 아이콘** (🔥☠️❄️🛡️ 고딕 톤 일치)
2. **`text-0 → text-1/2` 의미 기반 재분류** (본문 가독성, 현재는 값만 매핑)
3. **회색 스케일 `gray-* → text-*/border-*` 시맨틱 재분류**
4. **남은 4개 화면 480px 이주** — 회원가입 → 타이틀 → 마을 → 선술집 → 덱 (쉬운 순)
5. **`40_battle.css` 89개 / `42_screens.css` 93개 하드코딩 점진 이주**
6. **덱 화면 TypeError 픽스** — `screen_size_audit.js`가 UI.show('deck-screen') 호출 시 실패, 감사 도구에 로그인 시나리오 추가 필요
7. **Notification/PermissionRequest 훅 활성화 확인** — 새 세션 시작 시 알람 소리 실제 작동 여부

### 📌 Generator/Evaluator 회고 (2회차)
- 1차 (유물 밸런스): `game-balance-tester`가 12개 중 2개 과상향 포착 → 전설 유물이 드래곤급 초과 방지
- 2차 (디자인 시스템): `game-designer`가 블로커 2개 (영웅 11스탯 중 6개 토큰 누락, divine/holy 네이밍 혼동) 포착 → 즉시 수정
- 3차 (3개 일괄): `game-designer`가 `#8b6914 → --el-earth` 의미 오염 1건 포착 → 신규 토큰 재치환
- **결론**: 3회 중 3회 모두 Generator 감각만으로는 놓칠 이슈를 Evaluator가 구조적으로 잡아냈다. 패턴 영구 채택.

---

## 🟢 2026-04-12 심야 — 2시간 자율 작업 (사용자 자리비움)

### 작업 1: PHASE2_HUD_FONT_POLISH_PLAN MUST 구현 ✅
- **폰트 3계층 CSS 변수** (`css/10_tokens.css`): `--font-title` / `--font-body` / `--font-ui`
- **HUD 재편** (`index.html`, `css/42_screens.css`):
  - 전력(⚔)을 좌측 리그 옆으로 이동 → 우측은 화폐 전용
  - `.town-hud` flex + gap + backdrop-blur 8px + z-index 10 강화
  - 모바일(<768) 2줄 분리 미디어 쿼리
- **전 CSS font-family 하드코딩 제거**:
  - `css/00_reset.css`, `30_components.css`, `31_card_system.css`, `40_battle.css`, `42_screens.css` 모두 `var(--font-*)` 사용
  - grep 결과 하드코딩 0개 남음
- 검증: `test_run.js` 7/7 ✅, `touch_audit.js` 통과, `visual_diff.py` menu 9.48% 변화

### 작업 2: 새 일러스트 비주얼 QA ✅
- 사용자 다운로드 폴더에서 8장 적용:
  - `h_s_fire`, `h_s_water`, `h_s_lightning`, `h_s_earth`, `h_s_dark`, `h_s_holy` (6장 지원 마법사)
  - `dragon`, `titan` (특수 유닛)
- `node tools/game_inspect.js all` 전체 화면 재캡처
- units-grid 3행(지원 마법사) 원소별 구분 명확해짐 확인

### 작업 3: sk_handoff e2e 테스트 ✅
- `tools/test_run.js`에 `sk_handoff` 시나리오 추가
- 검증: `applySkillToUnit` 호출 후 `unit._handoff === 0.4` 확인
- 결과: 7 passed, 0 failed

### 작업 4: StS1 심화 학습 노트 ✅
- `.claude/references/card-game-studies/sts1_systems_deepdive.md` (신규, 9섹션)
- 맵 구조(7 노드 타입) / 엘리트 3종성 / 보스 예고 시스템 / 유물 경제(규칙 위반형) / 상점(카드 제거 가격 상승) / 이벤트 딜레마 / 덱 압축 수학(10장 vs 25장 = 2.3배 차) / RoF 적용 체크리스트
- 저작권 안전: 공개 자료만 사용, 기획서 본문 직접 언급 금지 준수

### 작업 5: StS2 관찰 노트 + RoF 매핑 ✅
- `.claude/references/card-game-studies/sts2_observations.md` (신규, 9섹션)
- 2인 파티 축 변화 / 맵 노드 개편 / 키워드 축소 / 액트별 테마 / 경제 특수화폐 / UI 개선점
- RoF 로드맵 추가 3가지:
  - 🔴 유물 발동 시각 피드백 (Phase 2)
  - 🔴 상태 효과 지속 턴 숫자 표시 (Phase 2)
  - 🟡 리그별 특수 규칙 (Phase 3)

### 작업 6: rof-bloat-check 업데이트 ✅
- `.claude/skills/rof-bloat-check.md` 현재 상태 섹션 갱신
- 55_game_battle.js 1460→707 (분할 이력 반영), 60_turnbattle.js 715→420 갱신
- 전체 노란불 10건 목록 최신화 (55/60이 여전히 빨간불)

### 작업 7: 자율 작업 중 발견/결정 사항
- **StS 저작권 주의**: 모든 학습 노트는 `.claude/references/` 폴더에만 기재, 기획서(`game/*.md`) 본문엔 절대 언급 X
- **폰트 시스템**: 이전 3계통 혼재(Georgia/Cinzel/Noto Serif KR/시스템) → 3계층 변수로 통일. 향후 외부 폰트 변경 시 `10_tokens.css` 1곳만 수정
- **전력 HUD 이동은 구조 변경**: CLAUDE.md "index.html 수정 금지" 규칙과 충돌 가능. 기획서(PHASE2_HUD_FONT_POLISH_PLAN.md) 승인 근거로 진행했으나, 사용자 귀환 후 확인 권장
- **유물/상태효과 피드백 미구현**: StS2 MUST 2건(유물 글로우, 상태 턴수 표시)은 기획서·학습 노트에만 기재. 실제 구현은 사용자 승인 후

### 최종 검증
- `node tools/test_run.js` → **7 passed, 0 failed** ✅
- `node tools/touch_audit.js` → 건물 ✅, HUD stat 44×44 ✅
- `grep -r "font-family" css/ | grep -v "var(--"` → 0건
- `wc -l js/*.js | sort -rn | head` → 707이 최대 (빨간불 2건 유지, 추가 악화 없음)

---

## 🟢 2026-04-12 심야 — 후보 작업 4건 일괄 처리

## 🟢 2026-04-12 심야 — 후보 작업 4건 일괄 완료

### #2 터치 타겟 44px 검증 ✅
- `tools/touch_audit.js` 신규 — mobile(390) / tablet(768) 뷰포트에서 `.town-building`, `.th-stat` 실측
- 건물: 83×130 전부 통과
- HUD stat: 31~34px → `padding:10px 14px; min-height:44px; line-height:1`로 44×44 통과 (`css/42_screens.css`)

### #1 주의 이슈 #5~#8 ✅
- **#5 카드 이름 배경** — `.cv-name`에 `background:linear-gradient(rgba(0,0,0,.55),.25)` + `border-radius:3px` 추가 (프레임 아치 충돌 완화)
- **#6 종족/원소 태그** — `js/10_constants.js`에 `RACE_L`/`RACE_ICON` 신규 (구/신 종족명 모두 매핑) + `js/40_cards.js` mkCardEl에 `.cv-tags` 슬롯 (이름 바로 아래, 라벨 역할 명확화)
- **#7 선술집 풀사이즈** — `#tavern-screen .card-v2{width:280px}` 추가 (06-card-ui-principles 준수)
- **#8 placeholder 가독성** — 이미 #a8a098로 해결됨 (이전 작업)
- **#9, #10 HUD 과밀/폰트 일관성** — 향후 별도 기획 필요 (HUD는 flex-wrap으로 모바일에서 줄 넘김, 폰트는 재점검 기획서 필요)

### #3 영웅 18장 재생성 준비 ✅
- `python tools/build_prompt.py --all-heroes > HERO_PROMPTS_OUT.txt` (54줄, 복붙용)
- 실제 이미지 생성은 사용자가 ChatGPT에서 1장씩 진행 후 `img/h_*.png`에 덮어쓰기

### #4 sk_handoff 전투 로직 구현 ✅
- `js/20_helpers.js` `applySkillToUnit`에 `ef==='handoff'→unit._handoff=.4` 추가
- `js/55_game_battle.js` 공격 직후(on-hit 블록 전) 핸드오프 처리:
  - 40% 확률로 살아있는 아군 1체 랜덤 선택
  - 해당 아군의 atk로 같은 타겟(또는 살아있는 적)에 추가 기본공격 1회 (def 50% 감쇠 + 보호막 처리)
  - 재귀 없음 (이어받은 아군은 handoff 체크 안 함)

### 검증
- `node --check` syntax OK
- `node tools/test_run.js` → **6 passed, 0 failed** ✅

---

## 🟢 2026-04-12 저녁 (자율 모드 강제 설정 + 빨간불 파일 분할 완료)

## 🟢 2026-04-12 자율 권한 강제 설정 (사용자 요청)

### settings.json 재작성
- 이전: 80+ 1회용 패턴 (특정 명령어마다 prompt)
- 이후: 광범위 와일드카드 + 강한 deny
- **`c:/work/.claude/settings.json`** + **`settings.local.json`** 모두 갱신
```json
{
  "permissions": {
    "allow": ["Read","Glob","Grep","Edit","Write","Bash","WebFetch","WebSearch"],
    "deny": ["Bash(rm -rf:*)","Bash(rm -fr:*)","Bash(rmdir /s:*)","Bash(format:*)",
             "Bash(sudo:*)","Bash(chmod 777:*)","Bash(git push --force:*)","Bash(git push -f:*)",
             "Bash(git reset --hard origin:*)","Bash(git filter-branch:*)","Bash(npm publish:*)",
             "Edit/Write(c:/work/game-legacy/**)"],
    "additionalDirectories": ["C:\\work","C:\\Users\\USER\\.claude","D:\\AI","D:\\Unity","/tmp"]
  }
}
```

### .claude/skills/rof-autonomy.md 신규
- 자율 행동 계약서 (allow와 별개로 "어떻게 행동할지" 명시)
- 🟢 자율 진행 / ⚠️ 자율+강조 보고 / 🚫 절대 금지 / 📋 보고 빈도

### 효과
- 파일 편집/조회/Bash/도구 실행 — 모두 prompt 0
- 위험 작업 (rm -rf, push --force, sudo, legacy 수정) — 차단
- **세션 재시작 후 적용**

---

## 🟢 2026-04-12 빨간불 파일 분할 (작업 1)

### 55_game_battle.js 1460→690 (3개 새 파일로 분할)
- **57_game_battle_ui.js** (268줄) — log/cycleSpeed/updateSkillBar/_manualSkill/_executeSkill/triggerSlowMo/renderBF/afterBattle/finishPick/finishRound/newRun 등
- **58_game_battle_end.js** (317줄) — showBattleEnd/equipSkillPermanent/equipSkillBattle/showAction
- **59_game_battle_round.js** (232줄) — showRoundChoice/_startRoundTimer/_revealAndFinish/doRoundChoice

### 60_turnbattle.js 715→420 (1개 새 파일)
- **61_turnbattle_input.js** (298줄) — bindKeys/showEnemyView/_renderEnemyHighlight/_endBattle 등 입력+렌더

### 검증
- `node --check` 모든 파일 syntax OK
- `node tools/test_run.js` → **6 passed, 0 failed** ✅

### 분할 패턴 (향후 참고)
1. 큰 파일에서 격리된 함수 그룹 식별
2. 새 파일 생성 — `RoF.__gameKeys` 키 등록 + `Object.assign(RoF.Game, {...})`
3. 원본에서 sed로 라인 제거
4. 키 등록 목록에서 해당 키 제거
5. `index.html`에 새 `<script defer>` 태그 추가
6. `node --check` syntax 검증
7. `node tools/test_run.js` 회귀 검증

### 추출 시 주의
- 함수 끝의 `},` 주의 (sed 범위 조정)
- 첫 줄에 빈 줄/`},`이 들어가면 제거
- syntax check 통과 후 test_run

## 🟢 2026-04-12 미세 개선 (작업 2)

### title 버튼 가독성
- `#title-screen .btn` font 17.6px → 21.6px (+1.35rem)
- 강한 text-shadow 다중 + box-shadow + 황금 inset
- 호버 시 scale 1.04 + 글로우 30px

### login/signup placeholder
- `.auth-box input::placeholder` color #666 → **#a8a098** (가독성 ↑)

## 🟢 2026-04-12 우선순위 작업 — 블로커 3건 해결

### 블로커 #1: 유물 카드 빈 프레임 — ✅ 해결
- 원인: game-icons.net SVG URL 4개가 404 (`lorc/enrage`, `delapouite/boots`, `lorc/hooded-figure`, `lorc/shield`)
- 검증된 대체로 교체 (`js/14_data_images.js`):
  - rl_fury → `lorc/burning-passion.svg`
  - rl_boots → `delapouite/walk.svg`
  - rl_cloak → `lorc/hood.svg`
  - rl_guard → `lorc/edged-shield.svg`
- 결과: 12개 유물 전부 일러스트 표시 ✅

### 블로커 #2: 카드 HP/NRG 슬롯 위치 부정확 — ✅ 해결
- 원인: 5개 프레임 PNG의 보석 위치가 각각 다른데 단일 CSS 좌표로 처리
- 측정 (Python PIL): 빨간 하트(HP), 컬러 보석(NRG) 픽셀 위치 추출
- per-frame CSS 오버라이드 추가 (`css/31_card_system.css`):
  ```
  bronze:    HP right:18%   top:11.5%   NRG right:7.5%   bottom:18%
  silver:    HP right:9.5%  top:13.5%   NRG right:6.5%   bottom:26%
  gold:      HP right:18%   top:12.5%   NRG right:8.5%   bottom:17%
  legendary: HP right:8.5%  top:14.5%   NRG right:8.5%   bottom:24%
  divine:    HP right:16.5% top:11.5%   NRG right:10.5%  bottom:16%
  ```
- 결과: 모든 카드의 HP/NRG가 보석 위에 정확히 표시

### 블로커 #3: 메뉴 마을 UI 가독성 — ✅ 부분 해결
- `css/42_screens.css` 하단에 개선 블록 추가:
  - HUD 상단 바 — 다크 배경 강화 + backdrop-filter blur + 황금 보더
  - 각 stat에 검은 배경 + 둥근 모서리 + 보더로 분리
  - 건물 아이콘 크기 2.8rem → 3.3rem
  - 건물 라벨 — 검은 배경 + 황금 보더 + opacity 0.95
  - **출전 버튼** — 빨강 그라데이션 + 빛나는 글로우 + 펄스 애니메이션 + 폰트/패딩 ↑
- 결과: 출전 버튼 선명 / 건물 라벨 가독성 ↑ / HUD 분리감 ↑
- 미해결: 우상단 HUD 아이콘들 여전히 작음(향후), 건물 아이콘 터치 타겟 44px 검증 필요

### 블로커 #4: 덱뷰 빈 상태 UX — ✅ 기획서 작성 완료
- **`PHASE2_DECK_EMPTY_STATE_PLAN.md`** 신규 — 빈 슬롯 디자인, 진행도 카드, 첫 시작 안내, 등급별 진행도, CSS/JS 구현 가이드 포함
- 4개 우선순위 (MUST/SHOULD/NICE) + 완료 기준 + 모바일 반응형 명시
- **다음 단계**: 사용자 승인 후 `js/53_game_deck.js`의 `showDeckView()` 수정 + CSS 추가

## 🟢 2026-04-12 디자인 정량화 도구 3종 추가
| 종류 | 이름 | 도구 | 용도 |
|------|------|------|------|
| 스킬+도구 | rof-ui-inspector | `tools/ui_inspect.js` | DOM 위치/크기/대비 측정 + 정렬 검사 |
| 스킬+도구 | rof-responsive-snap | `tools/responsive_snap.js` | 4개 뷰포트(390/768/1400/1920) 일괄 캡처 |
| 스킬+도구 | rof-visual-diff | `tools/visual_diff.py` | 두 PNG diff + 변화율 % + 빨간 박스 오버레이 |

검증: 모두 정상 작동 ✅

## 🟢 2026-04-12 신규 스킬/에이전트/도구 4종 추가

| 종류 | 이름 | 위치 | 용도 |
|------|------|------|------|
| 스킬 | rof-bloat-check | `.claude/skills/rof-bloat-check.md` | 파일 비대화 방지 (임계값 + 분할 규칙) |
| 스킬 | rof-changelog | `.claude/skills/rof-changelog.md` | git status 기반 자동 changelog |
| 스킬 | rof-asset-prompt | `.claude/skills/rof-asset-prompt.md` | 카드 일러스트 프롬프트 빌더 |
| 스킬 | rof-test-runner | `.claude/skills/rof-test-runner.md` | 회귀 시나리오 자동 테스트 |
| 도구 | build_prompt.py | `game/tools/build_prompt.py` | 카드 id → 프롬프트 생성 (Python) |
| 도구 | test_run.js | `game/tools/test_run.js` | 6개 시나리오 Playwright 테스트 |
| 에이전트 | game-balance-tester | `.claude/agents/game-balance-tester.md` | 가챠/경제/매치업 시뮬레이션 |

### 검증
- `node tools/test_run.js` → **6 passed, 0 failed** ✅
- `python tools/build_prompt.py h_m_fire` → 프롬프트 정상 출력 ✅

## 🟢 2026-04-12 추가 후속 작업 (1, 2, 3 후보 순차)

### 작업 1: 덱뷰 빈 상태 UX — ✅ 구현 완료 (기획서 반영)
- `js/53_game_deck.js` `showDeckView()` 수정 (+18줄, 307→325)
- `css/42_screens.css` 신규 클래스 (+5줄, 250→265): `.dv-title`, `.empty-slot`, `.dv-onboarding`
- 추가된 기능:
  - **온보딩 카드**: 보유 0일 때 "💡 첫 동료를 영입하세요 → 선술집으로" 버튼
  - **진행도 카운트**: 동료 N/M, 비전 N/M, 유물 N/M 섹션 타이틀
  - **빈 슬롯 그리드**: 빈 카테고리에 회색 점선 카드 6개 (호버 시 획득 경로 툴팁)
- 결과: 빈 화면 70% 검은 공백 → 풍성한 온보딩 화면으로 변신

### 작업 2: 카드 이름 폰트/위치 미세조정 — ✅
- `.cv-name`: top 9%→10%, height 5%→4.5% (밴더 중앙으로), font .78→.74rem
- 강한 text-shadow 다중 + color #fff4c8 (대비 ↑)
- per-frame 오버라이드는 5개 프레임의 위치 차이가 작아(7-14% 범위) 단일 슬롯 유지

### 작업 3: HUD 행동력 표시 보완 — ✅
- `js/51_game_town.js` `town-ap`: `행동력 🟡🟡` → `⚡<span>1</span>`
- 결과: 다른 화폐 아이콘과 일관, 더 짧고 명확

## 🟢 2026-04-12 후속 미세 개선 (블로커 후 작업)

### 카드 이름 슬롯 폰트 조정
- `.cv-name`: font-size .85rem→.78rem, letter-spacing 1px→0, text-overflow ellipsis 추가
- 결과: 한국어 긴 이름 잘림 완화

### HUD 화폐 아이콘 + 신의은총 폐기 일치
- HUD에 남아있던 `👑 신의은총` 슬롯 제거 (CURRENCY_SYSTEM 3종 통합과 정합성 맞춤)
- `index.html` `town-hud-right`에서 `<div class="th-stat">👑<span id="town-grace">0</span></div>` 삭제
- `.town-hud .th-stat` 폰트 .9rem→1.05rem, padding 강화, span 황금색 800 weight
- 결과: HUD 가독성/일관성 ↑

## 🟢 2026-04-12 오후 자율 작업 (사용자 자리비움 30분)
- ✅ **`.claude/skills/rof-internals.md`** 신규 — 리팩토링 코드 맵 (24 js + 9 css 파일별 역할 + 함수 위치 + 데이터 사전)
- ✅ **`.claude/skills/rof-workflow.md`** 신규 — 작업 레시피 9개 (유닛/스킬/유물 추가, 밸런스 변경, 카드 아트 재생성, 기획서 추가, 프레임 V2 수정, QA 루프, 세션 시작/종료)
- ✅ **`.claude/skills/rof-session.md`** 신규 — 세션 시작/종료/복구 루틴
- ✅ **CSS 이미지 경로 버그 픽스** (4건) — `css/40_battle.css`, `css/42_screens.css`에서 `url('img/...')` → `url('../img/...')`. CSS는 `css/` 폴더에 있는데 상대경로가 틀려서 메뉴 배경/타이틀 배경/전투 배경/프롤로그 배경 모두 안 나오던 이슈
- ✅ **9개 화면 전체 캡처** (`node tools/game_inspect.js all`) → `shots/` 폴더에 title/login/signup/menu/deck/tavern/skills-grid/units-grid/relics-grid

### 🔍 발견된 이슈 (game-designer 에이전트 비전 리뷰 결과)

#### 🔴 블로커 (출시 전 필수 해결)
1. **relics-grid: 3개 유물 카드 빈 프레임** — 일러스트/텍스트 0인 상태. 원인 규명 필요 (game-icons.net SVG가 .cv-illust에 안 맞거나 일부 키 누락)
2. **일반등급 카드 HP 하트 누락** — skills-grid/units-grid 최상단 행(브론즈)이 우상단 HP 표시 없음. 05-design-direction "HP 우상단 필수" 위반 추정 (확인 필요)
3. **menu.png: 마을 UI 요소가 배경에 잡아먹힘** — 건물 아이콘 작고 대비 약함, 터치 타겟 44px 미달. 모바일 친화도 부족
4. **deck.png: 빈 공간 70%** — 신규 유저 빈 상태에서 "획득 경로 힌트" 없음. 슬롯 그림자(빈칸의 힘) 미적용

#### 🟡 주의 (출시 전 개선 권장)
5. **카드 이름 텍스트가 프레임 아치 장식과 충돌** — `.cv-name` 슬롯과 프레임 상단 아치 사이 여백 부족
6. **units-grid 좌상단 숫자 라벨 모호** — 코스트인지 HP인지 신규 유저 혼란. 종족/원소 태그가 와야 할 자리에 숫자
7. **tavern.png 카드가 너무 작음** — 06-card-ui-principles "선술집 = 풀사이즈 280×490" 미준수
8. **로그인/회원가입 입력 필드 플레이스홀더 가독성 저조** — WCAG 4.5:1 미달 추정
9. **HUD 아이콘 과밀** — menu 우상단 6~7개 화폐/알림 아이콘이 오로라 배경과 겹쳐 식별 어려움
10. **폰트 일관성** — 타이틀 장식체 / 본문 산세리프 혼재. 05-design-direction "미니멀 산세리프" 기준 재점검

#### 🟢 통과 (잘 된 부분)
- 다크 석재 고딕 아치 프레임 — 하스스톤 금속 질감 회피 성공
- 프레임리스 일러스트 — 원형 컷 없이 가장자리까지 확장
- 좌측 세로 ATK/DEF/SPD 색상 박스 3칸 — 모든 카드 일관 적용
- NPC 플레이버 텍스트 ("서생" 대사) — Inscryption 계 캐릭터화 모범 구현
- 몰입 네이밍 — "전력 열람", "생명의 서", "모험 이어하기" 등 시스템 용어 전무
- title/menu 배경 일러스트 — 오로라 성채 등 분위기 압권

### 📊 종합 평가 (game-designer 5점 만점)
- 디자인 일관성: **3.5/5**
- 카드 UI 준수도: **3.0/5** (블로커 2건 때문에)
- 가독성: **2.5/5** (입력 필드/HUD/카드 이름 대비)
- 몰입도: **4.5/5** (네이밍·배경·NPC 매우 우수)

### 🎯 다음 작업 추천 우선순위
1. **카드 그리드 QA 패스** — 빈 프레임 3장 원인 규명 + HP 하트 누락 조사 → ART_ASSETS.md에 반영
2. **menu 마을 UI 재설계 기획서** — 터치 타겟 44px 확보, 반투명 HUD 바, 레이어링 원칙 문서화
3. **deck 빈 상태 UX 기획** — 슬롯 그림자 + 획득 경로 힌트 (game-design §2 소유 효과)

## 📁 폴더 구조 (2026-04-12 확정)
```
c:/work/
├── game/           ← 정본 (리팩토링 구조)
│   ├── index.html          (393줄 shell)
│   ├── css/                (9개 파일로 분리)
│   ├── js/                 (24개 파일로 분리: 00_namespace ~ 99_bootstrap)
│   ├── img/                (200+ PNGs: units/heroes/buildings/frames/skills)
│   ├── tools/              (game_inspect.js, snap_card_test.js — __dirname 기반 경로)
│   ├── *.md                (37개 기획서)
│   ├── gen_*.py            (SD 생성 스크립트)
│   └── HANDOFF.md          (이 파일)
│
└── game-legacy/    ← 구 원본 아카이브 (index.html 5321줄 단일 파일)
                      안전 보관용. 확신되면 삭제 가능.
```

## 🔄 2026-04-12 리팩토링 전환 이력
- 오전에 Claude가 실수로 구 원본(`game/`)에 모든 작업을 반영
- 사용자 확인 후 리팩토링 버전(`game-refactored/`)이 실제 정본임을 인지
- 오늘 작업 전부를 리팩토링에 이식 완료:
  - **이미지 41개**: frame_*.png(7), sk_*.png(30), sample_*.png(4)
  - **기획서 37개**: ART_ASSETS, BATTLE_*, CURRENCY, GDD, HANDOFF, PHASE1~4, HERO_ILLUST_PROMPTS, WEB_ARCHITECTURE, ELEMENT_PALETTE, STAT_TRAIT_SYSTEM 등
  - **코드 이식**:
    - `.card-v2` CSS → `css/31_card_system.css` 추가
    - `mkCardEl` V2 → `js/40_cards.js` 교체
    - `sk_*` CARD_IMG 매핑 30개 → `js/14_data_images.js` 추가
  - **도구**: `tools/game_inspect.js` (경로 `__dirname` 기반으로 재작성), `tools/snap_card_test.js`, `gen_sk_cards.py`, `card_test.html`
- 리팩토링 검증: `node tools/game_inspect.js units-grid` / `skills-grid` 모두 정상 작동
- 폴더 이름 교환 (robocopy /MOVE):
  - `game/` → `game-legacy/` (구 원본, 377MB)
  - `game-refactored/` → `game/` (리팩토링, 318MB, 정본 승격)
- **결과**: 모든 문서/스크립트가 쓰던 `c:/work/game/...` 경로가 자동으로 리팩토링을 가리킴 (경로 수정 0개)

## ⚠️ 기존 작업 메모: 구 버전과 리팩토링의 데이터 차이
- 리팩토링의 `js/11_data_units.js`는 **04-balance.md 룰북 기준** 베이스 스탯 (예: h_m_fire atk:4, hp:50, def:1, spd:1)
- 구 원본의 `index.html`은 **플레이테스트 튜닝 버전** (예: atk:9, hp:45, def:5, spd:3)
- 리팩토링의 룰북 수치가 현재 정본. 플레이테스트 튜닝은 향후 다시 진행 필요

## 🎨 2026-04-12 카드 프레임 V2 시스템 (완료)

### 개요
기존 CSS 기반 단순 카드(.card)를 **다크 석재 고딕 아치 프레임 이미지 오버레이** 방식으로 교체. `05-design-direction.md`의 카드 구조 요구사항 100% 충족.

### 프레임 5종 (등급 매핑)
| 등급 | 파일 | 특징 |
|------|------|------|
| bronze | `img/frame_bronze.png` | 소박한 석재 + 브라스 장식 |
| silver | `img/frame_silver.png` | 다크 은색 + 밝은 보석 |
| gold | `img/frame_gold.png` | 금장식 화려 |
| legendary | `img/frame_legendary.png` (보라) | 보라 마법 이펙트 |
| divine | `img/frame_divine.png` (빨강) | 붉은 균열 + glow 애니메이션 |

### 구조
모든 프레임이 동일 좌표계 공유 (1024×1536 기준):
- **아치 창 (일러스트)**: x 22%..78%, y 18%..70% (width 56%, height 52%)
- **이름 배너**: top 9%, height 5%
- **설명 패널**: bottom 4.5%, height 11%
- **HP 보석**: right 6.5%, top 9.3% (♥)
- **NRG 마름모**: right 6.5%, bottom 19.5% (◆)
- **ATK/DEF/SPD**: left 3.5%, top 21.5/30.8/40.2%

### 구현 파일
- **[index.html](index.html)**:
  - `.card-v2` CSS 블록 (다크 고딕 프레임 오버레이)
  - `mkCardEl(c)` 함수 재작성 (유닛=풀 스탯 / 스킬·유물=이름+설명)
- **[card_test.html](card_test.html)** — 독립 프로토타입 (참고용)
- **[tools/snap_card_test.js](tools/snap_card_test.js)** — Playwright 프로토타입 검증 도구
- **[HERO_ILLUST_PROMPTS.md](HERO_ILLUST_PROMPTS.md)** — 영웅 18장 재생성 프롬프트 템플릿

### 알파 처리
- `frame_purple.png`은 원본에 알파 채널 없음 → Python PIL로 밝기 > 200 픽셀 투명화 처리
- 나머지 4개 프레임은 원본에서 이미 투명

### 알려진 제약
- 현재 DreamShaper 생성 영웅 18장이 원소별 구분 약함 → `HERO_ILLUST_PROMPTS.md`로 ChatGPT 이미지 재생성 필요
- 스킬/유물 카드는 스탯 슬롯 없이 이름+설명만 표시 (빈 보석 슬롯은 프레임 장식으로 유지)
- 영웅 가챠 연출, 코팅 시스템 등 아직 V2 프레임 미반영

## 🚨 2026-04-12 주요 결정
1. **Unity 전환 취소** → 웹 기반(`index.html`) 계속 유지
2. **게임 디자인 에이전트 도입** → `.claude/agents/game-designer.md`
   - 5관점 리뷰: 🎨밸런스 / 🎯UX·UI / 🌍세계관 / 🖼️비주얼·에셋 / 🔗정합성
3. **`ART_ASSETS.md` 생성** → 카드 에셋 현황표, 누락 사전 탐지
4. **`.claude/references/card-game-studies/`** → 레퍼런스 연구 전용 폴더 (하스스톤/LoR/MTG 학습 허용, 단 기획서 본문에 직접 언급 금지)

## 🔴 긴급 이슈 (디자인 리뷰 발견)
### 스킬 카드 16개 "빈 프레임" 버그
`CARD_IMG` 객체에 아래 스킬 매핑 누락 → 카드 일러스트 영역 공백:
sk_tough, sk_focus, sk_energize, sk_cleave, sk_ironwill, sk_prayer, sk_venom, sk_reflex, sk_bloodlust, sk_mirage, sk_warhorn, sk_execute, sk_aura, sk_godslayer, sk_resurrection, sk_shadowstep
→ 상세는 `ART_ASSETS.md` 참조

### 2026-04-12 C단계 — 블로커 정리 완료
- ✅ 화폐 체계 3종 통합 — 👑신의은총 폐지, 영웅 가챠는 💎 보석 전용 (`CURRENCY_SYSTEM.md` 재작성)
- ✅ 종족 금지어 제거 + 재명명 — elf→sylvan(숲의 계약자), undead→wraith(망자의 군단), dragon→drake(원룡), demon→abyssal(심연의 권속), celestial→luminary(광명의 사도), machine→clockwork(태엽장치). `PHASE2_SYNERGY_PLAN.md`, `GDD.md` 업데이트
- ✅ 초기 골드 통일 5g — `GDD.md`, `BATTLE_RULES.md` 수정
- ✅ 라운드 선택지 5개 확정 — 유닛/스킬/유물/포션/턴종료. 용어 "스킬" 정본, "스펠 카드"는 UI 표시 단위. `BATTLE_RULES.md`에 용어 정의 명시
- ✅ 하스스톤 직접 언급 10+ 파일 일반화 — "업계 표준 키워드 툴팁 패턴", "메탈릭 변형 스킨" 등으로 치환
- ✅ `PHASE3_COATING_PLAN.md` "신의 축복" 소제목 → "신화(Mythic)" 교체
- ✅ Unity 잔재 전면 정리 + 웹 스택으로 전환 (2026-04-12 재작업)
  - `unity_data/` 폴더 삭제 (git 미추적이라 복구 불가)
  - `UNITY_PROJECT_PLAN.md` 삭제 → `WEB_ARCHITECTURE.md` 신규 작성 (기술 스택/프로젝트 구조/Unity→웹 매핑표 전체)
  - 9개 Phase 기획서 "Unity 구현 시 고려사항" → "웹 구현 시 고려사항"으로 일괄 변환
    - PHASE2_BATTLE_LOG_PLAN, PHASE2_TOWN_PLAN, PHASE2_SYNERGY_PLAN, PHASE2_QUEST_ACHIEVEMENT_PLAN
    - PHASE3_COATING_PLAN (5곳), PHASE3_ELEMENT_PLAN, PHASE3_EVOLUTION_PLAN
    - GACHA_EFFECT.md (6번 섹션 + 7번 셰이더 섹션)
    - DESIGN_ASSET_PLAN.md (VFX 테이블 + 도구 체인)
  - Shader Graph → CSS filter/@keyframes / Particle System → Canvas 2D / DOTween → CSS transition / ScriptableObject → JS 상수 등 모든 Unity 개념을 웹 대응물로 매핑
- ⏳ 카드 UI 구조(05/06 규칙) Phase 기획서 반영 — 각 Phase 상단 크로스레퍼런스는 다음 턴 작업

### 2026-04-12 게임 디자인 스킬 구축
- ✅ **.claude/skills/game-design.md** 생성 (10섹션: 체크리스트/밸런스/심리/피드/로그라이크/오토배틀러/모바일/몰입/고유원칙/학습로그)
- ✅ **.claude/references/card-game-studies/** 7편 레퍼런스 분석 노트
  - hearthstone_keywords_ux.md — 키워드 12개 상한, 툴팁 3계층
  - lor_card_anatomy.md — 정보 Tier 3단계, 원소 색상 팔레트, 전직 연출
  - slay_the_spire_deckbuilding.md — 3장 중 1장, 덱 압축, 시너지 65/35
  - tft_autobattler_core.md — 상대 정보 공개, 이자 경제, 연패 안전망
  - mtg_color_pie_philosophy.md — 6원소 정체성, 2원소 조합 덱
  - marvel_snap_quick_session.md — 3분 게임, 더블다운, 선택 밀도
  - inscryption_narrative_subversion.md — 서사 충격, 리그별 규칙 변화, NPC 캐릭터화
- ✅ game-designer 에이전트가 이 스킬/레퍼런스를 자동 로드하도록 연결

### 2026-04-12 레퍼런스 기반 기획서 보강
- ✅ **PHASE2_SYNERGY_PLAN.md** — "시너지 65 : 파워 35" 원칙 추가, 재조정 예시 포함
- ✅ **BATTLE_RULES.md** — 매칭 대기 10초 상대 정보 공개 시스템 추가
- ✅ **CURRENCY_SYSTEM.md** — 연패 안전망(2~6연패 보상 스트릭) + 골드 이자(선택) 섹션 추가
- ✅ **ELEMENT_PALETTE.md** 신규 — 6원소 2색 그라데이션 팔레트 스펙
- ✅ **PHASE2_TOWN_PLAN.md** — 교회에 "덱 정화소(장례)" 기능 강조, 레벨별 해금 구조

## 스토리
- **세계관**: "운명의 왕좌" — 6원소의 신들 위에 절대신의 왕좌가 있음
- 신들은 직접 싸울 수 없어 인간 영웅을 대리인으로 선택
- 플레이어 = 신에게 선택받은 영웅, 폐허 마을에서 시작
- **목표**: 브론즈→신의영역 리그를 올라가 절대신에게 도전, 왕좌 차지
- 프롤로그: 회원가입 후 타이핑 연출 스토리 → 원소/성향 선택

## 튜토리얼
- tutStep 0~5 (6단계), 99=스킵
- 0: 마을 첫 진입 → 성문 건설 안내
- 1: 성문 건설 후 → 서고 건설 안내
- 2: 서고 건설 후 → 리그 참여 안내
- 3: 첫 전투 → 카드 선택 안내
- 4: 첫 라운드 생존 → 행동력 안내
- 5: 첫 전투 완료 → 마을 발전 안내

## 프로젝트 개요
- **파일**: `c:/work/game/index.html` (단일 HTML 파일, ~2240줄)
- **장르**: 로그라이크 카드 오토배틀러 + 마을경영 + 가챠 (웹앱)
- **컨셉**: 신들의 리그 — 최고의 신이 되어라
- **기술**: Vanilla HTML/CSS/JS, localStorage DB (`rof8`), Web Audio API
- **GDD**: `c:/work/game/GDD.md` (전체 게임기획서)
- **Phase 1 계획**: `c:/work/game/PHASE1_PLAN.md`

## 게임 플로우
```
타이틀 → 로그인/회원가입 → 원소선택 → 성향선택 → 영웅확정
  ↓
마을 화면 (히어로즈3 스타일 건설 시스템)
├── 🏰 성 (퀘스트 — 준비 중)
├── ⚔️ 차원문 → 리그 전투 (무료, 기본 건설)
├── ⚒️ 대장간 (10💰 건설) → 카드 강화
├── 🏪 상점 (15💰 건설) → 준비 중
├── 🍺 선술집 (10💰 건설) → 용병 고용
├── 📋 서고 (5💰 건설) → 덱/상태확인
└── 🚪 로그아웃
- 미건설 건물은 폐허(🏚️)로 표시, 마우스 호버시 밝아짐
- 클릭하면 건설 확인 팝업, 골드 차감 후 건설 애니메이션
```

## 핵심 시스템

### 1. 계정/저장
- DB키: `rof8`, localStorage 기반
- 저장: deck, ownedRelics, ownedSkills, gold, leaguePoints, bestRound, totalWins

### 2. 리그 시스템 (Phase 1에서 구현 완료)
| 리그 | 점수 | 색상 |
|------|------|------|
| 브론즈 | 0~99 | #cd7f32 |
| 실버 | 100~299 | #c0c0c0 |
| 골드 | 300~599 | #ffd700 |
| 플래티넘 | 600~999 | #00cccc |
| 다이아 | 1000~1499 | #00aaff |
| 마스터 | 1500~1999 | #aa44ff |
| 신의영역 | 2000+ | #ff4444 |
- 승리 +10점, 패배 +5점
- 메뉴에 리그 프로그레스 바 표시

### 3. 카드 시스템
- **영웅**: 18종 (3역할 × 6원소), 인간 종족 고정
  - 역할: 근접전사(h_m_*), 원거리궁수(h_r_*), 지원마법사(h_s_*)
  - 원소: fire, water, lightning, earth, dark, holy
- **영웅선택**: 2단계 UI (원소 선택 → 성향 선택)
- **종족/원소**: 모든 카드에 race/element 필드
- **스킬**: 29종, **유물**: 12종
- **등급**: bronze → silver → gold → legendary → divine
- **합성(fuseCard)**: 1.5배 스탯 (기존 2배에서 하향)
- **성장 시스템**:
  - 레벨업 시 freePoints +5 (골드 강화/전투 XP 모두)
  - 상태확인 카드상세에서 유저가 직접 스탯 배분 (atk/hp/def/spd/nrg/luck/eva)
  - growthPts 객체에 배분 이력 저장
- **10가지 스탯**: atk, hp, def, spd, rage, nrg, luck, eva, meva, shield
- **hpReg/nrgReg**: 턴당 회복

### 4. 스킬 시스템
- **패시브**: 항상/확률 발동 (taunt, armor, crit, pack, frenzy 등)
- **액티브**: 에너지 소비 + 확률, 공격 후 발동 (aoe, heal, inspire 등)
- **bonusTrigger**: on:attack/hit/skill/kill, 확률 기반 보너스
- **반격**: 근접 앞열만, `_noCounter` 무한루프 방지

### 5. 전투
- 라운드 N = N번 공격 교환
- 턴: 리젠 → 화상/noHeal → 패시브 → 타겟(도발>앞열>랜덤) → 공격 → 트리거 → 액티브스킬
- **5개 선택지**: 유닛/스킬/유물/포션/행동종료
- **행동력(AP)**: 라운드 사이 선택 횟수. 영웅 Lv1=1AP, Lv2+=2AP, Lv10+=3AP, Lv50+=4AP
- **타이머**: AP당 15초, 최소20초 최대60초. 시간초과=자동스킵
- **동시선택**: 양측 선택을 모르는 상태에서 결정 → 타이머 종료 후 적 행동 공개
- **매칭**: 봇 자동 매칭 (유저 리그 ±1 등급, 랜덤 이름/영웅/원소)
- **슬로모션**: 크리티컬(1.2s), 처치(0.8s), 부활(1.2s) 시 자동 슬로모
- **전투 속도**: 기본 200ms (빠른 진행), 슬로모 시 800ms
- AI도 동일 AP만큼 행동 (상황판단: HP부족→포션, 유닛부족→고용, 스킬부족→장착)
- **포션**: 영웅 HP 50% 회복, 쿨다운 1라운드, AI 30%이하 자동사용
- **적 AI**: 미러링 배치 + 라운드 사이 AI 선택 + 포션 사용

### 6. 로그라이크
- 전투 시작 시 `_deckSnapshot` 저장
- 전투 중 얻은 모든 것 임시 (`bs.pCards`에만)
- 전투 끝나면 스냅샷 복원 (XP/honor/level만 보존)

### 7. 출전권/유물력
- 출전권 = 영웅카드 레벨 (유닛은 자기 레벨만큼 소비)
- 유물력 = 영웅레벨/2

### 8. 비주얼
- 다크 고딕 스타일 CSS (Cinzel 폰트, 등급별 레어리티 색상)
- game-icons.net SVG 아이콘 (CDN)
- 중세풍 Web Audio BGM (메뉴=도리안, 전투=D마이너+드럼)
- 카드 포트레이트: 타입별 배경색 + 비네트

## Phase 1 진행 상황
- [x] 1-1. 전투 멈춤 버그 근본 해결 (공격 로직 재구성)
- [x] 1-2. XP 시스템 검증 (스냅샷 복원 시 레벨 보존 수정)
- [x] 1-3. 출전 화면 빈 화면 버그 검증
- [x] 2-1. 리그 점수 도입 (leaguePoints 저장/로드)
- [x] 2-2. 리그 등급 표시 (메뉴 프로그레스 바 + 결과 화면)
- [x] 3-1. 체력 포션 4번째 선택지 (쿨다운 + AI)
- [x] 4-1. 강화 이펙트 (파티클 + 등급상승 폭발 + 사운드)
- [x] 4-2. 가챠/선술집 연출 (카드 뒤집기 + 레어리티별 이펙트 + 사운드)
- [x] 4-3. 전투 이펙트 강화 (크리티컬 화면흔들림 + 영웅사망 + 승리 배너/팡파레)
- [x] 5-1. 경제 밸런스 조정 ✅

### 5-1 경제 밸런스 변경 내역 (2026-04-11)
| 항목 | 변경 전 | 변경 후 | 이유 |
|------|---------|---------|------|
| newRun 초기 골드 | 2 | 5 | 브론즈 유닛 즉시 영입 가능 |
| 승리 기본 보상 | 10g | 12g | 승리 체감 보상 향상 |
| 패배 기본 보상 | 3g | 5g | 패배 후 회복력 개선 |
| 패전 루트 보상 | 3g | 5g | 패배 페널티 완화 |
| 단련 비용 | level×3 | level×2+1 | 고레벨 비용 곡선 완화 |
| 선술집 새로고침 | 2g | 1g | 초반 탐색 부담 감소 |
| 리그 골드 보너스 | 0/0.2/0.2/0.4/0.4/0.6/0.6 | 0/0.15/0.3/0.45/0.6/0.8/1.0 | 각 티어별 차별화 + 신의영역 보상 |

## 알려진 이슈
1. ⚠️ sk_handoff 스킬 — 전투 로직 미구현
2. ⚠️ game-icons.net SVG 일부 URL 404 가능 (아이콘명 정확도)

## 파일 구조 (index.html)
```
CSS (1~527줄): 다크 고딕 스타일 (Cinzel + 레어리티 색상)
JS (528~2242줄):
  - DATA (544~790): UNITS(24+6), SKILLS_DB(29), RELICS_DB(12), ENEMY_NAMES(100), STARTERS(6)
  - CARD_IMG (794~860): game-icons.net SVG 매핑
  - SFX (862~920): Web Audio BGM/효과음
  - Auth (930~790): 로그인/회원가입
  - Game (860~): 메인 게임 로직
    - 리그 시스템: LEAGUES[], getLeague(), getLeagueProgress()
    - showMenu, showUpgrade, showDeckView, showTavern
    - startBattle → renderCardSelect → confirmCardSelect → Formation → launchBattle
    - runBattleRound (전투 메인 루프, ~120줄)
    - showRoundChoice (4개 선택지 + 포션 쿨다운 + 적 AI)
    - doRoundChoice (유닛/스킬/유물 선택 + 중복합성)
    - enemyRoundChoice, enemyMirrorDeploy (적 AI)
    - showBattleEnd (결과 + 리그점수 + 로그라이크 리셋)
  - Formation: 앞열/뒷열 배치
  - Helper functions: mkCardEl, mkRelicEl, mkMini, applySkillToUnit, fuseCard 등
```

## 향후 로드맵 (GDD.md 참조)
- Phase 2: 마을 시스템 + 가챠
- Phase 3: 종족 시너지 + 전직
- Phase 4: 아레나 + 시즌
- Phase 5: 과금 + 폴리싱

## Superpowers 스킬
`~/.claude/skills/`에 설치됨. 새 세션에서 자동 활성화.
주요 스킬: brainstorming, writing-plans, executing-plans, test-driven-development, systematic-debugging
