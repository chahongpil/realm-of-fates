'use strict';

// ============================================================
// Realm of Fates — Backend (S1: Auth + Cloud Save)
// Supabase 래퍼. RoF.Backend 네임스페이스.
// Backend 가 없어도 게임은 localStorage 폴백으로 작동한다.
// ============================================================

(function(){

  // ── 설정 ──────────────────────────────────────────────
  // index.html 에서 <meta> 또는 전역 변수로 주입, 없으면 오프라인
  const SUPABASE_URL  = window.__ROF_SUPABASE_URL  || '';
  const SUPABASE_KEY  = window.__ROF_SUPABASE_KEY  || '';

  let _sb = null;   // supabase client
  let _user = null;  // auth.users row

  const B = {
    isReady: false,
    isOffline: true,

    // ── 초기화 ──────────────────────────────────────────
    async init(){
      if(!SUPABASE_URL || !SUPABASE_KEY){
        console.warn('[Backend] Supabase 설정 없음 → 오프라인 모드');
        return;
      }
      if(typeof supabase === 'undefined' || !supabase.createClient){
        console.warn('[Backend] supabase-js SDK 미로드 → 오프라인 모드');
        return;
      }
      try {
        _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        // 기존 세션 복원
        const {data:{session}} = await _sb.auth.getSession();
        if(session) _user = session.user;
        B.isReady = true;
        B.isOffline = false;
        console.log('[Backend] 연결 완료', _user ? `(유저: ${_user.id.slice(0,8)})` : '(비로그인)');

        // Auth 상태 변화 감시
        _sb.auth.onAuthStateChange((_event, session)=>{
          _user = session?.user || null;
        });
      } catch(e){
        console.error('[Backend] 초기화 실패 →', e.message);
      }
    },

    // ── 인증 ────────────────────────────────────────────

    /** 회원가입 */
    async signup(email, password, nickname){
      if(!B.isReady) return {user:null, error:'offline'};
      const {data, error} = await _sb.auth.signUp({
        email, password,
        options: { data: { nickname } }
      });
      if(error) return {user:null, error: error.message};
      _user = data.user;
      return {user: data.user, error: null};
    },

    /** 로그인 */
    async login(email, password){
      if(!B.isReady) return {user:null, error:'offline'};
      const {data, error} = await _sb.auth.signInWithPassword({email, password});
      if(error) return {user:null, error: error.message};
      _user = data.user;
      return {user: data.user, error: null};
    },

    /** Google OAuth (S1 후반) */
    async loginWithGoogle(){
      if(!B.isReady) return {user:null, error:'offline'};
      const {data, error} = await _sb.auth.signInWithOAuth({provider:'google'});
      if(error) return {user:null, error: error.message};
      return {user: data.user||null, error: null};
    },

    /** 로그아웃 */
    async logout(){
      if(!B.isReady) return {error:'offline'};
      const {error} = await _sb.auth.signOut();
      _user = null;
      return {error: error ? error.message : null};
    },

    /** 현재 유저 */
    getCurrentUser(){
      return _user || null;
    },

    // ── 프로필 ──────────────────────────────────────────

    /** 프로필 조회 */
    async getProfile(){
      if(!B.isReady || !_user) return {profile:null, error:'offline'};
      const {data, error} = await _sb.from('profiles')
        .select('*').eq('id', _user.id).single();
      if(error) return {profile:null, error: error.message};
      return {profile: data, error: null};
    },

    /** 프로필 부분 갱신 */
    async updateProfile(patch){
      if(!B.isReady || !_user) return {error:'offline'};
      const {error} = await _sb.from('profiles')
        .update(patch).eq('id', _user.id);
      return {error: error ? error.message : null};
    },

    // ── 세이브 데이터 ───────────────────────────────────

    /** 진행도 저장 (Game.persist 호출 시) */
    async saveProgress(save){
      if(!B.isReady || !_user) return {error:'offline'};
      const patch = {
        save_data: save,
        total_wins:    save.totalWins    || 0,
        total_games:   save.totalGames   || 0,
        league_points: save.leaguePoints || 0,
        best_round:    save.bestRound    || 0,
      };
      const {error} = await _sb.from('profiles')
        .update(patch).eq('id', _user.id);
      return {error: error ? error.message : null};
    },

    /** 진행도 로드 */
    async loadProgress(){
      if(!B.isReady || !_user) return {save:null, error:'offline'};
      const {data, error} = await _sb.from('profiles')
        .select('save_data').eq('id', _user.id).single();
      if(error) return {save:null, error: error.message};
      return {save: data.save_data, error: null};
    },

    // ── localStorage → Supabase 마이그레이션 ────────────

    /**
     * 첫 Supabase 로그인 시 1회 실행.
     * 기존 localStorage 데이터가 있으면 Supabase 로 이관.
     * @param {string} localNickname - localStorage 의 rof8 키에서 쓰던 닉네임
     */
    async migrateFromLocal(localNickname){
      if(!B.isReady || !_user) return {error:'offline'};
      try {
        const raw = localStorage.getItem('rof8');
        if(!raw) return {error:null}; // 이관할 데이터 없음
        const db = JSON.parse(raw);
        const entry = db[localNickname];
        if(!entry || !entry.save) return {error:null};

        // Supabase 에 이미 save_data 가 있으면 덮어쓰지 않음
        const {profile} = await B.getProfile();
        if(profile && profile.save_data && Object.keys(profile.save_data).length > 0){
          console.log('[Backend] 이미 클라우드 세이브 존재 → 마이그레이션 스킵');
          return {error:null};
        }

        // 이관
        const res = await B.saveProgress(entry.save);
        if(!res.error){
          console.log('[Backend] localStorage → Supabase 마이그레이션 완료');
          // 이관 성공 후 로컬 평문 비밀번호 삭제 (보안)
          delete entry.pw;
          db[localNickname] = entry;
          localStorage.setItem('rof8', JSON.stringify(db));
        }
        return res;
      } catch(e){
        return {error: e.message};
      }
    },
  };

  // ── UI: 클라우드 연결 모달 ──────────────────────────────

  function _$(id){ return document.getElementById(id); }

  /** 클라우드 버튼 상태 갱신 */
  function _updateCloudBtn(){
    const btn = _$('btn-cloud-link');
    if(!btn) return;
    if(!B.isReady){ btn.textContent = '☁️ 오프라인'; btn.disabled = true; return; }
    if(_user){ btn.textContent = '☁️ 연결됨'; btn.style.borderColor = 'var(--success)'; }
    else { btn.textContent = '☁️ 클라우드'; btn.style.borderColor = ''; }
    btn.disabled = false;
  }

  B.showLinkModal = function(){
    const modal = _$('cloud-modal');
    if(!modal) return;
    modal.classList.add('active');
    const form = _$('cloud-form');
    const status = _$('cloud-status');
    const msg = _$('cloud-msg');
    if(msg) msg.textContent = '';

    if(!B.isReady){
      if(status) status.innerHTML = '<span style="color:var(--danger);">서버 연결 안 됨. 오프라인 모드입니다.</span>';
      if(form) form.style.display = 'none';
      return;
    }
    if(_user){
      if(status) status.innerHTML = '<span style="color:var(--success);">✅ 클라우드 연결됨</span><br><span style="color:var(--text-2);font-size:.8rem;">이메일: ' + (_user.email||'') + '</span>';
      if(form) form.style.display = 'none';
    } else {
      if(status) status.innerHTML = '<span style="color:var(--text-2);">이메일을 등록하면 다른 기기에서도<br>진행 상황을 이어갈 수 있습니다.</span>';
      if(form) form.style.display = '';
    }
  };

  B.closeModal = function(){
    const modal = _$('cloud-modal');
    if(modal) modal.classList.remove('active');
  };

  /** 새 이메일 등록 → Supabase Auth 가입 → 로컬 데이터 마이그레이션 */
  B.register = async function(){
    const email = (_$('cloud-email')||{}).value||'';
    const pw = (_$('cloud-pw')||{}).value||'';
    const msg = _$('cloud-msg');
    if(!email || !email.includes('@')){ if(msg){msg.className='auth-msg error';msg.textContent='유효한 이메일을 입력하세요';} return; }
    if(pw.length < 6){ if(msg){msg.className='auth-msg error';msg.textContent='비밀번호는 6자 이상입니다';} return; }

    if(msg){msg.className='auth-msg';msg.textContent='등록 중...';}
    const nickname = (typeof Auth!=='undefined' && Auth.user) ? Auth.user : 'hero';
    const res = await B.signup(email, pw, nickname);
    if(res.error){
      if(msg){msg.className='auth-msg error';msg.textContent=res.error;}
      return;
    }
    // 마이그레이션
    if(Auth && Auth.user) await B.migrateFromLocal(Auth.user);
    _updateCloudBtn();
    if(msg){msg.className='auth-msg success';msg.textContent='클라우드 연결 완료!';}
    setTimeout(()=>B.showLinkModal(), 1000); // 상태 갱신 후 모달 리프레시
  };

  /** 기존 Supabase 계정 로그인 → 클라우드 세이브 로드 */
  B.linkLogin = async function(){
    const email = (_$('cloud-email')||{}).value||'';
    const pw = (_$('cloud-pw')||{}).value||'';
    const msg = _$('cloud-msg');
    if(!email || !pw){ if(msg){msg.className='auth-msg error';msg.textContent='이메일과 비밀번호를 입력하세요';} return; }

    if(msg){msg.className='auth-msg';msg.textContent='연결 중...';}
    const res = await B.login(email, pw);
    if(res.error){
      if(msg){msg.className='auth-msg error';msg.textContent=res.error;}
      return;
    }
    _updateCloudBtn();
    if(msg){msg.className='auth-msg success';msg.textContent='클라우드 연결 완료!';}
    // 클라우드에 세이브가 있으면 로드할지 물어볼 수 있음 (S1에서는 로컬 우선)
    if(Auth && Auth.user) await B.migrateFromLocal(Auth.user);
    setTimeout(()=>B.showLinkModal(), 1000);
  };

  // init 완료 후 버튼 상태 갱신
  const _origInit = B.init;
  B.init = async function(){
    await _origInit.call(B);
    _updateCloudBtn();
  };

  // ── 네임스페이스 등록 ─────────────────────────────────
  if(typeof RoF === 'undefined') window.RoF = {};
  RoF.Backend = B;
  window.Backend = B; // 호환성 레이어

})();
