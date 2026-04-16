# 마을 티어 2 — SD 초안 생성 프롬프트

> 목적: 3티어 마을 시스템의 **중간 기준점** 1장 생성. 이 1장이 정해지면 티어 1(촌락) / 티어 3(도시)는 img2img 파생.
> 출력: `refs/town/tier2_sketch.png`

## 구성 (참고 이미지 기반)
- 상단: 첨탑 있는 석조 성 (메인 허브)
- 좌측: 용암 굴뚝 대장간
- 중앙: 원형 콜로세움 + 마법 포털 (파란 크리스탈)
- 우측: 경사 지붕 목조 선술집
- 하단: 고딕 첨탑 대성당
- 도로: 돌길 + 다리, 산맥 배경, 좌상단 광원

## txt2img 파라미터
| | |
|---|---|
| Width × Height | 512 × 768 (mobile portrait 친화) |
| Sampler | DPM++ 2M Karras |
| Steps | 30 |
| CFG | 7 |
| Seed | -1 (랜덤, 결과 좋으면 기록) |

## Positive Prompt
```
isometric 3/4 view fantasy town, top-down perspective, stylized fantasy illustration,
hand-painted digital art, 2-3 tone shading, soft sunlight from upper-left, dramatic lighting,
mountain background with snow peaks, winding cobblestone paths and stone bridges, lush green meadows,
grand stone castle with multiple tall spires on hilltop center-top, lava forge with fiery glow
and smoking chimney on left side, circular colosseum arena in middle, magical portal with glowing
blue crystals, wooden tavern with sloped roof and chimney on right, gothic cathedral with tall
pointed spires bottom, market stall, library building with dome, fantasy game town hub,
mobile game art, vibrant colors, dark fantasy mood
```

## Negative Prompt
```
hearthstone, blizzard style, world of warcraft, photorealistic, photo, real photo, low quality,
blurry, jpeg artifacts, watermark, signature, text, letters, ugly, deformed, modern buildings,
cars, vehicles, people in foreground, oversaturated, neon, anime
```

## 생성 후 메모
- (생성 후 채울 것) 사용된 모델, 실제 시드, 결과 평가
