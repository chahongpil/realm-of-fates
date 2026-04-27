'use strict';

/* ============================================================
   CardComponent — 카드 UI 단일 생성자 (PHASE2_CARD_COMPONENT_UNIFY_PLAN Step 1)
   원칙:
   1. 모든 카드는 이 함수 하나에서만 태어난다.
   2. 생성 시점에 프레임/일러/이름/능력텍스트/스탯 전부 확정 (불변).
   3. 이후 변경은 setter로만: setHP/setNRG/setShield/setStatModifier/setStatus/setSelected
   4. 레벨업 등 영구 강화는 rebuild() 헬퍼로 재생성.
   ============================================================ */
RoF.CardComponent = (function(){
  function stripSystemTokens(desc){
    if(!desc) return '';
    return String(desc)
      .replace(/\[[^\]]*\]\s*/g, '')
      .replace(/\s*\(에너지\s*\d+\)\s*/g, '')
      .trim();
  }
  function mkSlot(cls, text){
    const d = document.createElement('div');
    d.className = 'cv-slot ' + cls;
    if(text != null) d.textContent = text;
    return d;
  }
  function mkBox(cls, text){
    const d = document.createElement('div');
    d.className = 'cv-box ' + cls;
    if(text != null) d.textContent = text;
    return d;
  }
  function create(unit, opts){
    opts = opts || {};
    const mode = opts.mode || 'deck';
    const scale = opts.scale || 1;
    const rarity = unit.rarity || 'bronze';
    const el = document.createElement('div');
    el.className = `card-v2 ${rarity} cv-mode-${mode}`;
    el.setAttribute('data-type', unit.type || '');
    el.setAttribute('data-uid', unit.id || '');
    // PHASE 3 방패 프레임 배선 (2026-04-18):
    //   unit.role (attack/defense/support) → data-role (dps/tank/support) 정규화
    //   unit.element (fire/water/earth/lightning/holy/dark) → data-element
    //   CSS 에서 [data-role="tank"][data-element="..."] 셀렉터로 프레임 매핑
    const ROLE_MAP = { attack:'dps', defense:'tank', support:'support' };
    el.setAttribute('data-role', ROLE_MAP[unit.role] || unit.role || '');
    if(unit.element) el.setAttribute('data-element', unit.element);
    if(scale !== 1) el.style.transform = `scale(${scale})`;

    const illust = document.createElement('div');
    illust.className = 'cv-illust';
    const img = (typeof getCardImg === 'function') ? getCardImg(unit) : null;
    if(img) illust.style.backgroundImage = `url('${img}')`;
    el.appendChild(illust);

    const frame = document.createElement('div');
    frame.className = 'cv-frame';
    el.appendChild(frame);

    const name = (unit.isHero ? '⭐ ' : '') + (unit.name || '');
    el.appendChild(mkBox('cv-name', name));

    const raceIc = (typeof RACE_ICON !== 'undefined' && RACE_ICON[unit.race]) || '';
    const elemIc = (typeof ELEM_ICON !== 'undefined' && ELEM_ICON[unit.element]) || '';
    if(raceIc || elemIc){
      const tags = mkBox('cv-tags');
      tags.textContent = raceIc + elemIc;
      el.appendChild(tags);
    }

    const isUnit = (unit.atk != null && unit.hp != null);
    const refs = {};
    if(isUnit){
      refs.hp = mkSlot('cv-hp', unit.hp); el.appendChild(refs.hp);
      refs.atk = mkSlot('cv-atk', unit.atk); el.appendChild(refs.atk);
      refs.def = mkSlot('cv-def', unit.def || 0); el.appendChild(refs.def);
      refs.spd = mkSlot('cv-spd', unit.spd || 0); el.appendChild(refs.spd);
      refs.luck = mkSlot('cv-luck', unit.luck || 0); el.appendChild(refs.luck);
      refs.atkMod = mkSlot('cv-atk-mod'); refs.atkMod.hidden = true; el.appendChild(refs.atkMod);
      refs.defMod = mkSlot('cv-def-mod'); refs.defMod.hidden = true; el.appendChild(refs.defMod);
      refs.spdMod = mkSlot('cv-spd-mod'); refs.spdMod.hidden = true; el.appendChild(refs.spdMod);
      refs.nrg = mkSlot('cv-nrg', unit.nrg || 0); el.appendChild(refs.nrg);
      refs.shield = mkBox('cv-shield'); refs.shield.hidden = true; el.appendChild(refs.shield);
      refs.status = document.createElement('div');
      refs.status.className = 'cv-status';
      el.appendChild(refs.status);
    }
    const descRaw = unit.skillDesc || unit.desc || '';
    refs.desc = mkBox('cv-desc', stripSystemTokens(descRaw));
    el.appendChild(refs.desc);

    const state = {
      currentHP: unit.hp, currentNRG: unit.nrg || 0, shield: 0,
      statMods: { atk:0, def:0, spd:0 }, statuses: {}, selected: false
    };
    const inst = {
      el, unit, _refs: refs, _state: state, _opts: opts,
      setHP(n){ state.currentHP = n; if(refs.hp) refs.hp.textContent = n; },
      setNRG(n){ state.currentNRG = n; if(refs.nrg) refs.nrg.textContent = n; },
      setShield(n){
        state.shield = n;
        if(!refs.shield) return;
        if(n > 0){ refs.shield.textContent = n; refs.shield.hidden = false; }
        else refs.shield.hidden = true;
      },
      setStatModifier(stat, delta){
        if(!(stat in state.statMods)) return;
        state.statMods[stat] = delta;
        const ref = refs[stat + 'Mod'];
        if(!ref) return;
        if(delta === 0){
          ref.hidden = true; ref.textContent = '';
          ref.classList.remove('is-buff','is-debuff');
        } else {
          ref.hidden = false;
          ref.textContent = (delta > 0 ? '+' : '') + delta;
          ref.classList.toggle('is-buff', delta > 0);
          ref.classList.toggle('is-debuff', delta < 0);
        }
      },
      setStatus(effect, turns){
        if(!refs.status) return;
        if(turns > 0) state.statuses[effect] = turns;
        else delete state.statuses[effect];
        refs.status.innerHTML = '';
        Object.keys(state.statuses).forEach(k => {
          const b = document.createElement('span');
          b.className = 'cv-status-badge cv-status-' + k;
          b.innerHTML = (RoF.CardComponent.STATUS_GLYPHS[k] || '') +
                        '<b class="cv-status-turns">' + state.statuses[k] + '</b>';
          refs.status.appendChild(b);
        });
      },
      setSelected(on){ state.selected = !!on; el.classList.toggle('selected', !!on); },
      destroy(){ if(el.parentElement) el.parentElement.removeChild(el); },
      _snapshot(){
        return {
          currentHP: state.currentHP, currentNRG: state.currentNRG,
          shield: state.shield, statMods: Object.assign({}, state.statMods),
          statuses: Object.assign({}, state.statuses), selected: state.selected
        };
      }
    };
    return inst;
  }
  function rebuild(oldInstance, newUnit){
    const parent = oldInstance.el.parentElement;
    const next = parent ? oldInstance.el.nextSibling : null;
    const snap = oldInstance._snapshot();
    const opts = oldInstance._opts;
    oldInstance.destroy();
    const fresh = create(newUnit, opts);
    fresh.setHP(Math.min(snap.currentHP, newUnit.hp));
    fresh.setNRG(Math.min(snap.currentNRG, newUnit.nrg || 0));
    fresh.setShield(snap.shield);
    fresh.setStatModifier('atk', snap.statMods.atk);
    fresh.setStatModifier('def', snap.statMods.def);
    fresh.setStatModifier('spd', snap.statMods.spd);
    Object.keys(snap.statuses).forEach(k => fresh.setStatus(k, snap.statuses[k]));
    fresh.setSelected(snap.selected);
    if(parent) parent.insertBefore(fresh.el, next);
    return fresh;
  }
  const STATUS_GLYPHS = {
    burn: '<svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true"><path fill="currentColor" d="M7 1.2c-.4 1.8-1.6 2.7-2.6 4.1-1.1 1.6-1.3 3.4-.3 4.8 1 1.5 2.9 2 4.4 1.4 1.7-.7 2.7-2.6 2.3-4.4-.3-1.3-1.2-2.2-1.8-3.3.1 1-.1 1.8-.7 1.9-.5.1-.8-.5-.6-1.5.1-.9.2-1.9-.7-3z"/><circle cx="7" cy="9" r="1.3" fill="rgba(0,0,0,.45)"/></svg>',
    poison: '<svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true"><path fill="currentColor" d="M7 1.5C4.2 1.5 2 3.6 2 6.3c0 1.5.7 2.7 1.7 3.5v1.4c0 .4.3.8.8.8h1v-.9h.8v.9h1.4v-.9h.6v.9H9.7v-.9h.8v.9h1c.5 0 .8-.4.8-.8V9.8c1-.8 1.7-2 1.7-3.5 0-2.7-2.2-4.8-5-4.8z"/><circle cx="5.2" cy="6.3" r="1.2" fill="rgba(0,0,0,.7)"/><circle cx="8.8" cy="6.3" r="1.2" fill="rgba(0,0,0,.7)"/><path d="M6 9.2h2" stroke="rgba(0,0,0,.6)" stroke-width="1" stroke-linecap="round"/></svg>',
    frozen: '<svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true"><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1.8" y1="4" x2="12.2" y2="10"/><line x1="1.8" y1="10" x2="12.2" y2="4"/><path d="M7 2.8 5.6 4.2 M7 2.8 8.4 4.2 M7 11.2 5.6 9.8 M7 11.2 8.4 9.8"/><path d="M2.8 4.5 4.3 4.6 M2.8 9.5 4.3 9.4 M11.2 4.5 9.7 4.6 M11.2 9.5 9.7 9.4"/></g><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>',
    invincible: '<svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true"><path fill="currentColor" d="M7 1 12.5 2.4v5.1c0 2.8-2.2 5-5.5 6.2-3.3-1.2-5.5-3.4-5.5-6.2V2.4z"/><path d="M7 4 7 10.5 M4.2 7.3 9.8 7.3" stroke="rgba(0,0,0,.55)" stroke-width="1.3" stroke-linecap="round"/></svg>'
  };
  return { create, rebuild, stripSystemTokens, STATUS_GLYPHS };
})();
window.CardComponent = RoF.CardComponent;

// Phase 3: card/relic DOM builders → RoF.dom.* (+ window.* 호환)
RoF.dom = RoF.dom || {};

// Card V2 — 다크 석재 고딕 프레임 (2026-04-12)
// 프레임은 등급(rarity)에 의해 결정: bronze/silver/gold/legendary/divine
// 유닛/영웅: 프레임 + 일러스트 + 스탯 오버레이 (card-v2 구조)
// 스킬/유물: 프레임 + 이름 + 설명만
// 2026-04-12: mkCardEl 내부를 CardComponent 호출로 위임 (Step 3 이주).
// 기존 호출부(tavern/deck/castle/battle/round) 는 el 반환만 기대하므로 .el 를 넘김.
// 호출부에서 setHP/setSelected 등을 쓰고 싶으면 CardComponent.create() 직접 사용.
RoF.dom.mkCardEl = function(c){
  return RoF.CardComponent.create(c, {mode:'deck'}).el;
};

RoF.dom.mkRelicEl = function(r){
  // 2026-04-22: V4 프레임 통일. 유닛과 같은 .card-v4 사용 + opts.kind 컴팩트 모드.
  //   id prefix 로 판별 — 유물 rl_*, 스펠 sk_*. (둘 다 effect 필드 있어서 effect 판별 불가)
  const kind = (typeof r.id === 'string' && r.id.startsWith('rl_')) ? 'relic' : 'spell';
  const inst = RoF.CardV4Component.create(r, { kind });
  return inst.el;
};

RoF.dom.mkMini = function(c){
  const d=document.createElement('div');d.className=`deck-mini ${c.rarity||'bronze'}`;
  const eq=(c.equips||[]).map(e=>`<span>${e.icon}</span>`).join('');
  d.innerHTML=`${eq?`<div class="dm-equips">${eq}</div>`:''}<div class="dm-icon">${c.icon}</div><div class="dm-name">${c.isHero?'⭐':''}${c.name}</div>${c.level>1?`<span class="dm-lvl">+${c.level-1}</span>`:''}`;
  return d;
};

/* ============================================================
   CardV4Component — Claude Design System V4 Illuminated Manuscript
   ============================================================
   도입: 2026-04-20 (Step 4), 2026-04-21 B2 setter API 이식.
   출처: design-system/handoff/CARD_FRAME_SPEC.md + mockup/v4_card/v3.html.
   스타일: css/32_card_v4.css (모든 선택자 `.card-v4` prefix).

   원칙 (CardComponent V2 와 동일):
   1. 생성 시점에 프레임/일러/이름/능력텍스트/스탯 확정 (불변).
   2. 이후 변경은 setter 로만.
   3. 레벨업 등 영구 강화는 rebuild() 로 재생성.

   스탯 매핑:
     ATK = unit.atk / DEF = unit.def / SPD = unit.spd
     CRIT = unit.luck (04-balance: 치명타율 = luck + skill.critBonus)
     EVA = unit.eva
     HP / HPmax = unit.hp / (unit.maxHp || unit.hp)
     NRG current/max = 0 / unit.nrg (Tavern 은 charge 0)
     desc = unit.skillDesc || unit.desc

   Setter API:
     setHP(n) / setNRG(n) / setShield(n)
     setStatModifier('atk'|'def'|'spd', delta)
     setStatus(effect, turns)  — burn/poison/frozen/invincible
     setSelected(bool)
     destroy() / _snapshot() / rebuild(newUnit)
   ============================================================ */
RoF.CardV4Component = (function(){
  const STATUS_GLYPHS = {
    burn:       '🔥',
    poison:     '☠️',
    frozen:     '❄️',
    invincible: '🛡️'
  };

  function stripTokens(desc){
    if(RoF.CardComponent && RoF.CardComponent.stripSystemTokens)
      return RoF.CardComponent.stripSystemTokens(desc);
    return String(desc || '').trim();
  }

  function create(unit, opts){
    opts = opts || {};
    // 2026-04-22: opts.kind='spell'|'relic' 이면 컴팩트 모드 — bars/lv-box/hp-num/stats 생략.
    //   스펠·유물은 HP/NRG/Lv/스탯 5칸이 없으므로 "이름 + 일러스트 + 설명" 만 표시.
    const isCompact = opts.kind === 'spell' || opts.kind === 'relic';
    const rarity = unit.rarity || 'bronze';
    const element = unit.element || '';
    const el = document.createElement('div');
    el.className = `card-v4 rar-${rarity}${rarity==='divine' && element ? ' el-'+element : ''}${isCompact?' kind-'+opts.kind:''}`;
    el.setAttribute('data-uid', unit.uid || unit.id || '');
    if(unit.role) el.setAttribute('data-role', unit.role);
    if(element) el.setAttribute('data-element', element);
    if(opts.kind) el.setAttribute('data-kind', opts.kind);

    const img = (typeof getCardImg === 'function') ? getCardImg(unit) : (CARD_IMG && CARD_IMG[unit.id]);
    const name = (unit.isHero ? '⭐ ' : '') + (unit.name || '');
    const lv = unit.level || 1;
    const atk = unit.atk != null ? unit.atk : 0;
    const def = unit.def != null ? unit.def : 0;
    const spd = unit.spd != null ? unit.spd : 0;
    const crit = unit.luck != null ? unit.luck : 0;
    const eva = unit.eva != null ? unit.eva : 0;
    const hpMax = unit.maxHp || unit.hp || 1;
    // 2026-04-27: 영구 currentHp/curNrg 가 있으면 그 값 표시 (전투 종료 상태 마을에서 보임).
    // 신규 영입/생성 시점에는 currentHp 없음 → hp(=max) fallback. curNrg 없음 → 0 (charge 시작).
    const hpCur = unit.currentHp != null ? unit.currentHp : (unit.hp != null ? unit.hp : hpMax);
    const nrgMax = unit.nrg || 0;
    const nrgCur = unit.curNrg != null ? unit.curNrg : 0;
    const hpPct = Math.max(0, Math.min(100, Math.round(hpCur / hpMax * 100)));
    const nrgPct = nrgMax > 0 ? Math.max(0, Math.min(100, Math.round(nrgCur / nrgMax * 100))) : 0;
    const desc = stripTokens(unit.skillDesc || unit.desc || '');

    // XSS 방지: createElement + textContent
    const refs = {};

    // Art
    const artImg = document.createElement('img');
    artImg.className = 'art';
    if(img) artImg.src = img;
    artImg.alt = '';
    el.appendChild(artImg);

    // 원소 이펙트 오버레이 (P5, 2026-04-21) — 대표님 공급 이미지 대기 슬롯.
    // 경로는 리터럴 매핑으로 고정 — 정적 자산 게이트가 concat 표현을 broken 으로 판정하므로.
    const elemFxSrc = {
      fire:      'img/elem_fx_fire.png',
      water:     'img/elem_fx_water.png',
      lightning: 'img/elem_fx_lightning.png',
      earth:     'img/elem_fx_earth.png',
      dark:      'img/elem_fx_dark.png',
      holy:      'img/elem_fx_holy.png',
    };
    if(element && elemFxSrc[element]){
      const fx = document.createElement('img');
      fx.className = 'card-v4-elem-fx';
      fx.src = elemFxSrc[element];
      fx.alt = '';
      fx.onerror = function(){ this.style.display = 'none'; };
      el.appendChild(fx);
    }

    // Gild (금박 테두리)
    const gild = document.createElement('div');
    gild.className = 'gild';
    el.appendChild(gild);

    // Shield badge (좌상단 — Step 5 B2) — 기본 숨김
    refs.shield = document.createElement('div');
    refs.shield.className = 'shield-badge';
    refs.shield.hidden = true;
    el.appendChild(refs.shield);

    // Status badges (06-card-ui-principles: 카드 이름 위 정중앙)
    refs.status = document.createElement('div');
    refs.status.className = 'v4-status';
    el.appendChild(refs.status);

    // Legendary sparkles
    if(rarity === 'legendary'){
      ['s1','s2','s3'].forEach(s => {
        const sp = document.createElement('span');
        sp.className = 'spark ' + s;
        el.appendChild(sp);
      });
    }

    // Divine ribbon
    if(rarity === 'divine'){
      const rb = document.createElement('div');
      rb.className = 'ribbon';
      rb.textContent = '신';  // 한국어 (05-design rules)
      el.appendChild(rb);
    }

    // Bars (HP / NRG) — 유닛 전용. 스펠/유물에는 HP/NRG 개념 없으므로 생성 스킵.
    if(!isCompact){
      const bars = document.createElement('div');
      bars.className = 'bars';
      const mkBar = (cls, pct, labelTxt) => {
        const bar = document.createElement('div'); bar.className = 'bar ' + cls;
        const fill = document.createElement('i'); fill.style.width = pct + '%';
        const lbl = document.createElement('span'); lbl.className = 'lbl'; lbl.textContent = labelTxt;
        bar.appendChild(fill); bar.appendChild(lbl);
        return { bar, fill, lbl };
      };
      const hpBar = mkBar('hp', hpPct, 'HP ' + hpCur + ' / ' + hpMax);
      const nrgBar = mkBar('nrg', nrgPct, 'NRG ' + nrgCur + ' / ' + nrgMax);
      bars.appendChild(hpBar.bar); bars.appendChild(nrgBar.bar);
      refs.hpFill = hpBar.fill; refs.hpLbl = hpBar.lbl;
      refs.nrgFill = nrgBar.fill; refs.nrgLbl = nrgBar.lbl;
      el.appendChild(bars);
    }

    // Top row — 이름 박스 (+ Lv 박스는 유닛만)
    const topRow = document.createElement('div');
    topRow.className = 'top-row';

    const nameBox = document.createElement('div');
    nameBox.className = 'name-box';
    const nmEl = document.createElement('div'); nmEl.className = 'name'; nmEl.textContent = name;
    // 2026-04-23: 영문 이름 자동 감지 → .name-latin 클래스 (폰트 7px) — 한글보다 시각적으로 커 보이는 현상 대응
    if(/[A-Za-z]/.test(name) && !/[ㄱ-힝]/.test(name)) nmEl.classList.add('name-latin');
    nameBox.appendChild(nmEl);
    if(!isCompact){
      const hpNum = document.createElement('div'); hpNum.className = 'hp-num'; hpNum.textContent = '♥ ' + hpCur;
      nameBox.appendChild(hpNum);
      refs.hpNum = hpNum;
    }

    if(!isCompact){
      const lvBox = document.createElement('div');
      lvBox.className = 'lv-box';
      const lvEl = document.createElement('div'); lvEl.className = 'lv'; lvEl.textContent = 'Lv ' + lv;
      const nrgNum = document.createElement('div'); nrgNum.className = 'nrg-num'; nrgNum.textContent = '◆ ' + nrgCur;
      lvBox.appendChild(lvEl);
      lvBox.appendChild(nrgNum);
      topRow.appendChild(nameBox);
      topRow.appendChild(lvBox);
      refs.nrgNum = nrgNum;
    } else {
      // 스펠/유물: 우측에 등급 라벨만 (예: "희귀", "전설의"). Lv 자리 대체.
      const rTag = document.createElement('div');
      rTag.className = 'lv-box';
      const rLabel = document.createElement('div');
      rLabel.className = 'lv';
      const R_LABEL = {bronze:'일반', silver:'희귀', gold:'고귀한', legendary:'전설의', divine:'신'};
      rLabel.textContent = R_LABEL[rarity] || rarity;
      rTag.appendChild(rLabel);
      topRow.appendChild(nameBox);
      topRow.appendChild(rTag);
    }

    el.appendChild(topRow);

    // Parchment plate — 유닛은 stats 5칸 + desc, 스펠/유물은 desc 만.
    const parch = document.createElement('div');
    parch.className = 'parch';
    if(!isCompact){
      const stats = document.createElement('div');
      stats.className = 'stats';
      const statKeys = [
        ['ATK', atk, 'atk'],
        ['DEF', def, 'def'],
        ['SPD', spd, 'spd'],
        ['CRIT', crit + '%', 'luck'],
        ['EVA', eva + '%', 'eva'],
      ];
      refs.stats = {};
      statKeys.forEach(([label, value, key]) => {
        const s = document.createElement('div'); s.className = 'stat';
        const l = document.createElement('span'); l.className = 'l'; l.textContent = label;
        const v = document.createElement('span'); v.className = 'v'; v.textContent = value;
        const mod = document.createElement('span'); mod.className = 'mod'; mod.hidden = true;
        s.appendChild(l); s.appendChild(v); s.appendChild(mod);
        stats.appendChild(s);
        refs.stats[key] = { v: v, mod: mod, base: value };
      });
      parch.appendChild(stats);
    }
    const descEl = document.createElement('div');
    descEl.className = 'desc';
    descEl.textContent = isCompact ? (unit.desc || '') : desc;
    parch.appendChild(descEl);
    el.appendChild(parch);

    // State (setter 로 변경)
    const state = {
      currentHP: hpCur, maxHP: hpMax,
      currentNRG: nrgCur, maxNRG: nrgMax,
      shield: 0,
      statMods: { atk: 0, def: 0, spd: 0 },
      statuses: {},
      selected: false,
    };

    const inst = {
      el, unit, _refs: refs, _state: state, _opts: opts,

      setHP(n){
        if(!refs.hpFill) return;  // 스펠/유물 카드엔 HP UI 없음
        state.currentHP = n;
        const pct = Math.max(0, Math.min(100, Math.round(n / state.maxHP * 100)));
        refs.hpFill.style.width = pct + '%';
        refs.hpLbl.textContent = 'HP ' + n + ' / ' + state.maxHP;
        if(refs.hpNum) refs.hpNum.textContent = '♥ ' + n;
      },
      setNRG(n){
        if(!refs.nrgFill) return;  // 스펠/유물 카드엔 NRG UI 없음
        state.currentNRG = n;
        const pct = state.maxNRG > 0 ? Math.max(0, Math.min(100, Math.round(n / state.maxNRG * 100))) : 0;
        refs.nrgFill.style.width = pct + '%';
        refs.nrgLbl.textContent = 'NRG ' + n + ' / ' + state.maxNRG;
        if(refs.nrgNum) refs.nrgNum.textContent = '◆ ' + n;
      },
      setShield(n){
        state.shield = n;
        if(n > 0){
          refs.shield.textContent = '🛡️' + n;
          refs.shield.hidden = false;
        } else {
          refs.shield.hidden = true;
          refs.shield.textContent = '';
        }
      },
      setStatModifier(stat, delta){
        if(!(stat in state.statMods)) return;
        state.statMods[stat] = delta;
        const ref = refs.stats[stat];
        if(!ref) return;
        if(delta === 0){
          ref.mod.hidden = true; ref.mod.textContent = '';
          ref.mod.classList.remove('is-buff', 'is-debuff');
        } else {
          ref.mod.hidden = false;
          ref.mod.textContent = (delta > 0 ? '+' : '') + delta;
          ref.mod.classList.toggle('is-buff', delta > 0);
          ref.mod.classList.toggle('is-debuff', delta < 0);
        }
      },
      setStatus(effect, turns){
        if(turns > 0) state.statuses[effect] = turns;
        else delete state.statuses[effect];
        refs.status.innerHTML = '';
        Object.keys(state.statuses).forEach(k => {
          const b = document.createElement('span');
          b.className = 'v4-status-badge v4-status-' + k;
          const ic = document.createElement('span'); ic.className = 'ic'; ic.textContent = STATUS_GLYPHS[k] || '?';
          const tn = document.createElement('b'); tn.className = 'tn'; tn.textContent = state.statuses[k];
          b.appendChild(ic); b.appendChild(tn);
          refs.status.appendChild(b);
        });
      },
      setSelected(on){
        state.selected = !!on;
        el.classList.toggle('selected', !!on);
      },
      destroy(){ if(el.parentElement) el.parentElement.removeChild(el); },
      _snapshot(){
        return {
          currentHP: state.currentHP, currentNRG: state.currentNRG,
          shield: state.shield, statMods: Object.assign({}, state.statMods),
          statuses: Object.assign({}, state.statuses), selected: state.selected,
        };
      },
    };
    return inst;
  }

  function rebuild(oldInstance, newUnit){
    const parent = oldInstance.el.parentElement;
    const next = parent ? oldInstance.el.nextSibling : null;
    const snap = oldInstance._snapshot();
    const opts = oldInstance._opts;
    oldInstance.destroy();
    const fresh = create(newUnit, opts);
    fresh.setHP(Math.min(snap.currentHP, newUnit.hp));
    fresh.setNRG(Math.min(snap.currentNRG, newUnit.nrg || 0));
    fresh.setShield(snap.shield);
    fresh.setStatModifier('atk', snap.statMods.atk);
    fresh.setStatModifier('def', snap.statMods.def);
    fresh.setStatModifier('spd', snap.statMods.spd);
    Object.keys(snap.statuses).forEach(k => fresh.setStatus(k, snap.statuses[k]));
    fresh.setSelected(snap.selected);
    if(parent) parent.insertBefore(fresh.el, next);
    return fresh;
  }

  return { create, rebuild, stripTokens, STATUS_GLYPHS };
})();
window.CardV4Component = RoF.CardV4Component;

// 호환성 래퍼 — 기존 mkCardElV4(c) 호출부는 el 만 받음.
// 새 코드는 CardV4Component.create(c, opts) 를 직접 써서 인스턴스로 setter 활용.
RoF.dom.mkCardElV4 = function(c){
  return RoF.CardV4Component.create(c, {}).el;
};

// 호환성 레이어
window.mkCardEl = RoF.dom.mkCardEl;
window.mkCardElV4 = RoF.dom.mkCardElV4;
window.mkRelicEl = RoF.dom.mkRelicEl;
window.mkMini = RoF.dom.mkMini;
