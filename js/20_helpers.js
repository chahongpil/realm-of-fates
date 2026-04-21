'use strict';

// Phase 3: helpers → RoF.helpers (window compat 유지)
RoF.helpers = RoF.helpers || {};

// ── 등급/카드 합성 ──
RoF.helpers.upgradeRarity = function(r){const i=R_ORDER.indexOf(r);return i<R_ORDER.length-1?R_ORDER[i+1]:r;};
RoF.helpers.fuseCard = function(card){
  card.rarity=upgradeRarity(card.rarity);
  card.atk=Math.round(card.atk*1.5);card.hp=Math.round(card.hp*1.5);card.maxHp=Math.round(card.hp);
  card.def=Math.round((card.def||0)*1.5);card.spd=Math.round((card.spd||0)*1.3);
  card.rage=Math.round((card.rage||0)*1.3);card.nrg=Math.round((card.nrg||0)*1.3);
  card.luck=Math.round((card.luck||0)*1.3);card.eva=Math.round((card.eva||0)*1.3);
};
// ── 적/ID ──
RoF.helpers.enemyName = function(){return ENEMY_NAMES[Math.floor(Math.random()*ENEMY_NAMES.length)];};
RoF.helpers.uid = function(){return Math.random().toString(36).substr(2,9);};
// DEPRECATED (2026-04-21): 기존 18종 h_* 영웅 시스템 폐기. createHero() 사용.
// 남아있는 이유: 레거시 호출부 방어 (null 이 아닌 값 반환). 신규 호출 금지.
RoF.helpers.getHeroId = function(element,roleId){return `hero_m_${roleId==='melee'?'warrior':roleId==='ranged'?'ranger':'support'}_${element}`;};
// ── 비동기/픽 ──
RoF.helpers.wait = function(ms){return new Promise(r=>setTimeout(r,ms));};
// Rarity pick: mode='tavern'|'battle'|'reward', bonus=scaling factor
RoF.helpers.pickRar = function(bonus=0,mode='battle'){
  const r=Math.random()*100;const b=Math.min(bonus,20);
  if(mode==='tavern'){
    // Conservative — permanent units
    const divine=0.2+b*.09;const legend=1.8+b*.16;const gold=8+b*.5;const silver=30+b*.25;
    if(r<divine)return'divine';if(r<divine+legend)return'legendary';if(r<divine+legend+gold)return'gold';if(r<divine+legend+gold+silver)return'silver';return'bronze';
  } else if(mode==='reward'){
    // Medium — post-battle rewards
    const divine=0.2+b*.34;const legend=1.8+b*.81;const gold=10+b*1;const silver=33+b*.15;
    if(r<divine)return'divine';if(r<divine+legend)return'legendary';if(r<divine+legend+gold)return'gold';if(r<divine+legend+gold+silver)return'silver';return'bronze';
  } else {
    // Battle — generous (roguelike reset)
    const divine=0.1+b*.29;const legend=0.9+b*1.11;const gold=6+b*1.9;const silver=28+b*.7;
    if(r<divine)return'divine';if(r<divine+legend)return'legendary';if(r<divine+legend+gold)return'gold';if(r<divine+legend+gold+silver)return'silver';return'bronze';
  }
};

// ── 스킬/유물 적용 ──
// effect 마커는 여기서 유닛 런타임 필드로 매핑. 실제 발동은 전투 엔진이 참조.
// 2026-04-19 개편:
//   invincibleN      — 정규식으로 N 추출 (기존 invincible3 하드코딩 삭제)
//   grant_rebirth    — sk.rebirthHp / sk.rebirthNrg 파라미터 보존
//   hp_mult          — sk.hpMult 로 HP 배율 즉시 적용
//   proc_double_cast — sk.procChance (%) 를 unit._procDoubleCast 로 스탬프
//   proc_nullify_hit — sk.procChance (%) 를 unit._procNullifyHit 로 스탬프
RoF.helpers.applySkillToUnit = function(sk,unit){
  const ef=sk.effect;if(!ef)return;
  if(ef==='berserk'){unit.atk*=2;unit.def=0;return;}
  if(ef==='grant_rebirth'){
    unit.skill='rebirth';
    unit.skillDesc='부활 부여';
    if(sk.rebirthHp != null) unit._rebirthHp = sk.rebirthHp;
    if(sk.rebirthNrg != null) unit._rebirthNrg = sk.rebirthNrg;
    return;
  }
  if(ef==='hp_mult'){
    const m=sk.hpMult||1;
    unit.hp=(unit.hp||0)*m;
    unit.maxHp=(unit.maxHp||unit.hp)*m;
    return;
  }
  if(ef==='proc_double_cast'){unit._procDoubleCast=sk.procChance||0;return;}
  if(ef==='proc_nullify_hit'){unit._procNullifyHit=sk.procChance||0;return;}
  const mInv=ef.match(/^invincible(\d+)$/);
  if(mInv){unit._invincible=parseInt(mInv[1],10);return;}
  ef.split(',').forEach(part=>{const m=part.match(/(\w+)\+(\d+)/);if(m){const stat=m[1],val=parseInt(m[2]);unit[stat]=(unit[stat]||0)+val;if(stat==='hp')unit.maxHp=(unit.maxHp||unit.hp)+val;}});
};

RoF.helpers.applyRelic = function(rl,deck){
  const ef=rl.effect;if(!ef)return;
  if(ef.startsWith('g_all+')){const v=parseInt(ef.split('+')[1]);deck.forEach(u=>{['atk','hp','def','spd','rage','nrg','luck','eva'].forEach(s=>{u[s]=(u[s]||0)+v;});u.maxHp+=v;});return;}
  ef.split(',').forEach(part=>{const m=part.match(/g_(\w+)\+(\d+)/);if(m){const stat=m[1],val=parseInt(m[2]);deck.forEach(u=>{u[stat]=(u[stat]||0)+val;if(stat==='hp')u.maxHp=(u.maxHp||u.hp)+val;});}});
};
RoF.helpers.applyRelicBattle = function(rl,cards){applyRelic(rl,cards);};

// ── 호환성 레이어 ──
window.upgradeRarity = RoF.helpers.upgradeRarity;
window.fuseCard = RoF.helpers.fuseCard;
window.enemyName = RoF.helpers.enemyName;
window.uid = RoF.helpers.uid;
window.getHeroId = RoF.helpers.getHeroId;
window.wait = RoF.helpers.wait;
window.pickRar = RoF.helpers.pickRar;
window.applySkillToUnit = RoF.helpers.applySkillToUnit;
window.applyRelic = RoF.helpers.applyRelic;
window.applyRelicBattle = RoF.helpers.applyRelicBattle;
