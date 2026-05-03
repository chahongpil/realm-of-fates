# HUD 과밀 해소 + 폰트 일관성 기획서
> 작성: 2026-04-12 심야
> 범위: 마을 HUD 정보 밀도 재설계 + 전 화면 폰트 계층 확정
> 참조: `.claude/rules/05-design-direction.md`, `06-card-ui-principles.md`

## 0. 문제 정의 (game-designer 리뷰 결과)

### #9 HUD 과밀
- 마을 우상단 `.th-stat` 7개 (⭐이름 / 🥉리그 / 💰 / 💎 / ✨ / ⚡ / 전력) 가로 800px+ 필요
- 44px 높이 보장 이후 더 두꺼워져 모바일(390)에서 2~3줄 겹침
- 오로라 배경과 겹쳐 식별성 저하

### #10 폰트 일관성
- 타이틀 장식체(Cinzel serif) / 본문 산세리프(Noto Sans KR) 혼재
- 카드 이름 = Cinzel / 카드 설명 = Noto Serif KR / HUD = 시스템 폰트
- 05-design-direction은 "미니멀 산세리프" 기준 제시 — 현재 3계열 이상 섞여 있음

---

## 1. HUD 재설계 원칙

### 1-1. 정보 분리: 영구 vs 변동
| 축 | 영구 (세션 내 불변) | 변동 (전투/행동으로 변함) |
|----|--------------------|--------------------------|
| 영구 | ⭐닉네임, 🥉리그, 전력 | — |
| 변동 | — | 💰 💎 ✨ ⚡AP |

### 1-2. 레이아웃 재편 (모바일 우선)
```
┌─────────────────────────────────────────────┐
│ ⭐ 닉네임          [🥉 리그 0점 / 전력 120]  │  ← 1줄 (좌: 아이덴티티, 우: 진척)
├─────────────────────────────────────────────┤
│ [💰 5]  [💎 0]  [✨ 0]  [⚡ 1/3]             │  ← 2줄 (화폐 + AP)
└─────────────────────────────────────────────┘
```
- 데스크탑(≥768): 1줄에 모두 표시 + gap 확대
- 모바일(<768): 2줄 분리, 각 그룹 `justify-content:space-between`

### 1-3. 아이콘 뱃지 디자인
- 배경: `rgba(0,0,0,.65)` + `backdrop-filter:blur(6px)`
- 테두리: 1px solid `rgba(255,200,80,.2)` (현재 유지)
- 숫자: `#ffd700` 800 weight, 1.15rem
- 아이콘: 1.25rem + gap:6px
- 최소 높이 44px (이미 적용)

### 1-4. 배경 분리: "HUD 바" 레이어
- `.town-hud` 아래 `z-index:10`, 반투명 다크 스트립
- `backdrop-filter:blur(8px)` + 하단 `border-bottom:2px solid rgba(255,200,80,.35)`
- 마을 배경(오로라)과 HUD를 명확히 분리

### 1-5. 전력 표시 통합
- 현재 `.th-stat` 7번째 "전력 N" → ⚔️ 아이콘 + 리그 배지 옆으로 이동
- 예: `[🥉 브론즈 0점] [⚔ 120]`

---

## 2. 폰트 시스템 확정

### 2-1. 3계층 원칙
| 계층 | 용도 | 폰트 | 크기 |
|------|------|------|------|
| **타이틀** | 게임 타이틀, 화면 헤더, 카드 이름, 결과 배너 | `'Cinzel', 'Noto Serif KR', serif` | 1.2~2.5rem |
| **본문** | 설명 텍스트, 카드 설명, 다이얼로그, 툴팁 | `'Noto Sans KR', 'Inter', sans-serif` | 0.85~1rem |
| **수치/UI** | HUD 숫자, 스탯 값, 버튼 라벨 | `'Noto Sans KR', system-ui, sans-serif` **800 weight** | 1~1.2rem |

### 2-2. 금지 조합
- ❌ Cinzel을 본문/설명에 사용 (가독성 저해)
- ❌ 시스템 폰트를 카드 이름에 사용 (몰입도 저해)
- ❌ Georgia/Times 등 추가 serif 혼입

### 2-3. 구현 파일
- `css/00_base.css` 또는 전역 파일에 CSS 변수 정의:
  ```css
  :root{
    --font-title:'Cinzel','Noto Serif KR',Georgia,serif;
    --font-body:'Noto Sans KR','Inter',system-ui,sans-serif;
    --font-ui:'Noto Sans KR',system-ui,sans-serif;
  }
  ```
- 모든 화면 CSS에서 하드코딩된 `font-family:` → 변수 사용으로 교체

### 2-4. Google Fonts 로드 정리
- `index.html` `<head>`: Cinzel + Noto Sans KR + Noto Serif KR (서브셋)
- 불필요한 폰트 제거 (현재 Georgia, serif만 있으면 OK)

---

## 3. 구현 단계

### MUST (블로커급)
1. `css/42_screens.css` `.town-hud` 레이아웃 2줄 분리 + 모바일 미디어 쿼리
2. 전력 표시를 리그 배지 우측으로 이동 (`js/51_game_town.js`)
3. `css/00_base.css`에 폰트 CSS 변수 3종 추가
4. `.card-v2 .cv-name` → `var(--font-title)`, `.cv-desc` → `var(--font-body)`

### SHOULD
5. 전 CSS 파일 `font-family:` grep → 변수로 교체
6. HUD 숫자 가중치 통일 (800 weight)
7. `.th-stat` 아이콘 크기 1.25rem로 확대

### NICE
8. HUD 숫자 변동 시 `@keyframes coinPulse` 0.3초 (획득/소비 피드백)
9. 모바일에서 AP 아이콘만 별도 플로팅 (화면 하단 고정)
10. HUD 바 hover 시 툴팁 (예: 💎 보석 전용, ✨ 특별 상품 구매용)

---

## 4. 완료 기준
- [ ] mobile(390) 뷰포트에서 HUD 가로 스크롤/wrap 충돌 없음
- [ ] 전 화면 `grep -r "font-family" css/` 결과가 CSS 변수 3종만 사용
- [ ] `tools/touch_audit.js` 재실행 → HUD stat 44×44 유지
- [ ] `tools/game_inspect.js menu` 캡처에서 HUD와 배경 분리 명확
- [ ] `node tools/test_run.js` 6/6 통과

## 5. 모바일 반응형 스펙
```css
/* 데스크탑 ≥768 */
.town-hud{display:flex;justify-content:space-between;padding:10px 20px;}
.town-hud-left,.town-hud-right{display:flex;gap:10px;}

/* 모바일 <768 */
@media(max-width:767px){
  .town-hud{flex-direction:column;gap:6px;padding:8px 12px;}
  .town-hud-left,.town-hud-right{width:100%;justify-content:space-between;}
  .th-stat{padding:8px 10px;font-size:.95rem;}
}
```
