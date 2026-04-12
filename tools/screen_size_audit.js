/**
 * screen_size_audit.js — 모든 screen 컨테이너의 실측 크기/위치 감사
 *
 * 목적: 메뉴/선술집/전투 등 각 화면의 max-width, padding, safe-area 처리가
 *       10_tokens.css 베이스라인(viewport-max-w: 480px)과 일치하는지 확인.
 *
 * 사용:
 *   node tools/screen_size_audit.js
 */
const { chromium } = require('playwright');
const path = require('path');
const FILE_URL = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');

const SCREENS = [
  { key: 'title-screen',   label: '타이틀' },
  { key: 'login-screen',   label: '로그인' },
  { key: 'signup-screen',  label: '회원가입' },
  { key: 'menu-screen',    label: '마을' },
  { key: 'deckview-screen',    label: '덱' },
  { key: 'tavern-screen',  label: '선술집' },
];

const VIEWPORTS = [
  { w: 390, h: 844, name: 'mobile' },
  { w: 768, h: 1024, name: 'tablet' },
  { w: 1280, h: 800, name: 'desktop' },
];

// 토큰 기준선 (10_tokens.css에서 읽어올 수도 있지만 간단히 하드코딩)
const EXPECTED_MAX_W = 480;
const LEGACY_MAX_W = 1200;
// 2026-04-12 정책 변경: 게임플레이 화면은 1200px 기본 유지(카드게임 PC 표준).
// 480px 고정 = 스플래시/인증만. 감사 도구는 wide 화면을 블로커가 아닌 'wide OK'로 통과.
const WIDE_SCREENS = new Set(['마을','선술집','덱']);  // 1200px 허용(의도된 wide)

(async () => {
  const browser = await chromium.launch({ headless: true });
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Realm of Fates — Screen Size Audit');
  console.log(`  기준선: max-width ${EXPECTED_MAX_W}px (tokens:--viewport-max-w)`);
  console.log('═══════════════════════════════════════════════════════');

  const results = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    await page.goto(FILE_URL);
    await page.waitForTimeout(400);

    for (const s of SCREENS) {
      try {
        await page.evaluate(k => UI.show(k), s.key);
        await page.waitForTimeout(200);
        const box = await page.$eval(`#${s.key}`, el => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            w: Math.round(r.width),
            h: Math.round(r.height),
            left: Math.round(r.left),
            padL: cs.paddingLeft,
            padR: cs.paddingRight,
            padT: cs.paddingTop,
            padB: cs.paddingBottom,
            maxW: cs.maxWidth,
          };
        });
        results.push({ vp: vp.name, vpW: vp.w, screen: s.label, ...box });
      } catch (e) {
        results.push({ vp: vp.name, vpW: vp.w, screen: s.label, error: e.message.slice(0, 40) });
      }
    }
    await page.close();
  }
  await browser.close();

  // 뷰포트별 표
  for (const vp of VIEWPORTS) {
    const rows = results.filter(r => r.vp === vp.name);
    console.log(`\n── ${vp.name} (${vp.w}×${vp.h}) ──`);
    console.log('  화면           실폭   max-width         padLR         비고');
    rows.forEach(r => {
      if (r.error) {
        console.log(`  ${r.screen.padEnd(14)} ERROR ${r.error}`);
        return;
      }
      const isLegacy = WIDE_SCREENS.has(r.screen);
      const excess = vp.w > EXPECTED_MAX_W && r.w > EXPECTED_MAX_W + 2;
      let flag = '';
      if (excess) {
        flag = isLegacy && r.w <= LEGACY_MAX_W + 2
          ? '🟢 wide (의도)'
          : '🔴 기준선 초과';
      }
      console.log(
        `  ${r.screen.padEnd(14)} ${String(r.w).padStart(5)}  ${String(r.maxW).padEnd(16)}  ${(r.padL + '/' + r.padR).padEnd(12)}  ${flag}`
      );
    });
  }

  // 요약
  console.log('\n── 요약 ──');
  const desktopRows = results.filter(r => r.vp === 'desktop' && !r.error);
  const over = desktopRows.filter(r => r.w > EXPECTED_MAX_W + 2);
  const overBlocker = over.filter(r => !WIDE_SCREENS.has(r.screen) || r.w > LEGACY_MAX_W + 2);
  const overLegacy  = over.filter(r => WIDE_SCREENS.has(r.screen) && r.w <= LEGACY_MAX_W + 2);
  console.log(`데스크톱(1280) 기준선(${EXPECTED_MAX_W}px) 초과: ${over.length}/${desktopRows.length}`);
  console.log(`  🔴 블로커: ${overBlocker.length} (스플래시인데 기준선 초과)`);
  console.log(`  🟢 wide 의도: ${overLegacy.length} (게임플레이 화면, ${LEGACY_MAX_W}px 이하)`);
  if (overBlocker.length > 0) {
    console.log('  → 즉시 수정 필요: .screen-base 또는 max-width: var(--viewport-max-w) 적용');
    overBlocker.forEach(r => console.log(`     - ${r.screen}: 실폭 ${r.w}px`));
  }

  // 화면별 padding 일관성
  const padVariance = new Map();  // screen → set of padL values across vps
  results.filter(r => !r.error).forEach(r => {
    if (!padVariance.has(r.screen)) padVariance.set(r.screen, new Set());
    padVariance.get(r.screen).add(r.padL);
  });
  const inconsistent = [...padVariance.entries()].filter(([, set]) => set.size > 2);
  console.log(`패딩 편차 많은 화면 (뷰포트별 값 3종 이상): ${inconsistent.length}`);
  inconsistent.forEach(([s, set]) => {
    console.log(`  - ${s}: ${[...set].join(', ')}`);
  });
})();
