# Realm of Fates 구조 리팩토링 계획 — Opus 심층 리뷰

**검토일**: 2026-04-11
**Verdict**: 수정 후 진행
**리뷰어**: Claude Opus (deep-plan reviewer)

## 총평

방향성과 구조적 판단은 타당하지만, Phase 단위 독립 작동 가정, 동적 생성 onclick 처리, `this` 바인딩, 순수 배열/이벤트 외의 호출 경로 같은 "실무 위험" 몇 가지가 계획서에 평가절하되어 있습니다. 현재 상태로 진행하면 Phase 4/5/6에서 한두 번은 반드시 깨집니다.

## 심각한 결함 (5개)

### 1. Game 객체 데이터 소유권 경계 충돌

**문제**:
- `50_game_core.js`의 `load()`가 `this.BUILDINGS` 접근하면 undefined
- `Object.assign`은 getter를 값으로만 복사
- Phase 4에서 같은 키를 두 파일에 실수로 넣을 가능성

**수정안**:
- Phase 4 전처리: `Object.keys(Game).sort()` 덤프해두기
- 각 `5x_game_*.js` 상단에 중복 키 런타임 감지 추가:
```javascript
RoF.__gameKeys = RoF.__gameKeys || new Set();
(function(keys){
  for (const k of keys) {
    if (RoF.__gameKeys.has(k)) console.error('[Game] 중복 키:', k);
    RoF.__gameKeys.add(k);
  }
})(['showTavern','hireTavern','refreshTavern']);
```
- 향후 getter 추가 금지 규칙 명시

### 2. 동적 생성 onclick 46+개가 사각지대

**문제**:
- 인라인 HTML onclick 95개 외에 **JS 내부 `el.onclick = ...` 46개 이상**
- 원본 라인: 1748, 1850, 1873, 2172, 2173, 2176, 2180, 2284, 2348, 2360, 2503, 2516, 2568, 2590, 2612, 2626, 2691, 2725, 2801, 2853, 3045, 3079, 3597, 3600, 3681, 3722, 3748, 3815, 3844, 3880, 3940, 3957, 4129, 4164, 4166, 4280, 4341, 4343, 4441, 4636, 4680, 4821, 4896, 5264, 5279
- 계획서가 "복잡하면 기존 방식 유지"라고 얼버무림
- 스펙 5.7 "모든 onclick 제거"와 충돌

**수정안 옵션**:
- **옵션 A (권장)**: JS 내부 `el.onclick = () => foo()`는 허용 대상으로 명시. 스펙 5.7 문구를 "HTML 문자열에 박힌 onclick 인라인 속성 0개"로 한정. 대신 호출부는 `RoF.Xxx.method()` 풀 경로.
- **옵션 B (비쌈)**: 46+개 전부 `el.dataset.action` 화. Phase 6 시간 2~3h → 6~8h로 재산정.

### 3. 참조 스타일 규칙 미정의

**문제**: 계획서가 각 분리 파일에서 `SFX.play()` 와 `RoF.SFX.play()` 중 어느 쪽을 쓸지 안 정함. 파일마다 혼재 가능.

**수정안 — 계획서 3.1에 규칙 추가**:
> - 분리된 새 파일(js/*.js)에서는 **항상 `RoF.Xxx` 풀 경로**로 호출
> - 원본 index.html에 남은 레거시 스크립트는 기존 짧은 이름 유지 (호환성 레이어가 흡수)
> - Phase 4 이후 짧은 이름 참조는 모두 제거
> - 한 파일 안에 `SFX`와 `RoF.SFX` 혼용 금지

### 4. this 바인딩 감사 누락

**문제**:
- `setTimeout(function(){ this.foo() })` 같은 구식 코드가 있으면 이동 후 깨짐
- 이벤트 핸들러에서 `this`가 아니라 `Game.foo()` 전역 이름 참조 가능

**수정안**: Phase 4 전 단계로 `function(` + `this.` 패턴 grep 감사 추가

### 5. Enter 키 바인딩의 preventDefault 누락

**문제**:
- `99_bindings.js` 의 keydown 핸들러에 `e.preventDefault()` 없음
- `<form>` 안의 `<input>`이면 Enter가 폼 submit 일으켜 페이지 새로고침 가능

**수정안**: `99_bindings.js` 코드 샘플에 `e.preventDefault()` 추가

## 중간 위험 요소

### 2.1 SFX 초기화 타이밍 처방 부재
- `SFX.init()`은 사용자 제스처에서 호출돼야 함
- 원본 1732줄 `document.addEventListener(evt, function _initBgm(){...})`이 어느 파일로 갈지 미정
- **수정안**: 이 코드를 `30_sfx.js` 끝부분 IIFE로 이동, 책임 명시

### 2.2 GitHub Pages 대소문자 이슈 방어 부족
- `core.ignorecase false` 만으로는 부족
- **수정안**: `99_bootstrap.js` 끝에 sanity check 추가
```javascript
const EXPECTED = ['RoF.Data.UNITS','RoF.SFX','RoF.UI','RoF.Auth','RoF.Game','RoF.TurnBattle','RoF.Formation','RoF.FX'];
for (const path of EXPECTED) {
  const v = path.split('.').reduce((o,k) => o?.[k], window);
  if (!v) console.error('[RoF] 누락:', path);
}
```

### 2.3 CSS 중복 selector 리스크
- 원본 `<style>` 블록에서 `.btn`을 두 번 정의해 뒤쪽이 우선이었다면 분리 후 깨질 수 있음
- **수정안**: Phase 1 중 `grep -oP '^\.[a-zA-Z_-]+' css/*.css | sort | uniq -d` 로 중복 감지

### 2.4 Phase 0 "준비" 단계 누락
계획서의 브랜치 생성/디렉토리 생성이 Phase 1 안에 섞여 있음.
**수정안**: Phase 0 독립 단계로 추가
1. `backup/pre-refactor` 브랜치 생성 + 푸시
2. `refactor/structure-split` 생성
3. `.nojekyll` 빈 파일 생성
4. `css/`, `js/` 디렉토리 생성
5. Game 객체 메서드 목록 덤프
6. 참조 횟수 사전 집계
7. 첫 커밋: `[Refactor Phase 0/6] 사전 준비`

### 2.5 비개발자 팀원 리뷰 과대평가
- Claude Code 리뷰만으로는 시각적 회귀/이펙트 순서/사운드 타이밍 못 잡음
- **수정안**:
  - "동생은 로컬 풀 + 직접 플레이 1회 (회원가입 → 마을 → 전투 승리 1회 → 로그아웃 → 재로그인)" 의무화
  - Phase 완료 시 작성자가 30초 녹화 첨부
  - Claude Code 리뷰는 보조, 합격 판정 아님

## 회귀 테스트 확장 (13개 → 18~20개)

기존 13개는 해피 패스만. 다음 추가:

14. 모달 중첩 + Esc 처리
15. 사운드 토글 ON/OFF + 볼륨 0→30→100 반복
16. 전투 중 F5 새로고침 → 복귀 경로
17. Formation 취소 경로
18. 튜토리얼 첫 실행 (신규 가입 `tutStep=0`)
19. 덱 가득 찬 상태 영입 시도 (경계값)
20. `rof8_v === '9'` 버전 체크 실행 순서 확인

## 시간 재산정

**기존 추정 13~19시간 → 20~30시간 (3~4일)**

- Phase 0 (준비): 0.5h
- Phase 1 (CSS): 1~2h
- Phase 2 (데이터): 2~3h
- Phase 3 (SFX/UI/Auth): 3~4h (SFX 초기화 디버깅 1h 여유)
- Phase 4 (Game 7분할): **6~10h** (상호 참조 버그 디버깅 포함)
- Phase 5 (TurnBattle/Formation/FX): 3~4h
- Phase 6 (onclick): **5~7h**

## 칭찬할 부분

- 빌드 도구 금지 원칙 방어가 단단함 (Cookie Clicker 사례 인용)
- 파일명 숫자 접두사 + defer 조합은 이 규모에 정확히 맞음
- 호환성 레이어 유지 결정 올바름
- 회귀 테스트 수동 수행 현실적
- Phase 6단계 분리 + 롤백 전략 합리적
- GitHub Pages 함정 미리 짚은 것 좋음

## 조치 요약 (계획서 반영 필수)

1. 3장에 "참조 스타일 규칙" 소절 추가
2. Phase 0 "준비" 단계 추가
3. Phase 4에 사전 덤프/사후 키 비교 + 런타임 중복 감지
4. Phase 4에 this 바인딩 감사 단계 추가
5. Phase 6 범위 확정 (인라인 HTML onclick만)
6. Phase 6에 `e.preventDefault()` 추가
7. Phase 6 시간 5~7h로 상향
8. 회귀 테스트 18~20개로 확장
9. 동생 리뷰에 "로컬 풀 + 직접 플레이" 의무화
10. `99_bootstrap.js`에 sanity check
11. Phase 1에 CSS 중복 selector 감사
12. 총 시간 20~30h로 상향
