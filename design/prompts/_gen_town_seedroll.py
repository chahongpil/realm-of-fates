"""시드 룰렛 - 같은 프롬프트로 8장 생성, 그중 베스트 고르기."""
import time, pathlib
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler

MODEL = r"D:\AI\stable-diffusion\stable-diffusion-webui\models\Stable-diffusion\dreamshaper_8.safetensors"
OUT_DIR = pathlib.Path(r"c:\work\design\refs\town\seedroll")

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

SEEDS = [101, 202, 303, 404, 505, 606, 707, 808]

print(f"[load] {MODEL}")
t0 = time.time()
pipe = StableDiffusionPipeline.from_single_file(
    MODEL, torch_dtype=torch.float16, use_safetensors=True,
    safety_checker=None, requires_safety_checker=False,
)
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
pipe = pipe.to("cuda")
pipe.enable_attention_slicing()
print(f"      ok ({time.time()-t0:.1f}s)")

OUT_DIR.mkdir(parents=True, exist_ok=True)
for i, seed in enumerate(SEEDS, 1):
    t1 = time.time()
    gen = torch.Generator(device="cuda").manual_seed(seed)
    img = pipe(
        prompt=POSITIVE, negative_prompt=NEGATIVE,
        width=512, height=768,
        num_inference_steps=30, guidance_scale=7.0,
        generator=gen,
    ).images[0]
    out = OUT_DIR / f"tier2_s{seed:04d}.png"
    img.save(out)
    print(f"[{i}/8] seed={seed} -> {out.name} ({time.time()-t1:.1f}s)")

print(f"\ntotal {time.time()-t0:.1f}s, 8 images in {OUT_DIR}")
