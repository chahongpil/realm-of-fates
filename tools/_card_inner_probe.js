const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
  await p.goto('http://localhost:8765/index.html?mute=1');
  await p.waitForTimeout(700);
  await p.evaluate(() => UI.show('login-screen'));
  await p.fill('#login-id','probe'); await p.fill('#login-pw','1234');
  await p.evaluate(() => Auth.login()); await p.waitForTimeout(700);
  const msg = await p.evaluate(()=>(document.getElementById('login-msg')||{}).textContent||'');
  if(msg.trim()){
    await p.evaluate(() => UI.show('signup-screen'));
    await p.fill('#signup-id','probe'); await p.fill('#signup-pw','1234'); await p.fill('#signup-pw2','1234');
    await p.evaluate(() => Auth.signup()); await p.waitForTimeout(1500);
  }
  await p.evaluate(() => {
    Game.buildings = Game.buildings || { gate:1,library:1,forge:1,tavern:1,shop:1,church:1,training:1,castle:1 };
    const hero = RoF.Data.createHero({ gender:'m', role:'warrior', element:'fire', skinIndex:0 });
    hero.uid='h'; hero.isHero=true; hero.level=1; hero.maxHp=hero.hp; hero.currentHp=hero.hp; hero.shield=0;
    Game.deck = [hero].concat(UNITS.filter(u=>u.rarity==='bronze').slice(0,3).map((u,i)=>Object.assign({},u,{uid:'u'+i,level:1,equips:[],maxHp:u.hp,currentHp:u.hp,shield:0})));
    Game.persist && Game.persist();
  });
  await p.evaluate(() => Game.showMenu && Game.showMenu());
  await p.waitForTimeout(300);
  await p.evaluate(() => Game.startBattle && Game.startBattle());
  await p.waitForTimeout(300);
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
  const dump = await p.evaluate(() => {
    const card = document.querySelector('.card-v4-compact');
    if(!card) return {error:'no card'};
    const cr = card.getBoundingClientRect();
    const inner = {};
    ['.bars','.bar','.top','.top-row','.name-box','.lv-box','.name','.lv','.art','.parch','.gild'].forEach(sel => {
      const els = card.querySelectorAll(sel);
      if(els.length){
        inner[sel] = Array.from(els).slice(0,2).map(el => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            relY: Math.round(r.top - cr.top),
            relX: Math.round(r.left - cr.left),
            w: Math.round(r.width),
            h: Math.round(r.height),
            position: cs.position,
            top: cs.top,
            display: cs.display,
          };
        });
      }
    });
    return { cardSize: {w:Math.round(cr.width), h:Math.round(cr.height)}, inner };
  });
  console.log(JSON.stringify(dump, null, 2));
  await b.close();
})();
