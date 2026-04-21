'use strict';

// === 주인공 시스템 (2026-04-21 리뉴얼) ===
// 성별(m/f) × 역할(warrior/ranger/support) = 6 템플릿.
// 원소(6종)는 런타임 주입 — 스탯 보너스 + 시그니처 스킬만 원소별 다름 (사용자 결정 B안).
// 스킨(외형)은 생성 시 랜덤 선택 후 고정 (user.hero.skinIndex).
//
// 이전 시스템 (h_m_*, h_r_*, h_s_* 18종) → 폐기 예정.
// createHero() 가 기존 CARDS schema 와 호환되는 유닛 객체 반환.
(function(){

// ── 역할별 베이스 스탯 (성별·원소 무관) ──
// 기존 18종 h_* 의 베이스 스펙 (원소 보너스 적용 전) 을 그대로 계승.
// 원소 보너스 적용 후 (ELEMENT_BONUS) 의 최종 스탯이 구 h_*와 동일하여 밸런스 중립.
const HERO_BASE = Object.freeze({
  warrior: {role:'attack',  range:'melee',  type:'전사',   icon:'⚔️',
    atk:2, hp:50, def:1, spd:1, nrg:5,  luck:1, eva:1, meva:1, hpReg:2, nrgReg:1},
  ranger:  {role:'attack',  range:'ranged', type:'사수',   icon:'🏹',
    atk:3, hp:30, def:1, spd:1, nrg:10, luck:1, eva:1, meva:1, hpReg:1, nrgReg:1},
  support: {role:'support', range:'ranged', type:'마법사', icon:'🔮',
    atk:1, hp:25, def:1, spd:1, nrg:30, luck:1, eva:1, meva:1, hpReg:1, nrgReg:2},
});

// ── 원소 보너스 (rules/04-balance.md 영웅 원소 섹션) ──
// 2026-04-21: rage 제거 → fire 는 atk 만 +2 (rage+2 흡수 없음, 단순화)
const ELEMENT_BONUS = Object.freeze({
  fire:      {atk:+2},
  water:     {hp:+8, hpReg:+1},
  lightning: {spd:+3, eva:+2},
  earth:     {hp:+5, def:+2},
  dark:      {atk:+1, luck:+3},
  holy:      {nrg:+3, meva:+2},
});

// ── 스킨 (성별 × 역할) → 이미지 파일명 배열. 신규 생성 시 랜덤 slot. ──
const HERO_SKINS = Object.freeze({
  m: {
    warrior: ['protagonist_m_warrior_1','protagonist_m_warrior_2','protagonist_m_warrior_3'],
    ranger:  ['protagonist_m_ranger'],
    support: ['protagonist_m_support'],
  },
  f: {
    warrior: ['protagonist_f_warrior'],
    ranger:  ['protagonist_f_ranger'],
    support: ['protagonist_f_support'],
  },
});

// ── 역할별 한국어 이름 (카드 이름에 표시) ──
const HERO_NAMES = Object.freeze({
  warrior: '근접 전사',
  ranger:  '원거리 궁수',
  support: '지원 마법사',
});

// ── 시그니처 스킬 + 보너스 트리거 테이블 (원소 × 역할) ──
// 기존 h_*.skill / bonusTrigger 값을 그대로 계승. buildUnitSkillSet 이 해석.
const HERO_SKILL_TABLE = Object.freeze({
  warrior: {
    fire:      {skill:'frenzy',       skillType:'passive', skillChance:1,  skillNrg:0, skillDesc:'[패시브] 광기: HP50%↓시 공격2배',
                bonusTrigger:{on:'attack', chance:.2,  effect:'cleave',        desc:'20% 공격시: 인접 적에게 50% 추가데미지'},
                skillIds:['sk_flame_arrow']},
    water:     {skill:'taunt',        skillType:'passive', skillChance:1,  skillNrg:0, skillDesc:'[패시브] 도발: 적 공격을 대신 받음',
                bonusTrigger:{on:'hit',    chance:.2,  effect:'counter',       desc:'20% 반격: 피격시 공격력50% 반격'}},
    lightning: {skill:'first_strike', skillType:'passive', skillChance:1,  skillNrg:0, skillDesc:'[패시브] 선제: 항상 먼저 공격',
                bonusTrigger:{on:'attack', chance:.25, effect:'double_arrow',  desc:'25% 연격: 공격시 2회 타격'}},
    earth:     {skill:'armor',        skillType:'passive', skillChance:1,  skillNrg:0, skillDesc:'[패시브] 방어: 받는 피해 -3',
                bonusTrigger:{on:'hit',    chance:.2,  effect:'thorns',        desc:'20% 가시: 피격시 공격자에게 3데미지'}},
    dark:      {skill:'life_steal',   skillType:'passive', skillChance:.5, skillNrg:0, skillDesc:'[패시브 50%] 생명흡수: 피해100%회복',
                bonusTrigger:{on:'kill',   chance:.4,  effect:'soul_harvest',  desc:'40% 처치시: 공격력+3 영구'}},
    holy:      {skill:'heal_self',    skillType:'active',  skillChance:.9, skillNrg:2, skillDesc:'[액티브 90%] 신성: HP4회복 (에너지2)',
                bonusTrigger:{on:'skill',  chance:.2,  effect:'divine_shield', desc:'20% 비전 발동 시: 다음 피해 1회 무효'}},
  },
  ranger: {
    fire:      {skill:'aoe',          skillType:'active',  skillChance:.6, skillNrg:4, skillDesc:'[액티브 60%] 화살비: 적전체 3데미지 (에너지4)',
                bonusTrigger:{on:'skill',  chance:.25, effect:'ignite',        desc:'25% 비전 발동 시: 대상 2턴 화상(턴당3)'}},
    water:     {skill:'freeze',       skillType:'active',  skillChance:.5, skillNrg:5, skillDesc:'[액티브 50%] 빙결: 1턴 행동불가 (에너지5)',
                bonusTrigger:{on:'attack', chance:.15, effect:'frostbite',     desc:'15% 공격시: 대상 스피드-3'}},
    lightning: {skill:'pierce',       skillType:'passive', skillChance:1,  skillNrg:0, skillDesc:'[패시브] 관통: 방어무시',
                bonusTrigger:{on:'attack', chance:.2,  effect:'headshot',      desc:'20% 공격시: 대상 HP 10% 즉사'}},
    earth:     {skill:'armor',        skillType:'passive', skillChance:1,  skillNrg:0, skillDesc:'[패시브] 위장: 받는 피해 -3',
                bonusTrigger:{on:'hit',    chance:.2,  effect:'thorns',        desc:'20% 반격: 피격시 독가시 3데미지'}},
    dark:      {skill:'crit',         skillType:'passive', skillChance:.3, skillNrg:0, skillDesc:'[패시브 30%] 급소: 3배 데미지',
                bonusTrigger:{on:'kill',   chance:.4,  effect:'stealth',       desc:'40% 처치시: 다음턴 회피 100%'}},
    holy:      {skill:'first_strike', skillType:'passive', skillChance:1,  skillNrg:0, skillDesc:'[패시브] 선제: 항상 먼저 공격',
                bonusTrigger:{on:'attack', chance:.2,  effect:'double_arrow',  desc:'20% 쌍발: 공격시 2회 타격'}},
  },
  support: {
    fire:      {skill:'aoe',          skillType:'active',  skillChance:.7, skillNrg:4, skillDesc:'[액티브 70%] 화염: 적전체 3데미지 (에너지4)',
                bonusTrigger:{on:'skill',  chance:.25, effect:'ignite',        desc:'25% 비전 발동 시: 대상 2턴 화상(턴당3)'}},
    water:     {skill:'heal_ally',    skillType:'active',  skillChance:.8, skillNrg:3, skillDesc:'[액티브 80%] 치유: 아군 HP5 회복 (에너지3)',
                bonusTrigger:{on:'skill',  chance:.3,  effect:'group_heal',    desc:'30% 비전 발동 시: 아군 전체 HP2 회복'}},
    lightning: {skill:'inspire',      skillType:'active',  skillChance:.7, skillNrg:4, skillDesc:'[액티브 70%] 전기충전: 아군 전체 공격+2 (에너지4)',
                bonusTrigger:{on:'skill',  chance:.25, effect:'arcane_burst',  desc:'25% 비전 발동 시: 적전체 2추가데미지'}},
    earth:     {skill:'mass_heal',    skillType:'active',  skillChance:.8, skillNrg:4, skillDesc:'[액티브 80%] 대치유: 아군전체 HP3 (에너지4)',
                bonusTrigger:{on:'skill',  chance:.2,  effect:'bless',         desc:'20% 비전 발동 시: 랜덤 아군 보호막+3'}},
    dark:      {skill:'drain',        skillType:'passive', skillChance:.7, skillNrg:0, skillDesc:'[패시브 70%] 흡수: 피해50%회복',
                bonusTrigger:{on:'kill',   chance:.35, effect:'soul_harvest',  desc:'35% 처치시: 공격력+3 영구'}},
    holy:      {skill:'heal_ally',    skillType:'active',  skillChance:.9, skillNrg:3, skillDesc:'[액티브 90%] 신성치유: 아군 HP6 회복 (에너지3)',
                bonusTrigger:{on:'skill',  chance:.25, effect:'group_heal',    desc:'25% 비전 발동 시: 아군 전체 HP3 회복'}},
  },
});

// ── 옵션 리스트 (UI 렌더용) ──
RoF.Data.HERO_OPTIONS = Object.freeze({
  genders:  ['m','f'],
  roles:    ['warrior','ranger','support'],
  elements: ['fire','water','lightning','earth','dark','holy'],
});

RoF.Data.HERO_LABELS = Object.freeze({
  genders:  {m:'남성', f:'여성'},
  roles:    {warrior:'근접 전사', ranger:'원거리 궁수', support:'지원 마법사'},
  elements: {fire:'불', water:'물', lightning:'전기', earth:'땅', dark:'암흑', holy:'신성'},
});

// ── 스킨 개수 조회 (랜덤 범위 결정용) ──
RoF.Data.getHeroSkinCount = function(gender, role) {
  return (HERO_SKINS[gender] && HERO_SKINS[gender][role] || []).length;
};

// ── 스킨 파일명 조회 ──
RoF.Data.getHeroSkinKey = function(gender, role, skinIndex) {
  const list = HERO_SKINS[gender] && HERO_SKINS[gender][role];
  if (!list || !list.length) return null;
  const i = Math.max(0, Math.min(skinIndex|0, list.length - 1));
  return list[i];
};

// ── Legacy role alias (구 auth 플로우의 'melee'|'ranged' 를 흡수) ──
const ROLE_ALIAS = Object.freeze({melee:'warrior', ranged:'ranger'});

// ── 영웅 유닛 객체 생성 ──
// opts = {gender:'m'|'f', role:'warrior'|'ranger'|'support'|'melee'|'ranged', element:'fire'|..., skinIndex?:int}
// 반환값은 CARDS 의 다른 유닛과 동일한 schema (buildUnitSkillSet 해석 호환).
RoF.Data.createHero = function(opts) {
  const gender  = opts && opts.gender;
  const rawRole = opts && opts.role;
  const role    = ROLE_ALIAS[rawRole] || rawRole;
  const element = opts && opts.element;
  const base    = HERO_BASE[role];
  if (!base) throw new Error('createHero: unknown role ' + role);
  if (!HERO_SKINS[gender] || !HERO_SKINS[gender][role]) {
    throw new Error('createHero: unknown gender/role ' + gender + '/' + role);
  }
  if (!ELEMENT_BONUS[element]) {
    throw new Error('createHero: unknown element ' + element);
  }

  const skinList  = HERO_SKINS[gender][role];
  const skinIndex = (opts.skinIndex != null)
    ? Math.max(0, Math.min(opts.skinIndex|0, skinList.length - 1))
    : Math.floor(Math.random() * skinList.length);
  const skinKey   = skinList[skinIndex];
  const bonus     = ELEMENT_BONUS[element] || {};
  const skillCell = (HERO_SKILL_TABLE[role] || {})[element] || {};

  const hero = {
    id:       `hero_${gender}_${role}_${element}`,
    name:     HERO_NAMES[role],
    icon:     base.icon,
    type:     base.type,
    role:     base.role,
    range:    base.range,
    race:     'human',
    element:  element,
    rarity:   'bronze',
    gender:   gender,
    _heroRole:role,      // 템플릿 role (warrior/ranger/support), 유닛 role(attack/support)과 별개
    skinIndex:skinIndex,
    skinKey:  skinKey,
    atk:   base.atk   + (bonus.atk   || 0),
    hp:    base.hp    + (bonus.hp    || 0),
    def:   base.def   + (bonus.def   || 0),
    spd:   base.spd   + (bonus.spd   || 0),
    nrg:   base.nrg   + (bonus.nrg   || 0),
    luck:  base.luck  + (bonus.luck  || 0),
    eva:   base.eva   + (bonus.eva   || 0),
    meva:  base.meva  + (bonus.meva  || 0),
    hpReg: base.hpReg + (bonus.hpReg || 0),
    nrgReg:base.nrgReg+ (bonus.nrgReg|| 0),
    _isHero: true,
  };
  if (skillCell.skill)        hero.skill        = skillCell.skill;
  if (skillCell.skillType)    hero.skillType    = skillCell.skillType;
  if (skillCell.skillChance != null) hero.skillChance = skillCell.skillChance;
  if (skillCell.skillNrg != null)    hero.skillNrg    = skillCell.skillNrg;
  if (skillCell.skillDesc)    hero.skillDesc    = skillCell.skillDesc;
  if (skillCell.bonusTrigger) hero.bonusTrigger = skillCell.bonusTrigger;
  if (skillCell.skillIds)     hero.skillIds     = skillCell.skillIds.slice();
  return hero;
};

// ── 영웅 ID 판별 (레거시 h_* / 신 hero_* 모두 인식) ──
RoF.Data.isHeroId = function(id) {
  if (!id || typeof id !== 'string') return false;
  return id.startsWith('hero_') || id.startsWith('h_m_') || id.startsWith('h_r_') || id.startsWith('h_s_');
};

})();
