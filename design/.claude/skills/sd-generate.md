# SD WebUI 이미지 생성 스킬

## 사용 시점
- "불 전사 카드 뽑아줘", "카드 일러스트 만들어줘"
- 카드 아트 대량 생성 시

## 빠른 생성 (API 모드)
```python
# WebUI API로 직접 생성 (WebUI가 --api 모드로 실행 중일 때)
import requests, base64, json
from PIL import Image
from io import BytesIO

API = "http://127.0.0.1:7860"

def generate_card(prompt_desc, element="fire", role="warrior", seed=-1):
    """카드 일러스트 1장 생성"""
    
    ELEM_PROMPT = {
        "fire": "fire magic, flames, red orange warm glow",
        "water": "ice crystals, frost aura, blue cold tones",
        "lightning": "electric sparks, yellow energy, storm",
        "earth": "stone armor, vines, green nature",
        "dark": "shadow magic, purple smoke, dark aura",
        "holy": "golden divine light, holy halo, white radiance",
    }
    
    ROLE_PROMPT = {
        "warrior": "heavy plate armor, sword and shield, muscular, melee",
        "archer": "leather armor, bow and arrows, agile, hooded, ranged",
        "mage": "flowing robes, magical staff, glowing orbs, spellcaster",
        "beast": "creature, animal, wild, fangs claws, monster",
        "support": "healer robes, gentle light, protective aura",
    }
    
    prompt = f"hscard, {prompt_desc}, {ELEM_PROMPT.get(element, '')}, {ROLE_PROMPT.get(role, '')}, hearthstone card art, hand-painted digital fantasy, dramatic lighting, portrait composition, masterpiece"
    
    negative = "photo, realistic, 3d render, anime, cartoon, low quality, blurry, text, watermark, deformed, ugly, bad anatomy, bad hands"
    
    payload = {
        "prompt": prompt,
        "negative_prompt": negative,
        "width": 512,
        "height": 768,
        "steps": 30,
        "cfg_scale": 7.5,
        "seed": seed,
        "sampler_name": "DPM++ 2M",
    }
    
    r = requests.post(f"{API}/sdapi/v1/txt2img", json=payload)
    img_data = base64.b64decode(r.json()["images"][0])
    img = Image.open(BytesIO(img_data))
    return img
```

## 오프라인 생성 (WebUI 없이)
```python
# diffusers로 직접 생성
import torch
from diffusers import StableDiffusionPipeline

MODEL = "D:/AI/stable-diffusion/stable-diffusion-webui/models/Stable-diffusion/v1-5-pruned-emaonly.safetensors"
LORA = "D:/AI/lora-training/hearthstone/model/hearthstone_style.safetensors"
OUTPUT = "D:/AI/stable-diffusion/test_output/"

pipe = StableDiffusionPipeline.from_single_file(MODEL, torch_dtype=torch.float16)
pipe.to("cuda")
pipe.enable_attention_slicing()
# LoRA 로드
pipe.load_lora_weights(LORA)

image = pipe(prompt, negative_prompt=negative, width=512, height=768, num_inference_steps=30).images[0]
image.save(f"{OUTPUT}/card.png")
```

## 대량 생성 템플릿
```python
# 유닛 42종 일괄 생성
UNITS = [
    ("민병", "earth", "warrior", "young farmer turned soldier, simple iron sword"),
    ("사냥꾼", "earth", "archer", "forest hunter, longbow, leather hood"),
    ("늑대", "earth", "beast", "fierce wolf, glowing eyes, pack hunter"),
    # ... 42종 전체
]

for name, elem, role, desc in UNITS:
    img = generate_card(desc, elem, role)
    img.save(f"{OUTPUT}/{name}.png")
```

## 얼굴 복원
생성 후 얼굴이 깨지면:
1. **ADetailer**: WebUI에서 자동 (Extensions → ADetailer 활성화)
2. **GFPGAN**: 후처리
```python
from gfpgan import GFPGANer
restorer = GFPGANer(model_path='GFPGANv1.4.pth', upscale=1)
_, _, output = restorer.enhance(img, paste_back=True)
```
