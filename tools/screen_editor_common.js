/* screen_editor_common.js — 슬라이더 기반 레이아웃 변수 편집기 공용 라이브러리
 * 사용: 각 화면 편집기 HTML 이 이 파일을 로드하고 buildEditor(config) 호출.
 *
 * config 예시:
 * {
 *   title: '전투 레이아웃',
 *   previewHtml: '<div class="tb-field">...mock...</div>',
 *   vars: [
 *     { name:'--battle-slot-gap', label:'슬롯 간격', min:0, max:30, step:1, unit:'px' },
 *     { name:'--battle-slot-maxw', label:'슬롯 최대 너비', min:10, max:40, step:1, unit:'%' },
 *     ...
 *   ]
 * }
 */
(function(){
  const LOAD_URL = '/load-layout-vars';
  const SAVE_URL = '/save-layout-vars';

  let loadedVars = {};
  let config = null;

  function el(tag, cls, text){
    const e = document.createElement(tag);
    if(cls) e.className = cls;
    if(text != null) e.textContent = text;
    return e;
  }

  function setStatus(msg, type){
    const s = document.getElementById('se-status');
    s.textContent = msg;
    s.className = type || '';
  }

  // 단위 파싱: "4px" → {num:4, unit:'px'}
  function parseValue(raw){
    const m = String(raw).match(/^(-?\d+(?:\.\d+)?)\s*([a-z%]*)$/i);
    if(!m) return { num: 0, unit: '' };
    return { num: parseFloat(m[1]), unit: m[2] };
  }

  async function loadAll(){
    setStatus('불러오는 중...');
    const r = await fetch(LOAD_URL);
    const j = await r.json();
    if(!j.ok) { setStatus('로드 실패: ' + j.error, 'err'); return; }
    loadedVars = j.vars;
    renderControls();
    applyAll();
    setStatus('불러옴 ✓', 'ok');
  }

  function renderControls(){
    const panel = document.getElementById('se-controls');
    panel.innerHTML = '';
    config.vars.forEach(v => {
      const raw = loadedVars[v.name] || '0';
      const parsed = parseValue(raw);
      const unit = v.unit || parsed.unit;

      const row = el('div', 'se-row');
      const label = el('label', 'se-label');
      label.innerHTML = `<span class="se-name">${v.label}</span><span class="se-code">${v.name}</span>`;
      row.appendChild(label);

      const input = el('input');
      input.type = 'range';
      input.min = v.min;
      input.max = v.max;
      input.step = v.step || 1;
      input.value = parsed.num;
      input.setAttribute('data-var', v.name);
      input.setAttribute('data-unit', unit);

      const num = el('span', 'se-val');
      num.textContent = parsed.num + unit;

      input.addEventListener('input', () => {
        num.textContent = input.value + unit;
        document.documentElement.style.setProperty(v.name, input.value + unit);
      });

      row.appendChild(input);
      row.appendChild(num);
      panel.appendChild(row);
    });
  }

  function applyAll(){
    config.vars.forEach(v => {
      if(loadedVars[v.name]){
        document.documentElement.style.setProperty(v.name, loadedVars[v.name]);
      }
    });
  }

  async function save(){
    setStatus('저장 중...');
    const body = {};
    document.querySelectorAll('#se-controls input[data-var]').forEach(inp => {
      body[inp.getAttribute('data-var')] = inp.value + inp.getAttribute('data-unit');
    });
    try {
      const r = await fetch(SAVE_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if(j.ok) setStatus(`저장 ✓ (${j.replaced} 변수 갱신됨) — 게임 새로고침해서 확인`, 'ok');
      else setStatus('저장 실패: ' + j.error, 'err');
    } catch(e){
      setStatus('저장 실패: ' + e.message, 'err');
    }
  }

  function reset(){
    config.vars.forEach(v => {
      const raw = loadedVars[v.name];
      if(!raw) return;
      const parsed = parseValue(raw);
      const inp = document.querySelector(`#se-controls input[data-var="${v.name}"]`);
      if(inp){
        inp.value = parsed.num;
        inp.dispatchEvent(new Event('input'));
      }
    });
    setStatus('초기값으로 복원', 'ok');
  }

  window.ScreenEditor = {
    build(cfg){
      config = cfg;
      document.title = cfg.title + ' — 화면 편집기';
      document.getElementById('se-title').textContent = cfg.title;
      if(cfg.previewHtml){
        document.getElementById('se-preview').innerHTML = cfg.previewHtml;
      }
      document.getElementById('se-save-btn').addEventListener('click', save);
      document.getElementById('se-reset-btn').addEventListener('click', reset);
      loadAll();
    }
  };
})();
