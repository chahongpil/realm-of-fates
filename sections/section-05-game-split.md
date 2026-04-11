# Section 05: Game 객체 7개 파일 분할 (Phase 4) — 최고 위험

> 참고: `claude-plan.md` "Phase 4: Game 객체 7개 파일 분할"
> 테스트: `claude-plan-tdd.md` "Phase 4: Game 7개 파일 분할"

## 상태

**완료**. 브라우저 수동 회귀 테스트 대기 중 (리뷰 체크리스트 12개 항목 참조 — `implementation/code_review/section-05-review.md`).

## 목표

2421줄 `Game` 객체(129 top-level 키)를 `Object.assign(RoF.Game, {...})` 패턴으로 7개 파일에 분산. 리팩토링의 핵심 단계이자 가장 위험한 단계.

## 사전 감사 (Opus 리뷰 반영) — 작업 시작 전 필수

### 4.0.1 Game 메서드 목록 재확인

브라우저 콘솔에서:
```javascript
console.log(Object.keys(Game).sort().join('\n'))
```

Phase 0 에서 만든 `docs/game_manifest.md` 와 비교. 차이 있으면 기록.

### 4.0.2 this 바인딩 감사

```bash
grep -nE 'function\s*\([^)]*\)\s*\{[^}]*this\.' index.html
```

`function` 키워드 안에서 `this.xxx` 를 쓰는 코드가 있으면 이동 후 깨질 가능성 있음. 해당 코드는 화살표 함수 또는 `.bind(this)` 로 전처리.

### 4.0.3 전역 자기 참조 감사

```bash
grep -nE '(Game|Auth|SFX|UI|TurnBattle|Formation)\.' index.html | head -50
```

Game 내부에서 `this.foo()` 대신 `Game.foo()` 로 자기 참조하는 경우 발견. 이동 시 `RoF.Game.foo()` 풀 경로로 교체.

## 작업 목록

### 5.1 `js/50_game_core.js` (기본 + core 메서드)

- Game 기본 속성: `round`, `hp`, `maxHp`, `gold`, `xp`, `level`, `honor`, `deck`, `relics`, `maxDeck`, `battleSpeed`, `battleRunning`, `skipReq`, `_slowMo`, `battleMultiplier`
- core 메서드: `load`, `persist`, `logout`, `cardXpNext`, `giveCardXp`, `giveCardHonor`, `checkTutorial`, `getTotalHonor`

```javascript
RoF.Game = {
  round: 0,
  hp: 3,
  // ... 속성들
  load(save) { /* ... */ },
  persist() { /* ... */ },
  // ...
};

window.Game = RoF.Game;
```

### 5.2 `js/51_game_town.js` (마을/건물)

- `BUILDINGS`, `NPCS` 데이터
- `showMenu`, `initBuildings`, `getBuildingLv`, `upgradeBuilding`, `renderTown`, `getNpc`, `renderNpcBar`

### 5.3 `js/52_game_tavern.js` (술집)

- `showTavern`, `showTavernUnit`, `showTavernHero`, `hireTavern`, `refreshTavern`

### 5.4 `js/53_game_deck.js` (덱 보기/도감)

- `_dvTab`, `showDeckTab`, `showCodexTab`, `_codexFilter`, `renderCodex`, `showCodexDetail`, `showDeckView`, `showCardDetail`, `showRelicDetail`, `equipSkill`, `equipOwnedSkill`
- 코드 리뷰 반영: `equipOwnedSkill` 은 덱뷰 스킬 장착 클릭 핸들러에서 호출되므로 tavern 이 아닌 deck 에 배치

### 5.5 `js/54_game_castle.js` (성/교회/대장간)

- `showCastle`, `showCastleUpgradeTab`, `showCastleQuestTab`, `showForge`, `showChurch`, `showTraining`, `showShop`

### 5.6 `js/55_game_battle.js` (전투 흐름)

- `showMatchmaking`, `startBattle`, `launchBattle`, `showBattleEnd`, `showRoundChoice`, `finishPick`, `rerollPick`, `newRun`, `afterBattle`

### 5.7 `js/56_game_effects.js` (이펙트 메서드)

- `showAtkEffect`, `showDmg`, `showHeal`, `showAbilEff`, `showGameOver`

## 런타임 중복 키 감지 (Opus 리뷰 반영)

각 `5x_game_*.js` 파일 **최상단**에 중복 감지 블록 추가:

```javascript
// 예시: 52_game_tavern.js
RoF.__gameKeys = RoF.__gameKeys || new Set();
(function(keys) {
  for (const k of keys) {
    if (RoF.__gameKeys.has(k)) {
      console.error('[Game] 중복 키 감지:', k);
    }
    RoF.__gameKeys.add(k);
  }
})(['showTavern', 'showTavernUnit', 'showTavernHero', 'hireTavern', 'refreshTavern']);

Object.assign(RoF.Game, {
  showTavern() { /* ... */ },
  // ...
});
```

## 사후 검증

완료 후 콘솔에서:

```javascript
const current = Object.keys(RoF.Game).sort();
// docs/game_manifest.md 와 비교
const manifest = [...]; // Phase 0 덤프
const missing = manifest.filter(k => !current.includes(k));
console.log('누락:', missing);
```

`missing` 이 비어있지 않으면 FAIL.

## 작업 순서

1. 사전 감사 3개 수행
2. 원본 Game 객체 백업 (주석 처리 or 별도 파일)
3. 50_game_core.js 부터 차례로 작성
4. 각 파일 작성 후 로컬 서버에서 로드해서 콘솔 에러 확인
5. 7개 파일 모두 작성 완료 후 `Object.keys(RoF.Game)` 개수 검증
6. Phase 4 테스트 스텁 전체 실행
7. 커밋: `[Refactor Phase 4/6] Game 객체 7개 파일로 분할`

## 완료 조건

- 7개 `5x_game_*.js` 파일 생성 ✓
- `Object.keys(RoF.Game).length` 가 Phase 0 덤프와 일치 ✓ (Node 어셈블리 검증기 PASS, 129/129)
- 중복 키 감지 메시지 0개 ✓
- 모든 마을/전투 기능 작동 — **브라우저 수동 회귀 테스트 필요** (체크리스트 12개)
- 코드 리뷰 반영 완료: Must-fix 0건, Auto-fix 5건 적용, 계획 준수 1건 (`showGameOver` → 56_effects)

## 실제 구현 결과

| 파일 | 키 수 | 설명 |
| --- | --- | --- |
| `js/50_game_core.js` | 25 | 기본 속성 15 + core 메서드 10 |
| `js/51_game_town.js` | 15 | 마을/건물/NPC/튜토리얼 |
| `js/52_game_tavern.js` | 9 | 술집 |
| `js/53_game_deck.js` | 11 | 덱/도감/카드·유물 상세 |
| `js/54_game_castle.js` | 10 | 성/리그/대장간/교회/훈련 |
| `js/55_game_battle.js` | 54 | 전투 흐름 + 스킬 시스템 + 타겟팅 |
| `js/56_game_effects.js` | 5 | 이펙트 (showAtk/Dmg/Heal/AbilEff/GameOver) |
| **합계** | **129** | 매니페스트 일치 |

### 보조 스크립트 (`docs/_*.py`, `docs/_*.js`)

- `_split_game.py` — Game 블록 파싱 + KEY_MAP 기반 7파일 자동 생성. parse_keys 끝에 `depth==0` sanity assert 추가.
- `_remove_game_block.py` — index.html 에서 Game 블록 + 배너 주석 제거.
- `_brace_check.py` — 생성된 js 파일의 brace/paren/bracket 균형 검사.
- `_verify_game_assembly.js` — Node vm sandbox 에서 7개 파일을 순차 로드하고 `Object.keys(RoF.Game)` 를 매니페스트와 비교.
- `_extract_inline_scripts.py` — index.html 의 `<script>` 본문을 추출해 `node --check` 로 문법 검증.
- `index.html.pre_phase5_backup` — 원본 백업. 브라우저 회귀 테스트 통과 후 제거 권장.

### 리뷰에서 반영한 개선

1. `equipOwnedSkill` 분류 수정: tavern → deck (실제 호출자 위치 기준)
2. `showGameOver` 계획 준수: battle → effects
3. 중복 키 감지 강화: `RoF.__gameKeyError = true` 플래그 추가
4. `window.Game = RoF.Game` 에 설명 주석 추가
5. `_split_game.py` parse_keys 에 `depth==0` assert 추가 (템플릿 리터럴 파서 버그 회귀 방지)
6. `55_game_battle.js` 말미의 stranded 주석 `// ---- EQUIP SKILL TO UNIT ----` 제거

### 리뷰에서 let go 한 항목

- 템플릿 리터럴 `${...}` 중첩 backtick 파서 완전 재작성 → 현재 무해 (node assembly 검증 통과). sanity assert 로 향후 회귀 감지.
- `'use strict'` 추가 → 원본 보존 원칙.
- trailing comma / bootstrap 블록 중복 → 생성기 템플릿 특성.

## 리스크

**높음**. 이 단계가 가장 복잡하고 실수 가능성 높음. Game 내부 메서드가 서로 많이 참조하므로 하나라도 누락되면 연쇄 오류. 실패 시 즉시 `git reset` 으로 돌아가고 재시도.
