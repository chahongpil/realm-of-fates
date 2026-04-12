# Phase 2: 덱뷰 빈 상태 UX 기획

> 목표: 신규 유저(보유 0개)가 덱뷰를 열었을 때 "획득 경로 + 수집 욕구 + 비전감"을 동시에 전달
> 작성: 2026-04-12
> 📚 레퍼런스: `.claude/skills/game-design.md` §2 (소유 효과, 빈칸의 힘, 진행률 표시)

---

## 🚨 현재 문제

`shots/deck.png` (2026-04-12 캡처) 분석:
- 화면 상단 30%에만 컨텐츠 (탭 + NPC 대사 + 빈 라벨 3개)
- **하단 70%가 검은 공백** — 신규 유저는 "여긴 뭐하는 곳?" 혼란
- "습득한 비전 없음 / 소지한 유물 없음" — 텍스트만 존재, 시각 단서 0
- 슬롯 그림자 없음 → 수집 진행률 알 수 없음
- 획득 경로 안내 없음 → 어디서 모으는지 모름

## 🎯 설계 원칙

### 1. 빈칸의 힘 (Empty Slot Power)
사용자에게 **"이 자리에 들어올 카드가 있다"**를 시각적으로 암시.
- 슬롯이 검은 사각형이 아니라 **카드 실루엣** (회색 윤곽선)
- 자리마다 **"???"** 또는 **"잠금"** 아이콘
- 등급별 색상은 미리 보여줘 수집 욕구 자극

### 2. 진행률의 강제력
**N/M 형식의 숫자**가 가장 강력한 수집 동기:
- "유닛 0/30 보유"
- "스킬 0/30 보유"
- "유물 0/12 보유"
- 등급별 개수도: "브론즈 0/10", "실버 0/8", ...

### 3. 획득 경로 힌트
어디서 얻는지 **즉시 알 수 있게**:
- 유닛: "선술집에서 영입" + 🍺 아이콘
- 스킬: "전투 보상으로 획득" + ⚔️ 아이콘
- 유물: "차원의 균열에서 발견" + 🌀 아이콘
- 코팅: "리그 시즌 보상" + 🏆 아이콘

### 4. 첫 시작 안내 (Onboarding Hint)
신규 유저(가입 직후)에게 **첫 행동을 명시**:
- 큰 안내 카드: "📖 첫 동료를 영입하세요" → 선술집 바로가기 버튼
- 진행도가 0인 카테고리만 강조 (보유 카드 있으면 안내 숨김)

---

## 🎨 UI 구조 (확정안)

### 덱뷰 화면 — 전체 레이아웃

```
┌────────────────────────────────────────────┐
│  ⚜️ 영웅의 서                          ← 돌아가기  │  ← 상단 헤더
├────────────────────────────────────────────┤
│  [영웅 & 동료]  [비전(스킬)]  [유물]  [코팅]    │  ← 4개 탭
├────────────────────────────────────────────┤
│  📊 수집 진행도                              │
│  ┌────────────┬────────────┬────────────┐  │
│  │ 동료 0/30  │ 비전 0/30  │ 유물 0/12  │  │  ← 진행도 카드
│  │ ████░ 0%   │ ███░░ 0%   │ ████ 0%    │  │
│  └────────────┴────────────┴────────────┘  │
├────────────────────────────────────────────┤
│  💡 첫 시작 안내                              │
│  ┌──────────────────────────────────────┐  │
│  │ 🍺 선술집에서 첫 동료를 영입하세요     │  │  ← 신규 유저용
│  │ 골드 5로 브론즈 동료 1명 즉시 가능    │  │   (보유 0일 때만)
│  │              [선술집으로 →]          │  │
│  └──────────────────────────────────────┘  │
├────────────────────────────────────────────┤
│  ⭐ 보유한 영웅 (1)                           │  ← 영웅 섹션
│  [영웅 카드 1장 — 풀사이즈 V2 프레임]         │
├────────────────────────────────────────────┤
│  👥 보유한 동료 (0/30)                        │  ← 보유 동료 섹션
│  ┌──┬──┬──┬──┬──┬──┐                       │
│  │??│??│??│??│??│??│  ← 슬롯 실루엣 (회색)  │
│  ├──┼──┼──┼──┼──┼──┤                       │
│  │??│??│??│??│??│??│                       │
│  └──┴──┴──┴──┴──┴──┘                       │
│  📌 동료를 영입하면 여기에 표시됩니다             │
└────────────────────────────────────────────┘
```

### 슬롯 실루엣 디자인

```
빈 슬롯 (보유 0):                        획득 후 슬롯:
┌────────┐                              ┌────────┐
│ ┄┄┄┄┄┄ │  ← 점선 테두리 (회색)         │■■■■■■■│  ← 풀 카드
│ ┊  ?  ┊ │  ← 중앙 ? 아이콘             │ 일러스트 │
│ ┊     ┊ │                              │  + 스탯 │
│ ┄┄┄┄┄┄ │                              │         │
└────────┘                              └────────┘
opacity:.4                              opacity:1
```

### 진행도 카드 디자인

```
┌──────────────────┐
│  💎 비전 (스킬)    │  ← 카테고리 + 아이콘
│                  │
│  0 / 30          │  ← 큰 숫자 (Cinzel 폰트)
│  ▓▓▓░░░░░░░ 0%  │  ← 프로그레스 바
│                  │
│  💡 전투 보상       │  ← 획득 경로
└──────────────────┘
```

---

## 🎨 시각 디테일

### 색상
- **빈 슬롯**: 배경 `#1a1a2e`, 테두리 점선 `#3a3a4e`, 텍스트 `#5a5a6a`
- **보유 슬롯**: 카드 V2 프레임 그대로
- **진행도 바**:
  - 0%: 회색 (`#444`)
  - 1~30%: 빨강 → 주황 그라데이션
  - 31~70%: 주황 → 노랑
  - 71~99%: 노랑 → 초록
  - 100%: 황금 + 글로우

### 애니메이션
- **신규 획득 시**: 슬롯이 검정 → 풀 카드로 페이드인 + 황금 파티클
- **마지막 슬롯 채우기**: 카테고리 100% 달성 시 진행도 카드 황금 폭발
- **진행도 바**: 채워질 때 좌→우 슬라이드 (0.6s ease-out)

### 호버
- 빈 슬롯 호버: 약간 밝아지며 "획득 경로" 툴팁
- 진행도 카드 호버: 슬롯 위 글로우 (해당 카테고리)

---

## 📊 진행도 카테고리

### 영웅 (Heroes)
- 18종 (3역할 × 6원소)
- 가챠/이벤트 보상

### 동료 (Recruitable Units)
- 30종 (브론즈 10, 실버 7, 골드 4, 전설 4, 신 1, 추가 4)
- 등급별 진행도 표시:
  - 브론즈 0/10
  - 실버 0/7
  - 골드 0/4
  - 전설 0/4
  - 신 0/1
  - +4 추가 슬롯
- 획득: 선술집

### 비전 (스킬)
- 30종
- 등급별:
  - 브론즈 0/6
  - 실버 0/8
  - 골드 0/8
  - 전설 0/7
  - +1 (sk_handoff)
- 획득: 전투 보상

### 유물
- 12종
- 등급별:
  - 브론즈 0/3
  - 실버 0/3
  - 골드 0/3
  - 전설 0/3
- 획득: 차원의 균열, 가챠

### 코팅
- 5등급 × N개 카드
- 획득: 리그 시즌 보상, 단련, 가챠

---

## 🚀 첫 시작 안내 (Onboarding)

### 표시 조건
모든 카테고리 합계 보유 0개 (영웅 제외)

### 안내 내용 (단계별)

**Step 1: 첫 동료 영입**
```
🍺 첫 동료를 영입하세요!
선술집에서 골드 5로 브론즈 동료를 즉시 영입할 수 있습니다.

[선술집으로 →]   [나중에]
```

**Step 2: 첫 전투 (동료 1명 이상 보유 시)**
```
⚔️ 차원문에서 첫 전투에 도전하세요!
승리하면 비전(스킬)을 보상으로 받습니다.

[차원문으로 →]   [나중에]
```

**Step 3: 첫 유물 (스킬 1개 이상 보유 시)**
```
🌀 차원의 균열을 탐험하세요!
유물을 획득해 덱 전체를 강화할 수 있습니다.

[균열로 →]   [나중에]
```

**완료 조건**:
- Step 1: 동료 보유 ≥ 1
- Step 2: 스킬 보유 ≥ 1
- Step 3: 유물 보유 ≥ 1
- 모두 완료 → 안내 자동 숨김 (영구)

---

## 🛠 구현 메모 (웹 기준)

### HTML 구조 (덱뷰 컨테이너)
```html
<div id="deck-screen">
  <header class="deck-header">
    <h2>⚜️ 영웅의 서</h2>
    <button class="btn-back">← 돌아가기</button>
  </header>

  <nav class="deck-tabs">
    <button class="tab active" data-cat="units">동료</button>
    <button class="tab" data-cat="skills">비전</button>
    <button class="tab" data-cat="relics">유물</button>
    <button class="tab" data-cat="coatings">코팅</button>
  </nav>

  <section class="deck-progress">
    <div class="progress-card" data-cat="units">...</div>
    <div class="progress-card" data-cat="skills">...</div>
    <div class="progress-card" data-cat="relics">...</div>
  </section>

  <section class="deck-onboarding">
    <!-- 동적: 보유 0 일 때만 렌더 -->
  </section>

  <section class="deck-content">
    <div class="deck-grid" id="deck-grid">
      <!-- 동적 렌더: 보유 카드 + 빈 슬롯 -->
    </div>
  </section>
</div>
```

### CSS 신규 클래스
```css
.deck-progress { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px; }
.progress-card { background: rgba(0,0,0,.5); border: 1px solid rgba(255,200,80,.2); border-radius: 10px; padding: 14px; text-align: center; }
.progress-card .pc-num { font-size: 1.6rem; font-weight: 800; color: #f4e4a0; font-family: 'Cinzel', serif; }
.progress-card .pc-bar { height: 6px; background: #1a1a2e; border-radius: 3px; overflow: hidden; margin: 8px 0; }
.progress-card .pc-bar-fill { height: 100%; background: linear-gradient(90deg, #aa1a1a, #ff8844); transition: width 0.6s ease-out; }
.progress-card .pc-hint { font-size: 0.7rem; color: #888; }

.deck-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; padding: 16px; }
.empty-slot {
  aspect-ratio: 1024/1536;
  border: 2px dashed #3a3a4e;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem;
  color: #5a5a6a;
  background: #14141e;
  opacity: 0.5;
  cursor: help;
  transition: all 0.2s;
}
.empty-slot:hover { opacity: 0.8; border-color: #5a5a6a; }
.empty-slot::after { content: '?'; }

.deck-onboarding {
  margin: 16px;
  padding: 18px 24px;
  background: linear-gradient(135deg, rgba(255,200,80,.15), rgba(255,100,30,.1));
  border: 2px solid rgba(255,200,80,.4);
  border-radius: 12px;
  text-align: center;
}
```

### JS 갱신 (`js/53_game_deck.js`의 `showDeckView()` 수정)
```js
// 진행도 계산
const totalUnits = UNITS.filter(u => !u.id.startsWith('h_')).length; // 26
const ownedUnits = Game.deck.filter(c => !c.isHero).length;
const totalSkills = SKILLS_DB.length; // 30
const ownedSkills = (Game.ownedSkills || []).length;
// ... 등등

// 진행도 카드 렌더
// 빈 슬롯 + 보유 카드 그리드 렌더
// 온보딩 카드 (조건부)
```

---

## ✅ 완료 기준
- [ ] 진행도 카드 3종 (동료/비전/유물) 렌더
- [ ] 빈 슬롯 그리드 (회색 점선 + ?) 렌더
- [ ] 첫 시작 안내 카드 (동적 표시)
- [ ] 등급별 진행도 세부 표시
- [ ] 호버 시 획득 경로 툴팁
- [ ] 신규 획득 시 페이드인 애니메이션
- [ ] 카테고리 100% 달성 시 황금 폭발 연출
- [ ] 모바일 반응형 (3열 → 2열 → 1열)

## 🎯 우선순위
1. **MUST**: 빈 슬롯 + 진행도 카드 + 첫 시작 안내 (UX 핵심)
2. **SHOULD**: 등급별 진행도 / 획득 경로 툴팁
3. **NICE**: 애니메이션 / 카테고리 폭발 연출

## 📌 메모
- 이 기획서는 신규 유저 첫 인상을 좌우하는 핵심 화면. 출시 전 반드시 구현 권장.
- 빈 화면의 70% 검은 공백 → 슬롯 그리드로 채우면 즉시 "할 일 있다"는 인상 전달
- 진행률 표시는 게임 디자인 §2 (수집 욕구) 핵심 원리 적용
