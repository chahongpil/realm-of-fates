# 화면 플로우 (Screen Flow)

> 자동 생성 원본: `game/index.html` 의 `id="*-screen"` + `data-action` 파싱.
> 편집기: `game/tools/screen_flow_editor.html` (더블클릭 → zone 편집기로 점프).

## 편집 워크플로우

1. `game/tools/screen_editor.html` 허브 → **🗺️ 화면 플로우 (전체 맵)** 진입
2. 편집기 열릴 때 자동으로 `../index.html` 을 fetch → 화면·버튼 파싱
3. 노드 드래그로 배치 + 제목/설명 사이드패널 편집
4. **💾 저장** → `localStorage` 저장 (다음 방문 시 자동 로드)
5. **📤 JSON 내보내기** → `screen_flow.json` 다운로드 (여기 design/ 에 복사해서 커밋)
6. 노드 **더블클릭** → 해당 화면의 zone 편집기 새 탭
7. index.html 수정 후에는 **🔄 index.html 파싱** 으로 동기화 (기존 위치·제목·설명은 유지됨)

## 파싱 규칙

- **노드**: `[id$="-screen"]` 패턴의 모든 `<div>` (현재 19개)
- **엣지**:
  1. `data-action="ui.show" data-arg="X"` → 화면 X 로 직접 전환
  2. `data-action="게임 함수"` → `ACTION_TO_SCREEN` 휴리스틱 맵 (예: `game.showMenu` → `menu-screen`)
- 라벨: 버튼의 `textContent` 앞 24자
- 셀프루프(같은 화면 내 전환)는 제외

## 현재 19개 화면 목록

| ID | 한국어 | 역할 |
|---|---|---|
| title-screen | 타이틀 | 진입점 |
| login-screen | 로그인 | |
| signup-screen | 회원가입 | |
| prologue-screen | 프롤로그 | 스토리 |
| char-select-screen | 영웅 선택 | 3카드 선택 |
| menu-screen | 메인 허브 | 마을 맵 |
| tavern-screen | 선술집 | 용병/영웅 모집 |
| upgrade-screen | 단련소(구) | deprecated? |
| deckview-screen | 전력 열람 | 덱/코덱스 |
| castle-screen | 성채 | 단련 + 퀘스트 |
| church-screen | 신전 | 치유/장례 |
| match-screen | 매치메이킹 | |
| cardselect-screen | 카드 선택 | 출정 편성 |
| formation-screen | 진형 배치 | 5슬롯 |
| battle-screen | 전투 | |
| choice-screen | 라운드 선택 | |
| pick-screen | 동료 뽑기 | |
| reward-screen | 보상 | |
| gameover-screen | 게임오버 | 종착점 |

## 휴리스틱 맵 유지관리

`screen_flow_editor.html` 상단 `ACTION_TO_SCREEN` 상수:

- **규칙**: `ui.show` 가 아닌 JS 함수 호출 버튼은 여기 등록해야 엣지로 그려짐
- 새 `data-action` 을 index.html 에 추가했으면 여기에도 목적지 screen id 를 넣을 것
- 맵에 없는 action 은 "전환 없음"으로 취급되어 그래프에 나타나지 않음 (의도: 모달/토스트/내부 갱신은 제외)
