# Realm of Fates Design System (2) — 참고 시안

> **수령**: 2026-05-03 (사용자가 다운로드 폴더에 보관)
> **상태**: 참고용 보존. 토큰만 `css/10_tokens.css` 의 `--ds2-*` prefix 로 차용.

---

## 파일 구성

| 파일 | 내용 |
|---|---|
| `refined.html` | React 진입점 (Cinzel/Cinzel Decorative/Noto KR 폰트 로드) |
| `design-canvas.jsx` | Figma 스타일 캔버스 프레임워크 (622 줄) |
| `screens.jsx` | 4 화면 시안 — `S_Title` / `S_Town` / `S_Collection` / `S_Result` (504 줄) |
| `assets/bg_title.png` | 타이틀 배경 (1.8 MB) |

---

## 디자인 토큰 (T 객체) — `css/10_tokens.css` 에 `--ds2-*` 로 도입 완료

```js
ink:     #0d0a06   →  --ds2-ink
stone1:  #1c150e   →  --ds2-stone-1
stone2:  #2a1f15   →  --ds2-stone-2
stone3:  #3a2c1f   →  --ds2-stone-3
edge:    #5a4a2a   →  --ds2-edge   (= 기존 --amber-plate)
edgeBright: #9b7a3e → --ds2-edge-bright
amber:   #e8bd4a   →  --ds2-amber
amberPale: #d4a84a →  --ds2-amber-pale
parchment: #e8d5a3 →  --ds2-parchment   (= 기존 --parchment-1)
parchmentMuted: #a89876 → --ds2-parchment-mid
scarlet: #8b1a1a   →  --ds2-scarlet
scarletBright: #c83838 → --ds2-scarlet-bright   (= --bad)
textHi:  #f1e4c3   →  --ds2-text-hi   (= 기존 --parchment-0)
textMid: #a89876   →  --ds2-text-mid
textLow: #6e5a3e   →  --ds2-text-low
divine:  #f1e4c3   →  --ds2-divine
ok:      #5fb874   →  --ds2-ok
warn:    #c89a3a   →  --ds2-warn
bad:     #c83838   →  --ds2-bad
```

폰트 (이미 `index.html` 에 Google Fonts 로드됨):
- **display**: `Cinzel Decorative`
- **title**: `Cinzel`
- **body**: `Noto Sans KR`

---

## 디자인 톤 요약

- **색조**: 다크 갈색 + 앰버/파치먼트 + 혈색 액센트 (양피지 + 석재 톤)
- **폰트**: Cinzel 시리즈 = 절제된 고전 판타지
- **모서리**: `border-radius: 2~4` (날카로움)
- **간격**: `letterSpacing: .04~.06em` (강조)
- **테두리**: 1px solid + inset shadow (정밀)

---

## 시안 vs 우리 정본 — 충돌 사항

| 항목 | 시안 | 우리 정본 | 결정 |
|---|---|---|---|
| 등급 라벨 | 평범 / 희귀 / 고귀 / 전설 / 신 | 일반 / 희귀 / 고귀한 / 전설의 / 신 (`03-terminology.md`) | **정본 유지** — 시안 라벨 무시 |
| silver 색 | #7ab4d8 (담청) | #3a7bd5 (코발트) | **정본 유지** |
| gold 색 | #b56fc8 (보라) | #9b59b6 (자수정) | **정본 유지** (유사) |
| legendary 색 | #e8bd4a (앰버) | #f39c12 (호박금) | **정본 유지** (유사) |

→ **등급 시스템은 절대 변경 안 함**. 시안의 색상 톤·구조·컴포넌트 패턴만 참고.

---

## 점진 적용 가이드

### 화면별 적용 순서 (권장)

1. **Title** (`S_Title`) — 시안 그대로 거의 적용 가능. `bg_title.png` 활용 검토.
2. **Result** (`S_Result`) — 전투 종료 후 보상 화면. 정보 위계 단순.
3. **Town** (`S_Town`) — 마을. 우리 기존 마을 (배경 영상) 과 충돌 가능 — 비교 후 결정.
4. **Collection** (`S_Collection`) — 도서관/생명의 서. 카드 그리드 시안 비교.

### 컴포넌트 패턴 (screens.jsx 참조)

- **Btn** — primary / danger / ghost / default 4 종. 그라디언트 + inset shadow.
- **Hud** — 상단 정보 바. `linear-gradient` + 1px border + tab 구분선.
- **Divider** — 장식 ornament (`✦`) 가 가운데 들어간 그라디언트 라인.
- **Card** — 4 사이즈 (mini 92 / sm 116 / full 150 / lg 200), aspect 4:7.

### 적용 시 검수

- 시각 변경은 **`rof-ui-inspector` 동반 의무** (사용자 명시 2026-05-02).
- `--ds2-*` 토큰만 사용. 새 색 하드코딩 금지 (이 정책이 기존 토큰 정책과 동일).
- 등급/원소 색은 기존 `--rar-*` / `--elem-*` 그대로.

---

## 변경 이력

### v1 — 2026-05-03

- 시안 4 파일 보존 + 토큰 13종 + 폰트 3종 도입.
- 코드 변경 = `css/10_tokens.css` 에 `--ds2-*` 19개 토큰 + 3개 폰트 변수 추가.
- 기존 토큰·등급 시스템 변경 0.
