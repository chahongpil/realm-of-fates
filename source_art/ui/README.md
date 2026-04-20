# UI 아이콘 사양서

Claude Design 참고용. 이 폴더의 원본 PNG 가 어떤 게임 요소에 매핑되는지 정의한다.

**원칙**: 시스템이 CSS/이모지로 직접 시각 요소를 만들지 않는다. 모든 아이콘은 이 폴더의 원본을 개별 crop 해서 `game/img/ui/` 아래에 배치한 뒤 코드에 연결한다.

---

## 1. 6원소 아이콘 (`elements.png`)

- 원본: `ui/elements.png`, 2행 × 3열 합본
- 각 셀이 게임 내 원소 하나

| 위치 | 원소 (내부 키) | 표시 |
|---|---|---|
| r1c1 | `fire` | 붉은 화염 |
| r1c2 | `water` | 파란 파도 |
| r1c3 | `earth` | 갈색 바위 |
| r2c1 | `lightning` | 노란 번개 |
| r2c2 | `holy` | 흰 날개 (신성) |
| r2c3 | `dark` | 보라 소용돌이 (암흑) |

**사용처**: 카드 우상단 또는 이름 옆 원소 태그.

---

## 2. 역할 아이콘 (`role/`)

- `role/defense.png` — 🛡️ 수호자용 단일 방패
- `role/melee.png` — ⚔️ 근접 단일 쌍칼
- `role/ranged_support_giant_3in1.png` — 합본 3-in-1 (활 / 지팡이 / 거인상)
- `role/divine_defense_melee_2in1.png` — 합본 2-in-1 (신성 방패 / 신성 쌍칼)

### 표시 규칙

카드의 `role` + `range` + `rarity` 를 조합해 아이콘 하나를 표시한다.

| 카드 조건 | 표시 아이콘 |
|---|---|
| `role:'defense'` + `rarity:'divine'` | 신성 방패 (2-in-1 의 좌측) |
| `role:'defense'` (그 외) | 일반 방패 (`defense.png`) |
| `role:'support'` | 지팡이 (3-in-1 의 중앙) |
| `role:'attack'` + `range:'melee'` | 쌍칼 (`melee.png`) |
| `role:'attack'` + `range:'ranged'` | 활 (3-in-1 의 좌측) |

**거인상 보류** — 3-in-1 의 우측(거인상) 은 현재 표시 조건 미정. 사용 조건 확정 후 적용.

---

## 3. 이펙트 배지 (`effects/effects_3x5.png`)

- 원본: `ui/effects/effects_3x5.png`, 3행 × 5열 합본 (307 × 341 / 셀)
- `이펙트각종ui영어표시.png` 는 라벨 미리보기용이며 실제 사용은 숫자 없는 원본.
- 2 유형: **Row 1~2** = 상태 지속 배지 (턴 수 표시), **Row 3** = 일회성 발동 FX

### Row 1 — 지속 상태 (대부분 턴 숫자 병기)

| 위치 | 영어 라벨 | 게임 연결 | 표시 형태 |
|---|---|---|---|
| r1c1 | **Burn** | `ignite` / `inferno` 발동 결과 상태 | 아이콘 + 남은 턴 |
| r1c2 | **Poison** | (마커 미정, 코드에 `poisoned` 필드) | 아이콘 + 남은 턴 |
| r1c3 | **Frozen** | `frostbite` 결과 | 아이콘 + 남은 턴 |
| r1c4 | **Invincible** | skill `invincibleN` | 아이콘 + 남은 턴 |
| r1c5 | **Divine shield** | bonusTrigger `divine_shield` | 아이콘 + ∞ |

### Row 2 — 지속 상태 (본인 유닛 관련)

| 위치 | 영어 라벨 | 게임 연결 | 표시 형태 |
|---|---|---|---|
| r2c1 | **Shield** | `bless` / `curShield` 보호막 | 아이콘 + ∞ |
| r2c2 | **Stealth** | bonusTrigger `stealth` | 아이콘 + 1 (다음 피격까지) |
| r2c3 | **Curse** | `curse` (회복 불가) | 아이콘 + 남은 턴 |
| r2c4 | **Thorns** | bonusTrigger `thorns` | 아이콘 (패시브 상시) |
| r2c5 | **Ignite** | bonusTrigger `ignite` 발동 순간 | 일회성 FX 가능 |

### Row 3 — 일회성 발동 FX (공격형 bonusTrigger)

| 위치 | 영어 라벨 | 게임 연결 | 표시 형태 |
|---|---|---|---|
| r3c1 | **Arrow** | 원거리/저격 공격 발동 FX | 카드 위 1회 펑 |
| r3c2 | **Cleave** | bonusTrigger `cleave` 발동 | 카드 위 1회 펑 |
| r3c3 | **Headshot** | bonusTrigger `headshot` 발동 | 카드 위 1회 펑 |
| r3c4 | **Raise dead** | bonusTrigger `raise_dead` 발동 | 카드 위 1회 펑 |
| r3c5 | (원본에만 모닥불) | 미확정 | — |

### 표시 위치 (06-card-ui-principles.md 정본)

- Row 1~2 지속 배지 → 카드 이름 바로 위 정중앙, 가로로 나열
- 형식: `아이콘` + `남은 턴 숫자` (Invincible 은 ∞ 또는 턴 수)
- Row 3 일회성 FX → bonusTrigger 발동 순간 카드 위 중앙에 0.5~1 초 표시 후 페이드아웃 (제안)

---

## 4. 작업 플로우

1. 이 폴더의 원본 PNG 는 **개별 crop** 이후 `game/img/ui/` 아래 배치:
   - `game/img/ui/element/{fire,water,earth,lightning,holy,dark}.png`
   - `game/img/ui/role/{defense,melee,ranged,support,defense_divine,melee_divine}.png`
   - `game/img/ui/badge/{burn,poison,frozen,invincible,divine_shield,shield,stealth,curse,thorns,ignite}.png`
   - `game/img/ui/fx/{arrow,cleave,headshot,raise_dead}.png`
2. 시스템 코드는 이 경로를 참조만 한다. CSS 로 색/그림자/그라디언트 직접 생성 금지.
3. 배지·FX 크기/위치 정밀 튜닝은 `tools/coord_editor.html` 로 처리.
