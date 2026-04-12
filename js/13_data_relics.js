'use strict';

// 2026-04-12 밸런스 상향 — 유닛픽/스킬픽 대비 체감 파워 확보
// 브론즈: 브론즈 유닛(atk 2~3, hp 8~12) 대비 덱 전체 분산 효과
// 골드/전설: 전설 유닛(atk 8~12, hp 30~40) 1장 픽과 비슷한 임팩트
RoF.Data.RELICS = Object.freeze([
  {id:'rl_banner',name:'전쟁의깃발',icon:'🚩',rarity:'bronze',desc:'전체 공격+2',effect:'g_atk+2'},
  {id:'rl_crystal',name:'생명수정',icon:'💎',rarity:'bronze',desc:'전체 HP+8',effect:'g_hp+8'},
  {id:'rl_wall',name:'강철성벽',icon:'🧱',rarity:'bronze',desc:'전체 방어+2',effect:'g_def+2'},
  {id:'rl_fury',name:'분노부적',icon:'🔴',rarity:'silver',desc:'전체 분노+5',effect:'g_rage+5'},
  {id:'rl_boots',name:'신속장화',icon:'👢',rarity:'silver',desc:'전체 스피드+3',effect:'g_spd+3'},
  {id:'rl_cloak',name:'안개망토',icon:'🌫️',rarity:'silver',desc:'전체 회피+5',effect:'g_eva+5'},
  {id:'rl_doom',name:'파멸의검',icon:'⚔️',rarity:'gold',desc:'전체 공격+5',effect:'g_atk+5'},
  {id:'rl_luck',name:'행운부적',icon:'🍀',rarity:'gold',desc:'전체 행운+6',effect:'g_luck+6'},
  {id:'rl_guard',name:'수호방패',icon:'🛡️',rarity:'gold',desc:'전체 방어+5, HP+10',effect:'g_def+5,g_hp+10'},
  {id:'rl_wrath',name:'신의분노',icon:'⛈️',rarity:'legendary',desc:'전체 공격+7',effect:'g_atk+7'},
  {id:'rl_eternal',name:'영원의성배',icon:'🏆',rarity:'legendary',desc:'전체 전 능력치+3',effect:'g_all+3'},
  {id:'rl_immortal',name:'불멸갑옷',icon:'💠',rarity:'legendary',desc:'전체 방어+7, 회피+6',effect:'g_def+7,g_eva+6'},
]);

// 호환성 레이어
window.RELICS_DB = RoF.Data.RELICS;
