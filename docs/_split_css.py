"""Phase 1: Split index.html <style> block into 9 CSS files.

Mapping is range-based: (start_line, end_line, target_file) inclusive, 1-indexed.
All @keyframes go to 80_animations.css per plan. Comments and blank lines are dropped;
each output file gets a fresh header. Selector rules preserve original order within
each file so cascade semantics are unchanged.

Verification hook: unassigned lines cause the script to warn so gaps can be caught.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
INDEX = ROOT / "index.html"
CSS_DIR = ROOT / "css"

STYLE_START = 9      # line containing *{margin:0;...}
STYLE_END = 582      # last line of media query block

# (start_line, end_line_inclusive, target_file)
RANGES = [
    # --- RESET ---
    (9, 10, "00_reset.css"),          # *{} + body
    # --- LAYOUT ---
    (11, 12, "20_layout.css"),        # .screen, .screen.active
    # --- TITLE SCREEN ---
    (14, 18, "42_screens.css"),       # #title-screen + pseudo
    (19, 19, "80_animations.css"),    # @keyframes titleLightning
    (20, 20, "42_screens.css"),       # .title-fire
    (21, 21, "80_animations.css"),    # @keyframes titleFire
    (22, 22, "42_screens.css"),       # #title-screen h1
    (23, 23, "80_animations.css"),    # @keyframes titleGlow
    (24, 25, "42_screens.css"),       # subtitle, buttons
    # --- BUTTONS ---
    (28, 35, "30_components.css"),
    # --- AUTH (IDs go to screens, .auth-box classes to components) ---
    (38, 38, "42_screens.css"),       # #login/#signup/#char-select
    (39, 46, "30_components.css"),    # .auth-box, .auth-msg, .auth-back
    # --- CHAR SELECT ---
    (49, 59, "42_screens.css"),
    # --- MAIN MENU / TOWN ---
    (62, 64, "42_screens.css"),       # #menu, .town-sky, .star
    (65, 65, "80_animations.css"),    # twinkle
    (66, 99, "42_screens.css"),       # town hud/container/buildings/npcs refs
    (100, 102, "80_animations.css"),  # walkRight/Left/Up
    (104, 104, "42_screens.css"),     # .town-building.building .tb-icon
    (105, 105, "80_animations.css"),  # buildPulse
    (106, 107, "42_screens.css"),     # footer, menu-deck
    # --- HUD ---
    (110, 113, "30_components.css"),
    # --- UPGRADE SCREEN (screen scaffold) ---
    (116, 119, "42_screens.css"),
    # --- CARD (component) ---
    (123, 134, "30_components.css"),  # .card through .divine .card-inner
    (135, 135, "80_animations.css"),  # divineGlow
    (137, 166, "30_components.css"),  # portrait, rarity tag, name, stats, etc.
    # --- DECK MINI ---
    (169, 180, "30_components.css"),
    # --- CHOICE SCREEN ---
    (183, 191, "42_screens.css"),
    # --- PICK SUB-SCREENS ---
    (194, 197, "42_screens.css"),
    # --- EQUIP SELECT MODAL ---
    (200, 204, "30_components.css"),
    # --- BATTLE SCREEN ---
    (207, 220, "40_battle.css"),      # #battle-screen, tb-field/side/vs
    (221, 221, "80_animations.css"),  # targetPulse
    (222, 254, "40_battle.css"),      # td-slot, tb-actions, ta-*, ta-zoom
    (255, 255, "80_animations.css"),  # cardZoomIn
    (256, 268, "40_battle.css"),      # taz-*, tb-bottom, tb-view-overlay, battle-row
    # --- FORMATION SCREEN ---
    (271, 286, "41_formation.css"),
    # --- BATTLE CARD ---
    (287, 308, "40_battle.css"),      # .battle-card variants
    (309, 309, "80_animations.css"),  # skillPulse
    (310, 319, "40_battle.css"),      # target-select, targeted, skill-btn, hit-anim/flash refs
    (320, 320, "80_animations.css"),  # hitFlashAnim
    (321, 321, "40_battle.css"),      # crit-hit ref
    (322, 322, "80_animations.css"),  # critHitAnim
    # --- ACTION OVERLAY ---
    (325, 336, "40_battle.css"),
    # --- SLASH/MAGIC/HEAL effects ---
    (339, 339, "40_battle.css"),
    (340, 340, "80_animations.css"),  # slashAnim
    (341, 341, "40_battle.css"),
    (342, 342, "80_animations.css"),  # magicAnim
    (343, 343, "40_battle.css"),
    (344, 344, "80_animations.css"),  # healAnim
    (346, 346, "40_battle.css"),      # .battle-card .hit-anim ref
    (347, 347, "80_animations.css"),  # hitShake
    (348, 349, "40_battle.css"),      # damage-number, heal-number
    (350, 350, "80_animations.css"),  # dmgFloat
    # --- BATTLE LOG/CONTROLS ---
    (352, 355, "40_battle.css"),
    # --- REWARD / GAMEOVER ---
    (358, 361, "42_screens.css"),
    (364, 366, "42_screens.css"),
    # --- MODAL + SOUND PANEL ---
    (369, 373, "30_components.css"),
    (376, 382, "30_components.css"),
    # --- UPGRADE EFFECTS (overlay particles) ---
    (385, 385, "42_screens.css"),     # upgrade-flash
    (386, 386, "80_animations.css"),  # upgFlash
    (387, 388, "42_screens.css"),     # particles
    (389, 389, "80_animations.css"),  # upgPart
    (390, 390, "42_screens.css"),
    (391, 391, "80_animations.css"),  # rarBurst
    (392, 392, "42_screens.css"),
    (393, 393, "80_animations.css"),  # upgGlow
    # --- TAVERN CARD FLIP ---
    (396, 398, "42_screens.css"),
    (399, 399, "80_animations.css"),  # cardFlip
    (400, 401, "42_screens.css"),
    (402, 402, "80_animations.css"),  # legendReveal
    (403, 403, "42_screens.css"),
    (404, 404, "80_animations.css"),  # goldReveal
    # --- BATTLE CRIT SHAKE ---
    (407, 407, "40_battle.css"),
    (408, 408, "80_animations.css"),  # screenShake
    (409, 409, "40_battle.css"),
    (410, 410, "80_animations.css"),  # critFlash
    # --- HERO DEATH ---
    (413, 413, "40_battle.css"),
    (414, 414, "80_animations.css"),  # heroDeath
    # --- VICTORY BANNER ---
    (417, 417, "40_battle.css"),
    (418, 418, "80_animations.css"),  # victBanner
    (419, 420, "40_battle.css"),
    (421, 421, "80_animations.css"),  # sparkFall
    # --- LOOT BOXES ---
    (424, 430, "42_screens.css"),
    (431, 431, "80_animations.css"),  # lootOpen
    (432, 432, "42_screens.css"),
    (433, 433, "80_animations.css"),  # lootReveal
    (434, 434, "42_screens.css"),
    # --- NPC SPEECH ---
    (437, 441, "30_components.css"),
    # --- ATTACK ZOOM ---
    (444, 444, "40_battle.css"),
    (445, 445, "80_animations.css"),  # atkDim
    (446, 448, "40_battle.css"),
    (449, 449, "80_animations.css"),  # atkSlideIn
    (450, 450, "80_animations.css"),  # tgtSlideIn
    (451, 461, "40_battle.css"),
    (462, 462, "80_animations.css"),  # vsFlash
    (463, 463, "80_animations.css"),  # fxPop
    (464, 465, "40_battle.css"),
    (466, 466, "80_animations.css"),  # atkCritIn
    # --- SLOW MOTION ---
    (469, 469, "40_battle.css"),
    (470, 470, "80_animations.css"),  # slowmoIn
    # --- MATCHMAKING ---
    (473, 481, "42_screens.css"),
    (482, 482, "80_animations.css"),  # dotPulse
    (483, 483, "42_screens.css"),
    (484, 484, "80_animations.css"),  # matchFlash
    # --- TIMER BAR ---
    (487, 489, "30_components.css"),
    # --- PROLOGUE ---
    (492, 501, "42_screens.css"),
    (502, 502, "80_animations.css"),  # plCinIn
    (503, 503, "80_animations.css"),  # plCinOut
    # --- TUTORIAL ---
    (506, 510, "30_components.css"),
    (511, 511, "80_animations.css"),  # tutPulse
    # --- SCROLLBAR ---
    (513, 513, "00_reset.css"),
    # --- MEDIA QUERIES ---
    (514, 582, "42_screens.css"),
]

# New empty files (no source lines)
EMPTY_FILES = {
    "10_tokens.css": "/* CSS variables (:root). Reserved for future design tokens. */\n:root {\n  /* --gold: #ffd700;   reserved */\n  /* --primary-bg: #080810;  reserved */\n}\n",
    "90_utilities.css": "/* Utility classes. Empty for now — add as needed. */\n",
}

# Load order matches cascade. index.html <link> order.
LOAD_ORDER = [
    "00_reset.css",
    "10_tokens.css",
    "20_layout.css",
    "30_components.css",
    "40_battle.css",
    "41_formation.css",
    "42_screens.css",
    "80_animations.css",
    "90_utilities.css",
]

HEADERS = {
    "00_reset.css": "/* Reset and base element styles. */",
    "10_tokens.css": "/* CSS variables (:root). */",
    "20_layout.css": "/* Screen layout primitives (.screen, .screen.active). */",
    "30_components.css": "/* Reusable UI components: buttons, auth box, HUD, cards, deck-mini, modals, sound panel, npc bar, timer bar, tutorial. */",
    "40_battle.css": "/* Battle screen: turn battle, battle cards, action overlay, effects, attack zoom, slow motion, crit shake, hero death, victory banner. */",
    "41_formation.css": "/* Formation screen. */",
    "42_screens.css": "/* Non-battle screens: title, auth IDs, char-select, town, upgrade, choice, pick, reward, gameover, upgrade effects, tavern, loot, matchmaking, prologue + responsive @media queries. */",
    "80_animations.css": "/* All @keyframes definitions in one place. */",
    "90_utilities.css": "/* Utility classes. */",
}


def main():
    lines = INDEX.read_text(encoding="utf-8").split("\n")

    # Build line -> file map
    line_to_file: dict[int, str] = {}
    for start, end, fname in RANGES:
        for i in range(start, end + 1):
            if i in line_to_file:
                print(f"WARN: line {i} assigned twice ({line_to_file[i]} -> {fname})", file=sys.stderr)
            line_to_file[i] = fname

    # Collect content per file in line order
    file_lines: dict[str, list[str]] = {f: [] for f in LOAD_ORDER}
    unassigned: list[int] = []

    for i in range(STYLE_START, STYLE_END + 1):
        raw = lines[i - 1]
        stripped = raw.strip()
        if not stripped:
            continue
        if stripped.startswith("/*") and stripped.endswith("*/"):
            continue  # drop single-line comments
        if i not in line_to_file:
            unassigned.append(i)
            continue
        file_lines[line_to_file[i]].append(raw)

    if unassigned:
        print(f"WARN: {len(unassigned)} unassigned non-empty lines:", file=sys.stderr)
        for i in unassigned[:20]:
            print(f"  line {i}: {lines[i - 1].strip()[:100]}", file=sys.stderr)
        if len(unassigned) > 20:
            print(f"  ... and {len(unassigned) - 20} more", file=sys.stderr)

    # Write files
    CSS_DIR.mkdir(exist_ok=True)
    for fname in LOAD_ORDER:
        path = CSS_DIR / fname
        content_lines = file_lines[fname]
        if fname in EMPTY_FILES and not content_lines:
            path.write_text(EMPTY_FILES[fname], encoding="utf-8")
            print(f"  {fname}: {len(EMPTY_FILES[fname].splitlines())} lines (placeholder)")
            continue
        header = HEADERS[fname]
        body = "\n".join(content_lines)
        path.write_text(f"{header}\n{body}\n", encoding="utf-8")
        print(f"  {fname}: {len(content_lines)} rules")

    # Report
    total = sum(len(v) for v in file_lines.values())
    print(f"\nTotal rules written: {total}")
    print(f"Source lines in <style>: {STYLE_END - STYLE_START + 1}")
    print(f"Unassigned lines: {len(unassigned)}")


if __name__ == "__main__":
    main()
