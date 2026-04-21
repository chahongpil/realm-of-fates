# -*- coding: utf-8 -*-
"""normalized/ 하위 46장을 체크무늬 캔버스에 400x600 원본 크기로 미리보기 HTML 생성.
체크무늬 배경: 투명 영역 드러내서 이미지 자체의 실제 내용 경계를 눈으로 확인.
"""
import os, sys

DOWNLOADS = r'C:/Users/USER/Downloads'
SECTIONS = [
    ('스펠 (26장)',  '0421스펠작업/normalized'),
    ('유물 (6장)',   '0421추가유물작업/normalized'),
    ('유닛 (14장)',  '0421추가유닛작업/normalized'),
]
OUT = os.path.join(DOWNLOADS, '0421_normalized_preview.html')

def collect(rel):
    path = os.path.join(DOWNLOADS, rel)
    if not os.path.isdir(path): return []
    return sorted([f for f in os.listdir(path) if f.lower().endswith('.png')])

def main():
    parts = []
    for label, rel in SECTIONS:
        files = collect(rel)
        parts.append(f'<section><h2>{label}</h2><div class="grid">')
        for f in files:
            import time
            ts = int(time.time())
            src = rel + '/' + f + '?v=' + str(ts)  # cache-bust: 재정규화 후 즉시 새 이미지 보이도록
            parts.append(f'<figure><div class="frame"><img src="{src}" alt=""></div><figcaption>{f}</figcaption></figure>')
        parts.append('</div></section>')

    html = '''<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<title>0421 정규화 미리보기 — 안 짤림 검수</title>
<style>
:root{--bg:#1a1512; --ink:#f1e4c3; --muted:#b89968; --gold:#e8bd4a; --border:#6e4a2a;}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);font-family:system-ui,'Noto Sans KR',sans-serif}
body{padding:32px 40px 64px}
h1{font-size:22px;color:var(--gold);margin:0 0 6px;letter-spacing:.04em}
.lead{color:var(--muted);margin:0 0 24px;font-size:13px}
h2{color:var(--gold);font-size:15px;letter-spacing:.08em;margin:32px 0 14px;padding-bottom:6px;border-bottom:1px solid var(--border)}
.grid{display:grid;grid-template-columns:repeat(auto-fill, 220px);gap:22px 16px}
figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px}
.frame{
  width:220px;height:330px;border:1px solid var(--border);border-radius:4px;overflow:hidden;
  /* 체크무늬 — 투명 영역 보이게 */
  background-image:
    linear-gradient(45deg,#2a1f18 25%,transparent 25%),
    linear-gradient(-45deg,#2a1f18 25%,transparent 25%),
    linear-gradient(45deg,transparent 75%,#2a1f18 75%),
    linear-gradient(-45deg,transparent 75%,#2a1f18 75%);
  background-size:16px 16px;
  background-position:0 0,0 8px,8px -8px,-8px 0;
  background-color:#423025;
}
.frame img{width:100%;height:100%;object-fit:contain;display:block}
figcaption{font-size:11px;color:#d8c48a;max-width:220px;text-align:center;word-break:break-all;line-height:1.4}
.stats{display:inline-flex;gap:14px;padding:6px 14px;background:#2b1c13;border:1px solid var(--border);border-radius:3px;font-size:11px;margin-bottom:20px;color:var(--muted)}
.stats b{color:var(--gold);font-weight:700}
</style></head><body>
<h1>0421 정규화 이미지 미리보기</h1>
<p class="lead">원본 해상도를 400×600 투명 캔버스로 비율유지 fit. 체크무늬는 투명 영역(카드에서 보이지 않는 부분). 이미지가 캔버스 경계에 닿아 있으면 짤림 없음.</p>
<div class="stats">총 <b>46</b>장 · 스펠 <b>26</b> · 유물 <b>6</b> · 유닛 <b>14</b></div>
''' + ''.join(parts) + '\n</body></html>\n'

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(html)
    print('WROTE:', OUT)

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
