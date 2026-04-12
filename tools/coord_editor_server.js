#!/usr/bin/env node
/* coord_editor_server.js — 11_frame_coords.json 시각 편집기 서버
 * 기능:
 *  - 정적 파일 서빙 (game/ 루트 기준)
 *  - POST /save-coords : JSON body 를 11_frame_coords.json 에 저장 + CSS 재생성
 *  - 포트 8765 (python 과 동일, 충돌 피하려고 먼저 kill)
 */
'use strict';
const http = require('http');
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8765;

const MIME = {
  '.html':'text/html; charset=utf-8',
  '.js':  'application/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

function serveStatic(req, res){
  let p = decodeURIComponent(req.url.split('?')[0]);
  if(p === '/') p = '/card_component_preview.html';
  const full = path.join(ROOT, p);
  if(!full.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(full, (err, data) => {
    if(err){ res.writeHead(404); return res.end('not found: ' + p); }
    const mime = MIME[path.extname(full).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control':'no-store' });
    res.end(data);
  });
}

function handleSave(req, res){
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      // 안전성: 구조 검증
      const required = ['bronze','silver','gold','legendary','divine'];
      for(const r of required){
        if(!data[r] || !data[r].slots) throw new Error('missing rarity: '+r);
        for(const s of ['atk','def','spd','hp','nrg']){
          const v = data[r].slots[s];
          if(!v || typeof v.xPct!=='number' || typeof v.yPct!=='number') throw new Error(`bad slot ${r}.${s}`);
        }
      }
      // 저장
      const jsonPath = path.join(ROOT, 'css/11_frame_coords.json');
      const pretty = JSON.stringify(data, null, 2) + '\n';
      fs.writeFileSync(jsonPath, pretty, 'utf8');
      // CSS 재생성
      execSync('node tools/json_to_frame_css.js', { cwd: ROOT });
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ok:true}));
      console.log('[save] JSON saved + CSS regenerated');
    } catch(e) {
      console.error('[save] error:', e.message);
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ok:false, error:e.message}));
    }
  });
}

// ── Layout vars save — 10_tokens.css 의 BEGIN_LAYOUT_VARS 블록 내부만 교체 ──
function handleLayoutVarsSave(req, res){
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const data = JSON.parse(body);  // { '--battle-slot-gap': '6px', ... }
      const filePath = path.join(ROOT, 'css/10_tokens.css');
      let src = fs.readFileSync(filePath, 'utf8');
      let replaced = 0;
      Object.entries(data).forEach(([name, value]) => {
        if(!/^--[\w-]+$/.test(name)) return;  // 안전성
        const v = String(value).replace(/[;\n]/g, '').trim();
        // BEGIN_LAYOUT_VARS 와 END_LAYOUT_VARS 사이의 --name: value; 만 교체
        const re = new RegExp(`(BEGIN_LAYOUT_VARS[\\s\\S]*?)(${name}:\\s*)[^;]+(;[\\s\\S]*?END_LAYOUT_VARS)`);
        const next = src.replace(re, (_m, a, b, c) => a + b + v + c);
        if(next !== src){ src = next; replaced++; }
      });
      fs.writeFileSync(filePath, src, 'utf8');
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ok:true, replaced}));
      console.log(`[layout-vars] saved ${replaced} vars`);
    } catch(e) {
      console.error('[layout-vars] error:', e.message);
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ok:false, error:e.message}));
    }
  });
}

// ── Layout vars load — 10_tokens.css BEGIN_LAYOUT_VARS 블록 파싱 ──
function handleLayoutVarsLoad(req, res){
  try {
    const src = fs.readFileSync(path.join(ROOT, 'css/10_tokens.css'), 'utf8');
    const m = src.match(/BEGIN_LAYOUT_VARS[\s\S]*?END_LAYOUT_VARS/);
    if(!m) throw new Error('LAYOUT_VARS block not found');
    const block = m[0];
    const vars = {};
    const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let mm;
    while((mm = re.exec(block)) !== null){
      vars[mm[1]] = mm[2].trim();
    }
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ok:true, vars}));
  } catch(e){
    res.writeHead(500, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ok:false, error:e.message}));
  }
}

// ── Town layout save — 51_game_town.js 의 BUILDING x/y/w/h 를 surgical 교체 ──
function handleTownSave(req, res){
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const filePath = path.join(ROOT, 'js/51_game_town.js');
      let src = fs.readFileSync(filePath, 'utf8');
      const ids = Object.keys(data);
      let replaced = 0;
      for(const id of ids){
        const v = data[id];
        if(typeof v.x !== 'number' || typeof v.y !== 'number') continue;
        // {id:'castle', ... x:NN,y:NN,w:NN,h:NN,... } 라인에서 x/y/w/h 를 한 번에 치환.
        // 기존 regex (x+y only)
        const reXY = new RegExp(`(\\{id:['"]${id}['"][^}]*?)x:\\d+(?:\\.\\d+)?,y:\\d+(?:\\.\\d+)?(?:,w:\\d+(?:\\.\\d+)?)?(?:,h:\\d+(?:\\.\\d+)?)?`);
        const hasWH = typeof v.w === 'number' && typeof v.h === 'number';
        const replacement = hasWH
          ? `$1x:${v.x},y:${v.y},w:${v.w},h:${v.h}`
          : `$1x:${v.x},y:${v.y}`;
        const next = src.replace(reXY, replacement);
        if(next !== src){ replaced++; src = next; }
        else console.warn('[town] not matched:', id);
      }
      fs.writeFileSync(filePath, src, 'utf8');
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ok:true, replaced, total:ids.length}));
      console.log(`[town] saved ${replaced}/${ids.length} buildings`);
    } catch(e) {
      console.error('[town] error:', e.message);
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ok:false, error:e.message}));
    }
  });
}

// ── Town layout load — 51_game_town.js 에서 BUILDING 배열 파싱 (x/y + optional w/h) ──
function handleTownLoad(req, res){
  try {
    const src = fs.readFileSync(path.join(ROOT, 'js/51_game_town.js'), 'utf8');
    const re = /\{id:['"]([\w]+)['"][^}]*?name:['"]([^'"]+)['"][^}]*?icon:['"]([^'"]+)['"][^}]*?x:(-?\d+(?:\.\d+)?),y:(-?\d+(?:\.\d+)?)(?:,w:(-?\d+(?:\.\d+)?))?(?:,h:(-?\d+(?:\.\d+)?))?/g;
    const buildings = [];
    let m;
    while((m = re.exec(src)) !== null){
      const b = { id: m[1], name: m[2], icon: m[3], x: +m[4], y: +m[5] };
      if(m[6] != null) b.w = +m[6];
      if(m[7] != null) b.h = +m[7];
      buildings.push(b);
    }
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ok:true, buildings}));
  } catch(e){
    res.writeHead(500, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ok:false, error:e.message}));
  }
}

// ── Text overrides — css/text_overrides.json 읽기/쓰기 ──
function handleTextOverridesLoad(req, res){
  try {
    const p = path.join(ROOT, 'css/text_overrides.json');
    const data = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ok:true, overrides: data}));
  } catch(e){
    res.writeHead(500, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ok:false, error:e.message}));
  }
}
function handleTextOverridesSave(req, res){
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const data = JSON.parse(body);  // { selector: text }
      if(!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('body must be a plain object');
      // 안전성: 값은 문자열, 셀렉터는 너무 길지 않게
      for(const k of Object.keys(data)){
        if(typeof data[k] !== 'string') throw new Error(`value for ${k} must be string`);
        if(k.length > 400) throw new Error('selector too long');
      }
      const p = path.join(ROOT, 'css/text_overrides.json');
      fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ok:true, count: Object.keys(data).length}));
      console.log(`[text-overrides] saved ${Object.keys(data).length} entries`);
    } catch(e){
      console.error('[text-overrides] error:', e.message);
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ok:false, error:e.message}));
    }
  });
}

const server = http.createServer((req, res) => {
  if(req.method === 'POST' && req.url === '/save-coords') return handleSave(req, res);
  if(req.method === 'POST' && req.url === '/save-town-layout') return handleTownSave(req, res);
  if(req.method === 'GET'  && req.url === '/load-town-layout') return handleTownLoad(req, res);
  if(req.method === 'POST' && req.url === '/save-layout-vars') return handleLayoutVarsSave(req, res);
  if(req.method === 'GET'  && req.url === '/load-layout-vars') return handleLayoutVarsLoad(req, res);
  if(req.method === 'POST' && req.url === '/save-text-overrides') return handleTextOverridesSave(req, res);
  if(req.method === 'GET'  && req.url === '/load-text-overrides') return handleTextOverridesLoad(req, res);
  if(req.method === 'GET') return serveStatic(req, res);
  res.writeHead(405); res.end();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`coord editor server: http://127.0.0.1:${PORT}/`);
  console.log(`  - preview:   http://127.0.0.1:${PORT}/card_component_preview.html`);
  console.log(`  - editor:    http://127.0.0.1:${PORT}/tools/coord_editor.html`);
});
