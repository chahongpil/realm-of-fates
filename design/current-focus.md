# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투 리뉴얼) + Phase 2 콘텐츠 + 운영 UX 정비
**최근 세션**: 2026-04-27 — **타이틀 영상 + BGM 3그룹화 + 설정 모달 가독성·클릭 사각지대 + 음악 메타 7곡 복구**
**마지막 커밋**: `2f458a1` (sound-panel padding 클릭 사각지대 수정, push 완료)
**누적 커밋**: 11건 (origin/master = 6f53432 → 2f458a1)
**유닛 수**: 51 일반 + 6 신 영웅 / 스펠 44 / 유물 12 (변동 없음)

### ✅ 2026-04-27 세션 완료
- [x] **타이틀 배경 영상** — `img/bg_title.mp4` 1.62MB (24MB → 압축, ffmpeg 1920×858 H.264 CRF 30)
- [x] **영상 letterbox 영역까지 cover** — `99_bootstrap.js` 가 video 를 body 직계로 끌어올림
- [x] **정중앙도 영상 노출** — game-root + #title-screen background transparent
- [x] **24MB 원본 git history 제거** — squash via tmp branch + amend + cherry-pick (비-interactive)
- [x] **BGM 3그룹화** — `_currentGroup` 추적, 같은 그룹 재호출 시 noop. 마을 안 건물 이동 시 음악 끊김 방지
- [x] **음악 메타 7곡 복구** — Downloads/ size 일치 매칭 (title3/town3·4·5/battle6 + title1·2 부분)
- [x] **검수관 후속** — 마을 .tb-label 가독성 + church 갭 +10 + 성별 토글 fade
- [x] **설정 모달 섹션 라벨 가독성** — var(--curr-gold) + .82rem + 700 + text-shadow
- [x] **톱니 클릭 사각지대 수정** — sound-panel collapsed padding:0 + onclick fallback

### 🔴 보류 / 다음 세션 우선순위

1. **사용자 요청 4번 재개** — 전투 HP/NRG 풀 충전 + 여관/성당 안내 + NRG 부족 스킬 토스트
   - 진단 데이터 핸드오프 문서에 정리됨 ([handoff-2026-04-27-0145.md](../docs/handoff/handoff-2026-04-27-0145.md))
   - 4 작업 cluster Edit 권장 (08-garbage-lessons.md 의존 그래프 원칙)
2. 🟠 회귀 테스트 (`tools/test_run.js`) — 11 커밋 누적
3. 🟡 AcoustID 키 재발급 + 미매칭 7곡 (title2 영문 / town1·2 / battle1~5) lookup
4. 🟢 PHASE 5 Step 4 카드 공유

## 막혀있는 것
- 📌 AcoustID 키 (대표님 발급 필요, 무료 등록)
- 📌 temple/inn/gate building_*.png 404 (대표님 공급 또는 fallback)
- 📌 hero_* skinKey CARD_IMG 매핑 (영웅 일러 1장 잔여)

## 노트
- **squash 우회 패턴 정립**: -i 금지 환경에서 tmp branch + amend + reset + cherry-pick 으로 history rewrite. backup tag 안전망.
- **WCAG 4.5:1 미달 = "안 보인다"**: banner PNG 텍스처 위 var(--text-3) + .72rem 미달. 검수관 진단 패턴 재확인.
- **클릭 사각지대 패턴**: 자식 element 가 부모 영역 정확히 채워야 bindings closest('[data-action]') 가 닿음. padding 영역은 자식이 안 닿는 부모 영역.

## 이번 세션 커밋 (시간순)
- `43fbabd` feat(ops): auth opt-in + 증축 폐기 + NPC 재설계 + 성문 허브 (직전 세션 미커밋 정리)
- `50931d6` chore(tools): Game.buildings + gitignore
- `bb2215e` docs: changelog + handoff
- `6b05ca4` fix(ui): 검수관 후속 + 성별 fade
- `5b525ec` feat(title): 타이틀 배경 영상 (squash with 1.62MB)
- `d89bcd5` docs(snd): SOURCES.md 매핑 7곡
- `d8aff0e` fix(title): letterbox 영역 cover
- `2de6e14` fix(title): 정중앙 영상 노출
- `fb3045f` feat(audio): BGM 3그룹화
- `25b081b` fix(settings): 모달 가독성
- `2f458a1` fix(settings): 톱니 클릭 사각지대
