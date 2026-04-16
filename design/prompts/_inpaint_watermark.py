"""Gemini 별 워터마크 자동 탐지 + OpenCV inpaint 제거.
1) base_terrain 우하단 200x200 영역에서 4각 스파클(밝은 백색 점) 탐지
2) 그 위치에 마스크 생성 + cv2.inpaint (TELEA 알고리즘)
3) 결과 저장 (gemini/base_terrain.png 덮어쓰기, 백업본 .orig 보존)
"""
import cv2
import numpy as np
import shutil
from pathlib import Path

SRC = Path(r"c:\work\design\refs\town\gemini\base_terrain.png")
BACKUP = SRC.with_suffix(".orig.png")

def find_watermark(img_bgr, search_w=220, search_h=220):
    """Find the brightest sparkle in the bottom-right region."""
    h, w = img_bgr.shape[:2]
    x0, y0 = w - search_w, h - search_h
    roi = img_bgr[y0:h, x0:w]
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    # debug dump
    cv2.imwrite(r"c:\work\design\refs\town\_wm_roi.png", roi)
    cv2.imwrite(r"c:\work\design\refs\town\_wm_gray.png", gray)
    # try multiple thresholds
    best = None
    for t in (210, 200, 190, 180):
        _, thr = cv2.threshold(gray, t, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thr, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        # filter very small or very large
        valid = [c for c in contours if 30 < cv2.contourArea(c) < 4000]
        if valid:
            biggest = max(valid, key=cv2.contourArea)
            bx, by, bw, bh = cv2.boundingRect(biggest)
            print(f"    [debug] thr={t} found area={cv2.contourArea(biggest):.0f} bbox={bw}x{bh}")
            best = (x0 + bx, y0 + by, bw, bh)
            cv2.imwrite(r"c:\work\design\refs\town\_wm_thr.png", thr)
            break
    return best

def main():
    if not BACKUP.exists():
        shutil.copy(SRC, BACKUP)
        print(f"[backup] {BACKUP.name}")

    # PIL로 불러서 RGBA → cv2 BGR로 변환
    from PIL import Image
    pil = Image.open(BACKUP).convert("RGB")
    img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    h, w = img.shape[:2]
    print(f"[1] {SRC.name} {w}x{h}")

    # 수동 좌표 - 사용자가 노란 원으로 표시한 우하단 코너 + 글로우 여유
    cx, cy = 815, 1225
    half = 60
    bx, by, bw, bh = cx - half, cy - half, half * 2, half * 2
    print(f"[2] watermark (manual) at ({bx},{by}) size {bw}x{bh}")

    # 마스크: 컨투어 영역 + 약간 패딩
    pad = 8
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.rectangle(mask, (bx - pad, by - pad), (bx + bw + pad, by + bh + pad), 255, -1)

    # inpaint - NS 알고리즘이 그라디언트 보존 더 자연스러움
    print("[3] cv2.inpaint (NS)...")
    result = cv2.inpaint(img, mask, 7, cv2.INPAINT_NS)

    # 저장 (RGB → PIL → PNG)
    out_pil = Image.fromarray(cv2.cvtColor(result, cv2.COLOR_BGR2RGB))
    # 원본의 alpha 채널 복원 (있으면)
    src_pil = Image.open(BACKUP)
    if src_pil.mode == "RGBA":
        out_pil = out_pil.convert("RGBA")
        out_pil.putalpha(src_pil.split()[3])
    out_pil.save(SRC)
    print(f"[4] 저장 -> {SRC.name}")
    print("DONE")

if __name__ == "__main__":
    main()
