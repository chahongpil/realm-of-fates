/**
 * extract_frame_gems.js — 프레임 PNG에서 보석 슬롯 픽셀 좌표 자동 추출
 *
 * 목적: .card-v2 좌표를 "사람이 감으로 찍지 말고" PNG 원천에서 직접 산출.
 * 출력: css/11_frame_coords.css (CSS 변수) + JSON 로그
 *
 * 사용: node tools/extract_frame_gems.js
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FRAMES = [
  { cls: 'bronze',    file: 'frame_bronze.png' },
  { cls: 'silver',    file: 'frame_silver.png' },
  { cls: 'gold',      file: 'frame_gold.png' },
  { cls: 'legendary', file: 'frame_legendary.png' },
  { cls: 'divine',    file: 'frame_divine.png' },
];

// 각 보석/아이콘의 예상 검색 영역 + 색상 필터 (정규화된 %)
// 좌측 세로 3보석은 saturated RGB로 확정 탐지
// 우측 HP/NRG는 zone 내 가장 밝은/채도 높은 점(보석 반사광)으로 근사
const SLOTS = [
  { name: 'atk', zone: { x: [0.02, 0.22], y: [0.18, 0.36] }, hue: 'red' },
  { name: 'def', zone: { x: [0.02, 0.22], y: [0.30, 0.48] }, hue: 'blue' },
  { name: 'spd', zone: { x: [0.02, 0.22], y: [0.42, 0.60] }, hue: 'green' },
  { name: 'hp',  zone: { x: [0.72, 0.98], y: [0.04, 0.22] }, hue: 'saturated' },
  { name: 'nrg', zone: { x: [0.72, 0.98], y: [0.66, 0.88] }, hue: 'saturated' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 검색 함수를 페이지 스코프로 주입
  await page.setContent(`<canvas id="c"></canvas>`);

  const results = {};

  for (const frame of FRAMES) {
    const abs = path.join(__dirname, '..', 'img', frame.file);
    const buf = fs.readFileSync(abs);
    const b64 = buf.toString('base64');

    const out = await page.evaluate(
      async ({ b64, slots }) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + b64;
        await new Promise(r => (img.onload = r));
        const c = document.getElementById('c');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        const W = c.width, H = c.height;

        function score(r, g, b, a, hue) {
          if (a < 200) return 0;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          // 색상별 점수 — "이 픽셀이 이 hue일 확률"
          if (hue === 'red') {
            if (r < 100 || r < g * 1.4 || r < b * 1.4) return 0;
            return sat * (r / 255) * (r - Math.max(g, b)) / 255;
          }
          if (hue === 'blue') {
            if (b < 100 || b < r * 1.3) return 0;
            return sat * (b / 255) * (b - Math.max(r, g)) / 255;
          }
          if (hue === 'green') {
            if (g < 100 || g < r * 1.3 || g < b * 1.1) return 0;
            return sat * (g / 255) * (g - Math.max(r, b)) / 255;
          }
          if (hue === 'saturated') return sat > 0.4 && max > 120 ? sat * (max / 255) : 0;
          return 0;
        }

        const result = {};
        for (const s of slots) {
          const [x0, x1] = s.zone.x.map(v => Math.floor(v * W));
          const [y0, y1] = s.zone.y.map(v => Math.floor(v * H));

          // Pass 1: score 행렬 구축
          const scores = new Float32Array((x1 - x0) * (y1 - y0));
          let maxScore = 0, maxX = -1, maxY = -1;
          for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
              const i = (y * W + x) * 4;
              const sc = score(data[i], data[i + 1], data[i + 2], data[i + 3], s.hue);
              scores[(y - y0) * (x1 - x0) + (x - x0)] = sc;
              if (sc > maxScore) { maxScore = sc; maxX = x; maxY = y; }
            }
          }

          if (maxScore < 0.05 || maxX < 0) {
            result[s.name] = {
              xPct: ((x0 + x1) / 2 / W) * 100,
              yPct: ((y0 + y1) / 2 / H) * 100,
              maxScore, fallback: true,
            };
            continue;
          }

          // Pass 2: peak 주변 반경 내 score 기반 가중 평균 (sub-pixel center)
          const R = Math.floor(Math.min(x1 - x0, y1 - y0) / 6);  // 반경 = zone의 1/6
          let sumX = 0, sumY = 0, sumW = 0;
          for (let y = Math.max(y0, maxY - R); y < Math.min(y1, maxY + R); y++) {
            for (let x = Math.max(x0, maxX - R); x < Math.min(x1, maxX + R); x++) {
              const w = scores[(y - y0) * (x1 - x0) + (x - x0)];
              if (w <= 0) continue;
              sumX += x * w; sumY += y * w; sumW += w;
            }
          }
          const cx = sumW > 0 ? sumX / sumW : maxX;
          const cy = sumW > 0 ? sumY / sumW : maxY;

          result[s.name] = {
            xPct: (cx / W) * 100,
            yPct: (cy / H) * 100,
            maxScore, fallback: false,
          };
        }
        return { W, H, slots: result };
      },
      { b64, slots: SLOTS }
    );

    results[frame.cls] = out;
    console.log(`${frame.file}  ${out.W}×${out.H}`);
    for (const [name, v] of Object.entries(out.slots)) {
      const mark = v.fallback ? '⚠️ fb' : '✓';
      console.log(`  ${name.padEnd(4)} x=${v.xPct.toFixed(1)}% y=${v.yPct.toFixed(1)}%  score=${v.maxScore.toFixed(3)} ${mark}`);
    }

    // 디버그 오버레이 PNG 저장 — 추출 점을 원본 위에 그려 시각 검증
    const debugB64 = await page.evaluate(
      ({ b64, slots }) => new Promise(async (resolve) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + b64;
        await new Promise(r => (img.onload = r));
        const c = document.getElementById('c');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const colors = { atk:'#ff3030', def:'#3080ff', spd:'#30ff80', hp:'#ffee00', nrg:'#ff00ff' };
        for (const [name, v] of Object.entries(slots)) {
          const cx = (v.xPct / 100) * img.width;
          const cy = (v.yPct / 100) * img.height;
          ctx.beginPath();
          ctx.arc(cx, cy, 28, 0, Math.PI * 2);
          ctx.strokeStyle = colors[name] || '#fff';
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fillStyle = colors[name] || '#fff';
          ctx.fill();
          ctx.font = 'bold 32px sans-serif';
          ctx.fillStyle = '#fff';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 4;
          ctx.strokeText(name.toUpperCase(), cx + 34, cy + 10);
          ctx.fillText(name.toUpperCase(), cx + 34, cy + 10);
        }
        resolve(c.toDataURL('image/png').split(',')[1]);
      }),
      { b64, slots: out.slots }
    );
    const debugDir = path.join(__dirname, '..', 'shots', 'frame-debug');
    if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
    fs.writeFileSync(path.join(debugDir, frame.cls + '.png'), Buffer.from(debugB64, 'base64'));
  }

  await browser.close();

  // CSS 변수 출력
  let css = `/* 11_frame_coords.css — 자동 생성, 수정 금지
 * 원천: img/frame_*.png
 * 재생성: node tools/extract_frame_gems.js
 * 업데이트: ${new Date().toISOString().slice(0, 10)}
 */\n\n`;

  for (const [cls, data] of Object.entries(results)) {
    css += `.card-v2.${cls}{\n`;
    for (const [name, v] of Object.entries(data.slots)) {
      css += `  --gem-${name}-x: ${v.xPct.toFixed(2)}%;\n`;
      css += `  --gem-${name}-y: ${v.yPct.toFixed(2)}%;\n`;
    }
    css += `}\n`;
  }

  const outPath = path.join(__dirname, '..', 'css', '11_frame_coords.css');
  fs.writeFileSync(outPath, css);
  console.log(`\n→ ${outPath}`);

  // JSON 로그 (골든 테스트용)
  const jsonPath = path.join(__dirname, '..', 'css', '11_frame_coords.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`→ ${jsonPath}`);
})();
