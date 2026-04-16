"""WebUI 우회 - diffusers로 직접 마을 티어 2 초안 생성.
시스템 Python (torch 2.5.1+cu121, diffusers 0.32.1) 기반.
GTX 1080 8GB 최적화."""
import os, sys, time, pathlib
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler

MODEL = r"D:\AI\stable-diffusion\stable-diffusion-webui\models\Stable-diffusion\dreamshaper_8.safetensors"
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

print(f"[1/3] 모델 로딩... ({MODEL})")
t0 = time.time()
pipe = StableDiffusionPipeline.from_single_file(
    MODEL,
    torch_dtype=torch.float16,
    use_safetensors=True,
    safety_checker=None,
    requires_safety_checker=False,
)
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
pipe = pipe.to("cuda")
pipe.enable_attention_slicing()
print(f"      ok ({time.time()-t0:.1f}s)")

print("[2/3] 이미지 생성...")
t1 = time.time()
gen = torch.Generator(device="cuda").manual_seed(20260412)
result = pipe(
    prompt=POSITIVE,
    negative_prompt=NEGATIVE,
    width=512,
    height=768,
    num_inference_steps=30,
    guidance_scale=7.0,
    generator=gen,
)
img = result.images[0]
print(f"      ok ({time.time()-t1:.1f}s)")

print(f"[3/3] 저장 -> {OUT}")
OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT)
print(f"      ok (size={OUT.stat().st_size} bytes)")
print(f"\nseed=20260412  total={time.time()-t0:.1f}s")
