// Phase 4 verification: simulate loading 7 game files in Node and verify
// that Object.keys(RoF.Game) matches the Phase 0 manifest.
//
// Mocks browser globals (document, window, localStorage, Auth, SFX, UI,
// UNITS, SKILLS, RELICS, etc.) with no-op stubs — we only need the files
// to *evaluate*, not to actually run.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

// Read expected manifest
const manifestText = fs.readFileSync(path.join(ROOT, 'docs/game_manifest.md'), 'utf-8');
const manifestKeys = manifestText
  .split('\n')
  .filter(l => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(l.trim()))
  .map(l => l.trim())
  .sort();

console.log(`Manifest keys: ${manifestKeys.length}`);

// Sandbox with browser-like stubs
const sandbox = {
  console,
  setTimeout,
  setInterval,
  clearInterval,
  clearTimeout,
  Math,
  Date,
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Promise,
  Error,
  Set,
  Map,
  Symbol,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.addEventListener = () => {};
sandbox.removeEventListener = () => {};

// Minimal document stub
const stubEl = () => ({
  id: '',
  style: new Proxy({}, { set: () => true, get: () => '' }),
  classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
  appendChild: () => {},
  removeChild: () => {},
  remove: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  textContent: '',
  innerHTML: '',
  value: '',
  children: [],
  querySelector: () => stubEl(),
  querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }),
  cloneNode: () => stubEl(),
  offsetWidth: 0,
});
sandbox.document = {
  getElementById: () => stubEl(),
  createElement: () => stubEl(),
  querySelector: () => stubEl(),
  querySelectorAll: () => [],
  body: stubEl(),
  addEventListener: () => {},
};
sandbox.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Stub legacy globals that split files reference
const noop = () => {};
sandbox.Auth = { user: null, db: () => ({}), save: noop };
sandbox.SFX = { play: noop, bgm: noop, vol: 1 };
sandbox.UI = { show: noop };
sandbox.UNITS = [];
sandbox.SKILLS = [];
sandbox.SKILLS_DB = [];
sandbox.RELICS = [];
sandbox.RELICS_DB = [];
sandbox.TRAITS = {};
sandbox.R_LABEL = {};
sandbox.uid = () => 'uid_stub';
sandbox.getCardImg = () => '';
sandbox.getTraits = () => [];
sandbox.applyRelic = noop;
sandbox.applySkillToUnit = noop;
sandbox.wait = () => Promise.resolve();
sandbox.TurnBattle = { start: noop };
sandbox.Formation = { load: noop, save: noop };
sandbox.FX = { initTitle: noop, destroy: noop };
sandbox.DefeatFX = { play: noop, stop: noop };

vm.createContext(sandbox);

// Load 00_namespace.js first (creates RoF)
const files = [
  'js/00_namespace.js',
  'js/50_game_core.js',
  'js/51_game_town.js',
  'js/52_game_tavern.js',
  'js/53_game_deck.js',
  'js/54_game_castle.js',
  'js/55_game_battle.js',
  'js/56_game_effects.js',
];

for (const f of files) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf-8');
  try {
    vm.runInContext(code, sandbox, { filename: f });
    console.log(`[OK] ${f}`);
  } catch (e) {
    console.error(`[FAIL] ${f}:`, e.message);
    process.exit(1);
  }
}

// Verify RoF.Game exists and has expected keys
if (!sandbox.RoF || !sandbox.RoF.Game) {
  console.error('[FAIL] RoF.Game is undefined after load');
  process.exit(1);
}
const actualKeys = Object.keys(sandbox.RoF.Game).sort();
console.log(`\nLoaded RoF.Game keys: ${actualKeys.length}`);

// Diff
const expected = new Set(manifestKeys);
const actual = new Set(actualKeys);
const missing = manifestKeys.filter(k => !actual.has(k));
const extra = actualKeys.filter(k => !expected.has(k));

if (missing.length === 0 && extra.length === 0) {
  console.log('\n✅ PASS: RoF.Game keys exactly match manifest (129 keys)');
  process.exit(0);
} else {
  if (missing.length) {
    console.error(`\n❌ MISSING (${missing.length}):`);
    missing.forEach(k => console.error('  -', k));
  }
  if (extra.length) {
    console.error(`\n⚠️  EXTRA (${extra.length}):`);
    extra.forEach(k => console.error('  +', k));
  }
  process.exit(1);
}
