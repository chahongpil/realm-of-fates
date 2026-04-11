'use strict';

// 99_bootstrap.js — 초기화 통합 (Phase 5 / Section 06)
//
// 원래 index.html 에 분산되어 있던 초기화 코드를 한 파일로 통합:
//   - Enter 키 바인딩 (login-pw, signup-pw2)
//   - 자동 로그인 복원 (rof8_last_user, rof8_last_pw)
//   - 볼륨 복원 (rof8_vol → SFX.vol, UI)
//   - UI.show 몽키패칭 (title-screen 진입 시 FX.initTitle)
//   - 초기 FX 시작 setTimeout
//   - Sanity check: 모든 핵심 모듈 로드 검증
//
// 이 파일은 반드시 defer 체인의 **마지막**에 로드되어야 한다.
//
// 네이밍 규칙:
//   - 모듈 코드 내부: `RoF.X` (네임스페이스 경유)
//   - 인라인 HTML onclick 핸들러: 전역 `X` (window.X = RoF.X 호환 shim)
//   이 파일은 모듈 코드이므로 RoF.Auth/SFX/UI/FX 형태로 접근한다.

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. Enter 키 바인딩 ──
  const loginPw = document.getElementById('login-pw');
  if (loginPw) {
    loginPw.addEventListener('keydown', e => { if (e.key === 'Enter') RoF.Auth.login(); });
  }
  const signupPw2 = document.getElementById('signup-pw2');
  if (signupPw2) {
    signupPw2.addEventListener('keydown', e => { if (e.key === 'Enter') RoF.Auth.signup(); });
  }

  // ── 2. 마지막 로그인 정보 자동 입력 ──
  const u = localStorage.getItem('rof8_last_user');
  const p = localStorage.getItem('rof8_last_pw');
  if (u) {
    const el = document.getElementById('login-id');
    if (el) el.value = u;
  }
  if (p) {
    const el = document.getElementById('login-pw');
    if (el) el.value = p;
  }

  // ── 3. 볼륨 복원 ──
  const sv = localStorage.getItem('rof8_vol');
  if (sv != null) {
    const v = parseInt(sv, 10);
    if (Number.isFinite(v) && v >= 0 && v <= 100) {
      const slider = document.getElementById('vol-slider');
      const display = document.getElementById('vol-display');
      const toggle = document.getElementById('sound-toggle');
      if (slider) slider.value = v;
      if (display) display.textContent = v;
      RoF.SFX.vol = v / 100;
      if (toggle) toggle.textContent = v === 0 ? '🔇' : v < 30 ? '🔉' : '🔊';
    }
  }

  // ── 4. UI.show 몽키패칭 (title-screen 진입 시 FX.initTitle) ──
  const _origShow = RoF.UI.show;
  RoF.UI.show = function(id) {
    _origShow.call(this, id);
    if (id === 'title-screen') setTimeout(() => RoF.FX.initTitle(), 200);
    else RoF.FX.destroy();
  };

  // ── 5. 초기 FX 시작 ──
  setTimeout(() => RoF.FX.initTitle(), 500);

  // ── 6. Sanity check: 모든 핵심 모듈이 로드되었는지 검증 ──
  const EXPECTED = [
    'RoF.Data.UNITS', 'RoF.Data.SKILLS', 'RoF.Data.RELICS',
    'RoF.SFX', 'RoF.UI', 'RoF.Auth', 'RoF.Game',
    'RoF.TurnBattle', 'RoF.Formation', 'RoF.FX',
  ];
  const missing = EXPECTED.filter(path =>
    !path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), window)
  );
  if (missing.length > 0) {
    console.error('[RoF] 로드 누락:', missing);
  } else if (RoF.__gameKeyError) {
    console.error('[RoF] Game 객체 중복 키 감지됨 — 콘솔 위 로그 확인');
  } else {
    console.log('[RoF] 모든 모듈 로드 완료 (Game keys:', Object.keys(RoF.Game).length + ')');
  }
});
