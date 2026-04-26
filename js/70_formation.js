// 70_formation.js — extracted by docs/_split_modules.py (Phase 5)
// Formation module assigned to RoF namespace.

RoF.Formation ={
  // Horizontal 5 slots
  slots:[null,null,null,null,null],
  POSITIONS:[
    {label:'1번 슬롯'},{label:'2번 슬롯'},{label:'3번 슬롯'},{label:'4번 슬롯'},{label:'5번 슬롯'},
  ],
  selected:null, // {type:'slot',idx} or {type:'bench',card}
  _cards:[],

  // 2026-04-24: 진입 컨텍스트 모드 추가.
  //   'matched' = Game.startBattle → showMatchmaking → showForBattle. [배치 완료 → 전투!] 만 표시.
  //   'free'    = 성문 [전열 정비하기] / Game.showFormation 직접. 출전 허브(리그/원정대/결투) 표시.
  _mode:'matched',

  showForBattle(battleDeck){this._mode='matched';this._cards=battleDeck;this._init();},
  show(){this._mode='free';this._cards=Game.deck;this._init();},

  _init(){
    UI.show('formation-screen');
    this.slots=[null,null,null,null,null];
    const deck=this._cards;
    deck.forEach(c=>{
      if(c.formSlot!=null&&c.formSlot<5&&!this.slots[c.formSlot]){this.slots[c.formSlot]=c;return;}
    });
    const placed=new Set(this.slots.filter(Boolean).map(c=>c.uid));
    const unplaced=deck.filter(c=>!placed.has(c.uid));
    unplaced.forEach(c=>{
      const ei=this.slots.indexOf(null);if(ei>=0)this.slots[ei]=c;
    });
    this.selected=null;
    this.render();
    this._renderActions();
  },

  // 액션 영역 렌더 (진입 컨텍스트별).
  _renderActions(){
    const host=document.getElementById('form-actions');
    if(!host) return;
    if(this._mode==='matched'){
      host.innerHTML =
        `<button class="btn btn-s" data-action="formation.auto">자동 배치</button>` +
        `<button class="btn btn-s btn-green" data-action="formation.confirm">배치 완료 → 전투!</button>`;
    } else {
      // 'free' — 마을 [전열 정비하기] 진입. 편성 후 출전 모드 선택.
      host.innerHTML =
        `<button class="btn btn-s" data-action="formation.auto">자동 배치</button>` +
        `<button class="btn btn-s btn-green" data-action="formation.startLeague">⚔️ 리그 도전하기</button>` +
        `<button class="btn btn-s" data-action="formation.startExpedition">🤝 원정대 모집하기 <span style="opacity:.55;font-size:.85em;">(준비 중)</span></button>` +
        `<button class="btn btn-s" data-action="formation.startArena">⚔️ 결투장 입장하기</button>` +
        `<button class="btn btn-s btn-red" data-action="game.showMenu">돌아가기</button>`;
    }
  },

  // 'free' 모드 출전 액션. 슬롯 저장 후 실제 매칭/전투 시스템 호출.
  _persistSlots(){
    this.slots.forEach((c,i)=>{ if(c){c.formSlot=i;c.formIdx=i;} });
    if(typeof Game!=='undefined' && Game.persist) Game.persist();
  },
  startLeague(){
    this._persistSlots();
    if(typeof Game!=='undefined' && typeof Game.startBattle==='function') Game.startBattle();
  },
  startExpedition(){
    UI.modal('🤝 원정대',
      '동료들과 함께 보스를 토벌하는 협동 원정 기능이 곧 열립니다.\n\n(원정대 시스템 준비 중)', null);
  },
  startArena(){
    this._persistSlots();
    if(typeof Arena!=='undefined' && typeof Arena.startGhostBattle==='function'){
      Arena.startGhostBattle();
    } else {
      UI.modal('⚔️ 결투장',
        '결투장 매칭 시스템 초기화 중입니다. 잠시 후 다시 시도해 주세요.\n\n(Arena 모듈 미로딩)', null);
    }
  },

  auto(){
    this.slots=[null,null,null,null,null];
    const deck=[...this._cards];
    let si=0;
    deck.forEach(c=>{if(si<5)this.slots[si++]=c;});
    SFX.play('click');this.render();
  },

  // 현재 슬롯의 원소 공명 상태 배지 렌더.
  // Battle.computeResonance 를 재사용해 전투 계산과 단일 source of truth 유지.
  _renderResonance(){
    const host=document.getElementById('form-resonance');
    if(!host) return;
    const placed=this.slots.filter(Boolean);
    const B=(window.RoF&&window.RoF.Battle)||window.Battle;
    const reso=(B&&B.computeResonance)?B.computeResonance(placed):{};
    const entries=Object.entries(reso).filter(([_,n])=>n>=2)
      .sort((a,b)=>b[1]-a[1]);
    if(!entries.length){host.innerHTML='';return;}
    const ICON=(window.RoF&&RoF.Data&&RoF.Data.ELEM_ICON)||{};
    const LABEL=(window.RoF&&RoF.Data&&RoF.Data.ELEM_L)||{};
    const COLOR=(window.RoF&&RoF.Data&&RoF.Data.ELEM_COLOR)||{};
    host.innerHTML=entries.map(([el,n])=>{
      const mult=n>=4?1.35:n>=3?1.20:1.10;
      const tier=n>=4?'fr-t4':n>=3?'fr-t3':'fr-t2';
      const pct=Math.round((mult-1)*100);
      return `<span class="fr-badge ${tier}" style="--fr-col:${COLOR[el]||'#888'};" title="${LABEL[el]||el} 공명: 공격 +${pct}%${n>=3?` · 같은 원소 피격 -${n>=4?20:10}%`:''}">
        <span class="fr-icon">${ICON[el]||'◆'}</span>
        <span class="fr-count">×${n}</span>
        <span class="fr-mult">+${pct}%</span>
      </span>`;
    }).join('');
  },

  render(){
    const diamond=document.getElementById('form-diamond');diamond.innerHTML='';
    for(let i=0;i<5;i++){
      const c=this.slots[i];
      const isSel=this.selected&&this.selected.type==='slot'&&this.selected.idx===i;
      const slot=document.createElement('div');
      slot.className='form-slot'+(c?' occupied':'')+(isSel?' selected':'');
      if(c){
        const comp=RoF.CardV4Component.create(c,{});
        comp.setSelected(isSel);
        slot.appendChild(comp.el);
      } else {
        const empty=document.createElement('div');
        empty.className='form-slot-empty';
        empty.innerHTML=`<div class="fse-plus">➕</div><div class="fse-label">${i+1}번 슬롯</div>`;
        slot.appendChild(empty);
      }
      slot.onclick=()=>this.clickSlot(i);
      diamond.appendChild(slot);
    }

    // Bench
    const placed=new Set(this.slots.filter(Boolean).map(c=>c.uid));
    const bench=this._cards.filter(c=>!placed.has(c.uid));
    const bc=document.getElementById('form-bench');bc.innerHTML='';
    if(!bench.length){bc.innerHTML='<div style="color:#555;font-size:.75rem;text-align:center;">모든 동료가 배치됨</div>';}
    bench.forEach(c=>{
      const isSel=this.selected&&this.selected.type==='bench'&&this.selected.card.uid===c.uid;
      const d=document.createElement('div');d.className=`deck-mini ${c.rarity||'bronze'}`;
      d.style.border=isSel?'2px solid #44ff88':'';
      const img=getCardImg(c);
      d.innerHTML=`${img?`<img src="${img}" style="width:30px;height:30px;border-radius:4px;object-fit:cover;">`:`<div class="dm-icon">${c.icon}</div>`}<div class="dm-name">${c.isHero?'⭐':''}${c.name}</div>`;
      d.onclick=()=>this.clickBench(c);
      bc.appendChild(d);
    });

    this._renderResonance();
  },

  clickSlot(idx){
    if(this.selected){
      if(this.selected.type==='bench'){
        // Place bench card into slot
        const old=this.slots[idx];
        if(old){old.formSlot=null;}
        this.slots[idx]=this.selected.card;
        this.selected.card.formSlot=idx;
      } else if(this.selected.type==='slot'){
        // Swap two slots
        const src=this.slots[this.selected.idx];
        const dst=this.slots[idx];
        this.slots[this.selected.idx]=dst;
        this.slots[idx]=src;
        if(src)src.formSlot=idx;
        if(dst)dst.formSlot=this.selected.idx;
      }
      this.selected=null;SFX.play('click');
    } else {
      if(this.slots[idx]){this.selected={type:'slot',idx};SFX.play('click');}
    }
    this.render();
  },

  clickBench(card){
    if(this.selected&&this.selected.type==='slot'){
      const old=this.slots[this.selected.idx];
      if(old){old.formSlot=null;}
      this.slots[this.selected.idx]=card;
      card.formSlot=this.selected.idx;
      this.selected=null;SFX.play('click');
    } else {
      this.selected={type:'bench',card};SFX.play('click');
    }
    this.render();
  },

  confirm(){
    this.slots.forEach((c,i)=>{
      if(c){c.formSlot=i;c.formIdx=i;}
    });
    Game.persist();
    Game.launchBattle();
  },
};

// Expose as global for inline onclick="Formation.foo()" bindings and Game cross-refs.
window.Formation = RoF.Formation;