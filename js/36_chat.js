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
  const DEFAULT_KIND = 'world';

  // 리그 한국어명 (Game.LEAGUES 에서 id 로 매칭)
  const LEAGUE_NAMES = {
    bronze:'브론즈', silver:'실버', gold:'골드', platinum:'플래티넘',
    diamond:'다이아', master:'마스터', divine:'신의 영역'
  };

  const COOLDOWN_MS = 5000;
  const MAX_LEN = 200;
  const HISTORY_LIMIT = 50;

  const Chat = {
    _activeKind: DEFAULT_KIND,   // 'world' | 'league' | 'guild'
    _activeChannel: 'ch_world',  // 실제 channel id — _resolveChannel() 로 갱신
    _sub: null,                  // realtime subscription
    _lastSent: 0,                // 쿨다운 체크용 timestamp
    _lastMsgTime: null,          // gap 복구용 마지막 수신 시각
    _unreadCount: 0,
    _muteCheckInterval: null,

    /** kind → 실제 channel id 해석. save.league / save.guild_id 참조. */
    _resolveChannel(kind){
      const save = (window.Game && Game.leaguePoints != null) ? Game : null;
      const leagueId = (save && save.getLeague) ? (save.getLeague().id || 'bronze') : 'bronze';
      const guildId = (save && save.guild_id) || null;
      if(kind === 'league') return 'ch_league_' + leagueId;
      if(kind === 'guild')  return guildId ? ('ch_guild_' + guildId) : null;
      return 'ch_world';
    },

    /** kind → 헤더 제목 */
    _channelTitle(kind){
      if(kind === 'world')  return '🌍 운명의 광장';
      if(kind === 'league') {
        const lg = (window.Game && Game.getLeague) ? Game.getLeague() : null;
        const name = lg ? (LEAGUE_NAMES[lg.id] || lg.name) : '리그';
        return `🏛 ${name} 모임`;
      }
      if(kind === 'guild')  return '🛡 길드 전당';
      return '채팅';
    },

    /** 초기화 — 게임 로드 시 1회 호출 */
    async init(){
      this._bindDOM();
      if(!window.Backend || !Backend.isReady){
        this._showBanner('오프라인 모드 — 채팅 불가', 'error');
        this._setInputDisabled(true);
        return;
      }
      // Auth 세션 없으면 로그인 대기 상태로. 로그인 완료 시 onAuthChange 가 _loadAndSubscribe 호출.
      const user = Backend.getCurrentUser();
      if(!user){
        this._showBanner('로그인 후 이용 가능', 'info');
        this._setInputDisabled(true);
      } else {
        await this._loadAndSubscribe(this._activeChannel);
      }

      // Auth 변화 구독 — SIGNED_IN: 채팅 활성, SIGNED_OUT: 비활성
      Backend.onAuthChange((event, u) => {
        if(event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && u)){
          this._hideBanner();
          this._setInputDisabled(false);
          this._loadAndSubscribe(this._activeChannel);
          this._refreshMuteStatus();
        } else if(event === 'SIGNED_OUT'){
          if(this._sub){ this._sub.unsubscribe(); this._sub = null; }
          this._showBanner('로그인 후 이용 가능', 'info');
          this._setInputDisabled(true);
        }
      });

      // 뮤트 상태 5초마다 점검 (자동 해제 감지)
      this._muteCheckInterval = setInterval(()=> this._refreshMuteStatus(), 5000);
      if(user) this._refreshMuteStatus();
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
        // 2026-04-27 Step 4b: 텍스트 OR 첨부 카드 둘 중 하나라도 있으면 send 활성화
        send.disabled = (len === 0 && !this._attachedCard) || len > MAX_LEN;
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

      // 2026-04-27 PHASE 5 Step 4b: + 버튼 활성화 + 카드 picker 핸들러.
      const attach = panel.querySelector('.cp-attach');
      if(attach){
        attach.disabled = false;
        attach.title = '카드 공유';
        attach.onclick = () => this._showCardPicker();
      }

      // 채널 제목 초기화
      panel.querySelector('.cp-title').textContent = this._channelTitle(this._activeKind);

      // 탭 클릭 → 채널 전환
      panel.querySelectorAll('.cp-tab').forEach(tab => {
        tab.onclick = () => this._switchKind(tab.dataset.kind);
      });
    },

    /** 탭 전환 (world/league/guild) */
    async _switchKind(kind){
      if(kind === this._activeKind) return;
      this._activeKind = kind;
      const panel = document.getElementById(PANEL_ID);
      panel.querySelectorAll('.cp-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.kind === kind);
      });
      panel.querySelector('.cp-title').textContent = this._channelTitle(kind);

      const channel = this._resolveChannel(kind);
      if(!channel){
        // guild 채널인데 guild_id 없는 경우 — placeholder
        if(this._sub){ this._sub.unsubscribe(); this._sub = null; }
        panel.querySelector('.cp-messages').innerHTML =
          '<div class="cp-msg system">아직 길드에 속해 있지 않습니다.<br>광장이나 리그에서 대화하세요.</div>';
        this._setInputDisabled(true);
        this._hideBanner();
        return;
      }
      this._activeChannel = channel;
      const user = Backend && Backend.getCurrentUser && Backend.getCurrentUser();
      if(user){
        this._setInputDisabled(false);
        await this._loadAndSubscribe(channel);
      } else {
        this._showBanner('로그인 후 이용 가능', 'info');
      }
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
      // 텍스트 비어있으면 (첨부 단독 전송) 텍스트 div 생략
      if(msg.text) el.appendChild(text);

      // 2026-04-27 Step 4c: attached_card 있으면 미니 카드 첨부 (kind:'share') + 클릭 시 풀사이즈 모달
      if(msg.attached_card && typeof msg.attached_card === 'object'){
        const ac = msg.attached_card;
        // attached_card.lv → unit.level 변환 (V4 컴포넌트는 .level 필드 사용)
        const cardData = Object.assign({}, ac, { level: ac.level != null ? ac.level : ac.lv });
        if(RoF.CardV4Component && RoF.CardV4Component.create){
          const inst = RoF.CardV4Component.create(cardData, { kind: 'share' });
          inst.el.addEventListener('click', () => this._showCardDetailModal(cardData));
          el.appendChild(inst.el);
        }
      }

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
      // 2026-04-27 Step 4b: 텍스트 OR 첨부 카드 둘 중 하나라도 있으면 전송 가능 (자랑용 단독 전송)
      if(!text && !this._attachedCard) return;
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
      // 2026-04-27 Step 4b: attached_card 동봉 (없으면 null — 기존 동작과 동일)
      const {error, message} = await Backend.chatSend(this._activeChannel, text, this._attachedCard || null);
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
      // 2026-04-27 Step 4b: 전송 후 첨부 클리어
      this._clearAttachedCard();
      input.focus();
    },

    // ── PHASE 5 Step 4b: 카드 picker + 첨부 state ─────────────────
    /** 내 덱에서 카드 1장 선택 → this._attachedCard 세팅. 동적 overlay. */
    _showCardPicker(){
      const game = (typeof RoF !== 'undefined' && RoF.Game) ? RoF.Game : null;
      if(!game || !Array.isArray(game.deck) || game.deck.length === 0){
        this._showBanner('덱에 공유할 카드가 없습니다', 'info');
        return;
      }
      // 기존 picker 가 떠 있으면 중복 방지
      if(document.getElementById('cp-card-picker')) return;
      const overlay = document.createElement('div');
      overlay.id = 'cp-card-picker';
      overlay.className = 'cp-card-picker';
      overlay.innerHTML = `
        <div class="cp-cp-header">
          <span class="cp-cp-title">공유할 카드 선택</span>
          <button type="button" class="cp-cp-close" title="닫기">✕</button>
        </div>
        <div class="cp-cp-grid"></div>
      `;
      const grid = overlay.querySelector('.cp-cp-grid');
      game.deck.forEach(card => {
        if(!card || !card.id) return;
        const inst = (RoF.CardV4Component && RoF.CardV4Component.create)
          ? RoF.CardV4Component.create(card, { kind: 'share' })
          : null;
        if(!inst) return;
        inst.el.addEventListener('click', () => {
          this._setAttachedCard(card);
          overlay.remove();
        });
        grid.appendChild(inst.el);
      });
      overlay.querySelector('.cp-cp-close').onclick = () => overlay.remove();
      // 바깥 클릭 시 닫기
      overlay.addEventListener('click', (e) => {
        if(e.target === overlay) overlay.remove();
      });
      const panel = document.getElementById(PANEL_ID);
      panel.appendChild(overlay);
    },

    /** 첨부 카드 세팅 + 미리보기 렌더. attached_card row 스키마: {id, rarity, lv, element, ...}.
     *  Step 4c 에서 수신 시 동일 데이터로 mini 카드 재구성하므로 표시에 필요한 필드 모두 포함. */
    _setAttachedCard(card){
      this._attachedCard = {
        id: card.id,
        name: card.name,
        rarity: card.rarity || 'bronze',
        lv: card.level || 1,
        element: card.element || '',
        atk: card.atk, def: card.def, spd: card.spd,
        hp: card.hp, nrg: card.nrg,
        luck: card.luck, eva: card.eva,
        skill: card.skill,
        isHero: !!card.isHero,
      };
      this._renderAttachedPreview();
      this._refreshSendButton();
    },

    _clearAttachedCard(){
      this._attachedCard = null;
      this._renderAttachedPreview();
      this._refreshSendButton();
    },

    /** updateCounter 재실행 트리거 — 첨부 변경 시 send.disabled 동기화 */
    _refreshSendButton(){
      const panel = document.getElementById(PANEL_ID);
      if(!panel) return;
      const input = panel.querySelector('.cp-input');
      if(input) input.dispatchEvent(new Event('input'));
    },

    /** Step 4d: 첨부 미니카드 클릭 시 풀사이즈 V4 카드 + 어두운 배경 modal */
    _showCardDetailModal(card){
      // 중복 방지
      if(document.getElementById('cp-card-detail')) return;
      const overlay = document.createElement('div');
      overlay.id = 'cp-card-detail';
      overlay.className = 'cp-card-detail';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'cp-cd-close';
      close.title = '닫기';
      close.textContent = '✕';
      close.onclick = () => overlay.remove();
      overlay.appendChild(close);
      if(RoF.CardV4Component && RoF.CardV4Component.create){
        const inst = RoF.CardV4Component.create(card, {});
        overlay.appendChild(inst.el);
      }
      overlay.addEventListener('click', (e) => {
        if(e.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);
    },

    /** 입력창 위 첨부 미리보기 띠. 카드 이름 + ✕ 제거 버튼. */
    _renderAttachedPreview(){
      const panel = document.getElementById(PANEL_ID);
      if(!panel) return;
      let prev = panel.querySelector('.cp-attach-preview');
      if(!this._attachedCard){
        if(prev) prev.remove();
        return;
      }
      if(!prev){
        prev = document.createElement('div');
        prev.className = 'cp-attach-preview';
        const inputRow = panel.querySelector('.cp-input-row');
        panel.insertBefore(prev, inputRow);
      }
      const c = this._attachedCard;
      const rLabel = {bronze:'일반', silver:'희귀', gold:'고귀한', legendary:'전설의', divine:'신'}[c.rarity] || c.rarity;
      prev.innerHTML = `
        <span class="cp-ap-icon">📎</span>
        <span class="cp-ap-name">${c.isHero ? '⭐ ' : ''}${c.name || c.id} (${rLabel} Lv${c.lv})</span>
        <button type="button" class="cp-ap-remove" title="첨부 제거">✕</button>
      `;
      prev.querySelector('.cp-ap-remove').onclick = () => this._clearAttachedCard();
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
