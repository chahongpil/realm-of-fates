# 카드 일러스트 생성 스킬

## Stable Diffusion 설치 위치
- WebUI: `D:/AI/stable-diffusion/stable-diffusion-webui/`
- 실행: `webui-user.bat`
- 설정: `--sdpa --medvram --theme dark --autolaunch`
- GPU: GTX 1080 8GB

## 하스스톤 LoRA (학습 완료 — 재학습 금지!)
- 파일: `D:/AI/lora-training/hearthstone/model/hearthstone_style.safetensors`
- WebUI 복사: `models/Lora/` 폴더에 넣기
- 트리거 워드: `hscard`

## 사용법
프롬프트 예시:
```
hscard, epic fire warrior, holding flaming sword,
dramatic lighting, portrait composition, masterpiece
```
Negative:
```
photo, realistic, 3d render, anime, cartoon,
low quality, blurry, text, watermark
```

## 얼굴 복원
- ADetailer 확장 설치됨 (자동 얼굴 감지 + 재생성)
- GFPGAN 설치됨 (후처리 복원)

## 대량 생산 전략
- 원소×역할 프롬프트 템플릿 시스템
- 1장당 10~15초 (GTX 1080)
- 하루 200장+ 생산 가능
