'use strict';

// PHASE 3 마이그레이션 단위 테스트
// 실행: node game/tools/test_migration.js

// 가짜 RoF 네임스페이스 (TRAITS_DB 포함) 를 먼저 주입
globalThis.RoF = {
  Data: {
    TRAITS_DB: [
      {id:'tr_power',  name:'힘의 각인', effect:{atk:3}},
      {id:'tr_shield', name:'수호 각인', effect:{def:3}},
      {id:'tr_swift',  name:'바람 각인', effect:{spd:3}},
    ],
  },
};

const Migration = require('../js/16_migration.js');

let pass = 0, fail = 0;
function test(name, fn){
  try { fn(); console.log('  ✓', name); pass++; }
  catch(e){ console.error('  ✗', name, '—', e.message); fail++; }
}
function assertEq(a, b, msg){
  if(JSON.stringify(a) !== JSON.stringify(b))
    throw new Error((msg||'') + ' expected ' + JSON.stringify(b) + ' got ' + JSON.stringify(a));
}
function assert(cond, msg){ if(!cond) throw new Error(msg||'assertion failed'); }

console.log('\n[P0-1] initUnitEnergy / refillEnergyAtRoundStart');
test('nrg 기본값 주입 + currentNrg=nrg', ()=>{
  const u = {nrg:10};
  Migration.initUnitEnergy(u);
  assertEq(u.currentNrg, 10, 'currentNrg');
  assertEq(u.usedNrgThisRound, false, 'usedNrgThisRound');
  assertEq(u.nrg, 10, 'nrg 원본 불변');
});
test('nrg 누락 시 0 주입', ()=>{
  const u = {};
  Migration.initUnitEnergy(u);
  assertEq(u.nrg, 0);
  assertEq(u.currentNrg, 0);
});
test('refillEnergyAtRoundStart 전원 리셋', ()=>{
  const us = [{nrg:5, currentNrg:0, usedNrgThisRound:true},
              {nrg:8, currentNrg:3, usedNrgThisRound:true}];
  Migration.refillEnergyAtRoundStart(us);
  assertEq(us[0].currentNrg, 5);
  assertEq(us[1].currentNrg, 8);
  assert(us.every(u=>u.usedNrgThisRound===false), 'used flag reset');
});

console.log('\n[P0-2] convertEquipsToSlots');
test('기존 배열 → ownedSkills 이관 + 빈 3슬롯', ()=>{
  const u = {equips:[
    {id:'sk_power', name:'강타', uid:'a1'},
    {id:'sk_shield', name:'강화방패', uid:'a2'},
  ]};
  Migration.convertEquipsToSlots(u);
  assertEq(u.ownedSkills.length, 2, 'ownedSkills 보존');
  assertEq(u.equips_legacy.length, 2, 'legacy 백업');
  assertEq(u.equips, {weapon:null, armor:null, tool:null}, '빈 3슬롯');
});
test('idempotent — 이미 객체 구조면 skip', ()=>{
  const u = {equips:{weapon:{id:'wp'}, armor:null, tool:null}};
  Migration.convertEquipsToSlots(u);
  assertEq(u.equips.weapon.id, 'wp', '기존 객체 보존');
  assert(!u.equips_legacy, 'legacy 안 만듦');
});
test('equips 없을 때 안전', ()=>{
  const u = {};
  Migration.convertEquipsToSlots(u);
  assertEq(u.equips, {weapon:null, armor:null, tool:null});
  assertEq(u.equips_legacy, []);
});

console.log('\n[P0-3] splitOwnedSkills');
test('TRAITS_DB 매칭되는 sk_* → tr_*', ()=>{
  const u = {ownedSkills:[
    {id:'sk_power'},     // tr_power 있음 → 트레잇으로 이동
    {id:'sk_shield'},    // tr_shield 있음 → 트레잇으로 이동
    {id:'sk_godslayer'}, // 매칭 없음 → 남음
  ]};
  Migration.splitOwnedSkills(u);
  assertEq(u.ownedTraits, ['tr_power','tr_shield']);
  assertEq(u.ownedSkills.length, 1);
  assertEq(u.ownedSkills[0].id, 'sk_godslayer');
});
test('string id 도 처리', ()=>{
  const u = {ownedSkills:['sk_swift','sk_unknown']};
  Migration.splitOwnedSkills(u);
  assertEq(u.ownedTraits, ['tr_swift']);
  assertEq(u.ownedSkills, ['sk_unknown']);
});

console.log('\n[파이프라인] migrateUnit + serializeUnit');
test('3단 파이프라인 순서', ()=>{
  const u = {nrg:7, equips:[{id:'sk_power'},{id:'sk_godslayer'}]};
  Migration.migrateUnit(u);
  assertEq(u.currentNrg, 7);
  assertEq(u.equips, {weapon:null, armor:null, tool:null});
  assertEq(u.ownedTraits, ['tr_power']);
  assertEq(u.ownedSkills.length, 1);
  assertEq(u.ownedSkills[0].id, 'sk_godslayer');
});
test('serializeUnit 런타임 필드 제거', ()=>{
  const u = {nrg:5, currentNrg:2, usedNrgThisRound:true, name:'x'};
  const s = Migration.serializeUnit(u);
  assert(!('currentNrg' in s));
  assert(!('usedNrgThisRound' in s));
  assertEq(s.nrg, 5);
  assertEq(s.name, 'x');
  assertEq(u.currentNrg, 2, '원본 불변');
});

console.log('\n──────────────');
console.log('  PASS:', pass, ' FAIL:', fail);
process.exit(fail > 0 ? 1 : 0);
