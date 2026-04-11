# Realm of Fates 리팩토링 — 수동 회귀 테스트 TDD 계획

> 작성일: 2026-04-11
> 본 문서는 자동화 테스트가 아닌 **수동 회귀 테스트 기반 TDD** 를 정의한다.
> 리팩토링 원칙상 빌드 도구 + 자동화 테스트 프레임워크 도입이 금지되어 있으므로, 각 Phase 후 수행할 **명확한 수동 검증 시나리오** 를 "테스트 스텁" 형태로 정리한다.

## TDD 접근 방식

**원칙**: 각 Phase 시작 전에 "통과해야 할 조건"을 명확히 정의하고, 작업 완료 후 그 조건을 만족하는지 검증한다. 자동화는 없지만 "기대 결과"가 명시되어 있으면 TDD 의 정신(Test First) 을 유지한다.

**실행 방식**:
1. Phase 시작 전: 해당 Phase 의 테스트 시나리오를 읽고 통과 조건을 숙지
2. Phase 작업 수행
3. Phase 완료 후: 테스트 시나리오를 순차 실행하여 통과 여부 기록
4. 하나라도 실패 시: 커밋 금지, 원인 분석 후 재작업

## 테스트 환경

- **브라우저**: Chrome 또는 Edge (최신)
- **로컬 서버**: `python -m http.server 8000` (프로젝트 루트에서 실행)
- **접속**: `http://localhost:8000`
- **개발자 도구**: F12 열어두고 콘솔 에러 모니터링

## 공통 검증 (모든 Phase 공통)

### 기본 체크
- [ ] 브라우저 콘솔에 에러 0개
- [ ] 브라우저 콘솔에 경고 0개 (또는 허용된 경고만)
- [ ] 페이지 로드 시 `[RoF] 모든 모듈 로드 완료` 메시지 (Phase 5 이후)
- [ ] 타이틀 화면이 정상 표시됨
- [ ] 배경 이미지, 폰트 정상 로드

---

## Phase 0: 사전 준비

### 기대 결과
- `backup/pre-refactor` 브랜치 원격에 푸시됨
- `refactor/structure-split` 브랜치 로컬에 생성됨
- `css/`, `js/`, `docs/` 디렉토리 생성됨
- `.nojekyll` 파일 루트에 존재
- `docs/game_manifest.md` 에 Game 메서드 목록 있음
- `docs/reference_baseline.md` 에 참조 횟수 베이스라인 있음
- `docs/onclick_inline.txt`, `docs/onclick_dynamic.txt` 목록 있음
- `docs/this_audit.txt` 감사 결과 있음
- `git config core.ignorecase false` 설정됨

### 검증 명령
```bash
git branch -a | grep backup/pre-refactor
git branch | grep refactor/structure-split
ls -la .nojekyll css/ js/ docs/
cat docs/game_manifest.md | head -5
git config --get core.ignorecase
```

**Pass 조건**: 모든 파일/브랜치/설정 존재.

---

## Phase 1: CSS 분리

### 테스트 스텁

**Test 1.1**: 모든 `<link rel="stylesheet">` 가 정상 로드
- 방법: 브라우저 Network 탭에서 9개 CSS 파일 모두 200 응답 확인
- Fail 조건: 하나라도 404

**Test 1.2**: 타이틀 화면 시각적 동일성
- 방법: 리팩토링 전 스크린샷과 후 스크린샷 비교
- Fail 조건: 배경, 폰트, 색상, 버튼 스타일이 다름

**Test 1.3**: 카드 렌더링 시각적 동일성
- 방법: 덱 보기 화면에서 카드들이 이전과 동일하게 표시
- Fail 조건: 등급별 테두리 색, 아이콘 배치, 통계 바 차이

**Test 1.4**: 애니메이션 재생
- 방법: 타이틀 화면 불꽃, 번개, 글자 글로우 정상 작동
- Fail 조건: 애니메이션 누락 또는 타이밍 변화

**Test 1.5**: 모달 표시
- 방법: 카드 상세 모달 열기 → 닫기
- Fail 조건: 모달 위치/크기/배경 이상

**Test 1.6**: 전체 해피 패스 체크리스트 (13개)
- 1~13번 모두 통과

**Test 1.7**: CSS 중복 selector 감사
```bash
grep -oP '^\.[a-zA-Z_-]+' css/*.css | sort | uniq -d
```
- Fail 조건: 중복 결과 출력됨 (단, 의도된 override는 허용)

---

## Phase 2: 데이터 파일 분리

### 테스트 스텁

**Test 2.1**: 글로벌 네임스페이스 존재
- 콘솔에서: `typeof RoF` → `"object"`
- Fail 조건: `undefined`

**Test 2.2**: 데이터 접근 가능
- 콘솔에서: `RoF.Data.UNITS.length` → 0 초과 숫자
- 콘솔에서: `RoF.Data.SKILLS.length` → 0 초과
- 콘솔에서: `RoF.Data.RELICS.length` → 0 초과
- 콘솔에서: `RoF.Data.CARD_IMG` → 객체
- Fail 조건: undefined 또는 빈 배열

**Test 2.3**: 호환성 레이어 작동
- 콘솔에서: `UNITS === RoF.Data.UNITS` → `true`
- 콘솔에서: `SKILLS_DB === RoF.Data.SKILLS` → `true`
- Fail 조건: `false` 또는 `ReferenceError`

**Test 2.4**: 참조 누락 확인
```bash
# Phase 0 의 reference_baseline.md 수치와 현재 index.html 내부의 참조 수가 일치하는지
grep -c "UNITS" index.html
grep -c "SFX\." index.html
```
- Fail 조건: 베이스라인과 크게 다름 (정상적 감소는 허용, 에러 발생은 금지)

**Test 2.5**: 게임 시작 가능
- 로그인 → 마을 진입 → 타이틀 화면의 버튼 모두 작동
- Fail 조건: 어느 단계에서든 콘솔 에러 발생

**Test 2.6**: 전체 해피 패스 체크리스트 (13개)

---

## Phase 3: SFX, UI, Auth 분리

### 테스트 스텁

**Test 3.1**: 모듈 존재
- `typeof RoF.SFX` → `"object"`
- `typeof RoF.UI` → `"object"`
- `typeof RoF.Auth` → `"object"`
- `typeof RoF.helpers` → `"object"`
- `typeof RoF.dom` → `"object"`

**Test 3.2**: 호환성 레이어
- `window.SFX === RoF.SFX` → `true`
- `window.UI === RoF.UI` → `true`
- `window.Auth === RoF.Auth` → `true`

**Test 3.3**: SFX 초기화 타이밍
- 페이지 로드 직후: `RoF.SFX.ctx === null` (아직 초기화 안 됨)
- 첫 클릭 후: `RoF.SFX.ctx` → `AudioContext` 인스턴스
- Fail 조건: 페이지 로드 시 즉시 AudioContext 생성 (사용자 제스처 전)

**Test 3.4**: 사운드 재생
- 버튼 클릭 시 click 효과음 재생
- 전투 시작 시 battle BGM 재생
- Fail 조건: 무음

**Test 3.5**: 로그인/회원가입
- 기존 계정 로그인 → 마을 진입
- 새 계정 회원가입 → 프롤로그 → 캐릭터 선택 → 마을
- Fail 조건: 어느 단계에서든 실패

**Test 3.6**: 화면 전환
- UI.show() 로 각 화면 전환 (타이틀 → 로그인 → 마을 등)
- Fail 조건: 특정 화면에서 전환 실패

**Test 3.7**: 전체 해피 패스 체크리스트 (13개)

---

## Phase 4: Game 7개 파일 분할

### 테스트 스텁

**Test 4.1**: Game 메서드 개수 일치
- 콘솔에서: `Object.keys(RoF.Game).sort()` 결과를
- Phase 0 의 `docs/game_manifest.md` 와 비교
- Fail 조건: 메서드 누락 또는 추가

**Test 4.2**: 중복 키 감지 없음
- 콘솔 확인: `[Game] 중복 키 감지:` 메시지 없음
- 있으면: 어느 파일에 중복 정의되었는지 파악 후 제거

**Test 4.3**: Game 객체 속성 접근
- `RoF.Game.round` → 숫자
- `RoF.Game.hp` → 숫자
- `RoF.Game.deck` → 배열
- `RoF.Game.gold` → 숫자
- Fail 조건: undefined

**Test 4.4**: 마을 기능
- 마을 건물 모두 클릭 가능
- 술집, 교회, 성, 대장간 진입 가능
- 각 화면의 뒤로가기 작동

**Test 4.5**: 술집 영입
- 술집에서 카드 영입 → 덱에 추가
- 덱 용량 초과 시 경고

**Test 4.6**: 덱 보기 + 카드 상세
- 덱 목록 정상 표시
- 카드 클릭 → 상세 모달
- 스탯 분배 가능

**Test 4.7**: 전투 흐름
- 매칭 → 편성 → 전투 → 결과 전체 흐름
- 중간에 에러 없음

**Test 4.8**: 전체 해피 패스 + 엣지 케이스 (20개)

**Test 4.9**: 사후 키 비교
- Phase 4 완료 후:
```javascript
const current = Object.keys(RoF.Game).sort();
const manifest = /* docs/game_manifest.md 내용 */;
const missing = manifest.filter(k => !current.includes(k));
const added = current.filter(k => !manifest.includes(k));
console.log('누락:', missing, '추가:', added);
```
- Fail 조건: missing 이 비어있지 않음

---

## Phase 5: TurnBattle, Formation, FX 분리

### 테스트 스텁

**Test 5.1**: 모듈 존재
- `typeof RoF.TurnBattle` → `"object"`
- `typeof RoF.Formation` → `"object"`
- `typeof RoF.FX` → `"object"`
- `typeof RoF.DefeatFX` → `"object"`

**Test 5.2**: 전투 엔진 작동
- 매칭 → 편성 → 전투 시작
- 카드 타겟팅 → 공격 실행 → 데미지 계산
- Fail 조건: 전투가 진행되지 않음

**Test 5.3**: 이펙트 재생
- 공격 시 슬래시 이펙트
- 마법 사용 시 magic 이펙트
- 크리티컬 시 화면 흔들림
- Fail 조건: 이펙트 누락

**Test 5.4**: Formation 작동
- 편성 화면에서 슬롯 배치, 벤치 카드 교체
- 자동 배치, 확인 버튼 작동

**Test 5.5**: 타이틀 파티클
- 타이틀 화면에서 불꽃 + 번개 파티클 재생
- Canvas 정상 작동

**Test 5.6**: 패배 파티클
- 전투 패배 유도 → 게임오버 화면
- (defeat-animation 브랜치가 머지 안 된 상태면 기본 게임오버)

**Test 5.7**: bootstrap sanity check
- 페이지 로드 시 콘솔에 `[RoF] 모든 모듈 로드 완료` 메시지
- Fail 조건: `[RoF] 로드 누락:` 메시지 출력

**Test 5.8**: 전체 해피 패스 + 엣지 케이스 (20개)

---

## Phase 6: onclick → data-action 마이그레이션

### 테스트 스텁

**Test 6.1**: 인라인 onclick 0개
```bash
grep -c 'onclick=' index.html
```
- Pass 조건: 0 (또는 의도적으로 남긴 것만)

**Test 6.2**: data-action 속성 존재
```bash
grep -c 'data-action' index.html
```
- Pass 조건: 이전 onclick 개수와 유사한 개수

**Test 6.3**: 이벤트 위임 작동
- 타이틀 화면의 "왕좌로 돌아가기" 버튼 → 로그인 화면
- 로그인 버튼 → 로그인 시도
- 마을 건물 클릭 → 해당 화면
- Fail 조건: 버튼 클릭이 아무 동작도 하지 않음

**Test 6.4**: Enter 키 바인딩
- 로그인 화면에서 암호 입력 후 Enter → 로그인 실행
- 회원가입 화면에서 암호2 입력 후 Enter → 회원가입 실행
- **중요**: 페이지 새로고침 발생하지 않아야 함 (preventDefault 작동 확인)

**Test 6.5**: 볼륨 슬라이더 (input 이벤트)
- 사운드 패널 슬라이더 드래그 → 볼륨 조절

**Test 6.6**: 동적 onclick (JS 내부) 유지 확인
- 술집에서 카드 클릭 → 영입 동작 (동적 `el.onclick` 이 여전히 작동)
- 덱에서 카드 클릭 → 상세 모달 열기

**Test 6.7**: 전체 해피 패스 + 엣지 케이스 (20개)

**Test 6.8**: 모든 버튼 순회 테스트
- 게임 전체에서 클릭 가능한 모든 버튼을 한 번씩 눌러보기
- 작동 안 하는 버튼이 있으면 data-action 문자열 오타 가능성

---

## 최종 검증 (모든 Phase 완료 후)

### Test Final.1: 파일 개수
- `css/` 내 9개 파일
- `js/` 내 24개 파일
- `index.html` 200줄 이하

### Test Final.2: 파일 크기
- 모든 CSS 파일 200줄 이하
- 모든 JS 파일 500줄 이하

### Test Final.3: 전체 20개 체크리스트 PASS

### Test Final.4: 브라우저 콘솔 에러 0개

### Test Final.5: GitHub Pages 프리뷰 배포 테스트
- PR 생성 시 GitHub Actions 또는 수동 배포로 프리뷰 확인
- 프리뷰 URL에서 전체 체크리스트 재실행

### Test Final.6: 대소문자 이슈 검증
```bash
grep -oE 'src="[^"]+"' index.html
grep -oE 'href="[^"]+"' index.html
```
- 출력된 경로들이 실제 파일과 대소문자까지 일치하는지 확인

### Test Final.7: 팀원(동생) 검증
- 동생이 Claude Code 로 PR 리뷰
- 동생이 로컬 풀 + 직접 플레이 1회
- 동생의 명시적 승인 획득

---

## 실패 시 대응 매트릭스

| 실패 상황 | 대응 |
|----------|------|
| 콘솔 에러 발생 | 에러 메시지의 파일명:라인으로 이동 → 수정 → 재검증 |
| 버튼 작동 안 함 | data-action 오타 확인 → 98_bindings.js 의 MODULE_MAP 확인 |
| 특정 화면 깨짐 | 해당 Phase 커밋만 `git revert` → 원인 재분석 |
| 다수 Phase 실패 | `backup/pre-refactor` 브랜치로 복구 후 재시작 |
| 사운드 안 나옴 | `RoF.SFX.ctx` 상태 확인 → 사용자 제스처 훅 점검 |
| 게임 로드 실패 | `99_bootstrap.js` 의 sanity check 출력 확인 → 누락 모듈 추적 |

---

## 기록 양식

각 Phase 완료 후 다음 양식으로 결과 기록 (`docs/test_results_phaseN.md`):

```markdown
# Phase N 테스트 결과

**실행일**: 2026-04-XX
**커밋**: [hash]

## 통과
- [x] Test N.1
- [x] Test N.2
...

## 실패 / 이슈
- [ ] Test N.X: [실패 이유]

## 조치
- [해결 내용]

## 최종: PASS / FAIL
```
