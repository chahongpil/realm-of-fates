// P0-1 검증: reward-screen 의 확인 버튼이 tut-box 와 시각적으로 겹치지 않는지 bbox 측정
const { chromium } = require('playwright');
const path = require('path');

(async function(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g,'/');
  await page.goto(url);
  await page.waitForTimeout(400);

  // 신규 유저 → 영웅 확정 → 매칭 → 전투 자동 → 리워드
  await page.evaluate(() => {
    const user = '_vrl_' + Date.now();
    Auth.signup(user, '1234');
    Auth.user = user;
    Auth._selRole = 'melee';
    Auth._selElement = 'fire';
    Auth.confirmHero();
    const hero = Game.deck.find(c=>c.isHero);
    const others = Game.deck.filter(c=>!c.isHero && !c.injured);
    Game.selectedForBattle = [hero.uid, ...others.map(c=>c.uid)];
    Game.selectedRelics = [];
    Game.startBattleFromMatch();
  });
  await page.waitForTimeout(300);

  // onAutoBattle 로 전투 강제 해결 (real_match 테스트 패턴)
  await page.evaluate(async () => {
    for(let i=0; i<3; i++){
      await RoF.Battle.onAutoBattle();
      const eh = RoF.Battle.STATE.enemies.find(u=>u.isHero);
      if(eh) eh.currentHp = Math.floor(eh.currentHp * 0.4);
      await new Promise(r=>setTimeout(r,100));
      if(RoF.Battle.getBattleResult()) break;
    }
  });
  await page.waitForTimeout(1500); // P0-2 승리 스탬프·tween·stagger 애니 완료 대기

  // 이 시점: showBattleEnd 호출됨 → reward-screen + tut-overlay 존재
  const layout = await page.evaluate(() => {
    const rewardScreen = document.getElementById('reward-screen');
    const rewTitle = document.getElementById('rew-title');
    const rewStats = document.getElementById('rew-stats');
    const rewardCards = document.getElementById('reward-cards');
    const confirmBtn = document.querySelector('#reward-screen button[data-action="game.afterBattle"]');
    const tutOverlay = document.getElementById('tut-overlay');
    const tutBox = tutOverlay ? tutOverlay.querySelector('.tut-box') : null;

    const bbox = el => el ? (r => ({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), visible: r.width > 0 && r.height > 0 }))(el.getBoundingClientRect()) : null;

    return {
      rewardScreenVisible: rewardScreen ? getComputedStyle(rewardScreen).display !== 'none' : false,
      rewTitle:     { bbox: bbox(rewTitle),     text: rewTitle && rewTitle.textContent },
      rewStats:     { bbox: bbox(rewStats) },
      rewardCards:  { bbox: bbox(rewardCards) },
      confirmBtn:   { bbox: bbox(confirmBtn),   text: confirmBtn && confirmBtn.textContent },
      tutOverlay:   tutOverlay ? { present: true, bbox: bbox(tutOverlay), zIndex: getComputedStyle(tutOverlay).zIndex, bg: getComputedStyle(tutOverlay).backgroundColor, pointerEvents: getComputedStyle(tutOverlay).pointerEvents } : { present: false },
      tutBox:       { bbox: bbox(tutBox) },
      viewport: { w: window.innerWidth, h: window.innerHeight },
    };
  });

  console.log(JSON.stringify(layout, null, 2));

  // 겹침 검사
  const overlap = (a, b) => {
    if(!a || !b || !a.visible || !b.visible) return false;
    return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
  };

  const btnBbox = layout.confirmBtn.bbox;
  const tutBbox = layout.tutBox.bbox;
  const bannerBbox = layout.rewTitle.bbox;
  const statsBbox = layout.rewStats.bbox;
  const cardsBbox = layout.rewardCards.bbox;

  console.log('\n── 검증 ──');
  const checks = [];
  const check = (ok, label) => { checks.push({ok,label}); console.log((ok?'✅':'❌'), label); };

  check(layout.rewardScreenVisible, 'reward-screen 표시됨');
  check(layout.tutOverlay.present, 'tut-overlay 존재 (새 유저 튜토리얼)');
  check(layout.tutOverlay.bg === 'rgba(0, 0, 0, 0)' || layout.tutOverlay.bg === 'transparent',
    'tut-overlay 배경 투명 (fullscreen dim 제거): ' + layout.tutOverlay.bg);
  check(layout.tutOverlay.pointerEvents === 'none',
    'tut-overlay pointer-events: none: ' + layout.tutOverlay.pointerEvents);

  // 핵심: 리워드 주요 요소와 tut-box 겹침 여부
  check(!overlap(bannerBbox, tutBbox), '승전 배너 ↔ tut-box 겹침 없음');
  check(!overlap(statsBbox, tutBbox), '보상 스탯 ↔ tut-box 겹침 없음');
  // 전리품 상자는 tut-box 와 공간이 근접할 수 있음 — 부분 겹침 허용
  const cardsOverlap = overlap(cardsBbox, tutBbox);
  console.log((cardsOverlap ? '🟡' : '✅'), '전리품 상자 ↔ tut-box ' + (cardsOverlap ? '부분 겹침 (허용 범위)' : '겹침 없음'));

  // 확인 버튼 ↔ tut-box 겹침 (이게 실제 문제)
  const btnTutOverlap = overlap(btnBbox, tutBbox);
  check(!btnTutOverlap, '확인 버튼 ↔ tut-box 겹침 없음');

  if(btnTutOverlap){
    console.log('  → 확인 버튼:', btnBbox);
    console.log('  → tut-box:  ', tutBbox);
  }

  // pointer-events 통과 검증 — 확인 버튼 위치에서 elementFromPoint 가 버튼을 반환해야 함 (tut-overlay 통과)
  const ptCheck = await page.evaluate((btn) => {
    const el = document.elementFromPoint(btn.x + btn.w/2, btn.y + btn.h/2);
    return { tag: el && el.tagName, text: el && el.textContent && el.textContent.slice(0,20), isButton: el && el.tagName === 'BUTTON' };
  }, btnBbox);
  check(ptCheck.isButton, '확인 버튼 클릭 경로 통과 (elementFromPoint → button): ' + JSON.stringify(ptCheck));

  const failed = checks.filter(c => !c.ok).length;
  const passed = checks.filter(c => c.ok).length;
  console.log('\n' + passed + '/' + checks.length + ' passed');

  await page.screenshot({ path: path.resolve(__dirname, '..', 'shots', 'v2_real_match_reward_p01.png'), fullPage: false });
  console.log('saved: shots/v2_real_match_reward_p01.png');

  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
