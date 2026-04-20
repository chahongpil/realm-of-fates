# 🎯 지금 작업 중

> 매 세션 시작 시 자동 로드됨 (session_start.py 훅).
> 20~30줄 이내로 유지. 오래된 내용은 핸드오프 문서로 이관.

## 진행 중 작업

**Phase**: Phase 3 (시네마틱 전투 리뉴얼) + Phase 2 콘텐츠 + **Design System 도입**
**최근 세션**: 2026-04-20 (4·5·6·7차 — 7차 = Claude Design zip → GitHub 레포 + DS 토큰 추가 + V4 카드 시안 3안)
**마지막 커밋**: `896a254` feat(units): 신규 6장 추가 (Design System 7차는 미커밋)
**유닛 수**: 58 유닛 / 회귀 9/9 PASS
**DS 레포**: https://github.com/chahongpil/realm-of-fates-design-system (private, 로컬 `c:/work/design-system/`)

### 이번 세션(4/20 4·5·6차) 완료 — 6커밋 push
- [x] `41a6755` archfiend 튜닝 (luck 8→6, life_steal .3→.25, balance-auditor P1)
- [x] `cb27064` **프레임 일체화 폐기** → Claude Design 협업 전환, 31장 재임포트, titan/griffin_rider APNG, 영어 파일명 rename 37+16장, 구 프레임 805MB trash
- [x] `5b52afa` 6원소 아이콘 원본 공개
- [x] `97796ce` 역할/이펙트 아이콘 원본 공개 (5종 + effects_3x5)
- [x] `58843f0` UI 아이콘 사양서 README
- [x] `896a254` **신규 6장** (58 유닛, divine 6원소 완성, legendary defense/support 갭 메움)
- [x] 피드백 메모리 `feedback_no_css_design.md` — CSS 디자인 금지

### 이번 세션(4/20 7차) — DS 도입 Step 1-3 (미커밋)
- [x] Claude Design zip (93파일/21MB) → `c:/work/design-system/` + GitHub private 레포 push
- [x] `css/10_tokens.css` **섹션 14** 추가 — DS 토큰 19종(parchment/ink/rubric/lapis/malachite/gilt/역할5색), 사용처 0 무해
- [x] `index.html` 폰트 로드 확장 — Cinzel Decorative 700/900 + Cinzel 500/900 + Noto Sans KR 400-900 + Noto Serif KR 400-900
- [x] `mockup/v4_card/v1~v3.html` + `shots/v4_mockup/v1~v3.png` — Tavern 6장(등급5 + divine 2원소) V4 시안 3안
- [x] 회귀 9/9 PASS

### 다음 작업 (우선순위)
- [ ] 🔴 **V4 카드 시안 선택** — v1(순수 DS 톤)/v2(현 배경+V4)/v3(양피지 톤다운) 중 대표님 결정 → Step 4 적용
- [ ] 🔴 **Claude Design 결과물 확인** — 6원소/역할/이펙트 아이콘 개별 crop + 카드 적용 시 회귀/시각 검증
- [ ] 🟡 **암흑의저격수 데이터 추가** — rarity 확정 후 (`source_art/units/암흑의저격수.png` 대기)
- [ ] 🟡 **P0 5건 결정** — dragon/archangel/lich/archmage/sniper 스탯 방향
- [ ] 🟡 **역할 5종 분화 결정** — 현 3종(melee/ranged/support) → DS 5종(guardian/melee/ranged/caster-m/caster-r) 전환 여부 (58 유닛 재분류 영향)
- [ ] 🟡 **effect 마커 재설계** — 대표님 작업 완료 시 파서/전투/데이터 3지점 동기
- [ ] 🟡 `rules/04-balance.md` vs `design/balance.md` 수치 동기화

## 막혀있는 것
- 📌 **암흑의저격수 rarity** — 일러스트는 공급됐으나 rarity/id 확정 대기
- 📌 **P0 5건** — dragon/archangel divine 미달, lich/archmage/sniper hp 미달
- 📌 **Row 3 r3c5 (모닥불)** — 영어 라벨 없는 셀, 용도 미확정
- 📌 Supabase 봇 시드 + S2 E2E 8개 — 대표님 직접

## 노트
- **Claude Design 파이프라인 확정**: 대표님이 순수 캐릭터 일러스트 + 원본 아이콘 공개 레포 push → Claude Design 이 시스템 프레임(CSS/코드) + 아이콘 crop + 카드 UI 배치 → 내가 결과 확인 + 회귀
- **CSS 디자인 금지**: 아이콘/프레임/색/그라디언트/효과는 대표님 공급, 내가 CSS 로 직접 만들지 않음. 레이아웃/포지션만 내 영역
- **영어 파일명 규칙**: 한 캐릭터 한 등급이면 접미사 없음, 여러 등급은 `_{rarity}` (noble/legendary/divine). 첫 사례: `genie_noble` / `genie_legendary`
- **UI 아이콘 사양서**: `source_art/ui/README.md` — 6원소/역할 5종/이펙트 14종 매핑 + 규칙 (거인상 보류, divine defense 만 특별 방패)
