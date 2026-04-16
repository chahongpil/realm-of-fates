# Realm of Fates — Design 작업장 핸드오프

> **역할**: 비주얼 레퍼런스 · 레이아웃 목업 · 프로토타입 HTML · 이미지 생성 프롬프트 · LoRA 학습 소스
> **work 폴더와 관계**: work = 코드/기획/밸런스, design = work의 시각 사전 작업장.
> 최종 승인된 에셋만 `c:\work\game\assets\`로 전달.

## 🔗 work 동기화 링크
- work HANDOFF: [c:/work/game/HANDOFF.md](../work/game/HANDOFF.md)
- work 프로젝트 규칙: [c:/work/CLAUDE.md](../work/CLAUDE.md)
- 디자인 방향 규칙: [.claude/rules/05-design-direction.md](../work/.claude/rules/05-design-direction.md)
- 카드 UI 원칙: [.claude/rules/06-card-ui-principles.md](../work/.claude/rules/06-card-ui-principles.md)
- 마을 기획서: [PHASE2_TOWN_PLAN.md](../work/game/PHASE2_TOWN_PLAN.md)

**룰**: 작업 시작 시 위 링크 중 관련 문서를 먼저 읽을 것. 중복 로그 금지 — work에 있는 정보는 여기 복사하지 않고 링크만.

## 📁 폴더 구조
```
design/
├─ HANDOFF.md           ← 이 문서
├─ refs/                ← 레퍼런스 이미지 (출처/라이선스 기록)
│   └─ town/            ← 마을 레퍼런스
├─ prototypes/          ← 테스트 HTML (work index.html과 독립)
├─ prompts/             ← 이미지 생성 프롬프트 모음
└─ .claude/
    ├─ settings.json     ← bypassPermissions + beep 훅
    ├─ SKILLS.md         ← 가져온 스킬/에이전트 인덱스
    ├─ skills/           ← 6개 (work에서 복사)
    └─ agents/           ← 2개 (work에서 복사)
```

### 스킬/에이전트
work에서 비주얼 작업에 쓸만한 것들만 선별 복사. 전체 목록과 원본 경로는 [.claude/SKILLS.md](.claude/SKILLS.md) 참고. 원본이 수정되면 **수동 동기화** 필요.

---

## 🟢 2026-04-12 — design 폴더 초기 세팅

### 1. 폴더 구조 생성
- `refs/town/` · `prototypes/` · `prompts/` 3개 폴더 생성
- 이 HANDOFF 문서 작성 (옵션 B: 단방향 링크)

### 2. 작업 방침 확정 (사용자 합의)
- **design 역할**: 비주얼 작업장 + 별도 프로토타입 HTML 허용
- **work와 분리**: work `index.html` 수정 금지 규칙은 여기서도 존중 — 프로토타입은 `prototypes/` 하위 독립 파일로만
- **HANDOFF 방식**: 단방향 링크 (B안). design은 자기 작업만 쌓고, work 정보는 링크 타고 읽기

### 3. 세션 설정 상속
- [.claude/settings.json](.claude/settings.json): `bypassPermissions` + Stop/Notification/PermissionRequest beep 훅 3종 — work와 동일 UX

---

## 🔨 현재 작업: 마을 화면 비주얼 프로토타입

### 목표
Heroes 3 Castle 마을 레이아웃 + [PHASE2_TOWN_PLAN.md](../work/game/PHASE2_TOWN_PLAN.md) 기획을 합쳐 **45도 쿼터뷰 마을**의 시각 레퍼런스와 동작 가능한 HTML 프로토타입을 만든다.

### 참고 이미지
- `refs/town/heroes3_style_ref_01.png` ← 사용자 첨부 (상단 성 / 대장간 / 투기장 / 포털 / 선술집 / 대성당)
  - **사용자 To-Do**: 채팅의 첨부 이미지를 위 경로에 저장 필요 (Claude는 직접 저장 불가)

### 마을 건물 매핑 (참고 이미지 ↔ PHASE2 기획)
| 참고 이미지 | PHASE2 기획 건물 | 기능 |
|---|---|---|
| 상단 성 | 🏰 성 | 메인 허브, 영웅 선택 |
| 좌측 용암/대장간 | ⚒️ 대장간 | 장비 제작/강화 |
| 중앙 콜로세움 | 🏟️ 투기장 | 아레나 진입 |
| 중앙 포털 | 🚪 성문 | 전투 스테이지 진입 |
| 우측 목조건물 | 🍺 선술집 | 용병 모병 |
| 하단 고딕 성당 | ⛪ 교회 | 축복/부활 |
| (추가 필요) | 🏪 상점 | 아이템 구매 |
| (추가 필요) | 📋 서고 | 스펠/퀘스트 |

### 작업 단계 (제안)
1. **[ ] 레퍼런스 수집** — Heroes 3, Clash Royale 마을, Chrono Knight, 첨부 이미지를 `refs/town/`에 모으고 각 출처/라이선스 기록
2. **[ ] 레이아웃 목업** — 480px 모바일 기준 SVG/PNG 배치도 (건물 8개 + 도로 + 배경)
3. **[ ] 프로토타입 HTML v1** — `prototypes/town_v1.html`: 배경 이미지 + 건물 클릭 영역(div) + 호버/줌인 애니메이션만
4. **[ ] 이미지 생성 프롬프트** — `prompts/town_buildings.md`: 건물 8개 각각 Midjourney/SDXL 프롬프트 (05-design-direction 가이드 준수)
5. **[ ] 실제 이미지 생성 & 교체** — 생성 이미지를 `refs/town/generated/`에 쌓고 v1 HTML에 적용 → v2
6. **[ ] work로 이관** — 최종 승인본을 `c:/work/game/assets/town/`으로 복사, work HANDOFF에 "design → work 전달" 엔트리 추가 요청

### 디자인 제약 (05-design-direction.md에서)
- ❌ 블리자드/하스스톤 특유 금속+보석 프레임
- ❌ "hearthstone style" 프롬프트
- ✅ Stylized + Graphic, 강한 광원 대비, 단순화 채색 2~3톤
- ✅ 동양 판타지 혼합 OK, 근미래 판타지 OK
- ✅ 세계관: "운명의 왕좌" — 6원소 + 절대신

---

## 🟡 다음 진행
사용자가 첨부 이미지를 `refs/town/heroes3_style_ref_01.png`로 저장해주면, 1단계(레퍼런스 분석 + 레이아웃 목업)부터 시작.

---

## 🟢 2026-04-12 저녁 — 마을 비주얼 v1 완성

### 1. SD WebUI → Gemini 전환
- SD WebUI 기동 시 venv torch 손상 발견 (이전 SIGPIPE 사고 흔적). 재다운로드 ~20분 필요로 우회 결정
- 시스템 Python 3.10 + diffusers 0.32.1 + dreamshaper_8 으로 직접 생성 시도 → SD 1.5는 다중 객체(8개 건물) 한 장 합성 불가 확정 (시드 룰렛 8장 전수 실패)
- **Gemini 2.5 Flash Image (Nano Banana) 전면 채택**: [prompts/gemini_town_assets.md](prompts/gemini_town_assets.md)에 9개 프롬프트 + 공통 스타일 블록 작성. 사용자가 직접 생성

### 2. 9장 에셋 수집 (베이스 1 + 건물 8)
- [refs/town/gemini/](refs/town/gemini/): base_terrain / castle / forge / arena / portal / cathedral / tavern / library / shop
- 품질: SD 1.5 대비 압도적, Heroes 3 톤 거의 완벽 재현
- 베이스 배경에 슬롯 ~10개 시각적으로 그려져 있어 배치 좌표 잡기 쉬움

### 3. 배경 제거 파이프라인 (rembg 하이브리드)
- [prompts/_rembg_buildings.py](prompts/_rembg_buildings.py): rembg(u2net) → 외곽 알파 → 추가로 내부 흰색 키 제거 (아치 사이 하늘, 첨탑 사이 공백)
- u2net 모델 1회 다운로드 ~170MB
- 흰색 키 임계값: brightness ≥ 235, R/G/B 채널 차이 ≤ 18 (무채색 한정)
- arena: 16,283 흰픽셀 / cathedral: 97 / castle: 99 등 정리
- 사용자가 도중에 더 디테일한 콜로세움/성당 재생성 → 두 파일 교체
- 결과: [refs/town/cutouts/](refs/town/cutouts/) 8개 깨끗한 transparent PNG

### 4. PIL 합성 + 프로토타입 HTML
- [prompts/_compose_town.py](prompts/_compose_town.py): cutouts을 베이스 위에 좌표 기반 합성 → [refs/town/town_composed.png](refs/town/town_composed.png)
- 좌표 진실원천: [refs/town/slot_coords.json](refs/town/slot_coords.json) (x, y, w, h, z)
- [prototypes/town_v1.html](prototypes/town_v1.html): HUD + 합성 배경 + 8개 클릭 hotspot + 호버 글로우 + NPC 모달 + 키보드 ESC. 480px 모바일 viewport 기준

### 5. 드래그 에디터
- [prototypes/town_editor.html](prototypes/town_editor.html): 8개 cutout을 베이스 위에 자유 배치하는 GUI
- 기능: 클릭 선택 / 드래그 이동 / 화살표 키 미세조정 (Shift+화살표 = 10px) / 크기 슬라이더 / z-순서 슬라이더 / 그리드 토글 / 숨김 / 초기화 / **JSON 내보내기 (클립보드 + 다운로드)**
- 사이드바에 현재 좌표 JSON 실시간 표시

### 6. 사용자 배치 v1 확정
- 사용자가 에디터로 직접 8개 배치 → `slot_coords_edited.json` 다운로드 → [refs/town/slot_coords.json](refs/town/slot_coords.json)으로 반영
- _compose_town.py / town_v1.html / town_editor.html DEFAULTS 모두 동기화

### 7. Gemini 워터마크 제거
- [prompts/_inpaint_watermark.py](prompts/_inpaint_watermark.py): cv2.inpaint NS 알고리즘으로 base_terrain.png 우하단 ✦ 별 워터마크 제거
- 자동 탐지 시도(brightness threshold 4단계) 실패 → 수동 좌표 (815, 1225) 중심 + 120×120 마스크 (별 + 글로우 여유 확보)
- 원본 보존: [refs/town/gemini/base_terrain.orig.png](refs/town/gemini/base_terrain.orig.png)
- 결과: 잔디·꽃 패턴으로 자연스럽게 메워짐

### 📁 design 폴더 현재 구조
```
design/
├─ HANDOFF.md                            (이 문서)
├─ refs/town/
│   ├─ gemini/        (Gemini 원본 9장)
│   ├─ cutouts/       (배경 제거된 건물 8장)
│   ├─ town_composed.png  (최종 합성 결과)
│   ├─ slot_coords.json   (배치 좌표 SSOT)
│   └─ seedroll/      (SD 1.5 실패작 8장 — 참고용 보존)
├─ prototypes/
│   ├─ town_v1.html       (클릭 가능 마을)
│   └─ town_editor.html   (드래그 배치 GUI)
└─ prompts/
    ├─ gemini_town_assets.md   (9개 프롬프트)
    ├─ _compose_town.py        (PIL 합성, slot_coords.json 읽음)
    ├─ _rembg_buildings.py     (rembg 하이브리드)
    ├─ _kill_checker.py        (체커 패턴 키 — 사용자가 가짜 투명 PNG 다운한 케이스 대응)
    └─ _inpaint_watermark.py   (Gemini 별 워터마크 제거 — cv2 inpaint NS)
```

### 🟡 다음 작업 후보
1. **줌인 트랜지션**: 건물 클릭 시 카메라가 그 건물로 부드럽게 줌인 → NPC 대화 화면
2. **티어 1/3 마을 배경**: Gemini로 촌락(목조)/도시(왕도) 변형 2장 추가 → 진보 시 크로스페이드 전환
3. **유휴 애니메이션**: 깃발 흔들림(CSS keyframes) / 대장간 굴뚝 연기 / 포털 회전 / 횃불 깜빡임
4. **work 이관**: 9장 + 합성본 + slot_coords.json을 `c:/work/game/assets/town/`로 복사 + work HANDOFF에 전달 엔트리 요청
5. **NPC 대화 화면**: 비주얼 노벨 스타일 모달 (현재는 단순 텍스트 모달)
