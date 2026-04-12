# PHASE 2 — 카드 컴포넌트 통합 기획서 (CardComponent Unify)

> 작성: 2026-04-12 저녁
> 담당: 메인(기획 → 구현) · rof-ui-inspector / rof-play-director / game-designer (검증)
> 근거: 2026-04-12 긴급 메타 회의 — 사용자가 동일 카드 UI 버그를 **3회째** 지적. 4개 에이전트 병렬 감사 결과 "char-select 화면이 `.card-v2` 렌더러를 우회하는 별도 경로" 확인. 사용자 제안: "일러스트+프레임+숫자를 하나로 묶고, 게임 중엔 숫자 값만 교체하게 하자."

---

## 1. 배경 — 왜 같은 버그가 3번 재발하는가

이번 세션에 우리는 다음을 구축했음에도 카드 UI 버그가 재발:

- `css/11_frame_coords.json` — 프레임 좌표 진실의 원천
- `css/11_frame_coords.css` — JSON에서 자동 생성되는 CSS 변수
- `tools/test_run.js` `card-coords` 골든 시나리오 (±1.5% 오차 FAIL)
- PostToolUse 훅으로 CSS/JS 변경 시 자동 회귀
- rof-ui-inspector / rof-play-director / game-designer / rof-game-director 4개 감사 에이전트

**그런데 사용자가 캐릭터 선택 화면에서 본 것**:
- 좌측 카드 능력 텍스트 영역에 `[액티브 90%] 신성: HP4회복 (에너지2)` 가 raw 노출 (사용자 전사: "전설/HP4/X(2)")
- 3장 카드의 HP / NRG / 스탯 좌표가 카드마다 미세하게 다름
- 프레임 PNG, 좌측 세로 스탯 박스, 우하단 NRG 마름모가 아예 적용 안 됨

### 근본 원인 (4개 에이전트 합의)

**char-select 화면은 `.card-v2` 렌더러를 완전히 우회하는 별도 경로**다.

| 항목 | 덱뷰 (통과) | char-select (깨짐) |
|---|---|---|
| DOM 클래스 | `.card-v2.bronze` | `.char-option` (inline `width:200px`) |
| 렌더 경로 | `mkCardEl()` → 프레임 PNG + `.cv-*` 좌표 슬롯 | `js/32_auth.js` `_showStep2()` inline `innerHTML` 문자열 |
| 좌표 기준 | `11_frame_coords.json` 대조 | 없음 (CSS flex 자연 배치) |
| 텍스트 포매팅 | `40_cards.js:16` 의 `[...]` 접두사 스트립 | `u.skillDesc` 원본 그대로 박음 |

즉 **골든 테스트 8 passed는 거짓 안심**이다. 테스트가 측정한 건 `.card-v2` 의 좌표뿐, 사용자가 실제로 보는 화면의 카드가 아니었음.

### 진짜 근본 원인 한 줄

**"카드"라는 개념이 코드상 단일 컴포넌트가 아니라 화면마다 제각기 재발명되는 inline HTML 템플릿이다.** 렌더 경로가 복수이므로 검증을 아무리 늘려도 새 경로가 생기면 그 경로는 구조적으로 블라인드 스팟.

---

## 2. 목표 (This Plan)

카드를 **불변(immutable) 합성물 + 제한된 mutable slot** 모델로 재구성한다.

### 핵심 원칙

1. **단일 생성자** — 모든 카드는 `CardComponent(unit, mode)` **하나의 함수**에서만 태어난다. 다른 어떤 코드도 카드 DOM을 `innerHTML` 로 조립하지 않는다.
2. **합성 시점에 모든 값 확정** — 생성 시점에 프레임 PNG, 일러스트, 이름, 능력 텍스트, 모든 스탯 숫자가 **완전히 렌더된 상태**로 Element 반환. "나중에 채워 넣기" 금지.
3. **런타임 변경 축 제한** — 생성 이후 변경 가능한 것은 **전투 중 변동 가능한 값**뿐:
   - `.setHP(n)` — 피해/치유 반영 (현재 HP)
   - `.setNRG(n)` — 스킬 소비/회복 (현재 NRG)
   - `.setShield(n)` — 보호막 업데이트
   - `.setStatModifier(stat, delta)` — ATK/DEF/SPD 버프·디버프 (§3.5 참조)
   - `.setStatus(effect, turns)` — 상태효과 뱃지
   - `.setSelected(bool)` — 선택 오라
   - 그 외 (이름/능력텍스트/**최대** HP/**최대** NRG/프레임/일러스트/기본 ATK-DEF-SPD) **절대 불변**
4. **렌더 모드로 크기/축약만** — `mode: 'deck' | 'select' | 'battle' | 'hand' | 'portrait'` 는 **CSS transform scale + 일부 슬롯 숨김** 만 제어. 레이아웃 자체를 바꾸지 않는다.

### 이 기획이 해결하는 것

- ✅ char-select의 raw 텍스트 노출 — 단일 경로라 `[액티브 X%]` 스트립이 자동 적용
- ✅ 카드마다 좌표가 다른 문제 — 구조적으로 같은 DOM이므로 불가능
- ✅ 새 화면 추가 시 재발 — 새 화면이 카드를 그리려면 `CardComponent()` 외 선택지가 없음
- ✅ Unity 전환 포팅 — `CardView.prefab` + `ScriptableObject<UnitData>` 로 1:1 매핑
- ✅ 골든 테스트의 거짓 안심 — 한 경로만 테스트하면 전 화면이 검증됨

---

## 3. API 설계

### 3.1 생성자

```js
// js/card_component.js (신규 파일)

/**
 * @param {Unit} unit - 11_data_units.js 의 유닛 데이터 (불변 참조)
 * @param {object} opts
 * @param {'deck'|'select'|'battle'|'hand'|'portrait'} opts.mode
 * @param {number} [opts.scale=1] - CSS transform scale, 레이아웃엔 영향 X
 * @returns {CardInstance}
 */
function CardComponent(unit, opts) { ... }
```

### 3.2 반환값 (CardInstance)

```js
{
  el: HTMLElement,           // 완성된 .card-v2 루트. 즉시 append 가능.
  unit: Unit,                // 원본 참조 (읽기 전용)

  // mutable slot setters (이것만 호출 허용)
  setHP(n)      { ... },   // 현재 HP (0 ~ unit.hp 범위)
  setNRG(n)     { ... },   // 현재 NRG (0 ~ unit.nrg 범위)
  setShield(n)  { ... },   // 0이면 자동 숨김
  setStatModifier(stat, delta) { ... },  // §3.5
  setStatus(effect, turns) { ... },      // burn/poison/frozen/invincible
  setSelected(on) { ... },

  // 정리
  destroy() { ... },
}
```

### 3.5 ATK/DEF/SPD 버프·디버프 정책

전투 중 "전사의 함성 +2 ATK 2턴" 같은 **일시적 스탯 변경**은 자주 발생. 이걸 어떻게 표현할지는 2가지 선택지가 있고, 본 기획은 **B안(오버레이 방식)** 을 채택한다.

#### A안 — 숫자 자체 교체 (기각)
```js
card.setStatModifier('atk', +2);  // "5" → "7" 로 텍스트 바꿈
```
- 장점: 단순
- 단점:
  1. 버프 해제 시 원본 복원 로직 필요 → 상태 관리 복잡
  2. "원래 스탯"과 "현재 스탯"이 시각적으로 구분 안 됨 → 플레이어가 버프를 인지 못함
  3. 여러 버프 스택 시 순서 꼬임 위험

#### B안 — 오버레이 뱃지 (채택) ⭐
```js
card.setStatModifier('atk', +2);  // "5" 옆에 "+2" 작은 초록 뱃지 추가
card.setStatModifier('atk', -1);  // "5" 옆에 "-1" 빨간 뱃지 추가 (스택)
card.setStatModifier('atk', 0);   // 모든 ATK 오버레이 제거
```
- 장점:
  1. **원본 스탯 슬롯은 절대 불변** — 불변/가변 경계가 깔끔
  2. 플레이어가 "원래 5, 지금 +2 되어 7" 이라는 **변화 과정**을 시각적으로 즉각 파악
  3. 여러 버프가 겹쳐도 상태 계산은 외부(전투 시스템)가 하고, UI는 최종 델타만 받음
  4. Unity 포팅 시 `StatOverlayBadge.prefab` 별도 컴포넌트로 떨어짐 → 1:1 매핑
- 구현:
  - 각 스탯 슬롯(`.cv-atk`/`.cv-def`/`.cv-spd`) 옆에 `.cv-atk-mod`/`.cv-def-mod`/`.cv-spd-mod` 오버레이 슬롯 예약
  - `delta > 0` → 초록 `+N`, `delta < 0` → 빨간 `-N`, `delta === 0` → 숨김
  - 뱃지 부착 시 `bounce` 애니메이션 1회

#### C안 — HP의 특수성
HP는 다르다. "현재 HP"가 실시간으로 줄어드는 건 **게임의 핵심 피드백**이고 숫자 자체를 바꾸는 게 맞음. 그래서:
- `setHP(n)` → 하트 슬롯 숫자 자체 교체 (기존안 유지)
- `setStatModifier('hp', delta)` → **존재하지 않음**. HP는 overlay 안 함.
- 동일 논리로 `setNRG(n)` 도 숫자 교체. NRG overlay 없음.

**이유**: HP/NRG는 "현재 값" 개념이 있지만, ATK/DEF/SPD는 "기본값 + 버프 누적" 개념. UX 멘탈 모델이 다름.

### 3.6 레벨업·영구 강화 정책

**문제**: 레벨업으로 최대 HP가 50 → 60 이 되거나, 유물 효과로 ATK 가 영구 +1 되면?

**정책**: **카드 인스턴스를 `destroy()` 하고 `CardComponent()` 로 재생성**.

```js
// 레벨업 발생
const oldCard = battleField.querySelector(`[data-uid="${unit.uid}"]`);
const parent = oldCard.parentElement;
oldCard.cardInstance.destroy();

// unit 데이터는 전투 시스템이 갱신 (hp: 50 → 60, atk: 5 → 6)
unit.hp = 60; unit.atk = 6;

const newCard = CardComponent(unit, {mode:'battle'});
parent.appendChild(newCard.el);
```

**왜 재생성인가**:
1. 레벨업은 **빈번하지 않음** (전투 사이, 선술집, 보상 화면 등) → 성능 비용 무시 가능
2. "기본 스탯은 불변" 원칙을 **타협 없이** 지킬 수 있음
3. 일시적 버프(setStatModifier)와 영구 강화(재생성)가 **코드 레벨에서 명확히 분리** → 실수 여지 없음
4. Unity 전환 시 `Destroy(oldCard); Instantiate(prefab)` 와 동일 패턴

**재생성 시 주의**:
- 기존 버프 오버레이·상태효과 뱃지는 **사라짐** (새 인스턴스니까)
- 레벨업은 대개 전투 밖(상점/보상)에서 일어나므로 문제 없음
- 전투 중 영구 강화가 발생하는 경우(예: 킬 시 ATK +1 유물)에는 기존 버프 상태를 **스냅샷 → 재적용** 헬퍼 제공: `CardComponent.rebuild(oldInstance, newUnit)` — 이 헬퍼가 내부에서 destroy + create + 모든 오버레이/상태 복원.

```js
// 킬 시 ATK 영구 +1 유물 발동
unit.atk += 1;
const newCard = CardComponent.rebuild(oldCard.cardInstance, unit);
// → 기존 HP, 상태효과, 버프 오버레이 전부 복원된 상태로 새 DOM 반환
```

### 3.3 내부 구조

`CardComponent` 는 생성 시점에 다음을 **전부 수행**:

1. 루트 `.card-v2.<rarity>` 생성
2. 프레임 PNG 레이어 (`<img class="cv-frame">`)
3. 일러스트 레이어 (`<img class="cv-illust">`) — `aspect`/`object-fit` 정책 내장
4. 이름 슬롯 (`.cv-name`) — 프레임 상단 홈
5. HP 슬롯 (`.cv-hp`) — 우상단, `11_frame_coords.json` CSS 변수 참조
6. NRG 슬롯 (`.cv-nrg`) — 우하단
7. 좌측 세로 ATK/DEF/SPD 3칸 (`.cv-atk`/`.cv-def`/`.cv-spd`)
8. 능력 텍스트 슬롯 (`.cv-desc`) — **반드시** `stripSystemTokens(unit.skillDesc)` 통과
9. 장비 아이콘 3개 (`.cv-equip`)
10. 상태효과 뱃지 컨테이너 (`.cv-status`) — 초기 빈 상태
11. 보호막 뱃지 (`.cv-shield`) — 0이면 `hidden`
12. 선택 오라 클래스 예약 (`.selected` 미부착)

### 3.4 금지 규칙 (lint 가드)

프로젝트 전체에서 다음을 **금지**하고 훅으로 감시:

- `innerHTML` 에 `card-v2` / `card-` / `char-option` 문자열 박기
- `js/` 어디든 프레임 PNG 경로 하드코딩 (`.cv-frame` src 등)
- `u.skillDesc` 를 DOM에 직접 박기 (`stripSystemTokens` 미경유)
- `.card-v2` 의 inline style 로 `width`/`height` 지정 (scale만 허용)

---

## 4. 마이그레이션 대상 — 5개 화면

우선순위 = 환부의 심각도 순:

### 🔴 P0-A. char-select (step2, step1)
- **현재**: `js/32_auth.js` `_showStep2()` inline HTML
- **이주**: `CardComponent(unit, {mode:'select'})` 호출, 클릭 핸들러만 외부 부착
- **제거**: `.char-option` 클래스, 관련 CSS, inline 스타일
- **검증**: rof-play-director 가 실제 플로우 돌려 step2에서 `.card-v2` N=3 확인

### 🔴 P0-B. 덱뷰 (기존 통과 경로)
- **현재**: `mkCardEl()` — 이미 가장 완성된 렌더
- **이주**: `mkCardEl()` 내부를 `CardComponent` 호출로 교체 (점진 리팩토링)
- **검증**: 기존 `card-coords` 골든 시나리오 그대로 통과

### 🟡 P1-A. 전장 (battle)
- **현재**: `js/55_game_battle.js` + `57_game_battle_ui.js` 의 전장 카드 렌더
- **이주**: `CardComponent(unit, {mode:'battle'})`
- **특이점**: 전장 모드는 능력 텍스트 숨김, ATK/HP만 보이는 미니 타일 — **CSS로만** 제어 (DOM 동일)
- **`.setHP()` 실제 사용처** — 피해 반영. 이 모드가 mutable slot 의 주 소비자.

### 🟡 P1-B. 손패 (hand)
- **현재**: 손패 렌더 경로 (부채꼴)
- **이주**: `CardComponent(unit, {mode:'hand'})` + transform rotate 는 부모가 부착

### 🟡 P1-C. 매칭 초상화 (portrait)
- **현재**: 로비/매칭 화면의 200×250 초상화
- **이주**: `CardComponent(unit, {mode:'portrait'})` — 일러스트 강조, 스탯 축약

---

## 5. 단계별 로드맵

### Step 1 — 스켈레톤 (1 세션)
- [ ] `js/card_component.js` 신규 파일
- [ ] `CardComponent` 생성자 구현 (덱뷰 기준으로 동등 출력)
- [ ] `stripSystemTokens()` 유틸 — `[액티브 X%]`, `(에너지N)`, `HPN회복` 등 raw 토큰 → 판타지 문장 매핑
- [ ] setter 6종 전부 구현: `setHP` / `setNRG` / `setShield` / `setStatModifier` / `setStatus` / `setSelected`
- [ ] `CardComponent.rebuild(oldInstance, newUnit)` 헬퍼 — 레벨업 재생성 + 상태 복원
- [ ] 단일 테스트 페이지 `tools/card_component_preview.html` 에서 5 rarity × 5 mode 렌더 확인 + setter 6종 수동 토글 버튼으로 동작 확인

### Step 2 — char-select 이주 (1 세션) ⭐ 사용자 고통의 환부
- [ ] `js/32_auth.js` `_showStep2()` 를 `CardComponent` 호출로 교체
- [ ] `.char-option` 관련 CSS 전부 삭제
- [ ] rof-play-director 재현 — 사용자가 봤던 버그 3종 전부 사라졌는지 screenshot 비교

### Step 3 — 덱뷰 내부 교체 (1 세션)
- [ ] `mkCardEl()` 내부를 `CardComponent` 호출로 위임
- [ ] `card-coords` 골든 시나리오 그대로 통과 확인
- [ ] 기존 카드 렌더 관련 `js/40_cards.js` 코드 정리

### Step 4 — 골든 테스트 확장 (1 세션)
- [ ] `tools/test_run.js` 에 `screen-smoke` 시나리오 추가
- [ ] 6개 화면 × 각 화면에서 카드 존재 시 raw 텍스트 정규식 가드 (`\[액티브`, `\(에너지`, `\$\{`, `undefined`, `NaN`)
- [ ] `11_frame_coords.json` 대조를 **전 화면의 `.card-v2`** 에 적용 (이제 구조적으로 하나)

### Step 5 — lint 가드 (0.5 세션)
- [ ] `.claude/hooks/lint_card_render.js` — `innerHTML` + `card-v2` 문자열 결합 감지 시 block
- [ ] PostToolUse 훅에 등록

### Step 6 — 전장/손패/초상화 이주 (2 세션)
- [ ] P1-A/B/C 순차 이주
- [ ] 각 이주 후 골든 재실행

---

## 6. 트레이드오프와 리스크

### 왜 이게 1회성 대공사 가치가 있는가

- **지금 투자**: 5~6 세션 (Step 1~6)
- **안 할 경우**: 사용자가 새 화면을 볼 때마다 같은 클래스 버그 무한 재발. 이번 세션 3회 지적이 증거.
- **Unity 전환 대비**: 지금 구조를 잡아두면 `CardView.prefab` 1:1 포팅. 안 잡으면 Unity 전환 시 렌더 경로 5개를 각각 포팅 → 재작업.

### 리스크

1. **`mkCardEl()` 의 기존 사용처가 많음** — 점진 교체 필요, Step 3 에서 회귀 테스트 필수
2. **전장 모드의 성능** — 카드가 많이 떠있을 때 `.setHP()` 빈번 호출. DOM 직접 텍스트만 교체하므로 reflow 최소.
3. **`stripSystemTokens` 매핑 누락** — raw 토큰이 새로 추가되면 다시 샘. → 화이트리스트 방식 + lint 가드로 이중 방어.

### 무엇을 **안** 하는가 (스코프 차단)

- ❌ 프레임 PNG 자체 교체/재제작
- ❌ 일러스트 재작업
- ❌ 유물/스킬 시스템 변경
- ❌ 밸런스 수치 변경
- ❌ `index.html` 수정 (규칙상 금지)
- ❌ 새 화면 추가

**오직 "카드를 그리는 방법" 하나만 고친다.**

---

## 7. 검증 계약 (Definition of Done)

Step 6 완료 시 다음이 전부 참이어야 함:

1. `grep -r "innerHTML.*card" js/` → 0건 (lint 가드가 강제)
2. `grep -r "char-option" .` → 0건 (관련 클래스 완전 제거)
3. `grep -r "u\.skillDesc" js/` → `CardComponent` 내부의 `stripSystemTokens()` 경유 1건만
4. `node tools/test_run.js` → 모든 `screen-smoke` 시나리오 PASS + 기존 8 passed 유지
5. rof-play-director 가 char-select step2 를 실제 플로우로 캡처 → 3장 모두 `.card-v2` 클래스 + 프레임 PNG + 좌측 세로 스탯 박스 + 우하단 NRG 마름모 존재
6. rof-ui-inspector 가 5개 화면 스크린샷을 읽어 "모든 카드가 동일 시각 구조" 확인
7. game-designer 가 raw 토큰(`[액티브`, `(에너지`, `HPN회복`) 검색 → 사용자 가시 텍스트에서 0건
8. 사용자가 직접 캐릭터 선택 화면을 보고 "이번엔 괜찮다" 라고 말해야 함 ← **최종 판정**

---

## 8. 기획 규칙 준수 체크

- ✅ `CLAUDE.md` #1 `index.html` 수정 금지 — CSS/JS만 건드림
- ✅ `CLAUDE.md` #3 UI 텍스트 판타지 몰입 — `stripSystemTokens` + 몰입 문장 매핑이 핵심 목표 중 하나
- ✅ `05-design-direction.md` 카드 UI 구조 — `CardComponent` 는 이 스펙을 **유일한 구현체**로 못박음
- ✅ `06-card-ui-principles.md` 카드 크기 모드 — `mode` 파라미터로 정확히 대응
- ✅ Unity 전환 대비 — `CardComponent` API 는 Unity `MonoBehaviour` 와 1:1 매핑 가능

---

## 9. 다음 액션

사용자 승인 시:
1. **Step 1 스켈레톤부터 시작** — `js/card_component.js` 신규 파일, 덱뷰 대비 동등 출력 목표
2. 완료 후 rof-play-director + rof-ui-inspector 병렬 검증
3. 통과 시 Step 2 (char-select 이주, 사용자 고통의 환부) 로 진입

사용자 비승인 / 수정 요청 시:
- 범위·원칙·API 어느 층에서 방향을 바꿀지 논의 후 기획서 수정
