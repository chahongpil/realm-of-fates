# Realm of Fates — 웹 기술 설계

> 단일 HTML 프로토타입을 계속 발전시키는 방식의 기술 설계
> 마지막 업데이트: 2026-04-12 (Unity 전환 계획 전면 취소)

---

## 1. 기술 스택

| 영역 | 기술 | 이유 |
|------|------|------|
| **런타임** | Vanilla HTML/CSS/JS | 의존성 0, 배포 즉시 |
| **렌더링** | DOM + CSS + Canvas 2D (필요 시) | 오버헤드 낮음, 디버깅 쉬움 |
| **상태/저장** | `localStorage` (`rof8` 키) | 로컬 단일 플레이어 우선 |
| **사운드** | Web Audio API | 프로시저럴 BGM + 효과음 |
| **애니메이션** | CSS `@keyframes` + `requestAnimationFrame` | GPU 가속, 추가 라이브러리 불필요 |
| **파티클/VFX** | Canvas 2D 파티클 시스템 (내장 구현) | 의존성 최소화, 이미 사용 중 |
| **트위닝 (선택)** | GSAP 로컬 번들 | 복잡 연출 필요 시에만 |
| **이미지 생성** | Stable Diffusion + DreamShaper (로컬) | 카드 일러스트 제작 파이프라인 |
| **테스트/QA** | Playwright (`tools/game_inspect.js`) | 자동 스크린샷 + DOM 검사 |
| **패키징** | (향후) Electron / Tauri / PWA | 앱 배포 원할 때 단일 파일 래핑 |
| **온라인화 (향후)** | Cloudflare Workers + D1 + WebSocket | 경량 백엔드로 충분 |

Unity/Photon/PlayFab 계획은 **전면 폐기**. 웹 단일 HTML 방식이 정본.

---

## 2. 프로젝트 구조

```
c:/work/game/
├── index.html                ← 단일 게임 파일 (HTML + CSS + JS)
├── img/                      ← 카드/건물/NPC/UI PNG (로컬 에셋)
│   ├── h_*.png               ← 영웅 18종
│   ├── <unit>.png            ← 모집 유닛 26종
│   ├── sk_*.png              ← 스킬 30종
│   ├── building_*_lv{1-5}.png
│   ├── npc_*.png
│   └── bg_*.png              ← 배경
├── snd/                      ← BGM/SFX mp3
├── tools/
│   └── game_inspect.js       ← Playwright 브라우저 진입/스크린샷 도구
├── gen_*.py                  ← Stable Diffusion 에셋 생성 스크립트
├── ART_ASSETS.md             ← 카드 에셋 현황표
├── ELEMENT_PALETTE.md        ← 6원소 색상 팔레트
├── WEB_ARCHITECTURE.md       ← (이 문서)
├── HANDOFF.md                ← 핸드오프
├── GDD.md                    ← 게임 기획서
├── BATTLE_RULES.md           ← 전투 규칙
├── BATTLE_FORMULA.md         ← 전투 공식
├── BATTLE_KEYWORD_ORDER.md
├── BUGFIX_EDGE_CASES.md
├── CURRENCY_SYSTEM.md        ← 화폐
├── EQUIPMENT_SYSTEM.md       ← 장비
├── RARITY_REVEAL_EFFECT.md   ← 등급 공개 연출 (구 GACHA_EFFECT.md, 가챠 폐기 후 재사용)
├── DESIGN_ASSET_PLAN.md
├── STAT_TRAIT_SYSTEM.md
├── FEATURE_IDEAS.md
├── PHASE1_PLAN.md            ← Phase 1 (완료)
└── PHASE2~4_*.md             ← Phase 2~4 기획서
```

### index.html 내부 구조

```
<CSS>     1~527줄   다크 고딕 스타일, 레어리티 색상, 애니메이션
<HTML>    528~975줄  스크린 div(title/login/signup/prologue/menu/battle/…)
<JS>
  DATA          UNITS(44), SKILLS_DB(30), RELICS_DB(12), ENEMY_NAMES, STARTERS
  CARD_IMG      카드 → 이미지 경로 매핑
  SFX           Web Audio API (BGM/효과음)
  Auth          로그인/회원가입 (localStorage 기반)
  UI            화면 전환 헬퍼
  FX            파티클/이펙트
  Game          메인 게임 로직 (상태, 전투, 메뉴, 마을, 덱, 선술집, …)
  Helpers       mkCardEl, mkMini, applySkillToUnit, fuseCard, …
```

---

## 3. Unity 개념 → 웹 개념 매핑

| Unity 기존 계획 | 웹 실제 방식 |
|----------------|------------|
| Scene | `#xxx-screen` div + `UI.show(id)` |
| Prefab | JS 템플릿 함수 (mkCardEl 등) |
| ScriptableObject | 모듈 스코프 상수 (UNITS, SKILLS_DB 등) |
| MonoBehaviour | `Game` 객체의 메서드 |
| Coroutine | `async/await` + `setTimeout` |
| Animator/AnimationController | CSS `@keyframes` + 클래스 토글 |
| DOTween | CSS transitions + `requestAnimationFrame` |
| Shader Graph | CSS `filter`, `box-shadow`, 그라데이션, blend-mode |
| Particle System | Canvas 2D 파티클 루프 (FX 네임스페이스) |
| VFX Graph | 동일 (Canvas 2D) |
| UI Toolkit | HTML + CSS 그리드/플렉스 |
| Addressables | `<img src>` 지연 로드, 필요 시 fetch |
| AudioSource / AudioMixer | Web Audio API (OscillatorNode, GainNode, BufferSource) |
| Input System | `addEventListener('click'/'touchstart')` |
| PlayFab Player Data | `localStorage` (`rof8`) |
| PlayFab Leaderboard | (향후) Cloudflare D1 + fetch |
| Photon Fusion PvP | (향후) WebSocket — 또는 AI 매칭만 유지 |
| Photon Chat | (향후) WebSocket 또는 선택 기능 제외 |
| Unity IAP | Stripe / KakaoPay / Tauri 결제 (배포 결정 시) |
| Git LFS | 불필요 (이미지는 직접 버전관리) |

---

## 4. 상태 관리 (경량 상태 머신)

Unity의 `GameState` 상태 머신은 JS 객체로 대체:

```js
const States = {
  TITLE:    'title-screen',
  LOGIN:    'login-screen',
  SIGNUP:   'signup-screen',
  PROLOGUE: 'prologue-screen',
  MENU:     'game-screen',
  BATTLE:   'battle-screen',
  RESULT:   'result-screen',
};

const UI = {
  show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
  }
};
```

복잡한 전환 로직이 필요하면 `Game.state` 문자열 + switch 분기.

---

## 5. 저장/로드

```js
Auth.db = () => JSON.parse(localStorage.getItem('rof8') || '{}');
Auth.save = (db) => localStorage.setItem('rof8', JSON.stringify(db));

// 저장 구조
{
  "홍아다": {
    "pw": "1234",              // 데모용 평문. 배포 시 해시 필수.
    "save": {
      "round": 0,
      "gold": 5,
      "deck": [...],
      "ownedSkills": [...],
      "ownedRelics": [...],
      "leaguePoints": 0,
      "bestRound": 0,
      "totalWins": 0,
      "buildings": {...},
      "tutStep": 0,
      ...
    }
  }
}
```

향후 백엔드 붙일 때: 같은 JSON 형태를 서버 DB로 옮기기만 하면 호환.

---

## 6. 에셋 파이프라인

```
1. 프롬프트 작성       → gen_*.py 또는 gen_sk_cards.py
2. Stable Diffusion    → DreamShaper_8_pruned (로컬)
3. 후보정 (선택)        → GIMP 또는 그대로 사용
4. img/ 폴더에 저장    → 파일명 = 카드 id
5. CARD_IMG 매핑 추가  → index.html에서 로컬 경로 참조
6. ART_ASSETS.md 갱신  → 수량/누락 체크
```

생성 스크립트 목록:
- `gen_sk_cards.py` — 스킬 30종 (2026-04-12 완료)
- `gen_dreamshaper.py` — 범용 DreamShaper 래퍼
- `gen_buildings.py`, `gen_building_lv.py` — 건물 레벨업 이미지
- `gen_extra.py`, `gen_ds2.py`, `gen_title.py`, `gen_ui.py` — 기타 에셋

---

## 7. 애니메이션/이펙트 레시피

### 카드 뒤집기
```css
@keyframes flip {
  0%   { transform: rotateY(0deg);   }
  50%  { transform: rotateY(90deg);  }
  100% { transform: rotateY(0deg);   }
}
.card.flip { animation: flip 0.6s ease-in-out; }
```

### 크리티컬 화면 흔들림
```css
@keyframes shake {
  0%, 100% { transform: translate(0,0); }
  20% { transform: translate(-4px,2px); }
  40% { transform: translate(4px,-2px); }
  60% { transform: translate(-2px,2px); }
  80% { transform: translate(2px,-2px); }
}
.screen.shake { animation: shake 0.4s; }
```

### 파티클 (Canvas 2D)
```js
const particles = [];
function spawnParticle(x, y, color) {
  particles.push({ x, y, vx: (Math.random()-0.5)*4, vy: -Math.random()*6, life: 60, color });
}
function tickParticles(ctx) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 60;
    ctx.fillRect(p.x, p.y, 3, 3);
    if (p.life <= 0) particles.splice(i, 1);
  }
  ctx.globalAlpha = 1;
}
```

---

## 8. 성능 가이드라인

- 카드 DOM 개수 ≤ 60개 동시 (전장 10 + 손패 10 + 팔레트 40)
- 파티클 풀 최대 300개, 자동 재활용
- 배경 이미지 PNG WebP 변환 검토 (용량 ~40% 절감)
- 60fps 고정 대신 30fps 안정 타깃 (모바일 배터리)
- 백그라운드 탭 진입 시 `visibilitychange`로 전투 루프 일시정지

---

## 9. 테스트 자동화

`tools/game_inspect.js` (Playwright) 이미 존재 — 확장:

```bash
# 단일 화면
node tools/game_inspect.js menu
node tools/game_inspect.js skills-grid --full

# 전체
node tools/game_inspect.js all

# 디버그 (창 보이기)
node tools/game_inspect.js deck --headed
```

향후 시나리오 테스트:
- 전투 엔드투엔드 (매칭 → 라운드 3회 → 결과)
- 가챠 당첨 확률 검증 (10000회 시뮬)
- 저장 왕복 무결성 (저장 → 로드 → 비교)

---

## 10. 향후 확장 (필요 시)

| 확장 방향 | 기술 |
|----------|------|
| **앱 배포** | Tauri (가장 가벼움) 또는 Electron |
| **PWA** | Service Worker + manifest.json + 오프라인 캐시 |
| **온라인 리더보드** | Cloudflare D1 + Workers |
| **실시간 PvP** | WebSocket (Cloudflare Durable Objects) |
| **친구/길드 채팅** | WebSocket 또는 간소화 (비동기 메시지만) |
| **결제** | 배포 플랫폼 결제 API (Stripe / 카카오페이 / PG) |
| **광고** | Google AdSense (웹) / AdMob (앱 배포 시) |

**원칙**: 필요해지기 전에 추가하지 않는다. 단일 HTML로 가능한 만큼 최대한 밀어본다.
