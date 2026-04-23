# NPC 일러스트 제작 요청 — P0 Lv1 미적용 4장 (2026-04-23)

> **최우선 순위 4장**. 이 NPC 들은 게임 초반(튜토리얼~5판) 에 플레이어가 **반드시** 만나는 캐릭터.
> 현재 AI placeholder 적용된 상태 — 퀄리티 차이가 크게 체감됨.
>
> 선행 5장 이식 완료 (`tavern_1`·`shop_1`·`church_1`·`library_1`·`gate_5`) — 동일 톤 유지.

## 공통 규격

| 항목 | 값 |
|---|---|
| 해상도 | **500 × 800 px** (5:8 세로, 카드 400×600 과 유사 비율) |
| 구도 | **하프바디** (머리 꼭대기 ~ 허리/엉덩이) |
| 배경 | **투명 PNG** (대화 오버레이 뒤에 얹힘) |
| 포즈 | 각 NPC 톤에 맞는 자세 (환영·겁먹음·수줍음·짚허수아비) |
| 시선 | 정면 또는 45도 — 플레이어와 눈맞춤 |
| 파일명 | `img/npc_{buildingId}_1.png` (기존 규약 유지) |
| 스타일 | 판타지, 드라마틱 라이팅, stylized illustration, painterly |

## 금지 / 권장 (05-design-direction.md 준수)

- ❌ hearthstone / blizzard / world of warcraft
- ❌ 원형 초상화 컷
- ❌ 불투명 배경
- ❌ 과한 금속 광택·디테일 (Lv1 은 소박한 톤)
- ✅ `fantasy character portrait, half body, upper body crop, transparent background`
- ✅ `painterly style, stylized illustration, dramatic lighting`
- ✅ 캐릭터 중앙 60% 차지, 머리 상단 근처, 허리~엉덩이 아래 잘림

---

## 🎴 이번 요청 — 4장

### 1. `npc_castle_1.png` — 늙은 조언자

**설정**
- **성별·나이**: 남성, 70대 노학자
- **옷차림**: 짙은 남색/자수정 로브, 금실 자수 테두리, 어깨에 두꺼운 양피지 두루마리
- **소품**: 왼손에 **나무 지팡이** (끝에 작은 수정), 오른손은 환영하듯 가볍게 내밂
- **외모 포인트**: 길고 흰 수염, 벗어진 정수리 + 양옆 흰머리, 깊은 주름, 지혜로운 눈빛
- **표정**: 차분한 미소, 눈은 살짝 가늘게 — "드디어 오셨구려" 의 원로 느낌
- **대사 톤**: "영웅이여... 동료를 단련시키시오." (중후·권위 있지만 온화)
- **배경 힌트(투명이지만 참고)**: 석조 성 집무실, 촛불·양피지 쌓인 책상

**복붙 프롬프트** (Gemini/ChatGPT Image/SD)
```
Fantasy character portrait, half body composition, 500x800 vertical, transparent PNG background.
Elderly male royal advisor, 70s, long flowing white beard, balding crown with white hair on sides, deep wrinkles, wise calm eyes with gentle smile.
Wearing dark navy-indigo wizard robe with gold embroidered trim, heavy parchment scrolls draped over shoulder.
Holding a wooden staff with small crystal in left hand, right hand extended in welcoming gesture.
Dramatic side lighting with warm candle glow, painterly style, stylized illustration, desaturated noble palette, subtle golden highlights on robe trim.
No hearthstone aesthetic, no blizzard style, no circular frame, no armor portrait.
Character occupies central 60% of canvas, head near top, body cropped at hips.
```

---

### 2. `npc_gate_1.png` — 소년 파수꾼

**설정**
- **성별·나이**: 남성, 10~12세 소년
- **옷차림**: 너무 큰 철 헬멧 (헐렁해서 눈 반쯤 가림), 두꺼운 패딩 튜닉, 낡은 가죽 벨트, 사이즈 안 맞는 파수꾼 복장
- **소품**: 양손으로 무거운 **나무창** 꼭 움켜쥠 (자기보다 큰 창)
- **외모 포인트**: 헬멧 사이로 삐죽 나온 헝클어진 갈색 머리, 주근깨, 큰 눈 (겁먹어 동그래짐)
- **표정**: 놀라서 눈 커지고 입 약간 벌림, **겁먹은 소년** — "헉! 영웅님이세요?" 의 순진한 놀람
- **대사 톤**: "어... 안녕하세요! 밖에 무서운 것들이 많아요!" (소극적·겁먹은)
- **배경 힌트**: 밤의 성문 옆, 횃불 희미, 돌담

**복붙 프롬프트**
```
Fantasy character portrait, half body composition, 500x800 vertical, transparent PNG background.
Young boy gate guard, 10-12 years old, messy brown hair poking out from oversized iron helmet that slips down past his eyes, freckles, wide startled eyes, mouth slightly open in surprise.
Wearing too-big padded tunic guard uniform, worn leather belt, sleeves rolled up, cloth shoulder wrap.
Both small hands gripping a heavy wooden spear that's taller than he is, knuckles white from nervousness.
Timid frightened expression, innocent wide-eyed look, painterly style, stylized illustration, dramatic torch lighting from below, dusty warm palette with worn leather tones.
No hearthstone aesthetic, no blizzard style, no circular frame, no heroic pose.
Character occupies central 60% of canvas, head near top, body cropped at hips.
```

---

### 3. `npc_forge_1.png` — 견습공

**설정**
- **성별·나이**: 남성, 15~17세 풋풋한 견습생
- **옷차림**: 그을음·재로 얼룩진 갈색 가죽 앞치마 (엉성하게 묶임), 땀에 젖은 흰 셔츠 소매 걷어올림, 앞치마 주머니에 천 쪼가리
- **소품**: 오른손에 **작은 망치**(자기 체격보다 살짝 큼), 왼손에 집게
- **외모 포인트**: 검은 재 묻은 얼굴 (볼·이마), 땀에 엉킨 짧은 적갈색 머리, 어리지만 단단한 팔뚝, 어색한 미소
- **표정**: 수줍고 살짝 당황 — 눈은 약간 아래로, 입꼬리는 어색하게 올라감. "어... 어서 오세요!" 의 첫 손님 응대
- **대사 톤**: "아직 서툴지만... 뭐 만들어 드릴까요?" (수줍고 자신 없음)
- **배경 힌트**: 불 꺼진 화로 옆, 모루, 걸려있는 도구들

**복붙 프롬프트**
```
Fantasy character portrait, half body composition, 500x800 vertical, transparent PNG background.
Young apprentice blacksmith, 15-17 years old male, short messy auburn hair damp with sweat, soot-smudged cheeks and forehead, youthful face with nervous awkward smile, eyes looking slightly down shyly.
Wearing heavy brown leather apron stained with ash and soot, loosely tied, white linen shirt underneath with sleeves rolled up showing lean but firm forearms, cloth rag tucked in apron pocket.
Holding a small blacksmith hammer in right hand (slightly too big for him), metal tongs in left hand.
Timid introverted expression, first-customer nervousness, painterly style, stylized illustration, warm forge firelight on one side, dusty rustic palette with leather browns and soot grays.
No hearthstone aesthetic, no blizzard style, no circular frame, no heroic muscular blacksmith cliche.
Character occupies central 60% of canvas, head near top, body cropped at hips.
```

---

### 4. `npc_training_1.png` — 허수아비 ⚠️ 사람 아님

**설정**
- **성별·나이**: 없음 — **훈련용 짚 허수아비 더미**
- **외형**: 머리는 **마대 자루**로 만들고 얼굴은 투박하게 **꿰매진 X 자 눈·삐뚤어진 입**, 목은 굵은 밧줄로 묶임
- **몸체**: 나무 십자 기둥에 **지푸라기 가득 채운 천 몸통**, 낡은 갈색 튜닉, 어깨에 빠진 짚이 삐져나옴, 팔은 스틱+천으로 허술하게
- **상처**: **창 자국·칼자국·불탄 자국** 여기저기 (훈련 대상이니), 꽂혀있는 화살 1~2개
- **표정**: 꿰매진 얼굴이지만 어딘가 **슬프거나 체념한 느낌** (눈X가 아래로 처진 각도), 대사가 "...저를 때려도 됩니다" 이므로 약간 우울한 코믹함
- **대사 톤**: "...저를 때려도 됩니다." (건조하고 체념적, 허수아비가 말한다는 게 포인트)
- **배경 힌트**: 흙먼지 훈련장, 꽂힌 나무말뚝, 바람에 흩날리는 지푸라기 (투명이지만 참고)

**복붙 프롬프트**
```
Fantasy character portrait, half body composition, 500x800 vertical, transparent PNG background.
Training dummy scarecrow (NOT a person), burlap sack head with crudely stitched X-shaped eyes sewn with thick black thread, crooked stitched mouth slanting downward in a melancholy expression, head tied to wooden cross-post with thick rope.
Body made of rough cloth tunic stuffed with straw, straw poking out at neck, shoulders, and sleeves, worn brown medieval tunic with patches.
Multiple battle damage: sword slashes, arrow holes (1-2 arrows still stuck in torso), scorch marks from fire spells, frayed fabric edges, dust and dirt stains.
Arms are stick-and-cloth, hanging limp at sides.
Vibe: oddly sad and resigned, quietly melancholic "please just hit me already" atmosphere, painterly style, stylized illustration, dusty training ground lighting with warm golden dust in air, muted earth palette with straw yellows and worn browns.
No hearthstone aesthetic, no blizzard style, no circular frame, no cute mascot scarecrow, no living person, no smile.
Central 60% of canvas, top of burlap head near top, body cropped at hips showing wooden cross-post.
```

---

## 📦 이식 절차 (파일 받으면)

1. 대표님 `C:/Users/USER/Downloads/` 저장 (파일명 자유, 예: `늙은조언자.png`, `소년파수꾼.png`, `견습공.png`, `허수아비.png`)
2. 제가 `img/npc_{castle|gate|forge|training}_1.png` 로 복사 + 500×800 리사이즈 + PNG 최적화
3. 흰 배경 있으면 threshold 투명화 적용 (church 와 동일 방식)
4. Playwright 로 NPC 대화 오버레이 실제 렌더 검수 (4건 × 스크린샷)
5. `current-focus.md` + `tracks/_signals/assets.md` 기록
6. 커밋 + 푸시

## ⏭️ 다음 요청 예정 (P1)

P0 완료 후:
- **church Lv1 표정 12장 이식** (이미 공급됨 — scene 분기 시스템 구현과 함께)
- 다른 Lv1 NPC 표정 variants (tavern/shop/library/castle/gate/forge/training 각 8~10장)

## ⏭️ 그 이후 (P2)

- **마을 맵 리뉴얼** (`bg_town_v3.png` 교체, 별도 스펙 작성 예정)
