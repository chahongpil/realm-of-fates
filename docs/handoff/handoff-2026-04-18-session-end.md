# 🔄 Realm of Fates — 세션 핸드오프 (2026-04-18)

> **이 문서를 새 세션에 붙여넣으면 Claude Code 가 맥락을 복구하고 바로 이어갑니다.**
> /clear → Ctrl+V 하세요.

생성: 2026-04-18 세션 종료
이유: 수동 저장 (대표님 "핸드오프 저장하자" 지시)
이전 핸드오프: `handoff-2026-04-16-session-end.md`

---

## 🎯 핵심 (한 줄 요약)
**방패(tank) 프레임 9장 완전 배선** + **액티브 스킬 8장 엔진 연결 인프라** + **메모리 규칙 7개 신설** — 시각적 결정체 + 내부 루프 강화.

## 📍 현재 상태
- **Phase**: Phase 3 (시네마틱 전투) + Phase 2 콘텐츠
- **브랜치**: `master`
- **마지막 커밋**: `99d0edd` chore: supabase 마이그레이션 파일을 game repo로 통합
- **미커밋 변경**: 10 수정 + 11 신규 (모두 이번 세션 산출물, **아직 커밋 안 됨**)

---

## ✅ 이번 세션에서 완료한 것

### 1. 🔐 Supabase 이메일 확인 OFF (대표님 직접)
- Supabase 대시보드 → Authentication → Sign In / Providers → Email → Confirm email 토글 OFF
- 가입 즉시 세션 활성화 플로우 검증 완료. 개발 속도 개선.

### 2. 🎨 방패(tank) 프레임 9장 완전 배선
- **고정 UI 규격 확정**: [design/frame-prompt-rules.md](../../design/frame-prompt-rules.md) 신규
  - 캔버스 1024×1536 확정 (대표님 원본 좌표 1240 기준과 1024 기준 두 가지 병기)
  - 4 슬롯 / 이름표 / HP·NRG 루비 좌표 Source of Truth
- **프롬프트 v2.1**: [game/PROMPT_RECIPES_FRAMES.txt](../../PROMPT_RECIPES_FRAMES.txt)
  - rof-ui-inspector 검수관 리포트 반영 — 14영역 중 7슬롯 고정 키워드
  - LUCK 4번째 노랑 슬롯 신규 추가 (기존 7장 프레임은 3슬롯뿐이었음)
  - 대표님 성공 프롬프트 예시(섹션 헤더 방식) #1 에 저장
- **9장 프레임 처리·저장** (`game/img/frame_*_tank.png`):
  - 평범/희귀/고귀/전설 (4종) — 모두 99%+ 투명 검증
  - 신-불/물/땅/전기/신성 (5종) — 모두 99%+ 검증
  - 재처리 파이프라인: `c:/tmp/process_v3.py` (원본 RGBA 유지 + 흰 영역 flood-fill)
- **CSS 배선**: [css/31_card_system.css](../../css/31_card_system.css)
  ```css
  .card-v2.bronze .cv-frame{...frame_bronze_tank.png}
  .card-v2.divine[data-element="fire"] .cv-frame{...frame_divine_fire_tank.png}
  /* 5원소 분기 + dark fallback */
  ```
- **JS 배선**: [js/40_cards.js](../../js/40_cards.js) — 카드 DOM 에 `data-role` / `data-element` 주입
  ```js
  const ROLE_MAP = { attack:'dps', defense:'tank', support:'support' };
  el.setAttribute('data-role', ROLE_MAP[unit.role] || '');
  if(unit.element) el.setAttribute('data-element', unit.element);
  ```
- **mockup 2개**:
  - `mockup/frame_check/` — 9장 붉은 배경 투명도 검증
  - `mockup/frame_wiring/` — 실제 CSS 적용 결과 (divine dark fallback 포함)

### 3. ⚔️ P1-2 액티브 스킬 8장 — 엔진 인프라 완성
- **데이터**: [js/12_data_skills.js](../../js/12_data_skills.js) — 평범 2 + 희귀 4 + 고귀 2 = 8장
  - 엔진 호환 스키마(`targetType/attackType/costType/tpCost/element`) 통일
- **전투 엔진 확장**: [js/60_turnbattle_v2.js](../../js/60_turnbattle_v2.js)
  - `EFFECT_CALCULATORS` 레지스트리 — heal/buff/debuff 계산
  - `applyHeal` / `applyStatMod` / `tickStatusEffects` 유틸 (HP cap + 스탯 가감 + 자동 해제)
  - `performAttack` 라우팅 — damage/heal/statmod 분기 + AoE 타겟 확장
  - `applyTargetDimByType` — `all_enemies` / `all_allies` 케이스 추가
  - `getSkillsOf` / `findSkillById` 브릿지 — 유닛 `skillIds` → SKILLS_DB 참조 (DEMO.skills 호환)
  - 라운드 종료 훅에 `tickStatusEffects()` 연결
- **회귀 테스트**: 7/7 통과 (`c:/tmp/test_active_skills.js`)

### 4. 🧠 메모리 규칙 7개 신설 (하네스 강화)
- `feedback_prompts_one_shot.md` — 프롬프트는 복붙 1회로 끝나야 함
- `feedback_large_code_ask_first.md` — 5파일↑/300줄↑ 변환은 시작 전 확인
- `feedback_ask_when_unclear.md` — 지시 애매하면 추론 말고 질문
- `feedback_code_modularization.md` — append 자제, 새 모듈로 분리
- `feedback_ui_mockup_first.md` — 새 UI 는 `mockup/{name}/v1~v3.html` 3안 → 선택 → 이식
- `project_frame_ui_spec.md` — 프레임 UI 규격 Source of Truth 포인터
- `MEMORY.md` 인덱스에 전부 추가

### 5. 📐 카드 레이아웃 정책 업데이트
- 캔버스 크기 1024×1536 유지 확정 (대표님 ChatGPT에서 받은 1240 기준을 환산표로 병기)
- 원소 문양은 프레임에 직접 새기지 않고 **별도 뱃지 레이어**로 합성 방침 확정
- divine 은 카드 1장마다 개별 제작 → 원소별 프레임 5장 생성은 예외적 수행

---

## 🔴 해결 안 된 것 / 막혀있는 것

### 1. 🌑 암흑(dark) 신 등급 프레임 미제작
- **상태**: 대표님이 내일(2026-04-19) 제작 예정
- **현재 fallback**: `.card-v2.divine[data-element="dark"]` 은 기존 `frame_divine.png` (구 스타일) 사용
- **해결 방향**: 다른 5원소와 같은 방식으로 제작 후 `방패프레임_투명3번째/암흑.png` 로 저장 → 제가 자동 처리

### 2. ⚔️ P1-2 액티브 스킬 "데모 연결" 미결정 (가장 시급)
- **상태**: 8장 스킬 데이터 + 엔진 로직 완비. **유닛이 사용하는 연결 고리만 빠짐**
- **대기 중 선택지**:
  - **(해석 1)** 데모 유닛 유지 + `DEMO.skills` 하드코딩 삭제 + 모든 유닛이 `skillIds` → SKILLS_DB 당겨 씀
  - **(해석 2)** 전투 데모 전체(유닛+스킬) 삭제 → 실제 덱/유닛 로드 시스템 구축될 때까지 전투 화면 비활성
- **대표님 발언**: "기존데모는 전투시스템에 최신으로 업데이트하고 데모는 삭제하자 당분간" (해석 1 가능성 높지만 확인 필요)
- **해결 방향**: 다음 세션 시작 시 대표님께 해석 확정 받고 진행

### 3. 🎨 DPS / Support 프레임 미제작
- **상태**: 모든 역할이 방패 프레임 사용 중 (대표님 지시 "일단 등급만 맞으면 적용")
- **향후**: DPS 12장 + Support 12장 = 24장 추가 제작 필요
- **현재는 이슈 아님** — tank 프레임을 모든 role 에 적용 중이라 시각상 일관성 유지

### 4. 📁 미커밋 파일 21개
- 이번 세션 산출물 전체 커밋 안 됨
- **해결 방향**: 다음 세션 첫 작업으로 커밋 (또는 대표님이 직접) — 프레임/스킬/메모리 구분해서 3-4 커밋으로 분할 권장

---

## ⏭️ 다음에 할 일 (우선순위 순)

### 🔴 P0 (즉시)
1. **암흑(dark) 프레임 처리** — 대표님이 파일 올리시면 자동 적용
2. **액티브 스킬 데모 연결** — "해석 1 or 해석 2" 확정 → 구현 30분
3. **이번 세션 산출물 커밋** — 21개 미커밋 파일 정리 (프레임 / 스킬 / 메모리 3분할)

### 🟡 P1 (이어서)
4. **실제 전투에서 새 프레임 육안 검수** — Playwright 전투 플로우 돌려서 카드 렌더 확인
5. **P0-3 카드 등급 색 CSS** — 프레임 완성됐으니 등급별 CSS 토큰·신 등급 샤인 애니 배선
6. **S2 고스트 PvP 테스트** — 이미 코드 커밋된 상태(5659814), 실제 동작 검증

### 🟢 P2 (중장기)
7. **DPS 프레임 12장** 제작
8. **Support 프레임 12장** 제작
9. **액티브 스킬 확장** — 원소 공명 로직 (같은 원소 연속 시 +30%) 추가
10. **프롬프트 12장 전체 갱신** — #1 평범×방패 대표님 스타일로 나머지 11장 재작성 (대표님 결정 대기)

---

## 📝 이번 세션의 주요 결정

| 시점 | 카테고리 | 결정 |
|---|---|---|
| 2026-04-18 | 작업 방식 | 프롬프트는 항상 완성형 단일 블록(복붙 1회). 공통 블록·치환 변수 금지 |
| 2026-04-18 | 작업 방식 | 5파일↑/300줄↑ 대규모 변환은 시작 전 사용자 확인 필수 |
| 2026-04-18 | 작업 방식 | 지시 애매하면 추론 금지, "A 인가요 B 인가요" 되묻기 |
| 2026-04-18 | 코드 구조 | 기존 파일 append 자제, 새 기능은 새 모듈(`js/NN_*.js`)로 분리 |
| 2026-04-18 | UI 워크플로 | 새 화면·대형 UI 는 `mockup/{name}/v1~v3.html` 3안 먼저, 선택 후 이식. 추후 Figma MCP 업그레이드 옵션 |
| 2026-04-18 | 디자인 | 카드 프레임 캔버스 1024×1536 확정 (대표님 원본 1240 좌표는 환산표로 병기) |
| 2026-04-18 | 디자인 | 원소 문양은 프레임 외부 뱃지 레이어 — 프레임에 직접 새기지 않음 |
| 2026-04-18 | 디자인 | divine 은 카드 1장마다 개별 제작 — 단, 원소별 프레임(불/물/땅/전기/신성) 은 예외적 제작 완료 |
| 2026-04-18 | 프레임 | 모든 role 이 일단 tank 프레임 사용 (DPS/Support 프레임 제작 전까지) |
| 2026-04-18 | 밸런스 | 액티브 스킬 8장 분포: 평범 2(불 화살, 치유의 빛) + 희귀 4(물·땅·전기·암흑) + 고귀 2(화염 폭발, 축복의 빛) |
| 2026-04-18 | 메커닉 | 원소 공명은 (A) 같은 원소 반복 +30% 방식 — 이번 세션엔 데이터 필드만 준비, 로직은 다음 라운드 |
| 2026-04-18 | 메커닉 | 버프/디버프 duration 은 라운드 종료 시 자동 카운트다운 → 0이면 스탯 원복 |

---

## 🔧 수정된 파일 목록

### 수정 (10개)
- `game/css/31_card_system.css` — 방패 프레임 매핑 (bronze/silver/gold/legendary + divine 5원소)
- `game/js/12_data_skills.js` — 액티브 스킬 8장 추가, 엔진 호환 스키마
- `game/js/40_cards.js` — data-role / data-element 속성 주입
- `game/js/60_turnbattle_v2.js` — EFFECT_CALCULATORS + AoE + statmod 적용·tick + SKILLS_DB 브릿지
- `game/design/changelog.md` — 이번 세션 결정 기록
- `game/PROMPT_RECIPES.md` — divine 섹션 주석 업데이트 (원소 뱃지 방침)
- `game/BANNER_PROMPTS_GEMINI.txt`, `game/BG_PROMPTS_GEMINI.txt`, `game/HERO_PROMPTS_TIER1.txt`, `game/HERO_PROMPTS_TODO.txt` — (이전 세션 변경 이월)

### 신규 (11+ 개)
- `design/frame-prompt-rules.md` — 고정 UI 규격 Source of Truth
- `game/PROMPT_RECIPES_FRAMES.txt` — 12장 완성형 프롬프트 v2.1 (복붙용)
- `game/img/frame_bronze_tank.png` ~ `frame_legendary_tank.png` (4)
- `game/img/frame_divine_fire_tank.png` ~ `frame_divine_holy_tank.png` (5)
- `game/mockup/frame_check/index.html` — 9장 투명도 검증
- `game/mockup/frame_wiring/index.html` — CSS 배선 테스트
- `game/이미지제작_원본/` — 대표님 원본 이미지 보관

### 메모리 신규 (7개)
- `C:/Users/USER/.claude/projects/c--work/memory/feedback_prompts_one_shot.md`
- `C:/Users/USER/.claude/projects/c--work/memory/feedback_large_code_ask_first.md`
- `C:/Users/USER/.claude/projects/c--work/memory/feedback_ask_when_unclear.md`
- `C:/Users/USER/.claude/projects/c--work/memory/feedback_code_modularization.md`
- `C:/Users/USER/.claude/projects/c--work/memory/feedback_ui_mockup_first.md`
- `C:/Users/USER/.claude/projects/c--work/memory/project_frame_ui_spec.md`
- `MEMORY.md` 인덱스에 5줄 추가

### 임시·참고
- `c:/tmp/process_all_tank_frames.py`, `process_fire_lightning.py`, `process_v3.py` — 프레임 후처리 파이프라인
- `c:/tmp/test_active_skills.js` — 회귀 테스트

---

## 📂 관련 참조 문서

- `design/current-focus.md` — 현재 Phase·최근 세션 상태
- `design/frame-prompt-rules.md` — 🆕 프레임 고정 UI 규격 (절대 변경 금지)
- `design/card-layout.md` — 14 영역 전체 구조
- `design/changelog.md` — 결정 히스토리
- `game/PROMPT_RECIPES.md` — 프롬프트 v2 레시피
- `game/PROMPT_RECIPES_FRAMES.txt` — 🆕 12장 복붙용 프롬프트
- `MEMORY.md` — 메모리 인덱스 (7건 신설)

---

## 🎭 호칭 규약

| 역할 | 호칭 |
|---|---|
| 메인 Claude | **게임 총괄** |
| 사용자 | **대표님** |
| rof-ui-inspector | **검수관** |

---

<!-- Claude Code 지시사항: 이 문서는 이전 세션의 핸드오프입니다. 이 내용을 읽고 사용자에게 다음과 같이 응답하세요:

"🔄 핸드오프 복구 완료.

지난 세션(2026-04-18)에서 방패 프레임 9장 완전 배선 + 액티브 스킬 엔진 인프라 + 메모리 규칙 7개를 완료했습니다. 산출물 21개 미커밋 상태.

**즉시 할 일 (P0)**:
1. 🌑 암흑 원소 프레임 처리 (대표님 제작 대기)
2. ⚔️ 액티브 스킬 데모 연결 — 해석 1(skillIds) vs 해석 2(데모 삭제) 확정 필요
3. 📦 이번 세션 산출물 커밋 (프레임/스킬/메모리 3분할)

저는 '게임 총괄' 로 대표님을 도와드리겠습니다. 무엇부터 할까요?"

응답 후 사용자 지시 대기. -->
