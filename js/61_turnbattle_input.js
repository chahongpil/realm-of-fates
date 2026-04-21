// TurnBattle Input/Render — extracted from 60_turnbattle.js (2026-04-12)
Object.assign(RoF.TurnBattle, {
  bindKeys(){
    if(this._keyHandler)document.removeEventListener('keydown',this._keyHandler);
    this._keyHandler=(e)=>{
      const key=e.key.toLowerCase();
      if(this.phase==='select'){
        const alive=this.bs.pCards.filter(c=>c.currentHp>0);
        const max=Math.min(alive.length,5);
        // A/D or Left/Right moves highlight
        if(key==='a'||key==='arrowleft'){this._moveHighlight(Math.max(0,(this._highlightIdx<0?0:this._highlightIdx)-1));}
        if(key==='d'||key==='arrowright'){this._moveHighlight(Math.min(max-1,(this._highlightIdx<0?0:this._highlightIdx)+1));}
        // Number keys 1-5 direct select
        if(key>='1'&&key<='5'){const idx=parseInt(key)-1;if(idx<max)this._moveHighlight(idx);}
        // Enter/Space confirms
        if((key==='enter'||key===' ')&&this._highlightIdx>=0)this._confirmHighlight();
        if((key==='enter'||key===' ')&&this._highlightIdx<0)this.startCombat();
      } else if(this.phase==='action'){
        if(key>='1'&&key<='5'){
          const idx=parseInt(key)-1;
          if(this._currentActions&&this._currentActions[idx]&&!this._currentActions[idx].disabled){
            if(this._activeCardIdx===idx){
              // Already highlighted → use it
              this._useActiveCard();
            } else {
              this._activeCardIdx=idx;SFX.play('click');
              this._highlightHandCard(idx);
            }
          }
        }
        if(key==='enter'||key===' '){
          if(this._activeCardIdx>=0)this._useActiveCard();
        }
        if(key==='escape'||key==='backspace')this.goBack();
      } else if(this.phase==='target_enemy'){
        const allEnemies=this.bs.eCards;
        const maxE=Math.min(allEnemies.length,5);
        if(key==='a'||key==='arrowleft'){this._enemyHighlight=Math.max(0,this._enemyHighlight-1);this._refreshTargetView();}
        if(key==='d'||key==='arrowright'){this._enemyHighlight=Math.min(maxE-1,this._enemyHighlight+1);this._refreshTargetView();}
        if(key>='1'&&key<='5'){const idx=parseInt(key)-1;if(idx<maxE){this._enemyHighlight=idx;this._refreshTargetView();}}
        if((key==='enter'||key===' ')&&this._enemyHighlight>=0){
          const c=allEnemies[this._enemyHighlight];
          if(c&&c.currentHp>0&&this._canTarget(null,this._enemyHighlight,'enemy'))this._selectTarget(c);
        }
        if(key==='escape')this.goBack();
      } else if(this.phase==='target_ally'){
        const alive=this.bs.pCards.filter(c=>c.currentHp>0);
        const maxA=Math.min(alive.length,5);
        if(key==='a'||key==='arrowleft')this._moveHighlight(Math.max(0,(this._highlightIdx<0?0:this._highlightIdx)-1));
        if(key==='d'||key==='arrowright')this._moveHighlight(Math.min(maxA-1,(this._highlightIdx<0?0:this._highlightIdx)+1));
        if(key>='1'&&key<='5'){const idx=parseInt(key)-1;if(idx<maxA)this._moveHighlight(idx);}
        if((key==='enter'||key===' ')&&this._highlightIdx>=0&&alive[this._highlightIdx])this._selectAllyTarget(alive[this._highlightIdx]);
        if(key==='escape')this.goBack();
      }
    };
    document.addEventListener('keydown',this._keyHandler);
  },

  _renderEnemyHighlight(){
    SFX.play('click');
    const container=document.getElementById('tb-enemy-diamond');if(!container)return;
    container.querySelectorAll('.td-slot').forEach((el,i)=>{
      if(i===this._enemyHighlight){
        el.style.filter='drop-shadow(0 0 15px rgba(255,68,68,.8))';
        el.style.transform='scale(1.12)';
      } else {
        el.style.filter='';el.style.transform='';
      }
    });
  },

  _refreshTargetView(){
    SFX.play('click');
    const row=document.getElementById('target-enemy-row');if(!row)return;
    row.querySelectorAll('.td-slot').forEach((el,i)=>{
      if(i===this._enemyHighlight){
        el.classList.add('td-target-hl');
        el.style.transform='scale(1.08)';
      } else {
        el.classList.remove('td-target-hl');
        el.style.transform='';
      }
    });
  },

  _resetEnemySlots(){document.getElementById('b-status').style.color='';},

  unbindKeys(){
    if(this._keyHandler){document.removeEventListener('keydown',this._keyHandler);this._keyHandler=null;}
  },

  // Execute combat!
  async startCombat(){
    if(this.turnTimer)clearInterval(this.turnTimer);
    this.unbindKeys();
    this.phase='combat';
    document.getElementById('b-status').textContent='⚔️ 전투 진행 중...';
    document.getElementById('b-status').style.color='#ff6644';
    document.getElementById('btn-fight').disabled=true;
    document.getElementById('btn-back').style.display='none';
    document.getElementById('tb-actions').style.display='none';

    const bs=this.bs;
    const pAlive=bs.pCards.filter(c=>c.currentHp>0);
    const eAlive=bs.eCards.filter(c=>c.currentHp>0);

    // Energy regen at turn start
    [...pAlive,...eAlive].forEach(c=>{c.curNrg=(c.curNrg||0)+(c.nrgReg||0);if(c.hpReg>0)c.currentHp=Math.min(c.currentHp+c.hpReg,c.maxBHp);});
    // Fill missing orders with default attack
    pAlive.forEach(c=>{
      if(!this.orders.find(o=>o.uid===c.uid)){
        const target=eAlive[0];
        this.orders.push({uid:c.uid,action:'attack',targetUid:target?target.uid:null});
      }
    });

    // Enemy AI orders (respects taunt)
    const eOrders=[];
    eAlive.forEach(c=>{
      // Taunt: must target taunters first
      const taunters=pAlive.filter(p=>p.skill==='taunt'&&p.currentHp>0);
      const validTargets=taunters.length?taunters:pAlive;
      const target=validTargets[Math.floor(Math.random()*validTargets.length)];
      const roll=Math.random();
      if(roll<0.1){eOrders.push({uid:c.uid,action:'defend',targetUid:null});}
      else if(roll<0.3&&c.skill&&c.skillType==='active'&&(c.curNrg||0)>=c.skillNrg){
        eOrders.push({uid:c.uid,action:'skill',targetUid:target?target.uid:null});
      } else {
        eOrders.push({uid:c.uid,action:'attack',targetUid:target?target.uid:null});
      }
    });

    // Combine and sort by speed
    const allOrders=[
      ...this.orders.map(o=>({...o,side:'player',unit:pAlive.find(c=>c.uid===o.uid)})),
      ...eOrders.map(o=>({...o,side:'enemy',unit:eAlive.find(c=>c.uid===o.uid)})),
    ].filter(o=>o.unit&&o.unit.currentHp>0).sort((a,b)=>(b.unit.spd||0)-(a.unit.spd||0));

    // Execute each order with animation
    for(const order of allOrders){
      const u=order.unit;
      if(u.currentHp<=0)continue;
      const foes=order.side==='player'?bs.eCards:bs.pCards;
      const allies=order.side==='player'?bs.pCards:bs.eCards;

      // Show action
      document.getElementById('tb-diamond').style.display='';
      document.getElementById('tb-actions').style.display='none';

      if(order.action==='defend'){
        u._defending=true;
        await this._showCombatAction(u,'🛡️ 방어!',null);
        Game.log(`${u.icon}${u.name} 방어 태세!`,'ability-log');
      } else if(order.action==='attack'){
        let target=foes.find(c=>c.uid===order.targetUid&&c.currentHp>0);
        // Taunt override: if taunters exist, must target them
        const taunters=foes.filter(c=>c.currentHp>0&&c.skill==='taunt');
        if(taunters.length&&target&&target.skill!=='taunt')target=taunters[0];
        if(!target)target=taunters[0]||foes.find(c=>c.currentHp>0);
        if(!target)continue;
        await this._showCombatAction(u,'⚔️ 공격!',target);
        // Damage calc (2026-04-21: RAGE 제거. ATK-DEF, 크리×2, EVA캡80%, 보호막)
        let rawAtk=u.atk;
        // 보호막 먼저 흡수 (DEF 무관)
        let shieldAbsorb=0;
        if(target.shield>0){shieldAbsorb=Math.min(target.shield,rawAtk);target.shield-=shieldAbsorb;}
        const remaining=rawAtk-shieldAbsorb;
        let dmg=Math.max(0,remaining-(target.def||0));
        if(target._defending){dmg=Math.floor(dmg*.5);target._defending=false;}
        // 회피 (EVA×10%, 캡 80%, 물리만)
        const evaChance=Math.min((target.eva||0)*10,80);
        const isEvade=Math.random()*100<evaChance;
        if(isEvade){dmg=0;}
        // 크리티컬 (LUCK×10%, ×2배)
        const isCrit=!isEvade&&Math.random()*100<(u.luck||0)*10;
        if(isCrit)dmg=Math.floor(dmg*2);
        // 원소 상성
        const elemAdv={fire:'earth',water:'fire',lightning:'water',earth:'lightning',dark:'holy',holy:'dark'};
        if(elemAdv[u.element]===target.element)dmg=Math.floor(dmg*1.5);
        else if(elemAdv[target.element]===u.element)dmg=Math.floor(dmg*0.75);
        // 적용
        target.currentHp-=dmg;
        // 흡혈 체크 (실제 HP 데미지만)
        if(u.skill==='life_steal'&&dmg>0&&Math.random()<(u.skillChance||0.5)){
          const heal=dmg;u.currentHp=Math.min(u.maxBHp||u.currentHp,u.currentHp+heal);
          Game.log(`💜 ${u.icon} 흡혈+${heal}`,'heal-log');
        }
        if(isEvade){Game.showDmg(target,0,false,'MISS');SFX.play('hit');Game.log(`💨 ${target.icon}${target.name} 회피!`,'atk-log');}
        else{Game.showDmg(target,dmg,isCrit);SFX.play(isCrit?'crit':'hit');
        if(isCrit)Game.triggerSlowMo(800,'crit');
        let logMsg=`${u.icon}${u.name}→${target.icon}${target.name} ${dmg}`;
        if(isCrit)logMsg+=' 💥크리!';if(shieldAbsorb>0)logMsg+=` (🛡${shieldAbsorb}흡수)`;
        Game.log(logMsg,'atk-log');}
        if(target.currentHp<=0){target.currentHp=0;SFX.play('death');Game.log(`💀 ${target.icon}${target.name} 전사!`,'atk-log');}
        // 턴 종료 시 NRG 회복 + HP 회복 (기획: 매턴 종료 후 자동회복)
        u.curNrg=Math.min(200,(u.curNrg||0)+(u.nrgReg||0));
        u.currentHp=Math.min(u.maxBHp||u.currentHp,u.currentHp+(u.hpReg||0));
      } else if(order.action==='skill'){
        // Active skill execution (simplified)
        const sk=u.skill,skNrg=u.skillNrg||0;
        if((u.curNrg||0)<skNrg)continue;
        u.curNrg-=skNrg;
        let target=foes.find(c=>c.uid===order.targetUid&&c.currentHp>0)||foes.find(c=>c.currentHp>0);
        await this._showCombatAction(u,`🔮 ${u.skillDesc?u.skillDesc.split(']')[0].replace('[',''):'비전'}!`,target);
        SFX.play('magic');
        if(['aoe','breath'].includes(sk)){
          const d=sk==='breath'?5:3;foes.filter(c=>c.currentHp>0).forEach(e=>{e.currentHp-=d;Game.showDmg(e,d,false);if(e.currentHp<=0)e.currentHp=0;});
          Game.log(`${u.icon} 전체 ${d} 데미지!`,'ability-log');
        } else if(['heal_ally','heal_self'].includes(sk)){
          const t=sk==='heal_self'?u:(allies.filter(c=>c.currentHp>0&&c.currentHp<c.maxBHp).sort((a,b)=>a.currentHp-b.currentHp)[0]||u);
          const h=5;t.currentHp=Math.min(t.currentHp+h,t.maxBHp);Game.showHeal(t,h);SFX.play('heal');
          Game.log(`${u.icon}→${t.icon} 치유+${h}`,'heal-log');
        } else if(sk==='mass_heal'){
          allies.filter(c=>c.currentHp>0).forEach(a=>{a.currentHp=Math.min(a.currentHp+3,a.maxBHp);});SFX.play('heal');
          Game.log(`${u.icon} 대치유! 아군전체 HP+3`,'heal-log');
        } else if(sk==='freeze'&&target){
          target.frozen=1;Game.log(`${target.icon} 빙결!`,'ability-log');
        } else if(sk==='inspire'){
          allies.filter(c=>c.currentHp>0).forEach(a=>{a.atk+=2;});
          Game.log(`${u.icon} 고무! 아군 공격+2`,'ability-log');
        } else if(target){
          // Generic damage skill
          const d=u.atk;target.currentHp-=d;Game.showDmg(target,d,false);
          if(target.currentHp<=0)target.currentHp=0;
          Game.log(`${u.icon}→${target.icon} 비전 ${d}데미지`,'ability-log');
        }
      }
      // Render after each action
      this.renderEnemyDiamond();this.renderDiamond();
      await wait(Math.floor(500/Game.battleMultiplier));

      // Check hero death
      const pH=bs.pCards.find(c=>c.isHero);const eH=bs.eCards.find(c=>c.isHero);
      if(pH&&pH.currentHp<=0){this._endBattle(false);return;}
      if(eH&&eH.currentHp<=0){this._endBattle(true);return;}
    }

    // Round survived → next turn
    [...bs.pCards,...bs.eCards].forEach(c=>{c._defending=false;});

    // Energy regen for next turn
    [...bs.pCards,...bs.eCards].filter(c=>c.currentHp>0).forEach(c=>{
      c.curNrg=(c.curNrg||0)+(c.nrgReg||0);
      if(c.hpReg>0)c.currentHp=Math.min(c.currentHp+c.hpReg,c.maxBHp);
    });

    // Round increment
    bs.currentRound++;
    if(bs.currentRound>Game.bestRound)Game.bestRound=bs.currentRound;
    Game.persist();

    // Show round choice (행동력 선택지) before next turn
    Game.battleState=bs;
    Game.skipReq=false;
    Game.showRoundChoice();
    // After round choice completes → finishRound → askFormation → launchBattle → TurnBattle.start
    this.bindKeys();
  },

  async _showCombatAction(unit,text,target){
    if(Game.skipReq)return;
    await Game.showAction(unit,text,target);
  },

  _endBattle(won){
    this.unbindKeys();
    if(this.turnTimer)clearInterval(this.turnTimer);
    const bs=this.bs;
    const rd=bs.currentRound;
    // Same reward logic as before
    if(won){
      Game.totalWins++;SFX.play('fanfare');
      const vb=document.createElement('div');vb.className='victory-banner';vb.textContent='승전!';document.body.appendChild(vb);setTimeout(()=>vb.remove(),2000);
      const goldR=10,xpR=10,honorR=10,lpR=15;
      Game.gold+=goldR;Game.leaguePoints=Math.max(0,(Game.leaguePoints||0)+lpR);
      const participated=bs.battleDeck.map(c=>c.uid);const levelUps=[];
      Game.deck.filter(c=>participated.includes(c.uid)).forEach(c=>{if(Game.giveCardXp(c,xpR))levelUps.push(c.name);Game.giveCardHonor(c,honorR);});
      Game.persist();Game.showBattleEnd(true,goldR,xpR,honorR,levelUps);
    } else {
      SFX.play('death');
      const hdo=document.createElement('div');hdo.className='hero-death-overlay';document.body.appendChild(hdo);setTimeout(()=>hdo.remove(),2000);
      const goldR=3,xpR=10,honorR=1,lpR=-5;
      Game.gold+=goldR;Game.leaguePoints=Math.max(0,(Game.leaguePoints||0)+lpR);
      const participated=bs.battleDeck.map(c=>c.uid);const levelUps=[];
      Game.deck.filter(c=>participated.includes(c.uid)).forEach(c=>{if(Game.giveCardXp(c,xpR))levelUps.push(c.name);Game.giveCardHonor(c,honorR);});
      Game.persist();Game.showBattleEnd(false,goldR,xpR,honorR,levelUps);
    }
  },
});
