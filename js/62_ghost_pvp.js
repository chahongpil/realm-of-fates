'use strict';

// ─────────────────────────────────────────────────────────────
// S2: 고스트 PvP (비동기 대전)
// 상대 덱 스냅샷을 Supabase 에서 로드 → 적군 슬롯에 배치 → AI 큐잉
// 기존 전투 엔진(v2 시네마틱 or 레거시)과 연동.
// ─────────────────────────────────────────────────────────────

(function(global){
  const RoF = global.RoF = global.RoF || {};
  const Arena = RoF.Arena = {};

  // ── 상수 ────────────────────────────────────────────────
  Arena.LP_RANGE     = 100;   // 1차 매칭 LP 범위 (±)
  Arena.WIN_LP       = 20;    // 승리 시 LP 획득
  Arena.LOSE_LP      = 10;    // 패배 시 LP 차감
  Arena.WIN_GOLD     = 15;    // 승리 골드
  Arena.LOSE_GOLD    = 3;     // 패배 위로 골드
  Arena.COOLDOWN_SEC = 30;    // 연속 대전 쿨다운 (초)

  Arena._lastMatchTime = 0;
  Arena._currentOpponent = null;

  // ── 아레나 진입 ─────────────────────────────────────────
  Arena.enter = async function(){
    const B = RoF.Backend || global.Backend;
    const G = RoF.Game;

    if(!B || !B.isReady || !B.getCurrentUser()){
      UI.toast('☁️ 클라우드 연결이 필요합니다. 메뉴에서 클라우드를 연결하세요.');
      return;
    }

    // 쿨다운 체크
    const now = Date.now();
    const elapsed = (now - Arena._lastMatchTime) / 1000;
    if(Arena._lastMatchTime > 0 && elapsed < Arena.COOLDOWN_SEC){
      const remain = Math.ceil(Arena.COOLDOWN_SEC - elapsed);
      UI.toast(`⏱ ${remain}초 후에 다시 도전할 수 있습니다.`);
      return;
    }

    UI.toast('🏟️ 상대를 찾고 있습니다...');

    const {opponent, error} = await B.findGhostOpponent(Arena.LP_RANGE);
    if(error || !opponent){
      UI.toast(error || '상대를 찾을 수 없습니다.');
      return;
    }

    Arena._currentOpponent = opponent;
    Arena._lastMatchTime = Date.now();

    // 매칭 화면 표시
    Arena.showMatchScreen(opponent);
  };

  // ── 매칭 화면 ──────────────────────────────────────────
  Arena.showMatchScreen = function(opp){
    const G = RoF.Game;
    const myLP = G.leaguePoints || 0;
    const myName = (typeof Auth !== 'undefined' && Auth.user) ? Auth.user : '나';

    const el = document.getElementById('arena-match-screen');
    if(!el){
      // 동적 생성 (첫 진입 시)
      Arena._createMatchScreen();
      return Arena.showMatchScreen(opp);
    }

    // 데이터 채우기
    const setT = function(id, txt){ const e = document.getElementById(id); if(e) e.textContent = txt; };
    setT('arena-my-name', myName);
    setT('arena-my-lp', myLP + ' LP');
    setT('arena-opp-name', opp.nickname || '???');
    setT('arena-opp-lp', (opp.league_points || 0) + ' LP');
    setT('arena-opp-wins', '승 ' + (opp.total_wins || 0));

    // 상대 덱 미리보기 (유닛 수만)
    const deckCount = Array.isArray(opp.deck_data) ? opp.deck_data.length : 0;
    setT('arena-opp-deck', deckCount + '명 편성');

    el.style.display = '';
    UI.show('arena-match-screen');
  };

  Arena._createMatchScreen = function(){
    const scr = document.createElement('div');
    scr.id = 'arena-match-screen';
    scr.className = 'screen';
    scr.style.display = 'none';
    scr.innerHTML = [
      '<div class="arena-match-box">',
      '  <h2 class="arena-title">🏟️ 아레나</h2>',
      '  <div class="arena-vs-row">',
      '    <div class="arena-player">',
      '      <div class="arena-player-name" id="arena-my-name">나</div>',
      '      <div class="arena-player-lp" id="arena-my-lp">0 LP</div>',
      '    </div>',
      '    <div class="arena-vs-badge">VS</div>',
      '    <div class="arena-player">',
      '      <div class="arena-player-name" id="arena-opp-name">???</div>',
      '      <div class="arena-player-lp" id="arena-opp-lp">0 LP</div>',
      '      <div class="arena-player-sub" id="arena-opp-wins">승 0</div>',
      '      <div class="arena-player-sub" id="arena-opp-deck">0명 편성</div>',
      '    </div>',
      '  </div>',
      '  <div class="arena-btn-row">',
      '    <button class="btn btn-green" id="arena-btn-fight">⚔️ 도전!</button>',
      '    <button class="btn" id="arena-btn-back">돌아가기</button>',
      '  </div>',
      '</div>',
    ].join('\n');

    const root = document.querySelector('.game-root') || document.body;
    root.appendChild(scr);

    // 이벤트
    document.getElementById('arena-btn-fight').addEventListener('click', function(){
      Arena.startGhostBattle();
    });
    document.getElementById('arena-btn-back').addEventListener('click', function(){
      scr.style.display = 'none';
      RoF.Game.showMenu();
    });
  };

  // ── 고스트 전투 시작 ────────────────────────────────────
  Arena.startGhostBattle = async function(){
    const opp = Arena._currentOpponent;
    if(!opp) return;
    const G = RoF.Game;

    // 상대 덱 → 적군 카드 변환
    const enemyDeck = Arena._buildEnemyDeck(opp);
    if(!enemyDeck || enemyDeck.length === 0){
      UI.toast('상대 덱 데이터가 비어있습니다.');
      return;
    }

    // 아레나 모드 플래그 (전투 종료 시 아레나 보상 처리용)
    G._arenaMode = true;
    G._arenaOpponent = opp;

    // v2 시네마틱 전투 엔진 사용 시
    if(RoF.FEATURE && RoF.FEATURE.CINEMATIC_BATTLE && RoF.Battle){
      Arena._startV2Battle(enemyDeck, opp);
    } else {
      // 레거시 전투 (60_turnbattle.js)
      Arena._startLegacyBattle(enemyDeck, opp);
    }
  };

  // 상대 덱 스냅샷 → 적군 카드 배열 변환
  Arena._buildEnemyDeck = function(opp){
    const raw = opp.deck_data;
    if(!Array.isArray(raw) || raw.length === 0) return [];

    return raw.map(function(c, i){
      // UNITS DB 에서 원본 스탯 참조 (스냅샷 데이터가 우선)
      const base = (typeof UNITS !== 'undefined')
        ? UNITS.find(function(u){ return u.id === c.id; }) || {}
        : {};

      return {
        id:        'ghost_' + i,
        uid:       'ghost_' + i,
        name:      c.name || base.name || '유령 ' + (i+1),
        element:   c.element || base.element || 'fire',
        rarity:    c.rarity || base.rarity || 'bronze',
        type:      c.type || base.type || '전사',
        imgKey:    c.imgKey || base.imgKey || c.id,
        isHero:    !!c.isHero,
        isCompanion: !c.isHero,
        atk:       c.atk  || base.atk  || 5,
        def:       c.def  || base.def  || 2,
        spd:       c.spd  || base.spd  || 2,
        hp:        c.hp   || base.hp   || 20,
        maxHp:     c.maxHp || c.hp || base.hp || 20,
        currentHp: c.hp   || base.hp   || 20,
        nrg:       c.nrg  || base.nrg  || 5,
        currentNrg:c.nrg  || base.nrg  || 5,
        nrgReg:    c.nrgReg || base.nrgReg || 1,
        luck:      c.luck || base.luck || 1,
        eva:       c.eva  || base.eva  || 0,
        rage:      c.rage || base.rage || 0,
        level:     c.level || 1,
        equips:    c.equips || [],
        shield:    c.shield || 0,
      };
    });
  };

  // v2 전투 연동
  Arena._startV2Battle = function(enemyDeck, opp){
    const G = RoF.Game;
    const Battle = RoF.Battle;

    // 아군 덱 준비 (현재 편성)
    const myDeck = (G.deck || []).filter(function(c){ return c.currentHp > 0 || c.hp > 0; }).slice(0, 5);
    if(myDeck.length === 0){
      UI.toast('출전할 동료가 없습니다!');
      return;
    }

    // v2 DEMO 데이터를 실제 데이터로 교체
    Battle.DEMO.allies = myDeck.map(function(c, i){
      return {
        id: 'ally_' + (i+1),
        unitId: c.id,
        name: c.name,
        imgKey: c.imgKey || c.id,
        element: c.element || 'fire',
        rarity: c.rarity || 'bronze',
        atk: c.atk, def: c.def, spd: c.spd, luck: c.luck || 1,
        nrg: c.nrg || 5, currentNrg: c.nrg || 5, nrgReg: c.nrgReg || 1,
        hp: c.hp, currentHp: c.hp, maxHp: c.maxHp || c.hp,
        isHero: !!c.isHero,
        eva: c.eva || 0, rage: c.rage || 0,
        _legacyRef: c,
      };
    });

    Battle.DEMO.enemies = enemyDeck.slice(0, 5).map(function(c, i){
      return {
        id: 'enemy_' + (i+1),
        unitId: c.id,
        name: c.name,
        imgKey: c.imgKey || c.id,
        element: c.element || 'fire',
        rarity: c.rarity || 'bronze',
        atk: c.atk, def: c.def, spd: c.spd, luck: c.luck || 1,
        nrg: c.nrg || 5, currentNrg: c.nrg || 5, nrgReg: c.nrgReg || 1,
        hp: c.hp, currentHp: c.currentHp || c.hp, maxHp: c.maxHp || c.hp,
        isHero: !!c.isHero,
        eva: c.eva || 0, rage: c.rage || 0,
      };
    });

    // 전투 시작
    if(typeof Battle.open === 'function'){
      Battle.open();
    }
  };

  // 레거시 전투 연동
  Arena._startLegacyBattle = function(enemyDeck, opp){
    const G = RoF.Game;
    // 레거시 전투 시스템의 적군 덱을 교체
    G._ghostEnemyDeck = enemyDeck;
    if(typeof G.startBattle === 'function'){
      G.startBattle();
    }
  };

  // ── 아레나 전투 결과 처리 ──────────────────────────────
  // showBattleEnd 이후 호출. _arenaMode 플래그로 분기.
  Arena.handleResult = async function(won){
    const G = RoF.Game;
    const opp = G._arenaOpponent;
    const B = RoF.Backend || global.Backend;

    if(!opp) return;

    const lpChange = won ? Arena.WIN_LP : -Arena.LOSE_LP;
    const goldReward = won ? Arena.WIN_GOLD : Arena.LOSE_GOLD;

    // LP 반영
    G.leaguePoints = Math.max(0, (G.leaguePoints || 0) + lpChange);
    G.gold = (G.gold || 0) + goldReward;
    G.persist();

    // 서버 기록
    if(B && B.isReady){
      B.recordPvpMatch(
        opp.user_id,
        opp.league_points || 0,
        won ? 'victory' : 'defeat',
        lpChange,
        goldReward,
        G.battleState ? G.battleState.currentRound : 1
      ).catch(function(){});
    }

    // 플래그 정리
    G._arenaMode = false;
    G._arenaOpponent = null;
    G._ghostEnemyDeck = null;

    console.log('[Arena]', won ? '승리' : '패배', 'LP:', lpChange, 'Gold:', goldReward);
  };

  // ── 마을 연동: 콜로세움 건물 액션 ─────────────────────
  // 51_game_town.js 의 BUILDINGS[training].action = 'showTraining'
  // 여기서 오버라이드해서 아레나 진입으로 연결
  const _origShowTraining = RoF.Game && RoF.Game.showTraining;
  if(typeof RoF.Game !== 'undefined'){
    RoF.Game.showArena = function(){
      Arena.enter();
    };
    // showTraining 이 이미 있으면 아레나로 래핑
    if(typeof RoF.Game.showTraining === 'function'){
      const orig = RoF.Game.showTraining.bind(RoF.Game);
      RoF.Game.showTraining = function(){
        // 온라인이면 아레나, 아니면 기존 훈련
        if(Backend && Backend.isReady && Backend.getCurrentUser()){
          Arena.enter();
        } else {
          orig();
        }
      };
    }
  }

})(typeof window !== 'undefined' ? window : globalThis);
