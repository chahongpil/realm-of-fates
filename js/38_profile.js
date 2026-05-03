'use strict';

/* ============================================================
   Realm of Fates — Profile Card Select Modal (2026-05-03)
   ============================================================
   - 목적: 마을 좌상단 프로필 슬롯 = 영웅 카드 default + 보유 카드 중 선택 가능.
   - 트리거: 마을 좌상단 #town-profile 클릭 → Profile.open()
   - 동작:
     - 모달 열기 → 보유 카드 (Game.deck) 그리드 렌더링 → 영웅이 첫 슬롯
     - 카드 클릭 → setProfileCard(uid) → 모달 닫기 → showMenu() 다시 (마을 슬롯 갱신)
   - 데이터: Game.profileCardId (50_game_core.js 의 getProfileCard / setProfileCard)
   - bindings: RoF.Profile 로 등록, 99_bindings.js MODULE_MAP 의 profile 매핑.
   ============================================================ */

(function(){
  const MODAL_ID = 'profile-modal';
  const GRID_ID  = 'profile-grid';

  // 2026-05-03 P1: ESC + 백드롭 클릭으로 닫기 (UX 표준).
  let _escHandler = null;
  let _backdropHandler = null;

  const Profile = {
    open(){
      const m = document.getElementById(MODAL_ID);
      const g = document.getElementById(GRID_ID);
      if(!m || !g) return;
      Profile._renderGrid(g);
      m.classList.add('active');
      // ESC 키 닫기
      _escHandler = (e) => { if(e.key === 'Escape') Profile.close(); };
      document.addEventListener('keydown', _escHandler);
      // 백드롭 클릭 닫기 (모달 박스 자체 클릭은 무시)
      _backdropHandler = (e) => { if(e.target === m) Profile.close(); };
      m.addEventListener('click', _backdropHandler);
    },
    close(){
      const m = document.getElementById(MODAL_ID);
      if(m) m.classList.remove('active');
      if(_escHandler){
        document.removeEventListener('keydown', _escHandler);
        _escHandler = null;
      }
      if(_backdropHandler && m){
        m.removeEventListener('click', _backdropHandler);
        _backdropHandler = null;
      }
    },
    /** 카드 선택 — uid 입력. setProfileCard 호출 후 마을 다시 렌더. */
    select(uid){
      if(!window.Game || typeof Game.setProfileCard !== 'function') return;
      const ok = Game.setProfileCard(uid);
      if(!ok) return;
      Profile.close();
      // 마을 화면이 노출 중이면 즉시 갱신 (다른 화면이면 다음 진입 시 자동 반영)
      if(typeof Game.showMenu === 'function'){
        const onMenu = document.getElementById('menu-screen')?.classList.contains('active');
        if(onMenu) Game.showMenu();
      }
      if(window.SFX && SFX.play) SFX.play('click');
    },

    _renderGrid(g){
      g.innerHTML = '';
      const deck = (window.Game && Array.isArray(Game.deck)) ? Game.deck : [];
      const currentId = (Game && Game.profileCardId) || null;
      const heroFirst = [...deck].sort((a, b) => {
        if(a?.isHero && !b?.isHero) return -1;
        if(!a?.isHero && b?.isHero) return 1;
        return 0;
      });
      heroFirst.forEach(c => {
        if(!c || !c.uid) return;
        const isCurrent = c.isHero ? !currentId : (currentId === c.uid);
        const el = document.createElement('div');
        el.className = 'profile-card-mini' + (isCurrent ? ' is-current' : '') + (c.isHero ? ' is-hero' : '');
        el.setAttribute('data-action', 'profile.select');
        el.setAttribute('data-arg', c.uid);
        const src = (typeof RoF !== 'undefined' && RoF.getCardImg) ? RoF.getCardImg(c) : null;
        const lv = c.level || 1;
        el.innerHTML = `
          <div class="pcm-img"${src ? ` style="background-image:url('${src}');"` : ''}>
            ${!src ? '⭐' : ''}
            ${c.isHero ? '<div class="pcm-hero-badge">영웅</div>' : ''}
            ${isCurrent ? '<div class="pcm-current-badge">✓</div>' : ''}
          </div>
          <div class="pcm-name">${c.name || '?'}</div>
          <div class="pcm-lv">Lv.${lv}</div>
        `;
        g.appendChild(el);
      });
      if(g.childElementCount === 0){
        g.innerHTML = '<div class="profile-empty">보유 중인 카드가 없습니다.</div>';
      }
    },
  };

  if(typeof RoF === 'undefined') window.RoF = {};
  RoF.Profile = Profile;
  window.Profile = Profile;  // 호환성
})();
