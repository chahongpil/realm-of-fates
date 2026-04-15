// 종단 테스트: v2 전투 → 리워드 화면 인계
// 블로커 #4 검증 — HP 역동기화 + Game.showBattleEnd 호출 경로
const { chromium } = require('playwright');
const path = require('path');

(async function(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g,'/');
  page.on('console', msg => {
    const t = msg.type();
    if(t === 'error' || t === 'warning') console.log('['+t+']', msg.text());
  });
  await page.goto(url);
  await page.waitForTimeout(500);

  // 로그인
  await page.evaluate(() => {
    try { Auth.signup('_v2reward','1234'); } catch(e){}
    try { Auth.login ('_v2reward','1234'); } catch(e){}
  });
  await page.waitForTimeout(300);

  // 골드 초기값 기록 + 합성 bs 진입
  const before = await page.evaluate(() => {
    const G = window.Game, UNITS = window.RoF.Data.UNITS;
    const pick = (id) => UNITS.find(u=>u.id===id);
    const heroCard = { ...pick('h_m_fire'), uid:'p_h', isHero:true, level:3 };
    const ally1    = { ...pick('h_r_water'), uid:'p_1', level:2 };
    const ally2    = { ...pick('h_s_holy'),  uid:'p_2', level:2 };

    // Game.deck 에 참여자 주입 (XP/honor 분배가 실제로 돌아가도록)
    G.deck = [heroCard, ally1, ally2];
    G.gold = 100;
    G.leaguePoints = 50;

    const wrap = (c, side) => ({
      ...c, currentHp:c.hp, maxBHp:c.hp, side,
      row: c.range==='melee'?'front':'back',
      frozen:0, poisoned:0, revived:false, invincible:0,
      curNrg:0, curShield:0, burn:0,
    });
    const enemyHero = { ...pick('h_m_dark'), uid:'e_h', isHero:true, level:3 };
    const enemy1    = { ...pick('h_r_fire'), uid:'e_1', level:2 };

    const bs = {
      currentRound: 1,
      pCards: [wrap(heroCard,'player'), wrap(ally1,'player'), wrap(ally2,'player')],
      eCards: [wrap(enemyHero,'enemy'), wrap(enemy1,'enemy')],
      battleRelics: [],
      battleDeck: [heroCard, ally1, ally2],
    };
    G.battleState = bs;
    const ok = window.RoF.Battle.startFromLegacyBS(bs);
    return { ok: ok !== false, gold: G.gold, lp: G.leaguePoints, wins: G.totalWins || 0 };
  });
  console.log('before:', before);
  await page.waitForTimeout(400);

  // === 시나리오 1: 승리 판정 ===
  // 적 영웅 HP 0으로 세팅 → getBattleResult/handoffToReward 직접 호출
  const victoryResult = await page.evaluate(async () => {
    const B = window.RoF.Battle;
    const G = window.Game;
    const enemyHero = B.DEMO.enemies.find(u=>u.isHero);
    if(enemyHero) enemyHero.currentHp = 0;

    const res = B.getBattleResult();
    // HP 역동기화 확인
    B.syncHpToLegacy();
    const legacyEnemy = G.battleState.eCards.find(c=>c.isHero);
    const syncedHp = legacyEnemy ? legacyEnemy.currentHp : null;

    // 실제 핸드오프
    B._handoffToReward(res);

    // UI.show('reward-screen') 이 실제로 일어났는지
    const rs = document.getElementById('reward-screen');
    const rewardVisible = rs ? getComputedStyle(rs).display !== 'none' : false;
    const titleEl = document.getElementById('rew-title');
    const title = titleEl ? titleEl.textContent : null;

    const bvContainer = document.getElementById('battle-v2-container');
    const bvHidden = bvContainer ? getComputedStyle(bvContainer).display === 'none' : true;

    return {
      result: res,
      syncedHp,
      rewardVisible,
      title,
      bvHidden,
      goldAfter: G.gold,
      lpAfter: G.leaguePoints,
      winsAfter: G.totalWins || 0,
    };
  });
  console.log('victory:', victoryResult);

  const out = path.resolve(__dirname, '..', 'shots', 'v2_reward_victory.png');
  await page.screenshot({ path: out, fullPage: false });
  console.log('saved:', out);

  // === 검증 ===
  const checks = [];
  const check = (cond, name) => { checks.push({ name, pass: !!cond }); };
  check(before.ok, 'startFromLegacyBS 진입');
  check(victoryResult.result === 'victory', 'getBattleResult=victory');
  check(victoryResult.syncedHp === 0, 'HP 역동기화 (syncedHp=0)');
  check(victoryResult.rewardVisible, 'reward-screen 표시');
  check(victoryResult.title && victoryResult.title.indexOf('승전') >= 0, 'title=승전');
  check(victoryResult.bvHidden, 'battle-v2-container 닫힘');
  check(victoryResult.goldAfter === before.gold + 10, 'gold +10');
  check(victoryResult.lpAfter === before.lp + 15, 'leaguePoints +15');

  console.log('\n── 검증 결과 ──');
  let passed = 0;
  checks.forEach(c => {
    console.log((c.pass ? '✅' : '❌') + ' ' + c.name);
    if(c.pass) passed++;
  });
  console.log(`\n${passed}/${checks.length} passed`);

  await browser.close();
  process.exit(passed === checks.length ? 0 : 1);
})();
