# Realm of Fates 구조 리팩토링 — 상세 구현 계획

> 작성일: 2026-04-11
> 기반 문서: claude-spec.md, claude-research.md, claude-interview.md, REFACTOR_SPEC.md

## 개요

이 계획은 `index.html` 단일 파일 5546줄을 34개 파일 구조로 분리하는 작업이다. 게임 기능은 변경하지 않고, 순수하게 코드 구조만 정리한다. 이 계획을 처음 읽는 사람도 이해할 수 있도록 모든 맥락과 결정 근거를 포함한다.

## 배경

### 왜 이 작업이 필요한가

Realm of Fates는 카드 오토배틀러 웹게임으로, 현재 `index.html` 하나에 HTML, CSS, JavaScript 전부가 몰려있다. 코드가 5546줄까지 자랐고, 두 명이 협업하면서 동일 파일 동시 수정으로 인한 머지 충돌 위험이 상시 존재한다. 또한 에디터 성능 저하, 코드 탐색 어려움, 새 기능 추가 시 어디에 넣어야 할지 불명확함 등의 문제가 있다.

### 왜 지금인가

향후 로드맵에 PixiJS 도입, 이펙트 고도화, Electron 래핑을 통한 스팀 배포가 계획되어 있다. 이런 확장 작업 전에 구조가 정리되어야 한다. 구조가 엉망인 상태에서 기능을 더 올리면 리팩토링 비용이 기하급수로 증가한다.

### 왜 빌드 도구를 쓰지 않는가

1. GitHub Pages 배포 단순성을 유지하기 위함 (`index.html`만 올리면 작동)
2. 팀원(동생)이 비개발자라서 `npm install`, 빌드 에러 디버깅 같은 장벽을 만들고 싶지 않음
3. 5546줄 규모는 아직 빌드 도구 없이 충분히 관리 가능 (Cookie Clicker 사례 참조)
4. 로컬 `file://`로 바로 열어서 테스트 가능해야 함

## 목표

### 최종 결과물

`index.html` (5546줄) → 34개 파일로 분리:
- HTML: 1개 (200줄)
- CSS: 9개 (각 200줄 이하)
- JavaScript: 24개 (각 500줄 이하)

게임의 모든 기능, 이펙트, 사운드는 **현재와 완벽히 동일**하게 작동해야 한다.

### 성공 기준

1. 브라우저 콘솔에 에러 0개
2. 13개 회귀 테스트 체크리스트 전부 통과
3. GitHub Pages 정상 배포 및 동작
4. 팀원(동생)의 클로드코드 검토 통과
5. 모든 `onclick` 인라인 핸들러 제거 완료

## 아키텍처 개요

### 3대 핵심 원칙

#### 1. 단일 글로벌 네임스페이스

모든 코드는 `window.RoF` 객체 아래에 배치된다. 기존의 `Game`, `Auth`, `SFX` 같은 전역 객체들도 전부 `RoF.Game`, `RoF.Auth`, `RoF.SFX` 형태로 정리된다. 이 접근은 다음 이점을 준다:

- 전역 오염을 단 하나의 객체로 최소화
- 콘솔에서 `RoF.Game.state` 같은 방식으로 전체 상태 실시간 확인 가능
- 파일 분리 후에도 객체 간 참조 방식이 기존과 크게 다르지 않음

호환성을 위해 일부 전역은 기존 이름으로도 유지된다. 예를 들어 `window.Game = RoF.Game`을 명시하면 기존 코드와 새 코드가 동시에 작동한다. 이 리팩토링에서는 Phase 6까지 호환성 레이어를 유지한다. 호환성 레이어 제거는 별도 Phase (범위 외) 로 분리한다.

#### 참조 스타일 규칙 (Opus 리뷰 반영)

파일 간 참조 혼재를 막기 위해 다음 규칙을 엄격히 지킨다:

- **분리된 새 파일(js/*.js) 에서는 항상 `RoF.Xxx` 풀 경로로 타 모듈을 호출한다.** 예: `RoF.SFX.play('click')`, `RoF.UI.show('menu-screen')`
- **원본 index.html 에 남아 있는 레거시 스크립트**(Phase 도중 존재)에서는 기존 짧은 이름(`SFX`, `Auth`, `Game`)을 그대로 둔다. 호환성 레이어가 이를 흡수한다.
- Phase 4 이후에는 레거시 스크립트가 사라지므로 짧은 이름 참조가 코드에서 모두 제거되어야 한다.
- **한 파일 안에 `SFX` 와 `RoF.SFX` 를 섞어 쓰지 않는다.** 이는 팀 컨벤션의 일관성을 위해 필수.
- **향후 `Game` 객체에 getter 속성을 추가하지 않는다.** `Object.assign` 은 getter를 값으로 복사하므로 의도치 않은 동작 가능성이 있다.

#### 2. defer 속성 기반 로딩 순서

모든 `<script>` 태그에 `defer` 속성을 붙인다. `defer`는 다음 두 가지를 보장한다:

- 다운로드는 병렬 (HTML 파싱 안 막음, 빠름)
- 실행은 HTML 태그 순서 (의존성 보장)

파일명 앞에 숫자 접두사(`00_`, `10_`, `20_`)를 붙여 의존성 순서를 명시적으로 표현한다. 낮은 숫자가 높은 숫자에 의존하면 안 된다는 규칙을 팀에 공유한다. 10씩 간격을 두어 중간 삽입 여지를 남긴다.

#### 3. data-action 이벤트 위임 패턴

HTML에서 `onclick="..."` 인라인 핸들러를 전부 제거하고, 대신 `data-action` 속성을 사용한다:

```html
<!-- 기존 -->
<button onclick="Game.logout()">로그아웃</button>

<!-- 신규 -->
<button data-action="game.logout">로그아웃</button>
```

JavaScript 쪽에는 이벤트 위임 로직이 단 하나만 존재한다:

```javascript
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const [module, method] = action.split('.');
  const moduleRef = RoF[module.charAt(0).toUpperCase() + module.slice(1)];
  moduleRef?.[method]?.(el);
});
```

이 패턴의 장점:
- HTML에서 JavaScript 함수 호출이 사라짐 (관심사 분리)
- 버튼 추가/삭제 시 바인딩 재작성 불필요
- 모든 이벤트 흐름이 한 곳에서 관리됨
- 유지보수 용이성 대폭 상승

## 디렉토리 구조

```
realm-of-fates/
├── index.html                   # HTML 골격만
├── .nojekyll                    # GitHub Pages 보험 (빈 파일)
├── css/
│   ├── 00_reset.css             # CSS 리셋
│   ├── 10_tokens.css            # CSS 변수 (색상/폰트/간격)
│   ├── 20_layout.css            # 페이지 레이아웃
│   ├── 30_components.css        # 카드, 버튼, 모달
│   ├── 40_battle.css            # 전투 UI
│   ├── 41_formation.css         # 편성 UI
│   ├── 42_screens.css           # town, tavern, castle, church 등
│   ├── 80_animations.css        # @keyframes 전체
│   └── 90_utilities.css         # 유틸리티 (.hidden 등)
├── js/
│   ├── 00_namespace.js          # RoF 객체 선언 + 전역 에러 핸들러
│   ├── 10_constants.js          # R_LABEL, ELEMENTS, ELEM_L 등 상수
│   ├── 11_data_units.js         # UNITS 배열
│   ├── 12_data_skills.js        # SKILLS_DB
│   ├── 13_data_relics.js        # RELICS_DB
│   ├── 14_data_images.js        # CARD_IMG 맵핑
│   ├── 15_data_traits.js        # TRAITS + getTraits()
│   ├── 20_helpers.js            # 순수 헬퍼 (uid, wait, pickRar 등)
│   ├── 30_sfx.js                # RoF.SFX
│   ├── 31_ui.js                 # RoF.UI (화면 전환, 모달)
│   ├── 32_auth.js               # RoF.Auth (로그인/회원가입)
│   ├── 40_cards.js              # DOM 빌더 (mkCardEl, mkRelicEl 등)
│   ├── 50_game_core.js          # RoF.Game 기본 + 상태 관리
│   ├── 51_game_town.js          # 마을/건물 메서드
│   ├── 52_game_tavern.js        # 술집/영입 메서드
│   ├── 53_game_deck.js          # 덱 보기/도감 메서드
│   ├── 54_game_castle.js        # 성/교회/대장간 메서드
│   ├── 55_game_battle.js        # 전투 흐름 메서드
│   ├── 56_game_effects.js       # 이펙트 메서드 (showDmg 등)
│   ├── 60_turnbattle.js         # RoF.TurnBattle
│   ├── 70_formation.js          # RoF.Formation
│   ├── 80_fx.js                 # RoF.FX + RoF.DefeatFX
│   ├── 99_bindings.js           # data-action 이벤트 위임
│   └── 99_bootstrap.js          # DOMContentLoaded 초기화
├── img/                          # 이미지 에셋 (변경 없음)
└── snd/                          # 사운드 에셋 (변경 없음)
```

## Phase 0: 사전 준비 (Opus 리뷰 반영)

### 목적
리팩토링 중 안전망과 기준선을 마련한다. 코드 변경 없음.

### 작업 내용

#### 0.1 브랜치 준비
```bash
# 현재 feature/defeat-animation 작업물은 로컬에만 보존
git checkout master
git pull

# 안전망 브랜치 박제
git checkout -b backup/pre-refactor
git push -u origin backup/pre-refactor

# 실제 작업 브랜치
git checkout master
git checkout -b refactor/structure-split
```

#### 0.2 디렉토리와 안전 파일 생성
```bash
mkdir -p css js docs
touch .nojekyll
```

#### 0.3 Game 객체 메서드 덤프 (중요)
브라우저에서 기존 게임을 열고 콘솔에 다음 입력:
```javascript
JSON.stringify(Object.keys(Game).sort(), null, 2)
```
출력을 `docs/game_manifest.md` 로 저장. 이것이 Phase 4 완료 후 비교 기준이 된다.

#### 0.4 참조 횟수 베이스라인
```bash
grep -c "UNITS" index.html
grep -c "SKILLS_DB" index.html
grep -c "SFX\." index.html
grep -c "Auth\." index.html
grep -c "Game\." index.html
```
결과를 `docs/reference_baseline.md` 로 저장. Phase 2 이후 이 수치와 비교해 누락 여부 확인.

#### 0.5 onclick 인라인 / 동적 handler 목록 덤프
```bash
grep -n 'onclick=' index.html > docs/onclick_inline.txt
grep -n '\.onclick\s*=' index.html > docs/onclick_dynamic.txt
```
Phase 6에서 이 목록을 체크리스트처럼 사용.

#### 0.6 this 바인딩 감사
```bash
grep -nE 'function\s*\([^)]*\)\s*\{[^}]*this\.' index.html > docs/this_audit.txt
```
function 안의 this 참조가 있으면 이동 후 깨질 가능성 있음. 사전 점검 필요.

#### 0.7 Git config 설정
```bash
git config core.ignorecase false
```
Windows 대소문자 실수 방지.

#### 0.8 첫 커밋
```bash
git add .nojekyll css/ js/ docs/
git commit -m "[Refactor Phase 0/6] 사전 준비: 안전망, 베이스라인, 감사 기록"
```

### 검증
- `backup/pre-refactor` 원격에 존재
- `docs/game_manifest.md` 에 Game 메서드 목록
- `.nojekyll` 파일 루트에 존재

### 리스크
**없음**. 코드 변경 없는 준비 단계.

---

## Phase 1: CSS 분리

### 목적
`<style>` 블록 580줄을 9개 CSS 파일로 분리한다.

### 작업 내용

1. `css/` 디렉토리 생성
2. `<style>` 블록 내용을 기능별로 분류하여 9개 파일에 배치
3. `index.html`에서 `<style>` 블록 제거하고 `<link rel="stylesheet">` 9개로 교체

### CSS 파일별 담당 범위

- **00_reset.css**: 기존 9~12줄 범위의 리셋 코드 (`*{margin:0;padding:0}` 등)
- **10_tokens.css**: CSS 변수 정의 (색상, 폰트 등). 현재 코드에는 CSS 변수가 없으므로 새로 만듦. 주요 색상과 폰트를 `:root`에 정의
- **20_layout.css**: `.screen`, `.screen.active` 같은 기본 레이아웃
- **30_components.css**: `.btn`, `.btn-*`, `.auth-box`, `.modal-*`, `.card`, `.card.*`, `.deck-mini` 등 재사용 컴포넌트
- **40_battle.css**: 기존 206~322줄 전투 관련 전체
- **41_formation.css**: 편성 화면 관련 스타일 (기존 CSS 검색 필요)
- **42_screens.css**: `#title-screen`, `#login-screen`, `#menu-screen`, `#tavern-screen`, `#castle-screen`, `#church-screen`, `#deckview-screen` 등 화면별 스타일
- **80_animations.css**: 모든 `@keyframes` 정의를 한 곳에 모음 (titleLightning, titleFire, titleGlow, twinkle, walkRight, walkLeft, walkUp, buildPulse, divineGlow, targetPulse, cardZoomIn, skillPulse, hitFlashAnim, critHitAnim, slashAnim, magicAnim, healAnim, hitShake, dmgFloat, upgFlash, upgPart, rarBurst, upgGlow, cardFlip, legendReveal, goldReveal, screenShake, 그리고 defeat-animation 브랜치에서 추가된 것들)
- **90_utilities.css**: `.hidden` 같은 유틸리티 (필요 시 추가)

### index.html 변경 예시

```html
<head>
  <!-- 기존 <style>...</style> 삭제 -->
  <link rel="stylesheet" href="css/00_reset.css">
  <link rel="stylesheet" href="css/10_tokens.css">
  <link rel="stylesheet" href="css/20_layout.css">
  <link rel="stylesheet" href="css/30_components.css">
  <link rel="stylesheet" href="css/40_battle.css">
  <link rel="stylesheet" href="css/41_formation.css">
  <link rel="stylesheet" href="css/42_screens.css">
  <link rel="stylesheet" href="css/80_animations.css">
  <link rel="stylesheet" href="css/90_utilities.css">
</head>
```

### 주의사항

- CSS cascade 순서가 중요하다. 링크 순서대로 우선순위가 결정된다.
- `@import` 사용 금지 (병렬 다운로드 안 됨)
- `!important` 신규 추가 금지
- 한 selector는 한 파일에서만 정의하는 원칙 유지

### 중복 selector 사전 감사 (Opus 리뷰 반영)

분리 후 CSS cascade 순서 깨짐을 방지하기 위해, Phase 1 작업 중 다음을 수행:

```bash
# 동일 selector가 여러 파일에 분산되었는지 감지
grep -oP '^\.[a-zA-Z_-]+' css/*.css | sort | uniq -d
```

중복이 감지되면:
1. 해당 selector가 원본에서도 중복이었는지 확인
2. 원본에서 뒤쪽이 우선이었다면 파일 순서(80_animations.css 가 30_components.css 보다 뒤)로 재현되는지 확인
3. 불명확하면 한 파일로 통합

### 검증

전체 13개 회귀 테스트 체크리스트 수행. 특히 시각적 요소(카드 색상, 버튼 호버, 애니메이션)가 기존과 100% 동일한지 주의 깊게 확인.

### 리스크
**최저**. CSS는 기능이 없으므로 분리 실패 시에도 게임 로직은 작동한다.

## Phase 2: 데이터 파일 분리

### 목적
JavaScript 상수와 데이터를 `js/10_*` ~ `js/15_*` 파일로 분리한다. 모든 전역 상수를 `RoF.Data` 네임스페이스 아래로 이동.

### 작업 내용

#### 2.1 `00_namespace.js` 생성

```javascript
'use strict';

window.RoF = window.RoF || {
  version: '1.0.0',
  Data: {},
  debug: {},
};

// 전역 에러 태깅 (디버깅 편의)
window.addEventListener('error', (e) => {
  const file = (e.filename || '').split('/').pop();
  console.error(`[RoF][${file}:${e.lineno}]`, e.message);
});
```

이 파일이 **가장 먼저 로드**되어야 한다. `RoF` 객체가 이미 있을 수 있으니 `RoF = RoF || {...}` 로 방어적 초기화.

#### 2.2 `10_constants.js` 생성

다음 상수들을 `RoF.Data` 아래로 이동:
- `R_LABEL`, `R_ORDER`
- `ROLE_L`, `ATTACK_EFFECTS`
- `ELEMENTS`, `ELEM_L`, `ELEM_ICON`, `ELEM_COLOR`
- `ENEMY_NAMES`, `HERO_ROLES`

```javascript
RoF.Data.R_LABEL = Object.freeze({ bronze: '브론즈', ... });
RoF.Data.R_ORDER = Object.freeze(['bronze', 'silver', ...]);
// ... 기타 상수
```

`Object.freeze()`로 동결하여 런타임 수정 방지.

#### 2.3 `11_data_units.js` 생성

`UNITS` 배열 (190줄)을 이 파일에 이동:
```javascript
RoF.Data.UNITS = Object.freeze([
  { id: '...', name: '...', ... },
  // ... 전체 유닛
]);
```

#### 2.4 `12_data_skills.js` 생성

`SKILLS_DB`를 이 파일에:
```javascript
RoF.Data.SKILLS = Object.freeze([...]);
```

#### 2.5 `13_data_relics.js` 생성

`RELICS_DB`를 이 파일에:
```javascript
RoF.Data.RELICS = Object.freeze([...]);
```

#### 2.6 `14_data_images.js` 생성

`GI`, `IMG`, `CARD_IMG` 상수와 `getCardImg()` 함수를 이 파일에:
```javascript
RoF.Data.GI = '...';
RoF.Data.IMG = '...';
RoF.Data.CARD_IMG = Object.freeze({...});

RoF.getCardImg = function(card) {
  // 기존 로직
};
```

`getCardImg`는 순수 함수이므로 `RoF` 직접 아래에 둠.

#### 2.7 `15_data_traits.js` 생성

`TRAITS` 객체와 `getTraits()` 함수:
```javascript
RoF.Data.TRAITS = Object.freeze({...});

RoF.getTraits = function(unit) {
  // 기존 로직 (RoF.Data.TRAITS 참조)
};
```

#### 2.8 기존 `index.html`에서 해당 코드 제거

`<script>` 블록에서 위에 나열한 상수들을 전부 삭제.

#### 2.9 참조 전부 교체

기존 코드에서 `UNITS` → `RoF.Data.UNITS`, `SKILLS_DB` → `RoF.Data.SKILLS`, `getTraits(x)` → `RoF.getTraits(x)` 등으로 전체 치환. 이 단계는 매우 중요하며, 하나라도 누락되면 `undefined` 에러가 발생한다.

#### 2.10 호환성 처리

당장은 리팩토링 중이므로 기존 전역 이름도 함께 유지:
```javascript
// 15_data_traits.js 끝에 추가
window.UNITS = RoF.Data.UNITS;
window.SKILLS_DB = RoF.Data.SKILLS;
window.RELICS_DB = RoF.Data.RELICS;
// ...
```

이렇게 하면 혹시 grep으로 놓친 참조가 있어도 작동한다. Phase 6에서 정리.

#### 2.11 index.html에 script 태그 추가

```html
<head>
  <!-- CSS 링크들... -->

  <script defer src="js/00_namespace.js"></script>
  <script defer src="js/10_constants.js"></script>
  <script defer src="js/11_data_units.js"></script>
  <script defer src="js/12_data_skills.js"></script>
  <script defer src="js/13_data_relics.js"></script>
  <script defer src="js/14_data_images.js"></script>
  <script defer src="js/15_data_traits.js"></script>
</head>
```

### 주의사항

- **참조 누락 주의**: `UNITS`가 코드 전체에서 얼마나 많이 참조되는지 grep으로 먼저 파악. 수십 곳 될 수 있음.
- **Object.freeze 영향**: 기존 코드가 데이터를 수정하는 경우가 있는지 확인. 있다면 freeze 대상에서 제외하거나 코드 수정.
- **호이스팅 이슈**: `const` 선언은 호이스팅 안 되므로 로드 순서 엄격히 지켜야 함.

### 검증

- 게임이 시작되는지 (데이터가 없으면 아예 로드 안 됨)
- 모든 13개 회귀 테스트 체크리스트 수행
- 콘솔에 `undefined` 에러 없는지 확인

### 리스크
**중간**. 참조 누락이 가장 흔한 실수. grep 후 수동으로 교체하는 과정에서 실수 가능.

## Phase 3: SFX, UI, Auth 분리

### 목적
독립성이 높은 3개 시스템을 각각의 파일로 분리한다.

### 작업 내용

#### 3.1 `20_helpers.js` 생성

순수 헬퍼 함수들을 모음:
- `uid()`: 고유 ID 생성
- `wait(ms)`: Promise 기반 delay
- `pickRar(bonus, mode)`: 등급 확률 계산
- `upgradeRarity()`: 등급 업그레이드
- `fuseCard()`: 카드 합성
- `enemyName()`: 랜덤 적 이름
- `applySkillToUnit()`: 스킬 적용
- `applyRelic()`, `applyRelicBattle()`: 유물 효과

모두 `RoF.helpers` 네임스페이스로 이동:
```javascript
RoF.helpers = {
  uid() { ... },
  wait(ms) { ... },
  pickRar(bonus, mode) { ... },
  // ...
};

// 호환성
window.uid = RoF.helpers.uid;
window.wait = RoF.helpers.wait;
// ...
```

#### 3.2 `30_sfx.js` 생성

기존 `SFX` 객체 (1333~1738줄, 406줄) 전체를 이 파일로 이동:
```javascript
RoF.SFX = {
  ctx: null,
  on: false,
  vol: 0.5,
  // ... 기존 속성 전부

  init() { ... },
  toggle() { ... },
  setVolume(v) { ... },
  play(type) { ... },
  bgm(type) { ... },
  // ... 기존 메서드 전부
};

// 호환성
window.SFX = RoF.SFX;
```

#### 3.3 `31_ui.js` 생성

기존 `UI` 객체 (1740~1757줄, 18줄) 이동:
```javascript
RoF.UI = {
  show(id) { ... },
  modal(title, msg, callback) { ... },
  closeModal() { ... },
};

window.UI = RoF.UI;
```

#### 3.4 `32_auth.js` 생성

기존 `Auth` 객체 (1762~1903줄, 142줄) 이동:
```javascript
RoF.Auth = {
  user: null,
  pendingPw: null,

  db() { ... },
  save(db) { ... },
  signup() { ... },
  login() { ... },
  showCharSel(uid) { ... },
  confirmChar() { ... },
  showPrologue(uid) { ... },
  // ...
};

window.Auth = RoF.Auth;
```

주의: `Auth` 파일 상단에 있는 localStorage 버전 체크 코드도 함께 이동:
```javascript
// 32_auth.js 상단
if (localStorage.getItem('rof8_v') !== '9') {
  localStorage.removeItem('rof8');
  localStorage.setItem('rof8_v', '9');
}
```

#### 3.2-1 SFX 사용자 제스처 훅 이동 (Opus 리뷰 반영)

원본 1732줄 근처의 `document.addEventListener(evt, function _initBgm(){...})` 코드는 **첫 사용자 제스처에 `SFX.init()` + BGM 시작** 을 담당한다. 이 코드를 `30_sfx.js` 끝부분에 IIFE 형태로 이동:

```javascript
// 30_sfx.js 끝부분
(function bindGesture() {
  const events = ['click', 'touchstart', 'keydown'];
  const init = () => {
    RoF.SFX.init();
    events.forEach(e => document.removeEventListener(e, init, true));
  };
  events.forEach(e => document.addEventListener(e, init, true));
})();
```

**중요**: `RoF.SFX` 로 명시적 참조. 짧은 이름 `SFX` 쓰지 말 것. 이 IIFE 는 `30_sfx.js` 로드 시점에 즉시 실행되어 이벤트 리스너만 등록하고, 실제 `init()` 은 사용자의 첫 클릭/키 입력 시에 발생.

#### 3.5 `40_cards.js` 생성

DOM 빌더 헬퍼들을 이 파일에:
- `mkCardEl(card)`: 카드 DOM 요소 생성
- `mkRelicEl(relic)`: 유물 DOM 요소 생성
- `mkMini(card)`: 미니 덱 표시 생성

```javascript
RoF.dom = {
  mkCardEl(card) { ... },
  mkRelicEl(relic) { ... },
  mkMini(card) { ... },
};

// 호환성
window.mkCardEl = RoF.dom.mkCardEl;
window.mkRelicEl = RoF.dom.mkRelicEl;
window.mkMini = RoF.dom.mkMini;
```

이 파일이 Game보다 먼저 로드되어야 한다 (Game 내부에서 호출됨).

#### 3.6 index.html에 script 태그 추가

```html
<script defer src="js/20_helpers.js"></script>
<script defer src="js/30_sfx.js"></script>
<script defer src="js/31_ui.js"></script>
<script defer src="js/32_auth.js"></script>
<script defer src="js/40_cards.js"></script>
```

### 주의사항

- `Auth` 가 `Game` 을 참조하는 경우가 있는지 확인 필요 (`Auth.confirmChar()` → `Game.load()` 호출 등)
- 이 경우 Game 이 아직 분리 안 됐으니 `window.Game` 참조가 여전히 원래 코드에 있음. Phase 4 전까진 이 참조가 작동함.
- SFX 내부의 BGM 타이머, AudioContext 관련 초기화 코드가 이동 후에도 정상 작동하는지 확인

### 검증

- 로그인 작동 (Auth)
- 화면 전환 작동 (UI)
- 사운드 재생 (SFX)
- 전체 13개 회귀 테스트

### 리스크
**중간**. SFX의 Web Audio API 초기화 타이밍이 민감. 사용자 제스처(클릭) 없이 AudioContext 생성 시도 시 브라우저가 차단하는 경우 있음.

## Phase 4: Game 객체 7개 파일 분할

### 목적
2492줄짜리 `Game` 객체를 기능별로 7개 파일로 쪼갠다. 이것이 리팩토링의 핵심 단계다.

### 접근 방식

`Object.assign()` 패턴을 사용한다. 첫 번째 파일(`50_game_core.js`)에서 `RoF.Game = {...}` 로 선언하고, 나머지 파일들은 `Object.assign(RoF.Game, {...})` 로 메서드를 추가한다.

이 방식의 이유:
- 단일 객체로 유지되므로 기존 `Game.xxx()` 호출 방식 그대로 유지
- 파일 간 순서만 맞추면 됨 (의존성 관리 단순)
- 디버거에서 `Game` 객체의 모든 메서드를 한 번에 볼 수 있음

### 사전 감사 (Opus 리뷰 반영)

Phase 4 작업 시작 전 반드시 수행:

#### 4.0.1 Game 메서드 목록 덤프 재확인
Phase 0 에서 만든 `docs/game_manifest.md` 와 현재 index.html 의 Game 객체 메서드를 비교:
```javascript
// 브라우저 콘솔에서
console.log(Object.keys(Game).sort().join('\n'))
```
Phase 0 덤프와 다르면 차이를 기록. 이후 Phase 4 완료 후 **`Object.keys(RoF.Game).sort()` 와 1:1 비교** 하여 누락 없음을 검증.

#### 4.0.2 this 바인딩 감사
원본에서 `function` 키워드 안에서 `this.xxx` 를 쓰는 코드를 모두 찾음:
```bash
grep -nE 'function\s*\([^)]*\)\s*\{[^}]*this\.' index.html
```
이런 코드는 이동 후 `this` 가 다른 값으로 바인딩될 수 있으므로 **화살표 함수로 변환하거나, `.bind(this)` 로 명시적 바인딩** 필요.

#### 4.0.3 전역 이름 자기 참조 감사
Game 내부 메서드가 `this.foo()` 가 아니라 `Game.foo()` 형태로 자기 자신을 참조하는 경우:
```bash
grep -nE '(Game|Auth|SFX|UI|TurnBattle|Formation)\.' index.html | head -50
```
Phase 4 작업 시 이런 참조는 모두 `RoF.Game.foo()` 풀 경로로 교체.

### 런타임 중복 키 감지 (Opus 리뷰 반영)

같은 메서드를 두 파일에 실수로 넣는 사고를 잡기 위해, 각 `5x_game_*.js` 파일 상단에 다음 감지 블록 추가:

```javascript
// 각 5x_game_*.js 최상단
RoF.__gameKeys = RoF.__gameKeys || new Set();
(function(keys) {
  for (const k of keys) {
    if (RoF.__gameKeys.has(k)) {
      console.error('[Game] 중복 키 감지:', k, '(이 파일에서 중복 정의)');
    }
    RoF.__gameKeys.add(k);
  }
})(['showTavern', 'hireTavern', 'refreshTavern']);  // 이 파일에서 정의하는 키 목록
```

이렇게 하면 Phase 4 작업 중 실수가 즉시 콘솔에 뜸.

### 작업 내용

#### 4.1 `50_game_core.js` 생성

Game 객체의 기본 속성과 core 메서드들:
- 기본 속성: `round`, `hp`, `maxHp`, `gold`, `xp`, `level`, `honor`, `deck`, `relics`, `maxDeck`, `battleSpeed`, `battleRunning`, `skipReq`, `_slowMo`, `battleMultiplier`
- `load()`, `persist()`, `logout()`: 데이터 로드/저장/로그아웃
- `cardXpNext()`, `giveCardXp()`, `giveCardHonor()`: 카드 경험치/명예
- `checkTutorial()`: 튜토리얼 체크
- 기타 state management

```javascript
RoF.Game = {
  round: 0,
  hp: 3,
  maxHp: 3,
  gold: 2,
  // ... 기본 속성

  load(save) { ... },
  persist() { ... },
  logout() { ... },
  // ... core 메서드
};

window.Game = RoF.Game;
```

#### 4.2 `51_game_town.js` 생성

마을/건물 관련 메서드들:
- `showMenu()`: 메인 메뉴 렌더링
- `initBuildings()`: 건물 초기화
- `BUILDINGS`, `NPCS`: 건물/NPC 데이터 (2000줄 근처)
- `getBuildingLv()`: 건물 레벨
- `upgradeBuilding()`: 건물 업그레이드
- `renderTown()`: 타운 렌더링
- `getNpc()`, `renderNpcBar()`: NPC 관련

```javascript
Object.assign(RoF.Game, {
  BUILDINGS: [ ... ],
  NPCS: { ... },

  showMenu() { ... },
  upgradeBuilding() { ... },
  // ...
});
```

주의: `BUILDINGS`, `NPCS` 같은 데이터 상수는 Game 객체의 속성으로 두는 것이 자연스럽다 (`51_game_town.js`가 이들을 사용하는 유일한 파일이므로).

#### 4.3 `52_game_tavern.js` 생성

술집 관련:
- `showTavern()`, `showTavernUnit()`, `showTavernHero()`
- `hireTavern()`: 카드 영입
- `refreshTavern()`: 술집 갱신

```javascript
Object.assign(RoF.Game, {
  showTavern() { ... },
  showTavernUnit() { ... },
  showTavernHero() { ... },
  hireTavern() { ... },
  refreshTavern() { ... },
});
```

#### 4.4 `53_game_deck.js` 생성

덱 보기/카드 상세/도감:
- `showDeckView()`, `showDeckTab()`, `showCodexTab()`
- `showCardDetail()`: 카드 상세 모달
- `equipSkill()`: 스킬 장착

#### 4.5 `54_game_castle.js` 생성

성/교회/대장간:
- `showCastle()`, `showCastleUpgradeTab()`, `showCastleQuestTab()`
- `showForge()`
- `showChurch()`
- `showTraining()`
- `showShop()`

#### 4.6 `55_game_battle.js` 생성

전투 흐름:
- `showMatchmaking()`: 적 선택
- `startBattle()`, `launchBattle()`: 전투 시작
- `showBattleEnd()`: 전투 후 결과
- `showRoundChoice()`: 라운드 선택
- `finishPick()`, `rerollPick()`: 보상 선택
- `newRun()`: 새 게임
- `afterBattle()`: 전투 후 처리

#### 4.7 `56_game_effects.js` 생성

전투 중 시각 이펙트:
- `showAtkEffect()`: 공격 이펙트
- `showDmg()`: 데미지 숫자
- `showHeal()`: 힐 이펙트
- `showAbilEff()`: 어빌리티 이펙트
- `showGameOver()`: 게임 오버 화면 (defeat-animation 브랜치의 패배 연출도 여기에 올 수 있음)

#### 4.8 기존 `index.html`의 Game 관련 코드 전부 제거

이동 완료 후 원본 `<script>` 블록에서 Game 객체 정의를 삭제.

#### 4.9 index.html에 script 태그 추가

```html
<script defer src="js/50_game_core.js"></script>
<script defer src="js/51_game_town.js"></script>
<script defer src="js/52_game_tavern.js"></script>
<script defer src="js/53_game_deck.js"></script>
<script defer src="js/54_game_castle.js"></script>
<script defer src="js/55_game_battle.js"></script>
<script defer src="js/56_game_effects.js"></script>
```

### 주의사항

- **메서드 간 상호 참조**: 예를 들어 `55_game_battle.js`의 `showBattleEnd()`가 `51_game_town.js`의 `showMenu()`를 호출할 수 있음. `Object.assign` 패턴 덕분에 이 참조는 런타임에 `this.showMenu()` 또는 `RoF.Game.showMenu()` 로 작동함.
- **로드 순서가 중요**: 모든 파일이 로드된 후에야 메서드가 완성됨. `99_bootstrap.js` 에서 초기화 시점에 모든 메서드가 준비된 상태여야 함.
- **`this` 바인딩**: `Object.assign`으로 추가된 메서드는 `RoF.Game.xxx()` 형태로 호출할 때 `this === RoF.Game`. 화살표 함수 쓰지 말 것 (바인딩 깨짐).

### 검증

- 마을 진입 → 모든 건물 클릭 → 각 화면 정상 진입
- 술집 영입, 덱 보기, 성/교회/대장간
- 전투 시작 → 종료 → 게임오버까지 전체 흐름
- 13개 체크리스트 전체 수행

### 리스크
**높음**. 이 단계가 가장 복잡하고 실수 가능성 높다. Game 내부 메서드가 서로 많이 참조하므로 하나라도 누락되면 연쇄 오류 발생.

## Phase 5: TurnBattle, Formation, FX 분리

### 목적
남은 독립 시스템들을 각자의 파일로 분리.

### 작업 내용

#### 5.1 `60_turnbattle.js` 생성

`TurnBattle` 객체 (4530~5207줄, 678줄) 전체 이동:
```javascript
RoF.TurnBattle = {
  // 기존 속성들
  start() { ... },
  startCombat() { ... },
  renderEnemyDiamond() { ... },
  renderDiamond() { ... },
  processAction() { ... },
  _canTarget() { ... },
  bindKeys() { ... },
  unbindKeys() { ... },
  // ...
};

window.TurnBattle = RoF.TurnBattle;
```

#### 5.2 `70_formation.js` 생성

`Formation` 객체 (5208~5328줄, 121줄) 이동:
```javascript
RoF.Formation = {
  show() { ... },
  showForBattle() { ... },
  _init() { ... },
  render() { ... },
  clickSlot() { ... },
  clickBench() { ... },
  confirm() { ... },
  auto() { ... },
};

window.Formation = RoF.Formation;
```

#### 5.3 `80_fx.js` 생성

`FX`와 `DefeatFX` 객체를 함께 이동:
```javascript
RoF.FX = {
  canvas: null,
  ctx: null,
  particles: [],
  bolts: [],
  _raf: null,

  initTitle() { ... },
  destroy() { ... },
  // ...
};

RoF.DefeatFX = {
  canvas: null,
  ctx: null,
  particles: [],
  _raf: null,

  start() { ... },
  emitAsh(x, y) { ... },
  stop() { ... },
};

window.FX = RoF.FX;
window.DefeatFX = RoF.DefeatFX;
```

#### 5.4 UI.show 몽키패칭 처리

기존 코드 5535~5541줄에 있는 UI.show 몽키패칭은 `99_bootstrap.js` 로 이동:
```javascript
// 99_bootstrap.js
document.addEventListener('DOMContentLoaded', () => {
  // UI.show 를 확장하여 FX 초기화/파괴 로직 추가
  const _origShow = RoF.UI.show;
  RoF.UI.show = function(id) {
    _origShow.call(this, id);
    if (id === 'title-screen') {
      setTimeout(() => RoF.FX.initTitle(), 200);
    } else {
      RoF.FX.destroy();
    }
    if (id !== 'gameover-screen') {
      RoF.DefeatFX.stop();
    }
  };

  // 자동 로그인 복원 (기존 IIFE)
  const u = localStorage.getItem('rof8_last_user');
  const p = localStorage.getItem('rof8_last_pw');
  if (u) document.getElementById('login-id').value = u;
  if (p) document.getElementById('login-pw').value = p;

  // 볼륨 복원
  const sv = localStorage.getItem('rof8_vol');
  if (sv) {
    const v = parseInt(sv);
    document.getElementById('vol-slider').value = v;
    document.getElementById('vol-display').textContent = v;
    RoF.SFX.vol = v / 100;
    document.getElementById('sound-toggle').textContent =
      v === 0 ? '🔇' : v < 30 ? '🔉' : '🔊';
  }

  // 초기 FX 시작
  setTimeout(() => RoF.FX.initTitle(), 500);

  // Sanity check (Opus 리뷰 반영)
  // 모든 핵심 모듈이 로드되었는지 검증. 하나라도 누락이면 파일 경로/대소문자 이슈 가능성.
  const EXPECTED = [
    'RoF.Data.UNITS',
    'RoF.Data.SKILLS',
    'RoF.Data.RELICS',
    'RoF.SFX',
    'RoF.UI',
    'RoF.Auth',
    'RoF.Game',
    'RoF.TurnBattle',
    'RoF.Formation',
    'RoF.FX',
    'RoF.DefeatFX',
  ];
  const missing = [];
  for (const path of EXPECTED) {
    const v = path.split('.').reduce((o, k) => o?.[k], window);
    if (!v) missing.push(path);
  }
  if (missing.length > 0) {
    console.error('[RoF] 로드 누락:', missing);
    console.error('[RoF] 파일 경로/대소문자/로드 순서를 확인하세요.');
  } else {
    console.log('[RoF] 모든 모듈 로드 완료');
  }
});
```

### 검증

- 전투 전체 흐름 (TurnBattle)
- 편성 화면 작동 (Formation)
- 타이틀 화면 파티클 (FX)
- 패배 시 파티클 (DefeatFX, 만약 패배 연출 브랜치가 머지됐다면)
- 13개 체크리스트

### 리스크
**중간**. TurnBattle이 Game의 여러 메서드를 호출하므로 Phase 4가 완벽해야 이 단계가 작동함.

## Phase 6: onclick → data-action 마이그레이션

### 목적
**HTML 문자열에 박힌 `onclick` 인라인 핸들러 속성을 모두 제거**하고 `data-action` 패턴으로 전환한다. 이벤트 위임 로직을 `99_bindings.js` 에 구현.

### 범위 확정 (Opus 리뷰 반영)

**이 Phase가 다루는 것**:
- `index.html` 에 문자열로 박혀 있는 `onclick="..."` 속성 (95개 추정)

**이 Phase가 다루지 않는 것**:
- JS 내부 `el.onclick = () => {...}` 형태의 동적 할당 (46개 이상 추정). 이것은 **허용**하되, 호출부에서 **반드시 `RoF.Xxx.method()` 풀 경로** 사용.
- 예: `btn.onclick = () => RoF.Game.showTavern();` (OK)
- 예: `btn.onclick = () => Game.showTavern();` (금지 — Phase 4 이후 호환성 레이어 삭제 시 깨짐)

**이유**: 동적 onclick 46+개를 전부 data-action 화하면 클로저 데이터 전달 문제가 생기고 작업량이 2~3배로 늘어남. 인라인 HTML onclick 만 제거해도 "관심사 분리" 목표는 달성됨.

**스펙 5.7 수정 필요**: `claude-spec.md` 의 "모든 onclick 인라인 핸들러 제거 완료" → "**HTML 문자열에 박힌 onclick 인라인 속성 0개** (grep 확인)" 로 문구 한정.

### 호환성 레이어 유지

Phase 6에서도 `window.Game = RoF.Game` 같은 호환성 레이어는 **유지**한다. 제거는 이 리팩토링 범위 외 (별도 Phase 로 분리).

### 작업 내용

#### 6.1 먼저 모든 onclick 목록 수집

grep 또는 검색으로 `index.html` 에서 `onclick=` 을 전부 찾아 목록 작성. 예상 개수: 40~50개.

예상 매핑:
```
onclick="Auth.login()"              → data-action="auth.login"
onclick="Auth.signup()"             → data-action="auth.signup"
onclick="Auth.confirmChar()"        → data-action="auth.confirmChar"
onclick="Auth.charBack()"           → data-action="auth.charBack"
onclick="UI.show('login-screen')"   → data-action="ui.show" data-arg="login-screen"
onclick="UI.closeModal()"           → data-action="ui.closeModal"
onclick="Game.logout()"             → data-action="game.logout"
onclick="Game.newRun()"             → data-action="game.newRun"
onclick="Game.showTavernUnit()"     → data-action="game.showTavernUnit"
onclick="TurnBattle.startCombat()"  → data-action="turnBattle.startCombat"
onclick="Formation.auto()"          → data-action="formation.auto"
onclick="Formation.confirm()"       → data-action="formation.confirm"
onclick="SFX.toggle()"              → data-action="sfx.toggle"
```

#### 6.2 `99_bindings.js` 생성

```javascript
(function() {
  'use strict';

  // 모듈 이름 → RoF 객체 이름 매핑 (camelCase)
  const MODULE_MAP = {
    auth: 'Auth',
    ui: 'UI',
    sfx: 'SFX',
    game: 'Game',
    turnBattle: 'TurnBattle',
    formation: 'Formation',
    fx: 'FX',
    defeatFX: 'DefeatFX',
  };

  function resolveAction(actionString) {
    const [moduleName, methodName] = actionString.split('.');
    const moduleKey = MODULE_MAP[moduleName];
    if (!moduleKey) {
      console.error(`[bindings] Unknown module: ${moduleName}`);
      return null;
    }
    const module = RoF[moduleKey];
    if (!module) {
      console.error(`[bindings] Module not loaded: ${moduleKey}`);
      return null;
    }
    const method = module[methodName];
    if (typeof method !== 'function') {
      console.error(`[bindings] Method not found: ${moduleKey}.${methodName}`);
      return null;
    }
    return method.bind(module);
  }

  // 클릭 이벤트 위임
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;

    const action = el.dataset.action;
    const arg = el.dataset.arg;

    const handler = resolveAction(action);
    if (handler) {
      try {
        if (arg !== undefined) {
          handler(arg);
        } else {
          handler();
        }
      } catch (err) {
        console.error(`[bindings] Error executing ${action}:`, err);
      }
    }
  });

  // input 이벤트 위임 (볼륨 슬라이더용)
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-action-input]');
    if (!el) return;

    const action = el.dataset.actionInput;
    const handler = resolveAction(action);
    if (handler) {
      handler(el.value);
    }
  });

  // Enter 키 핸들러 (로그인/회원가입)
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const el = e.target.closest('[data-action-enter]');
    if (!el) return;

    // 폼 submit 기본 동작 차단 (페이지 새로고침 방지) — Opus 리뷰 반영
    e.preventDefault();

    const action = el.dataset.actionEnter;
    const handler = resolveAction(action);
    if (handler) handler();
  });
})();
```

**주의**: `<input>` 이 `<form>` 안에 있으면 Enter 가 기본 submit 동작을 일으켜 페이지가 새로고침될 수 있음. `e.preventDefault()` 가 이를 방지. 만약 원본 HTML 에 `<form>` 요소가 있다면 Phase 6 작업 중 확인하여 필요시 제거 또는 `<form onsubmit="return false">` 처리.

#### 6.3 HTML 전체 치환

`index.html` 의 모든 `onclick="..."` 를 `data-action="..."` 으로 변경.

특수한 경우:
- 인자가 있는 경우: `onclick="UI.show('login-screen')"` → `data-action="ui.show" data-arg="login-screen"`
- Enter 키 바인딩: `addEventListener('keydown', ...)` 로 된 것은 `data-action-enter` 로 교체
- oninput: `oninput="SFX.setVolume(this.value)"` → `data-action-input="sfx.setVolume"`

#### 6.4 기존 `addEventListener` 코드 제거

기존 5331~5332줄에 있는 Enter 키 바인딩 코드는 제거 (이제 `99_bindings.js` 가 담당):
```javascript
// 제거
document.getElementById('login-pw').addEventListener('keydown', e => {
  if (e.key === 'Enter') Auth.login();
});
document.getElementById('signup-pw2').addEventListener('keydown', e => {
  if (e.key === 'Enter') Auth.signup();
});
```

대신 HTML에서:
```html
<input type="password" id="login-pw" data-action-enter="auth.login">
<input type="password" id="signup-pw2" data-action-enter="auth.signup">
```

#### 6.5 `window.Xxx` 호환성 레이어 제거 (선택)

이제 onclick이 없으므로 기존 `window.Auth = RoF.Auth` 같은 호환성 트릭은 불필요해짐. 제거해서 코드를 더 깨끗하게 만들 수 있음. 다만 콘솔 디버깅 편의를 위해 유지해도 됨.

**권장**: Phase 6 커밋에서는 호환성 레이어 유지. 별도 Phase (Phase 7)로 만들어 제거하는 것이 안전.

이번 리팩토링에서는 Phase 6까지만 진행.

#### 6.6 index.html에 script 추가

```html
<script defer src="js/99_bindings.js"></script>
<script defer src="js/99_bootstrap.js"></script>
```

순서 중요: `99_bindings.js` 가 `99_bootstrap.js` 보다 먼저. 이벤트 리스너 등록이 초기화 전에 되어야 함.

### 주의사항

- **동적 생성 요소**: 코드에서 `createElement` 후 `onclick = ...` 으로 핸들러 붙이는 경우도 있음. 이것도 찾아서 `setAttribute('data-action', ...)` 로 교체해야 함. 다만 이런 경우 복잡하면 기존 방식 유지도 가능 (JS 안에서 `addEventListener` 쓰는 건 괜찮음, HTML 인라인만 제거가 목적).

- **누락된 핸들러**: grep으로 찾을 때 따옴표 스타일, 공백 등의 변형을 주의. `onclick =`, `onclick="..."`, `onclick='...'` 모두 검색.

- **data-action 값 검증**: 테스트 시 존재하지 않는 메서드 이름이 들어가면 콘솔에 에러만 나오고 조용히 실패함. `99_bindings.js` 의 에러 로그 확인 필수.

### 검증

- 모든 버튼 클릭이 작동하는지 확인 (특히 tab 전환, 모달 닫기 같은 세부 기능)
- Enter 키로 로그인 작동
- 볼륨 슬라이더 작동
- 13개 체크리스트 전체 수행

### 리스크
**높음**. 40+개 HTML 핸들러를 수동으로 교체하는 과정에서 오타, 누락 가능. 하나라도 놓치면 해당 버튼이 작동 안 함.

## 전체 브랜치 & 커밋 전략

### 브랜치 생성 순서

1. 현재 `feature/defeat-animation` 브랜치에서 작업 중인 내용을 로컬 stash 또는 로컬 커밋 (미푸시)
2. `git checkout master`
3. `git pull` (혹시 master 업데이트 있을 수 있음)
4. `git checkout -b backup/pre-refactor` (안전망 브랜치)
5. `git push -u origin backup/pre-refactor` (원격에도 백업)
6. `git checkout master`
7. `git checkout -b refactor/structure-split`
8. 이 브랜치에서 Phase 1~6 순차 작업

### 커밋 메시지

```
Phase 1: [Refactor Phase 1/6] CSS 파일 9개로 분리

Phase 2: [Refactor Phase 2/6] 데이터 상수 RoF.Data 네임스페이스로 분리

Phase 3: [Refactor Phase 3/6] SFX/UI/Auth/helpers/cards 모듈 분리

Phase 4: [Refactor Phase 4/6] Game 객체 7개 파일로 분할 (core/town/tavern/deck/castle/battle/effects)

Phase 5: [Refactor Phase 5/6] TurnBattle/Formation/FX 분리, bootstrap 초기화 통합

Phase 6: [Refactor Phase 6/6] onclick 40+개 → data-action 패턴 마이그레이션
```

### PR 생성

```
제목: [Refactor] index.html 5546줄 → 34개 파일 구조 분리

본문:
## 개요
index.html 단일 파일 5546줄을 34개 파일로 분리하는 구조 리팩토링입니다.
게임 기능은 변경 없습니다.

## 목적
- 협업 충돌 방지 (현재 같은 파일 동시 수정 시 충돌 상시)
- 코드 탐색 개선
- 향후 PixiJS 도입 등 확장 기반 마련

## 접근 방식
- 빌드 도구 없음 (순수 <script defer> 분리)
- Namespace 패턴 (window.RoF)
- data-action 이벤트 위임 (클린 아키텍처)

## Phase
1. CSS 분리 (9 파일)
2. 데이터 상수 분리 (6 파일)
3. SFX/UI/Auth/helpers/cards (5 파일)
4. Game 7개 파일 분할
5. TurnBattle/Formation/FX (3 파일)
6. onclick → data-action 마이그레이션

## 회귀 테스트 결과
- 13개 체크리스트 모두 PASS (각 Phase 후 수행)
- 브라우저 콘솔 에러 0개
- GitHub Pages 프리뷰 정상 동작

## 검토 요청 (동생에게)
이 PR을 클로드코드에 붙여서 "이 PR 검토해줘" 요청해주세요.
위험 요소와 누락된 부분이 있는지 AI가 봐줍니다.

## 참고 문서
- ROADMAP.md: 전체 로드맵
- REFACTOR_SPEC.md: 리팩토링 스펙
- claude-plan.md: 상세 계획
```

## 회귀 테스트 체크리스트 (매 Phase 후 수행)

Opus 리뷰 반영으로 13개 → 20개로 확장.

### 해피 패스 (13개)

1. **타이틀 → 로그인**: 타이틀 화면에서 "왕좌로 돌아가기" 버튼 → 로그인 화면
2. **회원가입 → 캐릭터 선택 → 마을**: 새 계정 → 프롤로그 → 캐릭터 선택 → 마을
3. **기존 계정 로그인**: 이전 계정으로 로그인 → 마을 (저장 데이터 복원)
4. **마을 건물 클릭**: 술집/교회/성/대장간 각 진입
5. **술집 카드 영입**: 용병 모집 → 덱에 추가
6. **덱 보기**: 덱 열람 → 카드 클릭 → 상세 모달 → 스탯 분배
7. **전투 시작 → 이펙트**: 매칭 → 편성 → 전투 → 공격/마법/크리티컬 이펙트
8. **전투 승리 → 보상**: 승리 후 카드/유물 선택
9. **전투 패배 → 게임오버**: 패배 화면 → "다시 시작" or "로그아웃"
10. **사운드**: 버튼 SFX, 전투/마을 BGM
11. **저장/불러오기**: 마을 작업 후 F5 → 유지
12. **볼륨 조절**: 슬라이더 작동
13. **새로고침 후 데이터 유지**: F5 후 로그인 정보 자동 입력

### 엣지 케이스 (7개, Opus 리뷰 반영)

14. **모달 중첩 + 닫기**: 카드 상세 모달을 연 상태에서 다른 화면으로 돌아가기 버튼 → 모달이 제대로 닫히는지 (leak 없는지)
15. **사운드 토글 + 볼륨 반복**: ON/OFF 토글 + 볼륨 0 → 30 → 100 반복 (브라우저 오토플레이 정책 영향 확인)
16. **전투 중 F5**: 전투 도중 새로고침 → 재로그인 → 전투가 종료되어 마을로 복귀하는지, localStorage 상태 깨지지 않는지
17. **Formation 취소 경로**: 편성 화면에서 confirm 전에 뒤로가기 → 상태 초기화 확인
18. **튜토리얼 첫 실행**: `tutStep=0` 상태로 신규 가입 → 튜토리얼 오버레이 정상 표시
19. **덱 가득 찼을 때 영입 시도**: 덱이 `maxDeck` 도달했을 때 영입 시도 → 경계값 처리 확인
20. **저장 데이터 마이그레이션**: 원본 1761줄 `rof8_v === '9'` 버전 체크가 새 파일 구조에서도 동일 시점에 실행되는지 확인. (Auth.js 로드 시점에 실행됨. 원본과 순서가 같은지 확인)

**실패 시 대응**: 해당 Phase 커밋만 `git revert`, 원인 분석 후 재작업.

## 위험 요소 및 완화 전략

### 위험 1: 참조 누락으로 인한 undefined 에러
**발생 상황**: Phase 2에서 `UNITS` → `RoF.Data.UNITS` 치환 시 하나라도 놓치면 런타임 에러.
**완화**:
- grep으로 모든 참조 먼저 수집
- 호환성 레이어 (`window.UNITS = RoF.Data.UNITS`) 로 안전망 구축
- 브라우저 콘솔을 계속 열어두고 에러 모니터링

### 위험 2: Game 객체 메서드 누락
**발생 상황**: Phase 4에서 Game을 7개 파일로 쪼갤 때 일부 메서드가 어느 파일에도 포함 안 됨.
**완화**:
- 리팩토링 전 Game 객체의 전체 메서드 목록을 텍스트 파일에 적어둠
- 각 Phase 4 파일에 어떤 메서드가 들어갔는지 체크
- 마지막에 `Object.keys(RoF.Game)` 로 전체 메서드 수 확인

### 위험 3: 로딩 순서 실수
**발생 상황**: `defer` 속성을 깜빡하거나 script 태그 순서를 잘못 적음.
**완화**:
- HTML head의 script 태그는 한 번 정리한 후 복붙으로 작성
- 커밋 전 `view-source` 로 최종 확인

### 위험 4: GitHub Pages 대소문자 이슈
**발생 상황**: Windows에서는 작동하는데 GitHub Pages에서 404.
**완화**:
- 모든 파일명 소문자 + 언더스코어 규칙 엄수
- `git config core.ignorecase false`
- PR 머지 전 GitHub Pages 프리뷰 배포로 확인

### 위험 5: onclick → data-action 오타
**발생 상황**: Phase 6에서 40+개 수동 치환 중 오타 발생.
**완화**:
- `99_bindings.js` 의 에러 로그를 콘솔로 출력
- 클릭 테스트를 모든 버튼에 대해 수동 수행
- 체크리스트 13개는 대부분의 버튼을 커버함

### 위험 6: 비개발자 팀원 리뷰의 한계 (Opus 리뷰 반영으로 강화)
**발생 상황**: 동생이 코드를 읽지 못해 잘못된 부분을 놓침. 또한 Claude Code 리뷰만으로는 시각적 회귀/이펙트 순서/사운드 타이밍을 못 잡음.

**완화 (의무 단계)**:
- **1. Claude Code 리뷰 (보조)**: 동생이 PR 링크를 자기 Claude Code 에 붙이고 "이 PR 검토해줘" 입력. 코드 레벨 위험 요소 파악.
- **2. 로컬 풀 + 직접 플레이 1회 (필수)**: 동생이 `refactor/structure-split` 브랜치를 로컬에 받아 최소 1회 전체 플레이:
  - 회원가입 또는 로그인 → 마을 진입
  - 술집 영입 1회
  - 전투 승리 1회
  - 게임오버 화면 확인 (패배 유도)
  - 로그아웃 → 재로그인 → 데이터 유지 확인
- **3. 작성자 녹화 (선택)**: Phase 완료 시 작성자가 30초~1분 화면 녹화를 찍어 PR에 첨부. 동생이 "이전 기능"과 눈으로 비교 가능.

**Claude Code 리뷰는 "보조"이지 "합격 판정"이 아니다**. 반드시 직접 플레이로 기능 검증 필요.

## 범위 외 (이 작업에서 안 함)

다음 작업은 이 리팩토링의 범위가 아니다. 별도 작업으로 진행:

- 기능 추가/변경 (버그 수정 포함)
- 이펙트 고도화 (PixiJS, 쉐이더)
- TypeScript 전환
- ES Modules 전환
- 자동화 테스트 도입
- 에셋 최적화 (WebP, MP3 압축)
- 비밀번호 해싱 (보안 문제지만 별도 작업)
- README 작성

이 원칙을 지키지 않으면 리팩토링 범위가 무한 확장되어 완수하기 어려워진다.

## 완료 기준

다음이 모두 충족되면 리팩토링 완료:

1. ✅ `index.html` 200줄 이하 (HTML 구조만)
2. ✅ CSS 9개 파일 생성, 각 200줄 이하
3. ✅ JavaScript 24개 파일 생성, 각 500줄 이하
4. ✅ 모든 13개 회귀 테스트 PASS
5. ✅ 브라우저 콘솔 에러/경고 0개
6. ✅ GitHub Pages 정상 배포 및 작동
7. ✅ `onclick` 인라인 핸들러 0개 (grep으로 확인)
8. ✅ 팀원 클로드코드 검토 통과
9. ✅ 팀원 승인 후 PR 머지 완료
10. ✅ `backup/pre-refactor` 브랜치 보존 (롤백용)

## 예상 작업 시간 (Opus 리뷰 반영, 상향 조정)

- Phase 0 (준비): 0.5시간
- Phase 1 (CSS): 1~2시간
- Phase 2 (데이터): 2~3시간
- Phase 3 (SFX/UI/Auth): 3~4시간 (SFX 초기화 디버깅 여유 포함)
- Phase 4 (Game 7분할): **6~10시간** (상호 참조 버그 디버깅 포함)
- Phase 5 (TurnBattle/Formation/FX): 3~4시간
- Phase 6 (onclick): **5~7시간** (인라인 95개 + 호출부 교체)
- **총: 20~30시간**

각 Phase 후 회귀 테스트 20개 수행 시간 포함하면 **3~4일** 작업 예상.

비개발자 + AI 보조 환경이라 **4일로 잡는 것이 현실적**. Phase 4 에서 문제가 터지면 원인 규명에 3~5시간 추가 소모될 가능성 있음.
