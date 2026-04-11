'use strict';

// Phase 3: Auth → RoF.Auth (+ window.Auth 호환)
// v2: 카드 시스템 리뉴얼 — 기존 데이터 호환 안 됨, DB 초기화
// (원래 index.html inline script 상단에서 실행되던 localStorage 버전 체크)
if(localStorage.getItem('rof8_v')!=='9'){localStorage.removeItem('rof8');localStorage.setItem('rof8_v','9');}

// ============ AUTH ============
RoF.Auth={
  user:null,pendingPw:null,
  db(){return JSON.parse(localStorage.getItem('rof8')||'{}');},
  save(db){localStorage.setItem('rof8',JSON.stringify(db));},
  signup(){
    const id=document.getElementById('signup-id').value.trim(),pw=document.getElementById('signup-pw').value,pw2=document.getElementById('signup-pw2').value,m=document.getElementById('signup-msg');
    if(id.length<2||id.length>12){m.className='auth-msg error';m.textContent='이름은 2~12자입니다';return;}
    if(pw.length<4){m.className='auth-msg error';m.textContent='암호는 4자 이상입니다';return;}
    if(pw!==pw2){m.className='auth-msg error';m.textContent='암호가 일치하지 않습니다';return;}
    const db=this.db();if(db[id]){m.className='auth-msg error';m.textContent='이미 존재하는 영웅입니다';return;}
    this.user=id;this.pendingPw=pw;this.showPrologue(id);
  },
  login(){
    const id=document.getElementById('login-id').value.trim(),pw=document.getElementById('login-pw').value,m=document.getElementById('login-msg');
    if(!id||!pw){m.className='auth-msg error';m.textContent='이름과 암호를 입력하세요';return;}
    const db=this.db();if(!db[id]){m.className='auth-msg error';m.textContent='그런 이름의 영웅은 없습니다';return;}
    if(db[id].pw!==pw){m.className='auth-msg error';m.textContent='암호가 틀렸습니다';return;}
    m.className='auth-msg success';m.textContent=`영웅이여, 돌아오셨군요!`;
    // 로그인 정보 기억
    localStorage.setItem('rof8_last_user',id);localStorage.setItem('rof8_last_pw',pw);
    this.user=id;SFX.init();setTimeout(()=>Game.load(db[id].save),300);
  },
  _selElement:null,_selRole:null,_charStep:1,
  showCharSel(uid){
    UI.show('char-select-screen');this._selElement=null;this._selRole=null;this._charStep=1;
    document.getElementById('char-id-preview').innerHTML=`모험자: <strong>${uid}</strong>`;
    document.getElementById('btn-confirm-char').disabled=true;
    this._showStep1();
  },
  charBack(){
    if(this._charStep===2){this._selRole=null;this._showStep1();}
    else{UI.show('prologue-screen');}
  },

  showPrologue(uid){
    UI.show('prologue-screen');
    // Cinematic: one line at a time, fade in → hold → fade out
    const scenes=[
      {text:'태초에 6개의 원소가\n세상을 다스렸다.',cls:'pl-normal',hold:2200},
      {text:'불, 물, 전기, 땅, 암흑, 신성.',cls:'pl-gold',hold:2000},
      {text:'그 위에 군림하는 하나의 왕좌 —\n"운명의 왕좌"',cls:'pl-gold',hold:2500},
      {text:'왕좌에 앉은 자만이\n모든 원소를 지배하는\n절대신이 될 수 있었다.',cls:'pl-dim',hold:2500},
      {text:'하지만 세계의 균형을 위해\n신들은 직접 싸울 수 없었다.',cls:'pl-normal',hold:2500},
      {text:'"오직 필멸자만이\n왕좌에 도전할 자격이 있다."',cls:'pl-bright',hold:2500},
      {text:'각 원소의 신은\n자신의 힘을 나눠줄\n하나의 영웅을 선택했다.',cls:'pl-normal',hold:2500},
      {text:`${uid},\n당신이 그 영웅이다.`,cls:'pl-gold',hold:2500},
      {text:'폐허에서 시작하여\n왕좌를 차지하라.',cls:'pl-bright',hold:2200},
      {text:'당신이 새로운 신이 된다.',cls:'pl-gold',hold:2500},
    ];
    const ct=document.getElementById('prologue-text');ct.innerHTML='';
    document.getElementById('prologue-btns').style.display='none';
    let t=0;const fadeIn=800,fadeOut=600,gap=200;
    scenes.forEach((s,i)=>{
      setTimeout(()=>{
        const el=document.createElement('div');el.className=`pl-line ${s.cls||'pl-normal'}`;
        el.innerHTML=s.text.replace(/\n/g,'<br>');
        ct.appendChild(el);
        // Fade in
        requestAnimationFrame(()=>el.classList.add('pl-show'));
        // Fade out after hold
        setTimeout(()=>{el.classList.remove('pl-show');el.classList.add('pl-hide');},fadeIn+s.hold);
        // Remove after fade out
        setTimeout(()=>el.remove(),fadeIn+s.hold+fadeOut);
      },t);
      t+=fadeIn+s.hold+fadeOut+gap;
    });
    setTimeout(()=>{
      const btn=document.getElementById('prologue-btns');
      btn.style.display='';btn.style.opacity='0';
      btn.style.transition='opacity .8s';
      requestAnimationFrame(()=>btn.style.opacity='1');
    },t);
    this._prologueUid=uid;
  },
  endPrologue(){SFX.play('magic');this.showCharSel(this._prologueUid||this.user);},
  skipPrologue(){this.showCharSel(this._prologueUid||this.user);},
  _showStep1(){
    this._charStep=1;document.getElementById('btn-char-back').style.display='inline-block';
    document.getElementById('char-step-msg').innerHTML='<span style="color:#aaa;font-style:italic;">어떤 신이 당신에게 힘을 내려줄 것인가...</span>';
    document.getElementById('char-select-title').textContent='어떤 신의 축복을 받겠습니까?';
    const g=document.getElementById('char-select-grid');g.innerHTML='';
    document.getElementById('btn-confirm-char').textContent='다음 →';
    document.getElementById('btn-confirm-char').disabled=true;
    ELEMENTS.forEach(el=>{
      const d=document.createElement('div');d.className='char-option';
      d.style.borderColor=ELEM_COLOR[el];
      d.innerHTML=`<div class="co-icon" style="font-size:2.5rem;">${ELEM_ICON[el]}</div><div class="co-name" style="color:${ELEM_COLOR[el]};">${ELEM_L[el]}</div>
        <div class="co-desc" style="font-size:.7rem;">${({fire:'공격과 파괴의 힘',water:'치유와 보호의 힘',lightning:'속도와 관통의 힘',earth:'방어와 인내의 힘',dark:'흡수와 저주의 힘',holy:'신성과 축복의 힘'})[el]}</div>`;
      d.onclick=()=>{g.querySelectorAll('.char-option').forEach(c=>c.classList.remove('selected'));d.classList.add('selected');this._selElement=el;document.getElementById('btn-confirm-char').disabled=false;SFX.play('click');};
      g.appendChild(d);
    });
  },
  _showStep2(){
    this._charStep=2;
    document.getElementById('char-step-msg').innerHTML=`<span style="color:${ELEM_COLOR[this._selElement]};">${ELEM_ICON[this._selElement]} ${ELEM_L[this._selElement]}의 신이 당신을 선택했다!</span><br><span style="color:#aaa;font-style:italic;">어떤 방식으로 왕좌에 도전할 것인가...</span>`;
    document.getElementById('char-select-title').textContent='왕좌를 향한 길을 선택하세요';
    const g=document.getElementById('char-select-grid');g.innerHTML='';
    document.getElementById('btn-confirm-char').textContent='영웅 확정!';
    document.getElementById('btn-confirm-char').disabled=true;
    HERO_ROLES.forEach(r=>{
      const heroId=getHeroId(this._selElement,r.id);
      const u=UNITS.find(x=>x.id===heroId);
      if(!u)return;
      const d=document.createElement('div');d.className='char-option';d.style.width='200px';
      d.innerHTML=`<div class="co-icon" style="font-size:2.5rem;">${r.icon}</div>
        <div class="co-name">${u.name}</div>
        <div class="co-desc">${r.desc}</div>
        <div class="co-stats" style="margin-top:6px;">
          <span class="st-atk">⚔${u.atk}</span><span class="st-hp">♥${u.hp}</span><span class="st-def">🛡${u.def}</span><span class="st-spd">💨${u.spd}</span><span style="color:${ELEM_COLOR[this._selElement]};">⚡${u.nrg}</span>
        </div>
        <div style="font-size:.6rem;color:#aaa;margin-top:4px;">${u.skillDesc}</div>`;
      d.onclick=()=>{g.querySelectorAll('.char-option').forEach(c=>c.classList.remove('selected'));d.classList.add('selected');this._selRole=r.id;document.getElementById('btn-confirm-char').disabled=false;SFX.play('click');};
      g.appendChild(d);
    });
  },
  confirmChar(){
    if(this._charStep===1&&this._selElement){
      SFX.play('magic');this._showStep2();return;
    }
    if(this._charStep===2&&this._selRole&&this._selElement){
      SFX.init();
      const heroId=getHeroId(this._selElement,this._selRole);
      const u=UNITS.find(x=>x.id===heroId);
      if(!u){alert('영웅을 찾을 수 없습니다!');return;}
      const hero={...u,uid:uid(),name:this.user,heroClass:u.name,isHero:true,rarity:'bronze',level:1,equips:[],maxHp:u.hp,xp:0,honor:0,freePoints:0,growthPts:{atk:0,hp:0,def:0,spd:0,nrg:0,luck:0,eva:0}};
      // Companion unit based on hero role
      const companionMap={melee:'herbalist',ranged:'guard',support:'militia'};
      const compId=companionMap[this._selRole]||'militia';
      const compBase=UNITS.find(x=>x.id===compId);
      const COMP_NAMES=['릴리아','카엘','모르간','세피라','톰린','에이다','피오나','가렛','에밀','소린','미라','덱스터','엘라','브룩','다미안','하젤'];
      const compName=COMP_NAMES[Math.floor(Math.random()*COMP_NAMES.length)];
      const companion={...compBase,uid:uid(),name:compName,isCompanion:true,level:1,equips:[],maxHp:compBase.hp,xp:0,honor:0,freePoints:0,growthPts:{atk:0,hp:0,def:0,spd:0,nrg:0,luck:0,eva:0}};
      const sv={round:0,hp:3,maxHp:3,gold:20,xp:0,level:1,honor:0,deck:[hero,companion],relics:[],heroBaseId:u.id,bestRound:0,totalWins:0,totalGames:0,leaguePoints:0,buildings:{},tutStep:0,companionName:compName};
      const db=this.db();db[this.user]={pw:this.pendingPw,save:sv};this.save(db);this.pendingPw=null;Game.load(sv);
    }
  },
};

// 호환성 레이어
window.Auth = RoF.Auth;
