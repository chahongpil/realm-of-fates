# S2 고스트 PvP — 마무리 결정 문서

> 2026-04-19 작성. S2 코드는 99% 구현 완료. 이 문서는 **남은 4건의 결정·시드 데이터·E2E 체크리스트**.

## 현재 상태 (구현 완료)
- ✅ SQL 마이그레이션: `supabase/migrations/002_s2_ghost_pvp.sql` — `deck_snapshots` + `pvp_matches` + RLS + LP 인덱스
- ✅ Backend API 4종: `uploadDeckSnapshot` / `findGhostOpponent`(±100 → ±200 → any 3단 폴백) / `recordPvpMatch` / `getPvpHistory`
- ✅ 클라이언트 `RoF.Arena` (`js/62_ghost_pvp.js` 315줄): 매칭 화면 동적 생성, v2/레거시 양쪽 연동, 결과 처리
- ✅ 보상: 승리 LP +20 / 골드 +15, 패배 LP −10 / 골드 +3
- ✅ 쿨다운 30초
- ✅ 승리 시 자동 스냅샷 업로드 (`58_game_battle_end.js:204`)
- ✅ 마을 콜로세움(training) 진입점 오버라이드

---

## 갭 #1: 봇 시드 데이터 (매칭 실패 방지)

### 문제
- `findGhostOpponent` 가 `deck_snapshots` 에서 본인 제외하고 매칭. **유저가 1명뿐이면 항상 실패**.
- 메시지: "상대를 찾을 수 없습니다. 다른 플레이어가 아직 덱을 등록하지 않았습니다."
- 유료 출시 초기 ~수십 명까진 매칭 0% 위험.

### 옵션
- **A안**: `deck_snapshots.user_id` FK 를 nullable 로 ALTER → 봇 5~10명 직접 INSERT (가장 단순)
- **B안**: 별도 `bot_snapshots` 테이블 신설 + `findGhostOpponent` 에서 UNION (스키마 분리, 안전)
- **C안**: Supabase 에 더미 `auth.users` 5명 등록 (서비스 키 필요, dev 전용)

### 추천: **A안 + 봇 user_id 가상 UUID 풀**
- FK 변경 없이 `user_id` 를 NULL 허용 → 봇만 NULL
- `findGhostOpponent` 에서 자기 자신 제외 조건은 `.neq('user_id', _user.id)` 인데 NULL 은 자동 제외 안 되므로 OR 조건 불필요(NULL ≠ uuid 는 항상 NULL → false → 통과)
- 봇 정체성은 `nickname` 으로 구분 (예: "유랑검사", "야수의 부름", "잿빛 마법사")

### 봇 시드 SQL (003_s2_bot_seed.sql 신규)
```sql
-- supabase/migrations/003_s2_bot_seed.sql
-- 봇 5명 시드. user_id NULL → auth.users FK 우회.

alter table public.deck_snapshots
  alter column user_id drop not null;

-- RLS 보강: NULL user_id 행은 select 만 허용 (어차피 본인 행 아님)
-- 기존 정책 그대로 유효 — auth.uid() = user_id 는 NULL 비교 false

insert into public.deck_snapshots
  (user_id, nickname, league_points, total_wins, deck_data, skills_data, relics_data, hero_data)
values
  (null, '유랑검사', 10, 3, '[
    {"id":"militia","name":"민병","element":"earth","rarity":"bronze","atk":3,"def":1,"hp":12,"spd":2,"nrg":5,"luck":1},
    {"id":"hunter","name":"사냥꾼","element":"earth","rarity":"bronze","atk":4,"def":1,"hp":10,"spd":3,"nrg":5,"luck":1},
    {"id":"guard","name":"수비병","element":"water","rarity":"bronze","atk":2,"def":3,"hp":15,"spd":1,"nrg":5,"luck":1}
  ]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  '{"id":"h_m_fire","name":"근접 전사","element":"fire","rarity":"bronze","atk":3,"def":2,"hp":50,"spd":2,"nrg":5,"luck":1,"isHero":true}'::jsonb),

  (null, '잿빛 마법사', 25, 5, '[
    {"id":"apprentice","name":"견습마법사","element":"fire","rarity":"bronze","atk":3,"def":1,"hp":10,"spd":2,"nrg":10,"luck":1},
    {"id":"herbalist","name":"약초사","element":"earth","rarity":"bronze","atk":1,"def":1,"hp":12,"spd":2,"nrg":12,"luck":2},
    {"id":"crossbow","name":"석궁병","element":"fire","rarity":"bronze","atk":4,"def":1,"hp":11,"spd":2,"nrg":5,"luck":2}
  ]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  '{"id":"h_s_holy","name":"지원 마법사","element":"holy","rarity":"bronze","atk":1,"def":1,"hp":25,"spd":1,"nrg":30,"luck":1,"isHero":true}'::jsonb),

  (null, '강철의 약속', 50, 8, '[
    {"id":"infantry","name":"보병","element":"earth","rarity":"bronze","atk":3,"def":4,"hp":20,"spd":1,"nrg":5,"luck":1},
    {"id":"knight","name":"기사","element":"holy","rarity":"silver","atk":5,"def":4,"hp":18,"spd":2,"nrg":5,"luck":2},
    {"id":"lancer","name":"창병","element":"lightning","rarity":"bronze","atk":4,"def":1,"hp":12,"spd":3,"nrg":5,"luck":1}
  ]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  '{"id":"h_m_holy","name":"근접 전사","element":"holy","rarity":"bronze","atk":2,"def":3,"hp":50,"spd":1,"nrg":5,"luck":1,"isHero":true}'::jsonb),

  (null, '독사의 미소', 75, 12, '[
    {"id":"assassin","name":"암살자","element":"dark","rarity":"silver","atk":7,"def":1,"hp":13,"spd":4,"nrg":5,"luck":3},
    {"id":"rogue","name":"도적","element":"dark","rarity":"bronze","atk":4,"def":1,"hp":10,"spd":3,"nrg":5,"luck":3},
    {"id":"thunderbird","name":"썬더버드","element":"lightning","rarity":"silver","atk":6,"def":1,"hp":15,"spd":4,"nrg":5,"luck":2}
  ]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  '{"id":"h_r_dark","name":"원거리 궁수","element":"dark","rarity":"bronze","atk":3,"def":1,"hp":30,"spd":2,"nrg":10,"luck":3,"isHero":true}'::jsonb),

  (null, '용맹의 깃발', 120, 18, '[
    {"id":"berserker","name":"광전사","element":"fire","rarity":"silver","atk":7,"def":1,"hp":15,"spd":3,"nrg":5,"luck":1},
    {"id":"pyromancer","name":"화염술사","element":"fire","rarity":"silver","atk":6,"def":1,"hp":13,"spd":2,"nrg":10,"luck":2},
    {"id":"priest","name":"사제","element":"holy","rarity":"silver","atk":2,"def":1,"hp":15,"spd":1,"nrg":15,"luck":2},
    {"id":"paladin","name":"성기사","element":"holy","rarity":"gold","atk":6,"def":5,"hp":20,"spd":2,"nrg":5,"luck":2}
  ]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  '{"id":"h_m_fire","name":"근접 전사","element":"fire","rarity":"bronze","atk":3,"def":2,"hp":50,"spd":2,"nrg":5,"luck":1,"isHero":true}'::jsonb);
```

LP 분포: 10 / 25 / 50 / 75 / 120 — 신규~중급 매칭 커버.

---

## 갭 #2: 패배 시 스냅샷 정책

### 문제
- 현재: 승리 시에만 `uploadDeckSnapshot` (`58_game_battle_end.js:204`).
- 효과: 한 번이라도 이긴 덱이 박제되어 "방어덱"이 됨. 그 후 졌다고 갱신 안 함.
- 결과: 약해진 덱(유닛 사망 후 미부활 등)도 강력했던 시절 그대로 매칭 풀에 남음.

### 옵션
- **A안 (현행 유지)**: 승리 시만. "최고의 순간 박제" 컨셉. 방어가 일관됨.
- **B안**: 패배 시도 업데이트. "현재 상태" 반영. 약해지면 매칭 부담도 감소.
- **C안**: 매 라운드 종료 시(승패 무관) 업데이트. 가장 정확. 부하↑.

### 추천: **A안 (현행 유지) — 단, 명문화**
- "방어덱은 최고 승리 시점의 스냅샷" 으로 룰 고정 → 메타 안정성
- 단, **연패 5회 이상 시 자동 스냅샷 삭제** 옵션 추가 검토 (PvP 매칭 풀 정화)
- 코드 추가 불필요. 다만 갱신 의도 명문화 필요.

---

## 갭 #3: "훈련 → 아레나" UX 검토

### 문제
- 현재: `RoF.Game.showTraining` 을 오버라이드해서 클라우드 연결 시 `Arena.enter` 로 분기 (`62_ghost_pvp.js:296-312`).
- 위험:
  - "훈련" 이라는 이름과 PvP 의 의미 불일치 → 유저 혼동
  - 클라우드 연결 안 한 유저는 그대로 훈련, 연결한 유저는 PvP → **같은 버튼이 다른 화면** (모드 분기형 UX 안티패턴)
  - 훈련 기능 자체가 사라지지 않고 폴백으로 살아있어 의도 불분명

### 옵션
- **A안 (현행 유지)**: 분기 그대로. 변경 없음.
- **B안**: 별도 "콜로세움(아레나)" 건물 신설. `BUILDINGS` 에 추가. 깔끔하지만 마을 UI 변경 필요.
- **C안**: 훈련 화면 안에 "아레나 도전" 버튼 추가. 분기 제거, 명시적 진입.

### 추천: **C안** — 가장 작은 변경 + 의도 명확
- `js/62_ghost_pvp.js:296-312` 의 `showTraining` 오버라이드 제거
- 훈련 화면 UI 에 "🏟️ 아레나 도전" 버튼 1개 추가 (조건부 disabled — 클라우드 연결 시만)
- 이 변경은 별도 작업으로 처리 (현재 P2 대기)

---

## 갭 #4: E2E 테스트 체크리스트

대표님 또는 검수관이 수동으로 진행:

- [ ] **시드 적용**: Supabase Studio SQL Editor 에서 `003_s2_bot_seed.sql` 실행 → `deck_snapshots` 5행 확인
- [ ] **클라우드 미연결 상태**: 콜로세움 클릭 → 기존 훈련 화면 (정상)
- [ ] **클라우드 연결 후**: 콜로세움 클릭 → 아레나 매칭 화면 (봇 1명 매칭)
- [ ] **승리 시나리오**: 봇과 전투 → 승리 → LP +20 / 골드 +15 확인 → `pvp_matches` 1행 추가 확인 → 본인 `deck_snapshots` 갱신 확인
- [ ] **패배 시나리오**: 의도적 약덱 → LP −10 / 골드 +3 확인 → `pvp_matches` defeat 행 추가 → 본인 스냅샷 **갱신 안 됨** 확인
- [ ] **쿨다운**: 30초 이내 재시도 → "⏱ N초 후" 메시지
- [ ] **매칭 폴백**: LP 200 인 봇 없으니 ±100 (100~300) 빔 → ±200 (0~400) 으로 확장 → 매칭 성공 확인
- [ ] **오프라인**: 클라우드 끊고 콜로세움 → 토스트 "☁️ 클라우드 연결 필요" 표시

---

## 예상 작업 순서
1. **봇 시드** — 003_s2_bot_seed.sql 작성·적용 (10분)
2. **패배 정책** — A안 유지 결정·문서화 (5분, 본 문서로 완료)
3. **UX 검토** — C안 채택 시 별도 작업 (30분, 본 세션 안 함)
4. **E2E 테스트** — 체크리스트 따라 수동 검증 (1h, 대표님 직접)
