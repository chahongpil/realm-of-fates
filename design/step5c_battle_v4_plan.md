# Step 5C — Battle `.bv2-card` V4 이식 기획서

> 작성: 2026-04-21
> 작성자: 게임 총괄 (Claude)
> 승인 대기: **대표님**
> 출처: [handoff-2026-04-21-1115.md](../docs/handoff/handoff-2026-04-21-1115.md), [step5a_scan_2026-04-21.md](./step5a_scan_2026-04-21.md), [ui_inspection_2026-04-20-night.md](./ui_inspection_2026-04-20-night.md), [rules/06-card-ui-principles.md](../../.claude/rules/06-card-ui-principles.md)

## 0. 배경

Design System V4 확장이 **Tavern / Deckview / Formation / Cardselect / Castle / Church / Matching / Pick 8 화면 완결**. 마지막 남은 화면은 **전투 (Phase 3 시네마틱)** 이다. 전투는 카드 규격이 다른 **별도 규격**이라 Step 5A~5D 와는 분리된 기획이 필요하다.

### 현재 상태 스냅샷

| 항목 | 값 | 위치 |
|---|---|---|
| 기본 그리드 카드 | `.bv2-card` 172×248 (비율 ≈ 1:1.44) | [css/41_battle_v2.css:228-375](../css/41_battle_v2.css#L228) |
| 가로 예산 (row) | 5×172 + 4×14 gap = 916px (safe 182 each) | `--bv2-card-w/gap` |
| 세로 예산 | HUD 56 + enemy-row 280 + mid 68 + ally-row 296 = 700 (safe 20) | `--bv2-row-h/mid-h` |
| 중앙 확대 (focus) | `.bcf-main-card` = 172×1.8 → **310×446** (`--bv2-card-focus-scale:1.8`) | [css/41_battle_v2.css:559-583](../css/41_battle_v2.css#L559) |
| 액션 중 (fire) | `--bv2-card-action-scale:1.2` → 206×298 | 동일 |
| 호버 | `--bv2-card-hover-scale:1.15` = 198×285 | 동일 |
| DOM 빌더 | `buildCardEl(unit, side)` (7줄 innerHTML 문자열) | [js/60_turnbattle_v2.js:336-373](../js/60_turnbattle_v2.js#L336) |
| 상태 변경 | `refreshStageCard(unit)` — HP/NRG 텍스트 직접 덮어쓰기 | [js/60_turnbattle_v2.js:395-403](../js/60_turnbattle_v2.js#L395) |

### V4 컴포넌트 스냅샷 (참고)

| 항목 | 값 | 위치 |
|---|---|---|
| 표준 폭 | `--card-v4-w:260` → 260×455 (4:7 aspect) | [css/32_card_v4.css:25-35](../css/32_card_v4.css#L25) |
| 화면별 스코프 | Tavern 235 / Deckview 235 / Cardselect 160 / Matching 280 / Pick 260 / Formation 190 | 핸드오프 4/21 기록 |
| 구조 | `.art + .gild + .top + .bars + .parch(stats + desc) + ribbon/spark` | [css/32_card_v4.css](../css/32_card_v4.css) |
| Setter API | setHP/setNRG/setShield/setStatModifier/setStatus/setSelected | [js/40_cards.js:232-468](../js/40_cards.js#L232) |

---

## 1. 규격 충돌 — 핵심 문제

V4 표준은 **4:7 aspect** (세로가 더 김). bv2 는 **1:1.44** (세로가 짧음, 거의 정사각형에 가까움).

V4 를 4:7 로 강제하면:
- 폭 172 → 세로 301 필요
- row-h 280 → 321 (padding 포함)
- 총 세로 = 56 + 321 + 68 + 321 + 20 = **786 → 720 초과 66px**
- ❌ **불가능** — 뷰포트 고정 1280×720 변경은 [rules/01-project.md](../../.claude/rules/01-project.md) 절대 규칙 위반

→ **V4 4:7 강제 불가능**. 두 가지 선택지만 남음.

---

## 2. 설계 옵션 비교

### 옵션 A — Compact Battle Variant (권장 ⭐)

`.card-v4` 에 `.card-v4-compact` modifier 추가. 172×248 크기 유지, V4 시각 톤(양피지·금박·이모지 배지) 그대로. 내부 배치만 압축.

**압축 맵핑**
| 요소 | V4 표준 (260×455) | Compact (172×248) | 가독성 |
|---|---|---|---|
| `.top` (이름+Lv) | 42px 높이 | 32px, 이름 13px/Lv 8px | ✅ 기존 bv2c-name 과 유사 |
| `.bars` (HP/NRG) | 2×6px bar | 2×5px bar, gap 2 | ✅ 기존 bv2c-hp/nrg 대체 |
| `.parch` stats | 5칸 grid, 12px value | 5칸 grid, 9px value, 패딩 4 | ⚠️ 폰트 작음 (테스트 필요) |
| `.parch` desc | 3줄 italic | **숨김** (`.parch .desc{display:none}`) | ✅ 전투 중 설명문 불필요 |
| gild (금박) | 2px border + glow | 1.5px, glow 축소 | ✅ 등급 구분 유지 |
| 상태 배지 | 이름 위 정중앙 (기본) | 동일 | ✅ V4 setStatus 재사용 |

**장점**
- CSS 변수 + modifier 로 처리. `.card-v4` 본체 코드 건드릴 일 없음.
- setter API 전면 활용: `setHP`, `setNRG`, `setStatus`, `setStatModifier` — 기존 `refreshStageCard` 의 DOM querySelector 반복을 제거.
- 확대 상태(`.bcf-main-card`)는 별도 컴포넌트 교체 가능.

**단점**
- `.parch .desc` 숨김 → `.stat` 5칸 만으로 카드 하단 절반 채움. 양피지 면적이 비는 느낌 가능성.
- 9px 폰트 가독성은 Playwright 스크린샷으로 검증 필요.

---

### 옵션 B — V4 Stage 제외, 확대 화면만 V4

Stage (2×5 그리드) 는 `.bv2-card` 그대로 두고, 확대(`bcf-main-card`) 만 `.card-v4` 로 교체.

**장점**
- Stage 건드리지 않아 **리스크 최소**.
- 확대 310×446 이 V4 Formation 190×333 과 비슷한 스케일. Compact variant 안 만들어도 됨.

**단점**
- **시각적 비일관성**: 그리드는 어두운 고딕 (적색 프레임), 확대는 양피지 금박. 전환 애니(FLIP origin) 가 어색해짐.
- Design System V4 도입 목적("통일") 반 달성.
- 대표님이 전투 중에도 V4 톤을 원했다면 다음 세션에 다시 수정해야 함 (재작업 리스크).

---

### 옵션 C — Row 높이 확장 + V4 4:7 강제

`--bv2-row-h 280→321`. 세로 예산 초과분 66px 를 HUD/mid 에서 빼거나 뷰포트 확장.

**장점**
- V4 완전 통일 (modifier 없음).

**단점**
- ❌ [rules/01-project.md](../../.claude/rules/01-project.md) 뷰포트 1280×720 고정 위반.
- HUD 56→24 로 압축 시 타이머·버튼 바 깨짐 (검수관 블로커 #1~#2 재발).
- 대표님 동의 없이 채택 불가.

---

## 3. 권장 — **옵션 A (Compact Variant)**

이유:
1. **뷰포트 고정 준수** — 세로 예산 문제 없음.
2. **시각 통일** — 8화면 V4 톤과 전투 톤 일치.
3. **setter API 완전 활용 기회** — refreshStageCard 의 DOM 조작을 setter 로 대체하면 B2 API 실전 검증이 전투에서 이뤄짐.
4. **리스크 격리** — `.card-v4-compact` modifier 로 표준 V4 는 무변경.

옵션 A 안에서 단계를 A-1 ~ A-4 로 분해.

---

## 4. 실행 플랜 (옵션 A 전제)

### Step 5C-A1 — Compact Variant CSS (~45분)

**파일**: `css/32_card_v4.css` **하단 append** (별도 블록, 기본 V4 규칙은 불변)

```css
/* ===== Battle Compact Variant (Step 5C) =====
   bv2 stage 규격 172×248 에 V4 톤 이식.
   aspect-ratio 제거, height 명시. parch.desc 숨김, stats 폰트 축소. */
.card-v4.card-v4-compact {
  width: var(--card-v4-w, 172px);
  height: 248px;
  aspect-ratio: auto;  /* 4:7 해제 */
}
.card-v4-compact .top { padding: 3px 6px; }
.card-v4-compact .name { font-size: 11px; }
.card-v4-compact .lv   { font-size: 8px; padding: 2px 4px; }
.card-v4-compact .bars { top: 30px; gap: 2px; }
.card-v4-compact .bar  { height: 5px; }
.card-v4-compact .bar .lbl { font-size: 7px; }
.card-v4-compact .parch { padding: 4px 6px; gap: 3px; }
.card-v4-compact .stats { gap: 2px; padding-bottom: 4px; }
.card-v4-compact .stat .l { font-size: 7px; }
.card-v4-compact .stat .v { font-size: 9px; }
.card-v4-compact .parch .desc { display: none; }  /* 전투 중 설명문 불필요 */
```

**파일**: `css/41_battle_v2.css` — **기존 `.bv2-card` 상태 블록을 `.card-v4.card-v4-compact` 셀렉터로도 적용**

```css
/* Step 5C: V4 compact 에도 상태 전달 */
.card-v4-compact.is-selected { visibility: hidden; }
.card-v4-compact.is-target-valid .gild { border-color: var(--bv2-danger); ... }
.card-v4-compact.is-target-hover .gild { border-color: #ffaa00; ... }
.card-v4-compact.is-hit { animation: bv2CardShake var(--bv2-dur-shake) ease-out; }
.card-v4-compact.is-dead { opacity: 0; visibility: hidden; pointer-events: none; }
.card-v4-compact.is-dying-melt  { animation: bv2CardMelt  var(--bv2-dur-death) ease-out forwards; }
.card-v4-compact.is-dying-crush { animation: bv2CardCrush var(--bv2-dur-death) ease-in  forwards; }
.card-v4-compact.is-acted  { filter: grayscale(1) brightness(.6); opacity: .6; pointer-events: none; }
.card-v4-compact.is-queued { pointer-events: none; }
.card-v4-compact.is-queued .gild { border-color: #66dd88; box-shadow: ...; }
.card-v4-compact.is-dimmed { filter: grayscale(1) brightness(.45); pointer-events: none; }
```

**주의**: `.bv2c-frame` 기반 상태 규칙을 `.gild` 로 옮긴다 (V4 프레임 선택자). `.bv2c-frame` 규칙은 compact variant 에 안 타도록 분리 유지.

---

### Step 5C-A2 — Stage 카드 렌더 교체 (~60분)

**파일**: `js/60_turnbattle_v2.js`

1. **`buildCardEl` 전면 교체** (L336-373):
   ```js
   const buildCardEl = function(unit, side){
     const inst = RoF.CardV4Component.create(unit, {});
     const el = inst.el;
     el.classList.add('card-v4-compact', 'bv2-card-' + side);
     if(unit.isHero) el.classList.add('bv2-card-hero');
     el.setAttribute('data-unit-id', unit.id);
     el.setAttribute('data-action', side === 'ally' ? 'v2.charClick' : 'v2.targetClick');
     el.setAttribute('data-hover', side === 'ally' ? '' : 'v2.targetHover');
     // 초기 HP/NRG 동기화 (currentHp 는 전투 상태값이라 create 의 unit.hp 와 다를 수 있음)
     inst.setHP(unit.currentHp != null ? unit.currentHp : (unit.hp || 0));
     inst.setNRG(unit.currentNrg != null ? unit.currentNrg : 0);
     // 인스턴스 맵 저장 (refreshStageCard 에서 사용)
     Battle._stageInstances = Battle._stageInstances || {};
     Battle._stageInstances[unit.id] = inst;
     return el;
   };
   ```

2. **`refreshStageCard` 를 setter 기반으로 교체** (L395-403):
   ```js
   const refreshStageCard = function(unit){
     const inst = (Battle._stageInstances || {})[unit.id];
     if(!inst) return;
     inst.setHP(unit.currentHp);
     inst.setNRG(unit.currentNrg ?? 0);
     // 상태이상 동기화
     ['burn', 'poison', 'frozen', 'invincible'].forEach(k => {
       inst.setStatus(k, unit.statuses?.[k] || 0);
     });
     if(unit.shield != null) inst.setShield(unit.shield);
     if(!Battle.isDead(unit)) inst.el.classList.remove('is-dead');
   };
   ```

3. **`stageCardOf` 를 V4 셀렉터로 변경** (L385-389):
   ```js
   const stageCardOf = function(unit){
     if(!unit) return null;
     return document.querySelector('.battle-stage-grid .card-v4[data-uid="' + unit.id + '"]');
     //                                                   ^^^^^^ V4 는 data-uid 사용
   };
   ```

   **주의**: V4 컴포넌트는 `data-uid` 를 쓰고 bv2 는 `data-unit-id` 를 썼다. 두 속성 모두 달아주거나, stageCardOf 를 `[data-unit-id]` 로 유지하고 create 후에 setAttribute 로 해결.

4. **기타 셀렉터 일괄 치환**: `.bv2-card` → `.card-v4.card-v4-compact` (9개 위치, Grep 결과 기준).

---

### Step 5C-A3 — Focus 확대 카드 V4 교체 (~90분, 별도 결정)

`.bcf-main-card` 는 별도 DOM (카드 구성요소가 `.bcf-card-img`, `.bcf-hp` 등 bcf-* 셀렉터로 직접 렌더). Step 5C-A2 의 stage 카드와 독립이라 **별도 이식 필요**.

**옵션 A3-1** (권장): CardV4Component.create() 로 교체 + `--card-v4-w:310px` 스코프
- `bcf-card-img`, `bcf-hp`, `bcf-stats`, `bcf-desc` 등 ~10개 자식 요소 DOM 구조 제거.
- HP/NRG 변경은 inst.setHP() 로.
- 위치 (translate -50% -58%) + FLIP origin 은 wrapper div 가 맡음.

**옵션 A3-2**: bcf-main-card 는 그대로 두고 확대 상태(스토리보드 3·5번) 에서만 V4 톤 CSS 이식
- 리스크 낮으나 stage 와 focus 가 다른 컴포넌트 쓰면 유지보수 부담.

→ Step 5C-A2 완료 후 Playwright 로 stage 완성도 확인하고, **A3 는 별도 승인** 권장.

---

### Step 5C-A4 — 검증 (~30분)

1. **Playwright 전투 진입 스크린샷**
   - `shots/battle_v4_compact_stage.png` — 10장 그리드, V4 양피지 톤
   - `shots/battle_v4_compact_selected.png` — 선택 시 stage 카드 hidden, focus 만 표시
   - `shots/battle_v4_compact_dying.png` — 사망 연출 (melt/crush)

2. **회귀 9/9**: `npm run test:run` 또는 `node tools/test_run.js`

3. **ui-inspector 호출** — 검수관이 전투 카드 가독성(9px 스탯) 블로커 판정

4. **rof-play-director 호출** — login → battle 플로우 실측 (선택, 심층 검수)

---

## 5. 리스크 정리

| # | 리스크 | 완화책 |
|---|---|---|
| R1 | **9px 스탯 폰트 가독성** — Cinzel 세리프 + 9px 는 모바일에서 번짐 가능 | A1 후 즉시 Playwright 캡처, 안 되면 10px 로 올리고 padding 축소 |
| R2 | **parch.desc 숨김 → 양피지 빈 공간** | stats 5칸 아래 10px여백만 두고, 필요하면 stats grid 를 세로 확장 (grid-template-rows: 5칸 → 2행 분배) |
| R3 | **상태 클래스 `.bv2c-frame` → `.gild` 재작성 누락** | Grep 로 `.bv2c-frame` 전수 확인 후 `.gild` 대응 규칙 작성, 한 번에 블록 단위 교체 |
| R4 | **data-unit-id vs data-uid 충돌** | create 직후 `el.setAttribute('data-unit-id', unit.id)` 병행 설정 (하위호환) |
| R5 | **refreshStageCard 가 아직 statuses/shield 필드를 안 쓰고 있음** — unit 객체 shape 확인 필요 | Grep 로 `u.statuses`, `u.shield` 실제 사용 검증. 없으면 그냥 setHP/setNRG 만 호출 |
| R6 | **FLIP origin 애니가 .card-v4 위에서 깨질 가능성** — applyFocusOrigin 은 srcEl rect 만 사용하므로 거의 안전, but bv2CardFocusIn 키프레임이 .bcf-main-card 에 걸려있어 stage 에는 영향 없음 | Step 5C-A2 후 "클릭 시 stage→focus 전환" 시점만 Playwright 로 캡처 검증 |
| R7 | **스타일 선택자 폭주** — `.card-v4-compact.is-target-valid .gild` 같은 깊은 셀렉터 10개+ | 블록 단위로 묶어서 1 파일(`41_battle_v2.css`) 하단에만 배치. 기존 `.bv2-card` 블록은 legacy 주석 처리 후 보존 |

---

## 6. 롤백 플랜

Step 5C-A2 커밋 후 블로커 발견 시:
1. `git revert <commit>` 으로 데이터/CSS 동시 되돌림
2. `.bv2-card` 렌더 경로는 모두 보존하므로 즉시 회귀 가능
3. `.card-v4-compact` CSS 는 참조 셀렉터가 없어지면 dead code, 삭제해도 무관

---

## 7. 공수 총합

| 단계 | 소요 | 누적 |
|---|---|---|
| A1 CSS Compact Variant | 45분 | 0:45 |
| A2 Stage 렌더 교체 | 60분 | 1:45 |
| A3 Focus 카드 교체 (별도 승인) | 90분 | 3:15 |
| A4 검증 + 수정 | 30분 | **3:45** |

**반나절 규모 추정과 일치** (3~4시간).

A3 를 분리 시 Stage 만으로 ~2:15. 대표님이 "일단 stage 만" 선택하면 1세션으로 마무리 가능.

---

## 8. 결정이 필요한 부분 — 대표님 확인

1. **옵션 A (Compact Variant) 채택하나?** vs 옵션 B (확대만 V4)
2. **A3 (Focus 카드 교체) 포함하나?** 분리해서 별도 기획으로 갈지
3. **9px 스탯 허용선?** Playwright 캡처 보고 판단 후 10~11px 상향 가능 (변수 조정)
4. **parch.desc 숨김 vs 단축(1줄)?** — 설명문이 전투 중에 필요한지 UX 판단

---

## 9. 참고 커밋·문서

- `8094996` DS Step 4B — V4 최초 이식 (Tavern)
- `c070985` Step 5B — Castle/Church/Matching V4 확장 (최근 반나절 사례, 공수 견본)
- `28341d5` B2 setter API 이식 — setHP/setNRG/setStatus 도입 근거
- [design/card-layout.md](./card-layout.md) — bv2 카드 레이아웃 원본
- [design/battle_storyboard_spec.md](./battle_storyboard_spec.md) — 전투 스토리보드 요구사항
- [rules/06-card-ui-principles.md](../../.claude/rules/06-card-ui-principles.md) — 172×248 / 430×620 규격 원출처
