/**
 * ui_inspect.js — DOM 요소의 위치/크기/스타일/대비를 정량 측정
 * 사용:
 *   node tools/ui_inspect.js <screen> <selector> [opts]
 *   node tools/ui_inspect.js menu .town-building
 *   node tools/ui_inspect.js menu '.th-stat' --align     (left 정렬 검사)
 *   node tools/ui_inspect.js deck '.empty-slot' --first 6
 *
 * 출력: 각 매치 요소의 rect + computed style + 대비비(있으면)
 */
const { chromium } = require('playwright');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE_URL = 'file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log(__doc__ || 'Usage: node tools/ui_inspect.js <screen> <selector> [--align] [--first N]');
  process.exit(1);
}
const screen = args[0];
const selector = args[1];
const checkAlign = args.includes('--align');
const firstIdx = args.indexOf('--first');
const limit = firstIdx >= 0 ? parseInt(args[firstIdx + 1]) : 999;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('pageerror', e => console.log('[ERR]', e.message));

  await page.goto(FILE_URL);
  await page.waitForTimeout(500);

  // login or signup _test
  await page.evaluate(() => UI.show('login-screen'));
  await page.waitForTimeout(200);
  await page.fill('#login-id', '_test_runner');
  await page.fill('#login-pw', '1234');
  await page.evaluate(() => Auth.login());
  await page.waitForTimeout(800);
  const msg = await page.evaluate(() => document.getElementById('login-msg')?.textContent || '');
  if (msg && msg.trim()) {
    await page.evaluate(() => UI.show('signup-screen'));
    await page.waitForTimeout(200);
    await page.fill('#signup-id', '_test_runner');
    await page.fill('#signup-pw', '1234');
    await page.fill('#signup-pw2', '1234');
    await page.evaluate(() => Auth.signup());
    await page.waitForTimeout(1500);
  }
  await page.evaluate(() => {
    if (typeof Game !== 'undefined') {
      Game.buildings = Game.buildings || { gate:1, library:1, forge:1, tavern:1, shop:1, church:1, training:1, castle:1 };
    }
  });

  // navigate to screen
  if (screen === 'menu') await page.evaluate(() => Game.showMenu());
  else if (screen === 'deck') await page.evaluate(() => Game.showDeckView());
  else if (screen === 'tavern') await page.evaluate(() => Game.showTavern());
  else if (screen === 'title') await page.evaluate(() => UI.show('title-screen'));
  else if (screen === 'login') await page.evaluate(() => UI.show('login-screen'));
  await page.waitForTimeout(600);

  // measure
  const data = await page.evaluate(({sel, max}) => {
    const els = Array.from(document.querySelectorAll(sel)).slice(0, max);
    function rgbToLuma(r,g,b){
      const a = [r,g,b].map(v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
      return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
    }
    function parseColor(s) {
      const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return m ? {r:+m[1], g:+m[2], b:+m[3]} : null;
    }
    return els.map((el, i) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const fg = parseColor(cs.color);
      const bg = parseColor(cs.backgroundColor);
      let contrast = null;
      if (fg && bg && bg.r+bg.g+bg.b > 0) {
        const l1 = rgbToLuma(fg.r, fg.g, fg.b);
        const l2 = rgbToLuma(bg.r, bg.g, bg.b);
        contrast = ((Math.max(l1,l2) + 0.05) / (Math.min(l1,l2) + 0.05)).toFixed(2);
      }
      return {
        i,
        text: (el.textContent || '').trim().slice(0, 30),
        x: Math.round(r.left), y: Math.round(r.top),
        w: Math.round(r.width), h: Math.round(r.height),
        font: cs.fontSize,
        fontWeight: cs.fontWeight,
        color: cs.color,
        bg: cs.backgroundColor,
        padding: cs.padding,
        contrast,
      };
    });
  }, {sel: selector, max: limit});

  console.log(`\n══════════════════════════════════════`);
  console.log(`  UI Inspector: ${screen} ${selector}`);
  console.log(`══════════════════════════════════════`);
  console.log(`Found: ${data.length} element(s)\n`);
  data.forEach(d => {
    console.log(`#${d.i}  "${d.text}"`);
    console.log(`     pos: (${d.x}, ${d.y})  size: ${d.w}x${d.h}`);
    console.log(`     font: ${d.font} ${d.fontWeight}  pad: ${d.padding}`);
    console.log(`     color: ${d.color}  bg: ${d.bg}`);
    if (d.contrast) {
      const wcag = parseFloat(d.contrast) >= 4.5 ? '✅ AA' : (parseFloat(d.contrast) >= 3.0 ? '⚠️ AA-Large' : '❌ FAIL');
      console.log(`     contrast: ${d.contrast}:1  ${wcag}`);
    }
    console.log('');
  });

  if (checkAlign && data.length > 1) {
    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    const ws = data.map(d => d.w);
    const hs = data.map(d => d.h);
    console.log('── 정렬 검사 ──');
    const xRange = Math.max(...xs) - Math.min(...xs);
    const yRange = Math.max(...ys) - Math.min(...ys);
    const wRange = Math.max(...ws) - Math.min(...ws);
    const hRange = Math.max(...hs) - Math.min(...hs);
    console.log(`  left   range: ${xRange}px  ${xRange <= 2 ? '✅ aligned' : '⚠ misaligned'}`);
    console.log(`  top    range: ${yRange}px  ${yRange <= 2 ? '✅ aligned' : '⚠ misaligned'}`);
    console.log(`  width  range: ${wRange}px  ${wRange <= 2 ? '✅ uniform' : '⚠ varied'}`);
    console.log(`  height range: ${hRange}px  ${hRange <= 2 ? '✅ uniform' : '⚠ varied'}`);
    // gap analysis (if items are in a row/col)
    if (data.length >= 3) {
      const sortedX = [...data].sort((a,b)=>a.x-b.x);
      const xGaps = [];
      for (let i=1; i<sortedX.length; i++) xGaps.push(sortedX[i].x - (sortedX[i-1].x + sortedX[i-1].w));
      console.log(`  x-gaps: ${xGaps.join(', ')}px`);
    }
  }

  await browser.close();
})();
