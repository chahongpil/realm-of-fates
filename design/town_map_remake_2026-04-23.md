# 🗺 타운 맵 리메이크 스펙 (9 건물 체제)

> ⚠️ **2026-04-23 밤 옵션 C 로 번복 확정** — 맵 리메이크 **취소**.
> - 신전 = 별도 건물 아님. **성(castle) 내부 탭으로 흡수** (외관·배경 이미지 변경 없음).
> - 기존 `bg_town_v3.png` (1376×768) 그대로 유지. BUILDINGS 배열 8개 유지.
> - **대표님이 성 내부 신전 탭을 직접 구현** — 메인 세션 인계 불필요.
> - 아래 § 1~9 내용은 **옵션 A/B (번복된 안) 스펙**. 참고 기록으로만 보존.

---

## ❌ LEGACY: 옵션 A/B 원본 스펙 (번복됨)

> 이하 내용은 옵션 A (2560×1440 리메이크) / B (성벽 밖 확장) 기준이었으며, 2026-04-23 밤 옵션 C 확정으로 폐기. 맵 리메이크 자체가 취소됐으므로 이 섹션 전부 무시.

## 1. 배경 — 왜 리메이크

- **9 번째 건물 (신전) 추가** 확정 ([new_buildings_todo.md](new_buildings_todo.md) § 신전) — 기존 8 건물 구도로는 자연스러운 배치 불가.
- 현재 `bg_town_v3.png` 는 **1376×768** (1.7917) — 뷰포트 `1280×720` (16:9, 1.7778) 와 비율 불일치 → `contain` 으로 위아래 약 6 px letterbox.
- 리메이크 기회에 **비율도 16:9 정확 정렬**.

## 2. 결정 요약

| 항목 | 값 | 비고 |
|---|---|---|
| **제작 해상도** | **2560×1440** | 16:9 정확, 런타임 1280×720 의 2x (retina 대비) |
| **표시 해상도** | 1280×720 | `.claude/rules/01-project.md` 뷰포트 고정 변경 금지 |
| **CSS aspect-ratio** | **`16/9`** | 기존 `1376/768` 에서 변경 |
| **background-size** | `cover` 또는 `contain` | letterbox 0px 이므로 사실상 동일 (cover 권장 — 안전) |
| **건물 수** | **9** | 기존 8 + 신전 1 |
| **좌표 체계** | **% (container 기준)** | 유지. 재드래그 후 재설정 |

## 3. 파일 네이밍

- 현행: `img/bg_town_v3.png` (1376×768, 8 건물)
- 신규: **`img/bg_town_v4.png`** (2560×1440, 9 건물)
- 기존 `v3` 파일은 **유지** (롤백 여유) — `v4` 적용 후 1~2 세션 안정화되면 `trash/` 이동.

## 4. 9 건물 배치 제안 (확정은 대표님)

현재 원형 성벽 안에 8 건물 배치 → **신전 추가 공간 확보** 필요.

### 권장 배치안 (성·서고 사이)

```
         [castle 🏰 성]
            │
  [library 📋] ─── [shop 🏪]
      │         │
  [church ⛪]  [🔮 신전]  ← 신규
      │         │
  [forge ⚒️]  [tavern 🍺]
      │
  [training 🏟️]
            │
       [gate 🚪]
```

- **신전 위치**: 성 ↔ 서고 ↔ 상점 삼각 안 (지식 + 신앙 접점, 교회와 거리 둠)
- **교회와 신전 시각 분리**: 교회 = 서민 석조, 신전 = 고대·신비 (6 원소 문양 희미)
- **중앙 빈 공간**: 월드 맵 포털 or 타이틀 모뉴먼트 (옵션, 대표님 결정)

### 대안 배치

- B 안: 신전을 성벽 밖·독립 구역 (세대 누적 신화 "이계"/"천공" 상징). 1.5 배 맵 확장 필요.
- C 안: 성 내부 탭으로 신전 섹션 흡수. 외관 제작 불필요. 단, 물리 공간 부재로 몰입도 저하.

**결정 대기**: A/B/C 중 선택은 대표님 → 선택 후 상세 좌표 확정.

## 5. 프롬프트 방침 (트랙 2 assets 담당)

기존 `bg_town_v3` 스타일 유지 + 9 건물 반영:

- **톤**: 저녁 황혼 (`#1a1530 → #05061a` 스카이), 이소메트릭 쿼터뷰
- **아트 스타일**: `.claude/rules/05-design-direction.md` 준수 — 하스스톤 차별화, 블리자드 얼굴 금지
- **해상도**: 2560×1440 (16:9)
- **건물**: 9 개 cutout 제작 별도 (현재 `design/refs/town/cutouts/` 형식)
- **배경만 재생성**: 건물 cutout 은 기존 유지 (신전만 신규)

## 6. CSS 마이그레이션 (메인 세션 인계)

```css
/* Before (42_screens.css:93~102) */
.town-container {
  aspect-ratio: 1376/768;
  max-width: 1280px;
  max-height: 720px;
  background: url('../img/bg_town_v3.png') center/contain no-repeat;
}

/* After (옵션 A) */
.town-container {
  aspect-ratio: 16/9;
  max-width: 1280px;
  max-height: 720px;
  background: url('../img/bg_town_v4.png') center/cover no-repeat;
}
```

- `center/contain` → `center/cover` 또는 유지 — letterbox 0 이므로 차이 없음
- 건물 좌표는 % 기준이라 aspect 변경에도 **값 자체는 그대로 적용 가능** — 다만 시각 정합성 확인 필요 (원본 맵 1.7917 → 1.7778 로 가로 2% 좁아짐)
- **권장: `town_editor.html` 로 전체 9 건물 재드래그** → `slot_coords.json` 갱신 → `51_game_town.js:21~54` BUILDINGS 배열 좌표 재설정

## 7. 좌표 재설정 절차 (메인 세션)

1. 새 `bg_town_v4.png` 공급 완료 후
2. `design/prototypes/town_editor.html` 배경 이미지 교체 (1 줄)
3. 브라우저에서 9 건물 슬롯 드래그 배치 (신전 포함)
4. "좌표 저장" → `design/refs/town/slot_coords.json` 갱신
5. `js/51_game_town.js` BUILDINGS 배열에 **신전 entry 추가** + 8 기존 건물 x/y/w/h 재반영
6. 런타임 확인 (1280×720 뷰포트 + 2560×1440 소스 → 선명도 확인)

## 8. 후속 작업 체크리스트

### 🎨 트랙 2 (assets 영역) — 대표님 직접 제작
- [ ] `bg_town_v4.png` 2560×1440 원본 생성 (9 건물 반영 배경)
- [ ] 신전 외관 Lv1~5 cutout 5장 (기존 `new_buildings_todo.md` § 신전 Lv 체크박스와 동기)

### 🔧 메인 세션 — 코드·CSS
- [ ] `css/42_screens.css` aspect-ratio 1376/768 → 16/9 변경
- [ ] `css/42_screens.css` background URL v3 → v4
- [ ] `js/51_game_town.js` BUILDINGS 배열 확장 (9 건물 + 좌표 재설정)
- [ ] `design/refs/town/slot_coords.json` 갱신
- [ ] 신전 action 함수 (`showTemple`) 추가 — god_npc_spec 연결 hooks
- [ ] 회귀 11/11 PASS 확인 + Playwright 시각 검증

### 📝 트랙 5 — 후속 기획 문서
- [ ] 신전 Lv1~5 NPC 정의 (기존 `51_game_town.js:NPCS` 형식)
- [ ] 신전 action 스펙 = `castle_hub_spec.md` 와 교차 (역대 점유자 회랑 / 명예의 전당 / 꺼진 신좌의 방 / 유언 편집)
- [ ] 배치안 A/B/C 대표님 확정 후 이 문서 § 4 업데이트

## 9. 관련 참조

- **뷰포트 규칙**: `.claude/rules/01-project.md` § 뷰포트 고정 (1280×720)
- **디자인 방향**: `.claude/rules/05-design-direction.md`
- **기존 맵**: `img/bg_town_v3.png` (1376×768, 8 건물)
- **건물 배열**: [`js/51_game_town.js:21~54`](../js/51_game_town.js#L21-L54)
- **CSS**: [`css/42_screens.css:93~102`](../css/42_screens.css#L93-L102)
- **신전 스펙**: [`new_buildings_todo.md`](new_buildings_todo.md) § 신전
- **신 NPC 처우**: [`god_npc_spec.md`](god_npc_spec.md)
- **좌표 편집기**: `design/prototypes/town_editor.html`
