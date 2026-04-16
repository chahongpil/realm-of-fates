# Realm of Fates — Design System (디자인 시스템 규칙)

> 일관된 UI를 위한 단일 진실 원천(SSOT). 새 CSS를 쓰기 전에 반드시 이 문서부터 확인.
> 최종 업데이트: 2026-04-12

---

## 절대 규칙

1. **하드코딩 금지**: 새 CSS에서 hex 컬러, px 간격(정수), duration/easing 값을 직접 쓰지 않는다. 반드시 `var(--토큰)` 참조.
2. **토큰 없으면 먼저 추가**: 쓰고 싶은 값이 `css/10_tokens.css`에 없으면 토큰을 **먼저** 추가하고 그걸 참조한다.
3. **레거시 이주 중**: 기존 247개 하드코딩은 점진 이주. 새 코드는 0개.
4. **감사는 자동화**: `node tools/token_audit.js`로 진행도 측정.

---

## 토큰 카탈로그 (`css/10_tokens.css`)

| 카테고리 | 접두사 | 예시 |
|---|---|---|
| 카드 크기 | `--card-*`, `--mini-*`, `--field-tile-*`, `--hand-card-*` | `--card-width: 280px` |
| 뷰포트 | `--viewport-*`, `--bp-*`, `--safe-*` | `--viewport-max-w: 480px` |
| 중립 배경 | `--bg-0` ~ `--bg-4` | `--bg-2: #1a1a2e` |
| 텍스트 | `--text-0` ~ `--text-4` | `--text-1: #e6e6ee` |
| 보더 | `--border-1` ~ `--border-3` | |
| 등급 | `--rar-*`, `--rar-*-glow` | `--rar-legendary: #c66bff` |
| 원소 | `--el-fire/water/lightning/earth/dark/holy` + `-glow` | `--el-fire: #ff5533` |
| 스탯 | `--stat-atk/def/spd/hp/nrg` | `--stat-atk: #e74c3c` |
| 시맨틱 | `--success/danger/warn/info` + `-bg` | `--danger: #ff4444` |
| 화폐 | `--curr-gold/gem/blessing` | `--curr-gold: #ffd700` |
| 간격 | `--sp-0` ~ `--sp-8` (4/8/12/16/24/32/48/64) | `--sp-4: 16px` |
| 반경 | `--r-sm/md/lg/xl`, `--r-card`, `--r-pill` | `--r-card: 12px` |
| 그림자 | `--sh-sm/md/lg`, `--sh-card`, `--sh-glow` | `--sh-card: 0 4px 12px rgba(0,0,0,.4)` |
| 모션 | `--ease-*`, `--dur-*` | `--dur-slow: 900ms` |
| z-index | `--z-base/field/hud/overlay/modal/toast/debug` | `--z-modal: 200` |
| 폰트 | `--font-title/body/ui`, `--fs-xs` ~ `--fs-3xl` | `--font-title: Cinzel,...` |
| 터치 | `--tap-min: 44px` | |

---

## 사용 예시

### ✅ 좋은 예
```css
.my-button {
  padding: var(--sp-2) var(--sp-4);
  background: var(--bg-2);
  color: var(--text-1);
  border-radius: var(--r-md);
  font-family: var(--font-ui);
  transition: transform var(--dur-fast) var(--ease-out);
  min-height: var(--tap-min);
}
.my-button:hover {
  background: var(--bg-3);
  box-shadow: var(--sh-md);
}
.my-button.primary {
  background: var(--curr-gold);
  color: var(--bg-0);
}
```

### ❌ 나쁜 예
```css
.my-button {
  padding: 8px 16px;           /* → var(--sp-2) var(--sp-4) */
  background: #1a1a2e;         /* → var(--bg-2) */
  color: #e6e6ee;              /* → var(--text-1) */
  border-radius: 8px;          /* → var(--r-md) */
  transition: all 180ms ease;  /* → var(--dur-fast) var(--ease-out) */
}
```

---

## 점진 이주 가이드

**현재 상태**: `node tools/token_audit.js` 출력 기준 ~37% 이주 완료 (2026-04-12)

**이주 순서 (추천)**:
1. `30_components.css` (127개, 가장 많음) — 재사용 컴포넌트부터
2. `42_screens.css` (93개) — 화면 공통
3. `40_battle.css` (89개) — 전투 중 최다 노출
4. `31_card_system.css` (65개, 이미 일부 완료)
5. `41_formation.css` (12개)
6. `00_reset.css` (4개)
7. `80_animations.css` (1개)

**각 파일 작업 루틴**:
1. `node tools/token_audit.js --file <name>` 으로 해당 파일 하드코딩 목록 확인
2. 토큰 대응 있는 것(`→ var(--xxx)`)부터 치환
3. 미대응인데 빈도 높은 색은 먼저 토큰 추가 후 치환
4. `node tools/test_run.js` 회귀 검증
5. `node tools/game_inspect.js all` 시각 회귀 (PHASE 한 번에 여러 화면 동시 캡처)
6. `rof-ui-inspector` 에이전트 호출 — 실제 렌더 결과 육안 검증

---

## 새 UI 만들 때 체크리스트

- [ ] 쓰려는 색이 토큰에 있는가? 없으면 토큰 먼저 추가
- [ ] 간격이 `--sp-*` 스케일에 맞는가? 4/8/12/16/24/32/48/64 외 사용 금지
- [ ] 폰트는 `--font-title/body/ui` 중 어느 계층?
- [ ] 터치 타겟 `min-height: var(--tap-min)` 적용?
- [ ] `prefers-reduced-motion` 자동 대응됨 (10_tokens.css에 전역 @media 있음)
- [ ] 모션 값이 `--dur-*` + `--ease-*` 조합?
- [ ] z-index가 `--z-*` 스케일 사용?
- [ ] **작업 후**: `node tools/token_audit.js --file <수정파일>` 실행 → 하드코딩 신규 증가분 **0개** 확인
- [ ] **컴포넌트 로컬 var** 쓸 때 (예: `.my-block { --accent: var(--rar-gold); }`): 초기값이 반드시 토큰 참조여야 함. `--accent: #ffcc44` 금지.

---

## 레거시 호환

- `--gold` → `--curr-gold`의 별칭 (점진 제거 예정)
- `--primary-bg` → `--bg-0`과 거의 동일

---

## 관련 도구/에이전트

- **도구**: `tools/token_audit.js`, `tools/screen_size_audit.js`, `tools/touch_audit.js`, `tools/visual_diff.py`
- **에이전트**: `rof-ui-inspector` (시각 검증, 토큰 준수 확인)
- **규칙**: `.claude/rules/05-design-direction.md`, `06-card-ui-principles.md`
- **워크플로**: `.claude/skills/rof-workflow.md`의 Generator/Evaluator 섹션
