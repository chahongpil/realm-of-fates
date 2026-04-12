// Game Battle UI (전투 UI 헬퍼 + 후처리 + newRun)
// Split from 55_game_battle.js (2026-04-12)

// 상태효과 배지용 커스텀 SVG 아이콘 (고딕 톤 — currentColor로 클래스 색 상속)
const STT_ICON = {
  burn:   '<svg viewBox="0 0 14 14" width="9" height="9" fill="currentColor" aria-hidden="true"><path d="M7 1c.6 1.8 2.6 2.8 2.6 5.7C9.6 9.2 8 11 7 11S4.4 9.2 4.4 6.7C4.4 5 5.3 4 6 3c0 1 .2 1.8.9 1.8.5 0 .6-.8.1-3.8z"/></svg>',
  poison: '<svg viewBox="0 0 14 14" width="9" height="9" fill="currentColor" aria-hidden="true"><path d="M7 1.5 11 7.2A4 4 0 1 1 3 7.2Z"/></svg>',
  frozen: '<svg viewBox="0 0 14 14" width="9" height="9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none" aria-hidden="true"><line x1="7" y1="1.5" x2="7" y2="12.5"/><line x1="2.2" y1="4.2" x2="11.8" y2="9.8"/><line x1="2.2" y1="9.8" x2="11.8" y2="4.2"/></svg>',
  invinc: '<svg viewBox="0 0 14 14" width="9" height="9" fill="currentColor" aria-hidden="true"><path d="M7 1.2 12 3v4.5c0 2.7-2.2 4.6-5 5.3-2.8-.7-5-2.6-5-5.3V3z"/></svg>',
};

RoF.__gameKeys = RoF.__gameKeys || new Set();
(function(keys){
  for (const k of keys) {
    if (RoF.__gameKeys.has(k)) {
      console.error('[Game] 중복 키 감지:', k);
      RoF.__gameKeyError = true;
    }
    RoF.__gameKeys.add(k);
  }
})(["log", "cycleSpeed", "_skillQueue", "_targetMode", "_targetCallback", "_playerTarget", "updateSkillBar", "_manualSkill", "_enterTargetMode", "_executeSkill", "setPlayerTarget", "skipBattle", "triggerSlowMo", "renderBF", "_lootPicked", "afterBattle", "rerollPick", "finishPick", "finishRound", "askFormationForNextRound", "newRun"]);

Object.assign(RoF.Game, {
  log(t,c){const l=document.getElementById('battle-log');const p=document.createElement('p');p.innerHTML=c?`<span class="${c}">${t}</span>`:t;l.appendChild(p);l.scrollTop=l.scrollHeight;},
  cycleSpeed(){
    if(this.battleMultiplier===1){this.battleMultiplier=2;this.battleSpeed=250;}
    else if(this.battleMultiplier===2){this.battleMultiplier=3;this.battleSpeed=120;}
    else{this.battleMultiplier=1;this.battleSpeed=500;}
    const labels={1:'⏱️ 일반',2:'⏩ 신속',3:'⏭️ 질풍'};
    const btn=document.getElementById('speed-btn');
    if(btn)btn.textContent=labels[this.battleMultiplier];
    SFX.play('click');
  },
  // ── MANUAL SKILL / TARGET SYSTEM ──
  _skillQueue:[], // pending manual skill activations
  _targetMode:false, _targetCallback:null, _playerTarget:null,

  updateSkillBar(){
    const bar=document.getElementById('skill-bar');if(!bar||!this.battleState)return;
    bar.innerHTML='';bar.style.display='flex';
    const bs=this.battleState;
    const pCards=bs.pCards.filter(c=>c.currentHp>0&&c.side==='player'&&c.skillType==='active');
    if(!pCards.length){bar.style.display='none';return;}
    pCards.forEach(c=>{
      const ready=c.curNrg>=c.skillNrg;
      const btn=document.createElement('div');btn.className=`skill-btn${ready?'':' sb-auto'}`;
      btn.innerHTML=`${c.icon} ${c.name}<br><span style="font-size:.55rem;">${c.skillDesc||c.skill}</span>${ready?'<div class="sb-timer" style="width:100%;"></div>':''}`;
      if(ready&&!this.skipReq){
        btn.onclick=()=>{
          SFX.play('magic');
          this._manualSkill(c);
        };
      }
      bar.appendChild(btn);
    });
  },

  _manualSkill(unit){
    const bs=this.battleState;
    const sk=unit.skill;
    const foes=bs.eCards.filter(c=>c.currentHp>0);
    const allies=bs.pCards.filter(c=>c.currentHp>0);
    // Determine if skill needs target
    const needsEnemyTarget=['aoe','breath','dark_bolt','freeze'].includes(sk);
    const needsAllyTarget=['heal_ally'].includes(sk);
    const noTarget=['heal_self','mass_heal','inspire','aura_buff'].includes(sk);

    if(noTarget){
      this._executeSkill(unit,null);
    } else if(needsAllyTarget){
      this._enterTargetMode(allies,'아군을 선택하세요!',(target)=>this._executeSkill(unit,target));
    } else {
      this._enterTargetMode(foes,'대상을 선택하세요!',(target)=>this._executeSkill(unit,target));
    }
  },

  _enterTargetMode(targets,msg,callback){
    this._targetMode=true;this._targetCallback=callback;
    document.getElementById('b-status').textContent=msg;
    document.getElementById('b-status').style.color='#ff6644';
    targets.forEach(c=>{
      const el=document.getElementById(`bc-${c.uid}`);
      if(el){el.classList.add('target-select');
        el.onclick=()=>{
          this._targetMode=false;
          document.querySelectorAll('.target-select').forEach(e=>{e.classList.remove('target-select');e.onclick=null;});
          document.getElementById('b-status').textContent='전투 중...';
          document.getElementById('b-status').style.color='';
          callback(c);
        };
      }
    });
  },

  _executeSkill(unit,target){
    const bs=this.battleState;
    const sk=unit.skill,skNrg=unit.skillNrg||0;
    const foes=bs.eCards.filter(c=>c.currentHp>0);
    const allies=bs.pCards.filter(c=>c.currentHp>0);
    if(unit.curNrg<skNrg)return;
    unit.curNrg-=skNrg;
    unit._manualUsed=true; // flag so auto-skill doesn't double fire
    SFX.play('magic');

    if(sk==='aoe'||sk==='breath'){
      const d=sk==='breath'?5:3;foes.forEach(e=>{e.currentHp-=d;this.showDmg(e,d,false);if(e.currentHp<=0)e.currentHp=0;});
      this.log(`${unit.icon} 수동 비전! 전체${d}데미지`,'ability-log');
    } else if(sk==='heal_self'){
      const h=4;unit.currentHp=Math.min(unit.currentHp+h,unit.maxBHp);this.showHeal(unit,h);SFX.play('heal');
      this.log(`${unit.icon} 수동 자가치유+${h}`,'heal-log');
    } else if(sk==='heal_ally'&&target){
      const h=5;target.currentHp=Math.min(target.currentHp+h,target.maxBHp);this.showHeal(target,h);SFX.play('heal');
      this.log(`${unit.icon}→${target.icon} 수동 치유+${h}`,'heal-log');
    } else if(sk==='mass_heal'){
      allies.forEach(a=>{a.currentHp=Math.min(a.currentHp+3,a.maxBHp);});SFX.play('heal');
      this.log(`${unit.icon} 수동 대치유! 아군전체 HP+3`,'heal-log');
    } else if(sk==='inspire'){
      allies.forEach(a=>{if(a.uid!==unit.uid)a.atk+=2;});
      this.log(`${unit.icon} 수동 고무! 아군 공격+2`,'ability-log');
    } else if(sk==='freeze'&&target){
      target.frozen=1;this.log(`${target.icon} 수동 빙결!`,'ability-log');
    } else if(sk==='dark_bolt'){
      const t=target||foes[0];if(t){t.currentHp-=8;this.showDmg(t,8,false);this.log(`${unit.icon} 수동 암흑탄! ${t.icon}-8`,'ability-log');}
    } else if(sk==='aura_buff'){
      allies.forEach(a=>{a.atk+=1;a.def=(a.def||0)+1;});
      this.log(`${unit.icon} 수동 오라! 아군 공격+1 방어+1`,'ability-log');
    }
    this.renderBF(bs.pCards,bs.eCards);
    this.updateSkillBar();
  },

  // Set player target for normal attacks
  setPlayerTarget(targetUid){
    this._playerTarget=targetUid;
    // Visual
    document.querySelectorAll('.battle-card.targeted').forEach(e=>e.classList.remove('targeted'));
    const el=document.getElementById(`bc-${targetUid}`);
    if(el)el.classList.add('targeted');
  },

  skipBattle(){this.skipReq=true;this.battleSpeed=5;document.getElementById('skill-bar').style.display='none';},
  async triggerSlowMo(duration=1500,type='crit'){
    if(this.skipReq||this._slowMo)return;
    this._slowMo=true;
    const spd=this.battleMultiplier||1;
    const oldSpd=this.battleSpeed;this.battleSpeed=Math.floor(800/spd);
    duration=Math.floor(duration/spd);
    // Visual overlay
    const ov=document.createElement('div');ov.className='slowmo-overlay';ov.id='slowmo-ov';
    if(type==='crit')ov.style.background='radial-gradient(circle,rgba(255,100,50,.15),transparent 70%)';
    else if(type==='danger')ov.style.background='radial-gradient(circle,rgba(255,0,0,.2),transparent 70%)';
    else if(type==='kill')ov.style.background='radial-gradient(circle,rgba(255,215,0,.15),transparent 70%)';
    else if(type==='death')ov.style.background='rgba(0,0,0,.4)';
    else if(type==='revive')ov.style.background='radial-gradient(circle,rgba(255,215,0,.25),transparent 70%)';
    document.body.appendChild(ov);
    await wait(duration);
    ov.remove();this.battleSpeed=oldSpd;this._slowMo=false;
  },

  renderBF(pCards,eCards){
    const mkBc=(c)=>{
      const d=document.createElement('div');d.className=`battle-card ${c.rarity||'bronze'} ${c.currentHp<=0?'dead':''} ${c.isHero?'hero-card':''}`;d.id=`bc-${c.uid}`;
      const hp=Math.max(0,(c.currentHp/c.maxBHp)*100);const hpC=hp>50?'#44cc66':hp>25?'#ccaa44':'#cc4444';
      const eqHtml=(c.equips||[]).map(e=>`<span>${e.icon}</span>`).join('');
      const traits=getTraits(c);
      const traitHtml=traits.map(tid=>{const tr=TRAITS[tid];return tr?`<span style="color:${tr.color};" title="${tr.desc}">${tr.icon}</span>`:''}).join('');
      const imgSrc=getCardImg(c);
      // 상태효과 배지 (지속 턴 숫자 표시) — StS2 관찰 노트 반영 2026-04-12
      const stts=[];
      if(c.burn>0)        stts.push({cls:'burn',   icon:STT_ICON.burn,  n:c.burn});
      if(c.poisoned>0)    stts.push({cls:'poison', icon:STT_ICON.poison,n:c.poisoned});
      if(c.frozen>0)      stts.push({cls:'frozen', icon:STT_ICON.frozen,n:c.frozen});
      if(c.invincible>0)  stts.push({cls:'invinc', icon:STT_ICON.invinc,n:c.invincible});
      const sttHtml=stts.length
        ? `<div class="bc-stts">${stts.map(s=>`<span class="bc-stt ${s.cls}" title="${s.cls} ${s.n}턴"><span class="bc-stt-ic">${s.icon}</span><span class="bc-stt-n">${s.n}</span></span>`).join('')}</div>`
        : '';
      d.innerHTML=`
        <div class="bc-left"><div class="bc-icon">${imgSrc?`<img src="${imgSrc}">`:c.icon}</div></div>
        <div class="bc-right">
          <div class="bc-name">${c.isHero?'⭐':''}${c.name} <span style="color:var(--curr-gold);font-size:.45rem;">Lv${c.level||1}</span></div>
          <div class="bc-stats"><span class="st-atk">⚔${c.atk}</span><span class="st-hp">♥${Math.max(0,Math.ceil(c.currentHp))}</span><span class="st-nrg">⚡${Math.floor(c.curNrg||0)}</span>${traitHtml?` ${traitHtml}`:''}</div>
          <div class="bc-bars"><div class="bc-bar"><div class="bc-bar-fill" style="width:${hp}%;background:${hpC}"></div></div>
          <div class="bc-bar"><div class="bc-bar-fill" style="width:${Math.min(100,((c.curNrg||0)/(c.skillNrg||10))*100)}%;background:var(--stat-nrg)"></div></div></div>
        </div>${eqHtml?`<div class="bc-equips" style="position:absolute;top:1px;right:2px;">${eqHtml}</div>`:''}${sttHtml}`;
      return d;};
    const renderSide=(cards,id)=>{
      const ct=document.getElementById(id);ct.innerHTML='';
      // 2026-04-13: 행당 5슬롯 허용 (이전 3) — 1 hero + 4 companions = 5 총 슬롯 지원
      const front=cards.filter(c=>c.row==='front').slice(0,5);
      const back=cards.filter(c=>c.row==='back').slice(0,5);
      const isEnemy=id==='enemy-side';
      // Enemy: back(뒷열) on top, front(앞열) bottom. Player: front(앞열) top, back(뒷열) bottom.
      const topRow=isEnemy?back:front;const botRow=isEnemy?front:back;
      const topLabel=isEnemy?'뒷열':'앞열';const botLabel=isEnemy?'앞열':'뒷열';
      if(topRow.length){
        const r=document.createElement('div');r.className='battle-row';
        topRow.forEach(c=>r.appendChild(mkBc(c)));ct.appendChild(r);
      }
      if(botRow.length){
        const r=document.createElement('div');r.className='battle-row';
        botRow.forEach(c=>{const bc=mkBc(c);bc.style.transform='scale(.88)';r.appendChild(bc);});ct.appendChild(r);
      }
    };
    renderSide(eCards,'enemy-side');renderSide(pCards,'player-side');
    // Make enemy cards clickable for targeting
    eCards.filter(c=>c.currentHp>0).forEach(c=>{
      const el=document.getElementById(`bc-${c.uid}`);
      if(el&&!this._targetMode){
        el.style.cursor='pointer';
        el.onclick=()=>{this.setPlayerTarget(c.uid);SFX.play('click');};
      }
    });
    // Update skill bar
    this.updateSkillBar();
  },

  // ---- RESULT ----
  _lootPicked:false,
  afterBattle(){
    if(!this._lootPicked){
      UI.modal('⚠️ 전리품 미회수','전리품을 선택하지 않고 떠나시겠습니까?\n선택하지 않은 보상은 사라집니다.',()=>{this._lootPicked=false;this.showMenu();});
      return;
    }
    this._lootPicked=false;this.showMenu();
  },

  rerollPick(){
    if(!this._currentPickAction)return;
    if(this.gold<2){document.getElementById('pick-sub').textContent='⚠️ 골드 부족! (2💰 필요)';return;}
    this.gold-=2;this.persist();SFX.play('click');
    this.doRoundChoice(this._currentPickAction);
  },

  finishPick(){
    this.persist();
    if(this.battleState){
      const bs=this.battleState;
      bs._apRemaining=Math.max(0,(bs._apRemaining||1)-1);
      if(bs._apRemaining>0){
        this.showRoundChoice();
        return;
      }
      this._stopRoundTimer();
      this._revealAndFinish();
    } else {
      this.showMenu();
    }
  },
  finishRound(){
    this._stopRoundTimer();
    this.persist();
    if(this.battleState){
      try{this.askFormationForNextRound();}catch(e){console.error('finishRound error:',e);this.showMenu();}
    } else {
      this.showMenu();
    }
  },

  askFormationForNextRound(){
    if(!this.battleState){this.showMenu();return;}
    // Close any existing modal first
    UI.closeModal();
    setTimeout(()=>{
      const ov=document.getElementById('modal-overlay');
      const rd=this.battleState.currentRound+1;
      document.getElementById('modal-title').textContent=`라운드 ${rd} 준비`;
      document.getElementById('modal-msg').textContent=`배치를 변경하시겠습니까? (다음: ${rd}번 공격)`;
      const mb=document.querySelector('#modal-overlay .modal-buttons');
      mb.innerHTML='';
      const b1=document.createElement('button');b1.className='btn btn-s btn-green';b1.textContent='배치 변경';
      b1.onclick=()=>{ov.classList.remove('active');Formation.showForBattle(this.battleState.pCards);};
      const b2=document.createElement('button');b2.className='btn btn-s';b2.textContent='그대로 진군!';
      b2.onclick=()=>{ov.classList.remove('active');this.launchBattle();};
      mb.appendChild(b1);mb.appendChild(b2);
      ov.classList.add('active');
    },100);
  },

  // ---- GAMEOVER ----
  newRun(){
    const u=UNITS.find(x=>x.id===this.heroBaseId)||UNITS[0];
    const hero={...u,uid:uid(),name:Auth.user,heroClass:u.name,isHero:true,rarity:'bronze',level:1,equips:[],maxHp:u.hp,xp:0,honor:0,freePoints:0,growthPts:{atk:0,hp:0,def:0,spd:0,nrg:0,luck:0,eva:0}};
    this.round=0;this.hp=3;this.maxHp=3;this.gold=2;
    this.deck=[hero];this.relics=[];this.ownedRelics=[];this.ownedSkills=[];this.totalGames++;this.persist();this.showMenu();
  },
});
