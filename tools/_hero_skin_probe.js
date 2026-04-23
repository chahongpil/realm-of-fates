const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
  await p.goto('http://localhost:8765/index.html?mute=1');
  await p.waitForTimeout(700);
  await p.evaluate(() => UI.show('login-screen'));
  await p.fill('#login-id','probe2'); await p.fill('#login-pw','1234');
  await p.evaluate(() => Auth.login()); await p.waitForTimeout(700);
  const msg = await p.evaluate(()=>(document.getElementById('login-msg')||{}).textContent||'');
  if(msg.trim()){
    await p.evaluate(() => UI.show('signup-screen'));
    await p.fill('#signup-id','probe2'); await p.fill('#signup-pw','1234'); await p.fill('#signup-pw2','1234');
    await p.evaluate(() => Auth.signup()); await p.waitForTimeout(1500);
  }
  const dump = await p.evaluate(() => {
    const deck = (window.Game && Game.deck) || [];
    const heroes = deck.filter(c => c.isHero || c._isHero);
    return heroes.map(h => ({
      id: h.id,
      name: h.name,
      uid: h.uid,
      isHero: h.isHero,
      _isHero: h._isHero,
      skinKey: h.skinKey,
      element: h.element,
      role: h.role,
      imgKey: h.imgKey,
      _getCardImgResult: (typeof getCardImg === 'function') ? getCardImg(h) : '(no getCardImg)',
      CARD_IMG_bySkinKey: h.skinKey && RoF.Data.CARD_IMG[h.skinKey] || null,
      CARD_IMG_byId: RoF.Data.CARD_IMG[h.id] || null
    }));
  });
  console.log('HEROES:', JSON.stringify(dump, null, 2));
  await b.close();
})();
