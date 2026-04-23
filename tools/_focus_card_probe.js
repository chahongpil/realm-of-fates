const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
  await p.goto('http://localhost:8765/index.html?mute=1');
  await p.waitForTimeout(700);
  await p.evaluate(() => UI.show('login-screen'));
  await p.fill('#login-id','fc_probe'); await p.fill('#login-pw','1234');
  await p.evaluate(() => Auth.login()); await p.waitForTimeout(700);
  const msg = await p.evaluate(()=>(document.getElementById('login-msg')||{}).textContent||'');
  if(msg.trim()){
    await p.evaluate(() => UI.show('signup-screen'));
    await p.fill('#signup-id','fc_probe'); await p.fill('#signup-pw','1234'); await p.fill('#signup-pw2','1234');
    await p.evaluate(() => Auth.signup()); await p.waitForTimeout(1500);
  }
  await p.evaluate(() => {
    const hero = RoF.Data.createHero({ gender:'m', role:'warrior', element:'fire', skinIndex:0 });
    hero.uid='h'; hero.isHero=true; hero.level=1; hero.maxHp=hero.hp; hero.currentHp=hero.hp; hero.shield=0;
    Game.deck = Game.deck || [];
    if(!Game.deck.find(c=>c.isHero||c._isHero)) Game.deck.push(hero);
    UNITS.filter(u=>u.rarity==='bronze').slice(0,3).forEach((u,i)=>{
      Game.deck.push(Object.assign({},u,{uid:'u'+i,level:1,equips:[],maxHp:u.hp,currentHp:u.hp,shield:0}));
    });
    Game.persist && Game.persist();
  });
  await p.evaluate(() => Game.showMenu && Game.showMenu()); await p.waitForTimeout(300);
  await p.evaluate(() => Game.startBattle && Game.startBattle()); await p.waitForTimeout(400);
  await p.evaluate(() => {
    const h = Game.deck.find(c=>c.isHero);
    Game.selectedForBattle = [h.uid].concat(Game.deck.filter(c=>!c.isHero).slice(0,3).map(c=>c.uid));
    Game.selectedRelics = [];
    Game.renderCardSelect && Game.renderCardSelect();
  });
  await p.waitForTimeout(150);
  await p.evaluate(() => Game.confirmCardSelect && Game.confirmCardSelect());
  await p.waitForTimeout(500);
  for(let i=0;i<30;i++){
    await p.waitForTimeout(200);
    const r = await p.evaluate(() => {
      const m = document.getElementById('match-screen');
      if(!m||m.offsetParent===null) return false;
      return Array.from(m.querySelectorAll('button, .btn')).some(b=>(b.textContent||'').indexOf('출전!')>=0);
    });
    if(r) break;
  }
  await p.evaluate(() => {
    const chul = Array.from(document.querySelectorAll('#match-screen button, #match-screen .btn')).find(b=>(b.textContent||'').indexOf('출전!')>=0);
    if(chul) chul.click();
  });
  await p.waitForTimeout(3500);
  // 아군 카드 클릭 → focus 확대
  const clicked = await p.evaluate(() => {
    const ally = document.querySelector('.card-v4-compact.bv2-card-ally');
    if(!ally) return { err:'no ally' };
    ally.click();
    return { ok:true };
  });
  console.log('click:', JSON.stringify(clicked));
  await p.waitForTimeout(800);
  const dump = await p.evaluate(() => {
    const bcfMain = document.querySelector('#battle-char-focus .bcf-main-card');
    const card = bcfMain ? bcfMain.querySelector('.card-v4') : null;
    if(!card) return { error:'no focus card' };
    const cr = card.getBoundingClientRect();
    const bars = card.querySelector('.bars');
    const topRow = card.querySelector('.top-row');
    const parch = card.querySelector('.parch');
    const barsR = bars ? bars.getBoundingClientRect() : null;
    const topR = topRow ? topRow.getBoundingClientRect() : null;
    const parchR = parch ? parch.getBoundingClientRect() : null;
    return {
      cardClasses: card.className,
      hasCompact: card.classList.contains('card-v4-compact'),
      cardSize: { w: Math.round(cr.width), h: Math.round(cr.height) },
      barsDisplay: bars ? getComputedStyle(bars).display : 'no bars',
      barsRelY: barsR ? Math.round(barsR.top - cr.top) : null,
      topRowRelY: topR ? Math.round(topR.top - cr.top) : null,
      parchRelY: parchR ? Math.round(parchR.top - cr.top) : null,
    };
  });
  console.log('FOCUS:', JSON.stringify(dump, null, 2));
  await p.screenshot({ path: 'c:/work/game/shots/focus_card_compact.png' });
  await b.close();
})();
