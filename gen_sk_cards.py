"""
gen_sk_cards.py — SKILLS_DB 30개 스킬 카드 전용 일러스트 생성
출력: img/{sk_id}.png (512x512)
실행: python gen_sk_cards.py
"""
import torch
from diffusers import StableDiffusionPipeline
import os, time

CACHE = os.path.expanduser("~/.cache/sd/DreamShaper_8_pruned.safetensors")
if not os.path.exists(CACHE):
    CACHE = os.path.expanduser("~/.cache/sd/v1-5-pruned-emaonly.safetensors")

print(f"Loading model: {os.path.basename(CACHE)}")
pipe = StableDiffusionPipeline.from_single_file(CACHE, torch_dtype=torch.float16, safety_checker=None)
pipe = pipe.to("cuda")
pipe.enable_attention_slicing()

BASE = "fantasy card art, dark gothic style, dramatic lighting, stylized illustration, masterpiece, intricate detail, on dark stone background"

# SKILLS_DB 30개 — id: (한국어명, 등급, 프롬프트 핵심 묘사)
skills = {
    # BRONZE (6)
    "sk_power":      ("강타",       "bronze",    "glowing red fist punching forward, impact shockwave, raw strength"),
    "sk_shield":     ("강화방패",   "bronze",    "reinforced steel shield with runic engravings, blue defensive aura"),
    "sk_heal":       ("치유의빛",   "bronze",    "golden healing light rays, green nature energy, restoration magic"),
    "sk_swift":      ("질풍",       "bronze",    "wind streaks and motion blur, swift speed burst, white wind trails"),
    "sk_tough":      ("단련",       "bronze",    "muscular arm with iron training weights, discipline and endurance"),
    "sk_focus":      ("집중",       "bronze",    "glowing third eye with concentric focus rings, mental clarity"),
    # SILVER (8)
    "sk_rage":       ("분노폭발",   "silver",    "explosive red fury aura bursting from a screaming warrior silhouette"),
    "sk_evasion":    ("잔상술",     "silver",    "ghostly afterimages of a dodging ninja, motion blur illusions"),
    "sk_energize":   ("활력충전",   "silver",    "blue electric energy surging into a mage's hands, lightning infusion"),
    "sk_cleave":     ("일섬",       "silver",    "single perfect sword slash leaving a white light trail across darkness"),
    "sk_ironwill":   ("불굴",       "silver",    "iron armor with glowing rune core, unbreakable resolve, stoic pose"),
    "sk_prayer":     ("기도",       "silver",    "praying hands wreathed in soft holy light, divine blessing descending"),
    "sk_venom":      ("맹독",       "silver",    "dripping green venomous dagger, toxic smoke, serpentine coils"),
    "sk_reflex":     ("반사신경",   "silver",    "lightning-fast dodging figure with blue reflex trails, sharp reaction"),
    # GOLD (8)
    "sk_crit_edge":  ("급소연마",   "gold",      "sharpening a gleaming blade on whetstone, critical point glowing red"),
    "sk_fortress":   ("철벽",       "gold",      "towering stone fortress wall with steel battlements, impenetrable"),
    "sk_revive":     ("부활축복",   "gold",      "golden phoenix feather and angelic wings, resurrection blessing"),
    "sk_bloodlust":  ("피의갈증",   "gold",      "crimson blood dripping from fanged warrior's blade, vampiric hunger"),
    "sk_mirage":     ("신기루",     "gold",      "shimmering desert mirage with ghostly warrior illusions, heat haze"),
    "sk_warhorn":    ("전쟁의나팔", "gold",      "massive ancient war horn emitting golden shockwave, rally the troops"),
    "sk_execute":    ("처형",       "gold",      "executioner's massive axe raised above a kneeling silhouette, final strike"),
    "sk_aura":       ("수호오라",   "gold",      "protective golden aura shield surrounding an angelic guardian"),
    # LEGENDARY (7)
    "sk_berserk":    ("광폭화",     "legendary", "raging demon warrior with glowing red eyes, berserker frenzy, chains breaking"),
    "sk_transcend":  ("초월",       "legendary", "third eye opening with cosmic light, transcendent enlightenment, galaxy swirl"),
    "sk_invincible": ("무적",       "legendary", "impenetrable golden barrier deflecting massive attacks, absolute invulnerability"),
    "sk_godslayer":  ("신살",       "legendary", "massive blade cleaving through divine light, slaying a god, cosmic devastation"),
    "sk_resurrection":("부활의성배","legendary", "glowing holy grail chalice with resurrection light, eternal life"),
    "sk_shadowstep": ("그림자걸음", "legendary", "dark cloaked assassin fading into shadow portal, stealth teleport"),
    "sk_dragonheart":("용의심장",   "legendary", "glowing red dragon heart crystal with draconic aura, primal power"),
    # GOLD (special)
    "sk_handoff":    ("핸드오프",   "gold",      "two gauntlet hands passing a glowing flame, relay teamwork energy"),
}

assert len(skills) == 30, f"Expected 30, got {len(skills)}"

negative = "photo, photorealistic, 3d render, modern, blurry, low quality, text, watermark, anime, cartoon, deformed, ugly, worst quality, hearthstone, blizzard, world of warcraft"

OUT = "c:/work/game/img/"
os.makedirs(OUT, exist_ok=True)
total = len(skills)
done = 0
start = time.time()

for sid, (name, rarity, desc) in skills.items():
    path = os.path.join(OUT, f"{sid}.png")
    if os.path.exists(path) and os.path.getsize(path) > 10000:
        print(f"[SKIP] {sid}"); done += 1; continue
    prompt = f"{BASE}, {desc}, {rarity} tier card"
    print(f"[{done+1}/{total}] {sid} ({name}, {rarity})...")
    img = pipe(prompt, negative_prompt=negative, num_inference_steps=25, guidance_scale=7.5, width=512, height=512).images[0]
    img.save(path)
    done += 1
    elapsed = time.time() - start
    eta = elapsed / done * (total - done) / 60
    print(f"  Saved ({os.path.getsize(path)//1024}KB)  ETA: {eta:.1f}min")

print(f"\n[DONE] {done}/{total} in {(time.time()-start)/60:.1f}min")
print(f"Next step: Update CARD_IMG in index.html to use IMG+'{{sk_id}}.png' instead of game-icons.net SVGs")
