'use strict';

RoF.Data.SKILLS = Object.freeze([
  // BRONZE
  {id:'sk_power',name:'강타',icon:'💥',role:'attack',rarity:'bronze',cost:2,desc:'공격력 +3',effect:'atk+3'},
  {id:'sk_shield',name:'강화방패',icon:'🔰',role:'defense',rarity:'bronze',cost:2,desc:'방어력 +3',effect:'def+3'},
  {id:'sk_heal',name:'치유의빛',icon:'✨',role:'support',rarity:'bronze',cost:2,desc:'HP +10',effect:'hp+10'},
  {id:'sk_swift',name:'질풍',icon:'🌬️',role:'attack',rarity:'bronze',cost:2,desc:'스피드 +3',effect:'spd+3'},
  {id:'sk_tough',name:'단련',icon:'💪',role:'defense',rarity:'bronze',cost:2,desc:'HP +8, 방어+1',effect:'hp+8,def+1'},
  {id:'sk_focus',name:'집중',icon:'🎯',role:'support',rarity:'bronze',cost:2,desc:'행운 +3, 에너지+2',effect:'luck+3,nrg+2'},
  // SILVER
  {id:'sk_rage',name:'분노폭발',icon:'😤',role:'attack',rarity:'silver',cost:3,desc:'공격+3, 분노+5',effect:'atk+3,rage+5'},
  {id:'sk_evasion',name:'잔상술',icon:'💨',role:'defense',rarity:'silver',cost:3,desc:'회피 +6',effect:'eva+6'},
  {id:'sk_energize',name:'활력충전',icon:'⚡',role:'support',rarity:'silver',cost:3,desc:'스피드+2, 에너지+5',effect:'spd+2,nrg+5'},
  {id:'sk_cleave',name:'일섬',icon:'⚔️',role:'attack',rarity:'silver',cost:3,desc:'공격+4, 스피드+1',effect:'atk+4,spd+1'},
  {id:'sk_ironwill',name:'불굴',icon:'🦾',role:'defense',rarity:'silver',cost:3,desc:'HP+12, 분노+3',effect:'hp+12,rage+3'},
  {id:'sk_prayer',name:'기도',icon:'🙏',role:'support',rarity:'silver',cost:3,desc:'HP+8, 에너지+4',effect:'hp+8,nrg+4'},
  {id:'sk_venom',name:'맹독',icon:'🐍',role:'attack',rarity:'silver',cost:3,desc:'공격+2, 행운+4',effect:'atk+2,luck+4'},
  {id:'sk_reflex',name:'반사신경',icon:'⚡',role:'defense',rarity:'silver',cost:3,desc:'회피+4, 스피드+2',effect:'eva+4,spd+2'},
  // GOLD
  {id:'sk_crit_edge',name:'급소연마',icon:'🔪',role:'attack',rarity:'gold',cost:4,desc:'행운 +8',effect:'luck+8'},
  {id:'sk_fortress',name:'철벽',icon:'🧱',role:'defense',rarity:'gold',cost:4,desc:'방어+5, HP+8',effect:'def+5,hp+8'},
  {id:'sk_revive',name:'부활축복',icon:'🌈',role:'support',rarity:'gold',cost:5,desc:'부활 능력 부여',effect:'grant_rebirth'},
  {id:'sk_bloodlust',name:'피의갈증',icon:'🩸',role:'attack',rarity:'gold',cost:4,desc:'공격+6, HP-5',effect:'atk+6,hp-5'},
  {id:'sk_mirage',name:'신기루',icon:'🌀',role:'defense',rarity:'gold',cost:4,desc:'회피+8, 행운+3',effect:'eva+8,luck+3'},
  {id:'sk_warhorn',name:'전쟁의나팔',icon:'📯',role:'support',rarity:'gold',cost:5,desc:'공격+4, 스피드+3, 분노+4',effect:'atk+4,spd+3,rage+4'},
  {id:'sk_execute',name:'처형',icon:'🗡️',role:'attack',rarity:'gold',cost:5,desc:'공격+8',effect:'atk+8'},
  {id:'sk_aura',name:'수호오라',icon:'🛡️',role:'support',rarity:'gold',cost:4,desc:'방어+4, HP+10, 회피+2',effect:'def+4,hp+10,eva+2'},
  // LEGENDARY
  {id:'sk_berserk',name:'광폭화',icon:'🌀',role:'attack',rarity:'legendary',cost:6,desc:'공격력 2배, 방어 0',effect:'berserk'},
  {id:'sk_transcend',name:'초월',icon:'👁️',role:'support',rarity:'legendary',cost:7,desc:'등급 1단계↑',effect:'rarity_up'},
  {id:'sk_invincible',name:'무적',icon:'🌐',role:'defense',rarity:'legendary',cost:6,desc:'첫 3회 피해 무효',effect:'invincible3'},
  {id:'sk_godslayer',name:'신살',icon:'💀',role:'attack',rarity:'legendary',cost:7,desc:'공격+12, 행운+6',effect:'atk+12,luck+6'},
  {id:'sk_resurrection',name:'부활의성배',icon:'🏆',role:'support',rarity:'legendary',cost:7,desc:'부활+HP+15',effect:'grant_rebirth,hp+15'},
  {id:'sk_shadowstep',name:'그림자걸음',icon:'👤',role:'defense',rarity:'legendary',cost:6,desc:'회피+12, 스피드+5',effect:'eva+12,spd+5'},
  {id:'sk_dragonheart',name:'용의심장',icon:'🐉',role:'support',rarity:'legendary',cost:7,desc:'전 능력치+3',effect:'atk+3,hp+3,def+3,spd+3,rage+3,nrg+3,luck+3,eva+3'},
  {id:'sk_handoff',name:'핸드오프',icon:'🤝',role:'support',rarity:'gold',cost:4,desc:'공격 후 40% 확률로 아군 1체에게 추가 공격권 부여',effect:'handoff'},
]);

// 호환성 레이어 (기존 SKILLS_DB 이름 유지)
window.SKILLS_DB = RoF.Data.SKILLS;
