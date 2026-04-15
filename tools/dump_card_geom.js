// dump_card_geom.js — 모든 .bv2-card 및 전투 HUD 요소의 bbox / computed style 덤프
// 사용: node tools/dump_card_geom.js [--out c:/work/game/shots/geom.json]
// 검수관이 "픽셀 수치 증거"로 레이아웃 검증할 때 사용.

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outPath = outIdx >= 0 ? args[outIdx + 1] : path.resolve(__dirname, '..', 'shots', 'geom.json');

(async function(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g,'/');
  await page.goto(url);
  await page.waitForTimeout(400);

  // 합성 bs 로 v2 전투 진입 (실 데이터 어댑터 경로 그대로)
  await page.evaluate(() => {
    const UNITS = window.RoF.Data.UNITS;
    const pick = (id) => UNITS.find(u=>u.id===id);
    const allies = [
      { ...pick('h_m_fire'),      uid:'p_h', isHero:true, level:3 },
      { ...pick('h_r_water'),     uid:'p_1', level:2 },
      { ...pick('h_s_holy'),      uid:'p_2', level:2 },
      { ...pick('h_m_earth'),     uid:'p_3', level:2 },
      { ...pick('h_r_lightning'), uid:'p_4', level:2 },
    ];
    const enemies = [
      { ...pick('h_m_dark'),    uid:'e_h', isHero:true, level:3 },
      { ...pick('h_r_fire'),    uid:'e_1', level:2 },
      { ...pick('h_s_water'),   uid:'e_2', level:2 },
      { ...pick('h_m_holy'),    uid:'e_3', level:2 },
      { ...pick('h_r_earth'),   uid:'e_4', level:2 },
    ];
    const wrap = (c, side) => ({
      ...c, currentHp:c.hp, maxBHp:c.hp, side,
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
    window.RoF.Battle.startFromLegacyBS(bs);
  });
  await page.waitForTimeout(500);

  // 측정 대상 셀렉터 + 이름
  const targets = [
    { name: 'viewport',         sel: 'body' },
    { name: 'battle-container', sel: '#battle-v2-container' },
    { name: 'hud-top',          sel: '.bv2-hud-top' },
    { name: 'queue-timer',      sel: '#bv2-queue-timer' },
    { name: 'stage-grid',       sel: '.battle-stage-grid' },
    { name: 'enemy-row',        sel: '#bv2-enemy-row' },
    { name: 'mid-bar',          sel: '.battle-stage-mid' },
    { name: 'vs-label',         sel: '.bsm-vs-label' },
    { name: 'bsm-auto',         sel: '.bsm-auto' },
    { name: 'bsm-start',        sel: '.bsm-start' },
    { name: 'ally-row',         sel: '#bv2-ally-row' },
  ];

  const geom = await page.evaluate((targets) => {
    const out = { singles: {}, cards: [] };
    targets.forEach(t => {
      const el = document.querySelector(t.sel);
      if(!el){ out.singles[t.name] = null; return; }
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out.singles[t.name] = {
        x: Math.round(r.x), y: Math.round(r.y),
        w: Math.round(r.width), h: Math.round(r.height),
        display: cs.display, visibility: cs.visibility, zIndex: cs.zIndex,
      };
    });
    // 모든 카드
    document.querySelectorAll('.bv2-card').forEach(el => {
      const r = el.getBoundingClientRect();
      const side = el.closest('.battle-row-enemy') ? 'enemy' : 'ally';
      const unitId = el.getAttribute('data-unit-id') || null;
      out.cards.push({
        unitId, side,
        x: Math.round(r.x), y: Math.round(r.y),
        w: Math.round(r.width), h: Math.round(r.height),
      });
    });
    // CSS 변수 스냅
    const rootStyle = getComputedStyle(document.documentElement);
    out.vars = {};
    ['--bv2-card-w','--bv2-card-h','--bv2-card-gap','--bv2-hud-h','--bv2-mid-h',
     '--bv2-row-h','--bv2-row-h-ally','--bv2-side-pad','--bv2-btn-w','--bv2-btn-h','--bv2-vs-size']
      .forEach(k => { out.vars[k] = rootStyle.getPropertyValue(k).trim(); });
    return out;
  }, targets);

  // 겹침 검증 — enemy-row, mid-bar, ally-row 수직 비겹침
  const s = geom.singles;
  const overlaps = [];
  const check = (a, b) => {
    const aEl = s[a], bEl = s[b];
    if(!aEl || !bEl) return;
    const aBottom = aEl.y + aEl.h, bBottom = bEl.y + bEl.h;
    if(aEl.y < bBottom && bEl.y < aBottom){
      overlaps.push(`${a} ∩ ${b}: ${a}[y${aEl.y}-${aBottom}] vs ${b}[y${bEl.y}-${bBottom}]`);
    }
  };
  check('hud-top','enemy-row');
  check('enemy-row','mid-bar');
  check('mid-bar','ally-row');
  // 카드 간 좌우 겹침
  const cardOverlaps = [];
  const bySide = { ally: [], enemy: [] };
  geom.cards.forEach(c => bySide[c.side].push(c));
  ['ally','enemy'].forEach(side => {
    const row = bySide[side].sort((a,b)=>a.x-b.x);
    for(let i=1;i<row.length;i++){
      const prev = row[i-1], cur = row[i];
      if(prev.x + prev.w > cur.x){
        cardOverlaps.push(`${side} card ${i-1}↔${i}: prev.right=${prev.x+prev.w} > cur.left=${cur.x}`);
      }
    }
  });

  const report = {
    url,
    viewport: { w: 1280, h: 720 },
    vars: geom.vars,
    singles: geom.singles,
    cardCount: geom.cards.length,
    cards: geom.cards,
    overlaps: { vertical: overlaps, cards: cardOverlaps },
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('=== geom dump ===');
  console.log('saved:', outPath);
  console.log('css vars:', geom.vars);
  console.log('hud-top:',  s['hud-top']);
  console.log('enemy-row:',s['enemy-row']);
  console.log('mid-bar:',  s['mid-bar']);
  console.log('ally-row:', s['ally-row']);
  console.log('queue-timer:', s['queue-timer']);
  console.log('cards:', geom.cards.length);
  if(overlaps.length){ console.log('⚠ vertical overlaps:', overlaps); }
  else                { console.log('✓ vertical overlap: none'); }
  if(cardOverlaps.length){ console.log('⚠ card overlaps:', cardOverlaps); }
  else                    { console.log('✓ card overlap: none'); }

  await browser.close();
})();
