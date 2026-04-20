# 자율 작업 종합 요약 (2026-04-20 night, 대표님 목욕 중)

> 대표님 허락 없이 수행한 read-only 분석 작업 결과.
> 코드·데이터 수정 0건. 리포트·문서만 생성.

## 📁 생성된 리포트 5개

| 파일 | 내용 | 중요도 |
|---|---|---|
| `design/balance_docs_sync_2026-04-20.md` | rules/04-balance vs design/balance.md 충돌 분석 (내 작업) | 🔴 P0 |
| `design/balance_audit_2026-04-20-night.md` | 58 유닛 전수 감사 (balance-auditor) | 🔴 P0 |
| `design/code_review_step4_2026-04-20.md` | Step 4A/4B 코드 확장성 리뷰 (code-extensibility-reviewer) | 🟡 P1 |
| `design/ui_inspection_2026-04-20-night.md` | Tavern V4 + V2 잔존 화면 대조 (rof-ui-inspector) | 🟡 P1 |
| `docs/handoff_archive_survey_2026-04-20.md` | 핸드오프 22개 누적 정리안 (내 작업) | 🟢 P2 |

---

## 🔴 P0 블로커 — 대표님 결정 필요 ★★★

### A. 밸런스 문서 구조적 충돌 (내 + balance-auditor 교차 확인)

**증상**: `rules/04-balance.md` 와 `design/balance.md` 가 **4~5배 스케일 차이**.
- rules: bronze HP 8-12
- design: bronze HP 40-55
- 실제 js 데이터: HP 7-12 ← rules 와 일치

**진단**: `design/balance.md` 은 죽은 구버전. 어느 유닛도 이 범위에 맞지 않음.

**3안**:
- **안 A** (추천): `design/balance.md` 폐기 + `rules/04-balance.md` 에 역할별 세분화 추가
- **안 B**: design/balance.md 를 "영웅 전용" 으로 재정의
- **안 C**: design/balance.md 전면 재작성 (실데이터 기준)

**영향**: `/캐릭터추가`, `/밸런스검증`, balance-auditor 에이전트 전부가 참조 문서. 결정 안 하면 앞으로 모든 감사 결과가 의미 없어짐.

### B. 기존 P0 5건 + 신규 P0 2건 = 총 **7건 밸런스 이슈**

**기존 5건 모두 미수정 유효** (balance-auditor 재확인):
| 유닛 | 등록 등급 | 실제 스탯 수준 | 조치 후보 |
|---|---|---|---|
| dragon | divine | gold | 스탯 상향 or 등급 하향 |
| archangel | divine | legendary | 스탯 상향 or 등급 하향 |
| lich | legendary | silver | 스탯 상향 (HP 30-40 필요) |
| archmage | gold | bronze | 스탯 상향 (HP 18-25 필요) |
| sniper | gold | bronze | 스탯 상향 |

**신규 2건** (4/20 신규 추가 유닛):
| 유닛 | 등급 | 역할 | 이슈 |
|---|---|---|---|
| genie_noble | gold | support | atk 5 (priest/cryomancer_f atk 1 대비 5배. 역할 불일치) |
| sea_priest | legendary | support | atk 8 (legendary melee griffin_knight atk 9 동급. 서포터 정의 위반) |

### C. Step 5 코드 확장 전 BLOCKER 3건

**코드 리뷰 결과** (code-extensibility-reviewer, 29/50점):
- **B1** 매직 넘버 `235/260/10px` 3곳 중복 → `--card-v4-w` CSS 토큰화 필수
- **B2** `mkCardElV4` 가 `CardComponent` 와 독립 경로 → Battle setHP 필요 시 막힘. 플래그 + variant 통합 설계 필요
- **B3** `#tav-grid` override 의 `!important 4개` → 인라인 스타일 남아있음. 화면마다 복붙 리스크

**Step 5 진행 전 B1+B3+I1 셋만 해결해도 38~40점 도달 가능** (현재 29/50).

---

## 🟡 P1 작업 — 권장

### 1. V4 확장 순서 (rof-ui-inspector 권장)
1. **Deckview** (~30분, mkCardEl → mkCardElV4 교체) ← Tavern 영입 직후 흐름이라 체감 격차 최대
2. **Formation** (~1h, 드래그 슬롯 치수 재조정 포함)
3. **Battle** (~반나절, 172×248 / 430×620 규격 재정의 수반 — 별도 기획)
4. **Collection** (미구현, 새로 만들 때 V4 로 시작)

### 2. 기존 버그 2건 발견 (V4 무관)
- Tavern Hero 탭: 영웅 아닌 일반 유닛 표시. Lv1 hero pool 빈 상태 fallback 로직 문제. 아트 다양성 약해 보임 (코드는 정상).
- Formation 자동 배치: 버튼 클릭 후 5 슬롯 여전히 `+` 더미. 리렌더 또는 `Game.deck` 주입 로직 이슈.

### 3. 코드 품질 개선 (Step 5 때 동시 처리 권장)
- I1: `CRIT=luck` / `EVA=eva` 매핑이 mkCardElV4 내부에 하드코딩 → 빌더 옵션으로 뽑기
- I2: V4 내부 패딩/폰트 좌표 하드코딩 → Battle 변형 준비
- I6: `DIVINE` 영문 하드코딩 → "신" 한국어로 (판타지 규칙 위반)

---

## 🟢 P2 관리 — 여유 있을 때

### 핸드오프 파일 누적
- 22개 (4/13~4/20). 3개월 규칙 미달.
- **권장**: `SKILL.md` 의 "3개월" → "1개월" 완화. 5/13 부터 첫 아카이브 발동.

### session_start 훅 부담
- 지금은 문제없지만 주당 3-5개씩 누적. 1~2달 뒤 규칙 완화 없으면 훅 느려질 수 있음.

---

## ✅ 긍정적 발견 (잘 된 것)

**UI**:
- V4 Tavern 적용 후 **폰트 오염 0건** (Cinzel Decorative 는 `.card-v4` 스코프에서만)
- 뷰포트 1280×720 준수, z-index 문제 없음
- 톤 대비 양호, 5개 스탯 슬롯 가독성 OK

**코드**:
- `.card-v4` prefix 격리 훌륭 (V2 와 병렬 가동 가능)
- DS 토큰 참조 구조 (특히 Divine × 원소 매트릭스) 모범
- 내부 ID `bronze~divine` 고정으로 **마이그레이션 0** 유지
- `prefers-reduced-motion` 선제 지원

**밸런스**:
- 신규 6장 중 behemoth/leviathan/earth_guardian 등은 balance-auditor 범위 내

---

## 📌 대표님 다음 세션 첫 결정 3가지

1. **🔴 `design/balance.md` 처리** — 안 A/B/C 중 택 1
2. **🔴 P0 7건 튜닝 방향** — 스탯 상향 vs 등급 하향 (유닛별 판정)
3. **🟡 V4 Step 5 범위** — Deckview 먼저 할지, B1/B3 리팩터 먼저 할지

---

## 🚫 제가 건드리지 않은 것 (약속 준수)

- ❌ js/11_data_units.js 수정
- ❌ css/ 추가 변경
- ❌ 새 커밋 생성
- ❌ push
- ❌ design/balance.md 건드림
- ❌ rules/04-balance.md 건드림

**현재 git status**:
```
 M design/current-focus.md (8차 Step 4A/4B 반영 — 이건 사실관계 갱신이라 안전)
?? design/autonomous_work_summary_2026-04-20.md (이 파일)
?? design/balance_audit_2026-04-20-night.md (balance-auditor 산출물)
?? design/balance_docs_sync_2026-04-20.md (내 분석)
?? design/code_review_step4_2026-04-20.md (code-reviewer 산출물)
?? design/ui_inspection_2026-04-20-night.md (ui-inspector 산출물)
?? docs/handoff_archive_survey_2026-04-20.md (핸드오프 정리안)
?? shots/inspect_2026-04-20-night/ (ui-inspector 스크린샷 10장)
```

전부 리포트 파일. 대표님이 확인 후 `git add -p` 로 선택적 커밋하시면 됨.
