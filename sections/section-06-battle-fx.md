# Section 06: TurnBattle/Formation/FX 분리 + bootstrap (Phase 5)

> 참고: `claude-plan.md` "Phase 5: TurnBattle, Formation, FX 분리"
> 테스트: `claude-plan-tdd.md` "Phase 5: TurnBattle, Formation, FX 분리"

## 목표

남은 독립 시스템 3개 분리 + 초기화 로직 통합.

## 작업 목록

### 6.1 `js/60_turnbattle.js`

`TurnBattle` 객체 (678줄) 전체 이동 → `RoF.TurnBattle`

### 6.2 `js/70_formation.js`

`Formation` 객체 (121줄) 이동 → `RoF.Formation`

### 6.3 `js/80_fx.js`

`FX` 와 `DefeatFX` 함께 이동 → `RoF.FX`, `RoF.DefeatFX`

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

- 4개 JS 파일 생성
- `index.html` 에서 분산된 초기화 코드 전부 이동됨
- 페이지 로드 시 콘솔에 `[RoF] 모든 모듈 로드 완료` 표시
- 전투 전체 흐름 작동
- Phase 5 테스트 스텁 전부 PASS

## 리스크

**중간**. TurnBattle 이 Game 의 여러 메서드 호출하므로 Phase 5 (Section 05 게임 분할) 가 완벽해야 작동함.
