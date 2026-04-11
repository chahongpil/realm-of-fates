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
    document.getElementById('b-status').textContent='카드를 선택하세요 (WASD 이동, Enter 확인)';
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
      const slot=document.createElement('div');slot.className='td-slot';
      if(c&&c.currentHp>0){
        const hp=Math.max(0,(c.currentHp/c.maxBHp)*100);const hpC=hp>50?'#44cc66':hp>25?'#ccaa44':'#cc4444';
        const img=getCardImg(c);slot.id=`bc-${c.uid}`;
        const isTaunt=c.skill==='taunt';
        slot.innerHTML=`<div class="td-card ${c.rarity||'bronze'}" style="border:2px solid ${isTaunt?'#ffd700':'#ff4444'};background:linear-gradient(180deg,rgba(30,10,10,.85),rgba(10,5,5,.9));${isTaunt?'box-shadow:0 0 12px rgba(255,215,0,.4);':''}">
          ${isTaunt?'<div style="position:absolute;top:-6px;left:50%;transform:translateX(-50%);font-size:.8rem;">🛡️</div>':''}
          ${img?`<img src="${img}">`:`<div style="font-size:1.5rem;">${c.icon}</div>`}
          <div class="td-name">${c.name}</div>
          <div class="td-hp">♥${Math.ceil(c.currentHp)} ⚔${c.atk}</div>
          <div class="td-hp-bar"><div class="td-hp-fill" style="width:${hp}%;background:${hpC};"></div></div>
        </div>`;
      } else {
        slot.innerHTML=`<div class="td-card" style="border:2px dashed #333;background:rgba(0,0,0,.3);opacity:.3;padding:12px 4px;">
          <div style="font-size:1rem;color:#333;">✕</div></div>`;
      }
      container.appendChild(slot);
    }
  },

  // Render diamond grid with my cards
  renderDiamond(cards,isEnemy){
    const src=cards||(this.bs?this.bs.pCards.filter(c=>c.currentHp>0):[]);
    const diamond=document.getElementById('tb-diamond');diamond.innerHTML='';
    if(this.phase!=='combat')document.getElementById('tb-actions').style.display='none';
    src.slice(0,5).forEach((c,i)=>{
      const hp=Math.max(0,(c.currentHp/c.maxBHp)*100);
      const hpC=hp>50?'#44cc66':hp>25?'#ccaa44':'#cc4444';
      const img=getCardImg(c);
      const ordered=this.orders.find(o=>o.uid===c.uid);
      const isHighlighted=i===this._highlightIdx&&!isEnemy;
      const slot=document.createElement('div');
      slot.className=`td-slot ${isHighlighted?'td-selected':''} ${ordered?'td-ordered':''}`;
      const borderColor=isHighlighted?'#ffd700':ordered?'#44ff88':'#44aaff';
      // Status icons
      const frozen=c.frozen>0;const burning=c.burn>0;const defending=c._defending;
      const statusIcons=(frozen?'❄️':'')+(burning?'🔥':'')+(defending?'🛡️':'');
      // Order display
      const orderDesc=ordered?({attack:'⚔️',defend:'🛡️',skill:'🔮'})[ordered.action]||'✓':'';
      // Row label
      const rowLabel=`${i+1}번`;
      slot.innerHTML=`
        <div class="td-card ${c.rarity||'bronze'}" style="border:2px solid ${borderColor};background:linear-gradient(180deg,rgba(20,15,10,.9),rgba(5,5,5,.95));">
          ${img?`<img src="${img}">`:`<div style="font-size:2rem;">${c.icon}</div>`}
          <div class="td-name">${c.isHero?'⭐':''}${c.name}</div>
          <div class="td-hp">♥${Math.ceil(c.currentHp)}/${c.maxBHp} ⚔${c.atk} ⚡${Math.floor(c.curNrg||0)}</div>
          <div class="td-hp-bar"><div class="td-hp-fill" style="width:${hp}%;background:${hpC};"></div></div>
          ${statusIcons?`<div style="font-size:.6rem;margin-top:1px;">${statusIcons}</div>`:''}
          <div class="td-order" style="${ordered?'display:flex;background:#44ff88;':''}">${orderDesc}</div>
          <div style="font-size:.4rem;color:#666;margin-top:1px;">${rowLabel}</div>
        </div>`;
      slot.onclick=()=>{
        if(isEnemy){this._selectTarget(c);return;}
        if(this.phase==='target_ally'){this._selectAllyTarget(c);return;}
        // Click = highlight first, click again = confirm
        if(this._highlightIdx===i){
          this._confirmHighlight();
        } else {
          this._highlightIdx=i;SFX.play('click');
          this.renderDiamond(cards,isEnemy);
        }
      };
      diamond.appendChild(slot);
    });
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
      card.className=`ta-card${a.disabled?' tac-disabled':''}`;
      card.innerHTML=`<div class="tac-key">${i+1}</div>${a.img?`<img src="${a.img}" style="width:70px;height:70px;border-radius:6px;object-fit:cover;margin-top:4px;">`:`<div class="tac-icon">${a.icon}</div>`}<div class="tac-name">${a.name}</div><div class="tac-desc">${a.desc}</div>`;
      if(!a.disabled){
        card.onclick=()=>{
          // First click = zoom card to center
          if(this._activeCardIdx===i){
            // Second click = use it
            SFX.play('magic');this._chooseAction(unit,a);
          } else {
            this._activeCardIdx=i;SFX.play('click');
            this._highlightHandCard(i,a);
          }
        };
      }
      hand.appendChild(card);
    });
  },

  _highlightHandCard(idx,action){
    // Remove previous active
    document.querySelectorAll('#ta-hand .ta-card').forEach((c,i)=>c.classList.toggle('tac-active',i===idx));
    // Show zoomed card detail
    const zoom=document.getElementById('ta-zoom-area');
    const a=action||this._currentActions[idx];
    zoom.innerHTML=`<div style="text-align:center;margin-top:8px;">
      <div style="font-size:2rem;">${a.icon}</div>
      <div style="font-size:.9rem;color:#ffd700;font-weight:bold;margin-top:4px;">${a.name}</div>
      <div style="font-size:.7rem;color:#ccc;margin-top:4px;">${a.desc}</div>
      <button class="btn btn-s btn-green" style="margin-top:8px;" onclick="TurnBattle._useActiveCard()">사용하기 (Enter)</button>
    </div>`;
  },

  _useActiveCard(){
    if(this._activeCardIdx<0||!this._currentUnit||!this._currentActions)return;
    const a=this._currentActions[this._activeCardIdx];
    if(a&&!a.disabled){SFX.play('magic');this._chooseAction(this._currentUnit,a);}
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
        disabled:nrg<skNrg,img:getSkillImg(sk)});
    }
    // Equipped skills
    (unit.equips||[]).forEach((eq,i)=>{
      actions.push({id:'equip_'+i,icon:eq.icon||'🔮',name:eq.name,desc:`장착 비전`,target:'enemy'});
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
      slot.innerHTML=`<div class="td-card ${c.rarity||'bronze'}" style="border:3px solid ${isHL?'#ff4444':isTaunt?'#ffd700':'#555'};background:linear-gradient(180deg,rgba(30,10,10,.9),rgba(10,5,5,.95));${!canReach?'opacity:.35;':''}position:relative;">
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
      document.getElementById('b-status').textContent='카드를 선택하세요 (WASD 이동, Enter 확인)';
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
        <div class="td-card ${c.rarity||'bronze'}" style="border:2px solid #ff4444;background:linear-gradient(180deg,rgba(30,10,10,.9),rgba(10,5,5,.95));">
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
        // Damage calc (새 기획 적용: ATK-DEF, 크리×2, EVA캡80%, RAGE, 보호막)
        let rawAtk=u.atk;
        // RAGE 보너스 (10/20/30 단계)
        const rage=u.rage||0;
        if(rage>=30)rawAtk=Math.floor(rawAtk*1.3);
        else if(rage>=20)rawAtk=Math.floor(rawAtk*1.2);
        else if(rage>=10)rawAtk=Math.floor(rawAtk*1.1);
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
        // RAGE 축적 (피격자에게 데미지만큼)
        target.rage=(target.rage||0)+dmg;
        // RAGE 100 궁극기 체크
        if(target.rage>=100){target.rage=0;Game.log(`💢 ${target.icon}${target.name} 분노 폭발!`,'ability-log');}
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
};

// Expose as global for inline onclick="TurnBattle.foo()" bindings and Game cross-refs.
window.TurnBattle = RoF.TurnBattle;