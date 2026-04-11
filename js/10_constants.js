'use strict';

// ============ 기본 상수 ============
RoF.Data.R_LABEL = Object.freeze({bronze:'브론즈',silver:'실버',gold:'골드',legendary:'전설',divine:'신'});
RoF.Data.R_ORDER = Object.freeze(['bronze','silver','gold','legendary','divine']);

RoF.Data.ROLE_L = Object.freeze({attack:'공격',support:'지원',defense:'방어'});
RoF.Data.ATTACK_EFFECTS = Object.freeze({전사:'⚔️',마법사:'✨',사수:'🏹'});

RoF.Data.ELEMENTS = Object.freeze(['fire','water','lightning','earth','dark','holy']);
RoF.Data.ELEM_L = Object.freeze({fire:'불',water:'물',lightning:'전기',earth:'땅',dark:'암흑',holy:'신성'});
RoF.Data.ELEM_ICON = Object.freeze({fire:'🔥',water:'💧',lightning:'⚡',earth:'🌿',dark:'🌑',holy:'✨'});
RoF.Data.ELEM_COLOR = Object.freeze({fire:'#ff4422',water:'#4488ff',lightning:'#ffdd00',earth:'#88aa44',dark:'#aa44ff',holy:'#ffd700'});

RoF.Data.ENEMY_NAMES = Object.freeze([
  'Aldric','Baldric','Cedric','Dunstan','Edmund','Fendrel','Godric','Hadrian','Isolde','Jareth',
  'Kendric','Leofric','Morwen','Norgard','Osric','Percival','Quillan','Roland','Sigmund','Theron',
  'Ulric','Valerik','Wulfric','Xander','Ysabel','Aldwin','Bertram','Clovis','Draven','Elowen',
  'Finnian','Gareth','Halvard','Ingram','Jorvald','Kael','Lothar','Magnus','Norbert','Oberon',
  'Pellinor','Ragnar','Serafin','Tristan','Uther','Valorin','Warrick','Alaric','Beren','Cassian',
  'Darius','Elric','Fabian','Gawain','Hector','Ivrain','Jasper','Korvin','Lancelot','Merrick',
  'Nikolai','Orion','Phelan','Reynard','Silvain','Tormund','Ulwin','Vesper','Wendel','Arden',
  'Brandt','Corwin','Dorian','Emeric','Florian','Grimwald','Horatio','Ivar','Kestrel','Lysander',
  'Mordred','Nereus','Osgood','Priam','Roderic','Stellan','Tybalt','Valdric','Wolfgang','Ambrose',
  'Brennan','Caspian','Drystan','Everard','Fenwick','Galahad','Helmut','Ignatius','Konrad','Leander',
]);

RoF.Data.HERO_ROLES = Object.freeze([
  {id:'melee',name:'근접',icon:'⚔️',desc:'전장의 최전선에서 싸우는 전사',type:'전사'},
  {id:'ranged',name:'원거리',icon:'🏹',desc:'후방에서 정확한 사격을 날리는 궁수',type:'사수'},
  {id:'support',name:'지원',icon:'🔮',desc:'마법으로 전장을 지배하는 마법사',type:'마법사'},
]);

// ============ 호환성 레이어 ============
window.R_LABEL = RoF.Data.R_LABEL;
window.R_ORDER = RoF.Data.R_ORDER;
window.ROLE_L = RoF.Data.ROLE_L;
window.ATTACK_EFFECTS = RoF.Data.ATTACK_EFFECTS;
window.ELEMENTS = RoF.Data.ELEMENTS;
window.ELEM_L = RoF.Data.ELEM_L;
window.ELEM_ICON = RoF.Data.ELEM_ICON;
window.ELEM_COLOR = RoF.Data.ELEM_COLOR;
window.ENEMY_NAMES = RoF.Data.ENEMY_NAMES;
window.HERO_ROLES = RoF.Data.HERO_ROLES;
