// PHASE 3 battle v2 — 카드 일러스트 검은 박스 진단
// 전투 v2 진입 후 .card-v4 img.art 의 src / natural size / 404 를 실측.
// 사용: node tools/_battle_v2_art_audit.js
'use strict';
const { chromium } = require('playwright');
const URL = 'http://localhost:8765/index.html?mute=1';
const SHOT = 'c:/work/game/shots/battle_v2_art_audit';
const fs = require('fs');
try { fs.mkdirSync(SHOT, { recursive: true }); } catch(e){}
const log = (n, extra) => console.log(JSON.stringify(Object.assign({n}, extra||{})));

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const failedRequests = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', msg => { if(msg.type()==='error') consoleErrors.push(msg.text()); });
  page.on('requestfailed', req => {
    const u = req.url();
    if(u.includes('/img/') && u.match(/\.(png|jpg|jpeg|webp|svg)/i)){
      failedRequests.push({ url: u, reason: req.failure()?.errorText });
    }
  });
  page.on('response', resp => {
    const u = resp.url();
    if(u.includes('/img/') && resp.status() >= 400 && u.match(/\.(png|jpg|jpeg|webp|svg)/i)){
      failedRequests.push({ url: u, status: resp.status() });
    }
  });

  await page.goto(URL);
  await page.waitForTimeout(800);

  // login / signup
  await page.evaluate(() => UI.show('login-screen'));
  await page.waitForTimeout(150);
  await page.fill('#login-id', 'art_audit');
  await page.fill('#login-pw', '1234');
  await page.evaluate(() => Auth.login());
  await page.waitForTimeout(800);
  const loginMsg = await page.evaluate(() => (document.getElementById('login-msg')||{}).textContent || '');
  if (loginMsg.trim()) {
    await page.evaluate(() => UI.show('signup-screen'));
    await page.waitForTimeout(150);
    await page.fill('#signup-id', 'art_audit');
    await page.fill('#signup-pw', '1234');
    await page.fill('#signup-pw2', '1234');
    await page.evaluate(() => Auth.signup());
    await page.waitForTimeout(1500);
  }
  log('logged-in', { user: await page.evaluate(() => Auth.user) });

  // deck setup — 영웅 + bronze 3종
  await page.evaluate(() => {
    Game.buildings = Game.buildings || { gate:1, library:1, forge:1, tavern:1, shop:1, church:1, training:1, castle:1 };
    if (RoF && RoF.Data && RoF.Data.createHero) {
      const hero = RoF.Data.createHero({ gender:'m', role:'warrior', element:'fire', skinIndex:0 });
      hero.uid = 'my_hero_001'; hero.isHero = true; hero.level = 1;
      hero.maxHp = hero.hp; hero.currentHp = hero.hp; hero.shield = 0;
      Game.deck = Game.deck || [];
      if (!Game.deck.find(c=>c.isHero)) Game.deck.push(hero);
    }
    const pool = (typeof UNITS !== 'undefined') ? UNITS.filter(u => u.rarity==='bronze').slice(0,3) : [];
    pool.forEach((u,i) => {
      const inst = Object.assign({}, u, { uid:'u_'+i+'_'+Math.random().toString(36).slice(2,7), level:1, equips:[], maxHp:u.hp, currentHp:u.hp, shield:0 });
      if (!Game.deck.find(c=>c.uid===inst.uid)) Game.deck.push(inst);
    });
    Game.persist && Game.persist();
  });
  await page.evaluate(() => Game.showMenu && Game.showMenu());
  await page.waitForTimeout(300);
  await page.evaluate(() => Game.startBattle && Game.startBattle());
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const hero = Game.deck.find(c=>c.isHero);
    const nh = Game.deck.filter(c=>!c.isHero).slice(0,3);
    Game.selectedForBattle = [hero && hero.uid].concat(nh.map(c=>c.uid)).filter(Boolean);
    Game.selectedRelics = [];
    Game.renderCardSelect && Game.renderCardSelect();
  });
  await page.waitForTimeout(200);
  await page.evaluate(() => Game.confirmCardSelect && Game.confirmCardSelect());
  await page.waitForTimeout(500);

  // wait for 출전 button
  let ready = false;
  for (let i=0;i<30;i++){
    await page.waitForTimeout(200);
    const got = await page.evaluate(() => {
      const m = document.getElementById('match-screen');
      if(!m || m.offsetParent===null) return false;
      const btns = Array.from(m.querySelectorAll('button, .btn'));
      return btns.some(b => (b.textContent||'').indexOf('출전!') >= 0);
    });
    if(got){ ready = true; break; }
  }
  log('match-ready', { ready });

  // click 출전
  await page.evaluate(() => {
    const m = document.getElementById('match-screen');
    const btns = Array.from(m.querySelectorAll('button, .btn'));
    const chul = btns.find(b => (b.textContent||'').indexOf('출전!') >= 0);
    if(chul) chul.click();
  });
  // 전투 진입 + 그리드 렌더 대기
  await page.waitForTimeout(3500);
  await page.screenshot({ path: SHOT + '/01_after_chul.png', fullPage: false });

  // art img 실측
  const stageInfo = await page.evaluate(() => {
    const grid = document.getElementById('battle-v2-stage') || document.querySelector('.bv2-stage, #battle-v2-screen');
    const cards = Array.from(document.querySelectorAll('.card-v4-compact, .bv2-card'));
    return {
      hasStage: !!grid,
      cardCount: cards.length,
      cards: cards.map(el => {
        const art = el.querySelector('img.art');
        const uid = el.getAttribute('data-uid') || '';
        const unitId = el.getAttribute('data-unit-id') || '';
        const classes = el.className;
        if(!art) return { uid, unitId, classes, art:null };
        const r = art.getBoundingClientRect();
        return {
          uid, unitId, classes,
          art: {
            src: art.src || '(empty)',
            hasAttr: art.hasAttribute('src'),
            complete: art.complete,
            naturalW: art.naturalWidth,
            naturalH: art.naturalHeight,
            renderedW: Math.round(r.width),
            renderedH: Math.round(r.height),
            displayed: art.offsetParent !== null,
          }
        };
      })
    };
  });
  log('stage-info', stageInfo);

  // CARD_IMG 매핑 검사: stage 의 각 unitId 가 CARD_IMG 에 있는지
  const mapCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.card-v4-compact, .bv2-card'));
    const out = [];
    cards.forEach(el => {
      const uid = el.getAttribute('data-uid') || '';
      const unitId = el.getAttribute('data-unit-id') || '';
      // 전투 v2 의 unit 객체에서 id 조회 — Battle.STATE
      let unit = null;
      try {
        const st = RoF.Battle && RoF.Battle.STATE;
        if (st) {
          unit = (st.enemies||[]).concat(st.allies||[]).find(u => String(u.id) === String(unitId) || String(u.uid) === String(uid));
        }
      } catch(e){}
      const mapKey = unit ? (unit._isHero && unit.skinKey ? unit.skinKey : unit.id) : unitId;
      const mapped = (RoF.Data && RoF.Data.CARD_IMG) ? RoF.Data.CARD_IMG[mapKey] : null;
      out.push({
        uid, unitId,
        unitFound: !!unit,
        unitKeys: unit ? Object.keys(unit).slice(0,20) : [],
        unitIsHero: unit ? !!unit._isHero : null,
        unitSkinKey: unit ? (unit.skinKey || null) : null,
        mapKey,
        mappedSrc: mapped || null
      });
    });
    return out;
  });
  log('map-check', mapCheck);

  await page.screenshot({ path: SHOT + '/02_battle_stage.png', fullPage: false });

  log('summary', {
    pageErrors: pageErrors.length,
    pageErrorsSample: pageErrors.slice(0,4),
    consoleErrors: consoleErrors.length,
    consoleErrorsSample: consoleErrors.slice(0,4),
    failedImg: failedRequests.length,
    failedImgSample: failedRequests.slice(0,10)
  });

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
