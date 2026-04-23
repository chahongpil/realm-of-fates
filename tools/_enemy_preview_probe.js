const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8765/index.html?mute=1');
  await p.waitForTimeout(700);
  await p.evaluate(() => UI.show('login-screen'));
  await p.fill('#login-id','ep_probe'); await p.fill('#login-pw','1234');
  await p.evaluate(() => Auth.login()); await p.waitForTimeout(700);
  const msg = await p.evaluate(()=>(document.getElementById('login-msg')||{}).textContent||'');
  if(msg.trim()){
    await p.evaluate(() => UI.show('signup-screen'));
    await p.fill('#signup-id','ep_probe'); await p.fill('#signup-pw','1234'); await p.fill('#signup-pw2','1234');
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
    const r = await p.evaluate(() => Array.from(document.querySelectorAll('#match-screen button, #match-screen .btn')).some(b=>(b.textContent||'').indexOf('출전!')>=0));
    if(r) break;
  }
  await p.evaluate(() => {
    const chul = Array.from(document.querySelectorAll('#match-screen button, #match-screen .btn')).find(b=>(b.textContent||'').indexOf('출전!')>=0);
    if(chul) chul.click();
  });
  await p.waitForTimeout(3500);
  // 적 카드 클릭 (스킬 미선택 상태)
  const click = await p.evaluate(() => {
    const enemy = document.querySelector('.card-v4-compact.bv2-card-enemy');
    if(!enemy) return { err:'no enemy' };
    enemy.click();
    return { ok:true, selectedSkill: (RoF.Battle&&RoF.Battle.state)?!!RoF.Battle.state.selectedSkill:null };
  });
  console.log('CLICK:', JSON.stringify(click));
  await p.waitForTimeout(500);
  const dump = await p.evaluate(() => {
    const sub = document.getElementById('battle-enemy-preview');
    const active = sub && sub.classList.contains('active');
    const card = sub?.querySelector('.card-v4');
    if(!card) return { active, error:'no card' };
    const cr = card.getBoundingClientRect();
    const desc = card.querySelector('.desc');
    return {
      active,
      cardClasses: card.className,
      size: { w:Math.round(cr.width), h:Math.round(cr.height) },
      descVisible: desc ? getComputedStyle(desc).display : 'no desc',
      descText: desc ? desc.textContent.slice(0,50) : null,
    };
  });
  console.log('PREVIEW:', JSON.stringify(dump, null, 2));
  await p.screenshot({ path: 'c:/work/game/shots/enemy_preview_open.png' });
  // 닫기 테스트
  await p.evaluate(() => {
    const bd = document.querySelector('#battle-enemy-preview .bep-backdrop');
    if(bd) bd.click();
  });
  await p.waitForTimeout(300);
  const closed = await p.evaluate(() => !document.getElementById('battle-enemy-preview').classList.contains('active'));
  console.log('CLOSED:', closed);
  console.log('ERRORS:', errs.length, errs.slice(0,3));
  await b.close();
})();
