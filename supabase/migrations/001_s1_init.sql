-- ============================================================
-- Realm of Fates — S1: Auth + Cloud Save
-- 2026-04-16
-- ============================================================

-- profiles: Supabase Auth 의 auth.users 와 1:1
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text not null unique check (char_length(nickname) between 2 and 12),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- 세이브 데이터 (S1: JSONB 한 덩어리, 추후 정규화)
  save_data   jsonb not null default '{}'::jsonb,

  -- 통계 캐시 (조회 성능용, save_data 와 중복 OK)
  total_wins     int not null default 0,
  total_games    int not null default 0,
  league_points  int not null default 0,
  best_round     int not null default 0
);

-- RLS: 본인만 읽기/쓰기
alter table public.profiles enable row level security;

create policy "profiles_select_self" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

-- updated_at 자동 갱신
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 신규 유저 가입 시 profiles 자동 생성 트리거
-- (Auth signup 직후 profiles row 가 없으면 클라 코드에서 별도 insert 필요 → 이 트리거로 자동화)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', 'hero_' || left(new.id::text, 6)));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
