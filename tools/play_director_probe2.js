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
  const user = await page.evaluate(() => Auth.user);
  mark("logged-in", { user });
  const deckSetup = await page.evaluate(() => {
    if (typeof Game === "undefined" || !Game) return { err: "no Game" };
    if (typeof RoF !== "undefined" && RoF.Data && typeof RoF.Data.createHero === "function") {
      const hero = RoF.Data.createHero({ gender:"m", role:"warrior", element:"fire", skinIndex:0 });
      hero.uid = "my_hero_001";
      hero.isHero = true;
      hero.level = 1;
      hero.maxHp = hero.hp;
      hero.currentHp = hero.hp;
      hero.shield = 0;
      Game.deck = Game.deck || [];
      if (!Game.deck.find(c=>c.isHero)) Game.deck.push(hero);
    }
    const pool = (typeof UNITS !== "undefined") ? UNITS.filter(u => u.rarity==="bronze").slice(0, 3) : [];
    pool.forEach((u, i) => {
      const inst = Object.assign({}, u, { uid: "u_"+i+"_"+Math.random().toString(36).slice(2,7), level:1, equips:[], maxHp: u.hp, currentHp: u.hp, shield:0 });
      if (!Game.deck.find(c=>c.uid===inst.uid)) Game.deck.push(inst);
    });
    Game.persist && Game.persist();
    return { deckLen: Game.deck.length, heroCount: Game.deck.filter(c=>c.isHero).length, nonHero: Game.deck.filter(c=>!c.isHero).length };
  });
  mark("deck-setup", deckSetup);
  await page.evaluate(() => Game.showMenu && Game.showMenu());
  await page.waitForTimeout(400);
  mark("town-shown");
  await page.screenshot({ path: OUT + "/p2_01_town.png" });
  const beforeBattle = pageErrors.length;
  await page.evaluate(() => Game.startBattle && Game.startBattle());
  await page.waitForTimeout(700);
  const phase1 = await page.evaluate(() => ({
    visible: Array.from(document.querySelectorAll(".screen")).filter(s=>s.offsetParent!==null).map(s=>s.id)
  }));
  mark("post-startBattle", { phase1, newPageErr: pageErrors.length - beforeBattle });
  await page.screenshot({ path: OUT + "/p2_02_cardselect.png" });
  if (phase1.visible.includes("cardselect-screen")) {
    await page.evaluate(() => {
      const hero = Game.deck.find(c=>c.isHero);
      const nonHero = Game.deck.filter(c=>!c.isHero && !c.injured).slice(0,3);
      Game.selectedForBattle = [hero && hero.uid].concat(nonHero.map(c=>c.uid)).filter(Boolean);
      Game.selectedRelics = [];
      Game.renderCardSelect && Game.renderCardSelect();
    });
    await page.waitForTimeout(300);
    mark("cs-selected", { sel: await page.evaluate(()=>Game.selectedForBattle) });
    await page.evaluate(() => Game.confirmCardSelect && Game.confirmCardSelect());
    await page.waitForTimeout(800);
  }
  const phase2 = await page.evaluate(() => ({
    visible: Array.from(document.querySelectorAll(".screen")).filter(s=>s.offsetParent!==null).map(s=>s.id)
  }));
  mark("post-confirm", phase2);
  await page.screenshot({ path: OUT + "/p2_03_matchmaking.png" });
  const beforeBattleBtn = pageErrors.length;
  const tClickBefore = now();
  const clickResult = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button, .btn, [onclick]"));
    function match(t){ return t && (t.indexOf("출전")>=0 || t.indexOf("전투")>=0 || t.indexOf("개시")>=0); }
    const hit = btns.find(b => match((b.textContent||"").trim()));
    if (hit) {
      const text = (hit.textContent||"").trim().slice(0,60);
      hit.click();
      return { clicked: true, text };
    }
    if (Game && Game.startBattleFromMatch) { Game.startBattleFromMatch(); return { clicked:false, called:"startBattleFromMatch" }; }
    return { clicked: false };
  });
  mark("battle-btn-click", clickResult);
  await page.waitForTimeout(2500);
  const tAfter = now();
  mark("post-battle-btn", {
    newPageErrors: pageErrors.length - beforeBattleBtn,
    newPageErrorMsgs: pageErrors.slice(beforeBattleBtn).map(e=>e.msg),
    elapsedMs: tAfter - tClickBefore
  });
  await page.screenshot({ path: OUT + "/p2_04_battle.png" });
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
    if (typeof Game === "undefined") return { err: "no Game" };
    const origBS = Game.battleState;
    Game.battleState = { currentRound: 0, pCards: null, eCards: null };
    let threw = false, msg = "";
    try { Game.updateSkillBar && Game.updateSkillBar(); } catch (e) { threw = true; msg = e.message; }
    Game.battleState = origBS;
    return { threw, msg };
  });
  mark("updateSkillBar-nullguard-probe", guardProbe);
  await page.waitForTimeout(4000);
  const mid = await page.evaluate(() => {
    const v2 = RoF.Battle && RoF.Battle.state;
    return v2 ? { phase: v2.phase, round: v2.round, pAlive: (v2.playerUnits||[]).filter(u=>u.currentHp>0).length, eAlive: (v2.enemyUnits||[]).filter(u=>u.currentHp>0).length, speed: v2.speed } : null;
  });
  mark("mid-battle-6500ms", mid);
  await page.screenshot({ path: OUT + "/p2_05_mid.png" });
  const speedProbe = await page.evaluate(() => {
    const out = [];
    const read = () => (RoF.Battle && RoF.Battle.state) ? RoF.Battle.state.speed : null;
    out.push({ at:"before", spd:read() });
    if (RoF.Battle && typeof RoF.Battle.setSpeed === "function") {
      try { RoF.Battle.setSpeed(2); out.push({ at:"x2", spd:read() }); } catch(e) { out.push({ at:"err-x2", msg:e.message }); }
      try { RoF.Battle.setSpeed(4); out.push({ at:"x4", spd:read() }); } catch(e) { out.push({ at:"err-x4", msg:e.message }); }
      try { RoF.Battle.setSpeed(1); out.push({ at:"x1", spd:read() }); } catch(e) { out.push({ at:"err-x1", msg:e.message }); }
    }
    return out;
  });
  mark("speed-probe", speedProbe);
  await page.waitForTimeout(4000);
  const final = await page.evaluate(() => {
    const v2 = RoF.Battle && RoF.Battle.state;
    return v2 ? { phase: v2.phase, round: v2.round, pAlive: (v2.playerUnits||[]).filter(u=>u.currentHp>0).length, eAlive: (v2.enemyUnits||[]).filter(u=>u.currentHp>0).length } : null;
  });
  mark("final", final);
  await page.screenshot({ path: OUT + "/p2_06_final.png" });
  const summary = { totalMs: now(), pageErrors: pageErrors.length, pageErrorMsgs: pageErrors.map(e=>e.msg), pageErrorsDetail: pageErrors.slice(0,8), consoleErrors: consoleErrors.length, consoleErrorList: consoleErrors.slice(0,25), consoleWarns: consoleWarns.length, consoleWarnList: consoleWarns.slice(0,15), log };
  fs.writeFileSync(OUT + "/summary2.json", JSON.stringify(summary, null, 2));
  console.log("=== SUMMARY ===");
  console.log("pageErrors:", pageErrors.length);
  console.log("consoleErrors:", consoleErrors.length);
  console.log("consoleWarns:", consoleWarns.length);
  await browser.close();
})().catch(e => { console.error("TOPLEVEL", e); process.exit(1); });
