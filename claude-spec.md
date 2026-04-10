# Realm of Fates 구조 리팩토링 — 통합 스펙

> 작성일: 2026-04-11
> 소스: REFACTOR_SPEC.md + claude-research.md + claude-interview.md
> 브랜치: `refactor/structure-split` (master에서 새로 생성 예정)

## 1. 목표

단일 파일 `index.html` (5546줄)을 **클린 아키텍처 기반 모듈 구조**로 분리한다. 게임 기능은 변경하지 않는다.

### 최종 결과물
- `index.html`: HTML 골격만 (~200줄)
- `css/`: 9개 파일 (각 200줄 이하 목표)
- `js/`: 23개 파일 (각 500줄 이하)
- **총 32개 파일**로 분할

## 2. 절대 지킬 제약 조건

1. **빌드 도구 금지**: Webpack, Vite, Rollup, npm 일체 사용 안 함
2. **순수 `<script defer>` 태그 분리만**
3. **GitHub Pages 배포 구조 유지**
4. **기능 0 변경**: 게임 플레이/이펙트/사운드 기능적으로 동일
5. **에셋 경로 그대로**: `img/`, `snd/` 상대 경로 유지
6. **새 의존성 추가 금지**: GSAP 외 어떤 라이브러리도 추가 안 함
7. **파일명 소문자 + 언더스코어**: GitHub Pages 대소문자 이슈 방지
8. **상대 경로만 사용**: `/js/...` 형태 금지

## 3. 아키텍처 결정 사항

### 3.1 네임스페이스 패턴
- **단일 글로벌**: `window.RoF = {}`
- 모든 기능이 `RoF` 아래에 배치 (`RoF.Game`, `RoF.Auth`, `RoF.SFX`, ...)
- 기존 `Game.xxx()` 호출 호환성을 위해 일부는 `window.Game = RoF.Game` 형태로도 노출
- 파일 내부 private 함수는 IIFE로 감싸서 캡슐화

### 3.2 로딩 순서 관리
- 모든 `<script>`에 **`defer` 속성** 필수
- 파일명 **숫자 접두사** (`00_`, `10_`, `20_`...)로 로드 순서 표현
- 10 단위로 띄워서 중간 삽입 여지 확보

### 3.3 이벤트 바인딩: data-action 패턴
- **onclick 인라인 핸들러 전부 제거**
- HTML에 `data-action="module.method"` 속성 사용
- `99_bindings.js` 에서 이벤트 위임으로 일괄 처리
- 예: `<button data-action="auth.login">입장</button>`

### 3.4 Game 객체 분할 (Object.assign 패턴)
2492줄짜리 `Game` 객체를 7개 파일로 분할:
```javascript
// 50_game_core.js
RoF.Game = {
  // 기본 속성 및 core 메서드
};

// 51_game_town.js
Object.assign(RoF.Game, {
  showMenu() { ... },
  upgradeBuilding() { ... },
});
```

## 4. 최종 폴더 구조

```
realm-of-fates/
├── index.html                   (~200줄, HTML 골격만)
├── .nojekyll                    (빈 파일, GitHub Pages 보험)
├── css/
│   ├── 00_reset.css             (~20줄, CSS 리셋)
│   ├── 10_tokens.css            (~30줄, CSS 변수: 색상, 폰트, 간격)
│   ├── 20_layout.css            (~50줄, 페이지 레이아웃)
│   ├── 30_components.css        (~150줄, 카드, 버튼, 모달)
│   ├── 40_battle.css            (~120줄, 전투 전용)
│   ├── 41_formation.css         (~50줄, 편성)
│   ├── 42_screens.css           (~200줄, town/tavern/castle/church 등)
│   ├── 80_animations.css        (~150줄, @keyframes 전체)
│   └── 90_utilities.css         (~30줄, .hidden 등)
├── js/
│   ├── 00_namespace.js          (~30줄, RoF 선언 + 에러 핸들러)
│   ├── 10_constants.js          (~30줄, R_LABEL, ELEMENTS 등)
│   ├── 11_data_units.js         (~200줄, UNITS 배열)
│   ├── 12_data_skills.js        (~50줄, SKILLS_DB)
│   ├── 13_data_relics.js        (~30줄, RELICS_DB)
│   ├── 14_data_images.js        (~60줄, CARD_IMG)
│   ├── 15_data_traits.js        (~50줄, TRAITS + getTraits)
│   ├── 20_helpers.js            (~50줄, uid, wait, pickRar)
│   ├── 30_sfx.js                (~420줄, SFX 객체)
│   ├── 31_ui.js                 (~30줄, UI 객체)
│   ├── 32_auth.js               (~160줄, Auth 객체)
│   ├── 40_cards.js              (~80줄, mkCardEl, mkRelicEl, mkMini, fuseCard)
│   ├── 50_game_core.js          (~250줄, Game 기본)
│   ├── 51_game_town.js          (~300줄, 마을/건물)
│   ├── 52_game_tavern.js        (~350줄, 술집)
│   ├── 53_game_deck.js          (~400줄, 덱 보기/도감)
│   ├── 54_game_castle.js        (~250줄, 성/교회/대장간)
│   ├── 55_game_battle.js        (~500줄, 전투 흐름)
│   ├── 56_game_effects.js       (~200줄, 이펙트 메서드)
│   ├── 60_turnbattle.js         (~700줄, TurnBattle)
│   ├── 70_formation.js          (~130줄, Formation)
│   ├── 80_fx.js                 (~200줄, FX + DefeatFX)
│   ├── 99_bindings.js           (~80줄, data-action 이벤트 위임)
│   └── 99_bootstrap.js          (~50줄, DOMContentLoaded 초기화)
├── img/                          (그대로)
└── snd/                          (그대로)
```

**총 파일 수**: CSS 9개 + JS 24개 + HTML 1개 = **34개**

## 5. 의존성 로드 순서

### 5.1 CSS (cascade 순서 = 선언 순서)
```
00_reset → 10_tokens → 20_layout → 30_components
→ 40_battle → 41_formation → 42_screens
→ 80_animations → 90_utilities
```

### 5.2 JavaScript (defer + 파일명 순서)
```
00_namespace (RoF 선언)
↓
10_constants → 11_data_units → 12_data_skills → 13_data_relics
→ 14_data_images → 15_data_traits (데이터 레이어)
↓
20_helpers (순수 함수)
↓
30_sfx → 31_ui → 32_auth (독립 시스템)
↓
40_cards (DOM 빌더)
↓
50_game_core → 51_game_town → 52_game_tavern → 53_game_deck
→ 54_game_castle → 55_game_battle → 56_game_effects (Game 분할)
↓
60_turnbattle → 70_formation → 80_fx (의존 모듈)
↓
99_bindings → 99_bootstrap (초기화)
```

## 6. Phase 계획 (6단계)

### Phase 1: CSS 분리
- `<style>` 블록 → `css/*.css` 9개 파일
- 리스크: **최저** (CSS는 기능 없음)
- 회귀 테스트: 시각적으로 동일한지 확인

### Phase 2: 데이터 파일 분리
- 상수와 데이터를 `js/10_*` ~ `js/15_*` 로 분리
- `const UNITS = [...]` → `RoF.Data.UNITS = [...]`
- grep으로 기존 참조 전부 `RoF.Data.XXX` 로 교체
- 리스크: 중간 (변수명 전체 치환)

### Phase 3: SFX, UI, Auth 분리
- 독립 시스템 3개를 각각의 파일로
- `30_sfx.js`, `31_ui.js`, `32_auth.js`
- `window.SFX = RoF.SFX` 형태로 양쪽 호환
- 리스크: 중간

### Phase 4: Game 객체 7개 파일 분할
- 가장 복잡한 단계
- `50_game_core.js` 에 `RoF.Game = {}` 기본 선언
- `51~56` 파일에서 `Object.assign(RoF.Game, {...})` 로 메서드 추가
- 리스크: **높음** (Game 내부 메서드 간 상호 참조)

### Phase 5: TurnBattle, Formation, FX 분리
- `60_turnbattle.js`, `70_formation.js`, `80_fx.js`
- UI.show 몽키패칭(FX/DefeatFX)은 `99_bootstrap.js` 에 옮김
- 리스크: 중간

### Phase 6: onclick → data-action 마이그레이션
- HTML의 40+개 `onclick="..."` 전부 제거
- `data-action="module.method"` 로 교체
- `99_bindings.js` 에 이벤트 위임 로직 추가
- 리스크: **높음** (HTML과 JS 양쪽 동시 수정)

## 7. 회귀 테스트 체크리스트 (매 Phase 후 전체 실행)

1. ✅ 타이틀 화면 → 로그인 버튼 작동
2. ✅ 회원가입 → 캐릭터 선택 → 마을 진입
3. ✅ 기존 계정 로그인 → 마을 진입
4. ✅ 마을 건물 클릭 → 각 화면(술집/교회/캐슬/대장간) 진입
5. ✅ 술집에서 카드 영입
6. ✅ 덱 보기 → 카드 상세 → 스탯 분배
7. ✅ 전투 시작 → 전투 중 이펙트 정상
8. ✅ 전투 승리 → 보상 화면
9. ✅ 전투 패배 → 게임오버 화면
10. ✅ 사운드 재생 (BGM + SFX)
11. ✅ 저장/불러오기 (localStorage)
12. ✅ 볼륨 조절
13. ✅ 새로고침 후 데이터 유지

**실패 시**: 해당 Phase 커밋만 `git revert`, 원인 분석 후 재작업.

## 8. 브랜치 및 커밋 전략

### 8.1 브랜치
- **현재**: `feature/defeat-animation` (패배 연출 작업, 로컬만 유지, 미커밋)
- **작업 브랜치**: `refactor/structure-split` (master에서 생성)
- **안전망**: `backup/pre-refactor` (리팩토링 시작 전 master 상태 박제)

### 8.2 커밋 (6개, Phase별)
```
커밋 1: [Refactor Phase 1/6] CSS 파일 분리
커밋 2: [Refactor Phase 2/6] 데이터 상수 분리
커밋 3: [Refactor Phase 3/6] SFX/UI/Auth 모듈 분리
커밋 4: [Refactor Phase 4/6] Game 객체 7개 파일 분할
커밋 5: [Refactor Phase 5/6] TurnBattle/Formation/FX 분리
커밋 6: [Refactor Phase 6/6] onclick → data-action 마이그레이션
```

### 8.3 PR (1개)
- 제목: `[Refactor] index.html 5546줄 → 34개 파일 구조 분리`
- 본문: 각 Phase 요약 + 회귀 테스트 결과 + Claude Code 검토 요청

## 9. 팀원 검토 플로우

팀원(동생)은 비개발자 + 클로드코드 사용자:

1. 당신이 PR 생성
2. 동생에게 PR 링크 전달 (카톡/슬랙)
3. 동생이 클로드코드에 **"이 PR 검토해줘"** 입력
4. 동생의 클로드코드가 전체 변경 분석 + 위험 요소 보고
5. (선택) 동생이 로컬에서 브랜치 받아 게임 직접 플레이
6. 동생 승인 → 당신이 머지

## 10. 테스트 전략

**자동화 테스트 없음** (빌드 도구 금지 원칙). 대신:
- 매 Phase 후 13개 체크리스트 수동 실행
- 로컬 서버 (`python -m http.server 8000`)로 실제 환경과 유사한 조건에서 테스트
- GitHub Pages 프리뷰 배포로 실제 배포 환경 확인
- 대소문자 이슈 검증: `grep -oE 'src="[^"]+"' index.html`

## 11. 성공 기준

1. ✅ `index.html` 200줄 이하
2. ✅ CSS 9개 파일 분리, 각 200줄 이하
3. ✅ JS 24개 파일 분리, 각 500줄 이하
4. ✅ 전체 13개 회귀 테스트 PASS
5. ✅ 브라우저 콘솔 에러 0개
6. ✅ GitHub Pages 정상 동작
7. ✅ 모든 onclick 인라인 핸들러 제거 완료
8. ✅ 팀원(동생) 클로드코드 검토 통과
9. ✅ 팀원 승인 후 머지 완료

## 12. 롤백 계획

- **Phase 단위 롤백**: `git revert <commit>` 으로 해당 Phase만 되돌리기
- **전체 롤백**: `backup/pre-refactor` 브랜치로 복구
- **머지 후 문제 발견 시**: `git revert <merge-commit>` 후 원인 분석

## 13. 범위 외 (이 작업에서 안 함)

- ❌ 기능 추가/변경
- ❌ 이펙트 고도화 (PixiJS 등은 다음 Phase)
- ❌ 자동화 테스트 도입
- ❌ TypeScript 전환
- ❌ 에셋 최적화
- ❌ 비밀번호 해싱 (별도 보안 작업)
- ❌ README 작성 (별도 문서 작업)

이 리팩토링의 목적은 오직 **"구조 정리를 통한 협업 기반 마련"**.
