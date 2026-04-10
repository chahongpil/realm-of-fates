'use strict';

// ── TRAITS (특성) ──
RoF.Data.TRAITS = Object.freeze({
  brave:{name:'용맹',icon:'🦁',desc:'첫 공격 데미지 +50%',color:'#ff6644'},
  sturdy:{name:'강인',icon:'🛡️',desc:'HP 20% 이하 시 방어 2배',color:'#4488ff'},
  rapid:{name:'속사',icon:'⚡',desc:'15% 확률로 2회 공격',color:'#ffdd44'},
  focus:{name:'집중',icon:'🎯',desc:'비전 발동 확률 +15%',color:'#aa66ff'},
  vampiric:{name:'흡혈',icon:'🩸',desc:'피해의 15% HP 회복',color:'#cc44aa'},
  blessed:{name:'축복',icon:'✨',desc:'턴 시작 시 아군 1체 HP+2',color:'#ffd700'},
  pyromaniac:{name:'화염 친화',icon:'🔥',desc:'화상 데미지 +50%',color:'#ff4422'},
  frostborn:{name:'빙결 친화',icon:'❄️',desc:'빙결 확률 +10%',color:'#44aaff'},
  conductor:{name:'전도체',icon:'⚡',desc:'스피드 +3',color:'#ffdd00'},
  rooted:{name:'뿌리',icon:'🌿',desc:'받는 피해 -2 (고정)',color:'#88aa44'},
  ambush:{name:'암습',icon:'🗡️',desc:'첫 턴 회피 100%',color:'#aa44ff'},
  regen:{name:'재생',icon:'💚',desc:'매 턴 HP +3 회복',color:'#44cc66'},
  menace:{name:'위압',icon:'👁️',desc:'적 전체 공격력 -1',color:'#ff4444'},
  undying:{name:'불사',icon:'💀',desc:'첫 치명상에서 HP 1로 생존',color:'#e6cc80'},
});

// Assign traits based on element, type, rarity
RoF.getTraits = function(unit){
  const t = [];
  // Element-based
  if(unit.element==='fire')t.push('pyromaniac');
  if(unit.element==='water')t.push('frostborn');
  if(unit.element==='lightning')t.push('conductor');
  if(unit.element==='earth')t.push('rooted');
  if(unit.element==='dark')t.push('vampiric');
  if(unit.element==='holy')t.push('blessed');
  // Type-based
  if(unit.type==='전사'&&unit.role==='attack')t.push('brave');
  if(unit.type==='전사'&&unit.role==='defense')t.push('sturdy');
  if(unit.type==='사수')t.push('rapid');
  if(unit.type==='마법사')t.push('focus');
  if(unit.type==='야수')t.push('regen');
  // Rarity bonus
  if(unit.rarity==='legendary'||unit.rarity==='divine')t.push('undying');
  if(unit.rarity==='divine')t.push('menace');
  // Special: rogue/assassin
  if(unit.id==='rogue'||unit.id==='assassin')t.push('ambush');
  return [...new Set(t)].slice(0,3); // max 3 traits
};

// 호환성 레이어
window.TRAITS = RoF.Data.TRAITS;
window.getTraits = RoF.getTraits;
