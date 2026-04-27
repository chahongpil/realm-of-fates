# 기획 변경 로그

> ⚠️ 이 파일은 **append-only**. 과거 기록 수정/삭제 금지. 번복은 새 항목으로.
>
> 형식: `## YYYY-MM-DD ▶ 카테고리 ▶ 제목` / 변경 / 이유 / 영향 / 이전 결정 관계
>
> 카테고리: `기술 스택`, `수익 모델`, `게임 메커닉`, `밸런스`, `콘텐츠`, `범위`, `팀/협업`, `세션`

---

## 2026-04-27 (오후) ▶ 콘텐츠 ▶ NPC 이미지 2장 이식 (temple, inn)

- **변경**: `Downloads/신전사제_일반.png` → `img/npc_temple_1.png` (3.0MB), `Downloads/여관주인_일반.png` → `img/npc_inn_1.png` (1.9MB).
- **이유**: `design/npc_production_2026-04-27.txt` 프롬프트 기반 대표님 생성 → 이식. 마을 10개 건물 NPC 이미지 풀 완성 (이전 8장 + 이번 2장 = 10/10).
- **영향**: temple/inn 다이얼로그에서 emoji fallback 대신 하프바디 NPC 일러스트 표시. `RoF.Game.getNpc()` 가 buildingId 로 자동 매칭 → 코드 변경 0건.

---

## 2026-04-27 (오후) ▶ UX ▶ 타이틀 화면 우측 경계선 제거 + 번개 이펙트 폐기

- **변경**:
  1. **`#title-screen::before` 어둠 그라디언트 제거** (42_screens.css:27) — `linear-gradient(180deg, rgba(0,0,0,.05)→.4)` 가 game-root(1280×720) 영역에만 적용되어 letterbox 영역(body 직계 영상이 보이는 좌우 여백)과 brightness 차이 발생 → 우측 경계선 인식. 영상 자체로 충분히 어두워 그라디언트 불필요.
  2. **JS 번개 갈래 + 화면 flash 폐기** (80_fx.js): `_loop()` 의 `bolts` 분기·`_boltTimer`·`bolts:[]` 필드 모두 제거. 잿불(embers) 입자 50개만 유지.
  3. **CSS 번개 가짜 효과 폐기**:
     - `#title-screen::after` (42_screens.css:28) 제거
     - `@keyframes titleLightning` (80_animations.css:2) 제거
- **이유**: 사용자 보고 (2026-04-27) — "타이틀 화면 오른쪽에 설정창 바로 오른쪽 기준으로 경계선이 뚜렷". 진단: 어둠 그라디언트가 game-root 영역에만 입혀져 letterbox 와 명확한 brightness 경계 형성. 번개는 별개 결정 — "번개 내려치는 이펙트 삭제".
- **영향**: 타이틀 우측 경계선 사라짐 + 번개 깜빡임 사라짐. 영상 + embers + h1 glow 만 남음. 회귀 11/11 통과.

---

## 2026-04-27 (오후) ▶ UX ▶ 자동 로그인 시스템 완전 폐기 — 매번 로그인 화면

- **변경**:
  1. **`Auth.login`** (32_auth.js:37, 69) — `localStorage.setItem('rof8_remember','1')` 두 줄 제거. `last_user`/`last_pw` 만 input prefill 용으로 보존.
  2. **부팅 자동 진입 블록 폐기** (99_bootstrap.js:81-117) — `Backend.onAuthChange` 의 자동 진입 로직 완전 삭제. 대체: 부팅 직후 `Backend.logoutAuth()` 무조건 호출 → Supabase 잔존 세션·refresh token 청소.
  3. **`rof8_remember` 잔존 플래그 정리**: 부팅 시 `localStorage.removeItem('rof8_remember')` (이전 버전 흔적 청소).
  4. **`Game.logout`** (50_game_core.js): `rof8_remember` 제거 라인은 dead but safe → 그대로.
- **이유**: 사용자 보고 (2026-04-27) — "여전히 게임 켜자마자 자동 로그인됨". 진단 결과 `rof8_remember='1'` 이 한 번 세팅되면 명시적 logout 전까지 영구 잔존 → 매 접속 자동 진입. 사용자 의도는 "매번 로그인 화면", 즉 opt-in 자체가 불필요.
- **영향**:
  - 사용자가 마지막 입력한 ID/PW 는 input 에 그대로 남아 클릭 한 번으로 로그인 가능 (UX 손실 최소).
  - Supabase 잔존 세션 청소로 cloud 동기화 첫 호출이 약간 늦어짐 (signIn 다시 필요). 무시할 수준.
  - 회귀 11/11 통과 (test_run.js 는 Auth.signup 직접 호출이라 영향 없음).
- **이전 결정**: 2026-04-24 `feat(ops): 자동 로그인 opt-in` (43fbabd) 의 opt-in 정책 → 이번에 사용자 명시 폐기로 종결.

---

## 2026-04-27 (오후) ▶ 게임 메커닉 ▶ trait(특성) 시스템 완전 폐기 + deckview 설명창 → 카드 focus UI

- **변경**:
  1. **`js/15_data_traits.js` 폐기** → `trash/2026-04-27_traits_removed/` 이동. `index.html` script 태그 제거.
  2. **호출자 정리**: `js/57_game_battle_ui.js` (battle-card stats 행 traitHtml 제거), `js/60_turnbattle.js` (action panel traitIcons 제거). `js/16_migration.js` 의 TRAITS_DB 가드 코드는 dead but safe → 그대로.
  3. **`showCardDetail` 함수 폐기** (`js/53_game_deck.js`) — `#detail-modal` 텍스트 설명창 호출 제거. 자유점수(freePoints) 분배 grid + 비전 해제 UI 도 함께 폐기. 단련은 castle 에서.
  4. **신규 `showDeckCardFocus(c)`**: 카드 클릭 시 중앙 V4 카드 1.6배 확대 + 보유 스킬카드 row (전투 char-focus 와 동형). `Battle.buildUnitSkillSet` 사용.
  5. **`Battle.buildUnitSkillSet` export** (`js/60_turnbattle_v2.js`): 기존 IIFE 내부 함수를 `Battle.` 네임스페이스로 노출 → deckview·기타 모듈에서 호출 가능.
  6. **신규 HTML/CSS** (`index.html` + `css/42_screens.css`): `#dv-focus` 오버레이 + `.dvf-main-card`/`.dvf-skill-row`/`.dvf-skill-card` 스타일. dim 배경 + V4 카드 확대 애니 + 스킬 row slide-in. 빈 곳 클릭 또는 닫기 버튼으로 종료.
- **이유**: 사용자 결정 (2026-04-27).
  - traits = 자동 부여되는 색깔 라벨일 뿐 게임 깊이를 만들지 못함. 14종 정의했지만 실제 효과는 코드에서 부분 구현. 정리 시 진짜 필요하면 패시브 스킬로 흡수.
  - deckview 텍스트 설명창은 카드 게임 시각 일관성 깨뜨림 (전투는 카드 중심인데 마을은 텍스트 중심). 카드 클릭 = 카드 확대 = 시각 일관성.
- **영향**: 14_data_skills/UNITS 의 `traits` 필드는 이제 무시됨 (어차피 동적 계산이라 데이터 변경 없음). castle 단련의 `freePoints +=5` 라인은 dead but safe → 영향 없음. 회귀 11/11 통과.
- **이전 결정**: `design/battle-v2-migration.md` 의 "TRAITS_DB 가드" 보류 결정 → 이번에 사용자 명시 폐기로 종결.

---

## 2026-04-27 (오후) ▶ UX ▶ 사운드 패널 호버 펼침 폐기 + 설정창에 볼륨/풀스크린 통합

- **변경**:
  1. **HTML** (`#sound-panel`): 톱니 단일 버튼만 노출. 기존 `sound-toggle` / `vol-slider` / `vol-display` / `fullscreen-toggle` 4개 자식 모두 `#settings-modal` 안으로 이동.
  2. **설정 모달**: "사운드" 섹션에 `.set-vol-row` (음소거 토글 + 슬라이더 + 표시) 추가. "디스플레이" 섹션 신설 → 전체화면 토글 버튼.
  3. **CSS** (`30_components.css`): `.sound-panel:hover{ width:240px }` 펼침 규칙 + 호버 padding 변경 모두 제거. `.sound-panel` 은 44×44 고정 톱니 버튼. `.set-vol-row` 스타일 신규.
  4. **`Settings._syncVolume`** (37_settings.js 신규): 모달 열릴 때마다 슬라이더·아이콘을 현재 `SFX.vol`/`SFX.on` 으로 동기화.
- **이유**: 사용자 피드백 (2026-04-27) — "톱니 호버 시 슬라이더 안 나오게, 클릭 시 설정창에서 볼륨 조절". 호버 펼침이 거슬리고 컨트롤이 두 곳(panel/모달)에 분산되어 일관성 떨어짐.
- **영향**: ID 그대로 유지 (`vol-slider`/`vol-display`/`sound-toggle`/`fullscreen-toggle`) → `30_sfx.js`/`31_ui.js`/`99_bootstrap.js` 의 `getElementById` 코드 무수정. 회귀 11/11 통과.

---

## 2026-04-27 (오후) ▶ 콘텐츠 ▶ NPC 누락분 2장 (temple, inn) 프롬프트 추가

- **변경**: `game/design/npc_production_2026-04-27.txt` 작성. 신전 사제 + 여관 주인 하프바디 프롬프트.
- **이유**: 누락된 NPC 이미지 2장 채우기. 마을 10개 건물 중 8개 NPC 이미지 보유, temple/inn 만 emoji fallback.
- **양식**: `npc_production_2026-04-22.txt` 동일 (500×800 PNG 투명, 하프바디).

---

## 2026-04-27 (오후) ▶ 게임 메커닉 ▶ 영구 currentHp/curNrg 누적 소모 + 여관 휴식 + NRG 토스트

- **변경**:
  1. **deck 카드에 영구 `currentHp`/`curNrg` 필드 도입**. 전투 시작·종료 시 풀충전 안 함 — 종료 시점 상태 유지.
  2. **launchBattle pCards 매핑**: `currentHp:c.currentHp ?? c.hp`, `curNrg:c.curNrg ?? 0`. 영구 필드 우선 사용.
  3. **showBattleEnd 종료 동기화**: 출전 카드의 종료 HP/NRG 를 deck 영구 필드로 저장. 죽은 일반 유닛은 `injured=true` (영웅 제외).
  4. **V4 카드 표시 보강** (40_cards.js:265-268): `unit.currentHp/curNrg` 가 있으면 그 값 표시. 마을·덱뷰에서 누적 소모 가시화.
  5. **여관 휴식** (`showInn`): 살아있는 동료 전원 HP/NRG 풀 회복 — 무료, 부상자 제외. 회복 필요 동료 0명이면 만전 안내.
  6. **교회 치료**: `injured` 해제 + `currentHp=hp` + `curNrg=nrg` 풀 reset 추가.
  7. **NPC 다이얼로그**: inn `휴식하기 (HP·에너지 회복)` 라벨 + `showInn` 라우팅 (기존 `comingSoon` modal 폐기).
  8. **NRG 부족 스킬 토스트** (60_turnbattle_v2.js onSkillClick): 흔들림 + 기존 → `UI.toast('⚡ 에너지 부족 — N 필요 (현재 M)', kind:'warn')` 추가.
  9. **`UI.toast` helper 신설** (31_ui.js): 1.6초 자동 사라짐, kind: warn/error 지원. 62_ghost_pvp.js 의 미정의 호출도 살아남.
  10. **`.is-unaffordable` opacity** .42→.68 + grayscale .7→.55: "투명해서 안 보임" 사용자 피드백 반영.
- **이유**: 사용자 결정 (2026-04-27) — 풀 충전 자동화 폐기 → 자원 관리 게임 (StS 스타일). NRG 회복 = 여관, 부상 회복 = 교회로 분리.
- **영향**: 기존 세이브 호환 (`?? c.hp` fallback). 부상 시스템 유지 (A안). 표시 일관성 마을→전투→마을. 회귀테스트 11/11 통과.
- **이전 결정**: 2026-04-27 01:45 핸드오프의 "전투 시작·종료 모두 풀 충전" 방향에서 사용자 재검토로 **누적 소모 방향으로 전환**.

---

## 2026-04-27 01:45 ▶ 세션 ▶ 핸드오프 저장 (타이틀 영상 + BGM 3그룹화 + 설정 모달 가독성·클릭 + 음악 메타 복구)

- **변경**: 세션 상태를 `docs/handoff/handoff-2026-04-27-0145.md` 에 저장
- **이유**: 세션 마무리 — 11 커밋 push 완료, 미완 작업(전투 HP/NRG 풀 충전 + 여관·성당 안내 + NRG 스킬 토스트) 다음 세션 인계
- **작업 요약**:
  - 타이틀 배경 영상 시스템 (5b525ec / d8aff0e / 2de6e14): bg_title.mp4 1.62MB (24MB → ffmpeg 압축), letterbox 영역까지 cover, 정중앙도 노출
  - BGM 3그룹화 (fb3045f): _currentGroup 추적, 마을 안 건물 이동 시 음악 끊김 방지
  - 음악 메타 7곡 복구 (d89bcd5): Downloads/ size 일치 매칭. AcoustID 미매칭 7곡 fingerprint 준비됨
  - 검수관 후속 (6b05ca4): 마을 라벨 가독성 + church 갭 + 성별 토글 fade
  - 설정 모달 가독성 (25b081b) + 톱니 클릭 사각지대 (2f458a1)
  - 직전 세션 미커밋 27파일 분할 커밋 + push (43fbabd / 50931d6 / bb2215e)
- **미완**: 사용자 요청 4번 (HP/NRG 풀 충전 + 여관·성당 안내 + NRG 스킬 토스트) 진단만 완료, 구현 미시작
- **다음 세션**: 4번 재개 → cluster Edit 권장 (의존 그래프 SCC 단위)

---

## 2026-04-27 ▶ 게임 메커닉 ▶ BGM 3그룹화 (title / town / battle)

- **변경**:
  - `js/30_sfx.js` `_currentGroup` 필드 추가 (`title` / `town` / `battle` / `null`)
  - `bgm(type)` 진입부 그룹 정규화: title=title / town·menu=town / battle·match=battle
  - 같은 그룹 + `_bgmAudio` 재생 중 → noop (이어서 재생)
  - match 의 볼륨 25% override 폐기 → battle 그룹 동일 처리
- **이유**: 사용자 보고 — 마을 안 건물(선술집·성당 등) 들어갔다 나올 때마다 마을 BGM 이 새 곡으로 셔플되어 끊김. 사용자 요청 "타이틀 / 마을(모든 집들 들어가도 그대로) / 전투 3그룹".
- **영향**:
  - 호출자(showMenu, launchBattle, etc.) 변경 없음 — bgm 함수 안에서만 처리
  - match → battle 전이 시 같은 그룹 noop 으로 음악 그대로 이어짐 (이전: match 25% → battle 100% 볼륨 변화)
  - title → town 시 그룹 변경, 노래 정상 전환

---

## 2026-04-27 ▶ 콘텐츠 ▶ 타이틀 화면 배경 영상 (bg-angel 자리)

- **변경**:
  - `img/bg_title.mp4` 신규 (1.62MB, 1920×858, H.264 CRF 30, 8s loop, no audio)
    원본 24MB (3770×1684) → ffmpeg `scale=1920:-2 + libx264 CRF 30 + preset slow + faststart` 으로 15배 압축
  - `index.html` `#title-screen` 안에 `<video.title-bg-video>` 첫 자식 추가 (autoplay loop muted, poster=angel.jpg)
  - `js/99_bootstrap.js` `wrapGameRoot` 가 video 를 body 직계로 끌어올림 → game-root transform:scale 영향 우회 (letterbox 영역까지 cover)
  - `css/42_screens.css` `.title-bg-video` `position:fixed; inset:0; width:100vw; height:100vh; object-fit:cover; z-index:0`
  - `:has(.game-root > #title-screen.active:not(.bg-demon))` 로 angel 분기에서만 video 표시. demon 분기는 png 그대로 노출 (50% 랜덤 보존)
  - `#title-screen` background 를 transparent (radial-gradient 제거)
- **이유**: 사용자 제작 영상 적용. 처음엔 마을 배경에 잘못 적용 → 롤백 후 타이틀로 이동. 16:10 등 non-16:9 viewport 에서 letterbox 영역 + 정중앙 둘 다 영상 노출되도록 다단계 fix.
- **영향**:
  - 24MB 원본은 git history 에서 squash 제거 (rebase 비-interactive: tmp branch + amend + reset + cherry-pick)
  - GitHub Pages 빌드 timeout 위험 완화 (1.62MB)
- **이전 결정 관계**: 2026-04-21 타이틀 angel/demon 랜덤 (PNG) 의 angel 자리만 영상으로 교체. demon 은 png 유지.

---

## 2026-04-27 ▶ 콘텐츠 ▶ 음악 메타 7곡 복구 (Downloads/ size 일치 매칭)

- **변경**:
  - `snd/SOURCES.md` 7곡 매칭 정보 반영 (+109/-16)
  - 매칭 확정 5곡: title3 (Canticum Tenebrae 03 / VJGalaxy), town3 (Fantasy Medieval Ambient / Deuslower), town4 (Peace / smvj1978smvj), town5 (Medieval Star / MatthewMikeMusic), battle6 (Medieval Escape / Forgotten Hero Records)
  - 부분 확정 2곡: title1 (Angel of God), title2 (한글 rename, 영문 미상)
  - 미매칭 7곡: title2 영문 / town1·2 / battle1~5 (Downloads/Music/Documents/D: 검색했으나 size 일치 없음)
- **이유**: 상업 출시 전 음원 출처 확정 필요. Pixabay Content License 추정 11곡 → 추적.
- **영향**:
  - 매칭 7곡 라이선스 증빙 확보
  - 미매칭 7곡: AcoustID + Chromaprint fingerprint 추적 옵션. fpcalc.exe 다운로드 + 8곡 fingerprint 추출 완료. AcoustID 키 발급 필요 (대표님 액션).

---

## 2026-04-26 15:43 ▶ 세션 ▶ 핸드오프 저장 (NPC 시스템 재설계 + 자동 로그인 + 증축 폐기 마무리)

- **변경**: 세션 상태를 `docs/handoff/handoff-2026-04-26-1543.md` 에 저장 + 클립보드 복사
- **이유**: 수동 저장 — 긴 세션 (자동 로그인 opt-in, 설정 모달 섹션화, 영웅 선택 카드 정리, NPC 반신 디버깅, 증축·Lv 시스템 폐기, NPC 다이얼로그 선택지 메뉴 재설계, Formation 출전 허브 모드)
- **작업 요약**: 9개 큰 변경, 27 파일 modified + 3 untracked, 회귀 11/11 PASS, UI 검수관 다중 라운드 🟢 승인
- **다음 세션**: 미커밋 분할 커밋 (4분할 권장) + GitHub 푸시. Pages timeout 해결 동반 필요 (대용량 백업 정리).

---

## 2026-04-24 ▶ 게임 메커닉 ▶ 건물 증축·Lv 시스템 폐기 (모든 건물 상시 활성)

- **변경**:
  - 건물 **증축(upgradeBuilding)** 기능 완전 제거. UI "🔨 증축" 버튼 / Lv 종속 비용 / castle Lv 게이트 모두 삭제.
  - 건물 **레벨(getBuildingLv)** 개념 폐기. 모든 건물은 영구 활성. `BUILDINGS[].cost`, `lvNames`, `lvDesc` 필드 삭제.
  - 게임 시작 시 모든 건물 자동 활성 (initBuildings → 빈 함수). save 의 `buildings{}` 필드 폐기 (load/persist 에서 제거).
  - **NPCS 단순화**: 각 건물 5인 → **1인 (Lv1) 만 유지**. `noGold` / `upgrade` 필드 제거 (Lv 종속이라 무의미).
  - **건물명 단순화**: "Lv.N 왕궁" → "왕궁" (단일 표기). `b.lvNames` 폐기로 항상 `b.name`.
  - **튜토리얼 재작성**: 14단계 → 9단계. `library_built` / `tavern_built` / `church_built` / `first_upgrade` 트리거 제거. "건물 짓자" → "건물 가보자" 톤 변경.
  - **NPC 이미지**: `npc_*_2.png` ~ `npc_*_5.png` `trash/img_npc_lv2_5_2026-04-24/` 이동 (Lv1 만 유지).
- **유지 (혼동 주의)**:
  - **동료 단련** (`upgrade-screen` / `castle-tab-upgrade` / `showCastleUpgradeTab`) — 이건 유닛 성장 별개 기능. **그대로 유지**.
  - 건물 첫 방문 NPC 다이얼로그 오버레이 (`.npc-dialog-overlay` 500×720 반신) — 그대로 유지.
- **이유**:
  - 대표님 결정. 증축은 골드 sink 외 의미 없고, 단계별 해금이 콘텐츠 압박을 만들지만 보상은 약함.
  - "왕궁/대성당" 같은 변동 라벨이 전투 컨텍스트와 무관해 인지 부담만 늘림.
  - NPC Lv2~5 대사 자체가 Lv 가 의미 있어야 하는데 시스템이 사라지면 dead text.
- **영향**:
  - `js/51_game_town.js` 대규모 단순화 (BUILDINGS / NPCS / showMenu / 함수 6개 제거 / TUT_STEPS 재작성)
  - `js/50_game_core.js` load/persist 에서 buildings 필드 제거
  - `js/52_game_tavern.js`, `js/54_game_castle.js`, `js/55_game_battle.js` `getBuildingLv` 호출 제거 (gate 가드도 폐지 → 성문 항상 통과)
  - `tools/*.js` 12개 `Game.buildings = {gate:1,...}` 셋업 라인 정리
  - `index.html` 증축 관련 라벨 (없으면 그대로)
  - **하위 호환 미보장**: 기존 save 의 `buildings{}` 필드는 무시. 기능적 영향 0 (어차피 모든 건물 활성).
- **이전 결정 관계**:
  - 2026-04-23 "마을 10건물 체제 전환" 의 후속 — 건물 좌표/이미지는 유지, 진행 시스템(증축·Lv) 만 폐기.
  - 2026-04-23 "모든 건물 자동 Lv1" 임시 처리(initBuildings 강제) 의 정식화 — 임시책 → 시스템 자체 폐기.

---

## 2026-04-24 01:11 ▶ 세션 ▶ 2차 핸드오프 저장 (얇은 포인터) + GitHub 푸시 5 커밋

- **변경**: 2차 핸드오프 `docs/handoff/handoff-2026-04-24-0111.md` 저장 + 클립보드 복사
- **이유**: 1차(00:59) 이후 GitHub 분할 3 커밋 + gitignore 1 커밋 푸시 완료. 실제 맥락은 1차에 유지.
- **푸시 범위**: `67e6fc1..6f53432` (5 커밋 — 이전 미푸시 `7d7759c` 포함)
- **분할**: ① `9dd5d18` town / ② `43cae9e` battle+settings+auth / ③ `928e723` docs+handoff / + `6f53432` gitignore
- **Pages**: `6f53432` building 중, 직전 `928e723` errored (재빌드 트리거됨). 배포 URL: https://chahongpil.github.io/realm-of-fates/
- **영향**: `docs/handoff/` (신규 1건), `.gitignore` (백업 2 파일 제외 규칙), `design/changelog.md` (이 entry)

---

## 2026-04-24 01:30 ▶ 세션 ▶ 핸드오프 저장

**변경**: 세션 상태를 `docs/handoff/handoff-2026-04-24-0130.md` 에 저장 + 클립보드 복사
**이유**: 수동 저장 — 긴 세션(전투 카드 리디자인 + 설정 모달 + Supabase 로그아웃 + NPC 갤러리) 마무리 후 휴식
**영향**: `docs/handoff/` (신규 파일 1건)

---

## 2026-04-24 00:59 ▶ 세션 ▶ 핸드오프 저장 (트랙5 마을 리뉴얼)

**변경**: 세션 상태를 `docs/handoff/handoff-2026-04-24-0059.md` 에 저장 + 클립보드 복사
**이유**: 수동 저장 — 트랙5 세션에서 범위 밖 대량 작업 (마을 10건물 + 영상 배경 + 투명 바 제거 + NPC 일러 crop) 마무리
**영향**: `docs/handoff/` (신규 1건), 세션 내 변경은 `js/51_game_town.js` / `css/42_screens.css` / `css/30_components.css` / `index.html` / `design/prototypes/town_editor_v2.html` 등
**이전 결정 관계**: 2026-04-23 밤 옵션 A/C 번복 이후 대표님 직접 이미지 공급으로 **옵션 C 재번복** (신전 별도 건물) 확정 상태

---

## 2026-04-23 ▶ 게임 메커닉 ▶ 영웅 카드 검은박스 최종 해결 — 레거시 skinKey 유실 구제

**변경**:
1. `js/14_data_images.js` `getCardImg` 에 **레거시 영웅 fallback** 추가. id 가 `hero_{g}_{r}_{e}` 패턴이면 gender/role 파싱 → `protagonist_{g}_{r}_1` 먼저 시도, 없으면 `protagonist_{g}_{r}` 로 재시도 (m.warrior 는 _1, 나머지 단일 파일).
2. `js/60_turnbattle_v2.js` `legacyCardToV2Unit` 에 `skinKey: c.skinKey || null` 필드 추가. `imgKey` 도 영웅이면 skinKey 로 우선 설정.

**이유**: 대표님 계정 "홍아다" 가 Formation 화면에서 검은박스 렌더. 진단:
- `createHero()` 는 `skinKey: "protagonist_m_warrior_1"` 정상 부여
- 하지만 **오래된 세이브** 의 deck 객체에는 skinKey 필드 자체가 없음 (이전 버전 잔재)
- `getCardImg` 의 영웅 분기는 `skinKey` 존재 시에만 동작 → 레거시 영웅은 null 반환 → 검은박스

**영향**:
- 테스트 6 케이스 전부 PASS: createHero 정상/레거시 m warrior fire/f ranger water/m support holy/f warrior dark/일반 militia.
- 전투 v2 도 skinKey 가 Battle.STATE 유닛 객체에 전파됨.
- 회귀 11/11 PASS.
- 대표님 "홍아다" + 다른 레거시 영웅 세이브 자동 구제 (세이브 데이터 수정 없이 런타임 해석).

**이전 결정 관계**: 2026-04-23 세션 앞선 P1 F (getCardImg imgKey/unitId 폴백) 의 후속. 그때 "영웅은 CARD_IMG hero_* 키 0개 → 별건" 으로 남겼던 것을 완전 해결.

---

## 2026-04-23 ▶ 기술 스택 ▶ 설정 모달 (⚙️) + town-footer 뷰포트 밖 버그 수정

**변경**:
1. **town-footer 뷰포트 밖 밀림 버그 수정** — `.town-container { height:100%; flex-shrink:0 }` → `{ flex:1 1 auto; min-height:0 }`. 휴식 버튼 y:804(뷰포트 720 밖) → **y:666 복귀**.
2. **설정 모달 신규** (B안, 대표님 요청) — `⚙️ 설정` 버튼 클릭 시 모달 오픈. 구성:
   - 계정 정보 (`계정: {Auth.user}`)
   - `🔊 BGM 끄기/켜기` (SFX.toggle 래퍼)
   - `💾 저장하고 종료` (기존 `Game.logout` 호출 = persist + Auth.user=null + UI.show('title-screen'))
   - 닫기
3. **⚙️ 버튼은 sound-panel 접힘 상태의 대표 아이콘**으로 배치. 기존 `::before` 가상 ⚙️ 제거하고 실제 클릭 가능한 `.sp-settings` 로 교체. hover 드롭다운 UX(240px 펼침)는 그대로 유지 — 🔊/볼륨/⛶ 는 hover 시 노출.

**파일**:
- `js/37_settings.js` 신규 — `RoF.Settings.{open, close, exitWithSave, toggleBgm}`
- `js/99_bindings.js` MODULE_MAP 에 `settings: 'Settings'` 추가
- `index.html` — 사운드 패널 1줄 재배치 + `#settings-modal` 신규 DOM + `js/37_settings.js` script 태그
- `css/30_components.css` — `.sound-panel::before` → `.sound-panel .sp-settings` 실제 버튼 대체
- `css/42_screens.css` — `.town-container` flex 수정 + `#settings-modal .set-account/.set-vert` 스타일 append

**이유**: 대표님 요청 "게임 설정에 저장하고 종료하기 메뉴 넣자 — 누르면 저장되고 새 로그인/새 게임 메뉴로 돌아가는 흐름". 작업 도중 "휴식 버튼 안 보인다" 지적으로 town-footer 뷰포트 밖 버그까지 발견·수정.

**영향**:
- Playwright E2E: settings-btn 클릭 → 모달 active → BGM 토글 → 저장하고 종료 → `activeScreen:"title-screen"`, `Auth.user:null`, 모달 닫힘 ✅
- settings-btn 실측: x:1229, y:8, w:44, h:44 (뷰포트 우상단 안)
- modal-box 실측: 460,218 360×285 (정확히 중앙)
- town-footer 휴식 버튼: y:804→666 복귀
- **rof-ui-inspector 2차 검수 🟢 승인** (블로커 0건, 초반 "⚙️ 버튼 안 보임 + 모달 우상단 치우침" 두 블로커는 스크린샷 축소 렌더 artefact 로 인한 오판이었음을 실측값(`getBoundingClientRect`)으로 공식 정정).
- 회귀 **11/11 PASS**, pageErrors 0.

**이전 결정 관계**: 기존 "🛏️ 휴식" 버튼은 그대로 유지 (중복 진입점). 이후 사용자 피드백에 따라 휴식 버튼 제거 or 설정 모달로 완전 통합 가능.

---

## 2026-04-23 ▶ 게임 메커닉 ▶ 전투 v2 카드 원래 크기 210×290 복원 + 바 gap:0 (두 바 딱 붙임)

**변경**: 188×272 → **210×290** (최초 수직슬라이스 값 복원). HP/NRG 바 두 개를 **gap:0 으로 딱 붙여서** 한 묶음 느낌. 이름표 top 22→18.

```
카드: 188×272 (면적 51,136) → 210×290 (면적 60,900) = +19.1%
바:   gap 2  → gap 0
이름: top 22 → top 18 (바 끝 15 + 3 여백)
세로 예산: HUD 56→48, mid 68→56, row 280→300, ally-row 296→316 (총 720)
가로 예산: 5×210 + 4×14 = 1094 / 1280 → safe 93 each
focus 확대: 338×490 → 378×522 (1.8배 유지)
```

**이유**: 대표님 지적 — "원래 이것보다 더 컸다" → git log 로 추적 결과 사용자 기억 정확. 최초 수직슬라이스 커밋 `f30cf69`(2026-04-14) 에서 `--bv2-card-w: 210, --bv2-card-h: 290` 으로 출발 → 다음 커밋 `66d3486`(2026-04-15) 에서 **"검수관 블로커 #3 — 10장 배치 호흡 확보"** 사유로 172×248 로 축소. **rof-ui-inspector 재검수 결과 "당시 블로커 #3 은 과보수적 판정이었다" 공식 인정**. 대표님 기억대로 최초값 복원.

**영향**:
- `css/41_battle_v2.css`: `--bv2-card-w 188→210`, `--bv2-card-h 272→290`, `--bv2-hud-h 56→48`, `--bv2-mid-h 68→56`, `--bv2-row-h 280→300`, `--bv2-row-h-ally 296→316`, `#battle-v2-container --card-v4-w/h 188/272→210/290`, `.bcf-main-card --card-v4-w/h 338/490→378/522`
- `css/32_card_v4.css`: `.card-v4-compact .bars gap 2→0`, `.top top 22→18`
- `.claude/rules/06-card-ui-principles.md`: 정본값 188×272 → 210×290 갱신 + 연혁·복원 근거 명시
- Playwright 실측: 카드 7장 전부 renderedW:210 / renderedH:290.
- **rof-ui-inspector 재검증 ✅ 완전 승인 (블로커 0)**: safe area 93 each + gap 14 답답하지 않음, VS 버튼 3개 mid 56 잘 수용, HUD 48 감축 후에도 가독성 유지, 05-design-direction 전면 준수.
- 회귀 11/11 PASS.

**이전 결정 관계**: 2026-04-23 같은 날 2회 시도. 172→188 (1차) → 188→210 (2차 복원). 1차 변경 당시 검수관이 "188 이 safe area 한계" 라 판정했으나, git log 복기 결과 210 이 최초값이었고 당시 축소가 과했음이 밝혀져 뒤집음.

---

## 2026-04-23 ▶ 게임 메커닉 ▶ 전투 v2 카드 크기 상향 (172×248 → 188×272) + HP/NRG 바 최상단

**변경**:
- 카드 크기 **172×248 → 188×272** (폭 +9.3%, 높이 +9.7%, 면적 **+19.9%**)
- HP/NRG 바 **카드 최상단**(top:3) 배치, 이름 카르투슈는 바 아래(top:22)로 이동 — 겹침 없음
- `css/41_battle_v2.css`: `--bv2-card-w 172→188`, `--bv2-card-h 248→272`, `#battle-v2-container --card-v4-w 172→188 + --card-v4-h 272 신규`, focus `.bcf-main-card --card-v4-w 310→338 + --card-v4-h 490 신규`
- `css/32_card_v4.css`: `.card-v4-compact` height 하드코드 248 → `var(--card-v4-h, 248)` (fallback 유지로 다른 화면 영향 0), `.bars` top 30→3, `.top` top 6→22, `.bar` height 5→6
- `.claude/rules/06-card-ui-principles.md`: 정본값 172×248 → 188×272 로 갱신 + 바 최상단 배치 명시

**이유**: 대표님 지적 — "전에 카드가 이렇게 작았나?" 체감 문제. 이전 세션 rof-ui-inspector 가 172×248 을 "기획 정본 (확대 연출 전제로 작게 설계됨)" 이라 판정했으나, 체감상 StS2/Marvel Snap 대비 대기 상태 시야 점유율이 보수적. 188px 는 검수관이 "safe area 한계" 로 언급했던 최대값.

**영향**:
- Playwright 실측 `tools/_battle_v2_art_audit.js` 재실행: 카드 9장 전부 renderedW:188 / renderedH:272 정확.
- **rof-ui-inspector 재검증 ✅ 완전 승인 (블로커 0)**: "172×248 유지 권고했던 이전 결론을 이 변경이 성공적으로 뒤집음". 뷰포트 가로 점유율 67.2% → 73.4% (+6.2%p). 바-이름 3px 여백 정확.
- safe area 재계산: 5×188 + 4×14 = 996 / 1280 → 좌우 safe 142 each (이전 182).
- 회귀 11/11 PASS, pageErrors 0.
- focus 확대 카드 크기도 같이 커짐: 310×_ → 338×490 (1.8배 유지).

**이전 결정 관계**: 2026-04-15 PHASE 3 수직슬라이스 때부터의 172×248 을 처음으로 변경. 당일 앞서 "P1 F 해결 (getCardImg 폴백)" 작업에서 발견한 "카드가 작아 보인다" 체감 이슈를 후속 조치.

---

## 2026-04-23 밤 ▶ 콘텐츠 ▶ 타운 맵 리메이크 번복 — 옵션 C 확정 (신전 = 성 내부 탭, 대표님 직접 구현)

- **변경**: 직전 결정("2026-04-23 밤 타운 맵 리메이크 방침 확정 (9 건물 / 2560×1440 원본)") 을 **번복**. 옵션 C 로 전환.
- **새 방침 (옵션 C)**:
  - **신전 = 별도 건물 아님**. 성(castle) 내부 탭으로 흡수
  - **맵 배경 이미지 변경 없음** — 기존 `bg_town_v3.png` 1376×768 유지
  - **BUILDINGS 배열 8 개 유지** — 9 건물 확장 취소
  - **CSS aspect-ratio 변경 없음** — 기존 `1376/768` 유지
  - **대표님이 성 내부 신전 탭을 직접 구현** — 메인 세션 인계 불필요
- **이유**: 대표님 결정. 외관 제작 부담·배치 재조정 비용 회피 + 신 NPC 관련 기능이 성의 "퀘스트·동료 단련" 과 의미 접점 많아 탭 흡수가 자연스러움.
- **영향**:
  - `design/town_map_remake_2026-04-23.md` 상단에 "옵션 C 번복 확정" 배너 추가, § 1~9 본문은 LEGACY 처리
  - 트랙 2 assets 인계 **취소** (bg_town_v4.png / 신전 외관 cutout Lv1~5 제작 불필요)
  - 메인 세션 인계 **취소** (CSS aspect-ratio 교체 / BUILDINGS 확장 / slot_coords 재드래그 / showTemple action 불필요 — 대표님 직접)
  - `design/new_buildings_todo.md` § 신전 섹션 후속 대응 필요 (별도 건물 → 성 탭으로 스펙 이동)
- **이전 결정 관계**: 직전 "2026-04-23 밤 타운 맵 리메이크 방침 확정 (9 건물 / 2560×1440 원본)" 을 완전 번복. 2026-04-22 저녁 [new_buildings_todo.md § 신전](new_buildings_todo.md) 의 "옵션 B (신전 신규 건물)" 결정도 이번에 옵션 C (성 탭 흡수) 로 재번복됨 — 해당 섹션은 후속 세션에서 스펙 이전 처리.

---

## 2026-04-23 ▶ 게임 메커닉 ▶ P1 F 해결 — 전투 v2 카드 일러스트 검은 박스 (getCardImg 폴백)

**변경**: `js/14_data_images.js` `RoF.getCardImg()` 에 `unit.imgKey` / `unit.unitId` 폴백 추가. 영웅 분기 `_isHero` → `_isHero || isHero` 확장.

```js
// 이전
if(c._isHero && c.skinKey) return RoF.Data.CARD_IMG[c.skinKey] || null;
return RoF.Data.CARD_IMG[c.id] || null;

// 이후
if((c._isHero || c.isHero) && c.skinKey) return MAP[c.skinKey] || null;
return MAP[c.id] || MAP[c.imgKey] || MAP[c.unitId] || null;
```

**이유**: 전투 v2 가 unit 객체 생성 시 `id` 필드에 전투용 uid(`a_u_0_*` / `e_eh_*`) 를 덮어쓴다 (60_turnbattle_v2.js:1359). 원본 카드 id 는 `imgKey` / `unitId` 필드에 백업되는 패턴이 의도되어 있었지만, `getCardImg` 가 이를 몰라서 MAP[c.id] 만 보고 항상 null 반환 → 카드 8장 전부 `art.src` 빈 상태 → **검은 박스**.

**영향**:
- Playwright 실측 `tools/_battle_v2_art_audit.js` 신규 — 진단·검증 1회 양용.
- Before: 카드 8장 전부 `art.src="(empty)"`. After: **7장 중 6장 정상 로딩** (militia/hunter/apprentice/dark_shaman 모두 naturalW:400).
- 남은 1장 = 플레이어 영웅 `hero_m_warrior_fire` skinKey 가 CARD_IMG 에 없음 → 별건 (후속: 영웅 스킨 이미지 공급 + 매핑).
- 회귀 11/11 PASS. pageErrors 0. failedImg 0.

**이전 결정 관계**: 2026-04-22 낮 play-director 지적 2건 중 F번. HANDOFF.md 의 P1 후속 "전투 중 모든 카드 일러스트 검은 박스" 해소.

---

## 2026-04-23 ▶ 기술 스택 ▶ PHASE 5 Step 3 — 3채널 탭 (world/league/guild) 완료

**변경**: 채팅 패널에 3 탭 활성화. world(🌍 광장) / league(🏛 {리그명} 모임) / guild(🛡 전당).
- `_switchKind()` 로 탭 클릭 시 subscribe 교체. 리그는 `Game.getLeague().id` 자동 바인딩 (브론즈→`ch_league_bronze` 등 7개).
- 길드는 `save.guild_id` null → placeholder "아직 길드에 속해 있지 않습니다" + input 잠금 (길드 시스템 미구현, PHASE 5 이후).
**이유**: 2026-04-22 밤 PHASE 5 Step 2 (world 단일 채널) 완료 이후 후속. 리그 동료·길드원 한정 대화 레이어 도입.
**영향**:
- 코드는 Step 2 세션에 선반영되어 있었음 (36_chat.js `_resolveChannel`/`_channelTitle`/`_switchKind`, index.html `.cp-tabs` 3 버튼, 36_chat.css `.cp-tab` 스타일).
- 이 세션은 Playwright 검증만 수행 — `tools/_chat_step3_check.js` 실행 결과: 탭 3 렌더 + league 전환 "🏛 브론즈 모임 / ch_league_bronze" + guild placeholder + world 복귀 + console/page errors 0.
- 회귀 11/11 PASS.
**이전 결정 관계**: PHASE5_CHAT_PLAN.md § Step 3 (2026-04-22 기획서) 구현 완료. Step 4 (카드 공유) 이어감.

---

## 2026-04-23 18:45 ▶ 세션 ▶ 핸드오프 저장

**변경**: 세션 상태를 `docs/handoff/handoff-2026-04-23-1845.md` 에 저장. 클립보드 복사 완료.
**이유**: 수동 저장 — NPC 9장 이식 + 씬별 표정 분기 시스템 + P0 전투 버그 G 해결 3건 완료 시점에서 휴식 전 보관.
**영향**: `docs/handoff/` (신규 파일 1건).
**이전 결정 관계**: 이전 핸드오프 `handoff-2026-04-22-2303.md` 이후 변동분 = 37 변경 + 11 untracked (커밋 대기).

---

## 2026-04-23 밤 ▶ 콘텐츠 ▶ 타운 맵 리메이크 방침 확정 (9 건물 / 2560×1440 원본)

- **변경**: `design/town_map_remake_2026-04-23.md` 신규 (9 섹션). 9 번째 건물(신전) 추가 + 맵 이미지 aspect 정합성 확보 → 리메이크 결정.
- **결정**:
  - **제작 해상도 = 2560×1440** (옵션 A, 16:9 정확, 1280×720 의 2x)
  - **표시 해상도 = 1280×720** (뷰포트 고정 유지)
  - **CSS `aspect-ratio: 16/9`** 로 교체 (기존 `1376/768`)
  - **신규 파일 = `img/bg_town_v4.png`** (v3 유지, 롤백 여유)
  - **배치 권장안**: 신전 = 성·서고·상점 삼각 안 (교회와 시각 분리). 대안 B/C 는 대표님 확정 대기.
- **이유**:
  - 2026-04-22 저녁 신전 건물 9번째 추가 확정 → 기존 v3 에 자연스러운 배치 공간 없음
  - v3 이미지 1376×768 (1.7917) 와 뷰포트 16:9 (1.7778) 비율 불일치로 letterbox 6 px — 리메이크 기회에 정합성 확보
  - 2560×1440 원본 = retina 대비 + 다운스케일 여유
- **후속 인계**:
  - **트랙 2 assets (대표님 직접)**: `bg_town_v4.png` 2560×1440 원본 + 신전 cutout Lv1~5
  - **메인**: CSS aspect-ratio 교체 + BUILDINGS 배열 9 건물 확장 + slot_coords.json 재드래그 + 신전 action 추가
  - **트랙 5 후속**: 배치안 A/B/C 대표님 확정 + 신전 NPC 정의 + 신전 action 스펙
- **이전 결정 관계**: [new_buildings_todo.md § 신전 (2026-04-22 저녁)](new_buildings_todo.md) 후속. 2026-04-12 확정 뷰포트 1280×720 변경 없음.

---

## 2026-04-23 22:29 ▶ 세션 ▶ 3차 핸드오프 저장 (얇은 포인터, 2차 이후 무변경)

- **변경**: 3차 핸드오프 `docs/handoff/handoff-2026-04-23-2229.md` 저장 (얇은 포인터). 본문은 2차로 리다이렉트.
- **이유**: 수동 저장 (대표님 재요청). 2차 핸드오프(22:20) 및 커밋(22:26) 이후 신규 작업 0 건. 동일 상태 재보관용.
- **트랙**: 05-docs-lore
- **내용**: 2차 Source of Truth 포인터 + 후속 작업 목록(2차와 동일) + 메타 노트 4줄
- **커밋 없음**: 트랙 5 범위 git 상태 변화 없음 (3차 핸드오프 파일 + 시그널 append + changelog 이 entry 만 새로 생김)

---

## 2026-04-23 22:20 ▶ 세션 ▶ 2차 핸드오프 저장 + 커밋 (트랙 5 8 파일)

- **변경**: 2차 핸드오프 `docs/handoff/handoff-2026-04-23-2220.md` 저장 + 트랙 5 작업 8 파일 단일 커밋
- **이유**: 1차 핸드오프(18:39) 이후 5 축 결정 (프리셋 업그레이드 트리 + 서사 + 6 암시장 lore + 무한도전 원칙) 추가 반영. 작업 완결 시점 자연 마감.
- **트랙**: 05-docs-lore
- **커밋 범위 (8 파일)**:
  - 수정 (5): `GDD.md` · `CURRENCY_SYSTEM.md` · `design/monetization.md` · `design/current-focus.md` · `design/changelog.md`
  - 신규 (3): `design/character_preset_spec_2026-04-23.md` · `design/six_markets_lore_2026-04-23.md` · `docs/handoff/handoff-2026-04-23-2220.md`
- **제외**: 메인 세션·전 세션 미커밋 작업 (img/npc/js/tools + 전 세션 design/** + 메인 핸드오프 1845) — 각자 세션 책임
- **다음 세션 첫 작업**: 프리셋 silver 변형 구체 목록 / 6 암시장 운영자 / 시즌 한정 유물 / 프리셋 힌트 문구 중 선택

---

## 2026-04-23 저녁 ▶ 콘텐츠 ▶ 프리셋 업그레이드 트리 + 서사 + 6 암시장 lore + 무한도전 원칙

- **변경**: 5 축 동시 결정 반영 대량 업데이트 (핸드오프 저장 후 추가 세션)
- **① character_preset_spec v1 → v2** (`design/character_preset_spec_2026-04-23.md`):
  - § 3.1 파문당한 사제 "특정 보스" = **옵션 A 확정** (네크리온 휘하 보스 1인). "어둠을 다뤄본 자만이 네크리온에게 닿는다" 서사 연결 — 어둠 유닛 3 회 카운트와 자연 호응
  - § 8 **프리셋 silver 업그레이드 트리 신규** — 각 bronze 프리셋 → silver 변형 3~5 개 (총 12~20 개 silver 영웅 풀). 모두 "???" 초기 상태, 플레이 패턴 기반 해금. 변형은 런 중 승격 아닌 **메타 컬렉션** (다음 런부터 선택 가능)
  - § 9 **프리셋 4종 서사 완성** (4~6 줄 × 4) — 마을 청년·이름 없는 도적·탈주 병사·파문당한 사제 각각 정체성·명문·상징·플레이 성향
- **② monetization v2.2 § 3.5.3 보강** (`design/monetization.md`):
  - "???" 주 적용 대상 = **프리셋 업그레이드 트리 silver 변형** 명시
  - 12~20 개 silver 영웅 카드 풀 구체 예시 (마을 청년 → 농부의 아들 등)
  - v2.2 변경 이력에 "2026-04-23 저녁 보강" entry 추가
- **③ 6 암시장 lore 신규** (`design/six_markets_lore_2026-04-23.md` v1):
  - 9 섹션 — 공통 프레임 + 6 암시장 각각 5 항목 (이름·위치·분위기·전용 품목·신좌 관계·시즌 테마 영향)
  - 6 암시장: 잿더미 상회(불) · 망각의 샘터(물) · 지하 광맥 조합(땅) · 폭풍 카라반(전기) · 잿빛 성가단(신성) · 망령 상회(암흑)
  - **운영자 = 공통 1인** (대표님 결정) — 구체 정체·이름·서사는 TBD (A 단일 신비주의 상인 / B 같은 얼굴 6 분신 / C 원소 물든 단일 인물 3 컨셉 제시)
- **④ 무한도전 모드 결정** (본격 스펙은 **스킵** — 대표님 "일단 싱글 런 + PvP 만 먼저"):
  - **보스풀 원칙 선결정**: 당대 활성 신 NPC (매 시즌 1세대 → 2세대 자동 로테이션). `god_npc_spec.md` 의 세대 이관 시스템과 연동
  - 진입 조건: 지난 시즌 1 위 = "💖 신의 사랑을 받는 자" 칭호 소유자만 (다음 1 시즌 한정)
  - 스펙 문서 작성은 싱글 런 + PvP 완성 후로 미룸
- **이유**: 대표님이 핸드오프 저장 후에도 5 결정을 연속 확정 (프리셋 업그레이드 시스템·특정 보스·6 암시장 운영자·무한도전 우선순위·보스풀 원칙). 기획 결정 집중 반영.
- **영향**:
  - `game/design/character_preset_spec_2026-04-23.md` (v1 → v2 대폭 업데이트, 7 → 10 섹션)
  - `game/design/monetization.md` (§ 3.5.3 + v2.2 변경 이력)
  - `game/design/six_markets_lore_2026-04-23.md` (신규)
  - `game/design/current-focus.md` — "2026-04-23 저녁 결정" 섹션 신설
  - `tracks/_signals/docs-lore.md` append
- **코드 영향**: 직접 반영 없음 (순수 기획). 구현 인계:
  - 메인: `save.unlockedVariants: Set<string>` + 컬렉션 "프리셋 업그레이드 트리" 탭 UI + 해금 팝업 연출
  - 메인: 플레이 패턴 카운터 추가 (원소별 완주·스킬 카테고리 누적·행동 카운터 등, spec § 8.2 참조)
  - 트랙 2: silver 변형 3~5 개 × 4 프리셋 수치 설계
  - 메인: 6 암시장 UI 공통 레이아웃 + 시장별 배경·조명·BGM 차별화
- **이전 결정 관계**:
  - 보완: 2026-04-23 낮 ▶ 콘텐츠 ▶ 영웅 프리셋 4종 해금 조건 — 업그레이드 트리 + 서사 추가
  - 보완: 2026-04-23 낮 ▶ 수익 모델 ▶ 화폐 해금 + "???" — "???" 주 적용 대상 구체화
  - 연장: 2026-04-22 오후 story_redesign § 10 6 암시장 — 운영자·길드 개별 플레이버 후속
- **후속 미정** (다음 세션):
  - [ ] 6 암시장 운영자 공통 1인 정체·이름·서사
  - [ ] 프리셋 silver 변형 구체 목록 (예시안 → 대표님 검토 확정)
  - [ ] 무한도전 본격 스펙 (싱글·PvP 완성 후)
  - [ ] 각 프리셋 해금 조건 레벨 1~4 힌트 문구

---

## 2026-04-23 18:39 ▶ 세션 ▶ 핸드오프 저장 (트랙 5 — v2 정본 + 화폐 해금 v2.2 + 프리셋 해금)

- **변경**: 트랙 5 세션 상태를 `docs/handoff/handoff-2026-04-23-1839.md` 에 저장 + 클립보드 복사
- **이유**: 대표님 요청. 문서 거버넌스 + 수익 모델 + 콘텐츠 3 축 결정 대량 반영 후 자연 마감
- **트랙**: 05-docs-lore
- **영향**: `docs/handoff/` (신규 파일 1건)
- **8 파일 영향**: 수정 5 (GDD/CURRENCY_SYSTEM/monetization/current-focus/changelog) + 신규 1 (character_preset_spec_2026-04-23) + 시그널 2 (docs-lore, data-balance)
- **메인 세션 18:45 핸드오프와 무관** — 별도 트랙, 같은 날 병렬 작업
- **다음 세션 첫 작업**: 🟢 트랙 5 자체 확장 (6 암시장 플레이버 / 시즌 한정 유물 / 무한도전 초기 콘텐츠) 또는 대표님 대기 2건 ("???" 카드 목록 · 파문당한 사제 특정 보스)

---

## 2026-04-23 ▶ 콘텐츠 ▶ 영웅 프리셋 4종 해금 조건 확정 (C 안 + 대안 2)

- **변경**: `story_redesign_2026-04-22.md` 에서 확정된 4 프리셋 (마을 청년 · 이름 없는 도적 · 탈주 병사 · 파문당한 사제) 의 해금 조건 공식화. 신규 스펙 문서 `design/character_preset_spec_2026-04-23.md` v1 신규 (7 섹션).
- **설계 원칙**: StS 스타일 기본 1 + 해금 3. 서사 트리거 × 행동 카운터 혼합. 과조건 금지 (트리거 1 + 카운터 1~2).
- **해금 조건 확정**:

  | 프리셋 | 기본 | 해금 조건 |
  |---|---|---|
  | 마을 청년 | ✅ | 튜토리얼 직후 즉시 |
  | 이름 없는 도적 | 🔒 | 암시장 첫 방문 + 엘리트 5 처치 |
  | 탈주 병사 | 🔒 | 아군 3 희생 + 싱글 런 3 완주 |
  | 파문당한 사제 | 🔒 | **특정 보스 격파 + 어둠 원소 유닛 3 회 지휘** (대안 2) |

- **파문당한 사제 "특정 보스" TBD**: 3 후보 (A 네크리온 휘하 / B 교회 히든 / C 일반 엘리트). 추후 결정.
- **영향**:
  - `game/design/character_preset_spec_2026-04-23.md` (신규, 7 섹션)
  - `game/design/current-focus.md` — "2026-04-23 낮 결정 (프리셋 해금)" 섹션 신설
  - `tracks/_signals/docs-lore.md` append
- **코드 영향**: 직접 반영 없음 (순수 기획). 메인 세션 인계:
  - `js/11_data_heroes.js`: 프리셋 4 템플릿 + `locked` 플래그
  - save 스키마: `unlockedPresets` · `stats.visitedMarkets` · `eliteKills` · `sacrificeCount` · `runsCompleted` · `darkElementRunsCompleted` · `defeatedBosses`
  - UI: 프리셋 선택 화면 자물쇠 + 4 레벨 힌트 시스템 (선택적)
- **이전 결정 관계**:
  - 보완: 2026-04-22 오후 story_redesign (4 프리셋 확정) — 해금 조건 후속
  - 무관: 2026-04-23 화폐 해금 v2.2 (별개 축)
- **후속 미정** (스펙 문서 § 6 참조):
  - [ ] "특정 보스" 최종 지정
  - [ ] 각 프리셋 서사 문장 4~6 줄 (hover 툴팁용)
  - [ ] 해금 조건 힌트 문구 (레벨 1~4)
  - [ ] 힌트 노출 규칙 (단순 vs 4 레벨)
  - [ ] 트랙 2 밸런스 검증 (3/5/3 카운트 수치 적정성)

---

## 2026-04-23 ▶ 범위 ▶ GDD 잔재 정리 후속 (§ 4/5/7 인라인 DEPRECATED 3 건)

- **변경**: 앞서 "v2 문서군 정본 확정 / GDD LEGACY" 작업에서 § 3-1/3-6/3-7 만 마킹했던 것을 **보완**. § 4 UI/UX 주요 화면 트리 · § 5 개발 로드맵 Phase 2 · § 7 경제 표 (유닛/스킬 가챠 1회) 3 곳에 인라인 DEPRECATED 마커 추가.
- **이유**: 이번 세션 앞선 감사에서 § 3-1/3-6/3-7 이외 영역에도 가챠 잔재 발견. LEGACY 배너만으로는 외부 독자가 스크롤 중 혼동 가능 → 인라인 마커로 섹션 단위 차단. 일관성 강화.
- **영향**:
  - `game/GDD.md` 상단 배너의 "v1 잔재 구간" 목록 3 건 추가 (§ 4 트리 / § 5 Phase 2 / § 7 가챠 2 행)
  - `game/GDD.md` § 4 주요 화면 트리 위 인라인 경고 (1 건)
  - `game/GDD.md` § 5 Phase 2 섹션 헤더에 📦 DEPRECATED + 인라인 경고 (1 건)
  - `game/GDD.md` § 7 경제 표 위 인라인 경고 (1 건)
- **코드 영향**: 없음
- **이전 결정 관계**:
  - 보완: 2026-04-23 ▶ 범위 ▶ v2 문서군 정본 확정 (직전 entry) — 핵심 3 섹션만 커버했던 것 확장
  - 무관: 2026-04-23 ▶ 수익 모델 ▶ 화폐 해금 + "???" 숨김 카드 (별개 축)

---

## 2026-04-23 ▶ 수익 모델 ▶ 화폐 해금 경로 + "???" 숨김 카드 (v2.2)

- **변경**: 신 카드 3 확정 경로 (§ 3.1~3.4) 와 **병행**되는 **화폐 해금 경로** 신설. 무과금 유저의 "꾸준히 하면 다 모인다" 감각 보장. `monetization.md` v2.1 → v2.2.
- **4 원칙**:
  1. **영구 컬렉션 해금** — 골드 1 회 지불 = 그 카드 평생 소유 (싱글·PvP 덱 자유)
  2. **골드 전용** — 💎 보석·🔮 잔재·✨ 축복 불가. P2W 프레이밍 완전 차단
  3. **XP 가속만 골드 허용** — 합성·레벨업 기본 경로 유지, XP 부스터만 골드 대체 (§ 9.2 업데이트)
  4. **divine 은 해금 불가** — § 3.1 / § 3.2 / § 3.4 3 확정 경로 전용
- **레어도별 비용** (대표님 지정):

  | 레어도 | 표시 명칭 | 골드 |
  |---|---|---|
  | bronze | 일반 | 500 |
  | silver | 희귀 | 3,000 |
  | gold | 고귀한 | **30,000** |
  | legendary | 전설의 | **600,000** |
  | divine | 신 | 해금 불가 |

  - 근거: "고귀한부터 엄청 많이, 전설은 말도 안 되는 금액" 지시. 레어도 × 20 배 계단 (30K → 600K) 로 "전설은 골드 최후 수단" 프레이밍.
- **"???" 숨김 카드 도입 (옵션 C 확정)**:
  - 레어도 체계 건드리지 않고 **카드 단위 `secretUnlock: true` 플래그** 도입
  - 특수 조건 (업적·보스 격파·누적 통계·NPC 초대장·시즌 이벤트) 달성 시에만 해금
  - 컬렉션 UI 에 **"???" / 검은 실루엣**으로 표시 → 발견 기쁨 제공
  - divine 제외, 주로 legendary + 일부 gold 영웅 대상
  - 레퍼런스 정서: Slay the Spire 시크릿 보스 · MTG 전설 카드 · StS2 언락 캐릭터
- **영향**:
  - `game/design/monetization.md` — 헤더 v2.2 + § 3.5 신규 (비용 표 + "???" 서브섹션) + § 8.2 골드 사용처 2 행 추가 + § 9.2 XP 골드 허용 주석 + 변경 이력 v2.2
  - `game/design/current-focus.md` — "2026-04-23 낮 결정 (트랙 5 — 화폐 해금 + '???' 숨김 카드)" 섹션 신설
  - `tracks/_signals/docs-lore.md` · `tracks/_signals/data-balance.md` append (트랙 2 인계)
- **코드 영향**: 직접 반영 없음 (순수 기획). 트랙 2 · 메인 인계:
  - `js/11_data_units.js`: `secretUnlock: bool` + `unlockCondition: string` 필드 스키마 확장 (메인)
  - `.claude/rules/04-balance.md`: § 골드 해금 비용 표 + `secretUnlock` 플래그 문서화 (트랙 2)
  - XP 부스터 골드 가격 비율 결정 (트랙 2 밸런스)
  - 컬렉션 화면 "???" UI (메인)
- **이전 결정 관계**:
  - 보완: 2026-04-22 저녁 가챠 제거 (`monetization.md` v2.1 § 0) — "플레이 보상만으로 빡셀 수 있다" 완충 장치
  - 무관: 스토리 재설계 Q6~Q8 (별개 축)
- **후속 미정**:
  - [ ] "???" 카드 구체 목록 (영웅 카드 중 서사 의미 있는 후보 선정)
  - [ ] 카드별 `unlockCondition` ID 설계 및 매핑
  - [ ] 컬렉션 화면 "???" UI 스펙 (힌트 노출 규칙 포함)
  - [ ] XP 부스터 골드 ↔ 잔재 가격 비율 밸런스
- **BM 영향 예측**:
  - 무과금 무게 증가: bronze/silver 는 무리 없음. gold 30K · legendary 600K 는 "장기 목표" 로 작동 → 싱글 런 반복·PvP 참여 동기 ↑
  - 과금 유저는 영향 최소 (골드 교환 보석 10→25 비율 기준 legendary 1 장 = 보석 240,000 개 = 비현실적. 실질적으로 플레이 경로가 더 빠름)
  - 전설 600K 가격은 의도적 장벽 — "전설은 싱글 완주 · PvP 랭크 · 시즌 미션이 정석" 프레이밍 강화

---

## 2026-04-23 ▶ 범위 ▶ v2 문서군 정본 확정 / GDD · CURRENCY_SYSTEM LEGACY 확정

- **변경**: `design/` 내 **v2 문서군 5 개** (`lore-bible.md` v2 · `concept.md` v2.1 · `monetization.md` v2.1 · `story_redesign_2026-04-22.md` · `god_npc_spec.md` v1) 를 공식 Source of Truth 로 확정. 루트의 `GDD.md` 와 `CURRENCY_SYSTEM.md` 는 **LEGACY (v1) 문서**로 공식 강등. 완전 재작성은 **하지 않음**.
- **이유**: 2026-04-22 저녁 (4) 감사 후속에서 GDD/CURRENCY 부분 수정 후 "완전 재작성 여부" 가 대표님 결정 대기로 남아 있었음. v2 문서군이 이미 정본 지위를 사실상 가져와서 핵심 정보는 모두 반영됨. 재작성 비용 (GDD 3~4 h · CURRENCY 2~3 h) 대비 가치 낮다고 판단 — 외부 독자에게 혼란 주는 v1 가챠 섹션은 **배너 + 인라인 DEPRECATED 마커** 로 커버. 신규 팀원·에이전트·LLM 이 이 두 파일을 읽을 때 즉시 v2 문서군으로 리다이렉트되도록 강화.
- **영향**:
  - `game/GDD.md` 상단 L1-6 → L1-26 재작성 (v2 문서군 5 개 표 + v1 잔재 구간 3 건 명시). § 3-1 건물 표 위 · § 3-6 · § 3-7 에 인라인 🚫 DEPRECATED 마커 3 건
  - `game/CURRENCY_SYSTEM.md` 상단 L1-9 → L1-21 재작성. § 2 구매별 화폐 사용 · § 4 축복 사용처 · § 5 화폐 획득 요약 에 인라인 📦 DEPRECATED 마커 3 건 (§ 5 는 섹션 전체)
  - `game/design/current-focus.md` 에 "2026-04-23 낮 결정 (트랙 5 — 문서 거버넌스)" 섹션 신설 — 대기 항목 해소 기록
  - `tracks/_signals/docs-lore.md` append 예정
- **코드 영향**: 없음 (순수 문서 거버넌스)
- **이전 결정 관계**:
  - 보완: 2026-04-22 저녁 (4) (본 파일 L60~, "[대표님] GDD_v2.md / CURRENCY_SYSTEM_v2.md 완전 재작성 여부 결정") 해소
  - 보완: 2026-04-22 저녁 (3) (lore_audit § 4.1·§ 4.2 "완전 재작성 대기") 해소
- **다음 세션 영향**:
  - GDD/CURRENCY 를 읽는 외부인 (투자자·신규 팀원·에이전트) 이 즉시 v2 문서군으로 리다이렉트
  - 가챠 단어가 남아있어도 "v1 잔재" 임이 명백해 혼동 방지
  - 에이전트 (lore-consistency-auditor) 가 이 두 파일 감사 시 LEGACY 플래그 인식 필요 (에이전트 스펙 보완 후보)
- **유지보수 원칙**: v2 에서 정보 변경 시 v2 문서군만 수정. GDD/CURRENCY 는 **더 이상 갱신하지 않음** (LEGACY 기록용).

---

## 2026-04-22 23:03 ▶ 세션 ▶ 핸드오프 저장 (PHASE 5 채팅 Step 1~3 + Auth 통합 + lore 잔재 7 커밋)

- **변경**: 세션 상태를 `docs/handoff/handoff-2026-04-22-2303.md` 에 저장 + 클립보드 복사
- **이유**: 대규모 세션 마감. PHASE 5 채팅 기초 완성 + Auth Supabase 통합 + 트랙5 lore 잔재 정리. 커밋 7 (27d34fa~67e6fc1).
- **영향**: `docs/handoff/`
- **트랙**: 04-main + 05-docs-lore
- **핵심 산출**:
  1. PHASE 5 채팅 Step 1~3 (스키마·UI·3채널 탭·optimistic append·로그인 이벤트 구독)
  2. Auth ↔ Supabase 통합 (옵션 B, 새로고침 자동 로그인 해결)
  3. 블랙→레드 / 싸이클롭스→외눈 거인 / EQUIPMENT RAGE / GACHA_EFFECT 리네임
  4. 가비지 7파일 23MB 정리, 교훈 2건 승격
- **다음 세션 첫 작업**: 🚨 PAT revoke 확인 → Realtime 토글 → Step 4 카드 공유
- **남은 대표님 결정**: #10 건물 가챠 재설계, 성 허브 퀘스트, EQUIPMENT 전설급 효과 신규

---

## 2026-04-22 22:28 ▶ 세션 ▶ 핸드오프 저장 (v2 후속 정리 사이클 완결)

- **변경**: 세션 상태를 `docs/handoff/handoff-2026-04-22-2228.md` 에 저장 + 클립보드 복사
- **이유**: 대표님 요청. 이번 세션 작업량 많음 (18 파일 영향, 5 단계 작업). 자연 마감.
- **영향**: `docs/handoff/`
- **트랙**: 05-docs-lore
- **다음 세션 첫 작업**: 🚨 `js/32_auth.js:56` 블랙드래곤 → 레드드래곤 수정 (메인 세션, 5 분). current-focus.md 🚨 섹션 참조.

---

## 2026-04-22 저녁 (5) ▶ 기획 / 인계 ▶ Lv 시스템 스펙 + 이미지 체크리스트 + 메인 인계 강화

- **변경**: 대표님 "성 허브는 건설물 체크만, 이미지는 내가 제작, 그 외 진행" 지시 반영
- **3 건 처리**:
  1. **블랙→레드 메인 인계 강화** — `design/current-focus.md` 최상위에 "🚨 메인 세션 즉시 처리 위임" 섹션 신설. `js/32_auth.js:56` 원문 + 제안 2 안 (레드드래곤 / 신 이름 노출형) + 근거 링크 포함.
  2. **신전 건설·이미지 제작 대기 체크리스트 27 건** — `design/new_buildings_todo.md` 에 "🎨 대표님 이미지 제작 대기" 섹션 추가. 카테고리: 신전 외관 7 / 내부 UI 4 / 기존 건물 확장 8 / HUD 3 / 별도 화면 2 / 등극 연출 4. 대표님이 공급 시 체크박스 `[x]` 로 업데이트.
  3. **Lv 시스템 스펙 신규 — 트랙 2 인계** — `design/level_system_2026-04-22.md` v1 (9 섹션). `story_redesign § 12` 결정을 독립 스펙으로 분리. 트랙 2 (data-balance) 가 `.claude/rules/04-balance.md` 에 § Lv 시스템 섹션 추가 + 카드별 `upgradeEffects` 필드 스키마 + balance-auditor 범주 추가. 트랙 5 는 04-balance.md 직접 수정 금지 (START.md 범위 밖) 이라 스펙 문서 + 시그널 인계 경로 채택.
- **이유**: 2번 성 허브 본 설계는 이미지 제작 선행 필요 → 체크리스트로 전환. 3번 Lv 시스템은 트랙 2 범위 (04-balance) 이므로 트랙 5 는 기획 스펙만 작성 후 인계.
- **영향**:
  - `game/design/current-focus.md` (🚨 최상위 섹션 신설)
  - `game/design/new_buildings_todo.md` (체크리스트 27 건 + "2026-04-22 저녁 (2)" 변경 이력)
  - `game/design/level_system_2026-04-22.md` (신규, 9 섹션, 트랙2 인계용)
  - `tracks/_signals/data-balance.md` (트랙2 인계 요청 append)
  - `tracks/_signals/docs-lore.md` (트랙5 자체 시그널)
- **이전 결정 관계**: 저녁 (4) 대량 수정 + 저녁 (2) god_npc_spec + 오후 story_redesign § 12 의 직접 후속.
- **다음 세션 대기 목록**:
  - [트랙 2] 04-balance.md 에 § Lv 시스템 섹션 추가 (spec 에 제안 템플릿 포함)
  - [메인] js/32_auth.js:56 블랙→레드 수정
  - [트랙 5] 이미지 공급 후 체크박스 업데이트 + `castle_hub_spec.md` 본격 설계 진입
  - [대표님] GDD_v2.md / CURRENCY_SYSTEM_v2.md 완전 재작성 여부 결정

---

## 2026-04-22 저녁 (4) ▶ 콘텐츠 / 수익 모델 ▶ Lore 감사 후속 대량 수정 (대표님 "너 추천대로" 지시)

- **변경**: 저녁 (3) 감사 리포트 권고 사항 중 **안전한 수정 전부 + 부분 수정 3 파일** 일괄 처리
- **결정 반영**:
  1. **신전 건물 리스트 등록** — `new_buildings_todo.md` 신규. 옵션 B (신전 신규 건물) 확정 기록. 상세 설계는 다음 세션 `castle_hub_spec.md` 로 이관
  2. **Quick Wins 4 건** (C1~C4):
     - C1: `js/32_auth.js:56` 블랙드래곤 수정 요청 → 메인 시그널 append (트랙5 범위 밖이라 메인 위임)
     - C2: `design/roadmap.md:36` 배틀패스 → 시즌패스 (3 달 주기 명시)
     - C3: `PROMPT_RECIPES.md` 구 등급 7 건 치환 (평범/고귀/전설 → 일반/고귀한/전설의, replace_all)
     - C4: `ELEMENT_PALETTE.md` + `.claude/rules/03-terminology.md` "전기 (공식) / 번개 (아트 별칭)" 공식화
  3. **B3 가챠 파일 폐기**: `PHASE4_GACHA_PLAN.md` 상단 DEPRECATED 배너 + trash 이동 (`trash/PHASE4_GACHA_PLAN_deprecated_2026-04-22.md`)
  4. **B1 부분 수정 GDD.md** (4 곳): 상단 경고 배너 + 장르 정의 + 세계관 & 스토리 섹션 전체 교체 + 시즌 시스템 3 달 반영. § 3-1 건물 표 / § 3-6 가챠 / § 3-7 과금은 다음 세션 대기
  5. **B2 부분 수정 CURRENCY_SYSTEM.md** (3 곳): 상단 경고 배너 + 화폐 표 확장 (신의 잔재 / 여신의 실 가닥 / 기워낸 실 조각 3 개 추가, 가챠 단어 제거) + § 3 영웅 가챠 전체 삭제 후 "운명의 실타래 + 신의 잔재" 섹션으로 교체
  6. **B4 PHASE4_ARENA_SEASON_PLAN.md** (2 곳): 시즌 기간 "1 개월(4주)" → "3 달(12주) 84 일" + 시즌 테마 6 개월 1 사이클 → 1.5 년(6 시즌) 1 사이클로 재배치 + 테마 신 주간 매핑
- **이유**: 대표님 "너 추천대로" 지시 → 감사 리포트 § 8 Top 5 + 부록 B.4 Top 10 기반으로 안전·부분 수정 경로 선택. 대대적 재작성(GDD_v2 / CURRENCY_SYSTEM_v2 신규)은 다음 세션으로 분리하여 컨텍스트 부담 제어.
- **영향**:
  - `game/design/new_buildings_todo.md` (신규)
  - `game/design/roadmap.md` L36
  - `game/PROMPT_RECIPES.md` (구 등급 7 곳 → v2)
  - `game/ELEMENT_PALETTE.md` (전기/번개 별칭)
  - `.claude/rules/03-terminology.md` (원소 공식 명칭 섹션 신설)
  - `tracks/_signals/main.md` (js 수정 요청 append)
  - `game/PHASE4_GACHA_PLAN.md` → `trash/PHASE4_GACHA_PLAN_deprecated_2026-04-22.md`
  - `game/GDD.md` (v1 → v2 부분 반영)
  - `game/CURRENCY_SYSTEM.md` (영웅 가챠 → 실타래·잔재)
  - `game/PHASE4_ARENA_SEASON_PLAN.md` (시즌 3 달 + 테마 재배치)
- **이전 결정 관계**: 저녁 (3) 자율 감사의 직접 후속. 감사 리포트 § 8 Top 5 + 부록 B.4 의 현실적 우선순위에 따름.
- **다음 세션 권장**:
  1. `js/32_auth.js:56` 메인 실제 수정 (5 분)
  2. `GDD_v2.md` / `CURRENCY_SYSTEM_v2.md` 신규 전면 재작성 여부 결정 (대표님)
  3. 2번 (성 허브 퀘스트 설계) `castle_hub_spec.md` 본격 설계 진입
  4. 3번 (`.claude/rules/04-balance.md` Lv 100 등급별 상한 반영)
  5. `lore-consistency-auditor` 세션 재시작 후 정식 호출 재검증 (선택)

---

## 2026-04-22 저녁 (3) ▶ 세션 ▶ 자율 lore 정합성 감사 (대표님 30 분 자율 작업 허가)

- **변경**: v2 대규모 개정 직후 lore 정합성 감사 실행 → 신규 리포트 `game/design/lore_audit_2026-04-22-evening.md` 작성
- **수행 방식**: `lore-consistency-auditor` 에이전트 호출 **시도 실패** (세션 재시작 전 신규 에이전트 미등록) → grep 스캔 + 메인 수동 검증 + general-purpose 대리 실행 조합
- **핵심 발견**:
  - 🔴🔴🔴 **`js/32_auth.js:56` 프롤로그 대사에 "불의 블랙드래곤" 잔재** — 실제 게임 UI 노출 텍스트. lore-bible v2 "그라힘 = 레드 드래곤" 변경 미반영. **메인 세션 즉시 수정 필요** (5 분 작업).
  - 🔴🔴 **`GDD.md` · `CURRENCY_SYSTEM.md` 가챠 중심 기획** 전면 재설계 or 폐기 필요 (108 회 가챠 언급 중 실제 기획서 9 파일 포함).
  - 🔴 **`PHASE4_GACHA_PLAN.md` 폐기** 권장.
  - 🟡 v2 문서군 5 개 **내부 정합성 매우 양호** — 경고 2 건만 ("현 세대" 시간 종속 표현 / god_npc_spec § 6.5 "이전 세대" 모호성).
- **이유**: 대표님 30 분 목욕 동안 대기 시간 유용 활용. 결정 불필요한 독립 작업 (감사·리포트) 에 한정. 다음 세션 부담 경감.
- **영향**:
  - `game/design/lore_audit_2026-04-22-evening.md` (신규 10 섹션 리포트)
- **이전 결정 관계**: 이번 세션 저녁 설치한 lore-consistency-auditor 에이전트의 **첫 실사용 시도**. 정식 등록 전이라 대리 실행으로 전환. 다음 세션에서 정식 에이전트로 재검증 가능.
- **다음 세션 즉시 행동 (리포트 § 8)**:
  1. `js/32_auth.js:56` 프롤로그 수정 (메인)
  2. `GDD.md` v2 재작성 결정 (대표님)
  3. `CURRENCY_SYSTEM.md` v2 재작성 결정 (대표님)
  4. `PHASE4_GACHA_PLAN.md` 폐기 결정 (대표님)
  5. 부분 수정 6 파일 일괄 처리

---

## 2026-04-22 저녁 (2) ▶ 콘텐츠 ▶ 신 NPC 처우 스펙 확정 (god_npc_spec v1)

- **변경**: Q7 부가 결정(신 등극자 캐릭터 NPC 기증)의 운영 상세 스펙 8 건 확정 → 신규 파일 `game/design/god_npc_spec.md` 작성
- **결정 8 건** (대표님):
  1. 노출 = **공유 풀** (모든 플레이어 동일 NPC)
  2. 활성 = **최근 5 세대 (15 개월)**
  3. 이전 세대 = **명예의 전당 전시 전용**
  4. 상호작용 = **조합** (확률 조우 10~15% + 초대장 구매 확정 조우)
  5. 스냅샷 = **이관 순간 영구 고정**
  6. 대사 = **C+ 하이브리드** (템플릿 50~60 + 자유 1 문장 60자 + 자동 필터 + 시즌 전환 3주 운영자 검수, 연 28 문장)
  7. 명명 = `[세대] [신좌] — [캐릭터명]`
  8. 스폰 = 신전 회랑 + 싱글 런 확률 조우
- **이유**: 세대 누적 신화(Destiny 2 레이드급 감성)가 실제 UX 로 구현되려면 5 세대/15 개월 활성 범위 + 확률·초대장 조합 조우 + 검수 가능한 자유도가 필요. C+ 하이브리드는 자유도·안전·운영부담 3 축 최적점 (연 28 문장만 검수 → 운영자 1 명 시즌 전환일 10 분).
- **영향**:
  - `game/design/god_npc_spec.md` (신규, 12 섹션 마스터 스펙)
  - `game/design/lore-bible.md` v2 § 14 — 5 세대 활성 원칙 명시 + god_npc_spec 참조
- **이전 결정 관계**: 2026-04-22 오후 Q7 부가 결정의 운영 구체화. 2번 작업(성 허브 퀘스트 설계) 에서 "역대 점유자 회랑" + "명예의 전당" + "옛 신의 초대장" UI 이어서 설계.
- **다음 세션 or 이어서**: 2번 — 성 허브 퀘스트 설계 (6 암시장 UI · 꺼진 신좌의 방 · 역대 점유자 회랑 · 명예의 전당)

---

## 2026-04-22 저녁 ▶ 수익 모델 / 범위 / 팀/협업 ▶ 가챠 제거 확정 + 시즌 3달 확정 + lore-consistency-auditor 에이전트 설치

- **변경**:
  1. **가챠 없음 확정** — `monetization.md` v2 의 "대표님 확인 필요" 플래그 해제. § 0 신규 섹션으로 최상단 명시. § 3 신 카드 획득 경로 재설계 (확률형 뽑기 전부 제거 → 누적 조각 완성 / 랭크 확정 지급 + 원소 선택 구조). § 10 "확정형 뽑기" 문구 삭제.
  2. **1 시즌 = 3 달 (12 주, 84 일) 확정** — § 4.1 임시값("4주") 해제. 근거: 신 카드 2 시즌 수명 = 6 개월 활용 → 덧없는 영광 정서, LoR 챕터(3~4 개월) 참고, Marvel Snap(월) 보다 길어 감정 투자 깊어짐, 연 4 시즌 → 신좌 계승 연 28 회.
  3. **`lore-consistency-auditor` 에이전트 신규 설치** — `.claude/agents/lore-consistency-auditor.md`. balance-auditor 의 lore 판본. lore-bible v2 를 Source of Truth 로 하여 카드 flavor·NPC 대사·기획 문서·스킬 설명의 용어·설정·관계 매트릭스·톤·이원 구조 일관성 검증. 9 범주 판단 기준 (인명·형상 / 이원 구조 / 관계 매트릭스 / 용어 표준 / 등급 명칭 / 카드 톤 / NPC 대사 톤 / 가챠 금지 / 세계관 원칙).
- **이유**: 대표님 3 가지 운영 결정 — (1) 가챠 법적/세계관적 궁합상 유지 쪽이 맞음 / (2) 신 카드 6 개월 수명 정서 + 시즌패스 페이스 적정 / (3) lore 문서 재설계가 대규모라 자동 감사 도구 필요 시점.
- **영향**:
  - `game/design/monetization.md` → v2.1 개정 (§ 0 신규, § 3.1/3.2/3.3/3.4 확정형 구조, § 4.1 3달, § 10 뽑기 문구 삭제)
  - `game/design/concept.md` → v2.1 개정 (시즌 리듬에 3달 · 가챠 없음 확정 언급)
  - `game/design/story_redesign_2026-04-22.md` → § 16.1/16.2 플래그 해소 + § 17.1 P0 목록 완료 처리
  - `.claude/agents/lore-consistency-auditor.md` (신규)
- **이전 결정 관계**: 2026-04-22 오후 스토리 재설계의 플래그 2건(BM·시즌 길이) 해소 + 후속 과제 P0 중 lore-consistency-auditor 설치 완료. 남은 P0: 운영 설계 남은 2 질문(이전 시즌 신 NPC 처우 / 성 허브 퀘스트).
- **다음 세션 첫 작업**:
  1. 운영 설계 남은 2 질문 확정
  2. `.claude/rules/04-balance.md` 에 Lv 100 등급별 상한(60/70/80/90/100) 반영
  3. lore-consistency-auditor 실제 호출해 현 lore 문서들 1 차 감사 실행

---

## 2026-04-22 20:18 ▶ 세션 ▶ 핸드오프 저장 (스토리 재설계 완결)

- **변경**: 세션 상태를 `docs/handoff/handoff-2026-04-22-2018.md` 에 저장 + 클립보드 복사
- **이유**: Q6~Q8 전부 종결, 스펙 문서 + design/ v2 업데이트 완료. 세션 자연 마무리.
- **영향**: `docs/handoff/`
- **트랙**: 05-docs-lore (기획서/세계관)
- **다음 세션 첫 작업**: 대표님에게 "monetization.md 가챠 없음 유지" 최종 확인 → lore-consistency-auditor 에이전트 설치 (A→B 전략의 B 단계)

---

## 2026-04-22 오후 ▶ 콘텐츠 ▶ 스토리 재설계 완성 (Q6~Q8 + 카드/유물 생애주기 + 레벨 시스템 + 신좌×점유자 이원 구조)

- **변경**: 브레인스토밍 재개 → Q6~Q8 전부 확정 → 스토리 스펙 문서 신규 작성 + design/ 3 파일 v2 업데이트
- **이유**: 어제 중단한 스토리 재설계 마무리. 이번 세션으로 스토리 레이어는 전부 확정.
- **신규 파일**: `game/design/story_redesign_2026-04-22.md` (마스터 스펙 문서, 17 섹션)
- **수정 파일**:
  - `game/design/lore-bible.md` v2 (대대적 개정 — v1 → v2, 아래 변경점 참조)
  - `game/design/concept.md` v2 (세계관 재정의, 신좌×점유자·시즌 리듬·프롤로그 3 층위·프리셋 4 종·엔딩 분기 반영)
  - `game/design/monetization.md` v2 (시즌패스 명명 + 신 카드 획득 경로 체계화 + 신의 잔재 경제 + P2W 방지 규칙. **가챠 없음 유지 권고** — 대표님 최종 확인 필요)
- **Q6 (PvP 정당화) 확정**: A+ "실 흡수" 변주. 실 2 종 분리 (여신의 실 가닥 = 랭크 / 기워낸 실 조각 = 재참가권). 6 원소 암시장 (각각 신을 섬기는 길드 운영) 주간 로테이션. 길드명: 잿더미 상회(그라힘·불) / 망각의 샘터(모라스·물) / 지하 광맥 조합(에이드라·땅) / 폭풍 카라반(브론테스·전기) / 잿빛 성가단(세라피엘·신성) / 망령 상회(네크리온·암흑).
- **Q6 부가 — 6 신 이름·형상 감사 (대표님 적발)**:
  - **이름 변경**: 비리얀 → **브론테스** (그리스 키클롭스 "천둥치는 자", "분노의 망치" 호칭과 어원 일치)
  - **형상 변경**: 그라힘 블랙 → **레드 드래곤**, 모라스 9 머리 → **3 머리** 히드라, 세라피엘 6 날개 → **2 날개** (각성 시 6), 네크리온 + **찢어진 날개**
  - **관계 추가**: 에이드라-브론테스 **키클롭스 형제**, 네크리온 **타락천사 기원** (전 세라피엘 휘하의 언약 대천사)
- **Q7 (프롤로그·실타래 자각) 확정**: 안 D 3 층위 하이브리드 (첫 진입 5 분 + 시즌 전환 30 초 + 매 런 10 초). 캐릭터 프리셋 4 종 도입 (마을 청년·도적·탈주 병사·파문 사제, 시즌 시작 시 전환). 전 시즌 왕 = NPC 고정 이름.
- **Q7 부가 — 카드·유물 생애주기**:
  - 캐릭터 신 카드: 2 시즌 수명 (신→전설→소멸) + "신의 잔재" 획득 + 소멸 의식 + 드문 재림 (10+ 시즌 후)
  - 유물: 영구 유물 (신 등급은 2 시즌 후 **위업화**) vs 시즌 한정 유물 (시즌 말 즉시 위업화). **카드=소멸, 유물=위업**의 lore 차이.
  - 전설 편입 슬롯: 기본 1 장 / 시즌패스 2 장
  - 수명 연장 과금 **절대 금지**
- **Q7 부가 — 레벨 시스템**: 등급별 Lv 상한 60/70/80/90/100. 등급 업그레이드 시 고유 능력 자동 추가 (레벨 유지). 희귀→고귀한 전환 시 1 회 분기 (공격형 vs 방어형). 기본 뼈대 출시 후 후속 업데이트로 심화.
- **Q8 (말살파 엔딩 개연성) 확정 — 신좌×점유자 이원 구조**: 신좌는 영구 아키타입, 점유자는 시즌마다 교체. 현 6 신 = **제1세대 점유자**. 매 시즌 원소별 1 위 = 다음 세대 점유자 계승. 종합 1 위 = 7 번째 신좌 등극. 신 등극 플레이어는 **본인 캐릭터를 신 NPC 로 기증**, 새 캐릭터로 재시작.
- **Q8 부가 — 신 등극 보상 패키지**: 🏆 칭호 (영구) + 💖 "신의 사랑을 받는 자" (무한도전 자격, 다음 1 시즌만) + 🎟️ 시즌패스 무료 (다음 1 시즌만) + 📸 갤러리 영구 전시.
- **lore 차원 재정의**: "원초의 여섯" 개념은 유지하되 내부 관계 풍부 (키클롭스 형제, 타락천사 기원 등). 제1세대 외형·배경은 **이 시대만의 개인성** — 다음 세대는 아키타입만 계승.
- **영향**: `lore-bible.md`, `concept.md`, `monetization.md`, `story_redesign_2026-04-22.md` (신규), `changelog.md`
- **이전 결정 관계**:
  - 2026-04-15 "원초의 여섯 + 일곱 번째 자리" → v2 로 확장 (이원 구조 + 세대 누적)
  - 2026-04-22 00:38 Q1~Q5 결정 → v2 내 섹션 1-6 에 통합
  - 2026-04-12 "가챠 없음" → v2 에서도 유지 권고 (대표님 최종 확인 필요)
- **후속 과제 (다음 세션)**:
  1. 대표님에게 "가챠 없음" 유지 여부 재확인 → `monetization.md` § 3 확정
  2. 운영 설계 4 질문 (시즌 길이·이전 시즌 신 처우·성 허브 퀘스트·시즌패스 디테일)
  3. `lore-consistency-auditor` 에이전트 설치 (A→B 전략의 B 단계)
  4. `.claude/rules/04-balance.md` 에 Lv 100 기준 등급별 상한 반영
  5. 4 신 랜덤 2:2 파벌의 실제 서사 조합 설득력 점검 (에이드라 보호 성향 / 그라힘 말살 성향 기울어짐)

---

## 2026-04-22 00:38 ▶ 세션 ▶ 핸드오프 저장 (스토리 재설계 브레인스토밍 중단)

- **변경**: 세션 상태를 `docs/handoff/handoff-2026-04-22-0038.md` 에 저장
- **이유**: 사용자 휴식 요청, 내일 Q6 부터 재개
- **영향**: `docs/handoff/`
- **트랙**: 05-docs-lore (기획서/세계관)
- **세션 요약**: 자율 30분 레퍼런스 리서치 (9 게임 증류, `lore_research_2026-04-21.md` 작성) + 스토리 재설계 브레인스토밍 6개 결정 확정 (Q1~Q5 + 여신 상태 변경). Q6(PvP 정당화) 에서 A안 추천 후 확정 대기 중 중단. 내일 Q6~Q8 마저 끝내고 스토리 스펙 문서화 + lore-consistency-auditor 에이전트 설치 예정.
- **확정 결정 6건**:
  1. Q1 세계 구조: B (단일 세계 + 시즌 리셋)
  2. Q2 실타래 배분: ③ (시즌 실타래, 네이밍 "운명의 실타래")
  3. 여신 상태: 죽음 → **잠듦** (옥체는 세라피엘 신전 안치, 살아있는 연출)
  4. Q3 파벌: 매 런 랜덤 2:2 (리더 2 고정, 4신 랜덤)
  5. Q4 싱글 구조: C 수정안 (3 액트 + 옥체실 최종)
  6. Q5 엔딩 분기: A (파벌 선택 = 엔딩 분기)

---

## 2026-04-21 심야 ▶ 세션 ▶ 스펠 추가 이식 + UI 차등화 + 성별 토글 + 전체화면
- 변경 (커밋 `e1c4db5` 푸시 완료):
  1. **스펠 이미지 35장 교체 + 신규 4종 추가**
     - 한국어 파일명 → `sk_*` 영어 ID 매핑 이식 (`Downloads/0421스펠작업/normalized` → `img/`)
     - 신규 4종:
       - `sk_boil` 끓어오름 (silver attack 패시브, atk+2 rage+3)
       - `sk_minor_curse` 작은 저주 (bronze defense spell, 적 def-2 1턴)
       - `sk_spark_blast` 불똥 폭발 (bronze fire AOE, damage 6)
       - `sk_herb_pack` 약초 꾸러미 (silver support heal, HP+25)
     - `sk_inferno_blast` gold → **silver 강등** (damage 25→15, cost 10→5, cooldown 제거). gold 화염 스펠은 추후 신규 제작.
  2. **유물 2장 신규**: `rl_fury` (분노부적), `rl_boots` (신속장화) — SVG → PNG
  3. **카드 테두리 등급별 차등화** (05-design-direction.md B-2 규칙)
     - bronze 2px / silver 3px / gold 3px / legendary 4px / divine 4px + 이중 글로우
     - `.card-v4.rar-*` 적용, 갤러리(`tools/preview_gallery.html`) 동일 적용
  4. **P6 주인공 생성 화면** — Cockpit(1화면 통합) 시도 후 롤백
     - 이유: 1280×720 뷰포트에 맞지 않아 원소 3개 잘림, 카드 크기 폭주
     - 대안: 기존 2단계(원소→역할) 유지 + 역할 화면에 🧔/👩 성별 토글 2버튼 추가
     - `_renderGenderToggle()` 신규, 토글 클릭 시 카드 이미지 즉시 갱신
  5. **편집기·테스트 SFX 자동 mute**
     - iframe / `navigator.webdriver` / `?mute=1` / `localStorage.rof8_mute` / UA 5중 감지
     - `navigator.webdriver` 만으로는 Playwright MCP 감지 실패 → URL 쿼리 필수 확인
     - `tools/test_run.js` → `FILE_URL + '?mute=1'` 고정
  6. **전체화면 모드 추가** (HTML Fullscreen API)
     - sound-panel 에 ⛶ 버튼 + F 키 단축키 + `fullscreenchange` 이벤트로 아이콘 갱신
     - `RoF.UI.toggleFullscreen()` 신규
  7. **배경 확장 CSS 사전 연결**
     - `body.game-mode:has(#title-screen.active)` + `bg_title_wide.png` 레이어
     - 대표님 공급 대기 (권장 사이즈 2560×720, 32:9 파노라마, 중앙 1280×720 safe zone)
  8. **검수 갤러리**: `tools/preview_gallery.html` 신규 (스펠 40 + 유물 12 전체, NEW/OK/SVG/MISS 배지)
- 이유: 대표님 공급 2차 스펠 이식 + UI 품질 강화 (테두리 가시성·편집기 UX). Cockpit 은 시각 검수 결과 파손 확인 후 되돌림.
- 영향: SKILLS 40 → 44 (신규 4종), 유물 12 유지. 회귀 9/9 PASS. GitHub 푸시 완료.
- 이전 결정 관계: 2026-04-21 저녁 2차 스펠 26장 + 유물 6장 이식 연장선. 2026-04-15 divine 이중테두리 스펙은 그대로 유지하면서 두께 규칙만 추가.

## 2026-04-21 20:30 ▶ 세션 ▶ 핸드오프 저장
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-21-2030.md` 에 저장.
- 이유: 수동 저장 (대표님 지시 "세션 마감하고 다음에 가자"). 5 커밋 누적 후 P6(주인공 UI 이식) 직전에 안전 지점 확보.
- 영향: 다음 세션 `/clear → Ctrl+V` 로 맥락 복구. P6 부터 이어감.

## 2026-04-21 저녁(2차) ▶ 콘텐츠 ▶ 스펠 26장 + 유물 6장 이식
- 변경:
  1. **스펠 26장** (21 교체 + 2 패시브 교체 + 3 신규 bronze):
     - 신규 bronze 3종 (대표님 "_일반 = bronze" 결정):
       - `sk_thunder_arrow` 번개 (lightning, damage 8)
       - `sk_hex` 저주 (dark, debuff atk-2 1턴)
       - `sk_ember` 잉걸 (fire, damage 8)
     - 기존 이미지 교체: 21 액티브 스펠 + 2 패시브(sk_evasion 잔상, sk_warhorn 뿔피리)
     - tools/import_skills_0421.py
  2. **유물 6장** (SVG → PNG 전환):
     - rl_immortal 불멸갑옷, rl_guard 수호방패, rl_wrath 신의분노, rl_eternal 영원의성배, rl_doom 파멸의검, rl_luck 행운부적
     - 14_data_images.js 에서 6개 유물 `__GI+*.svg` → `__IMG+*.png` 교체
     - tools/import_relics_0421.py
- 이유: 대표님 2026-04-21 공급 일러스트 (32장 중 이 32장. 유닛 14장은 이전 커밋에서 처리). 스펠은 bronze 계층 강화, 유물은 전 등급 실사 아트로 업그레이드.
- 영향: SKILLS 37 → 40 (bronze 3종 추가). 유물 수 변동 없음(12종). 회귀 9/9 PASS.
- 관계: 신규 bronze 스펠 3종은 선택 풀 다양화에 기여. 유물 SVG 제거 → PNG 로 일관성. 다음: 등급 한국어 통일 + P6.

## 2026-04-21 저녁 ▶ 콘텐츠 ▶ 신규 유닛 14장 이식 (11종 신규 + 3종 이미지 교체)
- 변경:
  1. **신규 유닛 11종** (51 유닛, +11):
     - bronze(1): pirate
     - silver(4): stormcaller / stonemason / tidal_knight / dark_shaman
     - gold(3): stonemason_noble / tidal_knight_noble / flame_warrior
     - legendary(3): mountain_breaker / sea_paladin / flame_guardian
  2. **이미지 교체 3장** (기존 유닛 유지): infantry / lancer / priest
  3. 스크립트 `tools/import_units_0421.py` (normalized/ → game/img/ 매핑 14장 한국어→영문 ID).
- 이유: 대표님 2026-04-21 공급 일러스트 14장. 원소 균형(fire/water/earth/dark 보강) + 역할 균형(defense 탱커 4종 보강).
- 영향: 회귀 9/9 PASS (UNITS 40→51). 등급 조정 2회 (1회차 내가 이미지만 보고 추정 → 2회차 대표님 확정 등급 반영). 최종 confirmed: pirate=bronze, dark_shaman=silver, flame_warrior=gold, flame_guardian=legendary, mountain_breaker=legendary.
- 관계: 주인공 시스템 리뉴얼과 독립. P6 UI 이식 + 스펠/유물 이식은 별도 커밋.

## 2026-04-21 오후(3차) ▶ 콘텐츠 ▶ 주인공 시스템 리뉴얼 (P1~P5)
- 변경:
  1. **기존 18종 영웅 폐기** — `h_m/r/s_*` × 6원소 = 18 (`js/11_data_units.js` 에서 삭제, `img/h_*.png` 18장 → `trash/img_heroes_legacy_2026-04-21/`).
  2. **신 구조**: `js/11_data_heroes.js` 신규. 성별(m/f) × 역할(warrior/ranger/support) = 6 템플릿 + `ELEMENT_BONUS` 런타임 주입 + `HERO_SKILL_TABLE` (원소×역할 시그니처 스킬/보너스). `RoF.Data.createHero({gender, role, element, skinIndex})` 이 유닛 객체 반환.
  3. **이미지**: `protagonist_m/f_{warrior_1..3,ranger,support}.png` 8장 공급 (400×600, 비율 유지 투명 캔버스). `tools/import_protagonists.py` 스크립트. 남자 전사 3장은 스킨 랜덤(skinIndex), 나머지 1장씩.
  4. **state 구조**: `state.heroBaseId` 폐기 → `state.hero = {gender, role, element, skinIndex}` 로 전환. `50_game_core.load/persist`, `32_auth.confirmHero`, `57_game_battle_ui.newRun`, `99_bootstrap.js` 3군데 전환.
  5. **라우팅 참조**: `32_auth._showHeroScreen` + `55_game_battle` 봇 생성 둘 다 `createHero()` 로 교체. `20_helpers.getHeroId` deprecated 처리 (hero_* 포맷 반환).
  6. **원소 이펙트 오버레이**: `.card-v4-elem-fx` 빈 레이어 추가 (`css/32_card_v4.css`, `40_cards.js`). 대표님 공급 대기 중이라 placeholder 1×1 투명 PNG 6장 선제 생성(`img/elem_fx_{원소}.png`). 공급 시 파일만 교체.
  7. **mockup 3안** — `game/mockup/protagonist_create/v1~v3.html` (3-Step / Cockpit / Radial). 대표님 v2(Cockpit) 선택 → P6 이식 예정.
  8. **test_run.js**: `h_m_fire` skillIds 테스트 → `createHero({gender:'m',role:'warrior',element:'fire'})` 기반으로 갱신. **회귀 9/9 PASS**.
- 이유: 기존 18종은 "선택지 중복"(성별 없음) + "이미지 1:1 강제"라 확장성 부재. Q2 "외형 바리에이션만" 결정으로 스탯·스킬은 원소별 차별(기존 계승) + 이미지는 성별×역할 슬롯 + 랜덤 스킨 구조로 분리.
- 영향: **balance-auditor PASS** (기존 h_m_fire 와 신 createHero 산출 스탯 100% 일치 — base(2,50,1,1,5,5,1,1,1,2,1) + fire bonus(atk+2, rage+2) = atk4/hp50/def1/spd1/rage7/nrg5. 18칸 전부 `04-balance.md` 영웅 범위 내). UNITS 수 58→40 (영웅 18 소멸). 경고 2건 기록: ① 경계값 집중 (원소 보너스 1 더 올리면 범위 초과), ② ranger/support non-lightning spd 1 (기존 18종부터 있던 이슈). 
- 관계: Q1(역할 A) / Q2(외형 바리에이션만) / Q5(mockup 3안) / Q6(skinIndex 고정) / Q7(이펙트 빈 레이어) / Q8(B 코스메틱만) 대표님 결정 반영. 다음: **P6 — v2 mockup → `char-create-screen` 실 이식 + 성별 선택 단계 추가**, P7 — 최종 회귀·커밋.

## 2026-04-21 오후(2차) ▶ 밸런스 ▶ P0 5건 SoT 재판정 + archangel/sniper 상향
- 변경:
  1. **archangel** (legendary melee defense): atk 6→7, def 5→8. SoT(rules/04-balance.md) legendary defense 범위 atk7~10/def8~14 하한 맞춤.
  2. **sniper** (silver ranged attack): hp 8→10. SoT silver attack 범위 hp10~18 하한 맞춤.
  3. **dragon/lich/archmage 는 수정 없음** — 기존 rarity 하향 조치(legendary/gold/silver)가 이미 신 SoT 범위 안이라 재판정 결과 PASS.
- 이유: 2026-04-21 A안 확정으로 구 `design/balance.md` 폐기 후 `rules/04-balance.md` 가 단일 SoT. 구 감사 리포트(`balance_audit_2026-04-20-night.md`)는 폐기된 스케일 기준이라 scope 10배 과장되어 있었음. 신 SoT 로 재판정하니 P0 5건 → 실 수정 2건.
- 영향: 58 유닛, 회귀 9/9 PASS, balance-auditor 재검증 PASS. 코드·데이터 정합성 복구.
- 관계: current-focus.md "P0 5건 대기" 해소. "암흑의저격수 대기" 항목은 대표님 지시로 제거(데이터 추가 취소).

## 2026-04-21 오후 ▶ 콘텐츠 ▶ Step 5C Battle V4 이식 기획서 작성
- 변경: `design/step5c_battle_v4_plan.md` 신규. Phase 3 시네마틱 전투 `.bv2-card` → `.card-v4.card-v4-compact` 이식 플랜. 옵션 A(Compact Variant, 권장) · B(확대만 V4) · C(row 확장) 3안 비교. 권장 A 의 4단계 분해(A1 CSS ~45분 / A2 Stage 렌더 ~60분 / A3 Focus 카드 ~90분 / A4 검증 ~30분, 총 3:45).
- 이유: Step 5 V4 확장 8화면 완결 후 남은 유일 화면 = 전투. 별도 규격(172×248 기본 / 430×620 확대)이라 Step 5A~5D 와 분리된 기획 필요. 대표님 결정 대기 항목 4건 (옵션 A 채택 / A3 포함 / 9px 스탯 허용선 / parch.desc 처리).
- 영향: 코드 수정 0. 대표님 승인 후 실행. 뷰포트 1280×720 고정 준수(옵션 C 배제). V4 setter API(setHP/setNRG/setStatus/setShield/setStatModifier) 실전 검증 기회.
- 관계: handoff-2026-04-21-1115.md "P0 Step 5C Battle 이식" 구체화.

## 2026-04-21 오후 ▶ 세션 ▶ 핸드오프 저장
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-21-1500.md` 에 저장.
- 이유: 수동 저장 (대표님 지시 "마무리하자"). 오후 4커밋 Step 5C 완결 + 정리 마감.
- 영향: 다음 세션 `/clear → Ctrl+V` 로 맥락 복구.

## 2026-04-21 오후 ▶ 콘텐츠 ▶ Step 5C 후속 3건 (v2.* console noise 제거 + is-action-mode 진단)
- 변경:
  1. **99_bindings v2.* silent skip** (`js/99_bindings.js`) — `data-action="v2.charClick"` 등은 `Battle._installDelegatedListeners` 가 자체 처리. 99_bindings 는 "v2" 모듈 몰라서 매 클릭마다 `[bindings] 알 수 없는 모듈: v2` 에러 찍던 noise. `resolveAction` 에서 `moduleName==='v2'` 조기 return null.
  2. **is-action-mode / is-returning 초기 잔재 진단** — 핸드오프 4/21 11:15 에 기록된 "Focus 카드가 처음 클릭 시 1.2배로 보임" 추정 버그. Playwright 재검증 결과 **정상**: page load → start → click → 500ms 후까지 모두 `className="battle-sub"` 깨끗. 이전 관찰은 반복 click/cancel/재click 누적 결과로 판명. 실질 버그 없음.
- 이유: 전투 UX 미세 개선. 콘솔 노이즈가 디버깅 시 가짜 신호.
- 영향: 회귀 9/9 PASS. 전투 플로우 동일.
- 관계: Step 5C dead code 청소(eea005b) 직후 final 마감.

## 2026-04-21 오후 ▶ 콘텐츠 ▶ Step 5C dead code 청소 (.bv2-card / .bv2c-* / bcf-*)
- 변경:
  1. **CSS `.bv2-card` 블록 일괄 삭제** (`css/41_battle_v2.css` L233-491, 약 260줄) — wrapper/frame/img/icon/name/status-row/hp/stats/desc/nrg + 상태 클래스(is-selected/is-target-*/is-hit/is-dead/is-dying-*/is-acted/is-queued/is-dimmed) 전부 dead. Step 5C 에서 `.card-v4.card-v4-compact` 로 전환 후 자식 `.bv2c-*` 생성 안 됨. `.bv2c-hp-delta-floating` (HP 프리뷰 floating 라벨) 만 유지.
  2. **JS 셀렉터 치환** (`js/60_turnbattle_v2.js`) — `.battle-stage-grid .bv2-card` × 9 → `.card-v4-compact`. `buildCardEl` 에서 `classList.add('bv2-card')` 하위호환 제거.
  3. **CSS fire-mode 셀렉터 치환** (`css/41_battle_v2.css`) — `.battle-stage-grid .bv2-card` → `.card-v4-compact` (2곳).
  4. **index.html bcf-* 자식 마크업 제거** — `#battle-char-focus .bcf-main-card` 의 bcf-card-img/bcf-hp/bcf-stat-col/bcf-atk/bcf-def/bcf-spd/bcf-name/bcf-desc/bcf-nrg (6자식) 삭제. `CardV4Component` 가 런타임에 전담.
  5. **CSS bcf-* 자식 규칙 삭제** — `.bcf-card-img/.bcf-hp/.bcf-stat-col/.bcf-atk/.bcf-def/.bcf-spd/.bcf-name/.bcf-desc/.bcf-nrg` 전체 블록 제거. `.bcf-main-card`/`.bcf-backdrop`/`.bcf-skill-row`/`.bcf-skill-card`/`.bsc-*` 는 유지.
- 이유: Step 5C V4 이식으로 발생한 dead code (무해하나 유지보수 혼란) 일괄 청소. V4 전환 직후에 정리해야 다른 개발자/future self 가 "이 블록 뭐지?" 헷갈리지 않음.
- 영향: 회귀 9/9 PASS. Playwright 전투 진입 검증 — v4compact=10 / bv2-card class=0 / bv2c-frame=0 / bcf-main-card 자식 1개(V4 인스턴스만). 시각 동일, 기능 동일.
- 관계: Step 5C (d2c1d8f) 직후 청소. `.bv2c-hp-delta-floating`, CSS 변수 `--bv2-card-w/h/gap/focus-scale/action-scale/hover-scale` 는 유지 (공간 토큰·floating 레이어).
- 변경:
  1. **Church NPC z-index** (`css/42_screens.css`) — `#church-npc { position:relative; z-index:20 }`. V4 카드(church-grid)가 document order 상 뒤에 있어 stacking 위로 떠서 npc 대화 바 상단을 가리던 이슈 해결. 부상자 카드 많을 때 첫 행이 npc 영역 침범하면 가렸던 상황.
  2. **Codex 5-col grid 복구** (`css/42_screens.css`) — `#codex-tab` 에 `padding:0` + `scrollbar-gutter:stable`. 40장 로드 시 세로 스크롤바가 16px 잡아먹어 유효 폭 1208 → 5×235+4×10=1215 초과로 4-col 로 떨어지던 이슈. padding 제거 + gutter 예약으로 1224 여유 확보.
- 이유: 핸드오프 4/21 11:15 이월 P1 2건 정리. 실제 플레이 시각 품질 개선.
- 영향: 회귀 9/9 PASS. Tavern 은 영향 없음 (8장이라 스크롤 안 남). Castle/Church 양식 동일하지만 church-grid 만 npc 바 있어서 church-grid 는 건드리지 않고 npc 바만 z-index 승격.
- 관계: handoff-2026-04-21-1115.md "P1 Church z-index 정리 / Codex 5-col 조사" 클리어.

## 2026-04-21 오후 ▶ 콘텐츠 ▶ Step 5C Battle V4 이식 실행 (A1~A4 전부)
- 변경: 대표님 결정 반영 (옵션 A / A3 포함 / 9px 너판단 / parch.desc 완전숨김).
  1. **A1 CSS Compact Variant** — `css/32_card_v4.css` 에 `.card-v4-compact` modifier (172×248, aspect:auto, parch.desc 숨김, 스탯 9px). `css/41_battle_v2.css` 에 상태 블록 (`.card-v4-compact` × is-selected/is-target-valid/is-target-hover/is-hit/is-dead/is-dying-melt|crush/is-acted/is-queued/is-dimmed).
  2. **A2 Stage 렌더 교체** — `js/60_turnbattle_v2.js` `buildCardEl` → `CardV4Component.create()` + `.card-v4-compact` + 인스턴스 맵 `Battle._stageInstances[id]`. `refreshStageCard` setter 기반(setHP/setNRG/setStatus/setShield). `stageCardOf` 인스턴스 우선 조회. HP 프리뷰(clearHpPreview/renderTargetPreview) 도 setter 이식.
  3. **A3 Focus 카드 V4** — `renderCharFocus` 에서 `#bcf-main-card` innerHTML 비우고 `CardV4Component.create()` appendChild, `Battle._focusInstance` 저장. CSS `.bcf-main-card` 투명화(background/border/box-shadow 제거) 후 V4 가 전담. focus 카드는 compact 아닌 표준 V4 (310×446, 3줄 desc 유지, 스탯 14px).
  4. **A4 검증** — 회귀 9/9 PASS. Playwright 전투 진입 10장 V4 compact 렌더 확인(bv2c-frame 0), Focus 카드 310×446 정확. 9px 가독성 OK (상향 불필요).
- 이유: V4 확장 9화면 중 마지막 전투 완결. 세계관 톤 통일.
- 영향: `.bv2-card` / `.bv2c-*` 자식 셀렉터 CSS 규칙은 legacy 로 잔존 (dom 에서 참조 없음, 무해). index.html 의 `bcf-main-card` 자식 마크업도 잔존(런타임 `innerHTML=''` 로 제거). 차후 정리 기회.
- 관계: step5c_battle_v4_plan.md 실행. V4 확장 9/9 완결.

## 2026-04-21 11:15 ▶ 세션 ▶ 핸드오프 저장
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-21-1115.md` 에 저장 + 푸시 완료 (`3952096..8334bbc`).
- 이유: 수동 저장 (대표님 지시 "푸시하고 핸드오프하자"). 오늘 4커밋 Step 5 V4 확장 마무리 정리.
- 영향: 다음 세션 `/clear → Ctrl+V` 로 맥락 복구.

## 2026-04-21 (8차-D) ▶ 콘텐츠 ▶ Step 5D pick-screen V4 이식 + .card 셀렉터 버그 수정
- 변경:
  1. **Preview 경로** (`js/99_bootstrap.js:211`) `mkCardEl → mkCardElV4`.
  2. **실전 로직** (`js/59_game_battle_round.js:163`) 라운드 끝 "동료 추가" 3지선다. `mkCardEl → mkCardElV4`. V4 overflow:hidden 이라 중복 합성 badge (`🔀 합성 가능!`) 를 카드 밖에 두기 위해 `.pick-card-wrap` 으로 감쌈 (flex column).
  3. **기존 버그 부수적 수정** — `grid.querySelectorAll('.card')` → `.card-v4` (2곳). V2 시대에도 `.card-v2` 를 써야 했는데 `.card` 로 조회되어 dim 처리가 작동 안 했을 가능성. V4 전환 김에 셀렉터 정상화.
  4. **CSS** — `#pick-grid { --card-v4-w:260px }` + `.pick-card-wrap{display:flex;flex-direction:column;align-items:center}` 추가.
- 이유: Step 5 의 마지막 경량 작업. Tavern 초반 영입부터 라운드 중간 뽑기까지 V4 통일 마감. scan doc 의 "Step 5C Round Reward" 는 실제로는 pick-screen (Battle 별도 화면) 이었음.
- 영향: 3 V4 카드 / 0 V2, 버튼 정상 작동. 회귀 9/9 PASS. 스크린샷 `shots/pick_v4_step5d.png`.
- 이전 결정 관계: (8차-C) 연속. Step 5 A/B/D 완결. Step 5C (실제 Battle bv2-card 별도 규격) 만 남음 — 반나절 규모이므로 별도 기획.

## 2026-04-21 (8차-C) ▶ 콘텐츠 ▶ Step 5B Castle + Church + Matching V4 이식
- 변경:
  1. **Castle Upgrade** (`js/54_game_castle.js:40`) — 단련 대상 카드 grid, `mkCardEl → mkCardElV4`. 기존 wrapper 패턴 유지.
  2. **Church** (`js/54_game_castle.js:95`) — 부상자 치유/장례 grid, `mkCardEl → mkCardElV4`. grayscale/brightness 필터 유지.
  3. **Matching Phase 1** (`js/55_game_battle.js:76`) — "검색 중" 내 영웅 카드 V4.
  4. **Matching Phase 2** (`js/55_game_battle.js:104, 114`) — "도전자 발견" 상대/내 카드 양쪽 V4, 카운트다운+자동출전 그대로.
  5. **Match placeholder** — `width:280px;height:420→490px` (V4 4:7 비율 맞춤).
  6. **CSS 스코프** — `#castle-upgrade-grid { --card-v4-w:235px }`, `#church-grid { --card-v4-w:235px }`, `#match-screen { --card-v4-w:280px }` 추가.
- 이유: 매칭 → 출전편성 → 배틀 플로우에서 Tavern/Deckview/Formation/Cardselect 와 톤 통일. 유닛 단련/치유 화면도 V4 로.
- 영향: Castle 4장 / Church 1장 (데모) / Matching 양측 280×490 검증. 회귀 9/9 PASS. 스크린샷 `shots/castle_v4_step5b.png`, `church_v4_step5b.png`, `match_v4_step5b_phase1.png`.
- 이전 결정 관계: (8차-B) 연속. 5B 완결 (Castle+Church+Matching). 남은 Step 5C (Battle bv2-card) 는 별도 규격, 5D (Onboarding) 는 경량.

## 2026-04-21 (8차-B) ▶ 콘텐츠 ▶ Step 5A-2 cardselect-screen V4 이식
- 변경: `js/55_game_battle.js:192` `renderCardSelect()` 의 `mkCardEl(c)` → `mkCardElV4(c)`. V4 는 overflow:hidden 이라 "지휘권 소비/자동 출전/부상" badge 를 카드 밖에 두기 위해 `.cs-card-wrap` 으로 감쌈 (flex column). `css/42_screens.css` `#cs-grid` 스코프에 `--card-v4-w:160px` + `.cs-card-wrap{display:flex;flex-direction:column;align-items:center}` 추가.
- 이유: step5a_scan 의 Step 5A-2 는 2부분으로 나뉘어 있었음 — (A) formation-screen (앞 커밋), (B) cardselect-screen (이 커밋). 출전 편성 플로우 양쪽 V4 톤 통일.
- 영향: 8 V4 카드 + 8 wrapper, 카드 폭 160×280. hero .selected / injured .opacity/.filter / 선택시 .selected 토글 전부 V4 에 그대로 동작. 회귀 9/9 PASS. 스크린샷 `shots/cardselect_v4_step5a2.png`.
- 이전 결정 관계: 2026-04-21 (8차) 바로 뒤 연속.

## 2026-04-21 (8차) ▶ 콘텐츠 ▶ Step 5A-2 Formation V4 이식 + 자동 배치 버그 수정
- 변경:
  1. **자동 배치 리렌더 버그 fix** — `js/99_bootstrap.js:192` preview 네비게이터가 `UI.show('formation-screen')` 만 호출하고 `Formation.show()` 를 안 불러 `_cards` 가 비어 있던 문제. `RoF.Formation.show()` 로 교체 (fallback 유지).
  2. **Formation V4 이식** — `js/70_formation.js` render() 에 `RoF.CardV4Component.create(c,{}).el` 적용. 슬롯 선택 시 `setSelected(true)` 로 V4 황금 오라 사용. 빈 슬롯은 `.form-slot-empty` (dashed + ➕ 글리프).
  3. **레이아웃 토큰 조정** — `--form-diamond-h: 180→335`, `--form-bench-label-y: 380→535`, `--form-bench-y: 420→565`, `--form-bench-h: 200→70` (V4 카드 높이 333 수용).
  4. **CSS 스코프** — `css/42_screens.css` `#form-diamond` 에 `--card-v4-w: 190px` + flex + gap 8 + center 주입. `css/41_formation.css` `.form-slot` 는 wrapper, `.form-slot-empty` 는 독립 스타일.
  5. **index.html** — `#form-diamond` 인라인 `flex-wrap:wrap` + `padding:15px 10px` 제거 (기존 레거시 레이아웃 잔재).
- 이유: ui-inspector 2026-04-20 보고의 "F1_formation_auto 에서 + 더미 유지" 버그 + Tavern/Deckview V4 톤 통일 확장.
- 영향: 진입 → `_cards=Game.deck` 주입 → render 시 V4 카드 5장, 공명 배지, bench 3장. Playwright 검증 완료 (`shots/formation_v4_step5a2_1600.png`, `shots/formation_v4_step5a2_selected.png`). 회귀 9/9 PASS.
- 이전 결정 관계: 2026-04-20 Step 4A/4B Tavern V4 → Step 5A-1 Deckview V4 → 이번 Step 5A-2 Formation V4. 다음: Step 5C Battle.

## 2026-04-20 21:44 ▶ 세션 ▶ 핸드오프 저장
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-20-2144.md` 에 저장 + `current-focus.md` 4·5·6차 반영 갱신.
- 이유: 수동 저장 (대표님 지시, 세션 마무리).
- 영향: 다음 세션 `/clear → Ctrl+V` 로 맥락 즉시 복구.

## 2026-04-21 00:46 ▶ 세션 ▶ 핸드오프 저장 (일일 11커밋 마감)
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-21-0046.md` 에 저장. 클립보드 복사 완료.
- 이유: 대표님 마무리 지시 "여기까지". 오늘 누적 11커밋 (Tavern 4B / A안 정본화 / P0 / B1·B2 / Step 5A-1 등) 완료.
- 영향: 다음 세션 `/clear → Ctrl+V` 로 맥락 즉시 복구. Step 5A-2 Formation 또는 Step 5C Battle 부터 이어감.

## 2026-04-21 ▶ 디자인 ▶ Step 5A-1 — Deckview V4 확장 (Deck + Codex 탭)

- **변경**:
  - `js/53_game_deck.js:54` — Codex 그리드 `mkCardEl(u)` → `mkCardElV4(u)` (혈통 40장)
  - `js/53_game_deck.js:121` — Deck 그리드 `mkCardEl(c)` → `mkCardElV4(c)` (보유 덱)
  - `css/42_screens.css` — `#deck-tab / #codex-tab` 에 `--card-v4-w: 235px` + `#dv-grid / #codex-grid` grid 5-col override (`!important` — 인라인 `display:flex` 무효화).

- **이유**: Step 5A-1 — rof-ui-inspector 권장 순서대로 Tavern → Deckview 흐름이 V4 프레임으로 통일됨. "영입 → 내 덱 확인" 체감 격차 제거.

- **영향**:
  - Deck 탭: 보유 유닛 V4 프레임 (235×411).
  - Codex 탭: 전체 40 일반 유닛 V4 렌더 (회색 필터 유지 — 미획득 표시).
  - 회귀 9/9 PASS. V2 호출부 남아있음: castle/battle/round/bootstrap 등 (Step 5B/C/D 에서).

- **검증**:
  - Playwright: `#dv-grid .card-v4` 7장, `#codex-grid .card-v4` 40장, V2 잔존 0.
  - `shots/deckview_v4_step5a1.png` — Deck 탭 첫 화면
  - `shots/deckview_v4_codex_step5a1.png` — Codex 탭

- **남은 과제**:
  - Step 5A-2 Formation (`js/55_game_battle.js:192`) — 자동 배치 리렌더 버그(ui-inspector 보고) 먼저 점검.
  - Codex 전체(40장) 에서 grid-template-columns 가 4-col 로 계산되는 이유 조사 (현재 5-col 목표 대비 1 적음). 스크롤 있으니 UX 영향 작음.

## 2026-04-21 ▶ 리팩터 ▶ B2 mkCardElV4 → CardV4Component setter API 이식

- **변경**:
  - `js/40_cards.js` — `RoF.CardV4Component` 신규 (CardComponent V2 미러).
    create() 이 인스턴스 반환: `{el, unit, _refs, _state, _opts, setHP, setNRG, setShield, setStatModifier, setStatus, setSelected, destroy, _snapshot}`.
    rebuild() 헬퍼도 추가 (레벨업 재생성).
    기존 `mkCardElV4(c)` 는 래퍼로 유지 (el 만 반환) → 호환성 0 손실.
  - `css/32_card_v4.css` — setter 시각 요소 추가:
    - `.v4-status` + `.v4-status-badge` (상단 중앙, burn/poison/frozen/invincible)
    - `.shield-badge` (좌상단 오버레이)
    - `.stat .mod` (+N/-N buff/debuff 배지)
    - `.card-v4.selected` + `@keyframes v4-selected-pulse` (V2 와 동일 golden 오라)
  - **ribbon 라벨**: "DIVINE" → "신" (판타지 한국어 규칙 준수, code-review I6).

- **이유**:
  - code-review BLOCKER B2 해결 — 전투(Battle) 로 V4 확장 시 `setHP/setNRG/setStatus` API 필수.
  - Step 5B/5C 이식 전제. 지금 없으면 전투 루프가 안 돔.
  - STATUS_GLYPHS 을 이모지(🔥☠️❄️🛡️)로 단순화 — V2 의 SVG 대신 가벼운 방식.

- **영향**:
  - 기존 Tavern 호출부 (`mkCardElV4(c)`) **변경 0** — 래퍼가 el 만 반환.
  - 새 코드는 `RoF.CardV4Component.create(c, {})` 호출하면 setter 활용 가능.
  - 렌더 결과 동일 (Playwright Tavern 235×411 4장 유지).
  - 회귀 9/9 PASS.

- **검증**:
  - `shots/v4_b2_setter_demo.png` — 테스트 카드 직접 생성 + 모든 setter 호출 + 시각 확인.
    HP 25/100, NRG 12/20, Shield 7, ATK+3, DEF-2, 🔥3 ☠️2, selected 금광 모두 정상.

- **남은 과제**:
  - Step 5B/5C 에서 실 Battle 호출부가 이 API 사용 시작 시 실전 검증.
  - rebuild() 는 아직 호출부 없음. 레벨업 이식 시점에 활성화.

## 2026-04-21 ▶ 리팩터 ▶ B1 매직 넘버 토큰화 + 유물 imgKey + Step 5A 스캔

- **변경**:
  - **B1 토큰화**: `css/10_tokens.css` 섹션 14-7 추가 — `--card-v4-w: 260px` (기본값). `css/32_card_v4.css` `.card-v4` width 하드코딩 `260px` → `var(--card-v4-w, 260px)`. `css/42_screens.css` `#tav-grid` 에 `--card-v4-w: 235px` override 주입 (세 곳 중복 → 한 곳으로 통일). `grid-template-columns: repeat(auto-fill, var(--card-v4-w))`.
  - **B (유물 imgKey)**: `js/13_data_relics.js` 12 유물 전부 `imgKey` 필드 추가 (rl_banner ~ rl_immortal). 이미지 공급 대기.
  - **C (Step 5A 스캔)**: `design/step5a_scan_2026-04-21.md` 신규 — V4 확장 대상 12 mkCardEl 호출 전수 정리 + 5A/5B/5C/5D 단계 분리 + 공수 추정.

- **이유**:
  - code-review (`code_review_step4_2026-04-20.md`) BLOCKER B1 해결 — Step 5 (다른 화면 V4 확장) 전 매직 넘버 일원화 필수.
  - 유물 imgKey 는 art_queue_skills_relics 의 rl_* 이미지 공급 시 즉시 연결 준비.
  - Step 5A 스캔으로 작업 전 사전 파악.

- **영향**:
  - 렌더 결과 완전 동일 (Playwright 측정 235×411 유지).
  - 회귀 9/9 PASS.
  - 이후 Collection/Formation 확장 시 `#화면-scope { --card-v4-w: 값; }` 한 줄로 해결.

- **남은 과제**:
  - B3 (`!important` 4개) 는 현 setup 에서 유지 필요 (inline style 제거 부작용 큼). Step 5 진행 중 재평가.
  - I1 (CRIT/EVA 하드코딩) 는 Step 5 호출부 다양화 시 빌더 옵션화 권장.

## 2026-04-21 ▶ 밸런스 ▶ P0 5건 등급 하향 조정

- **변경**:
  - `dragon`: divine → legendary (atk 10 hp 35 = legendary attack 범위 내)
  - `archangel`: divine → legendary (atk 6 hp 40 def 5 = legendary 수준)
  - `lich`: legendary → gold (atk 8 hp 20 def 1 = gold attack 범위 완벽)
  - `archmage`: gold → silver (atk 6 hp 12 = silver attack 매칭)
  - `sniper`: gold → silver + atk 7→6 (hp 8 gold 미달, atk 소폭 하향)
- **이유**: 새 rules/04-balance.md 범위 기준 스탯 대비 등급 초과. 스탯 상향(밸런스 파급 큼) 대신 등급 하향(레이블 변경, 드롭률만 바뀜) 선택.
- **영향**:
  - 드롭률 변동: 5장이 더 흔한 등급으로 이동 → 플레이어 입수 난이도 ↓
  - 명칭/시각 효과 변화: 신 등급 금박·샤인 효과 해제 (dragon/archangel)
  - P0 7건 중 5건 해결. 남은 2건 (genie_noble gold support atk 5, sea_priest legendary support atk 8) 은 새 규칙 범위 내로 판정되어 변경 없음.
- **검증**: 회귀 9/9 PASS, units=58/skills=37/relics=12 유지.
- **이전 결정 관계**: 2026-04-20 night balance-auditor 감사 결과 반영.

## 2026-04-21 ▶ 콘텐츠 ▶ 스킬·유물 이미지 작업 큐 작성
- **변경**: `docs/art_queue_skills_relics_2026-04-21.md` 신규 — 37 스킬(패시브 29 + 액티브 8) + 12 유물 전체에 대한 비주얼 컨셉·배경·프롬프트 힌트 정리. P0(액티브 스펠 8) / P1(전설 패시브+유물 10) / P2(골드 12) / P3(실버·브론즈 18) 우선순위.
- **이유**: 대표님 이미지 작업 큐 요청. 유닛 추천(art_queue_2026-04-20.md) 과 동일 형식.
- **영향**: 대표님 작업 후 img/sk_*.png / img/rl_*.png 로 공급 → 12_data_skills.js 의 imgKey 활용 또는 13_data_relics.js 에 imgKey 필드 추가.

## 2026-04-21 ▶ 밸런스 ▶ A안 — design/balance.md 폐기 + rules/04-balance.md 정본화

- **변경**:
  - `.claude/rules/04-balance.md` 전면 재작성 — 실데이터 기반 역할별(attack/defense/support) 세분화 + 원소 보너스 + 전투 공식 + 스킬 등급 수치 + 레벨링 + 드롭률 + 진화 계수 + 경험치 곡선 + 불문율 + 검증 체크리스트 전부 흡수.
  - `design/balance.md` → `trash/design_balance_deprecated_2026-04-21.md` 이동.
  - 참조 업데이트 10+ 건: `CLAUDE.md`, `.claude/rules/00-index.md`, `.claude/agents/balance-auditor.md`, `.claude/agents/content-generator.md`, `.claude/commands/밸런스검증.md`, `.claude/skills/{스킬추가, 유물추가, 캐릭터추가, 밸런스검증, 기획변경}/SKILL.md`, `tracks/02-data-balance/START.md`, `tracks/05-docs-lore/START.md`, `tracks/06-backend/START.md`, `tracks/README.md`.
  - `game/tools/audit_stats.js` 신규 — 실데이터 기반 범위 추출 재사용 가능.

- **이유**: `rules/04-balance.md` (HP 8-12) vs `design/balance.md` (HP 40-55) 가 4~5배 스케일 차이. 실제 js 데이터는 rules 와 일치. design/balance.md 는 하네스 초기(2026-04-12) 설계로 추정되며 죽은 구버전. balance-auditor / content-generator / 각 스킬이 이 문서 참조 → 감사 결과 무의미. 2026-04-20 night 자율 감사(`autonomous_work_summary`, `balance_docs_sync`, `balance_audit_2026-04-20-night`) 3건에서 교차 확인.

- **영향**:
  - Source of Truth 단일화: 앞으로 모든 밸런스 참조는 `.claude/rules/04-balance.md` 하나.
  - js 데이터 수정 0 (문서가 실측에 맞춘 것).
  - 회귀 9/9 PASS (확인 후 보고).
  - 핸드오프 22개·자율 리포트 6개에 포함된 `design/balance.md` 언급은 과거 기록이라 수정하지 않음 (append-only 원칙).

- **이전 결정 관계**: **번복**. 2026-04-12 초기 설계의 "design/balance.md 상세 테이블·수식 Source of Truth" 결정을 완전 번복. 해당 내용은 rules/04-balance.md 로 이관.

- **다음 작업**:
  - P0 7건 튜닝 (dragon/archangel/lich/archmage/sniper/genie_noble/sea_priest) 대표님 결정 필요 (각 유닛마다 "스탯 상향 vs 등급 하향").
  - balance-auditor 에이전트 재호출해서 새 규칙 잘 읽는지 1회 검증 권장.

## 2026-04-20 23:04 ▶ 세션 ▶ 핸드오프 저장 (7차 마무리)
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-20-2304.md` 에 저장. 클립보드 복사 완료.
- 이유: 7차 세션 마감 (C 선택). 로컬 2커밋(`fe04820`, `681e102`) 미push 상태.
- 영향: 다음 세션 `/clear → Ctrl+V` 로 Tavern V4 적용 후속 UI 조정 3건부터 이어감.

## 2026-04-20 (Step 4B) ▶ 디자인 ▶ Tavern V4 5-col grid 전환 + 카드 폭 235
- 변경:
  - `css/42_screens.css` `#tav-grid` override 블록에 `display:grid !important; grid-template-columns:repeat(auto-fill, 235px); gap:10px; justify-content:center;` 추가.
  - `body.game-mode #tav-grid .card-v4 { width:235px !important }` + `.tavern-card-wrap { width:235px }`.
  - 이전 inline style 의 `display:flex;flex-wrap:wrap` 이 5번째 카드 wrap 원인이었음. grid override 로 해결.
- 이유: 설계값 260×455 복원은 stage 1240 에서 5-col 불가능(5×260+gap=1300+ > 1240). 235×411 (90% 축소) 로 5장 한 줄 보장.
- 영향:
  - Tavern Unit/Hero 탭 모두 5-col grid.
  - 5 슬롯 동시 표시 시 wrap 없음 (실측 rows=1, 5×235 + 4×10 = 1215 < 1240 usable).
  - Hero 탭(3장) 은 `auto-fill` 로 중앙 정렬.
  - 이전 세션 "보병 양피지 배경 충돌" 은 실제 렌더 확인 결과 다른 캐릭터와 톤 유사, 당분간 놔둠.
- 검증: 회귀 9/9 PASS, Playwright shots `shots/tavern_v4_step4b_5col.png`.
- 남은 과제: 다른 화면(Collection/Formation/Battle) V4 확장은 Step 5 로 분리. Tavern 내부 카드·버튼 간격 미세 조정은 사용자 피드백 받아 후속.

## 2026-04-20 (art queue) ▶ 콘텐츠 ▶ 이미지 작업 추천 큐 정리
- 변경: `docs/art_queue_2026-04-20.md` 신규 — 58 유닛 매트릭스 + P0/P1/P2 9장 추천 (해적 수병/수도사 견습/해신 팔라딘/석공 전사/번개 채널러/해파 기사/어둠 주술사/화염 수호자/산악 파괴자).
- 이유: 대표님 이미지 작업 큐 요청. divine 제외 4등급 × 원소 × 역할 매트릭스에서 공백 셀 우선순위화.
- 영향: 대표님 이미지 공급 후 `/캐릭터추가` 스킬로 데이터 편입 예정. legendary water/defense = 핵심 시그니처 후보.

## 2026-04-20 (7차) ▶ 디자인 ▶ Claude Design System 도입 Step 1-3 (토큰 + 폰트 + V4 카드 시안)
- 변경:
  - Claude Design zip(93파일/21MB) → `c:/work/design-system/` 압축 해제 + git init + GitHub private 레포 `chahongpil/realm-of-fates-design-system` push (커밋 `63d6557`).
  - `game/css/10_tokens.css` **섹션 14 추가** — DS `handoff/DESIGN_TOKENS.md` 반영: parchment-0..3 / ink-0..2 / rubric / lapis / malachite / gilt / r-guardian·melee·ranged·caster-m·caster-r. 사용처 0 무해.
  - `game/index.html:6` 폰트 로드 확장 — Cinzel 500/900 + Cinzel Decorative 700/900 + Noto Sans KR 400-900 + Noto Serif KR 400-900.
  - `game/mockup/v4_card/v1~v3.html` — Tavern 6장(등급5 + divine 2원소) V4 프레임 시안 3안:
    - v1: 순수 DS 톤(가죽 `#1a0f08` + 양피지 `#f1e4c3`)
    - v2: 현 게임 배경(`#080810`) + V4 양피지 원본(톤 충돌 체감용)
    - v3: 현 게임 배경 + 양피지 톤다운(`#d4bf88`) 타협안
  - `game/shots/v4_mockup/v1~v3.png` (gitignore, 로컬 검수용).
- 이유: 전면 V4 카드 프레임 전환의 출발점. 대표님이 시안 3안 중 선택 → Step 4 (실제 화면 적용) 진행.
- 영향: 회귀 9/9 PASS. 기존 UI 변경 없음. V4 전환·톤 시프트·역할 5종 분화는 후속 작업.

## 2026-04-20 (6차) ▶ 콘텐츠 ▶ 신규 6장 추가 (divine 6원소 완성 + legendary 갭 메움 + UI 아이콘 사양서)
- 변경: ① **신규 유닛 6장 추가** (52 → **58 유닛**):
  - `genie_noble` (고귀한 지니) — gold / lightning / support / ranged. atk:5 hp:22 def:2 spd:4. 액티브 80% arcane_burst "번개 소원" + 30% group_heal 트리거.
  - `earth_guardian` (대지의 수호자) — legendary / earth / defense / melee. atk:8 hp:42 def:10 spd:2. 패시브 armor -5 + 30% thorns(6) 반사.
  - `sea_priest` (심해의 대신관) — legendary / water / support / ranged. atk:8 hp:42 def:3 spd:5. 액티브 90% mass_heal +8 + 30% bless 보호막 트리거.
  - `genie_legendary` (전설의 지니) — legendary / lightning / attack / melee. atk:10 hp:38 def:4 spd:5. 패시브 first_strike + 30% double_arrow 쌍발.
  - `behemoth` (땅의 신 베히모스) — divine / earth / attack / melee. atk:15 hp:65 def:7 spd:2. 액티브 80% breath 전체8 + 30% cleave 진동파.
  - `leviathan` (바다의 신 레비아탄) — divine / water / attack / ranged. atk:15 hp:58 def:3 spd:4. 액티브 80% breath 전체7 + 30% arcane_burst 해일 추가딜.
  ② **UI 아이콘 원본 공개** — 다운로드 폴더에서 받은 이미지 5개 + 사양서를 `source_art/ui/` 에 정리. elements.png(6원소 2×3 합본), role/{defense, melee, ranged_support_giant_3in1, divine_defense_melee_2in1}, effects/effects_3x5.png(상태 배지 14종). `source_art/ui/README.md` 에 각 셀의 영어 라벨과 게임 effect 마커 매핑 + 표시 규칙(거인상 보류, divine defense 만 특별 방패) 문서화. ③ **effect 마커 정리** — 신규 6장 전부 기존 마커 재사용(group_heal/double_arrow/thorns/bless/cleave/arcane_burst) — 파서 드리프트 0. ④ **balance-auditor 반영** — 신규 6장 검증 후 P1 3건 + P2 2건 수정: genie_noble atk 4→5, earth_guardian atk 7→8, sea_priest atk 5→8·spd 3→5, behemoth atk 14→15, leviathan atk 13→15·spd 3→4. genie_legendary 는 전 항목 통과.
- 이유: ① divine 6원소 완성 — 기존 4원소(fire/lightning/holy/dark) 에 water(leviathan) + earth(behemoth) 추가로 6원소 대장 카드 전부 확보. ② legendary 3장(lich/griffin_knight/griffin_rider)이 전부 attack 이라 defense/support 슬롯이 비어있던 문제를 earth_guardian(defense) + sea_priest(support) 로 해소. ③ 지니 2등급 체인 — noble(지원 팔짱) → legendary(전사 검방패) 컨셉으로 단일 캐릭터의 2등급 표현. 이것이 앞으로 원본 파일명 규칙(`genie_noble.png` / `genie_legendary.png`) 의 첫 사례. ④ Claude Design 협업 전환(5차) 결정에 맞춰 UI 아이콘 시스템도 "원본 공급 → CSS로 내가 직접 안 만듦 → 개별 crop/배치는 Claude Design" 파이프라인으로 통일. `feedback_no_css_design.md` 메모리 저장.
- 영향: ① 58 유닛 풀. divine 6원소 전부 확보로 원소 편성 메타 가능. legendary 6장 풀(+defense/+support) 로 역할 다양성 회복. ② `game/img/` 에 behemoth/earth_guardian/genie_legendary/genie_noble/leviathan/sea_priest 6장 이미 배치(5차 재임포트 때 같이 import됨, 데이터만 지금 연결). ③ 회귀 9/9 PASS(2회). ④ 다음 작업 대기: 암흑의저격수 rarity 확정 및 데이터 추가, Claude Design 이 crop + 카드 UI 적용한 결과물 수신.
- 이전 결정: 2026-04-20 5차 "프레임 일체화 폐기 + Claude Design 협업" 의 후속. 2026-04-20 4차 balance-auditor 가 제시한 신규 legendary 3장 스탯 범위 가이드(earth defense / water support / lightning ranged) 를 이번 세션에서 구현.

## 2026-04-20 (5차) ▶ 콘텐츠·시스템 ▶ 프레임 일체화 폐기 + 순수 캐릭터 일러스트 전환 (Claude Design 프레임 협업)
- 변경: ① **이미지 파이프라인 전환** — "프레임+유닛 일체화" PNG 방식 폐기, **순수 캐릭터 일러스트만** 받는 방식으로 전환. Claude Design(2026-04-17 출시) 과 협업 확정 — 대표님이 순수 캐릭터 일러스트 제공하면 Claude Design 이 시스템 프레임(등급 테두리/배너/슬롯 박스)을 CSS/코드 레벨로 씌움, 시스템은 그 위에 공격/체력 같은 숫자 데이터만 오버레이. ② **31장 재임포트** — `이미지제작_원본/일반유닛_원본/` 루트에서 대표님이 새로 제공한 순수 캐릭터 일러스트 31장 이식. `tools/import_unified_frames.py` 의 SRC 를 루트 폴더로 변경하고 MAP 을 새 파일명 체계(번호 prefix, 공백 위치 변동)로 전면 재작성. ③ **titan.png APNG 갱신** — 기존 프레임 일체화 8프레임 → 순수 일러스트 8프레임(`titan2/1~8.jpg` 400×600 90ms loop=0, 1.86MB → 3.58MB). ④ **griffin_rider.png APNG 신규** — 전설의 그리핀용사를 애니메이션 카드로 전환(`그리핀용사 프레임/프레임1~8.png` 8프레임 90ms, 4.22MB). ⑤ **build_titans_apng.py 범용화** — 타이탄 전용 → `JOBS` 배열 구조로 타이탄/그리핀용사 둘 다 처리. ⑥ **보류 폴더 trash/ 이동** — `프레임 일체화_보류/` 폴더 전체를 `trash/img_unified_frames_hold_2026-04-20/` 로 이동(구 일체화 PNG 보존). ⑦ **26번 유닛(그리핀 탄 빨강망토기사) 삭제** — 대표님이 원본 폴더에서 이미 삭제, 코드상 존재하지 않던 유닛이라 추가 정리 불필요.
- 이유: 2026-04-20 1차에 "대표님 통합 PNG 가 프레임/슬롯박스/이름배너까지 다 포함하므로 이중 프레임 해체" 로 결정했으나, Claude Design 과 협업 경로가 확정되면서 방향 재조정 — 대표님은 **캐릭터 일러스트에만 집중**, 프레임/배너/UI 는 Claude Design 이 시스템으로 통일. 이 방식이 ⓐ 이미지 생성 비용 감소 (프레임 매번 합성 불필요), ⓑ 등급/원소 변경 시 프레임만 CSS 갈아끼우면 됨, ⓒ 시각 일관성(같은 등급 카드가 완전 동일한 프레임) 측면에서 우월. griffin_rider 는 "전설의 그리핀용사" 라는 대표 legendary 유닛이므로 titan 과 동일하게 APNG 애니 카드로 격상(정적 카드보다 시각 임팩트 큼).
- 영향: ① `game/img/` 의 31장이 순수 캐릭터 일러스트로 교체 → 현재 `.cv-frame display:none` + `.cv-illust contain` 설정에서는 프레임 없이 캐릭터만 풀카드 표시 (슬롯 박스 없는 상태). Claude Design 시스템 프레임이 씌워지기 전까지 일시적으로 "숫자 오버레이가 일러스트 위에 직접 뜨는" 상태. ② 런타임 성능: titan.png 1.86MB → 3.58MB, griffin_rider 는 정적 519KB → 애니 4.22MB. divine·legendary 대표 카드 2장 추가 데이터 ~6MB 증가. 전투 중 두 카드 중앙 무대(275×400) 확대 시 시각 임팩트 크게 향상. ③ 좌표 시스템(`css/11_frame_coords.json`, `tools/coord_editor.html`, `tools/json_to_frame_css.js`) 은 **숫자 슬롯 좌표 편집기로 유지** — Claude Design 프레임 스펙 수신 후 재조정 예정. divine.elements 원소별 분기는 현재 상태 유지(나중에 단순화 여부 결정). ④ 회귀 9/9 PASS. ⑤ 다음 작업 대기: 신규 7장 데이터 추가(지니 2장·대지의수호자·심해의대신관·땅의신베히모스·바다의신레비아탄·암흑의저격수), 영어 파일명 rename + 공개 레포 push(대표님 제안).
- 이전 결정: 2026-04-20 1차 "시스템 카드 프레임 PNG/CSS 전면 해체" → 4차(이번) 에서 "프레임 일체화" 자체를 폐기하고 Claude Design 시스템 프레임으로 이행. 2026-04-17 "Claude Design 협업 탐색" 의 공식화.

---

## 2026-04-20 (4차) ▶ 밸런스 ▶ archfiend 튜닝 + 52유닛 감사 (P0 5건 보고)
- 변경: ① **archfiend 수치 조정** — luck 8→6, bonusTrigger.chance 0.3→0.25. titan 대비 +60% luck + life_steal 시너지 과잉(balance-auditor P1) 해소. 나머지 스탯(atk:16, hp:55, def:4, spd:3)은 titan 동급 유지. ② **전체 52유닛 감사 보고서** — balance-auditor 에이전트가 `rules/04-balance.md` + `design/balance.md` 대비 검증. P0(범위 이탈) 5건 발견: dragon(divine hp:35 미달) / archangel(divine hp:40 미달) / lich(legendary hp:20 크게 미달) / archmage(gold hp:12 미달) / sniper(gold hp:8 극단 유리대포). 수정은 대표님 결정 대기. ③ 영웅 카드 18장 원소 보너스 일관성 전체 통과. 회귀 9/9 PASS.
- 이유: 4/20 3차 직후 밸런스 검증 + 회귀. archfiend 초안(titan 기반)이 dark 보너스 luck+3 을 base luck 5 위에 더해 8이 됐는데, titan luck 5 가 이미 lightning 보너스 포함 결과라 일관성 불일치. 동일 논리로 archfiend base luck 3 + dark +3 = 6이 형평. life_steal 30% + critRate 8% 콤보는 지속성 과도 → 25%/6 으로 완화.
- 영향: archfiend 전투 강도 약 -10% (luck 2↓ + proc 5%p↓). titan 과 실질 전투력 근접. P0 5건 수정 대기 — dragon/archangel 은 4/20 2차 divine 승격 후 스탯 미상향이 원인 가능성(기획 결정 필요), lich/archmage/sniper 는 "유리대포 의도" 여부 확인 필요. luck 시스템 전반 공백(divine 최대 critRate 8%)도 설계 재검토 대상.
- 이전 결정: 2026-04-20 2차 "divine 원소별 좌표 확장 + archfiend 신규(초안 titan 기반)" 의 튜닝 마무리.

## 2026-04-20 19:01 ▶ 세션 ▶ 핸드오프 저장
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-20-1901.md` (246줄) 에 저장 + 클립보드 복사.
- 이유: 수동 저장 (대표님 지시, 세션 마무리).
- 영향: 다음 세션에서 `/clear → Ctrl+V` 로 맥락 즉시 복구 가능.

## 2026-04-20 (3차) ▶ 게임 메커닉 ▶ 좌측 4번째 슬롯 `luck` 추가 (크리티컬 연동) + card_slot_editor 롤백
- 변경: ① **LUCK 슬롯 추가** — 합성 PNG 의 좌측 4색 슬롯(빨·파·초·노) 중 노란색 4번째 칸에 `luck` 값 매핑. `.cv-luck` DOM + CSS(`#ffe066` 황금톤), `css/11_frame_coords.json` 9 블록(5 등급 + divine 4 원소) 각각 `slots.luck` 시드 추가 (spd 좌표 + y 7% 기준 자동 시드, 대표님 편집기에서 드래그 튜닝). CSS 18 변수(`--gem-luck-x/y`) 자동 생성. `40_cards.js` 의 `create()` 에 `refs.luck = mkSlot('cv-luck', unit.luck||0)` 추가. 편집기(`coord_editor.html`)의 `SLOTS` 배열·범례·마커 색상·readout 모두 6 슬롯으로 확장(`--luck:#ffcc22`). 서버 `handleSave` 의 `SLOT_NAMES` + `test_run.js` card-coords 측정 배열 동기화. 동적 슬롯 카운트로 메시지 `1 rarities × 6 slots` 자동 출력. ② **card_slot_editor 롤백** — 단계 A(`b295bc2`, js/17 로더) + 단계 B(`fadd27d`, 편집기+엔드포인트) revert 후 `data/card_slot_overrides.json` 도 삭제. 롤백 사유: 같은 등급 프레임은 슬롯 위치 공통(대표님 지적) → 카드별 override 과잉 설계.
- 이유: 대표님 결정. ① "4번째 슬롯에 무엇을 매핑?" → `luck` (크리티컬과 연동되는 기존 스탯) 선택. 기존 유닛 데이터에 `luck` 이 이미 있어 마이그레이션 0. ② card_slot_editor 과잉 설계 → 삭제로 코드 복잡도 감소. no-op 보존보단 명확히 제거가 유지보수 측면 유리.
- 영향: ① 카드 UI 정보 밀도 증가 — 좌측 4슬롯 합성 PNG 디자인과 1:1 매칭. luck 값이 카드 위에 숫자로 보임(예: knight luck 3). 4 색 빈 슬롯이 시각적으로 완성. ② 서버 엔드포인트 `/save|load-card-slot-overrides` 제거, `js/17_data_card_slots.js` 삭제, `tools/card_slot_editor.html` 삭제, `index.html` 스크립트 태그 제거, `js/40_cards.js` 의 `RoF.CardSlots.applyTo` 훅 제거. 전체 코드 121줄 감소 + 761줄 감소(편집기).
- 이전 결정: 2026-04-20 2차 "divine 원소별 좌표 확장" 의 후속. card_slot_editor 는 2차에서 보조 도구로 보존 권고했으나 3차에서 롤백 확정.

## 2026-04-20 (2차) ▶ 콘텐츠·시스템 ▶ divine 원소별 좌표 확장 + 대악마(archfiend) 신규 + 편집기 8슬롯
- 변경: ① divine 등급 실제 구성(fire=dragon, lightning=titan, holy=archangel, dark=archfiend)을 데이터에 반영 — dragon·archangel 의 rarity legendary→divine 승격, archfiend 신규 카드 추가(divine/dark/attack, race:demon, icon:😈, 초안 스탯은 titan 기반 + dark 보너스 반영, 대표님 밸런스 튜닝 예정). 52 유닛. ② 합성 PNG `img/archfiend.png` 임포트(이미지제작_원본/.../암흑의신대악마.png → 400×600 LANCZOS). `tools/import_unified_frames.py` MAP 갱신 + `js/14_data_images.js` 매핑. ③ 프레임 좌표 스키마 확장 — `css/11_frame_coords.json` 의 `divine` 하위에 `elements.{fire,lightning,holy,dark}` 중첩 추가(default slots/boxes 는 fallback 유지). `tools/json_to_frame_css.js` 에 원소별 CSS 블록 생성 로직 추가 → `[data-element="..."]` 셀렉터로 CSS 출력, 40_cards.js 의 `data-element` 속성과 자동 매칭(런타임 JS 수정 불필요). ④ 편집기 재구성 — `tools/coord_editor.html` 을 8슬롯(4등급 + divine 4원소)로 확장: `RARITIES`/`SAMPLE_BG` 를 `SLOT_NODES` 배열로 통합, `coordData[rarity]` 접근을 `node.data()` 람다로 추상화. 배경 샘플: bronze=apprentice/silver=knight/gold=phoenix/legendary=griffin_knight(archangel 이 divine 으로 이동하여 교체), divine_fire=dragon/divine_lightning=titan/divine_holy=archangel/divine_dark=archfiend. ⑤ 서버 `/save-coords` 검증 확장 — `data.divine.elements` 각 원소 slots 검증(슬롯 이름·숫자·범위). ⑥ 기존 미커밋 8건(4/20 1차)을 먼저 3커밋으로 분리(에셋 일괄/프레임 해체/스키마+핸드오프) + 단계 A(카드별 override 로더)·단계 B(card_slot_editor 편집기) 2커밋 + Step C 2커밋 → 총 8커밋 origin/master push 완료(`f30cf69..0d9b701`).
- 이유: 대표님 지적 "같은 등급 프레임을 쓰는 유닛은 슬롯 위치가 다 똑같고, 카드별이 아니라 등급별로만 맞추면 된다" → 카드별 override(단계 A/B)는 과잉 설계로 판명. 다만 divine 은 원소별 프레임이 달라 단일 등급 좌표로 불충분 → 등급별 1세트 + divine 만 원소별 4세트 하이브리드가 정답. `이미지제작_원본/.../암흑의신대악마.png` 가 이미 합성되어 있었는데 데이터가 아직 등록 안 된 상태였고, dragon/archangel 은 4/19 이전부터 "신 드래곤"·"신 대천사" 로 네이밍됐지만 rarity 는 legendary 로 잘못 들어가 있었음.
- 영향: ① divine 카드 4장 확정(fire/lightning/holy/dark — water/earth 는 차후). ② legendary 가 lich/griffin_knight/griffin_rider 3장(전부 attack 롤)만 남아 defense/support 공백 → 대표님 새 legendary 제작 예정. ③ 편집기 좌표 편집이 이제 **그리드 1장(기존 coord_editor) 으로 완결** — card_slot_editor(단계 A/B 보조 도구)는 빈 override = no-op 상태로 남아 역할 없음(향후 롤백 검토). ④ Claude Design(2026-04-17 출시) 활용 논의 — 공개 레포 `github.com/chahongpil/realm-of-fates` push 완료로 design-system 학습 가능, handoff bundle 로 Claude Code 연계하는 폐쇄 루프 준비됨. ⑤ 4번째 좌측 슬롯(노란색) 기획 미결 — rage/luck 중 선택 대기.
- 이전 결정: 2026-04-20 1차 "시스템 프레임 시대 종료" → 2차에서 divine 원소별 구조 완성. 2026-04-15 "divine 다이아 테두리 스펙" 의 CSS 정식화.

## 2026-04-20 ▶ 콘텐츠 ▶ 일러스트 일괄 교체 (대표님 프레임 일체화 32장 + 타이탄 8프레임 APNG + 신규 6캐)
- 변경: 대표님이 합성한 "프레임+유닛 일체화" 한글 PNG 41장 → game/img/ 에 이식. ① 기존 ID 매칭 25장(견습마법사~화염의신드래곤+빙결술사_남자→cryomancer+거인리치→lich) → 400×600 LANCZOS 비율유지 캔버스. ② 신규 6캐: archer(궁병, bronze lightning ranged) / cryomancer_f(빙결술사_여, silver water support) / griffin(silver lightning beast) / griffin_knight(legendary fire human, "심홍의 그리핀 기사") / griffin_rider(legendary holy human, "전설의 그리핀 용사") / armored_griffin(gold earth beast). 11_data_units.js 6항목 추가 + 14_data_images.js 매핑 추가. ③ 타이탄 8장(타이탄1~8.png) → APNG 8프레임 90ms loop=0 합성 → titan.png 1.86MB 갱신. 도구: tools/import_unified_frames.py + tools/build_titans_apng.py.
- 이유: 대표님이 25장 + 신규 7장 + 타이탄 시퀀스를 프레임 일체화 상태로 일괄 제공. 메인은 합성 안 하고 받은 PNG 그대로 ID 변환·리사이즈·배포만(2026-04-19 결정 재확인). divine 등급 5원소 확장의 첫 단계로 신규 그리핀 시리즈가 legendary 풀 보강.
- 영향: 유닛 51종(기존 45 + 신규 6). 회귀 9/9 PASS(2회). 한 폴더(`game/이미지제작_원본/일반유닛_원본/프레임 일체화/`) 일괄 임포트 → ID·리사이즈·배포 자동화 도구 정착(`tools/import_unified_frames.py` 재사용 가능).
- 이전 결정: 2026-04-19 "프레임 합성은 대표님이 직접, 메인은 받은 PNG 적용만" 결정의 첫 대규모 적용.

## 2026-04-20 ▶ 게임 메커닉 ▶ 시스템 카드 프레임 PNG/CSS 전면 해체 (대표님 통합 PNG 풀카드 표시)
- 변경: 시스템이 카드 위에 씌우던 외곽 프레임 PNG 18장(`card_frame.png` + `frame_*.png` 17장) 전부 폐기 → `trash/img_frames_2026-04-20/` 보존. CSS 정리: ① `css/30_components.css` `.card-inner::before` (card_frame.png 오버레이) 제거 + `.card-icon img` `object-fit:cover → contain`, ② `css/31_card_system.css` `.cv-illust` `left:20% top:12% width:60% height:60% cover → inset:0 + background-size:contain` (풀카드, 잘림 0), `.cv-frame` `display:none` (등급별 frame_*_tank.png 매핑 일괄 폐기). 대표님 통합 PNG 가 프레임/슬롯박스/이름배너까지 다 포함하므로 **이중 프레임 해체**. 시스템은 일러스트 풀카드 표시 + 숫자/이름 오버레이만 담당. 검정 배경 fallback 으로 종횡비 차이 흡수.
- 이유: 4/19 대표님 프레임 일체화 PNG 25장 + 신규 6캐 적용 후 시각 검증에서 "시스템 프레임 안에 일러스트 프레임이 또 들어간 이중 프레임" 확인. 대표님 결정: "프레임 자체를 날려버려, 앞으로는 프레임+유닛 결합된 카드를 그대로 짤리지 않게 쓰면 된다". 메인은 합성/외곽 프레임 책임에서 손 떼고 풀카드 표시 + 숫자 오버레이만.
- 영향: card-v2 컴포넌트의 시각 책임이 단순화(외곽/등급 표현 100% 일러스트 위임). 다음 단계로 카드별 슬롯 좌표 매핑(현재 등급별 1세트 → 카드별 override) + 슬롯 편집기 필요 — 대표님 통합 PNG 의 슬롯 위치가 카드마다 다르기 때문(예: knight=상단 작은 배너 / archangel=중앙 큰 배너 / NRG 보석 위치 카드별 상이). `data/card_slot_overrides.json` 스키마 작성까지 진행, 런타임 로더/렌더러 적용 + 편집기 UI 는 다음 세션. 회귀 9/9 PASS, 시각 검증 완료(`shots/2026-04-20-cards-after-frame-removal.png`).
- 이전 결정: 2026-04-12 "card-v2 다크 석재 고딕 아치 프레임 도입" → 2026-04-18 "PHASE 3 방패 프레임" → 2026-04-19 "암흑 divine 프레임 추가" 의 종결. 이제 시스템 프레임 시대 종료, 대표님 통합 PNG 시대 시작.

## 2026-04-19 23:43 ▶ 세션 ▶ 핸드오프 저장
- 변경: 세션 상태를 `docs/handoff/handoff-2026-04-19-2343.md` 에 저장 + 클립보드 복사.
- 이유: 수동 저장 (세션 마무리, 대표님 휴식).
- 영향: 다음 세션은 이 문서 붙여넣기로 즉시 컨텍스트 복구.

## 2026-04-19 ▶ 팀/협업 ▶ S2 고스트 PvP 마무리 결정 (봇 시드·패배 정책·UX)
- 변경: S2 고스트 PvP 99% 구현 완료 상태에서 남은 4건 결정 정리. ① 봇 시드 — `supabase/migrations/003_s2_bot_seed.sql` 5명(유랑검사/잿빛 마법사/강철의 약속/독사의 미소/용맹의 깃발, LP 10/25/50/75/120) + `deck_snapshots.user_id` NULL 허용. ② 패배 정책 — 현행 유지(승리 시만 스냅샷, "최고의 순간 박제" 컨셉). ③ 콜로세움 UX — C안 추천(훈련 화면에 "🏟️ 아레나 도전" 버튼 명시 진입, 별도 작업으로 분리). ④ E2E 체크리스트 8개 정리. 결정 정본은 `design/s2-finalization.md`.
- 이유: 코드는 4/16~4/19 사이에 구현 완료됐으나 시그널 미반영(트랙6 시그널이 4/15 1줄만)으로 진행 상황이 가려졌음. 후속 운영 결정(봇 / 매칭 정화 / UX 진입점) 이 미정인 상태에서 출시하면 첫 유저가 매칭 0%, 약덱 박제, 훈련/PvP 혼동 등 즉각 블로커. 결정 문서로 매듭짓고 시드 SQL 까지 미리 준비.
- 영향: 대표님이 Supabase Studio 에서 003 SQL 실행 → E2E 8개 체크 → 출시 준비 완료. 트랙6 시그널 보충 7건 append 로 가시성 회복. 메인 세션이 트랙 영역(supabase/, 35_backend.js) 건드릴 때 시그널 append 의무 재확인.
- 이전 결정: 2026-04-15 "트랙 6 신설 (경로 C 풀 PvP MMO, 가챠 없음)" — S2 단계 진입.

## 2026-04-19 ▶ UI ▶ 타이틀 배경 + 게이트 1클릭 + 토큰화 위생 + 검수관 검증 룰
- 변경: ① **타이틀 배경**: 대천사 일러스트(1672×941 → 1280×720 LANCZOS) 로 교체, 단일 `rgba(0,0,0,.3)` 오버레이 → 그라디언트(`.05 → .15 → .4`) 로 신성 톤 살리고 하단 가독성 유지. 기존 PNG 는 `img/_archive/bg_title_pre_2026-04-19.png` 로 백업. ② **게이트 1클릭**: `js/51_game_town.js:223-237` `gate` ID 분기 추가. 나무문~천공문 한 번 클릭 시 즉시 `startBattle` (편성) 진입. 다른 건물(성/대장간/선술집 등) 은 두 번 클릭 패턴 유지(첫 클릭 = 증축 버튼 노출 의도). ③ **토큰화 위생**: `.fr-badge` `#888 → var(--text-3)`, `#eee → var(--text-1)` (4곳, 41_formation.css). `.rew-pick-card` raw `rgba(...)` → `color-mix(in srgb, var(--token) X%, transparent)` (3곳, 42_screens.css). ④ **검수관 검증 룰**: 검수관 P0 2건이 4/15 옛날 스크린샷 기반 false positive 로 판명(HP 위치 / 보상 4지선다 깨짐). 4/19 최신 스크린샷에서 모두 정상.
- 이유: ① 기존 갈색 배경이 게임 톤(다크 판타지 + 신성)과 부합도 낮았고 신성 일러스트가 P2 컨셉에 맞음. ② 대표님 지적 — 나무문이 게임 진입의 핵심인데 두 번 클릭 패턴이라 마찰. 다른 건물은 증축 결정 단계가 있어 두 번 클릭이 안전. ③ 검수관 P1 토큰 외 raw 색 지적 — `--rar-*`, `--curr-gold`, `--text-*` 토큰 팔레트 외 직접 hex/rgba 가 누적되면 등급 색 일괄 교체가 어려움. ④ 검수관이 본 스크린샷이 코드 변경 후 갱신 안 된 상태였음. 정적 검사 도구가 시각 상태를 표상한다는 가정이 깨질 수 있음 → 타임스탬프 검증 룰 추가.
- 영향: 회귀테스트 9/9 통과(2회). 시그널 append 5건(main/docs-lore/online-backend/assets). `current-focus.md` 4/16 → 4/19 갱신. 검수관 호출 시 향후 "검수관이 본 스크린샷의 mtime ≥ 마지막 관련 코드 변경 시점" 확인 권장 — `08-garbage-lessons.md` 후속 추가 검토.
- 이전 결정: 2026-04-13 "타이틀 버튼 나무 배경 사고" — 투명 PNG + 100% 100% 스트레치 트랩 교훈. 2026-04-15 "PHASE 3 사망 애니" — 검수관·플레이 디렉터 교차검증 도입.

## 2026-04-19 ▶ 구조 ▶ Type A 래퍼 CSS 전면 통일 (tavern/deckview/castle)
- 변경: 3개 Type A 래퍼의 CSS 를 `position:absolute; inset:0; width:100%; height:100%; padding:0; margin:0; pointer-events:none;` + `> *{pointer-events:auto}` 로 통일. 자식 토큰 8건(`tav-tab-unit/hero`, `tav-info`, `dv-tab-deck/codex`, `castle-tab-upgrade/quest`) 의 좌표를 부모 top/left 포함한 스테이지 절대좌표로 재설정 — 예: `tav-tab-unit-y: 600 → 660`, `tav-tab-unit-x: 463 → 483`. 편집기 `screen_editor_zones.html` defaults 동기화. church 는 제목 텍스트가 flow 렌더라 Type B (부분 absolute) 유지. 실측 위치 불변 (offsetTop 검증 완료: tav-tab-unit y=660, tab-deck y=122, castle-tab-upgrade y=111).
- 이유: 2026-04-19 선술집 탭 잠금 사고의 근본 해결. 당시 부모 래퍼 `top:60` + 자식 `top:659` → 실측 y=719 (뷰포트 720 탈출, 탭 비가시)를 증상 대응(`659→600`)으로 막았지만, 편집기 defaults(스테이지 기준)와 런타임 토큰(상대 기준)이 엇갈리는 구조적 원인이 남아있었음. 다음에 대표님이 편집기에서 좌표 드래그할 때 같은 사고 재발을 막는 예방 리팩터.
- 영향: 편집기에서 본 좌표와 런타임 좌표가 1:1 대응. `/래퍼분해` 스킬의 Type A 골든 패턴 규정화(`pointer-events:none` 래퍼 + `auto` 자식). `rules/08-garbage-lessons.md` 에 후속 조치 + 골든 패턴 추가. 회귀테스트 9/9 통과.
- 이전 결정: 2026-04-19 "Type A 래퍼 좌표 중첩 사고" 교훈 증류 후 예고된 "별도 과제".

## 2026-04-19 ▶ 게임 메커닉 ▶ skillIds 명시 액티브 필드 도입
- 변경: `11_data_units.js` 에 선택 필드 `skillIds?: string[]` 추가. 명시 시 `ACTIVE_BY_ELEM_ROLE` 원소+역할 자동매칭을 대체하며 `12_data_skills.js` 의 passive=false 스킬을 ownerId 스탬프해 유닛에 붙인다. 기본 공격/원소 시그니처 2장은 항상 자동 생성. `buildUnitSkillSet` 분기 구조: `unit.skillIds` 배열 존재 시 → DB 해결, 미지정 시 → 기존 자동매칭 fallback. `Battle.getSkillsOf` 는 STATE.skills filter 만 담당(1순위 중복 분기 제거 — 단일 해석 지점). `legacyCardToV2Unit` 에 skillIds 패스스루. 샘플 유닛 2종(`h_m_fire`/`knight`) 에 `skillIds` 명시 — 둘 다 현행 fallback 결과와 동일 스킬이라 **밸런스 변동 0**.
- 이유: 액티브 스킬 할당이 원소+역할+등급 규칙에 갇혀 있어 콘텐츠 작가가 "이 유닛에만 이 스킬" 을 표현할 수 없었음. divine 급이나 특이 유닛(예: titan 의 뇌격)이 자동매칭에 의존하면 시그니처 스킬과 겹치거나 공백이 되는 문제가 예상됨. skillIds 필드는 content-as-data 의 기본 — 마이그레이션 안전장치(fallback 유지)를 깔고 점진적 전환 가능.
- 영향: 향후 신규 유닛/리워드에서 특수 액티브 지정이 한 줄로 가능(`skillIds:['sk_foo','sk_bar']`). test_run.js 에 파이프라인 회귀 추가(h_m_fire pinned / knight pinned / h_m_water fallback). `units_export.txt` 에도 필드 안내 필요(후속). 빈 배열 `[]` = "액티브 없음 의도" 로 명확히 구분.
- 이전 결정: 2026-04-19 "액티브 스킬 8장 + 원소+역할 자동매칭" — 도입 당시 "추후 skillIds 필드 생기면 fallback" 으로 주석에 예고돼 있었던 계획된 다음 단계.

## 2026-04-19 ▶ UI ▶ 편성 화면 원소 공명 미리보기 배지
- 변경: 편성 화면(`#formation-screen`) 서브 텍스트 아래에 `#form-resonance` 배지 영역 추가. 현재 슬롯 원소 카운트를 `Battle.computeResonance` 로 실시간 계산 → 2체+ 원소마다 `🔥 ×2 +10%` 형태의 pill 배지. 티어별 시각 차등: `fr-t2`(기본) / `fr-t3`(1.05배 확대) / `fr-t4`(1.10배 + 1.6s 펄스 글로우). 공명 없을 땐 `::before` 로 "동일 원소 2명 이상 편성 시 공명 효과 발동" 안내. 다중 원소 공명 시 카운트 내림차순 정렬. 호버 title 에 피격 저항(3체+ = -10%, 4체+ = -20%) 까지 노출.
- 이유: 원소 공명은 전투 중에만 배지로 인지되었고(`#battle-hit-react .bhr-reso`) 편성 단계에서는 "이 조합이 공명이 터지는가?" 를 전혀 보여주지 못해 편성 의사결정 레이어가 비어있었음. 공명을 전투의 핵심 결정축으로 설계한 PHASE3_ELEMENT_PLAN 의도상 편성 단계에서 미리 보여주는 게 정본.
- 영향: 플레이어가 덱 5장을 배치·교체할 때마다 공명 배지가 즉시 업데이트. 공격 +N% / 저항 -N% 수치가 투명하게 보여 편성 실험의 체감 비용이 사라짐. 전투 엔진의 `Battle.computeResonance` 재사용이라 단일 source of truth. 편집기 zones 에도 `form-reso` 추가되어 대표님이 위치 튜닝 가능.
- 이전 결정: 2026-04-19 "원소 공명 (편성형) 전투 엔진 반영" 및 같은 날 "원소 공명 발동 배지 (데미지 팝업)" 의 편성 단계 확장 — 계획된 다음 단계.

## 2026-04-19 16:02 ▶ 세션 ▶ 핸드오프 저장
- **변경**: 이번 세션 상태를 `docs/handoff/handoff-2026-04-19-1602.md` 에 저장 + 클립보드 복사.
- **이유**: 수동 저장 (세션 마무리).
- **영향**: `docs/handoff/`.
- **이전 핸드오프**: `handoff-2026-04-19-session-mid.md` (오후 중반).

---

## 2026-04-19 ▶ 게임 메커닉 ▶ armor/thorns 파서 파라미터화 + infantry 하위 차별
- **변경**: `55_game_battle.js` 의 armor 감쇄 하드코딩 `-3`, thorns 데미지 하드코딩 `4` 를 각각 `ct.skillArmor ?? 3`, `dbt.value ?? 4` 로 파라미터화.
- **데이터 적용**: infantry 에 `skillArmor:2`, `bonusTrigger.value:3` 신규 필드 추가. desc 도 `-2 / 3데미지` 로 조정. 기존 영웅(h_m_earth/h_r_earth) 은 필드 없으므로 기본값(3/4) 폴백 — 기존 밸런스 보존.
- **결과**: 영웅 armor -3 / thorns 4 vs 일반 보병 armor -2 / thorns 3. 일반이 영웅 하위판으로 정상 차등.
- **이유**: balance-auditor 가 지적한 "armor+thorns 조합이 영웅·일반 중복 설계" 해소 + desc/파서 수치 불일치 해결.
- **파일**: `js/55_game_battle.js`, `js/11_data_units.js`.

---

## 2026-04-19 ▶ UI ▶ 원소 공명 발동 배지 (데미지 팝업)
- **변경**: 피격 시 데미지 숫자 아래에 `공명 +N% · 저항 -N%` 배지 900ms 플로팅. `calc.resoMult > 1` 또는 `calc.resoResist < 1` 일 때만 노출.
- **이유**: 공명 로직이 있어도 체감 경로가 없으면 편성 전략 유도 불가 (검수관 지적).
- **구현**: `index.html` `#battle-hit-react` 에 `.bhr-reso` slot 추가. `css/41_battle_v2.css` 에 `bv2ResoFadeUp` 키프레임. `js/60_turnbattle_v2.js` `renderHitReact` 에서 배수 라벨 조립.
- **파일**: `index.html`, `css/41_battle_v2.css`, `js/60_turnbattle_v2.js`.

---

## 2026-04-19 ▶ 콘텐츠 ▶ 일반 유닛 bronze 추가 — 보병 (infantry)
- **추가**: `infantry` / 보병 / earth / defense / melee / human / 🪖 아이콘. 스탯 `atk2 hp12 def2 spd1`, skill `armor(피해-3)`, bonusTrigger `thorns 20%(반사4)`.
- **포지션**: earth 공명 편성의 첫 일반 defense 탱커. 기존 earth bronze 는 `militia/wolf(attack)` + `herbalist(support)` 만 있어 defense 슬롯 공백이었음.
- **일러스트**: 대표님 `이미지제작_원본/일반유닛_원본/일반_보병_투명.png` 제공 → `img/infantry.png` (400×600, 432KB 리사이즈).
- **검증 결과**: balance-auditor 1차 블로커(desc vs 파서 수치 불일치) → desc 를 파서 고정값(armor -3, thorns 4) 에 맞춰 수정 후 통과.
- **잔존 이슈**: `armor`/`thorns` 파서가 55_game_battle.js 에 하드코딩. 유닛별 수치 차등화 불가. 추후 `dbt.value` 파라미터화로 영웅(강)/일반(약) 구분 가능. 현재는 h_m_earth 와 스킬 구성 중복이지만 역할(영웅 vs 소모품)로 차별.
- **파일**: `js/11_data_units.js`, `js/14_data_images.js`, `img/infantry.png`.

---

## 2026-04-19 ▶ 게임 메커닉 ▶ 원소 공명 (편성형) 전투 엔진 반영
- **변경**: PHASE3_ELEMENT_PLAN.md 의 편성형 공명 수치를 데미지 계산기에 합성. 전투 시작 시 `Battle.STATE.allyReso`/`enemyReso` 에 원소별 카운트를 stamp.
- **배수**: 같은 원소 2체 ×1.10 / 3체 ×1.20 / 4체+ ×1.35 (공격 측 `caster.element` 기준).
- **저항**: 피격자 편이 동일 원소 3체+면 받는 데미지 ×0.90 / 4체+면 ×0.80 (저항 해석은 "같은 원소 공격에 대한 감쇄"로 단순화).
- **합성 순서**: `base × elementMult × critMult × resonanceBonus × resonanceResist`. 기존 값 보존, 공명이 독립 곱셈으로 추가.
- **미구현**: 4체 특수 효과(화염폭풍/빙하의축복/번개의각성 등)는 후속 반복에서 진행. 편성 단계 UI 배지(공명 등급 표시)도 미구현.
- **파일**: `js/60_turnbattle_v2.js`.
- **이전 결정**: 2026-04-18 "액티브 스킬 확장 → 원소 공명 로직 추가" 핸드오프 메모에서 "편성형 vs 연쇄형" 중 PHASE3 기획서 정본인 **편성형만** 채택.

---

## 2026-04-19 ▶ UI ▶ 선술집 탭 상호 배타 비활성화 (편집기 지시반영)
- **변경**: 선술집 `용병 모병` / `영웅 모집` 탭 중 **현재 선택된 탭은 짙은 회색으로 잠금**(disabled + `.tav-tab-current`). 반대 탭은 금색(클릭 가능).
- **이유**: 대표님 편집기 지시 박스 — "같은 탭을 다시 누를 필요가 없으므로 시각적으로 잠그면 명확".
- **영향**: 진입 시 기본이 "용병 모병" 이므로 그 탭이 회색 잠금, 영웅 모집 클릭 시 반전. 기능 동일.
- **보조 수정**: `--tav-tab-unit-y` / `--tav-tab-hero-y` 토큰을 `659px → 600px` 로 내림. 부모 `.tav-tabs` 래퍼가 `position:absolute; top:60px` 이어서 자식 `659` 가 실측 `719` 로 뷰포트 720 밖에 탈출하던 레거시 이슈 동시 해결(검수관 블로커 지적).
- **관련 파일**: `js/52_game_tavern.js`, `css/42_screens.css`, `css/10_tokens.css`.
- **잔존 이슈**: Type A 래퍼(부모 absolute → 자식 absolute) 는 스테이지 좌표가 부모 오프셋과 중첩되는 구조적 문제 존재. prologue/deckview/castle 등 동일 패턴 래퍼에도 유사 y-drift 가능성. 다음 세션에 일괄 점검 필요.

---

## 2026-04-19 14:10 ▶ 세션 ▶ 핸드오프 저장 (세션 2 중간)

**변경**: 세션 상태를 `docs/handoff/handoff-2026-04-19-session-mid.md` 에 저장.
**이유**: 수동 저장. P0 3건 + P1 3건 + 가비지 2차 청소 + 구조 단일화까지 9 커밋 완주 후 대표님 이미지·스탯 편집 시간 확보용 체크포인트.
**영향**: `docs/handoff/`

---

## 2026-04-19 ▶ 팀/협업 ▶ 트랙 규칙 비대칭 전환

**변경**:
- **메인 세션**: 전 영역 편집 가능. 건드린 트랙 영역은 `tracks/_signals/<track>.md` 에 append 필수 (의무)
- **트랙 전용 세션**: 자기 `START.md` 의 "수정 허용" 범위만 — "집중 모드"로 표현 변경 (기존 "절대 금지" 문구 완화)
- **점유 선언**: 트랙이 1시간 이상 작업 시 `🔒 점유 시작 — …` 를 신호에 먼저 쓰고, 메인은 점유 중 영역 건드리기 전 확인
- 각 트랙 `START.md` 4종에 점유 선언 예시 블록 추가

**이유**:
메인이 이미 `design/`, `PHASE*.md`, `.claude/rules/` 같은 트랙 영역을 자주 편집하는데 기존 규칙상 "트랙 전용"이라 신호에 안 남음 → 트랙 전용 세션 레이더에서 실종됨. 대칭 규칙은 현실과 맞지 않아 시그널 무결성이 무너짐. 비대칭으로 전환하여 "메인 전권 + append 의무" 로 현실화.

**영향**:
- `CLAUDE.md` — 병렬 트랙 섹션 재작성
- `tracks/01-assets/START.md`, `tracks/02-data-balance/START.md`, `tracks/05-docs-lore/START.md`, `tracks/06-backend/START.md` — "절대 금지" → "집중 모드 범위 밖" 표현 + 점유 선언 섹션
- 향후 메인 세션은 트랙 영역 편집 시 반드시 signals append

**이전 결정 관계**:
- 2026-04-14 (병렬 트랙 구조 세팅) 의 후속. 대칭 규칙의 현실 괴리를 비대칭으로 보정.

---

## 2026-04-19 ▶ 구조 ▶ 상위 `c:/work/design/` 폐기 — game/design 단일화

**변경**:
- `c:/work/design/` 전체를 `c:/work/trash/design_root_2026-04-19/` 로 이동 (삭제 아님, 안전망)
- `c:/work/game/design/` 를 유일한 정본으로 확정
- `c:/work/.claude/hooks/session_start.py` 의 `ROOT/design/current-focus.md` 경로를 `ROOT/game/design/current-focus.md` 로 수정
- 상위에만 있던 `frame-prompt-rules.md` 는 하위로 복사 후 이관
- 상위에만 있던 `game-harness-v1.0 (2)/` 아카이브는 trash 와 함께 이동

**이유**:
`c:/work/design/` 와 `c:/work/game/design/` 이 평행선으로 공존하며 파일 14개는 같고 1개(`changelog.md`)만 분기되는 일이 반복됨. 4/16 세션에 "design/ 통합" 을 한 번 했으나 수동 복사이라 다시 분기됨. `c:/work` 는 non-git 이고 `c:/work/game` 이 git 정본이므로, 하위로 단일화하고 훅 경로만 맞추는 게 근본 해결.

**영향**:
- `session_start.py` 1줄 변경 — 이후 세션 `current-focus.md` 를 정본에서 로드
- 상위 `design/` 참조하던 임시 문서/스크립트는 폴백 실패 시 trash 폴더에서 복구 가능
- git diff 에는 game repo 내부 영향 없음 (`c:/work/design/` 는 git 밖이었음)

**이전 결정 관계**:
- 2026-04-16 "design/ 통합 완료" 의 후속. 수동 복사 방식의 결함을 단일화로 해소.

---

## 2026-04-19 ▶ 세션 ▶ 핸드오프 저장 (심야)

**변경**: 세션 상태를 `docs/handoff/handoff-2026-04-19-session-end.md` 에 저장.
**이유**: 수동 저장. demo/dev 잔재 제거 + 분할 커밋 4건 + 패시브 스킬 전면 개편 완료 후 다음 세션에 "계속 진행" 으로 이어감.
**영향**: `docs/handoff/`

---

## 2026-04-19 ▶ 밸런스 ▶ 패시브 스킬 전면 개편

**변경**: 패시브 29장 → 28장 (맹독 제거). 전 패시브 `cost:0`. 수치 전반 축소(atk+3→+1, eva+6→+1 등). `role:'crit'` 카테고리 신설(sk_tough). 확률 발동 마커 4종 도입 — `proc_double_cast`/`proc_nullify_hit`/`hp_mult`/`grant_rebirth(params)` + 별도 필드(procChance, hpMult, rebirthHp 등). `invincible3` 하드코딩 → 정규식 `invincible(\d+)`. `sk_handoff` 의미 변경(아군 40% 추가공격권 → 3% 본인 2회 캐스팅).
**이유**: 대표님이 `c:/tmp/skills_relics_export.txt` 편집으로 직접 재디자인. 장착 가격 제거로 덱 빌딩 자유도 확보, 수치 축소로 단일 스킬 파워 스파이크 완화.
**영향**: `js/12_data_skills.js`(데이터), `js/20_helpers.js`(파싱), `js/55_game_battle.js`(dead handoff 블록 삭제), `tools/test_run.js`(sk_handoff golden 갱신). 신규 마커 실제 전투 발동 로직은 다음 스프린트.

---

## 2026-04-18 ▶ 게임 메커닉 ▶ demo/dev 잔재 전면 제거

**변경**: 본판 UI 의 "▶ PHASE 3 시네마틱 데모 (DEV)" 타이틀 버튼 + "수직 슬라이스 데모 시작" 전투 idle 버튼 삭제. `Battle.DEMO` → `Battle.STATE` 리네임. 번개 타이탄 5+5 하드코딩 + ally_1 스킬 5장 삭제. `findSkillById`/`getSkillsOf` SKILLS_DB 1순위 반전. `v2.demoStart` 핸들러 / `startDemo` / `playDemoRound` 함수 / `is-real-battle` 클래스 전부 삭제.
**이유**: 대표님 "본판에 데모(dev)가 있는데 이건 왜 그런거지?" 지적. 수직슬라이스 초기 하드코딩이 본판에 그대로 노출되어 있었음. 실전 경로를 `startFromLegacyBS(bs)` 단일로 정리.
**영향**: `index.html`, `css/41_battle_v2.css`, `js/60_turnbattle_v2.js`, `js/62_ghost_pvp.js`, `js/config_battle.js`, `tools/_*.js` 5개. 커밋 `3e1018b`.

---

## 2026-04-16 ▶ 세션 ▶ 핸드오프 저장 (오후)

**변경**: 세션 상태를 `docs/handoff/handoff-2026-04-16-session2.md` 에 저장.
**이유**: P1-3 Ready + P2-1 Lore Bible + S2 Ghost PvP + design/ 통합 완료. 커밋 4개.
**영향**: `docs/handoff/`

---

## 2026-04-16 ▶ 게임 메커닉 ▶ S2 고스트 PvP 비동기 대전

**변경**: deck_snapshots + pvp_matches DB, Backend API 4종, Arena 모듈, 매칭 UI.
**이유**: 트랙6 S2. LP ±100 범위 랜덤 매칭, 승리 시 덱 자동 스냅샷.
**영향**: `js/62_ghost_pvp.js`(신규), `js/35_backend.js`, `js/58_game_battle_end.js`, `supabase/migrations/002_s2_ghost_pvp.sql`

---

## 2026-04-16 ▶ 게임 메커닉 ▶ P1-3 큐잉 Ready 버튼 + 10초 타임아웃

**변경**: 큐잉 타이머 30초→10초 단축. "⚔️ 준비 완료" Ready 버튼 추가 — 누르면 즉시 실행 단계.
**이유**: 3장 덱으로 28초 순수 대기 문제 (플레이 디렉터 실측). 전투 템포 개선.
**영향**: `js/60_turnbattle_v2.js`, `index.html`, `css/41_battle_v2.css`

---

## 2026-04-16 ▶ 콘텐츠 ▶ P2-1 6원소 신 Lore Bible 1-pass

**변경**: `design/lore-bible.md` 신규 작성. 6원소 신 개별 서사 (성격/시험/파편/가호/저주/관계/대사 샘플) + 운명의 여신 + 관계 매트릭스 + 게임 내 활용 가이드.
**이유**: 평의회 지적 "세계관 공백 — 서사 레이어 없음". 카드 설명/NPC 대사/프롬프트 소스.
**영향**: `design/lore-bible.md` (신규), 향후 카드/스킬 텍스트에 적용

---

## 2026-04-16 ▶ 세션 ▶ 핸드오프 저장

**변경**: 세션 상태를 `game/docs/handoff/handoff-2026-04-16-session-end.md` 에 저장.
**이유**: S1 백엔드 구축 + 4지선다 보상 + 레시피 v2 완료. 커밋 4개, 검수관 2회.
**영향**: `game/docs/handoff/`

---

## 2026-04-16 ▶ 게임 메커닉 ▶ 4지선다 보상 시스템 (상자 제거)

**변경**: 기존 금/은/동 상자 보상 완전 제거 → 유닛/스킬/유물/골드 4개 중 택1.
**이유**: StS 스타일 전략적 보상 선택. 골드는 1~100 랜덤 도박 + 신의 은총 2배(유료 BM).
**영향**: `js/58_game_battle_end.js`, `css/42_screens.css`

---

## 2026-04-16 ▶ 수익 모델 ▶ 신의 은총 = 골드 도박 2배

**변경**: 신의 은총을 "광고 시청 → 골드 2배"에서 "골드 선택지 결과 2배"로 재정의. 무료=광고, 유료=광고 제거 BM.
**이유**: 가챠 폐지 이후 자연스러운 수익 포인트. 4지선다 골드 도박과 시너지.
**영향**: `js/58_game_battle_end.js`

---

## 2026-04-16 ▶ 기술 스택 ▶ S1 Supabase 백엔드 구축

**변경**: Supabase Auth + 클라우드 세이브 전체 파이프라인 구축. B안(기존 로컬 유지 + 선택적 이메일 연결).
**이유**: 트랙 6 로드맵 S1. 기기 간 동기화 + 향후 PvP 기반.
**영향**: `js/35_backend.js`(신규), `supabase/migrations/001_s1_init.sql`(신규), `index.html`, `js/50_game_core.js`, `js/32_auth.js`, `js/99_bindings.js`, `js/99_bootstrap.js`, `css/30_components.css`

---

## 2026-04-16 ▶ 콘텐츠 ▶ 프롬프트 레시피 v2 (얇은 금속 필리그리)

**변경**: 카드 프레임 스타일 "다크 석재 고딕 아치" 폐기 → "얇은 금속 필리그리 60~80px" 전환. 5등급 전부 프레임 프롬프트 완비.
**이유**: 대표님 "동굴 모양 싫어" 지적. 가볍고 우아한 방향.
**영향**: `game/PROMPT_RECIPES.md`

---

## 2026-04-15 ▶ 세션 ▶ 핸드오프 저장 (대형 세션 종료)

**변경**: 세션 상태를 `game/docs/handoff/handoff-2026-04-15-session-end.md` 에 저장. 클립보드 복사 완료.
**이유**: 컨텍스트 부담 + 대표님 휴식. 이번 세션은 평의회 회의·P0 3건·카드 등급 개편·"일곱 번째 자리" 스토리·트랙 6 신설·카드 레이아웃 v2 까지 5 결정이 누적.
**영향**: `game/docs/handoff/` (신규 문서 1건)

---

## 2026-04-15 ▶ 콘텐츠 ▶ 카드 레이아웃 v2 (14 영역 고정 좌표) + LUCK 앞면 표시 + 역할별 외곽 실루엣

**변경**: 카드 프레임을 **역할별 3종(tank/dps/support) × 등급별 5종 + 신 6원소** = **총 30 장**으로 확장하고, 앞면 UI 영역을 **14개 고정 픽셀 좌표**로 못 박음. 신규 스탯 **LUCK(행운/치명)** 를 앞면에 추가 (좌측 4번 슬롯).

**핵심 결정**:
- **캔버스**: 1024×1536 (2:3, 유지). 중앙 투명창 870×1010 (154-1024 x, 160-1170 y)
- **좌측 스탯 4 슬롯**: ATK / DEF / SPD / **LUCK** (각 100×190, y 180~970)
- **상단 바**: Lv 배지(40-140 x) / 원소 아이콘(160-260 x) / 이름(280-780) / HP(820-984)
- **장비 아이콘 3개**: 설명 바로 위, 가운데 정렬 (x 357-667, y 1180-1270, 각 90×90)
- **설명 영역**: 904×170 (60-964 x, 1280-1450 y)
- **NRG 배지**: 우하단 마름모 (820-984 x, 1460-1520 y)
- **역할별 실루엣**: 탱커=방패형(하단 V) / DPS=표준+고딕아치 / 지원=타원·둥근. **내부 14 영역 좌표는 전 30장 동일**
- **파일명**: `frame_{tier}_{role}.png` (일반), `frame_divine_{element}_{role}.png` (신)

**카드 앞면 스탯 (6종)**: HP / ATK / DEF / SPD / **LUCK** / NRG
**팝업 전용**: rage / eva / meva / hpReg / honor / curShield(0일 때) / status effects

**이유**:
- 평의회 회의(2026-04-15) 에서 **"카드 등급 개편이 픽셀에 안 보임 — 회색 덩어리"** 지적 (검수관) + **"역할별 시각 차별화 필요"** (게임 디자이너). 한 번에 해결.
- LUCK 추가: 치명타율은 전투 핵심이라 앞면에 필수 (밸런스 테스터 권고).
- 14 영역 고정: 프레임 30장 각자 텍스트 위치가 다르면 CSS 조건 분기 폭발 → 앞면 UI 한 번에 작성 불가. **단일 좌표 = 단일 CSS**.
- 역할 실루엣은 외곽만 변형: 데이터 연결 필드는 `range`(melee/ranged/support) 그대로 유지, 표시만 3역할 통합 (DPS = melee+ranged).

**영향**:
- [`design/card-layout.md`](card-layout.md) (신규) — Source of Truth, 14 영역 좌표표 + 역할 실루엣 + 파일명 규칙 + 카드 상태별 스케일
- `game/PROMPT_RECIPES.md` (예정) — 프롬프트 레시피 v2 (역할 모양 + 등급 색 + 신 원소) 추가 필요
- **대표님 작업**: 프레임 30장 PNG 신규 생성 (1024×1536, 14 영역 고정)
- **재상 병렬 작업**: CSS `--rarity-*` 토큰 + `.bv2-card` 자식 selector 14 좌표 매핑 + 신 등급 원소별 매핑 + 샤인 스윕 애니
- **미영향**: `js/11_data_units.js` 의 `rarity`/`range` 필드는 불변. 데이터 마이그레이션 0.

**이전 결정 관계**:
- [확장] 2026-04-15 "카드 등급 명칭·색 체계 개편" — 명칭·색 결정 위에 **좌표·실루엣·앞면 스탯 세트** 를 얹은 확장.
- [확장] 2026-04-13 "등급별 스타일 예산 (AAA/A/B/C/D)" — 아트 디테일 배분 위에 **UI 고정 좌표** 추가.
- [보완] `.claude/rules/06-card-ui-principles.md` 카드 상태별 크기 규칙은 그대로 유지. 이 문서는 **원본(1024×1536) 기준 UI 영역**을 정의, 상태별 스케일은 CSS 변수(`--bv2-card-w/h`)가 처리.

---

## 2026-04-15 ▶ 범위 ▶ 트랙 6 신설 (온라인·백엔드, 경로 C 확정)

**변경**: 게임 아키텍처를 **경로 C (풀 PvP MMO)** 로 확정. **가챠 시스템은 제거**. 작업을 **트랙 6 "온라인·백엔드"** 로 분리해 대표님이 병렬 Claude 세션으로 직접 리드.

**결정 사항**:
- **아키텍처**: 싱글플레이 코어 유지하되 Supabase + Colyseus 기반 온라인 레이어 추가
- **가챠 폐지**: 확률형 아이템 전면 금지 (한국 확률형 아이템 법규 우회 + 서버측 RNG 검증 부담 제거)
- **대체 수익 모델**: 시즌패스 + 카드 코팅 + 캐릭터 팩 직접 구매 (전부 RNG 없음)
- **6단계 로드맵**: S1 Auth+클라우드세이브 → S2 고스트PvP → S3 랭킹시즌 → S4 실시간1v1PvP → S5 길드·채팅 → S6 안티치트
- **현재 단계**: S1 진행 예정, 대표님 직접 리드

**기술 스택 확정**:
- Supabase (PostgreSQL + Auth + Realtime) — 무료 티어 시작
- Colyseus (Node.js, S4 부터)
- Cloudflare Pages (정적), Fly.io (서버)
- 유저 1000명까지 월 $10 이하

**파일 경계 (트랙 6 ↔ 메인 세션)**:
- 트랙 6 전담: `supabase/**`, `server/**`, `js/35_backend.js`(신규), `PHASE4_*.md`
- 메인 세션 전담: `index.html`, `css/**`, `js/32_auth.js`, `js/60_turnbattle_v2.js` 등 전투·UI·서사
- 조율 지점: `js/32_auth.js` 가 `Backend.*` 함수만 호출 (트랙 6 이 구현)
- 폴백 원칙: Backend 가 준비 안 됐으면 (`isReady=false`) 기존 localStorage 로 자동 폴백 → 싱글플레이 항상 작동

**이유**:
- 평의회 회의(2026-04-15)에서 기획서가 말하는 PvP/길드/시즌이 현재 아키텍처로 **구현 자체가 불가능** 임이 드러남 (서버 0, localStorage 평문, 클라측 RNG 등)
- 대표님이 풀 MMO 를 원함 → 경로 C 선택. 다만 가챠는 **법적 리스크 + 확률 검증 부담** 이 과해 제거
- 1인 개발 한계로 메인 세션(재미 구축) 과 트랙 6(인프라) 를 **분리 병렬** 작업 체제로 전환
- Supabase 선택 이유: PostgreSQL 네이티브, Firebase 보다 이관 쉬움, 무료 티어 넉넉 (유저 1만까지 무료)

**영향 파일**:
- `tracks/06-backend/START.md` (신규) — 포괄 브리핑, S1 체크리스트, 스키마 초안, 인터페이스 계약
- `tracks/_signals/online-backend.md` (신규) — 트랙 6 시그널 파일
- `tracks/README.md` — 트랙 6 행 추가, 충돌 방지 규칙 확장
- `.claude/settings.json` — Notification 훅에 트랙 6 소리(988→1319→1760, B5→E6→A6) 추가
- `.claude/hooks/session_start.py` — 트랙 6 감지 로직 추가
- `design/next-actions.md` — S1~S6 로드맵 편입

**후속 작업 (트랙 6 이 수행)**:
- Supabase 프로젝트 생성 → 001_s1_init.sql 스키마 적용
- `js/35_backend.js` 스켈레톤 → S1 API 구현 → 클라우드 세이브 → 마이그레이션
- `PHASE4_GACHA_PLAN.md` 를 "가챠 없음 / 시즌패스·코팅·직접구매" 로 재작성
- `PHASE4_ARENA_SEASON_PLAN.md` 를 S2·S3·S4 로 분해

**이전 결정 관계**: [전면 재정의] 2026-04-11 PHASE4 시리즈 (ARENA/GACHA/GUILD 기획서) 는 현재 아키텍처와 불일치. 트랙 6 이 이 문서들을 "S 단계" 기준으로 재작성.

---

## 2026-04-15 ▶ 콘텐츠 ▶ "일곱 번째 자리" 스토리 확정

**변경**: 게임 메인 스토리를 **"일곱 번째 자리 (The Seventh Throne)"** 영웅 서사시로 확정. 프롤로그 10씬 교체. `design/concept.md` 세계관 섹션 전면 재작성.

**핵심 뼈대**:
- 창세에 운명의 여신이 **일곱 자리** 를 남김. 여섯은 원초의 여섯이 차지, 일곱 번째는 비어 있음 — 조건: **"필멸자 출신만이 오를 수 있다"**
- 여섯은 이 자리를 두려워해 자신의 파편을 세상에 흘림 → 파편 = 카드
- 플레이어 = 평범한 필멸자 → 여섯의 시험 통과 → 일곱 번째 자리 등극
- 카드 등급(평범→희귀→고귀→전설→신) = 필멸자의 상승 단계와 일치 → 등급업 자체가 스토리
- 엔딩: 플레이어 영웅 카드가 신 등급으로 각성, 다섯 테두리 순차 피어남 + 원소+다이아 테두리 출현 + 여섯이 고개 숙임

**원초의 여섯 (확정)**:
| 원소 | 형상 | 이름 | 호칭 | 시험 축 |
|---|---|---|---|---|
| 🔥 불 | 블랙드래곤 | 그라힘 | 재의 왕 | 폭력 |
| 🌊 물 | 히드라 | 모라스 | 심연의 어머니 | 망각 |
| ⛰️ 땅 | 싸이클롭스 | 에이드라 | 외눈의 수호자 | 인내 |
| ⚡ 전기 | 번개 타이탄 | 비리얀 | 분노의 망치 | 속도 |
| ✨ 신성 | 대천사 | 세라피엘 | 새벽의 창 | 약속 |
| 🌑 암흑 | 대악마 | 네크리온 | 밤의 계약자 | 계약 |

계보 구성: 그리스 3(히드라/싸이클롭스/타이탄) + 성경 2(대천사/대악마) + 판타지 1(블랙드래곤).

**이유**:
- 이전 세계관은 "신들의 시대가 끝나고..." 두 문장 공백. 6원소 신이 이름조차 없어 영웅/스킬/플레이버 텍스트가 모두 공중에 떠 있었음 (디자이너 회의 지적: "이름은 있는데 이야기가 없다").
- 사용자 의도 = 영웅 서사시 + 상승 아크("내가 신이 된다"). 이 뼈대를 **카드 등급 시스템과 직접 결합** 해야 등급업이 플레이어에게 서사적 의미를 가짐.
- 6신의 "시험 축"(폭력/망각/인내/속도/약속/계약) 이 6원소 빌드 축과 1:1 매핑 → 덱빌딩 정체성이 **서사 선택** 이 됨 ("나는 네크리온의 길을 간다").
- 희생 코스트 시스템이 네크리온의 "밤의 계약" 철학과 일치 → 이미 구현된 메커닉에 서사적 정당성 부여.

**영향**:
- `game/js/32_auth.js:49-60` `showPrologue` 씬 배열 10개 교체 (7좌/여섯 신 형상·이름/필멸자 조건/일곱 번째 각성)
- `design/concept.md` 세계관 섹션 전면 재작성
- **후속 작업 (다른 세션)**:
  - 6신 각자의 시그니처 스킬·플레이버 텍스트 (콘텐츠 기획자 확장)
  - 6원소 영웅 18인 배경 서사 (P2-1 Lore Bible 1-pass 의 일부)
  - 네이밍 보이스 "망각된 신의 언어" 톤 통일 (콘텐츠 기획자 제안)
  - 엔딩 각성 컷신 구현 (등급 테두리 순차 피어남 + 원소+다이아)
- **코드 영향 없음** — 데이터 마이그레이션 불필요

**이전 결정 관계**: [확장] 2026-04-15 "카드 등급 명칭·색 체계 개편" (평범/희귀/고귀/전설/신+다이아) 위에 서사 레이어를 얹은 확장. 등급 시스템 자체는 불변. 내부 ID(`bronze~divine`) 도 불변.

---

## 2026-04-15 ▶ 콘텐츠 ▶ 카드 등급 명칭·색 체계 개편

**변경**: 카드 등급 표시 명칭과 색 팔레트를 전면 교체. 내부 데이터 ID(`rarity` 필드값)는 기존 그대로 유지 — 마이그레이션 비용 0.

| 내부 ID | 이전 명칭 | **새 명칭** | **새 표시색** |
|---|---|---|---|
| `bronze` | 브론즈 | 평범 | `#b8b8c0` (실버) |
| `silver` | 실버 | 희귀 | `#3a7bd5` (코발트) |
| `gold` | 골드 | 고귀 | `#9b59b6` (자수정) |
| `legendary` | 전설 | 전설 | `#f39c12` (호박금) |
| `divine` | 신 | 신 | 원소 가변 + **다이아 테두리** |

**신 등급 다이아 테두리 스펙**:
- 이중 테두리 — 안쪽: 원소색 실선(불 `#e74c3c` / 물 `#3498db` / 땅 `#8b5a2b` / 전기 `#f1c40f` / 신성 `#ffd700` / 암흑 `#8e44ad`), 바깥쪽: 흰색 glow + transparent fade
- 간헐적 샤인 스윕 애니 (6~10초 주기, 0.8초 지속, 피크 opacity ~0.35)
- 원칙: "평상시 조용, 특정 순간만 샤인" — StS2 / LoR 전설 연출 공식, 전투 중 시선 과점유 금지
- 금지: 무지개 회전, 상시 파티클, 테두리 두께 2배 초과

**이유**:
- 이전 "브론즈/실버/골드" 는 **리그 명칭**(브론즈~신의영역)과 충돌해 유저 뇌에 혼란.
- MTG/HS/LoR 관습상 초록 = uncommon, 파랑 = rare 로 고정되어 있어, 새 팔레트는 **카드게임 관습** 을 따라 온보딩 비용 0.
- "신" 등급이 다른 등급과 시각적으로 격이 달라야 하는데, 기존에는 단색 테두리라 차이가 불분명. 원소 가변 + 다이아 이중 테두리로 "격이 다르다" 를 즉시 전달.
- 빨강은 전투 UI에서 "적·위험" 신호색과 충돌해 등급 테두리로 부적합 → 호박금으로 교체.

**영향**:
- `.claude/rules/03-terminology.md` — 카드 등급 표 개편 + "등급 ≠ 리그 ≠ 코팅" 명시
- `.claude/rules/04-balance.md` — 유닛 등급 / 스킬 스펠·무기 표 명칭 교체 (내부 ID 병기)
- `.claude/rules/05-design-direction.md` — 등급 스타일 예산 표 + 신규 "등급별 테두리 팔레트" / "신 등급 다이아 스펙" 섹션 추가
- `design/balance.md` — 스탯 범위 섹션 헤더에 표시 명칭 병기, PHASE 3 스킬 수치표 명칭 교체
- **미수정 (의도적)**: `game/PHASE*.md` 17개 — 역사적 계획 문서. Source of Truth 전파로 자연 승계.
- **코드 영향 (별도 작업 승격)**: CSS 변수 `--rarity-*` 전역 교체, `rarityLabel(id)` / `rarityColor(id, element)` 헬퍼 신설, 신 등급 다이아 테두리 컴포넌트 + 샤인 애니 구현. `js/11_data_units.js` 의 `rarity` 필드값은 **불변** — 코드 마이그레이션 불필요.

**이전 결정 관계**: [확장] 2026-04-13 "등급별 스타일 예산" (05-design-direction.md, AAA/A/B/C/D 별칭 + bronze~divine 내부 ID) 은 유지. 이번 변경은 그 위에 표시 레이어만 추가한 보완. 내부 ID 를 건드리지 않으므로 번복 아님.

---

## 2026-04-14 20:46 ▶ 세션 ▶ 핸드오프 저장

**변경**: 세션 상태를 `docs/handoff/handoff-2026-04-14-2046.md` 에 저장
**이유**: 수동 저장 — 이번 세션 실질 작업 없이 직전 세션(2026-04-13 심야) 상태 그대로 이월
**영향**: `docs/handoff/` (신규 디렉터리)

---

## 2026-04-13 22:36 ▶ 세션 ▶ 핸드오프 저장

**변경**: 세션 상태를 `game/docs/handoff/handoff-2026-04-13-2236.md` 에 저장
**이유**: 수동 저장 (번개 타이탄 애니 교체 작업 단락 종료)
**영향**: `game/docs/handoff/`, `game/img/titan.png` (정적 → 애니 APNG 3.3MB, 8프레임, 400×600, 90ms/프레임), `game/img/titan_static.png` (원본 백업 신규), `game/img/titan.webp` (WebP 대기본 신규, 미적용)

---

## 2026-04-12 ▶ 기술 스택 ▶ 게임 개발 하네스 설치

**변경**: Claude Code 프로젝트 하네스 구축 (`.claude/`, `design/`, `CLAUDE.md`).

**이유**: 비개발자 2인 팀이 변화무쌍한 기획으로 게임 개발하려니 매 세션마다 맥락 재설명, 스키마 기억, 기획 변경 추적이 고통이었음. 8개 스킬 + 2개 에이전트로 자연어 한 마디에 데이터/문서/테스트를 한 번에 처리하게 함.

**영향**:
- 새 파일 29개 생성 (CLAUDE.md + .claude/ 21개 + design/ 7개)
- 기존 `js/`, `css/`, `index.html` 수정 없음
- 사용예시 문서 `docs/사용예시.md` 추가
- 설계 문서 `docs/superpowers/specs/2026-04-12-game-harness-design.md`

**이전 결정 관계**: 프로젝트 초기부터의 자연스러운 진화. 기존 결정 번복 없음.

---
