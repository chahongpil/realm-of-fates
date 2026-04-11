# Deep-Plan 리서치 결과 — Realm of Fates 구조 리팩토링

> 작성일: 2026-04-10
> 두 개의 병렬 리서치 종합:
> 1. 코드베이스 분석 (index.html 5546줄)
> 2. 빌드 없는 JS 분리 베스트 프랙티스 (2025년 기준)

---

## Part 1: 코드베이스 분석

### 1.1 파일 전체 개요

| 항목 | 값 |
|------|-----|
| 파일명 | `index.html` |
| 총 줄 수 | **5546줄** |
| HTML | ~350줄 |
| CSS | ~580줄 |
| JavaScript | ~4350줄 |
| 외부 의존성 | GSAP (CDN), Google Fonts |

### 1.2 JavaScript 전역 객체 전체 목록

#### 데이터 상수 (Data Constants)

| 이름 | 라인 | 크기 | 역할 |
|------|------|------|------|
| `R_LABEL` | 1002 | 단줄 | 등급 한글명 |
| `R_ORDER` | 1003 | 단줄 | 등급 순서 |
| `ROLE_L` | 1012 | 단줄 | 역할 한글명 |
| `ATTACK_EFFECTS` | 1013 | 단줄 | 공격 이모지 |
| `ELEMENTS` | 1014 | 단줄 | 속성 배열 |
| `ELEM_L` | 1015 | 단줄 | 속성 한글명 |
| `ELEM_ICON` | 1016 | 단줄 | 속성 이모지 |
| `ELEM_COLOR` | 1017 | 단줄 | 속성 색상 |
| `TRAITS` | 1019~1034 | 16줄 | 유닛 특성 정의 (14종) |
| `UNITS` | 1066~1255 | **190줄** | 유닛 DB (카드 전체) |
| `SKILLS_DB` | 1256~1292 | 37줄 | 스킬 DB |
| `RELICS_DB` | 1293~1307 | 15줄 | 유물 DB |
| `ENEMY_NAMES` | 1308~1322 | 15줄 | 적 이름 |
| `HERO_ROLES` | 1323~1328 | 6줄 | 영웅 역할 |
| `STARTERS` | 1329~1330 | 2줄 | 레거시 (미사용) |
| `GI` | 1904 | 단줄 | 게임 아이콘 CDN URL |
| `IMG` | 1905 | 단줄 | 로컬 이미지 경로 |
| `CARD_IMG` | 1906~1955 | 50줄 | 카드 이미지 맵핑 |

#### 핵심 로직 객체

| 이름 | 라인 | 크기 | 역할 |
|------|------|------|------|
| `SFX` | 1333~1738 | **406줄** | Web Audio API 사운드 시스템 |
| `UI` | 1740~1757 | 18줄 | 화면 전환/모달 라우터 |
| `Auth` | 1762~1903 | 142줄 | 로그인/회원가입/캐릭터 선택 |
| `Game` | 1958~4449 | **2492줄** | 핵심 게임 엔진 (전체 코드 57%) |
| `TurnBattle` | 4530~5207 | **678줄** | 턴 기반 전투 엔진 |
| `Formation` | 5208~5328 | 121줄 | 전투 편성 시스템 |
| `FX` | 5350~5427 | 78줄 | 타이틀 화면 파티클 |
| `DefeatFX` | 5430~5532 | 103줄 | 게임오버 파티클 |

#### 헬퍼 함수

| 함수 | 라인 | 역할 |
|------|------|------|
| `upgradeRarity()` | 1004 | 등급 업그레이드 |
| `fuseCard()` | 1005~1011 | 카드 합성 |
| `getTraits()` | 1036~1063 | 유닛 특성 계산 |
| `enemyName()` | 1320 | 랜덤 적 이름 |
| `uid()` | 1900 | 고유 ID 생성 |
| `getCardImg()` | 1955 | 카드 이미지 조회 |
| `wait()` | 4451 | Promise 지연 |
| `pickRar()` | 4453~4468 | 등급 확률 |
| `applySkillToUnit()` | 4470 | 스킬 적용 |
| `applyRelic()` | 4479 | 유물 효과 |
| `applyRelicBattle()` | 4484 | 전투 중 유물 |
| `mkCardEl()` | 4486~4507 | 카드 DOM 생성 |
| `mkRelicEl()` | 4508~4518 | 유물 DOM 생성 |
| `mkMini()` | 4519 | 미니 덱 표시 |

### 1.3 의존성 그래프

```
UI (중앙 라우터)
├─ Auth
│  └─ Game.load() → Game.showMenu()
├─ Game (핵심 엔진)
│  ├─ SFX (모든 함수가 호출)
│  ├─ TurnBattle
│  ├─ Formation
│  ├─ UI.show()
│  └─ DefeatFX
├─ TurnBattle
│  ├─ SFX.play()
│  ├─ Game.showDmg() / showHeal() / showAbilEff()
│  └─ Game.showBattleEnd()
├─ Formation
│  └─ SFX.play()
├─ FX & DefeatFX
│  └─ Canvas API (독립적)
└─ SFX (독립적, 모든 곳에서 호출)
```

#### 주요 호출 체인

**게임 시작**:
```
Auth.signup() → Auth.showCharSel() → Auth.confirmChar() → Game.load() → Game.showMenu()
```

**전투 흐름**:
```
Game.showMatchmaking() → Formation.show() → TurnBattle.start() → TurnBattle.startCombat() 
→ Game.showBattleEnd() → Game.showRoundChoice() → Game.afterBattle()
```

### 1.4 CSS 섹션 구조 (총 ~580줄)

| 섹션 | 라인 | 크기 |
|------|------|------|
| 기본/전역 | 9~12 | 4줄 |
| 타이틀 화면 | 14~25 | 12줄 |
| 버튼 | 27~35 | 9줄 |
| 인증 | 37~46 | 10줄 |
| 캐릭터 선택 | 48~59 | 12줄 |
| 메인 메뉴/마을 | 61~103 | 43줄 |
| 건물 업그레이드 | 115~120 | 6줄 |
| 카드 표시 | 121~167 | 47줄 |
| 덱 미니 | 168~181 | 14줄 |
| 선택 화면 | 182~198 | 17줄 |
| 장비 선택 | 199~205 | 7줄 |
| **전투 화면** | 206~322 | **117줄** |
| 보상 화면 | 357~362 | 6줄 |
| 게임 오버 | 363~430 | 68줄 (defeat-animation 브랜치에서 확장됨) |
| 모달 | 434~440 | 7줄 |
| 음향 토글 | 441~449 | 9줄 |
| 업그레이드 이펙트 | 450~460 | 11줄 |
| 카드 뒤집기 | 461~471 | 11줄 |
| 크리티컬 셰이크 | 472~477 | 6줄 |
| 영웅 사망 | 478~481 | 4줄 |
| 승리 배너 | 482~488 | 7줄 |
| 루트 박스 | 489~501 | 13줄 |
| NPC 말풍선 | 502~508 | 7줄 |
| 공격 줌 | 509~533 | 25줄 |
| 슬로우 모션 | 534~537 | 4줄 |
| 매칭 | 538~551 | 14줄 |
| 타이머 바 | 552~556 | 5줄 |
| 프롤로그 | 557~570 | 14줄 |
| 튜토리얼 오버레이 | 571~592 | 22줄 |
| 반응형 | 593~595 | 3줄 |

### 1.5 HTML 스크린 목록

| ID | 라인 | 역할 |
|----|------|------|
| `#title-screen` | 662~675 | 제목 화면 (초기 활성) |
| `#login-screen` | 676~686 | 로그인 |
| `#signup-screen` | 688~698 | 회원가입 |
| `#prologue-screen` | 701~709 | 프롤로그 |
| `#char-select-screen` | 710~720 | 캐릭터 선택 |
| `#menu-screen` | 722~742 | 메인 메뉴/마을 |
| `#tavern-screen` | 744~762 | 술집/영입 |
| `#upgrade-screen` | 764~773 | 카드 단련 |
| `#deckview-screen` | 776~806 | 덱 보기/도감 |
| `#castle-screen` | 808~825 | 성 |
| `#church-screen` | 828~840 | 교회 |
| `#match-screen` | 842~845 | 매칭 |
| `#cardselect-screen` | 855~871 | 카드/유물 선택 |
| `#battle-screen` | 873~953 | 전투 |
| `#pick-screen` | 943~951 | 라운드 보상 |
| `#gameover-screen` | 965~990 | 게임 오버 |

### 1.6 외부 의존성

- **CDN**: GSAP (`cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`)
- **Google Fonts**: Cinzel, Noto Serif KR
- **Web API**: AudioContext, Canvas 2D, localStorage, requestAnimationFrame, Promise
- **로컬 에셋**: `img/` (164개 PNG), `snd/` (8개 MP3)

### 1.7 리팩토링 위험 요소 (중요!)

#### 1. 인라인 onclick 핸들러 40+개 (가장 큰 위험)

모든 onclick이 전역 객체를 직접 참조함. 즉 파일 분리 후에도 **Game, Auth, UI, SFX, TurnBattle, Formation**은 전역에 노출돼야 함.

**영향받는 핸들러 예시**:
```javascript
onclick="Game.logout()"
onclick="Auth.login()"
onclick="UI.show('login-screen')"
onclick="TurnBattle.startCombat()"
onclick="Formation.auto()"
onclick="SFX.toggle()"
```

#### 2. localStorage 버전 체크 (1761줄)

```javascript
if(localStorage.getItem('rof8_v')!=='9'){localStorage.removeItem('rof8');localStorage.setItem('rof8_v','9');}
```

이 초기화 코드는 Auth 로드 시점에 실행됨. 분리 시 타이밍 주의.

#### 3. 호이스팅 의존성

- 함수 선언(`function`)은 호이스팅 가능
- 상수(`const`)는 호이스팅 불가 → 순서 필수
- `getTraits()`는 `TRAITS` 의존, `UNITS`는 `getTraits()` 의존

#### 4. IIFE 초기화 코드 (5334줄)

```javascript
(function(){
  const u = localStorage.getItem('rof8_last_user'), p = localStorage.getItem('rof8_last_pw');
  if(u) document.getElementById('login-id').value = u;
  // ...
})();
```

자동 로그인 복원. 분리 후에도 실행돼야 함.

#### 5. UI.show 훅킹 (5535~5541줄)

```javascript
const _origShow = UI.show;
UI.show = function(id){
  _origShow.call(this, id);
  if(id === 'title-screen') FX.initTitle();
  // ...
};
```

FX와 DefeatFX가 UI.show를 몽키패칭함. 분리 시 로드 순서 중요.

#### 6. 동적 CSS 클래스 조작

JavaScript가 `classList.add/remove`로 CSS와 강결합. 클래스명 변경 시 양쪽 수정 필요.

---

## Part 2: 빌드 없는 JS 분리 베스트 프랙티스 (2025년)

### 2.1 3가지 패턴 비교

| 항목 | Namespace | IIFE | ES Modules |
|------|-----------|------|------------|
| 마이그레이션 비용 | **낮음** | 중간 | 높음 |
| 기존 `Game.doX()` 유지 | ✅ (RoF.Game) | ✅ | ❌ (수동 주입 필요) |
| 로컬 `file://` 열기 | ✅ | ✅ | ❌ (서버 필수) |
| GitHub Pages 호환 | ✅ | ✅ | ✅ |
| 의존성 관리 | 수동 | 수동 | **자동 (import)** |
| 진짜 private 변수 | ❌ | ✅ | ✅ |
| 콘솔 디버깅 | **쉬움** | 쉬움 | 불편 |
| 전역 오염 | 1개 (RoF) | 1개 | **0개** |
| 점진적 리팩토링 | **가능** | 가능 | 어려움 |

### 2.2 최종 권장: Namespace 패턴 + `defer`

**이유**:
1. **점진적 마이그레이션 가능** — ES Modules는 한 번에 다 뜯어야 함
2. **기존 코드 수정 최소화** — `window.Game = RoF.Game` 트릭으로 양쪽 호환
3. **로컬 `file://` 테스트 가능** — 비개발자가 더블클릭으로 확인
4. **GitHub Pages 100% 호환**
5. **콘솔 디버깅 편함**

### 2.3 로딩 순서 관리 — defer 속성

**결론**: 모든 `<script>`에 **`defer`** 사용.

| 속성 | 다운로드 | 실행 | 순서 보장 |
|------|---------|------|----------|
| (없음) | 동기 | 즉시 | 태그 순서 |
| `async` | 병렬 | 완료 즉시 | ❌ |
| `defer` | 병렬 | HTML 파싱 후 | ✅ (태그 순서) |

**왜 defer?**
- async는 다운로드 완료 순서로 실행돼서 큰 파일이 늦게 실행되면 의존성 깨짐
- defer는 병렬 다운로드 + 순서 보장

### 2.4 파일명 숫자 접두사 전략

파일명 앞에 숫자 접두사(`00_`, `10_`, `20_`) 붙이면:
- 폴더에서 알파벳 정렬 시 로드 순서와 일치
- 새 파일 삽입 위치 명확
- 10씩 띄워두면 중간 삽입 쉬움 (`15_animations.js`)

### 2.5 GitHub Pages 필수 주의사항

#### 🚨 대소문자 민감성 (Windows 개발자의 1번 사고)

**Windows/macOS는 대소문자 구분 안 함. Linux(GitHub Pages)는 구분함.**

로컬에서 되는데 배포 후 404 나는 가장 흔한 원인.

**예방 규칙**:
1. **모든 파일명 소문자 + 언더스코어**: `turn_battle.js`, `card_data.js`
2. `.PNG` vs `.png` 주의
3. 커밋 전 경로 검증:
   ```bash
   grep -oE 'src="[^"]+"' index.html
   ```
4. `git config core.ignorecase false` 설정

#### 상대 경로만 사용

```html
<!-- 좋음 -->
<script src="js/game.js"></script>

<!-- 나쁨 (repo 이름 경로 문제) -->
<script src="/js/game.js"></script>
```

#### `.nojekyll` 파일 (보험용)

`_` 시작 폴더 사용할 계획이면 루트에 빈 `.nojekyll` 파일 두기.

### 2.6 전역 변수 호환성 트릭

기존 코드 최소 수정으로 양쪽 네임스페이스 다 작동시키는 방법:

```javascript
// 50_game.js
(function() {
  'use strict';

  // private 헬퍼
  function _calcDamage(atk, def) { ... }

  RoF.Game = {
    state: { hp: 100 },
    init() { ... }
  };

  // 호환성 — 기존 Game.xxx() 호출도 작동
  window.Game = RoF.Game;
})();
```

이 트릭으로 기존 `Game.doX()` 호출 코드를 한 번에 안 바꾸고 점진적 이동 가능.

### 2.7 실제 사례

**Cookie Clicker**: 5500줄+ 게임을 빌드 없이 여러 파일로 운영 중. 순수 `<script src>` + 네임스페이스 패턴. 수백만 유저 서빙.

**기타 vanilla JS 카드 게임**:
- `mmenavas/memory-game`
- `jonathanmarvens/html5-deck-of-cards`
- `yyjhao/html5-hearts`

공통점: **단순한 폴더 구조** (`index.html` + `js/` + `css/` + `img/`), 기능별 파일 분리.

### 2.8 CSS 분리 규칙

- `<link rel="stylesheet">` 여러 개 사용
- `@import` 절대 사용 금지 (병렬 다운로드 안 됨, 느림)
- cascade 순서대로 번호 매기기:
  1. Reset → 2. Tokens(변수) → 3. Layout → 4. Components → 5. Screens → 6. Animations → 7. Utilities
- `!important` 남용 금지
- 한 selector는 한 파일에서만 정의

### 2.9 디버깅 편의

분리의 이점:
- DevTools Sources 탭에서 파일별 navigate 쉬움
- Ctrl+P로 파일 검색
- 에러 스택이 `50_game.js:142` 로 정확히 찍힘 (소스맵 불필요)
- 콘솔에서 `RoF.Game.state` 바로 확인 가능

### 2.10 자동 에러 태깅 (추천)

```javascript
// 00_namespace.js 상단
window.addEventListener('error', (e) => {
  console.error(`[${e.filename?.split('/').pop()}:${e.lineno}] ${e.message}`);
});
```

---

## Part 3: Realm of Fates에 권장하는 최종 구조

### 3.1 권장 폴더 구조

```
realm-of-fates/
├── index.html              (~200줄 HTML 골격만)
├── .nojekyll               (빈 파일, 보험용)
├── css/
│   ├── 00_reset.css
│   ├── 10_tokens.css       (CSS 변수)
│   ├── 20_layout.css
│   ├── 30_components.css   (카드, 버튼, 모달)
│   ├── 40_battle.css
│   ├── 41_formation.css
│   ├── 42_screens.css      (town, tavern, castle 등)
│   ├── 80_animations.css   (@keyframes)
│   └── 90_utilities.css
├── js/
│   ├── 00_namespace.js     (window.RoF = {})
│   ├── 10_constants.js     (R_LABEL, ELEMENTS 등)
│   ├── 11_data_units.js    (UNITS)
│   ├── 12_data_skills.js   (SKILLS_DB)
│   ├── 13_data_relics.js   (RELICS_DB)
│   ├── 14_data_images.js   (CARD_IMG)
│   ├── 15_data_traits.js   (TRAITS, getTraits)
│   ├── 20_helpers.js       (uid, wait, pickRar)
│   ├── 30_sfx.js           (RoF.SFX, 406줄)
│   ├── 31_ui.js            (RoF.UI)
│   ├── 32_auth.js          (RoF.Auth)
│   ├── 40_cards.js         (mkCardEl, mkRelicEl, mkMini, fuseCard)
│   ├── 50_game.js          (RoF.Game, 2492줄 → 여기서 추가 분할 필요)
│   ├── 60_turnbattle.js    (RoF.TurnBattle, 678줄)
│   ├── 70_formation.js     (RoF.Formation)
│   ├── 80_fx.js            (RoF.FX, RoF.DefeatFX)
│   └── 99_bootstrap.js     (DOMContentLoaded 훅, 초기화)
├── img/                    (소문자 파일명 필수)
└── snd/
```

### 3.2 Game 객체 추가 분할 필요

**문제**: `Game` 객체만 2492줄. 한 파일로 두면 여전히 협업 어려움.

**해결**: `Game` 을 기능별로 더 쪼갬:
- `50_game_core.js` — Game 객체 기본 (load, persist, logout, state 관리)
- `51_game_town.js` — 마을/건물 (showMenu, upgradeBuilding)
- `52_game_tavern.js` — 술집 (showTavern, hireTavern)
- `53_game_deck.js` — 덱 보기 (showDeckView, showCardDetail)
- `54_game_castle.js` — 성, 교회, 대장간
- `55_game_battle.js` — 전투 흐름 (showMatchmaking, showBattleEnd, showRoundChoice)
- `56_game_effects.js` — showAtkEffect, showDmg, showHeal, showGameOver

각 파일에서 `Object.assign(RoF.Game, { ... })` 로 같은 객체에 메서드 추가.

### 3.3 마이그레이션 단계 (안전하게)

**Phase 0**: 현재 `index.html` → `index_backup.html` 백업

**Phase 1**: CSS만 먼저 분리 (위험도 최저)
- `<style>` 블록 → `css/*.css` 파일들
- 시각적으로 동일한지 로컬 확인
- 커밋

**Phase 2**: 데이터 파일 분리
- `10_constants.js` ~ `15_data_traits.js`
- grep으로 기존 `UNITS` 참조 → `RoF.Data.UNITS`로 교체
- 커밋

**Phase 3**: SFX, UI, Auth 분리 (독립성 높음)
- `30_sfx.js`, `31_ui.js`, `32_auth.js`
- 커밋

**Phase 4**: Game, TurnBattle, Formation 분리 (최고 위험)
- Game을 7개 파일로 세분화
- TurnBattle, Formation 각각 별도
- 커밋

**Phase 5**: FX, 초기화 정리
- `80_fx.js`, `99_bootstrap.js`
- 회귀 테스트 전체 실행

**각 Phase마다**:
1. 로컬 서버로 테스트 (`python -m http.server 8000`)
2. 전체 게임 플레이 (로그인 → 전투 → 게임오버)
3. GitHub Pages 프리뷰 배포
4. 대소문자 이슈 없는지 확인
5. 커밋

### 3.4 협업 룰 (팀 규칙)

1. 한 파일은 **500줄 이하**, 넘으면 쪼갠다
2. 파일명 **소문자 + 언더스코어** (대문자 금지)
3. 새 전역 선언 금지, 모두 `RoF.xxx` 아래
4. 파일 상단에 의존성 주석:
   ```js
   // 50_game.js
   // deps: RoF.Data, RoF.UI, RoF.SFX
   ```
5. **순환 의존 금지** — 숫자 접두사가 낮은 쪽은 높은 쪽을 모른다
6. 커밋 전 로컬 서버로 확인:
   ```bash
   cd realm-of-fates && python -m http.server 8000
   ```

### 3.5 index.html 골격 예시

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Realm of Fates</title>

  <!-- CSS: 순서 중요 -->
  <link rel="stylesheet" href="css/00_reset.css">
  <link rel="stylesheet" href="css/10_tokens.css">
  <link rel="stylesheet" href="css/20_layout.css">
  <link rel="stylesheet" href="css/30_components.css">
  <link rel="stylesheet" href="css/40_battle.css">
  <link rel="stylesheet" href="css/41_formation.css">
  <link rel="stylesheet" href="css/42_screens.css">
  <link rel="stylesheet" href="css/80_animations.css">
  <link rel="stylesheet" href="css/90_utilities.css">

  <!-- 외부 라이브러리 -->
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>

  <!-- 게임 스크립트 (defer로 순서 보장, 병렬 다운로드) -->
  <script defer src="js/00_namespace.js"></script>
  <script defer src="js/10_constants.js"></script>
  <script defer src="js/11_data_units.js"></script>
  <script defer src="js/12_data_skills.js"></script>
  <script defer src="js/13_data_relics.js"></script>
  <script defer src="js/14_data_images.js"></script>
  <script defer src="js/15_data_traits.js"></script>
  <script defer src="js/20_helpers.js"></script>
  <script defer src="js/30_sfx.js"></script>
  <script defer src="js/31_ui.js"></script>
  <script defer src="js/32_auth.js"></script>
  <script defer src="js/40_cards.js"></script>
  <script defer src="js/50_game_core.js"></script>
  <script defer src="js/51_game_town.js"></script>
  <script defer src="js/52_game_tavern.js"></script>
  <script defer src="js/53_game_deck.js"></script>
  <script defer src="js/54_game_castle.js"></script>
  <script defer src="js/55_game_battle.js"></script>
  <script defer src="js/56_game_effects.js"></script>
  <script defer src="js/60_turnbattle.js"></script>
  <script defer src="js/70_formation.js"></script>
  <script defer src="js/80_fx.js"></script>
  <script defer src="js/99_bootstrap.js"></script>
</head>
<body>
  <!-- HTML 구조만 -->
</body>
</html>
```

---

## Part 4: 테스팅 관련

**현재 상태**: 프로젝트에 테스트 파일 **전혀 없음** (unit test, e2e test 등 아무것도 없음).

**리팩토링 시 필요한 회귀 테스트 전략**:
- 자동화된 테스트 프레임워크 도입은 범위 초과 (빌드 도구 금지 원칙 위배)
- 대신 **수동 회귀 테스트 체크리스트** (REFACTOR_SPEC.md에 이미 있음)
- 각 Phase 후 체크리스트 전체 실행
- 게임 플레이 영상 녹화 (before/after 비교용) 권장

**향후 제안**: Phase 별도 작업으로 **Playwright 기반 E2E 스모크 테스트** 도입 고려 가능 (빌드 없이 Node.js만 설치해서 실행 가능). 본 리팩토링 범위 외.

---

## 결론

두 리서치 결과가 **완벽히 일치**: Namespace 패턴 + defer 스크립트 + 파일명 숫자 접두사 + 점진적 마이그레이션.

이 리서치를 기반으로 다음 단계에서 사용자 인터뷰를 통해 세부 사항(특히 Game 객체 분할 방식, 기존 전역 이름 유지 여부, Phase 우선순위)을 확정한다.
