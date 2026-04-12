/**
 * responsive_snap.js — 한 화면을 4개 뷰포트(모바일/태블릿/PC/와이드)로 캡처
 * 사용:
 *   node tools/responsive_snap.js <screen>
 *   node tools/responsive_snap.js menu
 *   node tools/responsive_snap.js all          (모든 화면 × 4 뷰포트)
 *
 * 출력: shots/responsive/<screen>_<viewport>.png
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const FILE_URL = 'file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/');
const OUT_DIR = path.join(ROOT, 'shots', 'responsive');
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile',  w: 390,  h: 844 },
  { name: 'tablet',  w: 768,  h: 1024 },
  { name: 'pc',      w: 1400, h: 900 },
  { name: 'wide',    w: 1920, h: 1080 },
];

const SCREENS = ['title','login','signup','menu','deck','tavern'];

const arg = process.argv[2];
if (!arg) {
  console.log('Usage: node tools/responsive_snap.js <screen|all>');
  process.exit(1);
}
const targets = arg === 'all' ? SCREENS : [arg];

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
    page.on('pageerror', e => console.log(`[ERR ${vp.name}]`, e.message));

    for (const screen of targets) {
      await page.goto(FILE_URL);
      await page.waitForTimeout(500);

      // For non-title screens, login first
      if (screen !== 'title' && screen !== 'login' && screen !== 'signup') {
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
        if (screen === 'menu') await page.evaluate(() => Game.showMenu());
        else if (screen === 'deck') await page.evaluate(() => Game.showDeckView());
        else if (screen === 'tavern') await page.evaluate(() => Game.showTavern());
      } else if (screen === 'login') {
        await page.evaluate(() => UI.show('login-screen'));
      } else if (screen === 'signup') {
        await page.evaluate(() => UI.show('signup-screen'));
      }

      await page.waitForTimeout(500);
      const out = path.join(OUT_DIR, `${screen}_${vp.name}.png`);
      await page.screenshot({ path: out, fullPage: false });
      console.log(`✅ ${vp.name.padEnd(7)} ${screen}`);
    }
    await page.close();
  }
  await browser.close();
  console.log(`\nSaved to ${OUT_DIR}`);
})();
