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
  // 스킬 — 로컬 PNG 일러스트 (2026-04-12 DreamShaper 생성, 30/30 완료)
  sk_power:__IMG+'sk_power.png', sk_shield:__IMG+'sk_shield.png', sk_heal:__IMG+'sk_heal.png',
  sk_swift:__IMG+'sk_swift.png', sk_tough:__IMG+'sk_tough.png', sk_focus:__IMG+'sk_focus.png',
  sk_rage:__IMG+'sk_rage.png', sk_evasion:__IMG+'sk_evasion.png', sk_energize:__IMG+'sk_energize.png',
  sk_cleave:__IMG+'sk_cleave.png', sk_ironwill:__IMG+'sk_ironwill.png', sk_prayer:__IMG+'sk_prayer.png',
  sk_reflex:__IMG+'sk_reflex.png',
  sk_crit_edge:__IMG+'sk_crit_edge.png', sk_fortress:__IMG+'sk_fortress.png', sk_revive:__IMG+'sk_revive.png',
  sk_bloodlust:__IMG+'sk_bloodlust.png', sk_mirage:__IMG+'sk_mirage.png', sk_warhorn:__IMG+'sk_warhorn.png',
  sk_execute:__IMG+'sk_execute.png', sk_aura:__IMG+'sk_aura.png', sk_handoff:__IMG+'sk_handoff.png',
  sk_berserk:__IMG+'sk_berserk.png', sk_transcend:__IMG+'sk_transcend.png', sk_invincible:__IMG+'sk_invincible.png',
  sk_godslayer:__IMG+'sk_godslayer.png', sk_resurrection:__IMG+'sk_resurrection.png',
  sk_shadowstep:__IMG+'sk_shadowstep.png', sk_dragonheart:__IMG+'sk_dragonheart.png',
  // 유물
  // 유물 — 2026-04-12 픽스: 4개 404 URL을 검증된 대체로 교체
  rl_banner:__GI+'lorc/rally-the-troops.svg',
  rl_crystal:__GI+'lorc/crystal-growth.svg',
  rl_wall:__GI+'delapouite/brick-wall.svg',
  rl_fury:__GI+'lorc/burning-passion.svg',     // was: lorc/enrage (404)
  rl_boots:__GI+'delapouite/walk.svg',         // was: delapouite/boots (404)
  rl_cloak:__GI+'lorc/hood.svg',                // was: lorc/hooded-figure (404)
  rl_doom:__GI+'lorc/bloody-sword.svg',
  rl_luck:__GI+'lorc/clover.svg',
  rl_guard:__GI+'lorc/edged-shield.svg',       // was: lorc/shield (404)
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
