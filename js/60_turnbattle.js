// 60_turnbattle.js — extracted by docs/_split_modules.py (Phase 5)
// TurnBattle module assigned to RoF namespace.

RoF.TurnBattle ={
  bs:null, // battleState reference
  phase:'select', // 'select','action','target_enemy','target_ally','combat','enemy_turn'
  selectedIdx:-1, // which card slot is selected (0-3)
  orders:[], // [{uid,action,targetUid}] queued orders for this turn
  turnTimer:null,turnTimeLeft:60,
  _keyHandler:null,

  // Horizontal 5 slots
  SLOTS:[
    {idx:0,label:'1번'},
    {idx:1,label:'2번'},
    {idx:2,label:'3번'},
    {idx:3,label:'4번'},
    {idx:4,label:'5번'},
  ],
  _canTarget(attacker,targetIdx,targetSide){
    // Taunt system: if any enemy has taunt, only taunt units can be targeted
    const cards=targetSide==='enemy'?this.bs.eCards:this.bs.pCards;
    const target=cards[targetIdx];
    if(!target||target.currentHp<=0)return false;
    const taunters=cards.filter(c=>c.currentHp>0&&c.skill==='taunt');
    if(taunters.length>0&&target.skill!=='taunt')return false;// must target taunter
    return true;
  },

  // Start turn-based battle
  start(battleState){
    this.bs=battleState;
    this.orders=[];
    this.phase='select';
    this.selectedIdx=-1;
    this._highlightIdx=-1;
    this._enemyHighlight=-1;
    this.turnTimeLeft=60;
    this._orderedCount=0;
    UI.show('battle-screen');SFX.bgm('battle');
    document.getElementById('b-round').textContent=this.bs.currentRound;
    { const bn=document.getElementById('b-name'); if(bn) bn.textContent=(typeof Auth!=='undefined'&&Auth.user)?Auth.user:''; }
    document.getElementById('b-status').textContent='카드 선택 [WASD/⏎]';
    document.getElementById('btn-back').style.display='none';
    document.getElementById('btn-fight').textContent='⚔️ 전투 개시!';
    document.getElementById('btn-fight').disabled=false;
    document.getElementById('battle-log').innerHTML='';
    this.renderEnemyDiamond();
    this.renderDiamond();
    this.startTimer();
    this.bindKeys();
  },

  // Render enemy diamond (top half, non-interactive during select)
  renderEnemyDiamond(){
    const enemies=this.bs?this.bs.eCards:[];
    const container=document.getElementById('tb-enemy-diamond');container.innerHTML='';
    for(let i=0;i<5;i++){
      const c=enemies[i];
      const slot=document.createElement('div');
      slot.className=`td-slot bs-en-${i+1}`;
      if(c&&c.currentHp>0){
        slot.id=`bc-${c.uid}`;
        const cardEl=mkCardEl(c);
        // card-v2 의 하트(.cv-hp) / 공격력(.cv-atk) 슬롯 숫자를 현재 전투값으로 덮어쓰기
        const hpEl=cardEl.querySelector('.cv-hp');if(hpEl)hpEl.textContent=Math.ceil(c.currentHp);
        const atkEl=cardEl.querySelector('.cv-atk');if(atkEl)atkEl.textContent=c.atk;
        const nrgEl=cardEl.querySelector('.cv-nrg');if(nrgEl)nrgEl.textContent=Math.floor(c.curNrg||c.nrg||0);
        slot.appendChild(cardEl);
        const hp=Math.max(0,(c.currentHp/c.maxBHp)*100);
        const hpC=hp>50?'#44cc66':hp>25?'#ccaa44':'#cc4444';
        const isTaunt=c.skill==='taunt';
        const statusIcons=(isTaunt?'🛡️':'')+(c.frozen>0?'❄️':'')+(c.burn>0?'🔥':'');
        if(statusIcons){const s=document.createElement('div');s.className='bs-status';s.textContent=statusIcons;slot.appendChild(s);}
        // 슬림 HP 바만 (숫자 없음 — 카드 하트가 숫자 담당)
        const bar=document.createElement('div');bar.className='bs-hp-overlay slim';
        bar.innerHTML=`<div class="bs-hp-bar"><div class="bs-hp-fill" style="width:${hp}%;background:${hpC};"></div></div>`;
        slot.appendChild(bar);
      } else {
        slot.classList.add('bs-empty');
      }
      container.appendChild(slot);
    }
  },

  // Render diamond grid with my cards
  renderDiamond(cards,isEnemy){
    const src=cards||(this.bs?this.bs.pCards.filter(c=>c.currentHp>0):[]);
    const diamond=document.getElementById('tb-diamond');diamond.innerHTML='';
    if(this.phase!=='combat')document.getElementById('tb-actions').style.display='none';
    // Always render 5 slots (빈 슬롯 = dashed outline)
    for(let i=0;i<5;i++){
      const c=src[i];
      const slot=document.createElement('div');
      slot.className=`td-slot bs-al-${i+1}`;
      if(!c){slot.classList.add('bs-empty');diamond.appendChild(slot);continue;}
      const hp=Math.max(0,(c.currentHp/c.maxBHp)*100);
      const hpC=hp>50?'#44cc66':hp>25?'#ccaa44':'#cc4444';
      const ordered=this.orders.find(o=>o.uid===c.uid);
      const isHighlighted=i===this._highlightIdx&&!isEnemy;
      if(isHighlighted)slot.classList.add('td-selected');
      if(ordered)slot.classList.add('td-ordered');
      const cardEl=mkCardEl(c);
      // card-v2 슬롯에 현재 전투값 주입 (하트=currentHp, 공격력, 에너지)
      const hpEl=cardEl.querySelector('.cv-hp');if(hpEl)hpEl.textContent=Math.ceil(c.currentHp);
      const atkEl=cardEl.querySelector('.cv-atk');if(atkEl)atkEl.textContent=c.atk;
      const nrgEl=cardEl.querySelector('.cv-nrg');if(nrgEl)nrgEl.textContent=Math.floor(c.curNrg||c.nrg||0);
      slot.appendChild(cardEl);
      const statusIcons=(c.frozen>0?'❄️':'')+(c.burn>0?'🔥':'')+(c._defending?'🛡️':'');
      if(statusIcons){const s=document.createElement('div');s.className='bs-status';s.textContent=statusIcons;slot.appendChild(s);}
      const bar=document.createElement('div');bar.className='bs-hp-overlay slim';
      bar.innerHTML=`<div class="bs-hp-bar"><div class="bs-hp-fill" style="width:${hp}%;background:${hpC};"></div></div>`;
      slot.appendChild(bar);
      slot.onclick=()=>{
        if(isEnemy){this._selectTarget(c);return;}
        if(this.phase==='target_ally'){this._selectAllyTarget(c);return;}
        if(this._highlightIdx===i){this._confirmHighlight();}
        else{this._highlightIdx=i;SFX.play('click');this.renderDiamond(cards,isEnemy);}
      };
      diamond.appendChild(slot);
    }
  },

  // Show action cards for selected unit (fan card hand)
  _activeCardIdx:-1,_currentUnit:null,_currentActions:null,

  showActions(unit){
    this._currentUnit=unit;this._activeCardIdx=-1;
    const act=document.getElementById('tb-actions');act.style.display='';act.innerHTML='';
    const img=getCardImg(unit);
    const traits=getTraits(unit);
    const traitIcons=traits.map(tid=>{const tr=TRAITS[tid];return tr?`<span style="color:${tr.color};">${tr.icon}</span>`:''}).join(' ');

    // Character portrait top
    act.innerHTML=`
      <div class="ta-selected">
        ${img?`<img src="${img}">`:`<div style="font-size:2.5rem;">${unit.icon}</div>`}
        <div class="ta-name">${unit.isHero?'⭐ ':''}${unit.name} ${traitIcons}</div>
        <div class="ta-stats">♥${Math.ceil(unit.currentHp)}/${unit.maxBHp} ⚔${unit.atk} 🛡${unit.def||0} 💨${unit.spd} ⚡${Math.floor(unit.curNrg||0)}</div>
      </div>
      <div class="ta-hand" id="ta-hand"></div>
      <div id="ta-zoom-area"></div>`;

    const hand=document.getElementById('ta-hand');
    const actions=this._getActions(unit);
    this._currentActions=actions;

    actions.forEach((a,i)=>{
      const card=document.createElement('div');
      card.className=`ta-card${a.disabled?' tac-disabled':''}${a.passive?' tac-passive':''}`;
      if(a.passive) card.title='패시브 — 자동 발동, 직접 사용 불가';
      else if(a.disabled && a.nrgCost) card.title=`에너지 부족 — 필요 ${a.nrgCost}`;
      const badge = a.passive
        ? `<div class="tac-badge passive">⚠️ 패시브</div>`
        : (a.disabled && a.nrgCost ? `<div class="tac-badge nrg">⚡ 에너지 ${a.nrgCost} 필요</div>` : '');
      card.innerHTML=`<div class="tac-key">${i+1}</div>${a.img?`<img src="${a.img}" style="width:70px;height:70px;border-radius:6px;object-fit:cover;margin-top:4px;">`:`<div class="tac-icon">${a.icon}</div>`}<div class="tac-name">${a.name}</div><div class="tac-desc">${a.desc}</div>${badge}`;
      card.onclick=()=>{
        // 같은 카드 2차 클릭 → 사용 (패시브/에너지부족 차단)
        if(this._activeCardIdx===i){
          if(a.passive){ SFX.play('error'); return; }
          if(a.disabled){ SFX.play('error'); return; }
          SFX.play('magic');this._chooseAction(unit,a);
          return;
        }
        // 1차 클릭(또는 다른 카드로 전환) = 확대 (disabled/passive 포함 — 정보 확인 허용)
        this._activeCardIdx=i;SFX.play('click');
        this._highlightHandCard(i,a);
      };
      hand.appendChild(card);
    });
  },

  _highlightHandCard(idx,action){
    // Remove previous active
    document.querySelectorAll('#ta-hand .ta-card').forEach((c,i)=>c.classList.toggle('tac-active',i===idx));
    // Show zoomed card detail
    const zoom=document.getElementById('ta-zoom-area');
    const a=action||this._currentActions[idx];
    let footer;
    if(a.passive){
      footer = `<div class="taz-passive-notice">⚠️ 패시브 스킬 — 자동 발동, 직접 사용 불가</div>`;
    } else if(a.disabled){
      const nrgMsg = a.nrgCost ? `에너지 ${a.nrgCost} 필요` : '일시적 사용 불가';
      footer = `<div class="taz-passive-notice" style="background:rgba(30,70,120,.6);border-color:#4488cc;color:#8fd0ff;">⚡ ${nrgMsg} — 사용 불가</div>`;
    } else {
      footer = `<div style="margin-top:8px;color:#88ff88;font-size:.75rem;">이 카드 영역을 다시 클릭 → 대상 선택</div>`;
    }
    zoom.innerHTML=`<div style="text-align:center;margin-top:8px;">
      <div style="font-size:2rem;">${a.icon}</div>
      <div style="font-size:.9rem;color:#ffd700;font-weight:bold;margin-top:4px;">${a.name}</div>
      <div style="font-size:.7rem;color:#ccc;margin-top:4px;">${a.desc}</div>
      ${footer}
    </div>`;
  },

  _useActiveCard(){
    if(this._activeCardIdx<0||!this._currentUnit||!this._currentActions)return;
    const a=this._currentActions[this._activeCardIdx];
    if(!a) return;
    if(a.passive){ SFX.play('error'); return; } // Enter 방어 — 패시브 사용 불가
    if(!a.disabled){SFX.play('magic');this._chooseAction(this._currentUnit,a);}
  },

  _getActions(unit){
    const nrg=unit.curNrg||0;
    const sk=unit.skill;const skNrg=unit.skillNrg||0;const skT=unit.skillType;
    // Skill image mapping
    const skillImgMap={attack:'skill_attack',defend:'skill_defend',taunt:'skill_taunt',
      aoe:'skill_aoe',breath:'skill_aoe',heal_ally:'skill_heal',heal_self:'skill_heal',mass_heal:'skill_heal',
      freeze:'skill_ice',inspire:'skill_inspire',drain:'skill_drain',life_steal:'skill_drain',
      dark_bolt:'skill_drain',pierce:'skill_pierce',crit:'skill_crit',first_strike:'skill_attack',
      frenzy:'skill_attack',aura_buff:'skill_inspire',double_cast:'skill_lightning'};
    const getSkillImg=(id)=>{const k=skillImgMap[id];return k?`img/${k}.png`:null;};

    const actions=[
      {id:'attack',icon:'⚔️',name:'공격',desc:'기본 물리 공격',target:'enemy',img:getSkillImg('attack')},
      {id:'defend',icon:'🛡️',name:'방어',desc:'이번 턴 피해 50% 감소',target:'self',img:getSkillImg('defend')},
    ];
    if(sk&&sk!=='none'&&skT==='active'){
      actions.push({id:'skill',icon:'🔮',name:unit.skillDesc?unit.skillDesc.split(']')[0].replace('[',''):'비전',
        desc:`${unit.skillDesc||sk} (에너지${skNrg})`,target:this._skillTarget(sk),
        disabled:nrg<skNrg,nrgCost:skNrg,img:getSkillImg(sk)});
    }
    // Equipped skills — passive 는 클릭/확대는 허용, 사용은 zoom area 안내로 차단
    (unit.equips||[]).forEach((eq,i)=>{
      const isPassive = RoF.isSkillPassive && RoF.isSkillPassive(eq.id);
      const skData = eq.id && RoF.Data.SKILLS.find(s=>s.id===eq.id);
      const skDesc = skData ? skData.desc : '장착 비전';
      actions.push({
        id:'equip_'+i,
        icon:eq.icon||'🔮',
        name:eq.name,
        desc: isPassive ? `[패시브] ${skDesc}` : skDesc,
        target:'enemy',
        passive: isPassive || false,
        img:getSkillImg(eq.id)
      });
    });
    return actions;
  },

  _skillTarget(sk){
    if(['heal_ally','heal_self'].includes(sk))return 'ally';
    if(['mass_heal','inspire','aura_buff'].includes(sk))return 'all_ally';
    if(['aoe','breath'].includes(sk))return 'all_enemy';
    return 'enemy';
  },

  _chooseAction(unit,action){
    if(action.target==='self'||action.target==='all_ally'||action.target==='all_enemy'){
      // No target needed
      this._queueOrder(unit.uid,action.id,null);
      return;
    }
    if(action.target==='ally'){
      this.phase='target_ally';this._pendingAction={unit,action};
      document.getElementById('tb-actions').style.display='none';
      document.getElementById('tb-diamond').style.display='';
      document.getElementById('b-status').textContent='아군 대상을 선택하세요';
      this.renderDiamond();// show my cards for ally targeting
      return;
    }
    // Enemy target — show target selection overlay (keeps layout stable)
    this.phase='target_enemy';this._pendingAction={unit,action};this._enemyHighlight=0;
    const hasTaunt=this.bs.eCards.some(c=>c.currentHp>0&&c.skill==='taunt');
    // Calculate pending damage from already queued orders
    const pendingDmg={};
    this.orders.forEach(o=>{
      if(o.action==='attack'&&o.targetUid){
        const atk=this.bs.pCards.find(c=>c.uid===o.uid);
        if(atk){const dmg=Math.max(1,atk.atk-Math.floor(((this.bs.eCards.find(e=>e.uid===o.targetUid)||{}).def||0)*.5));pendingDmg[o.targetUid]=(pendingDmg[o.targetUid]||0)+dmg;}
      }
    });
    // Current attacker's estimated damage
    const myDmg=action.id==='attack'?unit.atk:action.id==='skill'?unit.atk:0;

    const act=document.getElementById('tb-actions');
    act.innerHTML=`
      <div style="color:#ff6644;font-size:1.1rem;margin-bottom:10px;">${hasTaunt?'🛡️ 도발 유닛을 먼저 처치하세요!':'⚔️ 대상을 선택하세요'}</div>
      <div style="font-size:.75rem;color:#888;margin-bottom:8px;">좌우 방향키 이동 · Enter 확정 · ESC 취소</div>
      <div class="tb-side" id="target-enemy-row" style="gap:6px;flex-wrap:nowrap;width:100%;"></div>
      <button class="btn btn-s" onclick="TurnBattle.goBack()" style="margin-top:12px;">← 취소</button>`;
    const row=document.getElementById('target-enemy-row');
    const allEnemies=this.bs.eCards;
    allEnemies.slice(0,5).forEach((c,i)=>{
      const slot=document.createElement('div');slot.className='td-slot';slot.style.cssText='flex:1;max-width:19%;';
      if(!c||c.currentHp<=0){
        slot.innerHTML=`<div class="td-card" style="border:2px dashed #333;background:rgba(0,0,0,.3);opacity:.3;padding:20px;"><div style="color:#333;font-size:1.5rem;">✕</div></div>`;
        row.appendChild(slot);return;
      }
      const canReach=this._canTarget(unit,i,'enemy');
      const isTaunt=c.skill==='taunt';const isHL=i===this._enemyHighlight;
      const img=getCardImg(c);
      // Damage preview
      const alreadyQueued=pendingDmg[c.uid]||0;
      const estDmg=canReach?Math.max(1,myDmg-Math.floor((c.def||0)*.5)):0;
      const currentHp=Math.ceil(c.currentHp);
      const afterQueued=Math.max(0,currentHp-alreadyQueued);
      const afterThis=Math.max(0,afterQueued-estDmg);
      const hpPct=Math.max(0,(c.currentHp/c.maxBHp)*100);
      const afterPct=Math.max(0,(afterThis/c.maxBHp)*100);
      const queuedPct=Math.max(0,(afterQueued/c.maxBHp)*100);
      const willDie=afterThis<=0&&canReach;

      if(isHL)slot.classList.add('td-target-hl');
      slot.innerHTML=`<div class="td-card ${c.rarity||'bronze'}" style="border:none;background:transparent;${!canReach?'opacity:.35;':''}position:relative;${isHL?'filter:drop-shadow(0 0 8px #ff4444);':isTaunt?'filter:drop-shadow(0 0 8px #ffd700);':''}">
        ${isTaunt?'<div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:1rem;">🛡️</div>':''}
        ${willDie?'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:2rem;z-index:2;">💀</div>':''}
        ${img?`<img src="${img}" style="width:95%;max-width:200px;aspect-ratio:1;border-radius:8px;object-fit:cover;${willDie?'opacity:.4;':''}">`:`<div style="font-size:2.5rem;">${c.icon}</div>`}
        <div class="td-name" style="font-size:.8rem;">${c.name}</div>
        <div style="font-size:.7rem;margin-top:3px;">♥${currentHp}${alreadyQueued>0?`<span style="color:#ff8800;">-${alreadyQueued}</span>`:''}${canReach&&estDmg>0?`<span style="color:#ff4444;font-weight:bold;">-${estDmg}</span>`:''} → <span style="color:${willDie?'#ff4444':'#44ff88'};font-weight:bold;">${willDie?'처치!':'♥'+afterThis}</span></div>
        <div style="width:90%;height:6px;background:#222;border-radius:3px;margin:4px auto;overflow:hidden;position:relative;">
          <div style="position:absolute;height:100%;width:${hpPct}%;background:#333;border-radius:3px;"></div>
          <div style="position:absolute;height:100%;width:${queuedPct}%;background:#ff8800;border-radius:3px;"></div>
          <div style="position:absolute;height:100%;width:${afterPct}%;background:${willDie?'#ff4444':'#44cc66'};border-radius:3px;"></div>
        </div>
        <div style="font-size:.55rem;color:#888;">🛡${c.def||0} 💨${c.spd||0}</div>
      </div>`;
      if(canReach){
        slot.style.cursor='pointer';
        slot.onclick=()=>{this._selectTarget(c);};
      } else {slot.style.cursor='not-allowed';}
      row.appendChild(slot);
    });
  },

  _selectTarget(enemy){
    if(!this._pendingAction)return;
    const{unit,action}=this._pendingAction;
    this._queueOrder(unit.uid,action.id,enemy.uid);
    this._pendingAction=null;
  },

  _selectAllyTarget(ally){
    if(!this._pendingAction)return;
    const{unit,action}=this._pendingAction;
    this._queueOrder(unit.uid,action.id,ally.uid);
    this._pendingAction=null;
    this.phase='select';
  },

  _queueOrder(uid,actionId,targetUid){
    // Remove existing order for this unit
    this.orders=this.orders.filter(o=>o.uid!==uid);
    this.orders.push({uid,action:actionId,targetUid});
    this._orderedCount=this.orders.length;
    SFX.play('click');
    // Go back to select phase
    this.phase='select';this.selectedIdx=-1;
    document.getElementById('btn-back').style.display='none';
    document.getElementById('tb-actions').style.display='none';
    document.getElementById('tb-diamond').style.display='';
    document.getElementById('b-status').textContent=`지시 완료 ${this._orderedCount}/${this.bs.pCards.filter(c=>c.currentHp>0).length}`;
    this.renderDiamond();
    // Auto-start if all ordered
    const alive=this.bs.pCards.filter(c=>c.currentHp>0).length;
    if(this._orderedCount>=alive){
      document.getElementById('btn-fight').style.cssText='animation:tutPulse 1s infinite alternate;';
    }
  },

  goBack(){
    if(this.phase==='action'||this.phase==='target_ally'){
      this.phase='select';this.selectedIdx=-1;this._highlightIdx=-1;this._pendingAction=null;
      document.getElementById('btn-back').style.display='none';
      document.getElementById('tb-actions').style.display='none';
      document.getElementById('b-status').textContent='카드 선택 [WASD/⏎]';
      this.renderDiamond();
    }
  },

  showEnemyView(forTarget){
    const ov=document.createElement('div');ov.className='tb-view-overlay';ov.id='tb-view-ov';
    const enemies=this.bs.eCards.filter(c=>c.currentHp>0);
    let html=`<div class="tvo-title">${forTarget?'대상을 선택하세요':'적 진영'}</div>`;
    html+='<div class="tb-diamond" style="position:relative;width:100%;max-width:400px;height:280px;">';
    enemies.slice(0,4).forEach((c,i)=>{
      const pos=this.SLOTS[i];const img=getCardImg(c);
      const hp=Math.max(0,(c.currentHp/c.maxBHp)*100);const hpC=hp>50?'#44cc66':hp>25?'#ccaa44':'#cc4444';
      html+=`<div class="td-slot" style="left:${pos.x}%;top:${pos.y}%;transform:translate(-50%,-50%);cursor:${forTarget?'pointer':'default'};" data-euid="${c.uid}">
        <div class="td-card ${c.rarity||'bronze'}" style="border:none;background:transparent;filter:drop-shadow(0 0 6px rgba(255,68,68,.5));">
          ${img?`<img src="${img}">`:`<div style="font-size:2rem;">${c.icon}</div>`}
          <div class="td-name">${c.name}</div>
          <div class="td-hp">♥${Math.ceil(c.currentHp)}/${c.maxBHp} ⚔${c.atk}</div>
          <div class="td-hp-bar"><div class="td-hp-fill" style="width:${hp}%;background:${hpC};"></div></div>
        </div></div>`;
    });
    html+='</div>';
    if(!forTarget)html+='<div class="tvo-close"><button class="btn btn-s" onclick="TurnBattle._closeOverlay()">← 돌아가기</button></div>';
    ov.innerHTML=html;
    document.getElementById('tb-main').appendChild(ov);
    // Bind clicks for targeting
    if(forTarget){
      enemies.forEach(c=>{
        const el=ov.querySelector(`[data-euid="${c.uid}"]`);
        if(el)el.onclick=()=>this._selectTarget(c);
      });
    }
  },

  _closeOverlay(){
    const ov=document.getElementById('tb-view-ov');if(ov)ov.remove();
    if(this.phase==='target_enemy'){this.phase='action';/* go back to action select */}
  },

  // Timer
  startTimer(){
    this.turnTimeLeft=60;
    document.getElementById('tb-timer-fill').style.width='100%';
    document.getElementById('b-timer-display').textContent='⏱️ 60';
    if(this.turnTimer)clearInterval(this.turnTimer);
    this.turnTimer=setInterval(()=>{
      this.turnTimeLeft--;
      document.getElementById('b-timer-display').textContent=`⏱️ ${this.turnTimeLeft}`;
      document.getElementById('tb-timer-fill').style.width=(this.turnTimeLeft/60*100)+'%';
      if(this.turnTimeLeft<=10)document.getElementById('b-timer-display').style.color='#ff4444';
      else document.getElementById('b-timer-display').style.color='';
      if(this.turnTimeLeft<=0){clearInterval(this.turnTimer);this.startCombat();}
    },1000);
  },

  // Keyboard — WASD moves highlight, Enter confirms
  _highlightIdx:-1, // which card is highlighted (not yet confirmed)
  _enemyHighlight:-1,

  _moveHighlight(idx){
    const alive=this.bs.pCards.filter(c=>c.currentHp>0);
    if(idx<0||idx>=alive.length)return;
    this._highlightIdx=idx;
    SFX.play('click');
    this.renderDiamond(); // re-render with highlight
  },

  _confirmHighlight(){
    const alive=this.bs.pCards.filter(c=>c.currentHp>0);
    if(this._highlightIdx<0||this._highlightIdx>=alive.length)return;
    this.selectedIdx=this._highlightIdx;
    this.phase='action';
    document.getElementById('btn-back').style.display='';
    this.showActions(alive[this.selectedIdx]);
    SFX.play('magic');
  },

};

// Expose as global for inline onclick="TurnBattle.foo()" bindings and Game cross-refs.
window.TurnBattle = RoF.TurnBattle;