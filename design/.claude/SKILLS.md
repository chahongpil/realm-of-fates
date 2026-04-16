# Design 폴더 — 스킬/에이전트 인덱스

> work에서 복사해온 것들. **원본이 수정되면 여기도 수동 동기화 필요**.
> 원본 위치: `c:/work/.claude/skills/` · `c:/work/.claude/agents/`

## 📘 Skills (6개)

| 스킬 | 용도 | 원본 |
|---|---|---|
| [card-art-generation](skills/card-art-generation.md) | SD WebUI + LoRA 카드 일러스트 생성. 경로/트리거워드/프롬프트 예시 | `work/.claude/skills/card-art-generation.md` |
| [sd-generate](skills/sd-generate.md) | SD WebUI API 직접 호출 코드 스니펫 | `work/.claude/skills/sd-generate.md` |
| [rof-asset-prompt](skills/rof-asset-prompt.md) | `tools/build_prompt.py`로 카드 id → 일관 프롬프트 자동 생성 | `work/.claude/skills/rof-asset-prompt.md` |
| [card-game-ui-design](skills/card-game-ui-design.md) | 하스스톤/LoR 분석 기반 카드 UI 원칙 | `work/.claude/skills/card-game-ui-design.md` |
| [game-design](skills/game-design.md) | 게임 디자인 이론 레퍼런스 (10문항 체크리스트 등) | `work/.claude/skills/game-design.md` |
| [rof-design-system](skills/rof-design-system.md) | 토큰 기반 CSS 규칙 (프로토타입 HTML 일관성용) | `work/.claude/skills/rof-design-system.md` |

## 🤖 Agents (2개)

| 에이전트 | 용도 | 원본 |
|---|---|---|
| [content-generator](agents/content-generator.md) | 캐릭터/스킬/유물/건물 아이디어 브레인스토밍 | `work/.claude/agents/content-generator.md` |
| [rof-ui-inspector](agents/rof-ui-inspector.md) | 스크린샷 멀티모달 시각 QA (프로토타입 HTML 렌더 검증용) | `work/.claude/agents/rof-ui-inspector.md` |

## 🚫 의도적으로 안 가져온 것
- `balance-simulator`, `rof-test-runner`, `rof-changelog`, `rof-bloat-check`, `rof-session`, `rof-internals`, `rof-workflow`, `rof-autonomy`, `plan-dashboard`, `plan-writing`, `rof-responsive-snap`, `rof-viewport`, `rof-visual-diff`, `rof-game-feel`, `consistency-check`, `game-preview`, `stackoverflow-lookup` — work 코드/테스트/배포 특화
- `game-balance-tester`, `game-designer`, `rof-play-director`, `rof-game-director`, `balance-auditor` 에이전트 — work PHASE 문서/전투 코드 특화
- **필요해지면 그때 추가**

## 🔗 규칙 (rules)
design은 `.claude/rules/` 폴더를 따로 두지 않고 work 원본을 참조합니다 (HANDOFF.md 상단 링크 참고). 복사하면 진실 원천이 둘이 되어 어긋납니다.
