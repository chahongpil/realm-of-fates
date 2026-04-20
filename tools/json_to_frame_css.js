/**
 * json_to_frame_css.js — 11_frame_coords.json (수동 측정 진실) → 11_frame_coords.css
 *
 * 전략 전환 2026-04-12:
 *   프레임 PNG마다 보석 레이아웃이 달라 자동 색상 탐지 실패.
 *   JSON에 육안 측정값을 저장하고, 이 스크립트로 CSS만 재생성.
 *   수동 측정 → JSON → CSS → 골든 테스트 순.
 *
 * 사용: node tools/json_to_frame_css.js
 */
const fs = require('fs');
const path = require('path');

const json = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'css', '11_frame_coords.json'), 'utf8'));

let css = `/* 11_frame_coords.css — 자동 생성 (11_frame_coords.json에서)
 * 원천: css/11_frame_coords.json (수동 측정)
 * 재생성: node tools/json_to_frame_css.js
 * 생성일: ${new Date().toISOString().slice(0, 10)}
 */\n\n`;

function emitBlock(selector, data) {
  let block = `${selector}{\n`;
  if (data.slots) {
    for (const [name, v] of Object.entries(data.slots)) {
      block += `  --gem-${name}-x: ${v.xPct.toFixed(2)}%;\n`;
      block += `  --gem-${name}-y: ${v.yPct.toFixed(2)}%;\n`;
    }
  }
  if (data.boxes) {
    for (const [name, v] of Object.entries(data.boxes)) {
      block += `  --box-${name}-x: ${v.xPct.toFixed(2)}%;\n`;
      block += `  --box-${name}-y: ${v.yPct.toFixed(2)}%;\n`;
      block += `  --box-${name}-w: ${v.wPct.toFixed(2)}%;\n`;
      block += `  --box-${name}-h: ${v.hPct.toFixed(2)}%;\n`;
    }
  }
  block += `}\n`;
  return block;
}

for (const [cls, data] of Object.entries(json)) {
  if (cls.startsWith('_')) continue;
  // 등급 default 블록
  css += emitBlock(`.card-v2.${cls}`, data);
  // divine 원소별 override — .card-v2.divine[data-element="fire"] 등
  if (data.elements && typeof data.elements === 'object') {
    for (const [elem, eData] of Object.entries(data.elements)) {
      if (elem.startsWith('_')) continue;
      css += emitBlock(`.card-v2.${cls}[data-element="${elem}"]`, eData);
    }
  }
}

const outPath = path.join(__dirname, '..', 'css', '11_frame_coords.css');
fs.writeFileSync(outPath, css);
console.log(`→ ${outPath}`);
