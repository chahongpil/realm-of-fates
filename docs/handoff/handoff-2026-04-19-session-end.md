# 🔄 Realm of Fates — 세션 핸드오프 (2026-04-19)

> **이 문서를 새 세션에 붙여넣으면 Claude Code 가 맥락을 복구하고 바로 이어갑니다.**
> /clear → Ctrl+V 하세요.

생성: 2026-04-19 심야 세션 종료
이유: 수동 저장 (대표님 "핸드오프 하자" 지시, 내일 "계속 진행" 으로 이어감)
이전 핸드오프: `handoff-2026-04-18-session-end.md`

---

## 🎯 핵심 (한 줄 요약)
**demo/dev 잔재 전면 제거 + 분할 커밋 4건 + 패시브 스킬 전면 개편(cost 0 / 수치 축소 / role 'crit' 신설 / 확률 발동 마커)** — 본판 구조 청소 + 밸런스 1차 재정의.

## 📍 현재 상태
- **Phase**: Phase 3 (시네마틱 전투) + Phase 2 콘텐츠
- **브랜치**: `master`
- **마지막 커밋**: `7b3063f` docs: 2026-04-16 / 04-18 세션 핸드오프 + changelog 갱신
- **미커밋 변경**: 5개 (패시브 스킬 개편 한 세트 — **다음 세션 첫 작업으로 커밋**)

---

## ✅ 이번 세션에서 완료한 것

### 1. 🧹 demo/dev 잔재 전면 제거 (커밋 `3e1018b`)
대표님 지적 "본판에 데모(dev)가 있는데 이건 왜 그런거지?" 에 대한 답으로 전수 정리.

- **본판 UI**: 타이틀 "▶ PHASE 3 시네마틱 데모 (DEV)" 버튼 + 전투 idle "수직 슬라이스 데모 시작" 버튼 **둘 다 제거** ([index.html:80-86, 487](../../index.html))
- **엔진**:
  - `Battle.DEMO = { 타이탄 5+5, skills 5장 }` → `Battle.STATE = { [], [], [] }` 빈 컨테이너
  - `findSkillById` / `getSkillsOf` 우선순위 반전 — **SKILLS_DB 1순위**, STATE.skills 2순위 (buildUnitSkillSet 런타임 캐시)
  - `v2.demoStart` 핸들러 / `Battle.startDemo` / `Battle.playDemoRound` 함수 통째 삭제
  - `is-real-battle` 클래스 부여·CSS 규칙 삭제 (버튼 없어지면서 불필요)
  - 28개소 `Battle.DEMO` → `Battle.STATE` 치환 (62_ghost_pvp + tools 6개 포함 총 47 occurrence)
- **설정 정리**: `config_battle.js` DEMO_PRE / DEMO_STEP dead 상수 제거
- **CSS**: `.bi-demo-btn` 스타일 + `.is-real-battle .bi-demo-btn` 숨김 규칙 삭제
- **테스트**: `tools/_test_v2_real_match.js` 의 `isRealBattle` / `demoBtnHidden` 체크 제거

**검증**: Playwright `_test_v2_real_match.js` **14/14 통과** — 신규 가입 → 매칭 → 전투 → 리워드 풀 플로우 정상.

### 2. 📦 분할 커밋 4건 완료 (이전 세션 미커밋 21개 정리)
```
7b3063f  docs: 2026-04-16 / 04-18 세션 핸드오프 + changelog 갱신
42be4f2  feat(skills): 액티브 스킬 8장 추가 (P1-2)
5c6f782  feat(ui): tank 프레임 9종 + CSS 배선 + 프롬프트 v2.1
3e1018b  refactor(battle-v2): demo/dev 잔재 제거 + 실전 경로 단일화
```
- `.gitignore` 에 `이미지제작_원본/` (784MB) + `*.bak` 추가 — repo 용량 보호
- `js/60_turnbattle_v2.js` 는 DEMO 정리 + P1-2 엔진 확장(EFFECT_CALCULATORS, AoE 등)이 한 파일에 섞여 같이 커밋 (A-2 방식)

### 3. ⚔️ 패시브 스킬 전면 개편 (미커밋, 4파일 한 세트)
**대표님이 [메모장 편집]([c:/tmp/skills_relics_export.txt](c:/tmp/skills_relics_export.txt))으로 직접 재디자인한 값을 반영**:

- **전 패시브 cost:0** (기존 2~7) — NRG 가격 제거, 장착만으로 효과
- **수치 전체 축소** — 예: `atk+3` → `atk+1`, `eva+6` → `eva+1`, `luck+8` → `luck+3`
- **sk_venom 삭제** (맹독 제거 지시)
- **role 'crit' 신설** — `sk_tough`(정밀 공격) 가 첫 번째. UI 필터 영향은 차후.
- **4개 신규 effect 마커 + 별도 필드**:
  - `proc_double_cast` + `procChance:%` — 카드 사용 시 2번 캐스팅 (sk_focus 1%, sk_handoff 3%)
  - `proc_nullify_hit` + `procChance:%` — 피격 시 무효화 (sk_reflex 1%)
  - `hp_mult` + `hpMult:N` — HP 배율 즉시 적용 (sk_transcend ×2)
  - `grant_rebirth` + `rebirthHp`, `rebirthNrg` — 부활 시 자원 (sk_revive 1/1, sk_resurrection 10/10)
- **기존 마커 확장**: `invincible3` 고정 → 정규식 `invincible(\d+)` 로 (`invincible1` 지원)
- **dead code 삭제**: `55_game_battle.js` 의 `u._handoff` 40% 발동 블록 (17줄) 제거

**파일 변경**:
- `js/12_data_skills.js` — 패시브 28장 재작성 (맹독 빼고 29→28)
- `js/20_helpers.js` — `applySkillToUnit()` 에 신규 마커 파싱 추가
- `js/55_game_battle.js` — 옛 `_handoff` 발동 블록 삭제
- `tools/test_run.js` — `sk_handoff` 골든 스펙을 `proc_double_cast 3%` 로 갱신

**검증**: `node tools/test_run.js` **8/8 통과**.

### 4. 📚 교훈 증류 — 08-garbage-lessons.md
PostToolUse 훅이 같은 증상(`expected _handoff=0.4, got undefined`) 으로 2번 연속 실패 기록. 근본 원인:
> 스킬 `effect` 마커 교체 시 **데이터(12_data_skills.js) → 파서(20_helpers.js) → 테스트(test_run.js)** 3점을 한 턴에 동기화 안 함. 파일별 순차 편집하니 매 편집 사이에 드리프트 노출.

증류한 4가지 원칙 append 완료 ([.claude/rules/08-garbage-lessons.md](../../../.claude/rules/08-garbage-lessons.md)):
1. `effect` 문자열 바꾸기 전에 `grep -rn "<옛_값>" js/ tools/` 로 동반 수정 지점 먼저 스캔
2. `test_run.js` 는 golden spec — 데이터 변경과 항상 한 세트
3. 동일 실패 2회 = 원인 한 가지. 세 번째 파일 편집하지 말고 **테스트 파일 grep 부터**
4. 신규 effect 마커는 파라미터 별도 필드(procChance, hpMult 등)로 분리

실패 로그 비움 완료 (`state/failures.jsonl` 제거).

---

## 🔴 해결 안 된 것 / 막혀있는 것

### 1. 🌑 암흑(dark) 신 등급 프레임 미제작
- **상태**: 대표님이 **2026-04-19 오전 10시** 작업 예정
- **현재 fallback**: `.card-v2.divine[data-element="dark"]` → 구 `frame_divine.png`
- **해결 방향**: 대표님이 `방패프레임_투명3번째/암흑.png` 에 올리시면 제가 자동 처리 파이프라인(`c:/tmp/process_v3.py`) 돌림

### 2. 📦 미커밋 5건 — 패시브 스킬 개편 한 세트
- **파일**:
  - `js/12_data_skills.js` (패시브 재작성)
  - `js/20_helpers.js` (파서 확장)
  - `js/55_game_battle.js` (옛 핸드오프 발동 삭제)
  - `tools/test_run.js` (sk_handoff golden 갱신)
  - `PROMPT_RECIPES_FRAMES.txt` (LF/CRLF 자동 변환, 내용 변화 없을 가능성)
- **해결 방향**: 다음 세션 첫 작업으로 `feat(skills): 패시브 전면 개편 (cost 0 / role crit / 확률 발동)` 단일 커밋.

### 3. ⚔️ 신규 effect 마커 "데이터만 존재, 실제 전투 발동 로직 미구현"
현재 `proc_double_cast`, `proc_nullify_hit`, `hp_mult`, `grant_rebirth(paramterized)` 는 **파싱까지만** 완성(`unit._procDoubleCast` 등 필드 세팅). 실제 전투 중 발동 연결은 다음 스프린트.
- 발동 지점: `60_turnbattle_v2.js` 의 performAttack 전/후 훅 + `55_game_battle.js` 의 레거시 전투 루프
- **범위 크니 별도 작업으로 분리**. 지금은 데이터 인프라만.

### 4. 🎨 DPS / Support 프레임 미제작 (지난 세션 이월)
- 모든 role 이 일단 tank 프레임 공용 사용 중. DPS 12장 + Support 12장 = 24장 추가 제작 필요. 현재 이슈 아님.

---

## ⏭️ 다음에 할 일 (우선순위 순)

### 🔴 P0 (즉시)
0. **CLAUDE.md 비대칭 트랙 규칙 적용** 🆕 — 세션 종료 직전 대표님과 합의된 메타 규칙 변경
   - **현재 문제**: 메인이 `design/` 등 트랙 영역을 이미 자주 편집하는데 규칙상 금지라 트랙 신호에 안 남음 → 트랙 레이더에서 실종
   - **새 규칙 (비대칭)**:
     - **메인 세션**: 전 영역 편집 가능. 단 건드린 트랙 영역이 있으면 `tracks/_signals/<track>.md` 에 **append 필수**
     - **트랙 전용 세션**: 자기 담당 영역만 (기존 규칙 유지) — "집중 모드"
     - **점유 선언**: 트랙 세션이 긴 작업 들어갈 때 `🔒 점유 시작 — …` 로 신호에 먼저 쓰고, 메인은 점유 중 영역 건드리기 전에 신호 확인
   - **수정 파일**: `CLAUDE.md` (병렬 트랙 섹션) + `tracks/01-assets/START.md` + `tracks/02-data-balance/START.md` + `tracks/05-docs-lore/START.md` + `tracks/06-backend/START.md` (각 "절대 금지" 문구를 "집중 모드 범위" 로 완화) + `design/changelog.md` (팀/협업 결정 기록)
   - **예상 시간**: 30분
1. **미커밋 5건 커밋** — 패시브 개편 한 세트를 `feat(skills): 패시브 전면 개편` 단일 커밋으로
2. **암흑 프레임 처리** — 대표님 2026-04-19 오전 10시 파일 업로드 시 자동 파이프라인
3. **"계속 진행"** — 대표님 지시: 핸드오프 복구 후 현재 우선순위 따라 진행

### 🟡 P1 (이어서)
4. **신규 effect 마커 발동 로직 구현** — `proc_double_cast`, `proc_nullify_hit`, `hp_mult`, `grant_rebirth(params)` 를 전투 엔진에 연결
5. **P0-3 카드 등급 색 CSS** — 프레임 완성됐으니 등급별 CSS 토큰·신 등급 샤인 애니 배선
6. **액티브 스킬 실제 UI 표시** — SKILLS_DB 의 액티브 8장을 전투 화면 스킬 row 에 실제 노출

### 🟢 P2 (중장기)
7. **role 'crit' UI 필터** — 선술집 / 덱뷰 탭에 치명타 카테고리 추가
8. **DPS 프레임 12장** / **Support 프레임 12장** 제작
9. **원소 공명 로직** — 같은 원소 연속 캐스팅 시 +30% 데미지

---

## 📝 이번 세션의 주요 결정

| 시점 | 카테고리 | 결정 |
|---|---|---|
| 2026-04-18 | 구조 | `Battle.DEMO` 이름 혼동 해소 — 내부 `Battle.STATE` 로 리네임, 빈 컨테이너로 시작 |
| 2026-04-18 | 구조 | 본판 데모/dev 진입점 전면 제거. 실전 경로는 `startFromLegacyBS(bs)` 단일화 |
| 2026-04-18 | 구조 | 스킬 조회 1순위 = SKILLS_DB, 2순위 = STATE.skills(런타임 캐시). 데모 하드코딩 우선순위 폐기 |
| 2026-04-18 | 커밋 전략 | 이전 세션 미커밋 21개 정리 — 프레임(`5c6f782`) + 스킬(`42be4f2`) + 문서(`7b3063f`) 3분할 + 이번 DEMO 정리(`3e1018b`) |
| 2026-04-18 | 커밋 전략 | `js/60_turnbattle_v2.js` 의 DEMO 정리 + P1-2 엔진 확장 섞인 것은 A-2(통합 커밋) 선택 |
| 2026-04-19 | 레포 | `.gitignore` 에 `이미지제작_원본/` (784MB) + `*.bak` 추가 |
| 2026-04-19 | 밸런스 | 전 패시브 cost:0 — NRG 가격 제거, 효과 수치 전반 축소 |
| 2026-04-19 | 밸런스 | `sk_venom` (맹독) 삭제. 패시브 29 → 28장 |
| 2026-04-19 | 카테고리 | `role: 'crit'` 신설 — `sk_tough` 가 첫 번째. attack/defense/support 외 네 번째 카테고리 |
| 2026-04-19 | 엔진 스키마 | 신규 effect 마커는 파라미터를 **별도 필드**로 분리 (procChance, hpMult, rebirthHp 등). `invincibleN` 같은 숫자 내장은 기존 유지, 정규식 파싱 |
| 2026-04-19 | 엔진 스키마 | `sk_handoff` 의미 변경 — 아군 40% 추가 공격권 → 3% 확률 본인 2회 캐스팅 (proc_double_cast) |
| 2026-04-19 | 훅 대응 | 데이터/파서/테스트 3점 동기화 규칙 `08-garbage-lessons.md` 에 append |
| 2026-04-19 | 팀/협업 | 트랙 규칙 **비대칭 전환** 합의 — 메인 전권 + 신호 append 의무 / 트랙 세션은 현 규칙 유지. 구현은 내일 P0-0 |

---

## 🔧 수정된 파일 목록 (세션 누적)

### 커밋된 파일 (4 커밋, 33 파일)
- 상세는 `git log 3e1018b..7b3063f --stat` 참조
- DEMO 정리 10 파일 / 프레임 20 파일 / 스킬 1 파일 / 문서 3 파일

### 미커밋 (5개 — 다음 세션 첫 작업)
- `js/12_data_skills.js` — 패시브 28장 전면 재작성 + cost 0 + 신규 마커
- `js/20_helpers.js` — `applySkillToUnit()` 에 proc_double_cast / proc_nullify_hit / hp_mult / grant_rebirth 파라미터화 / `invincible(\d+)` 정규식
- `js/55_game_battle.js` — 옛 `u._handoff` 40% 추가공격 블록 삭제 (17줄)
- `tools/test_run.js` — `sk_handoff` 검증을 새 스펙(proc_double_cast 3%)으로
- `PROMPT_RECIPES_FRAMES.txt` — LF/CRLF 자동 변환 (내용 변화 없을 가능성, diff 확인 후 revert 여부 결정)

### 하네스 변경 (game repo 밖)
- `C:/Users/USER/.claude/rules/08-garbage-lessons.md` — 교훈 1건 append (데이터/파서/테스트 3점 드리프트)

### 외부 생성물
- `c:/tmp/skills_relics_export.txt` — 대표님이 편집한 스킬/유물 편집용 사본 (패시브 개편의 원본 지시)

---

## 📂 관련 참조 문서

- `design/current-focus.md` — 현재 Phase·최근 세션 상태
- `design/frame-prompt-rules.md` — 프레임 고정 UI 규격 (절대 변경 금지)
- `design/changelog.md` — 결정 히스토리
- `.claude/rules/08-garbage-lessons.md` — 🆕 스킬 effect 3점 드리프트 교훈
- `game/HANDOFF.md` — 프로젝트 전체 핸드오프 마스터
- `c:/tmp/skills_relics_export.txt` — 대표님 편집 원본 (다음 편집 시 재활용 가능)

---

## 🎭 호칭 규약

| 역할 | 호칭 |
|---|---|
| 메인 Claude | **게임 총괄** |
| 사용자 | **대표님** |
| rof-ui-inspector | **검수관** |

---

<!-- Claude Code 지시사항: 이 문서는 이전 세션의 핸드오프입니다.
이 내용을 읽고 사용자에게 다음과 같이 응답하세요:

"🔄 핸드오프 복구 완료.

지난 세션(2026-04-18~19)에서 demo/dev 잔재 전면 제거 + 분할 커밋 4건 + 패시브 스킬 전면 개편(cost 0, role crit 신설, 확률 발동 마커)을 완료했습니다. 테스트 8/8 통과.

세션 종료 직전에 **트랙 규칙 비대칭 전환** 합의 — 메인이 전 영역 편집하되 건드린 트랙 신호에 append 의무. 내일 P0-0 으로 적용 대기.

**즉시 할 일 (P0)**:
0. 🆕 **CLAUDE.md 비대칭 트랙 규칙 적용** (30분) — 메인 전권 + 신호 append 의무 / 트랙 세션은 현 규칙 유지 / 점유 선언 개념 도입
1. 📦 미커밋 5건 커밋 — 패시브 개편 한 세트를 `feat(skills): 패시브 전면 개편` 단일 커밋
2. 🌑 암흑 프레임 처리 — 대표님 오전 10시 업로드 예정
3. ⏭️ '계속 진행' 지시에 따라 다음 우선순위(신규 effect 마커 발동 로직 / 카드 등급 CSS / 액티브 스킬 UI 표시) 중 선택

저는 '게임 총괄' 로 대표님을 도와드리겠습니다. P0-0 부터 시작할까요?"

응답 후 사용자의 지시를 기다리세요. -->
