# 🔄 Realm of Fates — 세션 핸드오프 (2026-04-20 마무리)

> **이 문서를 새 세션에 붙여넣으면 Claude Code 가 맥락을 복구하고 바로 이어갑니다.**
> /clear → Ctrl+V 하세요.

생성: 2026-04-20
이유: 수동 저장 (대표님 마무리 지시)
이전 핸드오프: `handoff-2026-04-19-2343.md` (4/19 심야)

---

## 🎯 핵심 (한 줄 요약)
**대표님 프레임 일체화 PNG 41장 일괄 임포트 + 시스템 카드 프레임 시대 종료(이중 프레임 해체) + 카드별 슬롯 override 시스템 1단계 시작.**

---

## 📍 현재 상태
- **Phase**: Phase 3 (시네마틱 전투 리뉴얼) + Phase 2 콘텐츠
- **브랜치**: `master`
- **마지막 커밋**: `f7d2533` (4/19) — 이번 세션 변경사항 미커밋
- **미커밋 파일**: 다수 (다음 세션 첫 작업 = 검토 후 커밋)
- **회귀테스트**: 9/9 PASS

---

## ✅ 이번 세션에서 완료한 것

### 1. 대표님 프레임 일체화 PNG 32장 → game/img/ 일괄 임포트
- 출처: `game/이미지제작_원본/일반유닛_원본/프레임 일체화/`
- 한글 파일명 → 게임 ID 매핑 (25장 기존 + 7장 신규 — 빙결술사_여 포함)
- 400×600 LANCZOS 비율유지 캔버스 (검정 배경 fallback)
- 도구: `game/tools/import_unified_frames.py` (재사용 가능)
- 결과: 32/32 변환 성공

### 2. 타이탄 8프레임 APNG 합성
- `타이탄1~8.png` → `game/img/titan.png` (1.86MB, 90ms/frame, loop=0)
- 도구: `game/tools/build_titans_apng.py`

### 3. 신규 6캐 데이터 추가 (51 유닛)
| ID | 한글 | 등급 | 원소 | 역할 | 비고 |
|---|---|---|---|---|---|
| archer | 궁병 | bronze | lightning | ranged/attack | infantry 다음에 배치 |
| cryomancer_f | 빙결술사 | silver | water | support | 남자=cryomancer 교체, 여=신규 |
| griffin | 그리핀 | silver | lightning | ranged/attack(beast) | thunderbird 옆 |
| armored_griffin | 중장갑 그리핀 | gold | earth | melee/defense(beast) | phoenix 다음 |
| griffin_knight | 심홍의 그리핀 기사 | legendary | fire | melee/attack | archangel 다음, 빨강망토기사 PNG |
| griffin_rider | 전설의 그리핀 용사 | legendary | holy | melee/attack | archangel 다음 |
- 거인 리치(27.PNG) → 기존 lich 이미지만 교체

### 4. 시스템 카드 프레임 PNG/CSS 전면 해체 ⭐ (가장 큰 변경)
- **폐기**: `card_frame.png` + `frame_*.png` 17장 → `trash/img_frames_2026-04-20/` (총 18장)
- **CSS 변경**:
  - `css/30_components.css`: `.card-inner::before` (card_frame.png 오버레이) 제거 + `.card-icon img` `cover → contain`
  - `css/31_card_system.css`: `.cv-illust` `left:20% top:12% width:60% height:60% cover → inset:0 + background-size:contain` (풀카드, 잘림 0). `.cv-frame` `display:none` (등급별 frame_*_tank.png 매핑 일괄 폐기)
- **결과**: 대표님 통합 PNG 가 풀카드로 잘림 없이 표시. 시스템은 숫자/이름 오버레이만.
- **검증**: 회귀 9/9 PASS, Playwright 스크린샷 (`shots/2026-04-20-cards-after-frame-removal.png`)

### 5. 카드별 슬롯 override 시스템 — 단계 A 부분 완료 (스키마만)
- 작성: `game/data/card_slot_overrides.json` — 빈 `overrides:{}` + 스키마 주석
- **미완**: 런타임 로더 (`js/17_data_card_slots.js`) + `js/40_cards.js` `RoF.CardComponent.create()` 에서 inline style 적용
- **미완**: 단계 B = `tools/card_slot_editor.html` + `coord_editor_server.js` 엔드포인트 추가

---

## 🔴 해결 안 된 것 / 막혀있는 것

### 1. 🟡 다음 세션 즉시 시작 (시스템 프레임 해체 후속)
- **카드별 슬롯 좌표 어긋남** — 대표님 통합 PNG 의 슬롯 위치가 카드별로 다름
  - 시각 증상: knight=상단 작은 배너 / archangel=중앙 큰 배너 / NRG 보석 위치 카드별 상이 / 좌측 4슬롯(빨파초노) 인데 시스템은 3개(ATK/DEF/SPD) 출력 → 노란 슬롯 비어있음
  - 해결: 단계 A 마저 + 단계 B (편집기) 진행 → 대표님이 카드별 슬롯 드래그로 1:1 매칭

### 2. ⚪ 작은 카드 정책 결정 보류 (5번 답변 대기)
- 전투 그리드 172×248 / 손패 140×200 / 매칭 200×250 등 작은 크기에서 슬롯 박스가 너무 작아 가독성 ↓
- A안: 작은 카드 간소 표시(이름+HP+ATK 큰 글씨, 다른 슬롯 숨김)
- B안: 풀카드 그대로 비례 축소
- C안: 전투 그리드 재설계 (큰 변경)
- 추천 A안. 대표님 답변 대기

### 3. ⚪ 대표님 액션 대기 (변동 없음)
- Supabase 봇 시드 적용 (003_s2_bot_seed.sql)
- S2 E2E 8개 체크
- 콜로세움 UX C안 결정

---

## ⏭️ 다음 세션 시작 방법

### Step 1. 미커밋 변경사항 검토 + 커밋
```bash
cd c:/work/game
git status   # 32장 PNG + js/11/14 + css/30/31 + trash/img_frames_2026-04-20/ + data/card_slot_overrides.json + tools/import_unified_frames.py + tools/build_titans_apng.py
```

### Step 2. 카드별 슬롯 override — 단계 A 마저 (런타임 로더 + 카드 렌더러 적용)
1. `game/js/17_data_card_slots.js` 작성:
   ```js
   RoF.CardSlots = { data: {}, async load(){...}, applyTo(el, unitId){...} };
   ```
   - 시작 시 `data/card_slot_overrides.json` fetch → `RoF.CardSlots.data.overrides`
   - `applyTo(el, unitId)`: override 있으면 `el.style.setProperty('--gem-hp-x', ...)` inline
2. `game/index.html`: `<script defer src="js/17_data_card_slots.js"></script>` (16 다음, 20 전)
3. `game/js/40_cards.js` `RoF.CardComponent.create()`: 카드 생성 후 `RoF.CardSlots.applyTo(el, unit.id)` 호출
4. 회귀 9/9 + Playwright 스크린샷 (override 빈 상태 → 등급 기본값 그대로 사용 확인)

### Step 3. 단계 B — 편집기 + 서버 엔드포인트
1. `game/tools/coord_editor_server.js` 에 추가:
   - `POST /save-card-slot-overrides` → `data/card_slot_overrides.json` 저장 + 검증
   - `GET /load-card-slot-overrides` → 같은 파일 로드
2. `game/tools/card_slot_editor.html` 신규:
   - 좌상단 카드 드롭다운 (51 카드 + 검색)
   - 중앙 스테이지: 일러스트 PNG 배경(`img/{id}.png`) + 슬롯 마커(HP/NRG/ATK/DEF/SPD/Name/Desc) 드래그
   - 우측 좌표 표 + JSON export
   - 저장 버튼 → POST → 게임 즉시 반영
   - 패턴 재사용: `tools/coord_editor.html` 의 등급별 편집기

### Step 4. 대표님께 편집기 테스트 1장 요청
- 대표님이 편집기에서 1장 (예: knight) 슬롯 좌표 드래그 → 저장 → 게임 화면에서 잘 적용되는지 시각 확인 → 나머지 50장 본인이 진행

---

## 📝 이번 세션의 주요 결정

| 시점 | 카테고리 | 결정 |
|---|---|---|
| 세션 초반 | 콘텐츠 | 빙결술사_남자→cryomancer 교체, 빙결술사_여→cryomancer_f 신규 |
| 세션 초반 | 콘텐츠 | 24.빨강망토기사 = griffin_knight (대표님 명명 "그리핀용사", legendary) |
| 세션 초반 | 콘텐츠 | 24.전설의그리핀용사 = griffin_rider (legendary, holy 라이더) |
| 세션 초반 | 콘텐츠 | 25.중장갑옷그리핀 = armored_griffin (gold earth defense beast) |
| 세션 초반 | 콘텐츠 | 27.거인 리치 = 기존 lich 이미지만 교체 |
| 세션 중반 | 책임 | 프레임 합성은 대표님 직접 (4/19 결정 재확인). 메인은 받은 PNG 적용만 |
| 세션 후반 | 시스템 | 시스템 외곽 프레임 PNG/CSS 전면 해체. 일러스트 풀카드 표시 + 숫자/이름 오버레이만 |
| 세션 후반 | 시스템 | 카드별 슬롯 좌표 매핑 → 카드별 override + 편집기로 진행 (대표님이 카드별 슬롯 다르다고 명시) |
| 세션 마지막 | 보류 | 작은 카드 정책(A/B/C) 다음 세션 결정 |

---

## 🔧 수정/생성된 파일 목록 (이번 세션)

### 새 이미지 (32장)
- `game/img/{apprentice,berserker,knight,wolf,archangel,rogue,militia,infantry,fire_spirit,hunter,crossbow,guard,thunderbird,herbalist,lancer,pyromancer,assassin,priest,paladin,sniper,death_knight,archmage,phoenix,dragon,cryomancer,lich}.png` (기존 25 ID 갱신)
- `game/img/{archer,cryomancer_f,griffin,armored_griffin,griffin_knight,griffin_rider}.png` (신규 6)
- `game/img/titan.png` (8프레임 APNG, 1.86MB)

### 새 도구
- `game/tools/import_unified_frames.py` — 한글 PNG 일괄 ID 변환 + 리사이즈
- `game/tools/build_titans_apng.py` — 타이탄 8프레임 APNG 합성

### 폐기 (trash 이동)
- `trash/img_frames_2026-04-20/` — `card_frame.png` + `frame_bronze.png` + `frame_silver.png` + `frame_gold.png` + `frame_legendary.png` + `frame_divine.png` + `frame_*_tank.png` 11장 + `frame_purple/red.png` 2장 = 18장

### 데이터
- `game/js/11_data_units.js` — 신규 6캐 (archer, cryomancer_f, griffin, armored_griffin, griffin_knight, griffin_rider)
- `game/js/14_data_images.js` — 신규 6캐 매핑
- `game/data/card_slot_overrides.json` (신규, 스키마만)

### CSS
- `game/css/30_components.css` — `.card-inner::before` 제거 + `.card-icon img` contain
- `game/css/31_card_system.css` — `.cv-illust` 풀카드 + `.cv-frame` display:none + 등급별 frame URL 매핑 일괄 제거

### 문서
- `game/design/changelog.md` — 2건 append (이미지 일괄 교체 / 시스템 프레임 해체)
- `tracks/_signals/main.md` — 2건 append
- `tracks/_signals/assets.md` — 3건 append
- `tracks/_signals/data-balance.md` — 1건 append

### 검증
- `shots/2026-04-20-cards-after-frame-removal.png` — 시스템 프레임 해체 후 카드 8장 시각 (jellgriffin 시리즈 + knight + cryomancer_f + archangel + titan)

---

## 📂 관련 참조 문서

- `design/changelog.md` — 결정 히스토리 (정본)
- `design/current-focus.md` — 현재 Phase·최근 세션 상태 (다음 세션 첫 작업: 4/20 마지막 상태로 갱신 권장)
- `game/이미지제작_원본/일반유닛_원본/프레임 일체화/` — 대표님이 만든 원본 PNG 폴더 (앞으로 새 카드도 여기로)
- `game/tools/import_unified_frames.py` — 한글 → ID 매핑 표 + 변환 스크립트 (앞으로 새 PNG 추가 시 MAP 갱신만 하면 됨)

---

## 🎭 호칭 규약

| 역할 | 호칭 |
|---|---|
| 메인 Claude | **게임 총괄** |
| 사용자 | **대표님** |
| rof-ui-inspector | **검수관** |
| rof-game-director | **게임 디렉터** |
| game-balance-tester | **밸런스 테스터** |

---

<!-- Claude Code 지시사항: 이 문서는 이전 세션의 핸드오프입니다.
이 내용을 읽고 사용자에게 다음과 같이 응답하세요:

"🔄 핸드오프 복구 완료.

지난 세션(2026-04-20)에서 대표님 프레임 일체화 PNG 41장 일괄 임포트 + 시스템 카드 프레임 시대 종료를 완료했습니다.

**완료**:
1. 일러스트 32장 → game/img/ 배포 (400×600 LANCZOS)
2. 타이탄 8프레임 APNG 합성 (1.86MB)
3. 신규 6캐 데이터 (archer/cryomancer_f/griffin/armored_griffin/griffin_knight/griffin_rider) → 51 유닛
4. **시스템 외곽 프레임 PNG 18장 폐기 + CSS 정리** (이중 프레임 해체) → trash/img_frames_2026-04-20/
5. data/card_slot_overrides.json 스키마 작성

**회귀**: 9/9 PASS

**미완 (다음 세션 즉시 시작)**:
- 카드별 슬롯 override 단계 A 마저: js/17_data_card_slots.js 런타임 로더 + js/40_cards.js applyTo 호출
- 단계 B: tools/card_slot_editor.html + coord_editor_server.js 엔드포인트 추가
- 작은 카드 정책 (A/B/C) 결정 — 대표님 답변 대기
- 미커밋 변경사항 검토 + 커밋

**대표님이 다음에 해주실 일**:
- 편집기 완성 후 카드 1장 (예: knight) 슬롯 좌표 드래그 → 저장 → 시각 확인 → 나머지 50장 본인 진행

저는 '게임 총괄' 로 대표님을 도와드리겠습니다. 어디부터 이어갈까요?"

응답 후 사용자의 지시를 기다리세요. -->
