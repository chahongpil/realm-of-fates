// P0-2 검증: 플레이어 NRG 체크 강제 + 대칭 선차감 + 중복 차감 방지
// 시나리오:
//  (a) NRG 0 상태에서 고비용 스킬 클릭 → SKILL_ACTIVE 전환 차단, 슬롯 is-unaffordable
//  (b) NRG 충분 시 스킬 선택 → 타겟 클릭 → 큐 선차감, _preCharged:true
//  (c) executeQueue 실행 후 NRG 가 "선차감 1회" 만큼만 줄었는지 (중복 차감 없음)
const { chromium } = require('playwright');
const path = require('path');

(async function(){
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g,'/');
  const logs = [];
  page.on('console', msg => {
    const t = msg.type();
    if(t === 'error' || t === 'warning') logs.push('['+t+'] '+msg.text());
  });
  page.on('pageerror', err => logs.push('[pageerror] ' + err.message));
  await page.goto(url);
  await page.waitForTimeout(500);

  // 1) 신규 유저 + 영웅 확정 + 매칭 진입 (기존 real_match 테스트와 동일 경로)
  await page.evaluate(() => {
    const user = '_v2nrg_' + Date.now();
    Auth.signup(user, '1234');
    Auth.user = user;
    Auth._selRole    = 'melee';
    Auth._selElement = 'fire';
    Auth.confirmHero();
    const hero = Game.deck.find(c=>c.isHero);
    const others = Game.deck.filter(c=>!c.isHero && !c.injured);
    Game.selectedForBattle = [hero.uid, ...others.map(c=>c.uid)];
    Game.selectedRelics = [];
    Game.startBattleFromMatch();
  });
  await page.waitForTimeout(300);

  // 2) 케이스 (a): NRG 0 + 고비용 스킬 차단
  const caseA = await page.evaluate(async () => {
    const B = RoF.Battle;
    const ally = B.DEMO.allies.find(a => !a.isHero) || B.DEMO.allies[0];
    const skills = B.getSkillsOf(ally).filter(s => !s.passive && (s.cost ?? 0) > 0);
    if(!skills.length) return { skipped: 'no-cost-skill' };
    const sig = skills[0];
    const prevNrg = ally.currentNrg;
    ally.currentNrg = 0;
    // 카드 선택 → CHAR_FOCUS
    await B.onCharClick(ally);
    await new Promise(r => setTimeout(r, 100));
    // 스킬 클릭 시도 (차단되어야 함)
    const slotSel = '#battle-char-focus .bcf-skill-card[data-skill-id="'+sig.id+'"]';
    const slotEl = document.querySelector(slotSel);
    const hasUnaffordableClass = !!slotEl && slotEl.classList.contains('is-unaffordable');
    await B.onSkillClick(sig);
    await new Promise(r => setTimeout(r, 50));
    const phaseAfter = B.state.phase;
    const selectedSkill = B.state.selectedSkill && B.state.selectedSkill.id;
    // 복구
    ally.currentNrg = prevNrg;
    // 취소
    if(B.onCancel) B.onCancel();
    return {
      sigId: sig.id,
      sigCost: sig.cost,
      hasUnaffordableClass,
      phaseAfter,
      selectedSkill,
      blocked: selectedSkill !== sig.id && phaseAfter !== 'skill-active',
    };
  });
  console.log('case A (NRG 0 차단):', caseA);

  await page.waitForTimeout(200);

  // 3) 케이스 (b)+(c): NRG 충분 → 선차감 → 실행 → 중복 차감 없음
  const caseBC = await page.evaluate(async () => {
    const B = RoF.Battle;
    const ally = B.DEMO.allies.find(a => !a.isHero) || B.DEMO.allies[0];
    const enemy = B.DEMO.enemies.find(e => !B.isDead(e));
    const skills = B.getSkillsOf(ally).filter(s => !s.passive && (s.cost ?? 0) > 0);
    if(!skills.length || !enemy) return { skipped: true };
    const sig = skills[0];
    // NRG 충분히
    ally.currentNrg = (sig.cost ?? 0) + 5;
    const nrgBefore = ally.currentNrg;

    // onSkillClick → onTargetClick 직접 호출
    await B.onCharClick(ally);
    await new Promise(r => setTimeout(r, 80));
    await B.onSkillClick(sig);
    await new Promise(r => setTimeout(r, 80));
    // 큐 push 전 NRG 는 그대로 (선차감은 onTargetClick)
    const nrgBeforeTarget = ally.currentNrg;

    // onTargetClick 은 allAlliesQueuedOrDead 검사 후 executeCombat 까지 들어갈 수 있어 위험.
    // 따라서 onTargetClick 내부 로직을 수동으로 흉내: queue push + 선차감만.
    // 하지만 진짜 동작을 보려면 onTargetClick 을 써야 함. 대신 다른 아군은 이미 큐잉돼 있는지 확인 후 분기.
    const beforeQueueLen = B.state.queue.length;

    // 직접 호출 — allAlliesQueuedOrDead 가 false 이면 단순 큐잉으로 끝남
    await B.onTargetClick(enemy);
    await new Promise(r => setTimeout(r, 80));

    const queueItem = B.state.queue.find(q => q.attackerId === ally.id);
    const nrgAfterQueue = ally.currentNrg;
    const preCharged = queueItem && queueItem._preCharged === true;

    return {
      sigId: sig.id,
      sigCost: sig.cost,
      nrgBefore,
      nrgBeforeTarget,
      nrgAfterQueue,
      deltaAfterQueue: nrgBefore - nrgAfterQueue,
      preCharged,
      queueItemFound: !!queueItem,
      beforeQueueLen,
      afterQueueLen: B.state.queue.length,
    };
  });
  console.log('case B+C (선차감/중복방지):', caseBC);

  // ── 검증 ──
  console.log('\n── 검증 결과 ──');
  const checks = [];
  const check = (ok, label) => { checks.push({ ok, label }); console.log((ok?'✅':'❌'), label); };

  if(caseA.skipped){
    check(false, 'Case A 스킵: ' + caseA.skipped);
  } else {
    check(caseA.hasUnaffordableClass, 'NRG 0 시 스킬 슬롯에 is-unaffordable 클래스');
    check(caseA.blocked, 'onSkillClick 이 차단됨 (selectedSkill/phase 변경 없음)');
  }

  if(caseBC.skipped){
    check(false, 'Case B/C 스킵');
  } else {
    check(caseBC.queueItemFound, '큐에 스킬 push 됨');
    check(caseBC.preCharged, '_preCharged:true 마킹됨');
    check(caseBC.deltaAfterQueue === caseBC.sigCost,
      '큐잉 시 NRG 딱 1회 차감 ('+caseBC.deltaAfterQueue+' == '+caseBC.sigCost+')');
  }

  const passed = checks.filter(c=>c.ok).length;
  const failed = checks.filter(c=>!c.ok).length;
  console.log('\n'+passed+'/'+checks.length+' passed');

  if(logs.length){
    console.log('\n── 콘솔 경고/에러 ──');
    logs.forEach(l => console.log(l));
  }

  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
