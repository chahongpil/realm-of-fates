# Section 02: CSS 분리 (Phase 1)

> 참고: `claude-plan.md` "Phase 1: CSS 분리"
> 테스트: `claude-plan-tdd.md` "Phase 1: CSS 분리"

## 목표

`index.html` 의 `<style>` 블록 580줄을 9개 CSS 파일로 분리. 시각적 결과 100% 동일 유지.

## 작업 목록

1. `css/` 디렉토리에 9개 파일 생성:
   - `00_reset.css`, `10_tokens.css`, `20_layout.css`, `30_components.css`
   - `40_battle.css`, `41_formation.css`, `42_screens.css`
   - `80_animations.css`, `90_utilities.css`
2. `<style>` 블록 내용을 기능별로 분류하여 9개 파일에 배치
3. `index.html` 에서 `<style>` 블록 제거, `<link rel="stylesheet">` 9개로 교체
4. 중복 selector 감사:
   ```bash
   grep -oP '^\.[a-zA-Z_-]+' css/*.css | sort | uniq -d
   ```
5. 시각적 회귀 테스트 (스크린샷 비교)
6. 커밋: `[Refactor Phase 1/6] CSS 파일 9개로 분리`

## 각 파일의 담당 범위

- **00_reset.css**: `*{margin:0;...}` 리셋
- **10_tokens.css**: CSS 변수 (`:root { --gold: #ffd700; ... }`) - 새로 작성
- **20_layout.css**: `.screen`, `.screen.active` 기본 레이아웃
- **30_components.css**: `.btn`, `.btn-*`, `.card`, `.card.*`, `.auth-box`, `.modal-*`, `.deck-mini`
- **40_battle.css**: 전투 관련 (206~322줄 원본)
- **41_formation.css**: 편성 화면
- **42_screens.css**: `#title-screen`, `#login-screen`, `#menu-screen`, 각 화면별
- **80_animations.css**: 모든 `@keyframes` (titleGlow, titleFire, slashAnim 등)
- **90_utilities.css**: `.hidden` 등 (필요 시)

## 절대 규칙

- `@import` 사용 금지
- `!important` 신규 추가 금지
- 한 selector는 한 파일에서만 정의
- 링크 순서 = cascade 순서 유지

## 완료 조건

- `css/` 에 9개 파일
- `index.html` 의 `<style>` 블록 제거됨
- `<link>` 9개 추가됨
- 시각적 회귀 0 (스크린샷 동일)
- Phase 1 테스트 스텁 전부 PASS

## 리스크

**최저**. CSS 는 기능 없음. 실패해도 게임 로직은 작동.
