# Step 4A/4B Code Review - V4 Illuminated Manuscript Card

> 작성: 2026-04-20
> 리뷰 대상: css/32_card_v4.css, js/40_cards.js:206-321 (mkCardElV4), css/42_screens.css:331-345 (#tav-grid override)
> 원칙: feedback_extensibility_first.md (11개 확장성 패턴) + rules/04-balance.md + rules/06-card-ui-principles.md
> 결론(요약): Step 5(Collection/Formation/Battle 확장) 전에 하드코딩된 카드 폭/그리드 토큰을 뺀 후 확장 권장. 나머지는 굴러가면서 수렴 가능.

---

## BLOCKER - Step 5 확장을 실질적으로 막는 구조 결함

### B1. 카드 폭 260px / 235px 가 .card-v4 와 #tav-grid 양쪽에 하드코딩 (매직 넘버 #1)

- 파일: css/32_card_v4.css:26, css/42_screens.css:337 / 342 / 343
- 증거 (코드블록):
    - .card-v4 { width: 260px; aspect-ratio: 4/7; }
    - #tav-grid { grid-template-columns: repeat(auto-fill, 235px) !important; }
    - #tav-grid .card-v4 { width:235px !important; }
    - #tav-grid .tavern-card-wrap { width:235px; }
- 문제:
    - V4 설계 폭 260 에서 Tavern 축소 폭 235 는 두 CSS 파일에 세 번 중복 기재. Step 5 에서 Collection 220, Formation 180, Battle 172 등 다른 폭을 쓰면 override 3단 패턴이 복제된다 -> 유지 불가.
    - !important 가 붙은 폭은 wrapper 가 새 사이즈로 override 하려면 또 !important 를 쏴야 함 -> 특이성 전쟁.
- 수정 제안 (Step 5 이전 1일 작업):
    1. 10_tokens.css 에 V4 용 토큰 추가: --card-v4-w: 260px; --card-v4-scale-tavern: .904; --card-v4-w-tavern: calc(var(--card-v4-w) * var(--card-v4-scale-tavern)); --card-v4-gap: 10px;
    2. .card-v4 는 width: var(--card-v4-w) 만 선언.
    3. #tav-grid override 는 wrapper 에 --card-v4-w: var(--card-v4-w-tavern) 를 덮어쓰는 방식으로 교체. !important 제거.
    4. Step 5 에서 Collection/Formation/Battle 각자 자기 스코프에서 --card-v4-w 만 덮으면 끝.

### B2. mkCardElV4 vs CardComponent - 두 번째 카드 빌더가 독립 경로로 분기

- 파일: js/40_cards.js:183-185 (mkCardEl -> CardComponent 위임) vs js/40_cards.js:223-317 (mkCardElV4 직접 DOM 빌드)
- 문제:
    - mkCardEl 은 setHP/setNRG/setShield/setStatModifier/setStatus/setSelected/rebuild 인스턴스 API 를 노출. mkCardElV4 는 el 만 반환 -> Tavern 은 정적이라 지금은 OK 지만 Battle 로 확장하는 순간 setHP(n) 이 없어서 전투 루프가 안 돌아감.
    - 위 주석 (L211 호출부에서만 교체) 이 계획을 선언하지만 업그레이드 경로가 코드로 예약되어 있지 않음 (테스트도 없음) -> 다음 세션이 복붙으로 setter 를 재구현할 위험.
    - Step 5 에서 Battle 로 갈 때 두 빌더를 병행하면 V2 는 setHP 됨 / V4 는 innerHTML 재빌드 의 이중 경로가 고착.
- 수정 제안 (Step 5 직전):
    1. CardComponent.create(unit, { mode, variant: v4 }) 로 variant 플래그 도입. 변환 레이어에서 card-v4 클래스와 DOM 구조를 분기하되 setter 는 공유.
    2. 또는 RoF.CardComponentV4 를 정식으로 같은 API 시그니처로 구현(createInst 래퍼).
    3. 레거시 호환 레이어(11번 원칙): mkCardElV4 는 새 인스턴스의 .el 을 그대로 반환하도록 얇게 감싸서 유지 - Tavern 호출부 불변.
    4. 플래그 토글 (7번 원칙): FEATURE.CARD_V4_UNIFIED 가 OFF 면 현재 독립 빌더, ON 이면 CardComponent variant 경로. Step 5 단계적 전환.

### B3. !important 4개 override - 인라인 스타일 존재 전제

- 파일: css/42_screens.css:336-338, 342
- 증거: display:grid !important; grid-template-columns:...!important; gap:10px !important; justify-content:center !important; / #tav-grid .card-v4 { width:235px !important; }
- 문제:
    - !important 는 보통 극복할 수 없는 선행 특이성 의 표시. #tav-grid 는 ID 선택자라 특이성 충분 -> !important 의 진짜 이유는 tavern 화면 DOM 에 아직 인라인 style 가 남아 있다 로 추정 (위 래퍼 div[style*=text-align:center] 패턴과 일치).
    - Step 5 에서 다른 화면 그리드로 확장할 때, 각 화면마다 !important 4-5개 세트를 복붙하게 됨.
- 수정 제안:
    1. js/52_game_tavern.js 에서 #tav-grid 에 심는 인라인 style= 문자열을 먼저 grep -> 남은 인라인(display:flex 등)을 CSS 로 이관.
    2. 인라인 제거 후 !important 4개 삭제.
    3. 장기: Step 5 전에 뷰(JS)는 클래스만 부여, 레이아웃은 CSS 규칙을 명문화.

---

## IMPROVEMENT - 확장 시 부채가 되는 부분

### I1. 스탯 매핑 CRIT = unit.luck, EVA = unit.eva 가 빌더 안에 하드코딩 (매직 매핑 #2)

- 파일: js/40_cards.js:236-237, 304-308
- 증거: const crit = c.luck != null ? c.luck : 0; / const eva = c.eva != null ? c.eva : 0; / stats.appendChild(mkStat(CRIT, crit + %));
- 문제:
    - rules/04-balance.md 의 치명타 공식 critRate = (caster.luck + skill.critBonus) / 100 을 카드 표시에서는 luck 원값만 %로 표시. 실제 크리트율과 표시값 괴리 가능 (스킬 critBonus 미반영).
    - 데이터 구조 변경 시(예: unit.crit 필드 신설, luck 을 다른 용도로 분리) 이 빌더만 고쳐야 함 -> 다른 빌더 있으면 드리프트.
    - eva 는 현재 데이터(js/11_data_units.js)에서 필드명이 eva 인지 evasion 인지 확인 안 된 상태로 ?? 0 fallback - 전부 0 으로만 나올 리스크.
- 수정 제안:
    1. js/11_data_units.js 의 실제 필드명 확인 후, js/20_helpers.js 에 RoF.stats.displayCrit(unit) / displayEva(unit) 헬퍼 추가. 빌더는 헬퍼만 호출.
    2. 통일 라벨 테이블 (STAT_ROWS 배열): {label: ATK, get: u => u.atk ?? 0} 같은 레코드 5개 -> STAT_ROWS.forEach(r => stats.appendChild(mkStat(r.label, r.get(c)))). 데이터 드리븐(2번 원칙), 6개 스탯 추가 시 한 줄만 추가.
    3. test_run.js 에 bronze 카드 한 장의 CRIT 표시값 == luck 회귀 체크 추가 (9번 원칙 테스트 훅).

### I2. 숫자 8/10/6/3/42/6 등 패딩/좌표 하드코딩 - V4 시각 토큰 누락 (매직 넘버 #3)

- 파일: css/32_card_v4.css:61, 88, 126, 144, 160, 174-180 전반
- 증거:
    - .top { top: 8px; left: 8px; right: 8px; padding: 7px 10px; }
    - .bars { left: 8px; right: 8px; top: 42px; }
    - .parch { left: 6px; right: 6px; bottom: 6px; padding: 8px 10px; }
    - .desc { font: 400 10.5px/1.55 ...; min-height: calc(1.55em * 3); }
    - .desc::first-letter { font: 900 18px/1 ...; }
- 문제:
    - V4 를 Collection(약 220px) / Battle(172px 또는 430px 확대) 로 확장할 때 내부 패딩/폰트가 비례 축소 안 됨. 172px 카드에서 top:42px 는 카드 높이의 14% 를 점유해 레이아웃 파괴.
    - rules/06-card-ui-principles.md 가 카드 크기 전환은 --battle-card-scale 로 통제, 하드코딩 금지 를 명시 -> V4 도 같은 규칙에 붙어야 함.
- 수정 제안:
    1. .card-v4 안에서 em 단위 또는 calc(var(--card-v4-w) * N) 비례 스케일.
    2. 또는 --card-v4-pad: 8px; --card-v4-top-h: 42px; 같은 카드 내부 토큰 묶음을 10_tokens.css 에 정리 -> Battle variant 에서 값만 치환.
    3. 폰트 크기는 clamp(9px, calc(var(--card-v4-w) * .06), 16px) 같은 반응형.

### I3. gap: 10px, grid auto-fill: 235px - 그리드 토큰 부재 (매직 넘버 #4)

- 파일: css/42_screens.css:337-338
- 증거: 위 B1 과 동일 블록.
- 문제: B1 의 하위 이슈. Collection 에서 6 columns x 180px gap 8 을 만들 때 이 블록을 복붙/수정하게 됨.
- 수정 제안: --grid-card-w, --grid-card-gap 토큰화. 각 화면은 body.game-mode #collection-grid { --grid-card-w: 180px; --grid-card-gap: 8px; } 만 선언하고, 공통 그리드 규칙은 한 군데만 유지.

### I4. Parchment desc 3줄 -webkit-line-clamp:3 고정 - Rule-based truncation 누락

- 파일: css/32_card_v4.css:168-173
- 증거: min-height: calc(1.55em * 3); -webkit-line-clamp: 3;
- 문제: 설명이 4-5줄 필요한 전설/신 카드가 소리 없이 잘림. Battle tooltip 에서는 풀 텍스트 필요할 수 있음.
- 수정 제안: variant 별 lineclamp 토큰(--card-v4-desc-lines: 3), 또는 mkCardElV4 가 초과 시 title 속성에 풀 텍스트 삽입.

### I5. Legacy 호환 레이어 window.mkCardElV4 전역 노출 - 모듈 경계 흐림

- 파일: js/40_cards.js:321
- 문제: RoF.dom.mkCardElV4 가 정식 네임스페이스, window.mkCardElV4 는 편의 alias. Step 5 에서 4-5 화면이 전부 window.* 로 호출하면 RoF 네임스페이스의 의미가 희석.
- 수정 제안: 신규 호출부는 RoF.dom.mkCardElV4 를 쓰는 규칙을 rules/ 에 명문화. window alias 는 기존 호출부 호환 주석 강화.

### I6. Divine ribbon 텍스트 DIVINE 하드코딩 - i18n/로컬라이즈 불가

- 파일: js/40_cards.js:272
- 증거: rb.textContent = DIVINE;
- 문제: UI 텍스트를 판타지 세계관 몰입형 한국어 로 쓰라는 CLAUDE.md 규칙과 충돌. Divine = 신 이므로 표시 규칙(rules/03-terminology.md)에 어긋날 수 있음.
- 수정 제안: RARITY_LABEL_I18N.divine = 신 같은 테이블을 js/12_data_* 또는 20_helpers.js 에 둠 -> rb.textContent = RARITY_LABEL_I18N[rarity] 또는 빈 문자열.

---

## GOOD - 유지/강화할 것

### G1. .card-v4 prefix 격리 (css/32_card_v4.css 파일 헤더 주석 명시)
- 기존 .card, .card-v2 와 선택자가 1개도 겹치지 않음. Step 5 에서 V2 를 한동안 유지한 채 V4 를 점진 도입하는 병렬 가동(11번 원칙) 이 구조적으로 가능.
- 유지 권장: Collection/Formation/Battle 로 옮길 때도 .card-v4 스코프 유지. 새 변종은 .card-v4.variant-battle 같은 variant 클래스 추가 패턴으로.

### G2. DS 토큰 참조 (--parchment-*, --ink-*, --rubric*, --gilt, --rar-*, --curr-gold)
- 10_tokens.css 섹션 14 의 Illuminated Manuscript 토큰을 직접 색 hex 로 복붙하지 않고 변수로 참조 (L51 --gilt, L127 --parchment-2 등). 디자인 시스템이 움직이면 카드가 자동으로 따라감.
- Divine element-shifted inner stroke 의 .card-v4.rar-divine.el-fire .gild { --div-inner: var(--rar-divine-fire); } 패턴은 데이터 드리븐 원칙(2번) 의 모범. 원소 추가 시 한 줄만 append.

### G3. rarity 내부 ID bronze/silver/gold/legendary/divine 고정 - 마이그레이션 0
- rules/03-terminology.md 의 내부 ID 유지, 표시 레이어에서만 변환 원칙 충실.
- el.className = card-v4 rar- + rarity 패턴은 switch-case(2번 원칙 위반) 없음. 칭찬.

### G4. XSS 방지 - textContent + createElement 빌더 사용
- js/40_cards.js:248 주석 XSS 방지: textContent 로 주입 + 실제 DOM 빌더 사용. mkRelicEl(L190) 의 innerHTML 패턴과 구분됨 -> V4 는 모범 사례.
- 단 L287-290 의 .bars 만 innerHTML. 유저 입력이 안 들어오는 영역이라 현실적 위험은 낮지만, 일관성 차원에서 DOM 빌더로 통일하면 완벽.

### G5. Legendary sparkles / Divine ribbon 을 클래스 분기로만 관리
- if(rarity === legendary), if(rarity === divine) - 현재는 switch 임계(2번 원칙)에 살짝 걸치지만 카드 당 1-2개 분기라 OK. RARITY_DECORATIONS 레지스트리로 추출하면 만점이지만 Step 4 시점에선 과설계.

### G6. prefers-reduced-motion 미디어 쿼리 (L266-268)
- 접근성 고려. rules/ 에 명시 규칙 없는데도 선제적 구현. 유지.

---

## Step 5 전 해결 권장 (우선순위)

반드시 (Step 5 시작 전 1-2일):
1. B1 - --card-v4-w 토큰화, !important 폭 지정 제거. 이걸 안 하면 Collection/Formation/Battle 로 넘어가는 순간 폭 하드코딩이 4배로 복제됨.
2. B3 - tavern 인라인 스타일 grep -> CSS 이관 -> !important 제거. 이후 화면들도 같은 청소가 필요해지기 전에 패턴 확립.
3. I1 - STAT_ROWS 테이블 + displayCrit/displayEva 헬퍼. 데이터 구조 변경 저항력이 여기서 결정됨.

권장 (Step 5 진행 중 병행):
4. B2 - CardComponent variant 통합 설계 문서화. 실제 통합은 Battle 변환 시점에 해도 되지만 계획은 Step 5 진입 전에 확정. 두 경로가 6개월 이상 병행되면 회수 불가.
5. I2, I3 - 내부 패딩/그리드 토큰화. Collection/Formation 은 버텨도 Battle 확대 172->430 전환 시 필수.

여유 있을 때:
6. I4 (desc clamp variant), I5 (window alias 규칙), I6 (DIVINE 한글화).

---

## 확장성 점수 (0-10)

| 축 | 점수 | 비고 |
|---|---|---|
| 매직 넘버 | 4/10 | 색은 토큰화 우수 / 폭/패딩/라인수 하드코딩 |
| 데이터 드리븐 | 7/10 | Divine x 원소 모범 / 스탯 테이블은 인라인 |
| 플래그 토글 | 3/10 | mkCardElV4 는 플래그 없이 Tavern 에 바로 박힘. 롤백 경로는 52_game_tavern.js 호출만 바꾸면 됨 수준 |
| 마이그레이션 안전 | 8/10 | .card-v4 prefix 격리로 V2 와 병렬 가동 가능 / CardComponent API 불일치만 주의 |
| 단일 책임 | 7/10 | mkCardElV4 는 DOM 빌드 책임 집중 OK / 스탯 매핑 로직이 빌더 내부에 섞인 점만 감점 |
| 총점 | 29/50 | 중간. Step 5 전 B1/B3/I1 처리로 38-40 도달 가능. |

---

## 참고 - 11개 패턴 체크리스트 적용

| # | 패턴 | 결과 | 해당 이슈 |
|---|---|---|---|
| 1 | 매직 넘버 | 위반 | B1, I2, I3 |
| 2 | switch-case 타입 분기 | 경미 | G5 (rarity 분기 2개, 허용 범위) |
| 3 | 마이그레이션 안전장치 | OK | G1 (prefix 격리) |
| 4 | 단일 책임 | 경미 | I1 (스탯 매핑이 빌더 내부) |
| 5 | 강결합 인라인 이벤트 | OK | V4 에는 onclick 없음 |
| 6 | 기본값 정의 | OK | ?? 0 fallback 전반 |
| 7 | 플래그 토글 | 위반 | B2 (FEATURE.CARD_V4_UNIFIED 없음) |
| 8 | 슬롯/훅 구조 | 경미 | bars 만 innerHTML (G4) |
| 9 | 테스트 훅 | 위반 | I1 (test_run.js 미추가) |
| 10 | 네이밍 일관성 | OK | card-v4 / rar-* / el-* 일관 |
| 11 | 레거시 호환 레이어 | OK | mkCardEl / mkCardElV4 독립, V2 유지 |
