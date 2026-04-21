/**
 * test_run.js — Realm of Fates 회귀 시나리오 자동 테스트
 * 사용:
 *   node tools/test_run.js              (전체)
 *   node tools/test_run.js --quick      (핵심 3개만)
 *   node tools/test_run.js --headed     (브라우저 창 보이기)
 *
 * 시나리오:
 *   1. title-load   — 타이틀 화면 로드, console error 0
 *   2. signup       — 회원가입 → 메뉴 진입
 *   3. menu-render  — 메뉴 화면에 모든 핵심 DOM 존재
 *   4. deckview     — 덱뷰 진입 (빈 슬롯 + 진행도 표시)
 *   5. tavern       — 선술집 진입
 *   6. card-grids   — units/skills/relics 렌더 (빈 프레임 0개)
 */
const { chromium } = require('playwright');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE_URL = 'file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/');

const args = process.argv.slice(2);
const QUICK = args.includes('--quick');
const HEADED = args.includes('--headed');

const results = [];
let pageErrors = [];

function pass(name, msg='') { results.push({name, status:'PASS', msg}); }
function fail(name, msg) { results.push({name, status:'FAIL', msg}); }

(async () => {
  const browser = await chromium.launch({ headless: !HEADED });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('pageerror', e => pageErrors.push(e.message));

  // Helper: login or signup
  async function ensureLogin(user='_test_runner', pw='1234') {
    await page.evaluate(() => UI.show('login-screen'));
    await page.waitForTimeout(200);
    await page.fill('#login-id', user);
    await page.fill('#login-pw', pw);
    await page.evaluate(() => Auth.login());
    await page.waitForTimeout(800);
    const msg = await page.evaluate(() => document.getElementById('login-msg')?.textContent || '');
    if (msg && msg.trim()) {
      await page.evaluate(() => UI.show('signup-screen'));
      await page.waitForTimeout(200);
      await page.fill('#signup-id', user);
      await page.fill('#signup-pw', pw);
      await page.fill('#signup-pw2', pw);
      await page.evaluate(() => Auth.signup());
      await page.waitForTimeout(1500);
    }
    await page.evaluate(() => {
      if (typeof Game !== 'undefined') {
        Game.buildings = Game.buildings || { gate:1, library:1, forge:1, tavern:1, shop:1, church:1, training:1, castle:1 };
      }
    });
  }

  // ── 1. title-load ──
  try {
    pageErrors = [];
    await page.goto(FILE_URL + '?mute=1');
    await page.waitForTimeout(800);
    const exists = await page.$('#title-screen');
    if (!exists) fail('title-load', 'no #title-screen');
    else if (pageErrors.length) fail('title-load', `errors: ${pageErrors.join('; ')}`);
    else pass('title-load');
  } catch (e) { fail('title-load', e.message); }

  // ── 2. signup ──
  try {
    pageErrors = [];
    await ensureLogin();
    const userName = await page.evaluate(() => Auth.user);
    if (!userName) fail('signup', 'Auth.user empty after signup');
    else if (pageErrors.length) fail('signup', `errors: ${pageErrors.join('; ')}`);
    else pass('signup', `user=${userName}`);
  } catch (e) { fail('signup', e.message); }

  // ── 3. menu-render ──
  try {
    pageErrors = [];
    await page.evaluate(() => Game.showMenu && Game.showMenu());
    await page.waitForTimeout(500);
    const ok = await page.evaluate(() => {
      const need = ['town-gold','town-gems','town-bless','town-ap','town-deck-count','town-container'];
      return need.every(id => document.getElementById(id));
    });
    if (!ok) fail('menu-render', 'missing core HUD elements');
    else if (pageErrors.length) fail('menu-render', pageErrors.join('; '));
    else pass('menu-render');
  } catch (e) { fail('menu-render', e.message); }

  if (!QUICK) {
    // ── 4. deckview ──
    try {
      pageErrors = [];
      await page.evaluate(() => Game.showDeckView && Game.showDeckView());
      await page.waitForTimeout(500);
      const stats = await page.evaluate(() => ({
        emptySlots: document.querySelectorAll('.empty-slot').length,
        titles: document.querySelectorAll('.dv-title').length,
        onb: !!document.getElementById('dv-onboarding'),
      }));
      if (stats.emptySlots === 0) fail('deckview', 'no .empty-slot rendered (expected for new user)');
      else if (stats.titles < 3) fail('deckview', `expected 3+ .dv-title, got ${stats.titles}`);
      else if (pageErrors.length) fail('deckview', pageErrors.join('; '));
      else pass('deckview', `empty=${stats.emptySlots}, titles=${stats.titles}, onboarding=${stats.onb}`);
    } catch (e) { fail('deckview', e.message); }

    // ── 5. tavern ──
    try {
      pageErrors = [];
      await page.evaluate(() => Game.showTavern && Game.showTavern());
      await page.waitForTimeout(500);
      const cards = await page.evaluate(() => document.querySelectorAll('.card-v2, .card-v4, .tavern-card-wrap').length);
      if (cards < 3) fail('tavern', `expected 3+ tavern cards, got ${cards}`);
      else if (pageErrors.length) fail('tavern', pageErrors.join('; '));
      else pass('tavern', `cards=${cards}`);
    } catch (e) { fail('tavern', e.message); }
  }

  // ── 6.5 sk_handoff apply (2026-04-19 개편: proc_double_cast 3%) ──
  try {
    pageErrors = [];
    const hf = await page.evaluate(() => {
      const sk = (typeof SKILLS_DB !== 'undefined') && SKILLS_DB.find(s => s.id === 'sk_handoff');
      if (!sk) return { err: 'sk_handoff not found in SKILLS_DB' };
      const unit = { uid:'t1', atk:5, hp:20, def:0, spd:3, nrg:0 };
      applySkillToUnit(sk, unit);
      return { procDouble: unit._procDoubleCast, ef: sk.effect, chance: sk.procChance };
    });
    if (hf.err) fail('sk_handoff', hf.err);
    else if (hf.ef !== 'proc_double_cast') fail('sk_handoff', `expected effect='proc_double_cast', got ${hf.ef}`);
    else if (hf.chance !== 3) fail('sk_handoff', `expected procChance=3, got ${hf.chance}`);
    else if (hf.procDouble !== 3) fail('sk_handoff', `expected _procDoubleCast=3, got ${hf.procDouble}`);
    else pass('sk_handoff', `proc_double_cast ${hf.chance}%`);
  } catch (e) { fail('sk_handoff', e.message); }

  // ── 6.5b 신규 스펠 4종 + sk_inferno_blast silver 강등 스펙 검증 (2026-04-21 심야) ──
  // 밸런스 감사 후 하향된 수치(sk_spark_blast dmg6→3, sk_herb_pack heal25→20) 및
  // 신규 스킬의 핵심 필드 정합성을 고정. 누군가 이 값을 건드리면 바로 실패.
  try {
    pageErrors = [];
    const spec = await page.evaluate(() => {
      const find = id => SKILLS_DB.find(s => s.id === id);
      return {
        boil:    find('sk_boil'),
        minor:   find('sk_minor_curse'),
        spark:   find('sk_spark_blast'),
        herb:    find('sk_herb_pack'),
        inferno: find('sk_inferno_blast'),
      };
    });
    const errs = [];
    const must = (label, obj, want) => {
      if (!obj) { errs.push(`${label}: not found in SKILLS_DB`); return; }
      for (const k in want) {
        if (obj[k] !== want[k]) errs.push(`${label}.${k}: want ${want[k]}, got ${obj[k]}`);
      }
    };
    must('boil',    spec.boil,    {rarity:'silver', role:'attack',   passive:true,  effect:'atk+2,luck+2'});
    must('minor',   spec.minor,   {rarity:'bronze', role:'defense',  passive:false, element:'dark',  attackType:'debuff', stat:'def', amount:-2, duration:1, cost:3, tpCost:1});
    must('spark',   spec.spark,   {rarity:'bronze', role:'attack',   passive:false, element:'fire',  attackType:'spell',  damage:3,  targetType:'all_enemies',  cost:3, tpCost:1});
    must('herb',    spec.herb,    {rarity:'silver', role:'support',  passive:false, element:'holy',  attackType:'heal',   heal:20,   targetType:'single_ally',  cost:5, tpCost:1});
    must('inferno', spec.inferno, {rarity:'silver', role:'attack',   passive:false, element:'fire',  attackType:'spell',  damage:15, cost:5, tpCost:1});
    if (errs.length) fail('skill-spec-0421', errs.slice(0,5).join(' | '));
    else pass('skill-spec-0421', '4 new + inferno silver');
  } catch (e) { fail('skill-spec-0421', e.message); }

  // ── 6.5c 신규 패시브 sk_boil 실제 적용 효과 검증 (applySkillToUnit)
  //    2026-04-21: rage 스탯 제거 → luck 보정으로 변경 (atk+2,luck+2) ──
  try {
    pageErrors = [];
    const applied = await page.evaluate(() => {
      const sk = SKILLS_DB.find(s => s.id === 'sk_boil');
      if (!sk) return { err: 'sk_boil not found' };
      const unit = { uid:'t_boil', atk:5, hp:20, def:1, spd:3, nrg:0, luck:1 };
      applySkillToUnit(sk, unit);
      return { atk: unit.atk, luck: unit.luck };
    });
    if (applied.err) fail('sk_boil-apply', applied.err);
    else if (applied.atk !== 7) fail('sk_boil-apply', `expected atk=7 (5+2), got ${applied.atk}`);
    else if (applied.luck !== 3) fail('sk_boil-apply', `expected luck=3 (1+2), got ${applied.luck}`);
    else pass('sk_boil-apply', `atk 5→${applied.atk}, luck 1→${applied.luck}`);
  } catch (e) { fail('sk_boil-apply', e.message); }

  // ── 6.6 skillIds 필드 파이프라인 (명시 액티브 vs 자동매칭 fallback) ──
  // 2026-04-21: 영웅 시스템 리뉴얼 후 h_*18종 → createHero() 동적 생성으로 변경.
  try {
    pageErrors = [];
    const si = await page.evaluate(() => {
      const heroFire  = RoF.Data.createHero({gender:'m', role:'warrior', element:'fire',  skinIndex:0});
      const heroWater = RoF.Data.createHero({gender:'m', role:'warrior', element:'water', skinIndex:0});
      const knight    = RoF.Data.UNITS.find(u => u.id === 'knight');
      return {
        heroFire:  heroFire && heroFire.skillIds,
        heroWater: heroWater && heroWater.skillIds,
        knight:    knight && knight.skillIds,
      };
    });
    const expect = (label, got, want) => JSON.stringify(got) === JSON.stringify(want)
      ? null : `${label}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`;
    const errs = [
      expect('hero_m_warrior_fire',  si.heroFire,  ['sk_flame_arrow']),
      expect('knight',               si.knight,    ['sk_healing_light']),
      expect('hero_m_warrior_water', si.heroWater, undefined),
    ].filter(Boolean);
    if (errs.length) fail('skillIds', errs.join('; '));
    else pass('skillIds', 'hero fire pinned; hero water uses fallback');
  } catch (e) { fail('skillIds', e.message); }

  // ── 6.7 card-coords (골든: 보석 좌표 정합성) ──
  // PNG에서 뽑은 진실(11_frame_coords.json)과 DOM 실측을 비교.
  // 오차 ±1.5% 이내여야 통과. 좌표 drift를 사람이 눈으로 체크할 필요 없게 만듦.
  try {
    pageErrors = [];
    const fs = require('fs');
    const truth = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'css', '11_frame_coords.json'), 'utf8'));
    await page.evaluate(() => {
      // 덱뷰에서 각 등급 카드가 렌더되도록 강제 진입
      if (typeof Game !== 'undefined' && Game.showDeckView) Game.showDeckView();
    });
    await page.waitForTimeout(400);

    const measured = await page.evaluate(() => {
      const rarities = ['bronze','silver','gold','legendary','divine'];
      const out = {};
      for (const rar of rarities) {
        const card = document.querySelector(`.card-v2.${rar}`);
        if (!card) continue;
        const cr = card.getBoundingClientRect();
        const kids = {};
        for (const k of ['hp','nrg','atk','def','spd','luck']) {
          const el = card.querySelector(`.cv-${k}`);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          // 박스 중심점 → 카드 기준 %
          kids[k] = {
            xPct: ((r.left + r.width/2) - cr.left) / cr.width * 100,
            yPct: ((r.top + r.height/2) - cr.top) / cr.height * 100,
          };
        }
        out[rar] = kids;
      }
      return out;
    });

    const drifts = [];
    for (const [rar, slots] of Object.entries(measured)) {
      const tr = truth[rar]?.slots;
      if (!tr) continue;
      for (const [name, m] of Object.entries(slots)) {
        const t = tr[name];
        if (!t) continue;
        const dx = Math.abs(m.xPct - t.xPct);
        const dy = Math.abs(m.yPct - t.yPct);
        if (dx > 1.5 || dy > 1.5) {
          drifts.push(`${rar}.${name} drift Δx=${dx.toFixed(2)}% Δy=${dy.toFixed(2)}% (PNG: ${t.xPct.toFixed(1)}/${t.yPct.toFixed(1)} vs DOM: ${m.xPct.toFixed(1)}/${m.yPct.toFixed(1)})`);
        }
      }
    }

    if (drifts.length) fail('card-coords', drifts.slice(0, 3).join(' | ') + (drifts.length > 3 ? ` +${drifts.length - 3}` : ''));
    else pass('card-coords', `${Object.keys(measured).length} rarities × ${Object.keys(Object.values(measured)[0]||{}).length} slots, all ±1.5%`);
  } catch (e) { fail('card-coords', e.message); }

  // ── 7. card-grids (DB 직접 렌더 검증) ──
  try {
    pageErrors = [];
    const grid = await page.evaluate(() => {
      const out = { skills:0, units:0, relics:0, errors:[] };
      [['SKILLS_DB','skills'],['UNITS','units'],['RELICS_DB','relics']].forEach(([k,name])=>{
        try {
          const list = (0, eval)(k);
          list.forEach(item => {
            try {
              const el = mkCardEl(item);
              if (el) out[name]++;
            } catch(e) { out.errors.push(`${k}/${item.id}: ${e.message}`); }
          });
        } catch(e) { out.errors.push(`${k}: ${e.message}`); }
      });
      return out;
    });
    if (grid.errors.length) fail('card-grids', grid.errors.join('; '));
    else if (pageErrors.length) fail('card-grids', pageErrors.join('; '));
    else pass('card-grids', `units=${grid.units}, skills=${grid.skills}, relics=${grid.relics}`);
  } catch (e) { fail('card-grids', e.message); }

  await browser.close();

  // ── 결과 출력 ──
  console.log('\n══════════════════════════════════════');
  console.log('  Realm of Fates — Test Runner');
  console.log('══════════════════════════════════════');
  let passCnt = 0, failCnt = 0;
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.name.padEnd(15)} ${r.msg}`);
    if (r.status === 'PASS') passCnt++; else failCnt++;
  }
  console.log('──────────────────────────────────────');
  console.log(`  ${passCnt} passed, ${failCnt} failed`);
  console.log('══════════════════════════════════════\n');
  process.exit(failCnt > 0 ? 1 : 0);
})();
