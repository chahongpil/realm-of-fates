# 영웅 18장 일러스트 생성 프롬프트 (ChatGPT 이미지 전용)

> 목적: 현재 DreamShaper 생성물이 원소별로 구분 안 됨 → ChatGPT 이미지 생성(혹은 직접 아트 발주) 시 사용할 통일 프롬프트 템플릿
> 작성: 2026-04-12
> 📚 참조: `.claude/references/card-game-studies/mtg_color_pie_philosophy.md` (6원소 정체성)

---

## 🎯 출력 규격

- **크기**: 1024×1536 세로 (아치형 프레임의 아치 창 비율에 맞춤)
- **프레이밍**: 캐릭터가 프레임 중앙에서 약간 상단 (arch window y=18..70%에 맞춤)
- **상반신 중심**: 얼굴·무기·오라가 모두 보이도록 (전신 X, 근접샷 X)
- **배경**: 원소별 테마 배경 + 가장자리 어둡게 (비네트)
- **스타일**: dark fantasy, dramatic lighting, stylized illustration, Korean fantasy game aesthetic
- **⚠️ 금지**: hearthstone, blizzard, world of warcraft 언급 금지

---

## 🎨 공통 프롬프트 접두사

```
Dark fantasy card illustration, single character portrait,
chest-up composition centered upper third,
dramatic lighting, stylized digital painting,
1024x1536 portrait ratio,
rich detail, intricate costume, atmospheric background,
vignette darkened edges, NO frame, NO text, NO UI
```

## ⚠️ 공통 네거티브

```
hearthstone, blizzard, warcraft, logo, watermark, text,
multiple characters, full body, wide shot, flat color,
anime, cartoon, 3d render, photo, blurry, low quality
```

---

## 🔥 원소별 정체성 프롬프트

### 🔥 화염 (Fire) — "빠르게 불태운다"
```
flaming red and orange palette, volcanic battlefield background,
embers and sparks floating, heat waves,
character aura: fire
```

### 💧 물 (Water) — "흐름으로 지배한다"
```
deep ocean blue and cyan palette, misty coastal cliff background,
water droplets and ice crystals, flowing robes,
character aura: water/ice
```

### ⚡ 번개 (Lightning) — "먼저 치고 빠진다"
```
electric purple and gold palette, storm cloud sky background,
crackling lightning bolts, glowing eyes,
character aura: lightning
```

### 🌍 땅 (Earth) — "무너지지 않는다"
```
earthy brown and moss green palette, rocky canyon background,
rising dust, stone fragments floating,
character aura: earth/stone
```

### 🌑 암흑 (Dark) — "위험을 감수한다"
```
shadowy black and violet palette, cursed forest background at night,
dark mist tendrils, eerie purple glow,
character aura: shadow
```

### ☀️ 신성 (Holy) — "동료를 살린다"
```
ivory and golden palette, cathedral rays of light background,
floating golden feathers, divine halo,
character aura: holy light
```

---

## ⚔️ 역할별 캐릭터 프롬프트

### 근접 전사 (h_m_*) — "탱커, 앞열"
```
heavy armored warrior, massive sword or battle axe,
heroic strong stance, facial expression determined,
chestplate with element motif, metallic details
```

### 원거리 궁수 (h_r_*) — "사수, 정확"
```
agile ranger archer, elegant longbow or crossbow drawn,
aiming pose with focused eyes, leather and cloth armor,
element-infused arrow, quiver visible
```

### 지원 마법사 (h_s_*) — "비전, 마법"
```
mystic mage sorcerer, ornate robe with element symbols,
casting spell with glowing hands, floating orb or staff,
wise but powerful, arcane runes in the air
```

---

## 📋 18장 전체 프롬프트 조립 템플릿

**형식**: 접두사 + 원소 + 역할 + (네거티브는 별도 입력)

### 예시 1: `h_m_fire` (근접 전사 — 화염)
```
Dark fantasy card illustration, single character portrait,
chest-up composition centered upper third,
dramatic lighting, stylized digital painting,
1024x1536 portrait ratio,
rich detail, intricate costume, atmospheric background,
vignette darkened edges, NO frame, NO text, NO UI,
heavy armored warrior, massive sword or battle axe,
heroic strong stance, facial expression determined,
chestplate with element motif, metallic details,
flaming red and orange palette, volcanic battlefield background,
embers and sparks floating, heat waves,
character aura: fire
```

### 예시 2: `h_s_water` (지원 마법사 — 물)
```
Dark fantasy card illustration, single character portrait,
chest-up composition centered upper third,
dramatic lighting, stylized digital painting,
1024x1536 portrait ratio,
rich detail, intricate costume, atmospheric background,
vignette darkened edges, NO frame, NO text, NO UI,
mystic mage sorcerer, ornate robe with element symbols,
casting spell with glowing hands, floating orb or staff,
wise but powerful, arcane runes in the air,
deep ocean blue and cyan palette, misty coastal cliff background,
water droplets and ice crystals, flowing robes,
character aura: water/ice
```

---

## 🔢 전체 18장 id → 설명 매핑

| id | 역할 | 원소 | 한 줄 캐릭터 컨셉 |
|----|------|-----|----------------|
| h_m_fire | 근접 | 불 | 붉은 갑주 대검 전사, 광기의 불꽃 |
| h_m_water | 근접 | 물 | 푸른 방패 기사, 해양의 수호자 |
| h_m_lightning | 근접 | 번개 | 은빛 창 전사, 폭풍 속 선봉 |
| h_m_earth | 근접 | 땅 | 거대한 석궤(철퇴) 전사, 부동의 탱커 |
| h_m_dark | 근접 | 암흑 | 검은 갑옷 암살검, 그림자 흡혈귀 |
| h_m_holy | 근접 | 신성 | 금빛 갑옷 성기사, 빛의 심판 |
| h_r_fire | 원거리 | 불 | 화염 석궁수, 폭발 화살 |
| h_r_water | 원거리 | 물 | 얼음 활 명사수, 빙결 조작 |
| h_r_lightning | 원거리 | 번개 | 뇌전 활수, 낙뢰 사격 |
| h_r_earth | 원거리 | 땅 | 돌 투석 레인저, 덫 달인 |
| h_r_dark | 원거리 | 암흑 | 독화살 그림자 궁수 |
| h_r_holy | 원거리 | 신성 | 빛의 성궁수, 축복의 화살 |
| h_s_fire | 지원 | 불 | 붉은 로브 화염술사 (샘플 01_04_14 레퍼런스) |
| h_s_water | 지원 | 물 | 청색 로브 수호술사, 치유의 물결 |
| h_s_lightning | 지원 | 번개 | 보라 로브 뇌전술사, 쇠사슬 번개 |
| h_s_earth | 지원 | 땅 | 갈색 로브 자연술사, 덩굴 치유 (샘플 01_07_59 레퍼런스) |
| h_s_dark | 지원 | 암흑 | 흑색 로브 사령술사, 저주의 서 |
| h_s_holy | 지원 | 신성 | 흰 로브 성직자, 부활의 기도 |

---

## 🛠 ChatGPT 이미지 사용 시 주의

1. **1회 1장**: 18장을 한 번에 요청하면 구도/품질 흐트러짐. 반드시 1장씩 요청.
2. **프롬프트 일관성**: 공통 접두사/네거티브는 복붙, 원소/역할만 교체.
3. **파일명 규칙**: 저장 시 `h_m_fire.png` 등 id 그대로. `img/` 폴더에 덮어쓰기.
4. **품질 확인**: 브라우저에서 `node tools/game_inspect.js units-grid` 돌려서 프레임에 잘 맞는지 즉시 확인.
5. **재생성 판단**: 얼굴이 프레임 밖으로 나가거나, 원소 톤이 안 맞으면 재생성.

---

## 🎨 대안: Stable Diffusion (DreamShaper) 재사용

ChatGPT가 어렵다면 `gen_heroes_v2.py`로 Stable Diffusion을 쓸 수도 있음. 다만 품질이 ChatGPT보다 떨어질 가능성 큼. 스크립트는 이 문서의 프롬프트를 그대로 사용해 생성 가능.
