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
    if (type === "error")   { consoleErrors.push({ t: now(), text }); console.log("[CERR]", text); }
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
  await page.waitForTimeout(800);
  let loginMsg = await page.evaluate(() => { const el = document.getElementById("login-msg"); return el ? el.textContent : ""; });
  if (loginMsg && loginMsg.trim()) {
    mark("signup-needed", { loginMsg });
    await page.evaluate(() => UI.show("signup-screen"));
    await page.waitForTimeout(200);
    await page.fill("#signup-id", "play_director");
    await page.fill("#signup-pw", "1234");
    await page.fill("#signup-pw2", "1234");
    await page.evaluate(() => Auth.signup());
    await page.waitForTimeout(1500);
  }
  const user = await page.evaluate(() => Auth.user);
  mark("logged-in", { user });
  await page.screenshot({ path: OUT + "/01_login.png" });
  await page.evaluate(() => {
    if (typeof Game !== "undefined") {
      Game.showMenu && Game.showMenu();
    }
  });
  await page.waitForTimeout(500);
  mark("town-shown");
  await page.screenshot({ path: OUT + "/02_town.png" });
  const deckInfo = await page.evaluate(() => {
    const g = Game;
    return { deckLen: g.deck ? g.deck.length : 0, heroCount: (g.deck||[]).filter(c=>c.isHero).length, nonHeroCount: (g.deck||[]).filter(c=>!c.isHero).length, relicsCount: (g.ownedRelics||[]).length, ap: g.ap, gold: g.gold };
  });
  mark("deck-info", deckInfo);
  const beforeBattle = pageErrors.length;
  await page.evaluate(() => Game.startBattle && Game.startBattle());
  await page.waitForTimeout(700);
  mark("startBattle-called", { pageErrorsSince: pageErrors.length - beforeBattle });
  const phase1 = await page.evaluate(() => {
    const visible = Array.from(document.querySelectorAll(".screen")).filter(s => s.offsetParent !== null).map(s => s.id);
    return { visible };
  });
  mark("post-startBattle-screen", phase1);
  await page.screenshot({ path: OUT + "/03_after_startBattle.png" });
  if (phase1.visible.includes("cardselect-screen")) {
    await page.evaluate(() => {
      const g = Game;
      const hero = g.deck.find(c => c.isHero);
      const nonHero = g.deck.filter(c => !c.isHero && !c.injured).slice(0, 3);
      g.selectedForBattle = [hero && hero.uid].concat(nonHero.map(c => c.uid)).filter(Boolean);
      g.selectedRelics = (g.ownedRelics||[]).slice(0, 2).map(r => r.uid);
      g.renderCardSelect && g.renderCardSelect();
    });
    await page.waitForTimeout(400);
    mark("cardselect-selected");
    await page.evaluate(() => Game.confirmCardSelect && Game.confirmCardSelect());
    await page.waitForTimeout(700);
    mark("confirmCardSelect-called");
  }
  const phase2 = await page.evaluate(() => {
    const visible = Array.from(document.querySelectorAll(".screen")).filter(s => s.offsetParent !== null).map(s => s.id);
    return { visible };
  });
  mark("post-confirm-screen", phase2);
  await page.screenshot({ path: OUT + "/04_matchmaking_or_formation.png" });
  const beforeBattleBtn = pageErrors.length;
  const tClickBefore = now();
  const battleButtonClickResult = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button, .btn, [onclick]"));
    function matchBattle(t){ return t && (t.indexOf("전투")>=0 || t.indexOf("개시")>=0 || t.indexOf("출전")>=0); }
    const hit = btns.find(b => matchBattle(b.textContent||""));
    if (hit) { const text = (hit.textContent||"").trim(); hit.click(); return { clicked: true, text: text.slice(0, 60) }; }
    if (typeof Game !== "undefined" && Game.startBattleFromMatch) { Game.startBattleFromMatch(); return { clicked: false, called: "startBattleFromMatch" }; }
    return { clicked: false, fallback: "none" };
  });
  mark("battle-button-trigger", battleButtonClickResult);
  await page.waitForTimeout(2000);
  const tClickAfter = now();
  mark("post-battle-btn", { newPageErrors: pageErrors.length - beforeBattleBtn, newPageErrorMsgs: pageErrors.slice(beforeBattleBtn).map(e => e.msg), elapsedMs: tClickAfter - tClickBefore });
  await page.screenshot({ path: OUT + "/05_battle_entered.png" });
  const battleCheck = await page.evaluate(() => {
    const bs = Game.battleState;
    const v2 = RoF.Battle && RoF.Battle.state;
    return {
      legacy: bs ? { round: bs.currentRound, pCards: (bs.pCards||[]).length, eCards: (bs.eCards||[]).length } : null,
      v2: v2 ? { phase: v2.phase, round: v2.round, pUnits: (v2.playerUnits||[]).length, eUnits: (v2.enemyUnits||[]).length } : null,
      visibleScreens: Array.from(document.querySelectorAll(".screen")).filter(s => s.offsetParent !== null).map(s => s.id),
      skillBarExists: !!document.getElementById("skill-bar")
    };
  });
  mark("battle-state", battleCheck);
  const guardProbe = await page.evaluate(() => {
    const G = (typeof Game !== "undefined") ? Game : null;
    if (!G) return { err: "no Game" };
    const origBS = G.battleState;
    G.battleState = { currentRound: 0, pCards: null, eCards: null };
    let threw = false, msg = "";
    try { G.updateSkillBar && G.updateSkillBar(); } catch (e) { threw = true; msg = e.message; }
    G.battleState = origBS;
    return { threw, msg };
  });
  mark("updateSkillBar-nullguard-probe", guardProbe);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: OUT + "/06_cinematic_progress.png" });
  const battleProgress = await page.evaluate(() => {
    const v2 = RoF.Battle && RoF.Battle.state;
    return v2 ? { phase: v2.phase, round: v2.round, pAlive: (v2.playerUnits||[]).filter(u=>u.currentHp>0).length, eAlive: (v2.enemyUnits||[]).filter(u=>u.currentHp>0).length, speed: v2.speed, queueing: !!v2.queueingActive } : null;
  });
  mark("battle-progress-2500ms", battleProgress);
  const speedTest = await page.evaluate(() => {
    const out = [];
    const readSpd = () => (RoF.Battle && RoF.Battle.state) ? RoF.Battle.state.speed : (typeof Game !== "undefined" ? Game.battleMultiplier : null);
    out.push({ at:"before", spd:readSpd() });
    if (RoF.Battle && typeof RoF.Battle.setSpeed === "function") {
      try { RoF.Battle.setSpeed(2); } catch(e) { return { err:"setSpeed(2)", msg:e.message, out }; }
      out.push({ at:"x2", spd:readSpd() });
      try { RoF.Battle.setSpeed(4); } catch(e) {}
      out.push({ at:"x4", spd:readSpd() });
    } else if (typeof Game.cycleSpeed === "function") {
      Game.cycleSpeed(); out.push({ at:"cycle1", spd:readSpd() });
      Game.cycleSpeed(); out.push({ at:"cycle2", spd:readSpd() });
    }
    return out;
  });
  mark("speed-test", speedTest);
  await page.waitForTimeout(2000);
  const finalState = await page.evaluate(() => {
    const v2 = RoF.Battle && RoF.Battle.state;
    return v2 ? { phase: v2.phase, round: v2.round, pAlive: (v2.playerUnits||[]).filter(u=>u.currentHp>0).length, eAlive: (v2.enemyUnits||[]).filter(u=>u.currentHp>0).length } : null;
  });
  mark("final-state", finalState);
  await page.screenshot({ path: OUT + "/07_final.png" });
  const summary = { totalMs: now(), pageErrors: pageErrors.length, pageErrorMsgs: pageErrors.map(e => e.msg), pageErrorsDetail: pageErrors.slice(0,5), consoleErrors: consoleErrors.length, consoleErrorList: consoleErrors.slice(0,20), consoleWarns: consoleWarns.length, consoleWarnList: consoleWarns.slice(0,15), log };
  fs.writeFileSync(OUT + "/summary.json", JSON.stringify(summary, null, 2));
  console.log("=== SUMMARY ===");
  console.log("pageErrors:", pageErrors.length);
  console.log("consoleErrors:", consoleErrors.length);
  console.log("consoleWarns:", consoleWarns.length);
  await browser.close();
})().catch(e => { console.error("TOPLEVEL", e); process.exit(1); });
