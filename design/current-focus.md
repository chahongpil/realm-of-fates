# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투 리뉴얼) + Phase 2 콘텐츠
**최근 세션**: 2026-04-22 새벽 — **P0~P4 일괄 정리 완료** (세션 종료, 대표님 휴식)
**마지막 커밋**: `fc51ba2` (P1~P4 일괄, 13파일). 전체 13 커밋 (d34b64f~fc51ba2)
**유닛 수**: 51 일반 + 6 신 영웅 템플릿 · 스펠 44 · 유물 12 / 회귀 **11/11 PASS**

### ✅ 2026-04-21~22 세션 완료 (총 13 커밋)
- [x] 타이틀 angel/demon 랜덤 (3771×1684 QHD)
- [x] BGM 3영역 셔플 (title/town/battle)
- [x] NPC 대화 오버레이 (8건물 lv1)
- [x] 카드 V4 top redesign + 바 전투 한정
- [x] rage 스탯 완전 제거 + effect drift 3회차 교훈 강화
- [x] **P0 전투 블로커 수정** (pCards null 가드)
- [x] rage 문서 3건 + CSS `--stat-rage`→`--stat-burn` + bg_title 3중 중복 해결 (34MB)
- [x] 밸런스 rarity 3건 + gate.png 404 제거
- [x] 세계관 용어 5곳 정정 (concept/lore-bible)
- [x] fuseCard 진화계수 `EVOLVE_COEF` 테이블화

### 다음 세션 오프닝 추천 (우선순위)
- [ ] 🔴 **A. 배틀 플로우 완주 검수** (20분) — P0 수정 효과 실증. Playwright login→전투→보상.
- [ ] 🟠 **B. 가비지 trash 이동** (15분) — garbage-cleaner 리포트 🔴 5건, 추가 17MB 절감
- [ ] 🟡 **C. 성별 토글 CSS transition** (15분) — minor_bugs #3 Option B, fade 200ms 추가
- [ ] 🟡 **D. 51유닛 신 계열 매핑** — **대표님 직접 진행 예정** (2~4시간, 트랙5)
- [ ] 🟢 **E. P4 큰 리팩터 2건** — CardV4.create() 쪼개기 / BUILDINGS.action 함수화 (위험도 중간)

## 막혀있는 것
- 📌 Supabase 봇 시드 + S2 E2E 8개 — 대표님 직접
- 📌 대표님 공급 대기: 원소 이펙트 PNG 6장, NPC 하프바디 일러 4장

## 노트
- **P0 수정 핵심**: pCards:null 은 "초기화 필요" sentinel. launchBattle 의 `if(!bs.pCards)` 에서 배열로 채움. 단순히 `[]` 로 초기화하면 초기화 분기가 트리거 안 됨. → 호출자 측 방어 가드가 정답.
- **effect drift 3회차**: rage 제거 때 코드 3점은 동시 수정 OK, **기획 문서 3건(.md)** 은 놓침. 다음부터 stat 제거 체크리스트에 `grep -rn "<키워드>" game/*.md` 추가.
- **bg_title 3중 중복 사고**: cp 3번 한 결과. 대안: mv + 심볼릭 링크, or 단일 파일 + CSS 변수 참조.
- **Claude Design 파이프라인**: 대표님 일러스트/아이콘 공급 → Claude Design 프레임/UI → 내가 적용·검증
- **CSS 디자인 금지**: 아이콘/프레임/색/그라디언트/효과는 대표님 공급, 내가 CSS 로 직접 만들지 않음

## 이번 세션 리포트 8건 (design/)
- [balance_audit_2026-04-21.md](balance_audit_2026-04-21.md) · [play_director_report_2026-04-21.md](play_director_report_2026-04-21.md)
- [v4_audit_2026-04-21.md](v4_audit_2026-04-21.md) · [worldbuilding_audit_2026-04-21.md](worldbuilding_audit_2026-04-21.md)
- [minor_bugs_2026-04-21.md](minor_bugs_2026-04-21.md) · [code_extensibility_review_2026-04-21.md](code_extensibility_review_2026-04-21.md)
- [garbage_scan_2026-04-21.md](garbage_scan_2026-04-21.md) · lore_research_2026-04-21.md (이전 세션)
