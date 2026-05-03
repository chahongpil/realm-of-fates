# 자율 4시간 작업 종합 (2026-05-02 ~ 2026-05-03)

> 사용자 외출 동안 자율 작업한 모든 내용. 돌아왔을 때 빠르게 검토 가능.

## 🎯 사용자 명시 펜딩 작업 처리 결과

### ✅ 7번 — 훈련장 분리 + 단련 메커니즘 재설계
- **신규 화면**: `#training-screen` (단련 + 스킬 교체 2탭). [game/index.html](game/index.html)
- **단련 메커니즘**: 골드 → exp 1:1 환산 → `cardXpNext = 100 × L^1.5` (C안 곡선) → 자동 레벨업 + `freePoints +5` 부여 + 6 스탯(atk/hp/def/spd/luck/nrg) 분배. 만렙 100 cap.
- **이펙트**: `.lv-up-label` 2.6rem 골든 "Lv N → N+1" + 기존 `.rarity-burst`/`.upgrade-card-glow`/`.upgrade-particles` 재활용.
- **단련 단위**: +100 / +1000 / Max(가용 골드) 3 버튼 가로 분할.
- **왕궁 정리**: 단련 탭 폐기 → 퀘스트 + 전직(placeholder). NPC choices 갱신.
- **잔여 마이너**: detail 패널 약 10~40px overflow (스크롤로 동작 OK, 더 압축하려면 layout 재배치 필요)
- 파일: [game/js/54_game_castle.js](game/js/54_game_castle.js), [game/js/50_game_core.js](game/js/50_game_core.js), [game/js/51_game_town.js](game/js/51_game_town.js), [game/js/62_ghost_pvp.js](game/js/62_ghost_pvp.js), [game/css/42_screens.css](game/css/42_screens.css)

### ✅ 8번 — lore Critical 6건 + High 3건 + Medium M-1/M-2 = 11건
- **PHASE1**: "가챠 연출" → "카드 획득 연출", "카드 뽑기" → "카드 파편 수집 완료", "뽑기 사운드" → "카드 완성 사운드", "강화/뽑기" → "강화/카드 완성"
- **PHASE3_COATING**: 황금 코팅 "가챠" → "업적 확정 보상", 태고 코팅 "0.1% 확률 가챠" → "절대신 클리어 / 시즌 최고 업적 확정". 표 안 가챠 행 삭제. **5단계 코팅 확정 획득 메커니즘 재설계 필요** 주석 추가.
- **PHASE2_DECK**: 영웅·유물·코팅 "가챠" → "이벤트 확정 보상"
- **PHASE2_TOWN**: "전설 뽑기권" → "전설 소환권" (세계관 몰입형)
- **PHASE5_CHAT**: "가챠 자랑" → "카드 획득 자랑"
- **PHASE2_HUD**: "💎 뽑기 전용" → "💎 보석 전용"
- **PHASE2_FLAVOR (M-2)**: "신도 죽는다" → "운명의 파편이 소멸할 때, 신마저 물러선다"
- 코드 변경 0 (기획서 단어 교체만)

---

## 🟢 추가 자율 폴리시

### PHASE 5 채팅
- **mention dropdown maxHeight 220 → 270**: 8 항목(264px) 무스크롤 가시. css/36_chat.css
- **카드 자동 링크 단어 경계 lookbehind/ahead 시도 → 회귀**: 한국어 조사(가/이/을/는/의) 90% 매칭 차단 부작용으로 단순 매칭 정책 확정. 향후 형태소 분석 기반 분리 검토 백로그.

### codex (생명의 서)
- **미수집 카드 클릭 힌트 모달 (사용자 backlog 처리)**: 등급별 generic 획득 경로 표시. bronze/silver/gold/legendary/divine + 영웅 카드 별도 안내. js/53_game_deck.js `_codexAcquireHint`

### dead code 정리
- **castle-tab-upgrade CSS + `--castle-tab-upgrade-*` 좌표 토큰 제거**: 단련 탭 폐기 후 잔재. css/10_tokens.css, css/42_screens.css
- **62_ghost_pvp.js showTraining monkey-patch 제거**: 훈련장(training)과 결투장(arena) 명확 분리. `showArena` 별도 진입.

### garbage 22건 trash 이동
- 일회성 probe 14개 (`tools/_inspect_*`, `tools/_pd_*`, `tools/_v4_*`, `tools/_mention_kb_inspect[1-7]`)
- 0byte `css/10_tokens.css.tmp`
- `img/ui/_backup_20260413/btn_stone_*.png` 4장
- 빈 디렉토리 2개 `rmdir`
- 위치: `c:/work/trash/2026-05-02-garbage/`
- **교훈 등재**: `.claude/rules/08-garbage-lessons.md` 에 "디버깅 probe 스크립트 작업 종료 시 즉시 trash (2회 확인)" 패턴 정식 등재.

### 단련 detail 폴리시
- fp grid 3열 유지, btn padding/font/min-height 압축 — 약 50px overflow 절감

### 검수 결과 확인
- **카드 V4 6 사이즈 시각 검수 통과** — `shots/card_v4_2026-05-02/all_sizes.png` 확인. name-box / lv-box / HP·NRG bar / parch / elem_icon 모두 일관.

---

## ⚠️ 사용자 결정 보류 사항

1. **단련 detail 잔여 10~40px overflow**: 패널 내부 스크롤로 동작은 OK. 추가 압축 (카드 thumbnail 60×84 + 옆에 정보) vs layout 재배치 (2 column) 결정 필요.
2. **PHASE3_COATING 5단계 확정 획득 메커니즘**: 단어 교체는 끝났지만 코팅 시스템 신규 설계 필요. 조각 누적 / 미션 단위 / 등급별 weighted random with cap 등.
3. **가지뷰 컨셉 라인 9 안 추천 채택 여부**: `design/branch_suggestions_2026-05-02.md` 사용자 검토 대기.
4. **카드 V4 내부 요소 비례화**: px 고정 → CSS calc 변수. 큰 작업이라 자율 보류.
5. **직업 트리 시스템 STEP 1**: 왕궁 "전직" placeholder 가 입구.

---

## 검증

- 회귀 12/12 PASS — 매 변경 단계마다 확인
- ui-inspector + play-director 다중 호출 검증 (훈련장 / @ mention / 단어 경계)
- 코드 변경 0 (lore 단어 교체) 부분은 자동 통과

## 변경 파일 (요약)

```
game/js/50_game_core.js        cardXpNext 곡선 변경 + level cap 100
game/js/54_game_castle.js      훈련장 신규 + 단련 재구현 + 왕궁 정리
game/js/51_game_town.js        NPC choices 갱신
game/js/62_ghost_pvp.js        showTraining monkey-patch 제거
game/js/36_chat.js             mention dropdown 4·5단계 + 단어 경계 정책
game/js/53_game_deck.js        codex 미수집 힌트
game/index.html                training-screen DOM + castle-screen 정리
game/css/42_screens.css        훈련장 레이아웃 + 레벨업 이펙트 + dead code 제거
game/css/36_chat.css           mention dropdown maxHeight 270
game/css/10_tokens.css         castle-tab-upgrade 좌표 토큰 제거
game/PHASE1_PLAN.md            가챠 → 카드 획득
game/PHASE2_DECK_EMPTY_STATE_PLAN.md  가챠 → 이벤트 확정 보상
game/PHASE2_HUD_FONT_POLISH_PLAN.md   뽑기 전용 → 보석 전용
game/PHASE2_TOWN_PLAN.md       전설 뽑기권 → 전설 소환권
game/PHASE2_FLAVOR_TEXT_PLAN.md       신살 플레이버 세계관화
game/PHASE3_COATING_PLAN.md    가챠 → 업적 확정 / 시즌 최고
game/PHASE5_CHAT_PLAN.md       가챠 자랑 → 카드 획득 자랑
.claude/rules/08-garbage-lessons.md   probe 스크립트 정리 패턴 등재
trash/2026-05-02-garbage/      probe 14개 + tmp + btn_stone PNG 4장
```
