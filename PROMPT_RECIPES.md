# 프롬프트 레시피 북 v2

> 재사용 가능한 AI 이미지 생성 프롬프트. 특정 카드가 아닌 **등급별 스타일 템플릿** 모음.
> 카드별 구체 프롬프트는 `HERO_PROMPTS_TIER1.txt` 참조.

## v2 스타일 전환 (2026-04-16)

> **v1** (2026-04-13): "다크 석재 고딕 아치" — 무겁고 동굴 느낌. 대표님 "동굴 모양 싫어" 지적으로 폐기.
> **v2** (2026-04-16): **"얇은 금속 필리그리"** — 가볍고 우아한 금속 세공 테두리. 60~80px 두께.

### v2 프레임 공통 스타일 블록

모든 등급 프롬프트에 **이 블록을 프레임 묘사로 삽입**:

```
thin ornate metal filigree card frame, delicate wire-like border approximately 60-80 pixels wide, intricate scrollwork and vine patterns in the metalwork, elegant and lightweight design, NOT thick stone arch, NOT cave-like, NOT chunky borders
```

### v2 핵심 원칙

1. **테두리는 가볍게, 일러스트가 주인공** — 프레임은 액자일 뿐, 캐릭터를 압도하지 않음
2. **등급 올라갈수록 장식 밀도 증가** — bronze: 거의 민무늬 / divine: 원소 문양 + 보석 포인트
3. **금속 질감**: 등급별 차등 — bronze: 산화된 구리 / silver: 차가운 은 / gold: 자수정 은 / legendary: 연마 금 / divine: 원소빛 금속
4. **투명 일러스트 창 필수** — 캔버스 1024×1536 중 일러스트 영역(154-1024, 160-1170) = 870×1010 은 완전 투명 (캐릭터 일러를 별도 레이어로 합성)
5. **14개 영역 홈 위치 고정** — [design/card-layout.md](../design/card-layout.md) 좌표 준수

---

## 등급 × 스타일 티어 매핑 (2026-04-16 v2)

내부 코드는 `bronze/silver/gold/legendary/divine` 단일 진실. AAA/A/B/C/D 는 대화용 별칭.

| 별칭 | 등급 | 명칭 | 프레임 스타일 | 장식 밀도 | 금속 질감 |
|---|---|---|---|---|---|
| **D** | `bronze` | 일반 | 단순 직선 필리그리, 장식 거의 없음 | 10% | 산화된 구리색 `#b8b8c0` |
| **C** | `silver` | 희귀 | 덩굴 패턴 시작, 모서리에 작은 소용돌이 | 30% | 차가운 은색 `#3a7bd5` 틴트 |
| **B** | `gold` | 고귀한 | 꽃봉오리·별 패턴, 상하단 장식 크라운 | 55% | 자수정빛 은 `#9b59b6` 틴트 |
| **A** | `legendary` | 전설의 | 밀도 높은 스크롤워크, 코너 보석 4개 | 80% | 연마 금 `#f39c12` |
| **AAA** | `divine` | 신 | 원소 문양 + 결정/불꽃/물결 통합, 이중 테두리 | 100% | 원소빛 + 다이아 글로우 |

**등급 상승 = 장식 밀도·금속 광택·세부 문양 복잡도 증가** 원칙.

### 공통 규칙 (모든 등급 동일)

- `vertical composition, character centered, full body`
- `--ar 2:3` (= 1024 × 1536)
- `no logo, no text, no watermark, no numbers on frame`
- `transparent center window for character illustration` (프레임만 생성할 때)
- 저작권 안전: `hearthstone`, `blizzard`, `wow` 금지 — `rules/05-design-direction.md`

### 역할별 외곽 실루엣 키워드

프레임 프롬프트에 역할 키워드 추가:

| 역할 | 실루엣 | 프롬프트 키워드 |
|---|---|---|
| **탱커** | 방패형, 하단 V자 | `shield-shaped card frame, pointed bottom edge, heavy rivet accents` |
| **DPS** | 표준 + 상단 고딕 아치 | `rectangular card frame with gothic arch top, sharp angular corners` |
| **지원** | 타원·둥근 | `oval card frame, rounded soft corners, crystal orb accents, ribbon details` |

---

## D / bronze (일반) — 프레임 템플릿

**한 줄**: 민무늬에 가까운 얇은 금속 테두리. 산화된 은빛. 정적이고 조용한 느낌.

### 프레임 프롬프트

```
Simple thin metal card frame, minimal filigree border 60px wide, plain straight lines with slight beveling, aged oxidized silver-copper tone (#b8b8c0), very sparse decoration — only tiny corner dots, matte finish, no shine, no glow

frame only, transparent center window (870x1010 area), dark muted background visible through gaps, weathered metal texture, subtle scratches

[ROLE_SILHOUETTE]

1024x1536 resolution, vertical, no text, no numbers, no logo, no watermark, clean design
```

### 분위기 키워드
- `weathered`, `oxidized`, `muted`, `matte`, `plain`
- 배경: 단색 다크그레이 또는 투명

---

## C / silver (희귀) — 프레임 템플릿

**한 줄**: 덩굴 패턴이 모서리에서 시작. 차가운 코발트 은빛. 약간의 포인트 광원.

### 프레임 프롬프트

```
Elegant thin metal card frame, delicate filigree border 65px wide, slender vine and tendril patterns growing from corners, cool silver metal with subtle cobalt blue tint (#3a7bd5), small spiral accents at four corners, gentle point light reflection on metal surface

frame only, transparent center window (870x1010 area), single cool-toned point light from upper left, polished but not flashy

[ROLE_SILHOUETTE]

1024x1536 resolution, vertical, no text, no numbers, no logo, no watermark, refined craftsmanship
```

### 분위기 키워드
- `cool-toned`, `refined`, `subtle shine`, `vine pattern`, `artisan metalwork`
- 장식 밀도: 모서리 4곳 + 상단 중앙 작은 보석 1개

---

## B / gold (고귀한) — 프레임 템플릿

**한 줄**: 꽃봉오리·별 패턴. 자수정빛 은 광택. 상하단에 작은 크라운 장식.

### 프레임 프롬프트

```
Ornate thin metal card frame, intricate filigree border 70px wide, flowering bud and star patterns woven through vine scrollwork, amethyst-tinted silver metal (#9b59b6 undertone), small crown ornament at top center and bottom center, four corner medallions with tiny gemstone accents, moderate specular highlights

frame only, transparent center window (870x1010 area), soft purple ambient glow from ornaments, dramatic but balanced lighting from two sides

[ROLE_SILHOUETTE]

1024x1536 resolution, vertical, no text, no numbers, no logo, no watermark, fantasy jewelry craftsmanship
```

### 분위기 키워드
- `amethyst`, `flowering`, `starbursts`, `crown accent`, `jeweler's detail`
- 장식 밀도: 전체 테두리에 연속 패턴 + 포인트 보석 6개

---

## A / legendary (전설의) — 프레임 템플릿

**한 줄**: 밀도 높은 스크롤워크. 연마 금 광택. 코너마다 호박 보석.

### 프레임 프롬프트

```
Luxurious thin metal card frame, dense filigree border 75px wide, elaborate scrollwork covering entire border — layered vine, leaf, and flame motifs intertwined, polished warm gold metal (#f39c12), four large amber gemstones set at corners, smaller ruby accents along edges, rich specular highlights, golden glow emanating from frame edges

frame only, transparent center window (870x1010 area), warm dramatic lighting, golden rim light around the frame, slight volumetric glow

[ROLE_SILHOUETTE]

1024x1536 resolution, vertical, no text, no numbers, no logo, no watermark, master goldsmith craftsmanship, epic fantasy artifact
```

### 분위기 키워드
- `polished gold`, `amber gems`, `rich scrollwork`, `master craftwork`, `warm glow`
- 장식 밀도: 빈 공간 거의 없이 패턴 충전 + 보석 8~10개

---

## AAA / divine (신) — 프레임 템플릿

> ⚠️ **2026-04-18 운영 방침 변경**
> - divine 프레임은 **카드 1장마다 개별 자체제작** (시그니처 디자인). 아래 "원소 치환 템플릿" 은 **비활성** — 일괄 생성하지 않음.
> - **원소 문양은 프레임에 직접 새기지 않고, 카드 위 원소 뱃지(아이콘/이모티콘) 별도 레이어로 합성.** 전 등급 공통 규칙으로 승격.
> - 이중 테두리·다이아 글로우는 CSS 로 런타임 적용 (`rules/05-design-direction.md` 다이아 테두리 스펙 유지).
> - 일괄 복붙용 프레임 12개(bronze~legendary × 3역할) 는 `PROMPT_RECIPES_FRAMES.txt` 참조.

**한 줄**: 원소 문양이 필리그리와 융합. 이중 테두리(안쪽 원소색 + 바깥 흰색 글로우). 살아 움직이는 듯한 에너지.

### 프레임 프롬프트 (공통 골격)

```
Transcendent thin metal card frame, exquisite filigree border 80px wide, double border — inner line glows with [ELEMENT_COLOR], outer edge emits soft white radiance, [ELEMENT_PATTERN] motifs integrated into the metalwork, crystalline diamond-like accents along the border catching light, the metal itself seems to pulse with elemental energy

frame only, transparent center window (870x1010 area), cinematic lighting, ethereal atmosphere, the frame appears almost alive with contained power

[ROLE_SILHOUETTE]

1024x1536 resolution, vertical, no text, no numbers, no logo, no watermark, divine artifact beyond mortal craft
```

### 6원소 치환 테이블

| 원소 | `[ELEMENT_COLOR]` | `[ELEMENT_PATTERN]` |
|---|---|---|
| 🔥 불 | `fiery red (#e74c3c)` | `dancing flame tongues, ember sparks, volcanic crack lines in the metal` |
| 🌊 물 | `deep ocean blue (#3498db)` | `flowing water currents, wave crests, frost crystal formations on metal surface` |
| ⛰️ 땅 | `earthen brown (#8b5a2b)` | `crumbling rock veins, root-like tendrils, raw crystal clusters growing from frame` |
| ⚡ 전기 | `electric yellow (#f1c40f)` | `branching lightning bolts, tesla coil arcs, crackling energy lines along filigree` |
| ✨ 신성 | `holy gold (#ffd700)` | `radiating light beams, feather wing motifs, halo ring accents, celestial star map` |
| 🌑 암흑 | `void purple (#8e44ad)` | `shadow tendrils, eye motifs, dark smoke wisps curling through the metalwork, rune circles` |

### 간헐적 샤인 스윕 (CSS 구현용 참고, 프롬프트에는 포함 안 함)
- 주기: 6~10초 간격
- 효과: 대각선 흰색 빛줄기 1회 스윕
- 피크 opacity 0.35 — 전투 중 방해 안 됨

### 금지 (divine 포함 전 등급)
- `stone arch`, `cave frame`, `thick chunky border`, `dark stone texture`
- `rainbow hologram`, `constant particles`, `busy animated effects`
- `hearthstone`, `blizzard`, `world of warcraft`

---

## 캐릭터 일러스트 프롬프트 (프레임과 별도 생성)

프레임은 위 템플릿으로, 캐릭터는 아래 가이드로 **별도 생성 후 합성**.

### 등급별 캐릭터 스타일

| 등급 | 디테일 | 배경 | 포즈 | 라이팅 |
|---|---|---|---|---|
| 일반 | 40% 미니멀, 플랫 채색 | 단색 or 투명 | 정적 스탠딩 | 앰비언트만 |
| 희귀 | 60% 2~3톤 채색 | 포인트 광원 1개 | 정적~살짝 동적 | 포인트 1개 |
| 고귀한 | 75% 스타일라이즈드 | 단순화 배경 | 액션 | 2광원 드라마틱 |
| 전설의 | 90% 고퀄 일러스트 | 드라마틱 배경 | 다이내믹 액션 | 풀 라이팅 셋업 |
| 신 | 100% 극한 디테일 | 시네마틱 풀배경 | 시그니처 파워포즈 | 시네마틱 + 이펙트 |

### 캐릭터 공통 규칙
- `vertical composition, character centered, full body, facing slightly left (3/4 view)`
- `transparent background` (PNG-32, 합성용)
- `870x1010 pixel art area` (프레임 일러스트 창에 맞춤)
- `--ar 6:7` (870:1010 근사)

---

## v1 아카이브 — 001. 번개 타이탄 (2026-04-13, 석재 프레임 시대)

> v1 "다크 석재 고딕 아치" 스타일. 참고용 보존. 새 생성에는 사용하지 말 것.

<details>
<summary>v1 프롬프트 (접기)</summary>

### 기본 프롬프트

```
Dark fantasy titan warrior, gigantic armored knight infused with lightning power, glowing blue eyes, full heavy plate armor with gold engravings, holding crackling lightning in both hands, electricity surging across the body, divine energy core glowing in chest, powerful stance, low angle view, epic scale

stormy sky background, thunderstorm, lightning strikes everywhere, rocky battlefield, dramatic clouds, cinematic atmosphere

ultra detailed, highly detailed armor texture, glowing effects, energy particles, volumetric lighting, rim light, dramatic lighting, epic fantasy art, AAA game art style, semi-realistic, sharp focus, 8k, masterpiece

vertical composition, character centered, full body, dynamic pose
```

### 6원소 시리즈 치환

| 원소 | 핵심 키워드 치환 |
|---|---|
| ⚡ 번개 | `lightning, thunderstorm, electric arcs, stormy sky` (원본) |
| 🔥 불 | `infernal flames, molten armor, lava battlefield, ember particles, burning sky` |
| 💧 물/얼음 | `frost titan, glacier armor, ice crystals, blizzard, frozen battlefield` |
| 🌍 땅 | `stone titan, rocky armor, earth fragments floating, crumbling battlefield` |
| 🌑 암흑 | `void titan, obsidian armor, dark energy tendrils, shadow realm, purple mist` |
| ✨ 신성 | `radiant titan, golden armor, holy light beams, cathedral ruins, divine halo` |

</details>

---

## 엔진 설정 (공통)

- **Gemini 2.5 Flash Image**: 현재 메인 엔진. 프롬프트 그대로 입력. 별도 설정 없음.
- **Midjourney**: `--ar 2:3 --v 6 --style raw`
- **Stable Diffusion**: CFG 6~8 / Steps 25~35 / Sampler: DPM++ 2M Karras
- **DALL-E / GPT Image**: 프롬프트 그대로. 네거티브 프롬프트 지원 안 됨 → `NOT` 문구로 대체.

---

## 레시피 추가 규칙

1. 새 레시피는 해당 등급 섹션 아래 `### <등급> — 00N. <이름>` 형식으로 append
2. 번호는 등급 내 순차 증가
3. 테스트 후 결과 OK 면 제목 뒤 ✅ 표시
4. 카드별 최종 프롬프트는 `HERO_PROMPTS_TIER1.txt` 로 이관
5. 프레임과 캐릭터 일러스트는 **반드시 별도 생성 후 합성** (한 장에 섞지 않음)
