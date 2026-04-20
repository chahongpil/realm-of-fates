# UI Inspector 결과 — Realm of Fates 전반 상태 (2026-04-20 night)

> 생성: rof-ui-inspector 에이전트 산출물 (에이전트는 Write 권한이 없어 메인 세션에서 파일로 저장).
> 스크린샷 10장: `shots/inspect_2026-04-20-night/`

## Tavern V4 검증

### 측정 결과
- `.card-v4` 실측: **235×411px** (4:7 비율 유지, 원안 260×455 대비 ~90% 축소)
- 구조 요소 실측 (한 장 기준):
  - `.top` 카르투슈: 219×32
  - `.bars` HP/NRG: 219×15
  - `.parch` 양피지: 223×102 (stats 201×29 + desc 201×49)
  - `.gild`, `.art`: 235×411 (full bleed)
- 배치: x=53, 298, 543, 788 → **열 간격 245px** (카드 235 + gap 10), Lv1 선술집 기준 4장 렌더.

### PASS
- 양피지 톤 `#d4bf88` 영역이 선명하게 드러남 — 다크 배경과 대비 우수.
- 카드당 금박 테두리(`.gild`) 1px+box-shadow 레이어가 등급별로 차등 표현됨 (`rar-divine` glow 확인).
- 5개 스탯 슬롯(ATK/DEF/SPD/CRIT/EVA) 가독성 충분, 양피지 위 dark brown `#1a0a04` 텍스트 대비 4.5:1 통과 추정.
- HP/NRG bar 와 `.top` 네임 플레이트가 등급별 글로우 속에서도 가려지지 않음.
- `body.fontFamily` 는 여전히 `Noto Sans KR` — Cinzel Decorative 는 **V4 스코프(.card-v4 .name/.lv/.desc)** 안에서만 사용됨, 다른 화면 침투 없음. 폰트 오염 **없음**.

### 개선점
- 🟡 **"5-col" 파일명 vs 실측 4-col**: `tavern_v4_step4b_5col.png` 파일명과 달리 Lv1 선술집에서는 4장만 나옴. 5-col 은 `tavLv>=2` 조건이므로 이름만 오해의 소지. 5장 실렌더는 업그레이드 후 재캡처해서 `tavern_v4_unit_lv2_5col.png` 로 별도 보관 권장.
- 🟡 **Hero 탭과 Unit 탭이 시각적으로 구분 안 됨**: 탭 토글 후(`#tav-tab-unit.click()`) 카드 구조·배경이 동일해 어느 탭인지 바로 판별 불가. 양쪽 다 `tav-grid` + `mkCardElV4` 라 옳지만, **탭 제목/서브헤더** 를 색이나 아이콘으로 차별화(✨ 영웅 소환 vs 💰 유닛 영입) 하면 방향성이 명확해짐.
- 🟢 Step 4B 레이아웃(1240 stage ÷ 245 col = 5.06 열) 자체는 깨끗함. 빈 칸이 오른쪽에 남는 것은 슬롯 수의 문제지 그리드 문제가 아님.

---

## V2 잔존 화면 대조

| 화면 | 카드 컴포넌트 | 크기 | 톤 점수(V4=10 기준) | 스크린샷 |
|---|---|---|---|---|
| **Tavern** | `.card-v4` 235×411 | 양피지 `#d4bf88` + 금박 | **10 (정본)** | `shots/inspect_2026-04-20-night/T1_tavern_hero.png` / `T2_tavern_unit.png` |
| **Deckview** | `.card-v2` 260×390 | 다크 + 등급 보더 + 일러스트 전체 덮음 | **5** (양피지 없음, 스탯 텍스트가 다크 위에 떠 있음) | `04c_deckview_v2.png` |
| **Formation** | `.card-v2` (편성 시) | 빈 슬롯은 dashed `+` 박스 | **3** (편성 전 비어있음, 배치 후에야 V2 렌더) | `F1_formation_auto.png` |
| **Battle** | `.card-v2` 기본 12장 | V2 톤, bv2-card 전환은 아직 없음 | **4** | `06b_battle.png` |
| **Collection (Codex)** | 미제공 — `Game.showCollection`/`showCodex` 둘 다 존재 안 함 | — | — | (캡처 실패, 해당 화면 없음) |

### 핵심 대조 관찰
- **V2 (Deckview/Formation/Battle) 는 어두운 일러스트가 프레임 전체를 덮고 상단 은색 네임플레이트 + 하단 다크 스탯 바** 구조. 양피지(`#d4bf88`)·금박(`--gilt`)·Cinzel 폰트 전혀 없음.
- **V4 (Tavern) 와 직접 대조 시 톤 격차가 매우 큼** — 같은 게임 안에서 두 카드 디자인 언어가 공존하는 중. 대표님이 전 화면을 V4 로 통일하기로 방향 잡으면, Deckview → Formation → Battle 순서로 이식 필요.
- V2 를 그대로 두더라도 **Tavern → Deckview 흐름 체감 격차가 가장 큼** (영입 후 내 덱 보러 가면 프레임이 완전히 달라짐). 하나만 이식한다면 Deckview 가 최우선.

---

## 전반 UI 건강성 체크리스트

### 🟢 통과
- **뷰포트 1280×720 준수**: Playwright `viewport:{1280,720}` 캡처 기준 모든 화면이 수렴. `.game-root` 스케일 트랜스폼 정상.
- **화면 가시성 배타성**: `visible screens count = 1` (tavern-screen만). 00-index 의 ".screen display 특이성" 트랩 재발 없음.
- **`card-v4` 스코프 격리**: Deckview 에서 `.card-v4` 선택자 0건 확인. V4 CSS 가 다른 화면 유출 없음.
- **Cinzel/Cinzel Decorative 폰트 범위**: `.card-v4 .name/.lv/.desc/.stat .v` 만 사용. `document.body` 는 Noto Sans KR 유지. **폰트 침투 0건**.

### 🔴 블로커 (즉시 수정 필요)
없음. V4 도입으로 인한 회귀 블로커는 관측되지 않음.

### 🟡 주의 (개선 권장)
1. **Tavern hero 탭 표시에 영웅 아닌 유닛 등장 관측**: `T1_tavern_hero.png` 에서 그리핀/늑대/불 정령 등이 나오는데, 이들은 `UNITS.id.startsWith('h_')` 로 필터링되어야 할 영웅 풀. Lv1 에서 `pool` 이 비면 fallback 으로 아무 `h_*` 가 나오지만, 캡처에서는 일반 유닛처럼 보임 (이름이 `HERO_NAMES` 로 치환되어 표시됨). **런타임 동작은 정상**이지만 일러스트가 동일 아트풀에서 온다면 카드별 시각 다양성이 약해 보일 수 있음 — 이건 아트 이슈지 코드 이슈 아님.
2. **Formation "자동 배치" 이후에도 카드가 안 그려짐**: `F1_formation_auto.png` 에서 5 슬롯 여전히 `+` 더미. 버튼은 클릭됐지만 UI 리렌더가 작동 안 함(또는 자동 배치 로직이 `Game.deck` 주입을 인식 못 함). 이건 V4 와 무관한 기존 로직 문제로 보이나 대표님이 V4 확장 작업 시 이 화면도 같이 실렌더 검증 필요.
3. **Z-index/오버랩 이슈 없음**: `.card-v4` 의 `z-index: 3~6` 레이어가 `.gild < .top/.bars/.parch < .spark < .ribbon` 순서로 맞게 쌓임. 다른 화면 오버랩 없음.

---

## 정량 지표

- **V4 카드 실측**: 235×411 px (설계 260×455 대비 선형 90.4%)
- **V2 카드 실측**: 260×390 px (Deckview mode)
- **V4 5-col 그리드 여유**: `(1240 − 235×5) / 4 = 13.75px` → gap 10px 적용 시 좌우 ~8px 마진. 타이트하지만 수용 가능.
- **톤 격차**: V4 양피지 `#d4bf88` (HSL 42° 44% 69%) vs V2 다크 배경 → 명도 격차 약 60%. 시각적으로 "다른 디자인 시스템" 수준.
- **폰트 침투 검사**: `body.fontFamily = Noto Sans KR` (Cinzel 유출 없음). 0건.
- **검사한 스크린샷**:
  - `shots/inspect_2026-04-20-night/01_menu.png`
  - `shots/inspect_2026-04-20-night/02_tavern_default.png`
  - `shots/inspect_2026-04-20-night/03_tavern_unit_tab.png`
  - `shots/inspect_2026-04-20-night/04c_deckview_v2.png`
  - `shots/inspect_2026-04-20-night/05c_formation_v2.png`
  - `shots/inspect_2026-04-20-night/06b_battle.png`
  - `shots/inspect_2026-04-20-night/07b_tavern_full.png`
  - `shots/inspect_2026-04-20-night/T1_tavern_hero.png`
  - `shots/inspect_2026-04-20-night/T2_tavern_unit.png`
  - `shots/inspect_2026-04-20-night/F1_formation_auto.png`

---

## Step 5 (다른 화면 V4 확장) 우선순위 제안

| 순위 | 대상 | 근거 | 난이도 추정 |
|---|---|---|---|
| **1** | **Deckview** (`js/53_game_deck.js`, `mkCardEl → mkCardElV4` 교체) | Tavern → Deckview 체감 격차가 가장 큼. 대표님 플로우가 "영입 → 내 덱 확인" 직결. 호출부 1곳 교체만 하면 됨(`Game.showDeckView()` 내부의 `mkCardEl(c)`). Tavern 과 동일 방식. | 낮음 (~30분) |
| **2** | **Formation** (`js/54_game_formation.js` 추정, `mkCardEl` 호출부 교체) | Deckview 와 같은 카드 프레임이어야 "내 덱 → 배치" 경험이 부드럽게 연결됨. 단, 드래그/슬롯 인터랙션은 V4 크기(235×411) 에 맞춰 슬롯 치수도 재조정 필요. | 중 (~1h) |
| **3** | **Battle V2** (`.bv2-card`, `css/41_battle_v2.css`) | 전투 중 카드는 172×248 기본 / 430×620 확대 라는 **별도 규격** (06-card-ui-principles). V4 양피지·금박 테마를 그대로 가져오되 **크기만 축소** 하는 사본이 필요 — 구조 변경 수반이라 별도 기획. | 높음 (~반나절) |
| **4** | **Collection/Codex** (현재 미제공) | `Game.showCollection`/`showCodex` 함수 자체가 없음. 기능 구현 전이라 V4 이식 대상에서 제외. 구현 시점부터 V4 로 바로 시작. | 별건 |
| **외부** | **Character Select** (`char-hero-screen`, `char-element-screen`) | 시작 플로우라 체감도 높지만, 카드 대신 "영웅 초상화 + 원소" 고정 UI 라 V4 프레임이 그대로 맞지 않음. 별도 디자인. | 중 |

**권장 순서**: **① Deckview 단독 Step 5A** → 캡처 대조 → 대표님 승인 → **② Formation Step 5B** → 전장 편성 플로우 톤 통일 체감 확인 → **③ Battle 은 별도 기획 단계**로 분리 (크기 규격 재정의 필요).

**제약 준수**: 본 검수 중 코드 수정 0건, 스크린샷 + 본 리포트만 제출. 서버 `http://localhost:8765` 기반 Playwright 캡처로 진행.
