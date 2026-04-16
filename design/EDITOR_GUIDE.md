# Realm of Fates — 편집기 사용 가이드

> 이 문서는 Zone 편집기 / 화면 플로우 편집기 / 코드 협업 워크플로우 전체 매뉴얼.
> 새 세션 시작 시 제(AI)가 먼저 읽고 사용자에게 요약해줘야 함.

## 편집기 허브
`http://localhost:8765/tools/screen_editor.html`

로컬 서버(`node tools/coord_editor_server.js`, 포트 8765) 를 먼저 실행해야 합니다.
서버가 죽어있으면 허브 타일을 눌러도 `fetch` 가 CORS 로 막혀 동작하지 않습니다.

서버 시작 명령:
```bash
cd c:/work/game && node tools/coord_editor_server.js
```

## 🗺️ 화면 플로우 편집기 (screen_flow_editor.html)

19개 화면 + 버튼 전환을 **그래프 + 트리 두 패널**로 보여줍니다.

**핵심 조작**
- 허브 → 맨 위 "🗺️ 화면 플로우 (전체 맵)" 타일
- 진입 시 `../index.html` 을 자동 파싱 → 노드·엣지 생성
- 노드 드래그로 이동, 휠로 줌, 빈 공간 드래그로 팬
- 노드 **클릭** → 선택 + 상세 패널
- 노드 **더블클릭** → 해당 화면의 zone 편집기 새 탭
- 좌측 📁 트리 패널: BFS 스패닝 트리. 순환 엣지는 `↩︎` 리프로 표시
- `💾 저장`: localStorage 에 노드 위치·설명 저장
- `📤 JSON 내보내기`: `screen_flow.json` 다운로드
- `🔄 index.html 파싱`: 재파싱 (기존 위치/설명 보존)

## 🎯 Zone 편집기 (screen_editor_zones.html)

각 화면의 요소 **영역과 크기**를 드래그로 편집합니다. 저장하면 `css/10_tokens.css` 의 LAYOUT_VARS 블록이 업데이트됩니다.

**좌표 체계**
- 베이스 스테이지 = 1280 × 720 (16:9 HD)
- 모든 zone 은 스테이지 절대좌표로 저장 (일부 자식 zone 은 부모 상대좌표)
- 창 크기에 따라 편집기가 `transform:scale()` 로 축소 표시

**기본 조작**
- **드래그** → zone 이동
- **우하단 흰 핸들** → 리사이즈
- **Shift** → 스냅 해제
- **화면 선택** (툴바 드롭다운): 19개 화면 전환
- `💾 저장` → `css/10_tokens.css` 변수 갱신
- `↩ 초기값` → 해당 zone 의 defaults 로 복원
- `🔄 iframe 재로드` → 실제 게임 미리보기 다시 불러옴
- `🎯 실제 DOM 에 맞춤` → iframe 안 실제 요소 rect 를 측정해서 zone 들을 맞춤

**레이어**
1. iframe 라이브 프리뷰 (z-index 1, pointer-events:none)
2. 어두운 오버레이 (dim toggle 로 끄기 가능, z-index 2)
3. 노란 zone 박스 (z-index 100)
4. 파란 annotation 박스 (z-index 150)
5. 빨간 draft 박스 (z-index 160)

## 📝 텍스트 편집 패널

stage 아래에 각 zone 의 `textContent` 를 편집할 수 있는 행이 나옵니다.

**동작 방식**
- 입력값은 `css/text_overrides.json` 에 `{ "셀렉터": "새 텍스트" }` 로 저장
- 게임 실행 시 런타임에 [js/99_bootstrap.js](../game/js/99_bootstrap.js) 의 `textOverridesBoot` 가 적용
- **index.html 을 수정하지 않음** → 복구·버전관리 쉬움
- `UI.show` 가 몽키패치되어 있어 화면 전환 후에도 재적용

**상태 라벨**
- `원본` — 오버라이드 없음, index.html 그대로
- `★수정됨` — 현재 편집 중(미저장)
- `★덮어씀` — 저장된 오버라이드 적용 중

**저장**
- 💾 텍스트 저장 → `/save-text-overrides` 엔드포인트 POST
- 빈 칸으로 두면 해당 override 가 자동 제거됨

## 🗑️ 숨김 토글

각 행 우측의 `🗑️ 숨김` 버튼을 누르면 해당 요소를 런타임 `display:none` 처리.

- 저장 파일: `css/hidden_elements.json` (셀렉터 배열)
- 런타임: [js/99_bootstrap.js](../game/js/99_bootstrap.js) 의 `hiddenElementsBoot` 가 동적 `<style>` 주입
- **복구 가능**: 같은 버튼이 `↩︎ 복구` 로 변함
- 상단에 "N개 요소 숨김 중" 요약 표시 → **다음 세션에 제가 물리 삭제할 대상 목록**
- 화면에서는 숨겨져 보이지만 DOM 에는 존재 → 정식 제거는 AI 가 진행

## ➕ 지시 추가 모드 (Phase 1 Annotation)

툴바 `➕ 지시 추가` 버튼 → 스테이지에 네모 그리고 한국어로 지시 입력.

**사용법**
1. `➕ 지시 추가` 클릭 → 커서가 십자로, zone 이 잠시 클릭 안 됨
2. 원하는 영역을 **드래그**해서 네모 그리기
3. 릴리즈 시 모달 → 지시 내용 입력 (예: "여기에 hud_bar 배너 넣고 높이 44px, 클릭 시 메뉴로")
4. 저장 → 파란 점선 박스 + `📝 지시 #N` 라벨로 고정
5. 지시 모드 자동 해제

**후속 조작**
- 드래그 → 박스 이동
- 우하단 파란 핸들 → 리사이즈
- **더블클릭** → 텍스트 재편집
- ×  빨간 버튼 → 삭제
- `ESC` → 모드/모달 취소

**AI 연동**
- 저장 파일: `css/annotations.json`
- 각 항목: `{id, screen, x, y, w, h, text, createdAt}`
- **다음 세션 시 AI 가 이 파일을 읽고 모든 항목을 해당 화면의 해당 영역에 반영**
- 반영 완료된 항목은 AI 가 JSON 에서 제거 (또는 `done: true` 플래그)

## ❓ 사용법 패널 (편집기 내장)

편집기 상단에 접이식 `❓ 사용법` 패널이 있습니다. 첫 방문 시 자동 펼침, 이후 접힘 상태 localStorage 저장.

## 🧩 부모-자식 Zone (parentSelector)

일부 zone 은 **부모 요소 상대좌표**로 저장됩니다. 예: login 화면의 `.auth-box` 안 요소들.

- 각 자식 zone 의 coords 는 부모 요소 rect 기준 offset
- 편집기는 iframe 에서 부모 rect 를 실시간 측정해서 스테이지 위 올바른 위치에 렌더
- 드래그·리사이즈는 스테이지 좌표로 보이지만 저장 시 자동으로 부모 offset 을 뺌
- CSS 선언: `position:absolute; left:var(--li-h2-x);` (부모는 `position:relative`)

## 📦 주요 저장 파일

| 파일 | 목적 | 런타임 적용 |
|---|---|---|
| `css/10_tokens.css` (LAYOUT_VARS) | zone 위치/크기 CSS 변수 | 즉시 (새로고침) |
| `css/text_overrides.json` | 텍스트 덮어쓰기 | js/99_bootstrap |
| `css/hidden_elements.json` | display:none 처리 | js/99_bootstrap |
| `css/annotations.json` | 디자인 지시 박스 | AI 가 다음 세션에 반영 |
| `js/51_game_town.js` | 건물 배치 | 편집기 전용 (coord_editor_server 직접 수정) |
| `css/11_frame_coords.json` | 카드 프레임 좌표 | json_to_frame_css.js 가 CSS 생성 |

## 🔄 워크플로우 템플릿

**"여기 배너 넣어줘" 지시 주기**
1. 해당 화면 zone 편집기 열기
2. `➕ 지시 추가` → 원하는 위치에 네모 그리기
3. 지시 텍스트: "hud_bar 배너를 여기 배치. 높이 44px. 클릭 시 메뉴 토글."
4. 저장 → `annotations.json` 기록
5. 다음 대화 때 "지시 반영해줘" → AI 가 annotations 읽고 CSS/HTML 수정

**"이 텍스트 바꿔줘"**
1. zone 편집기 해당 화면
2. stage 아래 텍스트 패널에서 해당 행 수정
3. 💾 텍스트 저장
4. 게임 Ctrl+F5 로 즉시 확인

**"이 요소 빼줘"**
1. zone 편집기
2. 해당 행 우측 `🗑️ 숨김` 클릭
3. 게임에서 사라짐 (숨김만, DOM 엔 남아있음)
4. 확신 서면 다음 세션에 "hidden_elements 반영해줘" → AI 가 물리 삭제

**"이 영역 좀 옮겨줘"**
1. zone 편집기
2. 직접 드래그
3. 💾 저장 → CSS 변수 갱신

## 🚨 함정 & 해결법

**"편집기가 404 뜬다"**
→ 서버 안 켰음. `cd c:/work/game && node tools/coord_editor_server.js`

**"iframe 이 빈 화면"**
→ autonav 파라미터 실패. `🔄 iframe 재로드` 버튼. 안 되면 서버 로그 확인.

**"zone 좌표가 실제 요소랑 안 맞음"**
→ `🎯 실제 DOM 에 맞춤` 버튼. iframe 안 요소 rect 를 측정해 zone 좌표를 덮어씀.

**"저장해도 게임이 그대로"**
→ 하드 새로고침(Ctrl+F5). CSS 캐싱 가능성.

**"버튼 그룹이 한 zone 으로 묶였는데 개별 편집 원함"**
→ DOM 구조 확인 후 래퍼 분해 패턴 적용 (cardselect 의 cs-btn-* 참고). 중첩 래퍼면 중간 div 를 `position:static !important` 로 플랫. 자세한 건 `~/.claude/.../feedback_css_wrapper_split.md` 참고.
