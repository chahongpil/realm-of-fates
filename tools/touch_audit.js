/**
 * touch_audit.js — 모바일/태블릿 뷰포트에서 터치 타겟 44×44 검증
 * 사용: node tools/touch_audit.js
 */
const { chromium } = require('playwright');
const path = require('path');
const FILE_URL = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { w: 390, h: 844, name: 'mobile' },
    { w: 768, h: 1024, name: 'tablet' },
  ];
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    await page.goto(FILE_URL);
    await page.waitForTimeout(400);
    await page.evaluate(() => UI.show('login-screen'));
    await page.fill('#login-id', '_test_runner');
    await page.fill('#login-pw', '1234');
    await page.evaluate(() => Auth.login());
    await page.waitForTimeout(600);
    const msg = await page.evaluate(() => document.getElementById('login-msg')?.textContent || '');
    if (msg && msg.trim()) {
      await page.evaluate(() => UI.show('signup-screen'));
      await page.fill('#signup-id', '_test_runner');
      await page.fill('#signup-pw', '1234');
      await page.fill('#signup-pw2', '1234');
      await page.evaluate(() => Auth.signup());
      await page.waitForTimeout(1200);
    }
    await page.evaluate(() => {
      Game.showMenu();
    });
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => {
      const grab = sel => Array.from(document.querySelectorAll(sel)).map(el => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return { txt: (el.textContent || '').trim().slice(0, 12), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize };
      });
      return { buildings: grab('.town-building'), hud: grab('.th-stat'), btns: grab('.town-hud button, #town-screen .btn') };
    });
    console.log(`\n=== ${vp.name} ${vp.w}×${vp.h} ===`);
    console.log('Buildings (≥44×44):');
    result.buildings.forEach(b => {
      const ok = b.w >= 44 && b.h >= 44;
      console.log(`  ${ok?'✅':'❌'} ${b.txt.padEnd(12)} ${b.w}×${b.h}`);
    });
    console.log('HUD stats:');
    result.hud.forEach(h => {
      const ok = h.w >= 44 && h.h >= 44;
      console.log(`  ${ok?'✅':'❌'} ${h.txt.padEnd(12)} ${h.w}×${h.h}  font:${h.fs}`);
    });
    console.log('HUD buttons:');
    result.btns.forEach(b => {
      const ok = b.w >= 44 && b.h >= 44;
      console.log(`  ${ok?'✅':'❌'} ${b.txt.padEnd(12)} ${b.w}×${b.h}`);
    });
    await page.close();
  }
  await browser.close();
})();
