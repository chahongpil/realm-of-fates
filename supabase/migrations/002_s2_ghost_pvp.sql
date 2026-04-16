-- ============================================================
-- Realm of Fates — S2: Ghost PvP (비동기 대전)
-- 2026-04-16
-- ============================================================

-- deck_snapshots: 전투 승리 시 현재 덱 스냅샷 자동 저장
-- 유저당 1행만 유지 (최신 승리 덱 = 방어 덱)
create table public.deck_snapshots (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  nickname      text not null,
  league_points int not null default 0,
  total_wins    int not null default 0,

  -- 덱 데이터 (유닛 + 스킬 + 유물 + 편성 위치)
  deck_data     jsonb not null default '[]'::jsonb,
  skills_data   jsonb not null default '[]'::jsonb,
  relics_data   jsonb not null default '[]'::jsonb,
  hero_data     jsonb not null default '{}'::jsonb,

  updated_at    timestamptz not null default now(),

  -- 유저당 1행만 (upsert 용)
  constraint deck_snapshots_user_unique unique (user_id)
);

-- 인덱스: 리그 포인트 기반 매칭
create index idx_snapshots_lp on public.deck_snapshots (league_points);

-- RLS: 본인만 쓰기, 모든 로그인 유저가 읽기 (매칭용)
alter table public.deck_snapshots enable row level security;

create policy "snapshots_select_any" on public.deck_snapshots
  for select using (auth.role() = 'authenticated');

create policy "snapshots_upsert_self" on public.deck_snapshots
  for insert with check (auth.uid() = user_id);

create policy "snapshots_update_self" on public.deck_snapshots
  for update using (auth.uid() = user_id);

-- pvp_matches: 대전 기록
create table public.pvp_matches (
  id              uuid primary key default gen_random_uuid(),
  attacker_id     uuid not null references auth.users(id) on delete cascade,
  defender_id     uuid not null references auth.users(id) on delete cascade,
  attacker_lp     int not null default 0,
  defender_lp     int not null default 0,
  result          text not null check (result in ('victory','defeat')),
  lp_change       int not null default 0,
  gold_reward     int not null default 0,
  rounds_played   int not null default 1,
  created_at      timestamptz not null default now()
);

-- 인덱스: 내 전적 조회
create index idx_matches_attacker on public.pvp_matches (attacker_id, created_at desc);
create index idx_matches_defender on public.pvp_matches (defender_id, created_at desc);

-- RLS: 본인이 공격자 또는 수비자인 기록만 읽기
alter table public.pvp_matches enable row level security;

create policy "matches_select_own" on public.pvp_matches
  for select using (auth.uid() = attacker_id or auth.uid() = defender_id);

create policy "matches_insert_attacker" on public.pvp_matches
  for insert with check (auth.uid() = attacker_id);

-- updated_at 자동 갱신 (deck_snapshots)
create trigger snapshots_touch_updated_at
  before update on public.deck_snapshots
  for each row execute function public.touch_updated_at();
