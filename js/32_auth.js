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
    this.user=id;this.pendingPw=pw;
    // S4: Supabase Auth 동시 가입 — 실패해도 게임 진행 (오프라인 대비).
    if(Backend && Backend.isReady){
      Backend.signupWithNick(id, pw).then(res => {
        if(res.error) console.warn('[Auth] Supabase signup 실패:', res.error);
      });
    }
    this.showPrologue(id);
  },
  login(){
    const id=document.getElementById('login-id').value.trim(),pw=document.getElementById('login-pw').value,m=document.getElementById('login-msg');
    if(!id||!pw){m.className='auth-msg error';m.textContent='이름과 암호를 입력하세요';return;}
    const db=this.db();
    // 로컬 DB 에 유저 있으면 로컬 즉시 로그인 (동기, 기존 UX). Supabase 동기화는 백그라운드.
    if(db[id]){
      if(db[id].pw!==pw){m.className='auth-msg error';m.textContent='암호가 틀렸습니다';return;}
      m.className='auth-msg success';m.textContent=`영웅이여, 돌아오셨군요!`;
      // 2026-04-27: 자동 로그인 폐기 (사용자 결정) — last_user/last_pw 는 로그인 화면 input prefill 용으로만 보존,
      // rof8_remember 플래그는 더 이상 세팅하지 않음. 매 부팅 시 로그인 화면.
      localStorage.setItem('rof8_last_user',id);localStorage.setItem('rof8_last_pw',pw);
      this.user=id;SFX.init();
      // S4 백그라운드: Supabase 로그인 (또는 자동 signup). 성공 시 saveProgress 동기화.
      if(Backend && Backend.isReady){
        Backend.loginWithNick(id, pw).then(res => {
          if(res.error){ console.warn('[Auth] Supabase sync 실패:', res.error); return; }
          if(db[id] && db[id].save && Backend.saveProgress)
            Backend.saveProgress(db[id].save).catch(()=>{});
        });
      }
      setTimeout(()=>Game.load(db[id].save),300);
      return;
    }
    // 로컬에 없음 — Supabase 에 cloud-only 가입 유저일 수 있음. 비동기 시도.
    if(!(Backend && Backend.isReady)){
      m.className='auth-msg error';m.textContent='그런 이름의 영웅은 없습니다';return;
    }
    m.className='auth-msg';m.textContent='확인 중...';
    Backend.loginWithNick(id, pw).then(async res => {
      if(res.error){
        m.className='auth-msg error';m.textContent='그런 이름의 영웅은 없습니다';return;
      }
      const {save, error:loadErr} = await Backend.loadProgress();
      if(loadErr || !save || !Object.keys(save).length){
        m.className='auth-msg error';m.textContent='세이브가 없습니다';return;
      }
      // Supabase 성공 + save 있음 → 로컬에 백업 후 진입
      const localDb = this.db();
      localDb[id] = {pw, save};
      this.save(localDb);
      m.className='auth-msg success';m.textContent='영웅이여, 돌아오셨군요!';
      // 2026-04-27: 자동 로그인 폐기 — last_user/last_pw 는 input prefill 용 보존만.
      localStorage.setItem('rof8_last_user',id);localStorage.setItem('rof8_last_pw',pw);
      this.user=id;SFX.init();
      setTimeout(()=>Game.load(save),300);
    });
  },
  _selElement:null,_selRole:null,_selGender:'m',
  showCharSel(uid){
    // 2단계 흐름 유지 (원소 → 역할+성별). P6 Cockpit 은 레이아웃 문제로 롤백 (2026-04-21).
    this._selElement=null;this._selRole=null;this._selGender='m';
    this._prologueUid=uid;
    this._showElementScreen();
  },
  // Legacy 호환 (외부 호출/튜토리얼 등)
  charBack(){ this.backToElement(); },
  backToPrologue(){ UI.show('prologue-screen'); },
  backToElement(){
    this._selRole=null;
    this._showElementScreen();
  },

  showPrologue(uid){
    UI.show('prologue-screen');
    // Cinematic: one line at a time, fade in → hold → fade out
    // 2026-04-15 "일곱 번째 자리" 스토리로 교체 — design/concept.md 참조
    const scenes=[
      {text:'창세에, 운명의 여신이\n세계를 직조하며\n일곱 자리를 남겼다.',cls:'pl-normal',hold:2400},
      {text:'여섯 자리는\n원초의 여섯이 차지했다.',cls:'pl-normal',hold:2000},
      {text:'불의 레드드래곤 · 물의 히드라\n땅의 외눈 거인 · 번개의 타이탄\n빛의 대천사 · 어둠의 대악마',cls:'pl-gold',hold:3400},
      {text:'그리고 일곱 번째 자리는\n여신이 비워두었다.',cls:'pl-dim',hold:2400},
      {text:'여신은 조건 하나를 남기고\n깊은 잠에 들었다.',cls:'pl-normal',hold:2400},
      {text:'"오직 필멸자 출신만이\n이 자리에 오를 수 있다."',cls:'pl-bright',hold:2800},
      {text:'여섯은 그 자리를\n두려워한다.\n그들은 자신의 파편을 흘려\n오를 법한 자들을 시험한다.',cls:'pl-normal',hold:3000},
      {text:`${uid},\n여섯의 눈이\n당신에게 꽂혔다.`,cls:'pl-gold',hold:2500},
      {text:'평범한 카드 한 장으로\n시작하여,\n여섯의 시험을 넘어서라.',cls:'pl-bright',hold:2500},
      {text:'당신이 일곱 번째 신이 된다.',cls:'pl-gold',hold:2600},
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

  // ── STEP 1: 원소 선택 (char-element-screen) ──
  _showElementScreen(){
    UI.show('char-element-screen');
    document.getElementById('char-element-preview').innerHTML=`모험자: <strong>${this._prologueUid||this.user}</strong>`;
    const g=document.getElementById('char-element-grid');g.innerHTML='';
    const confirmBtn=document.getElementById('btn-confirm-element');
    confirmBtn.disabled=!this._selElement;
    ELEMENTS.forEach(el=>{
      const d=document.createElement('div');d.className='char-option' + (this._selElement===el?' selected':'');
      d.style.borderColor=ELEM_COLOR[el];
      d.innerHTML=`<div class="co-icon" style="font-size:2.5rem;">${ELEM_ICON[el]}</div><div class="co-name" style="color:${ELEM_COLOR[el]};">${ELEM_L[el]}</div>
        <div class="co-desc" style="font-size:.7rem;">${({fire:'공격과 파괴의 힘',water:'치유와 보호의 힘',lightning:'속도와 관통의 힘',earth:'방어와 인내의 힘',dark:'흡수와 저주의 힘',holy:'신성과 축복의 힘'})[el]}</div>`;
      d.onclick=()=>{
        g.querySelectorAll('.char-option').forEach(c=>c.classList.remove('selected'));
        d.classList.add('selected');
        this._selElement=el;
        confirmBtn.disabled=false;
        SFX.play('click');
      };
      g.appendChild(d);
    });
  },
  confirmElement(){
    if(!this._selElement)return;
    SFX.play('magic');
    this._showHeroScreen();
  },

  // ── STEP 2: 역할/영웅 확정 + 성별 토글 (char-hero-screen) ──
  _renderGenderToggle(){
    const wrap=document.getElementById('hero-gender-toggle');
    if(!wrap) return;
    wrap.innerHTML='';
    [{id:'m',ic:'🧔',lbl:'남성'},{id:'f',ic:'👩',lbl:'여성'}].forEach(o=>{
      const b=document.createElement('button');
      b.type='button';
      b.className='gt-btn'+(this._selGender===o.id?' sel':'');
      b.innerHTML=`<span class="gt-ic">${o.ic}</span><span class="gt-lbl">${o.lbl}</span>`;
      b.onclick=()=>{
        if(this._selGender===o.id) return;
        this._selGender=o.id;
        SFX.play('click');
        // 성별 전환 신호 강화 — grid fade out → 180ms 후 재렌더 → fade in (minor_bugs #3 Option B)
        const grid=document.getElementById('char-hero-grid');
        if(grid){
          grid.classList.add('is-switching');
          setTimeout(()=>{
            this._showHeroScreen();
            const g2=document.getElementById('char-hero-grid');
            if(g2) g2.classList.remove('is-switching');
          },180);
        } else {
          this._showHeroScreen();
        }
      };
      wrap.appendChild(b);
    });
  },
  _showHeroScreen(){
    UI.show('char-hero-screen');
    document.getElementById('char-hero-preview').innerHTML=`모험자: <strong>${this._prologueUid||this.user}</strong>`;
    document.getElementById('char-hero-msg').innerHTML=`<span style="color:${ELEM_COLOR[this._selElement]};">${ELEM_ICON[this._selElement]} ${ELEM_L[this._selElement]}의 신이 당신을 선택했다!</span><br><span style="color:#aaa;font-style:italic;">어떤 방식으로 왕좌에 도전할 것인가...</span>`;
    this._renderGenderToggle();
    const g=document.getElementById('char-hero-grid');g.innerHTML='';
    const confirmBtn=document.getElementById('btn-confirm-hero');
    confirmBtn.disabled=!this._selRole;
    const instances=[];
    HERO_ROLES.forEach(r=>{
      const gender = this._selGender || 'm';
      const u=RoF.Data.createHero({gender, role:r.id, element:this._selElement, skinIndex:0});
      if(!u)return;
      const wrap=document.createElement('div');
      wrap.className='char-option-v2' + (this._selRole===r.id?' selected':'');
      wrap.setAttribute('data-role',r.id);
      const inst=CardComponent.create(u,{mode:'select'});
      instances.push(inst);
      wrap.appendChild(inst.el);
      if(this._selRole===r.id) inst.setSelected(true);
      const path=document.createElement('div');
      path.className='char-role-path';
      path.innerHTML=`<span class="char-role-icon">${r.icon}</span>${r.desc}`;
      wrap.appendChild(path);
      wrap.onclick=()=>{
        instances.forEach(x=>x.setSelected(false));
        g.querySelectorAll('.char-option-v2').forEach(c=>c.classList.remove('selected'));
        wrap.classList.add('selected');
        inst.setSelected(true);
        this._selRole=r.id;
        confirmBtn.disabled=false;
        SFX.play('click');
      };
      g.appendChild(wrap);
    });
  },
  confirmHero(){
    if(!this._selRole||!this._selElement)return;
    SFX.init();
    const gender = this._selGender || 'm';
    const heroBase = RoF.Data.createHero({gender, role:this._selRole, element:this._selElement});
    const hero = Object.assign(heroBase, {
      uid:uid(), name:this.user, heroClass:heroBase.name, isHero:true,
      level:1, equips:[], maxHp:heroBase.hp, xp:0, honor:0, freePoints:0,
      growthPts:{atk:0,hp:0,def:0,spd:0,nrg:0,luck:0,eva:0},
    });
    const companionMap={melee:'herbalist',warrior:'herbalist',ranged:'guard',ranger:'guard',support:'militia'};
    const compId=companionMap[this._selRole]||'militia';
    const compBase=UNITS.find(x=>x.id===compId);
    const COMP_NAMES=['릴리아','카엘','모르간','세피라','톰린','에이다','피오나','가렛','에밀','소린','미라','덱스터','엘라','브룩','다미안','하젤'];
    const compName=COMP_NAMES[Math.floor(Math.random()*COMP_NAMES.length)];
    const companion={...compBase,uid:uid(),name:compName,isCompanion:true,level:1,equips:[],maxHp:compBase.hp,xp:0,honor:0,freePoints:0,growthPts:{atk:0,hp:0,def:0,spd:0,nrg:0,luck:0,eva:0}};
    const titanBase=UNITS.find(x=>x.id==='titan');
    const titan={...titanBase,uid:uid(),isCompanion:true,isTitan:true,level:1,equips:[],maxHp:titanBase.hp,xp:0,honor:0,freePoints:0,growthPts:{atk:0,hp:0,def:0,spd:0,nrg:0,luck:0,eva:0}};
    const sv={round:0,hp:3,maxHp:3,gold:20,xp:0,level:1,honor:0,deck:[hero,companion,titan],relics:[],
      hero:{gender:hero.gender, role:hero._heroRole, element:hero.element, skinIndex:hero.skinIndex},
      bestRound:0,totalWins:0,totalGames:0,leaguePoints:0,buildings:{},tutStep:0,companionName:compName};
    const db=this.db();db[this.user]={pw:this.pendingPw,save:sv};this.save(db);this.pendingPw=null;Game.load(sv);
  },

  // Legacy 호환 (test_run.js, _xct_char_select.js, 이전 튜토리얼 트리거 등)
  confirmChar(){
    // _selRole 이 있으면 hero 확정, 아니면 element 확정
    if(this._selRole&&this._selElement) return this.confirmHero();
    if(this._selElement) return this.confirmElement();
  },
  _showStep1(){ this._showElementScreen(); },
  _showStep2(){ this._showHeroScreen(); },
  // P6 Cockpit 시도 후 롤백 — alias 유지 (이미 연결된 action/autonav 깨지지 않도록)
  _showCreateScreen(){ this._showHeroScreen(); },
  confirmCreate(){ return this.confirmHero(); },
};

// 호환성 레이어
window.Auth = RoF.Auth;
