# Chat Step 2 실동작 검수 리포트 (2026-04-22)

> play-director 실플레이 (4분) + 내 조사·수정. 30분 자율 모드 산출물.

## 🔴 블로커 1건 발견 → 보조책 적용

### [B1] Supabase Realtime INSERT 브로드캐스트 미작동
- **증상**: `chat_messages` 테이블에 INSERT 는 성공, 하지만 `postgres_changes` 구독 콜백이 전혀 호출되지 않음 (fresh client fresh channel 도 동일)
- **영향**: 본인 메시지조차 전송 후 화면에 안 뜸, 새로고침해야 보임 → 채팅 UX 파괴
- **확인**: P2 탭에서도 P1 이 방금 보낸 메시지 수신 0건. DB 에는 3행 들어갔음(SELECT 로 확인)

### 내가 취한 조치
1. **Replica Identity FULL 적용** (SQL):
   ```sql
   alter table public.chat_messages replica identity full;
   alter table public.chat_mutes    replica identity full;
   ```
   `pg_class.relreplident` 'd'→'f' 로 변경 확인. RLS 환경에서 realtime 이 old/new row 평가 시 필요한 설정.

2. **Optimistic append + id dedup** (클라):
   - `Backend.chatSend()` 가 `.select().single()` 로 insert 된 row 즉시 반환
   - `Chat._sendMessage()` 가 성공 시 본인 메시지 즉시 렌더
   - `Chat._renderMessage()` 가 `[data-message-id]` 기반 dedup → realtime 으로 같은 id 다시 와도 중복 X
   - **결과**: realtime 이 지연되거나 실패해도 본인 메시지는 항상 즉시 보임. 다른 유저 메시지는 여전히 realtime 복구 시 자동 반영.

### 대표님 확인 필요 (Management API 로 불가)
- Supabase 대시보드 → Database → **Publications** → `supabase_realtime`
  - `chat_messages` 체크박스 상태 확인 (migration 에서 `alter publication add table` 실행했으나 UI 토글이 별도 상태일 수 있음)
- Database → **Replication** 설정 재확인

이 둘만 켜지면 타 유저 메시지도 실시간 수신 가능. 안 켜져있어도 본인 메시지는 optimistic append 로 보이므로 UX 최소 보장.

## 🟡 P1 (블로커 아님, 권고)

| # | 내용 | 상태 |
|---|---|---|
| P1-1 | 쿨다운 배너 뜨는 동안 input 이 비워지지 않음 | 미처리 (Step 5 폴리싱) |
| P1-2 | `Chat.init` 을 DOMContentLoaded+800ms 에 호출하는데 이 시점 세션 복원 전. AuthStateChange hook 재init 필요 | 미처리 (Step 7) |
| P1-3 | `bg_title_demon.jpg` preload warn (사용처 지연) | 미처리 (Step 7) |
| P1-4 | GoTrueClient 중복 인스턴스 경고 (`Backend._sb` singleton 노출) | 미처리 (Step 7) |

## 정량 지표

| 지표 | 실측 | 기준 | 판정 |
|---|---|---|---|
| Backend isReady | 3.9s | ≤3s | 🟡 (GitHub Pages TLS+JS 로드) |
| Signup 왕복 | 0.42s | ≤1s | ✅ |
| 메시지 send → 렌더 | **이전: ∞ / 현재: <100ms** (optimistic) | ≤500ms | ✅ |
| 교차 탭 realtime | **이전: ∞ / 현재: 대시보드 토글 의존** | ≤1s | ⚠ 대표님 확인 대기 |

## 검수 세션 부산물 (cleanup 대상)

테스트 계정·메시지 3건이 Supabase 에 남음. 24h 롤링 cron 으로 자동 삭제되지만 수동 정리 원하시면:

```sql
delete from public.chat_messages where user_name like 'qa_%' or user_name like 'rt_%';
delete from public.profiles where nickname like 'qa_%' or nickname like 'rt_%' or nickname = 'qa_diag';
delete from auth.users where email like 'rof_qa_%@test.local' or email like 'rof_rt_%@test.local';
```

## 스크린샷

play-director 산출물: `c:/tmp/chat_verify/01_initial.png` ~ `diag_final.png` (7장)

## 결론

- **코어 기능 최소 동작 복구**: 본인 메시지는 optimistic append 로 즉시 렌더 ✅
- **전체 실시간 보장**: Supabase 대시보드 Publications 체크박스 확인 후 100% 기대 (대표님 1분 작업)
- **Step 3 준비 완료**: 리그 시스템 조사 끝, guild 는 placeholder 로 갈 것
