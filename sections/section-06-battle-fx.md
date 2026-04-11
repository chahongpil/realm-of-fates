# Section 06: TurnBattle/Formation/FX 분리 + bootstrap (Phase 5)

> 참고: `claude-plan.md` "Phase 5: TurnBattle, Formation, FX 분리"
> 테스트: `claude-plan-tdd.md` "Phase 5: TurnBattle, Formation, FX 분리"

## 상태

**완료**. 브라우저 수동 회귀 테스트 대기 (11개 체크리스트 — `implementation/code_review/section-06-review.md`).

## 목표

남은 독립 시스템 3개 분리 + 초기화 로직 통합. Section 03 에서 누락됐던 `getHeroId` 도 함께 정리하여 index.html 을 순수 마크업 + `<script defer>` 체인으로 만든다.

## 작업 목록

### 6.1 `js/60_turnbattle.js`

`TurnBattle` 객체 (678줄) 전체 이동 → `RoF.TurnBattle`

### 6.2 `js/70_formation.js`

`Formation` 객체 (121줄) 이동 → `RoF.Formation`

### 6.3 `js/80_fx.js`

`FX` 이동 → `RoF.FX` + `window.FX`. 참고: `DefeatFX` 는 이 브랜치(`refactor/structure-split`)에 존재하지 않음 (패배 연출 기능 브랜치 미병합). bootstrap sanity check 및 관련 `DefeatFX.stop()` 호출도 모두 제외.

### 6.4 `js/99_bootstrap.js` — 초기화 통합

원본의 분산된 초기화 코드를 한 파일로 통합:

- UI.show 몽키패칭 (FX/DefeatFX 훅)
- 자동 로그인 복원 IIFE
- 볼륨 복원
- 초기 FX 시작
- **Sanity check (Opus 리뷰 반영)**: 모든 핵심 모듈 로드 검증

```javascript
document.addEventListener('DOMContentLoaded', () => {
  // UI.show 몽키패칭
  const _origShow = RoF.UI.show;
  RoF.UI.show = function(id) {
    _origShow.call(this, id);
    if (id === 'title-screen') setTimeout(() => RoF.FX.initTitle(), 200);
    else RoF.FX.destroy();
    if (id !== 'gameover-screen') RoF.DefeatFX.stop();
  };

  // 자동 로그인 복원
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

  // 초기 FX
  setTimeout(() => RoF.FX.initTitle(), 500);

  // Sanity check
  const EXPECTED = [
    'RoF.Data.UNITS', 'RoF.Data.SKILLS', 'RoF.Data.RELICS',
    'RoF.SFX', 'RoF.UI', 'RoF.Auth', 'RoF.Game',
    'RoF.TurnBattle', 'RoF.Formation', 'RoF.FX', 'RoF.DefeatFX',
  ];
  const missing = EXPECTED.filter(path =>
    !path.split('.').reduce((o, k) => o?.[k], window)
  );
  if (missing.length > 0) {
    console.error('[RoF] 로드 누락:', missing);
  } else {
    console.log('[RoF] 모든 모듈 로드 완료');
  }
});
```

### 6.5 기존 index.html 의 분산된 초기화 코드 제거

- Enter 키 바인딩 코드 (5331~5332줄)
- 자동 로그인 IIFE (5334줄)
- UI.show 몽키패칭 (5535~5541줄)
- 초기 FX setTimeout (5543줄)

### 6.6 `<script defer>` 4개 추가

```html
<script defer src="js/60_turnbattle.js"></script>
<script defer src="js/70_formation.js"></script>
<script defer src="js/80_fx.js"></script>
<script defer src="js/99_bootstrap.js"></script>
```

### 6.7 커밋

`[Refactor Phase 5/6] TurnBattle/Formation/FX 분리, bootstrap 초기화 통합`

## 완료 조건

- 4개 JS 파일 생성 ✓ (60_turnbattle, 70_formation, 80_fx, 99_bootstrap)
- `index.html` 에서 분산된 초기화 코드 전부 이동됨 ✓
- `index.html`: 1313 → **389** 줄 (인라인 스크립트 0건, 순수 마크업)
- Node vm assembly 검증 통과: 12개 파일 로드, RoF.Game 129키 유지, TurnBattle/Formation/FX 모두 등록
- 페이지 로드 시 콘솔에 `[RoF] 모든 모듈 로드 완료 (Game keys: 129)` — **브라우저 수동 회귀 테스트 필요** (체크리스트 11개)
- 코드 리뷰 반영: Section 03 debt `getHeroId` → `js/20_helpers.js` 로 이동, `STARTERS` 제거, NaN guard, `'use strict'` 추가

## 실제 구현 결과

| 파일 | 줄 수 | 설명 |
| --- | --- | --- |
| `js/60_turnbattle.js` | 683 | `RoF.TurnBattle` + `window.TurnBattle` |
| `js/70_formation.js` | 127 | `RoF.Formation` + `window.Formation` |
| `js/80_fx.js` | 84 | `RoF.FX` + `window.FX` (캔버스 파티클) |
| `js/99_bootstrap.js` | 85 | DOMContentLoaded 초기화 통합 + sanity check |
| `js/20_helpers.js` (수정) | 66 | `getHeroId` 추가 (Section 03 debt 상환) |
| `index.html` (수정) | 389 | 인라인 `<script>` 0건, `<script defer>` 22개 |

### 보조 스크립트

- `_split_modules.py` — `const X={...}` 블록 추출 + `RoF.X={...}` 변환
- `_remove_module_blocks.py` — index.html 에서 세 블록 + 4개 분산 초기화 코드 제거 + `<script>` 태그 4개 추가
- `_verify_game_assembly.js` (업데이트) — 12개 파일 sandbox 로드 + Game/TurnBattle/Formation/FX 검증

### 리뷰에서 반영한 개선

1. `getHeroId` → `js/20_helpers.js` 이동 (+ `window.getHeroId` shim)
2. `STARTERS=[]` legacy 데드코드 삭제
3. index.html 인라인 `<script>` 블록 완전 제거
4. `99_bootstrap.js` 볼륨 복원에 NaN guard 추가 (`parseInt(sv, 10)` + `Number.isFinite`)
5. `99_bootstrap.js` `'use strict';` 추가
6. `99_bootstrap.js` 헤더에 `RoF.X` vs 전역 `X` 네이밍 규칙 주석

### 리뷰에서 let go 한 항목

- 이중 FX init 타이머 → 원본 동작 유지, 멱등
- `RoF.__gameKeyError` producer 확인 → 이미 Section 05 auto-fix 로 7파일에 심어져 있음
- `_remove_module_blocks.py` 리네이밍 → 일회용 도구, 그대로 둠

## 리스크

**중간**. TurnBattle 이 Game 의 여러 메서드 호출하므로 Phase 5 (Section 05 게임 분할) 가 완벽해야 작동함.
