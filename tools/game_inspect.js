/**
 * game_inspect.js — Realm of Fates 브라우저 진입 도구
 *
 * 사용법:
 *   node tools/game_inspect.js <screen> [옵션]
 *
 * <screen>:
 *   title        — 타이틀 화면
 *   login        — 로그인 화면
 *   signup       — 회원가입 화면
 *   menu         — 로그인 후 메인 메뉴 (자동 회원가입)
 *   deck         — 덱뷰 (카드 컬렉션)
 *   tavern       — 선술집
 *   skills-grid  — SKILLS_DB 30개 전체 그리드
 *   units-grid   — UNITS 44개 전체 그리드
 *   relics-grid  — RELICS_DB 12개 전체 그리드
 *   all          — 모든 화면 순차 캡처
 *
 * 옵션:
 *   --user <name>     (기본: 홍아다)
 *   --pw <password>   (기본: 1234)
 *   --width <px>      (기본: 1400)
 *   --height <px>     (기본: 900)
 *   --out <path>      (기본: c:/work/game/shots/<screen>.png)
 *   --headed          (브라우저 창 보이기, 디버그용)
 *   --full            (전체 페이지 캡처)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0] + '*/');
  process.exit(0);
}

const screen = args[0];
const opts = {
  user: '홍아다',
  pw: '1234',
  width: 1400,
  height: 900,
  out: null,
  headed: false,
  full: false,
};
for (let i = 1; i < args.length; i++) {
  const a = args[i];
  if (a === '--headed') opts.headed = true;
  else if (a === '--full') opts.full = true;
  else if (a.startsWith('--')) opts[a.slice(2)] = args[++i];
}

// Paths resolved relative to tools/ folder (works from any cwd, and survives rename)
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'shots').replace(/\\/g, '/');
fs.mkdirSync(OUT_DIR, { recursive: true });
const outPath = opts.out || `${OUT_DIR}/${screen}.png`;

(async () => {
  const browser = await chromium.launch({ headless: !opts.headed });
  const page = await browser.newPage({
    viewport: { width: +opts.width, height: +opts.height },
    deviceScaleFactor: 1,
  });
  page.on('pageerror', e => console.log('[PAGE ERROR]', e.message));

  const filePath = 'file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/');
  await page.goto(filePath);
  await page.waitForTimeout(800);

  async function loginOrSignup() {
    await page.evaluate(() => UI.show('login-screen'));
    await page.waitForTimeout(300);
    await page.fill('#login-id', opts.user);
    await page.fill('#login-pw', opts.pw);
    await page.evaluate(() => Auth.login());
    await page.waitForTimeout(1000);
    const msg = await page.evaluate(() => document.getElementById('login-msg')?.textContent || '');
    if (msg && msg.trim()) {
      await page.evaluate(() => UI.show('signup-screen'));
      await page.waitForTimeout(300);
      await page.fill('#signup-id', opts.user);
      await page.fill('#signup-pw', opts.pw);
      await page.fill('#signup-pw2', opts.pw);
      await page.evaluate(() => Auth.signup());
      await page.waitForTimeout(1500);
    }
    // Ensure buildings are initialized (may be skipped for fresh user)
    await page.evaluate(() => {
      if (typeof Game !== 'undefined') {
        Game.buildings = Game.buildings || { gate:1, library:1, forge:1, tavern:1, shop:1, church:1, training:1, castle:1 };
      }
    });
  }

  async function renderGrid(dbName) {
    await page.evaluate((db) => {
      // const declarations aren't on window; use eval to access lexical globals
      const list = (0, eval)(db);
      if (!Array.isArray(list)) throw new Error(`${db} not found or not array`);
      const old = document.getElementById('diag-grid');
      if (old) old.remove();
      const box = document.createElement('div');
      box.id = 'diag-grid';
      box.style.cssText = 'position:fixed;inset:0;background:#0a0a14;z-index:99999;overflow:auto;padding:24px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;';
      list.forEach(item => {
        try {
          const el = (typeof mkCardEl === 'function') ? mkCardEl(item) : null;
          if (el) box.appendChild(el);
          else {
            const d = document.createElement('div');
            d.textContent = item.id + ' (no renderer)';
            d.style.color = '#aaa';
            box.appendChild(d);
          }
        } catch (e) {
          const d = document.createElement('div');
          d.textContent = 'ERR ' + item.id + ': ' + e.message;
          d.style.cssText = 'color:#f66;padding:10px;border:1px solid #f66;';
          box.appendChild(d);
        }
      });
      document.body.appendChild(box);
    }, dbName);
    await page.waitForTimeout(1200);
  }

  try {
    switch (screen) {
      case 'title':
        // already at title
        break;
      case 'login':
        await page.evaluate(() => UI.show('login-screen'));
        await page.waitForTimeout(400);
        break;
      case 'signup':
        await page.evaluate(() => UI.show('signup-screen'));
        await page.waitForTimeout(400);
        break;
      case 'menu':
        await loginOrSignup();
        await page.evaluate(() => Game.showMenu && Game.showMenu());
        await page.waitForTimeout(800);
        break;
      case 'deck':
        await loginOrSignup();
        await page.evaluate(() => Game.showDeckView && Game.showDeckView());
        await page.waitForTimeout(800);
        break;
      case 'tavern':
        await loginOrSignup();
        await page.evaluate(() => Game.showTavern && Game.showTavern());
        await page.waitForTimeout(800);
        break;
      case 'skills-grid':
        await loginOrSignup();
        await renderGrid('SKILLS_DB');
        break;
      case 'units-grid':
        await loginOrSignup();
        await renderGrid('UNITS');
        break;
      case 'relics-grid':
        await loginOrSignup();
        await renderGrid('RELICS_DB');
        break;
      case 'all':
        {
          const screens = ['title', 'login', 'signup', 'menu', 'deck', 'tavern', 'skills-grid', 'units-grid', 'relics-grid'];
          for (const s of screens) {
            console.log('Capturing:', s);
            // Re-navigate fresh for each
            await page.goto(filePath);
            await page.waitForTimeout(500);
            if (s === 'login') await page.evaluate(() => UI.show('login-screen'));
            else if (s === 'signup') await page.evaluate(() => UI.show('signup-screen'));
            else if (s !== 'title') {
              await loginOrSignup();
              if (s === 'menu') await page.evaluate(() => Game.showMenu && Game.showMenu());
              else if (s === 'deck') await page.evaluate(() => Game.showDeckView && Game.showDeckView());
              else if (s === 'tavern') await page.evaluate(() => Game.showTavern && Game.showTavern());
              else if (s === 'skills-grid') await renderGrid('SKILLS_DB');
              else if (s === 'units-grid') await renderGrid('UNITS');
              else if (s === 'relics-grid') await renderGrid('RELICS_DB');
            }
            await page.waitForTimeout(600);
            await page.screenshot({ path: `${OUT_DIR}/${s}.png`, fullPage: true });
          }
          console.log('All screens saved to', OUT_DIR);
          await browser.close();
          return;
        }
      default:
        console.error('Unknown screen:', screen);
        process.exit(1);
    }

    await page.waitForTimeout(300);
    await page.screenshot({ path: outPath, fullPage: opts.full });
    console.log('Saved:', outPath);
  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: `${OUT_DIR}/_error.png`, fullPage: true });
    console.log('Error screenshot:', `${OUT_DIR}/_error.png`);
    process.exit(1);
  }

  await browser.close();
})();
