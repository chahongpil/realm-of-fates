"""Phase 4: Split Game object into 7 files.

Reads index.html, identifies the `const Game={...}` block, walks each
top-level key (depth==1) with char-by-char scanning to get safe line ranges,
then writes each key's text region into the target file based on KEY_MAP.

Outputs:
  - js/50_game_core.js
  - js/51_game_town.js
  - js/52_game_tavern.js
  - js/53_game_deck.js
  - js/54_game_castle.js
  - js/55_game_battle.js
  - js/56_game_effects.js
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
INDEX = ROOT / "index.html"
JS_DIR = ROOT / "js"

KEY_MAP = {
    # --- 50_game_core ---
    # inline scalars (lines 386~387 of index.html, all grouped via first key `round`)
    "round": "core", "hp": "core", "maxHp": "core", "gold": "core",
    "xp": "core", "level": "core", "honor": "core", "deck": "core",
    "relics": "core", "maxDeck": "core",
    "battleSpeed": "core", "battleRunning": "core", "skipReq": "core",
    "_slowMo": "core", "battleMultiplier": "core",
    # core methods
    "load": "core", "persist": "core", "logout": "core",
    "cardXpNext": "core", "giveCardXp": "core", "giveCardHonor": "core",
    "getHeroLevel": "core", "getActionPoints": "core", "getTotalHonor": "core",
    "checkTutorial": "core",

    # --- 51_game_town ---
    "BUILDINGS": "town", "NPCS": "town",
    "getNpc": "town", "renderNpcBar": "town",
    "getBuildingLv": "town", "initBuildings": "town",
    "showMenu": "town", "buildBuilding": "town", "upgradeBuilding": "town",
    "TUT_STEPS": "town", "showTutorial": "town",
    "tutNext": "town", "tutSkip": "town",
    "showUpgrade": "town", "getRelicSlots": "town",

    # --- 52_game_tavern ---
    "_tavTab": "tavern",
    "showTavern": "tavern", "showTavernUnit": "tavern", "showTavernHero": "tavern",
    "genHeroRecruitCards": "tavern",
    "_generateTavernSlots": "tavern", "_ensureTavernSlots": "tavern",
    "genTavernCards": "tavern", "refreshTavern": "tavern",

    # --- 53_game_deck ---
    "_dvTab": "deck", "showDeckTab": "deck", "showCodexTab": "deck",
    "_codexFilter": "deck", "renderCodex": "deck", "showCodexDetail": "deck",
    "showDeckView": "deck", "showCardDetail": "deck",
    "showRelicDetail": "deck", "equipSkill": "deck",
    "equipOwnedSkill": "deck",  # called from 53_game_deck showDeckView skill-equip click handler

    # --- 54_game_castle ---
    "LEAGUES": "castle", "getLeague": "castle", "getLeagueProgress": "castle",
    "showCastle": "castle", "showCastleUpgradeTab": "castle",
    "showCastleQuestTab": "castle", "showForge": "castle", "showChurch": "castle",
    "showTraining": "castle", "showShop": "castle",

    # --- 55_game_battle ---
    "battleState": "battle",
    "selectedForBattle": "battle", "selectedRelics": "battle",
    "getCommandSlots": "battle", "getUsedSlots": "battle",
    "generateBot": "battle", "showMatchmaking": "battle",
    "startBattleFromMatch": "battle", "startBattle": "battle",
    "_startBattleInner": "battle", "renderCardSelect": "battle",
    "saveFormation": "battle", "loadFormation": "battle",
    "_applyFormation": "battle", "confirmCardSelect": "battle",
    "launchBattle": "battle", "genEnemy": "battle",
    "enemyMirrorDeploy": "battle", "enemyRoundActions": "battle",
    "_enemySingleAction": "battle",
    "_roundTimer": "battle", "_roundTimerLeft": "battle",
    "showRoundChoice": "battle", "_startRoundTimer": "battle",
    "_stopRoundTimer": "battle", "_revealAndFinish": "battle",
    "doRoundChoice": "battle", "showBattleEnd": "battle",
    "equipSkillPermanent": "battle", "equipSkillBattle": "battle",
    "_lastTarget": "battle", "showAction": "battle",
    "log": "battle", "cycleSpeed": "battle",
    "_skillQueue": "battle",
    "_targetMode": "battle", "_targetCallback": "battle", "_playerTarget": "battle",
    "updateSkillBar": "battle", "_manualSkill": "battle",
    "_enterTargetMode": "battle", "_executeSkill": "battle",
    "setPlayerTarget": "battle", "skipBattle": "battle",
    "triggerSlowMo": "battle", "renderBF": "battle",
    "_lootPicked": "battle", "afterBattle": "battle",
    "rerollPick": "battle", "finishPick": "battle",
    "finishRound": "battle", "runBattleRound": "battle",
    "askFormationForNextRound": "battle",
    "newRun": "battle",

    # --- 56_game_effects ---
    "showAtkEffect": "effects", "showDmg": "effects",
    "showHeal": "effects", "showAbilEff": "effects",
    "showGameOver": "effects",
}

FILE_TARGETS = {
    "core":    ("50_game_core.js",    "Game Core (기본 속성 + core 메서드)"),
    "town":    ("51_game_town.js",    "Game Town (마을/건물/NPC/튜토리얼)"),
    "tavern":  ("52_game_tavern.js",  "Game Tavern (술집)"),
    "deck":    ("53_game_deck.js",    "Game Deck (덱 보기/도감/카드 상세)"),
    "castle":  ("54_game_castle.js",  "Game Castle (성/리그/대장간/교회/훈련)"),
    "battle":  ("55_game_battle.js",  "Game Battle (전투 흐름 + 스킬 시스템)"),
    "effects": ("56_game_effects.js", "Game Effects (이펙트 메서드)"),
}


def find_game_block(lines):
    start = None
    for i, line in enumerate(lines):
        if re.match(r"^\s*const\s+Game\s*=\s*\{", line):
            start = i
            break
    if start is None:
        sys.exit("ERROR: const Game={ not found")

    depth = 0
    for i in range(start, len(lines)):
        line = lines[i]
        j = 0
        while j < len(line):
            ch = line[j]
            if ch in ("'", '"', "`"):
                q = ch
                j += 1
                while j < len(line):
                    if line[j] == "\\":
                        j += 2
                        continue
                    if line[j] == q:
                        j += 1
                        break
                    j += 1
                continue
            if ch == "/" and j + 1 < len(line) and line[j + 1] == "/":
                break
            if ch == "/" and j + 1 < len(line) and line[j + 1] == "*":
                e = line.find("*/", j + 2)
                if e == -1:
                    j = len(line)
                else:
                    j = e + 2
                continue
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return start, i
            j += 1
    sys.exit("ERROR: Game block end not found")


def parse_keys(lines, start, end):
    """Return list of (line_index, key_name) ordered by occurrence."""
    depth = 0
    keys = []
    for i in range(start, end + 1):
        line = lines[i]
        j = 0
        while j < len(line):
            ch = line[j]
            if ch in ("'", '"', "`"):
                q = ch
                j += 1
                while j < len(line):
                    if line[j] == "\\":
                        j += 2
                        continue
                    if line[j] == q:
                        j += 1
                        break
                    j += 1
                continue
            if ch == "/" and j + 1 < len(line) and line[j + 1] == "/":
                break
            if ch == "/" and j + 1 < len(line) and line[j + 1] == "*":
                e = line.find("*/", j + 2)
                if e == -1:
                    j = len(line)
                else:
                    j = e + 2
                continue
            if ch == "{":
                depth += 1
                j += 1
                continue
            if ch == "}":
                depth -= 1
                j += 1
                continue
            # At depth 1, look for keys.
            if depth == 1 and (ch.isalpha() or ch == "_" or ch == "$"):
                m = re.match(r"[A-Za-z_$][A-Za-z0-9_$]*", line[j:])
                if m:
                    name = m.group(0)
                    after = j + len(name)
                    k = after
                    while k < len(line) and line[k] in " \t":
                        k += 1
                    if k < len(line) and line[k] in (":", "("):
                        # skip the `async ` keyword case: if name is 'async' and
                        # next token is an identifier, use the identifier.
                        if name == "async":
                            j = after
                            continue
                        keys.append((i, name))
                    j = after
                    continue
            j += 1
    # Sanity: parser should end at depth 0 (closed the outer Game object).
    # Non-zero here usually means a string/template literal edge case fooled
    # the scanner (e.g. nested backticks inside ${...}).
    assert depth == 0, f"parse_keys: depth ended at {depth}, not 0 — scanner drift"
    return keys


def main():
    lines = INDEX.read_text(encoding="utf-8").split("\n")
    game_start, game_end = find_game_block(lines)
    keys = parse_keys(lines, game_start, game_end)

    # Validate KEY_MAP coverage
    key_names = [k for _, k in keys]
    missing = [k for k in key_names if k not in KEY_MAP]
    extra = [k for k in KEY_MAP if k not in key_names]

    if missing:
        print(f"ERROR: {len(missing)} keys in Game block not in KEY_MAP:", file=sys.stderr)
        for k in missing:
            print(f"  - {k}", file=sys.stderr)
        sys.exit(1)
    if extra:
        print(f"ERROR: {len(extra)} keys in KEY_MAP not in Game block:", file=sys.stderr)
        for k in extra:
            print(f"  - {k}", file=sys.stderr)
        sys.exit(1)

    # Assign line ranges to each key. Multi-key lines: first key owns whole line.
    # line_owner[line_num] = key_name (the first key on that line)
    line_owner = {}
    for line_num, name in keys:
        if line_num not in line_owner:
            line_owner[line_num] = name

    # For each "owner" key, compute its line range:
    # start_line = line_num
    # end_line = (next_owner_line - 1) or game_end - 1 (exclude closing brace)
    owner_lines = sorted(line_owner.keys())
    owner_to_range = {}
    for idx, ln in enumerate(owner_lines):
        name = line_owner[ln]
        next_ln = owner_lines[idx + 1] if idx + 1 < len(owner_lines) else game_end
        owner_to_range[name] = (ln, next_ln - 1)

    # Group keys by target file, collect line regions in document order.
    # Since keys on same line share a range, we only emit once per owner.
    buckets = {target: [] for target in FILE_TARGETS}
    # Verify all keys on a shared line map to same target
    for line_num, name in keys:
        owner = line_owner[line_num]
        owner_target = KEY_MAP[owner]
        this_target = KEY_MAP[name]
        if owner_target != this_target:
            print(
                f"ERROR: line {line_num + 1}: key '{name}' (target={this_target}) "
                f"shares line with '{owner}' (target={owner_target})",
                file=sys.stderr,
            )
            sys.exit(1)

    # Emit owners in doc order per bucket
    for owner in [line_owner[ln] for ln in owner_lines]:
        tgt = KEY_MAP[owner]
        s, e = owner_to_range[owner]
        text = "\n".join(lines[s : e + 1])
        buckets[tgt].append((owner, text))

    # Report counts
    print("== Key counts per file ==")
    total = 0
    for tgt, (fname, label) in FILE_TARGETS.items():
        cnt = sum(1 for k in key_names if KEY_MAP[k] == tgt)
        owners = len(buckets[tgt])
        print(f"  {fname:22} {label:45} keys={cnt:3d} owners={owners:3d}")
        total += cnt
    print(f"  TOTAL keys: {total}")

    # Write files
    JS_DIR.mkdir(exist_ok=True)
    for tgt, (fname, label) in FILE_TARGETS.items():
        entries = buckets[tgt]
        all_keys_in_file = [k for k in key_names if KEY_MAP[k] == tgt]
        body_lines = [
            f"// {label}",
            "// Generated by docs/_split_game.py — Phase 4",
            "// DO NOT hand-edit keys — edit in original and re-run splitter if needed.",
            "",
            "RoF.__gameKeys = RoF.__gameKeys || new Set();",
            "(function(keys){",
            "  for (const k of keys) {",
            "    if (RoF.__gameKeys.has(k)) {",
            "      console.error('[Game] 중복 키 감지:', k);",
            "      RoF.__gameKeyError = true;",
            "    }",
            "    RoF.__gameKeys.add(k);",
            "  }",
            "})(" + json.dumps(all_keys_in_file, ensure_ascii=False) + ");",
            "",
            "Object.assign(RoF.Game, {",
        ]

        for owner, text in entries:
            body_lines.append(text)

        body_lines.append("});")
        body_lines.append("")

        # Core file also initializes the namespace
        if tgt == "core":
            body_lines.insert(0, "// NOTE: This file must load before other 5x_game_*.js")
            body_lines.insert(1, "RoF.Game = RoF.Game || {};")
            body_lines.insert(2, "")
            body_lines.append("// Expose for legacy onclick=\"Game.foo()\" bindings in HTML strings.")
            body_lines.append("// Same object identity — subsequent 5x_game_*.js augment via Object.assign.")
            body_lines.append("window.Game = RoF.Game;")

        out_path = JS_DIR / fname
        out_path.write_text("\n".join(body_lines), encoding="utf-8")
        print(f"Wrote {out_path} ({len(entries)} owner-blocks)")


if __name__ == "__main__":
    main()
