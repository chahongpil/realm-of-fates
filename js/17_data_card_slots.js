'use strict';

/* ============================================================
   RoF.CardSlots — 카드별 슬롯 좌표 override 로더 + 적용기
   ----------------------------------------------------------------
   배경: 대표님 합성 PNG 는 카드마다 슬롯(HP/NRG/이름표/스탯) 위치가
   다름. 등급 기본값(css/11_frame_coords.css)만으로는 1:1 매칭 불가.
   이 모듈은 data/card_slot_overrides.json 을 비동기 로드해
   카드 DOM 의 CSS 변수를 inline 으로 덮어쓴다.

   사용:
     const inst = RoF.CardComponent.create(unit, opts);
     // (40_cards.js create() 내부에서 자동 호출)

   데이터 포맷 (data/card_slot_overrides.json):
     {
       "overrides": {
         "knight": {
           "slots": {
             "atk": {"xPct": 12.74, "yPct": 35.84},
             "hp":  {"xPct": 84.12, "yPct": 24.73},
             ...
           },
           "boxes": {
             "name": {"xPct": 30, "yPct": 9, "wPct": 39, "hPct": 6},
             ...
           }
         }
       }
     }

   override 없거나 fetch 실패 → 등급 기본값 유지 (조용히 no-op).
   ============================================================ */
(function(){
  const ROOT = (typeof window !== 'undefined') ? window : {};
  ROOT.RoF = ROOT.RoF || {};

  const SLOT_KEYS = ['atk', 'def', 'spd', 'hp', 'nrg'];
  const BOX_KEYS  = ['name', 'tags', 'desc'];
  const SRC = 'data/card_slot_overrides.json';

  const store = { data: null, loaded: false, loading: null };

  function parse(raw){
    try {
      const json = JSON.parse(raw);
      return (json && typeof json.overrides === 'object' && json.overrides) || {};
    } catch(e){
      console.warn('[CardSlots] parse failed:', e);
      return {};
    }
  }

  function load(){
    if(store.loaded) return Promise.resolve(store.data);
    if(store.loading) return store.loading;
    store.loading = fetch(SRC, { cache: 'no-store' })
      .then(r => r.ok ? r.text() : '')
      .then(txt => {
        store.data = txt ? parse(txt) : {};
        store.loaded = true;
        store.loading = null;
        return store.data;
      })
      .catch(err => {
        console.warn('[CardSlots] load failed:', err);
        store.data = {};
        store.loaded = true;
        store.loading = null;
        return store.data;
      });
    return store.loading;
  }

  function applyTo(el, unitId){
    if(!el || !unitId) return false;
    const data = store.data;
    if(!data) return false;
    const ov = data[unitId];
    if(!ov) return false;
    if(ov.slots){
      SLOT_KEYS.forEach(k => {
        const s = ov.slots[k];
        if(!s) return;
        if(typeof s.xPct === 'number') el.style.setProperty(`--gem-${k}-x`, s.xPct + '%');
        if(typeof s.yPct === 'number') el.style.setProperty(`--gem-${k}-y`, s.yPct + '%');
      });
    }
    if(ov.boxes){
      BOX_KEYS.forEach(k => {
        const b = ov.boxes[k];
        if(!b) return;
        if(typeof b.xPct === 'number') el.style.setProperty(`--box-${k}-x`, b.xPct + '%');
        if(typeof b.yPct === 'number') el.style.setProperty(`--box-${k}-y`, b.yPct + '%');
        if(typeof b.wPct === 'number') el.style.setProperty(`--box-${k}-w`, b.wPct + '%');
        if(typeof b.hPct === 'number') el.style.setProperty(`--box-${k}-h`, b.hPct + '%');
      });
    }
    el.setAttribute('data-slots-overridden', '1');
    return true;
  }

  function has(unitId){
    return !!(store.data && store.data[unitId]);
  }

  function all(){
    return store.data || {};
  }

  ROOT.RoF.CardSlots = { load, applyTo, has, all };

  if(typeof document !== 'undefined'){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', () => { load(); });
    } else {
      load();
    }
  }
})();
