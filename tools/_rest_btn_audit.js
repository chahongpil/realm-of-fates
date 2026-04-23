// town-footer 의 "🛏️ 휴식" 버튼 실제 가시성 실측
'use strict';
const { chromium } = require('playwright');
const URL = 'http://localhost:8765/index.html?mute=1';
const SHOT = 'c:/work/game/shots/rest_btn_audit';
const fs = require('fs');
try { fs.mkdirSync(SHOT, { recursive: true }); } catch(e){}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:1280, height:720} });
  const p = await ctx.newPage();
  await p.goto(URL);
  await p.waitForTimeout(700);
  // login
  await p.evaluate(() => UI.show('login-screen'));
  await p.fill('#login-id','rest_audit'); await p.fill('#login-pw','1234');
  await p.evaluate(() => Auth.login());
  await p.waitForTimeout(700);
  const msg = await p.evaluate(()=>(document.getElementById('login-msg')||{}).textContent||'');
  if(msg.trim()){
    await p.evaluate(() => UI.show('signup-screen'));
    await p.fill('#signup-id','rest_audit'); await p.fill('#signup-pw','1234'); await p.fill('#signup-pw2','1234');
    await p.evaluate(() => Auth.signup());
    await p.waitForTimeout(1500);
  }
  await p.evaluate(() => Game.showMenu && Game.showMenu());
  await p.waitForTimeout(500);

  const result = await p.evaluate(() => {
    // data-action="game.logout" 전체 스캔
    const btns = Array.from(document.querySelectorAll('[data-action="game.logout"]'));
    return btns.map((el, i) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const parentChain = [];
      let cur = el.parentElement, depth = 0;
      while(cur && depth < 6){
        const pcs = getComputedStyle(cur);
        parentChain.push({
          tag: cur.tagName,
          id: cur.id || '',
          cls: cur.className || '',
          display: pcs.display,
          visibility: pcs.visibility,
          opacity: pcs.opacity,
          height: pcs.height,
          overflow: pcs.overflow,
          rect: (() => { const rr = cur.getBoundingClientRect(); return `${Math.round(rr.left)},${Math.round(rr.top)} ${Math.round(rr.width)}x${Math.round(rr.height)}`; })()
        });
        cur = cur.parentElement;
        depth++;
      }
      return {
        idx: i,
        text: el.textContent.trim(),
        visible: el.offsetParent !== null,
        inViewport: r.top >= 0 && r.bottom <= 720 && r.left >= 0 && r.right <= 1280,
        rect: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        zIndex: cs.zIndex,
        parentChain
      };
    });
  });
  console.log(JSON.stringify(result, null, 2));

  await p.screenshot({ path: SHOT + '/01_town.png', fullPage: false });
  // 하단만 크롭
  await p.screenshot({ path: SHOT + '/02_footer_only.png', clip: { x: 0, y: 620, width: 1280, height: 100 } });
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
