# Realm of Fates — 일러스트 스타일 & 색 시스템 정본

> 2026-05-02 작성. 사용자 정의 스타일 + 6원소 컬러 시스템.
> 카드 아트·장비 일러스트·UI 색 적용 시 이 문서를 정본으로 참조.
> 동반 참조: `PROMPT_RECIPES.md` (카드별 프롬프트 레시피).

---

## 일러스트 스타일

### 장비 일러스트
**스타일**: AAA game equipment concept art (Hero Asset Rendering)

### 전체 일러스트
**스타일**: cinematic lighting, volumetric light, magical particle flow, arcane energy trails, high detail photorealistic hands, depth of field, glowing energy swirl, AAA fantasy concept art

### 캔버스 사이즈
**기본**: `1024 × 1536` (2:3 세로 — 카드 비율 4:7 과 호환)

---

## 6원소 컬러 시스템 (옵션 A, 2026-05-02 확정)

| 원소 | 메인 (primary) | Accent (light) | 비고 |
|---|---|---|---|
| 🔥 **불 (Fire)** | `#ff6b3d` | `#ff9e80` | 따뜻한 주황-빨강 |
| 🌊 **물 (Water)** | `#1565c0` | `#64b5f6` | 진청 + 연청 |
| ⛰️ **땅 (Earth)** | `#5d4037` | `#a1887f` | 진한 brown — 카드 황금톤과 분리 (옵션 A 변경) |
| ⚡ **전기 (Lightning)** | `#fdd835` | `#fff59d` | 진노랑 + 연노랑 |
| ✨ **신성 (Holy/Light)** | `#fff8e1` | `#ffd54f` | 크림 + 황금 — Lightning 노랑과 분리 (옵션 A 변경) |
| 🌑 **암흑 (Dark)** | `#4a148c` | `#7e57c2` | 진한 자주 + 연자주 |

### CSS 토큰 (정본)

`css/10_tokens.css`:
```css
/* 메인 */
--elem-fire:        #ff6b3d;
--elem-water:       #1565c0;
--elem-earth:       #5d4037;
--elem-lightning:   #fdd835;
--elem-holy:        #fff8e1;
--elem-dark:        #4a148c;

/* Accent (light) */
--elem-fire-light:      #ff9e80;
--elem-water-light:     #64b5f6;
--elem-earth-light:     #a1887f;
--elem-lightning-light: #fff59d;
--elem-holy-light:      #ffd54f;
--elem-dark-light:      #7e57c2;

/* divine 카드 테두리 (메인 색 사용) */
--rar-divine-fire:      #ff6b3d;
--rar-divine-water:     #1565c0;
--rar-divine-earth:     #5d4037;
--rar-divine-lightning: #fdd835;
--rar-divine-holy:      #fff8e1;
--rar-divine-dark:      #4a148c;
```

---

## 변경 이력

### 2026-05-02 (현재) — 옵션 A 확정
- 사용자 정의 6원소 시스템 등록
- 충돌 해소: Lightning ↔ Light 분리 (Light 를 크림 톤으로)
- Earth 진하게 (`#6d4c1f` → `#5d4037`) — 카드 황금톤과 명확 분리
- 새 자산: `img/elem_icon5_*.png` (사용자 색상변경 0502, rembg + crop + 좌상단 정렬)

### 이전 (2026-04-15 ~ 2026-05-01)
- 06-card-ui-principles 의 등급별 테두리 색 (이전 hex)
- elem_icon: 0430 원형 → 0502 원형(`elem_icon2`) → 0502 네모(`elem_icon3`) → crop(`elem_icon4`) → 색상변경 0502(`elem_icon5`)

---

## 적용 대상

### UI
- 카드 V4 divine 등급 테두리 — `--rar-divine-*`
- 카드 도식화 (`tools/units_flow_map.html`) 헤더 색 — `--elem-*`
- 카드별 원소 라벨 / lt-tag — 향후 `--elem-*` 토큰 가리키게 cascade

### 일러스트 생성
- 카드 아트 prompt 에 메인 색 + accent 색 명시
- 캔버스 1024×1536 으로 생성
- 스타일 키워드: cinematic lighting, volumetric light, magical particle flow

### lore 정합
- lore-bible v2 의 6신좌 색 매핑:
  - 그라힘 (불) → `#ff6b3d`
  - 모라스 (물) → `#1565c0`
  - 에이드라 (땅) → `#5d4037`
  - 브론테스 (전기) → `#fdd835`
  - 세라피엘 (신성) → `#fff8e1`
  - 네크리온 (암흑) → `#4a148c`

---

## 참조

- `lore-bible.md` v2 — 신좌 설정
- `PROMPT_RECIPES.md` — 등급별 일러스트 프롬프트
- `HERO_PROMPTS_TIER1.txt` — 카드별 최종 프롬프트
- `06-card-ui-principles.md` — 카드 UI 등급별 스타일
