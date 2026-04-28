-- ============================================================
-- PHASE 5 Step 5: 발언 제한 세부
-- ============================================================
-- 003_s3_chat.sql 위에 add-on. 한 단계씩 idempotent 하게 작성.
-- 구성:
--   5a. world 채널 최소 레벨 (Lv5) 제한 — RLS WITH CHECK 강화
--   5b. 1분 10개 이상 INSERT → 30분 자동 뮤트 (트리거)
--   5c/5d. 금칙어·URL 필터는 클라이언트 단(가벼움) — 서버 trigger 는 누적 후 추가 검토

-- ------------------------------------------------------------
-- 5a. world 채널 최소 레벨 제한
-- ------------------------------------------------------------
-- 기존 chat_insert_self_not_muted 정책은 그대로 두고, world 채널에 한정해 추가 제약.
-- user_level 은 클라가 INSERT 시 박는 값이라 위조 가능하지만, 일반 사용자 차단으로 충분.
-- (정밀 방어는 향후 trigger 에서 profiles.save_data 검증)

drop policy if exists "chat_insert_world_min_level" on public.chat_messages;
create policy "chat_insert_world_min_level" on public.chat_messages
  for insert with check (
    channel <> 'ch_world'
    or coalesce(user_level, 1) >= 5
  );

-- 기존 chat_insert_self_not_muted 정책과 AND 결합되어 적용됨.
-- 이 정책은 world 채널일 때만 user_level >= 5 강제.

-- ------------------------------------------------------------
-- 5b. 1분 10개 플러드 → 30분 자동 뮤트
-- ------------------------------------------------------------
-- INSERT 직후 같은 user 의 최근 60초 메시지 수를 세어 임계 도달 시 chat_mutes 에 30분 뮤트 추가.
-- chat_mutes 의 reason 컬럼이 'flood' 면 신고 누적('reports') 과 분리 추적.

create or replace function public.auto_mute_on_flood()
returns trigger language plpgsql security definer as $$
declare
  recent_count int;
begin
  -- 최근 60초 동안 같은 user 가 보낸 메시지 수 (방금 INSERT 한 NEW 행 포함)
  select count(*) into recent_count
    from public.chat_messages
   where user_id = NEW.user_id
     and created_at > (now() - interval '60 seconds');

  if recent_count >= 10 then
    insert into public.chat_mutes (user_id, muted_until, reason)
      values (NEW.user_id, now() + interval '30 minutes', 'flood')
      on conflict (user_id) do update
      -- 신고 누적('reports') 으로 이미 뮤트된 경우 reason 보존 — 더 무거운 사유가 우선
      set muted_until = greatest(chat_mutes.muted_until, now() + interval '30 minutes'),
          reason = case when chat_mutes.reason = 'reports' then 'reports' else 'flood' end;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_auto_mute_on_flood on public.chat_messages;
create trigger trg_auto_mute_on_flood
  after insert on public.chat_messages
  for each row execute function public.auto_mute_on_flood();

-- ------------------------------------------------------------
-- 5c/5d. 금칙어·URL 필터
-- ------------------------------------------------------------
-- 클라이언트 측 마스킹·차단으로 처리 (`js/37_chat_filters.js`).
-- 서버에서 jsonb regex 로 매번 검증하는 건 부담이 커서,
-- 향후 spam 신고 누적 데이터 보고 trigger 추가 검토.
