# 호칭·점유자·신전 시스템 설계 (A안)

> **작성**: 2026-05-03 (자율 세션)
> **상태**: 기획 초안. 사용자 검토 → 승인 시 phase 작업 진입.
> **근거**: `handoff-2026-05-03-0150.md` § 2 정체성 정의 + `lore-bible.md` v2 신좌×점유자 이원 구조 + 사용자 4안 중 A안.
> **핵심 가설**: "내 카드를 키워 → 시즌 마감 1위 → 신좌 점유자 = 신 호칭 → 신전 회랑에 영구 등재 → 채팅에서 자랑" 의 종착 루프 한 번에 완성.

---

## 0. 한 줄 요약

> **신좌(6원소+1) × 점유자(시즌 1위 카드) × 호칭(소유자 자랑) × 신전(역대 회랑)** 4 요소를 묶어 **정체성 ④ "자랑" 단계**를 게임화한다.

---

## 1. 왜 지금 (정체성 4단계 진단)

| 단계 | 정서 | 메커니즘 | 현재 |
|---|---|---|---|
| ① 선택 | "내 카드는 이거" | 영입 + favorite | 🟡 시그니처 표시 누락 |
| ② 육성 | "내가 키웠어" | 단련/분배/장비/스킬교체 | 🟢 단련+분배 OK |
| ③ 도달 | "신화 달성" | rarity + 시즌 캡 | 🟢 5단계+만렙100 / **시즌 캡 미구현** |
| ④ 자랑 | **"내가 그 카드의 신"** | **호칭+회랑+채팅** | 🔴 **호칭 0** |

**핵심 결론**: ②③ 사다리는 깔렸으나 ④ 사회적 검증·호칭이 비어있어 5시즌 동반자라는 시간축이 정서적 보상 없이 끝남. A안은 ④ 한 점을 메우면서 ① "내 카드" 표시까지 같이 해결.

---

## 2. 정의 (Source of Truth)

### 2.1 신좌 (Throne) — 영구 7좌

| ID | 원소 | 신좌 이름 | 아키타입 |
|---|---|---|---|
| `throne_fire` | 불 | 재의 신좌 | 폭력·재·변형 |
| `throne_water` | 물 | 심연의 신좌 | 망각·모성·심연 |
| `throne_earth` | 땅 | 외눈의 신좌 | 인내·수호·산 |
| `throne_lightning` | 전기 | 천둥의 신좌 | 속도·파괴·찰나 |
| `throne_holy` | 신성 | 약속의 신좌 | 약속·심판·빛 |
| `throne_dark` | 암흑 | 거래의 신좌 | 계약·어둠·교환 |
| `throne_apex` | (무속성) | 정점의 신좌 | 종합 1위 — 7번째 자리 |

> 신좌 = lore-bible v2 에 이미 명문화. 추가 작업 0. 데이터 ID 만 코드에 등장시키면 됨.

### 2.2 점유자 (Holder) — 시즌마다 교체

- **선정 규칙**: 시즌 마감 시 각 신좌별 **해당 원소 카드 중 league_points 1위 카드의 소유 플레이어**
  - 신좌 = 카드 단위 1위가 아니라 "**플레이어 + 카드 페어**" 1위
  - 예: "불 카드 중 가장 높은 LP 를 기록한 덱의 주력 불 카드"
- **정점의 신좌**: 시즌 종합 LP 1위 플레이어의 **본인 시그니처 카드** (favorite 표기된 카드)
- **첫 시즌 안전장치 (개정 P1-1)**: 1위 등극자가 없으면 **해당 신좌의 아키타입만 표시** ("재의 신좌 — 비어있음" / "심연의 신좌 — 비어있음"). 신전 회랑에는 **"제1세대 점유자" 엔트리 1행만 영구 보존** (시즌 0 시드 = 그라힘/모라스/...). 시즌 1 이후 공백 시즌이 다음 시즌의 '아키타입 위주' 표기를 받음 — 제1세대 개인성이 영원화되지 않도록 lore-bible v2 § 0.4 격리 원칙 준수.

### 2.3 호칭 (Title) — 소유자에게 부여

- **형식**: `{직업}의 신 ({신좌}, 시즌 {N})`
  - 예: "쌍검사의 신 (재의 신좌, 시즌 5)"
  - 예: "정점의 신 (일곱 번째 신좌, 시즌 5)" — lore-bible v2 § 1.3 "균형의 두려움" 의 "일곱 번째 자리" 용어 연결 (lore P2-1)
- **{직업} 결정 규칙**:
  - **현재 카드 데이터에 이미 존재하는 `type` 필드** 사용 (전사·사수·마법사·야수 등)
  - 예: `{id:'militia', type:'전사', ...}` → 호칭 "전사의 신"
  - 예: `{id:'apprentice', type:'마법사', ...}` → "마법사의 신"
  - **확장 권장**: `type` 4 종(전사/사수/마법사/야수) 은 너무 평이 → `subType` 또는 `archetype` 필드 추가로 더 구체화 ("쌍검사", "엘프 궁수", "정령사" 등)
  - 미설정 시 fallback: 카드 이름 그대로 (예: "그라힘의 신")
- **표시 위치**:
  - 채팅 닉네임 옆 (`@닉` 우측 작은 배지)
  - 프로필 / 코덱스 / 신전 회랑
  - 카드 V4 의 카드 이름 위 작은 라벨 (정체성 ① "내 카드" 표시 동시 해결)
- **유지 기간**: 영구. 한 번 점유자가 되면 호칭은 영원히 보유 (다음 시즌 1위 가져가도 본인은 "시즌 5 점유자" 호칭 유지 가능, 누적).

### 2.4 신전 (Temple) — 역대 회랑

- **위치**: 도시 건물 `temple` (이미 placeholder 존재, `showTemple` 액션)
- **구성**:
  - **내실 7개 방** (각 신좌 1개 + 정점 1개)
  - 각 방에는 **현 점유자 + 역대 점유자 타임라인** 표시
  - 제1세대 NPC 점유자(그라힘·모라스·에이드라·브론테스·세라피엘·네크리온)도 entry 1로 박혀 있음
- **상호작용**:
  - 점유자 카드 클릭 → 카드 전체 화면 + 소유 플레이어 닉네임 + 채팅 방문 링크
  - 신좌 이름 클릭 → 그 신좌의 lore-bible 발췌

---

## 3. 데이터 모델

### 3.1 신규 테이블 (Supabase migration `005_s6_thrones.sql`)

```sql
-- 시즌 정의 (1줄짜리 메타. 운영자가 시즌마다 1행 insert)
create table public.seasons (
  id            int primary key,                -- 1, 2, 3, ...
  name          text not null,                  -- "시즌 1: 잠든 신화"
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  level_cap     int not null default 20,        -- B안 시즌 캡 (이 시즌의 카드 Lv 상한)
  created_at    timestamptz not null default now()
);

-- 점유자 기록 — 시즌 마감 시 1행 append (영구)
create table public.throne_holders (
  id            uuid primary key default gen_random_uuid(),
  season_id     int not null references public.seasons(id),
  throne_id     text not null,                  -- 'throne_fire' | 'throne_water' | ... | 'throne_apex'
  user_id       uuid not null references auth.users(id) on delete cascade,
  nickname      text not null,                  -- snapshot (시즌 마감 시점 닉)
  card_id       text not null,                  -- 'unit_dragon_red' 등 카드 데이터 ID
  card_name     text not null,                  -- snapshot (변경 대비)
  card_class    text,                            -- '쌍검사' / null
  card_data     jsonb not null default '{}'::jsonb,  -- 시즌 마감 시점 카드 스냅샷 (Lv·rarity·skills)
  league_points int not null default 0,
  awarded_at    timestamptz not null default now(),
  unique (season_id, throne_id)                 -- 한 시즌 한 신좌 = 1명
);

-- 보유 호칭 — user_id 가 가진 호칭 목록 (조회 편의)
create table public.user_titles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title_text    text not null,                  -- "쌍검사의 신 (불 신좌, 시즌 5)"
  throne_id     text not null,
  season_id     int not null,
  is_active     boolean not null default false, -- 채팅 옆에 표시할 대표 호칭
  awarded_at    timestamptz not null default now()
);

-- RLS
alter table public.seasons enable row level security;
create policy "seasons_select_any" on public.seasons for select using (true);

alter table public.throne_holders enable row level security;
create policy "holders_select_any" on public.throne_holders for select using (true);
-- insert 는 운영자만 (service_role) — 시즌 마감 trigger 또는 cron job 에서

alter table public.user_titles enable row level security;
create policy "titles_select_any" on public.user_titles for select using (true);
create policy "titles_update_self" on public.user_titles for update using (auth.uid() = user_id);
```

### 3.2 클라이언트 게임 상태

```js
// js/50_game_core.js Game 객체 확장
{
  // 기존
  league_points, deck_snapshots, ...
  // 신규
  titles: [],            // [{title_text, throne_id, season_id, is_active}]
  activeTitle: null,     // 현재 채팅에 표시할 대표 호칭 (titles.find(t=>t.is_active))
  favoriteCardId: null,  // 정체성 ① "내 카드" 시그니처 (정점의 신좌 후보 카드)
}
```

### 3.3 첫 시즌 시드 데이터

```sql
-- 시즌 0 (제1세대 신화 시즌, 게임 출시 전)
insert into public.seasons values
  (0, '제1세대 신화의 시즌', '2025-01-01'::timestamptz, '2025-12-31'::timestamptz, 100, now());

-- 제1세대 6 신 + 여신 = 7 점유자 (lore-bible v2 의 NPC)
-- user_id 는 운영자 시스템 계정 1개 사용 (예: 'system' 닉)
insert into public.throne_holders (season_id, throne_id, user_id, nickname, card_id, card_name, card_class, card_data, league_points) values
  (0, 'throne_fire',      :system_uid, '재의 왕',         'npc_grahim',     '그라힘',     '레드 드래곤',           '{}'::jsonb, 99999),
  (0, 'throne_water',     :system_uid, '심연의 어머니',    'npc_moras',      '모라스',     '히드라',                '{}'::jsonb, 99999),
  (0, 'throne_earth',     :system_uid, '외눈의 수호자',    'npc_eidra',      '에이드라',    '외눈의 키클롭스 (형)',  '{}'::jsonb, 99999),
  (0, 'throne_lightning', :system_uid, '천둥의 아우',      'npc_brontes',    '브론테스',    '분노의 키클롭스 (동생)','{}'::jsonb, 99999),
  (0, 'throne_holy',      :system_uid, '약속의 천사',      'npc_seraphiel',  '세라피엘',    '세라핌',                '{}'::jsonb, 99999),
  (0, 'throne_dark',      :system_uid, '거래의 뿔악마',    'npc_necrion',    '네크리온',    '뿔악마',                '{}'::jsonb, 99999),
  (0, 'throne_apex',      :system_uid, '운명의 여신',      'npc_goddess',    '여신',       '베틀 짜는 자',          '{}'::jsonb, 99999);

-- nickname 은 lore-bible v2 § 2~7 표제 호칭을 그대로 차용 (game-designer P1 권장).
```

---

## 4. 시즌 마감 알고리즘

```
시즌 종료 시각 도달 (cron job 또는 Supabase Edge Function)
  ↓
1) 각 원소별 1위 결정 (throne_fire ~ throne_dark)
   - SELECT user_id, deck_snapshots.deck_data->'fireMain' AS card, league_points
     FROM deck_snapshots
     WHERE deck_data 의 어느 카드든 element='fire' 인 사람
     ORDER BY league_points DESC LIMIT 1;
   - "어느 카드든" 의 정의: 덱에 해당 원소 카드가 1장 이상 + 그 카드들 중 가장 LP 기여한 카드 = "주력 카드" 선정
   - 동률 시: deck_snapshots.updated_at 빠른 쪽
  ↓
2) 종합 1위 (throne_apex)
   - SELECT user_id, favorite_card_id, league_points
     FROM deck_snapshots
     WHERE favorite_card_seasons >= 3   -- § 9.0 정점 후보 자격
     ORDER BY league_points DESC LIMIT 1;
  ↓
3) throne_holders 행 결정 (game-designer P1 — 1위 부재 분기)
   - 유효 1위 = 자격 충족 + LP > 0 + 합류 시즌 아님 (§ 9.0)
   - **유효 1위 있음** → INSERT (season_id=N, throne_id, user_id, ...)
   - **유효 1위 없음** → 직전 시즌 holder 행을 그대로 카피 + season_id 만 N 으로 갱신 + nickname 옆에 "(이어받음)" 표기
   - **시즌 1 + 유효 1위 없음** → 시즌 0 NPC 점유자 카피 (제1세대 신화 시즌 그대로 이어짐)
  ↓
4) user_titles 행 7건 자동 생성 (위 3) 의 user_id 가 시스템 NPC 면 skip)
   - title_text = '{class}의 신 ({throne_name}, 시즌 {N})'
   - 각 점유자에게 알림 (in-game notification + 채팅 시스템 메시지)
  ↓
5) 다음 시즌(N+1) 시작
```

**MVP 단순화**: 시즌 마감 알고리즘이 복잡하면 출시 직전엔 **운영자 수동 처리** (Supabase SQL 콘솔에서 1쿼리 실행). 자동화는 시즌 2 이후.

---

## 5. UI 와이어프레임

### 5.1 신전 메인 화면 (game-designer P2 — 3+3+중앙정점 대칭 레이아웃)

```
┌─────────────────────────────────────────────┐
│  🔮 신전 — 역대 점유자 회랑                  │
│                                              │
│  ┌─────┐    ┌─────────┐    ┌─────┐          │
│  │ 🔥  │    │   👑    │    │ ⚡  │          │
│  │재의 │    │ 정점의  │    │천둥의│          │
│  │신좌 │    │  신좌   │    │신좌 │          │
│  └─────┘    │ (일곱   │    └─────┘          │
│              │ 번째)   │                       │
│  ┌─────┐    └─────────┘    ┌─────┐          │
│  │ ✨  │                    │ 🌊  │          │
│  │약속의│                    │심연의│          │
│  │신좌 │                    │신좌 │          │
│  └─────┘                    └─────┘          │
│                                              │
│  ┌─────┐                    ┌─────┐          │
│  │ ⛰️  │                    │ 🌑  │          │
│  │외눈의│                    │거래의│          │
│  │신좌 │                    │신좌 │          │
│  └─────┘                    └─────┘          │
│                                              │
│  [내 호칭 보기]   [현재 시즌 순위]           │
└─────────────────────────────────────────────┘
```

**원리**: 6원소를 좌우 3+3 으로 나누고 정점(7번째 신좌)을 중앙에 단독 배치. 4+2+1 레이아웃의 비대칭을 피하면서 "정점 = 일곱 번째 자리" 의 위계를 시각화. 원소 배치는 상성(불↔물 / 땅↔전기 / 신성↔암흑) 대각선 대립으로 lore 결합.

**대안**: 원형 회랑 (6원소 등간격 + 중앙 정점) — 신화 모티프 강화. 구현 비용 더 큼.

### 5.2 신좌 1개 상세 (예: 재의 신좌)

```
┌─────────────────────────────────────────────┐
│  🔥 재의 신좌                                │
│  "폭력·재·변형의 열기"                       │
│                                              │
│  현재 점유자 (시즌 5)                        │
│  ┌─────────┐                                 │
│  │ [카드]  │  쌍검사의 신                    │
│  │ 일러스트│  소유: @대표님                  │
│  │ 풀사이즈│  [닉네임 클릭 → 채팅 DM]        │
│  └─────────┘                                 │
│                                              │
│  역대 점유자                                 │
│  ─────────────────────────                  │
│  시즌 4 — 그리핀의 신 (@user_42)            │
│  시즌 3 — 화염정령의 신 (@firekeeper)       │
│  시즌 2 — 드래곤의 신 (@drake_king)          │
│  시즌 1 — 그라힘의 신 (@aestrider)          │
│  시즌 0 — 그라힘 (제1세대 / NPC)             │
└─────────────────────────────────────────────┘
```

### 5.3 채팅 닉네임 호칭 표시 (game-designer P1 개정)

**인라인 = 아이콘 + 단축 1단어** (모바일 메시지 행 폭 초과 방지). 풀 호칭은 hover/tap 툴팁 + 신전·프로필.

```
┌──────────────────────────────────┐
│ [👑쌍검] @대표님 (Lv 87)         │  ← 인라인은 1단어만 ("쌍검사의 신" → "쌍검")
│   안녕하세요!                     │
└──────────────────────────────────┘
```

호칭 배지 hover/tap → 툴팁:
```
쌍검사의 신
재의 신좌 · 시즌 5 점유자
```

**아이콘 규칙**:
- 신좌 점유자: 👑 (왕관)
- 정점의 신: ✨ (반짝)
- 미보유: 배지 자체 미노출

**단축 워딩 자동화**:
- "쌍검사의 신" → "쌍검"
- "정점의 신" → "정점"
- 파서: `title_text.replace(/의 신.*/, '')`

### 5.4 카드 V4 — 시그니처 표기 (정체성 ①, game-designer P1 단일안 확정)

**위치**: **카드 이름 라벨 좌측 prefix 인라인** (단일안 — 좌상단 옵션 폐기).
**근거**: 좌상단은 `css/32_card_v4.css` `.shield-badge { top:38px; left:8px }` 와 충돌. 이름 영역(`.name-box`) 은 06-card-ui-principles.md "이름 위 정중앙은 항상 주목 영역" 과 부합.

```
┌─────────────────────────────────┐
│ ★ 쌍검사 그리핀          [♥45]  │  ← ★ = favorite, 이름 라벨 안에 prefix
│ ...                              │
```

CSS:
```css
.card-v4 .name-box.is-favorite::before {
  content: '★';
  color: #ffd166;
  margin-right: 4px;
  text-shadow: 0 0 4px #f39c12;
}
```

---

## 6. 클라이언트 구현 — 새 파일 / 수정 파일

| 영역 | 파일 | 변경 |
|---|---|---|
| 데이터 | `js/14_data_thrones.js` (신규) | 7 신좌 메타 (id, 원소, 이름, 아키타입, 아이콘, lore 발췌) |
| 게임 상태 | `js/50_game_core.js` | `titles[]`, `activeTitle`, `favoriteCardId` 필드 + 마이그레이션 |
| 백엔드 | `js/35_backend.js` | `loadTitles()` `loadHolders(throneId)` `loadHoldersBySeason(N)` `setActiveTitle()` |
| 신전 화면 | `js/56_game_temple.js` (신규) | `showTemple()` 본 화면 + 신좌 7방 + 회랑 |
| 채팅 통합 | `js/36_chat.js` | 메시지 렌더 시 `user.activeTitle` 호칭 배지 prepend |
| 카드 V4 | `js/40_cards.js` + `css/32_card_v4.css` | favorite 카드에 ★ 표기 |
| 도시 액션 | `js/51_game_town.js` / `js/54_game_castle.js` | `showTemple` 의 placeholder modal → 실제 화면 호출 |
| Supabase | `supabase/migrations/005_s6_thrones.sql` (신규) | seasons + throne_holders + user_titles |
| 시드 | `supabase/migrations/006_s6_seed_gen0.sql` (신규) | 시즌 0 + 제1세대 7 점유자 NPC 시드 |

**예상 LoC**: ~800 줄 신규 + ~150 줄 수정. 단일 phase 로 가능.

---

## 7. MVP 단계 분할 (출시 우선순위)

### STEP 1 — 보기만 (1~2일)

**진입 조건** (game-designer P1 — 비주얼 사전 점검):
- [ ] `design/ART_ASSETS.md` 7장 NPC 점유자 카드 매핑 확인
- [ ] 누락분은 `PROMPT_RECIPES.md` 에 등재 + 발주 리스트 생성
- [ ] 신전 회랑 배경 1장 발주 여부 결정 (사용자 9.X 결정 항목)

**작업**:
- 신전 화면 + 7 신좌 방 UI
- 시즌 0 시드 데이터로 제1세대 점유자 7명 표시
- 채팅 호칭 배지 (제1세대 NPC 만, 플레이어 호칭은 0개)
- **체감**: "신전에 들어가면 제1세대 신화가 살아있다"

### STEP 2 — 호칭 부여 (3~5일)
- 시즌 1 운영자 수동 종료 + throne_holders insert 수동 실행
- user_titles 자동 생성 trigger
- 채팅 호칭 배지 + 카드 V4 ★ favorite 표기
- 신전 회랑에 "시즌 1 점유자" 등재
- **체감**: "내가 시즌 1 점유자가 됐다 → 채팅에 자랑 → 신전에 영구 등재"

### STEP 3 — 자동화 (시즌 2~)
- 시즌 마감 cron job (Supabase Edge Function)
- 점유자 알림 (in-game + 채팅 시스템 메시지)
- 호칭 selector UI (여러 호칭 중 활성 호칭 선택)

---

## 8. B안과의 결합 (시즌 캡)

A안은 B안의 **시즌 시스템**을 전제로 한다. 그래서 둘은 **같은 phase 에 묶어서** 진행하는 게 깔끔.

- B안: 시즌 정의 + Lv 캡 풀기 (20→40→60→80→100) → A안의 `seasons` 테이블 + level_cap 컬럼이 그대로 토대.
- A안: 시즌 마감 시 점유자 등극 → B안의 시즌 종료 trigger 와 같은 cron 에서 처리.

**권장**: A+B 동시 phase. `design/season_cap_plan.md` 와 본 문서를 한 묶음으로 검토.

---

## 9. 위험 / 미결 / 사용자 결정 필요

### 9.0 신규 진입자 정점 도전 자격 (game-designer P1 반영)

5시즌 합류 1주일 만렙자가 "정점의 신" 호칭 가져가면 5시즌 정성 들인 베테랑 정서 붕괴. 3중 게이트:

1. **합류 시즌 = 신좌·정점 호칭 후보 자격 없음**. 다음 시즌부터 자격. lore 워딩: "여신은 그대를 아직 알지 못한다."
2. **정점 후보 자격** = `favorite 카드의 시즌 카운트 ≥ 3` (해당 favorite 카드를 3시즌 이상 키워온 플레이어만). 데이터: `user_titles` 또는 `user_favorites` 테이블에 `season_count` 컬럼.
3. **Lv 91~100 시간 게이트**: 단련 외에 누적 플레이 시간 200시간 또는 다음 시즌 진입 후만 도달. cap 도달했어도 "최후의 10레벨"은 시간 화폐로만.

**효과**: 자랑 정서가 "오래 같이 한 카드"에 묶여 정체성 ④ 가 단순 LP 1위가 아닌 "헌신 + 실력" 으로 변모.

### 9.1 "주력 카드" 정의 모호성
- 신좌 = "원소별 1위" 인데, 한 덱에 같은 원소 카드가 여러 장이면 어느 카드가 "그 신좌의 점유자" 가 되는가?
- **옵션 A** (단순): 덱 내 그 원소 카드 중 **Lv 가 가장 높은 1장**
- **옵션 B** (명시적): 플레이어가 favorite 으로 지정한 카드 1장
- **옵션 C** (혼합): 옵션 B 가 있으면 B, 없으면 A
- **권장**: **C 혼합** — 정체성 ① 의 favorite 시그니처 표기와 자연스럽게 결합

### 9.2 첫 시즌 점유자 공백 처리
- 시즌 1 시작 시점에 이미 LP 가 쌓여있는가? 아니면 시즌 1 = 게임 출시 시점부터?
- **권장**: **시즌 1 = 출시 시점부터**. 시즌 0 (제1세대 NPC) 는 출시 전까지 + 영구 historical 데이터.

### 9.3 호칭 누적 vs 1개만
- 한 플레이어가 여러 시즌에 걸쳐 여러 호칭을 따면 "쌍검사의 신·궁수의 신·정점의 신" 이 모두 표시되는가?
- **권장**: **1개만 active 로 채팅 표시** (selector UI). 프로필·신전엔 전체 표시.

### 9.4 카드 등급 vs 신좌 점유자
- 신좌 점유자 = 그 카드 = 자동으로 신(divine) 등급으로 승격되는가?
- **권장**: **별개로 둠**. 신좌 점유는 호칭(소유자에게)이고 카드 등급은 데이터(카드 자체). 점유자 카드는 등급은 그대로지만 "✨ 시즌 5 점유자" 라는 별도 영구 마크가 붙음.
- **시각 위화감 주의 (game-designer P2)**: bronze 등급 카드가 신좌를 점유하면 "신" 임에도 카드 테두리가 실버색이라 신전 회랑에서 위화감. **점유자 카드 표시 시 신전 한정으로 외곽에 신좌 원소색 글로우** 추가 (등급 테두리 위에 `box-shadow: 0 0 18px var(--throne-color-X)` 오버레이).

### 9.5 NPC 점유자 초상화
- 시즌 0 의 제1세대 7 점유자 카드 일러스트는 이미 있는가?
- **확인 필요**: `js/11_data_units.js` 의 grahim/moras/eidra/brontes/seraphiel/necrion 카드 + 여신 카드. 없으면 lore-bible v2 의 형상 묘사 기반 프롬프트 레시피 작성.

---

## 10. 사용자에게 물어볼 결정 항목

1. **9.1** 주력 카드 정의: A / B / **C 권장** 중?
2. **9.3** 호칭 표시: 1개만 active / 전체 표시 / **selector 권장**?
3. **STEP 1 단독** 으로 시작 (보기만, 시즌 0 NPC) vs **STEP 1+2 묶음** 으로 가서 호칭 부여까지 한 번에?
4. **B안 시즌 캡과 동시 phase** 로 묶을지, A안만 먼저 갈지?
5. 신좌 이름 (재의 신좌·심연의 신좌·...) 워딩 OK? 더 멋진 변형 후보 받을지?
6. **호칭 {직업} 표시 명세**: 현재 카드 `type` 필드(전사/사수/마법사/야수) 그대로 vs `subType`/`archetype` 신규 필드 추가? (예: "쌍검사의 신" 같은 구체 호칭을 원한다면 신규 필드 필요)

---

## 11. 영향 / 의존 그래프 (구현 시 cluster 단위)

```
Cluster A — 데이터 모델
  supabase/migrations/005_s6_thrones.sql
  supabase/migrations/006_s6_seed_gen0.sql
  js/14_data_thrones.js (신규)

Cluster B — 백엔드 래퍼
  js/35_backend.js (loadHolders / loadTitles / setActiveTitle)

Cluster C — UI
  js/56_game_temple.js (신규)
  css/41_temple.css (신규, 또는 42_screens.css 확장)
  index.html (#temple-screen DOM 추가)

Cluster D — 통합
  js/36_chat.js (호칭 배지)
  js/40_cards.js + css/32_card_v4.css (★ favorite 표기)
  js/50_game_core.js (titles/activeTitle/favoriteCardId 마이그레이션)

Cluster E — 도시 액션 연결
  js/51_game_town.js (showTemple action → 실제 화면)
  js/54_game_castle.js (placeholder modal 제거)
```

각 cluster 단일 Edit 권장 (08-garbage-lessons.md "의존 그래프 cluster" 원칙).

---

## 12. 검증 체크리스트 (구현 후)

- [ ] 신전 화면이 도시 → 신전 클릭으로 정상 진입
- [ ] 7 신좌 방이 모두 노출 + 시즌 0 NPC 점유자 7명 표시
- [ ] 채팅에서 NPC 메시지(시스템 botᅠ) 옆에 호칭 배지 노출
- [ ] favorite 카드에 ★ 표기, 카드 V4 6 사이즈 모두 검증 (rof-ui-inspector)
- [ ] 시즌 마감 SQL 수동 실행 → user_titles 자동 생성 확인
- [ ] 회귀 12/12 PASS 유지
- [ ] balance-auditor: 호칭이 카드 스탯에 영향 0 (코스메틱만) 검증
- [ ] lore-consistency-auditor: 신좌 이름·아키타입이 lore-bible v2 와 일치

---

## 변경 이력

### v1 — 2026-05-03 (자율 세션)

- 최초 작성. 사용자 4안 중 A안 설계 초안. 코드 변경 0.
- B안 (시즌 캡) 와 동시 phase 권장 명시.
- 9.1~9.5 결정 항목 사용자 검토 대기.
