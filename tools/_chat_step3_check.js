const {chromium} = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();

  const errors = [];
  const pageErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(err.message));

  await page.goto('http://localhost:8765/index.html');
  await page.waitForTimeout(2500);

  const preLogin = await page.evaluate(() => ({
    hasToggle: !!document.getElementById('chat-toggle'),
    hasPanel: !!document.getElementById('chat-panel'),
    tabCount: document.querySelectorAll('#chat-panel .cp-tab').length,
  }));
  console.log('PRELOGIN:', JSON.stringify(preLogin));

  await page.evaluate(() => {
    document.body.classList.add('game-mode');
    document.getElementById('chat-panel').classList.add('active');
  });
  await page.waitForTimeout(400);

  const tabInfo = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('#chat-panel .cp-tab')];
    return tabs.map(t => {
      const r = t.getBoundingClientRect();
      return { kind: t.dataset.kind, text: t.textContent.trim(), active: t.classList.contains('active'),
               x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
               disabled: t.disabled };
    });
  });
  console.log('TABS:', JSON.stringify(tabInfo, null, 2));

  const panelGeom = await page.evaluate(() => {
    const p = document.getElementById('chat-panel');
    const tabs = document.querySelector('#chat-panel .cp-tabs');
    const tabsR = tabs.getBoundingClientRect();
    return {
      panelW: p.getBoundingClientRect().width,
      panelX: p.getBoundingClientRect().left,
      tabsW: tabsR.width,
      tabsX: tabsR.left,
    };
  });
  console.log('GEOM:', JSON.stringify(panelGeom));

  await page.screenshot({ path: 'c:/work/game/shots/phase5_chat_step3/01_initial_world.png', fullPage: false });

  const leagueResult = await page.evaluate(() => {
    if(!window.RoF || !RoF.Chat) return { error: 'RoF.Chat not loaded' };
    const tab = document.querySelector('#chat-panel .cp-tab[data-kind=league]');
    if(!tab) return { error: 'league tab missing' };
    tab.click();
    return {
      clicked: true,
      title: document.querySelector('#chat-panel .cp-title').textContent,
      activeKind: document.querySelector('#chat-panel .cp-tab.active')?.dataset.kind,
      activeChannel: RoF.Chat._activeChannel
    };
  });
  console.log('LEAGUE_CLICK:', JSON.stringify(leagueResult));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'c:/work/game/shots/phase5_chat_step3/02_league.png', fullPage: false });

  const guildResult = await page.evaluate(() => {
    const tab = document.querySelector('#chat-panel .cp-tab[data-kind=guild]');
    tab.click();
    return {
      title: document.querySelector('#chat-panel .cp-title').textContent,
      activeKind: document.querySelector('#chat-panel .cp-tab.active')?.dataset.kind,
      msgsHTML: document.querySelector('#chat-panel .cp-messages').innerHTML,
      inputDisabled: document.querySelector('#chat-panel .cp-input').disabled,
      sendDisabled: document.querySelector('#chat-panel .cp-send').disabled,
      activeChannel: RoF.Chat._activeChannel
    };
  });
  console.log('GUILD_CLICK:', JSON.stringify(guildResult, null, 2));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'c:/work/game/shots/phase5_chat_step3/03_guild_placeholder.png', fullPage: false });

  const worldBack = await page.evaluate(() => {
    document.querySelector('#chat-panel .cp-tab[data-kind=world]').click();
    return {
      title: document.querySelector('#chat-panel .cp-title').textContent,
      activeKind: document.querySelector('#chat-panel .cp-tab.active')?.dataset.kind,
      activeChannel: RoF.Chat._activeChannel
    };
  });
  console.log('WORLD_BACK:', JSON.stringify(worldBack));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'c:/work/game/shots/phase5_chat_step3/04_world_return.png', fullPage: false });

  const panelEl = await page.locator('#chat-panel');
  try { await panelEl.screenshot({ path: 'c:/work/game/shots/phase5_chat_step3/10_panel_crop.png' }); } catch(e) { console.log('crop failed:', e.message); }

  const leagueCalc = await page.evaluate(() => {
    if(!window.Game) return { error: 'Game not loaded' };
    return {
      leaguePoints: Game.leaguePoints,
      league: Game.getLeague ? Game.getLeague() : null
    };
  });
  console.log('LEAGUE_CALC:', JSON.stringify(leagueCalc));

  console.log('CONSOLE_ERRORS:', errors.length);
  errors.slice(0,8).forEach(e => console.log('  CE:', e));
  console.log('PAGE_ERRORS:', pageErrors.length);
  pageErrors.slice(0,8).forEach(e => console.log('  PE:', e));

  await browser.close();
})();
