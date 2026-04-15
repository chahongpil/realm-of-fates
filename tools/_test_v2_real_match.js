// 종단 테스트: 실제 매칭 경로 → v2 어댑터 → 1 전투 완주 → 리워드 화면
// 합성 bs 가 아니라 Auth.signup → confirmHero → startBattleFromMatch → launchBattle 전체 경로.
// 블로커 #1/#2/#3/#4 엣지케이스 동시 검증.
const { chromium } = require('playwright');
const path = require('path');

(async function(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g,'/');
  const logs = [];
  page.on('console', msg => {
    const t = msg.type();
    if(t === 'error' || t === 'warning') logs.push('['+t+'] '+msg.text());
  });
  page.on('pageerror', err => logs.push('[pageerror] ' + err.message));
  await page.goto(url);
  await page.waitForTimeout(500);

  // 1) 신규 유저 가입 + 영웅 확정
  const signupInfo = await page.evaluate(() => {
    const user = '_v2real_' + Date.now();
    try { Auth.signup(user, '1234'); } catch(e){ return { err: 'signup: '+e.message }; }
    Auth.user = user;  // confirmHero 내부가 this.user 를 읽음
    Auth._selRole    = 'melee';
    Auth._selElement = 'fire';
    try { Auth.confirmHero(); } catch(e){ return { err: 'confirmHero: '+e.message }; }
    return {
      user,
      deckCount: Game.deck.length,
      heroName: (Game.deck.find(c=>c.isHero) || {}).name,
      ids: Game.deck.map(c=>c.id),
    };
  });
  console.log('signup:', signupInfo);
  if(signupInfo.err){ throw new Error(signupInfo.err); }
  await page.waitForTimeout(300);

  // 2) 매칭 경로 — startBattleFromMatch 가 bs 를 빌드하고 launchBattle 호출
  // launchBattle 내부에 우리 v2 게이트가 있음. 성공하면 battle-v2-container 표시됨.
  const enter = await page.evaluate(() => {
    // 매칭 UI 스킵 — 직접 선택 세팅
    const hero = Game.deck.find(c=>c.isHero);
    const others = Game.deck.filter(c=>!c.isHero && !c.injured);
    Game.selectedForBattle = [hero.uid, ...others.map(c=>c.uid)];
    Game.selectedRelics = [];
    try {
      Game.startBattleFromMatch();
    } catch(e){ return { err: 'startBattleFromMatch: '+e.message, stack: e.stack }; }

    const bv = document.getElementById('battle-v2-container');
    const bvVisible = bv ? getComputedStyle(bv).display !== 'none' : false;
    return {
      bvVisible,
      isRealBattle: bv ? bv.classList.contains('is-real-battle') : false,
      allyCount: (RoF.Battle.DEMO.allies || []).length,
      enemyCount: (RoF.Battle.DEMO.enemies || []).length,
      allyNames: (RoF.Battle.DEMO.allies || []).map(u=>u.name),
      enemyNames: (RoF.Battle.DEMO.enemies || []).map(u=>u.name),
      firstAllySkills: (RoF.Battle.getSkillsOf(RoF.Battle.DEMO.allies[0]) || []).map(s=>s.name),
      bsPCards: Game.battleState.pCards.length,
      bsECards: Game.battleState.eCards.length,
      timerPresent: !!document.getElementById('bv2-queue-timer'),
      demoBtnHidden: (() => {
        const d = document.querySelector('.bi-demo-btn');
        return d ? getComputedStyle(d).display === 'none' : true;
      })(),
    };
  });
  console.log('enter:', enter);
  if(enter.err){ console.error(enter.stack); throw new Error(enter.err); }

  const shotEnter = path.resolve(__dirname, '..', 'shots', 'v2_real_match_enter.png');
  await page.screenshot({ path: shotEnter });
  console.log('saved:', shotEnter);

  // 3) 자동 전투 실행 — Battle.onAutoBattle 은 라운드 1회 돌고 종료 판정.
  // 승패 안 나면 적 영웅 HP 를 직접 0 으로 만들어 강제 승리.
  const roundLoop = await page.evaluate(async () => {
    const B = RoF.Battle;
    let iterations = 0;
    let lastPhase = null;
    while(iterations < 5){
      iterations++;
      if(!B.DEMO.enemies || !B.DEMO.enemies.length) break;
      // 자동 전투 호출
      await B.onAutoBattle();
      lastPhase = B.state.phase;
      const result = B.getBattleResult();
      if(result) return { iterations, result, phase: lastPhase };
      // 안 끝나면 강제 종결 위해 적 영웅 HP 를 반 깎음
      const eh = B.DEMO.enemies.find(u=>u.isHero);
      if(eh) eh.currentHp = Math.max(0, Math.floor(eh.currentHp * 0.4));
    }
    return { iterations, result: B.getBattleResult(), phase: lastPhase };
  });
  console.log('roundLoop:', roundLoop);

  await page.waitForTimeout(600);

  // 4) 리워드 화면 도달 여부
  const after = await page.evaluate(() => {
    const rs = document.getElementById('reward-screen');
    const rewardVisible = rs ? getComputedStyle(rs).display !== 'none' : false;
    const title = (document.getElementById('rew-title') || {}).textContent || null;
    const bv = document.getElementById('battle-v2-container');
    const bvHidden = bv ? getComputedStyle(bv).display === 'none' : true;
    // _legacyBS 는 Battle 에 보관되어 있으므로 그쪽에서 역동기화 결과 확인
    const legacyBS = RoF.Battle._legacyBS;
    const legacyEnemyHero = legacyBS && legacyBS.eCards ? legacyBS.eCards.find(c=>c.isHero) : null;
    return {
      rewardVisible, title, bvHidden,
      gold: Game.gold, lp: Game.leaguePoints, wins: Game.totalWins || 0,
      enemyHeroHpInBs: legacyEnemyHero ? legacyEnemyHero.currentHp : null,
      legacyBSPresent: !!legacyBS,
    };
  });
  console.log('after:', after);

  const shotReward = path.resolve(__dirname, '..', 'shots', 'v2_real_match_reward.png');
  await page.screenshot({ path: shotReward });
  console.log('saved:', shotReward);

  // === 검증 ===
  const checks = [];
  const check = (cond, name) => checks.push({ name, pass: !!cond });
  check(signupInfo.deckCount >= 3,           '신규 유저 덱 3장 이상 (hero+companion+titan)');
  check(enter.bvVisible,                     'v2 container 표시됨');
  check(enter.isRealBattle,                  'is-real-battle 클래스 부여');
  check(enter.allyCount >= 1,                '아군 1명 이상');
  check(enter.enemyCount >= 1,               '적군 1명 이상');
  check(enter.bsPCards === enter.allyCount,  '아군 pCards → v2 allies 동일 수');
  check(enter.bsECards === enter.enemyCount, '적군 eCards → v2 enemies 동일 수');
  check(enter.firstAllySkills.length === 2,  '첫 아군 스킬 2장 (기본+시그니처)');
  check(enter.firstAllySkills.indexOf('기본 공격') >= 0, '기본 공격 포함');
  check(enter.timerPresent,                  '큐잉 타이머 DOM 존재');
  check(enter.demoBtnHidden,                 'dev 데모 버튼 숨김');
  check(roundLoop.result === 'victory' || roundLoop.result === 'defeat', '전투 결과 확정');
  check(after.rewardVisible,                 '리워드 화면 표시');
  check(after.bvHidden,                      'v2 container 닫힘');
  check(after.title && (after.title.indexOf('승전') >= 0 || after.title.indexOf('패전') >= 0), '리워드 타이틀 출력');
  check(after.enemyHeroHpInBs != null,       'HP 역동기화 완료 (bs.eCards 에 currentHp)');

  console.log('\n── 검증 결과 ──');
  let passed = 0;
  checks.forEach(c => {
    console.log((c.pass ? '✅' : '❌') + ' ' + c.name);
    if(c.pass) passed++;
  });
  console.log(`\n${passed}/${checks.length} passed`);

  if(logs.length){
    console.log('\n── 콘솔 경고/에러 ──');
    logs.slice(0, 20).forEach(l => console.log(l));
  }

  await browser.close();
  process.exit(passed === checks.length ? 0 : 1);
})();
