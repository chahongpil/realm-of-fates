-- ============================================================
-- Realm of Fates — S3: 채팅 시스템 (PHASE 5)
-- 2026-04-22
-- MVP: 3채널(world/league/guild) + 카드공유 + 발언제한 + 24h 롤링
-- 기획서: game/PHASE5_CHAT_PLAN.md
-- ============================================================

-- ============================================================
-- 1. chat_messages — 채팅 본문 (24h 롤링)
-- ============================================================
create table public.chat_messages (
  id            uuid primary key default gen_random_uuid(),
  channel       text not null,
  -- ch_world                     : 전 서버
  -- ch_league_{bronze..divine}   : 리그별 (7종)
  -- ch_guild_{uuid}              : 길드 전용

  user_id       uuid not null references auth.users(id) on delete cascade,
  user_name     text not null,
  user_level    int  not null default 1,
  user_league   text not null default 'bronze',
  user_guild_id uuid,  -- nullable

  text          text not null check (char_length(text) between 1 and 200),
  attached_card jsonb,  -- 카드 공유 시 {id, uid, rarity, level, xp, atk, def, spd, luck, eva, hp, nrg, equips[], skill, ...}

  created_at    timestamptz not null default now()
);

-- 채널별 시간역순 조회 인덱스 (최근 50개 불러오기용)
create index idx_chat_channel_time on public.chat_messages (channel, created_at desc);

-- 유저별 최근 메시지 조회 (발언 제한 체크용 — 1분 10개 플러드)
create index idx_chat_user_time on public.chat_messages (user_id, created_at desc);

-- ============================================================
-- 2. chat_mutes — 뮤트된 유저 (자동/수동)
-- ============================================================
create table public.chat_mutes (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  muted_until timestamptz not null,
  reason      text,
  -- 'flood'       : 1분 10개 초과
  -- 'reports'     : 신고 3회 누적
  -- 'admin'       : 관리자 수동
  -- 'banned_word' : 금칙어 반복 (미구현, 확장용)

  created_at  timestamptz not null default now()
);

create index idx_chat_mutes_until on public.chat_mutes (muted_until);

-- ============================================================
-- 3. chat_reports — 신고 기록
-- ============================================================
create table public.chat_reports (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references public.chat_messages(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason      text,

  created_at  timestamptz not null default now(),

  -- 같은 메시지를 같은 유저가 중복 신고 방지
  constraint chat_reports_unique unique (message_id, reporter_id)
);

create index idx_chat_reports_message on public.chat_reports (message_id);

-- ============================================================
-- 4. Row Level Security (RLS)
-- ============================================================

alter table public.chat_messages enable row level security;
alter table public.chat_mutes    enable row level security;
alter table public.chat_reports  enable row level security;

-- 4-1. chat_messages SELECT
--   - ch_world: 모든 인증 유저
--   - ch_league_*: 본인 리그와 채널이 일치할 때만
--   - ch_guild_*: 본인 길드 uuid 와 채널 suffix 일치할 때만
create policy "chat_select_world" on public.chat_messages
  for select using (
    auth.uid() is not null and channel = 'ch_world'
  );

create policy "chat_select_league" on public.chat_messages
  for select using (
    auth.uid() is not null
    and channel like 'ch_league_%'
    and channel = 'ch_league_' || coalesce(
      (select save_data->>'league' from public.profiles where id = auth.uid()),
      'bronze'
    )
  );

create policy "chat_select_guild" on public.chat_messages
  for select using (
    auth.uid() is not null
    and channel like 'ch_guild_%'
    and channel = 'ch_guild_' || coalesce(
      (select save_data->>'guild_id' from public.profiles where id = auth.uid()),
      ''
    )
  );

-- 4-2. chat_messages INSERT (본인 행만, 뮤트 아닐 때만)
create policy "chat_insert_self_not_muted" on public.chat_messages
  for insert with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.chat_mutes
      where user_id = auth.uid() and muted_until > now()
    )
  );

-- 4-3. chat_messages DELETE/UPDATE 금지 (admin 만 SQL 로 직접 조작)

-- 4-4. chat_mutes — 본인 것만 SELECT (뮤트 상태 확인용). INSERT/UPDATE 는 service_role 만.
create policy "chat_mutes_select_self" on public.chat_mutes
  for select using (auth.uid() = user_id);

-- 4-5. chat_reports — 본인이 신고한 것만 SELECT. INSERT 는 인증된 유저 누구나.
create policy "chat_reports_select_self" on public.chat_reports
  for select using (auth.uid() = reporter_id);

create policy "chat_reports_insert_self" on public.chat_reports
  for insert with check (auth.uid() = reporter_id);

-- ============================================================
-- 5. Realtime 활성화 (Supabase Dashboard 설정 or SQL)
-- ============================================================

-- chat_messages INSERT 이벤트만 publish (채널 구독 시 새 메시지 수신)
alter publication supabase_realtime add table public.chat_messages;

-- chat_mutes 변경 이벤트도 publish (본인 뮤트 시 UI 즉시 반영)
alter publication supabase_realtime add table public.chat_mutes;

-- ============================================================
-- 6. 자동화 함수: 신고 3회 누적 시 자동 24h 뮤트
-- ============================================================
create or replace function public.auto_mute_on_reports()
returns trigger language plpgsql security definer as $$
declare
  target_user_id uuid;
  report_count int;
begin
  -- 신고된 메시지의 작성자 조회
  select user_id into target_user_id
  from public.chat_messages
  where id = new.message_id;

  if target_user_id is null then
    return new;
  end if;

  -- 최근 24시간 이내 이 유저에 대한 신고 수 (중복 신고자 제외, message_id distinct)
  select count(distinct cr.message_id) into report_count
  from public.chat_reports cr
  join public.chat_messages cm on cr.message_id = cm.id
  where cm.user_id = target_user_id
    and cr.created_at > now() - interval '24 hours';

  -- 3회 이상 누적 시 자동 24h 뮤트 (upsert — 기존 뮤트 연장)
  if report_count >= 3 then
    insert into public.chat_mutes (user_id, muted_until, reason)
    values (target_user_id, now() + interval '24 hours', 'reports')
    on conflict (user_id) do update
    set muted_until = greatest(chat_mutes.muted_until, now() + interval '24 hours'),
        reason = 'reports';
  end if;

  return new;
end $$;

create trigger chat_reports_auto_mute
  after insert on public.chat_reports
  for each row execute function public.auto_mute_on_reports();

-- ============================================================
-- 7. 24h 롤링 — pg_cron 으로 매시간 정각에 오래된 메시지 삭제
-- ============================================================

-- Supabase 에서 pg_cron extension 활성화 필요 (대시보드 또는 아래 SQL)
-- create extension if not exists pg_cron with schema extensions;

-- 매시간 정각 (0분) chat_messages 중 24h 이전 행 삭제
-- 주의: 대시보드에서 pg_cron 이 활성화되어 있어야 동작. 없으면 Edge Function 대안 사용.
-- select cron.schedule(
--   'chat_messages_cleanup',
--   '0 * * * *',
--   $$ delete from public.chat_messages where created_at < now() - interval '24 hours'; $$
-- );

-- 뮤트 만료된 row 도 같이 청소 (1일에 1번)
-- select cron.schedule(
--   'chat_mutes_cleanup',
--   '0 4 * * *',  -- 매일 04:00
--   $$ delete from public.chat_mutes where muted_until < now(); $$
-- );

-- ℹ️ pg_cron 활성화는 대표님이 Supabase 대시보드에서 확인·활성화 필요.
--    활성화 후 위 두 cron.schedule 주석 해제하고 이 migration 재적용
--    또는 별도 SQL 실행.

-- ============================================================
-- 8. 헬퍼 뷰: 현재 활성 뮤트 (UI 에서 "뮤트 해제까지 N분" 표시용)
-- ============================================================
create or replace view public.chat_active_mutes as
select user_id, muted_until, reason,
       greatest(0, extract(epoch from muted_until - now())::int) as seconds_remaining
from public.chat_mutes
where muted_until > now();

grant select on public.chat_active_mutes to authenticated;
