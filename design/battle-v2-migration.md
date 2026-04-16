# PHASE 3 전투 리뉴얼 — 데이터 마이그레이션 안전 가이드

> 상태: **설계 완료 (2026-04-14)**
> 대상 블로커: game-designer 가 발견한 P0 3개 해결 방안 상세
> 원칙: 확장 쉬운 구조 + 데이터 손실 0 + 런타임 안전

본 문서는 PHASE 3 시네마틱 전투 리뉴얼 구현 시 **기존 세이브 데이터·코드와의 호환성** 을 깨뜨리지 않기 위한 마이그레이션 전략을 정의합니다.

## 🎯 원칙

1. **데이터 파일 (`js/11_data_units.js` 등) 직접 수정 최소화** — 런타임 어댑터로 처리
2. **원본 데이터 백업** — 변환 전 상태를 `*_legacy` 키로 보존
3. **기본값 정의** — 새 필드가 빠진 경우 대비
4. **fallback 경로** — 예상 못 한 데이터는 "손실 없이 인벤토리로 회수"
5. **레거시 로드 가능** — 플래그 OFF 시 구 세이브 데이터도 그대로 로드

---

## 🔴 블로커 P0-1: `nrg` 필드 의미 충돌

### 문제
- 기존 `nrg` 는 단일 수치 (현재 = 최대)
- 새 공식은 "풀 충전 → 쓴 만큼 회복" 이라 **nrgMax** 개념 필요
- 기존 `11_data_units.js` 에 `nrgMax` 필드가 없음

### 해결: 런타임 어댑터 (데이터 파일 0 수정)

**`js/16_migration.js`** (신규)

```js
RoF.Migration = RoF.Migration || {};

/**
 * 유닛 인스턴스 로드 시 에너지 런타임 필드 초기화.
 * - unit.nrg → 최대치로 재해석
 * - unit.currentNrg → 현재치 (런타임 전용, 저장 안 됨)
 * - unit.usedNrgThisRound → 회복 트리거 플래그
 * 기존 데이터 파일은 건드리지 않음.
 */
RoF.Migration.initUnitEnergy = (unit) => {
  if (typeof unit.nrg !== 'number') unit.nrg = 0;
  if (unit.currentNrg == null) unit.currentNrg = unit.nrg;  // 기본값 = 최대
  unit.usedNrgThisRound = false;
  return unit;
};

/**
 * 라운드 시작 시 모든 유닛 에너지 재충전.
 */
RoF.Migration.refillEnergyAtRoundStart = (units) => {
  units.forEach(u => {
    u.currentNrg = u.nrg;
    u.usedNrgThisRound = false;
  });
};
```

**적용 지점**:
- 덱 로드 직후 (`50_game_core.js` 유닛 인스턴스 생성 구간)
- 새 라운드 시작 시 (`60_turnbattle_v2.js`)

**검증**:
- [ ] `unit.nrg` 값이 수정되지 않는지 (읽기만)
- [ ] `currentNrg` 가 1 라운드 동안 감소만 (사용 후) + 새 라운드 시작 시 리셋
- [ ] 기존 `11_data_units.js` 파일 diff 0 줄

---

## 🔴 블로커 P0-2: `equips` 배열에 `slot` 필드 없음

### 문제
- 기존 `c.equips = [{id, name, uid, icon}]` 배열 구조
- `item.slot` 필드가 **어디에도 없음**
- 기존 코드는 `equips` 에 **스킬과 장비를 섞어서** push
- 새 구조 `equips: {weapon, armor, tool}` 로 단순 변환 불가

### 해결: 안전한 단순화 (데이터 손실 없음)

**전략**:
1. 기존 `equips` 배열 **전체** 를 `ownedSkills` 로 이동 (손실 위험 최소)
2. 장비 3슬롯은 **빈 상태로 시작** (모두 null)
3. 기존 장비는 유저 인벤토리에서 **"복구 대기"** 상태로 유지
4. 새 장비 데이터가 추가되면 `slot` 필드가 생기므로 그때부터 정상 장착 가능

**`js/16_migration.js`** 추가:

```js
/**
 * 유닛 equips 배열을 새 구조로 변환.
 * 1. 기존 배열 → ownedSkills 로 전부 이관 (스킬/장비 구분 불가하므로 안전 우선)
 * 2. equips 는 빈 3슬롯으로 재생성
 * 3. 원본 백업은 unit.equips_legacy 키에 보존 (롤백 가능)
 */
RoF.Migration.convertEquipsToSlots = (unit) => {
  // 이미 변환된 경우 skip
  if (unit.equips && typeof unit.equips === 'object' && !Array.isArray(unit.equips)) {
    return unit;
  }
  // 백업
  unit.equips_legacy = Array.isArray(unit.equips) ? [...unit.equips] : [];
  // ownedSkills 로 이관
  unit.ownedSkills = unit.ownedSkills || [];
  (unit.equips_legacy || []).forEach(item => {
    if (item && item.id) unit.ownedSkills.push(item);
  });
  // 빈 3슬롯 재생성
  unit.equips = { weapon: null, armor: null, tool: null };
  return unit;
};

/**
 * 저장 직전 마이그레이션 결과를 localStorage 형태로 직렬화.
 * equips_legacy 는 영구 보존 (롤백/장비 복원용).
 */
RoF.Migration.serializeUnit = (unit) => {
  const u = { ...unit };
  delete u.currentNrg;         // 런타임 전용
  delete u.usedNrgThisRound;   // 런타임 전용
  return u;
};
```

**적용 지점**:
- 덱 로드 직후 — 모든 유닛에 `convertEquipsToSlots` 적용
- 저장 직전 — 런타임 필드 제거 후 저장

**검증**:
- [ ] 기존 세이브 데이터 로드 시 에러 없음
- [ ] `unit.ownedSkills.length` 가 원래 `equips.length` 와 동일 (데이터 보존)
- [ ] `unit.equips.weapon === null` (빈 상태)
- [ ] `unit.equips_legacy` 에 원본 배열 유지
- [ ] 플래그 OFF 상태에서 레거시 전투가 새 구조를 읽어도 크래시 없음

---

## 🔴 블로커 P0-3: `SKILLS_DB` 28개 중 25개가 패시브

> ### ⚠️ 2026-04-14 해결 방식 변경 — 물리 분리 보류, 플래그 기반으로 전환
>
> 원래 계획한 **물리 분리(별도 `12_data_traits.js` 파일 + `sk_*` → `tr_*` 프리픽스 변경)** 는 **사용자 승인 하에 보류**. 대신 다음 방식으로 해결:
>
> **채택된 방식 (passive 플래그)**:
> - `js/12_data_skills.js` 에 28개 전부 `passive:true` 필드 추가 (기존 파일 유지)
> - 판별 헬퍼 `RoF.isSkillPassive(idOrObj)` 한 곳에서 처리 (플래그 누락 시 안전 기본 = 패시브)
> - UI 분기: `60_turnbattle.js` 에서 패시브 카드를 회색 점선 + 클릭 시 "패시브 사용 불가" 안내로 처리
> - 새 액티브 스펠은 `{passive:false}` 로 같은 파일에 추가
>
> **사유**: 28개 수동 재분류 리스크 + 두 파일 관리 복잡도. 플래그 1개로 동일 효과.
>
> **`Migration.splitOwnedSkills` 함수의 현재 상태**:
> - 여전히 `js/16_migration.js` 에 존재하지만 **가드로 no-op** — `RoF.Data.TRAITS_DB` 미정의 시 조기 return
> - 단위 테스트는 mock TRAITS_DB 주입으로 여전히 10/10 통과 (방어 코드로 유지)
> - 향후 TRAITS_DB 도입 결정 시 가드 제거하면 자동 활성
>
> **아래 §P0-3 섹션(물리 분리 설계안)은 참고용**으로 보존되나 현재 구현과 일치하지 않음.

---

### [참고] 원래 설계안 — 물리 분리 (보류)

### 문제
- 기존 `12_data_skills.js` 의 28개 스킬 중 대부분이 `atk+3`, `def+3`, `hp+10` 같은 **패시브 스탯 보정**
- PHASE 3 는 "모든 스킬 = 액티브 카드" 전제
- 섞어두면 `cost/apCost/cooldown/targetType` 필드가 25개에서 무의미

### 해결: 물리 분리 + `/스킬이분할` 스킬

**파일 분리**:

1. **`js/12_data_traits.js` (신규)** — 기존 28개 중 패시브만 이주. id `sk_*` → `tr_*` 프리픽스 변경.

```js
RoF.TRAITS_DB = [
  {
    id: 'tr_power',           // 구 sk_power
    name: '힘의 각인',
    rarity: 'bronze',
    type: 'passive',          // 'passive' | 'triggered'
    trigger: null,            // triggered 일 때 'on_hit' 등
    effect: { atk: 3 },       // 스탯 보정 객체
    desc: '공격력 +3',
  },
  // ... 24개 이주
];
```

2. **`js/12_data_skills.js` (재작성)** — 액티브 스펠만. `sp_*` 프리픽스. 초기 1~3개.

```js
RoF.SKILLS_DB = [
  {
    id: 'sp_lightning_strike',
    name: '뇌격',
    rarity: 'legendary',
    attackType: 'spell',
    damage: 15,
    cost: 5,
    costType: 'nrg',
    apCost: 1,
    cooldown: 0,
    targetType: 'all_enemies',
    targetPattern: 'all',
    critBonus: 0,
    critMult: 1.5,
    desc: '적 전체에 15 고정 데미지',
  },
  // ... 수직 슬라이스 후 확장
];
```

**유닛 데이터 마이그레이션**:

```js
RoF.Migration.splitOwnedSkills = (unit) => {
  if (!unit.ownedTraits) unit.ownedTraits = [];
  const skills = unit.ownedSkills || [];
  const remaining = [];
  skills.forEach(s => {
    const id = typeof s === 'string' ? s : s.id;
    const traitId = id.replace(/^sk_/, 'tr_');
    if (RoF.TRAITS_DB.find(t => t.id === traitId)) {
      unit.ownedTraits.push(traitId);
    } else {
      remaining.push(s);
    }
  });
  unit.ownedSkills = remaining;
  return unit;
};
```

**호환성 레이어** (기존 코드가 `SKILLS_DB` 에서 패시브 찾을 때):

```js
/**
 * 구 코드 호환: SKILLS_DB 에서 id 로 찾다가 없으면 TRAITS_DB 도 검색.
 */
RoF.findSkillOrTrait = (id) => {
  return RoF.SKILLS_DB.find(s => s.id === id)
      || RoF.TRAITS_DB.find(t => t.id === id)
      || RoF.TRAITS_DB.find(t => t.id === id.replace(/^sk_/, 'tr_'));
};
```

**적용 순서**:
1. 원본 `12_data_skills.js` `.bak` 백업
2. 28개 수동 분류 (사용자 승인 후)
3. 두 파일 생성
4. grep 으로 `SKILLS_DB` 참조 전수 조사 → 호환성 레이어 또는 직접 수정
5. 유닛 데이터 `ownedSkills` → `ownedSkills + ownedTraits` 런타임 재분류
6. `node tools/test_run.js` 회귀 확인
7. `balance-auditor` 검증

**검증**:
- [ ] 분할 후 합계 28개 (원본 개수 일치)
- [ ] 유닛 로드 시 모든 트레잇 참조 해결
- [ ] 회귀 테스트 8/8 pass
- [ ] balance-auditor 통과
- [ ] 플래그 OFF 레거시 정상

---

## 📋 마이그레이션 실행 순서 (PHASE 3 구현 시)

1. **사전 백업**
   - `cp js/12_data_skills.js js/12_data_skills.js.bak`
   - 로컬스토리지 `rof_save` 키 JSON 덤프 보존

2. **마이그레이션 함수 작성** (`js/16_migration.js`)
   - 위 3개 함수 구현
   - **먼저 단위 테스트 통과**: mock 유닛 데이터로 변환 전후 비교

3. **`/스킬이분할` 스킬 실행** (사용자 승인)
   - 28개 분류 → 두 파일 생성 → 호환성 레이어 주입

4. **유닛 로드 흐름에 마이그레이션 주입**
   - `50_game_core.js` 유닛 인스턴스 생성 지점
   - 순서: `initUnitEnergy` → `convertEquipsToSlots` → `splitOwnedSkills`

5. **회귀 테스트**
   - `node tools/test_run.js` (CI 게이트)
   - 레거시 전투 (`FEATURE.CINEMATIC_BATTLE=false`) 정상 동작 확인

6. **확장성 리뷰**
   - `code-extensibility-reviewer` 에이전트 호출
   - 블로커 발견 시 수정 후 재리뷰

7. **롤백 준비**
   - `.bak` 파일 위치 문서화
   - 롤백 명령 한 줄 준비 (`cp js/12_data_skills.js.bak js/12_data_skills.js`)

---

## 🛡️ 안전장치 체크리스트

### 변환 전
- [ ] 모든 데이터 파일 `.bak` 백업
- [ ] 로컬스토리지 JSON 덤프 저장
- [ ] `test_run.js` 8/8 pass 확인

### 변환 중
- [ ] 단위 테스트 (mock 데이터) 통과
- [ ] 원본 데이터 수정 최소 (nrg 는 0 수정)
- [ ] 런타임 필드는 저장에 포함 안 됨

### 변환 후
- [ ] `test_run.js` 8/8 pass
- [ ] 레거시 전투 정상 동작
- [ ] balance-auditor 검증
- [ ] 확장성 점수 40/50 이상

### 실패 시
- [ ] `.bak` 복구 한 줄로 롤백 가능
- [ ] 로컬스토리지 덤프 복원
- [ ] 시그널·changelog 에 실패 원인 기록
