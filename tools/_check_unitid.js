const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport:{width:1280,height:720} })).newPage();
  await p.goto('http://localhost:8765/index.html?mute=1');
  await p.waitForTimeout(600);
  await p.evaluate(() => UI.show('login-screen'));
  await p.fill('#login-id','art_audit'); await p.fill('#login-pw','1234');
  await p.evaluate(() => Auth.login()); await p.waitForTimeout(800);
  await p.evaluate(() => {
    const hero = RoF.Data.createHero({ gender:'m', role:'warrior', element:'fire', skinIndex:0 });
    hero.uid='my_hero_001'; hero.isHero=true; hero.level=1; hero.maxHp=hero.hp; hero.currentHp=hero.hp; hero.shield=0;
    Game.deck = Game.deck || [];
    if(!Game.deck.find(c=>c.isHero)) Game.deck.push(hero);
    const pool = UNITS.filter(u=>u.rarity==='bronze').slice(0,3);
    pool.forEach((u,i) => {
      const inst = Object.assign({},u,{ uid:'u_'+i+'_'+Math.random().toString(36).slice(2,7), level:1,equips:[],maxHp:u.hp,currentHp:u.hp,shield:0 });
      if(!Game.deck.find(c=>c.uid===inst.uid)) Game.deck.push(inst);
    });
    Game.persist && Game.persist();
  });
  await p.evaluate(() => Game.showMenu && Game.showMenu());
  await p.waitForTimeout(300);
  await p.evaluate(() => Game.startBattle && Game.startBattle());
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    const h = Game.deck.find(c=>c.isHero);
    const nh = Game.deck.filter(c=>!c.isHero).slice(0,3);
    Game.selectedForBattle = [h&&h.uid].concat(nh.map(c=>c.uid)).filter(Boolean);
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
      const btns = Array.from(m.querySelectorAll('button, .btn'));
      return btns.some(b=>(b.textContent||'').indexOf('출전!')>=0);
    });
    if(r) break;
  }
  await p.evaluate(() => {
    const m = document.getElementById('match-screen');
    const chul = Array.from(m.querySelectorAll('button, .btn')).find(b=>(b.textContent||'').indexOf('출전!')>=0);
    if(chul) chul.click();
  });
  await p.waitForTimeout(3500);
  const dump = await p.evaluate(() => {
    const st = RoF.Battle && RoF.Battle.STATE;
    const units = (st?.allies||[]).concat(st?.enemies||[]);
    return units.slice(0,3).map(u => ({
      id: u.id,
      unitId: u.unitId,
      uid: u.uid,
      name: u.name,
      imgKey: u.imgKey,
      isHero: u.isHero,
      _isHero: u._isHero,
      skinKey: u.skinKey,
      cardImgLookup: (RoF.Data && RoF.Data.CARD_IMG) ? {
        byId: RoF.Data.CARD_IMG[u.id] || null,
        byUnitId: RoF.Data.CARD_IMG[u.unitId] || null,
        byImgKey: RoF.Data.CARD_IMG[u.imgKey] || null,
        bySkinKey: RoF.Data.CARD_IMG[u.skinKey] || null
      } : null
    }));
  });
  console.log(JSON.stringify(dump, null, 2));
  await b.close();
})();
