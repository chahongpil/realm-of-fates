# Section 07: onclick → data-action 마이그레이션 (Phase 6)

> 참고: `claude-plan.md` "Phase 6: onclick → data-action 마이그레이션"
> 테스트: `claude-plan-tdd.md` "Phase 6: onclick → data-action 마이그레이션"

## 목표

**HTML 인라인 `onclick="..."` 속성 95개 전부 제거** 후 `data-action` 패턴으로 전환. 이벤트 위임 로직 `99_bindings.js` 에 구현.

## 범위 확정 (Opus 리뷰 반영)

- **이번 섹션이 다루는 것**: HTML 에 박힌 `onclick="..."` 인라인 속성만
- **다루지 않는 것**: JS 내부 `el.onclick = () => {...}` 동적 할당 46개. 이것은 **허용**하되 호출부를 `RoF.Xxx.method()` 풀 경로로 통일
- **호환성 레이어**: `window.Game = RoF.Game` 등 유지 (제거는 별도 Phase, 범위 외)

## 작업 목록

### 7.1 onclick 목록 수집

```bash
grep -n 'onclick=' index.html > docs/onclick_final_audit.txt
```

Phase 0 의 `docs/onclick_inline.txt` 와 비교.

### 7.2 `js/99_bindings.js` 생성

```javascript
(function() {
  'use strict';

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
        if (arg !== undefined) handler(arg);
        else handler();
      } catch (err) {
        console.error(`[bindings] Error executing ${action}:`, err);
      }
    }
  });

  // input 이벤트 (볼륨 슬라이더)
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-action-input]');
    if (!el) return;
    const handler = resolveAction(el.dataset.actionInput);
    if (handler) handler(el.value);
  });

  // Enter 키 바인딩 (preventDefault 필수 - Opus 리뷰)
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const el = e.target.closest('[data-action-enter]');
    if (!el) return;

    e.preventDefault(); // 폼 submit 기본 동작 차단

    const handler = resolveAction(el.dataset.actionEnter);
    if (handler) handler();
  });
})();
```

### 7.3 HTML 전체 치환

모든 `onclick="Module.method()"` → `data-action="module.method"` (소문자 camelCase)

인자 있는 경우:
```html
<!-- 기존 -->
<button onclick="UI.show('login-screen')">입장</button>
<!-- 변경 -->
<button data-action="ui.show" data-arg="login-screen">입장</button>
```

Enter 키:
```html
<input type="password" id="login-pw" data-action-enter="auth.login">
```

볼륨 슬라이더:
```html
<input type="range" id="vol-slider" data-action-input="sfx.setVolume">
```

### 7.4 기존 이벤트 리스너 코드 제거

`99_bindings.js` 가 담당하므로 제거:
- `document.getElementById('login-pw').addEventListener('keydown', ...)`
- `document.getElementById('signup-pw2').addEventListener('keydown', ...)`

### 7.5 index.html 에 script 추가

```html
<script defer src="js/99_bindings.js"></script>
<!-- 99_bootstrap.js 는 이미 있음 -->
```

`99_bindings.js` 가 `99_bootstrap.js` 보다 **먼저** 로드되어야 함.

### 7.6 커밋

`[Refactor Phase 6/6] onclick → data-action 마이그레이션`

## 검증

### grep 확인
```bash
# HTML 인라인 onclick 0개 확인
grep -c 'onclick=' index.html
# → 0 이 나와야 함 (또는 의도적으로 남긴 것만)
```

### 모든 버튼 순회
게임 전체에서 클릭 가능한 모든 버튼을 한 번씩 눌러보기. 작동 안 하는 버튼이 있으면 data-action 오타 가능성.

### 콘솔 에러 모니터링
`[bindings] Unknown module:` 또는 `Method not found:` 메시지 확인.

## 완료 조건

- `index.html` 에 `onclick=` 문자열 0개
- `data-action` 속성이 이전 onclick 개수와 일치
- Enter 키 로그인/회원가입 작동 (페이지 새로고침 없음)
- 볼륨 슬라이더 작동
- 모든 버튼 정상 클릭
- 콘솔 에러 0
- Phase 6 테스트 스텁 전부 PASS (20개 체크리스트 포함)

## 리스크

**높음**. 95개 수동 치환 중 오타/누락 가능. 특히 camelCase 변환 주의 (`TurnBattle.startCombat` → `turnBattle.startCombat`).

## 최종 검증 후

모든 Section 완료 후:
1. 파일 개수 확인 (CSS 9, JS 24, HTML 1)
2. 각 파일 크기 확인 (CSS ≤ 200줄, JS ≤ 500줄)
3. 전체 20개 체크리스트 최종 실행
4. GitHub Pages 프리뷰 배포 테스트
5. 대소문자 이슈 검증 (`grep -oE 'src="[^"]+"' index.html`)
6. PR 생성 (1개 PR + 7개 커밋)
7. 동생에게 리뷰 요청: Claude Code 검토 + 직접 플레이 1회
