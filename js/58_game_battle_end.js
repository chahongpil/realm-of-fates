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

    // P0-2: 승리 스탬프 애니 리셋 → 재생 (reflow 강제로 keyframe 재실행)
    if(won){
      title.textContent='🏆 승전!';title.className='reward-title victory';
      title.classList.remove('is-stamping'); void title.offsetWidth; title.classList.add('is-stamping');
      sub.textContent=`${rd}라운드 만에 적 영웅을 쓰러뜨렸습니다!`;
    } else {
      title.textContent='💀 패전';title.className='reward-title defeat';
      sub.textContent=`라운드 ${rd}에서 영웅이 쓰러졌습니다`;
    }
    const lg=this.getLeague();
    let lvStr=levelUps.length?`<br>🎉 성장: ${levelUps.join(', ')}`:'';
    // P0-2: 주요 숫자(gold, lp) 는 0 에서 카운트업. class="rew-tween" + data-target 속성으로 마킹.
    const lpDelta=won?15:-5;
    stats.innerHTML=`💰+<span class="rew-tween" data-target="${goldR}">0</span> | 🏆<span class="rew-tween" data-target="${lpDelta}">0</span>점 | 동료별 ✨+${xpR}경험 ⭐+${honorR}${lvStr}<br><span style="color:${lg.color};">${lg.icon} ${lg.name} (${this.leaguePoints}점)</span>`;

    // === WIN STREAK + BLESSINGS ===
    if(won){
      this.winStreak=(this.winStreak||0)+1;
      this.blessings=(this.blessings||0)+1; // 1승 = 1 신의축복
      let streakBonus=0;
      if(this.winStreak>=10){streakBonus=3;}
      else if(this.winStreak>=5){streakBonus=2;}
      else if(this.winStreak>=3){streakBonus=1;}
      if(streakBonus>0){this.blessings+=streakBonus;}
      const streakMsg=this.winStreak>=3?`<br>🔥 <span style="color:var(--danger);">${this.winStreak}연승! 신의축복 +${1+streakBonus}개</span>`:`<br>✨ 신의축복 +1`;
      stats.innerHTML+=streakMsg;
    } else {
      this.winStreak=0;
    }
    // === LOOT / REWARD — 4지선다 (유닛/스킬/유물/골드) ===
    const lgIdx=this.LEAGUES.indexOf(lg);
    const leagueGoldBonus=lgIdx>=5?0.6:lgIdx>=4?0.4:lgIdx>=3?0.4:lgIdx>=2?0.2:lgIdx>=1?0.2:0;

    if(!won){
      // === DEFEAT: 고정 패전 골드 ===
      this._lootPicked=true;
      const defeatGold=Math.floor(5*(1+leagueGoldBonus));
      this.gold+=defeatGold;
      const lootDiv=document.createElement('div');lootDiv.className='reward-loot';
      lootDiv.innerHTML=`<div class="rew-defeat-msg">패전 보상: 💰+${defeatGold}</div>`;
      rcards.appendChild(lootDiv);
    } else {
    // === VICTORY: 4지선다 ===
    // 등급 풀 결정 (리그 + 연승)
    let maxRarIdx=lgIdx>=5?3:lgIdx>=3?2:lgIdx>=1?1:0; // 0=bronze,1=silver,2=gold,3=legendary
    if(this.winStreak>=10) maxRarIdx=3;
    else if(this.winStreak>=5) maxRarIdx=Math.max(maxRarIdx,2);
    else if(this.winStreak>=3) maxRarIdx=Math.max(maxRarIdx,1);
    const maxRar=R_ORDER[Math.min(maxRarIdx,3)]; // divine 은 보상에서 제외

    // 등급 내 랜덤 선택 (높을수록 낮은 확률)
    const pickRarity=()=>{
      const pool=R_ORDER.slice(0,R_ORDER.indexOf(maxRar)+1);
      // 가중치: bronze=40, silver=30, gold=20, legendary=10
      const weights=[40,30,20,10];
      const w=pool.map((_,i)=>weights[i]||5);
      const total=w.reduce((a,b)=>a+b,0);
      let r=Math.random()*total;
      for(let i=0;i<pool.length;i++){r-=w[i];if(r<=0)return pool[i];}
      return pool[0];
    };

    // 보상 3종 생성
    const unitRar=pickRarity();
    const unitPool=UNITS.filter(u=>u.rarity===unitRar&&!u.isHero);
    const rewardUnit=unitPool.length?unitPool[Math.floor(Math.random()*unitPool.length)]:UNITS.find(u=>!u.isHero);

    const skillRar=pickRarity();
    const skillPool=SKILLS_DB.filter(s=>s.rarity===skillRar);
    const rewardSkill=skillPool.length?skillPool[Math.floor(Math.random()*skillPool.length)]:SKILLS_DB[0];

    const relicRar=pickRarity();
    const relicPool=RELICS_DB.filter(r=>r.rarity===relicRar);
    const rewardRelic=relicPool.length?relicPool[Math.floor(Math.random()*relicPool.length)]:RELICS_DB[0];

    const lootDiv=document.createElement('div');lootDiv.className='reward-loot';
    const streak=this.winStreak||0;
    lootDiv.innerHTML=`<div class="rew-pick-title">보상을 선택하세요${streak>=3?` <span style="color:var(--danger);">(${streak}연승!)</span>`:''}</div>`;
    const row=document.createElement('div');row.className='rew-pick-row';
    let picked=false;
    const self=this;

    const RARE_LABEL={bronze:'평범',silver:'희귀',gold:'고귀',legendary:'전설',divine:'신'};
    const RARE_COLOR={bronze:'var(--rar-bronze)',silver:'var(--rar-silver)',gold:'var(--rar-gold)',legendary:'var(--rar-legendary)',divine:'var(--curr-gold)'};

    // 선택지 4개 정의
    const choices=[
      {icon:rewardUnit.icon||'🗡️',cat:'유닛',name:rewardUnit.name,rarity:rewardUnit.rarity,
       desc:`HP ${rewardUnit.hp} ATK ${rewardUnit.atk} DEF ${rewardUnit.def}`,
       onPick(){self.deck.push({...rewardUnit,uid:uid(),level:1,equips:[],maxHp:rewardUnit.hp,xp:0,honor:0,freePoints:0,growthPts:{atk:0,hp:0,def:0,spd:0,nrg:0,luck:0,eva:0}});
         stats.innerHTML+=`<br>🗡️ <span style="color:${RARE_COLOR[rewardUnit.rarity]};">${RARE_LABEL[rewardUnit.rarity]} ${rewardUnit.name}</span> 합류!`;}},
      {icon:rewardSkill.icon||'⚡',cat:'스킬',name:rewardSkill.name,rarity:rewardSkill.rarity,
       desc:rewardSkill.desc,
       onPick(){self.ownedSkills=self.ownedSkills||[];self.ownedSkills.push({...rewardSkill,uid:uid()});
         stats.innerHTML+=`<br>⚡ <span style="color:${RARE_COLOR[rewardSkill.rarity]};">${RARE_LABEL[rewardSkill.rarity]} ${rewardSkill.name}</span> 습득!`;}},
      {icon:rewardRelic.icon||'🏺',cat:'유물',name:rewardRelic.name,rarity:rewardRelic.rarity,
       desc:rewardRelic.desc,
       onPick(){self.ownedRelics=self.ownedRelics||[];self.ownedRelics.push({...rewardRelic,uid:uid()});applyRelic(rewardRelic,self.deck);
         stats.innerHTML+=`<br>🏺 <span style="color:${RARE_COLOR[rewardRelic.rarity]};">${RARE_LABEL[rewardRelic.rarity]} ${rewardRelic.name}</span> 획득!`;}},
      {icon:'💰',cat:'골드',name:'신의 은총',rarity:null,
       desc:'🎲 1~100 랜덤 골드',
       onPick(){
         const roll=Math.floor(Math.random()*100)+1;
         self.gold+=roll;
         stats.innerHTML+=`<br>💰 <span style="color:var(--curr-gold);">🎲 ${roll} 골드 획득!</span>`;
         // 신의 은총: 2배 버튼 표시
         const graceDiv=document.createElement('div');graceDiv.className='rew-grace';
         graceDiv.innerHTML=`<button class="btn btn-s" style="border-color:var(--curr-gold);">✨ 신의 은총 (💰×2 = +${roll})</button>`;
         graceDiv.querySelector('button').onclick=()=>{
           self.gold+=roll;SFX.play('rarity_up');
           stats.innerHTML+=`<br>✨ <span style="color:var(--success);">신의 은총! 💰+${roll} 추가!</span>`;
           graceDiv.querySelector('button').disabled=true;graceDiv.querySelector('button').textContent='✅ 은총 적용됨';
           self.persist();
         };
         lootDiv.appendChild(graceDiv);
       }},
    ];

    choices.forEach((c,i)=>{
      const card=document.createElement('div');
      card.className='rew-pick-card'+(c.rarity?' '+c.rarity:'');
      card.innerHTML=`
        <div class="rpc-icon">${c.icon}</div>
        <div class="rpc-cat">${c.cat}</div>
        <div class="rpc-name" ${c.rarity?`style="color:${RARE_COLOR[c.rarity]}"`:''}>${c.name}</div>
        ${c.rarity?`<div class="rpc-rarity" style="color:${RARE_COLOR[c.rarity]};">${RARE_LABEL[c.rarity]}</div>`:''}
        <div class="rpc-desc">${c.desc}</div>`;
      card.onclick=()=>{
        if(picked)return;picked=true;this._lootPicked=true;
        SFX.play(c.rarity==='legendary'?'rarity_up':c.rarity==='gold'?'magic':'click');
        // 선택된 카드 강조, 나머지 흐리게
        row.querySelectorAll('.rew-pick-card').forEach((el,j)=>{
          if(j===i){el.classList.add('picked');}
          else{el.classList.add('dimmed');}
        });
        c.onPick();
        this.persist();
      };
      row.appendChild(card);
    });
    lootDiv.appendChild(row);
    rcards.appendChild(lootDiv);
    } // end if(won) 4지선다

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

    // P0-2: 숫자 tween 시작 — 모든 동기 innerHTML 업데이트가 끝난 후 실행.
    // innerHTML += 가 노드를 재생성하므로 여기서 querySelectorAll 로 새로 찾음.
    setTimeout(()=>{
      const nodes=document.querySelectorAll('#rew-stats .rew-tween');
      nodes.forEach(el=>{
        const target=parseInt(el.getAttribute('data-target'),10);
        if(isNaN(target)){return;}
        const from=0, dur=1100, start=performance.now();
        const ease=t=>1-Math.pow(1-t,3); // easeOutCubic
        const tick=now=>{
          // 중간에 innerHTML += 로 노드가 교체됐으면 기존 ref 는 detached — 새로 찾기
          const live=el.isConnected?el:document.querySelector('#rew-stats .rew-tween[data-target="'+target+'"]');
          if(!live){return;}
          const t=Math.min(1,(now-start)/dur);
          const v=Math.round(from+(target-from)*ease(t));
          live.textContent=(target>0&&v>0?'+':'')+v;
          if(t<1){requestAnimationFrame(tick);} else {live.classList.add('rew-tween-done');}
        };
        requestAnimationFrame(tick);
      });
    },30);
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
