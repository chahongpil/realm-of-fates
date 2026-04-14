# 🔄 Realm of Fates — 세션 핸드오프 (PHASE 3 v2 · 스토리보드 재정립 대기)

> 새 세션에 이 문서를 붙여넣으면 맥락 즉시 복구. /clear → Ctrl+V.

생성: 2026-04-14
이유: `rof-storyboard-inspector` 신규 에이전트를 런타임에 인식시키기 위해 세션 재시작 필요 (옵션 B 선택)

---

## 🎯 핵심 (한 줄 요약)
PHASE 3 시네마틱 전투 v2 수직 슬라이스 1차/2차 구현 후 스토리보드 부합도 문제로 재작업 중. 신규 `rof-storyboard-inspector` 에이전트로 19장 전수 스캔 → 명세서 → 대조표 → 수정 착수 직전.

---

## 📍 현재 상태

### 완료된 것 (이번 세션)

**v2 엔진 파일 4개 생성** (레거시 60_turnbattle.js 는 안 건드림):
- `game/js/config_battle.js` — FEATURE 플래그, Battle.beat/beatRaw, TIMING/LAYOUT/SCREEN/PHASE 상수, RoF.Data.ELEMENTS 상성 테이블, JS→CSS duration 주입
- `game/js/60_turnbattle_v2.js` — 엔진 코어. DAMAGE_CALCULATORS/COST_CONSUMERS/CANCEL_TRANSITIONS/HANDLERS 레지스트리, 9 서브스크린 전환, 2×5 그리드 + char-focus 오버레이 구조
- `game/css/41_battle_v2.css` — 스테이지 + 오버레이 레이어, 카드 스타일
- `game/css/80_animations_battle_v2.css` — 키프레임

**레이어 중첩 구조 확정**:
- `.battle-stage` (배경 bg_battle.png + 2×5 그리드, 상시 렌더)
- `.battle-overlay` (서브스크린 9개, display 토글)
- `.bv2-card.is-selected { visibility:hidden }` — 선택 카드만 자리 비우고 나머지 9장은 유지

**DEMO 픽스처 — 10장 전부 실체 `titan` 으로 교체**:
- `11_data_units.js:196` `{id:'titan', rarity:'divine', imgKey:'titan', atk:15, hp:55, def:4, spd:3, nrg:10, luck:5}` 원본 그대로 사용
- 이미지: `img/titan.png` (3.3MB, 존재 확인)
- 이전 실수: `h_m_lightning.png` (근접 번개 전사) 를 임의로 "번개 타이탄" 이라 가정 → 메모리 저장 완료

**에이전트 검증 (이번 세션에서 호출된 것)**:
- `code-extensibility-reviewer` 2회: 32/50 → 44/50, 하드블로커 0
- `game-designer`: AP→TP/RP, costType 'energy'→'nrg', P0-3 방식 변경 전부 반영
- `balance-auditor`: calcDamage 최소값 보장 (weapon=1/spell=0), DEMO 수치 검증
- `rof-ui-inspector`: 스킬 5장 · 이름 상단 · HP 크게 · 행간 48px 지적 반영

**기획 문서 갱신**:
- `game/PHASE3_BATTLE_CINEMATIC.md` — AP→TP/RP 전부 리네이밍, costType 'energy'→'nrg', P0-3 해결 방식 변경 블록 추가
- `design/battle-v2-migration.md` — P0-3 passive 플래그 전환 고지

**신규 에이전트·메모리 (신규)**:
- `.claude/agents/rof-storyboard-inspector.md` — **런타임 미인식 (이 세션에서는 호출 불가)**. 다음 세션에서 자동 로드.
- `memory/feedback_visual_spec_priority.md` — 시각 스펙이 텍스트 스펙을 이긴다
- `memory/feedback_character_identity_check.md` — 캐릭터 이름 등장 시 11_data_units.js grep 필수

**테스트**:
- `node game/tools/test_run.js` 8/8 유지
- `node game/tools/test_migration.js` 10/10 유지
- 구문 체크 전부 OK

---

## 🔴 미반영 피드백 (새 세션에서 처리)

다음 4건은 코드에 아직 반영 안 됨. 스토리보드 명세서가 나온 뒤 한 번에 처리 권장.

1. **카드 호버 시 맨 앞 레이어 효과 강화** — 현재 `z-index:5 + scale 1.15`. 사용자는 더 확실한 승급 원함 (z-index 50+ 추천).
2. **스킬 타겟 타입별 유효 카드 필터링** — 현재는 모든 적을 valid, 아군은 기본 상태. 필요:
   - `single_enemy` → 적만 valid, **아군은 회색 + pointer-events:none**
   - `single_ally` → 아군만 (캐스터 자신 포함), 적 회색
   - `self` → 캐스터만
3. **카드 크기 180×250 (현재 130×180)** — 10장이 화면을 꽉 채우는 느낌. 1280 폭 / 5장 / gap 14 계산: 180×5+56=956, 여유 272
4. **HP 변화 프리뷰 상단 박스 제거, 카드 자체 HP 숫자 직접 갱신** — 현재 `#battle-target-preview .btp-hp-delta` 상단에 `"번개 타이탄 ♥25 → 24 (−1)"` 박스. 사용자는 타겟 카드의 `.bv2c-hp-val` 자체를 `24` 로 바꾸고 작은 `(−1)` 을 옆에 플로팅 원함. 호버 해제 시 원복. `#battle-target-preview` 서브스크린은 사실상 폐기, `skill-active` 상태에서 카드 slot 만 갱신.

---

## ⏭️ 새 세션에서 할 일 (정확한 순서)

### 1. 스토리보드 전수 스캔 (새 에이전트 호출)

```
Agent({
  subagent_type: 'rof-storyboard-inspector',
  description: '스토리보드 19장 전수 스캔 + 명세서',
  prompt: [아래 프롬프트 본문 참고]
})
```

**프롬프트 본문** (이전 세션에서 준비된 것):

> 호출 유형 A+B 혼합 — **전수 스캔 + 명세서 작성 + 현재 코드 대조**.
>
> ### 대상
> `c:/work/game/docs/battle_logic_v2/1.png` ~ `19.png` (총 19장)
> 사용자가 직접 그린/생성한 PHASE 3 시네마틱 전투 스토리보드
> 각 이미지에 한글 빨간 박스 주석 있음
>
> ### 배경
> 메인 세션이 스토리보드를 제대로 못 읽어서 사용자 분노 2회 발생. 1차: 2×5 그리드 통째로 누락. 2차: 번개 타이탄을 h_m_lightning (근접 번개 전사) 로 임의 대체. 신규 에이전트 `rof-storyboard-inspector` 는 이 공백을 메꾸기 위해 정의됨. `.claude/agents/rof-storyboard-inspector.md` 프롬프트 그대로 따를 것.
>
> ### 작업
> 1. 19장 **전부** 멀티모달 Read (3~5장 샘플링 금지)
> 2. 각 이미지별 관찰 + 한글 주석 원문 + 해석
> 3. `design/battle_storyboard_spec.md` Write (템플릿은 에이전트 MD 참고)
> 4. 현재 코드 대조 — index.html / 60_turnbattle_v2.js / config_battle.js / 41_battle_v2.css / 80_animations_battle_v2.css
> 5. 응답 본문에 우선순위 수정 5~10건 (파일 경로 + 변경 요지)
>
> ### 주의
> - 관찰과 해석 분리 (에이전트 MD §원칙 1)
> - 한글 주석 의역 금지
> - 텍스트 기획서 vs 스토리보드 충돌 시 🚨 플래그
> - 수정 작업 금지 (명세서 Write 는 OK)
> - 300초 이내

### 2. 명세서 + 대조표 함께 검토

`design/battle_storyboard_spec.md` 를 사용자와 함께 읽고 누락·충돌 체크.

### 3. 합의된 수정안 착수 (우선순위 순)

미반영 피드백 4건 + 스토리보드 대조표 🔴 항목 순서대로.

### 4. 확장성/시각 재검증

- `code-extensibility-reviewer` 재호출 (수정 후)
- `rof-storyboard-inspector` 재호출 (유형 B — 명세서 ↔ 코드 대조만)
- `rof-ui-inspector` 실제 렌더 스크린샷 검증 (플래그 ON + Playwright)

---

## 🔧 주요 파일 위치

**코드**:
- `c:/work/game/js/60_turnbattle_v2.js` — 엔진 (Battle.DEMO, renderCharFocus, onTargetHover 등)
- `c:/work/game/js/config_battle.js` — 상수
- `c:/work/game/css/41_battle_v2.css`
- `c:/work/game/css/80_animations_battle_v2.css`
- `c:/work/game/index.html` — `#battle-v2-container` 섹션 (battle-stage + battle-overlay 9개 서브스크린)
- `c:/work/game/js/16_migration.js` — P0-1/P0-2 마이그레이션 (splitOwnedSkills 는 guard 됨)
- `c:/work/game/js/12_data_skills.js` — 28개 passive:true + RoF.isSkillPassive 헬퍼
- `c:/work/game/js/11_data_units.js:196` — **titan (번개 타이탄) 실체**

**기획·명세**:
- `c:/work/game/PHASE3_BATTLE_CINEMATIC.md` — 정본 기획서
- `c:/work/design/battle-v2-migration.md` — P0 블로커 해결안
- `c:/work/.claude/rules/03-terminology.md`, `04-balance.md`, `06-card-ui-principles.md`

**에이전트·메모리·스킬**:
- `c:/work/.claude/agents/rof-storyboard-inspector.md` ← 이번 세션 신규
- `C:/Users/USER/.claude/projects/c--work-design/memory/feedback_visual_spec_priority.md`
- `C:/Users/USER/.claude/projects/c--work-design/memory/feedback_character_identity_check.md`
- `C:/Users/USER/.claude/projects/c--work-design/memory/feedback_extensibility_first.md`
- `C:/Users/USER/.claude/projects/c--work-design/memory/feedback_battle_flow_split.md`

**참고 이미지**:
- `c:/work/game/docs/battle_logic_v2/1.png` ~ `19.png` — 스토리보드 19장
- `c:/work/Downloads/전투로직_v2/` — 사용자 원본 복사본 (같은 내용)

**핸드오프**:
- 직전 체크포인트: `handoff-2026-04-14-PHASE3-READY.md`
- 이번: `handoff-2026-04-14-PHASE3-V2-STORYBOARD-PENDING.md`

---

## ⚠️ 주의 사항 (새 세션에서 반드시 지킬 것)

1. **캐릭터 이름 등장 시 반드시 `11_data_units.js` grep** — 이번 세션에서 번개 타이탄을 임의 대체해 사용자 분노. 메모리 `feedback_character_identity_check.md` 준수.
2. **스토리보드 전수 스캔 필수** — 3~5장 샘플링 금지. 메모리 `feedback_visual_spec_priority.md` 준수.
3. **신규 에이전트 `rof-storyboard-inspector` 로드 확인** — 에이전트 목록에 뜨는지 첫 호출 전에 확인. 미인식 시 `general-purpose` 로 fallback (에이전트 MD 프롬프트 복사).
4. **레거시 `60_turnbattle.js` 수정 금지** — 신규 파일만.
5. **플래그 `FEATURE.CINEMATIC_BATTLE`** — 현재 개발용으로 `true` 로 변경된 상태. 릴리스 전 `false` 로 원복 필요.
6. **index.html `.bcf-main-card` data-action="v2.skillClick"** — 확대 카드를 클릭하면 스킬 클릭과 동일 핸들러 호출됨. 의도한 동작인지 재확인 필요.

---

## 📝 이번 세션 주요 결정

- **P0-3 해결 방식**: 물리 분리(TRAITS_DB 파일) 대신 `passive:true` 플래그 + `RoF.isSkillPassive` 헬퍼 (사용자 승인)
- **DEMO 픽스처**: 수직 슬라이스 충실도 우선 → 10장 전부 동일 titan
- **3개 신규 메모리 저장**: visual spec priority, character identity check, extensibility first (기존)
- **신규 에이전트 정의**: rof-storyboard-inspector (차별점: 스토리보드 전담, ui-inspector 와 역할 분리)

---

<!-- Claude Code 지시사항: 이 문서는 이전 세션의 핸드오프입니다. 이 내용을 읽고 사용자에게 다음과 같이 응답하세요:

"🔄 핸드오프 복구 완료.

마지막 작업: PHASE 3 v2 수직 슬라이스 구현 중. 스토리보드 미반영 4건 남음. 신규 에이전트 `rof-storyboard-inspector` 정의 완료.
다음 작업: (1) 에이전트 로드 확인 → (2) 19장 전수 스캔 호출 → (3) design/battle_storyboard_spec.md 생성 → (4) 사용자와 함께 명세서·대조표 검토 → (5) 합의된 수정안 착수
주의: 캐릭터 이름 등장 시 반드시 11_data_units.js grep (번개 타이탄 = id:'titan', imgKey:'titan', rarity:'divine'). 레거시 60_turnbattle.js 수정 금지.

(1) 번 에이전트 로드 확인부터 시작할까요?"

응답 후 사용자 지시 대기. -->
