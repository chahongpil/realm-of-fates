'use strict';

// ─────────────────────────────────────────────────────────────
// SKILLS DB
// passive:true  = 장착 시 스탯 보정 / 자동 발동 트리거. 전투 UI 에서 회색 + 클릭 무효.
// passive:false = 액티브 카드. TP 소모, 타겟 선택, 명시적 발동.
// passive 플래그 누락 시 기본값 = true (안전 — 이상한 버튼으로 노출되지 않음)
// 판별 헬퍼: RoF.isSkillPassive(idOrObj)
// ─────────────────────────────────────────────────────────────

RoF.Data.SKILLS = Object.freeze([
  // BRONZE — 현재 전부 패시브 스탯 보정
  {id:'sk_power',name:'강타',icon:'💥',role:'attack',rarity:'bronze',cost:2,desc:'공격력 +3',effect:'atk+3',passive:true},
  {id:'sk_shield',name:'강화방패',icon:'🔰',role:'defense',rarity:'bronze',cost:2,desc:'방어력 +3',effect:'def+3',passive:true},
  {id:'sk_heal',name:'치유의빛',icon:'✨',role:'support',rarity:'bronze',cost:2,desc:'HP +10',effect:'hp+10',passive:true},
  {id:'sk_swift',name:'질풍',icon:'🌬️',role:'attack',rarity:'bronze',cost:2,desc:'스피드 +3',effect:'spd+3',passive:true},
  {id:'sk_tough',name:'단련',icon:'💪',role:'defense',rarity:'bronze',cost:2,desc:'HP +8, 방어+1',effect:'hp+8,def+1',passive:true},
  {id:'sk_focus',name:'집중',icon:'🎯',role:'support',rarity:'bronze',cost:2,desc:'행운 +3, 에너지+2',effect:'luck+3,nrg+2',passive:true},
  // SILVER
  {id:'sk_rage',name:'분노폭발',icon:'😤',role:'attack',rarity:'silver',cost:3,desc:'공격+3, 분노+5',effect:'atk+3,rage+5',passive:true},
  {id:'sk_evasion',name:'잔상술',icon:'💨',role:'defense',rarity:'silver',cost:3,desc:'회피 +6',effect:'eva+6',passive:true},
  {id:'sk_energize',name:'활력충전',icon:'⚡',role:'support',rarity:'silver',cost:3,desc:'스피드+2, 에너지+5',effect:'spd+2,nrg+5',passive:true},
  {id:'sk_cleave',name:'일섬',icon:'⚔️',role:'attack',rarity:'silver',cost:3,desc:'공격+4, 스피드+1',effect:'atk+4,spd+1',passive:true},
  {id:'sk_ironwill',name:'불굴',icon:'🦾',role:'defense',rarity:'silver',cost:3,desc:'HP+12, 분노+3',effect:'hp+12,rage+3',passive:true},
  {id:'sk_prayer',name:'기도',icon:'🙏',role:'support',rarity:'silver',cost:3,desc:'HP+8, 에너지+4',effect:'hp+8,nrg+4',passive:true},
  {id:'sk_venom',name:'맹독',icon:'🐍',role:'attack',rarity:'silver',cost:3,desc:'공격+2, 행운+4',effect:'atk+2,luck+4',passive:true},
  {id:'sk_reflex',name:'반사신경',icon:'⚡',role:'defense',rarity:'silver',cost:3,desc:'회피+4, 스피드+2',effect:'eva+4,spd+2',passive:true},
  // GOLD
  {id:'sk_crit_edge',name:'급소연마',icon:'🔪',role:'attack',rarity:'gold',cost:4,desc:'행운 +8',effect:'luck+8',passive:true},
  {id:'sk_fortress',name:'철벽',icon:'🧱',role:'defense',rarity:'gold',cost:4,desc:'방어+5, HP+8',effect:'def+5,hp+8',passive:true},
  {id:'sk_revive',name:'부활축복',icon:'🌈',role:'support',rarity:'gold',cost:5,desc:'부활 능력 부여',effect:'grant_rebirth',passive:true},
  {id:'sk_bloodlust',name:'피의갈증',icon:'🩸',role:'attack',rarity:'gold',cost:4,desc:'공격+6, HP-5',effect:'atk+6,hp-5',passive:true},
  {id:'sk_mirage',name:'신기루',icon:'🌀',role:'defense',rarity:'gold',cost:4,desc:'회피+8, 행운+3',effect:'eva+8,luck+3',passive:true},
  {id:'sk_warhorn',name:'전쟁의나팔',icon:'📯',role:'support',rarity:'gold',cost:5,desc:'공격+4, 스피드+3, 분노+4',effect:'atk+4,spd+3,rage+4',passive:true},
  {id:'sk_execute',name:'처형',icon:'🗡️',role:'attack',rarity:'gold',cost:5,desc:'공격+8',effect:'atk+8',passive:true},
  {id:'sk_aura',name:'수호오라',icon:'🛡️',role:'support',rarity:'gold',cost:4,desc:'방어+4, HP+10, 회피+2',effect:'def+4,hp+10,eva+2',passive:true},
  // LEGENDARY
  {id:'sk_berserk',name:'광폭화',icon:'🌀',role:'attack',rarity:'legendary',cost:6,desc:'공격력 2배, 방어 0',effect:'berserk',passive:true},
  {id:'sk_transcend',name:'초월',icon:'👁️',role:'support',rarity:'legendary',cost:7,desc:'등급 1단계↑',effect:'rarity_up',passive:true},
  {id:'sk_invincible',name:'무적',icon:'🌐',role:'defense',rarity:'legendary',cost:6,desc:'첫 3회 피해 무효',effect:'invincible3',passive:true},
  {id:'sk_godslayer',name:'신살',icon:'💀',role:'attack',rarity:'legendary',cost:7,desc:'공격+12, 행운+6',effect:'atk+12,luck+6',passive:true},
  {id:'sk_resurrection',name:'부활의성배',icon:'🏆',role:'support',rarity:'legendary',cost:7,desc:'부활+HP+15',effect:'grant_rebirth,hp+15',passive:true},
  {id:'sk_shadowstep',name:'그림자걸음',icon:'👤',role:'defense',rarity:'legendary',cost:6,desc:'회피+12, 스피드+5',effect:'eva+12,spd+5',passive:true},
  {id:'sk_dragonheart',name:'용의심장',icon:'🐉',role:'support',rarity:'legendary',cost:7,desc:'전 능력치+3',effect:'atk+3,hp+3,def+3,spd+3,rage+3,nrg+3,luck+3,eva+3',passive:true},
  {id:'sk_handoff',name:'핸드오프',icon:'🤝',role:'support',rarity:'gold',cost:4,desc:'공격 후 40% 확률로 아군 1체에게 추가 공격권 부여',effect:'handoff',passive:true},

  // ─────────────────────────────────────────────────────────────
  // ACTIVE SKILLS (PHASE 3, P1-2) — 2026-04-18
  // passive:false → 전투 큐잉에서 명시 발동.
  // 스키마는 Battle v2 엔진(60_turnbattle_v2.js) 과 필드명 통일:
  //   attackType: 'spell' | 'weapon' | 'heal' | 'buff' | 'debuff'
  //   targetType: 'single_enemy' | 'all_enemies' | 'single_ally' | 'all_allies' | 'self'
  //   cost, costType:'nrg', tpCost, cooldown
  //   element: 공명 시스템 데이터(현재 로직 미적용, 필드만 예약)
  // ─────────────────────────────────────────────────────────────

  // BRONZE ACTIVE (2장)
  {id:'sk_flame_arrow',name:'불꽃 화살',icon:'🔥',imgKey:'sk_flame_arrow',role:'attack',rarity:'bronze',
    element:'fire',attackType:'spell',damage:8,critBonus:0,critMult:1.5,
    cost:3,costType:'nrg',tpCost:1,targetType:'single_enemy',
    desc:'적 1체에게 불 피해 8',passive:false},
  {id:'sk_healing_light',name:'치유의 빛',icon:'✨',imgKey:'sk_healing_light',role:'support',rarity:'bronze',
    element:'holy',attackType:'heal',heal:15,
    cost:3,costType:'nrg',tpCost:1,targetType:'single_ally',
    desc:'아군 1체 HP +15',passive:false},

  // SILVER ACTIVE (4장 — 4원소 기본 커버)
  {id:'sk_tidal_crash',name:'파도 강타',icon:'🌊',imgKey:'sk_tidal_crash',role:'attack',rarity:'silver',
    element:'water',attackType:'spell',damage:15,critBonus:0,critMult:1.5,
    cost:5,costType:'nrg',tpCost:1,targetType:'single_enemy',
    desc:'적 1체에게 물 피해 15',passive:false},
  {id:'sk_earth_bulwark',name:'대지 방벽',icon:'⛰️',imgKey:'sk_earth_bulwark',role:'defense',rarity:'silver',
    element:'earth',attackType:'buff',stat:'def',amount:5,duration:2,
    cost:5,costType:'nrg',tpCost:1,targetType:'single_ally',
    desc:'아군 1체 방어 +5 (2턴)',passive:false},
  {id:'sk_chain_lightning',name:'번개 사슬',icon:'⚡',imgKey:'sk_chain_lightning',role:'attack',rarity:'silver',
    element:'lightning',attackType:'spell',damage:8,critBonus:0,critMult:1.5,
    cost:5,costType:'nrg',tpCost:2,targetType:'all_enemies',
    desc:'적 전체에게 전기 피해 8',passive:false},
  {id:'sk_dark_curse',name:'암흑 저주',icon:'🌑',imgKey:'sk_dark_curse',role:'defense',rarity:'silver',
    element:'dark',attackType:'debuff',stat:'atk',amount:-4,duration:2,
    cost:5,costType:'nrg',tpCost:1,targetType:'single_enemy',
    desc:'적 1체 공격 -4 (2턴)',passive:false},

  // GOLD ACTIVE (2장 — 강한 페이오프, 쿨다운 1)
  {id:'sk_inferno_blast',name:'화염 폭발',icon:'🌋',imgKey:'sk_inferno_blast',role:'attack',rarity:'gold',
    element:'fire',attackType:'spell',damage:25,critBonus:0,critMult:1.5,
    cost:10,costType:'nrg',tpCost:2,cooldown:1,targetType:'single_enemy',
    desc:'적 1체에게 불 피해 25 (쿨1)',passive:false},
  {id:'sk_blessing_light',name:'축복의 빛',icon:'🌟',imgKey:'sk_blessing_light',role:'support',rarity:'gold',
    element:'holy',attackType:'heal',heal:15,
    cost:10,costType:'nrg',tpCost:2,cooldown:1,targetType:'all_allies',
    desc:'아군 전체 HP +15 (쿨1)',passive:false},
]);

// 호환성 레이어 (기존 SKILLS_DB 이름 유지)
window.SKILLS_DB = RoF.Data.SKILLS;

// ── 판별 헬퍼 ──
// id 또는 스킬 객체를 받아서 passive 여부 반환.
// 플래그가 명시적으로 false 일 때만 액티브로 취급 (안전한 기본값).
RoF.isSkillPassive = function(idOrObj){
  if(idOrObj == null) return true;
  let sk = idOrObj;
  if(typeof idOrObj === 'string'){
    sk = RoF.Data.SKILLS.find(s => s.id === idOrObj);
    if(!sk) return true; // 알 수 없는 id → 패시브로 처리해 회색 노출
  }
  return sk.passive !== false;
};
