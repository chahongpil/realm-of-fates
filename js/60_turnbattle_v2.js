'use strict';

// ─────────────────────────────────────────────────────────────
// PHASE 3 시네마틱 전투 엔진 v2 (수직 슬라이스)
// 기획서: game/PHASE3_BATTLE_CINEMATIC.md
// 스토리보드: game/docs/battle_logic_v2/1~19.png
//
// 구조 (2026-04-14 재구조화):
//  - .battle-stage : 배경 + 2×5 그리드 (상시 렌더, 한번만 빌드)
//  - .battle-overlay : 상태별 오버레이 (서브스크린 9개, display 토글)
//
// 원칙:
//  - 레거시 60_turnbattle.js 는 건드리지 않음
//  - FEATURE.CINEMATIC_BATTLE=false 기본
//  - 실 이미지 사용 (14_data_images.js CARD_IMG 매핑 경유)
//  - 모든 타이밍은 Battle.beat() / Battle.beatRaw() 경유
//  - 슬롯 기반: index.html 슬롯에 textContent/attribute 주입만
//  - 이벤트는 data-action 위임 (1개 루트 리스너)
// ─────────────────────────────────────────────────────────────

(function(global){
  const RoF = global.RoF = global.RoF || {};
  const Battle = RoF.Battle = RoF.Battle || {};

  // ── 전역 상태 ─────────────────────────────────────────────────
  Battle.state = {
    phase: 'idle',
    selectedChar: null,
    selectedSkill: null,
    hoveredTarget: null,
    previewTarget: null,
    lastCalc: null,
    queue: [],               // [{attackerId, targetId, skillId}]
    round: 1,
  };

  // ── 데모 데이터 (2×5 그리드용) ───────────────────────────────
  // 스토리보드 1번처럼 placeholder 로 번개 타이탄 10장을 깔지만,
  // 실제로는 id 에 따라 다른 이미지 매핑 가능. 수직 슬라이스는 단순화.
  // 배경 이미지: bg_battle.png
  // 캐릭터 이미지: h_m_lightning.png (근접 번개 전사) — 14_data_images.js 매핑
  // 스킬 이미지: sk_godslayer.png (legendary 액티브 느낌)
  // 수직 슬라이스: 스토리보드 1번 충실도 우선 → 10명 전부 번개 타이탄 (divine 티어).
  // 실체 출처: js/11_data_units.js id='titan' (rarity:'divine', imgKey:'titan')
  // 메모리 feedback_character_identity_check.md 준수.
  // 스탯은 원본: atk:15 hp:55 def:4 spd:3 nrg:10 luck:5. 스토리보드 표기값(23/40/9 등)
  // 은 레벨업·장비·버프 후 상태로 보이므로 원본 스탯을 따른다.
  const makeTitan = function(id, isHero){
    return {
      id: id,
      unitId: 'titan',                       // 실체 data id
      name: '번개 타이탄',
      desc: '뇌격: 전체8데미지',
      imgKey: 'titan',                        // 14_data_images.js → img/titan.png
      element: 'lightning',
      rarity: 'divine',
      atk: 15, def: 4, spd: 3, luck: 5,
      nrg: 10, currentNrg: 10, nrgReg: 2,
      hp: 55, currentHp: 55, maxHp: 55,
      isHero: !!isHero,
    };
  };
  Battle.DEMO = {
    allies: [
      makeTitan('ally_1', true),
      makeTitan('ally_2'),
      makeTitan('ally_3'),
      makeTitan('ally_4'),
      makeTitan('ally_5'),
    ],
    enemies: [
      makeTitan('enemy_1'),
      makeTitan('enemy_2'),
      makeTitan('enemy_3'),
      makeTitan('enemy_4'),
      makeTitan('enemy_5'),
    ],
    // 스킬 5장 (스토리보드 3번 충실도) — 수직 슬라이스: 첫 번째만 진짜 동작
    skills: [
      { id:'sp_lightning_strike_demo', ownerId:'ally_1',
        name:'뇌격', imgKey:'sk_godslayer', rarity:'legendary',
        attackType:'spell', damage:40,
        cost:20, costType:'nrg', tpCost:2, cooldown:2,
        critBonus:0, critMult:1.5,
        targetType:'single_enemy',
        desc:'뇌운이 하늘을 가르며 대상을 내리친다. (40 피해)',
        passive:false },
      { id:'sp_slot_2', ownerId:'ally_1', name:'석궁 사격',
        imgKey:'sk_crit_edge', rarity:'silver', attackType:'weapon',
        mult:1.2, flatBonus:2, cost:4, costType:'nrg', tpCost:1,
        desc:'석궁으로 관통 사격 (placeholder).', passive:false },
      { id:'sp_slot_3', ownerId:'ally_1', name:'잔광',
        imgKey:'sk_swift', rarity:'silver', attackType:'weapon',
        mult:1.0, flatBonus:0, cost:3, costType:'nrg', tpCost:1,
        desc:'잔상을 남기며 베기 (placeholder).', passive:false },
      { id:'sp_slot_4', ownerId:'ally_1', name:'천둥 파동',
        imgKey:'sk_rage', rarity:'gold', attackType:'spell',
        damage:25, cost:10, costType:'nrg', tpCost:1,
        desc:'충격파로 전방 2명 타격 (placeholder).', passive:false },
      { id:'sp_slot_5', ownerId:'ally_1', name:'수호 각인',
        imgKey:'sk_shield', rarity:'bronze',
        cost:0, costType:'nrg', tpCost:0,
        desc:'[패시브] 방어력 +3', passive:true },
    ],
  };

  // 유닛/스킬 조회 헬퍼
  Battle.findUnitById = function(id){
    if(!id) return null;
    const pools = [Battle.DEMO.allies, Battle.DEMO.enemies];
    for(let i=0; i<pools.length; i++){
      const f = pools[i].find(function(u){ return u.id === id; });
      if(f) return f;
    }
    return null;
  };
  Battle.findSkillById = function(id){
    if(!id) return null;
    return Battle.DEMO.skills.find(function(s){ return s.id === id; }) || null;
  };
  Battle.getSkillsOf = function(unit){
    if(!unit) return [];
    return Battle.DEMO.skills.filter(function(s){ return s.ownerId === unit.id; });
  };

  // 이미지 URL 해결 (CARD_IMG 매핑 → fallback 이모지)
  Battle.resolveImg = function(imgKey){
    if(!imgKey) return null;
    const map = (RoF.Data && RoF.Data.CARD_IMG) || {};
    return map[imgKey] || null;
  };

  // ── 서브스크린 전환 가드 ─────────────────────────────────────
  const isKnownScreen = function(id){
    return (Battle.SUB_SCREENS || []).indexOf(id) >= 0;
  };

  // 오버레이 레이어만 전환. stage(배경+그리드) 는 항상 유지.
  // opts.keepOpen: 동시 표시 허용 서브스크린 id 배열 (예: fire 중 char-focus 유지)
  Battle.showScreen = function(id, opts){
    if(!isKnownScreen(id)){
      console.warn('[v2] unknown sub-screen:', id);
      return false;
    }
    const keepOpen = (opts && opts.keepOpen) || [];
    (Battle.SUB_SCREENS || []).forEach(function(sid){
      const el = document.getElementById(sid);
      if(!el) return;
      const show = (sid === id) || keepOpen.indexOf(sid) >= 0;
      el.style.display = show ? '' : 'none';
    });
    Battle.state.phase = (Battle.SCREEN_TO_PHASE && Battle.SCREEN_TO_PHASE[id]) || id;
    return true;
  };

  // ── 원소 상성 계산 ───────────────────────────────────────────
  Battle.elementMult = function(casterEl, targetEl){
    if(!casterEl || !targetEl) return 1.0;
    const table = (RoF.Data && RoF.Data.ELEMENTS) || {};
    const entry = table[casterEl];
    if(!entry) return 1.0;
    if(entry.strong === targetEl) return 1.3;
    const tgtEntry = table[targetEl];
    if(tgtEntry && tgtEntry.strong === casterEl) return 0.77;
    return 1.0;
  };

  // ── 치명타 판정 ──────────────────────────────────────────────
  // luck, critBonus 모두 % 단위 (luck 10 = 10%). 03-terminology.md 규정.
  Battle.rollCrit = function(caster, skill){
    const luck = (caster && caster.luck) ?? 0;
    const bonus = (skill && skill.critBonus) ?? 0;
    const rate = Math.max(0, Math.min(1, (luck + bonus) / 100));
    return Math.random() < rate;
  };

  // ── 데미지 계산기 레지스트리 ────────────────────────────────
  Battle.DAMAGE_CALCULATORS = {
    spell: function(caster, target, skill){
      const dmg  = skill.damage ?? 0;
      const vuln = target.vulnerability ?? 0;
      return { base: Math.floor(dmg * (1 + vuln * 0.1)), minFinal: 0 };
    },
    weapon: function(caster, target, skill){
      const mult = skill.mult ?? 1.0;
      const flat = skill.flatBonus ?? 0;
      const pen  = skill.penetration ?? 0;
      const atk  = caster.atk ?? 0;
      const def  = target.def ?? 0;
      const raw  = Math.floor(atk * mult + flat);
      const base = Math.max(1, raw - Math.max(0, def - pen));
      return { base: base, minFinal: 1 };
    },
  };

  Battle.calcDamage = function(caster, target, skill){
    const empty = { dmg: 0, base: 0, elMult: 1, crMult: 1, isCrit: false };
    if(!caster || !target || !skill) return empty;
    const type = skill.attackType || 'weapon';
    const calc = Battle.DAMAGE_CALCULATORS[type];
    if(!calc){ console.warn('[v2] unknown attackType:', type); return empty; }
    const { base, minFinal } = calc(caster, target, skill);
    const elMult = Battle.elementMult(caster.element, target.element);
    const isCrit = Battle.rollCrit(caster, skill);
    const crMult = isCrit ? (skill.critMult ?? 1.5) : 1.0;
    const raw = Math.floor(base * elMult * crMult);
    const dmg = Math.max(minFinal, raw);
    return { dmg: dmg, base: base, elMult: elMult, crMult: crMult, isCrit: isCrit };
  };

  // ── 비용 소모기 레지스트리 ──────────────────────────────────
  Battle.COST_CONSUMERS = {
    nrg: function(caster, skill){
      const cost = skill.cost ?? 0;
      caster.currentNrg = Math.max(0, (caster.currentNrg ?? 0) - cost);
      caster.usedNrgThisRound = true;
    },
    hp: function(caster, skill){
      const cost = skill.cost ?? 0;
      caster.currentHp = Math.max(0, (caster.currentHp ?? 0) - cost);
    },
    sacrifice: function(caster, skill){
      console.warn('[v2] sacrifice costType not implemented in vertical slice');
    },
  };

  Battle.consumeCost = function(caster, skill){
    if(!caster || !skill) return;
    const type = skill.costType || 'nrg';
    const fn = Battle.COST_CONSUMERS[type];
    if(!fn){ console.warn('[v2] unknown costType:', type); return; }
    fn(caster, skill);
  };

  Battle.applyDamage = function(target, dmg){
    if(!target || !dmg) return;
    target.currentHp = Math.max(0, (target.currentHp ?? 0) - dmg);
  };
  Battle.isDead = function(unit){
    return !!unit && (unit.currentHp ?? 0) <= 0;
  };

  // 큐(라운드 단위)와 round 는 보존. 선택/호버 상태만 초기화.
  Battle.resetState = function(){
    const prevRound = Battle.state.round || 1;
    const prevQueue = Battle.state.queue || [];
    Battle.state = {
      phase: 'idle',
      selectedChar: null,
      selectedSkill: null,
      hoveredTarget: null,
      previewTarget: null,
      lastCalc: null,
      queue: prevQueue,
      round: prevRound,
    };
  };

  // ── 2×5 그리드 빌드 (한번만 — 상시 보임) ─────────────────────
  // 카드 DOM 은 직접 생성하지만 이건 "사전 선언된 슬롯" 의 반복 렌더 버전.
  // 이후 각 카드 내부는 slot selector 로 갱신 가능.
  const buildCardEl = function(unit, side){
    const el = document.createElement('div');
    el.className = 'bv2-card bv2-card-' + side + (unit.isHero ? ' bv2-card-hero' : '');
    el.setAttribute('data-unit-id', unit.id);
    el.setAttribute('data-action', side === 'ally' ? 'v2.charClick' : 'v2.targetClick');
    el.setAttribute('data-hover', side === 'ally' ? '' : 'v2.targetHover');

    const img = Battle.resolveImg(unit.imgKey);
    const imgHTML = img
      ? '<img class="bv2c-img" src="' + img + '" alt="">'
      : '<div class="bv2c-icon">⚔️</div>';

    el.innerHTML =
      '<div class="bv2c-frame">' +
        imgHTML +
        '<div class="bv2c-frame-overlay"></div>' +
        '<div class="bv2c-status-row"></div>' +    // 상태이상 배지 슬롯 (이름 위)
        '<div class="bv2c-name"></div>' +          // 상단 중앙 금색 밴드
        '<div class="bv2c-hp">♥<span class="bv2c-hp-val"></span></div>' +
        '<div class="bv2c-stats">' +
          '<span class="bv2c-atk">⚔<span class="bv2c-atk-val"></span></span>' +
          '<span class="bv2c-def">🛡<span class="bv2c-def-val"></span></span>' +
          '<span class="bv2c-spd">💨<span class="bv2c-spd-val"></span></span>' +
        '</div>' +
        '<div class="bv2c-desc"></div>' +           // 하단 설명 밴드
        '<div class="bv2c-nrg">⚡<span class="bv2c-nrg-val"></span></div>' +
      '</div>';

    // 슬롯 갱신
    el.querySelector('.bv2c-hp-val').textContent  = unit.currentHp;
    el.querySelector('.bv2c-atk-val').textContent = unit.atk ?? 0;
    el.querySelector('.bv2c-def-val').textContent = unit.def ?? 0;
    el.querySelector('.bv2c-spd-val').textContent = unit.spd ?? 0;
    el.querySelector('.bv2c-nrg-val').textContent = unit.currentNrg ?? 0;
    el.querySelector('.bv2c-name').textContent    = (unit.isHero ? '⭐ ' : '') + (unit.name || '');
    el.querySelector('.bv2c-desc').textContent    = unit.desc || '';
    return el;
  };

  const buildStageGrid = function(){
    const enemyRow = document.getElementById('bv2-enemy-row');
    const allyRow  = document.getElementById('bv2-ally-row');
    if(!enemyRow || !allyRow) return;
    enemyRow.innerHTML = '';
    allyRow.innerHTML  = '';
    Battle.DEMO.enemies.forEach(function(u){ enemyRow.appendChild(buildCardEl(u, 'enemy')); });
    Battle.DEMO.allies.forEach(function(u){ allyRow.appendChild(buildCardEl(u, 'ally')); });
  };

  // 스테이지 그리드 내 특정 카드 element 조회
  const stageCardOf = function(unit){
    if(!unit) return null;
    return document.querySelector('.battle-stage-grid .bv2-card[data-unit-id="' + unit.id + '"]');
  };

  // 카드의 HP/NRG 만 갱신 (피격 후)
  const refreshStageCard = function(unit){
    const el = stageCardOf(unit);
    if(!el) return;
    const hpEl  = el.querySelector('.bv2c-hp-val');
    const nrgEl = el.querySelector('.bv2c-nrg-val');
    if(hpEl)  hpEl.textContent  = unit.currentHp;
    if(nrgEl) nrgEl.textContent = unit.currentNrg ?? 0;
    el.classList.toggle('is-dead', Battle.isDead(unit));
  };

  // ── 슬롯 원자 조작 ──────────────────────────────────────────
  const setText = function(sel, t){ const e = document.querySelector(sel); if(e) e.textContent = t == null ? '' : String(t); };
  const setClass = function(sel, cls, on){ const e = document.querySelector(sel); if(e) e.classList.toggle(cls, !!on); };

  // FLIP origin 주입 — 클릭한 그리드 카드 rect 를 기준으로
  // bcf-main-card 가 그 위치에서 이동/확대되어 나타나도록 CSS 변수 설정.
  // 애니메이션 재시작을 위해 char-focus 스크린 클래스 토글.
  // scaleVar: CSS 변수 이름 ('--bv2-card-focus-scale' 또는 '--bv2-card-action-scale')
  const applyFocusOrigin = function(srcUnit, scaleVar){
    const focusEl = document.querySelector('#battle-char-focus .bcf-main-card');
    const cfScreen = document.getElementById('battle-char-focus');
    const container = document.getElementById('battle-v2-container');
    if(!focusEl || !cfScreen || !container) return;
    const srcEl = stageCardOf(srcUnit);
    if(!srcEl){
      focusEl.style.removeProperty('--bv2-origin-dx');
      focusEl.style.removeProperty('--bv2-origin-dy');
      focusEl.style.removeProperty('--bv2-origin-scale');
      return;
    }
    const srcRect = srcEl.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    // 최종 중앙 카드 크기
    const cssCardW = parseFloat(getComputedStyle(container).getPropertyValue('--bv2-card-w')) || 210;
    const cssCardH = parseFloat(getComputedStyle(container).getPropertyValue('--bv2-card-h')) || 290;
    const varName = scaleVar || '--bv2-card-focus-scale';
    const focusScale = parseFloat(getComputedStyle(container).getPropertyValue(varName)) || 1.8;
    const tgtW = cssCardW * focusScale;
    const tgtH = cssCardH * focusScale;
    // translate(-50%,-58%) → 카드 중심은 (cRect.cx, cRect.cy - 0.08*tgtH)
    const tgtCx = cRect.left + cRect.width / 2;
    const tgtCy = cRect.top  + cRect.height / 2 - tgtH * 0.08;
    const srcCx = srcRect.left + srcRect.width  / 2;
    const srcCy = srcRect.top  + srcRect.height / 2;
    const dx = srcCx - tgtCx;
    const dy = srcCy - tgtCy;
    const srcScale = srcRect.width / tgtW;
    focusEl.style.setProperty('--bv2-origin-dx', dx + 'px');
    focusEl.style.setProperty('--bv2-origin-dy', dy + 'px');
    focusEl.style.setProperty('--bv2-origin-scale', srcScale);
    // 애니메이션 재시작 — 동일 키프레임 연타 대응
    focusEl.style.animation = 'none';
    void focusEl.offsetWidth;
    focusEl.style.animation = '';
  };

  // ── char-focus 렌더 (오버레이 확대 카드 + 스킬 펼침) ──────────
  const renderCharFocus = function(opts){
    const c = Battle.state.selectedChar;
    if(!c) return;
    const suppressSkillRow = !!(opts && opts.suppressSkillRow);
    const img = Battle.resolveImg(c.imgKey);
    const bcfImg = document.querySelector('#battle-char-focus .bcf-card-img');
    if(bcfImg){
      bcfImg.innerHTML = img ? '<img src="' + img + '" alt="">' : '';
    }
    setText('#battle-char-focus .bcf-name', (c.isHero ? '⭐ ' : '') + (c.name || ''));
    setText('#battle-char-focus .bcf-hp',   '♥' + (c.currentHp ?? 0));
    setText('#battle-char-focus .bcf-atk',  (c.atk ?? 0));
    setText('#battle-char-focus .bcf-def',  (c.def ?? 0));
    setText('#battle-char-focus .bcf-spd',  (c.spd ?? 0));
    setText('#battle-char-focus .bcf-nrg',  '⚡' + (c.currentNrg ?? 0));
    setText('#battle-char-focus .bcf-desc', (c.name || '') + ' · ' + (c.element || ''));

    // 스킬 row — 5 슬롯 사전 선언됨. 각 슬롯에 스킬 1장씩 주입.
    // suppressSkillRow: enemy counter-attack 에서는 스킬 선택 UI 불필요.
    const skillRow = document.querySelector('#battle-char-focus .bcf-skill-row');
    if(skillRow) skillRow.style.display = suppressSkillRow ? 'none' : '';
    if(!suppressSkillRow){
      const skills = Battle.getSkillsOf(c);
      const slots = document.querySelectorAll('#battle-char-focus .bcf-skill-card');
      slots.forEach(function(slot, i){
        const sk = skills[i];
        if(!sk){
          slot.style.visibility = 'hidden';
          slot.setAttribute('data-skill-id', '');
          return;
        }
        slot.style.visibility = '';
        slot.setAttribute('data-skill-id', sk.id);
        slot.classList.toggle('is-passive', sk.passive === true);
        const skImg = Battle.resolveImg(sk.imgKey);
        const skImgEl = slot.querySelector('.bsc-card-img');
        if(skImgEl) skImgEl.innerHTML = skImg ? '<img src="' + skImg + '" alt="">' : '';
        slot.querySelector('.bsc-name').textContent = sk.name;
        slot.querySelector('.bsc-cost').textContent = '⚡' + (sk.cost ?? 0) + (sk.tpCost > 1 ? ' TP' + sk.tpCost : '');
        slot.querySelector('.bsc-desc').textContent = sk.desc || '';
      });
    }

    // 그리드에서 이 카드 숨김 (중앙 확대 본이 대신 보임)
    document.querySelectorAll('.battle-stage-grid .bv2-card.is-selected')
      .forEach(function(el){ el.classList.remove('is-selected'); });
    const selEl = stageCardOf(c);
    if(selEl) selEl.classList.add('is-selected');
  };

  // P1 dim 페이즈 — 스토리보드 10·11·12.png
  // targetType 별로 유효 대상에만 is-target-valid, 나머지 전부 is-dimmed.
  // single_enemy: 적만 valid, 본인+아군 dim
  // single_ally:  아군(본인 포함)만 valid, 적 dim
  // self:         본인만 valid, 그 외 dim
  const isAllyUnit = function(u){
    return Battle.DEMO.allies.indexOf(u) >= 0;
  };
  const applyTargetDimByType = function(sk){
    clearTargetHighlight();
    const type = (sk && sk.targetType) || 'single_enemy';
    const caster = Battle.state.selectedChar;
    const cards = document.querySelectorAll('.battle-stage-grid .bv2-card');
    cards.forEach(function(el){
      const u = Battle.findUnitById(el.getAttribute('data-unit-id'));
      if(!u) return;
      const isAlly = isAllyUnit(u);
      const isSelf = caster && (u === caster);
      let valid = false;
      switch(type){
        case 'single_enemy': valid = !isAlly; break;
        case 'single_ally':  valid = isAlly;  break;  // 본인 포함
        case 'self':         valid = isSelf;  break;
        default:             valid = !isAlly;
      }
      if(valid){
        el.classList.add('is-target-valid');
      } else {
        el.classList.add('is-dimmed');
      }
    });
  };

  const renderSkillActive = function(){
    const sk = Battle.state.selectedSkill;
    if(!sk) return;
    setText('#battle-skill-active .bsa-hint', '타겟 카드를 선택하세요 (ESC 취소)');
    applyTargetDimByType(sk);
  };

  const clearTargetHighlight = function(){
    document.querySelectorAll('.battle-stage-grid .bv2-card.is-target-valid')
      .forEach(function(el){ el.classList.remove('is-target-valid'); });
    document.querySelectorAll('.battle-stage-grid .bv2-card.is-target-hover')
      .forEach(function(el){ el.classList.remove('is-target-hover'); });
    document.querySelectorAll('.battle-stage-grid .bv2-card.is-dimmed')
      .forEach(function(el){ el.classList.remove('is-dimmed'); });
  };

  // P4 HP 프리뷰 — 카드 내부 이전
  // 스토리보드 13.png: 타겟 카드의 HP 숫자를 최종값(57)으로 직접 덮어쓰고
  // 옆에 (−8) 플로팅 라벨. 호버 해제 시 원복.
  const clearHpPreview = function(){
    const prev = Battle.state.previewTarget;
    if(!prev) return;
    const el = stageCardOf(prev);
    if(el){
      const hpEl = el.querySelector('.bv2c-hp-val');
      if(hpEl) hpEl.textContent = prev.currentHp;
      const f = el.querySelector('.bv2c-hp-delta-floating');
      if(f) f.remove();
    }
    Battle.state.previewTarget = null;
  };

  const renderTargetPreview = function(){
    const c  = Battle.state.selectedChar;
    const sk = Battle.state.selectedSkill;
    const t  = Battle.state.hoveredTarget;
    if(!c || !sk || !t) return;
    clearHpPreview();  // 이전 타겟 복원
    const calc = Battle.calcDamage(c, t, sk);
    const after = Math.max(0, (t.currentHp ?? 0) - calc.dmg);
    // 하단 박스는 비활성 (폐기 방향, 호환 차원 텍스트만 비워둠)
    setText('#battle-target-preview .btp-hp-delta', '');
    // 타겟 카드 내부 HP 숫자 덮어쓰기 + 델타 플로팅
    const tgtEl = stageCardOf(t);
    if(tgtEl){
      const hpEl = tgtEl.querySelector('.bv2c-hp-val');
      if(hpEl) hpEl.textContent = after;
      if(!tgtEl.querySelector('.bv2c-hp-delta-floating')){
        const f = document.createElement('div');
        f.className = 'bv2c-hp-delta-floating';
        f.textContent = (calc.dmg >= 0 ? '−' : '+') + Math.abs(calc.dmg);
        tgtEl.appendChild(f);
      }
      // 그리드 하이라이트 갱신
      document.querySelectorAll('.battle-stage-grid .bv2-card.is-target-hover')
        .forEach(function(el){ el.classList.remove('is-target-hover'); });
      tgtEl.classList.add('is-target-hover');
    }
    Battle.state.previewTarget = t;
  };

  const renderActionFire = function(){
    // 이펙트는 CSS 애니. 데이터 주입 없음.
  };

  const renderHitReact = function(){
    const calc = Battle.state.lastCalc;
    if(!calc) return;
    setText('#battle-hit-react .bhr-dmg', String(calc.dmg));
    setClass('#battle-hit-react .bhr-dmg', 'is-crit', !!calc.isCrit);
    // 그리드 타겟 카드 흔들림 클래스
    const t = Battle.state.hoveredTarget;
    const el = stageCardOf(t);
    if(el){
      el.classList.add('is-hit');
      setTimeout(function(){ el.classList.remove('is-hit'); }, 600);
    }
  };

  const renderDeath = function(target){
    if(!target) return;
    setText('#battle-death .bd-name', (target.name || '') + ' 쓰러지다');
    const el = stageCardOf(target);
    if(el) el.classList.add('is-dead');
  };

  const renderRoundEnd = function(){
    setText('#battle-round-end .bre-msg', '라운드 ' + Battle.state.round + ' 종료');
  };

  const renderIdle = function(){
    setText('#battle-idle .bi-hint', '아군 카드를 클릭하세요');
  };

  // ── 상호작용 ─────────────────────────────────────────────────
  Battle.onCharClick = async function(unit){
    if(!unit || !unit.id){
      unit = Battle.DEMO.allies[0];
    }
    // 이미 이번 라운드 큐잉된 아군은 재선택 불가
    if(isAllyQueued(unit)) return;
    if(Battle.isDead(unit)) return;
    Battle.state.selectedChar = unit;
    Battle.state.selectedSkill = null;
    // FLIP origin 은 showScreen 이전에 계산해야 srcEl 이 아직 숨김 안 된 상태
    applyFocusOrigin(unit);
    Battle.showScreen(Battle.SCREEN.CHAR_FOCUS);
    renderCharFocus();
    await Battle.beat(Battle.TIMING.CHAR_FOCUS_IN);
  };

  Battle.onSkillClick = async function(sk){
    if(!sk || !sk.id) sk = Battle.getSkillsOf(Battle.state.selectedChar)[0];
    if(!sk || sk.passive === true) return;
    Battle.state.selectedSkill = sk;
    Battle.showScreen(Battle.SCREEN.SKILL_ACTIVE);
    renderSkillActive();
    await Battle.beat(Battle.TIMING.SKILL_ROW_IN);
  };

  Battle.onTargetHover = function(tgt){
    if(!tgt || !tgt.id) return;
    // skill-active 상태에서만 호버 반응
    if(Battle.state.phase !== Battle.PHASE.SKILL_ACTIVE &&
       Battle.state.phase !== Battle.PHASE.TARGET_PREVIEW) return;
    Battle.state.hoveredTarget = tgt;
    Battle.showScreen(Battle.SCREEN.TARGET_PREVIEW);
    renderTargetPreview();
  };

  // 기본 무기 공격 스킬 stub (적 카운터용)
  const BASIC_ATTACK_SKILL = {
    id:'sp_basic_enemy', name:'기본 공격',
    attackType:'weapon', mult:1.0, flatBonus:0, penetration:0,
    cost:0, costType:'nrg', critBonus:0, critMult:1.5,
    targetType:'single_enemy', desc:'기본 공격', passive:false,
  };

  // 내부 공통 — 한 유닛이 타겟에게 1회 공격 (플레이어/적 공통).
  // opts.preSelectedSkill: 스킬 row 를 건너뛰고 바로 중앙 확대 → fire 흐름.
  // opts.showSkillRow: 플레이어 스킬 선택 UI 표시 여부.
  const performAttack = async function(attacker, tgt, skill){
    if(!attacker || !tgt || !skill) return;
    if(Battle.isDead(attacker) || Battle.isDead(tgt)) return;

    const calc = Battle.calcDamage(attacker, tgt, skill);
    Battle.state.lastCalc = calc;
    Battle.state.selectedChar = attacker;
    Battle.state.selectedSkill = skill;
    Battle.state.hoveredTarget = tgt;

    // 액션 모드 — 1.5배 (선택 확대는 1.8배). CSS 가 is-action-mode 로 크기 결정.
    const cfScreenEl = document.getElementById('battle-char-focus');
    if(cfScreenEl) cfScreenEl.classList.add('is-action-mode');
    applyFocusOrigin(attacker, '--bv2-card-action-scale');
    Battle.showScreen(Battle.SCREEN.CHAR_FOCUS);
    renderCharFocus({ suppressSkillRow: true });
    await Battle.beat(Battle.TIMING.CHAR_FOCUS_IN);

    // fire 모드
    const container = document.getElementById('battle-v2-container');
    if(container) container.classList.add('is-fire-mode');
    Battle.showScreen(Battle.SCREEN.ACTION_FIRE, { keepOpen: ['battle-char-focus'] });
    renderActionFire();
    await Battle.beat(Battle.TIMING.FIRE_TRAVEL);

    // 데미지 적용 (cards opacity 0 중이므로 flicker 없음)
    Battle.applyDamage(tgt, calc.dmg);
    refreshStageCard(tgt);

    if(container) container.classList.remove('is-fire-mode');
    Battle.showScreen(Battle.SCREEN.HIT_REACT, { keepOpen: ['battle-char-focus'] });
    renderHitReact();
    if(calc.isCrit) await Battle.beatRaw(Battle.TIMING.HIT_STOP);
    await Battle.beat(Battle.TIMING.HIT_SHAKE);

    if(Battle.isDead(tgt)){
      Battle.showScreen(Battle.SCREEN.DEATH, { keepOpen: ['battle-char-focus'] });
      renderDeath(tgt);
      await Battle.beat(Battle.TIMING.DEATH_OUT);
    }

    Battle.consumeCost(attacker, skill);
    refreshStageCard(attacker);

    // 원위치 복귀
    const cfEl = document.getElementById('battle-char-focus');
    if(cfEl){
      cfEl.classList.add('is-returning');
      await Battle.beatRaw(260);
      cfEl.classList.remove('is-returning');
      cfEl.classList.remove('is-action-mode');
    }
    document.querySelectorAll('.battle-stage-grid .bv2-card.is-selected')
      .forEach(function(el){ el.classList.remove('is-selected'); });
  };
  Battle.performAttack = performAttack;

  // ── 큐잉 시스템 ─────────────────────────────────────────────
  // 1단계: 아군 5명 각각 스킬+타겟 선택 → 큐에 push (90초 제한, 수직슬라이스는 제한 없음)
  // 2단계: 적군 자동 큐잉 (AI 즉시)
  // 3단계: 전체 큐 SPD desc 정렬 → 순차 performAttack
  // 4단계: 라운드 종료 → 다음 라운드로 리셋

  const isAllyQueued = function(unit){
    return !!Battle.state.queue.find(function(q){ return q.attackerId === unit.id; });
  };

  const markAllyQueuedUI = function(unit){
    const el = stageCardOf(unit);
    if(el) el.classList.add('is-queued');
  };
  const clearAllQueuedUI = function(){
    document.querySelectorAll('.battle-stage-grid .bv2-card.is-queued')
      .forEach(function(el){ el.classList.remove('is-queued'); });
  };

  const allAlliesQueuedOrDead = function(){
    return Battle.DEMO.allies.every(function(a){
      return Battle.isDead(a) || isAllyQueued(a);
    });
  };

  // 적군 자동 큐잉 — 수직슬라이스: 기본 공격, 랜덤 생존 아군
  const autoQueueEnemies = function(){
    Battle.DEMO.enemies.forEach(function(e){
      if(Battle.isDead(e)) return;
      const targets = Battle.DEMO.allies.filter(function(a){ return !Battle.isDead(a); });
      if(!targets.length) return;
      const tgt = targets[Math.floor(Math.random() * targets.length)];
      Battle.state.queue.push({
        attackerId: e.id, targetId: tgt.id, skillId: BASIC_ATTACK_SKILL.id, _basic: true
      });
    });
  };

  // 큐 실행 — SPD desc 순
  const executeQueue = async function(){
    const items = Battle.state.queue.slice().map(function(q){
      const attacker = Battle.findUnitById(q.attackerId);
      const target   = Battle.findUnitById(q.targetId);
      const skill    = q._basic ? BASIC_ATTACK_SKILL : Battle.findSkillById(q.skillId);
      return { attacker: attacker, target: target, skill: skill };
    }).filter(function(x){ return x.attacker && x.target && x.skill; });

    items.sort(function(a,b){
      return ((b.attacker.spd||0) - (a.attacker.spd||0));
    });

    for(let i = 0; i < items.length; i++){
      const it = items[i];
      // 사망 체크 — 큐 실행 도중 죽었으면 스킵
      if(Battle.isDead(it.attacker)) continue;
      // 타겟이 죽었으면 같은 편 다른 생존 유닛으로 리타겟 (벡터 공격은 버림)
      let target = it.target;
      if(Battle.isDead(target)){
        const side = isAllyUnit(target) ? Battle.DEMO.allies : Battle.DEMO.enemies;
        const alt = side.filter(function(u){ return !Battle.isDead(u); });
        if(!alt.length) continue;
        target = alt[Math.floor(Math.random()*alt.length)];
      }
      await performAttack(it.attacker, target, it.skill);
      await Battle.beat(Battle.TIMING.BETWEEN_ACTION);
    }
  };

  // 자동 전투 — 미큐잉 아군 전부 기본 공격으로 자동 큐잉 후 즉시 실행
  Battle.onAutoBattle = async function(){
    Battle.DEMO.allies.forEach(function(a){
      if(Battle.isDead(a) || isAllyQueued(a)) return;
      const targets = Battle.DEMO.enemies.filter(function(e){ return !Battle.isDead(e); });
      if(!targets.length) return;
      const tgt = targets[Math.floor(Math.random() * targets.length)];
      Battle.state.queue.push({
        attackerId: a.id, targetId: tgt.id, skillId: BASIC_ATTACK_SKILL.id, _basic: true
      });
      markAllyQueuedUI(a);
    });
    await startCombatExecution();
  };

  // 전투 시작 — 미큐잉 아군 있으면 확인 후 강제 종료 (대기 처리)
  Battle.onStartCombat = async function(){
    const unq = Battle.DEMO.allies.filter(function(a){
      return !Battle.isDead(a) && !isAllyQueued(a);
    });
    if(unq.length > 0){
      const msg = unq.length + '명의 유닛 턴이 남았는데도 그대로 종료하시겠습니까?\n(남은 유닛은 아무 행동도 하지 않고 대기합니다)';
      const ok = (typeof confirm === 'function') ? confirm(msg) : true;
      if(!ok) return;
    }
    // 미큐잉 아군은 대기 (큐에 추가하지 않음) — 자연스럽게 스킵됨
    await startCombatExecution();
  };

  // 큐잉 완료 → 적군 큐잉 → 실행
  const startCombatExecution = async function(){
    autoQueueEnemies();
    Battle.showScreen(Battle.SCREEN.IDLE);
    await executeQueue();
    // 라운드 종료
    Battle.state.queue = [];
    clearAllQueuedUI();
    Battle.state.round = (Battle.state.round || 1) + 1;
    Battle.showScreen(Battle.SCREEN.ROUND_END);
    renderRoundEnd();
    await Battle.beat(Battle.TIMING.ROUND_END);
    Battle.resetState();
    Battle.showScreen(Battle.SCREEN.IDLE);
    renderIdle();
  };

  Battle.onTargetClick = async function(tgt){
    const c  = Battle.state.selectedChar;
    const sk = Battle.state.selectedSkill;
    if(!c || !sk || !tgt) return;

    clearHpPreview();
    clearTargetHighlight();

    // 큐에 push (즉시 실행 금지)
    Battle.state.queue.push({
      attackerId: c.id, targetId: tgt.id, skillId: sk.id, _basic: false
    });

    // 확대 카드 축소 애니 + 아군 카드 그리드 복귀
    const cfEl = document.getElementById('battle-char-focus');
    if(cfEl){
      cfEl.classList.add('is-returning');
      await Battle.beatRaw(260);
      cfEl.classList.remove('is-returning');
    }
    document.querySelectorAll('.battle-stage-grid .bv2-card.is-selected')
      .forEach(function(el){ el.classList.remove('is-selected'); });

    markAllyQueuedUI(c);
    Battle.state.selectedChar = null;
    Battle.state.selectedSkill = null;
    Battle.state.hoveredTarget = null;

    // 전체 아군 큐잉 완료 판정
    if(allAlliesQueuedOrDead()){
      await startCombatExecution();
    } else {
      Battle.showScreen(Battle.SCREEN.IDLE);
      renderIdle();
    }
  };

  // ── 취소 ─────────────────────────────────────────────────────
  const CANCEL_TRANSITIONS = {
    'target-preview': { to:'skill-active', clearState:['hoveredTarget'], screen:'SKILL_ACTIVE', render:'skillActive' },
    'skill-active':   { to:'char-focus',   clearState:['selectedSkill','hoveredTarget'], screen:'CHAR_FOCUS', render:'charFocus' },
    'char-focus':     { to:'idle',         clearState:['*'], screen:'IDLE', render:'idle' },
  };
  const RENDERERS = {
    idle:          function(){ renderIdle(); },
    charFocus:     function(){ renderCharFocus(); },
    skillActive:   function(){ renderSkillActive(); },
    targetPreview: function(){ renderTargetPreview(); },
  };

  Battle.cancelOne = function(){
    const rule = CANCEL_TRANSITIONS[Battle.state.phase];
    if(!rule) return;
    clearHpPreview();
    clearTargetHighlight();
    if(rule.clearState.indexOf('*') >= 0){
      document.querySelectorAll('.battle-stage-grid .bv2-card.is-selected')
        .forEach(function(el){ el.classList.remove('is-selected'); });
      Battle.resetState();
    } else {
      rule.clearState.forEach(function(k){ Battle.state[k] = null; });
    }
    Battle.showScreen(Battle.SCREEN[rule.screen]);
    const fn = RENDERERS[rule.render];
    if(fn) fn();
  };

  Battle.close = function(){
    const container = document.getElementById('battle-v2-container');
    if(container){
      container.style.display = 'none';
      container.classList.remove('is-fire-mode');
    }
    clearHpPreview();
    clearTargetHighlight();
    document.querySelectorAll('.battle-stage-grid .bv2-card.is-selected')
      .forEach(function(el){ el.classList.remove('is-selected'); });
    const cfEl = document.getElementById('battle-char-focus');
    if(cfEl) cfEl.classList.remove('is-returning');
    Battle.resetState();
  };

  // ── 이벤트 위임 핸들러 ──────────────────────────────────────
  const getUnitFromEl = function(el){
    const card = el && el.closest && el.closest('[data-unit-id]');
    if(!card) return null;
    return Battle.findUnitById(card.getAttribute('data-unit-id'));
  };
  const getSkillFromEl = function(el){
    const card = el && el.closest && el.closest('[data-skill-id]');
    if(!card) return null;
    return Battle.findSkillById(card.getAttribute('data-skill-id'));
  };

  Battle.HANDLERS = {
    'v2.demoStart':  function(e){ Battle.onCharClick(Battle.DEMO.allies[0]); },
    'v2.charClick':  function(e){
      const u = getUnitFromEl(e.target);
      if(u) Battle.onCharClick(u);
    },
    'v2.skillClick': function(e){
      const s = getSkillFromEl(e.target) || Battle.getSkillsOf(Battle.state.selectedChar)[0];
      if(s) Battle.onSkillClick(s);
    },
    'v2.targetClick':function(e){
      const u = getUnitFromEl(e.target);
      if(u && Battle.state.selectedSkill) Battle.onTargetClick(u);
    },
    'v2.targetHover':function(e){
      const u = getUnitFromEl(e.target);
      if(u) Battle.onTargetHover(u);
    },
    'v2.autoBattle': function(){ Battle.onAutoBattle(); },
    'v2.startCombat':function(){ Battle.onStartCombat(); },
    'v2.cancel':     function(){ Battle.cancelOne(); },
    'v2.close':      function(){ Battle.close(); },
  };

  Battle._installDelegatedListeners = function(){
    const container = document.getElementById('battle-v2-container');
    if(!container || container._v2Bound) return;
    container._v2Bound = true;

    container.addEventListener('click', function(e){
      if(!RoF.FEATURE || !RoF.FEATURE.CINEMATIC_BATTLE) return;
      const el = e.target && e.target.closest && e.target.closest('[data-action]');
      if(!el) return;
      const action = el.getAttribute('data-action');
      const fn = Battle.HANDLERS[action];
      if(fn) fn(e);
    }, false);

    container.addEventListener('mouseover', function(e){
      if(!RoF.FEATURE || !RoF.FEATURE.CINEMATIC_BATTLE) return;
      const el = e.target && e.target.closest && e.target.closest('[data-hover]');
      if(!el) return;
      const action = el.getAttribute('data-hover');
      if(!action) return;
      const fn = Battle.HANDLERS[action];
      if(fn) fn(e);
    }, false);
  };

  // ── 진입점 ───────────────────────────────────────────────────
  Battle.startDemo = async function(){
    if(!RoF.FEATURE || !RoF.FEATURE.CINEMATIC_BATTLE){
      console.warn('[v2] FEATURE.CINEMATIC_BATTLE=false');
      return false;
    }
    const container = document.getElementById('battle-v2-container');
    if(!container){ console.warn('[v2] #battle-v2-container not found'); return false; }
    Battle._installDelegatedListeners();
    container.style.display = '';
    buildStageGrid();                 // 2×5 그리드 한 번 빌드
    Battle.resetState();
    Battle.showScreen(Battle.SCREEN.IDLE);
    renderIdle();
    return true;
  };

  Battle.playDemoRound = async function(){
    try{
      const ok = await Battle.startDemo();
      if(!ok) return { ok:false, step:'startDemo', phase: Battle.state.phase };
      await Battle.beat(Battle.TIMING.DEMO_PRE);

      const ally1 = Battle.DEMO.allies[0];
      await Battle.onCharClick(ally1);
      if(Battle.state.phase !== Battle.PHASE.CHAR_FOCUS) return { ok:false, step:'charClick', phase: Battle.state.phase };
      await Battle.beat(Battle.TIMING.DEMO_STEP);

      const sk = Battle.getSkillsOf(ally1)[0];
      await Battle.onSkillClick(sk);
      if(Battle.state.phase !== Battle.PHASE.SKILL_ACTIVE) return { ok:false, step:'skillClick', phase: Battle.state.phase };
      await Battle.beat(Battle.TIMING.DEMO_STEP);

      const tgt = Battle.DEMO.enemies[0];
      Battle.onTargetHover(tgt);
      if(Battle.state.phase !== Battle.PHASE.TARGET_PREVIEW) return { ok:false, step:'targetHover', phase: Battle.state.phase };
      await Battle.beat(Battle.TIMING.TARGET_PREVIEW);

      await Battle.onTargetClick(tgt);
      return { ok: Battle.state.phase === Battle.PHASE.IDLE, step:'complete', phase: Battle.state.phase };
    } catch(err){
      console.error('[v2] playDemoRound error:', err);
      return { ok:false, step:'exception', phase: Battle.state.phase, error: err && err.message };
    }
  };

  // ── 키보드 ESC 취소 ──────────────────────────────────────────
  if(typeof document !== 'undefined'){
    document.addEventListener('keydown', function(e){
      if(!RoF.FEATURE || !RoF.FEATURE.CINEMATIC_BATTLE) return;
      if(e.key === 'Escape') Battle.cancelOne();
    });

    // DEV: 타이틀 "PHASE 3 시네마틱 데모" 버튼 바인딩
    document.addEventListener('DOMContentLoaded', function(){
      if(!RoF.FEATURE || !RoF.FEATURE.CINEMATIC_BATTLE) return;
      const btn = document.getElementById('dev-phase3-demo-btn');
      if(btn){
        btn.addEventListener('click', function(){ Battle.startDemo(); });
      }
    });
  }

  if(typeof module !== 'undefined' && module.exports){
    module.exports = Battle;
  }
})(typeof window !== 'undefined' ? window : globalThis);
