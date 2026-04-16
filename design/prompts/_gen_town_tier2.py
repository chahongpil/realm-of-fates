"""SD WebUI API로 마을 티어 2 초안 생성. WebUI가 --api 모드로 떠 있어야 함."""
import base64, json, sys, urllib.request, urllib.error, pathlib

API = "http://127.0.0.1:7860"
OUT = pathlib.Path(r"c:\work\design\refs\town\tier2_sketch.png")

POSITIVE = (
    "isometric 3/4 view fantasy town, top-down perspective, stylized fantasy illustration, "
    "hand-painted digital art, 2-3 tone shading, soft sunlight from upper-left, dramatic lighting, "
    "mountain background with snow peaks, winding cobblestone paths and stone bridges, lush green meadows, "
    "grand stone castle with multiple tall spires on hilltop center-top, lava forge with fiery glow "
    "and smoking chimney on left side, circular colosseum arena in middle, magical portal with glowing "
    "blue crystals, wooden tavern with sloped roof and chimney on right, gothic cathedral with tall "
    "pointed spires bottom, market stall, library building with dome, fantasy game town hub, "
    "mobile game art, vibrant colors, dark fantasy mood"
)
NEGATIVE = (
    "hearthstone, blizzard style, world of warcraft, photorealistic, photo, real photo, low quality, "
    "blurry, jpeg artifacts, watermark, signature, text, letters, ugly, deformed, modern buildings, "
    "cars, vehicles, people in foreground, oversaturated, neon, anime"
)

payload = {
    "prompt": POSITIVE,
    "negative_prompt": NEGATIVE,
    "width": 512,
    "height": 768,
    "steps": 30,
    "cfg_scale": 7,
    "sampler_name": "DPM++ 2M Karras",
    "seed": -1,
    "n_iter": 1,
    "batch_size": 1,
}

req = urllib.request.Request(
    f"{API}/sdapi/v1/txt2img",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
)
try:
    with urllib.request.urlopen(req, timeout=600) as r:
        data = json.loads(r.read())
except urllib.error.URLError as e:
    print(f"FAIL: {e}", file=sys.stderr); sys.exit(2)

img_b64 = data["images"][0]
img = base64.b64decode(img_b64.split(",", 1)[-1])
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_bytes(img)

info = json.loads(data.get("info", "{}"))
print(f"OK -> {OUT}")
print(f"   seed={info.get('seed')} model={info.get('sd_model_name')} sampler={info.get('sampler_name')}")
