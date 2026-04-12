# 🎨 배너/프레임 에셋 제작 요청서

> 작성: 2026-04-13
> 용도: Gemini 2.5 / ChatGPT Image / Midjourney 등으로 제작
> 스타일 공통: **회색 돌(granite)·어두운 철근·청동 장식** — 기존 5종 배너와 일관

---

## 🧭 제작 원칙 (모든 배너 공통)

### ✅ 필수
- **가운데 장식 절대 금지** (위쪽·아래쪽·양끝만 장식) — 텍스트/아이콘 영역 확보
- **투명 배경 PNG** (RGBA, 외곽 완전 투명)
- **가장자리 정돈** — 네 모서리 + 코너 리벳/프레임 뚜렷하게
- **9-slice 호환** — 가로/세로로 늘려도 테두리 변형 없도록, 중앙은 반복 가능한 벽돌/무늬
- **회색 계열** (R≈G≈B, 채도 15% 이하)
- **어두운 철근·리벳·청동 포인트** 강조
- **드롭 섀도우 여백** 최소 10px (PNG 외곽에 여유)

### ❌ 금지
- 가운데 방패/메달/독수리/그리폰/드래곤/룬 — **전부 양끝 또는 상단**으로
- 채색 돌 (파랑·녹색·보라 벽돌) — 회색만
- 글자/숫자/문자
- 종이·양피지 질감 (돌만)
- 복잡한 배경 (구름/빛줄기) — 배너 자체만

### 📏 해상도 & 포맷
- 모든 배너 **2배 해상도**로 제작 (retina)
- PNG RGBA
- 권장: Gemini/SDXL 1024~1536 생성 → 필요 크기로 후처리

---

## 📋 우선순위별 배너 리스트

### 🔴 P0 — 가장 급함 (지금 게임에서 텍스트 겹침 문제 해결)

#### 1. 🏷️ **타이틀 배너** (가로 긴, 가운데 비어있음)
- **파일명**: `banner_title_clean.png`
- **권장 비율**: **8:1** (예: 1600×200 원본)
- **용도**: 모든 화면 제목 텍스트 뒤 배경
  - `출정 편성` / `선술집` / `영웅 선택` / `진형 배치` / `보상` 등
- **디자인**:
  - 긴 가로 돌 판 (회색 벽돌)
  - 양 **끝**에만 철근 테두리 + 작은 리벳
  - **위쪽 중앙** 에 작은 청동 문양(선택) — 왕관/산 실루엣 정도
  - 가운데 **완전 비어있음** (벽돌 텍스처만)
  - 배경 투명
- **색**: 중간 회색 `#6a6e78` ~ `#4a4e58`
- **현재 대체 중**: `banner_scroll_horizontal` → 너무 장식 많고 양끝 스크롤 롤이 공간 먹음

#### 2. 📊 **HUD 가로 바** (얇고 풀폭)
- **파일명**: `banner_hud_bar.png`
- **권장 비율**: **32:1** (예: 2560×80 원본)
- **용도**: 화면 최상단 `골드 / HP / 리그 / 명예` 표시 바
- **디자인**:
  - 아주 얇고 긴 돌 판
  - 양끝 철근 (짧은 기둥 형태)
  - **높이 내에 5~7개 슬롯이 들어갈 정도로 여유**
  - 가운데 완전 평평 (벽돌 무늬)
  - 상단에 얇은 청동 라인 1줄 (악센트)
- **색**: 어두운 회색 `#3a3e48`, 상단 라인 청동 `#9a7a3a`
- **현재 대체 중**: `banner_wide_shield` → 가운데 방패가 텍스트 가림

#### 3. 📝 **정보 텍스트 돌판** (작은 사각)
- **파일명**: `banner_info_plate.png`
- **권장 비율**: **5:1** (예: 800×160 원본)
- **용도**: `cs-info`, `tav-info`, `char-select-sub` 등 서브 텍스트
- **디자인**:
  - 작은 직사각 돌판
  - 네 모서리 철근 리벳
  - 가운데 완전 평평
  - 살짝 오목한 느낌 (inset shadow)
- **색**: 중간 회색 `#5a5e68`
- **현재 상태**: `banner_small_plate` 있지만 가로 비율이 맞지 않음

---

### 🟡 P1 — 중요 (모달/카드 화면 품질)

#### 4. 🎴 **모달 액자** (중형 사각, 가운데 비어있음)
- **파일명**: `banner_modal_large.png`
- **권장 비율**: **1.5:1** (예: 1200×800 원본)
- **용도**: 확인 다이얼로그, 튜토리얼 박스, 로그인 폼
- **디자인**:
  - 사각 돌 액자
  - **상단 중앙**에 작은 청동 문양(방패) — 텍스트 영역 방해 X
  - 네 모서리에 큰 철근 리벳
  - **가운데 영역은 완전 평평** (다층 텍스트 + 버튼 들어갈 공간)
- **색**: 어두운 회색 `#4a4e58`, 리벳 청동
- **현재 대체 중**: `banner_box_medal` → 가운데 독수리가 폼 필드 가림

#### 5. 🔘 **버튼 바** (여러 버튼 수용 가로)
- **파일명**: `banner_button_row.png`
- **권장 비율**: **7:1** (예: 1400×200 원본)
- **용도**: 타이틀 메인 버튼 그룹, pick 화면 [완료][건너뛰기][리롤]
- **디자인**:
  - 긴 가로 돌 판
  - 양끝 작은 기둥 장식
  - 하단에 얇은 청동 레일 (버튼이 얹히는 느낌)
  - **가운데는 비어있음**
- **색**: 회색 `#585c66`, 청동 레일 `#8a6830`
- **현재 대체 중**: `banner_wide_rose` → 장미 덩굴이 버튼 위로 올라감

#### 6. 🔖 **탭 버튼 바** (중간 가로, 여러 탭)
- **파일명**: `banner_tab_bar.png`
- **권장 비율**: **9:1** (예: 1800×200 원본)
- **용도**: 선술집/덱뷰/성채의 탭 버튼 그룹
- **디자인**:
  - 얇고 긴 돌 판
  - 양끝 작은 철근
  - **가운데 완전 비어있음** (3~4개 탭 버튼이 들어감)
  - 상단 얇은 홈(groove) — 탭이 꽂혀있는 느낌
- **색**: `#5a5e68`
- **현재 대체 중**: `banner_wide_slot` → 가운데 원형 메달이 탭 가림

---

### 🟢 P2 — 폴리시 (고급 UI)

#### 7. 📜 **스크롤 패널** (긴 가로, 양끝 롤)
- **파일명**: `banner_scroll_clean.png`
- **권장 비율**: **4:1** (예: 1200×300 원본)
- **용도**: 튜토리얼, NPC 대화, 상세 설명
- **디자인**:
  - 양끝에 작은 돌 스크롤 롤 (너무 크지 않게)
  - 가운데 긴 회색 돌판 (벽돌 대신 매끈한 판)
  - 양옆 매듭 무늬 (celtic knot) — 이미 있는 banner_scroll_horizontal 비슷하되 **중앙 면적이 더 넓음**
- **색**: 회색 `#5a5e68`
- **현재 상태**: `banner_scroll_horizontal` 있음 — **대체보다 보완**

#### 8. 📏 **세로 사이드패널** (세로 긴)
- **파일명**: `banner_sidepanel_tall.png`
- **권장 비율**: **1:3** (예: 400×1200 원본)
- **용도**: 우측 상세 정보 패널, 통계, 인벤토리 리스트
- **디자인**:
  - 세로 긴 돌 판
  - 위아래 철근 테두리
  - 가운데 완전 평평
  - 상단에 작은 청동 문양(선택)
- **현재 상태**: `banner_vertical_tall` 있음 — OK

#### 9. ⭕ **원형 메달** (아이콘 배경)
- **파일명**: `banner_medal_blank.png`
- **권장 비율**: **1:1** (예: 512×512 원본)
- **용도**: 골드/HP/명예 아이콘 배경, 버튼 아이콘, 원형 장식
- **디자인**:
  - 원형 청동/철근 테두리
  - 내부 어두운 돌
  - **가운데 완전 비어있음** (아이콘이 들어감)
  - 외곽 4개 작은 리벳
- **현재 상태**: `banner_medal_round` 있지만 내부 매듭 무늬가 차 있어 아이콘 가림

#### 10. 🎯 **카드 슬롯 프레임** (빈 카드 플레이스홀더)
- **파일명**: `banner_card_slot.png`
- **권장 비율**: **2:3** (카드 비율, 예: 640×960 원본)
- **용도**: 편성 화면 빈 슬롯, 덱 빈 칸
- **디자인**:
  - 네 모서리 철근
  - 가운데 점선 또는 빈 공간
  - 상단에 작은 "+" 또는 빈 카드 아이콘
- **현재 상태**: 없음 — CSS `border:dashed` 로 대체 중

---

## 🎨 생성 프롬프트 템플릿 (Gemini/SDXL 공통)

### 공통 헤더
```
Fantasy UI banner asset, medieval stone frame,
gray granite brick texture, dark iron reinforcement,
aged bronze accents, ornate corner rivets,
clean empty center with room for text,
transparent background, RGBA PNG,
top-down orthographic view, no perspective,
no characters, no text, no logo, no words,
9-slice compatible, game UI element,
dark fantasy aesthetic
```

### 스타일 금지 (negative)
```
wooden, paper, parchment, scroll unrolled flat,
colored gems, jewels, crystals in center,
multiple colors, vibrant saturation,
characters, faces, body parts,
text, letters, numbers, logos,
cartoon, anime, 3d render, photorealistic,
shading too heavy, cluttered center,
ornate busy pattern in middle
```

### 예시 1: 타이틀 배너 (#1)
```
[공통 헤더]
long horizontal stone plaque, 8:1 aspect ratio,
short iron pillars at both ends only,
small bronze crown ornament on top center,
flat gray brick texture in middle (80% empty),
no decoration in center, aged weathered look
```

### 예시 2: HUD 바 (#2)
```
[공통 헤더]
very thin long horizontal stone bar, 32:1 aspect ratio,
minimal iron caps at both ends,
one thin bronze line across top edge,
flat gray stone middle with subtle brick pattern,
completely empty center for UI stats
```

### 예시 3: 정보 돌판 (#3)
```
[공통 헤더]
small rectangular stone tablet, 5:1 aspect ratio,
four corner iron rivets,
slightly recessed flat center (inset),
subtle gray granite texture, 
nothing in middle, perfect for short text
```

### 예시 4: 모달 액자 (#4)
```
[공통 헤더]
square stone frame, 1.5:1 aspect ratio (wider than tall),
small bronze shield ornament on top center only,
four large iron corner rivets,
completely flat empty gray stone middle,
room for multiple lines of text and buttons inside
```

### 예시 5: 버튼 바 (#5)
```
[공통 헤더]
long horizontal stone bar, 7:1 aspect ratio,
small stone pillars at both ends,
thin bronze rail across bottom edge,
completely flat empty center,
space for 3-4 buttons to sit on top
```

### 예시 6: 탭 바 (#6)
```
[공통 헤더]
thin long horizontal stone strip, 9:1 aspect ratio,
tiny iron caps at both ends,
subtle groove or channel along top edge,
completely empty gray center,
minimal decoration, utilitarian
```

---

## 📦 전달 받을 때 파일 규격

### 네이밍
- 파일명: 위 리스트의 `banner_*.png` 그대로
- 저장 위치: `C:\Users\USER\Downloads\` (사용자가 생성 후 이동)

### 후처리
1. 사용자가 다운로드 후 `C:\Users\USER\Downloads\banner_*.png` 로 저장
2. 제가 `c:/work/game/tools/cut_banners.py` 로 배경 제거 + 투명화
3. `c:/work/game/img/ui/` 로 복사
4. `css/35_banners.css` 에서 해당 변수에 연결
5. 게임에서 확인

### 한 번에 얼마나?
- 한 배너당 1장씩 개별 요청 권장 (Gemini 멀티 컴포지션 어려움)
- 품질이 마음에 들 때까지 재생성
- 1회 제작 시간: 1장 당 2~5분

---

## 🎯 우선 제작 권장

시간 없으시면 **P0 3장만**:
1. `banner_title_clean.png` (타이틀 배너)
2. `banner_hud_bar.png` (HUD 바)
3. `banner_info_plate.png` (정보 돌판)

이 3장만 있어도 모든 화면의 **가장 눈에 띄는 텍스트 배경**이 해결됩니다.

---

## 🔗 참조

- 기존 배너 스타일: `c:/work/game/img/ui/banner_*.png` (10종)
- 적용 CSS: `c:/work/game/css/35_banners.css`
- 디자인 방향 규칙: `.claude/rules/05-design-direction.md`

---

**끝.** 제작 완료 시 Downloads 에 저장해주시면 자동 처리합니다.
