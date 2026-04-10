# 참조 횟수 베이스라인 (Phase 0)

> Phase 2 이후 데이터/모듈 분리 작업 후, 이 수치와 비교해 참조 누락 여부 확인.
> 생성: `grep -c` on `index.html`

| 패턴 | 참조 횟수 |
|------|-----------|
| `UNITS` | 20 |
| `SKILLS_DB` | 5 |
| `SFX.` | 94 |
| `Auth.` | 21 |
| `Game.` | 61 |

## 생성 시점

- 브랜치: `refactor/structure-split`
- index.html 총 라인: 5285
- 생성 커밋: (이 파일을 포함한 Phase 0 커밋)
