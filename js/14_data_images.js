'use strict';

// Card illustration mapping (id → image path)
// game-icons.net SVG icons (CC BY 3.0) — white on transparent
(function(){
RoF.Data.GI = 'https://game-icons.net/icons/ffffff/transparent/1x1/';
RoF.Data.IMG = 'img/';

const __GI = RoF.Data.GI;
const __IMG = RoF.Data.IMG;

RoF.Data.CARD_IMG = Object.freeze({
  // 근접 전사 (AI generated)
  h_m_fire:__IMG+'h_m_fire.png',h_m_water:__IMG+'h_m_water.png',h_m_lightning:__IMG+'h_m_lightning.png',
  h_m_earth:__IMG+'h_m_earth.png',h_m_dark:__IMG+'h_m_dark.png',h_m_holy:__IMG+'h_m_holy.png',
  // 원거리 궁수
  h_r_fire:__IMG+'h_r_fire.png',h_r_water:__IMG+'h_r_water.png',h_r_lightning:__IMG+'h_r_lightning.png',
  h_r_earth:__IMG+'h_r_earth.png',h_r_dark:__IMG+'h_r_dark.png',h_r_holy:__IMG+'h_r_holy.png',
  // 지원 마법사
  h_s_fire:__IMG+'h_s_fire.png',h_s_water:__IMG+'h_s_water.png',h_s_lightning:__IMG+'h_s_lightning.png',
  h_s_earth:__IMG+'h_s_earth.png',h_s_dark:__IMG+'h_s_dark.png',h_s_holy:__IMG+'h_s_holy.png',
  // 모집 유닛
  militia:__IMG+'militia.png',hunter:__IMG+'hunter.png',apprentice:__IMG+'apprentice.png',
  wolf:__IMG+'wolf.png',guard:__IMG+'guard.png',rogue:__IMG+'rogue.png',
  herbalist:__IMG+'herbalist.png',lancer:__IMG+'lancer.png',crossbow:__IMG+'crossbow.png',
  fire_spirit:__IMG+'fire_spirit.png',knight:__IMG+'knight.png',assassin:__IMG+'assassin.png',
  pyromancer:__IMG+'pyromancer.png',cryomancer:__IMG+'cryomancer.png',berserker:__IMG+'berserker.png',
  priest:__IMG+'priest.png',thunderbird:__IMG+'thunderbird.png',paladin:__IMG+'paladin.png',
  archmage:__IMG+'archmage.png',death_knight:__IMG+'death_knight.png',sniper:__IMG+'sniper.png',
  phoenix:__IMG+'phoenix.png',dragon:__IMG+'dragon.png',lich:__IMG+'lich.png',
  archangel:__IMG+'archangel.png',titan:__IMG+'titan.png',
  // 스킬
  sk_power:__GI+'lorc/fist.svg',
  sk_shield:__GI+'lorc/shield.svg',
  sk_heal:__GI+'lorc/healing.svg',
  sk_swift:__GI+'lorc/running-ninja.svg',
  sk_rage:__GI+'lorc/enrage.svg',
  sk_evasion:__GI+'lorc/dodge.svg',
  sk_crit_edge:__GI+'lorc/backstab.svg',
  sk_fortress:__GI+'delapouite/castle.svg',
  sk_revive:__GI+'lorc/angel-outfit.svg',
  sk_berserk:__GI+'lorc/enrage.svg',
  sk_transcend:__GI+'lorc/third-eye.svg',
  sk_invincible:__GI+'lorc/aura.svg',
  sk_handoff:__GI+'delapouite/handshake.svg',
  sk_dragonheart:__GI+'lorc/dragon-head.svg',
  // 유물
  rl_banner:__GI+'lorc/rally-the-troops.svg',
  rl_crystal:__GI+'lorc/crystal-growth.svg',
  rl_wall:__GI+'delapouite/brick-wall.svg',
  rl_fury:__GI+'lorc/enrage.svg',
  rl_boots:__GI+'delapouite/boots.svg',
  rl_cloak:__GI+'lorc/hooded-figure.svg',
  rl_doom:__GI+'lorc/bloody-sword.svg',
  rl_luck:__GI+'lorc/clover.svg',
  rl_guard:__GI+'lorc/shield.svg',
  rl_wrath:__GI+'lorc/lightning-storm.svg',
  rl_eternal:__GI+'lorc/holy-grail.svg',
  rl_immortal:__GI+'lorc/aura.svg',
});

// getCardImg 는 순수 함수이므로 RoF 직접 아래에 둠
RoF.getCardImg = function(c){ return RoF.Data.CARD_IMG[c.id] || null; };

// 호환성 레이어
window.GI = RoF.Data.GI;
window.IMG = RoF.Data.IMG;
window.CARD_IMG = RoF.Data.CARD_IMG;
window.getCardImg = RoF.getCardImg;
})();
