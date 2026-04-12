/**
 * snap_card_test.js — card_test.html 전용 스크린샷 도구
 * 용도: 프레임 프로토타입 반복 검증
 */
const { chromium } = require('playwright');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

(async () => {
  const debug = process.argv.includes('--debug');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1500, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('[PAGE ERROR]', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('[CONSOLE]', m.text()); });

  const file = 'file:///' + path.join(ROOT, 'card_test.html').replace(/\\/g, '/');
  await page.goto(file);
  await page.waitForTimeout(500);
  if (debug) {
    await page.evaluate(() => document.body.classList.add('debug'));
    await page.waitForTimeout(200);
  }

  const fs = require('fs');
  const shotsDir = path.join(ROOT, 'shots');
  fs.mkdirSync(shotsDir, { recursive: true });
  const out = path.join(shotsDir, 'card_test' + (debug ? '_debug' : '') + '.png');
  await page.screenshot({ path: out, fullPage: true });
  console.log('Saved:', out);
  await browser.close();
})();
