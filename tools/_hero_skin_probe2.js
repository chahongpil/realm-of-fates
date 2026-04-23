const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
  await p.goto('http://localhost:8765/index.html?mute=1');
  await p.waitForTimeout(700);
  const dump = await p.evaluate(() => {
    // createHero 직접 호출 + getCardImg 결과
    const h = RoF.Data.createHero({ gender:'m', role:'warrior', element:'fire', skinIndex:0 });
    return {
      created: h,
      getCardImgResult: (typeof getCardImg === 'function') ? getCardImg(h) : '(no)',
      MAP_bySkinKey: RoF.Data.CARD_IMG[h.skinKey] || null,
      MAP_byId: RoF.Data.CARD_IMG[h.id] || null,
      isHero: h.isHero,
      _isHero: h._isHero,
      skinKey: h.skinKey,
      hero_keys: Object.keys(h),
    };
  });
  console.log(JSON.stringify(dump, null, 2));
  await b.close();
})();
