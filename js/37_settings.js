'use strict';

/* ============================================================
   Realm of Fates — Settings Modal (2026-04-23)
   ============================================================
   - 목적: 사운드 패널과 별개로 "저장하고 종료" + 계정 정보 + 확장 옵션을
     한 곳에 모으는 모달. 메뉴 화면 어디서나 접근 가능.
   - 기획: 대표님 요청 (2026-04-23) — 게임 설정에 저장하고 종료 메뉴
   - 동작: settings.open → 모달 표시, settings.exitWithSave → Game.logout
   - bindings: RoF.Settings 로 등록, 99_bindings.js MODULE_MAP 에 settings 매핑.
   ============================================================ */

(function(){
  const MODAL_ID = 'settings-modal';

  const Settings = {
    open(){
      const m = document.getElementById(MODAL_ID);
      if(!m) return;
      // 계정 정보 주입
      const userEl = m.querySelector('.set-user-name');
      if(userEl){
        const u = (window.Auth && Auth.user) ? Auth.user : '(로그인 안 됨)';
        userEl.textContent = u;
      }
      // BGM 상태 라벨 동기화
      Settings._syncBgmLabel();
      m.classList.add('active');
    },
    close(){
      const m = document.getElementById(MODAL_ID);
      if(m) m.classList.remove('active');
    },
    /** 저장만 — 진행 상태 저장 후 모달 닫고 계속 플레이 */
    saveOnly(){
      if(window.Game && typeof Game.persist === 'function'){
        Game.persist();
      }
      Settings.close();
    },
    /** 로그아웃 — Game.logout (persist + Supabase 세션 종료 + auto-login 정리 + 타이틀 복귀) */
    logout(){
      Settings.close();
      if(window.Game && typeof Game.logout === 'function'){
        Game.logout();
      } else {
        if(window.UI && UI.show) UI.show('title-screen');
      }
    },
    /** (기존 호환) 저장하고 종료 = 로그아웃과 동일 */
    exitWithSave(){ Settings.logout(); },
    /** BGM 토글 — 기존 SFX.toggle 재사용 (상태는 SFX.on 에 저장) */
    toggleBgm(){
      if(window.SFX && typeof SFX.toggle === 'function'){
        SFX.toggle();
        Settings._syncBgmLabel();
      }
    },
    _syncBgmLabel(){
      const btn = document.querySelector('#' + MODAL_ID + ' .set-bgm-btn');
      if(!btn) return;
      const on = !!(window.SFX && SFX.on);
      btn.textContent = on ? '🔊 BGM 끄기' : '🔇 BGM 켜기';
    },
  };

  if(typeof RoF === 'undefined') window.RoF = {};
  RoF.Settings = Settings;
  window.Settings = Settings;  // 호환성
})();
