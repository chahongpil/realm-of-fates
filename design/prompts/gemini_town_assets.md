# Gemini 2.5 Flash Image — 마을 에셋 생성 프롬프트

> 참고 이미지: Heroes 3 스타일 판타지 마을 (운명의 왕좌 세계관)
> 출력: 빈 배경 1장 + 건물 8장 = 총 9장
> 최종 합성: 배경 위에 건물 PNG 8개 레이어드

---

## 🎨 공통 스타일 블록 (모든 프롬프트에 동일하게 포함)

**이 문장을 9개 프롬프트 전부에 그대로 박아 일관성을 잡습니다.**

```
Style: painterly hand-painted fantasy game art, isometric 3/4 top-down perspective at 45 degree angle, soft warm golden sunlight from the upper-left casting consistent shadows toward lower-right, stylized 2-3 tone shading with rich painterly detail, warm earthy palette of greens browns and stone grays with accent colors, dark fantasy mood, cohesive Heroes of Might and Magic 3 inspired aesthetic, mobile game asset quality, NO text, NO UI elements, NO photorealism, NO anime style, NO Hearthstone Blizzard style.
```

---

## 1. 빈 마을 배경 (base_terrain.png)

**용도**: 모든 건물이 올라갈 베이스 캔버스. 건물 슬롯 위치는 비워둠.
**해상도 권장**: 1024 × 1536 (세로, 모바일 480×720 비율)

```
An empty fantasy town terrain seen from a 45 degree isometric top-down view. Show ONLY the landscape: rolling green meadows with patches of grass and small flowers, winding cobblestone paths and dirt roads connecting eight empty clearings, two small stone bridges crossing a small stream, snow-capped mountain range in the distant background, scattered pine trees and rocks at the edges, a central open plaza area in the middle of the scene. Eight empty building foundation slots are visible as flat clearings or simple stone foundations arranged across the terrain — one large slot at top center on a hill, one slot at left middle near a rocky volcanic area, one slot left-center, one slot center, one slot right-center, one slot right middle near forest, one slot bottom-left, one slot bottom-right. Do NOT draw any buildings, structures, walls, towers, or houses — only the empty land waiting for buildings. The scene should feel like a Heroes of Might and Magic 3 town map background before any construction.

Style: painterly hand-painted fantasy game art, isometric 3/4 top-down perspective at 45 degree angle, soft warm golden sunlight from the upper-left casting consistent shadows toward lower-right, stylized 2-3 tone shading with rich painterly detail, warm earthy palette of greens browns and stone grays with accent colors, dark fantasy mood, cohesive Heroes of Might and Magic 3 inspired aesthetic, mobile game asset quality, NO text, NO UI elements, NO photorealism, NO anime style, NO Hearthstone Blizzard style.
```

---

## 2. 성 (castle.png) — 메인 허브

**용도**: 마을 최상단, 영웅 선택 메뉴 진입
**위치**: 화면 상단 중앙

```
A grand fantasy stone castle with multiple tall pointed spires and turrets, central keep with a large round tower, defensive curtain walls with battlements, a portcullis main gate, blue and gold heraldic banners flying from the spires, sitting on top of a rocky hill base. The castle is the ONLY object in the image, fully isolated and centered. Pure white background, no landscape, no other buildings, no surroundings, no people, single object centered with clean edges suitable for cutout. Show the castle from a 45 degree isometric 3/4 view so all towers are visible.

Style: painterly hand-painted fantasy game art, isometric 3/4 top-down perspective at 45 degree angle, soft warm golden sunlight from the upper-left casting consistent shadows toward lower-right, stylized 2-3 tone shading with rich painterly detail, warm earthy palette of greens browns and stone grays with accent colors, dark fantasy mood, cohesive Heroes of Might and Magic 3 inspired aesthetic, mobile game asset quality, NO text, NO UI elements, NO photorealism, NO anime style, NO Hearthstone Blizzard style.
```

---

## 3. 대장간 (forge.png)

**용도**: 장비 제작/강화

```
A fantasy blacksmith forge building made of dark stone and heavy timber, with a tall brick chimney pouring out orange smoke, glowing orange lava and fire visible through the open front, an anvil and weapon racks at the entrance, hammered iron details, sparks flying. The forge is built into a small rocky volcanic outcrop. The forge is the ONLY object in the image, fully isolated and centered. Pure white background, no landscape, no other buildings, no surroundings, no people, single object centered with clean edges suitable for cutout. Show from a 45 degree isometric 3/4 view.

Style: painterly hand-painted fantasy game art, isometric 3/4 top-down perspective at 45 degree angle, soft warm golden sunlight from the upper-left casting consistent shadows toward lower-right, stylized 2-3 tone shading with rich painterly detail, warm earthy palette of greens browns and stone grays with accent colors, dark fantasy mood, cohesive Heroes of Might and Magic 3 inspired aesthetic, mobile game asset quality, NO text, NO UI elements, NO photorealism, NO anime style, NO Hearthstone Blizzard style.
```

---

## 4. 콜로세움 (arena.png)

**용도**: 아레나(PvP) 진입

```
A circular Roman style stone colosseum arena with tiered open seating, weathered limestone walls, a few standing arches around the perimeter, a sandy combat floor visible in the center, dark stone foundations. The arena is moderately small, suitable for a town district. The colosseum is the ONLY object in the image, fully isolated and centered. Pure white background, no landscape, no other buildings, no surroundings, no people, single object centered with clean edges suitable for cutout. Show from a 45 degree isometric 3/4 view so the interior seating and outer wall are both visible.

Style: painterly hand-painted fantasy game art, isometric 3/4 top-down perspective at 45 degree angle, soft warm golden sunlight from the upper-left casting consistent shadows toward lower-right, stylized 2-3 tone shading with rich painterly detail, warm earthy palette of greens browns and stone grays with accent colors, dark fantasy mood, cohesive Heroes of Might and Magic 3 inspired aesthetic, mobile game asset quality, NO text, NO UI elements, NO photorealism, NO anime style, NO Hearthstone Blizzard style.
```

---

## 5. 마법 포털 (portal.png) — 성문(전투 진입)

**용도**: 전투 스테이지 진입 (실질적으로 성문 역할)

```
A magical fantasy portal in the form of a tall stone arch with intricate runic carvings, glowing bright blue crystals embedded around the frame, a swirling translucent blue magical energy filling the archway interior, two stone guardian statues standing on either side of the base, faint blue mist drifting from the portal, raised on a small stone platform with steps. The portal is the ONLY object in the image, fully isolated and centered. Pure white background, no landscape, no other buildings, no surroundings, no people, single object centered with clean edges suitable for cutout. Show from a 45 degree isometric 3/4 view.

Style: painterly hand-painted fantasy game art, isometric 3/4 top-down perspective at 45 degree angle, soft warm golden sunlight from the upper-left casting consistent shadows toward lower-right, stylized 2-3 tone shading with rich painterly detail, warm earthy palette of greens browns and stone grays with accent colors, dark fantasy mood, cohesive Heroes of Might and Magic 3 inspired aesthetic, mobile game asset quality, NO text, NO UI elements, NO photorealism, NO anime style, NO Hearthstone Blizzard style.
```

---

## 6. 대성당 (cathedral.png)

**용도**: 축복/부활 (성직 기능)

```
A gothic fantasy cathedral with tall pointed spires reaching upward, a large central rose stained-glass window, flying buttresses along the sides, ornate stone carvings, a heavy wooden double door entrance with iron hinges, a small belfry tower on top, weathered limestone walls. The cathedral is tall and narrow in proportion, dignified and solemn. The cathedral is the ONLY object in the image, fully isolated and centered. Pure white background, no landscape, no other buildings, no surroundings, no people, single object centered with clean edges suitable for cutout. Show from a 45 degree isometric 3/4 view.

Style: painterly hand-painted fantasy game art, isometric 3/4 top-down perspective at 45 degree angle, soft warm golden sunlight from the upper-left casting consistent shadows toward lower-right, stylized 2-3 tone shading with rich painterly detail, warm earthy palette of greens browns and stone grays with accent colors, dark fantasy mood, cohesive Heroes of Might and Magic 3 inspired aesthetic, mobile game asset quality, NO text, NO UI elements, NO photorealism, NO anime style, NO Hearthstone Blizzard style.
```

---

## 7. 선술집 (tavern.png)

**용도**: 용병 모병

```
A cozy fantasy wooden tavern building with a steeply sloped thatched or wooden shingle roof, exposed timber framing in the walls (Tudor style), a stone chimney with smoke rising from it, a wooden hanging signboard above the door (no text, just a generic mug or shield icon), small glass windows with warm yellow light glowing inside, a wooden door, a few barrels stacked outside the entrance. Two stories tall. The tavern is the ONLY object in the image, fully isolated and centered. Pure white background, no landscape, no other buildings, no surroundings, no people, single object centered with clean edges suitable for cutout. Show from a 45 degree isometric 3/4 view.

Style: painterly hand-painted fantasy game art, isometric 3/4 top-down perspective at 45 degree angle, soft warm golden sunlight from the upper-left casting consistent shadows toward lower-right, stylized 2-3 tone shading with rich painterly detail, warm earthy palette of greens browns and stone grays with accent colors, dark fantasy mood, cohesive Heroes of Might and Magic 3 inspired aesthetic, mobile game asset quality, NO text, NO UI elements, NO photorealism, NO anime style, NO Hearthstone Blizzard style.
```

---

## 8. 상점 (shop.png)

**용도**: 아이템 구매

```
A small fantasy merchant shop building, a single-story wooden structure with a colorful fabric awning extending over a front market stall, the stall counter displaying generic fantasy goods like potion bottles, scrolls, and sacks of grain, wooden walls with stone foundation, a small chimney, a slanted shingle roof. Modest but inviting. The shop is the ONLY object in the image, fully isolated and centered. Pure white background, no landscape, no other buildings, no surroundings, no people, single object centered with clean edges suitable for cutout. Show from a 45 degree isometric 3/4 view.

Style: painterly hand-painted fantasy game art, isometric 3/4 top-down perspective at 45 degree angle, soft warm golden sunlight from the upper-left casting consistent shadows toward lower-right, stylized 2-3 tone shading with rich painterly detail, warm earthy palette of greens browns and stone grays with accent colors, dark fantasy mood, cohesive Heroes of Might and Magic 3 inspired aesthetic, mobile game asset quality, NO text, NO UI elements, NO photorealism, NO anime style, NO Hearthstone Blizzard style.
```

---

## 9. 서고 (library.png)

**용도**: 스펠/퀘스트

```
A fantasy library building with a domed roof made of weathered copper or blue tile, classical stone columns flanking the entrance, tall narrow arched windows, ornate stone facade with carved owl or scroll motifs above the door, a small spire on top of the dome, stacks of books visible through windows, scholarly and ancient feeling. Modest but elegant. The library is the ONLY object in the image, fully isolated and centered. Pure white background, no landscape, no other buildings, no surroundings, no people, single object centered with clean edges suitable for cutout. Show from a 45 degree isometric 3/4 view.

Style: painterly hand-painted fantasy game art, isometric 3/4 top-down perspective at 45 degree angle, soft warm golden sunlight from the upper-left casting consistent shadows toward lower-right, stylized 2-3 tone shading with rich painterly detail, warm earthy palette of greens browns and stone grays with accent colors, dark fantasy mood, cohesive Heroes of Might and Magic 3 inspired aesthetic, mobile game asset quality, NO text, NO UI elements, NO photorealism, NO anime style, NO Hearthstone Blizzard style.
```

---

## 📋 사용 순서 (Gemini 사용 시)

1. **참고 이미지 첨부** — Heroes 3 마을 이미지 1장을 첫 메시지에 첨부 (있으면 톤 일치율 ↑↑)
2. **빈 배경 1장 먼저** — 1번 프롬프트로 베이스 생성, 마음에 들 때까지 반복
3. **건물 8장 순서대로** — 2~9번 한 장씩 생성. 같은 대화 안에서 계속 진행하면 Gemini가 앞 결과의 톤을 기억해 일관성 ↑
4. **맘에 드는 결과 저장** — `c:\work\design\refs\town\gemini\` 폴더에:
   - `base_terrain.png`
   - `castle.png`
   - `forge.png`
   - `arena.png`
   - `portal.png`
   - `cathedral.png`
   - `tavern.png`
   - `shop.png`
   - `library.png`
5. **다 모이면 알려주세요** — 제가 PIL로 합성 + 프로토타입 HTML에 심겠습니다

## 💡 Tip

- **한 대화 안에서 9개 다 생성**하는 게 톤 일관성에 최선. 대화 초반에 참고 이미지 + 1번 프롬프트로 톤 락 → 이후는 "같은 스타일로 [다음 건물]" 식으로 줄여서 요청해도 됩니다
- Gemini가 흰 배경 안 지키면: "Use a pure white background. No landscape. Single isolated object." 한 번 더 강조
- 건물 비율이 안 맞으면: "Make the [castle] much larger / smaller" 자연어로 수정
- 광원 어긋나면: "Sunlight should come from the upper-left, shadows fall to the lower-right" 재강조
