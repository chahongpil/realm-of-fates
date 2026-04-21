'use strict';

// Card illustration mapping (id → image path)
// game-icons.net SVG icons (CC BY 3.0) — white on transparent
(function(){
RoF.Data.GI = 'https://game-icons.net/icons/ffffff/transparent/1x1/';
RoF.Data.IMG = 'img/';

const __GI = RoF.Data.GI;
const __IMG = RoF.Data.IMG;

RoF.Data.CARD_IMG = Object.freeze({
  // 주인공 — 2026-04-21 리뉴얼, 성별×역할 스킨 (원소는 오버레이 레이어로 합성)
  protagonist_m_warrior_1:__IMG+'protagonist_m_warrior_1.png',
  protagonist_m_warrior_2:__IMG+'protagonist_m_warrior_2.png',
  protagonist_m_warrior_3:__IMG+'protagonist_m_warrior_3.png',
  protagonist_m_ranger:   __IMG+'protagonist_m_ranger.png',
  protagonist_m_support:  __IMG+'protagonist_m_support.png',
  protagonist_f_warrior:  __IMG+'protagonist_f_warrior.png',
  protagonist_f_ranger:   __IMG+'protagonist_f_ranger.png',
  protagonist_f_support:  __IMG+'protagonist_f_support.png',
  // 모집 유닛
  militia:__IMG+'militia.png',hunter:__IMG+'hunter.png',apprentice:__IMG+'apprentice.png',
  wolf:__IMG+'wolf.png',guard:__IMG+'guard.png',rogue:__IMG+'rogue.png',
  herbalist:__IMG+'herbalist.png',lancer:__IMG+'lancer.png',crossbow:__IMG+'crossbow.png',
  fire_spirit:__IMG+'fire_spirit.png',infantry:__IMG+'infantry.png',archer:__IMG+'archer.png',knight:__IMG+'knight.png',assassin:__IMG+'assassin.png',
  pyromancer:__IMG+'pyromancer.png',cryomancer:__IMG+'cryomancer.png',cryomancer_f:__IMG+'cryomancer_f.png',berserker:__IMG+'berserker.png',
  priest:__IMG+'priest.png',thunderbird:__IMG+'thunderbird.png',griffin:__IMG+'griffin.png',paladin:__IMG+'paladin.png',
  archmage:__IMG+'archmage.png',death_knight:__IMG+'death_knight.png',sniper:__IMG+'sniper.png',
  phoenix:__IMG+'phoenix.png',armored_griffin:__IMG+'armored_griffin.png',dragon:__IMG+'dragon.png',lich:__IMG+'lich.png',
  archangel:__IMG+'archangel.png',griffin_knight:__IMG+'griffin_knight.png',griffin_rider:__IMG+'griffin_rider.png',titan:__IMG+'titan.png',
  archfiend:__IMG+'archfiend.png',
  genie_noble:__IMG+'genie_noble.png',genie_legendary:__IMG+'genie_legendary.png',
  earth_guardian:__IMG+'earth_guardian.png',sea_priest:__IMG+'sea_priest.png',
  behemoth:__IMG+'behemoth.png',leviathan:__IMG+'leviathan.png',
  // 2026-04-21 신규 유닛 11종
  stormcaller:__IMG+'stormcaller.png',
  mountain_breaker:__IMG+'mountain_breaker.png',
  stonemason:__IMG+'stonemason.png',
  stonemason_noble:__IMG+'stonemason_noble.png',
  dark_shaman:__IMG+'dark_shaman.png',
  sea_paladin:__IMG+'sea_paladin.png',
  pirate:__IMG+'pirate.png',
  tidal_knight:__IMG+'tidal_knight.png',
  tidal_knight_noble:__IMG+'tidal_knight_noble.png',
  flame_guardian:__IMG+'flame_guardian.png',
  flame_warrior:__IMG+'flame_warrior.png',
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
  // 2026-04-21 신규 bronze 스펠 3종
  sk_thunder_arrow:__IMG+'sk_thunder_arrow.png', sk_hex:__IMG+'sk_hex.png', sk_ember:__IMG+'sk_ember.png',
  // 2026-04-21 저녁 신규 4종 (sk_boil silver 패시브 + sk_minor_curse/sk_spark_blast bronze 액티브 + sk_herb_pack silver 액티브 heal)
  sk_boil:__IMG+'sk_boil.png',
  sk_minor_curse:__IMG+'sk_minor_curse.png',
  sk_spark_blast:__IMG+'sk_spark_blast.png',
  sk_herb_pack:__IMG+'sk_herb_pack.png',
  // 유물
  // 유물 — 2026-04-12 픽스: 4개 404 URL을 검증된 대체로 교체
  rl_banner:__GI+'lorc/rally-the-troops.svg',
  rl_crystal:__GI+'lorc/crystal-growth.svg',
  rl_wall:__GI+'delapouite/brick-wall.svg',
  rl_cloak:__GI+'lorc/hood.svg',                // was: lorc/hooded-figure (404)
  // 2026-04-21 신규 PNG (대표님 공급) — 8장 SVG → PNG 전환 (+rl_fury/rl_boots 추가)
  rl_doom:__IMG+'rl_doom.png',
  rl_luck:__IMG+'rl_luck.png',
  rl_guard:__IMG+'rl_guard.png',
  rl_wrath:__IMG+'rl_wrath.png',
  rl_eternal:__IMG+'rl_eternal.png',
  rl_immortal:__IMG+'rl_immortal.png',
  rl_fury:__IMG+'rl_fury.png',
  rl_boots:__IMG+'rl_boots.png',
});

// getCardImg 는 순수 함수이므로 RoF 직접 아래에 둠
// 주인공(_isHero) 은 id 대신 skinKey 로 매핑 — 원소는 id 에 들어있지만 이미지는 스킨 단위로 공유.
RoF.getCardImg = function(c){
  if(!c) return null;
  if(c._isHero && c.skinKey) return RoF.Data.CARD_IMG[c.skinKey] || null;
  return RoF.Data.CARD_IMG[c.id] || null;
};

// 호환성 레이어
window.GI = RoF.Data.GI;
window.IMG = RoF.Data.IMG;
window.CARD_IMG = RoF.Data.CARD_IMG;
window.getCardImg = RoF.getCardImg;
})();
