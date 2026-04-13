# 프롬프트 레시피 북

> 재사용 가능한 AI 이미지 생성 프롬프트. 특정 카드가 아닌 **등급별 스타일 템플릿** 모음.
> 카드별 구체 프롬프트는 `HERO_PROMPTS_TIER1.txt` 참조.

## 등급 × 스타일 티어 매핑 (2026-04-13 확정)

내부 코드는 `bronze/silver/gold/legendary/divine` 단일 진실. AAA/A/B/C/D 는 대화용 별칭.

| 별칭 | 등급 | 스타일 방향 | 디테일 예산 | 생성 비용 |
|---|---|---|---|---|
| **AAA** | divine (신) | 시네마틱 AAA 게임, 극한 디테일, 거신/타이탄 스케일, unreal engine 5 톤 | 100% | 느림/비쌈 |
| **A** | legendary (전설) | 고퀄 일러스트, 드라마틱 라이팅 + 에너지 이펙트, 풀바디 | 90% | 중 |
| **B** | gold (골드) | 스타일라이즈드 고퀄, 라이팅 강조, 배경 단순화 | 75% | 중 |
| **C** | silver (실버) | 스타일라이즈드, 2~3톤 채색, 포인트 광원만 | 60% | 저 |
| **D** | bronze (브론즈) | 미니멀·플랫, 단색 배경, 실루엣 중심 | 40% | 저 |

**등급 상승 = 시각 체감 상승** 원칙. 배경·라이팅·디테일·포즈 복잡도가 전부 등급 따라 증가.

공통 규칙(모든 등급 동일):
- `vertical composition, character centered, full body`
- `--ar 2:3`
- `no logo, no text, no watermark`
- 저작권 안전: 특정 게임 이름(`hearthstone`, `blizzard`, `wow`) 금지 — `rules/05-design-direction.md`

---

## AAA / divine — 001. 번개 타이탄 ✅ 2026-04-13

**한 줄**: 디아블로 + 갓오브워 + 카드게임 보스 느낌. 번개 + 거대 갑옷 전사 + 신성한 에너지 + 드라마틱 라이팅.

### 기본 프롬프트

```
Dark fantasy titan warrior, gigantic armored knight infused with lightning power, glowing blue eyes, full heavy plate armor with gold engravings, holding crackling lightning in both hands, electricity surging across the body, divine energy core glowing in chest, powerful stance, low angle view, epic scale

stormy sky background, thunderstorm, lightning strikes everywhere, rocky battlefield, dramatic clouds, cinematic atmosphere

ultra detailed, highly detailed armor texture, glowing effects, energy particles, volumetric lighting, rim light, dramatic lighting, epic fantasy art, AAA game art style, semi-realistic, sharp focus, 8k, masterpiece

vertical composition, character centered, full body, dynamic pose
```

### 고급 버전 (퀄 강화)

```
god of thunder, colossal lightning titan, ancient celestial armor, engraved runes glowing blue, energy veins across armor, electricity arcs wrapping around arms, divine storm power, cinematic composition, extreme detail, hyper realistic lighting, unreal engine 5 render style, epic fantasy illustration
```

### 엔진 설정

- **Midjourney**: `--ar 2:3 --v 6 --style raw`
- **Stable Diffusion**: CFG 6~8 / Steps 25~35 / Sampler: DPM++ 2M Karras

### 핵심 키워드 (빠지면 느낌 안 나옴)

- `low angle view` — 아래에서 올려다보는 거대감
- `lightning infused` / `crackling lightning` — 번개 표현의 핵심
- `glowing chest core` — 가슴 코어 포인트
- `stormy sky` / `thunderstorm` — 배경 완성도
- `volumetric lighting + rim light` — 고퀄 필수

### 6원소 시리즈화 (divine 티어 전원)

원소 바꾸면 그대로 시리즈:

| 원소 | 핵심 키워드 치환 |
|---|---|
| ⚡ 번개 | `lightning, thunderstorm, electric arcs, stormy sky` (원본) |
| 🔥 불 | `infernal flames, molten armor, lava battlefield, ember particles, burning sky` |
| 💧 물/얼음 | `frost titan, glacier armor, ice crystals, blizzard, frozen battlefield` |
| 🌍 땅 | `stone titan, rocky armor, earth fragments floating, crumbling battlefield` |
| 🌑 암흑 | `void titan, obsidian armor, dark energy tendrils, shadow realm, purple mist` |
| ✨ 신성 | `radiant titan, golden armor, holy light beams, cathedral ruins, divine halo` |

**진행도**: [x] 번개  [ ] 불  [ ] 얼음  [ ] 땅  [ ] 어둠  [ ] 신성

---

## A / legendary — _레시피 미작성_

> 디테일 90%, 풀바디, 드라마틱 라이팅. 타이탄 스케일은 빼고 영웅 개인 스케일.

템플릿 예정:
```
Legendary fantasy hero, full body portrait, detailed armor, [ELEMENT] aura, dynamic action pose, dramatic lighting, highly detailed illustration, epic fantasy art style, rim light, --ar 2:3
```

---

## B / gold — _레시피 미작성_

> 고퀄이지만 배경 단순화, 디테일 75%.

---

## C / silver — _레시피 미작성_

> 스타일라이즈드 2~3톤, 포인트 광원만.

---

## D / bronze — _레시피 미작성_

> 미니멀·플랫, 단색 배경, 실루엣.

---

## 레시피 추가 규칙

1. 새 레시피는 해당 등급 섹션 아래 `## <등급> / <레어도> — 00N. 이름` 형식으로 append
2. 번호는 등급 내 순차 증가 (번개 타이탄 = divine 001, 불 타이탄 만들면 divine 002)
3. 테스트 후 결과 OK 면 제목 뒤 ✅ 표시
4. 카드별 최종 프롬프트는 `HERO_PROMPTS_TIER1.txt` 로 이관
