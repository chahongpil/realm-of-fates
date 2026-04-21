# 자잘 버그 3건 진단 + 수정안

> 2026-04-21 심야 / play-director 리포트의 🟡 주의사항 항목 조사

## 1. 🟡 `img/town/gate.png` 404

### 진단
- **실제 렌더링은 정상**. [js/51_game_town.js:215-216](../js/51_game_town.js#L215):
  ```js
  const bImg=`img/town/${b.id}.png`;             // primary
  const bImgFallback=`img/building_${b.id}.png`;  // fallback
  ```
- town 디렉터리 파일: castle/church/forge/library/shop/tavern/training (7개). **gate 없음**.
- onerror 로 `img/building_gate.png` (존재함) 로 교체 → 사용자에겐 정상 표시.
- 다만 **네트워크 탭에 404 에러 1건 찍힘** (콘솔 노이즈).

### 수정안 (택 1)

**Option A (권장, 코드 1줄)**: gate 만 primary 경로 다르게
```diff
- const bImg=`img/town/${b.id}.png`;
+ const bImg = b.id === 'gate' ? `img/building_${b.id}.png` : `img/town/${b.id}.png`;
```
- 장점: 404 완전 제거, 아트 공급 대기 없이 즉시 해결
- 리스크: 0 (기존 fallback 과 동일 파일 사용)

**Option B**: 대표님이 `img/town/gate.png` 새로 공급
- 장점: 다른 town/*.png 와 스타일 통일 (성벽 cutout 버전)
- 단점: 아트 의존

**Option C**: 방치
- 실사용 문제 없음 (fallback 동작). 콘솔 노이즈만 감내.

**결정 요청**: A (즉시) / B (공급 대기) / C (방치)

---

## 2. 🟡 `#title-screen` radial-gradient 중첩

### 진단
[css/42_screens.css:12-13](../css/42_screens.css#L12):
```css
#title-screen{ background:url('../img/bg_title_angel.png') center/cover no-repeat,
               radial-gradient(ellipse at center,#1a1525 0%,#0a0810 60%,#050408 100%); }
#title-screen.bg-demon{ background:url('../img/bg_title_demon.png') center/cover no-repeat,
                        radial-gradient(...); }
```

- radial-gradient 은 **2번째 레이어 (fallback)** — 이미지 404 시 보임
- 현재 3771×1684 bg_title_*.png 정상 로드되므로 gradient 는 **실제로 보이지 않음**
- play-director 는 "레거시" 로 지적했지만 **방어적 fallback 역할 유지 중**

### 판정: **유지 권장**
- CSS 20 바이트 정도. 성능 영향 0.
- 이미지 서버 일시 장애, 네트워크 이슈 시 완전 검정 대신 분위기 있는 gradient 폴백 유지
- 제거할 이득 미미

### 혹시 제거한다면 (간단)
```diff
- #title-screen{...background:url('../img/bg_title_angel.png') center/cover no-repeat,radial-gradient(...);}
+ #title-screen{...background:url('../img/bg_title_angel.png') center/cover no-repeat,#000;}
```
배경 대체가 gradient → 불투명 #000 이 되는 정도 차이.

**결정 요청**: 유지 (추천) / 단색 #000 으로 교체

---

## 3. 🟡 성별 토글 일러스트 변화 시각 미약

### 진단
- **기술은 정상**: `#char-hero-screen` 에서 🧔 → 👩 토글 시 `protagonist_m_warrior.png` → `protagonist_f_warrior.png` 로 교체
- [js/11_data_heroes.js:38-45](../js/11_data_heroes.js#L38) HERO_SKINS 분리 정상
- 문제: **이미지 교체가 시각적으로 조용함** — 플레이어가 "뭐가 바뀌었지?" 생각할 수 있음

### 원인 가능성

**A. 아트 자체가 비슷** (디자인 원인):
- m_warrior 과 f_warrior 일러스트가 비슷한 포즈·무기·색감이면 차이 인식 어려움
- 대표님 기획 방향: 성별로 비주얼 강하게 분리할지, 공통 "영웅" 톤 유지할지에 따라 다름

**B. 전환 애니메이션 부재** (코드 원인):
- 현재 이미지 `src` 교체만 → 프레임 바뀌고 끝. transition 없음.
- "뭔가 바뀌었다" 신호가 부족

### 수정안

**Option A (디자인 수준, 대표님)**: 
- m/f 일러스트 차이 더 강하게 (hair/armor color/pose 등)
- 아트 리소스 재공급 필요

**Option B (코드 10줄 CSS)**: 토글 시 transition 효과
```css
#char-hero-screen .hero-preview-img {
  transition: opacity .2s, transform .2s, filter .2s;
}
#char-hero-screen .hero-preview-img.is-switching {
  opacity: 0.3;
  transform: scale(.95);
  filter: blur(4px);
}
```
JS 에서 토글 시 `is-switching` 클래스 200ms 동안 부여 → fade out → src 교체 → fade in. 구조는 간단.

**Option C (방치)**: 아트 통일 방향이면 현재 수준 OK

**결정 요청**: A (아트 강화) / B (CSS transition 추가, 코드 수정 승인 필요) / C (방치)

---

## 종합

3건 모두 **기능 정상, UX 미세 개선 여지**. 치명적 블로커 없음.

### 즉시 실행 가능 (대표님 승인 시)
- **1번 Option A**: 코드 1줄, 1분 내 해결, 리스크 0
- **3번 Option B**: CSS 10줄 추가, 사용자 체감 개선

### 장기 과제
- **2번 radial-gradient**: 유지 권장 (방어)
- **3번 Option A**: 성별 아트 강화 (대표님 영역)
