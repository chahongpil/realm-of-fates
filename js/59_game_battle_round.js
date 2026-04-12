// Game Battle Round (라운드 선택지 + 타이머)
// Split from 55_game_battle.js (2026-04-12)

RoF.__gameKeys = RoF.__gameKeys || new Set();
(function(keys){
  for (const k of keys) {
    if (RoF.__gameKeys.has(k)) {
      console.error('[Game] 중복 키 감지:', k);
      RoF.__gameKeyError = true;
    }
    RoF.__gameKeys.add(k);
  }
})(["_roundTimer", "_roundTimerLeft", "showRoundChoice", "_startRoundTimer", "_stopRoundTimer", "_revealAndFinish", "doRoundChoice"]);

Object.assign(RoF.Game, {
  _roundTimer:null,_roundTimerLeft:0,

  showRoundChoice(){
    UI.show('choice-screen');
    this.checkTutorial('first_survive');
    const bs=this.battleState;
    const rd=bs.currentRound;
    // Initialize AP for this round (only on first call per round)
    if(!bs._apInitedRound||bs._apInitedRound!==rd){
      bs._apInitedRound=rd;
      bs._apRemaining=this.getActionPoints();
      bs._enemyActioned=false;
      bs._enemyMsgsHidden=null;
      // Decrease potion cooldown
      if(bs._potionCooldown>0)bs._potionCooldown--;
      if(bs._ePotionCd>0)bs._ePotionCd--;
      // Enemy AI: compute but don't reveal yet
      bs._enemyMsgsHidden=this.enemyRoundActions(bs);
      // Start round timer (15sec per AP, min 20, max 60)
      this._roundTimerLeft=Math.min(60,Math.max(20,this.getActionPoints()*15));
      this._startRoundTimer();
    }
    const apLeft=bs._apRemaining;
    const maxAp=this.getActionPoints();
    document.getElementById('ch-title').textContent=`라운드 ${rd} 생존!`;
    const apBar='🟡'.repeat(apLeft)+'⚫'.repeat(maxAp-apLeft);
    const botName=this._currentBot?this._currentBot.name:'적';
    document.getElementById('ch-sub').innerHTML=`다음은 라운드 ${rd+1} (${rd+1}번 공격)<br>
      <span style="color:#ffd700;font-size:.95rem;">행동력 ${apBar} ${apLeft}/${maxAp}</span><br>
      <div class="timer-bar"><div class="timer-bar-fill" id="round-timer-bar" style="width:100%;"></div></div>
      <div class="timer-text">⏱️ <span id="round-timer-text">${this._roundTimerLeft}</span>초 | ${botName}도 선택 중...</div>`;
    const opts=document.getElementById('ch-options');opts.innerHTML='';
    [{icon:'🗡️',title:'유닛 소환/강화',desc:bs.pCards.length>=5?'유닛 강화 (스탯 업)':'새 유닛 소환',action:'add_card'},
     {icon:'⚡',title:'스펠 습득/강화',desc:'스펠 습득 & 장착 (강화 +50%)',action:'pick_skill'},
     {icon:'🏺',title:'유물 획득/강화',desc:((this.ownedRelics||[]).length>=5)?'유물 강화':'새 유물 획득',action:'pick_relic'},
     {icon:'💤',title:'휴식',desc:'전체 유닛 HP 50% 회복',action:'potion'},
     {icon:'⏭️',title:'턴 종료',desc:'다음 라운드로 진행',action:'end_turn'}].forEach(o=>{
      const d=document.createElement('div');d.className='choice-box';
      const potionCd=bs._potionCooldown||0;
      if(o.action==='potion'&&potionCd>0){
        d.style.opacity='.3';d.style.pointerEvents='none';
        d.innerHTML=`<div class="cb-icon">${o.icon}</div><div class="cb-title">${o.title}</div><div class="cb-desc" style="color:#ff4444;">쿨다운 ${potionCd}라운드</div>`;
      } else if(o.action==='end_turn'){
        d.innerHTML=`<div class="cb-icon">${o.icon}</div><div class="cb-title">${o.title}</div><div class="cb-desc">${o.desc}</div>`;
        d.onclick=()=>{SFX.play('click');this._stopRoundTimer();bs._apRemaining=0;this._revealAndFinish();};
      } else {
        d.innerHTML=`<div class="cb-icon">${o.icon}</div><div class="cb-title">${o.title}</div><div class="cb-desc">${o.desc}</div>`;
        d.onclick=()=>{SFX.play('click');this.doRoundChoice(o.action);};
      }
      opts.appendChild(d);});
  },

  _startRoundTimer(){
    this._stopRoundTimer();
    const maxTime=this._roundTimerLeft;
    this._roundTimer=setInterval(()=>{
      this._roundTimerLeft--;
      const el=document.getElementById('round-timer-text');
      const bar=document.getElementById('round-timer-bar');
      if(el)el.textContent=this._roundTimerLeft;
      if(bar)bar.style.width=Math.max(0,(this._roundTimerLeft/maxTime)*100)+'%';
      if(this._roundTimerLeft<=5&&el)el.style.color='#ff4444';
      if(this._roundTimerLeft<=0){
        this._stopRoundTimer();
        // Time's up — auto skip remaining AP
        const bs=this.battleState;if(bs)bs._apRemaining=0;
        SFX.play('click');
        this._revealAndFinish();
      }
    },1000);
  },

  _stopRoundTimer(){if(this._roundTimer){clearInterval(this._roundTimer);this._roundTimer=null;}},

  _revealAndFinish(){
    this._stopRoundTimer();
    const bs=this.battleState;if(!bs){this.showMenu();return;}
    const msgs=bs._enemyMsgsHidden||[];
    bs._enemyMsgs=msgs;bs._enemyMsgsHidden=null;
    if(msgs.length){
      const botName=this._currentBot?this._currentBot.name:'적';
      UI.modal(`⚔️ ${botName}의 행동`,msgs.map((m,i)=>`${i+1}. ${m}`).join('\n'),()=>{
        this.finishRound();
      });
    } else {
      this.finishRound();
    }
  },

  doRoundChoice(action){
    const bs=this.battleState;

    // === POTION: instant use, no pick screen ===
    if(action==='potion'){
      // 휴식: 전체 유닛 HP 50% 회복
      bs.pCards.filter(c=>c.currentHp>0).forEach(c=>{
        const heal=Math.floor(c.maxBHp*.5);
        c.currentHp=Math.min(c.currentHp+heal,c.maxBHp);
      });
      bs._potionCooldown=2;
      SFX.play('heal');
      bs._apRemaining=Math.max(0,(bs._apRemaining||1)-1);
      if(bs._apRemaining>0){this.showRoundChoice();return;}
      this._stopRoundTimer();this._revealAndFinish();
      return;
    }

    UI.show('pick-screen');
    const title=document.getElementById('pick-title'),sub=document.getElementById('pick-sub'),grid=document.getElementById('pick-grid');
    grid.innerHTML='';document.getElementById('pick-confirm-btn').disabled=true;
    let picked=false;
    this._currentPickAction=action;
    const onPick=()=>{document.getElementById('pick-confirm-btn').disabled=false;};

    // Check if duplicate exists in battle cards
    const checkDupUnit=(c)=>bs.pCards.find(x=>x.id===c.id&&x.uid!==c.uid&&x.currentHp>0);
    const checkDupRelic=(rl)=>bs.battleRelics.find(x=>x.id===rl.id);

    if(action==='add_card'){
      title.textContent='🃏 동료 선택 (이번 전투)';sub.textContent='중복 시 합성하여 등급 상승!';
      for(let i=0;i<3;i++){
        const r=pickRar(bs.currentRound*.5,'battle');let pool=UNITS.filter(u=>u.rarity===r&&!u.id.startsWith('h_'));if(!pool.length)pool=UNITS.filter(u=>!u.id.startsWith('h_'));
        const b=pool[Math.floor(Math.random()*pool.length)];const scale=1+(bs.currentRound-1)*.05;
        const c={...b,uid:uid(),level:1,equips:[],atk:Math.round(b.atk*scale),hp:Math.round(b.hp*scale),maxHp:Math.round(b.hp*scale),def:Math.round(b.def*scale)};
        const dup=checkDupUnit(c);
        const el=mkCardEl(c);
        if(dup){const tag=document.createElement('div');tag.style.cssText='text-align:center;font-size:.7rem;color:#ff66ff;margin-top:2px;';tag.textContent=`🔀 합성 가능! → ${R_LABEL[upgradeRarity(dup.rarity)]}`;el.appendChild(tag);}
        let addedUnit=null;
        el.onclick=()=>{
          if(picked&&addedUnit){
            // DESELECT: 해제
            bs.pCards=bs.pCards.filter(p=>p.uid!==addedUnit.uid);
            addedUnit=null;picked=false;SFX.play('click');
            el.style.opacity='1';el.style.border='';
            grid.querySelectorAll('.card').forEach(x=>{x.style.pointerEvents='';x.style.opacity='1';});
            sub.textContent='동료를 다시 선택하세요.';
            document.getElementById('pick-confirm-btn').disabled=true;
            return;
          }
          if(picked)return;
          if(dup){
            UI.modal('합성 확인',`${dup.icon}${dup.name}(${R_LABEL[dup.rarity]})과 합성하여\n${R_LABEL[upgradeRarity(dup.rarity)]}로 강화하시겠습니까?\n(기존 동료의 힘을 흡수합니다)`,()=>{
              fuseCard(dup);dup.currentHp=dup.maxBHp=dup.hp;
              picked=true;SFX.play('magic');
              grid.querySelectorAll('.card').forEach(x=>{x.style.pointerEvents='none';x.style.opacity='.4';});
              sub.textContent=`🔀 합성! ${dup.name} → ${R_LABEL[dup.rarity]}!`;onPick();
            });
          } else {
            // SELECT: 선택
            picked=true;
            addedUnit={...c,currentHp:c.hp,maxBHp:c.maxHp,side:'player',row:'back',frozen:0,poisoned:0,revived:false,invincible:0,curNrg:0,curShield:c.shield||0,burn:0};
            bs.pCards.push(addedUnit);
            SFX.play('click');
            grid.querySelectorAll('.card').forEach(x=>{if(x!==el){x.style.pointerEvents='none';x.style.opacity='.4';}});
            el.style.opacity='.6';el.style.border='2px solid #44ff88';
            sub.textContent=`✅ ${c.name} 합류! (다시 클릭하면 취소)`;onPick();
          }
        };
        grid.appendChild(el);
      }
    } else if(action==='pick_skill'){
      title.textContent='⚡ 비전 선택 (이번 전투)';sub.textContent='동료에게 전수! 중복 시 합성 강화';
      for(let i=0;i<3;i++){
        const r=pickRar(bs.currentRound*.4);let pool=SKILLS_DB.filter(s=>s.rarity===r);if(!pool.length)pool=SKILLS_DB;
        const sk={...pool[Math.floor(Math.random()*pool.length)],uid:uid()};
        const el=mkRelicEl(sk);el.querySelector('.card-type').textContent='비전 · '+ROLE_L[sk.role];
        // Check if any battle unit already has same skill equipped
        const dupUnit=bs.pCards.find(u=>u.currentHp>0&&(u.equips||[]).some(e=>e.id===sk.id));
        if(dupUnit){const tag=document.createElement('div');tag.style.cssText='text-align:center;font-size:.7rem;color:#ff66ff;margin-top:2px;';tag.textContent=`🔀 ${dupUnit.name}에 합성 가능!`;el.appendChild(tag);}
        el.onclick=()=>{
          if(picked)return;
          if(dupUnit){
            UI.modal('비전 합성',`${dupUnit.icon}${dupUnit.name}의 ${sk.icon}${sk.name}을 합성 강화하시겠습니까?\n(능력치 2배 강화)`,()=>{
              picked=true;applySkillToUnit(sk,dupUnit);SFX.play('magic');
              grid.querySelectorAll('.card').forEach(x=>{x.style.pointerEvents='none';x.style.opacity='.4';});
              sub.textContent=`🔀 ${dupUnit.name}의 ${sk.name} 합성 강화!`;onPick();
            });
          } else {
            // Show equip target selection
            picked=true;
            grid.querySelectorAll('.card').forEach(x=>{x.style.pointerEvents='none';if(x!==el)x.style.opacity='.4';});
            el.style.opacity='.6';
            this.equipSkillBattle(sk,bs,()=>{sub.textContent=`⚡ ${sk.name} 장착 완료!`;onPick();});
          }
        };
        grid.appendChild(el);
      }
    } else if(action==='pick_relic'){
      title.textContent='🏺 유물 선택 (이번 전투)';sub.textContent='전체 적용! 중복 시 합성 강화';
      for(let i=0;i<3;i++){
        const r=pickRar(bs.currentRound*.4);let pool=RELICS_DB.filter(x=>x.rarity===r);if(!pool.length)pool=RELICS_DB;
        const rl={...pool[Math.floor(Math.random()*pool.length)],uid:uid()};
        const dup=checkDupRelic(rl);
        const el=mkRelicEl(rl);
        if(dup){const tag=document.createElement('div');tag.style.cssText='text-align:center;font-size:.7rem;color:#ff66ff;margin-top:2px;';tag.textContent=`🔀 합성 가능! → ${R_LABEL[upgradeRarity(dup.rarity||rl.rarity)]}`;el.appendChild(tag);}
        el.onclick=()=>{
          if(picked)return;
          const flashRelic=(rar)=>{
            el.classList.add('relic-burst',rar);
            setTimeout(()=>{el.classList.remove('relic-burst');el.classList.add('relic-idle',rar);},900);
            setTimeout(()=>{el.classList.remove('relic-idle',rar);},3000);
          };
          if(dup){
            UI.modal('유물 합성',`${rl.icon}${rl.name} 유물을 합성하여 효과를 2배로 강화하시겠습니까?`,()=>{
              picked=true;applyRelicBattle(rl,bs.pCards);SFX.play('magic'); // apply again = double
              flashRelic(dup.rarity||rl.rarity);
              grid.querySelectorAll('.card').forEach(x=>{if(x!==el){x.style.pointerEvents='none';x.style.opacity='.4';}});
              sub.textContent=`🔀 ${rl.name} 합성 강화!`;onPick();
            });
          } else {
            picked=true;
            bs.battleRelics.push(rl);applyRelicBattle(rl,bs.pCards);SFX.play('magic');
            flashRelic(rl.rarity);
            grid.querySelectorAll('.card').forEach(x=>{if(x!==el){x.style.pointerEvents='none';x.style.opacity='.4';}});
            sub.textContent=`✅ ${rl.name} 장착!`;onPick();
          }
        };
        grid.appendChild(el);
      }
    }
  },

  // After battle ends — ROGUELIKE RESET: all temp cards/upgrades/relics gone
});
