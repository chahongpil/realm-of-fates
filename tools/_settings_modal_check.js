// 설정 모달 E2E — ⚙️ 버튼 → 모달 → BGM 토글 → 저장하고 종료 → title-screen
'use strict';
const { chromium } = require('playwright');
const URL = 'http://localhost:8765/index.html?mute=1';
const SHOT = 'c:/work/game/shots/settings_modal';
const fs = require('fs');
try { fs.mkdirSync(SHOT, { recursive: true }); } catch(e){}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:1280, height:720} });
  const p = await ctx.newPage();
  const pageErrors = [], consoleErrors = [];
  p.on('pageerror', e => pageErrors.push(e.message));
  p.on('console', msg => { if(msg.type()==='error') consoleErrors.push(msg.text()); });

  await p.goto(URL);
  await p.waitForTimeout(700);
  await p.evaluate(() => UI.show('login-screen'));
  await p.fill('#login-id','settings_test'); await p.fill('#login-pw','1234');
  await p.evaluate(() => Auth.login());
  await p.waitForTimeout(700);
  const msg = await p.evaluate(()=>(document.getElementById('login-msg')||{}).textContent||'');
  if(msg.trim()){
    await p.evaluate(() => UI.show('signup-screen'));
    await p.fill('#signup-id','settings_test'); await p.fill('#signup-pw','1234'); await p.fill('#signup-pw2','1234');
    await p.evaluate(() => Auth.signup());
    await p.waitForTimeout(1500);
  }
  await p.evaluate(() => Game.showMenu && Game.showMenu());
  await p.waitForTimeout(400);

  // 1) 설정 버튼 존재?
  const btnInfo = await p.evaluate(() => {
    const el = document.getElementById('settings-btn');
    if(!el) return { exists:false };
    const r = el.getBoundingClientRect();
    return { exists:true, text: el.textContent, rect:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}, inViewport: r.bottom <= 720 };
  });
  console.log('SETTINGS_BTN:', JSON.stringify(btnInfo));
  await p.screenshot({ path: SHOT + '/01_town_with_settings.png' });

  // 사운드 패널 + 자식 4개 실측 (검수관 지적 #1 재검증)
  const soundPanelInfo = await p.evaluate(() => {
    const sp = document.getElementById('sound-panel');
    if(!sp) return { exists:false };
    const r = sp.getBoundingClientRect();
    const cs = getComputedStyle(sp);
    const children = Array.from(sp.children).map(el => {
      const rr = el.getBoundingClientRect();
      return { id: el.id, text: el.textContent.trim(), rect:{x:Math.round(rr.left),y:Math.round(rr.top),w:Math.round(rr.width),h:Math.round(rr.height)} };
    });
    return {
      exists:true,
      rect:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},
      position: cs.position, right: cs.right, bottom: cs.bottom, top: cs.top,
      zIndex: cs.zIndex,
      children
    };
  });
  console.log('SOUND_PANEL:', JSON.stringify(soundPanelInfo));

  // 2) 클릭 → 모달 열림?
  await p.click('#settings-btn');
  await p.waitForTimeout(300);
  const modalInfo = await p.evaluate(() => {
    const m = document.getElementById('settings-modal');
    const user = m.querySelector('.set-user-name');
    const bgmBtn = m.querySelector('.set-bgm-btn');
    const exitBtn = m.querySelector('[data-action="settings.logout"]');
    const r = m.getBoundingClientRect();
    const cs = getComputedStyle(m);
    const box = m.querySelector('.modal-box');
    const br = box ? box.getBoundingClientRect() : null;
    return {
      active: m.classList.contains('active'),
      userText: user ? user.textContent : null,
      bgmText: bgmBtn ? bgmBtn.textContent : null,
      exitText: exitBtn ? exitBtn.textContent : null,
      overlayRect:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},
      overlayPos: cs.position, overlayDisplay: cs.display,
      overlayJustify: cs.justifyContent, overlayAlign: cs.alignItems,
      modalBoxRect: br ? {x:Math.round(br.left),y:Math.round(br.top),w:Math.round(br.width),h:Math.round(br.height)} : null,
    };
  });
  console.log('MODAL_OPEN:', JSON.stringify(modalInfo));
  await p.screenshot({ path: SHOT + '/02_modal_open.png' });

  // 3) BGM 토글
  await p.click('#settings-modal .set-bgm-btn');
  await p.waitForTimeout(200);
  const afterBgm = await p.evaluate(() => {
    const bgmBtn = document.querySelector('#settings-modal .set-bgm-btn');
    return { bgmText: bgmBtn.textContent, sfxOn: !!(window.SFX && SFX.on) };
  });
  console.log('AFTER_BGM_TOGGLE:', JSON.stringify(afterBgm));

  // 4) 저장하고 종료
  await p.click('#settings-modal [data-action="settings.logout"]');
  await p.waitForTimeout(600);
  const afterExit = await p.evaluate(() => ({
    activeScreen: document.querySelector('.screen.active')?.id,
    authUser: window.Auth && Auth.user,
    modalStillActive: document.getElementById('settings-modal').classList.contains('active'),
  }));
  console.log('AFTER_EXIT:', JSON.stringify(afterExit));
  await p.screenshot({ path: SHOT + '/03_after_exit.png' });

  console.log('SUMMARY:', JSON.stringify({
    pageErrors: pageErrors.length,
    consoleErrors: consoleErrors.length,
    consoleErrorsSample: consoleErrors.slice(0,3),
    pageErrorsSample: pageErrors.slice(0,3),
  }));

  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
