const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
  await p.goto('http://localhost:8765/index.html?mute=1');
  await p.waitForTimeout(700);
  await p.evaluate(() => UI.show('login-screen'));
  await p.fill('#login-id','f_probe'); await p.fill('#login-pw','1234');
  await p.evaluate(() => Auth.login()); await p.waitForTimeout(700);
  const msg = await p.evaluate(()=>(document.getElementById('login-msg')||{}).textContent||'');
  if(msg.trim()){
    await p.evaluate(() => UI.show('signup-screen'));
    await p.fill('#signup-id','f_probe'); await p.fill('#signup-pw','1234'); await p.fill('#signup-pw2','1234');
    await p.evaluate(() => Auth.signup()); await p.waitForTimeout(1500);
  }
  // 영웅 + 유닛 넣고 Formation 진입
  await p.evaluate(() => {
    const hero = RoF.Data.createHero({ gender:'m', role:'warrior', element:'fire', skinIndex:0 });
    hero.uid='h1'; hero.isHero=true; hero.level=1; hero.maxHp=hero.hp; hero.currentHp=hero.hp; hero.shield=0;
    Game.deck = Game.deck || [];
    if(!Game.deck.find(c=>c.isHero||c._isHero)) Game.deck.push(hero);
    UNITS.filter(u=>u.rarity==='bronze').slice(0,3).forEach((u,i)=>{
      Game.deck.push(Object.assign({},u,{uid:'u'+i,level:1,equips:[],maxHp:u.hp,currentHp:u.hp,shield:0}));
    });
    Game.persist && Game.persist();
    if(window.Formation && Formation.show) Formation.show();
  });
  await p.waitForTimeout(500);
  const dump = await p.evaluate(() => {
    const activeScreen = document.querySelector('.screen.active')?.id;
    const card = document.querySelector('#form-diamond .card-v4, #form-bench .card-v4, #formation-screen .card-v4');
    if(!card) return { activeScreen, cards:'no card-v4' };
    const bars = card.querySelector('.bars');
    const barsDisplay = bars ? getComputedStyle(bars).display : 'no bars';
    const artImg = card.querySelector('img.art');
    const art = artImg ? { src: artImg.src || '(empty)', hasAttr: artImg.hasAttribute('src'), natW: artImg.naturalWidth } : null;
    return {
      activeScreen,
      cardClasses: card.className,
      hasCompact: card.classList.contains('card-v4-compact'),
      hasWithBars: card.classList.contains('with-bars'),
      barsDisplay,
      art,
      heroInDeck: (Game.deck||[]).filter(c => c._isHero || c.isHero).map(h => ({
        id: h.id, skinKey: h.skinKey, getImg: (typeof getCardImg==='function') ? getCardImg(h) : '?'
      }))
    };
  });
  console.log(JSON.stringify(dump, null, 2));
  await b.close();
})();
