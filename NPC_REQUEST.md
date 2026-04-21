# NPC 일러스트 제작 요청 (2026-04-21)

> 마을 건물 8종 × 레벨 5 = 최대 40명. 이번은 **Lv1 NPC 4명** 시범 세트.
> 작동 확인 후 나머지 36장 순차 제작 판단.

## 공통 규격

| 항목 | 값 |
|---|---|
| 해상도 | **500 × 800 px** (5:8 세로, 카드 일러스트 400×600 과 유사 비율) |
| 구도 | **하프바디** (머리 꼭대기 ~ 허리/엉덩이) |
| 배경 | **투명 PNG** (대화창 뒤에 얹기) |
| 포즈 | 손님을 맞이하는 자세 (인사·환영·손짓·미소) |
| 시선 | 정면 또는 약간 45도 — 플레이어와 눈맞춤 |
| 파일명 | `img/npc_{buildingId}_{lv}.png` (기존 규약 유지) |
| 스타일 | 카드 일러스트와 일관 — 판타지, 드라마틱 라이팅, stylized illustration |

## 금지 / 권장 프롬프트 (05-design-direction.md 준수)

- ❌ hearthstone / blizzard / world of warcraft
- ❌ 원형 초상화 컷 (카드 프레임에 들어갈 것 아님)
- ❌ 불투명 배경 (대화창 겹침 문제)
- ✅ `fantasy character portrait, half body, upper body crop, transparent background`
- ✅ `welcoming pose, warm smile, dramatic lighting, stylized illustration`

## 🆕 이번 세트 — Lv1 NPC 4장

기존 `js/51_game_town.js` 의 NPCS 데이터 그대로 사용. 대사/이름은 정해져 있음. 외형만 일러스트로.

### 1. `npc_tavern_1.png` — 주막주인
- 성별/나이: 남성 30대, 털보 바텐더 느낌
- 옷: 앞치마 + 롤업 셔츠, 어깨에 수건
- 소품: 왼손에 맥주잔 or 헝겊으로 잔 닦는 포즈
- 표정: 환한 웃음, 손님 반김
- 대사 톤: "어서 와! 마실 것부터 줄까?" (친근, 편안)
- 배경 힌트(투명이지만 참고): 나무 선술집 분위기, 따뜻한 주황빛

### 2. `npc_shop_1.png` — 행상인
- 성별/나이: 여성 60대, 이모티콘 👵 = 할머니
- 옷: 소박한 옷차림, 숄 두른 듯한 느낌, 허리춤에 주머니
- 소품: 양손에 작은 약초/물건을 들거나, 앞에 놓인 좌판
- 표정: 푸근한 미소, 눈웃음
- 대사 톤: "어머, 손님! 좋은 물건 많아요~" (붙임성 좋은 할머니)

### 3. `npc_church_1.png` — 수녀
- 성별/나이: 여성 20대, 성직자
- 옷: 검소한 흰 수녀복 + 베일, 목에 작은 십자가 펜던트
- 소품: 가슴 앞에 두 손 모아 기도하거나, 한 손에 작은 성경책
- 표정: 자애로운 미소, 눈은 살짝 내리깔기
- 대사 톤: "신의 축복이 함께하길... 다친 동료가 있나요?" (온화)
- 분위기: 뒤쪽 살짝 황금빛 후광 (투명 PNG 안에서 약하게)

### 4. `npc_library_1.png` — 서생
- 성별/나이: 중성적 20대, 샌님 스타일
- 옷: 학자 로브, 안경 or 책 끼고 있는 느낌
- 소품: 한 손에 두꺼운 책, 다른 손에 깃펜 or 양피지
- 표정: 약간 부끄러워하는 듯, 귀찮은 듯한 미소 (대사 톤 반영)
- 대사 톤: "아... 조용히 해주세요, 읽는 중이에요." (내향적)

## 추천 프롬프트 템플릿 (Gemini/ChatGPT Image 복붙용)

```
Fantasy character portrait, half body (head to hips), 500x800 vertical composition,
transparent PNG background, welcoming pose facing viewer,
[NPC 상세: 성별/나이/옷/소품/표정],
dramatic side lighting, stylized illustration, painterly style,
no hearthstone, no blizzard aesthetic,
no circular frame, no armor portrait style.
Keep character occupying central 60% of canvas, head near top, body extending down.
```

## 확장 계획 (나머지 36장)

이번 4장 시범 세트 확인 후 대표님 판단:
- 모든 건물 Lv1 8장 → 24장 (Lv2~4) → 8장 (Lv5) 순차 제작
- 또는 상용 건물 위주(tavern/shop/church) 레벨 5개씩 우선

## 이식 절차 (파일 받으면)

1. 대표님이 `C:/Users/USER/Downloads/` 에 파일 저장
2. 제가 `img/npc_{buildingId}_1.png` 로 복사 (이미 경로 예약됨)
3. 기존 `getNpc().img` 매핑이 자동으로 이미지 사용
4. Playwright 시각 검수 (대화창 + 일러스트 레이아웃 확인)
5. 커밋 + 푸시

---

## 🔧 병행 작업 (제가 처리)

제가 지금 바로 진행하는 것들:

- ✅ 이 규격서
- 🔄 `js/51_game_town.js` NPCS 데이터에 `scenes:[...]` 필드 추가 (인사→설명→"뭐 도와드릴까요?" 3장)
- 🔄 `index.html` 에 `#npc-dialog-screen` DOM 추가
- 🔄 `css/42_screens.css` 에 대화 화면 CSS (좌측 NPC 하프바디 + 우측 대사창)
- 🔄 `js/51_game_town.js` 에 `showBuildingDialog(buildingId, onComplete)` 신규
- 🔄 기존 `action:'showTavern'` 등을 래핑 → 첫 방문이면 대화 먼저 → 기능 화면
- 🔄 `localStorage.rof8_npc_seen_{buildingId}` 플래그 (재방문 자동 스킵)
- 🔄 ESC 키로 스킵 (이번만)
- 🔄 대표님 파일 공급 전 placeholder 1×1 투명 PNG (코드 먼저 테스트)
