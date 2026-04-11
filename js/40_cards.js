'use strict';

// Phase 3: card/relic DOM builders → RoF.dom.* (+ window.* 호환)
RoF.dom = RoF.dom || {};

RoF.dom.mkCardEl = function(c){
  const div=document.createElement('div');div.className=`card ${c.rarity||'bronze'}`;div.setAttribute('data-type',c.type||'');
  const skillIcons=(c.equips||[]).map(e=>`<span style="font-size:.55rem;background:rgba(0,0,0,.5);border-radius:2px;padding:0 2px;border:1px solid rgba(255,255,255,.15);">${e.icon}</span>`).join('')||'';
  const xpPct=c.xp!=null?Math.floor((c.xp||0)/((c.level||1)*10)*100):0;
  // 카드 UI — 프레임 PNG 오버레이 + 일러스트 배경
  const imgSrc=getCardImg(c);
  const imgStyle=imgSrc?`background-image:url('${imgSrc}');background-size:cover;background-position:center;`:'';
  div.innerHTML=`<div class="card-inner" style="${imgStyle}">
    <div class="card-cost">${c.level||1}</div>
    <div class="card-name">${c.isHero?'⭐ ':''}${c.name}</div>
    <div class="card-hp-badge">♥${c.hp}</div>
    <div class="card-type">${c.element?ELEM_ICON[c.element]+' ':''} ${c.type||''} · ${ROLE_L[c.role]||''}</div>
    ${!imgSrc?`<div class="card-portrait"><div class="card-icon">${c.icon}</div></div>`:''}
    <div class="card-stats">
      <span class="st st-atk">⚔${c.atk}</span>
      <span class="st st-def">🛡${c.def||0}</span>
      <span class="st st-spd">💨${c.spd}</span>
    </div>
    <div class="card-ability">${c.skillDesc||''}${c.bonusTrigger?'<br><span style="color:#e680b0;">🎲'+c.bonusTrigger.desc+'</span>':''}</div>
    <div class="card-nrg-badge">◆${c.nrg||0}</div>
    ${c.xp!=null?`<div class="card-xp"><div style="height:3px;background:#222;border-radius:2px;overflow:hidden;"><div style="height:100%;width:${xpPct}%;background:linear-gradient(90deg,#4488ff,#aa66ff);"></div></div><div style="font-size:.4rem;color:#888;text-align:center;">Lv.${c.level||1}</div></div>`:''}</div>`;
  return div;
};

RoF.dom.mkRelicEl = function(r){
  const div=document.createElement('div');div.className=`card ${r.rarity||'bronze'}`;
  const img=CARD_IMG[r.id];
  div.innerHTML=`<div class="card-inner"><div class="card-rarity-tag">${R_LABEL[r.rarity]}</div>
    <div class="card-portrait"><div class="card-icon">${img?`<img src="${img}">`:r.icon}</div></div>
    <div class="card-name">${r.name}</div>
    <div class="card-type">${r.role?ROLE_L[r.role]+' ':''}${r.effect?'비전':'유물'}</div>
    <div class="card-ability">${r.desc}</div></div>`;
  return div;
};

RoF.dom.mkMini = function(c){
  const d=document.createElement('div');d.className=`deck-mini ${c.rarity||'bronze'}`;
  const eq=(c.equips||[]).map(e=>`<span>${e.icon}</span>`).join('');
  d.innerHTML=`${eq?`<div class="dm-equips">${eq}</div>`:''}<div class="dm-icon">${c.icon}</div><div class="dm-name">${c.isHero?'⭐':''}${c.name}</div>${c.level>1?`<span class="dm-lvl">+${c.level-1}</span>`:''}`;
  return d;
};

// 호환성 레이어
window.mkCardEl = RoF.dom.mkCardEl;
window.mkRelicEl = RoF.dom.mkRelicEl;
window.mkMini = RoF.dom.mkMini;
