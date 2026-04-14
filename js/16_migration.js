'use strict';

// ─────────────────────────────────────────────────────────────
// PHASE 3 Battle Renewal — Runtime Migration
// 설계 문서: design/battle-v2-migration.md
//
// 순수 함수 모듈. index.html 로드 전에는 자동 실행되지 않음.
// 호출자(예: 50_game_core.js 유닛 인스턴스 생성 지점)가 명시적으로 호출.
// ─────────────────────────────────────────────────────────────

(function(global){
  const RoF = global.RoF = global.RoF || {};
  const Migration = RoF.Migration = RoF.Migration || {};

  // ── P0-1: 에너지 런타임 필드 초기화 ──
  // unit.nrg 는 "최대치" 로 재해석. currentNrg 는 런타임 전용 (저장 X).
  // 데이터 파일(11_data_units.js) 은 수정하지 않음.
  Migration.initUnitEnergy = function(unit){
    if(!unit) return unit;
    if(typeof unit.nrg !== 'number') unit.nrg = 0;
    if(unit.currentNrg == null) unit.currentNrg = unit.nrg;
    unit.usedNrgThisRound = false;
    return unit;
  };

  // 라운드 시작 시 모든 유닛 에너지 재충전
  Migration.refillEnergyAtRoundStart = function(units){
    if(!Array.isArray(units)) return;
    units.forEach(function(u){
      if(!u) return;
      u.currentNrg = u.nrg || 0;
      u.usedNrgThisRound = false;
    });
  };

  // ── P0-2: equips 배열 → {weapon, armor, tool} 객체 변환 ──
  // 기존 배열 전체는 equips_legacy + ownedSkills 로 이관 (데이터 손실 0).
  // 새 3슬롯은 빈 상태로 시작.
  Migration.convertEquipsToSlots = function(unit){
    if(!unit) return unit;
    // 이미 객체 구조면 skip (idempotent)
    if(unit.equips && typeof unit.equips === 'object' && !Array.isArray(unit.equips)){
      return unit;
    }
    const legacy = Array.isArray(unit.equips) ? unit.equips.slice() : [];
    unit.equips_legacy = legacy;
    unit.ownedSkills = unit.ownedSkills || [];
    legacy.forEach(function(item){
      if(item && item.id) unit.ownedSkills.push(item);
    });
    unit.equips = {weapon:null, armor:null, tool:null};
    return unit;
  };

  // ── P0-3: ownedSkills 에서 패시브(트레잇)를 ownedTraits 로 분리 ──
  // DISABLED (2026-04-14): P0-3 해결 방식이 "물리 분리" 에서 "passive:true 플래그 + RoF.isSkillPassive"
  // 로 변경됨 (사용자 승인). TRAITS_DB 신규 파일 생성은 보류.
  // 이 함수는 TRAITS_DB 가 존재하는 경우에만 분리 로직을 실행하도록 가드 — 조용한 거동 변경 방지.
  // 향후 TRAITS_DB 도입 시 가드 제거하면 자동 활성.
  Migration.splitOwnedSkills = function(unit){
    if(!unit) return unit;
    const traitsDb = (RoF.Data && RoF.Data.TRAITS_DB) || null;
    // 가드: TRAITS_DB 미정의 → 조기 return (passive 플래그 방식 사용 중)
    if(!traitsDb || !Array.isArray(traitsDb) || traitsDb.length === 0){
      unit.ownedTraits = unit.ownedTraits || [];
      return unit;
    }
    unit.ownedTraits = unit.ownedTraits || [];
    const skills = unit.ownedSkills || [];
    const remaining = [];
    skills.forEach(function(s){
      const id = typeof s === 'string' ? s : (s && s.id);
      if(!id){ remaining.push(s); return; }
      const traitId = id.replace(/^sk_/, 'tr_');
      const hit = traitsDb.find(function(t){return t.id===traitId;});
      if(hit){
        unit.ownedTraits.push(traitId);
      } else {
        remaining.push(s);
      }
    });
    unit.ownedSkills = remaining;
    return unit;
  };

  // 저장 직전 런타임 필드 제거 (localStorage 직렬화용)
  Migration.serializeUnit = function(unit){
    if(!unit) return unit;
    const u = Object.assign({}, unit);
    delete u.currentNrg;
    delete u.usedNrgThisRound;
    return u;
  };

  // 전체 마이그레이션 파이프라인 (순서 고정)
  Migration.migrateUnit = function(unit){
    Migration.initUnitEnergy(unit);
    Migration.convertEquipsToSlots(unit);
    Migration.splitOwnedSkills(unit);
    return unit;
  };

  // CommonJS 호환 (node 테스트용)
  if(typeof module !== 'undefined' && module.exports){
    module.exports = Migration;
  }
})(typeof window !== 'undefined' ? window : globalThis);
