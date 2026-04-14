# PHASE 3 — 시네마틱 카드 전투 리뉴얼

> 상태: **구현 준비 완료 (2026-04-14)**
> 원본 스토리보드: [`game/docs/battle_logic_v2/1~19.png`](docs/battle_logic_v2/)
> 영향 파일: 전투 시스템 전반 (`js/55~60_game_battle*.js`, `css/40_battle.css`, `css/80_animations.css`)
>
> **⚠️ 이 기획서는 [`BATTLE_RULES.md`](BATTLE_RULES.md) 의 §1(라운드 선택지), §2(AI 판단), §3(전투 화면 레이아웃) 일부를 대체합니다. 해당 문서 상단 DEPRECATED 배너 참조.**

## 🎮 장르 정체성 선언 (★ 최상위 제약)

본 게임은 **"하이브리드 — PvP 오토배틀러 + 시네마틱 덱빌더"** 입니다.

- **PvP 오토배틀러 측면**: 매칭, 실시간 리그, 편성·덱 빌딩, 자동 전투 진행, 속도 배수 지원
- **덱빌더/시네마틱 측면**: 카드 중심 무대, 스킬 카드 소모, 극적 연출, 결정 밀도 높은 수동 플레이

두 축이 충돌하지 않도록 **결정 밀도 목표** 와 **연출 예산** 을 엄격히 관리한다 (아래 참조).

## 🎯 결정 밀도 & 템포 목표 (★ 밸런스 제약)

| 항목 | 목표값 | 근거 |
|---|---|---|
| **1라운드 길이** | **90초** | 큐잉 30초 + 실행 시네마틱 60초 |
| **전투 총 길이** | **5~10분** (약 3~7 라운드) | PvP 리그 템포 + StS 싱글 만족도 절충 |
| **전투당 결정 횟수** | **25~50회** | StS 5/턴, Snap 8/턴 참고치. 라운드당 7~15 결정 |
| **카드당 시네마틱** | **평균 5초 (최대 7초)** | 10 액션 × 5초 = 50초 (60초 실행 예산 내) |
| **히트스톱** | 0.3초 × 액션 1개 | 치명타 발생 시만 |
| **속도 배수** | 1x / 2x / 4x | 유저 재량 |

### 연출 예산 공식
```
1라운드 시네마틱 총 시간 ≤ 60초
총 액션 수 ≈ 캐릭터 5명 × 평균 TP 1.5 × 2(양쪽) = 15 액션
평균 액션 시간 ≈ 60 / 15 = 4초/액션
```

연출이 예산을 초과하면 **자동 2x 배속 발동** (HUD 표시).

## 🎯 핵심 컨셉

> **"카드가 무대의 주인공이다."**
> 전투는 슬롯·숫자가 아닌 **시네마틱 카드 쇼케이스**. 캐릭터 카드를 고르면 중앙 무대로 확대되고, 그 앞에 보유 스킬 카드가 펼쳐지며, 타겟 카드가 흔들리고 녹으며 사라진다.

차별화 포인트:
- Slay the Spire 의 덱 빌딩 감각 + Marvel Snap 의 카드 연출 + Hearthstone 의 정보 밀도
- 하지만 **정적 슬롯이 아닌 동적 중앙 무대** 로 자체 정체성 확보

---

## 📖 용어 재정립 (필독)

| 용어 | 정의 | 데이터 위치 |
|---|---|---|
| **영웅 카드** | 유저가 선택한 유니크 메인 캐릭터. 쓰러지면 게임 종료. 스킬·장비 보유. | `js/11_data_units.js` (`isHero:true`) |
| **유닛 카드** | 일반 캐릭터 카드. 스킬·장비 보유. 전투 편성 최대 4명(영웅 포함 5명). | `js/11_data_units.js` |
| **스킬 카드 (액티브)** | 전투 중 타겟 선택 후 발동. 무기/스펠 공격, 범위 공격, 자가 버프 등. 유닛/영웅이 보유. | `js/12_data_skills.js` (재작성 — 액티브만) |
| **특성/각인 (패시브)** | 전투 중 사용 불가. 유닛 스탯에 상시 적용. 조건부 트리거(피격 시, HP 50% 이하 등)도 포함. | `js/12_data_traits.js` (신규 — 기존 `SKILLS_DB` 중 패시브 분리 이관) |
| **장비 카드** | 무기 / 방어구 / 도구 **3슬롯**. 유닛·영웅 카드에 장착. 상세는 별도 기획. | (신규 — 현재 `c.equips` 배열 확장) |
| **유물 카드** | 전역 패시브. 전체 유닛·영웅에 효과. | `js/13_data_relics.js` |

**주의**: "공격"이라는 단독 개념 없음. **모든 액티브 액션 = 스킬 카드 1장 사용**. 패시브는 스탯으로 흡수.

### ⚠️ 스킬/특성 이분할 (P0 블로커 해결) — **2026-04-14 방식 변경**

> **UPDATE 2026-04-14**: 물리 분리(별도 `12_data_traits.js` 파일)는 **보류**. 사용자 승인 하에 **`passive:true` 플래그 + `RoF.isSkillPassive(id)` 판별 헬퍼** 방식으로 전환.
>
> **사유**: 28개 수동 재분류 리스크 + 플래그 1개로 동일 효과. UI 분기는 `60_turnbattle.js` 에서 패시브 카드를 회색 점선 + 클릭 시 "패시브 사용 불가" 안내로 처리.
>
> **현재 상태**:
> - `js/12_data_skills.js` — 28개 전부 `passive:true` 마킹 + `RoF.isSkillPassive` 헬퍼 (라인 38~)
> - `js/16_migration.js` `splitOwnedSkills` — **no-op 상태**. `RoF.Data.TRAITS_DB` 미정의 가드. 향후 TRAITS_DB 도입 시 자동 활성.
> - 새 액티브 스펠은 `{passive:false}` 로 같은 파일에 추가하면 됨.
>
> **원래 계획 (참고, 더 이상 유효하지 않음)**:
> - ~~`TRAITS_DB` (신규 `12_data_traits.js`) — 기존 패시브 ~25개 이주. `tr_*` 프리픽스.~~
> - ~~`SKILLS_DB` (재작성 `12_data_skills.js`) — 액티브 스펠만. `sp_*` 프리픽스.~~
> - ~~`/스킬이분할` 스킬로 자동화.~~

---

## 🧩 데이터 구조 변경

### 영웅/유닛 카드 확장 필드

```js
// 기존 (변경 없음 — nrg 필드 재사용)
{id:'lightning_titan', name:'번개 타이탄', hp:65, atk:23, nrg:30, nrgReg:5, luck:10, ...}

// PHASE 3 런타임 추가 (데이터 파일 수정 불필요)
// → 런타임에서 currentNrg 를 별도 보관, nrg 는 Max 로 해석
{
  ...원본,
  ownedSkills: [spellId1, ...],    // 학습한 액티브 스킬 ID 목록
  ownedTraits: [traitId1, ...],    // 학습한 패시브 특성 ID 목록
  equips: { weapon:null, armor:null, tool:null },  // 배열 → 객체
  // 런타임 상태 (저장 안 됨)
  currentNrg: 30,                  // 현재 에너지 (nrg 가 최대치)
  usedNrgThisRound: false,         // 라운드 내 사용 여부 (회복 트리거)
}
```

**블로커 P0-1 해결**: `nrg` 필드는 그대로 유지하고 `nrgMax` 의미로 재해석. `11_data_units.js` **한 줄도 수정 안 함**. 런타임에서만 `unit.currentNrg` 를 별도 관리.

**블로커 P0-2 해결**: 기존 `c.equips = []` 에는 `slot` 필드가 없어 단순 변환 불가. **안전한 단순화** 채택:
- 기존 `equips` 배열 전체를 `ownedSkills` 로 이동 (스킬/장비 섞여있으니 일단 스킬로 가정)
- 장비 3슬롯은 **빈 상태로 시작** (weapon/armor/tool 모두 null)
- 기존 장비는 **인벤토리 회수** 형태로 유저에게 복구 기회
- 데이터 손실 없음

### 스킬 카드 필드 정의 (액티브 스킬 = `SKILLS_DB`)

```js
{
  id: 'sp_lightning_strike',   // sp_ 프리픽스 = active spell
  name: '뇌격',
  rarity: 'legendary',
  desc: '적 전체에 15 고정 데미지',
  // 분류
  attackType: 'spell',         // 'weapon' | 'spell'
  // 코스트
  cost: 5,                     // nrg 소비량
  costType: 'nrg',             // 'nrg' | 'hp' | 'sacrifice'
  tpCost: 1,                   // 기본 1, 일부 스킬 2 (TP = Turn Point)
  cooldown: 0,                 // 라운드 쿨다운 (0 = 없음)
  consume: false,              // true 면 사용 후 덱에서 제거
  // 타겟
  targetType: 'all_enemies',   // single_enemy/single_ally/self/all_enemies/all_allies/area/random_n/sacrifice_then_enemy
  targetPattern: 'all',        // 'all' | [-1,0,1] 같은 배열 | null
  // 데미지 (무기 전용)
  mult: 0,                     // caster.atk × mult (무기만 사용)
  flatBonus: 0,                // 고정 추가 (무기만)
  penetration: 0,              // def 관통 (무기만)
  // 데미지 (스펠 전용)
  damage: 15,                  // 고정 데미지 (스펠만 사용)
  // 치명타 (공통)
  critBonus: 0,                // 0 기본. 치명타 특화 스킬만 양수
  critMult: 1.5,               // 치명타 시 배율
}
```

**모든 필드에 기본값 있음** → 정의 생략 시 0 또는 false 로 자동 처리. 확장성 원칙 준수.

### 스킬 코스트 5가지 타입 (사용자 확정)

| # | 패턴 | 예시 | 필드 |
|---|---|---|---|
| 1 | 에너지 소모 | 에너지 5 | `cost:5, costType:'nrg'` |
| 2 | HP 소모 | HP 10 | `cost:10, costType:'hp'` |
| 3 | 에너지 0 + 쿨다운 | 쿨다운 3턴 | `cost:0, cooldown:3` |
| 4 | 에너지 대량 + TP2 | 에너지 20, TP 2 | `cost:20, tpCost:2` |
| 5 | 캐릭터 희생 | 아군 유닛 1장 처형 | `cost:0, costType:'sacrifice'` |

---

## 🎬 전투 레이아웃 & 시퀀스

### 레이아웃

```
┌─────────────────────────────────────────┐
│ HUD (골드·라운드·TP·속도배수 1x/2x/4x) │
├─────────────────────────────────────────┤
│                                         │
│   [적1] [적2] [적3(★적영웅)] [적4] [적5] │  ← 상단: 적 5장, 중앙=적영웅
│                                         │
│   ←──── 중앙 무대 (스킬·타겟 연출) ────→ │
│                                         │
│   [아1] [아2] [★영웅] [아4] [아5]        │  ← 하단: 아군 5장, 중앙=영웅 고정
│                                         │
└─────────────────────────────────────────┘
```

- **편성 최대 5명** (영웅 1 + 유닛 4).
- **영웅 위치 고정**: 아군/적군 모두 **중앙(3번 슬롯)** 에 영웅 배치. 편성 UI 에서도 변경 불가.
- **영웅 사망 = 즉시 패배** (기존 규칙 유지)
- 도발/보호 시스템: 당장 도입하지 않음 → 플레이테스트 후 밸런스 필요 시 추가
- 2×5 그리드는 **기존 `.tb-side` / `.tb-enemy` DOM 구조 재사용** (하드 리빌드 불필요)

### 클릭 시퀀스 (3클릭 = 1액션)

```
[기본 상태] 2×5 그리드 10장
    │
    │ ① 아군 캐릭터 카드 클릭
    ▼
[1단계 확대] 캐릭터 중앙 이동 + N배 확대
            보유 스킬 카드가 앞에 펼쳐짐
    │
    │ (호버) 스킬 카드 1.2배 확대 + 포인터 와이어
    │ ② 스킬 카드 클릭
    ▼
[2단계 타겟 모드] 유효 타겟 하이라이트 (공격=적/지원=아군/범위=영역)
                  무효 타겟 회색 처리
    │
    │ (호버) 타겟 카드 위로 마우스 → HP 변화 프리뷰 (65→57)
    │ ③ 타겟 카드 클릭
    ▼
[3단계 발동] 모든 카드 사라짐 + 스킬 애니 중앙에서 발사
            → 타겟 카드 흔들림 + 피격 사운드
            → HP 감소. 0 이면 녹거나 부서지며 페이드아웃
    │
    ▼
[복귀] 크기/위치 원복. 다음 캐릭터 대기.
```

### 취소 흐름

**ESC / 우클릭 / 빈 곳 클릭** 시 한 단계 뒤로:
- 3단계(타겟 호버) → 2단계(스킬 선택) 로
- 2단계(스킬 선택) → 1단계(캐릭터 확대) 로
- 1단계(캐릭터 확대) → 기본 상태로
- 기본 상태에서 취소 = 무반응

### 확대 배율

- 기본 그리드 카드 사이즈 대비 **≈2.5~2.8배** (원본 스토리보드의 중앙 번개 타이탄 / 주변 카드 픽셀 비율 측정값)
- 스킬 카드 호버 확대는 **1.2배**
- 실제 픽셀값은 프로토타입에서 측정·조정

---

## ⏱️ 라운드 & 턴 규칙

### 라운드 진행

1. **행동 큐잉 (타이머: 60초)**
   - 플레이어가 아군 5명 각각의 행동을 미리 예약 (캐릭터→스킬→타겟)
   - 상대 봇은 즉시 결정 (연출용 대기 시간은 추후 추가 예정)
   - 60초 내 예약 완료 안 하면 **자동 패스** (해당 캐릭터 행동 스킵)

2. **라운드 시작 버튼**
   - 양쪽 다 준비 완료 시 "⚔️ 전투 시작" 버튼 표시

3. **액션 실행**
   - **SPD 가 가장 높은 유닛부터** 순차 실행 (아군·적군 혼합)
   - 각 액션 = 시네마틱 연출 (확대 → 발사 → 피격 → 복귀)
   - 속도 배수 1x / 2x / 4x 로 연출 속도 조절 가능

4. **라운드 종료**
   - 모든 액션 실행 완료 → 에너지 회복 → 상태이상 처리 → 다음 라운드

### 에너지 규칙 (확정)

- **개별 풀**: 에너지는 **캐릭터마다 개별**. 각 캐릭터가 자기 `energyMax` 를 가짐.
- **초기 상태**: **라운드 시작 시 모든 캐릭터의 에너지가 풀 충전** (= `energyMax`).
- **회복 트리거**: 에너지를 한 번이라도 사용한 캐릭터만 **매 턴 자동 회복** 시작. 즉:
  - 아직 에너지를 쓰지 않은 캐릭터 = 풀 상태 유지, 회복 이벤트 없음
  - 에너지를 쓴 캐릭터 = 다음 턴부터 매턴 고정량 회복 (회복량 `energyRegen` 필드로 정의, 기본값 미확정)
- **최대치**: `energyMax` 초과 회복 불가
- **라운드 간**: 새 라운드 시작 시 다시 전량 충전 (= 쓴 만큼 손해 없음, 단 한 라운드 안에서 연속 사용 제한)

```js
// 데이터 예시
{id:'lightning_titan', energyMax:30, energyRegen:5, ...}
// 런타임
{...titan, energy:30, energyUsedThisRound:false}
```

### TP (Turn Point, 전투 내 행동력)

- 기본: **캐릭터 당 TP 1** (라운드 당 스킬 1장 사용)
- 일부 스킬 `tpCost:2` → 그 캐릭터의 TP 2 필요 (= 사실상 한 라운드에 1 액션 소모하고 끝)
- **기본 TP 를 영웅만 2 로 줄지** 는 미확정 (현재 규칙은 "TP=전투 내 카드 사용 횟수")
- 주의: TP ≠ RP. RP(Round Point) 는 라운드 **사이** 메타 선택 횟수 (유닛/스킬북/유물 획득 등). 03-terminology.md 참조.

### 타겟 규칙

| targetType | 동작 |
|---|---|
| `single_enemy` | 적 1명 선택 |
| `single_ally` | 아군 1명 선택 |
| `self` | 본인 자동 지정 |
| `all_enemies` | 타겟 선택 스킵 — 적 전체 자동 하이라이트, **빈 공간 클릭=발동, 스킬 재클릭=취소** |
| `all_allies` | 타겟 선택 스킵 — 아군 전체 자동 하이라이트, **빈 공간 클릭=발동, 스킬 재클릭=취소** |
| `area` | 선택 카드 + 인접 패턴 (범위 기준은 **스킬카드마다 개별 정의** — `targetPattern` 필드) |
| `random_n` | 랜덤 N명, 클릭=실행만 |
| `sacrifice_then_enemy` | 먼저 아군 희생 선택 → 이어서 적 선택 |

**범위(area) 패턴**은 각 스킬카드에 개별 정의. 예:
- `targetPattern:[0]` = 단일
- `targetPattern:[-1,0,+1]` = 좌우 1칸
- `targetPattern:[-2,-1,0,+1,+2]` = 좌우 2칸 (5명 전체)
- `targetPattern:'all'` = 전체

좌우 기준만 사용 (위아래 = 적/아군 경계 넘지 않음).

---

## 🧮 전투 공식 (확정)

### 1. 무기 공격 데미지
```
dmg = floor(caster.atk × skill.mult + skill.flatBonus)
    - max(0, target.def - skill.penetration)
dmg = max(1, dmg)  // 최소 데미지 1 보장
```

### 2. 스펠 공격 데미지 (DEF 완전 무시)
```
dmg = skill.damage × (1 + target.vulnerability × 0.1)
```

### 3. 원소 상성 보정 (곱셈)
```
if (strongVs(caster.element, target.element))   dmg *= 1.3
if (weakVs(caster.element, target.element))     dmg *= 0.77
```

### 4. 치명타 판정 (곱셈, 마지막)
```
critRate = (caster.luck + skill.critBonus) / 100   // luck 10 + critBonus 0 = 10%
if (random() < critRate) {
  dmg *= skill.critMult  // 기본 1.5
  showCritAnim()          // 히트스톱 0.3초 발동
}
```

### 5. 최종 합성 순서 (중요)
```
최종 데미지 = base(무기 또는 스펠)
            × elementMult (1.3 / 1.0 / 0.77)
            × critMult (1.5 또는 1.0)
```

**곱셈 순서**: base → element → crit. 덧셈 아님. 중복 발동 가능.

### 6. 원소 상성표 (고전 4원소 순환 + 빛/어둠 상호)

| 강함 → 약함 | 근거 |
|---|---|
| 💧 물 → 🔥 불 | 고전 |
| 🔥 불 → 🌍 땅 | 초목·유기물 태움 |
| 🌍 땅 → ⚡ 전기 | 어스 |
| ⚡ 전기 → 💧 물 | 감전 |
| ✨ 신성 → 🌑 암흑 | 정화 |
| 🌑 암흑 → ✨ 신성 | 타락 |

나머지 쌍은 **1.0 중립**. 4원소(불/물/전기/땅) 사이클 + 2원소(신성/암흑) 상호 대립.

## 💥 치명타 연출 (히트스톱)

치명타 발생 시:
1. **데미지 숫자 2배 크기** (1rem → 2rem) + **주황색** (`#ff8800`) + **팝 애니** (scale 0.5→1.5→1, 0.4s)
2. **히트스톱 0.3초** — 전체 전투가 잠시 정지:
   ```js
   const oldSpeed = RoF.Battle.SPEED;
   RoF.Battle.SPEED = 0.3;
   await RoF.Battle.beat(300);
   RoF.Battle.SPEED = oldSpeed;
   ```
3. 전용 "critical!" SFX

## 🎨 시각 연출 목록

| 애니 | 트리거 | 설명 |
|---|---|---|
| `cardFocusIn` | 캐릭터 카드 클릭 | 중앙 이동 + 2.5배 확대 |
| `cardFocusOut` | 취소 / 완료 | 원래 위치 복귀 + 축소 |
| `cardHoverPop` | 스킬 카드 호버 | 1.2배 확대 + 글로우 |
| `wireConnect` | 스킬 호버 중 | 포인터와 카드 사이 와이어 |
| `spellFly` | 스킬 발동 | 중앙에서 타겟으로 이펙트 발사 |
| `cardShake` | 타겟 피격 | 좌우 흔들림 0.3s |
| `cardMelt` | HP 0 (불/얼음/물/신성) | 녹으며 페이드아웃 0.8s |
| `cardCrush` | HP 0 (땅/전기/암흑) | 부서지며 파편 |
| `hpCountdown` | 데미지 적용 | 65 → 57 숫자 감소 롤 |
| `energyDrain` | 에너지 소모 | 카드 상단 에너지 바 감소 |

키프레임은 `css/80_animations.css` 에 신규 정의.

### 상태이상 배지 위치
기존: 카드 우하단. **변경**: 카드 **이름 바로 위 정중앙** (🔥3 ☠️2 ❄️1 🛡️ 가로 나열).

---

## 🔧 속도 배수 구현

현재 코드는 `setTimeout(..., 800)` 같은 하드코딩 값이 각 파일에 흩어져 있음 → **사전 리팩터 필수**.

```js
// js/config_battle.js (신규)
RoF.Battle = RoF.Battle || {};
RoF.Battle.speed = 1;  // 1 | 2 | 4
RoF.Battle.beat = (ms) => new Promise(r => setTimeout(r, ms / RoF.Battle.speed));
```

- 전투 파일들의 모든 `setTimeout(fn, ms)` → `await Battle.beat(ms); fn();`
- HUD 에 속도 버튼 3개 (1x / 2x / 4x) 표시
- CSS 애니메이션도 `animation-duration: calc(Xs / var(--battle-speed))` 패턴으로 변수화

---

## 🖼️ 화면 플로우 분할 설계 (★ 중요 원칙)

> **전투는 단일 `#battle-screen` 이 아니라, 각 액션 상태마다 독립된 DOM 서브스크린으로 분할한다.**
> 이렇게 하면 `screen_flow_editor.html` / `screen_editor_zones.html` 로 각 상태를 개별 편집할 수 있어 사용자가 나중에 영역·크기·위치를 직접 손볼 수 있다.

### 분할 원칙

- ❌ **하지 말 것**: `#battle-screen` 안에서 JS 가 `innerHTML` 을 동적으로 바꾸며 상태 전환
- ✅ **할 것**: 각 상태 = `<div class="screen" id="battle-STATE_NAME">` 독립 컨테이너. JS 는 `UI.show('battle-STATE_NAME')` 으로 전환만, 내용은 사전 정의된 템플릿에 전역 상태 `Battle.state` 를 슬롯 주입
- 편집기의 화면 목록에 각 상태가 **별도 항목** 으로 등장해야 함 (`tools/screen_flow_editor.html` 기준)

### 상태별 서브스크린 (9개)

| # | screen id | 트리거 | 표시 내용 | 주요 편집 가능 영역 |
|---|---|---|---|---|
| 1 | `battle-queueing` | 라운드 진입 | 60초 타이머, 아군 카드 5장(미선택 표시), 봇 대기 인디케이터 | 타이머 위치, 카드 행 간격, 봇 메시지 박스 |
| 2 | `battle-idle` | 큐잉 완료 / 액션 사이 | 기본 2×5 그리드, HUD(라운드·속도배수·TP) | 그리드 여백, HUD 배치, 속도 버튼 |
| 3 | `battle-char-focus` | 아군 캐릭터 클릭 | 선택 캐릭터 중앙 확대 + 보유 스킬 카드 펼침 | 확대 카드 위치/크기, 스킬 카드 배열 위치, 뒷 배경 dim 정도 |
| 4 | `battle-skill-active` | 스킬 카드 클릭 | 타겟 모드 — 유효 타겟 하이라이트 / 무효 회색 / 와이어 선 | 와이어 스타일, 타겟 하이라이트 색·굵기, 회색 dim 값 |
| 5 | `battle-target-preview` | 타겟 카드 호버 | HP 변화 프리뷰(65→57), 데미지 숫자 팝업 | 프리뷰 숫자 위치·폰트, 팝업 박스 |
| 6 | `battle-action-fire` | 타겟 카드 클릭 | 스킬 애니 발사 (중앙→타겟) | 발사 이펙트 경로, 지속시간, 중앙 카드 페이드 |
| 7 | `battle-hit-react` | 피격 직후 | 타겟 카드 좌우 흔들림 + 데미지 숫자 | 흔들림 강도, 데미지 숫자 위치·색 |
| 8 | `battle-death` | HP 0 도달 | 카드 녹음/부서짐 페이드아웃 | 멜트·크러시 지속시간, 파편 위치 |
| 9 | `battle-round-end` | 모든 액션 종료 | 라운드 종료 메시지, 에너지 회복 표시, 다음 라운드 카운트 | 메시지 박스, 카운트 위치 |

### 구현 가이드

```html
<!-- index.html 에 9개 서브스크린 div 를 추가 -->
<div id="battle-queueing" class="screen battle-sub">
  <div class="bq-timer"></div>
  <div class="bq-grid"></div>
  <div class="bq-bot-indicator"></div>
</div>
<div id="battle-idle" class="screen battle-sub">
  <div class="bi-hud"></div>
  <div class="bi-grid"></div>
</div>
<!-- ... 나머지 7개 ... -->
```

```js
// js/60_turnbattle_v2.js 상태 전환 예시
RoF.Battle.state = {
  phase:'idle',
  selectedChar:null,
  selectedSkill:null,
  targetCandidates:[],
  hoveredTarget:null,
};

RoF.Battle.transition = (toPhase) => {
  Battle.state.phase = toPhase;
  UI.show('battle-' + toPhase);      // 서브스크린 전환
  Battle.render();                    // 현재 phase 에 맞는 템플릿 슬롯 채우기
};

// 캐릭터 클릭 예시
onCharClick(char){
  Battle.state.selectedChar = char;
  Battle.transition('char-focus');
}
```

### 렌더 슬롯 규칙

각 서브스크린은 **정해진 슬롯(id/class)** 만 가지고, JS 는 슬롯에 데이터만 주입:

- `#battle-char-focus .bcf-main-card` — 확대된 캐릭터 카드 slot
- `#battle-char-focus .bcf-skill-row` — 스킬 카드 나열 slot
- `#battle-skill-active .bsa-target-hl` — 타겟 하이라이트 레이어
- `#battle-target-preview .btp-hp-delta` — "65 → 57" 프리뷰 텍스트

이렇게 하면 **편집기가 슬롯 위치만 변경**해도 JS 로직은 그대로 작동한다.

### 편집기 통합

- `tools/screen_flow_editor.html` 의 화면 목록에 9개 서브스크린 자동 등록
- 각 서브스크린을 `screen_editor_zones.html?screen=battle-char-focus` 식으로 개별 편집 가능
- CSS 변수는 `--bcf-*`, `--bsa-*` 처럼 서브스크린별 prefix 로 분리 (`css/10_tokens.css` BEGIN_LAYOUT_VARS 블록에 추가)

---

## 🗂️ 영향 파일 목록

### 교체 (전면 재작성)
- `js/60_turnbattle.js` — 전투 엔진 코어. 시퀀스/애니/상태머신
- `js/57_game_battle_ui.js` — UI 렌더링
- `css/40_battle.css` — 레이아웃 · 카드 스타일

### 수정
- `js/55_game_battle.js` — 매칭/진입 인터페이스 유지, 내부 호출만 신규로
- `js/58_game_battle_end.js` — 결과 처리, 죽음 애니 훅
- `js/59_game_battle_round.js` — 라운드 처리 + 적 AI (봇은 즉시 결정)
- `js/12_data_skills.js` — 스킬 확장 필드 전수 추가
- `js/11_data_units.js` — 유닛·영웅에 `energy`, `ownedSkills`, `equips` 객체화
- `css/80_animations.css` — 신규 키프레임
- `css/10_tokens.css` — `--battle-speed` 변수 추가
- `index.html` — 속도 배수 버튼 HUD 영역 (단순 추가, 구조 변경 아님)

### 신규
- `js/60_turnbattle_v2.js` — 기본값, 신규 엔진
- `js/config_battle.js` — 속도 배수 + beat 유틸
- `design/battle-v2-rules.md` — 기획서 내용을 balance-auditor 가 참조할 수 있게 요약

### 영향 주의 (데이터 마이그레이션)
- `c.equips = []` → `c.equips = {weapon:null,armor:null,tool:null}`
  - 로컬스토리지에 저장된 배열을 첫 로드 시 자동 변환
  - 변환 규칙: 기존 배열 `[a, b, c]` → `{weapon:a, armor:b, tool:c}`
  - 변환 스크립트: `js/16_migration.js` (신규)

---

## 🎯 수직 슬라이스 우선 (★ rof-game-director 지시)

**전면 재작성 금지**. 재미 검증 안 된 기획서를 1,500줄 JS 로 구현하기 전에, **단일 액션 시네마틱 1개** 만 먼저 완성해 **플레이테스트 3회** 로 재미 검증.

### 수직 슬라이스 정의

- **캐릭터 1개** × **액티브 스킬 1개** × **타겟 1개** 만 동작
- 19장 스토리보드 중 **4~8번** (확대 → 타겟 → 발사 → 피격) 만 구현
- 나머지 15장은 하드코딩 mock 또는 스킵
- 레거시 전투 **전혀 안 건드림**, `FEATURE.CINEMATIC_BATTLE = false` 기본

### 수직 슬라이스 체크리스트

`/수직슬라이스시작` 스킬 참조. 요약:

1. 사전 확인: CI 게이트 8/8 pass
2. 블로커 3개 해결 상태 체크 (P0-1/2/3)
3. `FEATURE.CINEMATIC_BATTLE` 플래그 OFF 로 신설
4. 신규 파일 4개 (`config_battle.js`, `60_turnbattle_v2.js`, `41_battle_v2.css`, `80_animations_battle_v2.css`)
5. `Battle.beat(ms)` 유틸 먼저
6. 9개 서브스크린 DOM 빈 골격
7. 최소 데모 루프 1개
8. 회귀 테스트
9. `code-extensibility-reviewer` 에이전트 호출
10. `rof-play-director` 로 연출 실측
11. 시그널 기록

### 성공 기준

- [ ] CI 게이트 8/8 유지
- [ ] 플래그 OFF 시 레거시 정상
- [ ] 플래그 ON 시 데모 1회 성공
- [ ] 9개 서브스크린 편집기 등록
- [ ] 1x/2x/4x 전부 작동
- [ ] 확장성 리뷰 블로커 0
- [ ] 연출 총 시간 ≤ 5초 (카드 1장)

### 확장 단계 (수직 슬라이스 통과 후)

1. 스킬 2~3개 추가 (단일 타겟·범위·자가)
2. 캐릭터 5장 그리드
3. 적 봇 AI
4. 큐잉/실행 분리
5. 19장 전체 연출
6. 레거시 제거 (`garbage-cleaner`)

---

## 🚀 롤아웃 전략

### 플래그 토글 방식

```js
// js/00_globals.js
RoF.FEATURE_CINEMATIC_BATTLE = true;  // 개발 중 토글

// js/60_turnbattle.js → 진입 분기
if (RoF.FEATURE_CINEMATIC_BATTLE) RoF.TurnBattleV2.init(...);
else RoF.TurnBattleLegacy.init(...);
```

- 기존 `60_turnbattle.js` 를 `60_turnbattle_legacy.js` 로 복사 후 레거시 고정
- 신규는 `60_turnbattle_v2.js` 에 작성
- 완성 후 플래그 제거 + legacy 파일 `garbage-cleaner` 로 정리

### 검증 루프

1. **balance-auditor** — 새 스킬 필드(`cost`, `tpCost`, `cooldown`, `targetType`) 정합성 검증
2. **game-designer** — 기획서 ↔ 코드 교차 대조
3. **rof-ui-inspector** — 새 레이아웃 시각 검증 (스크린샷 기반)
4. **game-balance-tester** — 새 전투의 에너지 곡선 / 스킬 사용률 시뮬
5. **rof-play-director** — Playwright 로 실제 전투 완주 + 1x/2x/4x 속도 체감
6. 3명 이상 합의한 블로커만 승격 (기존 교차검증 원칙)

### 기존 버그 리스크 제거

사용자 지시: **"버그가 안 나는 게 가장 중요. 기존 전투 파일은 모든 에이전트랑 이야기해서 버그 안 남게. 필요하면 garbage-cleaner 로 삭제."**

- 신규 개발 기간: 레거시 유지, 플래그로 격리
- 릴리스 전 테스트: 레거시 OFF 상태로 모든 화면 통과 확인
- 통과 후: `garbage-cleaner` 세션에서 레거시 파일·사용 안 되는 함수·변수 제거
- 교훈은 `.claude/rules/08-garbage-lessons.md` 에 증류

---

## 🧠 스킬 카드 획득·학습 시스템 (확정)

- **획득 경로**: 전투 보상·던전·상점에서 **스킬북 아이템** 형태로 획득
- **학습 장소**: **성(Castle)** 에서 유닛/영웅이 스킬북을 사용해 학습
- **귀속**: 학습한 캐릭터만 해당 스킬을 보유 (다른 캐릭터에 이전 불가)
- **폐기**: 성에서 스킬 해제 가능 (자세한 규칙 미확정)
- **중복 학습 제한**: 같은 스킬을 여러 캐릭터가 학습 가능 (스킬북 소모)

## 🧍 캐릭터 카드 기본 스킬 시스템 (확정)

각 캐릭터는 **고정 기본 스킬 1개** 보유 + **추가 스킬 슬롯** 으로 학습한 스킬 장착:
- 고정 기본 스킬은 캐릭터 정의에 박혀있음 (현재 카드 내부 "뇌격: 전체8데미지" 같은 텍스트 → 기본 스킬 1개로 정식 편입)
- 추가 슬롯 수는 미확정 (일단 영웅=3, 유닛=2 로 가정)
- 편성/전투 시 기본 스킬 + 장착 스킬 모두 확대 시 스킬 카드로 펼쳐짐

## ⚰️ 희생 코스트 규칙 (확정)

- `costType:'sacrifice'` 스킬은 아군 유닛 1명을 **영구 손실** 시킴
- **대장간에서 부활 불가**
- **교회에서만 부활 가능** (골드 소모, 기존 교회 부활 시스템 재사용)
- 영웅은 희생 불가 (희생 대상 후보에서 제외)

## 🔁 이탈·복구 정책 (확정)

- **세션 이탈 시**: 전투가 백그라운드에서 자동 진행 (시간 흐른 만큼 라운드 자동 실행)
- **재접속 시**: 현재 라운드 상태 복원, 그동안 진행된 액션 요약 표시
- **참고 레퍼런스**: Legends of Runeterra 의 "자동 수락" / Hearthstone Battlegrounds 의 재접속 플로우
- 상세 구현 방식은 프로토타입 단계에서 결정

## 📋 미확정 항목 (나중 결정)

- [ ] **에너지 회복 기본값** — 회복량(`energyRegen`) 기본값과 카드별 차이 (확정: 라운드 시작 전량 충전 + 사용 후 매턴 회복)
- [ ] **장비 카드 상세** — 무기/방어구/도구 능력 체계, 대장간 UI, 미니 네모칸 렌더링 (별도 기획서 예정)
- [ ] **스킬 카드 업그레이드** — 어느 재화로? 등급별 업그레이드 한계?
- [ ] **스킬 카드 폐기 반환** — 폐기 시 스킬북으로 되돌리기? 재화 환급?
- [ ] **데미지 공식** — 기존 `atk + skillDmg - def` → 새 공식? 스킬 고정값 vs 시전자 스탯 계수?
- [ ] **영웅 TP 우대** — 영웅만 TP 2 기본? 아니면 유닛과 동일 TP 1?
- [ ] **카드 호버 프리뷰 팝업 위치** — 스킬/장비 상세 노출 위치
- [ ] **적 AI 의사결정** — 봇이 어떤 규칙으로 스킬/타겟 선택?
- [ ] **PvP 봇 대기 연출** — "상대가 행동 중..." 랜덤 대기시간 추가 시점
- [ ] **자동 진행 시뮬** — 이탈 중 어느 AI 로 내 유닛을 플레이할지?
- [ ] **유물 훅 지점 상세** — `action-fire` / `hit-react` / `death` / `round-end` 각 상태의 유물 콜백 시그니처
- [ ] **캐릭터 추가 스킬 슬롯 수** — 영웅/유닛별 장착 가능 스킬 개수

---

## ✅ 확정 체크리스트

- [x] TP 규칙: 카드 1장 = TP 1 (일부 스킬 TP 2)
- [x] 스킬 cost 타입 5가지 (nrg/hp/cooldown/+TP/sacrifice)
- [x] 그리드: 아군 5 상단 + 적 5 하단, 편성 5명 상한
- [x] **영웅 중앙 고정 (3번 슬롯), 사망 = 즉시 패배**
- [x] 범위 스킬 호버 하이라이트 동작
- [x] 범위 패턴은 `targetPattern` 필드로 스킬별 개별 정의
- [x] 턴 진행: 60초 큐잉 → SPD 순 실행
- [x] 에너지: 라운드 시작 전량 충전, 사용 후 매턴 회복
- [x] 자동 타겟 스킬: 빈곳 클릭=발동, 스킬 재클릭=취소
- [x] **스킬 획득: 스킬북 아이템 → 성에서 학습**
- [x] **캐릭터 기본 스킬 1개 + 추가 스킬 슬롯 장착**
- [x] **희생 코스트: 영구 손실, 교회에서만 부활**
- [x] 장비 3슬롯 도입 (상세는 별도 기획)
- [x] 속도 배수 1x / 2x / 4x (적 행동 애니까지 전부 영향)
- [x] 취소 흐름 3계층 (ESC/우클릭/빈곳)
- [x] 상태이상 위치: 카드 이름 위 정중앙
- [x] 쿨다운 표시: 회색 + 남은 턴 숫자 오버레이
- [x] **죽음 연출 원소별 분기**: 불·얼음·물·신성=Melt / 땅·전기·암흑=Crush
- [x] 기존 5+5 DOM 재사용 + 9개 서브스크린 분할
- [x] 이탈·복구: 시간 흐른 만큼 자동 진행 + 재접속 시 복원 (LoR/HS BG 참고)
- [x] 플래그 토글 + 에이전트 교차 검증 + garbage-cleaner 마무리
- [x] 스킬 데이터 필드 숫자만 먼저 추가

---

## 📝 참고 자료

- 스토리보드: [`docs/battle_logic_v2/1.png ~ 19.png`](docs/battle_logic_v2/)
- 현재 전투 규칙: [`BATTLE_RULES.md`](BATTLE_RULES.md)
- 밸런스 규칙: [`../design/balance.md`](../design/balance.md)
- 디자인 방향: [`../.claude/rules/05-design-direction.md`](../.claude/rules/05-design-direction.md)
- 카드 UI 원칙: [`../.claude/rules/06-card-ui-principles.md`](../.claude/rules/06-card-ui-principles.md)
