# 🔄 Realm of Fates — 세션 핸드오프 (PHASE 3 구현 착수 직전)

> **이 문서를 새 세션에 붙여넣으면 Claude Code 가 맥락을 복구하고 바로 이어갑니다.**
> /clear → Ctrl+V 하세요.

생성: 2026-04-14
이유: 기획서·규칙 확정 완료 → 실제 구현 단계 진입 직전 (문서 단계와 구현 단계 분리해서 컨텍스트 보호)

---

## 🎯 핵심 (한 줄 요약)

**PHASE 3 시네마틱 전투 리뉴얼** 기획서 + 규칙 파일 6개 전부 확정. 블로커 3개 해결 방안 문서화 완료. 이제 `/스킬이분할` → `/수직슬라이스시작` 순서로 실제 코드 구현 착수 직전.

## 📍 현재 상태

- **Phase**: PHASE 3 시네마틱 전투 리뉴얼 (문서 단계 완료, 구현 직전)
- **브랜치**: (git 미사용 — `c:/work` 는 git 저장소 아님)
- **CI 게이트**: ✅ 8/8 pass (title/signup/menu/deckview/tavern/handoff/coords/grids)
- **데이터 현황**: units=44 / skills=30 / relics=12
- **작업 디렉터리**: `c:/work/game/`

## ✅ 이번 세션에서 완료한 것

### UI·UX 수정 (병렬 트랙 작업과 함께)
1. 병렬 트랙 구조 세팅 — `tracks/` 폴더 + `_signals/` + 알림소리 cwd 분기 (메인/에셋/밸런스/기획 4색)
2. 리워드 화면 승리 타이틀 박스 확대 (760×110 중앙정렬) + 전리품 선택 후 안내 텍스트 숨김
3. 타이틀 화면 league/logo/subtitle flex center 강제 + 버튼 x=540 정확 중앙
4. 마을: NPC 이모지 애니 제거 + 라벨 전체 labelAbove 통일 + 증축 버튼 selected 토글 (기본 숨김/클릭 시 진한 금색)
5. 성 라벨만 특별 처리 (top:55%) — 성 이미지 중앙에 겹치게
6. 전투: 카드 외곽 테두리 제거(td-card border→none) + VS 단일 텍스트화 + 매칭 15초 카운트다운·자동 출전
7. 적 행동 모달 5초 후 자동 확인 + 타이틀 카운트다운

### PHASE 3 기획서 대화 (긴 설계 토론)
8. 사용자가 19장 스토리보드 공유 → `game/docs/battle_logic_v2/` 로 복사
9. 컨셉·용어·데이터구조·시퀀스·규칙 확정 대화 15턴+
10. game-designer 검증 2회 + rof-game-director 1회 호출
11. **확정 사항 29개** (하이브리드 정체성 / 1라운드 90초 / 무기·스펠 이원 공식 / 고전 원소 상성 / luck 기반 치명타 / 영웅 중앙 고정 / 스킬북 성 학습 등)
12. **블로커 3개 해결 방안** 문서화 — P0-1 (nrg 런타임 어댑터) / P0-2 (equips 안전 단순화) / P0-3 (SKILLS_DB 물리 분리)
13. 확장성 11개 원칙 메모리에 영구 저장 (사용자 지시)

### 신규 설치
14. 에이전트: **`code-extensibility-reviewer`** — 확장성 저해 패턴 11가지 탐지
15. 스킬: **`/수직슬라이스시작`** — 수직 슬라이스 11단계 체크리스트
16. 스킬: **`/스킬이분할`** — SKILLS_DB 물리 분리 자동화

### 문서 업데이트 (A 단계 완료)
17. `game/PHASE3_BATTLE_CINEMATIC.md` — 장르 정체성 / 결정 밀도 / 연출 예산 / 블로커 해결 / 공식 / 상성 / 치명타 / 수직 슬라이스
18. `game/BATTLE_RULES.md` — 상단에 **DEPRECATED 배너** (§1-3 대체 명시)
19. `.claude/rules/03-terminology.md` — 전투 개념 섹션 (TP/RP/스킬북/히트스톱 등)
20. `.claude/rules/04-balance.md` — 무기/스펠/상성/치명타 공식 + 등급별 수치표
21. `.claude/rules/06-card-ui-principles.md` — 상태이상 위치 수정 + 전투 카드 크기
22. `design/balance.md` — PHASE 3 공식 섹션 + 검증 체크리스트
23. `design/battle-v2-migration.md` **신규** — 블로커 3개 해결 방안 상세

## 🔴 해결 안 된 것 / 막혀있는 것

### 구현 착수 전 대기 상태
- **실제 코드 작성 아직 안 함**. 기획서만 완성. 구현은 새 세션에서.
- 블로커 P0-1/P0-2/P0-3 해결 방안은 문서에만 있음 → 구현 시 `js/16_migration.js` 신규 작성 필요

### 미확정 11개 (나중 결정)
- 에너지 회복 기본값 (`nrgReg` 값)
- 장비 카드 상세 (무기/방어구/도구 능력 체계)
- 스킬 카드 업그레이드·폐기 세부
- 데미지 공식 세부 튜닝
- 영웅 AP 우대 여부 (영웅만 TP 2?)
- 카드 호버 프리뷰 팝업 위치
- 적 봇 AI 의사결정 규칙
- PvP 봇 대기 연출 시점
- 자동 진행 시뮬 (이탈 복구)
- 유물 훅 지점 시그니처
- 캐릭터 추가 스킬 슬롯 수

## ⏭️ 다음에 할 일 (우선순위 순)

### B 단계 — 실제 구현 (새 세션에서 시작)

1. **`/스킬이분할` 스킬 실행** — P0-3 블로커 해결
   - 기존 `12_data_skills.js` 28개 백업 후 분류
   - `12_data_traits.js` (신규, 패시브) + `12_data_skills.js` (재작성, 액티브) 물리 분리
   - 호환성 레이어 + 유닛 데이터 마이그레이션 함수
   - `balance-auditor` 검증

2. **`/수직슬라이스시작` 스킬 실행** — 단일 액션 시네마틱 1개
   - `FEATURE.CINEMATIC_BATTLE = false` 플래그 신설
   - 신규 파일 4개: `config_battle.js` / `60_turnbattle_v2.js` / `41_battle_v2.css` / `80_animations_battle_v2.css`
   - `Battle.beat(ms)` 유틸 먼저
   - 9개 서브스크린 DOM 빈 골격 (`battle-queueing` ~ `battle-round-end`)
   - 최소 데모 루프 1개 (캐릭터1 × 스킬1 × 타겟1)
   - `js/16_migration.js` 신규 (P0-1/P0-2 해결 함수 3종)

3. **`code-extensibility-reviewer` 에이전트 호출** — 확장성 점수 40/50 이상

4. **`rof-play-director` Playwright 실측** — 연출 시간 예산 (카드당 5초) 체크

5. **재미 검증 플레이테스트 3회** — 수직 슬라이스가 실제로 재미있는지

6. 통과 시 → 미확정 11개 결정 → 확장 (스킬 2~3개 → 그리드 → 적 AI → 라운드 큐잉/실행)

## 📝 이번 세션의 주요 결정 (29개)

### 장르·철학
- 2026-04-14: **하이브리드 정체성** — PvP 오토배틀러 + 시네마틱 덱빌더 양면 유지
- 2026-04-14: 1라운드 90초 (큐잉 30 + 실행 60) / 전투 5~10분 / 결정 25~50회 / 카드당 평균 5초
- 2026-04-14: **수직 슬라이스 우선** — 전면 재작성 금지, 재미 검증 후 확장 (rof-game-director 지시)

### 용어
- TP (Turn Point) = 전투 내 캐릭터 1장이 1라운드 쓸 수 있는 스킬 횟수
- RP (Round Point) = 라운드 사이 메타 선택 횟수 (기존 AP 이관)
- `nrg` 필드 재사용 (새 energy 필드 도입 안 함, 런타임에서 nrgMax 로 해석)
- 스킬북 = 스킬 카드 학습 아이템 (성 "학습" 탭에서 사용)

### 데이터 구조
- **SKILLS_DB 물리 분리**: 기존 28개 중 ~25개가 패시브 → `TRAITS_DB` (`tr_*`) + `SKILLS_DB` (`sp_*`)
- **equips 안전 단순화**: 배열 → `{weapon, armor, tool}` 객체, 기존 데이터는 `ownedSkills` 로 이관, 3슬롯은 빈 상태 시작
- 영웅/유닛 신규 필드: `ownedSkills`, `ownedTraits`, `currentNrg` (런타임 전용)

### 전투 공식
- **무기 공격**: `atk × mult + flatBonus - max(0, def - pen)`, 최소 1
- **스펠 공격**: `damage × (1 + vuln × 0.1)`, **DEF 완전 무시**
- **치명타**: `(luck + skill.critBonus) / 100`, 발생 시 `× critMult` (기본 1.5)
- **합성 순서**: `base × elementMult × critMult` (곱셈 고정)
- **원소 상성**: 고전 4원소 순환 (물→불→땅→전기→물, 1.3배) + 빛/어둠 상호 (1.3배), 나머지 중립

### UX·연출
- 영웅 중앙(3번 슬롯) 고정, 사망 = 즉시 패배, 편성 5명 상한
- 3클릭 시퀀스: 캐릭터 → 스킬 → 타겟 (취소 = ESC/우클릭/빈곳)
- 치명타 연출: 2배 크기 + 주황색 + 팝 + **히트스톱 0.3초**
- 9개 서브스크린 (queueing/idle/char-focus/skill-active/target-preview/action-fire/hit-react/death/round-end)
- 상태이상 = 카드 이름 위 정중앙 (우하단 DEPRECATED)
- 속도 배수 1x/2x/4x (실행 단계만 적용)
- 포션 선택지 폐기

### 스킬 규칙
- 한 캐릭터당 라운드 내 스킬 1장 기본 (TP 1), 일부 스킬은 TP 2 필요
- 5가지 코스트 타입: nrg 소모 / hp 소모 / 쿨다운 / +TP2 / 희생
- 희생 코스트 = 영구 손실, **교회에서만** 부활 (대장간 불가, 영웅 희생 불가)
- 에너지: 라운드 시작 전량 충전, 사용 후 매턴 자동 회복 (안 쓰면 풀 유지)

### 인프라
- `Battle.beat(ms)` 유틸 필수 (속도 배수 구현)
- 확장성 11개 원칙 (하드코딩 금지, 데이터 드리븐, 플래그 토글, 슬롯 기반 렌더링, 마이그레이션 안전장치)
- 플래그 `FEATURE.CINEMATIC_BATTLE=false` 기본

## 🔧 수정된 파일 목록

### UI·UX 수정
- `game/index.html` — 리워드 타이틀 확대 + 속도배수 버튼 HUD 준비
- `game/js/51_game_town.js` — NPC 제거 + 라벨 labelAbove + 증축 selected 토글
- `game/js/55_game_battle.js` — VS 단일 + 매칭 15초 카운트다운
- `game/js/58_game_battle_end.js` — 전리품 안내 텍스트 숨김
- `game/js/59_game_battle_round.js` — 적 행동 모달 5초 자동 확인
- `game/js/60_turnbattle.js` — 전투 카드 테두리 제거
- `game/css/42_screens.css` — 타이틀 중앙정렬 + 증축 CSS + 리워드 타이틀 CSS

### PHASE 3 기획 문서 (A 단계)
- `game/PHASE3_BATTLE_CINEMATIC.md` — 대폭 확장 (확정 사항 29개 반영)
- `game/BATTLE_RULES.md` — 상단 DEPRECATED 배너 추가
- `game/docs/battle_logic_v2/1.png ~ 19.png` — 스토리보드 보관
- `.claude/rules/03-terminology.md` — 전투 개념 섹션
- `.claude/rules/04-balance.md` — PHASE 3 공식 섹션
- `.claude/rules/06-card-ui-principles.md` — 상태이상 위치 / 카드 크기 상태
- `design/balance.md` — PHASE 3 공식 + 검증 체크리스트
- `design/battle-v2-migration.md` — **신규**, 블로커 3개 해결 방안
- `CLAUDE.md` — 병렬 트랙 섹션 추가

### 병렬 트랙 인프라
- `tracks/README.md`, `tracks/01-assets/START.md`, `tracks/02-data-balance/START.md`, `tracks/05-docs-lore/START.md`
- `tracks/_signals/main.md`, `assets.md`, `data-balance.md`, `docs-lore.md`
- `.claude/settings.json` — Notification 훅 cwd 분기 (4트랙별 소리)
- `.claude/hooks/session_start.py` — 트랙 시그널 자동 로드

### 신규 에이전트·스킬·메모리
- `.claude/agents/code-extensibility-reviewer.md` — 확장성 리뷰 에이전트
- `.claude/skills/수직슬라이스시작/SKILL.md` — 수직 슬라이스 스킬
- `.claude/skills/스킬이분할/SKILL.md` — SKILLS_DB 분리 스킬
- `memory/feedback_battle_flow_split.md` — 복잡 UI 서브스크린 분할 원칙
- `memory/feedback_extensibility_first.md` — 확장성 11개 원칙 (핵심)

## 📂 관련 참조 문서 (새 세션 시작 시 자동 로드됨)

- `game/PHASE3_BATTLE_CINEMATIC.md` — **PHASE 3 기획서 정본**
- `design/battle-v2-migration.md` — **블로커 3개 해결 방안 상세**
- `.claude/rules/03-terminology.md` — 용어
- `.claude/rules/04-balance.md` — 밸런스·공식
- `memory/feedback_extensibility_first.md` — 확장성 원칙 (사용자 핵심 지시)
- `memory/feedback_battle_flow_split.md` — 서브스크린 분할 원칙
- `tracks/_signals/main.md` — 메인 세션 최근 활동
- `game/BATTLE_RULES.md` — 기존 규칙 (일부 DEPRECATED)
- `game/docs/battle_logic_v2/1~19.png` — 스토리보드 원본

## ⚠️ 구현 시 주의사항 (반드시 지킬 것)

1. **레거시 파일 수정 금지** (`60_turnbattle.js` 등 기존 전투 파일). 신규 파일만 생성.
2. **`FEATURE.CINEMATIC_BATTLE=false` 기본**. 플래그 OFF 상태에서 레거시 전투 정상 동작 확인 필수.
3. **하드코딩 금지** — 모든 숫자는 상수/CSS 변수/데이터 테이블로. `Battle.beat()` 유틸 사용.
4. **마이그레이션 함수 먼저** 작성 + 단위 테스트. 원본 데이터 백업 (`.bak`).
5. **단계별 회귀 테스트** — 각 커밋 직후 `node tools/test_run.js` 8/8 확인.
6. **확장성 리뷰 필수** — 새 파일마다 `code-extensibility-reviewer` 호출.
7. **시그널 기록** — 작업 단위마다 `tracks/_signals/main.md` 에 한 줄.
8. **애매하면 멈추고 사용자 확인** — 임의 결정 금지.

---

<!-- Claude Code 지시사항: 이 문서는 이전 세션의 핸드오프입니다.
이 내용을 읽고 사용자에게 다음과 같이 응답하세요:

"🔄 핸드오프 복구 완료.

마지막 작업: PHASE 3 시네마틱 전투 기획서·규칙 파일 확정 (확정 사항 29개, 블로커 3개 해결 방안 문서화 완료)
다음 작업: /스킬이분할 스킬 실행 → SKILLS_DB 28개를 TRAITS_DB + SKILLS_DB 로 물리 분리 (P0-3 블로커 해결)
해결 안 된 것: 실제 코드 작성 아직 안 시작. 블로커 3개 해결 방안은 문서에만 존재. 미확정 11개 (에너지 회복량, 장비 상세, 데미지 공식 튜닝 등) 는 구현 중 결정.

이어서 '/스킬이분할' 부터 진행할까요?

(참고: 먼저 c:/work/game/PHASE3_BATTLE_CINEMATIC.md 와 c:/work/design/battle-v2-migration.md 를 읽어 컨텍스트 확보 권장.
그 후 /스킬이분할 → /수직슬라이스시작 순서로 진행. 확장성 11개 원칙 반드시 준수.)"

응답 후 사용자의 지시를 기다리세요. -->
