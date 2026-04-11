'use strict';

// Phase 3: UI → RoF.UI (+ window.UI 호환)
// ============ UI ============
RoF.UI={
  show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');SFX.play('click');},
  modal(t,m,fn){
    document.getElementById('modal-title').textContent=t;
    document.getElementById('modal-msg').textContent=m;
    // Restore default buttons (in case askFormation replaced them)
    const mb=document.querySelector('#modal-overlay .modal-buttons');
    mb.innerHTML='<button class="btn btn-s" id="modal-confirm">확인</button><button class="btn btn-s btn-red" onclick="UI.closeModal()">취소</button>';
    document.getElementById('modal-confirm').onclick=()=>{UI.closeModal();if(fn)fn();};
    if(!fn){
      // No callback = just OK button, no cancel
      mb.innerHTML='<button class="btn btn-s" id="modal-confirm">확인</button>';
      document.getElementById('modal-confirm').onclick=()=>{UI.closeModal();};
    }
    document.getElementById('modal-overlay').classList.add('active');
  },
  closeModal(){document.getElementById('modal-overlay').classList.remove('active');},
};

// 호환성 레이어
window.UI = RoF.UI;
