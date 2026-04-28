'use strict';

// ─────────────────────────────────────────────────────────────
// PHASE 3 시네마틱 전투 — 전역 설정
// 기획서: game/PHASE3_BATTLE_CINEMATIC.md
// 확장성 원칙: memory/feedback_extensibility_first.md
//
// 모든 전투 타이밍·연출 값은 이 파일 한곳에서 관리.
// 매직 넘버 금지 — 새 연출 추가 시 여기 상수부터.
// CSS 쪽 --bv2-dur-* 는 boot 타임에 이 TIMING 으로 주입 (단일 진실원천).
// ─────────────────────────────────────────────────────────────

(function(global){
  const RoF = global.RoF = global.RoF || {};

  // ── 기능 플래그 (수직 슬라이스 토글) ────────────────────────
  RoF.FEATURE = RoF.FEATURE || {};
  // 2026-04-14: 개발 단계 — 수직 슬라이스 확인용으로 일시 ON.
  // 릴리스 전 false 로 원복 필요.
  if(RoF.FEATURE.CINEMATIC_BATTLE == null) RoF.FEATURE.CINEMATIC_BATTLE = true;

  // ── 속도 배수 + beat 유틸 ────────────────────────────────────
  const Battle = RoF.Battle = RoF.Battle || {};
  Battle.SPEED = Battle.SPEED || 1;   // 1 | 2 | 4 (화이트리스트)
  Battle.VALID_SPEEDS = [1, 2, 4];

  // 속도 배수 반응. 일반 연출 대기용.
  Battle.beat = function(ms){
    return new Promise(function(resolve){
      setTimeout(resolve, Math.max(1, Math.floor(ms / (Battle.SPEED || 1))));
    });
  };

  // 속도 배수 무시 (wall-clock 고정). 히트스톱 등 "절대 타이밍" 용.
  // SPEED 전역을 건드리지 않아 다른 코루틴과 격리됨.
  Battle.beatRaw = function(ms){
    return new Promise(function(resolve){
      setTimeout(resolve, Math.max(1, Math.floor(ms)));
    });
  };

  Battle.setSpeed = function(s){
    if(Battle.VALID_SPEEDS.indexOf(s) < 0) return false;
    Battle.SPEED = s;
    // state.speed 미러링 — Battle.SPEED 가 Source of Truth, state.speed 는 observer 편의.
    // Battle.state 는 60_turnbattle_v2.js 에서 정의되므로 로드 순서 안전 가드 필수.
    if(Battle.state) Battle.state.speed = s;
    if(typeof document !== 'undefined' && document.documentElement){
      document.documentElement.style.setProperty('--battle-speed', String(s));
    }
    return true;
  };

  // ── 연출 타이밍 상수 (ms) — 기본 1x 기준 ────────────────────
  // 2026-04-29: 시네마틱 임팩트 절대값 회복 — 핵심 4개 절대값 상향.
  // 빠르게 진행하고 싶은 유저는 게임 내 속도 UI(×1/×2/×4) 로 토글.
  // 이전 값: CHAR_FOCUS_IN 350, FIRE_TRAVEL 450, HIT_SHAKE 350, BETWEEN_ACTION 250.
  Battle.TIMING = {
    CHAR_FOCUS_IN:  500,        // 350 → 500 (시전자 인지 시간 확보)
    CHAR_FOCUS_OUT: 250,
    SKILL_ROW_IN:   300,
    SKILL_HOVER:    180,
    TARGET_PREVIEW: 200,
    FIRE_TRAVEL:    700,        // 450 → 700 (발사체 임팩트)
    HIT_SHAKE:      550,        // 350 → 550 (피격 인지)
    HP_ROLL:        400,
    DEATH_OUT:      800,
    HIT_STOP:       300,        // beatRaw 로 사용 — 속도 배수 무시
    CRIT_POP:       400,        // CSS bv2CritPop 과 동기화
    ROUND_END:      600,
    BETWEEN_ACTION: 450,        // 250 → 450 (다음 액션까지 호흡)
  };

  // ── 레이아웃 상수 (CSS 와 연동) ──────────────────────────────
  Battle.LAYOUT = {
    CARD_BASE_W: 110,
    CARD_BASE_H: 160,
    CARD_FOCUS_SCALE: 2.5,
    CARD_HOVER_SCALE: 1.2,
  };

  // ── 9개 서브스크린 열거형 ────────────────────────────────────
  // 문자열 리터럴 대신 이 상수만 사용. 오타 시 ReferenceError 로 조기 발견.
  Battle.SCREEN = Object.freeze({
    QUEUEING:       'battle-queueing',
    IDLE:           'battle-idle',
    CHAR_FOCUS:     'battle-char-focus',
    SKILL_ACTIVE:   'battle-skill-active',
    TARGET_PREVIEW: 'battle-target-preview',
    ACTION_FIRE:    'battle-action-fire',
    HIT_REACT:      'battle-hit-react',
    DEATH:          'battle-death',
    ROUND_END:      'battle-round-end',
  });

  // screen id → phase 문자열 매핑 (네이밍 규약 의존 제거)
  Battle.SCREEN_TO_PHASE = Object.freeze({
    'battle-queueing':       'queueing',
    'battle-idle':           'idle',
    'battle-char-focus':     'char-focus',
    'battle-skill-active':   'skill-active',
    'battle-target-preview': 'target-preview',
    'battle-action-fire':    'action-fire',
    'battle-hit-react':      'hit-react',
    'battle-death':          'death',
    'battle-round-end':      'round-end',
  });

  Battle.SUB_SCREENS = Object.values(Battle.SCREEN);

  // phase 열거형 (cancelOne 같은 데이터 테이블용)
  Battle.PHASE = Object.freeze({
    QUEUEING:       'queueing',
    IDLE:           'idle',
    CHAR_FOCUS:     'char-focus',
    SKILL_ACTIVE:   'skill-active',
    TARGET_PREVIEW: 'target-preview',
    ACTION_FIRE:    'action-fire',
    HIT_REACT:      'hit-react',
    DEATH:          'death',
    ROUND_END:      'round-end',
  });

  // ── 원소 상성 테이블 (공용 데이터) ───────────────────────────
  // 4원소 순환(물→불→땅→전기→물) + 빛↔어둠 상호.
  // 단일 필드 strong 만. 역방향(0.77) 은 elementMult 가 자동 판정.
  // holy/dark 는 양쪽 다 서로를 strong 으로 가져 "상호 강함" 자동 표현
  // (elementMult 가 정방향 check 를 먼저 하므로 역방향 0.77 분기는 자연 우회).
  RoF.Data = RoF.Data || {};
  RoF.Data.ELEMENTS = Object.freeze({
    water:     { strong: 'fire' },
    fire:      { strong: 'earth' },
    earth:     { strong: 'lightning' },
    lightning: { strong: 'water' },
    holy:      { strong: 'dark' },
    dark:      { strong: 'holy' },
  });

  // ── CSS duration 변수 주입 (TIMING 단일 진실원천) ────────────
  // 플래그와 무관하게 boot 타임에 실행 — JS 상수가 바뀌면 CSS 도 따라감.
  if(typeof document !== 'undefined' && document.documentElement){
    const ds = document.documentElement.style;
    const set = function(k, v){ ds.setProperty(k, v + 'ms'); };
    set('--bv2-dur-focus-in',  Battle.TIMING.CHAR_FOCUS_IN);
    set('--bv2-dur-focus-out', Battle.TIMING.CHAR_FOCUS_OUT);
    set('--bv2-dur-hover',     Battle.TIMING.SKILL_HOVER);
    set('--bv2-dur-fire',      Battle.TIMING.FIRE_TRAVEL);
    set('--bv2-dur-shake',     Battle.TIMING.HIT_SHAKE);
    set('--bv2-dur-death',     Battle.TIMING.DEATH_OUT);
    set('--bv2-dur-crit-pop',  Battle.TIMING.CRIT_POP);
  }

  if(typeof module !== 'undefined' && module.exports){
    module.exports = { Battle: RoF.Battle, FEATURE: RoF.FEATURE };
  }
})(typeof window !== 'undefined' ? window : globalThis);
