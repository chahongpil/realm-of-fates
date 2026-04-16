# Realm of Fates — 노하우 INDEX

> 반복 작업의 패턴·원칙·스킬·메모리 한곳 모음. 새 세션에서 제(AI)가 먼저 읽고 작업 방식 확인.
>
> 🏛️ **하네스 4기둥**(MD규칙/CI게이트/도구경계/피드백루프) 은 [.claude/rules/00-index.md](../.claude/rules/00-index.md) 에 정의됨.

## 🧭 언제 이 문서를 읽어야 하나

- 세션 시작 시 session_start 훅이 design/current-focus.md + HANDOFF.md 를 자동 로드하므로 일반적으로 이 INDEX 는 안 읽어도 됨
- **단**, 반복 작업 요청("X 만들어줘" / "Y 분해해줘")이 들어왔을 때 여기서 해당 패턴의 스킬/메모리를 찾아 참고
- 실수 발생 후 "이거 다음부턴 이렇게 하자" 같은 지시를 받으면 여기에 추가

## 🛠️ 자동화된 반복 작업 (스킬)

| 작업 | 스킬 | 트리거 | 설명 |
|---|---|---|---|
| 편집기 열기 + 서버 기동 | `/편집기열기` | "편집기 열어", "서버 켜" | 포트 8765 서버 확인·기동, 브라우저 자동 열기 |
| 박스 래퍼 개별 편집 분해 | `/래퍼분해` | "박스 분해", "묶음 풀어" | 19화면 전체 스캔 → 타입 분류(A/B/C) → CSS 변수·규칙·편집기 config 3방향 수정 → 시각 검증 |
| 편집기 지시 반영 | `/지시반영` | "지시반영", "숨김반영", "텍스트반영" | annotations/hidden/text_overrides JSON 3종 → 정식 코드 |
| 캐릭터 추가 | `/캐릭터추가` | "탱커 만들어줘" | balance.md 규칙 → js/11_data_units.js |
| 스킬 추가 | `/스킬추가` | "새 스킬" | js/12_data_skills.js |
| 유물 추가 | `/유물추가` | "유물 만들어줘" | js/13_data_relics.js |
| 밸런스 전수 감사 | `/밸런스검증` | "밸런스체크", "OP 찾아줘" | design/balance.md 규칙 비교 |
| 회귀 체크 | `/회귀테스트` | "검증", "테스트" | Node vm + 데이터 정합성 |
| 세션 종료 | `/핸드오프` | "핸드오프", "저장하고 정리" | HANDOFF.md + 클립보드 복사 |
| 기획 결정 변경 | `/기획변경` | "수익모델 바꿔" | design/ 업데이트 + 영향 분석 |

## 📘 피드백 메모리 (하지 말아야 할 것 / 항상 해야 할 것)

| 메모리 | 요약 |
|---|---|
| `feedback_plan_only.md` | index.html 직접 수정 금지. 훅이 블록함. CSS/JS 우회 또는 런타임 오버라이드 사용. 예외는 명시 승인. |
| `feedback_naming.md` | UI 텍스트는 판타지 몰입형 한국어. "로그인" → "모험 이어하기", "회원가입" → "새로운 운명". |
| `feedback_css_wrapper_split.md` | 래퍼 분해 시 DOM parent chain 확인. 중첩 래퍼면 중간 div 를 `position:static !important` 로 플랫. 정적 검사로는 시각 회귀 못 잡음 → 실제 브라우저 확인 필수. |
| `feedback_verify_before_claim.md` | "이건 X 라서 편집 불가" 같은 부정 단정 전에 Grep/Read 로 확인. 추측으로 단정하느니 "확인 중" 이 낫다. |
| `feedback_wrapper_split_sweep.md` | 사용자가 한 화면 박스 문제 지적하면 19화면 전체 스캔해서 같은 패턴 일괄 제안. 개별 지시 기다리지 말 것. |
| `project_card_game.md` | c:/work/game/ 이 리팩토링 정본. 핸드오프는 HANDOFF.md. |
| `project_unity_migration.md` | Unity 전환 취소. 웹 기반(index.html) 유지. |

## 🏗️ 편집기 아키텍처 개요

### 1. 서버 (tools/coord_editor_server.js, 포트 8765)
- 정적 파일 서빙 (game/ 루트)
- 저장 엔드포인트:
  - `/save-coords` → `css/11_frame_coords.json`
  - `/save-layout-vars` → `css/10_tokens.css` LAYOUT_VARS 블록 교체
  - `/save-town-layout` → `js/51_game_town.js` 건물 x/y/w/h 교체
  - `/save-text-overrides` → `css/text_overrides.json`
  - `/save-hidden` → `css/hidden_elements.json`
  - `/save-annotations` → `css/annotations.json`
- 로드 엔드포인트: 위 파일 각각 `/load-*`

### 2. 편집기 (tools/screen_editor_zones.html)
- 19개 화면 통합 zone 편집기
- `SCREENS` config: 화면별 zones 배열 + defaults
- zone 속성: `key / label / preview / selector / parentSelector?`
- `parentSelector` 있으면 부모 rect 측정 → 자식은 상대좌표로 저장
- 6회 재시도 로직: iframe 로드 타이밍 이슈 대응

### 3. 플로우 편집기 (tools/screen_flow_editor.html)
- index.html 을 런타임 파싱 → 화면 노드 + data-action 엣지
- 좌측: BFS 스패닝 트리 (순환은 ↩︎ 리프)
- 우측: 그래프 (드래그/줌/팬)
- 노드 더블클릭 → zone 편집기 새 탭

### 4. 런타임 오버라이드 (js/99_bootstrap.js 하단)
- `textOverridesBoot` → `text_overrides.json` 적용
- `hiddenElementsBoot` → `hidden_elements.json` 으로 동적 `<style>` 주입
- `runtimeTagBoot` → 특정 요소(LEAGUE OF THE GODS)에 클래스 자동 부여
- UI.show 몽키패치로 화면 전환 후 재적용

### 5. 기록 파일 3종 (편집기 ↔ AI 핸드오프)
- **annotations.json** (배열): 사용자가 편집기에서 그린 "여기 뭐 넣어줘" 지시 박스
- **hidden_elements.json** (배열): 🗑️ 숨김 토글한 셀렉터 → 나중에 물리 삭제
- **text_overrides.json** (객체): 텍스트 덮어쓰기 → 런타임 적용 중, 정식 반영 필요
- 세션 시작 훅이 이 3개를 자동 파싱해서 대기 항목 알림

## 🔁 래퍼 분해 타입 요약 (빠른 참조)

| 타입 | 특징 | 예시 | 방식 |
|---|---|---|---|
| **A** | 투명 버튼 그룹 (시각 프레임 없음, 직계 자식) | `.title-buttons`, tavern `gap:8px wrapper`, `.tb-bottom` | 래퍼 `full-container pointer-events:none`, 자식 `position:absolute pointer-events:auto` |
| **B** | 시각 프레임 (배경/테두리 있음) | `.auth-box` | 래퍼 `position:absolute` 자체도 zone, 자식은 parentSelector 로 상대좌표 |
| **C** | 중첩 래퍼 (중간 `position:relative` div 가 끼어있음) | title `#title-screen > <div z-index:2> > .title-buttons` | 중간 div `position:static !important` 로 플랫 + Type A |

## 📂 주요 경로

| 경로 | 용도 |
|---|---|
| `c:/work/game/` | 게임 정본 (git 저장소) |
| `c:/work/game/index.html` | 수정 금지 (훅 블록) |
| `c:/work/game/css/10_tokens.css` | 디자인 토큰 + LAYOUT_VARS (편집기가 씀) |
| `c:/work/game/css/42_screens.css` | 화면별 레이아웃 규칙 |
| `c:/work/game/css/35_banners.css` | 배너 레이어 (10_tokens.css @import 체인) |
| `c:/work/game/js/99_bootstrap.js` | 초기화 + 런타임 오버라이드 |
| `c:/work/game/tools/` | 편집기 스위트 |
| `c:/work/design/` | 기획서 (레포 바깥, AI 만 사용) |
| `c:/work/design/HANDOFF.md` 와 `game/HANDOFF.md` | 게임 쪽이 정본, c:/work/design 은 Sleep Expo 용으로 별도 |
| `c:/work/.claude/skills/` | 스킬 정의 |
| `c:/work/.claude/hooks/` | session_start, block_index_html, run_game_tests |
| `C:/Users/USER/.claude/projects/c--work/memory/` | 자동 메모리 (auto memory) |

## ⚙️ 노하우 업그레이드 원칙

**언제 스킬로 만드나?**
- 같은 작업을 **3번 이상** 수동으로 했을 때
- 한 작업이 여러 파일(css/js/편집기 config)을 순서대로 수정해야 할 때
- 실수 가능성이 있어서 체크리스트가 필요할 때

**언제 메모리로 저장하나?**
- 사용자가 "이거 다음부턴 이렇게 해" 라고 명시한 룰
- 내가 실수해서 사용자가 지적한 패턴
- 과거 버그 재발 방지 원칙

**언제 훅으로 자동화하나?**
- 세션 시작·종료처럼 트리거가 명확한 이벤트
- 파일 수정 금지 같은 강제 규칙
- 사용자가 까먹어도 자동으로 보여줘야 하는 상태 체크

**언제 INDEX(이 문서)를 업데이트하나?**
- 새 스킬/메모리/훅을 추가했을 때
- 편집기 아키텍처 변경 (새 엔드포인트, 새 런타임 오버라이드 등)
- 주요 경로 변경

---

**마지막 업데이트**: 2026-04-13 심야 — Figma 핸드오프 파이프라인 + 하네스 업그레이드 (3 스킬 / 훅 확장 / 메모리 3건)
