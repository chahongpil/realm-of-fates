# Section 01: 사전 준비 (Phase 0)

> 참고: `claude-plan.md` 의 "Phase 0: 사전 준비" 섹션 전체
> 테스트: `claude-plan-tdd.md` 의 "Phase 0: 사전 준비" 섹션

## 목표

리팩토링 중 안전망과 기준선을 마련한다. 이 섹션에서는 **코드 변경 없음**.

## 작업 목록

1. 브랜치 안전망: `backup/pre-refactor` 생성 후 푸시, `refactor/structure-split` 로컬 생성
2. 디렉토리 생성: `css/`, `js/`, `docs/`
3. 안전 파일 생성: `.nojekyll`
4. Game 메서드 목록 덤프 → `docs/game_manifest.md`
5. 참조 베이스라인 → `docs/reference_baseline.md`
6. onclick 인라인/동적 목록 → `docs/onclick_inline.txt`, `docs/onclick_dynamic.txt`
7. this 바인딩 감사 → `docs/this_audit.txt`
8. Git 설정: `git config core.ignorecase false`
9. 커밋: `[Refactor Phase 0/6] 사전 준비`

## 완료 조건

- `backup/pre-refactor` 원격 푸시 확인
- 8개 docs 파일 존재
- 커밋 생성됨

## 검증

`claude-plan-tdd.md` Phase 0 테스트 스텁 실행.
