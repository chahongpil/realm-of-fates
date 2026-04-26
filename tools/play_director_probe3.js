const { chromium } = require("playwright");
const fs = require("fs");
const URL = "http://localhost:8765/index.html?mute=1";
const OUT = "c:/tmp/rof-play";
const log = [];
const t0 = Date.now();
const now = () => Date.now() - t0;
const mark = (n, extra) => { const e = Object.assign({ t: now(), n }, extra||{}); log.push(e); console.log(JSON.stringify(e)); };
const pageErrors = [];
const consoleErrors = [];
const consoleWarns = [];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on("pageerror", e => { pageErrors.push({ t: now(), msg: e.message }); console.log("[PAGEERROR]", e.message); });
  page.on("console", msg => {
    const type = msg.type(); const text = msg.text();
    if (type === "error")   { consoleErrors.push({ t: now(), text }); console.log("[CERR]", text.slice(0,200)); }
    if (type === "warning") { consoleWarns.push({ t: now(), text });  }
  });
  await page.goto(URL);
  await page.waitForTimeout(800);
  mark("loaded");
  await page.evaluate(() => UI.show("login-screen"));
  await page.waitForTimeout(200);
  await page.fill("#login-id", "play_director");
  await page.fill("#login-pw", "1234");
  await page.evaluate(() => Auth.login());
  await page.waitForTimeout(1000);
  let loginMsg = await page.evaluate(() => { const el = document.getElementById("login-msg"); return el ? el.textContent : ""; });
  if (loginMsg && loginMsg.trim()) {
    await page.evaluate(() => UI.show("signup-screen"));
    await page.waitForTimeout(200);
    await page.fill("#signup-id", "play_director");
    await page.fill("#signup-pw", "1234");
    await page.fill("#signup-pw2", "1234");
    await page.evaluate(() => Auth.signup());
    await page.waitForTimeout(1800);
  }
  mark("logged-in", { user: await page.evaluate(() => Auth.user) });
  // Deck setup
  const deckSetup = await page.evaluate(() => {
    if (RoF && RoF.Data && RoF.Data.createHero) {
      const hero = RoF.Data.createHero({ gender:"m", role:"warrior", element:"fire", skinIndex:0 });
      hero.uid = "my_hero_001"; hero.isHero = true; hero.level = 1;
      hero.maxHp = hero.hp; hero.currentHp = hero.hp; hero.shield = 0;
      Game.deck = Game.deck || [];
      if (!Game.deck.find(c=>c.isHero)) Game.deck.push(hero);
    }
    const pool = (typeof UNITS !== "undefined") ? UNITS.filter(u => u.rarity==="bronze").slice(0, 3) : [];
    pool.forEach((u, i) => {
      const inst = Object.assign({}, u, { uid: "u_"+i+"_"+Math.random().toString(36).slice(2,7), level:1, equips:[], maxHp: u.hp, currentHp: u.hp, shield:0 });
      if (!Game.deck.find(c=>c.uid===inst.uid)) Game.deck.push(inst);
    });
    Game.persist && Game.persist();
    return { deckLen: Game.deck.length };
  });
  mark("deck-setup", deckSetup);
  await page.evaluate(() => Game.showMenu && Game.showMenu());
  await page.waitForTimeout(300);
  mark("town-shown");
  // startBattle → cardselect → confirmCardSelect → match screen
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
  const afterConfirm = await page.evaluate(() => ({
    visible: Array.from(document.querySelectorAll(".screen")).filter(s=>s.offsetParent!==null).map(s=>s.id)
  }));
  mark("after-confirmCardSelect", afterConfirm);
  await page.screenshot({ path: OUT + "/p3_01_match_loading.png" });
  // Wait for match-found to appear (setTimeout 1500~3000ms inside showMatchmaking)
  let foundBtn = false;
  for (let i=0; i<30; i++) {
    await page.waitForTimeout(200);
    const got = await page.evaluate(() => {
      const matchEl = document.getElementById("match-screen");
      if (!matchEl || matchEl.offsetParent === null) return { ready:false };
      const btns = Array.from(matchEl.querySelectorAll("button, .btn"));
      const chul = btns.find(b => (b.textContent||"").indexOf("출전!") >= 0);
      return { ready: !!chul, btns: btns.map(b=>(b.textContent||"").slice(0,30)) };
    });
    if (got.ready) { foundBtn = true; mark("match-found-btn-ready", { afterMs: (i+1)*200, btns:got.btns }); break; }
  }
  if (!foundBtn) mark("match-btn-not-found");
  await page.screenshot({ path: OUT + "/p3_02_match_ready.png" });

  // Click the real ⚔️ 출전! button
  const beforeBattleBtn = pageErrors.length;
  const beforeCErr = consoleErrors.length;
  const tClickBefore = now();
  const clickResult = await page.evaluate(() => {
    const matchEl = document.getElementById("match-screen");
    if (!matchEl) return { err: "no match-screen" };
    const btns = Array.from(matchEl.querySelectorAll("button, .btn"));
    const chul = btns.find(b => (b.textContent||"").indexOf("출전!") >= 0);
    if (chul) { const text = (chul.textContent||"").trim(); chul.click(); return { clicked:true, text }; }
    return { err: "no 출전 btn" };
  });
  mark("chul-click", clickResult);
  await page.waitForTimeout(3000);
  mark("post-chul-3s", {
    newPageErrors: pageErrors.length - beforeBattleBtn,
    newPageErrorMsgs: pageErrors.slice(beforeBattleBtn).map(e=>e.msg),
    newCErr: consoleErrors.length - beforeCErr,
    newCErrMsgs: consoleErrors.slice(beforeCErr).map(e=>e.text.slice(0,200)),
    elapsedMs: now() - tClickBefore
  });
  await page.screenshot({ path: OUT + "/p3_03_after_chul.png" });
  const battleState = await page.evaluate(() => {
    const bs = Game.battleState;
    const v2 = RoF.Battle && RoF.Battle.state;
    return {
      legacy: bs ? { currentRound: bs.currentRound, pCards: (bs.pCards||[]).length, eCards: (bs.eCards||[]).length } : null,
      v2: v2 ? { phase: v2.phase, round: v2.round, pUnits: (v2.playerUnits||[]).length, eUnits: (v2.enemyUnits||[]).length, pAlive: (v2.playerUnits||[]).filter(u=>u.currentHp>0).length, eAlive: (v2.enemyUnits||[]).filter(u=>u.currentHp>0).length, speed: v2.speed } : null,
      visibleScreens: Array.from(document.querySelectorAll(".screen")).filter(s=>s.offsetParent!==null).map(s=>s.id)
    };
  });
  mark("battle-state", battleState);
  const guardProbe = await page.evaluate(() => {
    const origBS = Game.battleState;
    Game.battleState = { currentRound: 0, pCards: null, eCards: null };
    let threw = false, msg = "";
    try { Game.updateSkillBar && Game.updateSkillBar(); } catch (e) { threw = true; msg = e.message; }
    Game.battleState = origBS;
    return { threw, msg };
  });
  mark("updateSkillBar-nullguard-probe", guardProbe);
  // Second probe: also test updateSkillBar invoked through the v2 path
  const guardProbe2 = await page.evaluate(() => {
    const results = [];
    for (let i=0;i<5;i++) {
      let threw = false, msg = "";
      try { Game.updateSkillBar && Game.updateSkillBar(); } catch (e) { threw = true; msg = e.message; }
      results.push({ threw, msg });
    }
    return results;
  });
  mark("updateSkillBar-live-5x", guardProbe2);
  await page.waitForTimeout(5000);
  await page.screenshot({ path: OUT + "/p3_04_cinematic.png" });
  const mid = await page.evaluate(() => {
    const v2 = RoF.Battle && RoF.Battle.state;
    return v2 ? { phase: v2.phase, round: v2.round, pAlive: (v2.playerUnits||[]).filter(u=>u.currentHp>0).length, eAlive: (v2.enemyUnits||[]).filter(u=>u.currentHp>0).length, speed: v2.speed, queueing: !!v2.queueingActive } : null;
  });
  mark("mid-8s", mid);
  // speed probe
  const speedProbe = await page.evaluate(() => {
    const out = [];
    const read = () => (RoF.Battle && RoF.Battle.state) ? RoF.Battle.state.speed : null;
    out.push({ at:"before", spd:read() });
    if (RoF.Battle && typeof RoF.Battle.setSpeed === "function") {
      try { RoF.Battle.setSpeed(2); out.push({ at:"x2", spd:read() }); } catch(e) { out.push({ at:"err-x2", msg:e.message }); }
      try { RoF.Battle.setSpeed(4); out.push({ at:"x4", spd:read() }); } catch(e) { out.push({ at:"err-x4", msg:e.message }); }
      try { RoF.Battle.setSpeed(1); out.push({ at:"x1", spd:read() }); } catch(e) { out.push({ at:"err-x1", msg:e.message }); }
    } else { out.push({ err: "no setSpeed" }); }
    return out;
  });
  mark("speed-probe", speedProbe);
  await page.waitForTimeout(5000);
  const fin = await page.evaluate(() => {
    const v2 = RoF.Battle && RoF.Battle.state;
    return v2 ? { phase: v2.phase, round: v2.round, pAlive: (v2.playerUnits||[]).filter(u=>u.currentHp>0).length, eAlive: (v2.enemyUnits||[]).filter(u=>u.currentHp>0).length } : null;
  });
  mark("final", fin);
  await page.screenshot({ path: OUT + "/p3_05_final.png" });
  const summary = { totalMs: now(), pageErrors: pageErrors.length, pageErrorMsgs: pageErrors.map(e=>e.msg), consoleErrors: consoleErrors.length, consoleErrorList: consoleErrors.slice(0,25).map(e=>e.text.slice(0,250)), consoleWarns: consoleWarns.length, log };
  fs.writeFileSync(OUT + "/summary3.json", JSON.stringify(summary, null, 2));
  console.log("=== SUMMARY ===");
  console.log("pageErrors:", pageErrors.length);
  console.log("consoleErrors:", consoleErrors.length);
  await browser.close();
})().catch(e => { console.error("TOPLEVEL", e); process.exit(1); });
