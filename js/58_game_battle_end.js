// Game Battle End (전투 종료 + 보상 + 스킬 장착 + 액션 애니메이션)
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
})(["showBattleEnd", "equipSkillPermanent", "equipSkillBattle", "_lastTarget", "showAction"]);

Object.assign(RoF.Game, {
  showBattleEnd(won,goldR,xpR,honorR,levelUps=[]){
    this.checkTutorial('first_battle_end');
    if(!won)this.checkTutorial('first_defeat');
    UI.show('reward-screen');
    const title=document.getElementById('rew-title'),sub=document.getElementById('rew-sub'),stats=document.getElementById('rew-stats');
    const rcards=document.getElementById('reward-cards');rcards.innerHTML='';
    const rd=this.battleState?this.battleState.currentRound:0;

    if(won){
      title.textContent='🏆 승전!';title.className='reward-title victory';
      sub.textContent=`${rd}라운드 만에 적 영웅을 쓰러뜨렸습니다!`;
    } else {
      title.textContent='💀 패전';title.className='reward-title defeat';
      sub.textContent=`라운드 ${rd}에서 영웅이 쓰러졌습니다`;
    }
    const lg=this.getLeague();
    let lvStr=levelUps.length?`<br>🎉 성장: ${levelUps.join(', ')}`:'';
    stats.innerHTML=`💰+${goldR} | 🏆${won?'+15':'-5'}점 | 동료별 ✨+${xpR}경험 ⭐+${honorR}${lvStr}<br><span style="color:${lg.color};">${lg.icon} ${lg.name} (${this.leaguePoints}점)</span>`;

    // === WIN STREAK + BLESSINGS ===
    if(won){
      this.winStreak=(this.winStreak||0)+1;
      this.blessings=(this.blessings||0)+1; // 1승 = 1 신의축복
      let streakBonus=0;
      if(this.winStreak>=10){streakBonus=3;}
      else if(this.winStreak>=5){streakBonus=2;}
      else if(this.winStreak>=3){streakBonus=1;}
      if(streakBonus>0){this.blessings+=streakBonus;}
      const streakMsg=this.winStreak>=3?`<br>🔥 <span style="color:#ff6644;">${this.winStreak}연승! 신의축복 +${1+streakBonus}개</span>`:`<br>✨ 신의축복 +1`;
      stats.innerHTML+=streakMsg;
    } else {
      this.winStreak=0;
    }
    // === LOOT / REWARD ===
    const lgIdx=this.LEAGUES.indexOf(lg);
    const leagueGoldBonus=lgIdx>=5?0.6:lgIdx>=4?0.4:lgIdx>=3?0.4:lgIdx>=2?0.2:lgIdx>=1?0.2:0;

    if(!won){
      // === DEFEAT: simple reward + 신의 은총 2배 ===
      this._lootPicked=true; // 패전은 선택 없으므로 바로 통과
      const defeatGold=Math.floor(3*(1+leagueGoldBonus));
      this.gold+=defeatGold;
      const lootDiv=document.createElement('div');lootDiv.style.cssText='text-align:center;margin:10px 0;';
      lootDiv.innerHTML=`<div style="color:#aaa;font-size:.85rem;margin-bottom:8px;">📦 패전 보상: 💰+${defeatGold}</div>`;
      const dblBtn=document.createElement('div');dblBtn.className='loot-double-btn';
      dblBtn.innerHTML=`<button class="btn btn-s btn-green">📺 신의 은총 (보상 2배: +${defeatGold}💰)</button>`;
      dblBtn.querySelector('button').onclick=()=>{
        this.gold+=defeatGold;SFX.play('upgrade');
        stats.innerHTML+=`<br>📺 <span style="color:#44ff88;">신의 은총! 💰+${defeatGold} 추가!</span>`;
        dblBtn.querySelector('button').disabled=true;dblBtn.querySelector('button').textContent='✅ 은총 적용됨';
        this.persist();
      };
      lootDiv.appendChild(dblBtn);
      rcards.appendChild(lootDiv);
    } else {
    // === VICTORY: loot boxes ===
    const baseGold={gold:15,silver:8,bronze:3};
    const lootDiv=document.createElement('div');lootDiv.style.cssText='text-align:center;margin:10px 0;';
    // 5 streak = guaranteed gold box
    const forceGold=won&&this.winStreak>=5;
    lootDiv.innerHTML=`<div style="color:#ffd700;font-size:.9rem;margin-bottom:8px;">🎁 전리품을 선택하세요!${forceGold?' <span style="color:#ff6644;">(5연승! 금 상자 확정)</span>':''}</div>`;
    const boxRow=document.createElement('div');boxRow.className='loot-boxes';
    const tiers=forceGold?['gold','gold','silver']:['gold','silver','bronze'];
    const shuffled=[...tiers].sort(()=>Math.random()-.5);
    // League-scaled loot rarity for item drops
    const itemRarPool=lgIdx>=4?'legendary':lgIdx>=3?'gold':lgIdx>=2?'gold':lgIdx>=1?'silver':'bronze';
    const lootRewards={
      gold:{label:'금 상자',gold:Math.floor(baseGold.gold*(1+leagueGoldBonus)),bonus:'gold',color:'#ffd700'},
      silver:{label:'은 상자',gold:Math.floor(baseGold.silver*(1+leagueGoldBonus)),bonus:'silver',color:'#c0c0c0'},
      bronze:{label:'동 상자',gold:Math.floor(baseGold.bronze*(1+leagueGoldBonus)),bonus:null,color:'#cd7f32'},
    };
    let lootPicked=false;
    shuffled.forEach((tier,i)=>{
      const box=document.createElement('div');box.className='loot-box';
      box.innerHTML='📦';box.title=`상자 ${i+1}`;
      box.onclick=()=>{
        if(lootPicked)return;lootPicked=true;this._lootPicked=true;
        if(lootDiv.firstElementChild)lootDiv.firstElementChild.style.display='none';
        const reward=lootRewards[tier];
        SFX.play(tier==='gold'?'rarity_up':tier==='silver'?'magic':'click');
        boxRow.querySelectorAll('.loot-box').forEach((b,j)=>{
          const t=shuffled[j];const rw=lootRewards[t];
          b.classList.add('opened',t+'-loot');
          b.innerHTML=`<div style="font-size:1.5rem;">${t==='gold'?'🏆':t==='silver'?'🥈':'🥉'}</div>`;
          const res=document.createElement('div');res.className='loot-result';
          if(j===i){res.innerHTML=`<span style="color:${rw.color};font-weight:bold;">✅ ${rw.label}</span><br>💰+${rw.gold}`;b.style.transform='scale(1.1)';}
          else{res.innerHTML=`<span style="color:#555;">${rw.label}</span><br><span style="color:#555;">💰+${rw.gold}</span>`;b.style.opacity='.5';}
          b.appendChild(res);
        });
        this.gold+=reward.gold;
        let bonusText='';
        // Gold box: 30% blessing + 70% skill/relic
        if(reward.bonus==='gold'&&won){
          if(Math.random()<0.3){this.blessings=(this.blessings||0)+1;bonusText=`✨ 신의축복 +1 추가!`;}
          else{
            const maxR=itemRarPool;const pool=SKILLS_DB.filter(s=>R_ORDER.indexOf(s.rarity)<=R_ORDER.indexOf(maxR));
            if(pool.length){const sk={...pool[Math.floor(Math.random()*pool.length)],uid:uid()};this.ownedSkills=this.ownedSkills||[];this.ownedSkills.push(sk);bonusText=`⚡ ${sk.name} 비전 획득!`;}
          }
        }
        // Silver box: 10% blessing
        if(reward.bonus==='silver'&&won){
          if(Math.random()<0.1){this.blessings=(this.blessings||0)+1;bonusText=`✨ 신의축복 +1 추가!`;}
        }
        // 10 streak: guaranteed legendary reward
        if(won&&this.winStreak>=10&&tier==='gold'){
          const pool=RELICS_DB.filter(r=>r.rarity==='legendary');
          if(pool.length){const rl=pool[Math.floor(Math.random()*pool.length)];this.ownedRelics=this.ownedRelics||[];this.ownedRelics.push({...rl,uid:uid()});applyRelic(rl,this.deck);bonusText=`🏺 전설 유물 ${rl.name} 획득!`;}
        }
        stats.innerHTML+=`<br>📦 ${reward.label}: 💰+${reward.gold}${bonusText?'<br>🏆 <span style="color:#ffd700;">'+bonusText+'</span>':''}`;
        // Double reward button
        const dblBtn=document.createElement('div');dblBtn.className='loot-double-btn';
        dblBtn.innerHTML=`<button class="btn btn-s btn-green" id="double-reward-btn">📺 신의 은총 (골드 2배)</button>`;
        dblBtn.querySelector('button').onclick=()=>{
          this.gold+=reward.gold;SFX.play('rarity_up');
          stats.innerHTML+=`<br>📺 <span style="color:#44ff88;">신의 은총! 💰+${reward.gold} 추가!</span>`;
          dblBtn.querySelector('button').disabled=true;dblBtn.querySelector('button').textContent='✅ 은총 적용됨';
          this.persist();
        };
        lootDiv.appendChild(dblBtn);
        this.persist();
      };
      boxRow.appendChild(box);
    });
    lootDiv.appendChild(boxRow);
    rcards.appendChild(lootDiv);
    } // end if(won) loot boxes

    // === ROGUELIKE RESET — restore stats but keep XP/honor/level ===
    // Track which deployed units died in battle
    const deadUids=new Set();
    if(this.battleState){
      const bs=this.battleState;
      const deployed=bs.battleDeck||[];
      const pCards=bs.pCards||[];
      deployed.forEach(dc=>{
        const bc=pCards.find(p=>p.uid===dc.uid);
        if(bc&&bc.currentHp<=0&&!bc.isHero)deadUids.add(bc.uid);
      });
    }
    if(this._deckSnapshot){
      const xpMap={};
      this.deck.forEach(c=>{xpMap[c.uid]={xp:c.xp||0,honor:c.honor||0,level:c.level||1};});
      const snapLvMap={};
      this._deckSnapshot.forEach(c=>{snapLvMap[c.uid]=c.level||1;});
      this.deck=this._deckSnapshot;
      this.deck.forEach(c=>{
        const saved=xpMap[c.uid];
        if(saved){
          const prevLv=snapLvMap[c.uid]||1;
          c.xp=saved.xp;c.honor=saved.honor;c.level=saved.level;
          const gained=c.level-prevLv;
          if(gained>0){c.atk+=gained;c.hp+=gained*2;c.maxHp+=gained*2;c.def+=gained;}
        }
        // Mark dead deployed units as injured
        if(deadUids.has(c.uid)){c.injured=true;}
      });
      this._deckSnapshot=null;
    }
    this.relics=[];
    this.battleState=null;
    this.persist();
  },

  // Equip a permanent skill to a unit
  equipSkillPermanent(skillData){
    const modal=document.getElementById('equip-modal');
    document.getElementById('equip-title').textContent='비전 장착 대상 선택 (영구)';
    document.getElementById('equip-skill-info').textContent=`${skillData.icon} ${skillData.name}: ${skillData.desc}`;
    const targets=document.getElementById('equip-targets');targets.innerHTML='';
    this.deck.forEach(c=>{
      const d=document.createElement('div');d.className=`deck-mini ${c.rarity||'bronze'}`;d.style.cursor='pointer';
      d.innerHTML=`<div class="dm-icon">${c.icon}</div><div class="dm-name">${c.isHero?'⭐':''}${c.name}</div>`;
      d.onclick=()=>{
        applySkillToUnit(skillData,c);
        c.equips=c.equips||[];c.equips.push({icon:skillData.icon,name:skillData.name,id:skillData.id});
        modal.classList.remove('active');SFX.play('magic');this.persist();
      };targets.appendChild(d);});
    modal.classList.add('active');
  },

  // Equip skill during battle (to battle cards)
  equipSkillBattle(skillData,bs,cb){
    const modal=document.getElementById('equip-modal');
    document.getElementById('equip-title').textContent='비전 장착 대상 선택';
    document.getElementById('equip-skill-info').textContent=`${skillData.icon} ${skillData.name}: ${skillData.desc}`;
    const targets=document.getElementById('equip-targets');targets.innerHTML='';
    bs.pCards.filter(c=>c.currentHp>0).forEach(c=>{
      const d=document.createElement('div');d.className=`deck-mini ${c.rarity||'bronze'}`;d.style.cursor='pointer';
      d.innerHTML=`<div class="dm-icon">${c.icon}</div><div class="dm-name">${c.isHero?'⭐':''}${c.name}</div>`;
      d.onclick=()=>{
        applySkillToUnit(skillData,c);
        c.equips=c.equips||[];c.equips.push({icon:skillData.icon,name:skillData.name,id:skillData.id});
        modal.classList.remove('active');SFX.play('magic');if(cb)cb();
      };targets.appendChild(d);});
    modal.classList.add('active');
  },

  // ---- ACTION ANIMATION ----
  _lastTarget:null,
  async showAction(unit,actionText,target){
    if(this.skipReq)return;
    if(target)this._lastTarget=target;
    const tgt=target||this._lastTarget;
    const isCrit=actionText.includes('치명타');
    const spd=this.battleMultiplier||1;
    const atkImg=getCardImg(unit);
    const tgtImg=tgt?getCardImg(tgt):null;
    const elem=unit.element;
    let fxSrc='';
    if(unit.type==='마법사'&&elem)fxSrc=`img/fx_${elem}.png`;
    else if(unit.type==='사수')fxSrc='img/fx_arrow.png';
    else fxSrc='img/fx_slash.png';

    // Highlight active turn card
    document.querySelectorAll('.battle-card.active-turn').forEach(e=>e.classList.remove('active-turn'));
    const atkEl=document.getElementById(`bc-${unit.uid}`);
    if(atkEl)atkEl.classList.add('active-turn');
    // Get attacker/target screen positions
    const tgtEl=tgt?document.getElementById(`bc-${tgt.uid}`):null;
    const atkRect=atkEl?atkEl.getBoundingClientRect():{left:window.innerWidth*.3,top:window.innerHeight*.5,width:100,height:130};
    const tgtRect=tgtEl?tgtEl.getBoundingClientRect():{left:window.innerWidth*.7,top:window.innerHeight*.3,width:100,height:130};

    // Dim overlay
    const ov=document.createElement('div');ov.className='atk-zoom-overlay';ov.id='atk-zoom-ov';
    ov.style.display='block';
    document.body.appendChild(ov);

    // [STEP 1] Attacker zooms up from card position
    const atk=document.createElement('div');atk.style.cssText=`position:fixed;z-index:185;pointer-events:none;text-align:center;
      left:${atkRect.left+atkRect.width/2}px;top:${atkRect.top+atkRect.height/2}px;transform:translate(-50%,-50%) scale(.3);opacity:0;transition:all ${.2/spd}s ease-out;`;
    atk.innerHTML=`<div class="azc-card ${unit.rarity||'bronze'}" style="${isCrit?'box-shadow:0 0 40px rgba(255,68,68,.6);':''}">
      ${atkImg?`<img class="azc-img" src="${atkImg}" style="width:${isCrit?120:100}px;height:${isCrit?120:100}px;">`:`<div style="font-size:3rem;">${unit.icon}</div>`}
      <div class="azc-name">${unit.isHero?'⭐ ':''}${unit.name}</div>
      <div class="azc-action" style="color:${isCrit?'#ffaa00':'#ff6644'};font-size:${isCrit?'1.1rem':'.85rem'};">${actionText}</div>
    </div>`;
    document.body.appendChild(atk);

    // Zoom to center-left
    await wait(20);
    const centerX=window.innerWidth*(unit.side==='player'?.35:.65);
    const centerY=window.innerHeight*.45;
    atk.style.left=centerX+'px';atk.style.top=centerY+'px';
    atk.style.transform='translate(-50%,-50%) scale(1)';atk.style.opacity='1';
    await wait(Math.floor(200/spd));

    // [STEP 2] Charge toward target + effect explosion
    if(tgtEl){
      // Projectile / charge motion
      const midX=(centerX+tgtRect.left+tgtRect.width/2)/2;
      const midY=(centerY+tgtRect.top+tgtRect.height/2)/2;

      if(unit.type==='사수'||unit.type==='마법사'){
        // Ranged: projectile flies from attacker to target
        const proj=document.createElement('div');proj.style.cssText=`position:fixed;z-index:186;pointer-events:none;
          left:${centerX}px;top:${centerY}px;transform:translate(-50%,-50%);transition:all ${.25/spd}s ease-in;`;
        proj.innerHTML=fxSrc?`<img src="${fxSrc}" style="width:50px;height:50px;">`:'✨';
        document.body.appendChild(proj);
        await wait(20);
        proj.style.left=(tgtRect.left+tgtRect.width/2)+'px';
        proj.style.top=(tgtRect.top+tgtRect.height/2)+'px';
        proj.style.transform='translate(-50%,-50%) scale(1.5)';
        await wait(Math.floor(250/spd));
        proj.remove();
      } else {
        // Melee: attacker charges forward
        atk.style.transition=`all ${.15/spd}s ease-in`;
        atk.style.left=(tgtRect.left+tgtRect.width/2)+'px';
        atk.style.top=(tgtRect.top+tgtRect.height/2)+'px';
        atk.style.transform='translate(-50%,-50%) scale(.8)';
        await wait(Math.floor(150/spd));
      }

      // Effect explosion on target
      const fx=document.createElement('div');fx.style.cssText=`position:fixed;z-index:187;pointer-events:none;
        left:${tgtRect.left+tgtRect.width/2}px;top:${tgtRect.top+tgtRect.height/2}px;transform:translate(-50%,-50%) scale(0);
        transition:all ${.15/spd}s ease-out;`;
      fx.innerHTML=fxSrc?`<img src="${fxSrc}" style="width:${isCrit?80:60}px;height:${isCrit?80:60}px;">`:'💥';
      document.body.appendChild(fx);
      await wait(20);
      fx.style.transform='translate(-50%,-50%) scale(1)';
      await wait(Math.floor(150/spd));
      fx.style.opacity='0';fx.style.transform='translate(-50%,-50%) scale(1.8)';
      await wait(Math.floor(100/spd));
      fx.remove();

      // Target shake
      if(tgtEl){
        const hitClass=isCrit?'crit-hit':'hit-flash';
        tgtEl.classList.remove('hit-anim','hit-flash','crit-hit');void tgtEl.offsetWidth;
        tgtEl.classList.add(hitClass);
        setTimeout(()=>tgtEl.classList.remove(hitClass),500);
      }
    }

    // [STEP 3] Attacker fades out
    atk.style.opacity='0';atk.style.transform='translate(-50%,-50%) scale(1.3)';
    atk.style.transition=`all ${.12/spd}s`;
    await wait(Math.floor(120/spd));
    atk.remove();ov.remove();
    if(atkEl)atkEl.classList.remove('active-turn');
  },

});
