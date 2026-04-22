'use strict';

/* ============================================================
   Realm of Fates — PHASE 5 Chat (Step 2: world 단일 채널 MVP)
   ============================================================
   - 기획서: game/PHASE5_CHAT_PLAN.md
   - Backend API: RoF.Backend.chat* (js/35_backend.js S3 섹션)
   - Step 2 범위: world 채널 1개 + 기본 전송·수신·뮤트 안내
   - Step 3 에서 3채널 탭 확장, Step 4 에서 카드 공유, Step 5 에서 발언 제한 세부
   ============================================================ */

(function(){

  const PANEL_ID   = 'chat-panel';
  const TOGGLE_ID  = 'chat-toggle';
  const DEFAULT_CHANNEL = 'ch_world';

  const CHANNEL_TITLES = {
    'ch_world': '🌍 운명의 광장',
  };

  const COOLDOWN_MS = 5000;
  const MAX_LEN = 200;
  const HISTORY_LIMIT = 50;

  const Chat = {
    _activeChannel: DEFAULT_CHANNEL,
    _sub: null,                // realtime subscription
    _lastSent: 0,              // 쿨다운 체크용 timestamp
    _lastMsgTime: null,        // gap 복구용 마지막 수신 시각
    _unreadCount: 0,
    _muteCheckInterval: null,

    /** 초기화 — 게임 로드 시 1회 호출 */
    async init(){
      this._bindDOM();
      if(!window.Backend || !Backend.isReady){
        this._showBanner('오프라인 모드 — 채팅 불가', 'error');
        this._setInputDisabled(true);
        return;
      }
      await this._loadAndSubscribe(this._activeChannel);
      // 뮤트 상태 5초마다 점검 (자동 해제 감지)
      this._muteCheckInterval = setInterval(()=> this._refreshMuteStatus(), 5000);
      this._refreshMuteStatus();
    },

    /** 패널 토글 */
    open(){
      const p = document.getElementById(PANEL_ID);
      if(!p) return;
      p.classList.add('active');
      this._unreadCount = 0;
      this._updateBadge();
      // 열릴 때 맨 아래로 스크롤
      const msgs = p.querySelector('.cp-messages');
      if(msgs) msgs.scrollTop = msgs.scrollHeight;
    },
    close(){
      const p = document.getElementById(PANEL_ID);
      if(p) p.classList.remove('active');
    },
    toggle(){
      const p = document.getElementById(PANEL_ID);
      if(!p) return;
      if(p.classList.contains('active')) this.close(); else this.open();
    },

    // ── 내부: DOM 바인딩 ───────────────────────────────
    _bindDOM(){
      const panel = document.getElementById(PANEL_ID);
      const toggle = document.getElementById(TOGGLE_ID);
      if(!panel || !toggle) return;

      toggle.onclick = () => this.toggle();
      panel.querySelector('.cp-close').onclick = () => this.close();

      const input = panel.querySelector('.cp-input');
      const send = panel.querySelector('.cp-send');
      const counter = panel.querySelector('.cp-counter');

      const updateCounter = () => {
        const len = input.value.length;
        counter.textContent = `${len}/${MAX_LEN}`;
        counter.classList.toggle('over', len > MAX_LEN);
        counter.classList.toggle('warn', len > MAX_LEN * 0.9 && len <= MAX_LEN);
        send.disabled = len === 0 || len > MAX_LEN;
      };
      input.addEventListener('input', updateCounter);
      updateCounter();

      send.onclick = () => this._sendMessage();
      input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && !e.shiftKey){
          e.preventDefault();
          this._sendMessage();
        }
      });

      // 채널 제목 초기화
      panel.querySelector('.cp-title').textContent = CHANNEL_TITLES[this._activeChannel];
    },

    // ── 내부: 채널 로드 + 구독 ─────────────────────────
    async _loadAndSubscribe(channel){
      // 기존 구독 해제
      if(this._sub) { this._sub.unsubscribe(); this._sub = null; }

      const panel = document.getElementById(PANEL_ID);
      const msgs = panel.querySelector('.cp-messages');
      msgs.innerHTML = '';
      this._showBanner('불러오는 중...', 'info');

      // 최근 N개 로드
      const {messages, error} = await Backend.chatLoadHistory(channel, HISTORY_LIMIT);
      if(error){
        // DB 테이블 없거나 네트워크 문제 — 입력도 잠가 오해 방지 (ui-inspector 지적)
        this._showBanner(`채팅 불가: ${error}`, 'error');
        this._setInputDisabled(true);
        return;
      }
      this._hideBanner();
      messages.forEach(m => this._renderMessage(m, {skipUnread:true}));
      if(messages.length){
        this._lastMsgTime = messages[messages.length-1].created_at;
      }
      msgs.scrollTop = msgs.scrollHeight;

      // Realtime 구독
      this._sub = Backend.chatSubscribe(channel, (msg) => {
        this._renderMessage(msg);
        this._lastMsgTime = msg.created_at;
      });
    },

    // ── 내부: 메시지 렌더 (id 기반 중복 제거) ─────────
    _renderMessage(msg, opts){
      opts = opts || {};
      const panel = document.getElementById(PANEL_ID);
      const msgs = panel.querySelector('.cp-messages');

      // Dedup: 같은 id 가 이미 DOM 에 있으면 스킵 (optimistic append + realtime 중복 방지)
      if(msg.id && msgs.querySelector(`[data-message-id="${msg.id}"]`)) return;

      const curUser = (window.Backend && Backend.getCurrentUser) ? Backend.getCurrentUser() : null;
      const isSelf = curUser && msg.user_id === curUser.id;

      const el = document.createElement('div');
      el.className = 'cp-msg' + (isSelf ? ' self' : '');
      el.dataset.messageId = msg.id;

      const head = document.createElement('div');
      head.className = 'cp-msg-head';
      const u = document.createElement('span');
      u.className = 'cp-msg-user';
      u.textContent = msg.user_name || '?';
      const lv = document.createElement('span');
      lv.className = 'cp-msg-lv';
      lv.textContent = `Lv${msg.user_level || 1}`;
      const t = document.createElement('span');
      t.className = 'cp-msg-time';
      t.textContent = this._formatTime(msg.created_at);
      head.appendChild(u); head.appendChild(lv); head.appendChild(t);

      const text = document.createElement('div');
      text.className = 'cp-msg-text';
      text.textContent = msg.text;   // textContent 로 XSS 방지

      el.appendChild(head);
      el.appendChild(text);

      // TODO Step 4: attached_card 있으면 CardV4Component 미니 카드 추가

      // 스크롤이 맨 아래 근처일 때만 auto-scroll (과거 메시지 보는 중엔 유지)
      const nearBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 60;
      msgs.appendChild(el);
      if(nearBottom) msgs.scrollTop = msgs.scrollHeight;

      // 패널 닫힘 + 본인 X → unread 카운터 증가
      if(!opts.skipUnread && !panel.classList.contains('active') && !isSelf){
        this._unreadCount++;
        this._updateBadge();
      }
    },

    // ── 내부: 메시지 전송 ─────────────────────────────
    async _sendMessage(){
      const panel = document.getElementById(PANEL_ID);
      const input = panel.querySelector('.cp-input');
      const text = input.value.trim();
      if(!text) return;
      if(text.length > MAX_LEN){
        this._showBanner(`메시지 길이 초과 (${text.length}/${MAX_LEN})`, 'error');
        return;
      }
      // 클라측 쿨다운 (DB RLS 에도 뮤트 체크 있지만 UX 보조)
      const now = Date.now();
      if(now - this._lastSent < COOLDOWN_MS){
        const remaining = Math.ceil((COOLDOWN_MS - (now - this._lastSent))/1000);
        this._showBanner(`${remaining}초 후 다시 전송 가능`, 'info');
        return;
      }

      input.disabled = true;
      const {error, message} = await Backend.chatSend(this._activeChannel, text, null);
      input.disabled = false;
      if(error){
        if(error.includes('mute') || error.includes('not-muted')) {
          this._showBanner('뮤트 상태입니다', 'error');
        } else {
          this._showBanner(`전송 실패: ${error}`, 'error');
        }
        return;
      }
      // Optimistic append — realtime 지연·실패에 관계없이 본인 메시지 즉시 렌더.
      // _renderMessage 내부 dedup 으로 realtime 중복 수신 시 안전.
      if(message) this._renderMessage(message);
      this._lastSent = now;
      input.value = '';
      input.dispatchEvent(new Event('input'));  // counter 갱신
      input.focus();
    },

    // ── 내부: 뮤트 상태 ────────────────────────────────
    async _refreshMuteStatus(){
      if(!window.Backend || !Backend.isReady) return;
      const {muted, secondsRemaining, reason} = await Backend.chatGetMuteStatus();
      const panel = document.getElementById(PANEL_ID);
      const input = panel.querySelector('.cp-input');
      const send = panel.querySelector('.cp-send');
      if(muted){
        const mins = Math.ceil(secondsRemaining / 60);
        const reasonText = reason === 'reports' ? '신고 누적' : (reason === 'flood' ? '도배' : '관리자');
        this._showBanner(`🔇 뮤트 상태 (${reasonText}) — 해제까지 약 ${mins}분`, 'error');
        input.disabled = true;
        send.disabled = true;
      } else {
        // 뮤트 아닌데 banner 가 뮤트 때문이었다면 숨김 — 간단히 info 배너는 유지
        const banner = panel.querySelector('.cp-banner');
        if(banner && !banner.hidden && banner.textContent.includes('뮤트')){
          this._hideBanner();
        }
        if(input.disabled && input.dataset.offline !== '1'){
          input.disabled = false;
        }
      }
    },

    // ── 내부: UI 헬퍼 ─────────────────────────────────
    _showBanner(text, kind){
      const panel = document.getElementById(PANEL_ID);
      if(!panel) return;
      const b = panel.querySelector('.cp-banner');
      b.textContent = text;
      b.className = 'cp-banner' + (kind === 'error' ? ' error' : '');
      b.hidden = false;
    },
    _hideBanner(){
      const panel = document.getElementById(PANEL_ID);
      if(!panel) return;
      const b = panel.querySelector('.cp-banner');
      b.hidden = true;
    },
    _setInputDisabled(disabled){
      const panel = document.getElementById(PANEL_ID);
      if(!panel) return;
      const input = panel.querySelector('.cp-input');
      const send = panel.querySelector('.cp-send');
      input.disabled = disabled;
      send.disabled = disabled;
      if(disabled) input.dataset.offline = '1';
      else delete input.dataset.offline;
    },
    _updateBadge(){
      const toggle = document.getElementById(TOGGLE_ID);
      if(!toggle) return;
      const badge = toggle.querySelector('.cp-badge');
      if(this._unreadCount > 0){
        badge.textContent = this._unreadCount > 99 ? '99+' : String(this._unreadCount);
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    },
    _formatTime(iso){
      try {
        const d = new Date(iso);
        const hh = String(d.getHours()).padStart(2,'0');
        const mm = String(d.getMinutes()).padStart(2,'0');
        return `${hh}:${mm}`;
      } catch(e){ return ''; }
    },
  };

  if(typeof RoF === 'undefined') window.RoF = {};
  RoF.Chat = Chat;

  // Backend init 은 비동기. DOMContentLoaded 후 약간 대기 후 init.
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Chat.init(), 800);
  });

})();
