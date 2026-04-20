'use strict';
const fs = require('fs');
const src = fs.readFileSync('js/11_data_units.js', 'utf8');

const units = [];
const re = /\{id:'([^']+)'[\s\S]*?rarity:'([^']+)'[^}]*\}/g;
let m;
while ((m = re.exec(src)) !== null) {
  const block = m[0];
  const get = (key, def) => {
    const rx = new RegExp(key + ':(\\d+(?:\\.\\d+)?)');
    const mm = block.match(rx);
    return mm ? +mm[1] : def;
  };
  const elemMatch = block.match(/element:'([^']+)'/);
  const roleMatch = block.match(/role:'([^']+)'/);
  units.push({
    id: m[1],
    rarity: m[2],
    element: elemMatch ? elemMatch[1] : '?',
    role: roleMatch ? roleMatch[1] : '?',
    isHero: m[1].startsWith('h_'),
    atk: get('atk', 0),
    hp: get('hp', 0),
    def: get('def', 0),
    spd: get('spd', 0),
    nrg: get('nrg', 0),
    luck: get('luck', 0),
    eva: get('eva', 0),
  });
}

console.log('Parsed:', units.length);

const common = units.filter(u => !u.isHero);
const RARS = ['bronze', 'silver', 'gold', 'legendary', 'divine'];
const ROLES = ['attack', 'defense', 'support'];

const rangeStr = (us, key) => {
  if (us.length === 0) return '-';
  const vs = us.map(u => u[key]);
  const min = Math.min(...vs);
  const max = Math.max(...vs);
  return min === max ? String(min) : `${min}~${max}`;
};

console.log('\n=== 일반 유닛 (N=' + common.length + ') ===');
for (const r of RARS) {
  console.log('\n### ' + r);
  for (const ro of ROLES) {
    const us = common.filter(u => u.rarity === r && u.role === ro);
    console.log('  ' + ro + ' (N=' + us.length + '):',
      'atk', rangeStr(us, 'atk'),
      '| hp', rangeStr(us, 'hp'),
      '| def', rangeStr(us, 'def'),
      '| spd', rangeStr(us, 'spd'),
      '| nrg', rangeStr(us, 'nrg'));
  }
}

console.log('\n=== 영웅 (N=' + (units.length - common.length) + ') ===');
const heroes = units.filter(u => u.isHero);
for (const h of heroes) h.heroRole = h.id.startsWith('h_m_') ? 'melee' : (h.id.startsWith('h_r_') ? 'ranged' : 'support');
for (const hr of ['melee', 'ranged', 'support']) {
  const us = heroes.filter(u => u.heroRole === hr);
  console.log('  ' + hr + ' (N=' + us.length + '):',
    'atk', rangeStr(us, 'atk'),
    '| hp', rangeStr(us, 'hp'),
    '| def', rangeStr(us, 'def'),
    '| spd', rangeStr(us, 'spd'),
    '| nrg', rangeStr(us, 'nrg'));
}
