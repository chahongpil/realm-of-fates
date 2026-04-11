'use strict';

RoF.Data.RELICS = Object.freeze([
  {id:'rl_banner',name:'전쟁의깃발',icon:'🚩',rarity:'bronze',desc:'전체 공격+1',effect:'g_atk+1'},
  {id:'rl_crystal',name:'생명수정',icon:'💎',rarity:'bronze',desc:'전체 HP+5',effect:'g_hp+5'},
  {id:'rl_wall',name:'강철성벽',icon:'🧱',rarity:'bronze',desc:'전체 방어+1',effect:'g_def+1'},
  {id:'rl_fury',name:'분노부적',icon:'🔴',rarity:'silver',desc:'전체 분노+3',effect:'g_rage+3'},
  {id:'rl_boots',name:'신속장화',icon:'👢',rarity:'silver',desc:'전체 스피드+2',effect:'g_spd+2'},
  {id:'rl_cloak',name:'안개망토',icon:'🌫️',rarity:'silver',desc:'전체 회피+3',effect:'g_eva+3'},
  {id:'rl_doom',name:'파멸의검',icon:'⚔️',rarity:'gold',desc:'전체 공격+3',effect:'g_atk+3'},
  {id:'rl_luck',name:'행운부적',icon:'🍀',rarity:'gold',desc:'전체 행운+4',effect:'g_luck+4'},
  {id:'rl_guard',name:'수호방패',icon:'🛡️',rarity:'gold',desc:'전체 방어+3, HP+5',effect:'g_def+3,g_hp+5'},
  {id:'rl_wrath',name:'신의분노',icon:'⛈️',rarity:'legendary',desc:'전체 공격+5',effect:'g_atk+5'},
  {id:'rl_eternal',name:'영원의성배',icon:'🏆',rarity:'legendary',desc:'전체 전 능력치+2',effect:'g_all+2'},
  {id:'rl_immortal',name:'불멸갑옷',icon:'💠',rarity:'legendary',desc:'전체 방어+5, 회피+5',effect:'g_def+5,g_eva+5'},
]);

// 호환성 레이어
window.RELICS_DB = RoF.Data.RELICS;
