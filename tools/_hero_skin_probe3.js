const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({viewport:{width:1280,height:720}})).newPage();
  await p.goto('http://localhost:8765/index.html?mute=1');
  await p.waitForTimeout(700);
  const results = await p.evaluate(() => {
    const tests = [];
    // 케이스 1: createHero 정상 (skinKey 있음)
    const h1 = RoF.Data.createHero({ gender:'m', role:'warrior', element:'fire', skinIndex:0 });
    tests.push({case:'createHero m warrior fire', skinKey:h1.skinKey, result:getCardImg(h1)});
    // 케이스 2: 레거시 영웅 (skinKey 없음, id 만)
    tests.push({case:'legacy m warrior fire', input:{id:'hero_m_warrior_fire', _isHero:true}, result:getCardImg({id:'hero_m_warrior_fire', _isHero:true})});
    tests.push({case:'legacy f ranger water', input:{id:'hero_f_ranger_water', _isHero:true}, result:getCardImg({id:'hero_f_ranger_water', _isHero:true})});
    tests.push({case:'legacy m support holy', input:{id:'hero_m_support_holy', _isHero:true}, result:getCardImg({id:'hero_m_support_holy', _isHero:true})});
    // 케이스 3: isHero (언더스코어 없음) 레거시
    tests.push({case:'legacy isHero f warrior dark', input:{id:'hero_f_warrior_dark', isHero:true}, result:getCardImg({id:'hero_f_warrior_dark', isHero:true})});
    // 케이스 4: 일반 유닛
    tests.push({case:'normal militia', input:{id:'militia'}, result:getCardImg({id:'militia'})});
    return tests;
  });
  console.log(JSON.stringify(results, null, 2));
  await b.close();
})();
