const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2400 }, deviceScaleFactor: 1 });
  page.on('pageerror', err => console.log('[PAGEERROR]', err.message));
  page.on('console', msg => { if (msg.type() === 'error') console.log('[CONSOLE ERR]', msg.text()); });

  const filePath = 'file:///' + path.resolve('c:/work/game/index.html').replace(/\\/g, '/');
  await page.goto(filePath);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'c:/work/game/shot_00_title.png', fullPage: true });

  // Navigate: title → login
  await page.evaluate(() => { UI.show('login-screen'); });
  await page.waitForTimeout(500);

  // Fill login
  await page.fill('#login-id', '홍아다');
  await page.fill('#login-pw', '1234');
  await page.evaluate(() => { Auth.login(); });
  await page.waitForTimeout(1500);

  let loginMsg = await page.evaluate(() => document.getElementById('login-msg')?.textContent || '');
  console.log('After login attempt — msg:', loginMsg || '(none)');
  await page.screenshot({ path: 'c:/work/game/shot_01_after_login.png', fullPage: true });

  // If failed, signup
  if (loginMsg && loginMsg.trim()) {
    console.log('Login failed, attempting signup...');
    await page.evaluate(() => { UI.show('signup-screen'); });
    await page.waitForTimeout(400);
    await page.fill('#signup-id', '홍아다');
    await page.fill('#signup-pw', '1234');
    await page.fill('#signup-pw2', '1234');
    await page.evaluate(() => { Auth.signup(); });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'c:/work/game/shot_02_after_signup.png', fullPage: true });
  }

  // Try to find 서고 or 덱 view via game state
  // Use direct Game object access
  const gameState = await page.evaluate(() => {
    return {
      hasGame: typeof Game !== 'undefined',
      hasAuth: typeof Auth !== 'undefined',
      user: typeof Auth !== 'undefined' ? Auth.user : null,
      deck: typeof Game !== 'undefined' ? (Game.deck || []).length : 0,
      skills: typeof Game !== 'undefined' ? (Game.ownedSkills || []).length : 0,
      relics: typeof Game !== 'undefined' ? (Game.ownedRelics || []).length : 0,
    };
  });
  console.log('Game state:', JSON.stringify(gameState));

  // Ensure buildings exists (post-signup may skip init)
  await page.evaluate(() => {
    if (typeof Game !== 'undefined') {
      Game.buildings = Game.buildings || { gate:1, library:1, forge:1, tavern:1, shop:1, church:1, training:1, castle:1 };
      Game.ownedSkills = (typeof SKILLS_DB !== 'undefined') ? SKILLS_DB.map(s => ({ ...s })) : [];
    }
  });

  // Render all skill cards in a diagnostic grid
  await page.evaluate(() => {
    if (typeof SKILLS_DB === 'undefined' || typeof mkCardEl !== 'function') return;
    const container = document.createElement('div');
    container.id = 'diag-skill-grid';
    container.style.cssText = 'position:fixed;inset:0;background:#0a0a14;z-index:99999;overflow:auto;padding:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;';
    SKILLS_DB.forEach(sk => {
      try {
        const el = mkCardEl(sk);
        if (el) container.appendChild(el);
      } catch(e) {
        const div = document.createElement('div');
        div.textContent = 'ERR ' + sk.id + ': ' + e.message;
        div.style.color = '#f66';
        container.appendChild(div);
      }
    });
    document.body.appendChild(container);
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'c:/work/game/shot_05_all_skills_grid.png', fullPage: true });

  console.log('Done. Screenshots saved.');
  await browser.close();
})();
