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

  showForBattle(battleDeck){this._cards=battleDeck;this._init();},
  show(){this._cards=Game.deck;this._init();},

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
      slot.style.cssText='flex:1;max-width:18%;min-width:100px;';
      const img=c?getCardImg(c):'';
      if(c){
        slot.innerHTML=`<div style="text-align:center;">
          ${img?`<img src="${img}" style="width:100%;max-width:150px;aspect-ratio:1;border-radius:8px;object-fit:cover;border:3px solid ${isSel?'#44ff88':'#8b6914'};box-shadow:${isSel?'0 0 15px rgba(68,255,136,.5)':'none'};">`:`<div style="font-size:2.5rem;">${c.icon}</div>`}
          <div class="fs-name" style="font-size:.8rem;margin-top:4px;">${c.isHero?'⭐':''}${c.name}</div>
        </div>`;
      } else {
        slot.innerHTML=`<div style="text-align:center;padding:25px 0;border:2px dashed #333;border-radius:10px;background:rgba(0,0,0,.2);">
          <div style="font-size:2rem;color:#333;">➕</div>
          <div style="font-size:.6rem;color:#555;">${i+1}번 슬롯</div>
        </div>`;
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