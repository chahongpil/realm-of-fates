// 1회용 스냅: v2 전투 어댑터를 실제 덱 데이터로 호출 후 스크린샷.
// 블로커 #3 배선 / #1 적 AI 스킬셋 / #2 큐잉 타이머 검증용.
const { chromium } = require('playwright');
const path = require('path');

(async function(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g,'/');
  page.on('console', msg => { if(msg.type() === 'warning' || msg.type() === 'error') console.log('['+msg.type()+']', msg.text()); });
  await page.goto(url);
  await page.waitForTimeout(400);

  // 로그인 → 메뉴
  await page.evaluate(() => {
    if(typeof Auth !== 'undefined' && Auth.signup){
      try { Auth.signup('_v2snap','1234'); } catch(e){}
      try { Auth.login('_v2snap','1234'); } catch(e){}
    }
  });
  await page.waitForTimeout(300);

  // RoF.Data.UNITS에서 합성 bs 구성 (실제 유닛 스펙 그대로)
  const info = await page.evaluate(() => {
    if(!window.RoF || !window.RoF.Battle || !window.RoF.Data || !window.RoF.Data.UNITS){
      return {ok:false, reason:'globals missing'};
    }
    const UNITS = window.RoF.Data.UNITS;
    // 영웅 1 + 동료 4 다양한 원소로
    const pick = (pred) => UNITS.find(pred);
    const allies = [
      { ...pick(u=>u.id==='h_m_fire'),      uid:'p_h', isHero:true, level:3 },
      { ...pick(u=>u.id==='h_r_water'),     uid:'p_1', level:2 },
      { ...pick(u=>u.id==='h_s_holy'),      uid:'p_2', level:2 },
      { ...pick(u=>u.id==='h_m_earth'),     uid:'p_3', level:2 },
      { ...pick(u=>u.id==='h_r_lightning'), uid:'p_4', level:2 },
    ].filter(Boolean);
    const enemies = [
      { ...pick(u=>u.id==='h_m_dark'),    uid:'e_h', isHero:true, level:3 },
      { ...pick(u=>u.id==='h_r_fire'),    uid:'e_1', level:2 },
      { ...pick(u=>u.id==='h_s_water'),   uid:'e_2', level:2 },
      { ...pick(u=>u.id==='h_m_holy'),    uid:'e_3', level:2 },
      { ...pick(u=>u.id==='h_r_earth'),   uid:'e_4', level:2 },
    ].filter(Boolean);
    const wrap = (c, side) => ({
      ...c, currentHp:c.hp, maxBHp:c.hp, side:side,
      row: c.range==='melee'?'front':'back',
      frozen:0, poisoned:0, revived:false, invincible:0,
      curNrg:0, curShield:0, burn:0,
    });
    const bs = {
      currentRound: 1,
      pCards: allies.map(c=>wrap(c,'player')),
      eCards: enemies.map(c=>wrap(c,'enemy')),
      battleRelics: [],
    };
    const ok = window.RoF.Battle.startFromLegacyBS(bs);
    return {
      ok: ok !== false,
      ally: bs.pCards.length,
      enemy: bs.eCards.length,
      firstAllyName: bs.pCards[0].name,
      firstAllyElem: bs.pCards[0].element,
      firstEnemyName: bs.eCards[0].name,
    };
  });
  console.log('startFromLegacyBS:', info);
  await page.waitForTimeout(600);

  const outIdle = path.resolve(__dirname, '..', 'shots', 'v2_battle_idle.png');
  await page.screenshot({ path: outIdle, fullPage: false });
  console.log('saved:', outIdle);

  // 첫 아군 클릭 → 스킬 펼침
  const click1 = await page.evaluate(() => {
    if(!window.RoF || !window.RoF.Battle) return false;
    const u = window.RoF.Battle.DEMO.allies[0];
    window.RoF.Battle.onCharClick(u);
    return true;
  });
  await page.waitForTimeout(500);
  const outFocus = path.resolve(__dirname, '..', 'shots', 'v2_battle_char_focus.png');
  await page.screenshot({ path: outFocus, fullPage: false });
  console.log('saved:', outFocus, 'click:', click1);

  // 타이머 엘리먼트 값 측정
  const timerInfo = await page.evaluate(() => {
    const el = document.getElementById('bv2-queue-timer');
    if(!el) return null;
    const val = el.querySelector('.bsm-timer-val');
    return { present: !!el, display: getComputedStyle(el).display, text: val?val.textContent:null, classes: el.className };
  });
  console.log('timer:', timerInfo);

  // 아군 스킬 개수 확인
  const skillsInfo = await page.evaluate(() => {
    const B = window.RoF && window.RoF.Battle;
    if(!B) return null;
    return B.DEMO.allies.map(a => ({
      id: a.id, name: a.name, element: a.element, rarity: a.rarity,
      skills: B.getSkillsOf(a).map(s=>({name:s.name, type:s.attackType, dmg:s.damage, mult:s.mult, cost:s.cost})),
    }));
  });
  console.log('ally skills:\n', JSON.stringify(skillsInfo, null, 2));

  await browser.close();
})();
