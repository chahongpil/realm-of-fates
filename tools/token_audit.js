/**
 * token_audit.js — CSS 하드코딩 색/픽셀 탐지 + 토큰 제안
 *
 * 목적: css/10_tokens.css에 정의된 토큰을 단일 진실 원천으로 삼고,
 *       나머지 CSS 파일에 산재한 하드코딩 값을 찾아 이주 진행도 측정.
 *
 * 사용:
 *   node tools/token_audit.js           # 요약 리포트
 *   node tools/token_audit.js --top 20  # 빈도 상위 20개
 *   node tools/token_audit.js --file 31_card_system.css  # 파일별 상세
 *   node tools/token_audit.js --unmapped  # 토큰에 대응 없는 색만
 */
const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, '..', 'css');
const TOKENS_FILE = path.join(CSS_DIR, '10_tokens.css');

const args = process.argv.slice(2);
const flag = (k) => { const i = args.indexOf(k); return i >= 0 ? (args[i + 1] || true) : null; };
const flagTop = flag('--top');
const flagFile = flag('--file');
const flagUnmapped = args.includes('--unmapped');

// ─────────────────────────────────────
// 1. 토큰 파일에서 "값 → 변수명" 맵 구축
// ─────────────────────────────────────
const tokensCss = fs.readFileSync(TOKENS_FILE, 'utf8');
const tokenMap = new Map();  // normalized hex → var name (first match wins)
const tokenVarRe = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
let m;
while ((m = tokenVarRe.exec(tokensCss))) {
  const varName = m[1];
  const value = m[2].trim();
  // 단순 hex만 추적 (var(--xxx), rgba(), env() 등은 제외)
  const hexMatch = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const norm = normalizeHex(value);
    if (!tokenMap.has(norm)) tokenMap.set(norm, varName);
  }
}

function normalizeHex(h) {
  let s = h.toLowerCase().replace('#', '');
  if (s.length === 3) s = s.split('').map(c => c + c).join('');
  return '#' + s;
}

// ─────────────────────────────────────
// 2. 다른 CSS 파일 스캔
// ─────────────────────────────────────
const cssFiles = fs.readdirSync(CSS_DIR)
  .filter(f => f.endsWith('.css') && f !== '10_tokens.css')
  .sort();

const findings = [];  // {file, line, hex, suggestion}
const byColor = new Map();  // hex → count
const byFile = new Map();   // file → count

for (const file of cssFiles) {
  if (flagFile && file !== flagFile) continue;
  const full = path.join(CSS_DIR, file);
  const lines = fs.readFileSync(full, 'utf8').split('\n');
  lines.forEach((ln, i) => {
    // hex color finder (skip url(...) and comments)
    if (/^\s*\/?\*/.test(ln)) return;
    const re = /#([0-9a-f]{3}|[0-9a-f]{6})\b/gi;
    let h;
    while ((h = re.exec(ln))) {
      const norm = normalizeHex(h[0]);
      const suggestion = tokenMap.get(norm) || null;
      findings.push({ file, line: i + 1, hex: norm, suggestion });
      byColor.set(norm, (byColor.get(norm) || 0) + 1);
      byFile.set(file, (byFile.get(file) || 0) + 1);
    }
  });
}

// ─────────────────────────────────────
// 3. 출력
// ─────────────────────────────────────
const total = findings.length;
const mapped = findings.filter(f => f.suggestion).length;
const unmapped = total - mapped;
const uniqueColors = byColor.size;

console.log('═══════════════════════════════════════════════════════');
console.log('  Realm of Fates — CSS Token Audit');
console.log('═══════════════════════════════════════════════════════');
console.log(`토큰 정의:       ${tokenMap.size}개 hex 토큰`);
console.log(`하드코딩 총 발생: ${total}회`);
console.log(`  ↳ 토큰 대응:    ${mapped}회 (${Math.round(mapped / total * 100)}%)`);
console.log(`  ↳ 미대응:       ${unmapped}회 (${Math.round(unmapped / total * 100)}%)`);
console.log(`유니크 색:       ${uniqueColors}가지`);
console.log('');

if (flagUnmapped) {
  console.log('── 토큰 미대응 색 (빈도 순) ──');
  const unmappedByColor = new Map();
  findings.filter(f => !f.suggestion).forEach(f => {
    unmappedByColor.set(f.hex, (unmappedByColor.get(f.hex) || 0) + 1);
  });
  [...unmappedByColor.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .forEach(([hex, cnt]) => console.log(`  ${hex}  × ${cnt}`));
  process.exit(0);
}

if (flagFile) {
  console.log(`── ${flagFile} 상세 ──`);
  findings.forEach(f => {
    const suf = f.suggestion ? `  → var(--${f.suggestion})` : '  (미대응)';
    console.log(`  line ${String(f.line).padStart(4)}  ${f.hex}${suf}`);
  });
  process.exit(0);
}

console.log('── 파일별 발생 ──');
[...byFile.entries()].sort((a, b) => b[1] - a[1])
  .forEach(([f, c]) => console.log(`  ${f.padEnd(24)} ${c}`));
console.log('');

const top = parseInt(flagTop) || 15;
console.log(`── 빈도 상위 ${top}개 색 ──`);
[...byColor.entries()].sort((a, b) => b[1] - a[1]).slice(0, top)
  .forEach(([hex, cnt]) => {
    const suggestion = tokenMap.get(hex);
    const suf = suggestion ? `  → var(--${suggestion})` : '  (토큰 추가 권장)';
    console.log(`  ${hex}  × ${String(cnt).padStart(3)}${suf}`);
  });

console.log('');
console.log('힌트:');
console.log('  --unmapped     : 토큰에 없는 색만 (새 토큰 후보)');
console.log('  --file <name>  : 특정 파일 상세');
console.log('  --top <n>      : 빈도 상위 n개');
