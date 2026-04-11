"""
Section 07: onclick/oninput → data-action 마이그레이션
index.html 의 인라인 이벤트 핸들러를 data-action 속성으로 교체.
"""

import re

INPUT = 'index.html'
OUTPUT = 'index.html'

with open(INPUT, encoding='utf-8') as f:
    html = f.read()

# ── 1. onclick 단순 치환 (인자 없는 것) ──────────────────────────────────────
SIMPLE = [
    # SFX
    ('onclick="SFX.toggle()"',            'data-action="sfx.toggle"'),
    # UI
    ('onclick="UI.closeModal()"',         'data-action="ui.closeModal"'),
    # Auth
    ('onclick="Auth.login()"',            'data-action="auth.login"'),
    ('onclick="Auth.signup()"',           'data-action="auth.signup"'),
    ('onclick="Auth.endPrologue()"',      'data-action="auth.endPrologue"'),
    ('onclick="Auth.skipPrologue()"',     'data-action="auth.skipPrologue"'),
    ('onclick="Auth.charBack()"',         'data-action="auth.charBack"'),
    ('onclick="Auth.confirmChar()"',      'data-action="auth.confirmChar"'),
    # Game
    ('onclick="Game.logout()"',           'data-action="game.logout"'),
    ('onclick="Game.showTavernUnit()"',   'data-action="game.showTavernUnit"'),
    ('onclick="Game.showTavernHero()"',   'data-action="game.showTavernHero"'),
    ('onclick="Game.refreshTavern()"',    'data-action="game.refreshTavern"'),
    ('onclick="Game.showMenu()"',         'data-action="game.showMenu"'),
    ('onclick="Game.showDeckTab()"',      'data-action="game.showDeckTab"'),
    ('onclick="Game.showCodexTab()"',     'data-action="game.showCodexTab"'),
    ('onclick="Game.showCastleUpgradeTab()"', 'data-action="game.showCastleUpgradeTab"'),
    ('onclick="Game.showCastleQuestTab()"',   'data-action="game.showCastleQuestTab"'),
    ('onclick="Game.saveFormation()"',    'data-action="game.saveFormation"'),
    ('onclick="Game.loadFormation()"',    'data-action="game.loadFormation"'),
    ('onclick="Game.confirmCardSelect()"','data-action="game.confirmCardSelect"'),
    ('onclick="Game.finishPick()"',       'data-action="game.finishPick"'),
    ('onclick="Game.rerollPick()"',       'data-action="game.rerollPick"'),
    ('onclick="Game.afterBattle()"',      'data-action="game.afterBattle"'),
    ('onclick="Game.newRun()"',           'data-action="game.newRun"'),
    # Formation
    ('onclick="Formation.auto()"',        'data-action="formation.auto"'),
    ('onclick="Formation.confirm()"',     'data-action="formation.confirm"'),
    # TurnBattle
    ('onclick="TurnBattle.goBack()"',     'data-action="turnBattle.goBack"'),
    ('onclick="TurnBattle.startCombat()"','data-action="turnBattle.startCombat"'),
]

for old, new in SIMPLE:
    count = html.count(old)
    html = html.replace(old, new)
    print(f'[{count:2d}x] {old[:50]!r}')

# ── 2. onclick with arg: UI.show('screen-id') ────────────────────────────────
# onclick="UI.show('xxx')"  →  data-action="ui.show" data-arg="xxx"
def replace_ui_show(m):
    arg = m.group(1)
    return f'data-action="ui.show" data-arg="{arg}"'

n_before = html.count('onclick="UI.show(')
html = re.sub(r'''onclick="UI\.show\('([^']+)'\)"''', replace_ui_show, html)
n_after = html.count('onclick="UI.show(')
print(f'[{n_before - n_after:2d}x] onclick="UI.show(\'…\')"')

# ── 3. onclick 특수 케이스: classList.remove('active') ───────────────────────
# onclick="document.getElementById('detail-modal').classList.remove('active')"
# → data-dismiss="detail-modal"
DOM_DISMISS = [
    ("onclick=\"document.getElementById('detail-modal').classList.remove('active')\"",
     'data-dismiss="detail-modal"'),
    ("onclick=\"document.getElementById('equip-modal').classList.remove('active')\"",
     'data-dismiss="equip-modal"'),
]
for old, new in DOM_DISMISS:
    count = html.count(old)
    html = html.replace(old, new)
    print(f'[{count:2d}x] {old[:60]!r}')

# ── 4. oninput: 볼륨 슬라이더 ─────────────────────────────────────────────────
old_input = 'oninput="SFX.setVolume(this.value)"'
new_input = 'data-action-input="sfx.setVolume"'
count = html.count(old_input)
html = html.replace(old_input, new_input)
print(f'[{count:2d}x] oninput="SFX.setVolume(this.value)"')

# ── 5. Enter 키: login-pw, signup-pw2 에 data-action-enter 추가 ───────────────
# login-pw
old_lp  = 'id="login-pw" placeholder="암호"'
new_lp  = 'id="login-pw" placeholder="암호" data-action-enter="auth.login"'
count_lp = html.count(old_lp)
html = html.replace(old_lp, new_lp)
print(f'[{count_lp:2d}x] login-pw ← data-action-enter')

# signup-pw2
old_sp2  = 'id="signup-pw2" placeholder="암호 확인"'
new_sp2  = 'id="signup-pw2" placeholder="암호 확인" data-action-enter="auth.signup"'
count_sp2 = html.count(old_sp2)
html = html.replace(old_sp2, new_sp2)
print(f'[{count_sp2:2d}x] signup-pw2 ← data-action-enter')

# ── 6. <script defer src="js/99_bindings.js"> 삽입 (99_bootstrap.js 직전) ───
old_bs = '<script defer src="js/99_bootstrap.js"></script>'
new_bs = '<script defer src="js/99_bindings.js"></script>\n' + old_bs
count_bs = html.count(old_bs)
html = html.replace(old_bs, new_bs)
print(f'[{count_bs:2d}x] 99_bindings.js script 태그 삽입')

# ── 검증 ──────────────────────────────────────────────────────────────────────
remaining_onclick = html.count('onclick=')
remaining_oninput = html.count('oninput=')
print(f'\n남은 onclick={remaining_onclick}, oninput={remaining_oninput}')
if remaining_onclick > 0:
    # 남은 것 출력
    for i, line in enumerate(html.split('\n'), 1):
        if 'onclick=' in line:
            print(f'  ⚠️  잔여 onclick @ 줄 {i}: {line.strip()[:80]}')

with open(OUTPUT, 'w', encoding='utf-8') as f:
    f.write(html)

line_count = html.count('\n') + 1
print(f'\n✅ 저장 완료: {OUTPUT} ({line_count}줄)')
