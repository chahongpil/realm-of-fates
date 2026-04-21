# Play Director 리포트 — 2026-04-21

**세션 시간**: 2026-04-21 21:00~21:15 KST
**검사자**: rof-play-director (독립 수행 — 코드 수정 없음)
**방식**: Playwright (chromium headless, 1280×720), URL `http://localhost:8765/index.html?mute=1`
**시나리오**: 타이틀 → 회원가입 → 프롤로그 skip → 원소 선택 → 성별 토글 + 영웅 선택 → 메뉴 → 매치메이킹 → 전투

---

## 🎬 플레이 플로우 결과

| 단계 | 경과(ms) | 상태 |
|---|---|---|
| 타이틀 로드 | 1,971 | ✅ |
| 회원가입 → 프롤로그 | 4,358 | ✅ |
| 프롤로그 skip → 원소 | 5,235 | ✅ |
| 원소 선택 → 영웅 | 6,867 | ✅ |
| 성별 토글 클릭 | 7,615 | ✅ (2개 토글 동작) |
| 영웅 선택 → 메뉴 | 9,759 | ✅ |
| 매치 진입 (API) | 11,628 | ⚠️ UI 버튼 없음 |
| 도전자 등장 (매칭) | 12,798 | ✅ (1초 내) |
| 포메이션 → 전투 | 15,477 | ✅ |
| 전투 개시 클릭 | 16,628 | ✅ |
| **전투 종료** | ❌ 90,739ms 후에도 battle-screen 유지 | **🔴 실패** |

총 13개 스크린샷 저장: `shots/play_check_2026-04-21_*.png`

---

## 🔴 P0 블로커 (교차검증 필수)

### 1. 전투 진행 불가 — `Cannot read properties of null (reading 'pCards')`

**증상**: "⚔️ 전투 개시!" (`#btn-fight`) 클릭 직후 `PAGEERROR: Cannot read properties of null (reading 'pCards')` 발생. 이후 `Game.battleState` 가 `{}` 빈 객체 상태로 멈춤. 90초 대기 후에도 battle-screen 에서 벗어나지 못함. `Game.battleRunning === false` 고정.

**근거**:
- 로그 `play_check_2026-04-21_log.json`: `battle-end {ms: 90739, ended: false, to: "battle-screen"}`
- 콘솔 pageerror: `"Cannot read properties of null (reading 'pCards')"` (2회)
- 코드 상 의심 위치: `js/57_game_battle_ui.js:42` — `bs.pCards.filter(...)` 에서 `bs = this.battleState` 가 `{}` 인 상태 → `bs.pCards` is `undefined` → `.filter` 호출 시 TypeError. Line 39 early-return 조건 `if(!bar||!this.battleState)` 는 `{}` 를 truthy 로 판정해 통과.
- `js/55_game_battle.js:17` 초기값 `battleState:null`, `:145` 에서 `{currentRound:0, pCards:null, eCards:null, ...}` 로 세팅되지만 현재 관측은 `{}` — 초기화 순서 불일치 가능성.

**레퍼런스 대조**: StS2/HS/Balatro 어떤 카드게임이든 "전투 시작 버튼 클릭 → 5초 이내 첫 턴 진입"이 황금률. 우리 게임 = ∞. **P0**.

**권장**: `js/57_game_battle_ui.js:39` 의 조건을 `if(!bar||!this.battleState||!this.battleState.pCards)return;` 로 강화. 근본: `updateSkillBar()` 가 `_startBattleInner` 완료 전 호출되는 타이밍 이슈 확인.

**교차검증 대상**: `game-designer` (전투 플로우 기획 일치 확인), 가능하다면 `game-balance-tester` 가 시뮬에서 동일 증상 재현 여부.

---

### 2. 신규 플레이어의 전투 진입 경로 부재

**증상**: 회원가입 → 영웅 생성 직후 town 에 활성 건물이 "🔨 증축 (30💰)" + "나무문 Lv.1 🔒 성 Lv.2 필요" 2개 뿐. 초기 골드 20. tavern/forge/arena 등은 전부 `town-building ruins unbuilt` (지어야 함). **`data-action` / onclick / `data-b` 속성이 모두 `null`**. 즉 신규 플레이어가 타이틀 → 전투까지 UI 로 도달할 방법이 현재 없음.

**근거**: 
- `buildings {n:8}` 로그, 건물 8개 중 클릭 가능한 것 0개 (모두 `a:null, arg:null`)
- `match-btn-not-found` 로그 — 내가 시도한 4개 selector (`game.showMatch`, `match-screen`, `game.enterArena`, `data-b=arena`) 모두 DOM에 없음
- 테스트 진행을 위해 `Game.gold=999` 주입 + `Game.showMatchmaking()` 직접 호출해야 했음

**레퍼런스 대조**: StS2/Slay the Spire 는 "첫 전투까지 0 클릭" (게임 시작 → 자동 첫 전투). HS 튜토리얼은 4 클릭 이내. Balatro 는 "Play" 버튼 1회. **우리 게임 = UI 상 도달 불가능**.

**권장**:
- 옵션 A: 나무문 클릭을 매치메이킹 트리거로 (지금 `🔒 성 Lv.2 필요` 로만 보임)
- 옵션 B: 초기 `buildings.arena = 1` 기본 제공 + tutorial 강제 매칭
- 옵션 C: 메뉴 화면에 "⚔️ 도전" 상시 플로팅 버튼

**교차검증 대상**: `game-designer` — 기획 의도 확인. 초기 이 로직이 삭제된 것인지, 아니면 내가 알고 있는 진입점을 놓친 건지 확인 필요.

---

### 3. 전투화면 — 적 카드 일러스트/프레임 미렌더링

**증상**: `shots/play_check_2026-04-21_08a_battle_start.png` — 적 카드 자리가 **검은 사각형**. 내 카드(Aldwin/원거리 궁수)만 정상 렌더. 전투 개시 후 08b 에서도 동일.

**근거**: 08a 스크린샷 — 중앙 "VS" 상단에 빈 세로 사각형 (프레임/일러스트 둘 다 안 보임).

**레퍼런스 대조**: 매치메이킹 화면 (`06c_challenger.png`) 에서는 **양쪽 카드가 멀쩡히 렌더**됨 (Draven 상대). 즉 카드 데이터는 있는데 battle-screen 으로 전환할 때 적 DOM 렌더가 누락.

**권장**: `bv2-enemy-row` 또는 equivalent 그리드가 비어있는지 확인. pCards null 버그(1번)와 같은 원인일 가능성 높음 — `eCards` 역시 null 이라 렌더 패스 누락.

**교차검증 대상**: `rof-ui-inspector` — 정적 스크린샷 비교로 재현 확인.

---

## 🟡 주의 (혼자 관측 — 블로커 아님)

### A. 타이틀 배경 crop 문제

- `shots/play_check_2026-04-21_01_title.png`
- 신규 2560×1440 QHD 배경이 1280×720 뷰포트에 `cover` 로 맞춰지면서 중앙의 **천사 메인 모티프가 잘림**. 위쪽 절반만 보이고 하단에는 군중/건물만 강조. 로그인/회원가입 버튼이 이미지의 빛기둥과 겹쳐 텍스트 대비 약함.
- 레퍼런스: HS/LoR 타이틀은 주인공 모티프가 화면 중앙 눈높이에 위치. 우리 게임은 중앙이 비어 있고 위쪽에 핵심 시각물.
- 권장: `background-position: center 30%` 또는 crop 하여 주요 모티프 중앙 유도. 대표님 확인 권장.

### B. `bg_title` 뒤에 레거시 radial-gradient 중첩

- computed style: `url("http://localhost:8765/img/bg_title.png"), radial-gradient(rgb(26, 21, 37) 0%, rgb(10, 8, 16) 60%, rgb(5, 4, 8) 100%)`
- QHD 이미지로 교체했다면 radial-gradient 는 불필요(완전히 덮임). 제거해도 시각 차이 없음, CSS 정리 기회.

### C. 404: `img/town/gate.png`

- town 내 `gate` 건물 아이콘 1장만 실패. town 렌더는 작동. 대시보드 누락 에셋.
- 권장: garbage-cleaner 교훈 2026-04-13 "빠진 에셋 = 14_data_images.js 에 매핑 누락" 재확인.

### D. 성별 토글 UX — 시각 피드백 약함

- `shots/play_check_2026-04-21_04b_gender.png` 확인
- 남성/여성 탭 전환했을 때 **3명의 영웅 일러스트 변경 여부 불분명** — 여전히 같은 일러스트처럼 보임 (토글 전후 비교 필요)
- 레퍼런스: HS 영웅 선택은 아이콘 + 이름 + 배경 색 변화. 우리는 선택 색이 단조로움(양쪽 모두 갈색).

### E. 포메이션 화면 자동 스킵

- `showMatchmaking()` 이후 포메이션 단계(`formation-screen`) 가 표시되지 않고 바로 battle-screen 진입. `after-sortie: battle-screen` 확인.
- 의도된 것이면 OK, 튜토리얼이라 skip 된 것으로 추정. 이후 라운드에서는 formation 이 나오는지 확인 필요.

---

## 🟢 통과

- 타이틀 ~ 영웅 생성까지 완주 (9.7초 소요, 레퍼런스 범위 내)
- 성별 토글 DOM 존재 + 클릭 동작 (`{exists:true, children:2, text:"🧔\n남성\n👩\n여성"}`)
- 원소 선택 6종 + 역할 3종 확인
- 매치메이킹 타이밍: 상대 등장까지 1~3초 (Snap 수준, 양호)
- SFX mute 동작 (콘솔에 오디오 경고 없음)
- 404 응답 1건뿐 (gate.png)

---

## 📊 정량 지표

| 지표 | 측정값 | 레퍼런스 | 판정 |
|---|---|---|---|
| 타이틀 로드 | 1.97s | StS2 < 3s | 🟢 |
| 회원가입 → 메뉴 | 9.7s | - | 🟢 |
| 매치메이킹 (상대 등장) | 1~3s | Snap 3s | 🟢 |
| **전투 종료** | **∞ (>90s)** | StS2/HS 30~120s | **🔴** |
| 화면당 클릭 타겟 (menu) | 2 | 7±2 | 🔴 (너무 적음) |
| 화면당 클릭 타겟 (battle) | 2 | 7±2 | 🔴 (너무 적음) |
| 카드 DOM 수 (battle) | 3 | 10 전후 | 🟡 (적 카드 누락 포함) |
| 콘솔 에러 | 2건 (pCards null × 2) | 0 | 🔴 |
| 4xx 응답 | 1건 (gate.png) | 0 | 🟡 |

---

## 💥 블로커 리스트 (교차검증 필요)

| # | 항목 | 심각도 | 필요 동의 |
|---|---|---|---|
| 1 | 전투 진행 불가 (pCards null TypeError) | **P0** | game-designer / (재현 시뮬 가능하면) balance-tester |
| 2 | 신규 플레이어 전투 진입 UI 부재 | **P0** | game-designer |
| 3 | 전투화면 적 카드 미렌더 | P0 | rof-ui-inspector |
| A | 타이틀 QHD 배경 crop 정렬 | P1 | 대표님 직접 확인 |
| B | radial-gradient 중첩 정리 | P2 | - |
| C | 404 gate.png | P2 | - |
| D | 성별 토글 시각 피드백 | P2 | rof-ui-inspector |
| E | 포메이션 화면 자동 스킵 (의도?) | P2 | game-designer |

**메인 세션 권장 조치**:
1. `js/57_game_battle_ui.js:39` null-safe 가드 추가
2. `js/55_game_battle.js` 에서 `battleState` 초기화 순서 및 `pCards/eCards` 세팅 타이밍 확인 (아마 오늘 대규모 변경 중 누락)
3. 신규 계정 → 전투 진입 경로 기획 재검토 (전투 버튼/잠금 해제 조건)

**캡처 위치**: `c:/work/game/shots/play_check_2026-04-21_*.png` (13장)
**로그 위치**: `c:/work/game/shots/play_check_2026-04-21_log.json`
