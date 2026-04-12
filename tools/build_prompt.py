#!/usr/bin/env python
"""
build_prompt.py — Realm of Fates 카드 일러스트 프롬프트 빌더
사용:
  python tools/build_prompt.py <card_id> [--negative]
  python tools/build_prompt.py h_m_fire
  python tools/build_prompt.py sk_godslayer
  python tools/build_prompt.py rl_wrath
  python tools/build_prompt.py --all-heroes > all.txt
"""
import sys

BASE = ("Dark fantasy card illustration, single character portrait, "
        "chest-up composition centered upper third, "
        "dramatic lighting, stylized digital painting, "
        "1024x1536 portrait ratio, "
        "rich detail, intricate costume, atmospheric background, "
        "vignette darkened edges, NO frame, NO text, NO UI")

NEGATIVE = ("hearthstone, blizzard, warcraft, logo, watermark, text, "
            "multiple characters, full body, wide shot, flat color, "
            "anime, cartoon, 3d render, photo, blurry, low quality")

# 6 elements
ELEM = {
    'fire':      "flaming red and orange palette, volcanic battlefield background, embers and sparks floating, heat waves, character aura: fire",
    'water':     "deep ocean blue and cyan palette, misty coastal cliff background, water droplets and ice crystals, flowing robes, character aura: water",
    'lightning': "electric purple and gold palette, storm cloud sky background, crackling lightning bolts, glowing eyes, character aura: lightning",
    'earth':     "earthy brown and moss green palette, rocky canyon background, rising dust, stone fragments floating, character aura: earth",
    'dark':      "shadowy black and violet palette, cursed forest background at night, dark mist tendrils, eerie purple glow, character aura: shadow",
    'holy':      "ivory and golden palette, cathedral rays of light background, floating golden feathers, divine halo, character aura: holy light",
}

# 3 hero roles (m=melee, r=ranged, s=support)
ROLE = {
    'm': "heavy armored warrior, massive sword or battle axe, heroic strong stance, facial expression determined, chestplate with element motif, metallic details",
    'r': "agile ranger archer, elegant longbow or crossbow drawn, aiming pose with focused eyes, leather and cloth armor, element-infused arrow, quiver visible",
    's': "mystic mage sorcerer, ornate robe with element symbols, casting spell with glowing hands, floating orb or staff, wise but powerful, arcane runes in the air",
}

# Skill cards (key: id, value: short visual desc)
SKILL_DESC = {
    'sk_power':       "glowing red fist punching forward, impact shockwave, raw strength",
    'sk_shield':      "reinforced steel shield with runic engravings, blue defensive aura",
    'sk_heal':        "golden healing light rays, green nature energy, restoration magic",
    'sk_swift':       "wind streaks and motion blur, swift speed burst, white wind trails",
    'sk_tough':       "muscular arm with iron training weights, discipline and endurance",
    'sk_focus':       "glowing third eye with concentric focus rings, mental clarity",
    'sk_rage':        "explosive red fury aura bursting from a screaming warrior silhouette",
    'sk_evasion':     "ghostly afterimages of a dodging ninja, motion blur illusions",
    'sk_energize':    "blue electric energy surging into a mage's hands, lightning infusion",
    'sk_cleave':      "single perfect sword slash leaving a white light trail across darkness",
    'sk_ironwill':    "iron armor with glowing rune core, unbreakable resolve, stoic pose",
    'sk_prayer':      "praying hands wreathed in soft holy light, divine blessing descending",
    'sk_venom':       "dripping green venomous dagger, toxic smoke, serpentine coils",
    'sk_reflex':      "lightning-fast dodging figure with blue reflex trails, sharp reaction",
    'sk_crit_edge':   "sharpening a gleaming blade on whetstone, critical point glowing red",
    'sk_fortress':    "towering stone fortress wall with steel battlements, impenetrable",
    'sk_revive':      "golden phoenix feather and angelic wings, resurrection blessing",
    'sk_bloodlust':   "crimson blood dripping from fanged warrior's blade, vampiric hunger",
    'sk_mirage':      "shimmering desert mirage with ghostly warrior illusions, heat haze",
    'sk_warhorn':     "massive ancient war horn emitting golden shockwave, rally the troops",
    'sk_execute':     "executioner's massive axe raised above a kneeling silhouette, final strike",
    'sk_aura':        "protective golden aura shield surrounding an angelic guardian",
    'sk_berserk':     "raging demon warrior with glowing red eyes, berserker frenzy",
    'sk_transcend':   "third eye opening with cosmic light, transcendent enlightenment",
    'sk_invincible':  "impenetrable golden barrier deflecting massive attacks",
    'sk_godslayer':   "massive blade cleaving through divine light, slaying a god",
    'sk_resurrection':"glowing holy grail chalice with resurrection light, eternal life",
    'sk_shadowstep':  "dark cloaked assassin fading into shadow portal, stealth teleport",
    'sk_dragonheart': "glowing red dragon heart crystal with draconic aura, primal power",
    'sk_handoff':     "two gauntlet hands passing a glowing flame, relay teamwork energy",
}

# Relic descriptions
RELIC_DESC = {
    'rl_banner':   "war banner planted in battlefield, rallying flag",
    'rl_crystal':  "glowing life crystal cluster, healing energy",
    'rl_wall':     "massive stone wall with iron reinforcements",
    'rl_fury':     "burning red amulet with anger sigils",
    'rl_boots':    "winged swift boots with golden trim",
    'rl_cloak':    "misty hooded cloak with shadow tendrils",
    'rl_doom':     "blood-stained doom sword, cursed weapon",
    'rl_luck':     "four-leaf clover charm with golden glow",
    'rl_guard':    "guardian shield with divine inscriptions",
    'rl_wrath':    "lightning storm gauntlet, divine wrath",
    'rl_eternal':  "eternal grail chalice, all-stat blessing",
    'rl_immortal': "immortal armor with celestial runes",
}


def build_hero(card_id):
    """h_m_fire, h_r_water, h_s_lightning 등"""
    parts = card_id.split('_')
    if len(parts) != 3 or parts[0] != 'h':
        return None
    role_key = parts[1]  # m/r/s
    elem_key = parts[2]  # fire/water/...
    if role_key not in ROLE or elem_key not in ELEM:
        return None
    return f"{BASE}, {ROLE[role_key]}, {ELEM[elem_key]}"


def build_skill(card_id):
    if card_id not in SKILL_DESC:
        return None
    return f"{BASE}, {SKILL_DESC[card_id]}, magical fantasy spell card art"


def build_relic(card_id):
    if card_id not in RELIC_DESC:
        return None
    return f"{BASE}, {RELIC_DESC[card_id]}, mystical artifact item card art"


def build(card_id):
    if card_id.startswith('h_'):
        return build_hero(card_id)
    if card_id.startswith('sk_'):
        return build_skill(card_id)
    if card_id.startswith('rl_'):
        return build_relic(card_id)
    return None


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    arg = sys.argv[1]
    show_negative = '--negative' in sys.argv

    if arg == '--all-heroes':
        for r in 'mrs':
            for e in ['fire','water','lightning','earth','dark','holy']:
                cid = f"h_{r}_{e}"
                print(f"### [{cid}]")
                print(build(cid))
                print()
        return

    if arg == '--all-skills':
        for cid in SKILL_DESC:
            print(f"### [{cid}]")
            print(build(cid))
            print()
        return

    p = build(arg)
    if not p:
        print(f"Unknown card id: {arg}", file=sys.stderr)
        sys.exit(1)
    print(p)
    if show_negative:
        print()
        print("--- NEGATIVE ---")
        print(NEGATIVE)


if __name__ == '__main__':
    main()
