# Section 04: SFX/UI/Auth/helpers/cards 모듈 분리 (Phase 3)

> 참고: `claude-plan.md` "Phase 3: SFX, UI, Auth 분리"
> 테스트: `claude-plan-tdd.md` "Phase 3: SFX, UI, Auth 분리"

## 목표

독립성 높은 5개 모듈을 각각의 파일로 분리.

## 작업 목록

1. `js/20_helpers.js` — `uid`, `wait`, `pickRar`, `upgradeRarity`, `fuseCard`, `enemyName`, `applySkillToUnit`, `applyRelic`, `applyRelicBattle` 이동 → `RoF.helpers.*`
2. `js/30_sfx.js` — `SFX` 객체 전체 (406줄) → `RoF.SFX`
3. **SFX 사용자 제스처 훅** 을 `30_sfx.js` 끝부분 IIFE 로 이동 (Opus 리뷰 반영):
   ```javascript
   (function bindGesture() {
     const events = ['click', 'touchstart', 'keydown'];
     const init = () => {
       RoF.SFX.init();
       events.forEach(e => document.removeEventListener(e, init, true));
     };
     events.forEach(e => document.addEventListener(e, init, true));
   })();
   ```
4. `js/31_ui.js` — `UI` 객체 → `RoF.UI`
5. `js/32_auth.js` — `Auth` 객체 → `RoF.Auth`
   - 상단에 localStorage 버전 체크 코드 포함:
     ```javascript
     if (localStorage.getItem('rof8_v') !== '9') {
       localStorage.removeItem('rof8');
       localStorage.setItem('rof8_v', '9');
     }
     ```
6. `js/40_cards.js` — `mkCardEl`, `mkRelicEl`, `mkMini` → `RoF.dom.*`
7. 각 파일 끝에 호환성 레이어: `window.SFX = RoF.SFX;` 등
8. `index.html` 에서 해당 객체들 제거
9. `<script defer>` 5개 추가
10. 커밋: `[Refactor Phase 3/6] SFX/UI/Auth/helpers/cards 모듈 분리`

## 주의사항

- **SFX 초기화 타이밍**: AudioContext 는 사용자 제스처 시점에 생성되어야 함. 페이지 로드 시 즉시 `SFX.init()` 호출하면 브라우저가 차단. 제스처 훅 IIFE 필수.
- **Auth localStorage 버전 체크**: 원본 1761줄 코드가 `32_auth.js` 상단에 위치해야 함. 다른 파일보다 앞서 실행되도록.
- Auth 가 Game.load() 를 호출하는 부분은 아직 작동해야 함 (호환성 레이어가 `window.Game` 을 제공).

## 완료 조건

- 5개 JS 파일 생성
- `RoF.SFX`, `RoF.UI`, `RoF.Auth`, `RoF.helpers`, `RoF.dom` 접근 가능
- 호환성: `window.SFX === RoF.SFX` 등 true
- 첫 사용자 클릭 후 `RoF.SFX.ctx` 가 AudioContext 인스턴스
- Phase 3 테스트 스텁 전부 PASS

## 리스크

**중간**. SFX Web Audio 초기화 타이밍이 가장 민감.
