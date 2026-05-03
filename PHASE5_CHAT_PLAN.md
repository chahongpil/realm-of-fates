# PHASE 5 — 채팅 시스템 기획서

> 2026-04-22 초안 · MVP 범위: 텍스트 + 카드 공유 · 3채널 (world/리그/길드) · 24h 롤링 · 발언 제한

---

## 🎯 목표

온라인 생태계 소통 레이어 도입. 고립되어 있던 싱글 플레이어 흐름에 **같은 리그/세계관 유저와의 대화** 를 추가해서 리그전·카드 획득 자랑·정보 공유·길드 결속을 유도.

StS2/Balatro 처럼 싱글만 강한 카드게임은 이 레이어가 없어서 커뮤니티가 외부(디스코드) 로 유출된다. Hearthstone Duels / LoR / Marvel Snap 은 내부 채팅이 약해서 문제. 우리는 **카드 공유 + 리그 채널** 로 차별화.

---

## 📋 MVP 스펙 (대표님 결정 반영)

| # | 항목 | 결정 |
|---|---|---|
| 1 | 범위 | **텍스트 + 카드 공유** (이모지 X, 음성 X) |
| 2 | 길드 채널 | **포함** (길드 시스템 덜 되어있어도 채널 미리 파서 운영) |
| 3 | 발언 제한 | **O** (세부 규칙 아래 §4) |
| 4 | 로그 보관 | **24h 롤링** (cron 으로 삭제) |

---

## 🏛️ 세계관 네이밍 (판타지 몰입)

| 채널 | 기술 ID | UI 표시 | 대상 |
|---|---|---|---|
| world | `ch_world` | **운명의 광장** | 전 서버 |
| league | `ch_league_{리그}` | **{리그명} 모임** | 같은 리그끼리 (브론즈/실버/골드/플래티넘/다이아/마스터/신의영역) |
| guild | `ch_guild_{길드id}` | **{길드명} 전당** | 길드원 전용 |

- 탭 라벨은 아이콘 + 이름 조합: `🌍 광장 / 🏛️ {리그} / 🛡️ 전당`
- 채널 설명 (첫 입장 시 헤더):
  - 광장: *"운명의 실타래로 얽힌 모든 영웅이 모이는 대광장."*
  - 리그: *"같은 경지의 동료들과 담소하는 자리."*
  - 길드: *"우리 길드의 비밀스러운 전당."*

---

## ✏️ 발언 제한 규칙 (초안 — 대표님 검토 필요)

### 레벨 제한
- **Lv5 이하**: `ch_world` 쓰기 금지 (읽기는 가능). 리그·길드 채널은 쓰기 가능.
- **이유**: 스팸 봇 / 신규 계정 도배 방지. 리그·길드는 소속 기반이라 신고 쉬움.

### 속도 제한
- **쿨다운 5초** (마지막 전송 후 5초 동안 전송 불가)
- **1분에 10개 초과 시 30분 뮤트** (플러드 방지)

### 길이/포맷
- **메시지 200자 이하** (한글 200자 기준, UTF-8 600바이트 캡)
- **URL 차단** — `http://`, `https://`, `www.` 패턴 필터 (피싱 방지)
- **@멘션** 지원: `@유저명` → 해당 유저에게 알림 배지 (MVP 는 표시만, 알림은 P2)

### 금칙어 / 도배 필터
- 욕설·개인정보(전화번호·주민번호 패턴)·광고성 키워드 필터 리스트
- 대소문자·띄어쓰기·특수문자 우회 정규식 차단
- 필터링된 메시지는 `***` 로 마스킹 + 유저에게 "부적절한 표현" 토스트

### 신고 & 모더레이션
- 메시지 우측 클릭 or 길게 누르기 → `🚨 신고` 버튼
- `chat_reports` 테이블에 쌓임 → 관리자 대시보드에서 검토 (MVP 는 수동 검토)
- 동일 유저 3회 이상 신고 누적 시 자동 24h 뮤트

---

## 💎 카드 공유 스펙

### 기능
- 입력창 좌측에 `+` 버튼 → 내 덱에서 카드 1장 선택 → 메시지에 첨부
- 전송 시 메시지 row 에 `attached_card` JSON 필드 포함:
  ```json
  {
    "id": "militia",
    "rarity": "bronze",
    "lv": 3,
    "element": "earth"
  }
  ```
- 수신 측: 메시지 풍선 하단에 **미니 카드(120×170)** 렌더 — 클릭 시 풀사이즈 팝업
- 미니 카드는 `CardV4Component.create(cardData, {kind:'spell'})` 의 compact 모드 응용 (유닛용 별도 kind 추가: `kind:'share'`)

### 제약
- 한 메시지에 카드 1장만 (나중에 덱 전체 공유로 확장 가능)
- 내가 소유한 카드만 공유 가능 (덱에 없는 id 는 첨부 불가)
- 영웅은 공유 가능 (보유 카드 자랑용)

---

## 🗄️ 기술 스펙 — Supabase Realtime

### 테이블 스키마
```sql
-- chat_messages (24h 롤링)
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL,           -- 'ch_world' | 'ch_league_gold' | 'ch_guild_abc'
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_level INT NOT NULL,
  user_league TEXT NOT NULL,
  user_guild_id UUID,
  text TEXT NOT NULL CHECK (char_length(text) <= 200),
  attached_card JSONB,             -- 카드 공유 시 데이터, 없으면 NULL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_channel_time ON chat_messages(channel, created_at DESC);

-- chat_mutes (뮤트된 유저)
CREATE TABLE chat_mutes (
  user_id UUID PRIMARY KEY,
  muted_until TIMESTAMPTZ NOT NULL,
  reason TEXT
);

-- chat_reports (신고)
CREATE TABLE chat_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 24h 롤링 (pg_cron)
```sql
SELECT cron.schedule(
  'chat_cleanup',
  '0 * * * *',  -- 매 시간 정각
  $$ DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '24 hours'; $$
);
```

### Realtime 구독
```js
// js/36_chat.js (신규)
const channel = supabase
  .channel('chat:' + activeChannelId)
  .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `channel=eq.${activeChannelId}` },
      (payload) => appendMessage(payload.new))
  .subscribe();
```

### RLS 정책
- SELECT: 본인 리그/길드 범위 내에서만
- INSERT: 인증된 유저 + 뮤트 해제 상태만
- DELETE: admin 만 (유저는 자기 메시지도 지울 수 없음 — 24h 롤링으로 어차피 사라짐)

---

## 🎨 UI 설계

### 레이아웃
```
┌─ 게임 화면 ──────────────────────────────┬─ 채팅 패널 (토글) ─────┐
│                                          │ 🌍 광장 | 🏛 골드 | 🛡 전당 │  ← 탭 280~320px
│                                          │                              │
│    (기존 게임 뷰)                         │ 유저A: 하이~              │
│                                          │ 유저B: [카드] 방금 득!    │
│                                          │ ...                          │
│                                          │                              │
│                                          ├─────────────────────────────┤
│                                          │ [+카드] [메시지 입력      ] │
└──────────────────────────────────────────┴─────────────────────────────┘

토글 닫힘 시 우측 하단 🗨️ 버튼 (50×50) 에 "읽지 않은 N" 배지
```

### 상태별 동작
- **마을/deckview/codex**: 토글 버튼 표시, 열면 게임 뷰 우측 일부 가려짐 (320px)
- **전투 화면 (battle)**: 토글 버튼 자동 숨김 (시야 집중). 메시지는 쌓이되 읽지 않은 배지만 업데이트
- **타이틀/로그인 전**: 채팅 X (인증 필요)

### CSS (신규 `css/36_chat.css`)
- 변수: `--chat-panel-w: 320px; --chat-bg: rgba(18,12,6,.96); --chat-border: #6e4a2a;`
- 애니: slide-in 200ms ease-out
- 프레임·색은 **기존 양피지 톤 재사용** (parchment/ink 토큰) — 새 프레임 만들지 않음
- 카드 공유 미니카드는 `.card-v4.kind-share` 클래스로 기존 V4 확장

### 폰트·크기
- 메시지 본문: 14px Noto Sans KR (가독성 우선)
- 유저명: 13px Cinzel + 리그 색
- 시간: 11px 회색 우측
- 모바일 대응: 토글 패널이 full-screen (모바일은 게임뷰와 탭 전환)

---

## 🪜 작업 단계 (단계별 검증 커밋)

### Step 1 — 스키마 + 인증 연동 (1시간)
- Supabase 테이블 3종 생성 + RLS + pg_cron
- `js/36_chat.js` 빈 모듈 + `initChat()` (supabase client 연결만)

### Step 2 — world 채널 단일 (2시간)
- HTML: `<aside id="chat-panel" class="screen-overlay">` 추가
- CSS: `css/36_chat.css` 기본 레이아웃
- JS: 메시지 목록 렌더 + 입력 + realtime subscribe
- 발언 제한 기초 (길이 200자, 쿨다운 5초)

### Step 3 — 3채널 탭 (1시간)
- 채널 전환 로직 + 각 채널별 subscription 교체
- 리그는 유저의 `user_league` 에서 자동 바인딩
- 길드는 `user_guild_id` null 이면 "길드 없음" placeholder

### Step 4 — 카드 공유 ❌ 폐기 (2026-05-02)
- ~~`+` 버튼 → 덱 picker 모달 → 선택 → attached_card JSON 첨부~~
- ~~메시지에 `.card-v4.kind-share` 미니카드 렌더~~
- ~~클릭 시 풀사이즈 상세 팝업~~

**폐기 이유 (2026-05-02)**: 미니카드 첨부 UX 가 채팅 흐름을 끊고 + 데이터 동봉 무거움.
**대체안**: 채팅 텍스트 내 카드 이름 인식 → 파란 링크 → 클릭 시 default 카드 모달 팝업 (`@불꽃의전사` 디스코드 패턴). 별도 phase 로 이동 (Step 4 v2).
**제거된 코드**: `.card-v4.kind-share` CSS / 40_cards.js share 분기 / 36_chat.js picker+attached_card 시스템 (5 함수). `_showCardDetailModal` 만 향후 링크 시스템용으로 보존.

### Step 5 — 발언 제한 세부 (1시간)
- 레벨 5 이하 world 차단
- 1분 10개 플러드 → 30분 뮤트
- 금칙어 필터 (기본 리스트 50개)
- URL 차단

### Step 6 — 신고 + 모더레이션 (1시간)
- 메시지 우클릭 신고 버튼
- `chat_reports` INSERT
- 자동 뮤트 트리거 (신고 3회 누적)

### Step 7 — 전투 중 숨김 + UX 폴리싱 (1시간)
- screen change 이벤트로 토글 자동 숨김
- 읽지 않은 배지 카운터
- 모바일 full-screen 전환

**총 예상: 9시간** — 하루 끝내기 어렵고, 2~3 세션 분할 권장.

---

## 🧪 테스트 계획

- `tools/chat_sim.html` — 가짜 메시지 생성기 (봇 2명이 서로 대화) → 레이아웃 / realtime 확인
- Playwright E2E: 로그인 → 메시지 전송 → 다른 브라우저에서 수신 → 카드 공유 → 상세 팝업
- 발언 제한 단위 테스트 (tools/test_chat_limits.js): 레벨 5 이하 차단, 5초 쿨다운, 200자 캡, URL 차단, 금칙어 마스킹

---

## 🚨 리스크 / 결정 확정 (2026-04-22)

### 대표님 확정 사항
1. ✅ **발언 제한 세부**: §4 6개 규칙 그대로 (Lv5 / 5초 쿨다운 / 1분 10개 플러드 뮤트 / 200자 / URL 차단 / 신고 3회 자동 뮤트)
2. ✅ **길드 채널 처리**: **B안 — placeholder** ("아직 길드가 없어요. 광장에서 대화하세요"). 길드 시스템 완성 후 정식 연동.
3. ✅ **카드 공유 상세**: **모든 정보 전부 표시** — 5스탯(ATK/DEF/SPD/CRIT/EVA) + 장비 3슬롯 + 스킬 + 레벨 + 경험치 + 성장치(growthPts) + 행운/회피. 수신 측에서 `CardV4Component` 풀사이즈 모드(`kind:'share-full'`) 렌더.
4. ✅ **realtime 실패 모드**: **자동 재연결 + 폴링 폴백** (내 추천 확정)
   - 연결 끊김 감지 → 우측상단 "🔌 재연결 중…" 토스트
   - Exponential backoff: 1s → 2s → 4s → 8s → 16s (최대 5회)
   - 재연결 성공 시 마지막 수신 메시지 시각 이후 한 번에 fetch (gap 복구)
   - 5회 실패 후 "⚠ 오프라인" 뱃지 + [새로고침] 버튼, 자동 시도 중단 (배터리 보호)

### 기술 리스크
- **Supabase 무료 플랜 Realtime 동시 접속 제한** (약 200) — 출시 초기엔 괜찮지만 성장 시 유료 플랜 필요
- **서버 지연 지역별 편차** — 한국 유저 기준 ping 100ms 이하 권장 (Supabase AWS Seoul region 검증 필요)
- **금칙어 우회** — 신고 누적 기반 자동 뮤트로 보완하지만 초기엔 수동 검토 필요할 수 있음

### MVP 이후 (P2)
- 이모지 / 이모티콘 세트 (판타지 스타일)
- 음성 채팅 (Supabase + Daily.co 연동)
- 채팅 기반 랜덤 매칭 ("지금 싸울 사람?")
- 길드 간 전용 외교 채널
- 개인 쪽지 (DM)

---

## 📂 연관 파일 (신규 / 수정)

**신규**:
- `js/36_chat.js` — 채팅 클라이언트
- `css/36_chat.css` — 채팅 UI
- `supabase/migrations/2026_04_23_chat.sql` — 스키마
- `tools/chat_sim.html` — 로컬 시뮬레이터

**수정**:
- `index.html` — `<aside id="chat-panel">` + 토글 버튼 HTML
- `js/35_backend.js` — Supabase client export (이미 있으면 재사용)
- `js/40_cards.js` — `CardV4Component` 에 `opts.kind='share'` 추가
- `design/current-focus.md` — 작업 추적
- `design/changelog.md` — 커밋 기록

**의존**:
- 기존 Supabase 인증 (`Auth.user`, `Auth.userId`)
- 기존 리그 시스템 (`getLeague()`)
- 기존 카드 컴포넌트 (`CardV4Component`)
